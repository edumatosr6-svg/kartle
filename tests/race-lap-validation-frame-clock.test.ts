// TEST-0003 — frame time to fixed steps (strategy: frame-clock, unit, DES-0007).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, MAX_FRAME_S } from '../src/frameClock';

test('CHK-TEST-0003-01 a 60 fps frame runs 2 steps and a 30 fps frame runs 4 steps', () => {
  // AC-US-0003-03
  assert.equal(advanceClock(0, 1 / 60).steps, 2, 'AC-US-0003-03: a frame of 1/60 s must run 2 steps of STEP');
  assert.equal(advanceClock(0, 1 / 30).steps, 4, 'AC-US-0003-03: a frame of 1/30 s must run 4 steps of STEP');
});

test('CHK-TEST-0003-02 one second rendered at 30 fps and at 60 fps runs the same number of steps', () => {
  // AC-US-0003-04
  const total = (frames: number, dt: number) => {
    let acc = 0, steps = 0;
    for (let i = 0; i < frames; i++) { const r = advanceClock(acc, dt); acc = r.accumulatorS; steps += r.steps; }
    return steps;
  };
  assert.equal(total(30, 1 / 30), 120, 'AC-US-0003-04: 30 frames of 1/30 s must run 120 steps');
  assert.equal(total(60, 1 / 60), 120, 'AC-US-0003-04: 60 frames of 1/60 s must run 120 steps');
});

test('CHK-TEST-0003-03 a stalled frame is capped so a frame drop cannot run more than 12 steps at once', () => {
  // NFR-0002
  assert.equal(MAX_FRAME_S, 0.1, 'NFR-0002: the frame cap must be 0.1 s');
  assert.equal(advanceClock(0, 1).steps, 12, 'NFR-0002: a 1 s stall must run 12 steps, not 120');
  assert.equal(advanceClock(0, 0).steps, 0, 'NFR-0002: a zero-length frame must run no step');
});
