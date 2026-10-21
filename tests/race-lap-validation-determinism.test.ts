// TEST-0008 — the same input sequence gives the same lap (strategy: lap-determinism, integration, DES-0001, DES-0002).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getLapResult, pauseLap, resumeLap, stepLap, type LapResult } from '../src/lap';
import { advanceClock } from '../src/frameClock';
import { syntheticReading } from './fixtures/trackFiles';
import { autopilot, completeLap, DRIVE_OUT, drive, replay, runCountdown, startSession } from './helpers/autopilot';

const reading = syntheticReading();
if (reading.trackDataStatus !== 'COMPLETE') throw new Error('fixture: synthetic reading must be COMPLETE');
const result = (lap: Parameters<typeof getLapResult>[0]) => getLapResult(lap) as LapResult;

// Reference run: the autopilot lap and its recorded per-step inputs (the script of E2E-11).
const reference = completeLap(reading, 'OFFICIAL', autopilot());
if (reference.lap.validity !== 'VALID') throw new Error('fixture: the reference lap must be VALID');

test('CHK-TEST-0008-01 two runs of the same input sequence on the same track give the same total time', () => {
  // AC-US-0003-01
  const second = completeLap(reading, 'OFFICIAL', replay(reference.inputs));
  assert.equal(result(second.lap).lapMs, result(reference.lap).lapMs, 'AC-US-0003-01: lapMs must be identical across two runs');
  const third = completeLap(reading, 'OFFICIAL', autopilot());
  assert.equal(result(third.lap).lapMs, result(reference.lap).lapMs, 'AC-US-0003-01: a fresh autopilot run must give the same lapMs');
});

test('CHK-TEST-0008-02 two runs of the same input sequence on the same track give the same four sector times', () => {
  // AC-US-0003-02
  const second = completeLap(reading, 'OFFICIAL', replay(reference.inputs));
  assert.deepEqual(result(second.lap).sectorMs, result(reference.lap).sectorMs, 'AC-US-0003-02: sectorMs must be identical across two runs');
});

// The same per-step inputs delivered in frames of 2 steps (60 fps) and 4 steps (30 fps), sized by the frame clock.
function framed(frameDtS: number): LapResult {
  let lap = runCountdown(startSession(reading));
  let acc = 0, i = 0;
  while (lap.phase !== 'ENDED' && i < reference.inputs.length) {
    const r = advanceClock(acc, frameDtS);
    acc = r.accumulatorS;
    for (let s = 0; s < r.steps && lap.phase !== 'ENDED'; s++) lap = stepLap(lap, reference.inputs[i++]);
  }
  return result(lap);
}

test('CHK-TEST-0008-03 the same input sequence rendered at 30 fps and at 60 fps gives the same total time', () => {
  // AC-US-0003-03
  const at60 = framed(1 / 60), at30 = framed(1 / 30);
  assert.equal(at60.lapMs, result(reference.lap).lapMs, 'AC-US-0003-03: lapMs at 60 fps must equal the per-step run');
  assert.equal(at30.lapMs, result(reference.lap).lapMs, 'AC-US-0003-03: lapMs at 30 fps must equal the per-step run');
});

test('CHK-TEST-0008-04 the same input sequence rendered at 30 fps and at 60 fps gives the same four sector times', () => {
  // AC-US-0003-04
  const at60 = framed(1 / 60), at30 = framed(1 / 30);
  assert.deepEqual(at60.sectorMs, result(reference.lap).sectorMs, 'AC-US-0003-04: sectorMs at 60 fps must equal the per-step run');
  assert.deepEqual(at30.sectorMs, result(reference.lap).sectorMs, 'AC-US-0003-04: sectorMs at 30 fps must equal the per-step run');
});

test('CHK-TEST-0008-05 the same input sequence with a pause of any length in the middle gives the same total and sector times', () => {
  // AC-US-0003-10
  for (const pausedSteps of [1, 777, 5000]) {
    const controller = replay(reference.inputs);
    let lap = drive(runCountdown(startSession(reading)), controller, 1000).lap;
    const p = pauseLap(lap, 'FOCUS_LOST');
    assert.ok(p.ok, 'AC-US-0003-10: pause must be accepted');
    lap = p.lap;
    for (let i = 0; i < pausedSteps; i++) lap = stepLap(lap, DRIVE_OUT);
    const r = resumeLap(lap);
    assert.ok(r.ok, 'AC-US-0003-10: resume must be accepted');
    lap = drive(r.lap, controller, 6000).lap;
    assert.equal(result(lap).lapMs, result(reference.lap).lapMs, `AC-US-0003-10: lapMs with a pause of ${pausedSteps} steps must equal the run without pause`);
    assert.deepEqual(result(lap).sectorMs, result(reference.lap).sectorMs, `AC-US-0003-10: sectorMs with a pause of ${pausedSteps} steps must equal the run without pause`);
  }
});

test('CHK-TEST-0008-06 the whole session, kart state included, is identical after two runs of the same sequence', () => {
  // NFR-0001
  const second = completeLap(reading, 'OFFICIAL', replay(reference.inputs));
  assert.deepEqual(second.lap, reference.lap, 'NFR-0001: the final LapSession must be identical across two runs');
});
