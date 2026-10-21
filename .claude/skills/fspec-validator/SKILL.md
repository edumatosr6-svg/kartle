---
name: fspec-validator
description: 'Validate the functional specification under "300 Specs/320 F-Specs/Output/<feature>/" against the validated requisites under "200 Requirements/230 Output/<feature>/". Covers feature specs, flows, API contracts, screens and rules. Use when: the FSpec was just generated or updated and must be checked before DSpec; the user asks to review or audit the functional specification. Emits SUCCESS or FAIL with a machine-consumable FSpec Validation Report. Runs isolated and fixes nothing.'
argument-hint: 'Feature; optionally a subset of feature or contract ids'
---

# FSpec Validator — gate between requisites and design

Checks the functional specification for coverage, consistency, contract discipline, testability and
domain compliance. Binary result: **SUCCESS** (go to `300 Specs/330 D-Specs`) or **FAIL**.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md),
[domain-invariants.md](../pipeline-conventions/references/domain-invariants.md).

## Artifact locations

| Role | Path |
|---|---|
| Reference — requisites | `200 Requirements/230 Output/<feature>/` (authority for coverage, check F4) |
| Reference — seed | `200 Requirements/220 Input/<feature>/SEED.md` (scope and constraints) |
| Reference — conventions | `300 Specs/320 F-Specs/Input/` |
| Reference — existing contracts | the route and schema definitions in `<source>` — names only, never behaviour |
| Under validation | `300 Specs/320 F-Specs/Output/<feature>/` |
| Emitted | `300 Specs/320 F-Specs/Output/<feature>/reports/fspec-validation/fspec-validation-<YYYYMMDD-HHmm>.md` |

Rules: one feature per run; write nothing but `status:` inside `300 Specs/320 F-Specs/Output/<feature>/`, and only on
SUCCESS; the generator's reasoning is not an input.

## Checks

### F1 — Structure and format

- Required files exist: `00-index.md`, `01-overview.md`, `02-glossary.md`, `99-traceability.md`, at least
  one `features/FEAT-*.md`.
- Front matter valid on every file, `stage: fspec`, `feature:` equals the folder, `id` matches the filename,
  ids unique across the set and never reused.
- `00-index.md` matches the files on disk with correct versions.
- Every mermaid block is syntactically valid; every relative link resolves.

### F2 — Requirement quality

- Every requirement matches `REQ-<FEAT id>-<nn>:` and uses exactly one of SHALL / SHOULD / MAY.
- Atomic (one behaviour), unambiguous (no "etc.", "as appropriate", "fast", "properly"), testable (an
  observable pass/fail can be stated).
- Every feature file has at least one acceptance criterion, and every SHALL is covered by at least one.
- Every SHALL cites the `AC-*` it realizes or is tagged `[DOMAIN]` (`error` when it cites neither).

### F3 — Cross-file consistency

- Every state, message and timer used in `flows/` is defined in `features/` or `rules/`, and vice versa —
  an orphan definition is a `warning`, an undefined use is an `error`.
- Terminology matches `02-glossary.md`; the same concept is not named two ways.
- Flows and state models do not contradict each other — a flow sending from a state the model cannot
  reach is an `error`.
- Every configuration setting referenced in a behaviour section exists in that feature's Configuration
  table.

### F4 — Coverage of the requisites, both ways

- Every `AC-*` of the requisites is realized by at least one `REQ-*` (`error` when uncovered).
- Every `REQ-*` traces to an `AC-*`, a cited requisites item, or an explicit `[DOMAIN]` necessity
  (`error` on an invented requirement — it belongs in `OPEN-<nn>`).
- Every NFR of the requisites is either realized by a requirement or explicitly deferred to `300 Specs/330 D-Specs`
  with the one-line reason (`error` when silently dropped).
- The out-of-scope list of `01-overview.md` covers everything the FSpec deliberately skips and matches the
  requisites'.
- `99-traceability.md` is complete and consistent both ways.

### F5 — API contract discipline

Against the strict-contract policy of [fspec-generator](../fspec-generator/SKILL.md):

- At least one `api/API-*.md` exists when the feature has any client channel (`error` otherwise — the code
  stage would have nothing to build against).
- Field names are flat `snake_case`; every numeric field carries a unit suffix (`error` on a bare numeric
  name); a unit differing from the source's unit without the row saying so is an `error`.
- Every domain endpoint uses the prefix and primary key `<stage-input>/` names (`error`).
- Every field states required-or-optional and its default; every default is stated to leave existing
  behaviour unchanged (`error` — I4).
- Every retirement names a replacement **specified in this set** (`error` when it names one that exists
  nowhere); a split that does not retire the key it supersedes is an `error`.
- No existing field's unit, meaning or domain is redefined under the same name (`error` — I3).
- Every endpoint names its auth and its RBAC role set, or states why it is public (`error`).
- Every endpoint states its full error surface (`error` when only the happy path is specified).
- Every state-changing endpoint states its idempotency and key (`error` — I7).
- A mobile-only endpoint duplicating a web one, with no stated reason, is an `error` (I8).
- No configuration setting exists to script an event, inject state, or enable a debug path (`error` — the
  behaviour it would reach is an `OPEN-<nn>`).

### F6 — Screens and channels

- A `screens/SCR-*.md` exists for every screen the requisites imply, when `web` or `mobile` is in scope
  (`error` otherwise).
- Every screen specifies loading, empty, populated, error and permission-denied states; a mobile screen
  also specifies **offline** (`error` when a state is missing).
- Every screen names the API calls each state makes, and each resolves to a contract in `api/` (`error`).
- Where a criterion is channel-explicit, both channels are specified (`error` when one is silent).

### F7 — Domain and state correctness

- Every domain rule cites the source `<stage-input>/` requires (`error` when a threshold or branch appears
  uncited — this stage may not invent one).
- Every state model states which transitions are idempotent under retry and which carry a
  a sequence counter (`error` when silent).
- Every flow consuming an inbound external event states where deduplication happens (`error`).
- No domain decision is placed in a layer the layer map forbids it in (`error`).

### F8 — Directive compliance and leakage

- No requirement implies a component carrying a rule the layer map places elsewhere, or a layer skipped
  (`error`).
- A requirement implying a schema change says so explicitly and states that a reversible migration is
  required (`error` when it changes data shape silently).
- Nothing anywhere is a secret, a credential, or real production data of a class `<stage-input>/` marks
  protected (`blocker`); every authenticated surface names its roles; a logging requirement that would
  record a content class marked unloggable is an `error`.
- Every further check the directives in `<stage-input>/` add, at the severity they declare.
- **Design leakage** — a table, column, module, class, library or framework named anywhere is an `error`,
  unless quoted from the seed's `Constraints` with the seed cited.
- **I10** — a requirement asking for a refactor, rename or removal the requisites do not request is an
  `error`.

### F9 — Openness

- No `OPEN-<nn>` and no `TBD` remains (`blocker` each).
- Every `98-divergences.md` row is well-formed and carries a state.

## Verdict

Any `blocker` or `error` → **FAIL**. Otherwise **SUCCESS**, and `status: validated` is set on every file.

Divergences never contribute. A set with thirty divergences and no error is a SUCCESS.

## Procedure

1. Resolve the feature; confirm both folders exist and the requisites are `status: validated` (`blocker`
   otherwise). Stamp the report with the seed line:

   ```powershell
   python .claude/skills/pipeline-progress/scripts/pipeline_progress.py --seed-line <feature>
   ```

2. Run F1 mechanically over every file first.
3. Build the `AC-*` list once and use it for F4 in both directions.
4. Run F2–F9. Record every finding; fix nothing.
5. Write the report; on SUCCESS set `status: validated`.
6. Announce the verdict and return to [fspec-loop](../fspec-loop/SKILL.md).

## Report format

Front matter as in
[pipeline-conventions §3](../pipeline-conventions/SKILL.md), then
`## Summary`, `## Issues` (one `ISSUE-<nn>` block each: severity, check, file, location, finding,
expected), `## Divergences`, and `## Coverage` (criteria covered / uncovered, requirements with no
source, contracts with no consumer).

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
