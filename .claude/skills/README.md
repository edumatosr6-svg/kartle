# `.claude/skills/` — the pipeline tooling

The skills that turn a seed into a release. They are **tooling**, not product: nothing here describes what
the product does, only how a change travels through it. A skill that names a domain term, a domain rule
or a project file has broken that boundary — the domain reaches a loop only through `<stage-input>/`.

The process these skills implement is drawn in
[100 Admin/120 Processes/SW_Dev_Processes.md](../../100%20Admin/120%20Processes/SW_Dev_Processes.md).

## The chain

```
drafts  →  colab-loop  →  colab-promote  →  seed
                ↑  (questions, answered by revising the drafts; rounds until promoted)

seed  →  req-loop  →  fspec-loop  →  dspec-loop  →  code-loop  →  test-loop  →  deploy-loop  →  release
              ↑            ↑             ↑              ↑             ↑             ↑
              └────────────┴─────────────┴──── diag-loop ┴─────────────┴─────────────┘
```

Stage 0 is the only stage whose unit is the whole set rather than one feature, and the only one with a
human round built in: it ends by asking, not by passing.

Every stage has the same shape: a **generator** produces, a **validator** judges in isolation, and a
**loop** owns the iteration counter and the stop conditions. The generator and the validator of a stage
never invoke each other.

## Index

| Skill | Kind | Does |
|---|---|---|
| [pipeline-conventions](pipeline-conventions/SKILL.md) | reference | The rules every loop obeys, and how to edit a pipeline skill |
| [seed-authoring](seed-authoring/SKILL.md) | authoring | How to write and revise the seed of a feature |
| [project-scaffold](project-scaffold/SKILL.md) | admin | Creates the folder tree these skills assume, in a root that has none. Idempotent; never overwrites |
| [pipeline-progress](pipeline-progress/SKILL.md) | admin | Where every feature stands, and what to run next. Read-only |
| [req-docx-export](req-docx-export/SKILL.md) | admin | Assembles one requirements target — a collaborator, `Input` or `Output` — into one ordered `.docx`, open items consolidated at the end |
| [colab-loop](colab-loop/SKILL.md) · [colab-generator](colab-generator/SKILL.md) · [colab-validator](colab-validator/SKILL.md) | stage 0 | `200 Requirements/240 Colaborative` — every author's drafts read side by side, merged into one set under `241 Merged/`, disagreements surfaced as questions |
| [colab-promote](colab-promote/SKILL.md) | stage 0 | The declared step that copies a validated consolidated seed into `220 Input`. The only writer of `220 Input` |
| [req-loop](req-loop/SKILL.md) · [req-generator](req-generator/SKILL.md) · [req-validator](req-validator/SKILL.md) | stage 1 | `200 Requirements` — stories, criteria, NFRs |
| [fspec-loop](fspec-loop/SKILL.md) · [fspec-generator](fspec-generator/SKILL.md) · [fspec-validator](fspec-validator/SKILL.md) | stage 2 | `300 Specs/320 F-Specs` — features, flows, API contracts, screens, rules |
| [dspec-loop](dspec-loop/SKILL.md) · [dspec-generator](dspec-generator/SKILL.md) · [dspec-validator](dspec-validator/SKILL.md) | stage 3 | `300 Specs/330 D-Specs` — architecture, data model, modules, security, test strategy |
| [code-loop](code-loop/SKILL.md) · [code-generator](code-generator/SKILL.md) · [code-validator](code-validator/SKILL.md) | stage 4 | `400 Code` — backend, web, mobile; the manifest |
| [test-loop](test-loop/SKILL.md) · [test-generator](test-generator/SKILL.md) · [test-validator](test-validator/SKILL.md) | stage 5 | `500 Tests` — suites, coverage, the verdict on the evidence |
| [deploy-loop](deploy-loop/SKILL.md) · [deploy-generator](deploy-generator/SKILL.md) · [deploy-validator](deploy-validator/SKILL.md) | stage 6 | `600 Deploy` — pipelines, migration, rollout, runbook |
| [diag-loop](diag-loop/SKILL.md) · [diag-analyst](diag-analyst/SKILL.md) · [diag-validator](diag-validator/SKILL.md) | diagnosis | Whose defect is it, and which requirements are still unproven |
| [diag-retro](diag-retro/SKILL.md) | diagnosis | What the loops keep manufacturing. On demand only |

## The shared rules — read these first

Stated once, in one place, so no loop restates them and no two loops drift apart:

- [pipeline-conventions/SKILL.md](pipeline-conventions/SKILL.md)
  — the feature, the artifact layout, front matter, ids, severities and verdicts, the divergence rule, the
  seed revision, isolation, token accounting, the shared stop conditions, and the rules for editing a
  pipeline skill.
- [diag-loop/references/taxonomy.md](diag-loop/references/taxonomy.md) — the four facets, the evidence
  gates, the five stages of a diagnosis.

## Scripts

| Script | Used by | Does |
|---|---|---|
| [scaffold_project.py](project-scaffold/scripts/scaffold_project.py) | `project-scaffold` | Creates the numbered stage folders and their `Input`/`Output` sides, a `.gitkeep` where git would lose a folder, a README per stage. `--check` reports without writing |
| [pipeline_progress.py](pipeline-progress/scripts/pipeline_progress.py) | every loop's state resolution, and `pipeline-progress` | Scans seeds and stage outputs; reports the stage of every feature, the seed revision and drift; prints the `seed:` line validators stamp |
| [diag_harvest.py](diag-loop/scripts/diag_harvest.py) | `diag-loop` step 1 | Reduces a test run and the traceability files to clusters and a requirement graph. No log body enters the model context |
| [req_docx_export.py](req-docx-export/scripts/req_docx_export.py) | `req-docx-export` | Resolves the target, then renders the Markdown set its `ORDER.md` lists into a single `.docx`, writing the OOXML package itself |
| [colab_tools.py](colab-loop/scripts/colab_tools.py) | `colab-loop`, `colab-generator`, `colab-validator`, `colab-promote` | `inventory` of the drafts and what changed; `index` generated from the seeds' `sources:`; `lint`, the mechanical gate; `questions`, the open points grouped per author; `promote`, the one writer of `220 Input` |
| [lint_artifacts.py](pipeline-progress/scripts/lint_artifacts.py) | every loop's step 2, before the validator | The **deterministic gate**: front matter, id format and uniqueness, filename agreement, child ids, index agreement, traceability resolution, `TBD`/`OPEN`, required files. `--emit` regenerates `00-index.md` and `99-traceability.md` from the artifacts — the only thing that ever writes them |
| [reduce_run.py](pipeline-progress/scripts/reduce_run.py) | `test-loop`, `code-loop`, `deploy-loop` | Reduces a run log to a bounded summary — totals, failing ids, one excerpt per distinct failure shape, real-looking records masked — so the raw file never enters a model context |
| [phase_log.py](pipeline-progress/scripts/phase_log.py) | every loop and workflow | The UTC `stamp` every file name carries; `open` and `row` for the phase log (§9). Never fails a run |

All eight are stdlib-only. `pipeline_progress.py` and `reduce_run.py` are read-only; `lint_artifacts.py`
writes only with `--emit`, and only the two derived files; `phase_log.py` writes only the phase log; `colab_tools.py` writes only under
`241 Merged/` — and, on `promote --yes`, the seeds it promotes; the others write exactly one thing —
the evidence base, the `.docx`, and the folder tree.

## Running the loops — workflows, agents, hooks

The loop skills are the **specification**; where the Workflow tool is available they run as workflows,
so the counter and the stop conditions are code and the main context holds only the run summary.

| Piece | Where | Does |
|---|---|---|
| `colab-loop` | [.claude/workflows/colab-loop.js](../workflows/colab-loop.js) | Stage 0, one round. Refuses unless `integrationDeclared: true` — the Product Owner's word |
| `spec-loop` | [.claude/workflows/spec-loop.js](../workflows/spec-loop.js) | `req-loop`, `fspec-loop` and `dspec-loop` for one feature: `args.stage` picks the stage |
| `pipeline-run` | [.claude/workflows/pipeline-run.js](../workflows/pipeline-run.js) | Every feature (or the ones named) through `req → fspec → dspec`, several at once, each until validated or stopped on a question |
| Agents | [.claude/agents/](../agents/) | `pipeline-gate` (small model, runs the scripts only), and a `<stage>-generator` / `<stage>-validator` pair per stage, the validator isolated by construction |
| `feature_lock.py` | [.claude/hooks/](../hooks/feature_lock.py) | One loop per feature; one `code-loop` per checkout. Released at `SessionEnd` |
| `git_guard.py` | [.claude/hooks/](../hooks/git_guard.py) | Refuses tree-wide `git add -A`, `commit -a`, broad `restore`/`reset --hard`/`clean`/`stash` — collaborators and parallel loops write the tree concurrently |

```
Workflow({ name: "pipeline-run", args: { through: "dspec", concurrency: 3 } })
Workflow({ name: "spec-loop",    args: { stage: "fspec", feature: "<feature>" } })
Workflow({ name: "colab-loop",   args: { integrationDeclared: true, lang: "pt-BR" } })
```

For an unattended cadence, wrap `pipeline-run` in `/loop` (e.g. `/loop 30m run the pipeline-run workflow`)
— each tick advances what can advance and returns the questions only a human can answer.
`code-loop`, `test-loop` and `deploy-loop` still run as skills: they share one application tree and a
staging environment, and are not parallelised.

## Eight rules that hold everywhere

Stated in full in [pipeline-conventions](pipeline-conventions/SKILL.md); the section numbers are there.

1. **The spec is normative, the running system is not.** A requirement the product does not satisfy yet is
   a `divergence` — recorded, owed by a later stage, and never a reason to weaken the requirement. (§6)
2. **A loop converges by fixing its own artifact.** Never by deleting a requirement, weakening a `SHALL`,
   narrowing a check, or scoping a rule to the part of the system that already passes it. Every loop
   treats that move as a stop condition. (§11)
3. **The validator runs isolated, and its rubric is closed.** Fresh context, no access to the generator's
   reasoning; it answers a numbered list of checks and reports nothing else. On a re-validation the
   population is fixed, which is what makes *No progress* measurable. (§8)
4. **Nothing writes outside its own feature.** Not a seed, not an upstream folder, not another feature —
   a change another feature needs is a **feedback**, which proposes and changes nothing. (§14)
5. **A script decides everything a script can decide**, before any model pass, and the validator never
   re-judges it. Derived tables are generated, never hand-written. (§13)
6. **A fix round adds no surface.** New surface goes to the feature's `SCOPE-BACKLOG.md` for its author. (§16)
7. **Raw data never enters a model context.** Reduce a run to a bounded summary and treat that as the
   evidence — for cost, for reproducibility, and because these stages touch real data. (§18)
8. **A declined item is answered, never dropped**, and no existing check is ever lost silently. (§17)

## Starting a feature

```powershell
# 0. new project only: copy .claude/ in, then create the folder tree
python .claude/skills/project-scaffold/scripts/scaffold_project.py

# 1. author the seed — directly, or through the collaborative round:
#    200 Requirements/220 Input/<feature>/SEED.md   — see seed-authoring
#    plus DOMAIN.md and SCOPE-BACKLOG.md beside it
#    or: each author drafts under 200 Requirements/240 Colaborative/<author>/<feature>/SEED.md, then
/colab-loop                 # merges every author's drafts, publishes the questions
#    ... authors answer by revising their drafts; run /colab-loop again until nothing is open ...
/colab-promote --all        # the declared step into 220 Input

# 2. see where everything stands
python .claude/skills/pipeline-progress/scripts/pipeline_progress.py

# 3. move it forward, one stage at a time
/req-loop   <feature>
/fspec-loop <feature>
/dspec-loop <feature>
/code-loop  <feature>
/test-loop  <feature>
/deploy-loop <feature>
```

Production promotion is never taken by a loop. `deploy-loop` ends with the promotion question and the
runbook; a human answers it.
