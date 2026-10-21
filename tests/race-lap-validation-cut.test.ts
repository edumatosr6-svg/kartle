// TEST-0006 — cut and grass over the real physics, with the test's own distance oracle (strategy: lap-cut, integration, DES-0004).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ARCADE_KART, TEST_PAD, WIDTH, type Environment } from '../src/physics';
import { getLapResult, getLapState, pauseLap, resumeLap, startLap, stepLap, type LapResult, type LapSession, type LapStateView } from '../src/lap';
import { toMs } from '../src/lapTiming';
import { describeLap } from '../src/lapMessages';
import { readTrackData } from '../src/trackData';
import { syntheticReading, withCutLimits } from './fixtures/trackFiles';
import { autopilot, constant, DRIVE_OUT, drive, IDLE, kartAt, runCountdown, seedLap, startSession, type StepHook } from './helpers/autopilot';
import { beyondEdgeM } from './helpers/geometry';

const reading = syntheticReading();
if (reading.trackDataStatus !== 'COMPLETE') throw new Error('fixture: synthetic reading must be COMPLETE');
const view = (lap: LapSession): LapStateView => getLapState(lap) as LapStateView;
const result = (lap: LapSession): Partial<LapResult> & { code?: string } => getLapResult(lap) as Partial<LapResult> & { code?: string };

// Oracle: first step at which more than `durationMs` of consecutive steps beyond `distanceM` from the edge have run.
function cutOracle(distanceM: number, durationMs: number): { firstExceeded: () => number; hook: StepHook } {
  let run = 0, first = -1;
  const hook: StepHook = (_before, after) => {
    if (beyondEdgeM(after.kart) > distanceM) {
      run++;
      if (first < 0 && 25 * run > 3 * durationMs) first = after.stepCount;
    } else run = 0;
  };
  return { firstExceeded: () => first, hook };
}

test('CHK-TEST-0006-01 driving straight off the track invalidates the lap in the step in which 1000 ms beyond 3 m are exceeded', () => {
  // AC-US-0006-01
  const { firstExceeded, hook } = cutOracle(3, 1000);
  const { lap } = drive(runCountdown(startSession(reading)), constant(DRIVE_OUT), 3000, hook);
  assert.ok(firstExceeded() > 0, 'AC-US-0006-01: the oracle must have seen the kart beyond 3 m for more than 1000 ms');
  assert.equal(view(lap).lapValidity, 'INVALID', 'AC-US-0006-01: the lap must be INVALID after the cut');
  assert.equal(view(lap).invalidReason, 'CUT', 'AC-US-0006-01: the reason must be CUT');
  assert.equal(lap.stepCount, firstExceeded(), `AC-US-0006-01: the lap must end in step ${firstExceeded()}, the one in which 1000 ms were exceeded`);
});

test('CHK-TEST-0006-02 up to 1000 ms beyond 3 m followed by a return to 3 m or less does not invalidate, and a new exit restarts the count', () => {
  // AC-US-0006-02
  const started = runCountdown(startSession(reading));
  const far = kartAt(40, 0, WIDTH / 2 + 4);
  const near = kartAt(40, 0, WIDTH / 2 + 2);
  assert.ok(beyondEdgeM(far) > 3 && beyondEdgeM(near) <= 3, 'AC-US-0006-02: fixture positions must be 4 m and 2 m beyond the edge');
  let lap = drive(seedLap(started, { kart: far }), constant(IDLE), 120).lap;
  assert.equal(view(lap).lapValidity, 'VALID', 'AC-US-0006-02: exactly 1000 ms beyond 3 m must not invalidate');
  lap = drive(seedLap(lap, { kart: near }), constant(IDLE), 1).lap;
  lap = drive(seedLap(lap, { kart: far }), constant(IDLE), 120).lap;
  assert.equal(view(lap).lapValidity, 'VALID', 'AC-US-0006-02: a second exit of 1000 ms after a return must not invalidate');
  lap = stepLap(lap, IDLE);
  assert.equal(view(lap).invalidReason, 'CUT', 'AC-US-0006-02: the 121st consecutive step beyond 3 m must be the cut');
});

test('CHK-TEST-0006-03 a kart beyond the edge by 3 m or less, for any duration while driving, is not invalidated', () => {
  // AC-US-0006-03
  let maxBeyond = 0, grassSteps = 0;
  const { lap } = drive(runCountdown(startSession(reading)), autopilot(-7), 600, (_b, a) => {
    if (a.stepCount > 240) { const m = beyondEdgeM(a.kart); maxBeyond = Math.max(maxBeyond, m); if (m > 0) grassSteps++; }
  });
  assert.ok(grassSteps > 200, `AC-US-0006-03: the fixture must keep the kart on the grass (${grassSteps} steps beyond the edge)`);
  assert.ok(maxBeyond <= 3, `AC-US-0006-03: the fixture must stay within 3 m of the edge (max ${maxBeyond.toFixed(2)} m)`);
  assert.equal(view(lap).lapValidity, 'VALID', 'AC-US-0006-03: a kart within 3 m of the edge must not be invalidated');
  assert.equal(lap.phase, 'RUNNING', 'AC-US-0006-03: the lap must still be running');
});

test('CHK-TEST-0006-04 a kart standing 2 m beyond the edge for 5 s is not invalidated', () => {
  // AC-US-0006-03
  const started = runCountdown(startSession(reading));
  const seeded = seedLap(started, { kart: kartAt(40, 0, WIDTH / 2 + 2) });
  assert.ok(Math.abs(beyondEdgeM(seeded.kart) - 2) < 0.05, 'AC-US-0006-03: the fixture must place the kart 2 m beyond the edge');
  const { lap } = drive(seeded, constant(IDLE), 600);
  assert.equal(view(lap).lapValidity, 'VALID', 'AC-US-0006-03: 5 s at 2 m beyond the edge must not invalidate');
  assert.equal(view(lap).elapsedMs, toMs(600), 'AC-US-0006-03: the lap must keep timing while on the grass');
});

test('CHK-TEST-0006-05 a track that declares its own cut limits invalidates by those limits, not by 3 m and 1000 ms', () => {
  // AC-US-0006-04
  const custom = readTrackData(withCutLimits(1, 300));
  assert.equal(custom.trackDataStatus, 'COMPLETE', 'AC-US-0006-04: the fixture with own limits must be COMPLETE');
  const own = cutOracle(1, 300);
  const dflt = cutOracle(3, 1000);
  const { lap } = drive(runCountdown(startSession(custom)), constant(DRIVE_OUT), 3000, (b, a, i) => { own.hook(b, a, i); dflt.hook(b, a, i); });
  assert.equal(view(lap).invalidReason, 'CUT', 'AC-US-0006-04: the lap must be invalidated by CUT');
  assert.equal(lap.stepCount, own.firstExceeded(), `AC-US-0006-04: the cut must fire at step ${own.firstExceeded()} by the track limits (1 m, 300 ms)`);
  assert.ok(dflt.firstExceeded() < 0 || lap.stepCount < dflt.firstExceeded(), 'AC-US-0006-04: the cut must fire before the default limits would');
});

test('CHK-TEST-0006-06 a lap invalid by cut ends at the cut step: no lap time and no sector time is added afterwards', () => {
  // AC-US-0006-06
  const { lap: ended } = drive(runCountdown(startSession(reading)), constant(DRIVE_OUT), 3000);
  assert.equal(view(ended).invalidReason, 'CUT', 'AC-US-0006-06: the fixture must end in a cut');
  const elapsed = view(ended).elapsedMs, bounds = [...ended.sectorBoundsMs], steps = ended.stepCount;
  let lap = ended;
  for (let i = 0; i < 600; i++) lap = stepLap(lap, DRIVE_OUT);
  assert.equal(view(lap).elapsedMs, elapsed, 'AC-US-0006-06: elapsedMs must not change after the cut');
  assert.deepEqual(lap.sectorBoundsMs, bounds, 'AC-US-0006-06: sector bounds must not change after the cut');
  assert.equal(lap.stepCount, steps, 'AC-US-0006-06: no step must be added after the cut');
  assert.equal(result(lap).lapMs, undefined, 'AC-US-0006-06: a cut lap must carry no lap time');
});

test('CHK-TEST-0006-07 from the same state and input, the kart is slower after N steps on grass than on the track', () => {
  // AC-US-0006-07
  const grass: Environment = { surfaceAt: () => 'grass', walls: false };
  const request = { lapKind: 'OFFICIAL' as const, trackId: reading.trackId, trackVersion: reading.trackVersion };
  const onTrack = startLap(undefined, request, reading, ARCADE_KART, TEST_PAD);
  const onGrass = startLap(undefined, request, reading, ARCADE_KART, grass);
  assert.ok(onTrack.ok && onGrass.ok, 'AC-US-0006-07: both laps must start');
  if (!onTrack.ok || !onGrass.ok) return;
  assert.deepEqual(onTrack.lap.kart, onGrass.lap.kart, 'AC-US-0006-07: both laps must start from the same kart state');
  const a = drive(runCountdown(onTrack.lap), constant(DRIVE_OUT), 240).lap;
  const g = drive(runCountdown(onGrass.lap), constant(DRIVE_OUT), 240).lap;
  assert.ok(g.kart.speed < a.kart.speed - 0.5, `AC-US-0006-07: grass speed ${g.kart.speed.toFixed(2)} must be lower than track speed ${a.kart.speed.toFixed(2)}`);
});

test('CHK-TEST-0006-08 driving on the grass within the cut limits keeps the lap shown as valid in progress', () => {
  // AC-US-0006-08
  let onGrass = 0;
  const { lap } = drive(runCountdown(startSession(reading)), autopilot(-7), 600, (_b, a) => {
    if (beyondEdgeM(a.kart) > 0) {
      onGrass++;
      assert.equal(describeLap(view(a), 'pt').stateText, 'válida em andamento', `AC-US-0006-08: state at step ${a.stepCount} on the grass must read "válida em andamento"`);
    }
  });
  assert.ok(onGrass > 200, 'AC-US-0006-08: the fixture must have driven on the grass');
  assert.equal(view(lap).lapValidity, 'VALID', 'AC-US-0006-08: the lap must still be VALID');
});

test('CHK-TEST-0006-09 time spent paused while off the track does not count towards the 1000 ms', () => {
  // AC-US-0006-01 (abnormal case: pause during the exit)
  const started = runCountdown(startSession(reading));
  let lap = drive(seedLap(started, { kart: kartAt(40, 0, WIDTH / 2 + 4) }), constant(IDLE), 100).lap;
  const p = pauseLap(lap, 'ESC_KEY');
  assert.ok(p.ok, 'AC-US-0006-01: pause must be accepted');
  lap = p.lap;
  for (let i = 0; i < 500; i++) lap = stepLap(lap, IDLE);
  const r = resumeLap(lap);
  assert.ok(r.ok, 'AC-US-0006-01: resume must be accepted');
  lap = drive(r.lap, constant(IDLE), 20).lap;
  assert.equal(view(lap).lapValidity, 'VALID', 'AC-US-0006-01: 120 off-track steps around a pause must not invalidate');
  lap = stepLap(lap, IDLE);
  assert.equal(view(lap).invalidReason, 'CUT', 'AC-US-0006-01: the 121st off-track step must be the cut');
});

test('CHK-TEST-0006-10 the result of a cut lap carries the reason CUT and is not official', () => {
  // AC-US-0006-05
  const { lap } = drive(runCountdown(startSession(reading)), constant(DRIVE_OUT), 3000);
  const r = result(lap);
  assert.equal(r.lapValidity, 'INVALID', 'AC-US-0006-05: the lap must be INVALID');
  assert.equal(r.invalidReason, 'CUT', 'AC-US-0006-05: the result must carry the reason CUT for the screen to show "corte"');
  assert.equal(r.official, false, 'AC-US-0006-05: a cut lap must not be official');
  assert.equal(describeLap(view(lap), 'pt').reasonText, 'corte', 'AC-US-0006-05: the screen reason must read "corte"');
});
