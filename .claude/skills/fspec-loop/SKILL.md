---
name: fspec-loop
description: 'Run the fspec-generator ↔ fspec-validator loop to convergence for one feature: turn the validated requisites under "200 Requirements/230 Output/<feature>/" into a validated functional specification under "300 Specs/320 F-Specs/Output/<feature>/" — features, flows, API contracts, screens, business rules. Use when: the requisites passed and the behaviour must be specified; the user says "spec this out", "loop until it passes", or asks to resume after a FAIL. Owns the iteration counter and the stop conditions.'
argument-hint: 'Feature, optionally --max-iterations N'
---

# FSpec Loop — stage 2 driver (`300 Specs/320 F-Specs`)

Drives **generate → gate → validate → fix** until `fspec-validator` returns SUCCESS or a stop condition
fires. This skill owns the loop; it is the only place an iteration counter exists.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md) and
[domain-invariants.md](../pipeline-conventions/references/domain-invariants.md).

## Driver — the loop runs as a workflow

The procedure below is the **specification** of this loop; `.claude/workflows/spec-loop.js` is its
**implementation**, shared with the other spec-stage loops so the three cannot drift apart. Where the
Workflow tool is available, invoking this skill with a feature means running it:

```
Workflow({ name: "spec-loop", args: { stage: "fspec", feature: "<feature>", maxIterations: 5,
                                     decisions: "<author rulings to carry into the set, if any>" } })
```

`rerun: true` re-validates a validated set; `mode: "C"` with `feedback: "<path>"` resolves a feedback
report (pending cross-feature feedback is picked up on its own). Each step is a fresh agent from
`.claude/agents/` — `pipeline-gate` (a small model) for the scripts, `fspec-generator`, and
`fspec-validator`, isolated by construction. The iteration counter and every stop condition are code;
the main context holds only the returned object: verdict, summary rows, report paths, the stop
condition and the exact question for the user. Several features may run at once, one workflow each —
or all of them through `Workflow({ name: "pipeline-run" })`; `.claude/hooks/feature_lock.py` refuses a
second loop on a claimed feature. After a SUCCESS the workflow re-emits the derived tables and confirms
`pipeline_progress.py` reads `validated`.

Run the procedure by hand only when the Workflow tool is unavailable, and say so in the summary. The
validator still runs through the `fspec-validator` agent — an in-context validation is not a verdict.

## Artifact locations

| Role | Path |
|---|---|
| Sub-skill — generator | [fspec-generator](../fspec-generator/SKILL.md) |
| Sub-skill — validator | [fspec-validator](../fspec-validator/SKILL.md) |
| Input — validated requisites | `200 Requirements/230 Output/<feature>/` (`status: validated`) |
| Input — seed | `200 Requirements/220 Input/<feature>/SEED.md` (read-only, for scope) |
| Input — directives | `300 Specs/320 F-Specs/Input/` — API conventions, UX conventions, existing contract inventory |
| Input — domain | [domain-invariants.md](../pipeline-conventions/references/domain-invariants.md) |
| Input — as-built code | **not read by default** — `400 Code/Source/` only when the run explicitly asks (conventions §2) |
| Under work | `300 Specs/320 F-Specs/Output/<feature>/` |
| Loop memory | `300 Specs/320 F-Specs/Output/<feature>/reports/fspec-validation/` |
| Back-channel to stage 1 | `200 Requirements/230 Output/<feature>/reports/feedback/` |

Rules:

- One feature per run; ask if it is missing or ambiguous.
- If `200 Requirements/230 Output/<feature>/` does not exist or is not `status: validated`, stop and send the user
  to [req-loop](../req-loop/SKILL.md). This loop never edits the requisites.
- Never write under `200 Requirements/`, except a `FEEDBACK-<nn>` report into its `reports/feedback/` folder.
- Never write under `400 Code/.github/`, `.claude/skills/` or `300 Specs/__old__Specs/`.

## Loop

Set `iteration = 1`, `MAX = 5` (override with `--max-iterations N`).

### 0. Pending feedback — before the counter starts

Collect the **cross-feature feedback** addressed to this feature (conventions §14), from

```
300 Specs/320 F-Specs/Output/<feature>/reports/feedbacks/<origin feature>/feedback-*.md
```

Pending = stamped **after** the newest fspec-validation report; anything older is history.
`pipeline_progress.py` prints the origins in its `feedback` column.

Hand every pending item to the generator in **one** Mode C round together with whatever else this run
is fixing — three items then cost one iteration, not three. A pending feedback never blocks this run:
it is a proposal this feature has not yet judged, and this feature's last SUCCESS stands until this
loop rules on it.

### 1. Resolve state

```powershell
python .claude/skills/pipeline-progress/scripts/pipeline_progress.py --feature <feature> --stage fspec --json
```

| State | Next action |
|---|---|
| Folder absent / no `00-index.md` | fspec-generator **Mode A** |
| `status: draft`, a report exists | fspec-generator **Mode B** with the newest report |
| `status: draft`, no report | go to step 2 |
| Exists, but no `api/API-*.md` and the feature has a client channel | Mode B with one issue: "no API contract (F5)" |
| Exists, but no `screens/SCR-*.md` and `web` or `mobile` is in scope | Mode B with one issue: "no screen specification (F6)" |
| Upstream moved — requisites re-validated at a later version, or `seed-changed` | fspec-generator **Mode A**: the specs answer a version that no longer stands |
| `status: validated`, all required sets present | report already-validated and stop, unless asked to re-run |

### 2. Deterministic gate

Always before the semantic pass — it is the cheap signal, and it is deterministic.

```powershell
python .claude/skills/pipeline-progress/scripts/lint_artifacts.py --stage fspec --feature <feature> --emit
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

Invoke `fspec-validator` **in a subagent** with a fresh context, passing only the feature and the paths. It
writes `reports/fspec-validation/fspec-validation-<YYYYMMDD-HHmm>.md`.

### 4. Read the verdict

- `SUCCESS` → the validator has set `status: validated`. Stop and emit the summary.
- `FAIL` → evaluate the stop conditions; if none fire, `iteration++` and return to step 1.

## Stop conditions

The shared list in
[pipeline-conventions §11](../pipeline-conventions/SKILL.md), plus:

| Condition | Detection |
|---|---|
| Requisites widening | An issue can only be cleared by specifying behaviour no criterion asks for, or by dropping a criterion. Write a `FEEDBACK-<nn>` into `200 Requirements/230 Output/<feature>/reports/feedback/` and ask whether it joins the requisites or leaves the FSpec |
| Breaking contract change | The only way to satisfy a criterion is to change an existing API contract in a way that breaks the dashboard or a released mobile build. That is a product decision: ask, and record the answer as a constraint |
| Domain branch undefined | A protocol branch the requisites do not settle. It goes to the domain owner |
| Channel divergence | Web and mobile would need different behaviour for the same criterion and the requisites do not say so. Ask rather than pick |

## Quality rules (self-check)

- The iteration counter exists only here.
- `status: validated` is set only by `fspec-validator`, on SUCCESS.
- No file is edited by this skill; all writes go through `fspec-generator`.
- A run that converges without an API contract, for a feature with any client channel, is not a SUCCESS —
  the code stage would have nothing to build against.
- A run that converges without screen specs, for a feature with `web` or `mobile` in scope, is not a SUCCESS.
- The loop converges by fixing the specification, never by weakening what a criterion demands.
