---
name: fspec-generator
description: 'Generate or update the functional specification under "300 Specs/320 F-Specs/Output/<feature>/" from the validated requisites: feature specs with SHALL/SHOULD/MAY requirements, end-to-end flows, API contracts shared by web and mobile, screen specifications, business rules and state models, and the traceability matrix. Use when: starting the FSpec of a feature; fixing it after a FAIL FSpec Validation Report; folding back a finding from DSpec, Code, Tests or diagnosis.'
argument-hint: 'Feature, and/or the path to a validation or feedback report'
---

# FSpec Generator — stage 2 (`300 Specs/320 F-Specs`)

Produces the functional specification: **what the system does**, channel by channel, in terms an
implementer and a test author can both act on without asking a second question.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md),
[domain-invariants.md](../pipeline-conventions/references/domain-invariants.md).

## Source authority

The **validated requisites** are the authority. The running system is not.

- A requirement whose stated basis is "this is how it works today" is an `error`. The basis is a criterion
  id, or an explicit `[DOMAIN]` necessity from the invariants, stated as such.
- The existing code, schema and `<web>` are consulted only to **name** an existing contract, field, role
  or screen — and only through the contract inventory in `300 Specs/320 F-Specs/Input/` or a direct read of the route
  definitions. Never to decide what the feature must do.
- A requirement the running system does not satisfy is a **divergence**, recorded in `98-divergences.md`,
  never a reason to soften the requirement.

## Artifact locations

| Role | Path |
|---|---|
| Input — requisites | `200 Requirements/230 Output/<feature>/` (`status: validated`) — read in full first |
| Input — seed | `200 Requirements/220 Input/<feature>/SEED.md` (scope and constraints only) |
| Input — conventions | `300 Specs/320 F-Specs/Input/` |
| Input — existing contracts | the route and schema definitions in `<source>` — **names only**, to avoid colliding with a contract that exists; never to derive behaviour |
| Input — as-built code | **not read by default** — `400 Code/Source/` only when the run explicitly asks (conventions §2) |
| Input — validation report | `300 Specs/320 F-Specs/Output/<feature>/reports/fspec-validation/` (Mode B) |
| Input — feedback | `300 Specs/320 F-Specs/Output/<feature>/reports/feedback/` (Mode C) |
| Output | `300 Specs/320 F-Specs/Output/<feature>/` |

## Modes

| Mode | Trigger | Behaviour |
|---|---|---|
| **A** | No set yet, or upstream moved | Generate the whole set from the current requisites |
| **B** | A FAIL validation report | Fix only the listed issues |
| **C** | Feedback from DSpec / Code / Tests / diagnosis | Resolve the named `FEEDBACK-<nn>` / `SPEC-ISSUE-<nn>` items |

## Structure

```
300 Specs/320 F-Specs/Output/<feature>/
├── 00-index.md
├── 01-overview.md           # what is specified, per channel; out of scope
├── 02-glossary.md
├── features/
│   └── FEAT-<nnnn>-<name>.md
├── flows/
│   └── FLOW-<nnnn>-<name>.md     # mermaid sequenceDiagram + step table
├── api/
│   └── API-<nnnn>-<name>.md      # one contract group per file
├── screens/
│   └── SCR-<nnnn>-<name>.md      # web and mobile, states and transitions
├── rules/
│   └── RULE-<nnnn>-<name>.md     # business and domain rules, state models
├── 98-divergences.md
├── 99-traceability.md
└── reports/
    ├── fspec-validation/
    └── feedback/
```

### Feature file (`features/FEAT-nnnn-*.md`)

1. **Summary** — what the feature does and for whom.
2. **Channels** — backend / web / mobile, and what differs.
3. **Requirements** — `REQ-<FEAT id>-<nn>: The system SHALL/SHOULD/MAY ...`, atomic, unambiguous,
   testable. Every SHALL cites the criterion id it realizes, or is tagged `[DOMAIN]`.
4. **Behaviour** — nominal flow, then **error cases, timeouts, duplicates, out-of-order events and
   offline** — linked to `flows/`, `api/` and `rules/` by relative path.
5. **State** — the states this feature reads or changes, as ALL_CAPS enums, with what drives each
   transition.
6. **Configuration** — every setting the feature exposes (see the strict-contract policy).
7. **Acceptance criteria** — observable pass/fail conditions, traced to the `AC-*` ids they satisfy.
8. **Open points** — `OPEN-<nn>`, or "None".

### API contract file (`api/API-nnnn-*.md`)

One file per resource group, and it is the **single contract for web and mobile**.

| Section | Content |
|---|---|
| Endpoint | method, path, purpose |
| Auth | session required, and the role(s) permitted, from the role set `<stage-input>/` names |
| Path / query params | name, type, required, constraints |
| Request body | field table: name, type, unit, required, constraints, default |
| Response | status, field table, and the exact shape on empty |
| Errors | every status the endpoint can return, with the condition and the body shape |
| Idempotency | what a repeated call does; the key, if any |
| Pagination / polling | page size, cursor, and the polling interval the clients use |
| Compatibility | what is added, what is retired, and the rejection message a retired field produces |

### Screen file (`screens/SCR-nnnn-*.md`)

Purpose · channel (web / mobile / both) · entry points · **every state** (loading, empty, populated,
error, offline, permission-denied) · the API calls each state makes · navigation in and out · what the
user can do and what each action produces. A screen with no empty state and no error state is
under-specified.

### Rule file (`rules/RULE-nnnn-*.md`)

Business and domain rules as decision tables or `stateDiagram-v2`. Every domain rule cites the source
`<stage-input>/` requires it to cite. Every state model states which transitions are **idempotent under retry** and which
carry a sequence counter.

## Strict-contract policy

Born from the failure mode this stage exists to prevent: a contract that changes meaning without changing
its name lets an old client keep working while quietly sending or reading the wrong thing.

1. **One naming shape.** JSON fields are flat `snake_case`. Every numeric field carries its unit as a
   suffix — `_ms`, `_s`, `_days`, `_count`, `_pc` (a fraction in [0,1]), `_bytes`. Only boolean, enum and
   string fields are unitless. The unit is the one the domain or product source defines; deviating
   requires the field row to say so explicitly.
2. **The primary context is the one `<stage-input>/` names.** Its endpoint prefix and its key apply to
   every domain endpoint and payload; a domain resource keyed on a support entity is an `error`.
3. **Every field states required-or-optional and its default**, and every default is chosen so that adding
   the field changes no existing behaviour (I4), with the one-line reason it is neutral.
4. **Retirement is loud.** A renamed or removed field, path or query parameter is rejected with a message
   naming its replacement, and the replacement is specified in this same set. A rejection rule naming
   something that exists nowhere is unenforceable and is an `error`. This covers a **split** as much as a
   rename.
5. **Rename on semantic change.** Never change the unit, meaning or value domain of an existing field
   while keeping its name. The unit suffix of rule 1 makes this automatic.
6. **One contract, all clients.** Web and mobile consume the same endpoint unless the spec states the
   reason for a channel-specific one. A mobile-only endpoint that duplicates a web one is an `error`.
7. **Every endpoint names its auth and its role set.** An authenticated endpoint with no role stated is an
   `error`; a deliberately public endpoint says so and says why.
8. **Every endpoint states its error surface** — every status it can return, with the condition. An
   endpoint specified only on the happy path is an `error`.
9. **Every state-changing endpoint states its idempotency.** What a duplicate request does, and under what
   key. A domain write with no idempotency statement is an `error`.
10. **Configuration is not a test harness.** No setting exists to script an event, inject a state, or
    enable a debug path. Operational concerns — logging, verbosity, file paths, run control — are
    configured globally and never per feature. A setting that only a test would set is an `error`; the
    behaviour it would reach is an `OPEN-<nn>`.
11. **The requisites set is closed.** Every requirement traces to a criterion, a cited requisites item, or
    an explicit `[DOMAIN]` necessity; nothing the requisites name is dropped. A requirement tracing to
    none goes to `OPEN-<nn>`, never into the set.
12. **No design decisions.** No table, column, module, class, library or framework. The endpoint path and
    the payload shape are contract, and belong here; how they are served belongs to `300 Specs/330 D-Specs`.

## Procedure

1. Read the whole requisites set. Build the `AC-*` list — it is the closure check for step 7.
2. Read the existing route definitions for the **names** of contracts the feature must not collide with.
   Do not read the implementation for behaviour: the requisites are the authority on what must happen.
3. Write `01-overview.md` and `02-glossary.md`.
4. Write the feature files, then the flows they reference.
5. Write the API contracts, applying the strict-contract policy in full.
6. Write the screen specs for every channel in scope, and the rule files.
7. Write `99-traceability.md`: criterion ↔ requirement ↔ flow ↔ contract ↔ screen ↔ rule, **both ways**.
8. Write `00-index.md` last.
9. Report and hand back to [fspec-loop](../fspec-loop/SKILL.md). Never invoke `fspec-validator`.

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

- Every `AC-*` of the requisites is realized by at least one `REQ-*`, and every `REQ-*` traces back.
- Every SHALL cites a criterion or is tagged `[DOMAIN]`.
- Every contract passes the strict-contract policy; every retirement names a replacement in this set.
- Every feature specifies its error cases, not only the nominal flow.
- Every domain rule cites its source; none is invented here.
- Every state-changing endpoint states its idempotency and its role set.
- No table, column, module or library appears anywhere.
- In Mode B, exactly the reported issues were touched.
