---
name: test-loop
description: 'Run the Testing pipeline to convergence for one feature: test-generator (write or update the suites) → run them → test-validator (isolated judgement of coverage and of what a failure means). Ends with a verified build and the coverage/traceability record under "500 Tests/Output/<feature>/". Use when: the implementation passed the static gate and must be exercised; the user says "test this", "keep fixing until the tests pass", or asks to resume after a FAIL. Owns the iteration counter and the stop conditions.'
argument-hint: 'Feature, optionally --max-iterations N, -k <selection expression>'
---

# Test Loop — stage 5 driver (`500 Tests`)

Drives **write → run → validate → fix** until `test-validator` returns SUCCESS or a stop condition fires.
This skill owns the loop; it is the only place an iteration counter exists.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md) and
[domain-invariants.md](../pipeline-conventions/references/domain-invariants.md).

## Artifact locations

| Role | Path |
|---|---|
| Sub-skill — generator | [test-generator](../test-generator/SKILL.md) |
| Sub-skill — validator | [test-validator](../test-validator/SKILL.md) |
| Input — criteria | `200 Requirements/230 Output/<feature>/` — the `AC-*` ids the run must cover |
| Input — test strategy | `300 Specs/330 D-Specs/Output/<feature>/test-strategy.md` |
| Input — contracts | `300 Specs/320 F-Specs/Output/<feature>/api/`, `screens/` |
| Input — implementation manifest | `400 Code/Output/<feature>/99-traceability.md` |
| Output — suites | `<tests>`, the web E2E tree, the mobile E2E tree |
| Output — record | `500 Tests/Output/<feature>/00-index.md`, `99-traceability.md` |
| Loop memory | `500 Tests/Output/<feature>/reports/test-validation/` |
| Back-channel to code | `400 Code/Output/<feature>/reports/feedback/` |
| Back-channel to specs | `300 Specs/320 F-Specs/Output/<feature>/reports/feedback/` |

Rules:

- One feature per run; ask if it is missing or ambiguous.
- If `400 Code/Output/<feature>/99-traceability.md` is absent, stop and send the user to
  [code-loop](../code-loop/SKILL.md).
- This loop writes tests. It **never edits `<source>`, `<web>`, `<migrations>` or `<mobile>`** —
  a code defect goes back to `code-loop` as a Testing Report.
- Never write under `400 Code/.github/`, `.claude/skills/` or `300 Specs/__old__Specs/`.

## Loop

Set `iteration = 1`, `MAX = 5` (override with `--max-iterations N`).

### 0. Pending feedback — before the counter starts

Collect the **cross-feature feedback** addressed to this feature (conventions §14), from

```
500 Tests/Output/<feature>/reports/feedbacks/<origin feature>/feedback-*.md
```

Pending = stamped **after** the newest test-validation report; anything older is history.
`pipeline_progress.py` prints the origins in its `feedback` column.

Hand every pending item to the generator in **one** Mode C round together with whatever else this run
is fixing — three items then cost one iteration, not three. A pending feedback never blocks this run:
it is a proposal this feature has not yet judged, and this feature's last SUCCESS stands until this
loop rules on it.

### 1. Resolve state

```powershell
python .claude/skills/pipeline-progress/scripts/pipeline_progress.py --feature <feature> --stage test --json
```

| State | Next action |
|---|---|
| No suites mapped to the feature's `AC-*` ids | test-generator **Mode A** |
| Suites exist, newest report is a FAIL with `TEST` defects | test-generator **Mode B** with that report |
| Suites exist, newest report is a FAIL with only `CODE` defects | stop: the fix belongs to [code-loop](../code-loop/SKILL.md). Emit the Testing Report and hand over |
| Suites exist, no report yet | go to step 2 |
| Newest report is SUCCESS | report already-verified and stop, unless asked to re-run |

### 2. Write or update the suites

Invoke `test-generator` in the mode selected. It writes only under `<tests>` and the E2E trees, and it
updates `500 Tests/Output/<feature>/99-traceability.md`.

### 3. Run

From the repository root, and **redirect to a file before filtering** — piping a long run into a filter
that stops early kills the run and leaves a truncated result that reads like a failure:

Run the suite command declared in `500 Tests/Input/`, writing its JUnit XML to
`500 Tests/Output/<feature>/reports/junit-latest.xml` and its output to a log file, then tail the log. Then
the web and mobile E2E commands declared in the same place, each captured the same way.

Confirm the run is fresh: the report timestamps must postdate the last source edit under
`<source>`, `<web>` and `<mobile>`. **A stale run reproduces the previous behaviour and invalidates
any before/after comparison.**

A test reported `skipped` is not a pass. If a skipped test covers an `AC-*`, that criterion is
**unverified** — resolve the skip or record it as an issue before declaring anything.

**Never read a run log into the context** (conventions §18). Reduce it:

```powershell
python .claude/skills/pipeline-progress/scripts/reduce_run.py --kind test "500 Tests/Output/<feature>/reports/<log>"
```

It prints the run's own totals, the ids on the failing lines, and one bounded excerpt per distinct
failure shape, with anything that looks like a real record masked. **That summary is the evidence.**
Not `Get-Content`, not `cat`, not a grep that returns bodies — a 40k-line failing run must cost what a
400-line one costs, the reduction must give the same answer twice, and these suites touch real data.
If the reduction does not answer the question, that is the *Evidence would not fit bounded* stop
condition: say what you would need, and stop.

### 3b. Deterministic gate

```powershell
python .claude/skills/pipeline-progress/scripts/lint_artifacts.py --stage test --feature <feature> --emit
```

Settles the stage record — front matter, `TEST-`/`CHK-` id format and uniqueness, the required files,
and the regenerated `00-index.md` and `99-traceability.md` (conventions §13). The validator never
re-judges any of it. Any `error` → `ISSUE-<nn>`, Mode B, `iteration++`, back to step 2, without
spending a semantic pass.

### 4. Validate

Invoke `test-validator` on the feature **in a subagent** with a fresh context, passing the feature, the criteria
list, the run artifacts and the manifest — never the generator's reasoning. It writes
`reports/test-validation/test-validation-<YYYYMMDD-HHmm>.md` and classifies every failure.

- `SUCCESS` → stop and emit the summary. The build is verified and ready for
  [deploy-loop](../deploy-loop/SKILL.md).
- `FAIL TEST` → the defect is in a test. `iteration++`, return to step 1 (Mode B).
- `FAIL CODE` → the defect is in the implementation. Stop; the Testing Report goes to
  [code-loop](../code-loop/SKILL.md) as a Mode C input. **This loop never fixes source.**
- `FAIL SPEC` → the specification is wrong, ambiguous or contradictory, and both the code and the test
  are faithful to it. Stop; the feedback report goes back to [fspec-loop](../fspec-loop/SKILL.md).

## Stop conditions

The shared list in
[pipeline-conventions §11](../pipeline-conventions/SKILL.md), plus:

| Condition | Detection |
|---|---|
| FAIL CODE | The verdict names an implementation defect — this loop hands over, it does not fix |
| FAIL SPEC | Both sides are faithful to a specification that cannot be satisfied as written |
| Check deletion proposed | The only way to clear a failure would be to delete a check, weaken an assertion, mark a test `xfail`, or narrow a check to the input that already passes. A check is removed only with explicit human approval, logged in `98-divergences.md` (I9) |
| Criterion unreachable | An `AC-*` cannot be exercised through fixtures, seeded state and the public contract. Never add a test-only setting, endpoint or hook to reach it — raise it to [dspec-loop](../dspec-loop/SKILL.md) |
| Flaky check | The same check passes and fails across runs with no source change. A flaky check is a defect of the check, not evidence about the code: fix it or quarantine it with an issue, never re-run until it is green |
| Fixture needs real data | A test would need real production data, real credentials or a live external endpoint. Ask; never inline any of them |

## Quality rules (self-check)

- The iteration counter exists only here.
- Every run writes a report; the reports folder is the loop's audit trail.
- No source file outside `<tests>` and the E2E trees was edited.
- Every `AC-*` of the feature is covered by at least one check, and no criterion is covered only by a skipped
  one.
- A green run over a stale binary or a stale build is not a SUCCESS.
- The loop converges by fixing tests and reporting code defects — never by lowering what a check demands.
