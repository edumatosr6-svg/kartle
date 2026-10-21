---
name: req-docx-export
description: 'Assemble one target of the requirements stage — a collaborator''s drafts, the promoted Input, or the generated Output — into a single reviewable .docx, in the reading order a manifest declares, with a consolidated register of every open item at the end. Use when: requirements have to leave the repository as one file for someone who does not read Markdown — a client, clinical or legal review, a steering meeting; the user asks for a Word document, a consolidated dossier, or "all the open questions in one place". Read-only over the documents: it writes the .docx and nothing else.'
argument-hint: 'The target: a collaborator''s name, or Input, or Output. Ask when it is missing — never pick one. Optional: --check, --init, --output PATH'
---

# req-docx-export — one ordered document out of a requirements set

Turns one target of the requirements stage into a single `.docx` that reads in a deliberate order,
and appends a table of every unresolved point found across it.

It solves a problem the pipeline does not: **the stage's artifacts are written to be read by the next
stage, and the people who must answer the open questions are not the next stage.** A reviewer who
receives eight files in a folder reads them in whatever order the file listing offers, meets a concept
before its definition, and answers nothing. This skill fixes the order, states it in a file under
review like everything else, and puts every open question in one table at the end.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md). It is not a stage: it runs no loop,
has no validator, produces no verdict and no report, and never promotes anything.

## The target — always named, never guessed

A run assembles exactly one target:

| Target | Folder | Holds |
|---|---|---|
| a collaborator's name | `200 Requirements/240 Colaborative/<name>/` | that author's drafts, before promotion |
| `Input` | `200 Requirements/220 Input/` | the promoted seeds the pipeline reads |
| `Output` | `200 Requirements/230 Output/` | the generated requisites sets |

**If the invocation did not name a target, ask which one — do not pick.** Run the script with no
argument: it lists every target that exists, whether each already has a manifest, and how many
documents each holds, then stops with exit code 2. Put those choices to the user and wait. The three
targets answer different questions — a collaborator's folder is a draft under discussion, `Input` is
what the pipeline is working from, `Output` is what it produced — and assembling the wrong one sends
a reviewer the wrong document without anything looking wrong.

The name is matched case-insensitively. An unknown name is refused with the same listing, never
resolved to something near it.

## Artifact locations

| Role | Path |
|---|---|
| Input — the manifest | `<target>/ORDER.md` |
| Input — the documents | the paths the manifest lists, relative to `<target>` |
| Output — the assembled document | the manifest's `output:`, or `--output` |
| The assembler | [req_docx_export.py](scripts/req_docx_export.py) |

Folder names contain spaces: **always quote paths.**

`--init` is the only thing that writes into a target, it writes one `ORDER.md`, and it refuses to
overwrite an existing one. The documents themselves are never touched — including under `Input`,
which belongs to the seed authors.

## When to use

- A requirements set has to go to someone outside the repository for review or sign-off.
- The open questions are spread across many documents and someone must answer them as one list.
- A set is being read in a meeting and its reading order matters.

Do **not** use it to promote, validate or transform a document. It renders what is there, in the
order the manifest gives, and changes nothing.

## How to run

```powershell
# list the targets — and what to show the user when the run named none
python .claude/skills/req-docx-export/scripts/req_docx_export.py

# assemble one target
python .claude/skills/req-docx-export/scripts/req_docx_export.py <target>

# check the manifest against the folder, write nothing
python .claude/skills/req-docx-export/scripts/req_docx_export.py <target> --check

# scaffold a manifest from what is on disk, to be put in order by hand
python .claude/skills/req-docx-export/scripts/req_docx_export.py <target> --init
```

| Flag | Effect |
|---|---|
| `--check` | Validate the manifest against the folder and print the plan; write nothing |
| `--init` | Write an `ORDER.md` scaffold listing what is on disk, alphabetically. Refuses to overwrite |
| `--output PATH` | Write here instead of the manifest's `output:` |
| `--root PATH` | Repository root, from which the targets are resolved; default the current directory |

The script is stdlib-only: it writes the OOXML package itself, so nothing has to be installed and no
converter has to be present. **Run it and present its output** — the per-document open-item counts it
prints are the same numbers the appendix carries, so do not recount them by reading the files.

| Exit | Means |
|---|---|
| 0 | Assembled, or checked clean |
| 1 | Nothing written: no manifest, a listed document missing, or the manifest lists none |
| 2 | No target, or an unknown one. The listing is the answer to put to the user |

## The manifest

`ORDER.md` is human-authored and reviewable. It is the only place the order lives — never the script,
and never this skill.

Front matter, all optional except `title`:

| Key | Meaning |
|---|---|
| `title`, `subtitle`, `author`, `version` | The cover page |
| `date` | A date, or `auto` for the day of the run |
| `language` | The BCP-47 tag stamped into the document, so proofing uses the right language |
| `output` | Where to write, relative to the repository root |
| `root` | The folder the entries are relative to, if not the target itself |
| `discover` | Glob(s) naming what *should* be listed; anything matching but unlisted is reported |
| `toc`, `toc-title`, `toc-hint` | The table of contents. Word fills it on open; the hint is what stands there until it does |
| `part-numbers` | Number the documents in the assembled file |
| `page-break` | `before-each` starts every document on a new page; `none` runs them on |
| `meta-fields` | Front-matter keys of each document to print under its title, in this order |
| `abstract-field` | A front-matter key to render as the document's opening line |
| `links` | `keep` leaves real URLs as links; `text` renders every link as its label, so the assembled file points at nothing outside itself |
| `open-items` | `appendix` or `none` |
| `open-items-pattern` | The regex that recognises an open item's id at the start of a line, list item or table row |
| `open-items-title`, `open-items-intro`, `open-items-empty` | The appendix's own text |
| `open-items-columns`, `summary-columns`, `summary-total` | The appendix's column headers |

Every label is a manifest key because **the assembled document is written in the project's language**
(§2 of the conventions) and this skill does not know which that is. Unset, the labels are English.

The body is the order, one entry per line:

```markdown
## <a section, optional — it becomes a divider>

1. <path relative to the target> — <the title this document gets in the export>
```

The number is decoration; **the line order is the order**. The title after the dash is optional:
without it the document's own `title:`, then its `name:`, then its first heading is used. A heading in
the body starts a section, and sections become the top level of the outline — unless there is only
one, which would add a level that says nothing. Anything that is not a list item pointing at a `.md`
file is prose, and is ignored.

Each target keeps its own manifest, because each is a different document: the same feature can be
ordered one way as a draft under discussion and another way as a set going to a client.

## What the assembled document contains

1. A cover page from the front matter.
2. A table of contents Word builds on first open.
3. Each document in order: its title, its `meta-fields` line, its abstract, then its content —
   headings, paragraphs, lists, tables, quotes, code and images.
4. **The consolidated open items**: a summary table of how many each document carries, then one row
   per item — the document it came from, its id, and its text.

Each document's own heading levels are normalised, so a set mixing `#`-led and `##`-led documents
still produces one consistent outline and every section lands inside the table of contents.

**Open item ids are unique inside a document, not across a set.** Two documents both carrying an
`OPEN-01` is normal and not a defect; the appendix names the source document in the first column,
which is what makes the ids unambiguous once gathered.

## What it does not do

- It does not edit, promote, reorder on disk, or write anything but the `.docx` and, on `--init`, one
  manifest.
- It does not resolve an open item, or judge whether one is still open. It reports what the text says.
- A link to another file in the repository is always rendered as plain text: a path that means
  something in the repository means nothing to someone reading the exported file. Real URLs stay
  links unless the manifest sets `links: text`, which leaves the file with no reference out of itself
  at all — no external relationship is written into the package.
- It assembles one target per run. Two targets are two documents, and comparing them is a human's job.

## Failure modes

| Symptom | Cause | Fix |
|---|---|---|
| `name a target` | The run named none | Put the printed listing to the user and ask. Never choose for them |
| `unknown target` | A name that is neither a collaborator folder nor `Input`/`Output` | Use a name from the listing; check `--root` if the listing is empty |
| `has no manifest` | The target has never been ordered | `--init`, then put the entries in reading order by hand |
| `listed but missing` | The manifest names a document that is not there — usually a folder renamed since | Correct the entry, or remove it |
| `present on disk, absent from ORDER.md` | A document exists that the order does not place | Place it, or narrow `discover` if it is deliberately excluded |
| The table of contents is a line of italic text | Word has not built the field yet | Open the file and update fields; the document asks Word to do it on open |
| An image is a grey `[caption]` | The file is missing, or is not PNG/JPEG/GIF | Fix the path — it is resolved against the document first, then the target |
| An open item is missing from the appendix | Its line does not start with the id | Start the line with the id, or widen `open-items-pattern` |
