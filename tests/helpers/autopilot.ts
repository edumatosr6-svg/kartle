// Deterministic controllers and session helpers for the lap tests (test strategy, "Fixtures").
// Derived from scripts/keyboard-lap.ts: binary inputs decided at 10 Hz with a simple look-ahead.
import { ARCADE_KART, initialState, nearest, STEP, step, track, type Input, type KartConfig, type State } from '../../src/physics';
import { startLap, stepLap, type LapKind, type LapSession } from '../../src/lap';
import { COUNTDOWN_STEPS } from '../../src/lapTiming';
import type { TrackReading } from '../../src/trackData';
import { centerlinePoint, segment, SEGMENTS } from './geometry';

export const IDLE: Input = { throttle: 0, brake: 0, steer: 0 };
export const DRIVE_OUT: Input = { throttle: 1, brake: 0, steer: 0 };
export const TICKS_PER_DECISION = 12;

export type Controller = (lap: LapSession) => Input;
export type OffsetFn = (index: number) => number;

// Lateral offset in metres from the centerline, positive to the left of travel; constant or per arc index.
export function autopilot(offsetM: number | OffsetFn = 0, config: KartConfig = ARCADE_KART): Controller {
  const offset: OffsetFn = typeof offsetM === 'number' ? () => offsetM : offsetM;
  let input: Input = { ...DRIVE_OUT };
  let tick = 0;
  return (lap) => {
    const state = lap.kart;
    if (tick % TICKS_PER_DECISION === 0) {
      const location = nearest(state);
      const ahead = Math.max(3, Math.round(state.speed * 0.5));
      const targetIndex = (location.index + ahead) % SEGMENTS;
      const target = centerlinePoint(targetIndex, 0, offset(targetIndex));
      const a = track[(location.index + 3) % SEGMENTS];
      const b = track[(location.index + 7) % SEGMENTS];
      const c = track[(location.index + 11) % SEGMENTS];
      const curvature = 2 * Math.abs((b.x - a.x) * (c.z - b.z) - (b.z - a.z) * (c.x - b.x))
        / (Math.hypot(b.x - a.x, b.z - a.z) * Math.hypot(c.x - b.x, c.z - b.z) * Math.hypot(c.x - a.x, c.z - a.z));
      const targetSpeed = Math.min(config.governorSpeed - 10, Math.sqrt(6 / Math.max(curvature, 0.001)));
      const desired = Math.atan2(target.x - state.x, target.z - state.z);
      const error = Math.atan2(Math.sin(desired - state.heading), Math.cos(desired - state.heading));
      input = {
        throttle: state.speed < targetSpeed ? 1 : 0,
        brake: state.speed > targetSpeed + 1 ? 1 : 0,
        steer: Math.abs(error) > 0.07 ? -Math.sign(error) : 0,
      };
    }
    tick++;
    return input;
  };
}

export function constant(input: Input): Controller { return () => input; }

// Replays a recorded per-step Input sequence; IDLE once the sequence is exhausted.
export function replay(inputs: readonly Input[]): Controller {
  let i = 0;
  return () => inputs[i++] ?? IDLE;
}

export function startSession(reading: TrackReading, lapKind: LapKind = 'OFFICIAL', config: KartConfig = ARCADE_KART, challengeNumber?: number): LapSession {
  if (reading.trackDataStatus !== 'COMPLETE' && reading.trackDataStatus !== 'INCOMPLETE') throw new Error(`fixture reading is ${reading.trackDataStatus}`);
  const r = startLap(undefined, { lapKind, trackId: reading.trackId, trackVersion: reading.trackVersion, ...(challengeNumber !== undefined ? { challengeNumber } : {}) }, reading, config);
  if (!r.ok) throw new Error(`startLap rejected the fixture: ${r.code}`);
  return r.lap;
}

// Runs the whole countdown; the lap is RUNNING afterwards with stepCount 0.
export function runCountdown(lap: LapSession, input: Input = IDLE): LapSession {
  for (let i = 0; i < COUNTDOWN_STEPS; i++) lap = stepLap(lap, input);
  return lap;
}

export type StepHook = (before: LapSession, after: LapSession, input: Input) => void;

// Advances `steps` RUNNING steps (or until the lap ends) and records every input applied.
export function drive(lap: LapSession, controller: Controller, steps: number, hook?: StepHook): { lap: LapSession; inputs: Input[] } {
  const inputs: Input[] = [];
  for (let i = 0; i < steps && lap.phase !== 'ENDED'; i++) {
    const input = controller(lap);
    const next = stepLap(lap, input);
    inputs.push(input);
    hook?.(lap, next, input);
    lap = next;
  }
  return { lap, inputs };
}

export const MAX_LAP_STEPS = 6000;

// Countdown plus a full lap under the controller: the usual "complete lap" fixture.
export function completeLap(reading: TrackReading, lapKind: LapKind = 'OFFICIAL', controller: Controller = autopilot(), hook?: StepHook) {
  const started = runCountdown(startSession(reading, lapKind));
  return drive(started, controller, MAX_LAP_STEPS, hook);
}

// A copy of the session at a chosen instant: the kart moved or a counter changed (a seeded state).
export function seedLap(lap: LapSession, patch: Partial<Omit<LapSession, 'kart'>> & { kart?: Partial<State> }): LapSession {
  const { kart, ...rest } = patch;
  return { ...lap, ...rest, kart: kart ? { ...lap.kart, ...kart } : lap.kart };
}

// A kart at rest on the centerline at `index + fraction`, shifted `lateralM` left, facing travel or the reverse.
export function kartAt(index: number, fraction = 0, lateralM = 0, reverse = false): State {
  const p = centerlinePoint(index, fraction, lateralM);
  const heading = segment(index).tangentRad + (reverse ? Math.PI : 0);
  return { ...initialState(), x: p.x, z: p.z, heading };
}

// Raw physics advance for comparisons that bypass the lap (grass versus asphalt).
export function advance(state: State, input: Input, steps: number, config: KartConfig, environment: Parameters<typeof step>[4]): State {
  for (let i = 0; i < steps; i++) state = step(state, input, STEP, config, environment);
  return state;
}
