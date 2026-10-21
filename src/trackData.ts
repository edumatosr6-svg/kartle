// Track-data layer: reads and classifies a versioned track file (DM-0001, DES-0006).
// Pure: no DOM, no clock, no random; imports only src/track.ts.
import { crossLine, nearest, track, WIDTH, type Line, type Point } from './track';

export const TRACK_SCHEMA_VERSION = 2;
export const DEFAULT_CUT_DISTANCE_M = 3;
export const DEFAULT_CUT_DURATION_MS = 1000;
export const BARRIER_REACH_M = WIDTH / 2 + 9;
const MIN_LINE_LENGTH_M = 1;
const MIN_LINE_SPACING_M = 2;

export type TrackDirection = 'CLOCKWISE' | 'COUNTER_CLOCKWISE';
export type StartPosition = { xM: number; zM: number; headingDeg: number };
export type TrackVersion = string | number;
export type TrackDataStatus = 'COMPLETE' | 'INCOMPLETE' | 'UNSUPPORTED_SCHEMA' | 'UNREADABLE';
export type DeclaredTrack = {
  direction?: TrackDirection;
  startPosition?: StartPosition;
  finishLine?: Line;
  sectorLimits?: Line[];
  markers?: Line[];
  cutDistanceM?: number;
  cutDurationMs?: number;
};
export type CompleteTrack = Required<Pick<DeclaredTrack, 'direction' | 'startPosition' | 'finishLine' | 'sectorLimits' | 'markers'>>
  & Pick<DeclaredTrack, 'cutDistanceM' | 'cutDurationMs'>;
export type TrackReading =
  | ({ trackDataStatus: 'COMPLETE'; trackId: string; trackVersion: TrackVersion } & CompleteTrack)
  | ({ trackDataStatus: 'INCOMPLETE'; trackId: string; trackVersion: TrackVersion } & DeclaredTrack)
  | { trackDataStatus: 'UNSUPPORTED_SCHEMA'; schemaVersion: number }
  | { trackDataStatus: 'UNREADABLE' };
export type TrackDataSource = string | object | null | undefined;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isFinite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isPositiveInteger = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 1;

function readLine(v: unknown): Line | undefined {
  if (!isRecord(v)) return undefined;
  const { fromXM, fromZM, toXM, toZM } = v;
  if (!isFinite(fromXM) || !isFinite(fromZM) || !isFinite(toXM) || !isFinite(toZM)) return undefined;
  if (Math.hypot(toXM - fromXM, toZM - fromZM) < MIN_LINE_LENGTH_M) return undefined;
  return { fromXM, fromZM, toXM, toZM };
}
function readLines(v: unknown, exactly?: number): Line[] | undefined {
  if (!Array.isArray(v)) return undefined;
  if (exactly !== undefined ? v.length !== exactly : v.length < 1) return undefined;
  const lines = v.map(readLine);
  return lines.every((l): l is Line => l !== undefined) ? lines : undefined;
}
const sameLine = (a: Line, b: Line) => a.fromXM === b.fromXM && a.fromZM === b.fromZM && a.toXM === b.toXM && a.toZM === b.toZM;

function readDeclared(file: Record<string, unknown>): { declared: DeclaredTrack; wellFormed: boolean } {
  const declared: DeclaredTrack = {};
  let wellFormed = true;
  const miss = () => { wellFormed = false; };

  if (file.direction === 'CLOCKWISE' || file.direction === 'COUNTER_CLOCKWISE') declared.direction = file.direction;
  else miss();
  const start = file.startPosition;
  if (isRecord(start) && isFinite(start.xM) && isFinite(start.zM) && isFinite(start.headingDeg)) {
    declared.startPosition = { xM: start.xM, zM: start.zM, headingDeg: start.headingDeg };
  } else miss();
  const finish = readLine(file.finishLine);
  if (finish) declared.finishLine = finish; else miss();
  const limits = readLines(file.sectorLimits, 3);
  if (limits) declared.sectorLimits = limits; else miss();
  const markers = readLines(file.markers);
  if (markers && !(limits && markers.some(m => limits.some(l => sameLine(m, l))))) declared.markers = markers;
  else miss();
  if (file.cutDistanceM !== undefined) {
    if (isFinite(file.cutDistanceM) && file.cutDistanceM > 0) declared.cutDistanceM = file.cutDistanceM; else miss();
  }
  if (file.cutDurationMs !== undefined) {
    if (isPositiveInteger(file.cutDurationMs)) declared.cutDurationMs = file.cutDurationMs; else miss();
  }
  return { declared, wellFormed };
}

// Classification order 1 to 7 of DM-0001, followed literally. Never throws, never mutates `source`.
export function readTrackData(source: TrackDataSource): TrackReading {
  let file: unknown = source;
  if (typeof source === 'string') {
    try { file = JSON.parse(source); } catch { return { trackDataStatus: 'UNREADABLE' }; }
  }
  if (!isRecord(file)) return { trackDataStatus: 'UNREADABLE' };
  const schemaVersion = file.schemaVersion;
  if (!isPositiveInteger(schemaVersion)) return { trackDataStatus: 'UNREADABLE' };
  if (schemaVersion > TRACK_SCHEMA_VERSION) return { trackDataStatus: 'UNSUPPORTED_SCHEMA', schemaVersion };
  const trackId = file.trackId, trackVersion = file.trackVersion;
  if (typeof trackId !== 'string' || trackId.length === 0) return { trackDataStatus: 'UNREADABLE' };
  if (!((typeof trackVersion === 'string' && trackVersion.length > 0) || isPositiveInteger(trackVersion))) {
    return { trackDataStatus: 'UNREADABLE' };
  }
  if (schemaVersion === 1) return { trackDataStatus: 'INCOMPLETE', trackId, trackVersion };
  const { declared, wellFormed } = readDeclared(file);
  if (!wellFormed || checkConsistency(declared).length > 0) {
    return { trackDataStatus: 'INCOMPLETE', trackId, trackVersion, ...declared };
  }
  return { trackDataStatus: 'COMPLETE', trackId, trackVersion, ...(declared as CompleteTrack) };
}

// Centerline geometry shared by the checks: closed polyline in travel order (index order).
const segmentLength = (i: number) => {
  const a = track[i], b = track[(i + 1) % track.length];
  return Math.hypot(b.x - a.x, b.z - a.z);
};
const cumulative: number[] = [];
let centerlineLength = 0;
for (let i = 0; i < track.length; i++) { cumulative.push(centerlineLength); centerlineLength += segmentLength(i); }

type Crossing = { arcM: number; point: Point; forward: boolean };
function centerlineCrossings(line: Line): Crossing[] {
  const crossings: Crossing[] = [];
  for (let i = 0; i < track.length; i++) {
    const a = track[i], b = track[(i + 1) % track.length];
    const c = crossLine(line, a, b);
    if (!c) continue;
    const point = { x: a.x + (b.x - a.x) * c.fraction, z: a.z + (b.z - a.z) * c.fraction };
    crossings.push({ arcM: cumulative[i] + segmentLength(i) * c.fraction, point, forward: c.sense === 'FORWARD' });
  }
  return crossings;
}
const arcOfPoint = (p: Point) => {
  const n = nearest(p);
  return cumulative[n.index] + Math.hypot(n.position.x - track[n.index].x, n.position.z - track[n.index].z);
};
const windingSum = () => {
  let s = 0;
  for (let i = 0; i < track.length; i++) {
    const a = track[i], b = track[(i + 1) % track.length];
    s += a.x * b.z - b.x * a.z;
  }
  return s;
};

// C1 to C7 of DM-0001. Returns the identifiers of the failed checks; a check whose inputs are absent fails.
export function checkConsistency(declared: DeclaredTrack): string[] {
  const failed: string[] = [];
  const { direction, startPosition, finishLine, sectorLimits, markers } = declared;

  // C1: direction equals the winding of the centerline in index order.
  const s = windingSum();
  const winding: TrackDirection | undefined = s > 0 ? 'CLOCKWISE' : s < 0 ? 'COUNTER_CLOCKWISE' : undefined;
  if (!direction || direction !== winding) failed.push('C1');

  // C2: the closed centerline crosses each line exactly once, in the track sense.
  const named: { line: Line; barrier: boolean }[] = [];
  if (finishLine) named.push({ line: finishLine, barrier: true });
  for (const l of sectorLimits ?? []) named.push({ line: l, barrier: true });
  for (const l of markers ?? []) named.push({ line: l, barrier: false });
  const crossingOf = new Map<Line, Crossing>();
  let c2 = Boolean(finishLine && sectorLimits && markers);
  for (const { line } of named) {
    const crossings = centerlineCrossings(line);
    if (crossings.length === 1 && crossings[0].forward) crossingOf.set(line, crossings[0]);
    else c2 = false;
  }
  if (!c2) failed.push('C2');

  // C3: start within WIDTH / 2 of the centerline, heading within 90 degrees of the travel tangent.
  let startArc: number | undefined;
  if (startPosition) {
    const p = { x: startPosition.xM, z: startPosition.zM };
    const n = nearest(p);
    const a = track[n.index], b = track[(n.index + 1) % track.length];
    const tangent = Math.atan2(b.x - a.x, b.z - a.z);
    const heading = startPosition.headingDeg * Math.PI / 180;
    const diff = Math.atan2(Math.sin(heading - tangent), Math.cos(heading - tangent));
    if (n.distance <= WIDTH / 2 && Math.abs(diff) < Math.PI / 2) startArc = arcOfPoint(p);
  }
  if (startArc === undefined) failed.push('C3');

  // Arc positions measured from the start, in travel sense; only meaningful when C2 and C3 hold.
  const relative = (line: Line) => {
    const c = crossingOf.get(line);
    if (c === undefined || startArc === undefined) return undefined;
    return ((c.arcM - startArc) % centerlineLength + centerlineLength) % centerlineLength;
  };
  const markerArcs = (markers ?? []).map(relative);
  const limitArcs = (sectorLimits ?? []).map(relative);
  const finishArc = finishLine ? relative(finishLine) : undefined;
  const allKnown = finishArc !== undefined && markerArcs.every(a => a !== undefined) && limitArcs.every(a => a !== undefined)
    && markerArcs.length > 0 && limitArcs.length === 3;
  const increasing = (arcs: (number | undefined)[]) => arcs.every((a, i) => i === 0 || (a as number) > (arcs[i - 1] as number));

  // C4: markers in order, limits in order, finish after all of them.
  const c4 = allKnown && increasing(markerArcs) && increasing(limitArcs)
    && [...markerArcs, ...limitArcs].every(a => (a as number) < (finishArc as number));
  if (!c4) failed.push('C4');

  // C5: every limit has a marker before and a marker after it; the last marker precedes the finish.
  const c5 = allKnown && limitArcs.every(l => markerArcs.some(m => (m as number) < (l as number)) && markerArcs.some(m => (m as number) > (l as number)))
    && (markerArcs[markerArcs.length - 1] as number) < (finishArc as number);
  if (!c5) failed.push('C5');

  // C6: limits and finish reach at least BARRIER_REACH_M to each side of the centerline crossing.
  let c6 = Boolean(finishLine && sectorLimits);
  for (const { line, barrier } of named) {
    if (!barrier) continue;
    const c = crossingOf.get(line);
    if (!c) { c6 = false; continue; }
    const reachFrom = Math.hypot(c.point.x - line.fromXM, c.point.z - line.fromZM);
    const reachTo = Math.hypot(c.point.x - line.toXM, c.point.z - line.toZM);
    if (reachFrom < BARRIER_REACH_M || reachTo < BARRIER_REACH_M) c6 = false;
  }
  if (!c6) failed.push('C6');

  // C7: consecutive lines at least 2 m apart along the centerline; the start at least 2 m from every line.
  let c7 = allKnown;
  if (allKnown) {
    const arcs = [...markerArcs, ...limitArcs, finishArc].map(a => a as number).sort((a, b) => a - b);
    for (let i = 1; i < arcs.length; i++) if (arcs[i] - arcs[i - 1] < MIN_LINE_SPACING_M) c7 = false;
    for (const a of arcs) if (Math.min(a, centerlineLength - a) < MIN_LINE_SPACING_M) c7 = false;
  }
  if (!c7) failed.push('C7');

  return failed;
}
