import { initialState, step, STEP, RENTAL_KART, KART_PRESETS, TEST_PAD, type Input, type State } from '../src/physics';
const moving = (speed: number): State => ({ ...initialState(), x: 0, z: 0, heading: 0, vx: 0, vz: speed, speed });
function run(s: State, input: Input, seconds: number, mass = 75) {
  for (let i = 0; i < seconds / STEP; i++) s = step(s, input, STEP, { ...RENTAL_KART, driverMass: mass }, TEST_PAD);
  return s;
}
const round = (v: number) => +v.toFixed(3);
for (const mass of [55, 75, 110]) {
  const s = run(moving(0), { throttle: 1, brake: 0, steer: 0 }, 5, mass);
  console.log({ mass, speedAfter5sKmh: round(s.speed * 3.6), distance: round(s.z) });
}
for (const steer of [0.1, 0.3, 0.7, 1]) {
  const s = run(moving(16), { throttle: 0.5, brake: 0, steer }, 1);
  console.log({ steer, kmh: round(s.speed * 3.6), yaw: round(s.yawRate), frontSlip: round(s.telemetry.frontSlip), rearSlip: round(s.telemetry.rearSlip), handling: s.telemetry.handling });
}
const turn = run(moving(15), { throttle: 0.5, brake: 0, steer: 0.25 }, 1);
for (const brake of [0, 0.5, 1]) {
  for (const seconds of [0.2, 0.5, 0.75]) {
    const s = run(turn, { throttle: 0, brake, steer: 0.25 }, seconds);
    console.log({ brake, seconds, kmh: round(s.speed * 3.6), yaw: round(s.yawRate), frontSlip: round(s.telemetry.frontSlip), rearSlip: round(s.telemetry.rearSlip), sideslip: round(s.telemetry.sideslip), handling: s.telemetry.handling });
  }
}
const stop = run(moving(15), { throttle: 0, brake: 1, steer: 0 }, 6);
console.log({ stop: { speed: round(stop.speed), distance: round(stop.z), yaw: round(stop.yawRate) } });
console.log({ terminalKmh: round(run(moving(0), { throttle: 1, brake: 0, steer: 0 }, 45).speed * 3.6) });
for (const [preset, config] of Object.entries(KART_PRESETS)) {
  let state = moving(0), to40: number | null = null, after5 = 0;
  let retake = moving(8);
  for (let tick = 1; tick <= 45 / STEP; tick++) {
    state = step(state, { throttle: 1, brake: 0, steer: 0 }, STEP, config, TEST_PAD);
    if (to40 === null && state.speed >= 40 / 3.6) to40 = tick * STEP;
    if (tick === 5 / STEP) after5 = state.speed * 3.6;
    if (tick <= 2 / STEP) retake = step(retake, { throttle: 1, brake: 0, steer: 0 }, STEP, config, TEST_PAD);
  }
  console.log({ preset, zeroTo40Seconds: to40 === null ? null : round(to40),
    after5SecondsKmh: round(after5), terminalKmh: round(state.speed * 3.6),
    retakeFrom28_8KmhAfter2Seconds: round(retake.speed * 3.6) });
}
