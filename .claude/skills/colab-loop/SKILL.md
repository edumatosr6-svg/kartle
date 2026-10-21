---
name: colab-loop
description: 'Run the Colaborative Requirements process (stage 0) to convergence for one round: read every collaborator draft under "200 Requirements/240 Colaborative/<author>/", drive colab-generator (organize, merge, split) ↔ colab-validator (isolated) until the consolidated set under "241 Merged/" passes, then publish the questions the collaborators must answer by revising their drafts. Use when: the drafts of every collaborator are in and the Product Owner asks to consolidate them; drafts were revised after a questions round and the next round must run; the user says "merge the drafts", "consolidate the requirements", or asks what is still open across the collaborators. Owns the iteration counter and the stop conditions; the generator and the validator never invoke each other. Never writes to 220 Input — promotion is a separate, human-declared step (colab-promote).'
argument-hint: 'Optional: --max-iterations N (default 5), --rebuild (force Mode A), --feature <merged feature> to limit a Mode C pass'
---

# Colab Loop — stage 0 driver (`200 Requirements/240 Colaborative`)

Drives **organize/merge → lint → validate → fix** until the consolidated set is faithful to the drafts
and fit to be seeds, then hands the collaborators the questions the set cannot settle. One invocation
is **one round**; a round ends with a validated set and a questions file, and the next round starts
when the drafts have been revised. This skill owns the round and the iteration counter; it is the
only place either exists.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md). The process is drawn in
[SW_Dev_Processes.md](../../../100%20Admin/120%20Processes/SW_Dev_Processes.md), section 0.

## Driver — the loop runs as a workflow

The procedure below is the **specification** of this loop; `.claude/workflows/colab-loop.js` is its
**implementation**. Where the Workflow tool is available, invoking this skill means running it — and
only after the Product Owner has declared the integration in this invocation:

```
Workflow({ name: "colab-loop", args: { integrationDeclared: true, lang: "pt-BR", maxIterations: 5 } })
```

`rebuild: true` forces Mode A; `feature: "<merged feature>"` narrows a Mode C pass. Each step is a fresh
agent from `.claude/agents/` — `pipeline-gate` (a small model) for `colab_tools.py` and the phase log,
`colab-generator`, and `colab-validator`, isolated by construction. The workflow claims the whole set
under the reserved name `_colab` (`.claude/hooks/feature_lock.py`), stops on a stale draft, and on
SUCCESS publishes the questions file. It never promotes: `colab-promote` stays a human-declared step.

Run the procedure by hand only when the Workflow tool is unavailable, and say so in the summary.

## Artifact locations

| Role | Path |
|---|---|
| Sub-skill — generator | [colab-generator](../colab-generator/SKILL.md) |
| Sub-skill — validator | [colab-validator](../colab-validator/SKILL.md) |
| Follow-up — promotion | [colab-promote](../colab-promote/SKILL.md), never invoked by this loop |
| Input — drafts | `200 Requirements/240 Colaborative/<author>/<feature>/SEED.md` |
| Input — directives | `200 Requirements/220 Input/*.md` (language, section names, invariants) |
| Under work | `200 Requirements/240 Colaborative/241 Merged/` |
| Loop memory | `241 Merged/reports/colab-validation/` |
| Questions to the collaborators | `241 Merged/reports/questions/questions-round-<n>.md` |
| Token usage | `241 Merged/reports/token-usage/` |
| Deterministic core | [colab_tools.py](scripts/colab_tools.py) — `inventory`, `index`, `lint`, `questions` |

Folder names contain spaces: **always quote paths.**

Rules:

- The unit of work is **the whole set**, not a feature: the point of the process is reading the drafts
  side by side. `--feature` only narrows a Mode C pass to the consolidated seeds it names.
- Never write anything under `240 Colaborative/<author>/`, `220 Input/`, or `.claude/skills/`.
- Never run when `220 Input/README.md` says the integration has not been declared and the user has not
  declared it in the invocation — the gate there is a Product Owner's decision, not a computed one.
  Ask, do not assume.

## When to use

- Every collaborator has posted, and the Product Owner has said the drafts are to be consolidated.
- A questions round was answered (drafts revised, `revision:` bumped) and the next round must run.
- A previous round stopped on a stop condition and the cause was removed.

Do **not** use it to validate only ([colab-validator](../colab-validator/SKILL.md)), to make a one-off
edit ([colab-generator](../colab-generator/SKILL.md)), or to promote ([colab-promote](../colab-promote/SKILL.md)).

## Loop

Set `iteration = 1`, `MAX = 5` (override with `--max-iterations N`). Read the project's language from
the directives and pass it as `--lang` to every `colab_tools.py` call that writes.

### 0. Resolve state

```powershell
python .claude/skills/colab-loop/scripts/colab_tools.py inventory --json
```

| Inventory says | Round | First generator mode |
|---|---|---|
| No draft at all | — | stop: nothing to consolidate |
| Any draft with `problems` | — | stop: name the draft and the author; the author fixes their front matter |
| No merged set (`status: absent`), or `--rebuild` | 1 (or `round + 1`) | **A** |
| Merged set exists, `changed_since_merge: true` | `round + 1` | **C** — the changed drafts and the seeds whose `sources:` name them |
| Merged set `status: draft`, nothing changed, a FAIL report exists | same round | **B** with the newest report — resume |
| Merged set `status: validated`, nothing changed | — | stop: report the round already validated, point to its questions file and to `colab-promote` |

Open the phase log (conventions §9) as `241 Merged/reports/token-usage/colab-loop-phases-<stamp>.csv`.

### 1. Generate

Invoke `colab-generator` in the mode resolved, with the round number and, in Mode B, the report path.
It writes the seeds, the decisions register, the reading order, and renders the index.

### 2. Deterministic gate

```powershell
python .claude/skills/colab-loop/scripts/colab_tools.py lint
```

Any `error` → turn the lines into a Mode B round (`iteration++`, back to step 1) without spending a
semantic pass. A `stale` warning means a draft moved during the run: **stop** with *Draft edited
mid-run* — the round restarts from step 0, because a set validated against a draft that no longer
stands is not validated.

### 3. Semantic validation

Invoke `colab-validator` **in a subagent with a fresh context**, passing only the round number, the
paths, and the lint output. It writes `reports/colab-validation/colab-validation-<stamp>.md`.

### 4. Read the verdict

- `SUCCESS` → the validator has set `status: validated`. Go to step 5.
- `FAIL` → evaluate the stop conditions; if none fire, `iteration++` and return to step 1 in Mode B.

### 5. Publish the questions

```powershell
python .claude/skills/colab-loop/scripts/colab_tools.py --lang <project> questions --round <n>
```

Close the phase log, render the token usage, and emit the run summary (conventions §10) plus, for this
loop, the **next step the humans own**: how many open points, addressed to whom, in which file; and
that the set is promotable now with `colab-promote` (open points become `OPEN-<nn>` in the seeds and
`req-loop` will stop on them) or after the drafts are revised and the next round runs.

## Stop conditions

The shared list in [pipeline-conventions §11](../pipeline-conventions/SKILL.md), plus:

| Condition | Detection |
|---|---|
| Integration not declared | The invocation carries no declaration and `220 Input/README.md` records none. A Product Owner's decision |
| Draft not well-formed | `inventory` reports `problems` on a draft — the author owns the fix |
| Draft edited mid-run | `lint` reports `stale` after the generator ran, or the inventory digest differs between step 0 and step 4 |
| Disagreement the model settled | A validator `error` on C3 that Mode B could clear only by picking a side. It is cleared by writing the `OPEN-<nn>`; if the generator cannot phrase the seed neutrally to both positions, the question goes to the authors as it stands |
| Scope of the product itself in dispute | Two overview drafts disagree on what the product is or which release this is, and no `OPEN-<nn>` can hold the seeds together. A Product Owner's decision, not a merge |

Open points never stop the loop and never count against SUCCESS: they are what the round produces.

## Quality rules (self-check)

- The round number and the iteration counter exist in exactly one place: this skill.
- Every semantic pass writes a report; the reports folder is the round's audit trail.
- `status: validated` is never set by this skill — only by `colab-validator` on SUCCESS.
- No seed, decision or draft is edited by this skill; all writes go through `colab-generator` or the
  deterministic core.
- Nothing was written to `220 Input/`. A run that ends SUCCESS has produced a *promotable* set, not a
  promoted one.
- A round that stops on a stop condition is a normal outcome, not an error to hide.
