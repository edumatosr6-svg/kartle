---
name: pipeline-conventions
description: 'The rules every loop of the pipeline obeys, stated once so no loop restates them and no two loops drift apart: the feature, the artifact layout, front matter, the identifier scheme, severities and verdicts, the divergence rule, the seed revision, validator isolation and its closed rubric, token accounting, the run summary, the shared stop conditions, the per-stage input boundaries, the deterministic gate and generated tables, the write fence and cross-feature feedback, the durable domain layer and scope backlog, frozen surface on a fix round, the changelog, bounded evidence, report discipline — plus the rules for editing a pipeline skill. Use when: writing or editing any pipeline skill; resolving a disagreement between two loops; deciding a severity, a verdict or where an artifact belongs; deciding whether a loop may read or write something; or when a loop refers to "the conventions".'
argument-hint: 'None — this is a reference. Name the rule or the section you need.'
---

# Pipeline conventions — binding on every loop skill

Every loop, generator and validator binds to this file. Where a loop skill and this file disagree,
**this file wins**, and the loop skill is the one that gets corrected.

Its companion is the **project's own directive set**, deposited by the project in each stage's
`<stage-input>/`. This file states what is true about the *pipeline*; the directives state what is true
about the *product being built*. **No skill under `.claude/skills/` names a project, a domain term or a
project file** — a loop learns the domain only by reading `<stage-input>/` at run time. A skill that
hard-codes a domain rule has made itself unusable on the next project and unreviewable on this one.

## 1. The feature

Every run takes exactly one argument: a **feature** — a filesystem-safe lowercase name
(`letters`, `digits`, `-`, `_`) naming one feature or epic, e.g. `account-timeline`,
`rule-branching`, `mobile-onboarding`.

The same feature names the seed and every stage output, character for character. A feature present on one
side and absent on the other is a **finding**, never something to silently create.

If the feature is missing or ambiguous, enumerate `200 Requirements/220 Input/` and **ask** before writing anything.

## 2. Artifact layout

Folder names contain spaces. **Always quote paths** in shell commands.

| Role | Path |
|---|---|
| Collaborator drafts (stage 0 input, human-authored) | `200 Requirements/240 Colaborative/<author>/<feature>/SEED.md` |
| Consolidated set (stage 0 output) | `200 Requirements/240 Colaborative/241 Merged/<feature>/SEED.md`, `00-index.md`, `01-decisions.md` |
| Questions to the collaborators | `200 Requirements/240 Colaborative/241 Merged/reports/questions/questions-round-<n>.md` |
| **Seed** (human-authored, or promoted from the consolidated set) | `200 Requirements/220 Input/<feature>/SEED.md` |
| Seed supporting material | `200 Requirements/220 Input/<feature>/*.md` (briefs, research, screenshots) |
| **Durable domain layer** (human-owned, §15) | `200 Requirements/220 Input/<feature>/DOMAIN.md` |
| **Scope backlog** (human-owned, §15) | `200 Requirements/220 Input/<feature>/SCOPE-BACKLOG.md` |
| Stage directives / references | `<stage-input>/` (conventions, standards, design system) |
| Stage artifacts | `<stage-output>/<feature>/` |
| Validation reports (loop memory) | `<stage-output>/<feature>/reports/<stage>-validation/<stage>-validation-<YYYYMMDD-HHmm>.md` |
| Diagnosis reports | `400 Code/Output/<feature>/reports/diagnosis/` |
| Back-channel reports to an earlier stage | `<stage-output>/<feature>/reports/feedback/` |
| **Cross-feature feedback** (§14) | `<stage-output>/<target feature>/reports/feedbacks/<origin feature>/feedback-<YYYYMMDD-HHmm>.md` |
| Token usage | `<stage-output>/<feature>/reports/token-usage/` |
| **Changelog** (§17) | `<stage-output>/<feature>/97-changelog.md` |
| Divergence register | `<stage-output>/<feature>/98-divergences.md` |
| Traceability matrix | `<stage-output>/<feature>/99-traceability.md` |
| Stage index | `<stage-output>/<feature>/00-index.md` |

`00-index.md`, `99-traceability.md` and every coverage table are **generated**, never hand-written — see
§13.

**Every `<YYYYMMDD-HHmm>` in a file name is UTC**, and matches the `generated:` field inside the file it
names. It is never local time. Pending feedback is decided by comparing these stamps (§14), and a run
that names its report in local time while another names its in UTC makes the loop read the wrong report
and can report a validated feature as failing. `phase_log.py stamp` prints the stamp; `pipeline_progress.py`
picks the newest report by its `generated:` field, so a misnamed file cannot hide a verdict. This is the
one place the rule is stated; every skill that spells the pattern out means this by it.

The six stages, their loop keys and their roots. **The stage roots are not uniform — read
`<stage-input>` and `<stage-output>` from this table, never by pattern.**

| Stage | key | `<stage-input>` | `<stage-output>` | Loop |
|---|---|---|---|---|
| Requirements | `req` | `200 Requirements/220 Input` | `200 Requirements/230 Output` | [req-loop](../req-loop/SKILL.md) |
| F-Spec | `fspec` | `300 Specs/320 F-Specs/Input` | `300 Specs/320 F-Specs/Output` | [fspec-loop](../fspec-loop/SKILL.md) |
| D-Spec | `dspec` | `300 Specs/330 D-Specs/Input` | `300 Specs/330 D-Specs/Output` | [dspec-loop](../dspec-loop/SKILL.md) |
| Code | `code` | `400 Code/Input` | `400 Code/Output` | [code-loop](../code-loop/SKILL.md) |
| Tests | `test` | `500 Tests/Input` | `500 Tests/Output` | [test-loop](../test-loop/SKILL.md) |
| Deploy | `deploy` | `600 Deploy/Input` | `600 Deploy/Output` | [deploy-loop](../deploy-loop/SKILL.md) |

A `<stage-input>` folder is optional: it exists only where a directive has been written for that stage.
A `<stage-output>` folder is created by its loop on first run.

**The code root is `400 Code/Source/`.** Module paths named by the project's directives — its layer
map, its test root, its migration folder — are **relative to the code root**, not to the repository root.
The directives state them relative on purpose: moving the code root must not require rewriting them.

**The running code is not a source of requirements.** `400 Code/Source/` is the as-built description —
the authority on what the system does today. The **design** stage reads it by default, because a design
must place modules in the tree that actually exists. The **requirements** and **functional-specification**
stages do not: they derive from the seed and its product context, and read the code only when the run
explicitly asks for it. A requirement inferred from the current implementation describes what was built,
not what the product must do — and the divergence rule (§6) is then comparing the system against itself.

Reading an existing contract's **names** to avoid colliding with it is not deriving a requirement, and
stays allowed at every stage.

Skills name **tree roles**, never project paths. The project's directives in `<stage-input>/` bind each
role to a path under the code root:

| Role | Holds |
|---|---|
| `<source>` | application source |
| `<web>` | web client source |
| `<mobile>` | mobile app source |
| `<migrations>` | schema revisions |
| `<tests>` | test suite root |

**Code and tests are not written into the stage folders.** Implementation writes under the code root to
`<source>`, `<web>`, `<mobile>` and `<migrations>`; tests are written to `<tests>`.
`400 Code/Output/<feature>/` and `500 Tests/Output/<feature>/` hold only the stage's **manifest, traceability
and reports** — never a copy of the source.

`300 Specs/__old__Specs/` is a dead archive of the reverse-engineered specs of the running system. No
loop reads it and no loop writes to it.

**Artifacts are written in the language the project declares** in `<stage-input>/`, together with the
section names it uses. The headings this file and the loop skills quote are **canonical names**, not the
text to write: a loop writes the project's name for a section and matches on it. A project that declares
no language writes English.

What is **never** translated, because a machine reads it: the identifier scheme of §4, the front-matter
keys and their values (`stage`, `status: draft | validated`, `verdict: SUCCESS | FAIL`), the severities of
§5, the fixed file names (`00-index.md`, `98-divergences.md`, `99-traceability.md`) and the channel names.
Translating one of those is a `blocker`, not a style choice.

Nothing under `.claude/skills/` is ever modified by a pipeline run. Nothing under
`200 Requirements/220 Input/` is modified by a pipeline run either — the seed belongs to its author —
with exactly one exception: [colab-promote](../colab-promote/SKILL.md) copies a **validated**
consolidated seed from `240 Colaborative/241 Merged/` into `220 Input/`, and only when a human has
declared the promotion in the invocation. Stage 0 ([colab-loop](../colab-loop/SKILL.md)) writes under
`241 Merged/` only; nothing writes under `240 Colaborative/<author>/`, which belongs to that author.

## 3. Front matter

Every generated artifact file carries:

```yaml
---
id: <FILE-ID, e.g. FEAT-0003>
title: <short title>
feature: <feature>
stage: req | fspec | dspec | code | test | deploy
status: draft | validated
version: <semver, bumped on every change>
sources: [<ids of the upstream items this file realizes>]
---
```

Every **validation report** carries:

```yaml
---
stage: <key>
feature: <feature>
verdict: SUCCESS | FAIL
generated: <YYYY-MM-DDTHH:mm:ssZ>
counts: {blocker: 0, error: 0, warning: 0, info: 0, divergence: 0}
seed: {revision: N, digest: <sha1-12>}
upstream: {stage: <key>, version: <semver or n/a>}
---
```

`seed:` is produced by `pipeline_progress.py --seed-line <feature>` and pasted verbatim. Never hand-write
the digest.

## 4. Identifier scheme

| Prefix | Stage | Meaning |
|---|---|---|
| `US-<nnnn>` | req | User story |
| `NFR-<nnnn>` | req | Non-functional requirement |
| `AC-<US id>-<nn>` | req | Acceptance criterion of a story |
| `FEAT-<nnnn>` | fspec | Feature specification |
| `REQ-<FEAT id>-<nn>` | fspec | Functional requirement (SHALL / SHOULD / MAY) |
| `FLOW-<nnnn>` | fspec | End-to-end flow |
| `API-<nnnn>` | fspec | API contract |
| `SCR-<nnnn>` | fspec | Screen / view specification |
| `DES-<nnnn>` | dspec | Design item (module, component, integration) |
| `DM-<nnnn>` | dspec | Data model |
| `ADR-<nnnn>` | dspec | Architecture decision record |
| `TEST-<nnnn>` | test | Test specification file |
| `CHK-<TEST id>-<nn>` | test | Individual check |
| `REL-<nnnn>` | deploy | Release / rollout item |
| `OPEN-<nn>` | any | Unresolved question inside a file |
| `ISSUE-<nn>` | any | A finding in a validation report |

IDs are unique across the whole feature and are **never reused** — a withdrawn id is marked withdrawn.

## 5. Severities

| Severity | Meaning | Blocks the verdict |
|---|---|---|
| `blocker` | The artifact cannot be used at all | yes |
| `error` | Must be fixed before the next stage | yes |
| `warning` | Should be fixed; recorded and carried forward | no |
| `info` | Observation | no |
| `divergence` | The artifact is right and the **existing system** is behind it | no |

**Verdict:** any `blocker` or `error` → `FAIL`. Otherwise `SUCCESS`.

## 6. The divergence rule — the spec is normative, the running system is not

The product is live. Almost every feature will specify something the running code and its schema do not
yet do.

A well-formed requirement the current system does not satisfy is a **defect of the system**, not of the
spec. It is recorded as a `divergence`:

- it never contributes to the verdict;
- it is written to the run's report **and** to the durable register `98-divergences.md`, one row per
  divergence, with state `open`, carrying: the requirement id, what the spec requires, what the code does
  today cited at `file:line`, and which stage owes the change;
- the code loop reads that register and owes the change; a row set to `resolved` names the change that
  resolved it.

**Never clear a finding by making the spec agree with the code.** Weakening a `SHALL`, deleting a
requirement, splitting an acceptance criterion so only its satisfied half is judged, or scoping a check
to the part of the system that already passes it are the same move, and every loop treats it as a
**stop condition**, not a repair.

Three things are **not** divergences and stay `error`:

| Not a divergence | Why |
|---|---|
| The artifact contradicts itself or its traceability matrix | it disagrees with itself |
| The artifact contradicts its upstream stage, or covers something upstream does not name | it disagrees with its own source of authority |
| The requirement is unverifiable — no criterion, no check, nothing observable decides it | it cannot be implemented against |

A divergence the validator believes means *the spec is wrong and the system is right* is recorded as
`waived-pending` and escalated through the loop's **Needs human input** stop condition. That is a seed
decision, never the validator's.

## 7. The seed revision

`200 Requirements/220 Input/<feature>/SEED.md` carries `revision:`, `date:` and `author:` in its front matter.

- A new seed starts at `revision: 1`; an **absent field means 1**, on both sides.
- The author bumps it by one whenever the seed changes substantively — a requirement, a story, a
  constraint, the scope. A typo fix is not substantive.
- `date:` moves to the day of the bump. `author:` changes only when ownership does.

Every validation report stamps the revision it judged against.
[pipeline-progress](../pipeline-progress/SKILL.md) then reports:

| State | Meaning |
|---|---|
| `seed-changed` | the seed's `revision:` is past the one the artifacts were validated against |
| `seed-drift` | the `revision:` is unchanged but the body is not what was validated — edited without a bump |

The fix for `seed-drift` is to **bump the revision**, never to re-run the loop and let the digest quietly
catch up. No pipeline skill writes to `200 Requirements/220 Input/`.

## 8. Isolation

Every loop runs its **validator in a subagent with a fresh context**, receiving only the feature, the
artifact paths and the upstream paths — never the generator's reasoning or its rationale for a decision.
Generator and validator are the same model; a validator that sees *why* something was written tends to
agree with it. The subagent boundary and the deterministic gate (lint, build, tests) are the only
independent signals a loop has.

The generator may run in the main context — it needs the accumulated upstream knowledge.

Where the Workflow tool is available, the loops run as workflows (`.claude/workflows/`): every step is a
fresh agent from `.claude/agents/`, the iteration counter and the stop conditions are code, and the
validator is isolated by construction. The main context then holds only the run summary. The workflow
implements the loop skill; the skill remains the specification.

**A validator answers a closed list of questions and reports nothing else.** Every validator skill states
its checks as a numbered, finite rubric. A finding that no numbered check produced is not a finding: it is
the validator reading open-endedly, which turns the report into a *sample* of an unbounded reading rather
than a backlog that shrinks. A check the rubric genuinely lacks is added to the rubric, in the skill, as a
deliberate edit — never improvised inside a run.

**On a re-validation the population is fixed**, and it is the same population every round:

1. every issue of the previous report, re-verified first;
2. every file whose `version:` moved since that report;
3. **two** untouched files, sampled at random.

This is what makes the *No progress* stop condition (§11) mean something: counts compared between two
reports that read different amounts of the artifact are not comparable, and a count can then fall for the
wrong reason. A validator that widens its own population mid-loop has broken the comparison it is about
to be judged by.

## 9. Token accounting

Every loop measures what each phase cost.

- **Phase log**: `<stage-output>/<feature>/reports/token-usage/<loop>-phases-<YYYYMMDD-HHmm>.csv`.
  Create it at run start with the header `label,utc_start`, followed immediately by a `setup` row.
- **Append one row immediately before each sub-skill invocation**, labelled `<iteration>-<sub-skill>`
  (`1-fspec-generator`, `1-fspec-validator`), and one final `END` row when the loop stops — whatever the
  verdict. The deterministic gate needs no row of its own; its cost lands in the open phase.

  ```powershell
  python .claude/skills/pipeline-progress/scripts/phase_log.py open --dir "<stage-output>/<feature>" --loop fspec-loop
  python .claude/skills/pipeline-progress/scripts/phase_log.py row "<log>" 1-fspec-generator
  ```

  The script keeps the clock (UTC) so no model does, and never fails the run.

- Render the aggregate table after the `END` row and emit it in the run summary under a **Token usage**
  heading. Only the aggregate enters the model context — never transcript content.
- `diag-loop` is exempt: a gate is judged by what it catches, never by what it spends.
- Accounting never blocks a loop. If the data is unavailable, write "token usage unavailable" and continue.
  This is absolute: a failure to measure a run never fails the run.

**Every rendered table ends with a legend** defining each column, so a reader who did not write the tool
can act on it. And state the reading, because the raw numbers mislead: **cache reads dominate** — a loop
replays its accumulated context on every API call, at a fraction of the fresh-input price — so the
interpretable signals are the **output tokens** (work actually produced), the **cache writes** (how fast
the context is growing), and **each phase's share of the TOTAL** (which phase is the expensive one). A
phase whose output tokens are low and whose cache reads are high is re-reading, not producing.

## 10. Run summary — the only thing a loop prints

One table, then the token usage, then the artifact paths. Never restate the artifact contents.

```markdown
| Iter | Mode | Gate (b/e/w/i) | Verdict | Issues fixed |
|---|---|---|---|---|
| 1 | A | 0/3/1/0 | — (gate) | — |
| 2 | B | 0/0/0/0 | FAIL (2 errors) | ISSUE-01, ISSUE-02 |
| 3 | B | 0/0/0/0 | SUCCESS (7 div) | ISSUE-03, ISSUE-04 |
```

Then: the verdict, the feature, the artifact folder, the last report path, the divergence count with the
register path, and — if a stop condition fired — **the exact question the user must answer** to unblock it.

## 11. Stop conditions shared by every loop

| Condition | Detection |
|---|---|
| Iteration budget exhausted | `iteration > MAX` (default 5, `--max-iterations N`) |
| No progress | The new report's `blocker`+`error`+`warning` counts are not strictly lower than the previous one's. **Divergences are excluded** — converting an error into a correctly recorded divergence is progress |
| Oscillation | The same `finding` reappears at the same `file` + `location` as in an earlier report. **Before firing it, ask whether the fix was applied at one of the locations the previous report named and not carried to the others** — that is a leaky sweep in a converging loop, not a circle, and the answer is one more round that finishes the sweep. It is a circle when something fixed is re-broken, or when the finding recurs a third time |
| Needs human input | An issue whose fix is not derivable from the inputs: an `OPEN-<nn>`, a contradictory seed, a domain judgement, a product decision |
| Bar-lowering fix | The only way to clear an issue would be to delete a requirement, weaken `SHALL`→`SHOULD`/`MAY`, shrink the scope, move an item to Out-of-scope, or scope a check to the part of the system that already passes it |
| Upstream widening | An issue can only be cleared by adding something the upstream stage does not name, or by dropping something it does. The loop never edits an upstream folder: ask whether the item joins upstream or leaves this stage |
| Surface unfrozen on a fix round | A fix round (Mode B) would have to **add** a requirement, listing, key, parameter, endpoint, field or interface element to clear an issue — see §16. The need goes to `SCOPE-BACKLOG.md`, not into the artifact |
| Evidence would not fit bounded | A finding could only be settled by reading a raw run artifact — a full log, a result set, a dataset — into the context. Reduce it with a script instead (§18); if no reduction answers the question, say so and stop |
| Seed edited without a bump | `pipeline_progress.py` reports `seed-drift` |
| Divergence the user must rule on | A `divergence` marked `waived-pending` |
| Domain-invariant breach | An issue could only be cleared by violating a directive in `<stage-input>/` that the project marked binding |

## 12. Phase input boundaries — a closed read-list per stage

Each stage reads a **closed list** of inputs. A path not on its list is not an input to that stage,
however relevant it looks.

| Stage | Reads as input | Does not read |
|---|---|---|
| **0. Colaborative** | `240 Colaborative/<author>/` · the stage-1 directives (language, section names) | every `<stage-output>/`; the code root |
| **1. Requirements** | the seed folder (`SEED.md`, `DOMAIN.md`, supporting material) · `210 Docs/` (product context) · `220 Input/*.md` directives · this feature's own `reports/` | later stages' outputs; **the code root** |
| **2. F-Spec** | `200 Requirements/230 Output/<feature>/` · `320 F-Specs/Input/` · this feature's `reports/` | the seed folder; `210 Docs/`; **the code root** |
| **3. D-Spec** | `320 F-Specs/Output/<feature>/` · `330 D-Specs/Input/` · **the code root** (as-built placement) · this feature's `reports/` | the seed folder; `230 Output/`; `210 Docs/` |
| **4. Code** | `330 D-Specs/Output/<feature>/` · `400 Code/Input/` · the code root · this feature's `reports/` | the seed folder; `230 Output/`; `320 F-Specs/Output/` |
| **5. Tests** | `330 D-Specs/Output/<feature>/` (test strategy) · `320 F-Specs/Output/<feature>/` (criteria) · `500 Tests/Input/` · the code root | the seed folder; `230 Output/` |
| **6. Deploy** | `500 Tests/Output/<feature>/` · `330 D-Specs/Output/<feature>/` · `600 Deploy/Input/` · the code root | the seed folder; every spec stage's prose |
| **Diagnosis** | whatever the stage under diagnosis may read, plus every stage's reports | — read-only across every boundary, in order to find where one was crossed |

**Why the later stages are fenced.** The upstream artifact is the contract between two stages. If the
implementer may reach back to the seed or the functional spec for a constraint the design failed to state,
that constraint reaches the code **without passing the design gate — and the gap in the design becomes
invisible, because it was silently filled in.** Fencing the stage converts every such gap into a `FAIL
SPEC` finding, which is the only mechanism that gets the upstream artifact fixed. A stage that quietly
reads around its own upstream is not being resourceful; it is destroying the evidence that its input was
incomplete.

Reading an existing contract's or table's **names**, to avoid colliding with it, is not deriving a
requirement and stays allowed at every stage. Writing is governed separately, by §14.

This governs **where a requirement may come from**. It does not restrict the artifacts a stage works on:
Code still reads and writes the code root, and Tests still reads run data. Code is the *product* of a
stage and run data its *evidence*; neither states what the software must do.

## 13. The deterministic gate — a script decides everything a script can decide

Before any model pass, each loop runs
[lint_artifacts.py](../pipeline-progress/scripts/lint_artifacts.py) for its stage. It settles, mechanically:
front matter completeness and legal values; id format, uniqueness and filename agreement; every
acceptance-bearing line carrying an id; every link in the traceability matrix resolving; the index
listing exactly the files that exist, at their versions; no `TBD` and no unresolved `OPEN-<nn>` where the
stage forbids one; the changelog present.

**The model validator never re-judges what the lint owns.** Each validator's rubric says so explicitly. A
model pass spent producing findings a script produces for free is the single most expensive habit a loop
can have — and the script produces them *deterministically*, which the model does not.

A gate failure never spends a semantic pass: turn the lines into `ISSUE-<nn>`, fix through Mode B,
`iteration++`, re-run the gate.

**A gate that examined no file is not a pass.** Compare the files it reports against the files present; a
gap is a `blocker` raised to the user, not something to iterate on.

**Derived tables are generated, never written.** `00-index.md`, `99-traceability.md` and every coverage
table are produced by `lint_artifacts.py --emit` from the requirement, criterion and check lines
themselves. Prose **refers** to a table and never enumerates it. This removes the largest class of finding
in the whole pipeline: *one fact stated in four places, one of them stale*. A generator that hand-writes a
derived file has reintroduced it.

## 14. The write fence — a loop writes only inside its own feature

A run has one **origin feature**. Everything it writes lives under that feature's stage output. It never
writes into another feature — the **target feature** — however small the change looks: not an artifact
file, not a traceability row, not a report of the target's own kinds.

When a run finds that a **target feature must change** — a dependency's requirement is ambiguous, a shared
contract lacks a field, a rule the target owns contradicts this one — it writes a **feedback**:

```
<stage-output>/<target feature>/reports/feedbacks/<origin feature>/feedback-<YYYYMMDD-HHmm>.md
```

One file per target per run, holding every item that run addressed to that target: `FB-<nn>`, one finding
each, with the fields of a validation issue plus `origin:`, `target:`, `origin-stage:` and the origin
report that records the same finding. **A feedback proposes and changes nothing.**

| Origin stage | On the origin's side | Written by |
|---|---|---|
| A spec stage | The finding is a `scope` item of the origin's report, owed by the target. It **never enters the origin's verdict**, so the origin can still reach SUCCESS. The run summary names each feedback sent | that stage's validator, in the step that writes the report |
| An implementation stage | The finding is a `SPEC-ISSUE` of the origin's report carrying `target:`. The run ends FAIL SPEC as for any spec finding | that stage's generator or validator |

**A feedback is considered only when the target next runs the stage that owns the fix.** That run collects
every feedback **newer than the target's newest validation report for that stage** — those are *pending*;
older ones are history — and applies them in **one** Mode C round, so three items cost one loop and not
three. The surface is frozen (§16), so an item needing new surface goes to the target's `SCOPE-BACKLOG.md`.
A declined item is answered in the target's changelog (§17), never dropped silently.

A pending feedback never blocks anything: it is a proposal the target has not judged, and the
target's last SUCCESS stands until its own loop rules on it. `pipeline-progress` shows every feature's pending
feedbacks and their origins, so acting on them is a visible decision rather than a surprise.

Why the fence: a loop that "fixes" a dependency in passing puts a change into a feature outside every gate
— no seed review, no validator pass, no changelog entry — and that feature's own dependents never learn its
surface moved. **A write found in another feature is a process defect, whatever the run produced.**

## 15. The durable domain layer and the scope backlog

Two human-owned files live beside the seed and **survive every regeneration**:

| File | Holds |
|---|---|
| `DOMAIN.md` | The durable domain facts and decisions of this feature: what a term means here, which rule the product follows and why, what the regulator or the protocol requires, what was decided and closed. Every stage may read it (§12); no loop writes it |
| `SCOPE-BACKLOG.md` | Items a loop deferred to the author: surface a fix round may not add (§16), an item declined from a feedback, a question a validator raised that only the seed can answer. One line each, dated, with the run that raised it |

Why they exist: without them a domain decision taken in round 3 of a loop has nowhere durable to land, so
it is re-derived — or re-argued — at the next stage and at the next run, and the reasoning is lost in a
report nobody re-reads. A loop **proposes** an entry for either file in its run summary; the author writes
it. Nothing under `220 Input/` is written by a pipeline run (§2), and these are no exception.

## 16. Frozen surface on a fix round

A **Mode B** round exists to clear the issues in a report. It **adds no requirement, listing, key,
parameter, endpoint, field, screen or interface element** that the failing artifact did not already carry.

A validator's rubric rewards completeness, and a generator asked to satisfy it will grow the artifact to
do so. Left unfenced, the artifact converges on something larger than the seed asked for, and no one can
say which round introduced what. So: a need for new surface is not a fix. It goes to `SCOPE-BACKLOG.md`
(§15) for the author, and the run stops on **Surface unfrozen on a fix round** (§11) if that is the only
way to clear the issue.

Mode A (generate from a moved upstream) and Mode C (apply a feedback) may add surface — each has an
upstream item authorising it.

## 17. The changelog — a declined item is answered, never dropped

`<stage-output>/<feature>/97-changelog.md`, appended by the generator, one dated entry per round:
what changed, which issues or feedback items it closed, and — the part that matters — **every item that
was declined, with the reason**.

A feedback item, a deferred requirement or a validator finding that is not acted on must be *answered*
somewhere the person who raised it will look. Silence reads as agreement and the item returns, round after
round, as a new finding.

The same discipline binds regeneration of anything that already exists: **no check is ever lost.** When a
suite or a specification is regenerated, every existing item migrates under its own id; a modification is
recorded in the changelog's migration table; and a **removal requires explicit human approval**, logged
there. This case is the dangerous one, because coverage falls and the run still reports SUCCESS.

## 18. Bounded evidence — raw data never enters the model context

**No raw run artifact may be read into the context**: not a full test-runner log, not a result set, not a
dataset, not a migration or deploy log — not with `Read`, not with `cat`/`Get-Content`, not with a grep
that returns bodies.

All of it is reduced by a **local script** that prints a bounded summary: counts, the failing ids, the
first line of each distinct error, a schema check. `diag_harvest.py` does this for a diagnosis;
[reduce_run.py](../pipeline-progress/scripts/reduce_run.py) does it for a test, migration or deploy run.

Three reasons, and the third is not about cost:

1. **Token cost becomes independent of data size** — a 40k-line failing run costs what a 400-line one costs.
2. **Reproducibility** — a scripted reduction gives the same answer twice; a model skimming a log does not.
3. **Confidentiality** — this pipeline's later stages touch real data. A production-shaped record pulled
   into a context is a disclosure, and no finding is worth one.

If no reduction answers the question, that is the **Evidence would not fit bounded** stop condition (§11):
say what you would need and stop. Never widen the read instead.

## 19. Report discipline — a report is for the next round, not for a reader

Every report the pipeline writes is **front matter, a title, and a list of entries. Nothing else.** No
introduction, no narrative of the pass, no list of what was found sound, no closing summary.

There is no limit on the number of entries. Each entry is **fields only, one line per field**: the defect
in one sentence and the expected state in one sentence.

The consumer of a report is the next generator round, which needs the entries and uses nothing else. And
the cost compounds: a report is loop memory, replayed on every subsequent iteration, so prose written once
is re-read five times.

## 20. Editing a pipeline skill

The skills under `.claude/skills/` are the tooling, not the product. When editing one:

- **A skill never names the project.** Not its name, not a domain term, not a domain rule, not a project
  file, not a module path, not a framework or a runner. Those reach a loop only through
  `<stage-input>/`, at run time. Concretely, a skill may not contain: the product's name; a word from its
  problem domain; an entity or field name; a path outside the stage folders; a library, tool or command
  name. The test is mechanical — a skill that would need editing to run on a different product has
  already broken the boundary. When a check genuinely needs a domain fact, the skill says *what kind of
  fact it needs* and reads it from `<stage-input>/`; the fact itself is the project's to state.
- **A rule stated here is stated here and nowhere else.** A loop skill that restates it will drift from
  it, and the two will then disagree in a way nobody notices until a run goes wrong.
- **A check that cannot be tested is a wish.** Prefer a check a script can settle over a paragraph asking
  for care.
- **The generator and the validator of a stage are edited together** — a check the validator gains is a
  rule the generator must already follow, or the loop cannot converge.
- **No pipeline skill may write outside its own stage's `Output/` folder**, plus the source trees the code
  and test stages own (`<source>`, `<web>`, `<mobile>`, `<migrations>`, `<tests>`).
- **Every loop skill states its stop conditions as a delta** to §11, never as a copy of it.
- **A loop skill, its workflow and its agents are edited together.** A stop condition, a mode or an
  output a skill gains must reach `.claude/workflows/<loop>.js` (or `spec-loop.js`) and the JSON contract
  of `.claude/agents/<stage>-*.md` in the same change, or the workflow runs the old loop.
- A proposal to change a rule here comes from [diag-retro](../diag-retro/SKILL.md), carries its evidence
  and its cost, and is decided by a human.
