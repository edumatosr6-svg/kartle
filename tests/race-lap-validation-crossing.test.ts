// TEST-0002 — line crossings: sense, fraction, coincidence with the step, reach (strategy: lap-crossing, unit, DES-0003).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crossLine, type Line } from '../src/track';
import { syntheticReading } from './fixtures/trackFiles';
import { centerlineCrossings } from './helpers/geometry';

// A line along the z axis from z = -5 to z = +5; the track sense crosses it from x < 0 to x >= 0.
const line: Line = { fromXM: 0, fromZM: -5, toXM: 0, toZM: 5 };

test('CHK-TEST-0002-01 a displacement from the right side to the left side of the line is a FORWARD crossing inside the step', () => {
  // AC-US-0005-03
  const c = crossLine(line, { x: -2, z: 0 }, { x: 6, z: 0 });
  assert.ok(c, 'AC-US-0005-03: a displacement across the line must be reported as a crossing');
  assert.equal(c.sense, 'FORWARD', 'AC-US-0005-03: crossing in the track sense must be FORWARD');
  assert.ok(c.fraction > 0 && c.fraction < 1, `AC-US-0005-03: fraction ${c.fraction} must be strictly inside (0, 1)`);
});

test('CHK-TEST-0002-02 the opposite displacement is a REVERSE crossing', () => {
  // AC-US-0005-01
  const c = crossLine(line, { x: 6, z: 0 }, { x: -2, z: 0 });
  assert.ok(c, 'AC-US-0005-01: a displacement against the track sense must still be reported');
  assert.equal(c.sense, 'REVERSE', 'AC-US-0005-01: crossing against the track sense must be REVERSE');
});

test('CHK-TEST-0002-03 a displacement that ends on the line has fraction exactly 1', () => {
  // AC-US-0002-07 (abnormal case: crossing exactly on a step)
  const c = crossLine(line, { x: -3, z: 1 }, { x: 0, z: 1 });
  assert.ok(c, 'AC-US-0002-07: ending on the line must count as a crossing');
  assert.equal(c.fraction, 1, 'AC-US-0002-07: a crossing that coincides with the step must have fraction 1');
});

test('CHK-TEST-0002-04 the fraction is the proportion of the displacement travelled before the line', () => {
  // AC-US-0002-08
  const c = crossLine(line, { x: -2, z: 0 }, { x: 6, z: 0 });
  assert.ok(c, 'AC-US-0002-08: crossing expected');
  assert.ok(Math.abs(c.fraction - 0.25) < 1e-9, `AC-US-0002-08: fraction ${c.fraction} must be 0.25 for a crossing one quarter into the displacement`);
});

test('CHK-TEST-0002-05 a displacement beyond the reach of the segment does not cross it', () => {
  // AC-US-0004-01
  assert.equal(crossLine(line, { x: -2, z: 9 }, { x: 6, z: 9 }), null, 'AC-US-0004-01: passing beside the segment must not count as crossing it');
  assert.equal(crossLine(line, { x: -2, z: 0 }, { x: -1, z: 0 }), null, 'AC-US-0004-01: a displacement that stays on one side must not count as crossing');
});

test('CHK-TEST-0002-06 the centerline of the synthetic track crosses every declared line exactly once, in the track sense', () => {
  // AC-US-0002-13
  const reading = syntheticReading();
  assert.equal(reading.trackDataStatus, 'COMPLETE', 'AC-US-0002-13: the synthetic track file must read COMPLETE');
  if (reading.trackDataStatus !== 'COMPLETE') return;
  const lines = [reading.finishLine, ...reading.sectorLimits, ...reading.markers];
  lines.forEach((l, i) => {
    const crossings = centerlineCrossings(l);
    assert.equal(crossings.length, 1, `AC-US-0002-13: line ${i} is crossed ${crossings.length} times by the centerline, expected 1`);
    assert.equal(crossings[0].forward, true, `AC-US-0002-13: line ${i} is not crossed in the track sense by the centerline`);
  });
});
