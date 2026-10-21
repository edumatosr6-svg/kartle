---
name: code-loop
description: 'Run the Implementation pipeline to convergence for one feature: code-generator (backend, web, mobile) → code-validator (isolated static gate). Ends with the implementation in the source, web, migration and mobile trees, plus a manifest and traceability under "400 Code/Output/<feature>/". Use when: the design passed and must become working code; the user says "implement this", "keep fixing until it builds clean", or asks to resume after a FAIL. Owns the iteration counter and the stop conditions; the sub-skills never invoke each other.'
argument-hint: 'Feature, optionally --max-iterations N'
---

# Code Loop — stage 4 driver (`400 Code`)

Drives **code → gate → validate → fix** until `code-validator` returns SUCCESS or a stop condition fires.
This skill owns the loop; it is the only place an iteration counter exists.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md) and
[domain-invariants.md](../pipeline-conventions/references/domain-invariants.md).

Build order, and it is not negotiable: **1. data model and migrations → 2. backend → 3. API clients →
4. web interface → 5. mobile apps.** A client written before the contract it consumes exists is a client
written against an assumption.

## Artifact locations

| Role | Path |
|---|---|
| Sub-skill — generator | [code-generator](../code-generator/SKILL.md) |
| Sub-skill — validator | [code-validator](../code-validator/SKILL.md) |
| Input — validated design | `300 Specs/330 D-Specs/Output/<feature>/` (`status: validated`) |
| Input — contracts | `300 Specs/320 F-Specs/Output/<feature>/api/` |
| Input — divergence register | `300 Specs/330 D-Specs/Output/<feature>/98-divergences.md` — the rows this loop owes |
| Input — coding directives | `400 Code/Input/` and the user's directives for the run |
| Output — source | `<source>`, `<web>`, `<migrations>`, `<mobile>` |
| Output — manifest | `400 Code/Output/<feature>/00-index.md`, `99-traceability.md` |
| Loop memory | `400 Code/Output/<feature>/reports/code-validation/` |
| Back-channel to design | `300 Specs/330 D-Specs/Output/<feature>/reports/feedback/` |

Rules:

- One feature per run; ask if it is missing or ambiguous.
- If `300 Specs/330 D-Specs/Output/<feature>/` is absent or not `status: validated`, stop and send the user to
  [dspec-loop](../dspec-loop/SKILL.md). This loop never edits a spec.
- Never write under `400 Code/.github/`, `.claude/skills/` or `300 Specs/__old__Specs/`.
- This skill edits no code itself — all work goes through the sub-skills.

## The divergence register is work, not history

Every `open` row of `300 Specs/330 D-Specs/Output/<feature>/98-divergences.md` is a requirement the validated specs carry
and the running system does not satisfy. It was recorded upstream precisely so this loop would owe it.

Fold the open rows into the coding directives at step 1, and set each to `resolved` — naming the
`file:line` or commit that now satisfies it — as it is cleared. A row marked `waived-pending` is blocked
on a product decision: leave it, and name it in the summary.

## Loop

Set `iteration = 1`, `MAX = 5` (override with `--max-iterations N`).

### 0. Pending feedback — before the counter starts

Collect the **cross-feature feedback** addressed to this feature (conventions §14), from

```
400 Code/Output/<feature>/reports/feedbacks/<origin feature>/feedback-*.md
```

Pending = stamped **after** the newest code-validation report; anything older is history.
`pipeline_progress.py` prints the origins in its `feedback` column.

Hand every pending item to the generator in **one** Mode C round together with whatever else this run
is fixing — three items then cost one iteration, not three. A pending feedback never blocks this run:
it is a proposal this feature has not yet judged, and this feature's last SUCCESS stands until this
loop rules on it.

### 1. Resolve state

```powershell
python .claude/skills/pipeline-progress/scripts/pipeline_progress.py --feature <feature> --stage code --json
```

Read the divergence register first, then:

| State | Next action |
|---|---|
| No implementation mapped to the feature's `REQ-*` ids | code-generator **Mode A** |
| Code exists, register holds `open` rows and no report is newer | code-generator **Mode B** with those rows as the issue list |
| Code exists, newest report is a FAIL `code-validation` | code-generator **Mode B** with that report |
| Code exists, newest report is a feedback item from `test-loop` or `diag-loop` | code-generator **Mode C** with that report |
| Code exists, no report yet | go to step 2 |
| Newest report is SUCCESS and no register row is open | report already-implemented and stop, unless asked to re-run |

### 2. Coding

Invoke `code-generator` in the mode selected, forwarding the directives and the build order.

If it returns **FAIL SPEC** — the design or the contract cannot be implemented as written — it has already
written a `FEEDBACK-<nn>` report to `300 Specs/330 D-Specs/Output/<feature>/reports/feedback/`. Fire the FAIL-SPEC stop
condition immediately: this loop cannot fix specs.

### 3. Deterministic gate

Always before the semantic pass — it is the cheap signal, and it is deterministic.

```powershell
python .claude/skills/pipeline-progress/scripts/lint_artifacts.py --stage code --feature <feature> --emit
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


**Never read a build, migration or deploy log into the context** (conventions §18). Reduce it:

```powershell
python .claude/skills/pipeline-progress/scripts/reduce_run.py --kind any "<the log>"
```

That bounded summary — the run's own totals, the ids on the failing lines, one excerpt per distinct
failure shape, real-looking records masked — **is the evidence**. If it does not answer the question,
that is the *Evidence would not fit bounded* stop condition: say what you would need, and stop.

### 4. Static validation

Invoke `code-validator` on the feature **in a subagent** with a fresh context, passing only the feature, the
spec paths and the change set — never the generator's reasoning. It writes
`reports/code-validation/code-validation-<YYYYMMDD-HHmm>.md`.

- `FAIL` → evaluate the stop conditions; if none fire, `iteration++` and return to step 1.
- `SUCCESS` → stop and emit the summary. The implementation is ready for [test-loop](../test-loop/SKILL.md).

## Stop conditions

The shared list in
[pipeline-conventions §11](../pipeline-conventions/SKILL.md), plus:

| Condition | Detection |
|---|---|
| FAIL SPEC | `code-generator` emitted a feedback report — the design or the contract is wrong, ambiguous or contradictory |
| Domain-invariant breach | A finding could only be cleared by violating a binding directive in `<stage-input>/` — skipping a layer, changing the primary context, logging content, weakening auth, or keeping a key the specs retire |
| Schema change not designed | The code needs a model change no `DM-*` designs. Never improvise a migration: go back to [dspec-loop](../dspec-loop/SKILL.md) |
| Divergence marked resolved with no code | A register row would be closed without the change that closes it |
| Unrequested refactor | The only offered fix is a refactor, rename or removal no requirement asks for (I10) |
| Secret required | The change cannot work without a credential that is not in the environment. Ask; never inline one, not even a placeholder that looks real |

The important one is the second: **the loop converges by moving the code to the specs, never by moving
the specs to the code.** A requirement that is genuinely wrong is FAIL SPEC.

## Quality rules (self-check)

- The iteration counter exists only here.
- Every semantic pass writes a report; the reports folder is the loop's audit trail.
- No spec file is edited by this loop — a spec problem is FAIL SPEC.
- Every `open` divergence row is either resolved with its `file:line`, or still named in the summary.
- The build order was followed: no client was written before its contract existed.
- A SUCCESS means the tree compiles, the suite collects, the static gate is clean and every `REQ-*` maps
  to code — not that the tests pass. That is [test-loop](../test-loop/SKILL.md)'s verdict.
