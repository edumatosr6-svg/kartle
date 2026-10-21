// TEST-0001 — lap time in integer milliseconds (strategy: lap-timing, unit level, DES-0002).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STEP } from '../src/physics';
import { COUNTDOWN_MS, COUNTDOWN_STEPS, interpolateMs, isCutExceeded, toMs } from '../src/lapTiming';

test('CHK-TEST-0001-01 the countdown lasts 360 steps, which convert to exactly 3000 ms', () => {
  // AC-US-0001-01
  assert.equal(COUNTDOWN_MS, 3000, 'AC-US-0001-01: countdown must last 3000 ms');
  assert.equal(COUNTDOWN_STEPS, 360, 'AC-US-0001-01: 3 s of simulation are 360 steps of STEP');
  assert.equal(toMs(360), 3000, 'AC-US-0001-01: toMs(360) must be 3000');
});

test('CHK-TEST-0001-02 every step count converts to an integer millisecond value, growing by 8 or 9', () => {
  // AC-US-0002-04
  for (let n = 0; n <= 6000; n++) {
    const ms = toMs(n);
    assert.ok(Number.isInteger(ms), `AC-US-0002-04: toMs(${n}) = ${ms} is not an integer`);
    if (n > 0) {
      const delta = ms - toMs(n - 1);
      assert.ok(delta === 8 || delta === 9, `AC-US-0002-04: toMs(${n}) - toMs(${n - 1}) = ${delta}, expected 8 or 9`);
    }
  }
});

test('CHK-TEST-0001-03 the step count converts to N x STEP within half a millisecond', () => {
  // AC-US-0001-05
  for (const n of [1, 2, 3, 100, 360, 1000, 3766, 7200]) {
    const exact = n * STEP * 1000;
    assert.ok(Math.abs(toMs(n) - exact) <= 0.5, `AC-US-0001-05: toMs(${n}) = ${toMs(n)} differs from ${exact} by more than 0.5 ms`);
  }
});

test('CHK-TEST-0001-04 a crossing strictly inside the step gets an instant strictly between the two steps', () => {
  // AC-US-0002-07
  for (const k of [0, 1, 2, 119, 360, 1087, 3766]) {
    for (const fraction of [0.001, 0.1, 0.25, 0.5, 0.75, 0.9, 0.999]) {
      const ms = interpolateMs(k, fraction);
      assert.ok(Number.isInteger(ms), `AC-US-0002-07: interpolateMs(${k}, ${fraction}) = ${ms} is not an integer`);
      assert.ok(ms > toMs(k) && ms < toMs(k + 1), `AC-US-0002-07: interpolateMs(${k}, ${fraction}) = ${ms} is not strictly inside (${toMs(k)}, ${toMs(k + 1)})`);
    }
  }
});

test('CHK-TEST-0001-05 a crossing that coincides with the step gets the instant of that step', () => {
  // AC-US-0002-07 (abnormal case: crossing exactly on a step)
  for (const k of [0, 5, 360, 2015]) {
    assert.equal(interpolateMs(k, 1), toMs(k + 1), `AC-US-0002-07: interpolateMs(${k}, 1) must equal toMs(${k + 1})`);
  }
});

test('CHK-TEST-0001-06 a sector limit crossed inside the step gets an instant strictly between the two steps', () => {
  // AC-US-0002-08
  for (const k of [1088, 2015, 2991]) {
    for (const fraction of [0.001, 0.5, 0.999]) {
      const ms = interpolateMs(k, fraction);
      assert.ok(ms > toMs(k) && ms < toMs(k + 1), `AC-US-0002-08: sector instant ${ms} at step ${k} is not strictly inside (${toMs(k)}, ${toMs(k + 1)})`);
    }
  }
});

test('CHK-TEST-0001-07 120 steps beyond the edge are exactly 1000 ms and do not exceed the default limit; 121 do', () => {
  // AC-US-0006-01
  assert.equal(isCutExceeded(120, 1000), false, 'AC-US-0006-01: 120 steps (1000 ms) must not exceed 1000 ms');
  assert.equal(isCutExceeded(121, 1000), true, 'AC-US-0006-01: 121 steps must exceed 1000 ms');
  assert.equal(isCutExceeded(0, 1000), false, 'AC-US-0006-01: no step beyond the edge must not exceed');
});

test('CHK-TEST-0001-08 a track-declared duration is compared in the same integer arithmetic', () => {
  // AC-US-0006-04
  assert.equal(isCutExceeded(36, 300), false, 'AC-US-0006-04: 36 steps (300 ms) must not exceed 300 ms');
  assert.equal(isCutExceeded(37, 300), true, 'AC-US-0006-04: 37 steps must exceed 300 ms');
});
