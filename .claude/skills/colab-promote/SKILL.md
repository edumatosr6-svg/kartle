---
name: colab-promote
description: 'Promote validated consolidated seeds from "200 Requirements/240 Colaborative/241 Merged/<feature>/" into "200 Requirements/220 Input/<feature>/", where the pipeline reads them. The only step in the whole pipeline that writes to 220 Input, and it does so only because a human said so in this invocation — never on a computed condition. Use when: colab-loop ended SUCCESS and the Product Owner declares the integration; a later round re-validated a seed that is already in Input and it must be replaced. Refuses a set that is not validated, a seed with open points unless told to carry them, and an Input seed it would overwrite unless told to update it. Writes a promotion record; never edits a draft, a merged seed or a report.'
argument-hint: '--feature <s> (repeatable) or --all; --allow-open to carry OPEN items; --update to replace a seed already in Input. Dry run without --yes'
---

# Colab Promote — the declared step into `220 Input`

Copies consolidated seeds into the folder the pipeline reads. It is small on purpose: the judgement
was made by [colab-validator](../colab-validator/SKILL.md), the decision is made by the human invoking
this, and the skill only refuses what neither has authorised.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md) §2 — *nothing under `220 Input/` is
written by a pipeline run* has exactly one exception, and it is this skill, and only with `--yes`.

## Artifact locations

| Role | Path |
|---|---|
| Input — validated set | `200 Requirements/240 Colaborative/241 Merged/<feature>/` (`00-index.md` must say `status: validated`) |
| Output — seeds | `200 Requirements/220 Input/<feature>/SEED.md` plus sibling `.md` and attachments |
| Output — record | `241 Merged/reports/promotions/promotion-<YYYYMMDD-HHmm>.md` |
| Tool | [colab_tools.py](../colab-loop/scripts/colab_tools.py) `promote` |

Folder names contain spaces: **always quote paths.**

## Procedure

1. **Confirm the declaration.** The invocation must say, in the user's words, that the integration is
   to happen. "Is the set ready?" is a question for [pipeline-progress](../pipeline-progress/SKILL.md)
   and the questions file, not a promotion. When in doubt, run the dry run and ask.
2. **Dry run first, always:**

   ```powershell
   python .claude/skills/colab-loop/scripts/colab_tools.py promote --all
   ```

   Read the plan and every `refused:` line. Show them to the user as they are.
3. **Decide with the user** on each refusal — never around it:
   - *not validated* → run `colab-loop` first; there is no override.
   - *N OPEN item(s)* → either the authors answer them (revise the drafts, run the next round) or the
     user says the open points go in as `OPEN-<nn>` of the seed, knowing `req-loop` stops on them
     (*Needs human input*). Then `--allow-open`.
   - *already in Input* → the merged revision must be above the Input revision; then `--update`. The
     downstream stages will see `seed-changed` and re-run — that is intended.
4. **Promote** with `--yes` and the flags the user chose. Present the script's output; the record it
   writes is the audit trail.
5. Point the user to the next step: `/req-loop <feature>` per promoted feature, and
   `pipeline_progress.py` to see them in the chain.

## What the promotion changes in a seed

The merged seed is copied as it is, minus the two keys that belong to the merge (`status`, `round`).
`revision:`, `date:`, `author:` (every contributing author) and `sources:` are kept, so a promoted seed
says which drafts, at which revisions, it came from. `revision:` continues from the merge counter: a
seed promoted at revision 3 and re-promoted after another round arrives at 4 or higher, and the
pipeline's seed-revision rule (conventions §7) works unchanged.

## Quality rules (self-check)

- Nothing was written without `--yes`, and `--yes` was given only after the user declared the promotion
  in this conversation.
- No refusal was worked around by editing a merged seed, the index or a report.
- The promotion record exists and lists every feature written.
- No draft under `240 Colaborative/<author>/` was touched.
