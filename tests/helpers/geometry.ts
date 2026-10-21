// Centerline geometry of the synthetic track for the tests' own oracles. Uses only src/track.ts.
import { crossLine, nearest, track, WIDTH, type Line, type Point } from '../../src/track';

export const SEGMENTS = track.length;

export function segment(index: number): { a: Point; b: Point; length: number; tangentRad: number; left: Point } {
  const a = track[((index % SEGMENTS) + SEGMENTS) % SEGMENTS];
  const b = track[(((index + 1) % SEGMENTS) + SEGMENTS) % SEGMENTS];
  const dx = b.x - a.x, dz = b.z - a.z, length = Math.hypot(dx, dz);
  // Heading convention of src/physics.ts: forward = (sin h, cos h), left = (cos h, -sin h).
  return { a, b, length, tangentRad: Math.atan2(dx, dz), left: { x: dz / length, z: -dx / length } };
}

// Point on the centerline at `index + fraction` segments, shifted `lateralM` to the left of travel.
export function centerlinePoint(index: number, fraction = 0, lateralM = 0): Point {
  const s = segment(index);
  return {
    x: s.a.x + (s.b.x - s.a.x) * fraction + s.left.x * lateralM,
    z: s.a.z + (s.b.z - s.a.z) * fraction + s.left.z * lateralM,
  };
}

export type CenterlineCrossing = { index: number; fraction: number; point: Point; forward: boolean };

// Where the closed centerline, walked in index order, crosses a line of the track file.
export function centerlineCrossings(line: Line): CenterlineCrossing[] {
  const out: CenterlineCrossing[] = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const s = segment(i);
    const c = crossLine(line, s.a, s.b);
    if (c) out.push({ index: i, fraction: c.fraction, point: centerlinePoint(i, c.fraction), forward: c.sense === 'FORWARD' });
  }
  return out;
}

export function singleCrossing(line: Line): CenterlineCrossing {
  const crossings = centerlineCrossings(line);
  if (crossings.length !== 1) throw new Error(`fixture line crosses the centerline ${crossings.length} times`);
  return crossings[0];
}

// A line perpendicular to the centerline at `index + fraction`, reaching `reachM` to each side; the track
// sense crosses it FORWARD (from the right side to the left side of from -> to).
export function perpendicularLine(index: number, fraction: number, reachM: number, leftFromM = -reachM, leftToM = reachM): Line {
  const from = centerlinePoint(index, fraction, leftFromM);
  const to = centerlinePoint(index, fraction, leftToM);
  const s = segment(index);
  const c = crossLine({ fromXM: from.x, fromZM: from.z, toXM: to.x, toZM: to.z }, s.a, s.b);
  const forward = c?.sense === 'FORWARD';
  return forward
    ? { fromXM: from.x, fromZM: from.z, toXM: to.x, toZM: to.z }
    : { fromXM: to.x, fromZM: to.z, toXM: from.x, toZM: from.z };
}

// Distance of a point beyond the track edge, in metres; 0 on the track.
export function beyondEdgeM(point: Point): number {
  return Math.max(0, nearest(point).distance - WIDTH / 2);
}

export function arcIndexOf(point: Point): number {
  return nearest(point).index;
}
