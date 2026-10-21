// TEST-0005 — markers, sector limits, finish line and sense over the real physics (strategy: lap-validity, integration, DES-0003).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getLapResult, getLapState, pauseLap, resumeLap, stepLap, type LapResult, type LapSession, type LapStateView } from '../src/lap';
import { toMs } from '../src/lapTiming';
import { crossLine, SYNTHETIC_TRACK_FILE } from '../src/track';
import { readTrackData } from '../src/trackData';
import { syntheticReading, withShortMarker } from './fixtures/trackFiles';
import { autopilot, completeLap, constant, DRIVE_OUT, drive, IDLE, kartAt, runCountdown, seedLap, startSession, type StepHook } from './helpers/autopilot';
import { singleCrossing } from './helpers/geometry';

const reading = syntheticReading();
if (reading.trackDataStatus !== 'COMPLETE') throw new Error('fixture: synthetic reading must be COMPLETE');
const view = (lap: LapSession): LapStateView => getLapState(lap) as LapStateView;
const result = (lap: LapSession): Partial<LapResult> & { code?: string } => getLapResult(lap) as Partial<LapResult> & { code?: string };

// The test's own oracle: the step k (before -> after) at which each declared line is crossed in the track sense.
type Oracle = { finishStep: number; limitSteps: number[]; markerSteps: number[] };
function oracle(): { o: Oracle; hook: StepHook } {
  const o: Oracle = { finishStep: -1, limitSteps: [], markerSteps: [] };
  const hook: StepHook = (before, after) => {
    reading.sectorLimits.forEach((l, i) => { const c = crossLine(l, before.kart, after.kart); if (c?.sense === 'FORWARD') o.limitSteps[i] = before.stepCount; });
    reading.markers.forEach((m, i) => { const c = crossLine(m, before.kart, after.kart); if (c?.sense === 'FORWARD') o.markerSteps[i] = before.stepCount; });
    const f = crossLine(reading.finishLine, before.kart, after.kart);
    if (f?.sense === 'FORWARD') o.finishStep = before.stepCount;
  };
  return { o, hook };
}

test('CHK-TEST-0005-01 crossing the finish in the track sense after every marker in order ends the lap as valid', () => {
  // AC-US-0002-01
  const { lap } = completeLap(reading);
  assert.equal(lap.phase, 'ENDED', 'AC-US-0002-01: the lap must end at the finish');
  assert.equal(view(lap).lapValidity, 'VALID', 'AC-US-0002-01: the lap must be VALID');
  assert.equal(view(lap).markersPassedCount, 4, 'AC-US-0002-01: all four markers must have been passed');
});

test('CHK-TEST-0005-02 the total time lies strictly inside the step in which the finish line was crossed', () => {
  // AC-US-0002-07
  const { o, hook } = oracle();
  const { lap } = completeLap(reading, 'OFFICIAL', autopilot(), hook);
  const r = result(lap);
  assert.equal(r.lapValidity, 'VALID', 'AC-US-0002-07: the lap must be VALID');
  assert.ok(o.finishStep >= 0, 'AC-US-0002-07: the oracle must have seen the finish crossing');
  assert.ok(r.lapMs! > toMs(o.finishStep) && r.lapMs! < toMs(o.finishStep + 1),
    `AC-US-0002-07: lapMs ${r.lapMs} is not strictly inside (${toMs(o.finishStep)}, ${toMs(o.finishStep + 1)}) for the finish step ${o.finishStep}`);
});

test('CHK-TEST-0005-03 the end of each sector lies strictly inside the step in which its limit was crossed', () => {
  // AC-US-0002-08
  const { o, hook } = oracle();
  const { lap } = completeLap(reading, 'OFFICIAL', autopilot(), hook);
  assert.equal(lap.sectorBoundsMs.length, 3, 'AC-US-0002-08: three sector limits must have been crossed');
  lap.sectorBoundsMs.forEach((bound, i) => {
    const k = o.limitSteps[i];
    assert.ok(k !== undefined, `AC-US-0002-08: the oracle must have seen limit ${i + 1}`);
    assert.ok(bound > toMs(k) && bound < toMs(k + 1), `AC-US-0002-08: sector ${i + 1} end ${bound} is not strictly inside (${toMs(k)}, ${toMs(k + 1)}) for step ${k}`);
  });
});

test('CHK-TEST-0005-04 each sector ends at the crossing of its declared limit and the first sector starts at the green signal', () => {
  // AC-US-0002-10
  const { o, hook } = oracle();
  const { lap } = completeLap(reading, 'OFFICIAL', autopilot(), hook);
  const r = result(lap);
  const bounds = [0, ...lap.sectorBoundsMs, r.lapMs!];
  r.sectorMs!.forEach((sector, i) => {
    assert.equal(sector, bounds[i + 1] - bounds[i], `AC-US-0002-10: sector ${i + 1} must span from bound ${bounds[i]} to bound ${bounds[i + 1]}`);
  });
  o.limitSteps.forEach((k, i) => {
    assert.ok(Math.abs(lap.sectorBoundsMs[i] - toMs(k)) <= 9, `AC-US-0002-10: sector ${i + 1} end ${lap.sectorBoundsMs[i]} is not at the crossing step ${k} (${toMs(k)})`);
  });
  assert.equal(r.sectorMs![0], lap.sectorBoundsMs[0], 'AC-US-0002-10: the first sector must be measured from the green signal (0 ms)');
});

test('CHK-TEST-0005-05 crossing the finish again after the lap ended produces no second result', () => {
  // AC-US-0002-12
  const { lap: ended } = completeLap(reading);
  const before = result(ended);
  const finish = singleCrossing(reading.finishLine);
  const seeded = seedLap(ended, { kart: kartAt(finish.index - 2) });
  let lap = seeded;
  let crossings = 0;
  for (let i = 0; i < 300; i++) {
    const next = stepLap(lap, DRIVE_OUT);
    assert.equal(next, lap, 'AC-US-0002-12: stepLap after the end must return the same session');
    const c = crossLine(reading.finishLine, lap.kart, next.kart);
    if (c) crossings++;
    lap = next;
  }
  assert.equal(crossings, 0, 'AC-US-0002-12: the kart must not move after the end');
  assert.deepEqual(result(lap), before, 'AC-US-0002-12: the result must not change after the end');
  assert.equal(lap.stepCount, ended.stepCount, 'AC-US-0002-12: stepCount must not advance after the end');
});

test('CHK-TEST-0005-06 a complete lap on the published synthetic track is valid with four sector times', () => {
  // AC-US-0002-13
  const published = readTrackData(SYNTHETIC_TRACK_FILE);
  assert.equal(published.trackDataStatus, 'COMPLETE', 'AC-US-0002-13: the published synthetic file must read COMPLETE');
  const { lap } = completeLap(published);
  const r = result(lap);
  assert.equal(r.lapValidity, 'VALID', 'AC-US-0002-13: the published synthetic lap must be VALID');
  assert.equal(r.sectorMs?.length, 4, 'AC-US-0002-13: the published synthetic lap must carry four sector times');
  assert.equal(r.official, true, 'AC-US-0002-13: an OFFICIAL valid lap on COMPLETE data must be official');
});

test('CHK-TEST-0005-07 crossing the finish without having passed every marker ends the lap as invalid', () => {
  // AC-US-0004-01
  const short = readTrackData(withShortMarker(2));
  assert.equal(short.trackDataStatus, 'COMPLETE', 'AC-US-0004-01: the short-marker fixture must still be COMPLETE');
  const { lap } = completeLap(short, 'OFFICIAL', autopilot(4));
  assert.equal(lap.phase, 'ENDED', 'AC-US-0004-01: the lap must end at the finish');
  assert.equal(view(lap).lapValidity, 'INVALID', 'AC-US-0004-01: a lap that missed marker 2 must be INVALID');
  assert.equal(view(lap).invalidReason, 'MISSED_MARKER', 'AC-US-0004-01: the reason must be MISSED_MARKER');
  assert.equal(view(lap).markersPassedCount, 1, 'AC-US-0004-01: only marker 1 must have counted');
});

test('CHK-TEST-0005-08 markers passed out of the declared order do not count and the finish is invalid', () => {
  // AC-US-0004-02
  const started = runCountdown(startSession(reading));
  const m1 = singleCrossing(reading.markers[0]);
  const seeded = seedLap(started, { kart: kartAt(m1.index + 3), markersPassedCount: 0 });
  const { o, hook } = oracle();
  const { lap } = drive(seeded, autopilot(), 6000, hook);
  assert.ok(o.markerSteps[1] !== undefined && o.markerSteps[2] !== undefined && o.markerSteps[3] !== undefined, 'AC-US-0004-02: markers 2, 3 and 4 must have been crossed');
  assert.equal(view(lap).markersPassedCount, 0, 'AC-US-0004-02: markers crossed before marker 1 must not count');
  assert.equal(view(lap).invalidReason, 'MISSED_MARKER', 'AC-US-0004-02: the finish after out-of-order markers must be MISSED_MARKER');
});

test('CHK-TEST-0005-09 a lap invalid by marker has a result without lap time, without sector times and not official', () => {
  // AC-US-0004-03
  const short = readTrackData(withShortMarker(2));
  const { lap } = completeLap(short, 'OFFICIAL', autopilot(4));
  const r = result(lap);
  assert.equal(r.lapValidity, 'INVALID', 'AC-US-0004-03: the lap must be INVALID');
  assert.equal(r.lapMs, undefined, 'AC-US-0004-03: an invalid lap must not carry lapMs');
  assert.equal(r.sectorMs, undefined, 'AC-US-0004-03: an invalid lap must not carry sectorMs');
  assert.equal(r.official, false, 'AC-US-0004-03: an invalid lap must not be official');
});

test('CHK-TEST-0005-10 crossing the three sector limits but missing a marker is still a missed-marker lap', () => {
  // AC-US-0004-05
  const short = readTrackData(withShortMarker(2));
  const { lap } = completeLap(short, 'OFFICIAL', autopilot(4));
  assert.equal(lap.sectorBoundsMs.length, 3, 'AC-US-0004-05: the three sector limits must have been crossed');
  assert.equal(view(lap).invalidReason, 'MISSED_MARKER', 'AC-US-0004-05: the lap must be invalid by MISSED_MARKER despite the sector limits');
});

test('CHK-TEST-0005-11 on the published synthetic track, skipping marker 2 makes the finish a missed-marker lap', () => {
  // AC-US-0004-06
  const started = runCountdown(startSession(reading));
  const m2 = singleCrossing(reading.markers[1]);
  // The kart jumps past marker 2 having passed marker 1 only; from there it drives the rest of the lap.
  const seeded = seedLap(started, { kart: kartAt(m2.index + 3), markersPassedCount: 1 });
  const { lap } = drive(seeded, autopilot(), 6000);
  assert.equal(lap.phase, 'ENDED', 'AC-US-0004-06: the lap must end at the finish');
  assert.equal(view(lap).lapValidity, 'INVALID', 'AC-US-0004-06: skipping marker 2 of the synthetic track must invalidate the lap');
  assert.equal(view(lap).invalidReason, 'MISSED_MARKER', 'AC-US-0004-06: the reason must be MISSED_MARKER');
});

test('CHK-TEST-0005-12 a lap invalid by marker ends at the finish step: no time is added afterwards and no second result appears', () => {
  // AC-US-0004-07
  const short = readTrackData(withShortMarker(2));
  const { lap: ended } = completeLap(short, 'OFFICIAL', autopilot(4));
  const elapsed = view(ended).elapsedMs;
  const r = result(ended);
  let lap = ended;
  for (let i = 0; i < 500; i++) lap = stepLap(lap, DRIVE_OUT);
  assert.equal(view(lap).elapsedMs, elapsed, 'AC-US-0004-07: elapsedMs must not change after the invalid finish');
  assert.equal(lap.stepCount, ended.stepCount, 'AC-US-0004-07: no step must be added after the invalid finish');
  assert.deepEqual(result(lap), r, 'AC-US-0004-07: the single result must not change after the invalid finish');
});

test('CHK-TEST-0005-13 crossing the finish against the track sense does not end the lap', () => {
  // AC-US-0005-01
  const started = runCountdown(startSession(reading));
  const finish = singleCrossing(reading.finishLine);
  const seeded = seedLap(started, { kart: kartAt(finish.index + 2, 0, 0, true), markersPassedCount: 4 });
  let reverse = 0;
  const { lap } = drive(seeded, constant(DRIVE_OUT), 300, (b, a) => { if (crossLine(reading.finishLine, b.kart, a.kart)?.sense === 'REVERSE') reverse++; });
  assert.equal(reverse, 1, 'AC-US-0005-01: the kart must have crossed the finish in reverse once');
  assert.equal(view(lap).lapPhase, 'RUNNING', 'AC-US-0005-01: the lap must still be RUNNING after a reverse finish crossing');
  assert.equal(view(lap).lapValidity, 'VALID', 'AC-US-0005-01: the lap must still be VALID after a reverse finish crossing');
});

test('CHK-TEST-0005-14 crossing the finish against the track sense records no result', () => {
  // AC-US-0005-02
  const started = runCountdown(startSession(reading));
  const finish = singleCrossing(reading.finishLine);
  const seeded = seedLap(started, { kart: kartAt(finish.index + 2, 0, 0, true), markersPassedCount: 4 });
  const { lap } = drive(seeded, constant(DRIVE_OUT), 300);
  assert.deepEqual(getLapResult(lap), { code: 'NO_RESULT' }, 'AC-US-0005-02: no result may exist after a reverse finish crossing');
});

test('CHK-TEST-0005-15 only the crossing in the track sense ends the lap, even after several reverse crossings', () => {
  // AC-US-0005-03
  const started = runCountdown(startSession(reading));
  const finish = singleCrossing(reading.finishLine);
  let lap = seedLap(started, { markersPassedCount: 4 });
  for (let round = 0; round < 3; round++) {
    lap = seedLap(lap, { kart: kartAt(finish.index + 2, 0, 0, true) });
    lap = drive(lap, constant(DRIVE_OUT), 300).lap;
    assert.equal(lap.phase, 'RUNNING', `AC-US-0005-03: reverse crossing ${round + 1} must not end the lap`);
  }
  let endedAt = -1;
  lap = seedLap(lap, { kart: kartAt(finish.index - 2) });
  const { lap: done } = drive(lap, constant(DRIVE_OUT), 300, (b, a) => { if (crossLine(reading.finishLine, b.kart, a.kart)?.sense === 'FORWARD') endedAt = a.stepCount; });
  assert.equal(done.phase, 'ENDED', 'AC-US-0005-03: the forward crossing must end the lap');
  assert.equal(done.stepCount, endedAt, 'AC-US-0005-03: the lap must end in the exact step of the forward crossing');
});

test('CHK-TEST-0005-16 crossing a marker against the track sense does not count as passing it', () => {
  // AC-US-0005-04
  const started = runCountdown(startSession(reading));
  const m1 = singleCrossing(reading.markers[0]);
  const seeded = seedLap(started, { kart: kartAt(m1.index + 2, 0, 0, true) });
  let reverse = 0;
  const { lap } = drive(seeded, constant(DRIVE_OUT), 300, (b, a) => { if (crossLine(reading.markers[0], b.kart, a.kart)?.sense === 'REVERSE') reverse++; });
  assert.equal(reverse, 1, 'AC-US-0005-04: the kart must have crossed marker 1 in reverse once');
  assert.equal(view(lap).markersPassedCount, 0, 'AC-US-0005-04: a reverse marker crossing must not count');
});

test('CHK-TEST-0005-17 marker passages recorded before a pause still count after the lap resumes', () => {
  // AC-US-0004-02 (abnormal case: pause during the lap keeps the passages)
  const controller = autopilot();
  let lap = drive(runCountdown(startSession(reading)), controller, 1000).lap;
  assert.ok(view(lap).markersPassedCount >= 1, 'AC-US-0004-02: at least one marker must have been passed before the pause');
  const passed = view(lap).markersPassedCount;
  const p = pauseLap(lap, 'ESC_KEY');
  assert.ok(p.ok, 'AC-US-0004-02: pause must be accepted');
  const r = resumeLap(p.lap);
  assert.ok(r.ok, 'AC-US-0004-02: resume must be accepted');
  assert.equal(view(r.lap).markersPassedCount, passed, 'AC-US-0004-02: the marker count must survive the pause');
  lap = drive(r.lap, controller, 6000).lap;
  assert.equal(view(lap).lapValidity, 'VALID', 'AC-US-0004-02: the lap must still be VALID at the finish after the pause');
  assert.equal(view(lap).markersPassedCount, 4, 'AC-US-0004-02: all markers must have counted across the pause');
  assert.equal(stepLap(lap, IDLE), lap, 'AC-US-0004-02: the ended lap must not advance');
});
