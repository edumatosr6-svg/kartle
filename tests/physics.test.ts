import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialState, LapTracker, step, steeringLimit, track, STEP, RENTAL_KART, ARCADE_KART, TEST_PAD, wheelLoads, tireForce, GRAVITY, type State, type Input, type KartConfig, type Environment } from '../src/physics';

const moving = (speed = 0): State => ({ ...initialState(), x: 0, z: 0, heading: 0, vx: 0, vz: speed, speed });
const idle = { throttle: 0, brake: 0, steer: 0 };
function run(state: State, input: Input, seconds: number, config: KartConfig = RENTAL_KART, environment: Environment = TEST_PAD) {
  for (let i = 0; i < Math.round(seconds / STEP); i++) state = step(state, input, STEP, config, environment);
  return state;
}

test('fixed-step replay reproduces the same state', () => {
  const run = () => {
    let state = moving();
    for (let i = 0; i < 2400; i++) state = step(state, { throttle: 1, brake: i > 1800 ? 1 : 0, steer: Math.sin(i / 120) * 0.4 }, STEP, RENTAL_KART, TEST_PAD);
    return state;
  };
  assert.deepEqual(run(), run());
});
test('braking stops without reversing', () => {
  let state = moving(15);
  for (let i = 0; i < 720; i++) {
    state = step(state, { throttle: 0, brake: 1, steer: 0 }, STEP, RENTAL_KART, TEST_PAD);
    assert.ok(state.vz >= -1e-9, 'brake must not accelerate backwards');
  }
  assert.equal(state.speed, 0);
  assert.ok(state.z > 15 && state.z < 40, 'rental kart stopping distance envelope from 54 km/h');
  assert.equal(state.yawRate, 0);
});
test('grass slows the kart more than asphalt', () => {
  const asphalt = run(moving(15), idle, 1);
  const grass = run(moving(15), idle, 1, RENTAL_KART, { surfaceAt: () => 'grass', walls: false });
  assert.ok(grass.speed < asphalt.speed - 0.5);
});
test('crossing the start alone cannot complete a lap', () => {
  const laps = new LapTracker();
  assert.equal(laps.update(239), false);
  assert.equal(laps.update(0), false);
  for (let i = 10; i < track.length; i += 10) assert.equal(laps.update(i), false);
  assert.equal(laps.update(0), true);
  assert.equal(laps.update(0), false);
});

test('steering at rest cannot rotate or translate the chassis', () => {
  const state = run(moving(), { ...idle, steer: 1 }, 3);
  assert.equal(state.speed, 0);
  assert.equal(state.heading, 0);
  assert.equal(state.x, 0);
  assert.notEqual(state.steering, 0);
});
test('heavier driver accelerates slower with the same engine', () => {
  const light = run(moving(), { ...idle, throttle: 1 }, 5, { ...RENTAL_KART, driverMass: 55 });
  const heavy = run(moving(), { ...idle, throttle: 1 }, 5, { ...RENTAL_KART, driverMass: 110 });
  assert.ok(light.speed > heavy.speed * 1.1);
  assert.ok(light.z > heavy.z);
});
test('load transfer conserves weight and shifts load forward during braking and outward in turns', () => {
  const neutral = wheelLoads(RENTAL_KART, 0, 0);
  const braking = wheelLoads(RENTAL_KART, -4, 5);
  assert.ok(braking[0] + braking[1] > neutral[0] + neutral[1]);
  assert.ok(braking[1] > braking[0] && braking[3] > braking[2]);
  for (const loads of [neutral, braking, wheelLoads(RENTAL_KART, 40, -40)]) {
    assert.ok(loads.every(v => v >= 0));
    assert.ok(Math.abs(loads.reduce((a, b) => a + b, 0) - 228 * GRAVITY) < 1e-9);
  }
});
test('braking and cornering share tire grip; unloading reduces total axle capacity', () => {
  const free = tireForce(550, 0.08, 0, 13, 'asphalt', RENTAL_KART);
  const braking = tireForce(550, 0.08, -900, 13, 'asphalt', RENTAL_KART);
  assert.ok(Math.abs(braking.fy) < Math.abs(free.fy));
  assert.ok(Math.hypot(braking.fx, braking.fy) <= braking.capacity);
  const unequal = tireForce(900, 0.2, 0, 13, 'asphalt', RENTAL_KART).capacity + tireForce(200, 0.2, 0, 13, 'asphalt', RENTAL_KART).capacity;
  assert.ok(unequal < 2 * free.capacity);
});
test('excess steering at speed saturates the front and reduces yaw response', () => {
  const moderate = run(moving(16), { throttle: 0.5, brake: 0, steer: 0.3 }, 1);
  const excessive = run(moving(16), { throttle: 0.5, brake: 0, steer: 1 }, 1);
  assert.equal(excessive.telemetry.handling, 'understeer');
  assert.ok(excessive.telemetry.frontSlip > excessive.telemetry.rearSlip * 2);
  assert.ok(Math.abs(excessive.yawRate) < Math.abs(moderate.yawRate));
});
test('rear braking mid-corner creates oversteer through tire forces', () => {
  const entry = run(moving(15), { throttle: 0.5, brake: 0, steer: 0.25 }, 1);
  const coast = run(entry, { ...idle, steer: 0.25 }, 0.5);
  const brake = run(entry, { throttle: 0, brake: 1, steer: 0.25 }, 0.5);
  assert.ok(Math.abs(brake.yawRate) > Math.abs(coast.yawRate) * 1.5);
  assert.ok(brake.telemetry.rearSlip > coast.telemetry.rearSlip * 2);
  assert.equal(brake.telemetry.handling, 'oversteer');
});
test('early countersteer and brake release can arrest rear-brake oversteer', () => {
  const entry = run(moving(15), { throttle: 0.5, brake: 0, steer: 0.25 }, 1);
  const onset = run(entry, { throttle: 0, brake: 1, steer: 0.25 }, 0.2);
  const held = run(onset, { ...idle, steer: 0.25 }, 0.3);
  const counter = run(onset, { ...idle, steer: -0.5 }, 0.3);
  assert.ok(Math.abs(counter.yawRate) < Math.abs(held.yawRate) * 0.5);
  assert.ok(Math.abs(counter.telemetry.sideslip) < Math.abs(held.telemetry.sideslip));
});
test('left and right cornering are mirrored, without directional bias', () => {
  const left = run(moving(12), { throttle: 0.4, brake: 0, steer: -0.2 }, 2);
  const right = run(moving(12), { throttle: 0.4, brake: 0, steer: 0.2 }, 2);
  assert.ok(Math.abs(left.x + right.x) < 1e-8);
  assert.ok(Math.abs(left.z - right.z) < 1e-8);
  assert.ok(Math.abs(left.yawRate + right.yawRate) < 1e-8);
});
test('releasing steering does not erase lateral velocity or yaw instantaneously', () => {
  const corner = run(moving(12), { throttle: 0.5, brake: 0, steer: 0.4 }, 1);
  const next = step(corner, idle, STEP, RENTAL_KART, TEST_PAD);
  assert.ok(Math.abs(next.yawRate) > 0.1);
  assert.ok(Math.hypot(next.vx - corner.vx, next.vz - corner.vz) < 0.2);
});
test('passive sliding dissipates kinetic energy and stays finite', () => {
  let state = { ...moving(12), vx: 5, yawRate: 1 };
  const energy = (s: State) => (s.vx ** 2 + s.vz ** 2 + RENTAL_KART.yawRadius ** 2 * s.yawRate ** 2) / 2;
  const initial = energy(state);
  for (let i = 0; i < 3600; i++) {
    state = step(state, idle, STEP, RENTAL_KART, TEST_PAD);
    assert.ok(Number.isFinite(state.heading));
    assert.ok(energy(state) <= initial + 0.01);
  }
  assert.ok(energy(state) < initial * 0.05);
});
test('extra yaw inertia slows transient turn-in with identical tire forces', () => {
  const input = { throttle: 0.3, brake: 0, steer: 0.5 };
  const light = run(moving(10), input, 0.15);
  const heavy = run(moving(10), input, 0.15, { ...RENTAL_KART, yawRadius: 0.8 });
  assert.ok(Math.abs(heavy.yawRate) < Math.abs(light.yawRate));
});
test('smaller integration intervals converge to the same trajectory', () => {
  const input = { throttle: 0.5, brake: 0, steer: 0.2 };
  const regular = run(moving(10), input, 3);
  let fine = moving(10);
  for (let i = 0; i < 720; i++) fine = step(fine, input, STEP / 2, RENTAL_KART, TEST_PAD);
  assert.ok(Math.hypot(regular.x - fine.x, regular.z - fine.z) < 0.001);
  assert.ok(Math.abs(regular.yawRate - fine.yawRate) < 0.001);
});
test('each tire samples its own surface', () => {
  const state = step(moving(10), idle, STEP, RENTAL_KART, { surfaceAt: p => p.x > 0 ? 'grass' : 'asphalt', walls: false });
  assert.deepEqual(state.telemetry.wheels.map(w => w.surface), ['grass', 'asphalt', 'grass', 'asphalt']);
  assert.ok(state.telemetry.wheels[0].capacity < state.telemetry.wheels[1].capacity);
});
test('governor limits acceleration without hard-clamping velocity', () => {
  const terminal = run(moving(), { ...idle, throttle: 1 }, 40);
  assert.ok(terminal.speed > 17 && terminal.speed < RENTAL_KART.governorSpeed);
  const overspeed = step(moving(25), idle, STEP, RENTAL_KART, TEST_PAD);
  assert.ok(overspeed.speed > 24);
});
test('arcade improves launch and corner-exit acceleration without changing mass', () => {
  const input = { ...idle, throttle: 1 };
  const rental = run(moving(), input, 5);
  const arcade = run(moving(), input, 5, ARCADE_KART);
  assert.equal(ARCADE_KART.kartMass, RENTAL_KART.kartMass);
  assert.equal(ARCADE_KART.yawRadius, RENTAL_KART.yawRadius);
  assert.ok(arcade.speed > rental.speed * 1.25);
  assert.ok(run(moving(8), input, 2, ARCADE_KART).speed > run(moving(8), input, 2).speed * 1.1);
  assert.ok(run(moving(), input, 5, { ...ARCADE_KART, driverMass: 110 }).speed < arcade.speed);
});
test('arcade full-key steering keeps useful grip and speed instead of excessive front scrub', () => {
  const input = { throttle: 0.5, brake: 0, steer: 1 };
  const assisted = run(moving(16), input, 3, ARCADE_KART);
  const previous = run(moving(16), input, 3, { ...ARCADE_KART, drivingAssists: false });
  assert.ok(assisted.telemetry.frontSlip < previous.telemetry.frontSlip * 0.5);
  assert.ok(assisted.speed > previous.speed * 1.15);
  assert.ok(Math.abs(assisted.heading) > 1, 'assistance must still allow meaningful cornering');
});
test('arcade braking while holding full steering avoids the previous spin', () => {
  const turn = { throttle: 0.5, brake: 0, steer: 1 };
  const braking = { throttle: 0, brake: 1, steer: 1 };
  const assisted = run(run(moving(16), turn, 3, ARCADE_KART), braking, 1, ARCADE_KART);
  const previousConfig = { ...ARCADE_KART, drivingAssists: false };
  const previous = run(run(moving(16), turn, 3, previousConfig), braking, 1, previousConfig);
  assert.ok(Math.abs(assisted.telemetry.sideslip) < 0.15);
  assert.ok(Math.abs(assisted.telemetry.sideslip) < Math.abs(previous.telemetry.sideslip) * 0.25);
});
test('arcade release straightens smoothly without snapping or rotating at rest', () => {
  const corner = run(moving(16), { throttle: 0.5, brake: 0, steer: 1 }, 3, ARCADE_KART);
  const oneStep = step(corner, idle, STEP, ARCADE_KART, TEST_PAD);
  assert.ok(Math.abs(oneStep.heading - corner.heading) < 0.02);
  assert.ok(Math.abs(oneStep.yawRate) > 0.1);
  const released = run(corner, idle, 0.5, ARCADE_KART);
  assert.ok(Math.abs(released.yawRate) < 0.05);
  const rest = run(moving(), { ...idle, steer: 1 }, 2, ARCADE_KART);
  assert.equal(rest.speed, 0);
  assert.equal(rest.heading, 0);
});
test('arcade preserves low-speed steering lock but limits high-speed digital inputs', () => {
  assert.equal(steeringLimit(0, ARCADE_KART), ARCADE_KART.maxSteer);
  assert.ok(steeringLimit(20, ARCADE_KART) < steeringLimit(8, ARCADE_KART));
  assert.equal(steeringLimit(20, RENTAL_KART), RENTAL_KART.maxSteer);
});
