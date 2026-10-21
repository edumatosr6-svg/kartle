---
name: test-generator
description: 'Write or update the test suites for a feature from its acceptance criteria and test strategy: unit, integration and API-contract tests under the test root, web end-to-end tests, and mobile end-to-end tests. Also maintains the criterion-to-check traceability under "500 Tests/Output/<feature>/". Use when: starting the tests of a feature; fixing them after a FAIL TEST verdict; adding a regression check for a diagnosed defect. Never edits application source.'
argument-hint: 'Feature, and/or the path to a testing or diagnosis report'
---

# Test Generator — stage 5 (`500 Tests`)

Writes the evidence. A behaviour with no check is unverified, whatever the code looks like — and a check
that cannot fail is worse than no check, because the green reads as proof.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md),
[domain-invariants.md](../pipeline-conventions/references/domain-invariants.md).

## Source authority

The **acceptance criteria** are the authority; the test strategy says at which level each is reached.

- A check exists to decide an `AC-*`. One that decides none is a `warning` at best and usually a
  tautology.
- The implementation is **not** the authority. Never write a check by reading what the code does and
  asserting it — that is a change detector, not a test, and it passes forever including when the
  behaviour is wrong.
- A check that fails against the current implementation is **not a defect of the check** if it is
  correctly derived from its criterion and judges an observable artifact. That is a code defect, reported
  as such.

## Artifact locations

| Role | Path |
|---|---|
| Input — criteria | `200 Requirements/230 Output/<feature>/stories/`, `nfr/` |
| Input — strategy | `300 Specs/330 D-Specs/Output/<feature>/test-strategy.md` |
| Input — contracts | `300 Specs/320 F-Specs/Output/<feature>/api/`, `screens/`, `rules/` |
| Input — manifest | `400 Code/Output/<feature>/99-traceability.md` |
| Input — existing suite | the test root and its fixtures, under the code root |
| Input — suite conventions | `500 Tests/Input/` — runner, file naming, fixtures, E2E trees |
| Output — suites | `<tests>`, following the naming `500 Tests/Input/` declares |
| Output — E2E | the web and mobile E2E trees named in `500 Tests/Input/` |
| Output — record | `500 Tests/Output/<feature>/00-index.md`, `99-traceability.md`, `98-divergences.md` |

**Never edit `<source>`, `<web>`, `<migrations>` or `<mobile>`.** A code defect is reported, not
patched.

## Modes

| Mode | Trigger | Behaviour |
|---|---|---|
| **A** | No suites for the feature | Write the full set, one file per area, following the strategy |
| **B** | A FAIL TEST verdict | Fix only the checks the report names |
| **C** | A Root Cause Report | Add the regression check that would have caught the defect, named after the finding |

## Conventions

Follow the suite that exists — it is the house style and diverging from it costs more than it gains:

- The runner, file naming and function naming `500 Tests/Input/` declares.
- Fixtures live where `500 Tests/Input/` puts them; a fixture used by one file stays in that file.
- One check per test function. A test asserting three unrelated things reports one failure for three
  causes and makes the next diagnosis harder.
- The test name says the behaviour, not the mechanism: `test_duplicate_webhook_does_not_advance_state`,
  not `test_processor_branch_3`.
- Every test carries a one-line docstring naming the `AC-*` it decides.

## Check policy

1. **Judge observable artifacts only** — an HTTP response, a stored row read back through the repository,
   a rendered screen state, a delivered message, a log line. A check that reaches into a private function
   to assert an internal call is an `error`: it pins the implementation, so it breaks on every refactor
   and proves nothing about the behaviour.
2. **Every check states its exact failure message**, beginning with the criterion it decides:
   `assert ..., "AC-US-0004-02: timeline entry not visible within 5 s"`. A bare `assert x == y` in a
   domain path is a defect of the check.
3. **No float equality.** Compare with an explicit tolerance or restate in integer units — precision error
   makes `==` unreliable and the resulting flake is diagnosed as a code bug for weeks.
4. **No test-only surface.** A check never needs a setting, endpoint or hook that exists only for it.
   Reach the behaviour through fixtures, seeded data and the public contract. An unreachable criterion is
   raised to [dspec-loop](../dspec-loop/SKILL.md), never paid for with a new key.
5. **No real data.** No real production identifier, no real phone number, no real credential, no
   production token — in the test, in a fixture, in a recorded response or in a snapshot.
6. **Deterministic.** No dependence on wall-clock time, on ordering the code does not guarantee, on
   network access, or on a previous test's residue. Time is injected or frozen; randomness is seeded.
7. **The check must be able to fail.** Before accepting a new check, state in one line what change to the
   code would make it fail. If nothing would, it is a tautology and does not count as coverage.
8. **Idempotency gets its own check.** Every domain write and every state transition the feature touches
   gets a check that submits the same event twice and asserts the state advanced once.
9. **Security gets its own checks.** Every endpoint the contract marks authenticated gets a check for
   unauthenticated access and a check for each role that must be refused (I6). A webhook path gets a check
   for an invalid signature.
10. **A regression check is named after its defect.** In Mode C:
    `test_regression_<finding-id>_<short_name>`, with the Root Cause Report cited in the docstring.

## Levels

| Level | Where | Judges |
|---|---|---|
| Unit | `<tests>`, unit naming | A rule, an engine, a state machine, in isolation |
| Integration | `<tests>`, integration naming | A flow across layers, with the real data layer and a test database |
| API contract | `<tests>`, contract naming | The contract field for field: status codes, shapes, error surface, auth and roles |
| Web E2E | web E2E tree | A screen's states and its navigation |
| Mobile E2E | mobile E2E tree | The app's states, offline behaviour and token lifecycle |

A domain rule verified only at E2E level is under-tested: the failure will be reported far from its
cause. Put the rule's own check at unit level and let E2E prove it is wired up.

## Traceability

`500 Tests/Output/<feature>/99-traceability.md`: one row per `AC-*`, naming the check(s) that decide it, the
level, and the file and function. **Both ways** — every criterion has a row, and every check traces to a
criterion. A criterion whose only check is skipped is recorded as **unverified**, not as covered.

Where a criterion is deliberately not covered, `98-divergences.md` carries the row with its reason and the
approval that allowed it (I9). Silence is the defect, not the decision.

## Procedure

1. Read the criteria and the test strategy. Build the `AC-*` list — it is the closure check for step 6.
2. Read the existing suite for the areas involved, so new checks match the house conventions and no
   existing check is duplicated under a new name.
3. Write the checks, level by level, starting with unit.
4. For each new check, state to yourself what change would make it fail. Discard the ones where nothing
   would.
5. Run the suite once locally to confirm the new checks execute and that a failure is reported with the
   message you wrote.
6. Write `99-traceability.md` and `00-index.md`; record any uncovered criterion.
7. Report what was written and hand back to [test-loop](../test-loop/SKILL.md). Never invoke
   `test-validator`, and never fix application source.

## No check is ever lost

When a suite is regenerated — a new Mode A round, a restructured file, a renamed module — **every check
that already exists migrates under its own `CHK-<TEST id>-<nn>` id.** This is the one regeneration rule
with teeth, because its failure mode is silent: coverage falls and the run still reports SUCCESS.

Before writing, inventory what is there: every `CHK-*` id currently in `<tests>` and in the E2E trees,
and every id in `99-traceability.md`. After writing, account for each one — carried, renamed, merged or
removed:

| Outcome | What it requires |
|---|---|
| carried | nothing; the id is unchanged and still exercises the same criterion |
| modified | a **Migration** row in `97-changelog.md`: the id, what changed about the check, and why the criterion is still covered |
| merged | a Migration row naming both old ids and the surviving one |
| **removed** | **explicit human approval**, logged in `97-changelog.md` with the approver and the date, plus a `divergence` row if the criterion it covered is now unverified |

A check removed because it fails is not a repair — it is the *Check deletion proposed* stop condition of
[test-loop](../test-loop/SKILL.md). Narrowing a check to the input that already passes, marking it
`xfail`, or scoping it to the half of the behaviour that works are the same move under other names.

## Bindings — stated in [pipeline-conventions](../pipeline-conventions/SKILL.md), not restated here

- **Frozen surface on a fix round** (§16). Mode B clears the issues in a report and **adds no**
  requirement, listing, key, parameter, endpoint, field, screen or interface element the failing
  artifact did not already carry. A validator's rubric rewards completeness and will pull the artifact
  past what the seed asked for. A need for new surface is not a fix: it goes to the feature's
  `SCOPE-BACKLOG.md` for its author, and the run stops on *Surface unfrozen on a fix round*.
  Mode A and Mode C may add surface — each has an upstream item authorising it.
- **Derived files are never written here** (§13). `00-index.md` and `99-traceability.md` are generated
  by `lint_artifacts.py --emit` from the artifacts themselves. Write the artifacts; refer to a table in
  prose and never enumerate it. Hand-writing a derived file restores the pipeline's largest class of
  finding — one fact in four places, one of them stale.
- **The changelog** (§17): append one dated entry per round to `97-changelog.md` — what changed, which
  `ISSUE-<nn>`/`FB-<nn>` items it closed, and **every item declined, with its reason**. Silence reads as
  agreement, and the item returns next round as a new finding.
- **The write fence** (§14): everything this run writes lives under this feature's stage output. A
  change another feature needs is a feedback, written to that feature's `reports/feedbacks/<this feature>/`
  — it proposes and changes nothing.
- **Phase input boundaries** (§12): read only this stage's closed input list. Reaching back past the
  upstream artifact for a constraint it failed to state destroys the evidence that it was incomplete —
  that gap must surface as a finding, not be silently filled in.

## Quality rules (self-check)

- Every `AC-*` has at least one check that can decide it; none is covered only by a skipped test.
- Every check judges an observable artifact and carries a failure message naming its criterion.
- No float equality, no wall-clock dependence, no network, no cross-test residue.
- Every domain write has a duplicate-submission check; every authenticated endpoint has an
  unauthenticated and a wrong-role check.
- No test-only setting, endpoint or hook was added anywhere.
- No real production data, phone number or credential appears in any file.
- No application source was edited.
