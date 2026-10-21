// TEST-0004 — the lap state machine over the real physics: countdown, start, timing, pause (strategy: lap-state, integration, DES-0001).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getLapResult, getLapState, pauseLap, resumeLap, stepLap, type LapSession, type LapStateView } from '../src/lap';
import { COUNTDOWN_STEPS, toMs } from '../src/lapTiming';
import { describeLap } from '../src/lapMessages';
import { syntheticReading } from './fixtures/trackFiles';
import { autopilot, completeLap, constant, DRIVE_OUT, drive, IDLE, kartAt, runCountdown, seedLap, startSession } from './helpers/autopilot';
import { singleCrossing } from './helpers/geometry';
import { Seeded } from './helpers/seeded';

const reading = syntheticReading();
if (reading.trackDataStatus !== 'COMPLETE') throw new Error('fixture: synthetic reading must be COMPLETE');
const view = (lap: LapSession): LapStateView => getLapState(lap) as LapStateView;

test('CHK-TEST-0004-01 the countdown runs 360 steps from 3000 ms to 0 and then the lap is RUNNING', () => {
  // AC-US-0001-01
  let lap = startSession(reading);
  assert.equal(view(lap).lapPhase, 'COUNTDOWN', 'AC-US-0001-01: a started lap must begin in COUNTDOWN');
  assert.equal(view(lap).countdownRemainingMs, 3000, 'AC-US-0001-01: the countdown must start at 3000 ms');
  let previous = 3000;
  for (let i = 1; i < COUNTDOWN_STEPS; i++) {
    lap = stepLap(lap, IDLE);
    const remaining = view(lap).countdownRemainingMs;
    assert.equal(view(lap).lapPhase, 'COUNTDOWN', `AC-US-0001-01: step ${i} of the countdown must still be COUNTDOWN`);
    assert.ok(remaining < previous && remaining > 0, `AC-US-0001-01: countdown must decrease at step ${i} (${previous} -> ${remaining})`);
    previous = remaining;
  }
  lap = stepLap(lap, IDLE);
  assert.equal(view(lap).lapPhase, 'RUNNING', 'AC-US-0001-01: after 360 steps the lap must be RUNNING');
  assert.equal(view(lap).countdownRemainingMs, 0, 'AC-US-0001-01: countdown must read 0 at the green signal');
});

test('CHK-TEST-0004-02 the lap timer reads 0 during the whole countdown', () => {
  // AC-US-0001-04
  let lap = startSession(reading);
  for (let i = 0; i < COUNTDOWN_STEPS; i++) {
    assert.equal(view(lap).elapsedMs, 0, `AC-US-0001-04: elapsedMs must be 0 at countdown step ${i}`);
    lap = stepLap(lap, DRIVE_OUT);
  }
  assert.equal(view(lap).elapsedMs, 0, 'AC-US-0001-04: elapsedMs must be 0 at the green signal');
});

test('CHK-TEST-0004-03 after N steps from the green signal the lap time is N x STEP, with the kart before or after the finish line', () => {
  // AC-US-0001-05
  const started = runCountdown(startSession(reading));
  const finish = singleCrossing(reading.finishLine);
  for (const [label, kart] of [['before', kartAt(finish.index - 3)], ['after', kartAt(finish.index + 3)]] as const) {
    const seeded = seedLap(started, { kart });
    for (const n of [1, 100, 777]) {
      const { lap } = drive(seeded, constant(IDLE), n);
      assert.equal(view(lap).elapsedMs, toMs(n), `AC-US-0001-05: elapsedMs after ${n} steps with the kart ${label} the line must be ${toMs(n)}`);
    }
  }
  const moving = drive(started, constant(DRIVE_OUT), 200).lap;
  assert.equal(view(moving).elapsedMs, toMs(200), 'AC-US-0001-05: elapsedMs after 200 driven steps must be toMs(200)');
});

test('CHK-TEST-0004-04 full throttle during the countdown leaves the kart at speed 0 on the start position at the green signal', () => {
  // AC-US-0001-06
  const start = startSession(reading);
  const green = runCountdown(start, DRIVE_OUT);
  assert.equal(green.phase, 'RUNNING', 'AC-US-0001-06: the lap must be RUNNING at the green signal');
  assert.equal(green.kart.speed, 0, 'AC-US-0001-06: speed must be 0 m/s at the green signal after a jump start');
  assert.equal(green.kart.x, start.kart.x, 'AC-US-0001-06: x must equal the start position after a jump start');
  assert.equal(green.kart.z, start.kart.z, 'AC-US-0001-06: z must equal the start position after a jump start');
  assert.equal(green.kart.heading, start.kart.heading, 'AC-US-0001-06: heading must equal the start heading after a jump start');
});

test('CHK-TEST-0004-05 a jump start gives no invalidation reason: the lap is valid in progress at the green signal', () => {
  // AC-US-0001-07
  const green = runCountdown(startSession(reading), DRIVE_OUT);
  const v = view(green);
  assert.equal(v.lapValidity, 'VALID', 'AC-US-0001-07: lap must be VALID at the green signal after a jump start');
  assert.equal(v.invalidReason, undefined, 'AC-US-0001-07: no invalidReason after a jump start');
  assert.equal(describeLap(v, 'pt').stateText, 'válida em andamento', 'AC-US-0001-07: the screen state must read "válida em andamento"');
});

test('CHK-TEST-0004-06 the lap time after N steps is the same with and without throttle during the countdown', () => {
  // AC-US-0001-08
  const clean = drive(runCountdown(startSession(reading), IDLE), constant(DRIVE_OUT), 300).lap;
  const jumped = drive(runCountdown(startSession(reading), DRIVE_OUT), constant(DRIVE_OUT), 300).lap;
  assert.equal(view(jumped).elapsedMs, toMs(300), 'AC-US-0001-08: elapsedMs after a jump start must be N x STEP without penalty');
  assert.equal(view(jumped).elapsedMs, view(clean).elapsedMs, 'AC-US-0001-08: elapsedMs must not differ because of a jump start');
});

test('CHK-TEST-0004-07 the result of a complete lap carries the total time', () => {
  // AC-US-0002-02
  const { lap } = completeLap(reading);
  const result = getLapResult(lap);
  assert.ok('lapMs' in result, 'AC-US-0002-02: a valid lap must have a result with lapMs');
  assert.ok((result as { lapMs?: number }).lapMs! > 0, 'AC-US-0002-02: lapMs must be positive');
});

test('CHK-TEST-0004-08 the result of a complete lap carries exactly four sector times', () => {
  // AC-US-0002-03
  const { lap } = completeLap(reading);
  const result = getLapResult(lap) as { sectorMs?: number[] };
  assert.equal(result.sectorMs?.length, 4, 'AC-US-0002-03: a valid lap must carry 4 sector times');
});

test('CHK-TEST-0004-09 the four sector times add up to the total time with 0 ms difference, for the autopilot and for seeded offsets', () => {
  // AC-US-0002-05
  const rng = new Seeded(7);
  const offsets = Array.from({ length: 240 }, () => Math.round((rng.next() * 4 - 2) * 10) / 10);
  for (const [label, controller] of [['autopilot', autopilot()], ['seeded offsets', autopilot(i => offsets[i])]] as const) {
    const { lap } = completeLap(reading, 'OFFICIAL', controller);
    const result = getLapResult(lap) as { lapValidity?: string; lapMs?: number; sectorMs?: number[] };
    assert.equal(result.lapValidity, 'VALID', `AC-US-0002-05: the ${label} lap must be VALID for the sum to be judged`);
    const sum = result.sectorMs!.reduce((a, b) => a + b, 0);
    assert.equal(sum, result.lapMs, `AC-US-0002-05: ${label} sectors ${result.sectorMs} sum to ${sum}, lapMs is ${result.lapMs}`);
  }
});

test('CHK-TEST-0004-10 completed sector times appear one at a time, in order, during the lap', () => {
  // AC-US-0002-09
  let seen = 0;
  const { lap } = completeLap(reading, 'OFFICIAL', autopilot(), (before, after) => {
    const b = view(before).completedSectorMs, a = view(after).completedSectorMs;
    assert.ok(a.length === b.length || a.length === b.length + 1, `AC-US-0002-09: completed sectors went from ${b.length} to ${a.length} in one step`);
    for (let i = 0; i < b.length; i++) assert.equal(a[i], b[i], `AC-US-0002-09: sector ${i + 1} time changed after completion`);
    seen = Math.max(seen, a.length);
  });
  assert.equal(lap.validity, 'VALID', 'AC-US-0002-09: the lap must be valid for the sectors to be judged');
  assert.equal(seen, 4, 'AC-US-0002-09: the fourth sector time must be visible at the end of the lap');
});

test('CHK-TEST-0004-11 the result identifies the track and its version as read from the data', () => {
  // AC-US-0002-11
  const { lap } = completeLap(reading);
  const result = getLapResult(lap) as { trackId?: string; trackVersion?: unknown };
  assert.equal(result.trackId, 'synthetic', 'AC-US-0002-11: trackId must come from the track reading');
  assert.equal(result.trackVersion, 2, 'AC-US-0002-11: trackVersion must come from the track reading');
});

test('CHK-TEST-0004-12 pausing by the Esc key stops the lap timer until the lap is resumed', () => {
  // AC-US-0003-05
  const running = drive(runCountdown(startSession(reading)), autopilot(), 500).lap;
  const paused = pauseLap(running, 'ESC_KEY');
  assert.ok(paused.ok, 'AC-US-0003-05: pauseLap(ESC_KEY) must be accepted while RUNNING');
  let lap = paused.lap;
  const atPause = view(lap).elapsedMs;
  for (let i = 0; i < 240; i++) lap = stepLap(lap, DRIVE_OUT);
  assert.equal(view(lap).lapPhase, 'PAUSED', 'AC-US-0003-05: the lap must stay PAUSED');
  assert.equal(view(lap).pauseCause, 'ESC_KEY', 'AC-US-0003-05: the pause cause must be ESC_KEY');
  assert.equal(view(lap).elapsedMs, atPause, 'AC-US-0003-05: elapsedMs must not advance while paused');
});

test('CHK-TEST-0004-13 losing the tab focus pauses the lap and the timer shows the same value when it returns', () => {
  // AC-US-0003-06
  const running = drive(runCountdown(startSession(reading)), autopilot(), 500).lap;
  const paused = pauseLap(running, 'FOCUS_LOST');
  assert.ok(paused.ok, 'AC-US-0003-06: pauseLap(FOCUS_LOST) must be accepted');
  const atPause = view(running).elapsedMs;
  let lap = paused.lap;
  for (let i = 0; i < 1000; i++) lap = stepLap(lap, DRIVE_OUT);
  const resumed = resumeLap(lap);
  assert.ok(resumed.ok, 'AC-US-0003-06: resumeLap must be accepted after FOCUS_LOST');
  assert.equal(view(resumed.lap).elapsedMs, atPause, 'AC-US-0003-06: elapsedMs on return must equal the value at the focus loss');
  assert.equal(view(resumed.lap).lapPhase, 'RUNNING', 'AC-US-0003-06: the lap must be RUNNING again after resume');
});

test('CHK-TEST-0004-14 losing the tilt sensor pauses the lap and the timer stops advancing', () => {
  // AC-US-0003-07
  const running = drive(runCountdown(startSession(reading)), autopilot(), 500).lap;
  const paused = pauseLap(running, 'SENSOR_LOST');
  assert.ok(paused.ok, 'AC-US-0003-07: pauseLap(SENSOR_LOST) must be accepted');
  let lap = paused.lap;
  for (let i = 0; i < 300; i++) lap = stepLap(lap, DRIVE_OUT);
  assert.equal(view(lap).pauseCause, 'SENSOR_LOST', 'AC-US-0003-07: the pause cause must be SENSOR_LOST');
  assert.equal(view(lap).elapsedMs, view(running).elapsedMs, 'AC-US-0003-07: elapsedMs must not advance after the sensor loss');
});

test('CHK-TEST-0004-15 no step advances during the pause: the session is unchanged and the time on resume is the time of the pause', () => {
  // AC-US-0003-08
  const running = drive(runCountdown(startSession(reading)), autopilot(), 700).lap;
  const paused = pauseLap(running, 'ESC_KEY');
  assert.ok(paused.ok, 'AC-US-0003-08: pause must be accepted');
  const frozen = paused.lap;
  const after = stepLap(frozen, DRIVE_OUT);
  assert.equal(after, frozen, 'AC-US-0003-08: stepLap during the pause must return the same session');
  assert.equal(after.stepCount, running.stepCount, 'AC-US-0003-08: stepCount must not advance during the pause');
  assert.deepEqual(after.kart, running.kart, 'AC-US-0003-08: the kart state must not change during the pause');
  const resumed = resumeLap(after);
  assert.ok(resumed.ok, 'AC-US-0003-08: resume must be accepted');
  assert.equal(view(resumed.lap).elapsedMs, toMs(700), 'AC-US-0003-08: elapsedMs on resume must be the time of the pause instant');
});

test('CHK-TEST-0004-16 a paused and resumed official lap stays official and valid in progress', () => {
  // AC-US-0003-09
  const running = drive(runCountdown(startSession(reading)), autopilot(), 600).lap;
  const paused = pauseLap(running, 'ESC_KEY');
  assert.ok(paused.ok, 'AC-US-0003-09: pause must be accepted');
  const resumed = resumeLap(paused.lap);
  assert.ok(resumed.ok, 'AC-US-0003-09: resume must be accepted');
  const v = view(resumed.lap);
  assert.equal(v.lapKind, 'OFFICIAL', 'AC-US-0003-09: the lap must still be OFFICIAL after the pause');
  assert.equal(v.lapValidity, 'VALID', 'AC-US-0003-09: the lap must still be VALID after the pause');
  assert.equal(v.invalidReason, undefined, 'AC-US-0003-09: no invalidReason after the pause');
  const d = describeLap(v, 'pt');
  assert.equal(d.stateText, 'válida em andamento', 'AC-US-0003-09: the screen state must read "válida em andamento" after resume');
  assert.equal(d.pausedText, undefined, 'AC-US-0003-09: no paused text after resume');
});

test('CHK-TEST-0004-17 repeated pauses in the same lap each freeze the timer and the lap stays official', () => {
  // AC-US-0003-09 (abnormal case: repeated pauses)
  let lap = runCountdown(startSession(reading));
  const controller = autopilot();
  for (let round = 0; round < 3; round++) {
    lap = drive(lap, controller, 200).lap;
    const atPause = view(lap).elapsedMs;
    const p = pauseLap(lap, round === 1 ? 'FOCUS_LOST' : 'ESC_KEY');
    assert.ok(p.ok, `AC-US-0003-09: pause ${round + 1} must be accepted`);
    lap = p.lap;
    for (let i = 0; i < 50; i++) lap = stepLap(lap, DRIVE_OUT);
    assert.equal(view(lap).elapsedMs, atPause, `AC-US-0003-09: pause ${round + 1} must freeze elapsedMs`);
    const r = resumeLap(lap);
    assert.ok(r.ok, `AC-US-0003-09: resume ${round + 1} must be accepted`);
    lap = r.lap;
  }
  assert.equal(view(lap).lapKind, 'OFFICIAL', 'AC-US-0003-09: the lap must still be OFFICIAL after repeated pauses');
  assert.equal(view(lap).lapValidity, 'VALID', 'AC-US-0003-09: the lap must still be VALID after repeated pauses');
  assert.equal(view(lap).elapsedMs, toMs(600), 'AC-US-0003-09: elapsedMs must count only the 600 running steps');
});

test('CHK-TEST-0004-18 a pause during the countdown keeps the timer at 0 and resumes the countdown where it stopped', () => {
  // AC-US-0001-04 (abnormal case: pause or focus loss during the countdown)
  let lap = startSession(reading);
  for (let i = 0; i < 100; i++) lap = stepLap(lap, IDLE);
  const remaining = view(lap).countdownRemainingMs;
  const p = pauseLap(lap, 'FOCUS_LOST');
  assert.ok(p.ok, 'AC-US-0001-04: pause during the countdown must be accepted');
  lap = p.lap;
  for (let i = 0; i < 500; i++) lap = stepLap(lap, DRIVE_OUT);
  assert.equal(view(lap).elapsedMs, 0, 'AC-US-0001-04: elapsedMs must still be 0 while paused in the countdown');
  assert.equal(view(lap).countdownRemainingMs, remaining, 'AC-US-0001-04: the countdown must not advance while paused');
  assert.equal(view(lap).resumePhase, 'COUNTDOWN', 'AC-US-0001-04: the pause must resume into COUNTDOWN');
  const r = resumeLap(lap);
  assert.ok(r.ok, 'AC-US-0001-04: resume must be accepted');
  assert.equal(view(r.lap).lapPhase, 'COUNTDOWN', 'AC-US-0001-04: the lap must be back in COUNTDOWN after resume');
  assert.equal(view(r.lap).elapsedMs, 0, 'AC-US-0001-04: elapsedMs must be 0 after resuming the countdown');
});

test('CHK-TEST-0004-19 getLapState answers with a complete, well-typed view at every step from the green signal to the end', () => {
  // AC-US-0009-01
  let frames = 0;
  const { lap } = completeLap(reading, 'OFFICIAL', autopilot(), (_before, after) => {
    const v = getLapState(after);
    assert.ok(!('code' in v), 'AC-US-0009-01: getLapState must not answer NO_ACTIVE_LAP during the lap');
    const s = v as LapStateView;
    assert.ok(['RUNNING', 'ENDED'].includes(s.lapPhase), `AC-US-0009-01: unexpected phase ${s.lapPhase} during the lap`);
    assert.ok(['VALID', 'INVALID'].includes(s.lapValidity), 'AC-US-0009-01: lapValidity must be VALID or INVALID at every step');
    assert.ok(Number.isInteger(s.elapsedMs), 'AC-US-0009-01: elapsedMs must be an integer at every step');
    assert.ok(describeLap(s, 'pt').stateText.length > 0, 'AC-US-0009-01: the state text must be non-empty at every step');
    frames++;
  });
  assert.equal(lap.phase, 'ENDED', 'AC-US-0009-01: the lap must end');
  assert.ok(frames > 1000, 'AC-US-0009-01: the lap must have been observed over many steps');
});
