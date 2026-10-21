export const meta = {
  name: 'pipeline-run',
  description: 'Advance every feature (or the ones named) through req -> fspec -> dspec in parallel, one spec-loop per stage, until each is validated through the target stage or stops on a question',
  whenToUse: 'Continuous driver over pipeline-progress. args: {features?: ["name"], through?: "req"|"fspec"|"dspec" (default dspec), concurrency?: n (default 3), maxIterations?, decisions?: {"<feature>": "rulings"}}',
  phases: [
    { title: 'Scan', detail: 'pipeline_progress.py --json' },
    { title: 'Run', detail: 'one spec-loop per feature and stage, features in parallel' },
  ],
}

const a = args || {}
const ORDER = ['req', 'fspec', 'dspec']
const through = a.through || 'dspec'
if (!ORDER.includes(through)) throw new Error('args.through must be req, fspec or dspec')
const last = ORDER.indexOf(through)
const CONC = Math.max(1, a.concurrency || 3)

const SCAN = {
  type: 'object', required: ['features'],
  properties: {
    features: { type: 'array', items: { type: 'object', properties: {
      feature: { type: 'string' }, stage: { type: 'string' },
      req: { type: 'string' }, fspec: { type: 'string' }, dspec: { type: 'string' },
      pending: { type: 'array', items: { type: 'string' } },
    } } },
    toolError: { type: 'string' },
  },
}

phase('Scan')
const only = (a.features || []).map((f) => `--feature ${f}`).join(' ')
const scan = await agent(`Run from the repository root: \`python .claude/skills/pipeline-progress/scripts/pipeline_progress.py ${only} --json\`. For every element of the printed array report: feature; stage (the element's stage); req, fspec, dspec = stages.<key>.stage; pending = the stage keys among req, fspec, dspec whose pending_feedbacks list is not empty. An empty array is features: []. Report a command that could not run in toolError. Return only the JSON.`,
  { agentType: 'pipeline-gate', label: 'scan', phase: 'Scan', schema: SCAN })
if (!scan || scan.toolError) return { verdict: 'STOPPED', stop: 'Scan could not run', question: scan ? scan.toolError : 'scan agent returned nothing' }

// A feature is work when some stage up to `through` is not validated, or carries pending feedback.
const blocked = ['seed-missing', 'seed-incomplete', 'orphan-output']
const skipped = []
const work = []
for (const f of scan.features) {
  if (blocked.includes(f.stage)) { skipped.push({ feature: f.feature, why: f.stage }); continue }
  const first = ORDER.slice(0, last + 1).findIndex((k) => f[k] !== 'validated' || (f.pending || []).includes(k))
  if (first < 0) { skipped.push({ feature: f.feature, why: `validated through ${through}` }); continue }
  work.push({ feature: f.feature, from: first })
}
log(`${work.length} feature(s) to advance through ${through}, ${CONC} at a time; ${skipped.length} skipped`)
if (!work.length) return { verdict: 'NOTHING-TO-DO', through, skipped, results: [] }

// Each feature walks its stages in order; features run in a bounded pool so the machine and the
// collaborators' checkout are not flooded. A stage that does not end validated ends that feature's walk.
phase('Run')
async function advance(item) {
  const trail = []
  let upstreamChanged = false
  for (let i = item.from; i <= last; i++) {
    const stage = ORDER[i]
    let r
    try {
      // A stage that ran to SUCCESS in this walk moved the contract the next stage was validated
      // against: the next stage must carry the change, not report itself already validated.
      r = await workflow('spec-loop', { stage, feature: item.feature, maxIterations: a.maxIterations, decisions: a.decisions ? a.decisions[item.feature] : undefined, upstreamChanged })
    } catch (e) {
      trail.push({ stage, verdict: 'ERROR', question: String(e) })
      break
    }
    trail.push({ stage, verdict: r.verdict, stop: r.stop, question: r.question, reports: r.reports, feedbacksSent: r.feedbacksSent })
    log(`${item.feature}: ${stage} ${r.verdict}${r.stop ? ` (${r.stop})` : ''}`)
    if (r.verdict !== 'SUCCESS' && r.verdict !== 'ALREADY-VALIDATED') break
    upstreamChanged = r.verdict === 'SUCCESS'
  }
  const end = trail[trail.length - 1]
  return { feature: item.feature, reached: end && (end.verdict === 'SUCCESS' || end.verdict === 'ALREADY-VALIDATED') ? through : end.stage, trail }
}

const queue = work.slice()
const results = []
const worker = async () => {
  while (queue.length) {
    const item = queue.shift()
    results.push(await advance(item))
  }
}
await parallel(Array.from({ length: Math.min(CONC, work.length) }, () => worker))

const questions = results
  .map((r) => ({ feature: r.feature, last: r.trail[r.trail.length - 1] }))
  .filter((x) => x.last && x.last.verdict !== 'SUCCESS' && x.last.verdict !== 'ALREADY-VALIDATED')
  .map((x) => ({ feature: x.feature, stage: x.last.stage, verdict: x.last.verdict, stop: x.last.stop, question: x.last.question }))
return { verdict: questions.length ? 'PARTIAL' : 'SUCCESS', through, results, questions, skipped }
