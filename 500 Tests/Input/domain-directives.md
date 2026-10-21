# Tests stage — project directives (Kartle)

Read by `test-generator`, `test-validator` and `test-loop` as the directives of this stage. The pipeline
skills carry no knowledge of this project; everything Kartle-specific those loops enforce is here.

Invariants referenced by id (`I1`…`In`) are defined in
[domain-invariants.md](../../100%20Admin/120%20Processes/domain-invariants.md).

## Where tests live and how they run

| | |
|---|---|
| Test root | `tests/` at the repository root, as bound in the D-Spec directives |
| Runner | `node:test` with `node:assert/strict`, executed through `tsx` |
| Command for the whole suite | `npm test` |
| Command for the suite of one slug | `npx tsx --test "tests/<slug>*.test.ts"` — a slug's tests live in `tests/<slug>.test.ts` or `tests/<slug>-*.test.ts` |
| Coverage tool and the floor it must hold | not configured (OPEN-02) |
| Fixtures and factories | `initialState`, the presets `ARCADE_KART` / `RENTAL_KART` and the `TEST_PAD` environment from `src/physics.ts`; the synthetic circuit in `src/track.ts`. Input sequences are written in the test |

Device, sensor and performance checks (RNF01–RNF05) are manual: each records the device, the browser and
its version, and the measured value in `500 Tests/Output/<feature>/`.

## Directives

| # | Directive | Severity when broken |
|---|---|---|
| D-TS-01 | Every acceptance criterion of the slug has at least one check, named with its `AC-` id. | `error` |
| D-TS-02 | Every abnormal case named upstream has a check — reload, abandonment, invalid lap, cut, reversed finish, missing sensor; the happy path alone is not evidence (I9). | `error` |
| D-TS-03 | A test never asserts against a value the implementation computed for it; expected values come from the spec or from a recorded reference replay. | `error` |
| D-TS-04 | No test depends on wall-clock time, on execution order, on the network or on a live service; the simulation is advanced with `STEP`. | `error` |
| D-TS-05 | Every change to the simulation keeps a determinism check: the same initial state and input sequence run twice give identical state and lap time (I8). | `error` |
| D-TS-06 | Real player data is never used as a fixture; synthetic data only (I6). | `blocker` |
| D-TS-07 | A failing check is a finding of this stage, never a reason to weaken the check. | `blocker` |
