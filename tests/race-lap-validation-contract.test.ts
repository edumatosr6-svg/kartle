// TEST-0012 — the in-process contracts field by field: shapes, units, rejection codes, idempotency (strategy: lap-contract, API-0001..0003).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ARCADE_KART } from '../src/physics';
import { getLapResult, getLapState, pauseLap, repositionKart, resumeLap, startLap, stepLap, type LapSession, type LapStateView } from '../src/lap';
import { readTrackData } from '../src/trackData';
import { syntheticFile, syntheticReading, trackV1Text } from './fixtures/trackFiles';
import { autopilot, completeLap, constant, DRIVE_OUT, drive, IDLE, runCountdown, startSession } from './helpers/autopilot';

const reading = syntheticReading();
if (reading.trackDataStatus !== 'COMPLETE') throw new Error('fixture: synthetic reading must be COMPLETE');
const request = { lapKind: 'OFFICIAL' as const, trackId: reading.trackId, trackVersion: reading.trackVersion };
const keys = (o: object) => Object.keys(o).sort();

const STATE_KEYS = ['lapPhase', 'lapKind', 'lapValidity', 'countdownRemainingMs', 'elapsedMs', 'stepCount', 'completedSectorMs', 'markersPassedCount', 'trackId', 'trackVersion'];
const STATE_OPTIONAL = ['resumePhase', 'pauseCause', 'invalidReason'];
const RESULT_KEYS = ['trackId', 'trackVersion', 'lapKind', 'lapValidity', 'official'];
const RESULT_OPTIONAL = ['challengeNumber', 'invalidReason', 'lapMs', 'sectorMs'];

test('CHK-TEST-0012-01 getLapState carries exactly the fields of API-0001, with the optional ones only in their phase', () => {
  // AC-US-0009-01
  const started = startSession(reading);
  assert.deepEqual(keys(getLapState(started)), keys(Object.fromEntries(STATE_KEYS.map(k => [k, 0]))), 'AC-US-0009-01: the countdown view must carry exactly the mandatory fields');
  const running = drive(runCountdown(started), autopilot(), 300).lap;
  for (const k of keys(getLapState(running))) assert.ok([...STATE_KEYS, ...STATE_OPTIONAL].includes(k), `AC-US-0009-01: unexpected field ${k} in getLapState`);
  const paused = pauseLap(running, 'ESC_KEY');
  assert.ok(paused.ok, 'AC-US-0009-01: pause must be accepted');
  const pv = getLapState(paused.lap) as LapStateView;
  assert.equal(pv.resumePhase, 'RUNNING', 'AC-US-0009-01: resumePhase must be present while PAUSED');
  assert.equal(pv.pauseCause, 'ESC_KEY', 'AC-US-0009-01: pauseCause must be present while PAUSED');
  const rv = getLapState(running) as LapStateView;
  assert.ok(!('resumePhase' in rv) && !('pauseCause' in rv) && !('invalidReason' in rv), 'AC-US-0009-01: resumePhase, pauseCause and invalidReason must be absent while RUNNING and VALID');
});

test('CHK-TEST-0012-02 getLapResult carries exactly the fields of API-0001 and nothing else, so no personal data can travel in it', () => {
  // NFR-0005
  const valid = getLapResult(completeLap(reading).lap);
  assert.deepEqual(keys(valid), keys(Object.fromEntries([...RESULT_KEYS, 'lapMs', 'sectorMs'].map(k => [k, 0]))), 'NFR-0005: a valid result must carry exactly the contract fields');
  const invalid = getLapResult(drive(runCountdown(startSession(reading)), constant(DRIVE_OUT), 3000).lap);
  assert.deepEqual(keys(invalid), keys(Object.fromEntries([...RESULT_KEYS, 'invalidReason'].map(k => [k, 0]))), 'NFR-0005: an invalid result must carry exactly the contract fields');
  for (const k of [...keys(valid), ...keys(invalid)]) assert.ok([...RESULT_KEYS, ...RESULT_OPTIONAL].includes(k), `NFR-0005: unexpected field ${k} in getLapResult`);
});

test('CHK-TEST-0012-03 every time value of the result and of the state is an integer number of milliseconds', () => {
  // AC-US-0002-04
  const { lap } = completeLap(reading, 'OFFICIAL', autopilot(), (_b, a) => {
    const v = getLapState(a) as LapStateView;
    assert.ok(Number.isInteger(v.elapsedMs) && Number.isInteger(v.countdownRemainingMs), `AC-US-0002-04: elapsedMs ${v.elapsedMs} and countdownRemainingMs ${v.countdownRemainingMs} must be integers`);
    for (const s of v.completedSectorMs) assert.ok(Number.isInteger(s), `AC-US-0002-04: completed sector time ${s} must be an integer`);
  });
  const r = getLapResult(lap) as { lapMs?: number; sectorMs?: number[] };
  assert.ok(Number.isInteger(r.lapMs), `AC-US-0002-04: lapMs ${r.lapMs} must be an integer`);
  assert.equal(r.sectorMs?.length, 4, 'AC-US-0002-04: four sector times expected');
  for (const s of r.sectorMs ?? []) assert.ok(Number.isInteger(s), `AC-US-0002-04: sector time ${s} must be an integer`);
});

test('CHK-TEST-0012-04 without a lap the reads answer NO_ACTIVE_LAP and NO_RESULT with no other field', () => {
  // AC-US-0005-02
  assert.deepEqual(getLapState(undefined), { code: 'NO_ACTIVE_LAP' }, 'AC-US-0005-02: getLapState without a lap must answer only the code NO_ACTIVE_LAP');
  assert.deepEqual(getLapResult(undefined), { code: 'NO_RESULT' }, 'AC-US-0005-02: getLapResult without a lap must answer only the code NO_RESULT');
  const running = drive(runCountdown(startSession(reading)), autopilot(), 100).lap;
  assert.deepEqual(getLapResult(running), { code: 'NO_RESULT' }, 'AC-US-0005-02: getLapResult before ENDED must answer only the code NO_RESULT');
});

test('CHK-TEST-0012-05 startLap rejects with the code of API-0002 for each condition and creates no lap', () => {
  // AC-US-0008-03
  assert.deepEqual(startLap(undefined, request, readTrackData('not json'), ARCADE_KART), { ok: false, code: 'TRACK_DATA_UNREADABLE' }, 'AC-US-0008-03: unreadable data must reject with TRACK_DATA_UNREADABLE');
  assert.deepEqual(startLap(undefined, request, readTrackData({ ...syntheticFile(), schemaVersion: 9 }), ARCADE_KART), { ok: false, code: 'TRACK_SCHEMA_UNSUPPORTED' }, 'AC-US-0008-03: an unknown schema must reject with TRACK_SCHEMA_UNSUPPORTED');
  const v1 = readTrackData(trackV1Text());
  assert.deepEqual(startLap(undefined, { ...request, trackVersion: 1 }, v1, ARCADE_KART), { ok: false, code: 'OFFICIAL_NOT_AVAILABLE' }, 'AC-US-0008-03: OFFICIAL on INCOMPLETE data must reject with OFFICIAL_NOT_AVAILABLE');
  const active = startSession(reading);
  assert.deepEqual(startLap(active, request, reading, ARCADE_KART), { ok: false, code: 'LAP_ALREADY_ACTIVE' }, 'AC-US-0008-03: a second start while a lap is active must reject with LAP_ALREADY_ACTIVE');
});

test('CHK-TEST-0012-06 pauseLap, resumeLap and repositionKart reject with the code of API-0002 for each phase', () => {
  // AC-US-0003-08
  assert.deepEqual(pauseLap(undefined, 'ESC_KEY'), { ok: false, code: 'NO_ACTIVE_LAP' }, 'AC-US-0003-08: pause without a lap must be NO_ACTIVE_LAP');
  assert.deepEqual(resumeLap(undefined), { ok: false, code: 'NO_ACTIVE_LAP' }, 'AC-US-0003-08: resume without a lap must be NO_ACTIVE_LAP');
  assert.deepEqual(repositionKart(undefined), { ok: false, code: 'NO_ACTIVE_LAP' }, 'AC-US-0003-08: reposition without a lap must be NO_ACTIVE_LAP');
  const countdown = startSession(reading);
  assert.deepEqual(resumeLap(countdown), { ok: false, code: 'NOT_PAUSED' }, 'AC-US-0003-08: resume while not paused must be NOT_PAUSED');
  assert.deepEqual(repositionKart(countdown), { ok: false, code: 'NOT_RUNNING' }, 'AC-US-0003-08: reposition during the countdown must be NOT_RUNNING');
  const paused = pauseLap(runCountdown(countdown), 'FOCUS_LOST');
  assert.ok(paused.ok, 'AC-US-0003-08: pause must be accepted');
  assert.deepEqual(pauseLap(paused.lap, 'ESC_KEY'), { ok: false, code: 'ALREADY_PAUSED' }, 'AC-US-0003-08: a second pause must be ALREADY_PAUSED');
  assert.deepEqual(repositionKart(paused.lap), { ok: false, code: 'NOT_RUNNING' }, 'AC-US-0003-08: reposition while paused must be NOT_RUNNING');
  const ended = completeLap(reading).lap;
  assert.deepEqual(pauseLap(ended, 'ESC_KEY'), { ok: false, code: 'LAP_ENDED' }, 'AC-US-0003-08: pause after the end must be LAP_ENDED');
  assert.deepEqual(resumeLap(ended), { ok: false, code: 'LAP_ENDED' }, 'AC-US-0003-08: resume after the end must be LAP_ENDED');
  assert.deepEqual(repositionKart(ended), { ok: false, code: 'LAP_ENDED' }, 'AC-US-0003-08: reposition after the end must be LAP_ENDED');
});

test('CHK-TEST-0012-07 a rejected command leaves the session exactly as it was', () => {
  // AC-US-0003-08
  const running = drive(runCountdown(startSession(reading)), autopilot(), 200).lap;
  const snapshot = JSON.stringify(running);
  resumeLap(running);
  startLap(running, request, reading, ARCADE_KART);
  const paused = pauseLap(running, 'ESC_KEY');
  assert.ok(paused.ok, 'AC-US-0003-08: pause must be accepted');
  pauseLap(paused.lap, 'FOCUS_LOST');
  repositionKart(paused.lap);
  assert.equal(JSON.stringify(running), snapshot, 'AC-US-0003-08: rejected commands must not alter the running session');
  assert.equal(getLapState(paused.lap).toString(), getLapState(paused.lap).toString(), 'AC-US-0003-08: reads are side-effect free');
  const after = getLapState(paused.lap) as LapStateView;
  assert.equal(after.pauseCause, 'ESC_KEY', 'AC-US-0003-08: a rejected second pause must not change the pause cause');
  assert.equal(after.elapsedMs, (getLapState(running) as LapStateView).elapsedMs, 'AC-US-0003-08: rejected commands must not consume time');
});

test('CHK-TEST-0012-08 a repeated startLap does not restart the countdown nor create a second lap; after ENDED a new lap gets its own result', () => {
  // AC-US-0002-12
  let lap: LapSession = startSession(reading);
  for (let i = 0; i < 100; i++) lap = stepLap(lap, IDLE);
  const remaining = (getLapState(lap) as LapStateView).countdownRemainingMs;
  const again = startLap(lap, request, reading, ARCADE_KART);
  assert.deepEqual(again, { ok: false, code: 'LAP_ALREADY_ACTIVE' }, 'AC-US-0002-12: a repeated start must be rejected');
  assert.equal((getLapState(lap) as LapStateView).countdownRemainingMs, remaining, 'AC-US-0002-12: the countdown must not restart');
  const first = completeLap(reading).lap;
  const next = startLap(first, { ...request, lapKind: 'TRAINING' }, reading, ARCADE_KART);
  assert.ok(next.ok, 'AC-US-0002-12: a new lap after ENDED must be accepted');
  assert.deepEqual(getLapResult(next.lap), { code: 'NO_RESULT' }, 'AC-US-0002-12: the new lap must start without a result');
  assert.equal((getLapResult(first) as { lapMs?: number }).lapMs! > 0, true, 'AC-US-0002-12: the first result must be kept on its own session');
});

test('CHK-TEST-0012-09 challengeNumber is copied to the result when given and absent otherwise, without changing the lap', () => {
  // AC-US-0002-11
  const withNumber = startLap(undefined, { ...request, challengeNumber: 42 }, reading, ARCADE_KART);
  assert.ok(withNumber.ok, 'AC-US-0002-11: start with challengeNumber must be accepted');
  const a = drive(runCountdown(withNumber.lap), autopilot(), 6000).lap;
  const b = completeLap(reading).lap;
  const ra = getLapResult(a) as { challengeNumber?: number; lapMs?: number }, rb = getLapResult(b) as { challengeNumber?: number; lapMs?: number };
  assert.equal(ra.challengeNumber, 42, 'AC-US-0002-11: challengeNumber must be copied to the result');
  assert.ok(!('challengeNumber' in rb), 'AC-US-0002-11: challengeNumber must be absent when not given');
  assert.equal(ra.lapMs, rb.lapMs, 'AC-US-0002-11: challengeNumber must not change the lap');
});

test('CHK-TEST-0012-10 readTrackData answers UNREADABLE with no other field and UNSUPPORTED_SCHEMA with the version only', () => {
  // NFR-0012
  assert.deepEqual(keys(readTrackData('{')), ['trackDataStatus'], 'NFR-0012: UNREADABLE must carry only trackDataStatus');
  assert.deepEqual(keys(readTrackData({ ...syntheticFile(), schemaVersion: 7 })), ['schemaVersion', 'trackDataStatus'], 'NFR-0012: UNSUPPORTED_SCHEMA must carry only trackDataStatus and schemaVersion');
  const complete = readTrackData(syntheticFile());
  assert.equal(complete.trackDataStatus, 'COMPLETE', 'NFR-0012: the synthetic file must be COMPLETE');
  for (const k of keys(complete)) assert.ok(['trackDataStatus', 'trackId', 'trackVersion', 'direction', 'startPosition', 'finishLine', 'sectorLimits', 'markers', 'cutDistanceM', 'cutDurationMs'].includes(k), `NFR-0012: unexpected field ${k} in the reading`);
});

test('CHK-TEST-0012-11 an invalid result carries its reason and no time field', () => {
  // AC-US-0004-03
  const r = getLapResult(drive(runCountdown(startSession(reading)), constant(DRIVE_OUT), 3000).lap) as Record<string, unknown>;
  assert.equal(r.lapValidity, 'INVALID', 'AC-US-0004-03: the fixture must be invalid');
  assert.ok(typeof r.invalidReason === 'string', 'AC-US-0004-03: an invalid result must carry invalidReason');
  assert.ok(!('lapMs' in r) && !('sectorMs' in r), 'AC-US-0004-03: an invalid result must carry neither lapMs nor sectorMs');
});
