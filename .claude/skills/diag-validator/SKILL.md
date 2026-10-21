---
name: diag-validator
description: 'Independent check on a Root Cause Report: runs in an isolated subagent, never sees the analyst''s reasoning, re-runs each finding''s experiment, and judges every finding against the evidence gates of the taxonomy. Publishes its per-facet disagreement with the analyst as a metric of the taxonomy''s own health. Use when: diag-loop invokes it after diag-analyst. Emits SUCCESS (the report stands) or FAIL with the gates each finding failed. Fixes nothing and re-classifies nothing on the analyst''s behalf.'
argument-hint: 'Feature and the path to the Root Cause Report'
---

# Diag Validator — the independent signal

Generator and validator are the same model. A validator that sees *why* a claim was made tends to agree
with it, and the loop then has one opinion twice instead of two signals.

Two things make this skill independent, and both are structural:

1. It runs in a **subagent with a fresh context**, receiving only the feature, the report path and the
   evidence-base paths — never the analyst's reasoning.
2. It **re-runs the experiments**. An experiment that cannot be re-run is not evidence.

Binding: [taxonomy.md](../diag-loop/references/taxonomy.md).

## Inputs

| Role | Path |
|---|---|
| Under validation | `400 Code/Output/<feature>/reports/diagnosis/diag-<stamp>.md` |
| Evidence base | `400 Code/Output/<feature>/reports/diagnosis/evidence/` |
| References | the feature's spec sets and traceability files |
| Emitted | `400 Code/Output/<feature>/reports/diagnosis/diag-validation-<YYYYMMDD-HHmm>.md` |

Write only the report. Never edit a spec, a source file, a test, a configuration — or the Root Cause
Report.

## Checks

### V1 — The run was not void

Re-check the freshness and configuration facts yourself. If the run was void and the report is not
`VOID`, that is a `blocker`: every finding in it is meaningless, however well argued.

### V2 — Cluster completeness

- Every cluster in `clusters.json` appears in the report, diagnosed or listed as undiagnosed with what it
  needs (`error` on a silently dropped cluster — the omission looks like coverage).
- No finding covers two clusters without stating the shared cause (`error`).
- The undiagnosed proportion matches the report's own count (`error` on a miscount; it is the number that
  decides a stop condition).

### V3 — The evidence gates

For each finding:

- All four facets are present (`error` when any is missing — a finding without `Detection` teaches the
  process nothing).
- `probable` or above cites evidence at `file:line`, or quotes a log line with its source (`error`).
- `confirmed` carries a prediction **recorded before** the experiment (`error` when the prediction reads
  as a description of the result — that is the failure mode this gate exists for).
- **Re-run the experiment.** If it does not reproduce, the finding drops to `possible` at best and the
  report FAILs (`error`).
- Rivals are named and excluded, or the confidence is `possible` (`error` on an unexcluded rival carried
  at `confirmed`).

### V4 — Classification correctness

Classify each finding **yourself, from the evidence, before reading the analyst's classification**, then
compare. Record every disagreement per facet — that number is the published metric, not a nuisance.

- A finding routed to a loop that does not own the repair is an `error`.
- A finding whose `Injection` contradicts its evidence is an `error`.
- A finding that is really a **divergence** — a requirement the system has not been built to yet, already
  recorded in a `98-divergences.md` — reported as a defect is an `error`. That is recorded work, and
  diagnosing it as a bug wastes the run.
- A `Detection` of `none` is accepted where no existing gate could have caught it, and challenged where
  one could (`warning` — it is the difference between a new check and an excuse).

### V5 — Verification status

Recompute the requirement verification table from the evidence base and compare (`error` on any
difference). It is the report's headline claim, and an overstated `verified` count is the most expensive
error this pipeline can make: it says a requirement is proven when nothing proves it.

### V6 — Scope

The report fixes nothing, proposes no code, and edits nothing (`blocker` on any change found in the tree
attributable to the analysis run).

## Verdict

- Any `blocker` or `error` → **FAIL**, listing the gate each finding failed.
- Otherwise → **SUCCESS**: the report stands and its findings may be routed.

A FAIL here is not a failure of the diagnosis process. It is the process working — the second opinion
disagreeing is the only reason to have one.

## Report format

```markdown
---
stage: diag-validation
feature: <feature>
verdict: SUCCESS | FAIL
generated: <YYYY-MM-DDTHH:mm:ssZ>
report: <path of the report judged>
counts: {blocker: 0, error: 0, warning: 0}
experiments: {re-run: N, reproduced: N, not_reproduced: N}
---

## Per-facet disagreement
| Facet | Findings | Agreed | Disagreed |
|---|---|---|---|
| Injection | 7 | 6 | 1 |
| Type | 7 | 5 | 2 |
| Detection | 7 | 4 | 3 |
| Confidence | 7 | 7 | 0 |

## Issues
### ISSUE-01
- finding: FIND-03
- gate: V3 (experiment did not reproduce)
- observed: predicted 4 → 6, re-run observed 4 → 5
- required: drop to `possible`, or produce a differential that separates it from the named rival

## Verification status check
<Recomputed table beside the report's; every difference named.>
```

The **per-facet disagreement** table is published every run. A facet the two roles disagree on constantly
is not a bad analyst — it is a facet whose definition is not carrying its weight, and that is a `process`
finding for [diag-retro](../diag-retro/SKILL.md).
