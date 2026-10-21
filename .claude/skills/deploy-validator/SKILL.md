---
name: deploy-validator
description: 'Validate a release candidate for a feature by proving it in staging: deploy it, run the migration up and down, run the smoke checks for backend, web and mobile, verify observability and the runbook, and confirm no secret leaked. Use when: deploy-generator finished and the release must be gated before a human promotes it. Emits SUCCESS (release candidate proven deployable and reversible), FAIL (packaging defect) or FAIL CODE (application defect). Runs isolated, never touches production, and fixes nothing.'
argument-hint: 'Feature; optionally --env staging'
---

# Deploy Validator — the last gate before a human decides

Proves three things, and refuses to guess about any of them: the release **installs**, it **works**, and
it **comes back out**.

Binary result: **SUCCESS** (a release candidate a human may promote), **FAIL** (a defect of the release
itself), or **FAIL CODE** (a defect of the application, which goes back to
[code-loop](../code-loop/SKILL.md)).

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md),
[domain-invariants.md](../pipeline-conventions/references/domain-invariants.md).

## Artifact locations

| Role | Path |
|---|---|
| Reference — release record | `600 Deploy/Output/<feature>/` |
| Reference — migration design | `300 Specs/330 D-Specs/Output/<feature>/data/DM-*.md` |
| Reference — NFR thresholds | `200 Requirements/230 Output/<feature>/nfr/` |
| Reference — test verdict | `500 Tests/Output/<feature>/reports/test-validation/` |
| Environment | staging only, as declared in `600 Deploy/Input/` |
| Emitted | `600 Deploy/Output/<feature>/reports/deploy-validation/deploy-validation-<YYYYMMDD-HHmm>.md` |
| Emitted — FAIL CODE | `400 Code/Output/<feature>/reports/feedback/deploy-report-<YYYYMMDD-HHmm>.md` |

Rules: one feature per run; **write only reports**; **never run a command against production**; never print
or record a secret value; the generator's reasoning is not an input.

## Checks

### P1 — Provenance

- The candidate is built by the pipeline from the **commit the tests verified** (`blocker` on a locally
  built artifact or an unstated commit — a release whose provenance cannot be stated cannot be
  reproduced or audited).
- The artifact in staging is fresh: its build timestamp postdates the last source edit (`blocker` on a
  stale artifact; it silently reproduces the previous behaviour).
- The newest `500 Tests` verdict for the feature is SUCCESS (`blocker` otherwise).

### P2 — Secrets

- No secret value appears in any file of the release record, in any pipeline definition, in any container
  layer, in any log captured by this run, or in this report (`blocker`).
- Every variable `config.md` names is present in the staging environment (`error` on a missing one — the
  same gap will stop production), and every one **the application actually reads** is named in
  `config.md` (`error` on an undocumented variable: an operator cannot provision what nobody wrote down).

### P3 — Install

- The deployment completes from the pipeline, with no manual step that the runbook does not describe
  (`error` on an undocumented manual step — it will be forgotten in production).
- The service starts, passes its health check, and serves the API (`error` otherwise).
- The web bundle is served and loads; the mobile build is produced and installs on the target
  configuration, for a feature with those channels in scope (`error`).

### P4 — Migration, both directions

- The migration-history check declared in `600 Deploy/Input/` reports exactly **one** head (`blocker` on
  more — two branches of the schema will race
  in production).
- The upgrade runs on a **restored copy of representative data**, not an empty database (`error` on an
  empty-database-only rehearsal: it exercises none of the cases the real data contains).
- The upgrade's duration and any lock it takes are recorded (`error` when unmeasured — a migration whose
  duration is unknown is a window nobody agreed to).
- **The downgrade is actually executed**, and the schema and data return to a working state the previous
  release can serve (`error` when the downgrade is skipped, fails, or loses data — an untested rollback
  is not a rollback path).
- Every backfill is confirmed idempotent by running it twice, and its progress is observable
  (`error` otherwise).

### P5 — Behaviour in staging

- Every smoke check of `smoke.md` runs and passes, per channel (`error` on a skipped channel).
- Each smoke check **observes the NFR threshold it names**, and the observed value is recorded
  (`error` when a check asserts only that the request succeeded — that proves the process started,
  nothing more).
- Authentication, RBAC and the webhook signature all behave as the contract specifies in the staging
  environment (`error` — a deployment that weakens a control is the most expensive kind of defect).
- A failure observed here that is a defect of the **application** and not of the release is classified
  **FAIL CODE**, with the evidence, and is not worked around in the packaging.

### P6 — Reversibility and the runbook

- `runbook.md` exists and covers preconditions, promote, verify and roll back (`error` otherwise).
- Every step names an **expected observable outcome** (`error` on a step whose success cannot be seen).
- Every step has an undo and a stated duration, and the **point of no return** is named (`error` when
  missing — the release then has no stated moment at which the decision becomes final).
- The rollback path was demonstrated in staging, not merely described (`error`).
- The compatibility window and the minimum supported mobile version are stated, and an un-updated client
  was exercised against the new backend (`error` for a feature with `mobile` in scope).

### P7 — Observability

- Every new failure mode the release introduces is visible: a log line with identifiers, a metric, or an
  alert (`error` on a failure mode with no signal).
- No log emitted in staging contains a content class the directives mark unloggable
  (`blocker` — I6). Check the actual captured logs, not the intent stated in `observability.md`.
- Each NFR threshold has a metric that would show it being missed (`warning` when unnamed).

### P8 — Flags and rollout

- The feature's feature flag is **off** in the deployed configuration (`error` when a new feature arrives
  enabled — I4).
- `rollout.md`'s order of operations matches what was actually done in staging (`error` on a divergence:
  the rehearsal then proves a different plan from the one that will run).

## Verdict

- Any `blocker` → **FAIL**, with the blocker named; the candidate is not judgeable.
- A defect of the application → **FAIL CODE**, and the report goes to `code-loop`.
- Any other `error` → **FAIL**.
- Otherwise → **SUCCESS**: a release candidate, proven deployable and reversible in staging.

**SUCCESS is not a promotion.** End the report with the promotion question and the runbook path, and stop.

## Procedure

1. Resolve the feature; confirm the release record and the test verdict (`blocker` otherwise).
2. Run P1 and P2 before deploying anything — a candidate with bad provenance or a leaked secret is not
   deployed at all.
3. Deploy to staging; run P3.
4. Restore a representative copy, run the migration up, record duration and locks, run the smoke checks,
   then run the migration **down** and confirm the previous release still serves. Record every step.
5. Run P5–P8.
6. Write the report. Fix nothing; change no configuration to make a check pass.
7. Announce the verdict and return to [deploy-loop](../deploy-loop/SKILL.md).

## Report format

```markdown
---
stage: deploy
feature: <feature>
verdict: SUCCESS | FAIL | FAIL CODE
generated: <YYYY-MM-DDTHH:mm:ssZ>
environment: staging
commit: <sha>
counts: {blocker: 0, error: 0, warning: 0, info: 0, divergence: 0}
---

## Evidence
| Proof | Result |
|---|---|
| Built by pipeline from <sha> | yes |
| Migration heads | 1 (<revision>) |
| Upgrade on restored copy | 42 s, no blocking lock |
| Downgrade executed | yes — previous release served for 5 min |
| Backfill run twice | idempotent |
| Smoke — backend / web / mobile | pass / pass / pass |
| NFR observed | timeline first paint 1.4 s (threshold 2 s) |
| Un-updated mobile client against new backend | pass |
| Secrets in artifacts and logs | none |

## Issues
<One ISSUE-<nn> block each.>

## Promotion question
<The single decision the human must take, with the runbook path and the point of no return.>
```

The **Evidence** table exists because "staging looked fine" is not a gate. Every row is something that was
run, with the number it produced.

## Bindings — stated in [pipeline-conventions](../pipeline-conventions/SKILL.md), not restated here

- **The rubric above is closed** (§8). The checks are the whole list; a finding that no numbered check
  produced is not reported. A check the rubric genuinely lacks is added to *this skill*, deliberately —
  never improvised inside a run, which turns the report into a sample of an unbounded reading instead
  of a backlog that shrinks.
- **The mechanical layer is already decided** (§13). `lint_artifacts.py` ran before this skill and
  settled front matter, id format and uniqueness, filename agreement, index agreement, traceability
  resolution and the required files. **Never re-judge any of it.**
- **On a re-validation the population is fixed** (§8): every issue of the previous report first, then
  every file whose `version:` moved, then **two** untouched files sampled at random. Widening it
  mid-loop breaks the *No progress* comparison this run is about to be judged by.
- **Report discipline** (§19): front matter, title, entries. No introduction, no narrative of the pass,
  no list of what was found sound, no closing summary. Each entry is fields only, one line per field.
- **Cross-feature findings become feedback, never an edit** (§14). A finding whose fix belongs to
  another feature is written to `<stage-output>/<target feature>/reports/feedbacks/<this feature>/feedback-<stamp>.md`
  as `FB-<nn>`, with `origin:`, `target:` and `origin-stage:`. At a spec stage it is a `scope` item that
  does **not** enter this verdict, so this feature can still reach SUCCESS. Name every feedback sent in
  the report's front matter.
- **Bounded evidence** (§18): never read a run log, result set or dataset into the context. Reduce it
  with `reduce_run.py` and treat that summary as the evidence.
