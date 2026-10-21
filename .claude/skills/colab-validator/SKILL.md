---
name: colab-validator
description: 'Validate the consolidated seed set under "200 Requirements/240 Colaborative/241 Merged/" against the collaborator drafts it was built from: every draft carried or declined with a reason, nothing invented, every disagreement between authors surfaced as an OPEN-<nn> rather than settled, one mechanism per feature, and each seed fit to enter req-loop as a seed. Use when: colab-loop invokes it after colab-generator; the user asks whether the consolidated drafts are faithful to what the collaborators wrote. Emits SUCCESS (set ready for the questions round and, once answered, for promotion) or FAIL with a machine-consumable Colab Validation Report. Runs isolated — never sees the generator''s reasoning, never edits a seed, a draft or the register.'
argument-hint: 'The round number; optionally --feature <merged feature> to limit the pass'
---

# Colab Validator — is the consolidated set what the authors wrote

Reads the drafts and the consolidated set **without** the generator's reasoning and asks, per seed:
does every statement come from a draft, did every draft land somewhere, and where the authors disagree,
is the disagreement still visible?

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md) (severities, verdicts, isolation,
report discipline) and [seed-authoring](../seed-authoring/SKILL.md) (what a seed must be — the
consolidated seed is judged as a seed, because `req-loop` will read it as one).

## Artifact locations

| Role | Path |
|---|---|
| Reference — drafts | `200 Requirements/240 Colaborative/<author>/<feature>/SEED.md` and sibling `.md` |
| Reference — directives | `200 Requirements/220 Input/*.md` (language, section names, invariants) |
| Under judgement | `200 Requirements/240 Colaborative/241 Merged/<feature>/SEED.md`, `01-decisions.md`, `00-index.md` |
| Output — report | `241 Merged/reports/colab-validation/colab-validation-<YYYYMMDD-HHmm>.md` |
| Output — on SUCCESS only | `status: validated` in each seed's front matter and in the index (via `colab_tools.py index --status validated --verdict SUCCESS`) |
| Deterministic core | [colab_tools.py](../colab-loop/scripts/colab_tools.py) |

Folder names contain spaces: **always quote paths.**

## Two layers

The **mechanical layer** was already decided by `colab_tools.py lint` before this skill ran: front
matter, `sources:` resolving, every draft carried or declined, decisions well-formed, ids unique, no
`TBD`. Do not re-judge it. If the loop passed a set that fails `lint`, that is a `blocker` in the report
and the pass stops there.

The **semantic layer** is the closed list below. Answer these seven checks and **report nothing else** —
a finding outside them is not a finding of this validator.

## Checks

### C1 — Fidelity: nothing invented

Every story, domain rule, constraint, NFR, out-of-scope item and open point in a consolidated seed
traces to at least one draft in its `sources:` (`error` when it does not — cite the seed line; it belongs
in an `OPEN-<nn>` addressed to the authors, not in the seed). Glue prose that joins two authors' text
without adding a claim is fine.

### C2 — Completeness: nothing lost

For every draft, every story, rule, constraint, NFR, out-of-scope item and open point is present in the
seed(s) that carry the draft, or is named in a `decline` decision's reason (`error` per item lost
silently). Sample fully: read each draft against its target seed, not the other way round.

### C3 — Disagreements surfaced, never settled

Where two drafts state different facts about one thing — a value, a threshold, an actor's power, a
state, a scope boundary, a term's meaning — the seed carries **one `OPEN-<nn>` naming both positions and
both authors**, and the surrounding text does not presuppose either answer (`error` when the seed
adopts one position without an OPEN, or carries an OPEN whose neighbouring text already assumes the
answer). This is the check the process exists for; read for it deliberately, pairwise across the
drafts of each seed.

### C4 — One mechanism, one feature

A merge unites drafts of the same mechanism; a split separates mechanisms; neither separates a rule from
its only consumer (`error`). Two consolidated seeds that both state a rule about the same mechanism are
a missed merge (`error`). A decision's `reason` states the mechanism, not the resemblance of the names
(`warning`).

### C5 — Fit to be a seed

Against [seed-authoring](../seed-authoring/SKILL.md): states what must be true, never how to build it
(`error` on an endpoint, table, module or component that no draft imposed as a deliberate constraint);
phase A sections complete before phase B claims (`error`); every acceptance-bearing statement observable
and decidable (`error`); channels declared and consistent with the drafts (`error`); within the size
budget (`warning`). Section names and language are the project's per its directives (`error` on a
canonical English heading left in a project that declares otherwise).

### C6 — Vocabulary

Terms are defined in the overview seed and used in that sense everywhere; a term used in two senses
across seeds is an `error` unless it is already an `OPEN-<nn>` in the overview seed. A term a draft uses
that the overview never defines is a `warning`.

### C7 — Decisions register

Every merge, split, rename and decline visible in the feature map has a `DEC-<nn>` whose sources and
targets match it (`error`); every `DEC-<nn>` reason is a sentence a collaborator could disagree with
(`warning` when it is a restatement of the type). A decline's reason must not be a scope judgement the
drafts do not support — "out of scope" is valid only when a draft's out-of-scope list, or the overview
seed, says so (`error`).

## Verdict

- Any `blocker` or `error` → **FAIL**.
- Otherwise → **SUCCESS**, whatever the number of `OPEN-<nn>` — open points are the *product* of a
  successful round, not a defect of it. On SUCCESS, set `status: validated` in every seed's front matter
  and run `colab_tools.py index --status validated --verdict SUCCESS`.

`warning` and `info` are carried, never chased.

## Procedure

1. Confirm `lint` was passed by the loop (its output is in the invocation). Otherwise `blocker`, report,
   stop.
2. Read the directives, then the overview seed, then every consolidated seed and `01-decisions.md`.
3. For each seed, read its `sources:` drafts in full and run C1–C7. On a re-validation (a previous report
   exists for this round), **re-verify every issue of the previous report first**, then the seeds whose
   `revision:` moved, then two untouched seeds sampled at random — the same population every round.
4. Write the report. Front matter, title, entries. Nothing else.
5. On SUCCESS, stamp `status: validated` and re-render the index.

## Report format

```markdown
---
stage: colab
round: <n>
verdict: SUCCESS | FAIL
generated: <YYYY-MM-DDTHH:mm:ssZ>
counts: {blocker: 0, error: 0, warning: 0, info: 0}
open_items: <total OPEN-<nn> across the set>
drafts: {authors: [..], count: <n>}
---

# Colab Validation Report — round <n>

### ISSUE-01
- severity: error
- check: C3
- file: 241 Merged/usuarios-e-permissoes/SEED.md
- location: ## Histórias de usuário, story 2
- finding: adopts goes@7 "CRM validado no cadastro"; eduardo@3 admits a user without CRM until first prescription — no OPEN carries the difference
- expected: one OPEN-<nn> naming both positions and both authors; story text neutral to the answer
```

One `### ISSUE-<nn>` per finding, fields only, one line per field. No summary, no narrative, no list of
what was found sound — [conventions §19](../pipeline-conventions/SKILL.md).

The closed rubric above and the deterministic-gate split are the same rules as every other stage
(§8 and §13); stage 0 differs from them in exactly one way, and it is deliberate: **an `OPEN-<nn>` is
the product of a successful round here, not a defect**, so it never enters the verdict. Everywhere
else, an unresolved open item fails the gate.

## Quality rules (self-check)

- The generator's reasoning was not read; the invocation carried paths and the round number only.
- Only C1–C7 produced findings.
- No seed, draft, decision or index body was edited; on SUCCESS only `status:` and the index front matter moved.
- An `OPEN-<nn>` was never counted against the verdict.
- Every issue names a file, a location, the finding and the expected state.
