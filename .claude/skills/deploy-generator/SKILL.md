---
name: deploy-generator
description: 'Prepare the release of a feature: build and release pipeline changes, environment configuration templates (names only), the migration and rollback plan, mobile store packaging and signing description, observability hooks, and the release runbook — recorded under "600 Deploy/Output/<feature>/". Use when: the tests passed and the change must be made deployable; fixing a release after a FAIL Deployment Validation Report. Never writes a secret value and never runs a command against production.'
argument-hint: 'Feature, and/or the path to a deployment validation report'
---

# Deploy Generator — stage 6 (`600 Deploy`)

Produces everything needed to ship the change and to un-ship it. The deliverable is not "it deployed
once"; it is a release a human who did not write it can promote, verify and roll back.

Binding: [pipeline-conventions](../pipeline-conventions/SKILL.md),
[domain-invariants.md](../pipeline-conventions/references/domain-invariants.md).

## Artifact locations

| Role | Path |
|---|---|
| Input — verified build | `500 Tests/Output/<feature>/reports/test-validation/` (verdict SUCCESS) |
| Input — migration design | `300 Specs/330 D-Specs/Output/<feature>/data/DM-*.md` |
| Input — NFR thresholds | `200 Requirements/230 Output/<feature>/nfr/` |
| Input — release directives | `600 Deploy/Input/` |
| Existing assets (edited in place where the change requires it) | the build, pipeline, deploy and migration-config files listed in `600 Deploy/Input/` |
| Reference | the migration runbook named in `600 Deploy/Input/` |
| Output — release record | `600 Deploy/Output/<feature>/` |

## Modes

| Mode | Trigger | Behaviour |
|---|---|---|
| **A** | No release record | Prepare the whole release |
| **B** | A FAIL Deployment Validation Report | Fix only the listed issues |

## Structure

```
600 Deploy/Output/<feature>/
├── 00-index.md
├── 01-release.md          # what ships, from which commit, for which channels
├── config.md              # every environment variable this release needs — NAMES AND MEANINGS ONLY
├── migration.md           # revisions applied, order, backfill, downgrade, compatibility window
├── rollout.md             # order of operations across backend, web, mobile; the compatibility window
├── mobile.md              # build, signing, store submission, minimum supported version, forced update
├── observability.md       # what is logged, what is measured, which alert would fire
├── smoke.md               # the checks that prove the release works, per channel, each observing an NFR
├── runbook.md             # promote / verify / roll back, as executable steps for a human
├── 98-divergences.md
└── reports/
    ├── deploy-validation/
    └── feedback/
```

## Release policy

1. **Secrets are names, never values.** `config.md` lists the variable name, what it is for, which
   environment sets it, and whether it is required. A value — real, example-shaped, or "placeholder" —
   anywhere in this stage is a `blocker`. Never print one, never log one, never put one in a report.
2. **The pipeline reproduces the verified build.** The artifact that reaches staging is built from the
   commit the tests verified, by the pipeline, not from a local build. A release whose provenance cannot
   be stated is not a release.
3. **Migrations go up and come back down.** `migration.md` names each revision, its order, its expected
   duration, and its **downgrade**, and the downgrade is rehearsed in staging on a restored copy — not
   merely written. A backfill is idempotent, restartable, batched, and has a stated way to observe its
   progress and to stop it.
4. **The compatibility window is explicit.** Old and new code will run at the same time — during the
   rollout, and for as long as an un-updated mobile app is in the field. `rollout.md` states what the old
   version must keep working against, for how long, and what the minimum supported client version is.
   A change that breaks a released mobile build without a forced-update plan is a defect of this stage.
5. **Order of operations is stated and justified.** Typically: additive migration → backend → web →
   mobile → the destructive part of the migration in a later release. Anything else needs its reason.
6. **Every release is reversible at every step.** For each step, `runbook.md` says how to undo it and how
   long the undo takes. "Roll forward" is a plan only where the undo is genuinely impossible, and then it
   is named as such.
7. **Smoke tests observe, not assume.** `smoke.md` lists a check per channel that exercises the feature's
   main path end to end, and each names the **NFR threshold it observes** — a latency, an error rate, a
   delivery. A smoke test that only asserts a 200 proves the process started, nothing more.
8. **Observability before the incident.** `observability.md` names what the release adds to the logs
   (identifiers only — never a content class the directives mark unloggable), what metric
   would show each NFR being missed, and which alert would fire. A release with a new failure mode and no
   way to see it is incomplete.
9. **Feature flags carry the rollout.** A new feature ships behind a flag that is **off** in production
   at deploy time (I4), and `rollout.md` states who turns it on, in what order, and what they watch. The
   flag's removal is a later release, named here.
10. **Nothing runs against production.** Every production action is a runbook step for a human, written
    so someone who did not build the release can execute it.

## The runbook

The one document that is read under pressure. Written accordingly:

```markdown
## Preconditions
- [ ] Test verdict SUCCESS for <feature>, report <path>
- [ ] Staging validation SUCCESS, report <path>
- [ ] Migration history has a single head: <revision>
- [ ] Flag <name> is off in production

## Promote
1. <command or pipeline action>          expected: <observable outcome>   takes: <duration>
2. ...

## Verify
1. <smoke check>                          expected: <threshold observed>

## Roll back
1. <exact undo of step N>                 takes: <duration>
...
Point of no return: <the step after which rollback is no longer possible, and why>
```

Every step names its **expected observable outcome**. A step whose success cannot be observed cannot be
verified under pressure, and it is the one that will be skipped.

## Procedure

1. Confirm the test verdict is SUCCESS and note the commit it verified.
2. Read the migration design and the NFR thresholds.
3. Write `01-release.md` and `config.md` (names only).
4. Write `migration.md`, including the downgrade and the backfill controls.
5. Write `rollout.md` with the order of operations and the compatibility window, and `mobile.md` if
   `mobile` is in scope.
6. Update the pipeline and container assets the release actually needs. Touch nothing else.
7. Write `observability.md` and `smoke.md`, each smoke check bound to an NFR threshold.
8. Write `runbook.md` last, from the documents above, and read it once as if you had not written it.
9. Report and hand back to [deploy-loop](../deploy-loop/SKILL.md). Never invoke `deploy-validator`, and
   never run anything against production.

## Bindings — stated in [pipeline-conventions](../pipeline-conventions/SKILL.md), not restated here

- **Frozen surface on a fix round** (§16). Mode B clears the issues in a report and **adds no**
  requirement, listing, key, parameter, endpoint, field, screen or interface element the failing
  artifact did not already carry. A validator's rubric rewards completeness and will pull the artifact
  past what the seed asked for. A need for new surface is not a fix: it goes to the feature's
  `SCOPE-BACKLOG.md` for its author, and the run stops on *Surface unfrozen on a fix round*.
  Mode A and Mode C may add surface — each has an upstream item authorising it.
- **Derived files are never written here** (§13). `00-index.md` and `99-traceability.md` are generated
  by `lint_artifacts.py --emit` from the artifacts themselves. Write the artifacts; refer to a table in
  prose and never enumerate it. Hand-writing a derived file restores the pipeline's largest class of
  finding — one fact in four places, one of them stale.
- **The changelog** (§17): append one dated entry per round to `97-changelog.md` — what changed, which
  `ISSUE-<nn>`/`FB-<nn>` items it closed, and **every item declined, with its reason**. Silence reads as
  agreement, and the item returns next round as a new finding.
- **The write fence** (§14): everything this run writes lives under this feature's stage output. A
  change another feature needs is a feedback, written to that feature's `reports/feedbacks/<this feature>/`
  — it proposes and changes nothing.
- **Phase input boundaries** (§12): read only this stage's closed input list. Reaching back past the
  upstream artifact for a constraint it failed to state destroys the evidence that it was incomplete —
  that gap must surface as a finding, not be silently filled in.

## Quality rules (self-check)

- No secret value anywhere, including in examples and reports.
- The release names the commit the tests verified.
- Every revision has a rehearsed downgrade; every backfill is idempotent and observable.
- The compatibility window and the minimum supported client version are stated.
- Every step of the runbook has an expected observable outcome and an undo, and the point of no return is
  named.
- Every smoke check observes an NFR threshold.
- The new feature's flag is off in production at deploy time.
- Only the deployment assets the release needs were touched.
