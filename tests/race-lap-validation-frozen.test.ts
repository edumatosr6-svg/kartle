// TEST-0014 — what the feature must not change: the fixed step, the Input fields, the presets (strategy: lap-frozen, DES-0012).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ARCADE_KART, KART_PRESETS, RENTAL_KART, STEP, PHYSICS_VERSION } from '../src/physics';

const physicsSource = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'physics.ts'), 'utf8');

// Literal copies of the presets at the start of the feature (DES-0012).
const RENTAL_AT_START = {
  kartMass: 153, driverMass: 75, wheelbase: 1.04, trackWidth: 1.2,
  frontWeight: 0.42, cgHeight: 0.28, yawRadius: 0.48,
  enginePower: 6300, transmissionEfficiency: 0.86, driveForce: 650,
  governorSpeed: 20, brakeForce: 2100, engineBrake: 65,
  friction: 0.95, grassFriction: 0.38, loadSensitivity: 0.12,
  frontStiffness: 11, rearStiffness: 13,
  maxSteer: 0.40, steerRate: 1.35, axleScrub: 5, throttleRate: 3,
  drivingAssists: false,
};
const ARCADE_AT_START = {
  ...RENTAL_AT_START,
  enginePower: 10000, driveForce: 1000, governorSpeed: 23,
  throttleRate: 5, engineBrake: 40,
  friction: 1.10, rearStiffness: 14.5, brakeForce: 1900,
  steerRate: 1.8, maxSteer: 0.36, axleScrub: 3.5,
  drivingAssists: true,
};

test('CHK-TEST-0014-01 the fixed step is still 1/120 s', () => {
  // NFR-0010
  assert.equal(1 / STEP, 120, 'NFR-0010: 1 / STEP must be exactly 120');
  assert.match(physicsSource, /export const STEP = 1 \/ 120;/, 'NFR-0010: STEP must still be declared as 1 / 120');
});

test('CHK-TEST-0014-02 the Input type still has exactly throttle, brake, steer and the optional drift', () => {
  // NFR-0010
  assert.match(physicsSource, /export type Input = \{ throttle: number; brake: number; steer: number; drift\?: boolean \};/, 'NFR-0010: the Input type must be unchanged');
  assert.match(physicsSource, /export function step\(state: State, input: Input, dt = STEP, config: KartConfig = RENTAL_KART, environment: Environment = CIRCUIT\): State/, 'NFR-0010: the signature of step must be unchanged');
});

test('CHK-TEST-0014-03 the rental preset keeps every value it had at the start of the feature', () => {
  // NFR-0011
  assert.deepEqual({ ...RENTAL_KART }, RENTAL_AT_START, 'NFR-0011: RENTAL_KART must be unchanged');
});

test('CHK-TEST-0014-04 the arcade preset keeps every value it had at the start of the feature', () => {
  // NFR-0011
  assert.deepEqual({ ...ARCADE_KART }, ARCADE_AT_START, 'NFR-0011: ARCADE_KART must be unchanged');
});

test('CHK-TEST-0014-05 the preset table, the physics version and the re-export line of the physics module are unchanged', () => {
  // NFR-0011
  assert.deepEqual(Object.keys(KART_PRESETS).sort(), ['arcade', 'rental'], 'NFR-0011: KART_PRESETS must still expose arcade and rental');
  assert.equal(KART_PRESETS.arcade, ARCADE_KART, 'NFR-0011: KART_PRESETS.arcade must be ARCADE_KART');
  assert.equal(KART_PRESETS.rental, RENTAL_KART, 'NFR-0011: KART_PRESETS.rental must be RENTAL_KART');
  assert.equal(PHYSICS_VERSION, 'rental-4t-v4', 'NFR-0011: the physics version must be unchanged');
  assert.equal(physicsSource.split('\n')[2], "export { nearest, track, WIDTH, LapTracker } from './track';", 'NFR-0011: line 3 of src/physics.ts must be unchanged');
});
