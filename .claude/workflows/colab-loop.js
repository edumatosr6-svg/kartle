export const meta = {
  name: 'colab-loop',
  description: 'Drive colab-generator -> colab_tools lint -> isolated colab-validator to convergence for one round of the collaborative drafts, then publish the questions; never promotes',
  whenToUse: 'Driver of the colab-loop skill. args: {integrationDeclared: true (the Product Owner said so in this invocation), lang?: "pt-BR"|"en", maxIterations?, rebuild?, feature?, decisions?}',
  phases: [
    { title: 'Setup', detail: 'inventory, integration gate, set claim, phase log' },
    { title: 'Generate' },
    { title: 'Gate', detail: 'colab_tools.py lint - an error is fixed through Mode B and never spends a semantic pass' },
    { title: 'Validate', detail: 'isolated colab-validator pass' },
    { title: 'Questions', detail: 'questions-round-<n>.md for the collaborators' },
    { title: 'Close', detail: 'END row, claim released' },
  ],
}

// ---------------------------------------------------------------- inputs
const a = args || {}
const MAX = a.maxIterations || 5
const LANG = a.lang || 'pt-BR'
const MERGED = '200 Requirements/240 Colaborative/241 Merged'
const TOOLS = 'python .claude/skills/colab-loop/scripts/colab_tools.py'
const PY = 'python .claude/skills/pipeline-progress/scripts'
const LOCK = '_colab'
const decisions = a.decisions ? `\nDecisions the Product Owner already made for this round (carry them; do not rediscover them):\n${a.decisions}\n` : ''

if (a.integrationDeclared !== true) {
  return {
    verdict: 'REFUSED', stop: 'Integration not declared',
    question: 'The collaborative drafts are consolidated only when a Product Owner declares the integration (200 Requirements/220 Input/README.md). Re-run with args.integrationDeclared = true once that has been said.',
  }
}

// ---------------------------------------------------------------- schemas
const ISSUE = { type: 'object', properties: { id: { type: 'string' }, severity: { type: 'string' }, check: { type: 'string' }, file: { type: 'string' }, location: { type: 'string' }, finding: { type: 'string' } } }
const INV = {
  type: 'object', required: ['drafts', 'status', 'round'],
  properties: {
    authors: { type: 'array', items: { type: 'string' } }, drafts: { type: 'integer' }, mergedFeatures: { type: 'integer' },
    round: { type: 'integer' }, status: { type: 'string' }, verdict: { type: 'string' }, invalid: { type: 'integer' },
    changedSinceMerge: { type: 'boolean' }, changed: { type: 'array', items: { type: 'string' } }, problems: { type: 'array', items: { type: 'string' } },
    newestReport: { type: 'string' }, newestReportVerdict: { type: 'string' }, toolError: { type: 'string' },
  },
}
const CLAIM = { type: 'object', required: ['lockOk'], properties: { lockOk: { type: 'boolean' }, lockMessage: { type: 'string' }, phaseLog: { type: 'string' }, toolError: { type: 'string' } } }
const GEN = {
  type: 'object', required: ['done'],
  properties: { done: { type: 'boolean' }, mode: { type: 'string' }, round: { type: 'integer' }, featuresWritten: { type: 'array', items: { type: 'string' } }, decisions: { type: 'array', items: { type: 'string' } }, openItems: { type: 'integer' }, issuesApplied: { type: 'array', items: { type: 'string' } }, draftProblem: { type: 'string' }, draftMoved: { type: 'string' }, needsHuman: { type: 'string' } },
}
const GATE = { type: 'object', required: ['exitCode', 'output'], properties: { exitCode: { type: 'integer' }, output: { type: 'string' }, toolError: { type: 'string' } } }
const VAL = {
  type: 'object', required: ['verdict', 'reportPath', 'counts'],
  properties: { verdict: { type: 'string' }, reportPath: { type: 'string' }, counts: { type: 'object', properties: { blocker: { type: 'integer' }, error: { type: 'integer' }, warning: { type: 'integer' }, info: { type: 'integer' } } }, openItems: { type: 'integer' }, issues: { type: 'array', items: ISSUE }, needsHuman: { type: 'string' } },
}
const QUE = { type: 'object', required: ['path'], properties: { path: { type: 'string' }, output: { type: 'string' }, toolError: { type: 'string' } } }
const CLOSE = { type: 'object', required: ['released'], properties: { released: { type: 'boolean' }, toolError: { type: 'string' } } }

// ---------------------------------------------------------------- prompts
const row = (label, log) => log ? `First run \`${PY}/phase_log.py row "${log}" ${label}\`.\n` : ''

const invPrompt = `Run these from the repository root and report them as the JSON fields named.
1. \`${TOOLS} inventory --json\` -> authors; drafts; merged_features -> mergedFeatures; round; status; verdict; invalid; changed_since_merge -> changedSinceMerge; changed = "<author>/<feature>" of every row whose state is new or revised, plus every entry of removed; problems = "<author>/<feature>: <problems joined by '; '>" for every row whose problems list is not empty.
2. In "${MERGED}/reports/colab-validation/", the newest .md file by the generated: field of its front matter (file name as tie-break) -> newestReport (forward slashes, "" when the folder is absent or empty); the verdict: field of that file -> newestReportVerdict ("" when none).
Report any command that could not run in toolError. Return only the JSON.`

const claimPrompt = `Run these from the repository root, in order:
1. stamp = the output of \`${PY}/phase_log.py stamp\`; session = "wf-<stamp>-colab".
2. \`python .claude/hooks/feature_lock.py acquire --feature ${LOCK} --skill colab-loop --session <session>\` -> lockOk = (exit code 0); lockMessage = its output.
3. Only when lockOk: \`${PY}/phase_log.py open --dir "${MERGED}" --loop colab-loop\` -> phaseLog = the path it prints.
Report any command that could not run in toolError. Return only the JSON.`

const genPrompt = (mode, round, iteration, log, inputs) => `${row(`${iteration}-colab-generator`, log)}Then run colab-generator Mode ${mode} for round ${round}, with --lang ${LANG} on every colab_tools.py call that writes.${decisions}
${inputs}
Stop when the set is written, the index rendered and lint shows no error; the isolated validator runs after you. Return only the JSON your instructions specify.`

const gatePrompt = `Run from the repository root: \`${TOOLS} lint\` -> exitCode (its exit code); output (its full output, verbatim). Return only the JSON.`

const valPrompt = (round, iteration, log, lintOut) => `${row(`${iteration}-colab-validator`, log)}Then validate round ${round} of the consolidated set "${MERGED}/" against the drafts under "200 Requirements/240 Colaborative/<author>/" and the directives "200 Requirements/220 Input/*.md", with the colab-validator procedure, using --lang ${LANG}. Nothing about why anything was merged, split or declined is provided, by design. The lint passed; its output:
${lintOut}
Return only the JSON your instructions specify.`

const quePrompt = (round) => `Run from the repository root: \`${TOOLS} --lang ${LANG} questions --round ${round}\` -> output (verbatim); path = the questions file it wrote (forward slashes). Return only the JSON.`

const closePrompt = (log) => `${log ? `1. \`${PY}/phase_log.py row "${log}" END\`.` : '1. No phase log to close.'} 2. \`python .claude/hooks/feature_lock.py release --feature ${LOCK}\` -> released = (exit code 0). Return only the JSON.`

// ---------------------------------------------------------------- helpers
const flagged = (v) => !!v && v !== 'null' && v !== 'None' && v !== 'none'
const issueKey = (i) => `${i.file || ''}|${i.location || ''}|${(i.finding || '').slice(0, 120)}`
const rows = []
const result = { stage: 'colab', verdict: null, stop: null, question: null, round: null, rows, reports: [], questions: null, openItems: null, phaseLog: null }

// ---------------------------------------------------------------- setup
phase('Setup')
const inv = await agent(invPrompt, { agentType: 'pipeline-gate', label: 'inventory', phase: 'Setup', schema: INV })
if (!inv) throw new Error('inventory agent returned nothing')
if (flagged(inv.toolError)) return { ...result, verdict: 'STOPPED', stop: 'Setup could not run', question: inv.toolError }
result.inventory = { authors: inv.authors, drafts: inv.drafts, round: inv.round, status: inv.status }
if (!inv.drafts) return { ...result, verdict: 'STOPPED', stop: 'No draft', question: 'Nothing under 240 Colaborative/<author>/<feature>/SEED.md to consolidate.' }
if ((inv.problems || []).length) return { ...result, verdict: 'STOPPED', stop: 'Draft not well-formed', question: `The authors fix their own front matter: ${inv.problems.join(' | ')}` }

let mode, round, reportPath = ''
if (a.rebuild || inv.status === 'absent') { mode = 'A'; round = (inv.round || 0) + 1 }
else if (inv.changedSinceMerge) { mode = 'C'; round = inv.round + 1 }
else if (inv.status === 'validated') return { ...result, verdict: 'ALREADY-VALIDATED', round: inv.round, question: `Round ${inv.round} is validated; its questions file is under ${MERGED}/reports/questions/. Next: the collaborators revise their drafts, or colab-promote on the Product Owner's word.` }
else if ((inv.newestReportVerdict || '').startsWith('FAIL')) { mode = 'B'; round = inv.round; reportPath = inv.newestReport }
else { mode = 'none'; round = inv.round }
result.round = round
log(`colab: round ${round}, ${inv.drafts} drafts from ${(inv.authors || []).length} authors, merged status ${inv.status}; first mode ${mode}`)

const c0 = await agent(claimPrompt, { agentType: 'pipeline-gate', label: 'claim', phase: 'Setup', schema: CLAIM })
if (!c0 || !c0.lockOk) return { ...result, verdict: 'REFUSED', stop: 'Set claimed elsewhere', question: c0 ? (c0.lockMessage || c0.toolError) : 'claim agent returned nothing' }
const plog = flagged(c0.phaseLog) ? c0.phaseLog : null
result.phaseLog = plog
const finish = async (verdict, stop, question) => {
  result.verdict = verdict
  result.stop = stop || null
  result.question = question || null
  phase('Close')
  await agent(closePrompt(plog), { agentType: 'pipeline-gate', label: 'close', phase: 'Close', schema: CLOSE })
  return result
}

// ---------------------------------------------------------------- loop
let gateText = ''
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
  if (iteration > MAX) { stop = 'Iteration budget exhausted'; question = `MAX=${MAX} iterations spent; a fresh run resumes from ${reportPath || 'the lint'}.`; break }

  if (mode !== 'none') {
    let inputs = ''
    if (mode === 'A') inputs = 'Read every draft and write the whole consolidated set and the decisions register.'
    if (mode === 'B') inputs = gateText ? `Lint output to fix (each error line is an issue to close):\n${gateText}` : `Colab Validation Report to fix: ${reportPath}${recurNote}`
    if (mode === 'C') inputs = `Drafts changed since the last round: ${(inv.changed || []).join(', ') || '(see inventory)'}.${a.feature ? ` Limit the pass to the consolidated seeds: ${a.feature}.` : ''}`
    phase('Generate')
    const g = await agent(genPrompt(mode, round, iteration, plog, inputs), { agentType: 'colab-generator', label: `${iteration}-colab-generator (Mode ${mode})`, phase: 'Generate', schema: GEN })
    if (!g) { stop = 'Generator agent returned nothing'; break }
    if (flagged(g.draftProblem)) { stop = 'Draft not well-formed'; question = g.draftProblem; break }
    if (flagged(g.draftMoved)) { stop = 'Draft edited mid-run'; question = `${g.draftMoved} - the round restarts from the inventory once the drafts are still.`; break }
    if (flagged(g.needsHuman)) { stop = 'Needs human input'; question = g.needsHuman; break }
    recurNote = ''
  }

  phase('Gate')
  const gt = await agent(gatePrompt, { agentType: 'pipeline-gate', label: `${iteration}-lint`, phase: 'Gate', schema: GATE })
  if (!gt || flagged(gt.toolError)) { stop = 'Gate could not run'; question = gt ? gt.toolError : 'gate agent returned nothing'; break }
  const cov = /over (\d+) merged feature\(s\) and (\d+) draft/.exec(gt.output || '')
  if (!cov || +cov[2] !== inv.drafts || +cov[1] === 0) { stop = 'Gate examined less than the set'; question = `lint read ${cov ? `${cov[1]} merged feature(s) and ${cov[2]} draft(s)` : 'nothing it reported'}; the inventory has ${inv.drafts} drafts. A gate that omits a file reads as a pass.`; break }
  if (/^warning:.*\bstale\b/im.test(gt.output || '')) { stop = 'Draft edited mid-run'; question = `lint reports a stale source:\n${gt.output}\nThe round restarts from the inventory.`; break }
  if (gt.exitCode !== 0) {
    rows.push({ iter: iteration, mode, gate: 'FAIL', verdict: '- (lint)', report: '' })
    if (prevGate !== null && gt.output === prevGate) { stop = 'No progress (lint)'; question = `The lint output did not change after a fix round:\n${gt.output}`; break }
    prevGate = gt.output
    gateText = gt.output
    mode = 'B'
    iteration += 1
    continue
  }
  gateText = ''
  prevGate = null

  phase('Validate')
  const v = await agent(valPrompt(round, iteration, plog, gt.output), { agentType: 'colab-validator', label: `${iteration}-colab-validator`, phase: 'Validate', schema: VAL })
  if (!v) { stop = 'Validator agent returned nothing'; break }
  const c = v.counts || {}
  rows.push({ iter: iteration, mode, gate: 'pass', verdict: `${v.verdict} (${c.blocker || 0} blocker, ${c.error || 0} error, ${c.warning || 0} warning; ${v.openItems ?? '?'} OPEN)`, report: v.reportPath })
  result.reports.push(v.reportPath)
  result.openItems = v.openItems ?? null
  log(`colab round ${round}, iteration ${iteration}: ${v.verdict}`)
  if (v.verdict === 'SUCCESS') { verdict = 'SUCCESS'; break }

  const issues = v.issues || []
  // Open points never stop this loop (colab-loop, stop conditions): a question for the humans is
  // carried to the questions file, and the round keeps fixing what the generator can fix. It stops
  // only when nothing fixable is left.
  if (flagged(v.needsHuman)) {
    result.humanNotes = (result.humanNotes || []).concat(v.needsHuman)
    if (!(c.blocker || 0) && !(c.error || 0)) { stop = 'Needs human input'; question = v.needsHuman; break }
    log(`colab: validator raised a question for the humans (carried): ${v.needsHuman}`)
  }
  const again = issues.filter((i) => seen.has(issueKey(i)))
  const circle = again.find((i) => recurred.has(issueKey(i)))
  if (circle) { stop = 'Oscillation'; question = `${circle.id} recurs a third time at ${circle.file} ${circle.location || ''}: ${circle.finding}`; break }
  const score = (c.blocker || 0) + (c.error || 0) + (c.warning || 0)
  if (prevScore !== null && score >= prevScore) { stop = 'No progress'; question = `blocker+error+warning ${prevScore} -> ${score} (${v.reportPath})`; break }
  if (again.length) {
    again.forEach((i) => recurred.add(issueKey(i)))
    recurNote = `\nThese findings recur from an earlier report: ${again.map((i) => i.id).join(', ')}. Finish the sweep across every seed that carries the fact, do not re-argue the fix.`
  }
  issues.forEach((i) => seen.add(issueKey(i)))
  prevScore = score
  reportPath = v.reportPath
  mode = 'B'
  iteration += 1
}

if (verdict === 'SUCCESS') {
  phase('Questions')
  const q = await agent(quePrompt(round), { agentType: 'pipeline-gate', label: 'questions', phase: 'Questions', schema: QUE })
  result.questions = q ? q.path : null
  result.next = `Round ${round} validated with ${result.openItems ?? '?'} open point(s) in ${result.questions || `${MERGED}/reports/questions/`}. The humans own the next step: collaborators revise their drafts and the next round runs, or the Product Owner promotes with colab-promote (open points become OPEN-<nn> and req-loop stops on them).`
}
return finish(verdict || 'STOPPED', stop, question)
