// Simulation layer: the lap state machine over the unchanged physics step (DES-0001, DES-0003, DES-0004,
// DES-0005, DM-0002, ADR-0002). Pure functions over an immutable LapSession; rejections are values.
import { CIRCUIT, initialState, STEP, step, type Environment, type Input, type KartConfig, type State } from './physics';
import { crossLine, nearest, track, WIDTH, type Line, type Point } from './track';
import { DEFAULT_CUT_DISTANCE_M, DEFAULT_CUT_DURATION_MS, type TrackReading, type TrackVersion } from './trackData';
import { COUNTDOWN_MS, COUNTDOWN_STEPS, interpolateMs, isCutExceeded, toMs } from './lapTiming';

export type LapKind = 'OFFICIAL' | 'RECON' | 'TRAINING';
export type LapPhase = 'COUNTDOWN' | 'RUNNING' | 'PAUSED' | 'ENDED';
export type ResumePhase = 'COUNTDOWN' | 'RUNNING';
export type PauseCause = 'ESC_KEY' | 'FOCUS_LOST' | 'SENSOR_LOST';
export type LapValidity = 'VALID' | 'INVALID';
export type InvalidReason = 'MISSED_MARKER' | 'CUT' | 'REPOSITION';
export type TrackStatus = 'COMPLETE' | 'INCOMPLETE';

export type LapLines = {
  finishLine?: Line;
  sectorLimits: readonly Line[];
  markers: readonly Line[];
  cutDistanceM: number;
  cutDurationMs: number;
};
export type LapRequest = { lapKind: LapKind; trackId: string; trackVersion: TrackVersion; challengeNumber?: number };

export type LapSession = {
  lapKind: LapKind;
  trackId: string;
  trackVersion: TrackVersion;
  challengeNumber?: number;
  trackStatus: TrackStatus;
  lines: LapLines;
  config: Readonly<KartConfig>;
  environment: Environment;
  phase: LapPhase;
  resumePhase?: ResumePhase;
  pauseCause?: PauseCause;
  validity: LapValidity;
  invalidReason?: InvalidReason;
  countdownSteps: number;
  stepCount: number;
  markersPassedCount: number;
  sectorBoundsMs: readonly number[];
  offTrackSteps: number;
  kart: State;
  result?: LapResult;
};

export type LapResult = {
  trackId: string;
  trackVersion: TrackVersion;
  challengeNumber?: number;
  lapKind: LapKind;
  lapValidity: LapValidity;
  invalidReason?: InvalidReason;
  official: boolean;
  lapMs?: number;
  sectorMs?: number[];
};

export type LapStateView = {
  lapPhase: LapPhase;
  resumePhase?: ResumePhase;
  pauseCause?: PauseCause;
  lapKind: LapKind;
  lapValidity: LapValidity;
  invalidReason?: InvalidReason;
  countdownRemainingMs: number;
  elapsedMs: number;
  stepCount: number;
  completedSectorMs: number[];
  markersPassedCount: number;
  trackId: string;
  trackVersion: TrackVersion;
};

export type StartLapRejection = 'LAP_ALREADY_ACTIVE' | 'TRACK_DATA_UNREADABLE' | 'TRACK_SCHEMA_UNSUPPORTED' | 'OFFICIAL_NOT_AVAILABLE';
export type PauseLapRejection = 'NO_ACTIVE_LAP' | 'LAP_ENDED' | 'ALREADY_PAUSED';
export type ResumeLapRejection = 'NO_ACTIVE_LAP' | 'LAP_ENDED' | 'NOT_PAUSED';
export type RepositionRejection = 'NO_ACTIVE_LAP' | 'LAP_ENDED' | 'NOT_RUNNING';
export type LapCommandResult<R extends string> = { ok: true; lap: LapSession } | { ok: false; code: R };

const reject = <R extends string>(code: R): LapCommandResult<R> => ({ ok: false, code });
const accept = <R extends string>(lap: LapSession): LapCommandResult<R> => ({ ok: true, lap });

// Each absent limit uses its own default, independently (REQ-FEAT-0008-04).
export function resolveCutLimits(reading: { cutDistanceM?: number; cutDurationMs?: number }): { distanceM: number; durationMs: number } {
  return {
    distanceM: reading.cutDistanceM !== undefined && Number.isFinite(reading.cutDistanceM) && reading.cutDistanceM > 0
      ? reading.cutDistanceM : DEFAULT_CUT_DISTANCE_M,
    durationMs: Number.isInteger(reading.cutDurationMs) && (reading.cutDurationMs as number) > 0
      ? (reading.cutDurationMs as number) : DEFAULT_CUT_DURATION_MS,
  };
}

export function startLap(
  current: LapSession | undefined, request: LapRequest, reading: TrackReading, config: KartConfig, environment: Environment = CIRCUIT,
): LapCommandResult<StartLapRejection> {
  if (current && current.phase !== 'ENDED') return reject('LAP_ALREADY_ACTIVE');
  if (reading.trackDataStatus === 'UNREADABLE') return reject('TRACK_DATA_UNREADABLE');
  if (reading.trackDataStatus === 'UNSUPPORTED_SCHEMA') return reject('TRACK_SCHEMA_UNSUPPORTED');
  // The data the request names must be the data that was read; no new code is created for a mismatch.
  if (request.trackId !== reading.trackId || request.trackVersion !== reading.trackVersion) return reject('TRACK_DATA_UNREADABLE');
  if (request.lapKind === 'OFFICIAL' && reading.trackDataStatus === 'INCOMPLETE') return reject('OFFICIAL_NOT_AVAILABLE');

  const cut = resolveCutLimits(reading);
  const lines: LapLines = reading.trackDataStatus === 'COMPLETE'
    ? { finishLine: reading.finishLine, sectorLimits: reading.sectorLimits, markers: reading.markers, cutDistanceM: cut.distanceM, cutDurationMs: cut.durationMs }
    : { sectorLimits: [], markers: [], cutDistanceM: cut.distanceM, cutDurationMs: cut.durationMs };
  const start = reading.startPosition;
  const kart: State = start
    ? { ...initialState(), x: start.xM, z: start.zM, heading: start.headingDeg * Math.PI / 180 }
    : initialState();
  const lap: LapSession = {
    lapKind: request.lapKind,
    trackId: reading.trackId,
    trackVersion: reading.trackVersion,
    ...(request.challengeNumber !== undefined ? { challengeNumber: request.challengeNumber } : {}),
    trackStatus: reading.trackDataStatus,
    lines,
    config: Object.freeze({ ...config }),
    environment,
    phase: 'COUNTDOWN',
    validity: 'VALID',
    countdownSteps: 0,
    stepCount: 0,
    markersPassedCount: 0,
    sectorBoundsMs: [],
    offTrackSteps: 0,
    kart,
  };
  return accept(lap);
}

export function pauseLap(lap: LapSession | undefined, cause: PauseCause): LapCommandResult<PauseLapRejection> {
  if (!lap) return reject('NO_ACTIVE_LAP');
  if (lap.phase === 'ENDED') return reject('LAP_ENDED');
  if (lap.phase === 'PAUSED') return reject('ALREADY_PAUSED');
  return accept({ ...lap, phase: 'PAUSED', resumePhase: lap.phase, pauseCause: cause });
}

export function resumeLap(lap: LapSession | undefined): LapCommandResult<ResumeLapRejection> {
  if (!lap) return reject('NO_ACTIVE_LAP');
  if (lap.phase === 'ENDED') return reject('LAP_ENDED');
  if (lap.phase !== 'PAUSED') return reject('NOT_PAUSED');
  const { resumePhase, pauseCause: _cause, ...rest } = lap;
  return accept({ ...rest, phase: resumePhase ?? 'RUNNING' });
}

export function repositionKart(lap: LapSession | undefined): LapCommandResult<RepositionRejection> {
  if (!lap) return reject('NO_ACTIVE_LAP');
  if (lap.phase === 'ENDED') return reject('LAP_ENDED');
  if (lap.phase !== 'RUNNING') return reject('NOT_RUNNING');
  if (lap.lapKind === 'OFFICIAL') return accept(invalidate(lap, 'REPOSITION'));
  // Destination (ADR-0004): nearest centerline point, heading along the centerline in travel sense, speed 0.
  const from: Point = { x: lap.kart.x, z: lap.kart.z };
  const near = nearest(from);
  const a = track[near.index], b = track[(near.index + 1) % track.length];
  const kart: State = {
    ...initialState(), x: near.position.x, z: near.position.z,
    heading: Math.atan2(b.x - a.x, b.z - a.z), elapsed: lap.kart.elapsed,
  };
  const moved: LapSession = { ...lap, kart, offTrackSteps: 0 };
  // Every displacement of the kart is evaluated for line crossings, this one at the instant of the request.
  return accept(evaluateDisplacement(moved, from, near.position, () => toMs(lap.stepCount)));
}

export function stepLap(lap: LapSession, input: Input): LapSession {
  if (lap.phase === 'COUNTDOWN') {
    const countdownSteps = lap.countdownSteps + 1;
    if (countdownSteps >= COUNTDOWN_STEPS) return { ...lap, countdownSteps: COUNTDOWN_STEPS, phase: 'RUNNING', stepCount: 0 };
    return { ...lap, countdownSteps };
  }
  if (lap.phase !== 'RUNNING') return lap;
  const k = lap.stepCount;
  const next = step(lap.kart, input, STEP, lap.config, lap.environment);
  const advanced: LapSession = { ...lap, kart: next, stepCount: k + 1 };
  const crossed = evaluateDisplacement(advanced, lap.kart, next, fraction => interpolateMs(k, fraction));
  return crossed.phase === 'RUNNING' ? evaluateCut(crossed, next) : crossed;
}

export function getLapState(lap: LapSession | undefined): LapStateView | { code: 'NO_ACTIVE_LAP' } {
  if (!lap) return { code: 'NO_ACTIVE_LAP' };
  const ended = lap.phase === 'ENDED' && lap.result;
  const completedSectorMs = ended && lap.result?.sectorMs
    ? [...lap.result.sectorMs]
    : lap.sectorBoundsMs.map((b, i) => b - (i === 0 ? 0 : lap.sectorBoundsMs[i - 1]));
  const elapsedMs = ended && lap.result?.lapMs !== undefined ? lap.result.lapMs : toMs(lap.stepCount);
  return {
    lapPhase: lap.phase,
    ...(lap.resumePhase !== undefined ? { resumePhase: lap.resumePhase } : {}),
    ...(lap.pauseCause !== undefined ? { pauseCause: lap.pauseCause } : {}),
    lapKind: lap.lapKind,
    lapValidity: lap.validity,
    ...(lap.invalidReason !== undefined ? { invalidReason: lap.invalidReason } : {}),
    countdownRemainingMs: COUNTDOWN_MS - toMs(lap.countdownSteps),
    elapsedMs,
    stepCount: lap.stepCount,
    completedSectorMs,
    markersPassedCount: lap.markersPassedCount,
    trackId: lap.trackId,
    trackVersion: lap.trackVersion,
  };
}

export function getLapResult(lap: LapSession | undefined): LapResult | { code: 'NO_RESULT' } {
  if (!lap || lap.phase !== 'ENDED' || !lap.result) return { code: 'NO_RESULT' };
  return lap.result;
}

// COMPLETE offers TRAINING plus whatever the daily challenge defines; INCOMPLETE offers TRAINING only.
export function offeredLapKinds(reading: TrackReading, challengeKinds: readonly LapKind[] = []): LapKind[] {
  if (reading.trackDataStatus === 'COMPLETE') return [...new Set<LapKind>(['TRAINING', ...challengeKinds])];
  if (reading.trackDataStatus === 'INCOMPLETE') return ['TRAINING'];
  return [];
}

// Distance of the kart centre beyond the track edge, in metres; 0 on the track.
export function edgeDistanceM(point: Point): number {
  return Math.max(0, nearest(point).distance - WIDTH / 2);
}

// Marker, then sector limit, then finish, for one displacement from `from` to `to` (DES-0003).
function evaluateDisplacement(session: LapSession, from: Point, to: Point, instantMsAt: (fraction: number) => number): LapSession {
  let s = session;
  const nextMarker = s.lines.markers[s.markersPassedCount];
  if (nextMarker) {
    const c = crossLine(nextMarker, from, to);
    if (c && c.sense === 'FORWARD') s = { ...s, markersPassedCount: s.markersPassedCount + 1 };
  }
  const nextLimit = s.lines.sectorLimits[s.sectorBoundsMs.length];
  if (nextLimit) {
    const c = crossLine(nextLimit, from, to);
    if (c && c.sense === 'FORWARD') s = { ...s, sectorBoundsMs: [...s.sectorBoundsMs, instantMsAt(c.fraction)] };
  }
  if (s.lines.finishLine) {
    const c = crossLine(s.lines.finishLine, from, to);
    if (c && c.sense === 'FORWARD') {
      s = s.markersPassedCount === s.lines.markers.length ? complete(s, instantMsAt(c.fraction)) : invalidate(s, 'MISSED_MARKER');
    }
  }
  return s;
}

// Cut accumulator after the line crossings of a RUNNING step (DES-0004); strict comparisons, integer time.
function evaluateCut(session: LapSession, kart: Point): LapSession {
  if (edgeDistanceM(kart) <= session.lines.cutDistanceM) {
    return session.offTrackSteps === 0 ? session : { ...session, offTrackSteps: 0 };
  }
  const offTrackSteps = session.offTrackSteps + 1;
  if (!isCutExceeded(offTrackSteps, session.lines.cutDurationMs)) return { ...session, offTrackSteps };
  return invalidate({ ...session, offTrackSteps }, 'CUT');
}

function complete(session: LapSession, finishMs: number): LapSession {
  const ended: LapSession = { ...session, phase: 'ENDED', validity: 'VALID' };
  return { ...ended, result: buildResult(ended, finishMs) };
}

function invalidate(session: LapSession, reason: InvalidReason): LapSession {
  const ended: LapSession = { ...session, phase: 'ENDED', validity: 'INVALID', invalidReason: reason };
  return { ...ended, result: buildResult(ended) };
}

// The single LapResult of a lap (DM-0002): official only with OFFICIAL, VALID and COMPLETE data.
function buildResult(session: LapSession, finishMs?: number): LapResult {
  const valid = session.validity === 'VALID';
  const result: LapResult = {
    trackId: session.trackId,
    trackVersion: session.trackVersion,
    ...(session.challengeNumber !== undefined ? { challengeNumber: session.challengeNumber } : {}),
    lapKind: session.lapKind,
    lapValidity: session.validity,
    ...(!valid && session.invalidReason !== undefined ? { invalidReason: session.invalidReason } : {}),
    official: session.lapKind === 'OFFICIAL' && valid && session.trackStatus === 'COMPLETE',
  };
  if (valid && finishMs !== undefined) {
    const bounds = [0, ...session.sectorBoundsMs, finishMs];
    result.lapMs = finishMs;
    result.sectorMs = bounds.slice(1).map((b, i) => b - bounds[i]);
  }
  return result;
}
