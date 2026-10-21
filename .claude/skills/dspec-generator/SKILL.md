---
name: dspec-generator
description: 'Generate or update the design specification under "300 Specs/330 D-Specs/Output/<feature>/" from the validated functional specification: architecture and layer placement, data model and reversible migrations, backend module design, web and mobile component design, integrations, security and RBAC design, observability, ADRs and the test strategy. Use when: starting the design of a feature; fixing it after a FAIL DSpec Validation Report; folding back a finding from Code, Tests or diagnosis.'
argument-hint: 'Feature, and/or the path to a validation or feedback report'
---

# DSpec Generator — stage 3 (`300 Specs/330 D-Specs`)

Produces the design specification: **how the system is built** so that every `REQ-*` of the FSpec is
realized under the domain invariants, on a live product, without breaking what already runs.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md),
[domain-invariants.md](../pipeline-conventions/references/domain-invariants.md).

## Source authority

The **validated FSpec** is the authority for *what*. The existing code is context for *where*.

- A design item exists to realize a `REQ-*`. One that realizes none is an `error`.
- The existing code decides **placement**, not **scope**: which module owns a behaviour, which repository
  function already returns the row, which engine already holds the state machine.
- A `REQ-*` the current system does not satisfy is a **divergence**, recorded in `98-divergences.md` with
  the file:line of what exists today and the design item that closes it — never a reason to relax the
  requirement.
- `400 Code/Source/` is the as-built description. There is no separate as-built document to disagree with
  it: what the code does today is what the system does today.

## Artifact locations

| Role | Path |
|---|---|
| Input — FSpec | `300 Specs/320 F-Specs/Output/<feature>/` (`status: validated`) — read in full first |
| Input — conventions | `300 Specs/330 D-Specs/Input/` |
| Input — as-built code (read-only) | `<source>`, `<web>`, `<migrations>` — the as-built description |
| Input — validation report | `300 Specs/330 D-Specs/Output/<feature>/reports/dspec-validation/` (Mode B) |
| Input — feedback | `300 Specs/330 D-Specs/Output/<feature>/reports/feedback/` (Mode C) |
| Output | `300 Specs/330 D-Specs/Output/<feature>/` |

**Reads code, writes none.** No file under `<source>`, `<web>`, `<migrations>` or `<tests>` is created or
edited by this skill.

## Modes

| Mode | Trigger | Behaviour |
|---|---|---|
| **A** | No set yet, or upstream moved | Generate the whole design from the current FSpec |
| **B** | A FAIL validation report | Fix only the listed issues |
| **C** | Feedback from Code / Tests / diagnosis | Resolve the named items |

## Structure

```
300 Specs/330 D-Specs/Output/<feature>/
├── 00-index.md
├── 01-architecture.md       # layer placement, sequence of the changed flow, dependencies
├── data/
│   └── DM-<nnnn>-<name>.md      # tables, columns, indexes, constraints, migration + downgrade
├── backend/
│   └── DES-<nnnn>-<name>.md     # api / services / core / repository design per module
├── web/
│   └── DES-<nnnn>-<name>.md     # web module design, state, polling, navigation
├── mobile/
│   └── DES-<nnnn>-<name>.md     # app module design, storage, offline, token lifecycle
├── security/
│   └── DES-<nnnn>-<name>.md     # auth, RBAC enforcement points, webhook validation, secrets
├── adr/
│   └── ADR-<nnnn>-<title>.md    # one decision, its alternatives and its consequences
├── test-strategy.md         # what is tested at which level, and how each criterion is reached
├── 98-divergences.md
├── 99-traceability.md
└── reports/
    ├── dspec-validation/
    └── feedback/
```

### Design item (`*/DES-nnnn-*.md`)

1. **Realizes** — the `REQ-*` ids, and the `AC-*` behind them.
2. **Placement** — the exact module path, under the tree role and layer the map assigns it. New
   modules are named here first.
3. **Interface** — the functions or components added or changed: name, inputs with units, outputs, errors
   raised. Signatures, not bodies.
4. **Collaborators** — what it calls and what calls it, **respecting the layer direction** (I2).
5. **State and concurrency** — what it reads or mutates, and how a retry or a duplicate is made harmless
   (I7).
6. **Failure behaviour** — what happens on timeout, on a dependency failure, on partial write.
7. **Feature flag** — the flag that gates it and its default (I4), or the one-line reason it needs none.
8. **Open points** — `OPEN-<nn>`, or "None".

### Data model (`data/DM-nnnn-*.md`)

Tables with columns, types, **units in the column name** where numeric, nullability, defaults, indexes,
foreign keys and uniqueness. Then:

- **Migration plan** — the schema revision, what it does, and its **downgrade**, stated as executable
  steps.
- **Backfill** — idempotent, restartable, with a batch size and a way to observe progress, or "None".
- **Compatibility window** — how old and new code coexist while the migration rolls out. A column that is
  added, populated and made non-nullable in one revision cannot be deployed without downtime; say so or
  split it.
- **Retention and privacy** — what is stored, for how long, and what is never stored.

### Test strategy (`test-strategy.md`)

Table: every `FEAT-*` × the level(s) that verify it — unit, integration, API contract, web E2E, mobile
E2E — with the reason. Then, for every `AC-*`: **how the test reaches it** — which fixture, which
seeded state, which stub. A criterion with no reachable path is an `OPEN-<nn>`, never a new test-only
setting.

### ADR (`adr/ADR-nnnn-*.md`)

Context · decision · alternatives considered · consequences · status. Written for any choice with
consequences beyond the feature: a new dependency, a storage change, a change to auth or RBAC, a change to
the polling model, a new deployment unit.

## Design policy

1. **Layer direction is absolute.** The layer map in `<stage-input>/` is the authority. No component
   carries a rule the map places elsewhere; nothing reaches past the layer that owns data access;
   nothing calls backwards. A design that skips a layer is an `error`.
2. **Primary context comes from the directives.** `<stage-input>/` names the entity every domain flow is
   keyed on. A design that makes a support entity the primary context is an `error`.
3. **The smallest change that satisfies the requirement.** Extend an existing module before adding one;
   add a module before adding a layer; add a layer before adding a service. Every new component carries
   the one-line reason the existing one could not hold the behaviour (I10).
4. **Every schema change is reversible and testable.** Downgrade specified, backfill idempotent,
   compatibility window stated (I5). An irreversible migration is a stop condition, not a design.
5. **Every new setting defaults to no change.** Feature flags default off; the master flag of a new
   feature is off; each default states why it is neutral (I4).
6. **Retirement is designed, not implied.** A field, endpoint or key the FSpec retires gets a rejection
   point in the design, and the replacement is designed in the same set (I3).
7. **Security is a placement question.** Every design item on an authenticated path names **where** the
   session is verified and **where** the RBAC role is checked — the enforcement point, not the intent.
   Webhook payloads are signature-verified before anything else reads them. Secrets are read from the
   environment at one site, never passed through a spec, a log or a report (I6).
8. **Idempotency is designed, not hoped for.** Every domain write names its dedupe key, its uniqueness
   constraint, and what a second arrival does. Every state transition names how a retry is absorbed and
   how its sequence counter moves.
9. **Observability is part of the design.** Every failure path names what is logged — **identifiers, never
   content** (I6) — and every non-functional threshold names the metric that would show it being missed.
10. **No test-only surface.** No setting, endpoint or hook exists so a test can reach a state. Tests reach
    behaviour through fixtures, seeded data and the public contract. An unreachable behaviour is an
    `OPEN-<nn>`.
11. **The clients move together.** A contract change lands with its `<web>` change and
    its mobile change designed in the same set (I8), or with the compatibility window that lets them lag.
12. **The FSpec set is closed.** Every design item traces to a `REQ-*`; nothing the FSpec requires is left
    undesigned. A design item tracing to none goes to `OPEN-<nn>`.

## Procedure

1. Read the whole FSpec. Build the `REQ-*` list — it is the closure check for step 8.
2. Read the modules the feature touches. Note, for
   each `REQ-*`, whether the current system satisfies it — the ones that do not become divergence rows.
3. Write `01-architecture.md`: layer placement and the changed flow as a sequence diagram.
4. Write the data model and its migration plan, if the FSpec implies a data change.
5. Write the backend, web, mobile and security design items.
6. Write any ADR the design needs.
7. Write `test-strategy.md`, covering every `FEAT-*` and reaching every `AC-*`.
8. Write `99-traceability.md`: `REQ-*` ↔ design item ↔ data model ↔ test level, **both ways**.
9. Write `00-index.md` last.
10. Report and hand back to [dspec-loop](../dspec-loop/SKILL.md). Never invoke `dspec-validator`.

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

- Every `REQ-*` is realized by at least one design item, and every design item traces back.
- Every design item names an exact module path and the layer it sits in.
- Layer direction holds everywhere; the primary context is the one `<stage-input>/` names.
- Every schema change has a downgrade and a compatibility window; every backfill is idempotent.
- Every new setting defaults to no change, with the reason.
- Every authenticated path names its session-verification and RBAC enforcement points.
- Every domain write names its dedupe key and its retry behaviour.
- `test-strategy.md` reaches every `AC-*` without inventing a test-only surface.
- No file under `<source>`, `<web>`, `<migrations>` or `<tests>` was created or edited.
- In Mode B, exactly the reported issues were touched.
