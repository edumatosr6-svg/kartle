---
name: diag-retro
description: 'Cross-feature retrospective: read the accumulated Root Cause Reports and validation reports, ask which classes of defect the loops keep manufacturing, and propose changes to the process — each at the earliest prevention level that works, with a re-measurement date after which a change that did not work is removed. Use when: the user asks what keeps going wrong, why the same defect returns, or how to improve the loops; or when diag-loop recorded process findings. On demand only. Proposes; never fixes, and never edits a skill.'
argument-hint: 'Optionally a date range, or the features to consider'
---

# Diag Retro — improving the loops, not the feature

Every other skill in this pipeline asks *what is wrong with this feature*. This one asks the question
none of them can: **what is wrong with the pipeline, that it keeps producing this same defect?**

It runs **on demand only**. A retrospective after every run measures noise and produces cargo cult.

## Inputs

| Role | Path |
|---|---|
| Root Cause Reports | `400 Code/Output/*/reports/diagnosis/diag-*.md` |
| Diagnosis validations | `400 Code/Output/*/reports/diagnosis/diag-validation-*.md` |
| Validation reports | every stage's `reports/*-validation/` |
| Divergence registers | every stage's `98-divergences.md` |
| Previous proposals | `100 Admin/120 Processes/proposals/PROP-*.md` |
| Emitted | `100 Admin/120 Processes/proposals/PROP-<nn>-<short-name>.md` |

Read the reports' **front matter and finding headers**, not their bodies. The counts and the four facets
are the data; the prose is not.

**This skill edits no skill, no spec, no source and no test.** Its only output is a proposal a human
decides on.

## The three thresholds

A proposal is written only when all three hold. They exist because a retrospective with a lower bar
produces process changes faster than anyone can evaluate them, and the pipeline then accumulates rules
nobody can justify.

1. **Three findings.** The same defect class appears at least three times.
2. **Two features.** Across at least two different features — one feature repeating itself is a feature problem,
   not a process problem.
3. **A named gate.** The `Detection` facet identifies a gate that should have caught it, or `none` with
   the reason no gate could.

Below the thresholds: record the observation in the proposal backlog and say explicitly that it is below
threshold. Do not propose.

## The prevention ladder

Always propose at the **earliest level that would actually work**. A check added at stage 5 for a defect
injected at stage 2 catches it four stages after it became expensive, and it makes the late gate slower
for everyone.

| Level | Where | Example |
|---|---|---|
| 1 | The seed template or `seed-authoring` | A field authors keep forgetting becomes a required section |
| 2 | A generator's policy | A rule the generator must follow, so the defect is never written |
| 3 | A validator's check | A check that catches it at the stage that injected it |
| 4 | A deterministic gate | A script that settles it mechanically — cheapest to run, hardest to argue with |
| 5 | A later stage's check | Only when nothing earlier can see it |

Prefer level 4 over level 3 wherever the rule can be settled by a script: a check that cannot be tested
is a wish, and a wish decays.

## What a proposal must carry

```markdown
---
id: PROP-07
title: <the defect class, named as a class>
generated: <YYYY-MM-DD>
status: proposed
decision:            # only a human writes this: accepted | rejected | deferred
evidence: {findings: 5, features: 3, span: 2026-06-01..2026-09-01}
level: 3
remeasure: 2026-12-01
---

## The class
<What keeps happening, stated so someone can recognise the next instance.>

## Evidence
| Finding | Feature | Injection | Type | Detection | Date |
|---|---|---|---|---|---|
<One row per instance. Below three rows across two features, there is no proposal.>

## Why it is not caught today
<The gate that should have caught it, and the specific reason it does not.>

## Proposal
<The exact change: which skill, which section, what text. A proposal that cannot be applied by reading it
is not a proposal.>

## Cost
<What it makes slower or harder, and for whom. A change with no stated cost has not been thought about.>

## Re-measurement
<The date, and the number that must have moved: "instances of this class per ten features, currently 1.7,
target under 0.5". A change that has not moved its number by its date is removed, not defended.>
```

## The re-measurement rule

Every accepted proposal carries a date and a number. **On that date, the number is measured.** If it did
not move:

- the change is **removed**, not argued for;
- the removal is recorded in the proposal;
- the class returns to the backlog, and the next proposal must be at a different level.

This is the rule that keeps the process from accumulating. Without it every proposal is permanent, every
loop grows, and the pipeline eventually costs more than the defects it prevents.

## What is not a process finding

- **A one-off.** A defect that happened once is a defect, not a class.
- **A hard problem.** Some domain branching is genuinely hard; a gate cannot make it easy, and a proposal
  that pretends otherwise adds ceremony.
- **A person.** No proposal names an author or attributes a class to who wrote it.
- **A budget.** Cost and elapsed time are outside the diagnosis process. A gate is judged by what it
  catches, never by what it spends — a proposal to make a gate cheaper must show it still catches the
  same classes.
- **A facet disagreement alone.** A facet the analyst and the validator disagree on constantly *is* a
  signal — but the proposal is to fix the facet's definition, not to blame either role.

## Procedure

1. Collect the front matter and finding headers of every diagnosis and validation report in range.
2. Group findings by `(Injection, Type)` — that pair is the defect class.
3. Apply the three thresholds. Everything below them goes to the backlog, labelled as below threshold.
4. For each class above threshold, find the earliest prevention level that would actually have caught it.
5. Check the previous proposals: a class already proposed at that level, and re-measured without
   improvement, must be proposed at a **different** level or not at all.
6. Write one `PROP-<nn>` per class, with its cost and its re-measurement.
7. Report the classes, the proposals and the backlog. Change nothing.

## Rules

- On demand only.
- Never below three findings across two features.
- Always the earliest level that works, and always with the cost stated.
- Always a re-measurement date and a number.
- `decision:` is written by a human. This skill leaves it empty, and never acts on a proposal it wrote.
- No skill file, spec, source or test is edited here — not even the one the proposal is about.
