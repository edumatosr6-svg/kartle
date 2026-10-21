---
name: deploy-loop
description: 'Run the Deployment pipeline to convergence for one feature: deploy-generator (pipelines, environment config, migration plan, mobile packaging, observability, runbook) → deploy-validator (staging checks, smoke tests, rollback proof). Ends with a release candidate recorded under "600 Deploy/Output/<feature>/". Use when: the tests passed and the change must be shipped; the user says "prepare the release", "get this deployable", or asks to resume after a FAIL. Owns the iteration counter and the stop conditions. Production promotion stays a human decision.'
argument-hint: 'Feature, optionally --max-iterations N, --env staging|production'
---

# Deploy Loop — stage 6 driver (`600 Deploy`)

Drives **prepare → gate → validate → fix** until `deploy-validator` returns SUCCESS or a stop condition
fires. This skill owns the loop; it is the only place an iteration counter exists.

**No loop promotes to production.** SUCCESS here means a release candidate is proven deployable and
reversible in staging. Promotion is a human decision, taken with the runbook in hand.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md) and
[domain-invariants.md](../pipeline-conventions/references/domain-invariants.md).

## Artifact locations

| Role | Path |
|---|---|
| Sub-skill — generator | [deploy-generator](../deploy-generator/SKILL.md) |
| Sub-skill — validator | [deploy-validator](../deploy-validator/SKILL.md) |
| Input — verified build | `500 Tests/Output/<feature>/reports/test-validation/` with verdict SUCCESS |
| Input — migration design | `300 Specs/330 D-Specs/Output/<feature>/data/DM-*.md` |
| Input — NFRs | `200 Requirements/230 Output/<feature>/nfr/` — the thresholds the smoke tests must observe |
| Input — release directives | `600 Deploy/Input/` and the run's directives |
| Existing deployment assets | the build, pipeline, deploy and migration-config files listed in `600 Deploy/Input/` |
| Output — release record | `600 Deploy/Output/<feature>/` |
| Loop memory | `600 Deploy/Output/<feature>/reports/deploy-validation/` |
| Back-channel | `400 Code/Output/<feature>/reports/feedback/` |

Rules:

- One feature per run; ask if it is missing or ambiguous.
- If the newest `500 Tests` verdict for the feature is not SUCCESS, stop and send the user to
  [test-loop](../test-loop/SKILL.md).
- **Never run a command against production.** Staging only. A production command is proposed in the
  runbook for a human to run.
- Never write under `400 Code/.github/`, `.claude/skills/` or `300 Specs/__old__Specs/`.
- Never write a secret into any file, any pipeline definition, any report or any log.

## Loop

Set `iteration = 1`, `MAX = 5` (override with `--max-iterations N`).

### 0. Pending feedback — before the counter starts

Collect the **cross-feature feedback** addressed to this feature (conventions §14), from

```
600 Deploy/Output/<feature>/reports/feedbacks/<origin feature>/feedback-*.md
```

Pending = stamped **after** the newest deploy-validation report; anything older is history.
`pipeline_progress.py` prints the origins in its `feedback` column.

Hand every pending item to the generator in **one** Mode C round together with whatever else this run
is fixing — three items then cost one iteration, not three. A pending feedback never blocks this run:
it is a proposal this feature has not yet judged, and this feature's last SUCCESS stands until this
loop rules on it.

### 1. Resolve state

```powershell
python .claude/skills/pipeline-progress/scripts/pipeline_progress.py --feature <feature> --stage deploy --json
```

| State | Next action |
|---|---|
| No release record | deploy-generator **Mode A** |
| Record exists, newest report is FAIL | deploy-generator **Mode B** with that report |
| Record exists, no report yet | go to step 2 |
| Record exists, but no `runbook.md` | Mode B with one issue: "no runbook (P6)" |
| Record exists, but the feature has a migration and there is no rollback rehearsal | Mode B with one issue: "rollback not demonstrated (P4)" |
| Newest report is SUCCESS | report release-candidate-ready and stop, unless asked to re-run |

### 2. Prepare

Invoke `deploy-generator` in the mode selected. It writes the pipeline changes, the environment
configuration **template** (names only, never values), the migration plan, the mobile packaging
description, the observability hooks and the runbook.

### 3. Deterministic gate

Always before the semantic pass — it is the cheap signal, and it is deterministic.

```powershell
python .claude/skills/pipeline-progress/scripts/lint_artifacts.py --stage deploy --feature <feature> --emit
```

`--emit` regenerates the derived files — `00-index.md` and `99-traceability.md` — from the artifacts
themselves, then re-checks. Those two are **never hand-written** (conventions §13): a fact stated in
four places, one of them stale, is the largest class of finding in the pipeline.

The script settles front matter, id format and uniqueness, filename agreement, child ids, index
agreement, traceability resolution, `TBD`/`OPEN` markers, the required files. **The validator never re-judges any of it** — say so in the invocation.

Any `error` → turn the lines into `ISSUE-<nn>`, fix through Mode B, `iteration++`, and return here
**without** spending a semantic pass.

**A gate that examined no file is not a pass.** The script prints the file count; if it is zero while
files are present, that is a `blocker` raised to the user, not something to iterate on.


**Never read a build, migration or deploy log into the context** (conventions §18). Reduce it:

```powershell
python .claude/skills/pipeline-progress/scripts/reduce_run.py --kind deploy "<the log>"
```

That bounded summary — the run's own totals, the ids on the failing lines, one excerpt per distinct
failure shape, real-looking records masked — **is the evidence**. If it does not answer the question,
that is the *Evidence would not fit bounded* stop condition: say what you would need, and stop.

### 4. Staging validation

Invoke `deploy-validator` on the feature **in a subagent** with a fresh context. It deploys the candidate to
staging, runs the migration up **and down**, runs the smoke tests for backend, web and mobile, and writes
`reports/deploy-validation/deploy-validation-<YYYYMMDD-HHmm>.md`.

- `SUCCESS` → stop and emit the summary, ending with the **promotion question** for the human.
- `FAIL` → evaluate the stop conditions; if none fire, `iteration++` and return to step 1.
- `FAIL CODE` → the candidate is defective, not its packaging. Stop; the report goes to
  [code-loop](../code-loop/SKILL.md).

## Stop conditions

The shared list in
[pipeline-conventions §11](../pipeline-conventions/SKILL.md), plus:

| Condition | Detection |
|---|---|
| FAIL CODE | The staging run exposes a defect in the application, not in the deployment |
| Irreversible migration | The downgrade fails, loses data, or does not exist. A release that cannot be rolled back is a product-risk decision, never the loop's |
| Downtime required | The change cannot roll out without a window, and no window is agreed. Ask |
| Secret needed | The deployment needs a credential that is not already in the environment. Ask for it to be provisioned out of band; never inline one, and never print one |
| Store submission | A mobile release needs a store submission, review or a forced-update decision. Ask |
| Production command required | Something can only be proven in production. It goes into the runbook as a human step, and the loop stops |
| Data migration on live production data | A backfill touching production records needs explicit approval and a rehearsal on a restored copy |

## Quality rules (self-check)

- The iteration counter exists only here.
- No command ran against production; no secret value was written or printed anywhere.
- The migration history has exactly one head, and the downgrade was actually executed in staging.
- Smoke tests ran for every channel in the feature's scope, and each observed at least one NFR threshold.
- The runbook exists, names the promotion steps, the verification steps and the rollback steps, and each
  step is executable by a human who did not write it.
- SUCCESS means "proven deployable and reversible in staging", never "shipped".
