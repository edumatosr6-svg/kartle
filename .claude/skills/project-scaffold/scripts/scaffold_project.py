#!/usr/bin/env python3
"""Create the pipeline's folder tree in a repository root.

Stdlib only. Idempotent, and it never overwrites: a folder or file that already exists is
reported as `present` and left exactly as it is.

    python .claude/skills/project-scaffold/scripts/scaffold_project.py --check
    python .claude/skills/project-scaffold/scripts/scaffold_project.py
    python .claude/skills/project-scaffold/scripts/scaffold_project.py --root "C:/dev/NewProject"

The tree is the one the loops read and write, plus the organizational folders that surround it.
Nothing here is per-feature: a feature's folders are created by its stage's loop on first run.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

# --------------------------------------------------------------------------- the tree
#
# tier: "pipeline" — a skill reads or writes it, and a loop fails without it
#       "layout"   — organizational; no skill depends on it
#
# The names are load-bearing. `240 Colaborative` is spelled the way the export skill resolves
# it; a corrected spelling would make that target invisible.

FOLDERS: list[tuple[str, str, str]] = [
    ("100 Admin", "layout",
     "Everything about running the project rather than building it."),
    ("100 Admin/110 Docs", "layout",
     "Reference material for the project as a whole."),
    ("100 Admin/120 Processes", "pipeline",
     "How the work travels: the process description the skills implement."),
    ("100 Admin/120 Processes/proposals", "pipeline",
     "Process-change proposals emitted by diag-retro, one PROP-<nn>-*.md each."),
    ("100 Admin/130 Marketing", "layout",
     "Brand, positioning, design references."),
    ("100 Admin/140 Dashboard", "layout",
     "Project-tracking material."),

    ("200 Requirements", "pipeline",
     "Stage 1 - what the product must do, per feature."),
    ("200 Requirements/210 Docs", "pipeline",
     "Product context the requirements stage reads. Context, never a source of requirements."),
    ("200 Requirements/220 Input", "pipeline",
     "The seeds. One folder per feature, each holding SEED.md. Human-authored; no loop writes here."),
    ("200 Requirements/230 Output", "pipeline",
     "Generated requisites sets, one folder per feature. Written by req-loop."),
    ("200 Requirements/240 Colaborative", "pipeline",
     "Collaborator drafts before promotion. One folder per author."),
    ("200 Requirements/240 Colaborative/241 Merged", "pipeline",
     "Stage 0 output: the consolidated seed set colab-loop writes, and the questions per round. "
     "Numbered so it is never read as an author."),

    ("300 Specs", "pipeline",
     "Stages 2 and 3 - the behaviour, then the design."),
    ("300 Specs/310 Docs", "layout",
     "Reference material for the specification stages."),
    ("300 Specs/320 F-Specs/Input", "pipeline",
     "Functional-specification directives: conventions and standards the stage must obey."),
    ("300 Specs/320 F-Specs/Output", "pipeline",
     "Generated functional specifications, one folder per feature. Written by fspec-loop."),
    ("300 Specs/330 D-Specs/Input", "pipeline",
     "Design directives: layer map, tree roles, design system, binding invariants."),
    ("300 Specs/330 D-Specs/Output", "pipeline",
     "Generated design specifications, one folder per feature. Written by dspec-loop."),

    ("400 Code", "pipeline",
     "Stage 4 - the implementation."),
    ("400 Code/Input", "pipeline",
     "Code directives: the layer map and the tree roles, stated relative to the code root."),
    ("400 Code/Output", "pipeline",
     "Per-feature manifest, traceability and reports. Never a copy of the source."),
    ("400 Code/Source", "pipeline",
     "The code root. Every path the directives name is relative to this folder."),

    ("500 Tests", "pipeline",
     "Stage 5 - the evidence."),
    ("500 Tests/Input", "pipeline",
     "Test directives: the test root, the runners, the coverage rules."),
    ("500 Tests/Output", "pipeline",
     "Per-feature coverage and traceability. The suites themselves live under the code root."),

    ("600 Deploy", "pipeline",
     "Stage 6 - the release."),
    ("600 Deploy/Input", "pipeline",
     "Deploy directives: environments, pipelines, packaging and observability rules."),
    ("600 Deploy/Output", "pipeline",
     "Per-feature release candidate: pipelines, migration plan, runbook, smoke checks."),
]

# One README per top-level folder. They sit above every folder a tool globs for documents,
# so they can never be mistaken for a stage artifact.
READMES: dict[str, str] = {
    "100 Admin": """# 100 Admin

Running the project rather than building it.

| Folder | Holds |
|---|---|
| `110 Docs` | Reference material for the project as a whole |
| `120 Processes` | How work travels; `proposals/` holds the process-change proposals from `diag-retro` |
| `130 Marketing` | Brand, positioning, design references |
| `140 Dashboard` | Project-tracking material |

No loop writes here except `diag-retro`, which writes proposals only.
""",
    "200 Requirements": """# 200 Requirements - stage 1

What the product must do, one feature at a time.

| Folder | Holds |
|---|---|
| `210 Docs` | Product context the stage reads. Context only - never a source of requirements |
| `220 Input` | The seeds: `<feature>/SEED.md`, human-authored. **No loop writes here** - only `colab-promote`, on a declared instruction |
| `230 Output` | Generated requisites sets, one folder per feature |
| `240 Colaborative` | Collaborator drafts before promotion, one folder per author |
| `240 Colaborative/241 Merged` | Stage 0 output: the consolidated set, the decisions register, the questions per round |

Start a feature by authoring `220 Input/<feature>/SEED.md` - see the `seed-authoring` skill -
then run `/req-loop <feature>`. With several authors, each drafts under `240 Colaborative/<author>/<feature>/`,
`/colab-loop` consolidates them and asks the questions, and `/colab-promote` moves the validated
seeds into `220 Input`.
""",
    "300 Specs": """# 300 Specs - stages 2 and 3

The behaviour, then the design that realizes it.

| Folder | Holds |
|---|---|
| `310 Docs` | Reference material for both stages |
| `320 F-Specs/Input` | Functional directives: conventions and standards |
| `320 F-Specs/Output` | Generated functional specifications, one folder per feature |
| `330 D-Specs/Input` | Design directives: layer map, tree roles, design system, invariants |
| `330 D-Specs/Output` | Generated design specifications, one folder per feature |

`/fspec-loop <feature>` then `/dspec-loop <feature>`.
""",
    "400 Code": """# 400 Code - stage 4

| Folder | Holds |
|---|---|
| `Input` | Code directives: the layer map and the tree roles |
| `Output` | Per-feature manifest, traceability and reports - never a copy of the source |
| `Source` | **The code root.** Every path the directives name is relative to this folder |

The directives state the tree roles - `<source>`, `<web>`, `<mobile>`, `<migrations>`,
`<tests>` - relative to the code root on purpose: moving the code root must not require
rewriting them.

`/code-loop <feature>`.
""",
    "500 Tests": """# 500 Tests - stage 5

| Folder | Holds |
|---|---|
| `Input` | Test directives: the test root, the runners, the coverage rules |
| `Output` | Per-feature coverage and criterion-to-check traceability |

The suites themselves are written under the code root, to the `<tests>` role the directives
name - not into this folder.

`/test-loop <feature>`.
""",
    "600 Deploy": """# 600 Deploy - stage 6

| Folder | Holds |
|---|---|
| `Input` | Deploy directives: environments, pipelines, packaging, observability |
| `Output` | Per-feature release candidate: pipelines, migration plan, runbook, smoke checks |

No secret value is ever written here, and no loop promotes to production - `deploy-loop`
ends with the promotion question and a human answers it.

`/deploy-loop <feature>`.
""",
}

GITIGNORE = """# Word lock files, created while a .docx or .xlsx is open.
~$*

# Documents assembled by .claude/skills/req-docx-export are derived: the Markdown and its
# ORDER.md are the source, and the .docx can be rebuilt at any time. Add each one here as
# it is produced - deliberately, one path at a time, so a .docx that is a real input to the
# project is not swept up by a pattern.
"""


# --------------------------------------------------------------------------- planning

class Plan:
    def __init__(self) -> None:
        self.created: list[str] = []
        self.filled: list[str] = []
        self.present: list[str] = []

    def record(self, rel: str, exists: bool) -> None:
        (self.present if exists else self.created).append(rel)


def has_content(doc: Path) -> bool:
    """True for a file with something in it. An empty file is a placeholder, not content."""
    try:
        return doc.is_file() and doc.read_text(encoding="utf-8", errors="replace").strip() != ""
    except OSError:
        return True  # unreadable: treat as content, and leave it alone


def is_empty(target: Path) -> bool:
    """True for a folder that holds nothing, and for one that does not exist yet."""
    if not target.is_dir():
        return True
    return next(target.iterdir(), None) is None


def leaf_folders(paths: list[str]) -> set[str]:
    """Folders with no scaffolded child - the ones that would stay empty without a .gitkeep."""
    return {p for p in paths if not any(o != p and o.startswith(p + "/") for o in paths)}


def build(root: Path, minimal: bool, readmes: bool, gitignore: bool, check: bool) -> Plan:
    plan = Plan()
    wanted = [(p, t, _) for p, t, _ in FOLDERS if not (minimal and t == "layout")]
    paths = [p for p, _, _ in wanted]
    leaves = leaf_folders(paths)

    for rel, _tier, _purpose in wanted:
        target = root / rel
        exists = target.is_dir()
        plan.record(rel + "/", exists)
        if not exists and not check:
            target.mkdir(parents=True, exist_ok=True)

        # A .gitkeep only where git would otherwise lose the folder: a leaf of the scaffold
        # that holds nothing. A folder someone has already filled needs no marker, and one
        # dropped into it later would be noise in a tree that is under review.
        if rel in leaves and is_empty(target):
            keep = target / ".gitkeep"
            keep_exists = keep.exists()
            plan.record(rel + "/.gitkeep", keep_exists)
            if not keep_exists and not check:
                keep.write_text("", encoding="utf-8")

    if readmes:
        for rel, body in READMES.items():
            if minimal and rel == "100 Admin":
                continue
            doc = root / rel / "README.md"
            written = has_content(doc)
            if not written and doc.exists():
                plan.filled.append(rel + "/README.md")
            else:
                plan.record(rel + "/README.md", written)
            if not written and not check:
                doc.write_text(body, encoding="utf-8", newline="\n")

    if gitignore:
        doc = root / ".gitignore"
        exists = doc.exists()
        plan.record(".gitignore", exists)
        if not exists and not check:
            doc.write_text(GITIGNORE, encoding="utf-8", newline="\n")

    return plan


# --------------------------------------------------------------------------- reporting

def report(plan: Plan, root: Path, check: bool, verbose: bool) -> None:
    verb = "would create" if check else "created"
    print(f"root: {root}")
    print()
    if plan.created:
        print(f"{verb} ({len(plan.created)}):")
        for rel in plan.created:
            print(f"  + {rel}")
    elif not plan.filled:
        print("nothing to create - the tree is complete")
    if plan.filled:
        filled_verb = "would fill" if check else "filled"
        print()
        print(f"{filled_verb}, the file was there but empty ({len(plan.filled)}):")
        for rel in plan.filled:
            print(f"  ~ {rel}")
    if plan.present:
        if verbose:
            print()
            print(f"already present ({len(plan.present)}):")
            for rel in plan.present:
                print(f"  = {rel}")
        else:
            print()
            print(f"already present: {len(plan.present)} (--verbose to list)")


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(
        prog="scaffold_project.py",
        description="Create the pipeline's folder tree in a repository root. "
                    "Idempotent, and it never overwrites.")
    ap.add_argument("--root", default=".",
                    help="Repository root to scaffold; default the current directory. "
                         "It must already exist.")
    ap.add_argument("--check", action="store_true",
                    help="Report what is missing and write nothing. Exit 1 if anything is missing.")
    ap.add_argument("--minimal", action="store_true",
                    help="Only the folders a skill reads or writes; skip the organizational ones.")
    ap.add_argument("--no-readme", dest="readme", action="store_false",
                    help="Do not write the per-stage README.md files.")
    ap.add_argument("--no-gitignore", dest="gitignore", action="store_false",
                    help="Do not write a .gitignore when the root has none.")
    ap.add_argument("--verbose", action="store_true",
                    help="List what was already present, not just the count.")
    args = ap.parse_args(argv)

    root = Path(args.root).expanduser()
    if not root.is_dir():
        print(f"error: root is not an existing directory: {root}", file=sys.stderr)
        print("Create it first, or point --root at the folder you copied .claude into.",
              file=sys.stderr)
        return 2
    root = root.resolve()

    plan = build(root, args.minimal, args.readme, args.gitignore, args.check)
    report(plan, root, args.check, args.verbose)

    if args.check and (plan.created or plan.filled):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
