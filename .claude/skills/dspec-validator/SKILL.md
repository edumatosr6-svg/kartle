---
name: dspec-validator
description: 'Validate the design specification under "300 Specs/330 D-Specs/Output/<feature>/" against the validated functional specification under "300 Specs/320 F-Specs/Output/<feature>/" and the stage directives. Covers architecture, data model and migrations, backend/web/mobile/security design, ADRs and the test strategy. Use when: the design was just generated or updated and must be checked before implementation; the user asks to review or audit the design. Emits SUCCESS or FAIL with a machine-consumable DSpec Validation Report. Runs isolated and fixes nothing.'
argument-hint: 'Feature; optionally a subset of design item ids'
---

# DSpec Validator — gate between design and implementation

Checks the design for coverage, layering, data safety, security placement, testability and domain
compliance. Binary result: **SUCCESS** (go to `400 Code`) or **FAIL**.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md),
[domain-invariants.md](../pipeline-conventions/references/domain-invariants.md).

## Artifact locations

| Role | Path |
|---|---|
| Reference — FSpec | `300 Specs/320 F-Specs/Output/<feature>/` (authority for coverage, check D3) |
| Reference — as-built code (read-only) | `<source>`, `<web>`, `<migrations>` |
| Under validation | `300 Specs/330 D-Specs/Output/<feature>/` |
| Emitted | `300 Specs/330 D-Specs/Output/<feature>/reports/dspec-validation/dspec-validation-<YYYYMMDD-HHmm>.md` |

Rules: one feature per run; write nothing but `status:` inside `300 Specs/330 D-Specs/Output/<feature>/`, and only on
SUCCESS; the generator's reasoning is not an input; **no source file is read for authority, only for
placement facts** — and a placement claim is verified against the tree, never assumed.

## Checks

### D1 — Structure and format

- Required files exist: `00-index.md`, `01-architecture.md`, `test-strategy.md`, `99-traceability.md`, at
  least one `*/DES-*.md`.
- Front matter valid, `stage: dspec`, `feature:` correct, `id` matches filename, ids unique and never reused.
- `00-index.md` matches the files on disk; every relative link resolves; every mermaid block parses.

### D2 — Design item quality

- Every design item names: the `REQ-*` it realizes, an exact module path, the layer, its interface, its
  collaborators, its failure behaviour and its feature flag (or the reason it needs none) — a missing
  element is an `error`.
- Every module path either exists in the tree or is explicitly marked **new** (`error` on a path that is
  neither — a design pointing at a file that does not exist and is not declared new cannot be built).
- Interfaces state units on every numeric input and output (`error` on a bare numeric).
- No design item contains implementation bodies; signatures and contracts only (`warning`).

### D3 — Coverage of the FSpec, both ways

- Every `REQ-*` is realized by at least one design item (`error` when uncovered).
- Every design item traces to a `REQ-*` or an explicit `[DOMAIN]` necessity (`error` on an invented item
  — it belongs in `OPEN-<nn>`).
- Every NFR deferred to this stage by the FSpec is designed, with the mechanism that meets its threshold
  named (`error` when silently dropped).
- Every API contract of the FSpec has a design item that serves it, and the design's request/response
  shape matches the contract field for field (`error` on a mismatch).
- `99-traceability.md` closes both ways.

### D4 — Data and migrations

- Where the FSpec implies a data change, a `data/DM-*.md` exists (`error` otherwise).
- Every table states columns, types, nullability, defaults, indexes, foreign keys and uniqueness
  (`error` on a missing element).
- Every numeric column carries its unit in the name (`error`).
- Every schema change has a named revision **and a stated downgrade** (`error` when the downgrade
  is missing or is "not supported" — that is a stop condition, not a design).
- Every backfill is idempotent, restartable, batched and observable (`error` otherwise).
- The **compatibility window** is stated: how old and new code coexist during rollout. A revision that
  adds, populates and makes a column non-nullable in one step, with no window stated, is an `error`
  (I5).
- Retention and privacy are stated for every new stored field (`error` when a field the directives mark
  sensitive is silent).

### D5 — Layering and domain

- Every call direction respects the layer map in `<stage-input>/`. A component holding a rule the map
  places elsewhere, a layer reaching past the one that owns data access, or any backward call is an
  `error`.
- Domain state is designed around the primary context `<stage-input>/` names; making a support entity the
  primary context is an `error`.
- Every further check the directives in `<stage-input>/` add to this block, at the severity they declare.
- **I3** — every retirement the FSpec requires has a rejection point in the design, and its replacement is
  designed here (`error` otherwise). No existing field is redefined under the same name.
- **I4** — every new setting defaults to no change, with the reason (`error`); a new feature with no
  master flag defaulting off is an `error`.
- **I10** — a new module, layer or dependency with no one-line reason the existing one could not hold the
  behaviour is a `warning`; a refactor or removal the FSpec does not request is an `error`.

### D6 — Security placement

- Every design item on an authenticated path names **where** the session is verified and **where** the
  RBAC role is checked (`error` when it names the intent but not the point).
- The role set of each endpoint matches the FSpec contract (`error` on a mismatch — a design that widens
  access is the more dangerous direction and is still an `error`).
- Webhook payloads are signature-verified before any read that can change state (`error` otherwise — I6).
- Secrets are read from the environment at a single site; no secret, credential or token value appears in
  any file of the set (`blocker`).
- Every logged failure path logs identifiers only; a design that logs a content class `<stage-input>/`
  marks unloggable is an `error`.
- Every new input crossing the boundary states its validation — type, range, size limit — and every query
  built from it is parameterized (`error` on an unvalidated boundary input or a string-built query).
- Mobile: the at-rest and session-expiry rules of `<stage-input>/` are stated (`error` when either is
  unstated for a feature with `mobile` in scope).

### D7 — Idempotency, failure and observability

- Every domain write names its dedupe key, its uniqueness constraint and what a second arrival does
  (`error`).
- Every state transition names how a retry is absorbed and how its sequence counter moves (`error`).
- Every design item states its failure behaviour on timeout, dependency failure and partial write
  (`error` when silent).
- Every NFR threshold names the metric that would show it being missed (`warning` when unnamed).

### D8 — Test strategy

- `test-strategy.md` exists and assigns at least one level to every `FEAT-*` (`error` otherwise).
- Every `AC-*` has a stated path by which a test reaches it — fixture, seeded state, stub (`error` when
  unreachable).
- No `AC-*` is reached by a test-only setting, endpoint or hook (`error` — the behaviour is an
  `OPEN-<nn>` instead).
- Levels are appropriate: a domain rule verified only through a web E2E test, with no unit or
  integration coverage, is a `warning`.

### D9 — Openness and divergences

- No `OPEN-<nn>` and no `TBD` remains (`blocker` each).
- Every `98-divergences.md` row carries: the `REQ-*` id, what is required, what exists today at
  `file:line`, the design item that closes it, and a state. A row with no closing design item is an
  `error` — a divergence the design does not address is a requirement quietly dropped.

## Verdict

Any `blocker` or `error` → **FAIL**. Otherwise **SUCCESS**, and `status: validated` is set on every file.

## Procedure

1. Resolve the feature; confirm the FSpec is `status: validated` (`blocker` otherwise). Stamp the report:

   ```powershell
   python .claude/skills/pipeline-progress/scripts/pipeline_progress.py --seed-line <feature>
   ```

2. Run D1 mechanically over every file first.
3. Build the `REQ-*` list once; use it for D3 in both directions.
4. Verify every module path claim against the tree before judging D2 — one pass, batched, not a lookup
   per item.
5. Run D2–D9. Record every finding; fix nothing.
6. Write the report; on SUCCESS set `status: validated`.
7. Announce the verdict and return to [dspec-loop](../dspec-loop/SKILL.md).

## Report format

Front matter as in
[pipeline-conventions §3](../pipeline-conventions/SKILL.md), then `## Summary`,
`## Issues`, `## Divergences`, and `## Coverage` (requirements covered / uncovered, design items with no
source, criteria with no reachable test path).

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
