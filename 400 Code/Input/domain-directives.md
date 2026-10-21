# Code stage — project directives (Kartle)

Read by `code-generator`, `code-validator` and `code-loop` as the directives of this stage. The pipeline
skills carry no knowledge of this project; everything Kartle-specific those loops enforce is here.

Invariants referenced by id (`I1`…`In`) are defined in
[domain-invariants.md](../../100%20Admin/120%20Processes/domain-invariants.md).

## Language

Code identifiers, file names, commit messages and log messages are written in **English**. Player-facing
text exists in Portuguese and English (RNF11). Documents of this stage — the manifest, the traceability,
the reports — follow the project language declared in
[200 Requirements/220 Input/domain-directives.md](../../200%20Requirements/220%20Input/domain-directives.md).

## The code root and the tree

This project keeps its code at the **repository root**, not under `400 Code/Source/`. The role-to-path
table is the one in
[330 D-Specs/Input/domain-directives.md](../../300%20Specs/330%20D-Specs/Input/domain-directives.md);
it is stated there once and not repeated here.

## The deterministic gate

The commands the loop runs, in order, from the repository root. A non-zero exit is a `blocker`, and the
loop fixes it before asking a validator anything.

| Step | Command |
|---|---|
| Install | `npm ci` |
| Format check | not configured — no formatter in the project (OPEN-01) |
| Lint | not configured — no linter in the project (OPEN-01) |
| Type check | `npx tsc --noEmit` (`tsconfig.json` covers `src/` only; `tests/` and `scripts/` are checked by running them) |
| Unit tests | `npm test` |
| Build | `npm run build` |

When a change touches `src/physics.ts` or `src/maneuvers.ts`, the loop also runs `npm run bench:physics`
and `npm run bench:handling` and records the output in its report.

## House style

Follow the existing code: ESM with named exports, strict TypeScript, small pure functions in the
simulation that take a state and return a new one. Constants are `UPPER_SNAKE` (`STEP`, `WIDTH`,
`ARCADE_KART`). Kart parameters live in the presets of `src/physics.ts`, not scattered as literals.
No new runtime dependency without the product owner's approval. No configuration or environment variables
in the MVP client. Player-facing strings are never hard-coded in one language only once the pt/en layer
exists.

## Directives

| # | Directive | Severity when broken |
|---|---|---|
| D-CD-01 | Every implemented item traces to a `DES-` or `REQ-` id, and the manifest lists every file it touched. | `error` |
| D-CD-02 | `src/track.ts`, `src/physics.ts` and `src/maneuvers.ts` never import `three`, the DOM, `src/audio.ts` or `src/main.ts`, and never read `Date`, `performance.now` or `Math.random`; no game rule is decided in rendering or a control adapter (I2, I8). | `error` |
| D-CD-03 | Every change to a persisted or published format ships with its version bump and the reader for the previous version, tested (I3, I5). | `error` |
| D-CD-04 | Attempt consumption and result recording are idempotent across reload and repetition, as the spec states (I7). | `error` |
| D-CD-05 | No personal data is collected and the solo path makes no network request it depends on (I4, I6). | `blocker` |
| D-CD-06 | No secret, credential, real user identifier or real production content is committed (I6). | `blocker` |
| D-CD-07 | A divergence recorded upstream is either resolved by this change or left `open` with a reason — never silently dropped. | `error` |
