export const meta = {
  name: 'spec-loop',
  description: 'Drive <stage>-generator -> lint gate -> isolated <stage>-validator to convergence for one feature at the req, fspec or dspec stage; the counter, the stop conditions and the isolation live in this script',
  whenToUse: 'Driver of req-loop, fspec-loop and dspec-loop. args: {stage: "req"|"fspec"|"dspec", feature, maxIterations?, mode?, previousReport?, feedback?, rerun?, decisions?}',
  phases: [
    { title: 'Setup', detail: 'progress state, upstream precondition, feature claim, phase log' },
    { title: 'Generate' },
    { title: 'Gate', detail: 'lint_artifacts.py --emit - a failure is fixed through Mode B and never spends a semantic pass' },
    { title: 'Validate', detail: 'isolated validator pass' },
    { title: 'Close', detail: 'derived tables re-emitted, END row, claim released' },
  ],
}

// ---------------------------------------------------------------- stage table (pipeline-conventions §2, §12)
const STAGES = {
  req: {
    out: '200 Requirements/230 Output', up: null, loop: 'req-loop',
    reads: (f) => `the seed folder "200 Requirements/220 Input/${f}/" (SEED.md, DOMAIN.md, SCOPE-BACKLOG.md, supporting material), "200 Requirements/210 Docs/" and the directives "200 Requirements/220 Input/*.md"`,
    modeA: (f) => `Derive the whole set from the seed "200 Requirements/220 Input/${f}/SEED.md".`,
    widening: 'does the item join the seed, or leave this stage?',
  },
  fspec: {
    out: '300 Specs/320 F-Specs/Output', up: 'req', loop: 'fspec-loop',
    reads: (f) => `the validated requisites "200 Requirements/230 Output/${f}/" and the directives "300 Specs/320 F-Specs/Input/"`,
    modeA: (f) => `Derive the whole set from the validated requisites "200 Requirements/230 Output/${f}/".`,
    widening: 'does the item join the requisites, or leave the F-Spec?',
  },
  dspec: {
    out: '300 Specs/330 D-Specs/Output', up: 'fspec', loop: 'dspec-loop',
    reads: (f) => `the validated F-Spec "300 Specs/320 F-Specs/Output/${f}/", the directives "300 Specs/330 D-Specs/Input/" and the code root (as-built placement only)`,
    modeA: (f) => `Derive the whole design from the validated F-Spec "300 Specs/320 F-Specs/Output/${f}/".`,
    widening: 'does the item join the F-Spec, or leave the design?',
  },
}

// ---------------------------------------------------------------- inputs
const a = args || {}
const key = a.stage
const S = STAGES[key]
if (!S) throw new Error('args.stage must be one of req, fspec, dspec')
const feature = a.feature
if (!feature) throw new Error('args.feature is required')
const MAX = a.maxIterations || 5
const setDir = `${S.out}/${feature}`
const upDir = S.up ? `${STAGES[S.up].out}/${feature}` : null
const seedPath = `200 Requirements/220 Input/${feature}/SEED.md`
const gen = `${key}-generator`
const val = `${key}-validator`
const decisions = a.decisions ? `\nDecisions the author already made for this run (carry them into the set; do not rediscover them):\n${a.decisions}\n` : ''
const j = (o) => JSON.stringify(o)
const PY = 'python .claude/skills/pipeline-progress/scripts'

// ---------------------------------------------------------------- schemas
const ISSUE = { type: 'object', properties: { id: { type: 'string' }, severity: { type: 'string' }, check: { type: 'string' }, file: { type: 'string' }, location: { type: 'string' }, finding: { type: 'string' } } }
const STATE = {
  type: 'object',
  required: ['featureStage', 'stageState'],
  properties: {
    featureStage: { type: 'string' }, seedRevision: { type: 'integer' }, stageState: { type: 'string' }, upstreamState: { type: 'string' },
    verdict: { type: 'string' }, report: { type: 'string' }, gaps: { type: 'array', items: { type: 'string' } },
    pendingFeedbacks: { type: 'array', items: { type: 'string' } }, indexExists: { type: 'boolean' }, toolError: { type: 'string' },
  },
}
const CLAIM = { type: 'object', required: ['lockOk'], properties: { lockOk: { type: 'boolean' }, lockMessage: { type: 'string' }, session: { type: 'string' }, phaseLog: { type: 'string' }, toolError: { type: 'string' } } }
const GEN = {
  type: 'object', required: ['done'],
  properties: { done: { type: 'boolean' }, mode: { type: 'string' }, changedFiles: { type: 'array', items: { type: 'string' } }, issuesApplied: { type: 'array', items: { type: 'string' } }, issuesDiverged: { type: 'array', items: { type: 'string' } }, feedbackWritten: { type: 'string' }, needsHuman: { type: 'string' }, upstreamWidening: { type: 'string' }, barLowering: { type: 'string' }, surfaceUnfrozen: { type: 'string' } },
}
const GATE = {
  type: 'object', required: ['exitCode', 'output', 'onDisk'],
  properties: { exitCode: { type: 'integer' }, output: { type: 'string' }, onDisk: { type: 'integer' }, toolError: { type: 'string' } },
}
const VAL = {
  type: 'object', required: ['verdict', 'reportPath', 'counts'],
  properties: { verdict: { type: 'string' }, reportPath: { type: 'string' }, counts: { type: 'object', properties: { blocker: { type: 'integer' }, error: { type: 'integer' }, warning: { type: 'integer' }, info: { type: 'integer' }, divergence: { type: 'integer' } } }, issues: { type: 'array', items: ISSUE }, feedbacksSent: { type: 'array', items: { type: 'string' } }, needsHuman: { type: 'string' } },
}
const SEAL = { type: 'object', required: ['finalState'], properties: { finalState: { type: 'string' }, toolError: { type: 'string' } } }
const CLOSE = { type: 'object', required: ['released'], properties: { released: { type: 'boolean' }, toolError: { type: 'string' } } }

// ---------------------------------------------------------------- prompts
const row = (label, log) => log ? `First run \`${PY}/phase_log.py row "${log}" ${label}\`.\n` : ''

const statePrompt = `Feature: ${feature}. Run these from the repository root and report them as the JSON fields named.
1. \`${PY}/pipeline_progress.py --feature ${feature} --json\` -> from the first element of the printed array (if the array is empty, featureStage = "seed-missing" and stageState = "not-started"): stage -> featureStage; seed.revision -> seedRevision; stages.${key}.stage -> stageState;${S.up ? ` stages.${S.up}.stage -> upstreamState;` : ''} stages.${key}.verdict -> verdict ("" when null); stages.${key}.report -> report (backslashes turned into forward slashes, "" when null); stages.${key}.gaps -> gaps; stages.${key}.pending_feedbacks -> pendingFeedbacks.
2. indexExists = whether the file "${setDir}/00-index.md" exists.
Report any command that could not run in toolError. Return only the JSON.`

const claimPrompt = `Feature: ${feature}. Run these from the repository root, in order:
1. stamp = the output of \`${PY}/phase_log.py stamp\`; session = "wf-<stamp>-${key}-${feature}".
2. \`python .claude/hooks/feature_lock.py acquire --feature ${feature} --skill ${S.loop} --session <session>\` -> lockOk = (exit code 0); lockMessage = its output; session -> session.
3. Only when lockOk: \`${PY}/phase_log.py open --dir "${setDir}" --loop ${S.loop}\` -> phaseLog = the path it prints.
Report any command that could not run in toolError. Return only the JSON.`

const genPrompt = (mode, iteration, log, inputs) => `${row(`${iteration}-${gen}`, log)}Then run ${gen} Mode ${mode} for feature ${feature}.${decisions}
${inputs}
Stop when the set is written; the deterministic gate and the isolated validator run after you. Return only the JSON your instructions specify.`

const gatePrompt = `Feature: ${feature}. Run these from the repository root:
1. \`${PY}/lint_artifacts.py --stage ${key} --feature ${feature} --emit\` -> exitCode (its exit code); output (its full output, verbatim).
2. \`${PY}/pipeline_progress.py --count-artifacts --stage ${key} --feature ${feature}\` -> onDisk (the integer it prints).
Return only the JSON.`

const valPrompt = (iteration, log) => `${row(`${iteration}-${val}`, log)}Then validate "${setDir}" for feature ${feature} with the ${val} procedure, against ${S.reads(feature)}. The deterministic gate (lint_artifacts.py) passed on this set: do not re-judge what it owns. Nothing about why the set was written is provided, by design. On SUCCESS, stamp status: validated on every file of the set that reads draft, as your procedure says, and confirm none still reads draft. Return only the JSON your instructions specify.`

const sealPrompt = `Feature: ${feature}. Run these from the repository root:
1. \`${PY}/lint_artifacts.py --stage ${key} --feature ${feature} --emit\` (re-renders the derived tables now that the files read validated; ignore its exit code).
2. \`${PY}/pipeline_progress.py --feature ${feature} --stage ${key} --json\` -> finalState = stages.${key}.stage of the first element.
Return only the JSON.`

const closePrompt = (log, claimed) => `Feature: ${feature}. ${log ? `1. \`${PY}/phase_log.py row "${log}" END\`.` : '1. No phase log to close.'} ${claimed ? `2. \`python .claude/hooks/feature_lock.py release --feature ${feature}\` -> released = (exit code 0).` : '2. No claim to release: released = true.'} Return only the JSON.`

// ---------------------------------------------------------------- helpers
const flagged = (v) => !!v && v !== 'null' && v !== 'None' && v !== 'none'
const issueKey = (i) => `${i.file || ''}|${i.location || ''}|${(i.finding || '').slice(0, 120)}`
const rows = []
const result = { stage: key, feature, verdict: null, stop: null, question: null, rows, reports: [], feedbacksSent: [], phaseLog: null, setDir }

function decideMode(s) {
  if (a.mode) return { mode: a.mode, report: a.previousReport || s.report, reason: 'mode elected by the caller' }
  const fb = (s.pendingFeedbacks || []).length > 0
  switch (s.stageState) {
    case 'not-started': return { mode: 'A', reason: 'no set yet' }
    case 'seed-changed': return { mode: 'A', reason: `seed moved to revision ${s.seedRevision}: the set answers a revision that no longer stands` }
    case 'seed-drift': return { stop: 'Seed edited without a bump', question: `${seedPath} changed without a revision bump. Bump revision: and re-run; the loop never edits the seed.` }
    case 'FAIL': return { mode: 'B', report: s.report, reason: 'FAIL report to fix' }
    case 'gaps': return { mode: 'B', synthetic: s.gaps, reason: `required files missing: ${(s.gaps || []).join(', ')}` }
    case 'unvalidated':
      // A folder can exist with only reports/ in it - a cross-feature feedback addressed to a stage
      // this feature has not reached yet. There is no set to fix: generate it, feedback included.
      if (!s.indexExists) return { mode: 'A', reason: fb ? 'no set yet; pending feedback folded into Mode A' : 'folder without 00-index.md' }
      return fb ? { mode: 'C', reason: 'draft never validated, with pending feedback' } : { mode: 'none', reason: 'draft never validated: straight to the gate' }
    case 'drifted': return fb ? { mode: 'C', reason: 'draft files after a SUCCESS, with pending feedback' } : { mode: 'none', reason: 'draft files after a SUCCESS: re-gate and re-validate' }
    case 'validated':
      if (a.upstreamChanged) return { mode: 'C', reason: `upstream ${S.up} re-validated in this run: carry its changes` }
      if (fb) return { mode: 'C', reason: `pending feedback from ${s.pendingFeedbacks.join(', ')}` }
      return a.rerun ? { mode: 'none', reason: 're-run requested' } : { stop: 'already-validated' }
    default: return { stop: `Unexpected state ${s.stageState}`, question: `pipeline_progress reports ${s.stageState} for ${feature} at ${key}; resolve it by hand.` }
  }
}

// ---------------------------------------------------------------- setup
phase('Setup')
const s = await agent(statePrompt, { agentType: 'pipeline-gate', label: 'state', phase: 'Setup', schema: STATE })
if (!s) throw new Error('state agent returned nothing')
if (flagged(s.toolError)) return { ...result, verdict: 'STOPPED', stop: 'Setup could not run', question: s.toolError }
result.setup = s
if (['seed-missing', 'seed-incomplete', 'orphan-output'].includes(s.featureStage) && key === 'req') {
  return { ...result, verdict: 'REFUSED', stop: 'No seed', question: `${seedPath} is ${s.featureStage}: author it with seed-authoring, or promote it with colab-promote. The loop never invents a seed.` }
}
if (S.up && s.upstreamState !== 'validated') {
  return { ...result, verdict: 'REFUSED', stop: 'Upstream not validated', question: `${upDir} is ${s.upstreamState}: run ${STAGES[S.up].loop} ${feature} first. This loop never edits its upstream.` }
}
const m = decideMode(s)
log(`${key}/${feature}: state ${s.stageState}, seed rev ${s.seedRevision}; ${m.reason || m.stop}`)
if (m.stop === 'already-validated') return { ...result, verdict: 'ALREADY-VALIDATED' }
if (m.stop) return { ...result, verdict: 'STOPPED', stop: m.stop, question: m.question }

const c0 = await agent(claimPrompt, { agentType: 'pipeline-gate', label: 'claim', phase: 'Setup', schema: CLAIM })
if (!c0 || !c0.lockOk) return { ...result, verdict: 'REFUSED', stop: 'Feature claimed elsewhere', question: c0 ? (c0.lockMessage || c0.toolError) : 'claim agent returned nothing' }
const plog = flagged(c0.phaseLog) ? c0.phaseLog : null
result.phaseLog = plog
const finish = async (verdict, stop, question) => {
  result.verdict = verdict
  result.stop = stop || null
  result.question = question || null
  phase('Close')
  if (verdict === 'SUCCESS') {
    const z = await agent(sealPrompt, { agentType: 'pipeline-gate', label: 'seal', phase: 'Close', schema: SEAL })
    result.finalState = z ? z.finalState : 'unknown'
    if (!z || z.finalState !== 'validated') {
      result.verdict = 'STOPPED'
      result.stop = 'SUCCESS not sealed'
      result.question = `The validator returned SUCCESS but pipeline_progress reads ${result.finalState} for ${setDir}: check which files still read draft.`
    }
  }
  await agent(closePrompt(plog, true), { agentType: 'pipeline-gate', label: 'close', phase: 'Close', schema: CLOSE })
  return result
}

// ---------------------------------------------------------------- loop
let mode = m.mode
let reportPath = m.report || ''
let gateText = ''
let synthetic = m.synthetic ? m.synthetic.map((f, i) => ({ id: `ISSUE-${String(i + 1).padStart(2, '0')}`, severity: 'error', check: 'gaps', file: f, finding: `required ${f} is missing`, expected: `${f} present` })) : null
let feedbackNote = (s.pendingFeedbacks || []).length
  ? `\nAlso resolve, in this same round, every pending cross-feature feedback addressed to this feature (conventions §14): the files under "${setDir}/reports/feedbacks/<origin>/" stamped after the newest ${key}-validation report, from ${s.pendingFeedbacks.join(', ')}. Answer each declined item in 97-changelog.md.`
  : ''
let iteration = 1
let prevScore = null
let prevGate = null
const seen = new Set()
const recurred = new Set()
let recurNote = ''
let stop = null
let question = null
let verdict = null

while (true) {
  if (iteration > MAX) { stop = 'Iteration budget exhausted'; question = `MAX=${MAX} iterations spent; a fresh run resumes from ${reportPath || 'the gate'}.`; break }

  // -- generate
  if (mode !== 'none') {
    let inputs = ''
    if (mode === 'A') inputs = S.modeA(feature)
    if (mode === 'B') inputs = gateText ? `Deterministic-gate output to fix (turn each error line into an ISSUE-nn and close it):\n${gateText}` : synthetic ? `Issue list:\n${j(synthetic)}` : `Validation Report to fix: ${reportPath}${recurNote}`
    if (mode === 'C') inputs = a.upstreamChanged && !a.feedback
      ? `The upstream set "${upDir}/" was re-validated in this run. Carry into this set every change its newest round made - read the newest entry of "${upDir}/97-changelog.md" and the files it names - and nothing else.`
      : `Feedback to resolve: ${a.feedback || '(see below)'}`
    inputs += feedbackNote
    phase('Generate')
    const g = await agent(genPrompt(mode, iteration, plog, inputs), { agentType: gen, label: `${iteration}-${gen} (Mode ${mode})`, phase: 'Generate', schema: GEN })
    if (!g) { stop = 'Generator agent returned nothing'; break }
    if (flagged(g.needsHuman)) { stop = 'Needs human input'; question = g.needsHuman; break }
    if (flagged(g.upstreamWidening)) { stop = 'Upstream widening'; question = `${g.upstreamWidening}${flagged(g.feedbackWritten) ? ` (${g.feedbackWritten})` : ''} - ${S.widening}`; break }
    if (flagged(g.barLowering)) { stop = 'Bar-lowering fix'; question = g.barLowering; break }
    if (mode === 'B' && flagged(g.surfaceUnfrozen)) { stop = 'Surface unfrozen on a fix round'; question = `${g.surfaceUnfrozen} - add it to "200 Requirements/220 Input/${feature}/SCOPE-BACKLOG.md" and decide whether the seed takes it.`; break }
    synthetic = null
    recurNote = ''
    feedbackNote = ''
  }

  // -- deterministic gate
  phase('Gate')
  const gt = await agent(gatePrompt, { agentType: 'pipeline-gate', label: `${iteration}-gate`, phase: 'Gate', schema: GATE })
  if (!gt || flagged(gt.toolError)) { stop = 'Gate could not run'; question = gt ? gt.toolError : 'gate agent returned nothing'; break }
  const files = /over (\d+) file/.exec(gt.output || '')
  if (!files || +files[1] !== gt.onDisk || gt.onDisk === 0) { stop = 'Gate examined less than the set'; question = `lint_artifacts reported ${files ? files[1] : 'no'} files; ${gt.onDisk} are on disk. A gate that omits a file reads as a pass - fix the tooling before iterating.`; break }
  if (gt.exitCode !== 0) {
    rows.push({ iter: iteration, mode, gate: 'FAIL', verdict: '- (gate)', report: '' })
    if (prevGate !== null && gt.output === prevGate) { stop = 'No progress (gate)'; question = `The gate output did not change after a fix round:\n${gt.output}`; break }
    prevGate = gt.output
    gateText = gt.output
    mode = 'B'
    iteration += 1
    log(`${key}/${feature}: gate failed, Mode B on the gate output, iteration ${iteration}`)
    continue
  }
  gateText = ''
  prevGate = null

  // -- validate, isolated
  phase('Validate')
  const v = await agent(valPrompt(iteration, plog), { agentType: val, label: `${iteration}-${val}`, phase: 'Validate', schema: VAL })
  if (!v) { stop = 'Validator agent returned nothing'; break }
  const c = v.counts || {}
  rows.push({ iter: iteration, mode, gate: 'pass', verdict: `${v.verdict} (${c.blocker || 0} blocker, ${c.error || 0} error, ${c.warning || 0} warning, ${c.divergence || 0} div)`, report: v.reportPath })
  result.reports.push(v.reportPath)
  result.feedbacksSent.push(...(v.feedbacksSent || []))
  log(`${key}/${feature}: iteration ${iteration}: ${v.verdict}`)
  if (v.verdict === 'SUCCESS') { verdict = 'SUCCESS'; result.lastCounts = c; break }

  // -- stop conditions (conventions §11)
  const issues = v.issues || []
  if (flagged(v.needsHuman)) { stop = 'Needs human input'; question = v.needsHuman; break }
  const again = issues.filter((i) => seen.has(issueKey(i)))
  const circle = again.find((i) => recurred.has(issueKey(i)))
  if (circle) { stop = 'Oscillation'; question = `${circle.id} recurs a third time at ${circle.file} ${circle.location || ''}: ${circle.finding}`; break }
  // Divergences are excluded: converting an error into a recorded divergence is progress.
  const score = (c.blocker || 0) + (c.error || 0) + (c.warning || 0)
  if (prevScore !== null && score >= prevScore) { stop = 'No progress'; question = `blocker+error+warning ${prevScore} -> ${score} (${v.reportPath})`; break }
  if (again.length) {
    // A recurrence is first read as a leaky sweep in a converging loop: finish the sweep once.
    again.forEach((i) => recurred.add(issueKey(i)))
    recurNote = `\nThese findings recur from an earlier report: ${again.map((i) => i.id).join(', ')}. The last fix was likely applied at one of the named locations and not carried to the others - finish the sweep across every site, do not re-argue the fix.`
  }
  issues.forEach((i) => seen.add(issueKey(i)))
  prevScore = score
  reportPath = v.reportPath
  mode = 'B'
  iteration += 1
}

return finish(verdict || 'STOPPED', stop, question)
