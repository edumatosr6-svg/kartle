export type Point = { x: number; z: number };
export const WIDTH = 11;
export const track: Point[] = Array.from({ length: 240 }, (_, i) => {
  const t = i / 240 * Math.PI * 2;
  return { x: 65 * Math.cos(t) + 10 * Math.cos(3 * t), z: 43 * Math.sin(t) + 9 * Math.sin(2 * t) };
});
export function nearest(point: Point) {
  let distance = Infinity, index = 0, position = track[0];
  for (let i = 0; i < track.length; i++) {
    const a = track[i], b = track[(i + 1) % track.length];
    const dx = b.x - a.x, dz = b.z - a.z;
    const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.z - a.z) * dz) / (dx * dx + dz * dz)));
    const candidate = { x: a.x + t * dx, z: a.z + t * dz };
    const d = Math.hypot(point.x - candidate.x, point.z - candidate.z);
    if (d < distance) { distance = d; index = i; position = candidate; }
  }
  return { distance, index, position };
}
// A line of the track file: the track sense crosses it from the right side to the left side of from->to.
export type Line = { fromXM: number; fromZM: number; toXM: number; toZM: number };
export type CrossSense = 'FORWARD' | 'REVERSE';
export function sideOf(line: Line, point: Point): number {
  const dx = line.toXM - line.fromXM, dz = line.toZM - line.fromZM;
  return dz * (point.x - line.fromXM) - dx * (point.z - line.fromZM);
}
// Fraction is in (0, 1]: exactly 1 when the displacement ends on the line (coincides with the step).
export function crossLine(line: Line, from: Point, to: Point): { sense: CrossSense; fraction: number } | null {
  const a = sideOf(line, from), b = sideOf(line, to);
  let sense: CrossSense;
  if (a < 0 && b >= 0) sense = 'FORWARD';
  else if (a > 0 && b <= 0) sense = 'REVERSE';
  else return null;
  const fraction = Math.abs(a) / Math.abs(b - a);
  const px = from.x + (to.x - from.x) * fraction, pz = from.z + (to.z - from.z) * fraction;
  const dx = line.toXM - line.fromXM, dz = line.toZM - line.fromZM;
  const u = ((px - line.fromXM) * dx + (pz - line.fromZM) * dz) / (dx * dx + dz * dz);
  if (u < 0 || u > 1) return null;
  return { sense, fraction };
}
// Track file of the synthetic track, schema version 2 (DM-0001). Literals rounded to 0.001 m:
// a published trackVersion is immutable; a changed line is a new trackVersion with this one kept.
export const SYNTHETIC_TRACK_FILE = {
  schemaVersion: 2,
  trackId: 'synthetic',
  trackVersion: 2,
  direction: 'CLOCKWISE',
  startPosition: { xM: 75, zM: 0, headingDeg: -1.905 },
  finishLine: { fromXM: 88.556, fromZM: -12.306, toXM: 58.858, toZM: -3.417 },
  sectorLimits: [
    { fromXM: -0.84, fromZM: 59.463, toXM: 9.188, toZM: 30.129 },
    { fromXM: -90.449, fromZM: -1.253, toXM: -59.551, toZM: 1.253 },
    { fromXM: -0.84, fromZM: -59.463, toXM: 9.188, toZM: -30.129 },
  ],
  markers: [
    { fromXM: 52.479, fromZM: 42.524, toXM: 43.33, toZM: 27.023 },
    { fromXM: -39.919, fromZM: 30.833, toXM: -32.375, toZM: 14.49 },
    { fromXM: -39.919, fromZM: -30.833, toXM: -32.375, toZM: -14.49 },
    { fromXM: 52.479, fromZM: -42.524, toXM: 43.33, toZM: -27.023 },
  ],
} as const;
// Preliminary lap validation, independent of the vehicle model.
export class LapTracker {
  nextGate = 1;
  update(index: number): boolean {
    const target = this.nextGate * 10;
    if (this.nextGate < 24 && index >= target && index <= target + 4) this.nextGate++;
    if (this.nextGate === 24 && index < 4) { this.nextGate = 1; return true; }
    return false;
  }
}
