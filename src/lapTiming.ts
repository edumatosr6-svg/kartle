// Simulation layer: lap time as an integer step count converted to integer milliseconds (DES-0002, ADR-0001).
// STEP is 1/120 s = 25/3 ms, which is not an integer, so nothing here accumulates dt in floating point.
import { STEP } from './physics';

export const COUNTDOWN_MS = 3000;
export const COUNTDOWN_STEPS = Math.round(COUNTDOWN_MS / 1000 / STEP);

const whole = (n: number) => Math.max(0, Math.trunc(n));

// The integer millisecond nearest to steps * 25/3, in exact integer arithmetic; toMs(360) === 3000.
export function toMs(steps: number): number {
  return Math.floor((25 * whole(steps) + 1) / 3);
}

// Instant of a crossing at `fraction` of the step from k to k + 1, strictly inside (toMs(k), toMs(k + 1))
// unless the crossing coincides with the step (fraction 1), which gives toMs(k + 1).
export function interpolateMs(k: number, fraction: number): number {
  const n = whole(k);
  if (fraction >= 1) return toMs(n + 1);
  const lo = toMs(n) + 1, hi = toMs(n + 1) - 1;
  return Math.min(hi, Math.max(lo, Math.round((n + fraction) * 25 / 3)));
}

// True when offSteps of STEP exceed durationMs; 120 steps are exactly 1000 ms and do not exceed it.
export function isCutExceeded(offSteps: number, durationMs: number): boolean {
  return 25 * whole(offSteps) > 3 * whole(durationMs);
}
