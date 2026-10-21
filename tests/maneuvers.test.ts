import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advanceManeuvers, cancelManeuver, initialManeuvers, type ManeuverSample } from '../src/maneuvers';
import { ARCADE_KART, RENTAL_KART, initialState, step, STEP, TEST_PAD, type State, type Input } from '../src/physics';

const sample: ManeuverSample = { enabled: true, held: true, steer: 0.7, throttle: 1, brake: 0, speed: 12, slip: 0.15, yaw: -0.6, onRoad: true };
function charge(seconds: number) {
  let state = initialManeuvers();
  for (let i = 0; i < Math.round(seconds / STEP); i++) state = advanceManeuvers(state, sample, STEP);
  return state;
}
test('a held button alone cannot farm drift rewards', () => {
  let state = initialManeuvers();
  for (let i = 0; i < 600; i++) state = advanceManeuvers(state, { ...sample, slip: 0, yaw: 0 }, STEP);
  state = advanceManeuvers(state, { ...sample, held: false }, STEP);
  assert.equal(state.score, 0);
  assert.equal(state.boost, 0);
});
test('clean releases award increasing boosts only once', () => {
  for (const [seconds, tier] of [[0.8, 1], [1.6, 2], [2.5, 3]]) {
    const reward = advanceManeuvers(charge(seconds), { ...sample, held: false }, STEP);
    assert.equal(reward.boostTier, tier);
    assert.equal(reward.score, tier * 100);
    const next = advanceManeuvers(reward, { ...sample, held: false }, STEP);
    assert.equal(next.score, reward.score);
    assert.equal(next.awards, 1);
    assert.ok(next.boost < reward.boost);
  }
});
test('grass, braking, slow motion and spins cannot cash a pending drift', () => {
  for (const invalid of [{ onRoad: false }, { brake: 1 }, { speed: 2 }, { slip: 1 }]) {
    const state = advanceManeuvers(charge(2.5), { ...sample, held: false, ...invalid }, STEP);
    assert.equal(state.score, 0);
    assert.equal(state.boost, 0);
    assert.equal(state.charge, 0);
  }
});
test('reversing drift direction cancels its charge', () => {
  const state = advanceManeuvers(charge(1.5), { ...sample, steer: -0.7 }, STEP);
  assert.equal(state.charge, 0);
  assert.equal(state.score, 0);
});
test('chain multiplier caps at three and expires', () => {
  let state = initialManeuvers();
  for (let drift = 0; drift < 4; drift++) {
    for (let i = 0; i < 100; i++) state = advanceManeuvers(state, sample, STEP);
    state = advanceManeuvers(state, { ...sample, held: false }, STEP);
  }
  assert.equal(state.chain, 3);
  assert.equal(state.score, 100 + 200 + 300 + 300);
  for (let i = 0; i < 610; i++) state = advanceManeuvers(state, { ...sample, held: false }, STEP);
  assert.equal(state.chain, 0);
  assert.equal(state.boost, 0);
});
test('cancel clears active maneuvers without removing already earned points', () => {
  const reward = advanceManeuvers(charge(2.5), { ...sample, held: false }, STEP);
  const reset = cancelManeuver(reward);
  assert.equal(reset.score, 300);
  assert.equal(reset.boost, 0);
  assert.equal(reset.chain, 0);
});

const moving = (): State => ({ ...initialState(), x: 0, z: 0, heading: 0, vx: 0, vz: 12, speed: 12 });
function run(state: State, input: Input, seconds: number, config = ARCADE_KART) {
  for (let i = 0; i < Math.round(seconds / STEP); i++) state = step(state, input, STEP, config, TEST_PAD);
  return state;
}
test('player-induced drift generates real lateral slip and a useful exit boost', () => {
  const input = { throttle: 1, brake: 0, steer: 0.7, drift: true };
  const drift = run(moving(), input, 2);
  const grip = run(moving(), { ...input, drift: false }, 2);
  assert.ok(Math.abs(drift.telemetry.sideslip) > Math.abs(grip.telemetry.sideslip) * 1.5);
  assert.ok(Math.abs(drift.telemetry.sideslip) < 0.4, 'controlled drift must not turn into a spin');
  assert.ok(drift.maneuvers.charge > 1.3);
  const release = { throttle: 1, brake: 0, steer: 0 };
  const boosted = run(drift, release, 1);
  const unboosted = run({ ...drift, maneuvers: initialManeuvers() }, release, 1);
  assert.ok(boosted.speed > unboosted.speed + 1);
  assert.equal(boosted.maneuvers.score, 200);
});
test('realistic preset ignores the drift input entirely', () => {
  const input = { throttle: 1, brake: 0, steer: 0.3 };
  assert.deepEqual(run(moving(), { ...input, drift: true }, 2, RENTAL_KART), run(moving(), input, 2, RENTAL_KART));
});
test('maneuver replay remains deterministic', () => {
  const drive = () => {
    let state = moving();
    for (let i = 0; i < 600; i++) state = step(state, { throttle: 1, brake: 0, steer: i < 240 ? 0.7 : 0, drift: i < 240 }, STEP, ARCADE_KART, TEST_PAD);
    return state;
  };
  assert.deepEqual(drive(), drive());
});
