// Track-file fixtures: the published synthetic file and copies derived from it, one deviation each.
// Every derived copy is a new object; the published file is never mutated (I3).
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { SYNTHETIC_TRACK_FILE, type Line } from '../../src/track';
import { readTrackData, type TrackReading } from '../../src/trackData';
import { perpendicularLine, singleCrossing, segment } from '../helpers/geometry';

export type TrackFile = {
  schemaVersion: number; trackId: string; trackVersion: string | number;
  direction?: string; startPosition?: { xM: number; zM: number; headingDeg: number };
  finishLine?: Line; sectorLimits?: Line[]; markers?: Line[]; cutDistanceM?: number; cutDurationMs?: number;
  [extra: string]: unknown;
};

const here = dirname(fileURLToPath(import.meta.url));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export function syntheticFile(): TrackFile { return clone(SYNTHETIC_TRACK_FILE) as unknown as TrackFile; }

export function syntheticReading(): TrackReading { return readTrackData(syntheticFile()); }

export function trackV1Text(): string { return readFileSync(join(here, 'track-v1.json'), 'utf8'); }

export function withoutMarkers(): TrackFile { const f = syntheticFile(); delete f.markers; return f; }

// Own cut limits; a changed line or limit is a new trackVersion with the published one kept.
export function withCutLimits(cutDistanceM: number, cutDurationMs: number): TrackFile {
  return { ...syntheticFile(), trackVersion: 3, cutDistanceM, cutDurationMs };
}

// Marker n (1-based) replaced by a short segment from -1 m to +9 m on the right of the centerline crossing.
export function withShortMarker(n: number): TrackFile {
  const f = syntheticFile();
  const c = singleCrossing(f.markers![n - 1]);
  f.markers![n - 1] = perpendicularLine(c.index, c.fraction, 9, 1, -9);
  f.trackVersion = 4;
  return f;
}

// One inconsistency per copy, named after the consistency check of DM-0001 it fails.
export function failingC1(): TrackFile { return { ...syntheticFile(), direction: 'COUNTER_CLOCKWISE' }; }
export function failingC2(): TrackFile {
  const f = syntheticFile();
  const m = f.markers![0];
  f.markers![0] = { fromXM: m.fromXM + 400, fromZM: m.fromZM + 400, toXM: m.toXM + 400, toZM: m.toZM + 400 };
  return f;
}
export function failingC3(): TrackFile {
  const f = syntheticFile();
  f.startPosition = { ...f.startPosition!, xM: f.startPosition!.xM + 40 };
  return f;
}
export function failingC4(): TrackFile {
  const f = syntheticFile();
  [f.markers![0], f.markers![1]] = [f.markers![1], f.markers![0]];
  return f;
}
export function failingC5(): TrackFile {
  const f = syntheticFile();
  f.markers = [f.markers![0]];
  return f;
}
export function failingC6(): TrackFile {
  const f = syntheticFile();
  const c = singleCrossing(f.finishLine!);
  f.finishLine = perpendicularLine(c.index, c.fraction, 5);
  return f;
}
export function failingC7(): TrackFile {
  const f = syntheticFile();
  const c = singleCrossing(f.markers![0]);
  const s = segment(c.index);
  const shift = 1 / s.length; // 1 m further along the same segment
  f.markers = [f.markers![0], perpendicularLine(c.index, c.fraction + shift, 12), ...f.markers!.slice(1)];
  return f;
}
