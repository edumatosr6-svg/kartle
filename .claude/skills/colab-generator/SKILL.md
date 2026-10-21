---
name: colab-generator
description: 'Organize, merge and split every collaborator draft under "200 Requirements/240 Colaborative/<author>/<feature>/SEED.md" into one consolidated seed set under "200 Requirements/240 Colaborative/241 Merged/<feature>/", each seed naming the drafts it came from, every merge/split/rename/decline recorded in the decisions register, and every disagreement between authors carried as an OPEN-<nn> — never settled by the model. Use when: colab-loop invokes it (Mode A first round, Mode B after a FAIL Colab Validation Report, Mode C when drafts were revised since the last round); the user asks to consolidate the collaborative drafts. Reads the drafts and writes only under 241 Merged/. Never edits a draft, never writes to 220 Input, and never invokes the validator — the loop lives in colab-loop.'
argument-hint: 'Mode A | B <report path> | C, and the round number. Optionally --feature <merged feature> to limit a Mode C pass'
---

# Colab Generator — one set out of many drafts

Reads every author's drafts side by side and writes the **consolidated set**: one seed per mechanism,
written to the seed template, carrying its provenance and its open questions. It is the generator half
of the Colaborative Requirements process; [colab-validator](../colab-validator/SKILL.md) is the other
half and [colab-loop](../colab-loop/SKILL.md) drives them.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md) and
[seed-authoring](../seed-authoring/SKILL.md) — the consolidated seed **is** a seed and obeys every rule
there (what-not-how, phase A before phase B, the size budget, the criteria rules). The section names
and the language come from the project's directives in `200 Requirements/220 Input/`.

## The rule that shapes this skill

**A disagreement between authors is a question, never a decision.** Where two drafts state different
facts about one thing — a threshold, an actor's power, a state, what is in scope — the consolidated seed
carries **both positions, attributed, as one `OPEN-<nn>`**, and the surrounding text is written so that
either answer fits. Picking one silently is the one defect this process exists to prevent, and the
validator treats it as an `error`.

What the generator *does* decide, and records in the decisions register: which drafts describe the same
mechanism (merge), which draft describes two (split), what the consolidated feature is called (rename),
which drafts are carried as they are (keep), and which are not carried at all (decline, with the reason
— an author's draft is never dropped silently).

## Artifact locations

| Role | Path |
|---|---|
| Input — drafts | `200 Requirements/240 Colaborative/<author>/<feature>/SEED.md` (+ sibling `.md` notes) |
| Input — product context | `200 Requirements/210 Docs/` — context, never a source of requirements |
| Input — directives | `200 Requirements/220 Input/*.md` (language, section names, invariants); never a seed folder |
| Input — a FAIL report (Mode B) | `241 Merged/reports/colab-validation/colab-validation-<stamp>.md` |
| Output — consolidated seeds | `200 Requirements/240 Colaborative/241 Merged/<feature>/SEED.md` |
| Output — decisions register | `241 Merged/01-decisions.md` |
| Output — reading order | `241 Merged/ORDER.md` (so [req-docx-export](../req-docx-export/SKILL.md) can render the set) |
| Generated, never hand-written | `241 Merged/00-index.md` — by `colab_tools.py index` |
| Deterministic core | [colab_tools.py](../colab-loop/scripts/colab_tools.py) |

Folder names contain spaces: **always quote paths.** Author folders are every folder under
`240 Colaborative/` whose name does not start with a digit, `.` or `_`; `241 Merged` is therefore never
read as an author.

## Modes

| Mode | Trigger | Behaviour |
|---|---|---|
| **A** | No consolidated set yet, or the loop asks for a rebuild | Read every draft; write the whole set and the register |
| **B** | A FAIL Colab Validation Report | Fix **only** the `ISSUE-<nn>` items it lists; touch nothing else |
| **C** | `colab_tools.py inventory` reports drafts `new`, `revised` or `removed` since the last round | Re-read the changed drafts and every consolidated seed whose `sources:` name them; re-merge those seeds only; close each `OPEN-<nn>` the revised draft now answers; carry the rest untouched |

In Mode B every issue is closed by an edit or by a `DEC-<nn>` that records why it stands. An issue left
open without either is a defect of this run.

In Mode C an author's answer arrives as a **revised draft** (higher `revision:`), never as a reply file.
An `OPEN-<nn>` is closed only when the revised draft states the fact; the closing edit cites the draft
and its revision in the seed's `## Riscos e pontos em aberto` (canonical *Risks and unknowns*) as a
one-line resolved entry, so the trail survives.

## The consolidated seed

Same template as [seed-authoring](../seed-authoring/SKILL.md), with a front matter that adds provenance:

```yaml
---
name: <feature>
description: <one sentence>
revision: <n>              # this seed's own counter; +1 every round that changes its body
date: <YYYY-MM-DD>
author: <author-a>, <author-b>   # every author whose draft it carries
channels: [web, whatsapp, API]
status: draft              # the validator sets validated
round: <n>
sources:                   # one line per draft, exactly this flow form — a script reads it
  - {author: goes, feature: usuarios-e-permissoes, revision: 7}
  - {author: eduardo, feature: usuarios-permissoes-e-isolamento, revision: 3}
---
```

Rules for the body:

- **Every statement traces to a draft.** The consolidated seed adds no story, rule, constraint, NFR or
  out-of-scope item that no draft states. Glue prose (a sentence that joins two authors' paragraphs)
  is allowed; a new requirement is not — it goes to the drafts' authors as an `OPEN-<nn>`.
- **Nothing an author wrote is lost silently.** A draft item that does not land in a seed lands in a
  `decline` decision with its reason, and the author will see it in the questions file.
- **One mechanism, one feature.** Two drafts of one mechanism become one seed; a draft that describes two
  mechanisms is split, and the register says which half went where. A rule never ends up in a different
  feature from its only consumer.
- **Vocabulary is set once.** The overview feature (the one the drafts agree defines the terms) is written
  first; every other seed uses its terms and redefines none. Two drafts using one term in two senses
  is an `OPEN-<nn>` in the overview seed.
- **Open points are one register per seed.** `OPEN-<nn>` ids are unique within a seed, defined once as
  a bullet in the *Risks and unknowns* section, each naming the positions and the authors:
  `- **OPEN-03**: goes (rev 7) exige CRM validado no cadastro; eduardo (rev 3) aceita cadastro sem CRM até a primeira prescrição — qual vale?`
- **No `TBD`.** A gap is an `OPEN-<nn>` or it is not there.

## The decisions register — `01-decisions.md`

One `### DEC-<nn>` block per decision, fields only, machine-read:

```markdown
### DEC-04
- type: merge
- sources: goes/usuarios-e-permissoes@7; eduardo/usuarios-permissoes-e-isolamento@3
- target: usuarios-e-permissoes
- reason: um mecanismo — papéis, permissões e isolamento por clínica — visto por dois autores
```

`type` is one of `merge | split | rename | keep | decline`. `target` lists the consolidated feature(s), or
`-` for a decline. A `split` names every target; a `keep` records that a single draft became a seed under
its own name, unchanged in scope. Ids are stable across rounds — a decision revised in a later round keeps
its id and gains a `- revised: round <n>` line.

## Procedure

1. Run `python .claude/skills/colab-loop/scripts/colab_tools.py inventory --json` and read the draft
   list, states and problems. A draft with `problems` is not merged: stop and report it — the author
   fixes their own front matter.
2. Read the directives in `200 Requirements/220 Input/*.md` for language and section names. Read the
   drafts in this order: every author's overview feature first, then the rest, author by author.
3. Build the feature plan: cluster drafts by mechanism (not by name — `ciclo-de-vida-do-episodio` and
   `cadastro-e-prescricao-do-posop` + `encerramento-do-acompanhamento` may be one cluster), decide
   merge/split/rename/keep/decline, and write `01-decisions.md` **before** any seed, so every seed can
   cite its decision.
4. Write each consolidated seed: phase A sections from the drafts' phase A, then phase B; disagreements
   as `OPEN-<nn>`; provenance in `sources:`.
5. Write `ORDER.md` if absent — `python .claude/skills/req-docx-export/scripts/req_docx_export.py
   "241 Merged" --init`, then put the entries in reading order (overview first).
6. Render the index: `python .claude/skills/colab-loop/scripts/colab_tools.py --lang <project> index
   --round <n> --status draft`. Never edit `00-index.md` by hand.
7. Run `... colab_tools.py lint`. Fix every `error` it prints before returning; a `stale` warning in
   Mode A means a draft moved while you were writing — report it, the loop restarts the round.
8. Return: the mode, the features written, the decisions added or revised, the count of `OPEN-<nn>`
   per seed, and the lint result.

## Bindings — stated in [pipeline-conventions](../pipeline-conventions/SKILL.md), not restated here

- **Derived files are never written here** (§13). `00-index.md` is generated by
  `colab_tools.py index` from the merged seeds' `sources:` and the decisions register. Write the seeds
  and the register; the map follows.
- **The write fence** (§14) applies with one addition of its own: stage 0 writes under `241 Merged/`
  only. An author's folder is never written to by any skill — an answer arrives as a **revised draft**,
  which is why the questions file asks for a `revision:` bump rather than a reply.
- **The changelog discipline** (§17) is served here by `01-decisions.md`: a draft that is not carried
  is **declined with a reason**, and the author reads that reason in the questions file. Nothing an
  author wrote is ever dropped in silence.

## Quality rules (self-check)

- No draft was edited, no file was written outside `241 Merged/`, nothing was written to `220 Input/`.
- Every consolidated seed has `sources:` that resolve, and every draft is in a seed's `sources:` or in a
  `decline` decision — `lint` reports zero errors.
- No disagreement between authors was resolved by this skill; each is an `OPEN-<nn>` naming both.
- No requirement exists in the set that no draft states.
- The seed template, the section names and the language are the project's, per its directives.
- The validator was not invoked, and its reasoning was not anticipated: write the set, not a defence of it.
