import { nearest, track, WIDTH, type Point } from './track';
import { advanceManeuvers, cancelManeuver, initialManeuvers, type Maneuvers } from './maneuvers';
export { nearest, track, WIDTH, LapTracker } from './track';

export const STEP = 1 / 120;
export const GRAVITY = 9.81;
export const PHYSICS_VERSION = 'rental-4t-v4';
export type Input = { throttle: number; brake: number; steer: number; drift?: boolean };
export type Surface = 'asphalt' | 'grass';
export type Handling = 'grip' | 'understeer' | 'oversteer' | 'sliding';
export type Wheel = {
  load: number; slipAngle: number; utilization: number;
  longitudinalForce: number; lateralForce: number; capacity: number;
  steerAngle: number; surface: Surface;
};
export type Telemetry = {
  wheels: Wheel[]; longitudinalG: number; lateralG: number;
  frontSlip: number; rearSlip: number; sideslip: number; handling: Handling;
};
export type State = Point & {
  heading: number; vx: number; vz: number; yawRate: number;
  speed: number; elapsed: number; steering: number; throttle: number; brake: number;
  ax: number; ay: number; telemetry: Telemetry;
  maneuvers: Maneuvers;
};
export type KartConfig = {
  kartMass: number; driverMass: number; wheelbase: number; trackWidth: number;
  frontWeight: number; cgHeight: number; yawRadius: number;
  enginePower: number; transmissionEfficiency: number; driveForce: number;
  governorSpeed: number; brakeForce: number; engineBrake: number;
  friction: number; grassFriction: number; loadSensitivity: number;
  frontStiffness: number; rearStiffness: number;
  maxSteer: number; steerRate: number; axleScrub: number; throttleRate: number;
  drivingAssists: boolean;
};
// Only kart mass (RT10/GX270) and engine power (GX270) are sourced specs.
// Other values are calibration assumptions; see docs/physics.md.
export const RENTAL_KART: Readonly<KartConfig> = Object.freeze({
  kartMass: 153, driverMass: 75, wheelbase: 1.04, trackWidth: 1.2,
  frontWeight: 0.42, cgHeight: 0.28, yawRadius: 0.48,
  enginePower: 6300, transmissionEfficiency: 0.86, driveForce: 650,
  governorSpeed: 20, brakeForce: 2100, engineBrake: 65,
  friction: 0.95, grassFriction: 0.38, loadSensitivity: 0.12,
  frontStiffness: 11, rearStiffness: 13,
  maxSteer: 0.40, steerRate: 1.35, axleScrub: 5, throttleRate: 3,
  drivingAssists: false,
});
// Gameplay tune, intentionally above the rental engine specification.
// Same mass and tire model, with explicitly arcade stability/steering assists.
export const ARCADE_KART: Readonly<KartConfig> = Object.freeze({
  ...RENTAL_KART,
  enginePower: 10000, driveForce: 1000, governorSpeed: 23,
  throttleRate: 5, engineBrake: 40,
  friction: 1.10, rearStiffness: 14.5, brakeForce: 1900,
  steerRate: 1.8, maxSteer: 0.36, axleScrub: 3.5,
  drivingAssists: true,
});
export const KART_PRESETS = { arcade: ARCADE_KART, rental: RENTAL_KART } as const;
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const approach = (v: number, target: number, change: number) => v + clamp(target - v, -change, change);
const emptyTelemetry = (): Telemetry => ({
  wheels: [], longitudinalG: 0, lateralG: 0, frontSlip: 0, rearSlip: 0, sideslip: 0, handling: 'grip',
});
export function initialState(): State {
  return {
    ...track[0], heading: Math.atan2(track[1].x - track[0].x, track[1].z - track[0].z),
    vx: 0, vz: 0, yawRate: 0, speed: 0, elapsed: 0,
    steering: 0, throttle: 0, brake: 0, ax: 0, ay: 0, telemetry: emptyTelemetry(), maneuvers: initialManeuvers(),
  };
}
// Body: forward u, left v, positive yaw turns left.
// World forward = (sin(h), cos(h)); world left = (cos(h), -sin(h)).
export function bodyVelocity(state: State) {
  const s = Math.sin(state.heading), c = Math.cos(state.heading);
  return { u: state.vx * s + state.vz * c, v: state.vx * c - state.vz * s };
}
export function wheelPositions(config: KartConfig) {
  const a = config.wheelbase * (1 - config.frontWeight), b = config.wheelbase * config.frontWeight;
  return [
    { forward: a, left: config.trackWidth / 2 }, { forward: a, left: -config.trackWidth / 2 },
    { forward: -b, left: config.trackWidth / 2 }, { forward: -b, left: -config.trackWidth / 2 },
  ];
}
export function wheelLoads(config: KartConfig, ax: number, ay: number) {
  const mass = config.kartMass + config.driverMass, weight = mass * GRAVITY;
  const front = clamp(weight * config.frontWeight - mass * ax * config.cgHeight / config.wheelbase, 0, weight);
  const rear = weight - front;
  // Algebraic load transfer: positive ay loads right tires, no suspension travel.
  const transfer = mass * ay * config.cgHeight / config.trackWidth;
  const frontTransfer = clamp(transfer * config.frontWeight, -front / 2, front / 2);
  const rearTransfer = clamp(transfer * (1 - config.frontWeight), -rear / 2, rear / 2);
  return [front / 2 - frontTransfer, front / 2 + frontTransfer, rear / 2 - rearTransfer, rear / 2 + rearTransfer];
}
export function tireForce(load: number, slip: number, requestedFx: number, stiffness: number, surface: Surface, config: KartConfig) {
  if (load <= 0) return { fx: 0, fy: 0, capacity: 0, utilization: 0 };
  const mu = surface === 'grass' ? config.grassFriction : config.friction;
  const capacity = mu * load * Math.pow(550 / Math.max(load, 25), config.loadSensitivity);
  const requestedFy = -stiffness * load * slip;
  const demand = Math.hypot(requestedFx, requestedFy), utilization = demand / capacity;
  // Brush-inspired combined envelope, progressive saturation and sliding drop.
  const sliding = 1 - 0.18 * (1 - Math.exp(-Math.max(0, utilization - 1) * 0.65));
  const force = capacity * Math.tanh(utilization) * sliding;
  const scale = demand > 0 ? force / demand : 0;
  return { fx: requestedFx * scale, fy: requestedFy * scale, capacity, utilization };
}
function handling(front: number, rear: number, sideslip: number, speed: number): Handling {
  if (speed < 3) return 'grip';
  if (Math.abs(sideslip) > 0.65) return 'sliding';
  if (rear > 0.09 && rear > front * 1.03) return 'oversteer';
  if (front > 0.09 && front > rear * 1.2) return 'understeer';
  if (front > 0.2 && rear > 0.2) return 'sliding';
  return 'grip';
}
export type Environment = { surfaceAt: (point: Point) => Surface; walls: boolean };
export const CIRCUIT: Environment = { surfaceAt: p => nearest(p).distance > WIDTH / 2 ? 'grass' : 'asphalt', walls: true };
export const TEST_PAD: Environment = { surfaceAt: () => 'asphalt', walls: false };

export function steeringLimit(speed: number, config: KartConfig) {
  if (!config.drivingAssists) return config.maxSteer;
  // A digital key requests a controllable turn, not full mechanical steering.
  // Small slip allowance accounts for tire compliance; no knowledge of the track.
  return Math.min(config.maxSteer,
    Math.atan(config.wheelbase * config.friction * GRAVITY / Math.max(speed * speed, 1)) + 0.045);
}

function integrate(state: State, input: Input, dt: number, config: KartConfig, environment: Environment): State {
  const mass = config.kartMass + config.driverMass, inertia = mass * config.yawRadius ** 2;
  const { u, v } = bodyVelocity(state);
  const sin = Math.sin(state.heading), cos = Math.cos(state.heading);
  const drifting = config.drivingAssists && state.maneuvers.drifting;
  const boosting = config.drivingAssists && state.maneuvers.boost > 0;
  const limit = Math.min(config.maxSteer, steeringLimit(state.speed, config) * (drifting ? 1.2 : 1));
  const targetSteer = -clamp(input.steer, -1, 1) * limit;
  const returning = Math.abs(targetSteer) < 0.001 || Math.sign(targetSteer) !== Math.sign(state.steering);
  const steerRate = config.drivingAssists ? limit * (returning ? 10 : 5) : config.steerRate;
  const steering = approach(state.steering, targetSteer, steerRate * dt);
  const throttle = approach(state.throttle, clamp(input.throttle, 0, 1), config.throttleRate * dt);
  const brake = approach(state.brake, clamp(input.brake, 0, 1), 6 * dt);
  const loads = wheelLoads(config, state.ax, state.ay);
  const positions = wheelPositions(config);
  const governor = clamp((config.governorSpeed + (boosting ? 3 : 0) - Math.abs(u)) / 1.5, 0, 1);
  // Brake/throttle interlock; single-ratio clutch and governor approximation.
  const drive = throttle * (1 - brake) * governor * Math.min(config.driveForce, config.enginePower * config.transmissionEfficiency / Math.max(Math.abs(u), 1));
  const coastBrake = (1 - throttle) * config.engineBrake * clamp(Math.abs(u) / 3, 0, 1);
  let fx = -0.42 * u * Math.abs(u), fy = 0, moment = 0;
  const wheels: Wheel[] = positions.map((p, i) => {
    const front = i < 2;
    const delta = front && Math.abs(steering) > 1e-5
      ? Math.atan(config.wheelbase / (config.wheelbase / Math.tan(steering) - p.left)) : 0;
    const cs = Math.cos(delta), sn = Math.sin(delta);
    const localU = u - state.yawRate * p.left, localV = v + state.yawRate * p.forward;
    const tireU = localU * cs + localV * sn, tireV = -localU * sn + localV * cs;
    const slip = Math.atan2(tireV, Math.max(Math.abs(tireU), 2));
    const point = { x: state.x + p.forward * sin + p.left * cos, z: state.z + p.forward * cos - p.left * sin };
    const surface = environment.surfaceAt(point);
    const rolling = (surface === 'grass' ? 0.18 : 0.018) * loads[i] * Math.tanh(tireU / 0.5);
    // Common rear-axle speed: opposing tire scrub resists yaw, less as inner unloads.
    const scrub = front ? 0 : config.axleScrub * loads[i] * (u - localU) / Math.max(Math.abs(u), 2);
    // Arcade brake assist distributes braking to both axles and reserves lateral grip.
    // Rental keeps its original rear-only braking.
    const brakeShare = config.drivingAssists ? (front ? 0.4 : 0.6) / 2 : (front ? 0 : 0.5);
    const brakeDemand = brake * config.brakeForce * brakeShare;
    const mu = surface === 'grass' ? config.grassFriction : config.friction;
    const braking = config.drivingAssists ? Math.min(brakeDemand, loads[i] * mu * 0.65) : brakeDemand;
    const requestedFx = -rolling - braking * Math.tanh(tireU / 0.5)
      + (front ? 0 : drive / 2 - coastBrake / 2 * Math.tanh(tireU / 0.5) + scrub);
    const tireConfig = drifting && !front ? { ...config, friction: config.friction * 0.86 } : config;
    const force = tireForce(loads[i], slip, requestedFx, front ? config.frontStiffness : config.rearStiffness, surface, tireConfig);
    const bodyFx = force.fx * cs - force.fy * sn, bodyFy = force.fx * sn + force.fy * cs;
    fx += bodyFx; fy += bodyFy;
    moment += p.forward * bodyFy - p.left * bodyFx;
    return { load: loads[i], slipAngle: slip, utilization: force.utilization,
      longitudinalForce: force.fx, lateralForce: force.fy, capacity: force.capacity, steerAngle: delta, surface };
  });
  if (config.drivingAssists && state.speed > 0.5) {
    const asphaltFraction = wheels.filter(w => w.surface === 'asphalt').length / 4;
    const mu = config.grassFriction + (config.friction - config.grassFriction) * asphaltFraction;
    // Arcade lateral damping removes excess sliding, while retaining small tire slip.
    const allowedSlipVelocity = Math.abs(u) * (drifting ? 0.18 : 0.035);
    const excessV = Math.sign(v) * Math.max(0, Math.abs(v) - allowedSlipVelocity);
    fy -= clamp(mass * excessV * 4, -mass * mu * GRAVITY * 0.45, mass * mu * GRAVITY * 0.45);
    // Only arrest excess yaw; never steer toward a track waypoint or boost turn-in.
    const intendedYaw = clamp(u * Math.tan(steering) / config.wheelbase,
      -mu * GRAVITY * 0.85 / Math.max(Math.abs(u), 2), mu * GRAVITY * 0.85 / Math.max(Math.abs(u), 2));
    const yawCeiling = Math.abs(intendedYaw) + 0.04;
    const correcting = Math.abs(input.steer) < 0.01 || state.yawRate * intendedYaw < 0;
    const excessYaw = correcting ? state.yawRate
      : Math.sign(state.yawRate) * Math.max(0, Math.abs(state.yawRate) - yawCeiling);
    moment -= inertia * excessYaw * (drifting ? 5 : 9);
    if (drifting) {
      // Intentional, bounded arcade rotation aid. Player chooses turn direction.
      moment += clamp(inertia * (intendedYaw - state.yawRate) * 4, -140, 140);
    }
    if (boosting) fx += mass * (2.2 + state.maneuvers.boostTier * 0.4) * governor * throttle;
  }
  const ax = fx / mass, ay = fy / mass;
  let vx = state.vx + (ax * sin + ay * cos) * dt;
  let vz = state.vz + (ax * cos - ay * sin) * dt;
  let yawRate = state.yawRate + moment / inertia * dt;
  // Static rest constraint, shared by both presets.
  if (Math.hypot(vx, vz) < 0.04 && throttle < 0.01 && Math.abs(yawRate) < 0.04) { vx = vz = yawRate = 0; }
  const heading = state.heading + yawRate * dt;
  const next: State = {
    x: state.x + vx * dt, z: state.z + vz * dt, vx, vz, heading, yawRate,
    speed: Math.hypot(vx, vz), elapsed: state.elapsed + dt, steering, throttle, brake,
    ax: state.ax + (ax - state.ax) * (1 - Math.exp(-dt / 0.06)),
    ay: state.ay + (ay - state.ay) * (1 - Math.exp(-dt / 0.06)),
    telemetry: emptyTelemetry(),
    maneuvers: state.maneuvers,
  };
  const frontSlip = (Math.abs(wheels[0].slipAngle) + Math.abs(wheels[1].slipAngle)) / 2;
  const rearSlip = (Math.abs(wheels[2].slipAngle) + Math.abs(wheels[3].slipAngle)) / 2;
  const sideslip = Math.atan2(v, Math.max(Math.abs(u), 0.5));
  next.telemetry = { wheels, longitudinalG: ax / GRAVITY, lateralG: ay / GRAVITY,
    frontSlip, rearSlip, sideslip, handling: handling(frontSlip, rearSlip, sideslip, next.speed) };
  if (environment.walls) {
    const boundary = nearest(next), limit = WIDTH / 2 + 8;
    if (boundary.distance > limit) {
      const nx = (next.x - boundary.position.x) / boundary.distance, nz = (next.z - boundary.position.z) / boundary.distance;
      next.x = boundary.position.x + nx * limit; next.z = boundary.position.z + nz * limit;
      const outgoing = next.vx * nx + next.vz * nz;
      if (outgoing > 0) {
        next.vx -= outgoing * 1.12 * nx; next.vz -= outgoing * 1.12 * nz;
        next.yawRate *= 0.65;
        next.maneuvers = cancelManeuver(next.maneuvers);
      }
      next.speed = Math.hypot(next.vx, next.vz);
    }
  }
  return next;
}
export function step(state: State, input: Input, dt = STEP, config: KartConfig = RENTAL_KART, environment: Environment = CIRCUIT): State {
  if (!Number.isFinite(dt) || dt <= 0 || dt > 0.1) throw new RangeError('Physics dt must be in (0, 0.1].');
  const count = Math.ceil(dt / (STEP / 4));
  const sin = Math.sin(state.heading), cos = Math.cos(state.heading);
  const onRoad = wheelPositions(config).every(p => environment.surfaceAt({
    x: state.x + p.forward * sin + p.left * cos, z: state.z + p.forward * cos - p.left * sin,
  }) === 'asphalt');
  let next = { ...state, maneuvers: advanceManeuvers(state.maneuvers, {
    enabled: config.drivingAssists, held: !!input.drift, steer: input.steer,
    throttle: input.throttle, brake: input.brake, speed: state.speed,
    slip: state.telemetry.sideslip, yaw: state.yawRate, onRoad,
  }, dt) };
  for (let i = 0; i < count; i++) next = integrate(next, input, dt / count, config, environment);
  if (next.telemetry.wheels.some(w => w.surface !== 'asphalt')) next.maneuvers = cancelManeuver(next.maneuvers);
  return next;
}
