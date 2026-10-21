// TEST-0007 — lap kinds, repositioning and incomplete track data (strategy: lap-kinds, integration, DES-0005).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ARCADE_KART } from '../src/physics';
import { getLapResult, getLapState, offeredLapKinds, repositionKart, startLap, stepLap, type LapResult, type LapSession, type LapStateView } from '../src/lap';
import { toMs } from '../src/lapTiming';
import { describeLap } from '../src/lapMessages';
import { readTrackData } from '../src/trackData';
import { syntheticReading, trackV1Text, withoutMarkers } from './fixtures/trackFiles';
import { autopilot, completeLap, constant, DRIVE_OUT, drive, runCountdown, startSession } from './helpers/autopilot';

const reading = syntheticReading();
if (reading.trackDataStatus !== 'COMPLETE') throw new Error('fixture: synthetic reading must be COMPLETE');
const view = (lap: LapSession): LapStateView => getLapState(lap) as LapStateView;
const result = (lap: LapSession): Partial<LapResult> & { code?: string } => getLapResult(lap) as Partial<LapResult> & { code?: string };

test('CHK-TEST-0007-01 repositioning the kart in an official running lap invalidates it with REPOSITION', () => {
  // AC-US-0007-01
  const running = drive(runCountdown(startSession(reading, 'OFFICIAL')), autopilot(), 400).lap;
  const r = repositionKart(running);
  assert.ok(r.ok, 'AC-US-0007-01: repositionKart must be accepted while RUNNING');
  assert.equal(view(r.lap).lapValidity, 'INVALID', 'AC-US-0007-01: an official lap must be INVALID after repositioning');
  assert.equal(view(r.lap).invalidReason, 'REPOSITION', 'AC-US-0007-01: the reason must be REPOSITION');
  assert.equal(result(r.lap).official, false, 'AC-US-0007-01: the result must not be official');
});

test('CHK-TEST-0007-02 an official lap invalidated by repositioning ends at that step: no lap time is added afterwards', () => {
  // AC-US-0007-03
  const running = drive(runCountdown(startSession(reading, 'OFFICIAL')), autopilot(), 400).lap;
  const r = repositionKart(running);
  assert.ok(r.ok, 'AC-US-0007-03: repositionKart must be accepted');
  const ended = r.lap;
  assert.equal(ended.phase, 'ENDED', 'AC-US-0007-03: the lap must be ENDED at the repositioning step');
  assert.equal(ended.stepCount, 400, 'AC-US-0007-03: stepCount must be the step of the repositioning');
  assert.equal(view(ended).elapsedMs, toMs(400), 'AC-US-0007-03: elapsedMs must be the time of the repositioning');
  let lap = ended;
  for (let i = 0; i < 300; i++) lap = stepLap(lap, DRIVE_OUT);
  assert.equal(lap, ended, 'AC-US-0007-03: steps after the repositioning must be ignored');
  assert.equal(view(lap).elapsedMs, toMs(400), 'AC-US-0007-03: elapsedMs must not change after the repositioning');
});

test('CHK-TEST-0007-03 repositioning in a recon or training lap, repeatedly, keeps the lap valid in progress', () => {
  // AC-US-0007-04
  for (const kind of ['RECON', 'TRAINING'] as const) {
    let lap = drive(runCountdown(startSession(reading, kind)), autopilot(), 300).lap;
    for (let i = 0; i < 3; i++) {
      const r = repositionKart(lap);
      assert.ok(r.ok, `AC-US-0007-04: repositionKart ${i + 1} must be accepted in ${kind}`);
      lap = r.lap;
      assert.equal(lap.phase, 'RUNNING', `AC-US-0007-04: ${kind} lap must stay RUNNING after repositioning ${i + 1}`);
      assert.equal(view(lap).lapValidity, 'VALID', `AC-US-0007-04: ${kind} lap must stay VALID after repositioning ${i + 1}`);
      assert.equal(describeLap(view(lap), 'pt').stateText, 'válida em andamento', `AC-US-0007-04: ${kind} screen state must read "válida em andamento"`);
      lap = drive(lap, autopilot(), 100).lap;
    }
  }
});

test('CHK-TEST-0007-04 repositioning in a recon or training lap sets no invalidation reason', () => {
  // AC-US-0007-05
  for (const kind of ['RECON', 'TRAINING'] as const) {
    const running = drive(runCountdown(startSession(reading, kind)), autopilot(), 300).lap;
    const r = repositionKart(running);
    assert.ok(r.ok, `AC-US-0007-05: repositionKart must be accepted in ${kind}`);
    assert.equal(view(r.lap).invalidReason, undefined, `AC-US-0007-05: no invalidReason after repositioning in ${kind}`);
    assert.equal(describeLap(view(r.lap), 'pt').reasonText, undefined, `AC-US-0007-05: no reason text after repositioning in ${kind}`);
  }
});

test('CHK-TEST-0007-05 in a recon or training lap the time after N steps is N x STEP with repositionings in between', () => {
  // AC-US-0007-06
  for (const kind of ['RECON', 'TRAINING'] as const) {
    let lap = runCountdown(startSession(reading, kind));
    const controller = autopilot();
    for (let i = 0; i < 4; i++) {
      lap = drive(lap, controller, 150).lap;
      const r = repositionKart(lap);
      assert.ok(r.ok, `AC-US-0007-06: repositionKart must be accepted in ${kind}`);
      lap = r.lap;
    }
    assert.equal(view(lap).elapsedMs, toMs(600), `AC-US-0007-06: ${kind} elapsedMs after 600 steps with repositionings must be ${toMs(600)}`);
    assert.equal(lap.stepCount, 600, `AC-US-0007-06: ${kind} stepCount must be 600`);
  }
});

test('CHK-TEST-0007-06 the result of a completed recon or training lap is identified as not official', () => {
  // AC-US-0008-01
  for (const kind of ['RECON', 'TRAINING'] as const) {
    const { lap } = completeLap(reading, kind);
    const r = result(lap);
    assert.equal(r.lapValidity, 'VALID', `AC-US-0008-01: the ${kind} lap must complete as VALID`);
    assert.equal(r.official, false, `AC-US-0008-01: a ${kind} lap must be identified as not official`);
  }
});

test('CHK-TEST-0007-07 official is false for recon and training results and true only for an official valid lap on complete data', () => {
  // AC-US-0008-02
  for (const kind of ['RECON', 'TRAINING'] as const) {
    assert.equal(result(completeLap(reading, kind).lap).official, false, `AC-US-0008-02: ${kind} result must not be official`);
  }
  const official = result(completeLap(reading, 'OFFICIAL').lap);
  assert.equal(official.lapValidity, 'VALID', 'AC-US-0008-02: the OFFICIAL lap must be valid');
  assert.equal(official.official, true, 'AC-US-0008-02: an OFFICIAL valid lap on COMPLETE data must be official');
  const cut = result(drive(runCountdown(startSession(reading, 'OFFICIAL')), constant(DRIVE_OUT), 3000).lap);
  assert.equal(cut.official, false, 'AC-US-0008-02: an OFFICIAL invalid lap must not be official');
});

test('CHK-TEST-0007-08 incomplete track data offers no official lap and an official start is rejected', () => {
  // AC-US-0008-03
  for (const [label, incomplete] of [['schema 1', readTrackData(trackV1Text())], ['no markers', readTrackData(withoutMarkers())]] as const) {
    assert.equal(incomplete.trackDataStatus, 'INCOMPLETE', `AC-US-0008-03: the ${label} fixture must be INCOMPLETE`);
    const kinds = offeredLapKinds(incomplete, ['OFFICIAL', 'RECON']);
    assert.ok(!kinds.includes('OFFICIAL'), `AC-US-0008-03: ${label} must not offer OFFICIAL (offered ${kinds})`);
    if (incomplete.trackDataStatus !== 'INCOMPLETE') continue;
    const r = startLap(undefined, { lapKind: 'OFFICIAL', trackId: incomplete.trackId, trackVersion: incomplete.trackVersion }, incomplete, ARCADE_KART);
    assert.deepEqual(r, { ok: false, code: 'OFFICIAL_NOT_AVAILABLE' }, `AC-US-0008-03: an OFFICIAL start on ${label} must be rejected with OFFICIAL_NOT_AVAILABLE`);
  }
  assert.ok(offeredLapKinds(reading, ['OFFICIAL']).includes('OFFICIAL'), 'AC-US-0008-03: COMPLETE data must still offer OFFICIAL when the challenge defines it');
});

test('CHK-TEST-0007-09 incomplete track data offers a training lap that can be driven: the kart moves and the timer advances', () => {
  // AC-US-0008-04
  const incomplete = readTrackData(trackV1Text());
  assert.ok(offeredLapKinds(incomplete).includes('TRAINING'), 'AC-US-0008-04: INCOMPLETE data must offer TRAINING');
  const started = runCountdown(startSession(incomplete, 'TRAINING'));
  const { lap } = drive(started, autopilot(), 1200);
  assert.equal(lap.phase, 'RUNNING', 'AC-US-0008-04: the training lap must be running');
  const moved = Math.hypot(lap.kart.x - started.kart.x, lap.kart.z - started.kart.z);
  assert.ok(moved > 10, `AC-US-0008-04: the kart must have moved (${moved.toFixed(1)} m)`);
  assert.equal(view(lap).elapsedMs, toMs(1200), 'AC-US-0008-04: the timer must advance on an incomplete track');
});

test('CHK-TEST-0007-10 on incomplete track data every result is identified as not official', () => {
  // AC-US-0008-05
  const incomplete = readTrackData(trackV1Text());
  const { lap } = drive(runCountdown(startSession(incomplete, 'TRAINING')), constant(DRIVE_OUT), 3000);
  const r = result(lap);
  assert.equal(r.invalidReason, 'CUT', 'AC-US-0008-05: the fixture must produce a result (a cut)');
  assert.equal(r.official, false, 'AC-US-0008-05: a result on INCOMPLETE data must not be official');
  assert.equal(r.trackVersion, 1, 'AC-US-0008-05: the result must name the version it was driven on');
});

test('CHK-TEST-0007-11 a second repositioning in an official lap is rejected with LAP_ENDED and the reason stays REPOSITION', () => {
  // AC-US-0007-03 (abnormal case: repeated repositionings in an official lap)
  const running = drive(runCountdown(startSession(reading, 'OFFICIAL')), autopilot(), 400).lap;
  const first = repositionKart(running);
  assert.ok(first.ok, 'AC-US-0007-03: the first repositioning must be accepted');
  const second = repositionKart(first.lap);
  assert.deepEqual(second, { ok: false, code: 'LAP_ENDED' }, 'AC-US-0007-03: the second repositioning must be rejected with LAP_ENDED');
  assert.equal(view(first.lap).invalidReason, 'REPOSITION', 'AC-US-0007-03: the reason must remain REPOSITION');
});
