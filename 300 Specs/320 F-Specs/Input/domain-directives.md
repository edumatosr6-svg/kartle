# F-Spec stage — project directives (Kartle)

Read by `fspec-generator`, `fspec-validator` and `fspec-loop` as the directives of this stage. The
pipeline skills carry no knowledge of this project; everything Kartle-specific those loops enforce is
here.

Invariants referenced by id (`I1`…`In`) are defined in
[domain-invariants.md](../../../100%20Admin/120%20Processes/domain-invariants.md).

## Language

Every artifact of this project is written in **Brazilian Portuguese (pt-BR)**. Identifier prefixes,
front-matter keys and their values, severities, fixed file names, channel names and the slug are never
translated — see the full rule and the section-name tables in
[200 Requirements/220 Input/domain-directives.md](../../../200%20Requirements/220%20Input/domain-directives.md).
Code identifiers, file names and log messages stay in English.

## Contract vocabulary

| | Values |
|---|---|
| Session | None. There is no sign-up and no authenticated session (RNF10); player state lives in the browser and its storage keys are named by the D-Spec. |
| Roles named in an endpoint's Auth row | `player` (anonymous). No API exists in the MVP; the ranking and rooms services are post-MVP. |
| Primary domain key | `challengeNumber`, resolving to `trackId` + `trackVersion` (I1) |
| Primary endpoint prefix | None in the MVP. Proposed for the post-MVP ranking API: `/challenges/{challengeNumber}` |

## Directives

| # | Directive | Severity when broken |
|---|---|---|
| D-FS-01 | Every attempt, result, ghost, medal, streak or statistic is keyed on `challengeNumber` and carries `trackVersion`; one keyed on the date, the clock or the track name is rejected (I1). | `error` |
| D-FS-02 | Every game rule cites its source (`RF`, `RNF`, closed `Dnn` or product-owner decision). None is invented at this stage. | `error` |
| D-FS-03 | Every flow that receives an external event (remote-wheel command, result submission, track publication) states where deduplication happens (I7). | `error` |
| D-FS-04 | Attempt consumption and result recording state their behaviour on reload, abandonment and repetition; a state change with no idempotency statement is rejected (I7). | `error` |
| D-FS-05 | Lap validity, timing and scoring are decided by the simulation; a requirement that places them in rendering, UI or a control adapter is rejected (I2). | `error` |
| D-FS-06 | Units are SI and carried in the field name: metres (`lengthM`, `widthM`), milliseconds for times (`lapMs`), degrees for coordinates (`lat`, `lon`). | `error` |
| D-FS-07 | No secret, credential, real user identifier or real production content appears anywhere in this stage (I6). | `blocker` |
| D-FS-08 | Every flow that can run without the network states that it does (RNF08); one that needs a server states its fallback (I4). | `error` |

Rules are written as decision tables (lap validity, medals, attempt consumption), race and attempt states
as `stateDiagram-v2`, and remote-wheel or ranking exchanges as sequence diagrams.
