---
name: project-scaffold
description: 'Create the pipeline''s folder tree in a repository root: the six numbered stage folders with their Input/Output sides, the requirements seed and collaborative folders, the admin folders, a .gitkeep in every folder git would otherwise lose, a README per stage, and a .gitignore when the root has none. Use when: starting a new project from a copy of .claude/; a folder a loop expects is missing; checking an existing repository against the layout the skills assume. Idempotent and non-destructive — it never overwrites anything that has content.'
argument-hint: 'Optional: --check to report without writing, --root PATH for a repository other than the current one, --minimal for pipeline folders only'
---

# project-scaffold — the tree the loops expect, in a root that has none

Creates the folder structure every other skill assumes exists. It is what turns a folder holding
nothing but a copied `.claude/` into a repository the six loops can run in.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md) §2, which is where the layout is
defined. This skill only *realizes* that table — if the two ever disagree, the conventions win and this
skill is the one that gets corrected.

It is not a stage: no feature, no loop, no validator, no verdict, no report.

## Artifact locations

| Role | Path |
|---|---|
| Output — the tree | the repository root given by `--root`, default the current directory |
| The scaffolder | [scaffold_project.py](scripts/scaffold_project.py) |

Folder names contain spaces: **always quote paths.**

## When to use

- A new project: `.claude/` has been copied into an empty folder and nothing else is there yet.
- A loop reported a missing folder, or `pipeline-progress` found a stage root that does not exist.
- Auditing an existing repository against the layout — `--check` writes nothing and exits 1 if
  anything is absent, so it works in a pre-commit hook or a CI job.

Do **not** use it to create a feature's folders. Those are created by the feature's stage loop on first run,
and a folder created here ahead of one would read as `orphan-output` to
[pipeline-progress](../pipeline-progress/SKILL.md).

## How to run

Starting a new project, from the folder `.claude/` was copied into:

```powershell
python .claude/skills/project-scaffold/scripts/scaffold_project.py
```

Checking, or scaffolding somewhere else:

```powershell
# report what is missing, write nothing
python .claude/skills/project-scaffold/scripts/scaffold_project.py --check

# a root other than the current folder - it must already exist
python .claude/skills/project-scaffold/scripts/scaffold_project.py --root "C:/dev/OtherProject"
```

| Flag | Effect |
|---|---|
| `--root PATH` | Repository root to scaffold; default the current directory. It must already exist |
| `--check` | Report what is missing and write nothing. Exit 1 if anything is |
| `--minimal` | Only the folders a skill reads or writes; skip the organizational ones |
| `--no-readme` | Do not write the per-stage `README.md` files |
| `--no-gitignore` | Do not write a `.gitignore` when the root has none |
| `--verbose` | List what was already present, not just the count |

Exit codes: `0` the tree is complete, `1` (with `--check`) something is missing, `2` the root is not an
existing directory.

The script is stdlib-only. **Run it and present its output** — do not re-derive the list by walking the
folders yourself.

## What it writes

The six numbered stage folders with their `Input`/`Output` sides, the requirements stage's seed,
context and collaborative folders, and the admin folders — the table in
[pipeline-conventions](../pipeline-conventions/SKILL.md) §2, plus the organizational folders that
surround it. Then, in each folder that would otherwise hold nothing, a `.gitkeep`, because git does not
track an empty folder and a stage root that vanishes on clone is a loop that fails on someone else's
machine.

It also writes one `README.md` per numbered stage folder, naming what belongs in each of its
subfolders, and a `.gitignore` if the root has none.

The folder names are load-bearing: a script resolves each one by its literal name. Renaming one here,
however reasonable the new name, makes that folder invisible to the skill that reads it.

## What it never does

- **It never overwrites.** A folder or file that already has content is reported as present and left
  exactly as it is. The one exception is a file that exists but is **empty** — a placeholder with
  nothing to lose — which is filled and reported separately as such.
- It creates no per-feature folder, under either `Input` or `Output`.
- It writes no seed. `200 Requirements/220 Input/` belongs to the seed authors, and no skill writes
  there — see [seed-authoring](../seed-authoring/SKILL.md).
- It writes no directive into a `<stage-input>/`. Those state what is true about the product, so only
  the project can write them.
- It creates nothing under `400 Code/Source/` beyond the folder itself. The tree inside the code root is
  the project's to declare, in its code directives, as the roles `<source>`, `<web>`, `<mobile>`,
  `<migrations>` and `<tests>`.

## After it runs — what a new project still owes

The tree is empty on purpose: the loops learn the domain only at run time, by reading `<stage-input>/`.
Nothing runs usefully until the project states its own facts there. In order:

1. **The directives**, one set per stage that needs one, in that stage's `Input/` folder. At minimum the
   code directives: the layer map and the tree roles, stated relative to the code root. A stage with no
   directives is not an error — the folder is optional — but a stage whose rules exist only in someone's
   head will be re-invented differently on every run.
2. **The language** the artifacts are written in, declared in `<stage-input>/`. A project that declares
   none gets English.
3. **The first seed**, at `200 Requirements/220 Input/<feature>/SEED.md`.

Then `python .claude/skills/pipeline-progress/scripts/pipeline_progress.py` to confirm the feature is seen,
and `/req-loop <feature>` to start it.

## Presenting the result

Print the script's output, then say in one line what the project owes next — the directives, or the
first seed. Do not restate the tree; the listing is the report.
