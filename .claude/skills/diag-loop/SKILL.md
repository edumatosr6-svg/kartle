---
name: diag-loop
description: 'Run the Diagnosis pipeline to convergence for one feature: rebuild the evidence base with the deterministic core, then diag-analyst (Root Cause Report) ↔ diag-validator (isolated, re-runs the experiments). Use when: a loop fired a stop condition, test-validator returned FAIL SPEC, deploy-validator returned FAIL CODE, the user says "why does this keep failing" or asks which requirements are still unproven. Ends with findings routed to the loop that owns each repair, and a statement of how many of the feature''s requirements are demonstrably satisfied. Owns the iteration counter; its stop conditions are all functional, never budgets.'
argument-hint: 'Feature, optionally --max-iterations N, --top N'
---

# Diag Loop — the process that answers "whose defect is it"

Drives **harvest → cluster → trace → diagnose → validate** until the Root Cause Report survives an
independent check or a stop condition fires. This skill owns the loop; it is the only place an iteration
counter exists.

**This is a functional diagnosis.** It answers whether the software is being built correctly against its
requirements. Cost, token spend and elapsed time are operational concerns and are outside it — no metric
measures them and **no stop condition is a budget**.

The pipeline diagnoses; it fixes nothing. Its output is a set of findings, each routed to the loop that
owns the repair.

## Normative inputs

| Document | What it binds |
|---|---|
| [taxonomy.md](references/taxonomy.md) | The four facets, the evidence gates, the five stages, the finding format |
| [pipeline-conventions](../pipeline-conventions/SKILL.md) | Layout, severities, the divergence rule |
| [domain-invariants.md](../pipeline-conventions/references/domain-invariants.md) | What a violation looks like, and which are non-negotiable |

## Artifact locations

| Role | Path |
|---|---|
| Sub-skill — analyst | [diag-analyst](../diag-analyst/SKILL.md) |
| Sub-skill — validator | [diag-validator](../diag-validator/SKILL.md) |
| Deterministic core | [diag_harvest.py](scripts/diag_harvest.py) |
| Evidence base (generated) | `400 Code/Output/<feature>/reports/diagnosis/evidence/{failures.json,clusters.json,reqgraph.json}` |
| Loop memory | `400 Code/Output/<feature>/reports/diagnosis/` |
| Exit — code / test findings | `400 Code/Output/<feature>/reports/feedback/`, `500 Tests/Output/<feature>/reports/feedback/` |
| Exit — spec findings | `300 Specs/320 F-Specs/…` / `300 Specs/330 D-Specs/…` `reports/feedback/` |
| Exit — seed findings | the user, via [seed-authoring](../seed-authoring/SKILL.md) |
| Exit — process findings | [diag-retro](../diag-retro/SKILL.md) |

Rules:

- One feature per run; ask if it is missing or ambiguous.
- **This loop edits no spec, no source, no test and no configuration.** All writing goes through the
  sub-skills, and all of it is reports.
- `test-validator` keeps its own classification step. This loop is the deeper pass for when that was not
  decisive, when a loop stalled, or when the question spans runs. **Do not run it after every test run.**
- Never write under `400 Code/.github/`, `.claude/skills/` or `300 Specs/__old__Specs/`.

## When to use

- A loop fired a stop condition — oscillation, no-progress, needs-human.
- `test-validator` returned FAIL SPEC and the feedback needs evidence and routing.
- `deploy-validator` returned FAIL CODE.
- The user asks why a feature keeps failing, or which of its requirements are still unproven.

Do **not** use it to fix code ([code-generator](../code-generator/SKILL.md)), to run tests
([test-loop](../test-loop/SKILL.md)), or to ask what is implemented
([pipeline-progress](../pipeline-progress/SKILL.md)).

## Loop

Set `iteration = 1`, `MAX = 3` (override with `--max-iterations N`).

### 1. Rebuild the evidence base

```powershell
python .claude/skills/diag-loop/scripts/diag_harvest.py --feature <feature>
```

It reads the JUnit XML and the captured logs under `500 Tests/Output/<feature>/reports/`, the traceability
files of every stage, and writes the evidence base. **Read only its printed summary** — the raw logs
never enter the model context. That is what keeps the cost of a diagnosis independent of the size of the
run.

Confirm the clusters' `last_seen` postdates the last source edit. A stale base diagnoses the previous
build, and every finding drawn from it is noise.

**Report the requirement verification status here, before anything else.** It is the answer the loop
exists for, and it frames every finding that follows.

### 2. Diagnose

Invoke `diag-analyst` on the feature (forward `--top`). It writes
`reports/diagnosis/diag-<YYYYMMDD-HHmm>.md`.

- Verdict **`VOID`** — an `env` injection fired — the run's findings are invalid, not wrong. Stop, report
  the environment fault, and send the user back to [test-loop](../test-loop/SKILL.md) for a clean run.
  Do not iterate: nothing here is diagnosable until the run is valid.
- Verdict `DIAGNOSED` or `PARTIAL` → continue.

### 3. Validate — in a subagent, with a fresh context

Invoke `diag-validator` **in a subagent**, passing only the feature, the report path and the evidence-base
paths. **Never pass the analyst's reasoning**: generator and validator are the same model, and a
validator that sees why something was claimed tends to agree with it. The subagent boundary and the
re-run experiments are the only independent signals here.

- `SUCCESS` → the report stands. Go to step 4.
- `FAIL` → evaluate the stop conditions; if none fire, `iteration++` and return to step 2, passing the
  Diagnosis Validation Report so the analyst can meet the gates it named.

### 4. Route

Each surviving finding goes to exactly one destination, and this loop takes none of them itself:

| Injection | Destination | Artifact |
|---|---|---|
| `code` | [code-loop](../code-loop/SKILL.md) Mode C | the Root Cause Report |
| `test` | [test-loop](../test-loop/SKILL.md) Mode C | the Root Cause Report |
| `dspec` | [dspec-loop](../dspec-loop/SKILL.md) Mode C | a feedback report |
| `fspec` / `req` | the corresponding loop, Mode C | a feedback report |
| `deploy` | [deploy-loop](../deploy-loop/SKILL.md) Mode B | a feedback report |
| `seed` | **the user**, via [seed-authoring](../seed-authoring/SKILL.md) | named in the summary as a decision this loop may not take |
| `env` | a re-run with corrected inputs | named in the summary |
| `process` | [diag-retro](../diag-retro/SKILL.md) | recorded; never fixed per feature |

## Stop conditions

All functional. **None is a budget** — this process is not judged by what it spends.

| Condition | Detection |
|---|---|
| Iteration budget exhausted | `iteration > MAX` |
| Run is void | An `env` injection fired: nothing is diagnosable until the run is redone |
| Oscillation | The same finding reclassified twice in opposite directions — the analyst is guessing |
| Evidence base is the problem | More than 40% of clusters end `undiagnosed`. The fix is upstream, in what the runs record — not more analysis |
| No progress | The new report's blockers are not strictly fewer than the previous one's |
| Needs human input | A `seed` finding, or a test-versus-code dispute the specs do not settle |

The important one is the fourth. **When most clusters cannot be diagnosed, the answer is not more
diagnosis** — it is that the runs do not record enough to diagnose from, and that is a `process` finding
for [diag-retro](../diag-retro/SKILL.md).

## Output

The requirement verification status, then one line per finding with its four facets and its destination,
then the report paths. Never the failure log.

No token-usage table: a gate is judged by what it catches, never by what it spends.
