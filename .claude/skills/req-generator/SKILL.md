---
name: req-generator
description: 'Generate or update the requisites set under "200 Requirements/230 Output/<feature>/" from the seed at "200 Requirements/220 Input/<feature>/SEED.md": user stories with acceptance criteria per actor and channel, non-functional requirements with measurable thresholds, glossary and traceability. Use when: starting a new feature; fixing the set after a FAIL Requisites Validation Report; folding back a finding from a later stage. Output always goes to req-validator before FSpec.'
argument-hint: 'Feature, and/or the path to a validation or feedback report'
---

# Req Generator — stage 1 (`200 Requirements`)

Produces the requisites artifact: the stories, criteria and thresholds every later stage is traced back
to. It restates the seed as a set that can be **checked**, and adds nothing the seed does not carry.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md),
[domain-invariants.md](../pipeline-conventions/references/domain-invariants.md).

## Source authority

**The seed is the authority. The running system is not.**

- A story, criterion or threshold whose stated basis is "this is what the product does today" is an
  `error`. The basis is the seed, or an explicit `[DOMAIN]` necessity derived from
  [domain-invariants.md](../pipeline-conventions/references/domain-invariants.md) and stated as such.
- The existing source, web and schema trees are consulted only to **name** something that already exists
  — a screen, an endpoint, a role — never to decide what the feature must do.
- A requirement the current system does not satisfy is a **divergence**, never a reason to soften the
  requirement.
- `200 Requirements/210 Docs/` is product context, not a
  ceiling: they say what the product is, not what this feature may ask for.

## Artifact locations

| Role | Path |
|---|---|
| Input — seed | `200 Requirements/220 Input/<feature>/SEED.md` (read in full before generating anything) |
| Input — seed support | `200 Requirements/220 Input/<feature>/*.md` — briefs, protocol excerpts. `NOTES.md` is **not** read |
| Input — product context | `200 Requirements/210 Docs/` |
| Input — domain | [domain-invariants.md](../pipeline-conventions/references/domain-invariants.md) |
| Input — as-built code | **not read by default** — `400 Code/Source/` only when the run explicitly asks (conventions §2) |
| Input — validation report | `200 Requirements/230 Output/<feature>/reports/req-validation/` (Mode B only) |
| Input — feedback report | `200 Requirements/230 Output/<feature>/reports/feedback/` (Mode C only) |
| Output | `200 Requirements/230 Output/<feature>/` |

Never write outside `200 Requirements/230 Output/<feature>/`.

## Modes

| Mode | Trigger | Behaviour |
|---|---|---|
| **A** | No set yet, or the seed's revision moved | Generate the whole set from the current seed |
| **B** | A FAIL validation report | Fix **only** the issues it lists; touch nothing else |
| **C** | A feedback report from a later stage or from `diag-loop` | Resolve the named `FEEDBACK-<nn>` items |

In Mode B, every issue is closed by an edit or by a recorded divergence. An issue left open without either
is a defect of this run.

## Structure

```
200 Requirements/230 Output/<feature>/
├── 00-index.md              # every file: id, title, status, version
├── 01-context.md            # what the feature is, who it is for, out of scope
├── 02-glossary.md           # terms, per channel and domain
├── stories/
│   └── US-<nnnn>-<name>.md
├── nfr/
│   └── NFR-<nnnn>-<name>.md
├── 98-divergences.md        # requirements the running system does not satisfy
├── 99-traceability.md       # seed item ↔ story ↔ criterion ↔ NFR
└── reports/
    ├── req-validation/
    └── feedback/
```

### Story file (`stories/US-nnnn-*.md`)

1. **Story** — `As a <actor>, I want <goal>, so that <value>.`
2. **Channels** — backend / web / mobile, and what differs between them. A channel not listed is out of
   scope for this story and is repeated in `01-context.md`.
3. **Preconditions** — the state the actor must be in, expressed in domain terms (entity state, role,
   protocol stage).
4. **Acceptance criteria** — `AC-<US id>-<nn>: <observable condition>`, one per line, each:
   - observable from outside the system,
   - decidable — two readers reach the same verdict,
   - atomic — one behaviour,
   - channel-explicit where behaviour differs,
   - numeric with its unit where it is a threshold.
5. **Abnormal cases** — what happens on failure, timeout, duplicate, out-of-order, offline. **Every story
   has this section**; "None" requires a reason. Most defects this pipeline later diagnoses were an
   abnormal case nobody wrote down.
6. **Sources** — the seed items this story realizes.
7. **Open points** — `OPEN-<nn>`, or "None".

### NFR file (`nfr/NFR-nnnn-*.md`)

Table: requirement · **measurable threshold with its unit** · how it is observed · channel · source.

Every NFR is measurable. `NFR-0007: the timeline loads quickly` is not an NFR; `NFR-0007: the
timeline first paint is under 2 s on a 3G profile, measured from navigation start` is.

The families that must be considered for every feature, each either specified or explicitly dismissed in one
line: latency, availability, data retention, privacy and consent, RBAC exposure, offline behaviour
(mobile), accessibility, observability, and the throughput families `<stage-input>/` names.

## Strict-criteria policy

Born from the failure mode this stage exists to prevent: a criterion nobody can decide produces a
confidently wrong FSpec, an untestable check, and a green run that proves nothing.

1. **Every criterion names its observation point** — a screen state, an HTTP status and body field, a
   stored record, a message delivered on an external channel, a log line. A criterion whose observation
   point is an
   internal call is an `error`.
2. **No forbidden vocabulary**: "properly", "correctly", "as appropriate", "fast", "reliable", "etc.",
   "and so on", "if needed".
3. **Every threshold carries its unit in the number**: `2 s`, `3 retries`, `90 days`, `10 msg/min`.
4. **Every domain criterion cites the source `<stage-input>/` requires.** A domain threshold invented by
   this stage is an `error` — it goes to `OPEN-<nn>` for the domain owner.
5. **Channel differences are stated, never implied.** "The same, on mobile" is a statement; silence is not.
6. **The seed's set is closed.** Every story and criterion traces to a seed item, a cited product-context
   item, or an explicit `[DOMAIN]` necessity. A story that traces to none is **not invented** — it goes to
   `OPEN-<nn>` for the author to accept into the seed first. Widening the seed silently is how a feature
   drifts away from what was agreed.
7. **Nothing is dropped either.** Every story, criterion, domain rule, constraint and NFR of the seed
   appears in the set. A dropped seed item is an `error`.
8. **No design decisions.** No endpoint path, table, column, module, component or library appears in this
   stage, except where the seed's `Constraints` section imposed one — then it is quoted as a constraint,
   with the seed cited.
9. **No secret, credential, or real production data** of a class `<stage-input>/` marks protected, in
   any file, including the reports.

## Divergences

When a later stage or the author reports that a requirement disagrees with the running system, **fix the
requisites only if the requisites are wrong about the intent**. If they state the intended product
correctly and the system simply has not been built to it, the requirement stays exactly as written and the
disagreement becomes a row of `98-divergences.md` with state `open`, carrying: the criterion id, what it
requires, what the system does today cited at `file:line`, and which stage owes the change.

Never clear an issue by weakening a criterion, deleting a story or narrowing a channel.

## Procedure

1. Read the seed in full. Note its `revision:`.
2. Enumerate the seed's stories, domain rules, constraints, NFRs and out-of-scope items — this list is
   the closure check for step 6.
3. Write `01-context.md` and `02-glossary.md`.
4. Write one story file per seed story, splitting only where a story carries two actors or two goals.
5. Write the NFR files, considering every family listed above.
6. Write `99-traceability.md`: seed item ↔ story ↔ criterion ↔ NFR, **both ways**. Every seed item appears;
   every story traces back.
7. Write `00-index.md` last, from the files that exist.
8. Report what was written and hand control back to [req-loop](../req-loop/SKILL.md). Never invoke
   `req-validator` yourself.

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

- Every file carries valid front matter with `stage: req` and `feature: <feature>`.
- Every story has at least one acceptance criterion and an abnormal-cases section.
- Every criterion passes the strict-criteria policy.
- Every NFR has a number and a unit.
- Traceability closes both ways; `00-index.md` matches the files on disk.
- No design decision, no invented domain threshold, no secret.
- In Mode B, exactly the reported issues were touched.
