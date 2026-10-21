# D-Spec stage — project directives (Kartle)

Read by `dspec-generator`, `dspec-validator` and `dspec-loop` as the directives of this stage. The
pipeline skills carry no knowledge of this project; everything Kartle-specific those loops enforce is
here.

Invariants referenced by id (`I1`…`In`) are defined in
[domain-invariants.md](../../../100%20Admin/120%20Processes/domain-invariants.md).

## Language

Every artifact of this project is written in **Brazilian Portuguese (pt-BR)**; the non-translated set is
stated in
[200 Requirements/220 Input/domain-directives.md](../../../200%20Requirements/220%20Input/domain-directives.md).
Code identifiers, module paths, file names and log messages stay in English.

## The tree roles

**This project keeps its code at the repository root, not under `400 Code/Source/`** (decision of the
product owner, 2026-10-20: moving it would break Vite, `tsconfig.json` and the npm scripts).
`400 Code/Source/` stays empty. Every path below, and every module path in a design of this project, is
**relative to the repository root**; seen from the pipeline's code root they are `../../<path>`.

| Role | Path from the repository root |
|---|---|
| `<source>` | `src/` (client: simulation, adapters, application) |
| `<web>` | `src/` and `index.html` — the web client is the same source; there is no separate web tree |
| `<mobile>` | not used — the phone runs the same web client |
| `<migrations>` | not used in the MVP — no database; persisted-data readers live in `src/` (I5) |
| `<tests>` | `tests/` |

Also present: `scripts/` (benches: `physics-bench.ts`, `keyboard-lap.ts`), `docs/` (physics and
maneuver notes), `requirements/` (planning set). The offline track pipeline (Python) has no folder yet.

## The stack

| | |
|---|---|
| Language / runtime | TypeScript 5.9 (strict, ES2022, ESM) in the browser; Node with `tsx` for tests and benches |
| Framework | Vite 8 (dev server and build), Three.js 0.186 (rendering) |
| Datastore | Browser storage for player data in the MVP; PostgreSQL proposed for post-MVP services (requirements/06) |
| Migration tool | None; versioned readers keyed on `schemaVersion` (I3, I5) |
| Async / queue | None in the MVP; Node + Fastify + Socket.IO proposed for post-MVP rooms (requirements/06) |
| Third-party services the design may depend on | OpenStreetMap data via the offline pipeline (ODbL, RNF09); a static CDN with HTTPS (provider open, D23). Browser APIs: DeviceOrientation, Vibration, Web Share |

## Layer map

In dependency order (I2); a design item is placed in exactly one:

| Layer | Modules | May | May not |
|---|---|---|---|
| Track data | `src/track.ts` | hold geometry, gates, sectors | import any other layer |
| Simulation | `src/physics.ts`, `src/maneuvers.ts` | move the kart, validate laps, time, score | import `three`, the DOM, `src/audio.ts`, `src/main.ts`; read `Date`, `performance.now` or `Math.random` |
| Control adapters | in `src/main.ts` today | turn keyboard, tilt, touch into the normalised `Input` | decide a game rule |
| Application | `src/main.ts`, `src/audio.ts`, `src/style.css` | challenge, attempts, screens, persistence, rendering, sound | change simulation state other than through `step` |

A new module is placed in one of these layers by the design; splitting `src/main.ts` is a design item of
its own, never a side effect.

## Directives

| # | Directive | Severity when broken |
|---|---|---|
| D-DS-01 | Every design item names its layer from the map above, and the dependency direction of I2 holds. | `error` |
| D-DS-02 | Every change to a track file, replay or persisted player data bumps its version and comes with a reader for the previous version; no design deletes or resets a player's history (I3, I5). | `error` |
| D-DS-03 | Every external integration (OSM pipeline input, CDN, post-MVP API or rooms) states its timeout, its retry policy and its idempotency key, and the solo path does not wait on it (I4, I7). | `error` |
| D-DS-04 | Every design item that persists or transmits data names the fields and why they are needed; no personal data (I6, RNF10). | `error` |
| D-DS-05 | An ADR is written for every decision that is expensive to reverse — the step and solver rate, the replay format, the track schema, the storage layout. | `warning` |
| D-DS-06 | No secret, credential, real user identifier or real production content appears anywhere in this stage (I6). | `blocker` |
| D-DS-07 | Every design item in the simulation states how it stays deterministic: fixed `STEP`, no wall clock, no unseeded random, and the test that proves the same inputs give the same state (I8). | `error` |
