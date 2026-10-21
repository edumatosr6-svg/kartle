---
name: dspec-loop
description: 'Run the dspec-generator ↔ dspec-validator loop to convergence for one feature: turn the validated functional specification under "300 Specs/320 F-Specs/Output/<feature>/" into a validated design specification under "300 Specs/330 D-Specs/Output/<feature>/" — architecture, data model and migrations, module and component design, integrations, security design and the test strategy. Use when: the FSpec passed and the build must be designed; the user says "design this", "loop until it passes", or asks to resume after a FAIL. Owns the iteration counter and the stop conditions.'
argument-hint: 'Feature, optionally --max-iterations N'
---

# DSpec Loop — stage 3 driver (`300 Specs/330 D-Specs`)

Drives **generate → gate → validate → fix** until `dspec-validator` returns SUCCESS or a stop condition
fires. This skill owns the loop; it is the only place an iteration counter exists.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md) and
[domain-invariants.md](../pipeline-conventions/references/domain-invariants.md).

## Driver — the loop runs as a workflow

The procedure below is the **specification** of this loop; `.claude/workflows/spec-loop.js` is its
**implementation**, shared with the other spec-stage loops so the three cannot drift apart. Where the
Workflow tool is available, invoking this skill with a feature means running it:

```
Workflow({ name: "spec-loop", args: { stage: "dspec", feature: "<feature>", maxIterations: 5,
                                     decisions: "<author rulings to carry into the set, if any>" } })
```

`rerun: true` re-validates a validated set; `mode: "C"` with `feedback: "<path>"` resolves a feedback
report (pending cross-feature feedback is picked up on its own). Each step is a fresh agent from
`.claude/agents/` — `pipeline-gate` (a small model) for the scripts, `dspec-generator`, and
`dspec-validator`, isolated by construction. The iteration counter and every stop condition are code;
the main context holds only the returned object: verdict, summary rows, report paths, the stop
condition and the exact question for the user. Several features may run at once, one workflow each —
or all of them through `Workflow({ name: "pipeline-run" })`; `.claude/hooks/feature_lock.py` refuses a
second loop on a claimed feature. After a SUCCESS the workflow re-emits the derived tables and confirms
`pipeline_progress.py` reads `validated`.

Run the procedure by hand only when the Workflow tool is unavailable, and say so in the summary. The
validator still runs through the `dspec-validator` agent — an in-context validation is not a verdict.

## Artifact locations

| Role | Path |
|---|---|
| Sub-skill — generator | [dspec-generator](../dspec-generator/SKILL.md) |
| Sub-skill — validator | [dspec-validator](../dspec-validator/SKILL.md) |
| Input — validated FSpec | `300 Specs/320 F-Specs/Output/<feature>/` (`status: validated`) |
| Input — directives | `300 Specs/330 D-Specs/Input/` — architecture conventions, design system, ADR index |
| Input — as-built | `<source>`, `<migrations>`, `<web>` under the code root |
| Under work | `300 Specs/330 D-Specs/Output/<feature>/` |
| Loop memory | `300 Specs/330 D-Specs/Output/<feature>/reports/dspec-validation/` |
| Back-channel to stage 2 | `300 Specs/320 F-Specs/Output/<feature>/reports/feedback/` |

Rules:

- One feature per run; ask if it is missing or ambiguous.
- If `300 Specs/320 F-Specs/Output/<feature>/` is absent or not `status: validated`, stop and send the user to
  [fspec-loop](../fspec-loop/SKILL.md). This loop never edits the FSpec.
- **This stage reads the existing code and writes none.** No file under `<source>`, `<web>`, `<migrations>`
  or `<tests>` is created or edited here.
- Never write under `400 Code/.github/`, `.claude/skills/` or `300 Specs/__old__Specs/`.

## The lane this stage is in

Unlike the two stages above it, `300 Specs/330 D-Specs` **is** allowed to read the running system — that is its job:
it designs a change to a live product, and a design that ignores what exists produces a plan nobody can
apply.

The distinction that matters: the existing code is **context**, never **authority**.

- *"The orchestrator already owns this transition, so the new rule belongs there"* — legitimate design
  reasoning about where a required behaviour lands.
- *"The requirement is satisfied because the code already does something like it"* — an `error`. That is
  the FSpec's judgement, not this stage's, and the honest form is a **divergence**.

Every `REQ-*` the current system does not satisfy stays a requirement of the design, and the gap is
recorded in `98-divergences.md` for the code loop to close.

## Loop

Set `iteration = 1`, `MAX = 5` (override with `--max-iterations N`).

### 0. Pending feedback — before the counter starts

Collect the **cross-feature feedback** addressed to this feature (conventions §14), from

```
300 Specs/330 D-Specs/Output/<feature>/reports/feedbacks/<origin feature>/feedback-*.md
```

Pending = stamped **after** the newest dspec-validation report; anything older is history.
`pipeline_progress.py` prints the origins in its `feedback` column.

Hand every pending item to the generator in **one** Mode C round together with whatever else this run
is fixing — three items then cost one iteration, not three. A pending feedback never blocks this run:
it is a proposal this feature has not yet judged, and this feature's last SUCCESS stands until this
loop rules on it.

### 1. Resolve state

```powershell
python .claude/skills/pipeline-progress/scripts/pipeline_progress.py --feature <feature> --stage dspec --json
```

| State | Next action |
|---|---|
| Folder absent / no `00-index.md` | dspec-generator **Mode A** |
| `status: draft`, a report exists | dspec-generator **Mode B** with the newest report |
| `status: draft`, no report | go to step 2 |
| Exists, but no `test-strategy.md` | Mode B with one issue: "no test strategy (D7)" |
| Exists, and the FSpec implies a data change but there is no `data/DM-*.md` | Mode B with one issue: "no data model (D4)" |
| Upstream moved — FSpec re-validated at a later version, or `seed-changed` | dspec-generator **Mode A** |
| `status: validated`, all required sets present | report already-validated and stop, unless asked to re-run |

### 2. Deterministic gate

Always before the semantic pass — it is the cheap signal, and it is deterministic.

```powershell
python .claude/skills/pipeline-progress/scripts/lint_artifacts.py --stage dspec --feature <feature> --emit
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

Invoke `dspec-validator` **in a subagent** with a fresh context. It writes
`reports/dspec-validation/dspec-validation-<YYYYMMDD-HHmm>.md`.

### 4. Read the verdict

- `SUCCESS` → `status: validated` is already set by the validator. Stop and emit the summary.
- `FAIL` → evaluate the stop conditions; if none fire, `iteration++` and return to step 1.

## Stop conditions

The shared list in
[pipeline-conventions §11](../pipeline-conventions/SKILL.md), plus:

| Condition | Detection |
|---|---|
| Requirement not implementable | A `REQ-*` cannot be realized under the layering, the platform or the data model without a change the FSpec does not authorize. Write a `FEEDBACK-<nn>` to `300 Specs/320 F-Specs/Output/<feature>/reports/feedback/` and ask |
| Schema change not approved | The design needs a model change the seed does not request. `.github/copilot-instructions.md` requires approval: ask, and record the answer |
| Irreversible migration | The only migration that satisfies the design cannot be reversed. That is a product-risk decision, never the loop's |
| Architectural decision | A choice with consequences beyond the feature — a new dependency, a new service, a new storage engine, a change to the session or RBAC model. Write the ADR, then ask |
| Breaking a client contract | The design would change a contract `<web>` consumes, without the client change in the same set |

## Quality rules (self-check)

- The iteration counter exists only here.
- `status: validated` is set only by `dspec-validator`, on SUCCESS.
- No source file is created or edited by this stage.
- A run that converges without a test strategy is not a SUCCESS — the test loop would have nothing to
  implement.
- A run that converges with a schema change and no reversible migration plan is not a SUCCESS.
- The loop converges by designing to the specification, never by relaxing it to fit what exists.
