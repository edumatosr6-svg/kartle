# Domain invariants — Kartle

The rules of this product that no stage of the pipeline may break. They are **not** pipeline rules:
`.claude/skills/pipeline-conventions/SKILL.md` states what is true about the process; this file states
what is true about the product. Each stage's `Input/domain-directives.md` cites these by id.

Product facts below cite the existing planning set in `requirements/` (RF01–RF30, RNF01–RNF12, D01–D30).
A `Dnn` there is a **proposal**, not an approved rule, until the product owner closes it.

## Governance precedence

When two documents disagree, the order is: this file → the stage's `domain-directives.md` →
`pipeline-conventions` → the loop skill. A conflict between the first two is a human decision, never a
loop's.

## What the product is

Kartle is a 3D kart game in the browser: one real track per day, the same for every player, sessions of
3 to 5 minutes and a result the player can share. It is played on a computer with the keyboard or on a
phone with tilt and touch; using the phone as the computer's steering wheel comes after the MVP.
It must never produce an unfair or irreproducible official time: the same inputs on the same challenge
must give the same lap, for every player.

## I1 — Challenge-first

The domain is organised around the **daily challenge**: a `challengeNumber` that resolves to exactly one
`trackId` + `trackVersion`. Attempts, laps, sectors, results, medals, ghosts, streaks, statistics and the
shared text are all keyed on the challenge. Anything keyed only on the local date, the device clock or the
track name is rejected — a race in progress when the day turns over stays bound to the challenge it
started on (requirements/08, stage 5).

## I2 — Layering

From inner to outer, and a layer depends only on the layers inside it:

1. **Track data** (`src/track.ts`, later the generated track files) — geometry, gates, sectors. Pure data.
2. **Simulation** (`src/physics.ts`, `src/maneuvers.ts`) — movement, collisions, lap validation, timing,
   drift/turbo scoring. Pure and deterministic: it never touches the DOM, Three.js, audio, the wall clock
   (`Date`, `performance.now`) or an unseeded random. It must be able to run on a server (requirements/06).
3. **Control adapters** — keyboard, tilt, touch, later the remote wheel; each produces the normalised
   `Input` and nothing else.
4. **Application** (`src/main.ts`) — challenge, attempts, screens, persistence, rendering, audio.

A validator rejects a game rule (lap validity, attempt consumption, medal) decided in rendering or in a
control adapter, and any import from an outer layer into the simulation. The offline track pipeline and
the future online services sit outside the client and talk to it only through versioned data.

## I3 — Compatibility is preserved, or retired loudly

The published contracts are the track file (`schemaVersion`, `trackVersion`), the replay/ghost format,
the persisted player data and the shared text. A change that adds an optional field is additive; any other
change bumps the version and ships a reader for the previous one. A published `trackVersion` is never
edited in place. A removal is announced in the changed spec and in the release notes, never silent.

## I4 — Safe defaults

The solo game never waits for a server: if the rooms or ranking service is down, a player still starts and
finishes the daily challenge (RNF08). A missing or denied sensor falls back to keyboard or touch with a
visible state, never a silent failure. An input outside its range is clamped to the normalised `Input`
range. Persisted data with an unknown version is kept untouched and reported, never discarded.

## I5 — Schema changes are deliberate

There is no database in the MVP; the schemas are the track files and the player data stored in the
browser. Every change to either is versioned (I3) and comes with a reader for the previous version and a
test that reads the old shape. A player's attempts and history are never deleted or reset by an upgrade.
A future server datastore (PostgreSQL, proposed in requirements/06) gets forward migrations reviewed by
the product owner.

## I6 — Security and privacy, always

No sign-up and no personal data collection; a nickname only when the ranking exists (RNF10). No
repository file carries a secret, a credential, an API key, a real player identifier or real player data.
Track data derived from OpenStreetMap keeps its visible credit and the ODbL notice (RNF09). The site and
the sensors run over HTTPS (RNF06).

## I7 — State changes are idempotent and traceable

An attempt is consumed exactly once per challenge: a reload, a lost focus or a replayed event never
refunds it and never consumes a second one (D02, D03 pending). A lap result is recorded once, with the
challenge, the attempt and the input sequence that produced it, so that the time can be reproduced from
the replay. Future result submissions and remote-wheel commands carry an id the receiver deduplicates on.

## I8 — The simulation contract

`step(state, input, dt)` with the fixed step `STEP` is the interface the renderer, the tests, the bench
scripts, the ghost and the future server validation all depend on. The same initial state, configuration
and input sequence must give the same state and the same lap time (RNF07). Changing the step, the solver
rate or the meaning of an `Input` field breaks every stored replay and is a versioned change (I3).

## I9 — Tests are the evidence

Proof is a deterministic check run by `npm test` (node:test through tsx), stepping the simulation with
`STEP` — never a timing measured against the wall clock. Feel and tuning claims are backed by
`npm run bench:physics` or `npm run bench:handling` output recorded in `docs/`. Sensor, performance and
device claims (RNF01–RNF05) are proven only by a recorded test on the named devices and browsers; a
desktop run is not evidence for a phone.

## I10 — Scope discipline

Kartle deliberately does not do: simultaneous multiplayer between players, user accounts, a track editor,
custom karts, terrain elevation, or a native app (requirements/01). Track preparation is done offline by
the track pipeline, never inside the game. The remote wheel, the ranking and the country guessing mode are
after the MVP and do not enter an MVP story.
