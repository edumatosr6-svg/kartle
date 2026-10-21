---
name: code-generator
description: 'Implement a feature from its validated design: data model and reversible migrations, backend, web client, and mobile app. Writes source, and writes the implementation manifest and traceability under "400 Code/Output/<feature>/". Use when: starting an implementation; fixing it after a FAIL Code Validation Report; acting on a Testing Report or a Root Cause Report. Emits FAIL SPEC instead of guessing when the design cannot be implemented as written.'
argument-hint: 'Feature, and/or the path to a validation, testing or diagnosis report'
---

# Code Generator — stage 4 (`400 Code`)

Implements the design. The output is source in the real trees plus a manifest that lets every later stage
answer "which code realizes this requirement" without reading the diff.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md),
[domain-invariants.md](../pipeline-conventions/references/domain-invariants.md).

## Source authority

The **validated design** is the authority for placement and interface; the **validated FSpec** is the
authority for behaviour and contract.

- Where the design and the existing code disagree, the design wins and the code moves.
- Where the design and the FSpec disagree, that is a defect upstream: emit **FAIL SPEC**, do not choose.
- Where both are silent, that is an ambiguity: emit **FAIL SPEC**. Never invent behaviour, a field, a
  threshold or a domain rule, and never settle it by copying what the code happens to do today.

## Artifact locations

| Role | Path |
|---|---|
| Input — design | `300 Specs/330 D-Specs/Output/<feature>/` (`status: validated`) — read in full first |
| Input — contracts | `300 Specs/320 F-Specs/Output/<feature>/api/`, `screens/`, `rules/` |
| Input — divergences | `300 Specs/330 D-Specs/Output/<feature>/98-divergences.md` |
| Input — directives | `400 Code/Input/` and the run's directives |
| Output — backend | the `<source>` layers the layer map names |
| Output — migrations | `<migrations>` |
| Output — web | `<web>` |
| Output — mobile | the mobile app tree named in `400 Code/Input/` |
| Output — manifest | `400 Code/Output/<feature>/00-index.md`, `99-traceability.md`, `98-divergences.md` |
| Output — FAIL SPEC | `300 Specs/330 D-Specs/Output/<feature>/reports/feedback/feedback-<YYYYMMDD-HHmm>.md` |

**No test file is written here.** `<tests>` belongs to [test-generator](../test-generator/SKILL.md). A
change that cannot be verified is still not this stage's problem to solve by writing its own test.

## Modes

| Mode | Trigger | Behaviour |
|---|---|---|
| **A** | Nothing implemented for the feature | Implement the whole design, in build order |
| **B** | A FAIL Code Validation Report, or open divergence rows | Fix only what is listed; touch nothing else |
| **C** | A Testing Report or a Root Cause Report | Fix the named defects, each traced to its finding id |

## Build order

1. **Data model and migrations** — models in the layer the map names, one revision per schema change with its
   downgrade implemented, backfill idempotent and batched.
2. **Backend** — data access first, then rules, then the HTTP surface. Request/response schemas match the
   API contract field for field, units included.
3. **API clients** — the shared client layer the web and mobile apps use.
4. **Web** — `<web>` modules, preserving the existing polling, navigation and routing model unless a
   requirement changes it.
5. **Mobile** — the app modules, offline behaviour, secure storage, token lifecycle.

A stage is finished when its part compiles and its part of the manifest is written. Do not start a client
before the contract it consumes exists.

## Implementation policy

1. **Layer direction is absolute.** The layer map in `<stage-input>/` is the authority: routes stay
   thin, rules live where the map puts them, data access goes through the layer it names. Never call
   backwards.
2. **Every directive in `<stage-input>/` is implemented**, at the severity it declares — primary-context
   key, endpoint prefix, and every rule the project marks binding.
3. **Implement the design, not something adjacent.** The module path, the function name and the signature
   come from the design item. A better idea is a `FEEDBACK-<nn>`, not a silent substitution.
4. **Scope is strict** (I10). Change only the files the design names. No opportunistic refactor, rename,
   reformat, dependency bump or "while I was in there" fix. No comment or docstring added to code this
   change did not touch.
5. **Every new setting defaults to no change** (I4), behind a flag that defaults off for a new feature.
6. **Retirement is loud** (I3): a retired field, path or key is rejected with a message naming its
   replacement, and the replacement exists in this change.
7. **Security is code, not intent** (I6): session verified and RBAC checked at the points the design
   names; webhook signature verified before any state-changing read; every boundary input validated for
   type, range and size; every query parameterized; secrets read from the environment at one site.
   Nothing is logged but identifiers; `<stage-input>/` names the content classes that must never reach a
   log.
8. **Idempotency is code, not hope** (I7): the dedupe key, the uniqueness constraint and the retry path
   the design named are actually implemented, and a second arrival is provably harmless.
9. **Every parameter is read at a site that changes behaviour.** A setting declared, validated and read by
   nothing is worse than no setting at all: it lets an operator configure a mechanism, get a plausible
   run, and conclude it was exercised. Where the design says a mechanism is not implemented, implement the
   **rejection**, not a key nothing acts on.
10. **Errors are handled where they can happen** — at the boundary — and not invented for situations that
    cannot occur.
11. **Comments state what the code cannot.** One line, where a reader would otherwise be surprised. Not a
    restatement of the next line, not an explanation aimed at the reviewer.
12. **Migrations are reversible.** The `downgrade()` is implemented and does what the design says. A
    revision whose downgrade is `pass` is a defect unless the design says the change is additive-only and
    explains why.

## The manifest

`400 Code/Output/<feature>/` holds no source — only the record of it:

```
400 Code/Output/<feature>/
├── 00-index.md          # what was implemented, in which files, at which version
├── 99-traceability.md   # REQ-* ↔ design item ↔ file:symbol
├── 98-divergences.md    # rows carried from DSpec, with their resolution
└── reports/
    ├── code-validation/
    └── feedback/
```

`99-traceability.md` is the artifact everything downstream depends on: one row per `REQ-*`, naming the
design item and the **file and symbol** that realizes it. A requirement with no row is unimplemented,
whatever the diff says.

## FAIL SPEC

Emit it — and stop — when the design or the contract is wrong, ambiguous, contradictory, or silent on
something the implementation must decide. Write to
`300 Specs/330 D-Specs/Output/<feature>/reports/feedback/feedback-<YYYYMMDD-HHmm>.md`:

```markdown
---
from: code-generator
feature: <feature>
generated: <YYYY-MM-DDTHH:mm:ssZ>
verdict: FAIL SPEC
---

### SPEC-ISSUE-01
- item: REQ-FEAT-0003-04 / DES-0012
- problem: the contract says `retry_count` is optional with no default; the design's retry path reads it
  unconditionally
- why it cannot be decided here: choosing a default changes observable behaviour for existing clients
- what is needed: the FSpec must state the default, or the design must state the absent-value behaviour
```

Never resolve the ambiguity by picking the option that is easiest to build.

## Procedure

1. Read the design in full, then the contracts, then the divergence register.
2. Build the `REQ-*` → design-item map. It is the closure check for step 7.
3. Implement in build order, committing each stage's manifest rows as you go.
4. After each stage, run the deterministic gate for that stage (compile / collect / build) before moving
   on. A stage that does not build is not finished.
5. Resolve every `open` divergence row you closed, naming the `file:line`.
6. Write `99-traceability.md` and `00-index.md`.
7. Verify the closure: every `REQ-*` has a row; every row points at code that exists.
8. Report what changed — files touched, requirements closed, divergences resolved, anything left open —
   and hand back to [code-loop](../code-loop/SKILL.md). Never invoke `code-validator`.

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

- The tree compiles and the test suite collects.
- Every `REQ-*` has a traceability row pointing at a real file and symbol.
- Layer direction holds; no domain rule sits in a route or a client.
- Every retirement rejects loudly and names a replacement that exists.
- Every new setting is read at a site that changes behaviour.
- Every migration has a working `downgrade()`.
- No secret, no logged content, no unvalidated boundary input, no string-built query.
- Only the files the design names were touched.
- In Mode B or C, exactly the reported items were addressed.
