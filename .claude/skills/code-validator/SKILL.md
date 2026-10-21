---
name: code-validator
description: 'Static gate between implementation and testing. Validates the code written for a feature against its validated design and API contracts and against the project directives of the stage: layering, primary-context discipline, contract fidelity, security, idempotency, migration reversibility, scope discipline and traceability. Use when: code-generator finished and the change must be checked before the tests run; the user asks to review or audit an implementation. Emits SUCCESS or FAIL with a machine-consumable Code Validation Report. Runs isolated, executes no test suite, and fixes nothing.'
argument-hint: 'Feature; optionally a subset of files or requirement ids'
---

# Code Validator — static gate (`400 Code`)

Judges the implementation against the specification, statically. It does not run the test suite — that is
[test-loop](../test-loop/SKILL.md)'s job, and a validator that waits for tests to fail has added no
independent signal.

Binary result: **SUCCESS** (go to `500 Tests`) or **FAIL**.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md),
[domain-invariants.md](../pipeline-conventions/references/domain-invariants.md).

## Artifact locations

| Role | Path |
|---|---|
| Reference — design | `300 Specs/330 D-Specs/Output/<feature>/` (`status: validated`) |
| Reference — contracts | `300 Specs/320 F-Specs/Output/<feature>/api/`, `screens/`, `rules/` |
| Reference — manifest | `400 Code/Output/<feature>/99-traceability.md`, `98-divergences.md` |
| Under validation | The files the manifest names, in `<source>`, `<web>`, `<migrations>`, `<mobile>` |
| Emitted | `400 Code/Output/<feature>/reports/code-validation/code-validation-<YYYYMMDD-HHmm>.md` |

Rules: one feature per run; **write nothing but the report**; the generator's reasoning is not an input; the
manifest is a claim to be verified, never a summary to be trusted.

## Checks

### C1 — Manifest fidelity

- Every row of `99-traceability.md` points at a **file and symbol that exist** (`error` on a dangling
  row — an unverified manifest is worse than none, because the absence looks like coverage).
- Every `REQ-*` of the design has a row (`error` when uncovered).
- Every file the change touched appears in the manifest (`error` on an unrecorded change — that is how
  scope creep hides).
- `00-index.md` matches the manifest.

### C2 — Design fidelity

- Every design item is realized at the **module path the design names** (`error` on a different
  placement with no `FEEDBACK-<nn>` explaining it).
- Every implemented signature matches the design's interface: name, parameters, units, return shape,
  errors raised (`error` on a mismatch).
- A behaviour implemented that no design item describes is an `error` — either the design is missing it
  (feedback) or it is scope creep (I10).

### C3 — Contract fidelity

- Every endpoint's method, path, auth, request fields, response fields and error statuses match the
  `API-*` contract **field for field** (`error` on any difference, including a field present in the code
  and absent from the contract).
- Request and response schemas carry the contract's units in their field names; a numeric field with no unit suffix
  is an `error`.
- Every check the project's directives in `<stage-input>/` add to this block, at the severity they
  declare, citing the directive id.
- Every retired field, path or key is actually rejected, with a message naming a replacement that exists
  in the code (`error` — I3).
- No existing field's unit, meaning or domain was redefined under the same name (`error`).

### C4 — Layering

- The layer map in `<stage-input>/` is enforced literally: any backward call, skipped layer, or data
  access outside the layer the map assigns it is an `error`.
- No domain decision sits in a layer the map forbids it in (`error`).
- New modules sit in the layer the design assigns them (`error`).

### C5 — Security

- Every route the contract marks authenticated verifies the session, and checks the RBAC role the
  contract names, at the point the design named (`error` on a missing or misplaced check; a check that
  permits **more** than the contract is the more dangerous direction and is still an `error`).
- The webhook verifies its signature before any read that can change state (`error` — I6).
- No secret, credential, token or API key literal appears in any tracked file (`blocker`). Configuration
  comes from the environment.
- No log statement records any content class `<stage-input>/` marks unloggable (`error`).
- Every boundary input is validated for type, range and size; every query is parameterized; every
  redirect and outbound URL is constrained (`error` — OWASP Top 10).
- Mobile: the at-rest and session-expiry rules of `<stage-input>/` hold (`error` when either is absent
  for a feature with `mobile` in scope).

### C6 — Idempotency and failure

- Every domain write implements the dedupe key and uniqueness constraint the design named, and a second
  arrival is provably harmless (`error` when it is not).
- Every state transition absorbs a retry without double-advancing its sequence counter (`error`).
- Every path the design gave a failure behaviour implements it (`error` when a failure is swallowed
  silently).
- No `except:` or `except Exception:` that hides a failure without re-raising, logging an identifier, or
  returning a specified error (`error`).

### C7 — Data and migrations

- Every schema change has a revision under `<migrations>`, with its parent revision set
  correctly and an implemented `downgrade()` (`error` on a `pass` downgrade unless the design states the
  change is additive-only and explains why).
- The models match the `DM-*` tables: columns, types, nullability, defaults, indexes, uniqueness
  (`error` on a mismatch).
- Backfills are idempotent, restartable and batched (`error`).
- No model or schema change exists that no `DM-*` designs (`error` — I5).

### C8 — Dead configuration

- Every setting the change declares is **read at a site that changes behaviour** (`error` on a
  declared-but-dead setting: it lets an operator configure a mechanism, obtain a plausible result, and
  conclude it was exercised).
- Every mechanism the design says is unimplemented is **rejected** when configured, not accepted and
  ignored (`error`).
- Every new setting defaults to no change, and a new feature's master flag defaults off (`error` — I4).

### C9 — Scope and hygiene

- Only files the design names were touched (`error` on an unrequested refactor, rename, removal,
  reformat or dependency change — I10).
- No commented-out code, no debug print, no `TODO` without an `OPEN-<nn>` in a spec (`warning` each;
  `error` for a debug print on a domain path).
- No comment restating the line below it; no docstring added to code this change did not touch
  (`warning`).
- The web change preserves the existing polling, navigation and SPA model unless a requirement changes it
  (`error` — I8).

### C10 — Divergences

- Every `98-divergences.md` row marked `resolved` names the `file:line` that resolves it, **and that code
  exists and does what the row required** (`error` otherwise — a divergence closed on paper is a
  requirement quietly dropped).
- Every row still `open` is listed in the report.

## Verdict

Any `blocker` or `error` → **FAIL**. Otherwise **SUCCESS**.

This skill sets no `status:` field. The implementation's status is decided by the tests.

## Procedure

1. Resolve the feature; confirm the design is `status: validated` and the manifest exists (`blocker`
   otherwise).
2. Read the manifest and build the change set. **Verify every row against the tree in one batched pass**
   before judging anything — a check that skipped a file reads as a pass, which is worse than no check.
3. Read the design and the contracts once; keep the `REQ-*` map open.
4. Run C1–C10 over the change set. Record every finding with severity, check, `file:line`, finding and
   expected.
5. Write the report. Never edit code, a spec, or the manifest.
6. Announce the verdict and return to [code-loop](../code-loop/SKILL.md).

## Report format

Front matter as in
[pipeline-conventions §3](../pipeline-conventions/SKILL.md), plus
`files_examined: N`, then:

- `## Summary` — two lines.
- `## Issues` — one `ISSUE-<nn>` block each: severity, check, file, location, finding, expected.
- `## Divergences` — open rows and any resolved row whose code could not be verified.
- `## Coverage` — requirements with code, requirements without, files changed but unrecorded.

`files_examined` is part of the verdict's credibility: a run reporting zero issues over zero files is a
FAIL of the tooling, not a SUCCESS of the code.

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
