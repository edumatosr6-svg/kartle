# Diagnosis taxonomy — four orthogonal facets

Every finding is classified on all four. A finding missing any facet is not a finding, it is an opinion.

The `Type` values are the negations of the requirement-quality characteristics of ISO/IEC/IEEE 29148.
That is deliberate: *"poor specs"* is a complaint; *"this requirement is not verifiable, and here is the
span"* is a claim someone can disagree with and repair.

## Facet 1 — Injection: where the defect entered

| Value | Meaning | Routed to |
|---|---|---|
| `seed` | The seed is wrong, incomplete or contradictory | the human, via [seed-authoring](../../seed-authoring/SKILL.md) |
| `req` | The requisites misstate the seed, or a criterion is undecidable | [req-loop](../../req-loop/SKILL.md) |
| `fspec` | The functional spec is wrong, ambiguous or contradicts itself | [fspec-loop](../../fspec-loop/SKILL.md) |
| `dspec` | The design cannot realize the spec, or realizes it unsafely | [dspec-loop](../../dspec-loop/SKILL.md) |
| `code` | The implementation deviates from the design or the contract | [code-loop](../../code-loop/SKILL.md) |
| `test` | The check contradicts its criterion, is flaky, or asserts an internal | [test-loop](../../test-loop/SKILL.md) |
| `deploy` | The release, the migration or the configuration is at fault | [deploy-loop](../../deploy-loop/SKILL.md) |
| `env` | The run itself was invalid — stale build, wrong config, missing fixture, unavailable dependency | a re-run; **no finding from a void run is valid** |
| `process` | The loops keep manufacturing this class of defect | [diag-retro](../../diag-retro/SKILL.md) |

`env` is checked **first**, because a void run diagnoses the previous build and every conclusion drawn
from it is noise.

## Facet 2 — Type: what quality the artifact lacks

| Value | The artifact is not... | Typical shape |
|---|---|---|
| `incomplete` | complete | a case, a channel, an error path, a role nobody specified |
| `ambiguous` | unambiguous | two readers, two implementations |
| `unverifiable` | verifiable | no observation decides it |
| `inconsistent` | consistent | it contradicts another item, or its own traceability |
| `infeasible` | feasible | it cannot be built under the invariants or the platform |
| `untraceable` | traceable | no upstream source, or no downstream realization |
| `incorrect` | correct | it is well-formed and says the wrong thing |
| `unsingular` | singular | one item carrying several requirements, only some satisfied |

## Facet 3 — Detection: which gate should have caught it, and did not

`req-validator` · `fspec-validator` · `dspec-validator` · `code-validator` · `test-validator` ·
`deploy-validator` · `human-review` · `none`.

**This facet is the one that improves the process.** A defect injected at `fspec` and detected only by
`deploy-validator` travelled through four gates that each had a chance. Naming the gate that missed it is
what turns a bug into a check.

`none` means no existing gate could have caught it — the honest answer, and the one that feeds
`diag-retro`.

## Facet 4 — Confidence: how well the claim is supported

| Value | Requires |
|---|---|
| `confirmed` | A **differential experiment** whose prediction was written **before** it ran, and which came out as predicted |
| `probable` | Direct evidence — a log line, a `file:line`, a diff — consistent with the claim, with no experiment |
| `possible` | Reasoning consistent with the evidence, and at least one rival explanation not yet excluded |

**Evidence gates:**

- No finding is reported above `possible` without evidence cited at `file:line`, or a log line quoted with
  its source.
- A finding may only be raised to `confirmed` by an experiment whose prediction is recorded before the
  run. Writing the prediction afterwards is how a rival explanation survives unnoticed.
- A `possible` finding is reported as such and routed anyway — with the rival explanations named. Hiding
  uncertainty costs more than admitting it.

## Cluster, do not enumerate

Failures are grouped by **check identity plus failing clause** before anything is diagnosed. A hundred
reported occurrences are usually a handful of causes, and diagnosing them one by one spends the budget on
the same answer repeatedly.

One finding per cluster. If two clusters turn out to share a cause, merge them and say so.

## The five stages

Each is cheaper than the next and removes work from it. Only stage 4 needs a model.

| Stage | Does | Removes |
|---|---|---|
| 1 **Reproduce** | Re-run from the recorded commit, config, environment, seed data and spec revision | Environment drift and non-deterministic checks — both diagnose themselves here |
| 2 **Cluster** | Group by check and failing clause | Duplicate analysis of a single cause |
| 3 **Trace** | Failure → check → criterion → requirement → design item → code, through the traceability files | Guesswork about what the failure is *about* |
| 4 **Hypothesise** | Candidate causal factors on the facets — the only model stage | — |
| 5 **Experiment** | Differential run, prediction written first | Rival hypotheses; raises `probable` to `confirmed` |

## What a finding looks like

```markdown
### FIND-03
- cluster: CL-02 (4 occurrences, first seen 2026-08-30, last seen 2026-09-03)
- injection: code
- type: incomplete
- detection: code-validator (missed — C6 does not check the retry path of a webhook replay)
- confidence: confirmed
- requirement: REQ-FEAT-0011-03 ← AC-US-0007-03
- evidence: <source>/orchestration/event_handler.py:212 writes the state before the dedupe lookup at :198
- experiment: predicted that submitting the same inbound event id twice advances the sequence counter twice;
  ran it; observed 4 → 6
- routed to: code-loop (Mode C)
- rivals excluded: a race between two workers (ruled out — single worker in the reproduction)
```

## The requirement verification status comes first

Every Root Cause Report opens with it, before any failure list:

| Status | Meaning |
|---|---|
| `verified` | A check decides it, and the check passes |
| `failing` | A check decides it, and the check fails |
| `not-implemented` | The design covers it, no code realizes it |
| `unverified` | No check decides it — the most expensive status, because it looks like nothing |

A failure count is not the answer to *will the software be built correctly*. This table is.
