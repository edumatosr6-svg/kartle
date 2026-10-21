---
name: diag-analyst
description: 'Root-cause analyst of the Diagnosis loop: run the five stages over the evidence base of a feature — reproduce, cluster, trace, hypothesise, experiment — and write a Root Cause Report that opens with the feature''s requirement verification status and carries one finding per cluster, each classified on the four facets with its evidence and its destination. Use when: diag-loop invokes it, or the user asks for a root-cause analysis of a feature. Diagnoses only — it fixes nothing and edits no spec, source, test or configuration.'
argument-hint: 'Feature, optionally --top N, and the path to a Diagnosis Validation Report when re-running'
---

# Diag Analyst — the only stage that needs a model

Four cheap stages run before this one and remove most of the work from it. Its job is the part they
cannot do: **name the causal factor, and prove it**.

Binding: [taxonomy.md](../diag-loop/references/taxonomy.md) — the four facets, the evidence gates, the
finding format. Where it and this skill disagree, it wins.

## Inputs

| Role | Path |
|---|---|
| Evidence base | `400 Code/Output/<feature>/reports/diagnosis/evidence/{failures,clusters,reqgraph}.json` |
| Criteria | `200 Requirements/230 Output/<feature>/stories/` |
| Specs | `300 Specs/320 F-Specs/Output/<feature>/`, `300 Specs/330 D-Specs/Output/<feature>/` |
| Manifests | `400 Code/Output/<feature>/99-traceability.md`, `500 Tests/Output/<feature>/99-traceability.md` |
| Divergence registers | every stage's `98-divergences.md` |
| Previous reports | `400 Code/Output/<feature>/reports/diagnosis/` |
| Emitted | `400 Code/Output/<feature>/reports/diagnosis/diag-<YYYYMMDD-HHmm>.md` |

**Read the evidence base, not the logs.** The clusters exist so the raw output never enters context. A
log line is quoted only when it is the evidence for a finding, and then only that line.

Write nothing but the report. No spec, no source, no test, no configuration.

## The five stages

### 1. Reproduce — and check the run is not void

Before anything else, decide whether the run means anything:

- Are the artifacts fresh — do they postdate the last edit under `<source>`, `<web>`, `<migrations>` and
  the mobile tree?
- Was the recorded configuration the one that ran?
- Did every configured level execute, or was one silently absent?
- Do any two runs of the same check disagree with no source change between them?

Any of these fires an `env` injection, and the verdict is **`VOID`**. Stop there and say so. A finding
drawn from a void run is not wrong, it is meaningless — and it costs more than it saves, because someone
will act on it.

This stage diagnoses environment drift and flakiness **for free**, before a model looks at anything.

### 2. Cluster

Already done by the deterministic core. Work from `clusters.json` and never from the failure list: one
finding per cluster. If two clusters share a cause, merge them and say so in the report.

Order by occurrences × requirement weight — a cluster of one that blocks a domain criterion outranks a
cluster of forty in a cosmetic check. `--top N` limits how many are diagnosed this run; the rest are
listed as `undiagnosed` with their counts, never silently dropped.

### 3. Trace

For each cluster, walk `reqgraph.json`: check → criterion → requirement → design item → code symbol.

This answers *what the failure is about*, which is the question everyone skips. Three outcomes, all
useful:

- The chain resolves → the finding is about that requirement.
- The chain **breaks at a stage** → that break is itself the finding: `untraceable`, injected at the
  stage where the link is missing.
- The check traces to no criterion → either regression coverage (fine, and it cites its finding id) or a
  check that decides nothing (`test` / `unverifiable`).

### 4. Hypothesise

Now, and only now, name candidate causal factors — plural. Write down the **rivals** before choosing,
because a rival you never wrote down is a rival you never excluded.

Place each candidate on all four facets. If you cannot name the `Detection` gate that should have caught
it, say `none` — that is the honest answer and the one that feeds
[diag-retro](../diag-retro/SKILL.md).

The invariants of [domain-invariants.md](../pipeline-conventions/references/domain-invariants.md) are the
first place to look: most clusters in this system reduce to a layer crossed, a duplicate not deduped, a
retry that advanced state twice, a role not checked, or a default that was not neutral.

### 5. Experiment

For each candidate above `possible`:

1. **Write the prediction first** — what the differential run will show if the candidate is the cause,
   and what it will show if a named rival is.
2. Run it. The cheapest differential that separates them: one input changed, one flag flipped, one
   ordering forced, the same seed data.
3. Record the observation verbatim.

A finding reaches `confirmed` only this way. Writing the prediction afterwards is how a rival survives
unnoticed, and it is the single most common way a diagnosis is wrong while sounding certain.

A finding that stays `probable` or `possible` is **still reported and still routed** — with its rivals
named. Hiding uncertainty costs more than admitting it.

## The report

```markdown
---
stage: diag
feature: <feature>
verdict: DIAGNOSED | PARTIAL | VOID
generated: <YYYY-MM-DDTHH:mm:ssZ>
iteration: N
clusters: {total: N, diagnosed: N, undiagnosed: N}
confidence: {confirmed: N, probable: N, possible: N}
---

## Requirement verification status
| Status | Count | Ids |
|---|---|---|
| verified | 14 | ... |
| failing | 3 | AC-US-0007-03, ... |
| not-implemented | 1 | AC-US-0009-01 |
| unverified | 2 | AC-US-0004-05, AC-US-0011-02 |

## Findings
### FIND-01
- cluster: CL-02 (4 occurrences, first seen ..., last seen ...)
- injection / type / detection / confidence
- requirement: REQ-... ← AC-...
- evidence: <file:line, or one quoted log line with its source>
- experiment: <prediction, written before the run> → <observation>
- rivals excluded: <named, with what excluded them>
- routed to: <loop and mode>

## Undiagnosed clusters
<Id, occurrences, clause, and what would be needed to diagnose it. Never omitted.>

## Process observations
<Candidates for diag-retro: a Detection value of `none`, a defect class seen before, a gate that keeps
missing the same shape. Recorded, never fixed here.>
```

The **verification status comes first** on purpose. A failure count is not the answer to *will this be
built correctly*; the count of requirements nothing verifies is — and it is invisible unless something
prints it.

## Rules

- One finding per cluster; every cluster either diagnosed or listed as undiagnosed with what it needs.
- No finding above `possible` without evidence cited at `file:line` or a quoted log line with its source.
- No `confirmed` without a prediction recorded before the experiment ran.
- Rivals are named and excluded explicitly, or the finding stays `possible`.
- `VOID` is a full verdict, not a failure of this skill.
- **Fix nothing.** Every finding names the loop that owns the repair; this skill never performs one.
- Never route a finding to two destinations. If it belongs to two, it is two findings.
- Never let a `divergence` be reported as a defect: a requirement the system does not satisfy yet is
  recorded work, and diagnosing it as a bug wastes the run.
