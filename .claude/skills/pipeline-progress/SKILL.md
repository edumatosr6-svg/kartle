---
name: pipeline-progress
description: 'Cross every feature against every stage of the pipeline and report where each one stands: no seed, seed written but nothing generated, generated but never validated, FAIL, validated with a required document missing, drifted back to draft, or validated against an older revision of its seed. Use when: the user asks what is done and what is left, which features still need work, the status of a feature, or what to run next; also as the first step of any planning or review session. Read-only — it writes no artifact, no report and no status field.'
argument-hint: 'Optional: one or more features, a stage to focus on, or --json'
---

# Pipeline Progress — where every feature stands

Answers one question across the whole repository: **for each feature, how far has it travelled from seed to
release, and what does it need next?**

It is the read-only counterpart of the six loops: they move one feature forward, this one shows every feature
at once and which to move.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md).

## Artifact locations

| Role | Path |
|---|---|
| Input — seeds | `200 Requirements/220 Input/<feature>/SEED.md` |
| Input — stage artifacts | `<stage-output>/<feature>/` |
| Input — validation reports | `<stage-output>/<feature>/reports/<key>-validation/` |
| The scan | [pipeline_progress.py](scripts/pipeline_progress.py) |

A **feature** is a folder name, and the same feature names both sides. That is the pipeline's only convention,
so a name present on one side and absent on the other is itself a finding, not an error to suppress.

## When to use

- "What's the status?", "what's left?", "which features still need specs?"
- Before starting work, to pick the feature to run a loop on next.
- After a batch of runs, to confirm nothing was left `draft` or half-generated.
- To catch a feature that passed validation *before* a required document became mandatory — the gaps a
  loop's state table would only find the next time you ran it.

Do **not** use it to validate, to fix, or to diagnose. It reads report folders only to say how far a feature
got.

## How to run

```powershell
python .claude/skills/pipeline-progress/scripts/pipeline_progress.py
```

| Flag | Effect |
|---|---|
| `--feature NAME` | Limit to that feature; repeatable. Without it, every feature on either side |
| `--stage KEY` | With `--json`, return only that stage's detail (`req`, `fspec`, `dspec`, `code`, `test`, `deploy`) |
| `--json` | Machine-readable, for feeding a loop's state resolution |
| `--root PATH` | Repository root; default the current directory |
| `--seed-line FEATURE` | Print the `seed:` front-matter line for a validator to stamp its report |
| `--fail-on gaps` \| `unvalidated` | Exit 1 when any feature is at or below that stage; default exits 0 |
| `--count-artifacts` | With `--stage` and one `--feature`: print how many artifact files the set holds (`reports/` and the two derived files excluded) — the independent count a loop compares with the gate's |

The script is stdlib-only and read-only. **Run it and present its output** — do not re-derive the table
by reading the folders yourself, and do not paraphrase the numbers.

## The stages

Every feature lands on exactly one, ordered from furthest-behind to done. The feature's stage is the first
stage column that is not `validated`.

| Stage | Meaning | What unblocks it |
|---|---|---|
| `seed-missing` | Nothing under `200 Requirements/220 Input/<feature>/` | [seed-authoring](../seed-authoring/SKILL.md) |
| `seed-incomplete` | A folder with no `SKILL.md` | Author it — or say it is notes and not a feature, rather than proposing a loop |
| `orphan-output` | Artifacts exist with no seed behind them | Ask: the seed was renamed, moved, or never written. **Never delete either side** |
| `not-started` | Seed written, the stage has no output | Run that stage's loop |
| `unvalidated` | Artifacts generated, no validation report | Run that stage's loop |
| `FAIL` | The newest report's verdict is FAIL | Run that stage's loop — it resumes from the report |
| `gaps` | SUCCESS, but a required file or folder is missing | Run that stage's loop — its state table turns each gap into an issue |
| `seed-changed` | SUCCESS, but the seed's `revision:` is now past the one that was validated | Run the loop: the artifacts answer an older version of the seed |
| `seed-drift` | SUCCESS, `revision:` unchanged but the seed's body is not what was validated | Bump `revision:` in the seed (the author's call), then run the loop |
| `drifted` | SUCCESS, but files are back to `draft` — edited since | Run the loop to re-validate what changed |
| `validated` | SUCCESS, everything required present, every file `validated` | Nothing; it is ready for the next stage |

## The seed revision

Each seed carries `revision:`, `date:` and `author:`. Every validation report records the revision and
the body digest it judged against, so this report can tell a set that still answers its seed from one
whose seed has moved on underneath it.

The **Seed** column:

| Cell | Meaning |
|---|---|
| `r3` | The seed is revision 3, and that is what was validated |
| `r3 (validated r2)` | The seed moved to r3 after the set passed at r2 — `seed-changed` |
| `r2 edited` | Still revision 2, but the body no longer matches what was validated — `seed-drift` |

**An absent revision is revision 1** — on both sides, and that is the whole rule. A seed with no
`revision:` field is revision 1, because that is where every seed starts. A report with no `seed:` line
judged revision 1, because it ran when nothing had been bumped past it. There is no "untracked" state and
no date arithmetic.

The consequence is deliberate: reports written before revision tracking imply r1, so every seed bumped
past r1 shows as `seed-changed` until its next run stamps a real revision. That over-reports slightly and
errs the safe way — the cost is one re-run, and after it the feature is stamped and never ambiguous again.

The digest is taken over the seed's **body only**, with line endings normalised, so a CRLF/LF checkout
never reads as an edit and neither does stamping or correcting `date:`/`author:`. `seed-drift` therefore
means a real content change, and the honest fix is to bump the revision — never to re-run a loop and let
the digest quietly catch up.

## Which documents are required

The same rule the loops apply, so this report and the loops never disagree:

| Stage | Required |
|---|---|
| `req` | `00-index.md`, `01-context.md`, `02-glossary.md`, `99-traceability.md`, a non-empty `stories/` |
| `fspec` | `00-index.md`, `01-overview.md`, `02-glossary.md`, `99-traceability.md`, a non-empty `features/` |
| `dspec` | `00-index.md`, `01-architecture.md`, `test-strategy.md`, `99-traceability.md` |
| `code` | `00-index.md`, `99-traceability.md` (the manifest — the source itself lives in `<source>`, `<web>`, `<migrations>`) |
| `test` | `00-index.md`, `99-traceability.md` (the suites live in `<tests>` and the E2E trees) |
| `deploy` | `00-index.md`, `01-release.md`, `runbook.md`, `smoke.md` |

A stage that is `validated` with one of these missing reports as `gaps`, not as done. That is the check
that catches a feature which passed before a document became mandatory.

## Presenting the result

Print the table, then say — in at most three lines — which feature to move next and why. Nothing else. The
table is the report; restating its rows is noise.

For a single feature, the useful answer is one sentence: the stage, the reason, and the exact command.
