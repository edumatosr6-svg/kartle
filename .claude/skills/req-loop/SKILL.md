---
name: req-loop
description: 'Run the req-generator ↔ req-validator loop to convergence for one feature: turn the seed under "200 Requirements/220 Input/<feature>/SEED.md" into a validated requisites set under "200 Requirements/230 Output/<feature>/". Use when: a new feature must enter the pipeline; the user says "generate the requisites", "loop until it passes", or asks to resume after a FAIL. Owns the iteration counter and the stop conditions; the generator and validator never invoke each other.'
argument-hint: 'Feature (folder name under "200 Requirements/220 Input/"), optionally --max-iterations N'
---

# Req Loop — stage 1 driver (`200 Requirements`)

Drives **generate → gate → validate → fix** until `req-validator` returns SUCCESS or a stop condition
fires. This skill owns the loop; it is the only place an iteration counter exists.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md) and
[domain-invariants.md](../pipeline-conventions/references/domain-invariants.md). Everything they state —
layout, ids, severities, the divergence rule, isolation, token accounting, the shared stop conditions —
applies here and is not restated.

## Driver — the loop runs as a workflow

The procedure below is the **specification** of this loop; `.claude/workflows/spec-loop.js` is its
**implementation**, shared with the other spec-stage loops so the three cannot drift apart. Where the
Workflow tool is available, invoking this skill with a feature means running it:

```
Workflow({ name: "spec-loop", args: { stage: "req", feature: "<feature>", maxIterations: 5,
                                     decisions: "<author rulings to carry into the set, if any>" } })
```

`rerun: true` re-validates a validated set; `mode: "C"` with `feedback: "<path>"` resolves a feedback
report (pending cross-feature feedback is picked up on its own). Each step is a fresh agent from
`.claude/agents/` — `pipeline-gate` (a small model) for the scripts, `req-generator`, and
`req-validator`, isolated by construction. The iteration counter and every stop condition are code;
the main context holds only the returned object: verdict, summary rows, report paths, the stop
condition and the exact question for the user. Several features may run at once, one workflow each —
or all of them through `Workflow({ name: "pipeline-run" })`; `.claude/hooks/feature_lock.py` refuses a
second loop on a claimed feature. After a SUCCESS the workflow re-emits the derived tables and confirms
`pipeline_progress.py` reads `validated`.

Run the procedure by hand only when the Workflow tool is unavailable, and say so in the summary. The
validator still runs through the `req-validator` agent — an in-context validation is not a verdict.

## Artifact locations

| Role | Path |
|---|---|
| Sub-skill — generator | [req-generator](../req-generator/SKILL.md) |
| Sub-skill — validator | [req-validator](../req-validator/SKILL.md) |
| Input — seed | `200 Requirements/220 Input/<feature>/SEED.md` |
| Input — product context | `200 Requirements/210 Docs/` |
| Input — domain | [domain-invariants.md](../pipeline-conventions/references/domain-invariants.md) |
| Input — as-built code | **not read by default** — `400 Code/Source/` only when the run explicitly asks (conventions §2) |
| Under work | `200 Requirements/230 Output/<feature>/` |
| Loop memory | `200 Requirements/230 Output/<feature>/reports/req-validation/` |
| Progress | [pipeline-progress](../pipeline-progress/SKILL.md) |

Rules:

- One feature per run. If missing or ambiguous, list `200 Requirements/220 Input/` and **ask** before writing.
- If `200 Requirements/220 Input/<feature>/SEED.md` does not exist, stop and send the user to
  [seed-authoring](../seed-authoring/SKILL.md). Never invent a seed.
- Never write anything under `200 Requirements/220 Input/`, `400 Code/.github/` or `.claude/skills/`.

## When to use

- A seed must become a validated requisites set.
- A previous run ended FAIL and the fix loop should resume.

Do **not** use it to validate only ([req-validator](../req-validator/SKILL.md)) or to make a one-off edit
([req-generator](../req-generator/SKILL.md)).

## Loop

Set `iteration = 1`, `MAX = 5` (override with `--max-iterations N`).

### 0. Pending feedback — before the counter starts

Collect the **cross-feature feedback** addressed to this feature (conventions §14), from

```
200 Requirements/230 Output/<feature>/reports/feedbacks/<origin feature>/feedback-*.md
```

Pending = stamped **after** the newest req-validation report; anything older is history.
`pipeline_progress.py` prints the origins in its `feedback` column.

Hand every pending item to the generator in **one** Mode C round together with whatever else this run
is fixing — three items then cost one iteration, not three. A pending feedback never blocks this run:
it is a proposal this feature has not yet judged, and this feature's last SUCCESS stands until this
loop rules on it.

### 1. Resolve state

```powershell
python .claude/skills/pipeline-progress/scripts/pipeline_progress.py --feature <feature> --stage req --json
```

Then read the front matter of `200 Requirements/230 Output/<feature>/00-index.md`:

| State | Next action |
|---|---|
| Folder absent / no `00-index.md` | req-generator **Mode A** |
| `status: draft`, a report exists | req-generator **Mode B**, passing the newest report path |
| `status: draft`, no report | go to step 2 |
| Seed moved (`seed-changed`) | req-generator **Mode A** against the current seed — the set answers a revision that no longer stands |
| Seed edited without a bump (`seed-drift`) | stop; ask the author to bump `revision:`. The loop never edits the seed |
| `status: validated` | report already-validated and stop, unless the user asked to re-run |

### 2. Deterministic gate

Always before the semantic pass — it is the cheap signal, and it is deterministic.

```powershell
python .claude/skills/pipeline-progress/scripts/lint_artifacts.py --stage req --feature <feature> --emit
```

`--emit` regenerates the derived files — `00-index.md` and `99-traceability.md` — from the artifacts
themselves, then re-checks. Those two are **never hand-written** (conventions §13): a fact stated in
four places, one of them stale, is the largest class of finding in the pipeline.

The script settles front matter, id format and uniqueness, filename agreement, child ids, index
agreement, traceability resolution, `TBD`/`OPEN` markers, the required files. **The validator never re-judges any of it** — say so in the invocation.

Any `error` → turn the lines into `ISSUE-<nn>`, fix through Mode B, `iteration++`, and return here
**without** spending a semantic pass.

**A gate that examined no file is not a pass.** The script prints the file count; if it is zero while
files are present, that is a `blocker` raised to the user, not something to iterate on.

### 3. Semantic validation

Invoke `req-validator` on the feature **in a subagent** with a fresh context, passing only the feature and the
paths. It writes `reports/req-validation/req-validation-<YYYYMMDD-HHmm>.md`.

### 4. Read the verdict

- `SUCCESS` → the validator has already set `status: validated`. Stop and emit the summary.
- `FAIL` → evaluate the stop conditions; if none fire, `iteration++` and return to step 1, which selects
  Mode B with this report.

## Stop conditions

The shared list in
[pipeline-conventions §11](../pipeline-conventions/SKILL.md), plus:

| Condition | Detection |
|---|---|
| Seed contradicts itself | Two stories or a story and a constraint cannot both hold, and the seed does not say which wins. A product decision, not a loop decision |
| Criterion cannot be made observable | A criterion the loop can only satisfy by asserting an internal call. Raise it: either the behaviour has an external effect nobody has named, or the story is not real |
| Domain judgement required | A threshold, an escalation rule or a branching decision the seed does not settle. It goes to the domain owner, never to the model |

## Quality rules (self-check)

- The iteration counter exists in exactly one place: this skill.
- Every semantic pass writes a report; the reports folder is the loop's audit trail.
- `status: validated` is never set by this skill — only by `req-validator` on SUCCESS.
- No file is edited by this skill directly; all writes go through `req-generator`.
- A FAIL that stops on a stop condition is a normal outcome, not an error to hide.
- A SUCCESS carrying divergences is a full SUCCESS — the requisites are validated and the system is
  simply behind them.
