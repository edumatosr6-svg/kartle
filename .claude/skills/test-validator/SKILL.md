---
name: test-validator
description: 'Judge a test run for a feature: whether every acceptance criterion is really covered, whether the checks can fail, whether the run was fresh, and — for each failure — whether the defect is in the test, the code or the specification. Use when: the suites ran and the result must be turned into a verdict; the user asks whether a feature is really verified. Emits SUCCESS, FAIL TEST, FAIL CODE or FAIL SPEC with a machine-consumable Testing Report. Runs isolated, fixes nothing, and never edits a test or a source file.'
argument-hint: 'Feature; optionally the path to the run artifacts'
---

# Test Validator — the verdict on the evidence (`500 Tests`)

Two questions, in this order:

1. **Is the run trustworthy?** — fresh binaries, nothing skipped that matters, no flake, coverage that is
   real rather than tautological.
2. **What does each failure mean?** — a defect of the test, of the code, or of the specification.

A validator that only reports "3 failed" has done neither. The classification is the product.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md),
[domain-invariants.md](../pipeline-conventions/references/domain-invariants.md).

## Artifact locations

| Role | Path |
|---|---|
| Reference — criteria | `200 Requirements/230 Output/<feature>/` |
| Reference — strategy | `300 Specs/330 D-Specs/Output/<feature>/test-strategy.md` |
| Reference — contracts | `300 Specs/320 F-Specs/Output/<feature>/api/` |
| Reference — implementation manifest | `400 Code/Output/<feature>/99-traceability.md` |
| Under validation | `<tests>`, the E2E trees, and `500 Tests/Output/<feature>/99-traceability.md` |
| Run artifacts | `500 Tests/Output/<feature>/reports/junit-latest.xml`, the captured run logs |
| Emitted — verdict | `500 Tests/Output/<feature>/reports/test-validation/test-validation-<YYYYMMDD-HHmm>.md` |
| Emitted — FAIL CODE | `400 Code/Output/<feature>/reports/feedback/testing-report-<YYYYMMDD-HHmm>.md` |
| Emitted — FAIL SPEC | `300 Specs/320 F-Specs/Output/<feature>/reports/feedback/feedback-<YYYYMMDD-HHmm>.md` |

Rules: one feature per run; **write only reports**; the generator's reasoning is not an input; never re-run
a failing check hoping for green.

## Checks

### T1 — Run integrity

- The run artifacts postdate the last edit under `<source>`, `<web>`, `<migrations>` and `<mobile>`
  (`blocker` on a stale run — it reproduces the previous behaviour and invalidates any comparison).
- The run collected and executed a non-zero number of tests, and the count matches the suite
  (`blocker` on a run that examined nothing — the absence looks like success).
- Every configured level ran: the backend suite, web E2E, mobile E2E for a feature with those channels in scope
  (`error` on a level that was silently not executed).
- No check both passed and failed across the run history with no source change between (`error` —
  flake; it is a defect of the check, not evidence about the code).

### T2 — Coverage, both ways

- Every `AC-*` of the feature maps to at least one check in
  `500 Tests/Output/<feature>/99-traceability.md` (`error` when uncovered).
- Every row points at a **test function that exists and executed** (`error` on a dangling or
  never-collected row).
- A criterion whose only check was **skipped** is `unverified` and is an `error` — a skip is not a pass.
- Every check traces to a criterion (`warning` on an untraced check; it may be legitimate regression
  coverage, and then it cites its finding id).
- Every level the strategy assigns to a `FEAT-*` actually has checks at that level (`error`).

### T3 — Check quality

- Every check judges an observable artifact. One that asserts an internal call or reaches into a private
  symbol is an `error` (I9 — it pins the implementation and proves nothing about the behaviour).
- Every check carries a failure message naming the criterion it decides (`error` on a bare assert in a
  domain path).
- No float equality (`error`).
- No dependence on wall-clock time, network access, test ordering or another test's residue (`error`).
- **Tautology check**: for each check, state what change to the code would make it fail. A check where
  nothing would is an `error` and does not count as coverage. Sample deliberately — the checks that
  passed on the first run they were written are the likely tautologies.
- Every domain write has a duplicate-submission check; every authenticated endpoint has an
  unauthenticated check and a wrong-role check; every webhook path has an invalid-signature check
  (`error` when missing — I6, I7).
- No test-only setting, endpoint or hook exists to make a check possible (`error`).
- No real production identifier, phone number, credential or token appears anywhere in the suite
  (`blocker`).

### T4 — Failure classification

For every failing check, correlate the assertion with the contract, the criterion and the code the
manifest names, then place it in exactly one bucket:

| Bucket | Meaning | Verdict |
|---|---|---|
| The code's behaviour deviates from the criterion the check decides | code defect | **FAIL CODE** |
| The check contradicts its criterion, its contract, or the specification | test defect | **FAIL TEST** |
| The check is flaky, order-dependent, or asserts an internal | test defect | **FAIL TEST** |
| The specification is wrong, ambiguous or contradictory, and both the code and the check are faithful to it | spec defect | **FAIL SPEC** |
| A criterion cannot be exercised through fixtures, seeded state and the public contract | spec/design defect | **FAIL SPEC** — report it; never ask for a test-only surface |
| All checks pass, every criterion exercised, no skip covering a criterion | done | **SUCCESS** |

**Treat a check as a specification until it is proven wrong.** A check that models a real constraint —
a processing delay, an ordering guarantee, a rate limit — is not relaxed because a change happened to
break it. That is the regression it exists to catch.

A check that fails because the specification and the tree disagree is **FAIL CODE**: the specification
carries the authority (see the divergence rule).

### T5 — Domain compliance of the evidence

- The idempotency checks actually submit the same event twice and assert the state advanced once
  (`error` on a check that merely calls the function twice with different data).
- The RBAC checks cover every role the contract names, in both directions — permitted and refused
  (`error`).
- The migration, if the feature has one, is exercised **up and down** on a scratch database (`error` when
  the downgrade is never run — an untested downgrade is not a rollback path).
- Where the feature has `mobile` in scope, offline behaviour and token-refresh failure each have a check
  (`error`).

## Verdict

- Any `blocker` → **FAIL** with the blocker named; the run is not judgeable.
- Any failing check classified as a test defect → **FAIL TEST**.
- Any failing check classified as a code defect → **FAIL CODE** (a run with both is FAIL CODE; the test
  defects are listed and fixed on the way).
- Any spec defect → **FAIL SPEC**.
- Otherwise → **SUCCESS**.

## Procedure

1. Resolve the feature; confirm the run artifacts and the manifest exist.
2. Run T1 first. A stale or empty run is a `blocker` — stop there rather than classifying failures from
   a run that means nothing.
3. Build the `AC-*` list and the traceability rows once; run T2 in both directions.
4. Run T3 over the checks the feature added or changed, sampling the tautology test deliberately.
5. Classify every failure under T4, citing the contract clause or criterion that decides the bucket.
6. Run T5.
7. Write the verdict report. On FAIL CODE also write the Testing Report to
   `400 Code/Output/<feature>/reports/feedback/`; on FAIL SPEC also write the feedback report to
   `300 Specs/320 F-Specs/Output/<feature>/reports/feedback/`. Fix nothing.
8. Announce the verdict and return to [test-loop](../test-loop/SKILL.md).

## Report format

```markdown
---
stage: test
feature: <feature>
verdict: SUCCESS | FAIL TEST | FAIL CODE | FAIL SPEC
generated: <YYYY-MM-DDTHH:mm:ssZ>
run: {collected: N, passed: N, failed: N, skipped: N, fresh: true}
counts: {blocker: 0, error: 0, warning: 0, info: 0, divergence: 0}
seed: {revision: N, digest: <sha1-12>}
---

## Verification status
<The answer the loop exists for, before any failure list:
 criteria verified: N · unverified: M (each named, with why) · covered only by a skip: K.>

## Failures
### FAIL-01
- check: <tests>/test_inbound.py::test_duplicate_event_does_not_advance_state
- decides: AC-US-0007-03
- bucket: CODE
- evidence: second POST advanced the sequence counter 4 → 5; <source>/orchestration/event_handler.py:212 writes
  before the dedupe lookup
- owed by: code-loop

## Issues
<Non-failure findings: coverage gaps, tautologies, flakes, quality violations.>

## Divergences
<Criteria deliberately uncovered, with the approval that allowed it.>
```

The **Verification status** section comes before the failure list on purpose: a failure count is not the
answer to "is this feature verified", and putting it first has repeatedly let a green-looking run with
four unverified criteria pass as done.

## Check attrition — verify it, every run

Compare the `CHK-*` ids exercised by this run against those in the **previous** run's record. Any id
present before and absent now must be accounted for in `97-changelog.md`:

- a **Migration** row explaining a rename or a merge → acceptable;
- a logged **human approval** for a removal → acceptable;
- neither → `error`, whatever the run's verdict would otherwise be. Coverage fell silently, which is the
  one way this stage can report SUCCESS while knowing less than it did last time.

Count it explicitly in the report's front matter: `checks: {before: N, after: M, migrated: X, removed: Y}`.

## Bindings — stated in [pipeline-conventions](../pipeline-conventions/SKILL.md), not restated here

- **The rubric above is closed** (§8). The checks are the whole list; a finding that no numbered check
  produced is not reported. A check the rubric genuinely lacks is added to *this skill*, deliberately —
  never improvised inside a run, which turns the report into a sample of an unbounded reading instead
  of a backlog that shrinks.
- **The mechanical layer is already decided** (§13). `lint_artifacts.py` ran before this skill and
  settled front matter, id format and uniqueness, filename agreement, index agreement, traceability
  resolution and the required files. **Never re-judge any of it.**
- **On a re-validation the population is fixed** (§8): every issue of the previous report first, then
  every file whose `version:` moved, then **two** untouched files sampled at random. Widening it
  mid-loop breaks the *No progress* comparison this run is about to be judged by.
- **Report discipline** (§19): front matter, title, entries. No introduction, no narrative of the pass,
  no list of what was found sound, no closing summary. Each entry is fields only, one line per field.
- **Cross-feature findings become feedback, never an edit** (§14). A finding whose fix belongs to
  another feature is written to `<stage-output>/<target feature>/reports/feedbacks/<this feature>/feedback-<stamp>.md`
  as `FB-<nn>`, with `origin:`, `target:` and `origin-stage:`. At a spec stage it is a `scope` item that
  does **not** enter this verdict, so this feature can still reach SUCCESS. Name every feedback sent in
  the report's front matter.
- **Bounded evidence** (§18): never read a run log, result set or dataset into the context. Reduce it
  with `reduce_run.py` and treat that summary as the evidence.
