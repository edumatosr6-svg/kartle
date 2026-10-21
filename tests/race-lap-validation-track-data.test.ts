// TEST-0009 — reading and classifying the versioned track file (strategy: track-data, unit, DES-0006, DM-0001).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYNTHETIC_TRACK_FILE } from '../src/track';
import { checkConsistency, DEFAULT_CUT_DISTANCE_M, DEFAULT_CUT_DURATION_MS, readTrackData, TRACK_SCHEMA_VERSION } from '../src/trackData';
import { failingC1, failingC2, failingC3, failingC4, failingC5, failingC6, failingC7, syntheticFile, trackV1Text, withCutLimits, withoutMarkers } from './fixtures/trackFiles';

test('CHK-TEST-0009-01 a track file in the previous schema version is read without error as INCOMPLETE, keeping its identity', () => {
  // NFR-0012
  const reading = readTrackData(trackV1Text());
  assert.equal(reading.trackDataStatus, 'INCOMPLETE', 'NFR-0012: a schema 1 file must read as INCOMPLETE, never as an error');
  if (reading.trackDataStatus !== 'INCOMPLETE') return;
  assert.equal(reading.trackId, 'synthetic', 'NFR-0012: trackId of the previous version must be kept');
  assert.equal(reading.trackVersion, 1, 'NFR-0012: trackVersion of the previous version must be kept');
  assert.equal(reading.markers, undefined, 'NFR-0012: a schema 1 file declares no markers');
});

test('CHK-TEST-0009-02 the declared schema version is greater than the previous one and the synthetic file carries it', () => {
  // NFR-0012
  assert.equal(TRACK_SCHEMA_VERSION, 2, 'NFR-0012: the schema version must be 2, greater than the previous 1');
  assert.equal(SYNTHETIC_TRACK_FILE.schemaVersion, TRACK_SCHEMA_VERSION, 'NFR-0012: the published synthetic file must declare the current schema version');
});

test('CHK-TEST-0009-03 a file with a later schema version is reported as UNSUPPORTED_SCHEMA and left untouched', () => {
  // NFR-0012
  const file = { ...syntheticFile(), schemaVersion: 3 };
  const snapshot = JSON.stringify(file);
  const reading = readTrackData(file);
  assert.deepEqual(reading, { trackDataStatus: 'UNSUPPORTED_SCHEMA', schemaVersion: 3 }, 'NFR-0012: schema 3 must be reported as UNSUPPORTED_SCHEMA with its version');
  assert.equal(JSON.stringify(file), snapshot, 'NFR-0012: the unsupported file must not be altered');
});

test('CHK-TEST-0009-04 corrupted or absent data is reported as UNREADABLE with no other field', () => {
  // NFR-0012
  for (const [label, source] of [['corrupted text', '{"schemaVersion": 2, "trackId": '], ['absent', undefined], ['null', null], ['empty id', { schemaVersion: 2, trackId: '', trackVersion: 1 }], ['no schema', { trackId: 'x', trackVersion: 1 }]] as const) {
    assert.deepEqual(readTrackData(source as never), { trackDataStatus: 'UNREADABLE' }, `NFR-0012: ${label} must read as UNREADABLE and nothing else`);
  }
});

test('CHK-TEST-0009-05 a file without markers is INCOMPLETE and keeps what it declares', () => {
  // AC-US-0008-03
  const reading = readTrackData(withoutMarkers());
  assert.equal(reading.trackDataStatus, 'INCOMPLETE', 'AC-US-0008-03: a file without markers must be INCOMPLETE');
  if (reading.trackDataStatus !== 'INCOMPLETE') return;
  assert.equal(reading.markers, undefined, 'AC-US-0008-03: no markers must be declared');
  assert.equal(reading.sectorLimits?.length, 3, 'AC-US-0008-03: the declared sector limits must be kept');
});

test('CHK-TEST-0009-06 a direction opposite to the winding of the centerline fails C1 and makes the data INCOMPLETE', () => {
  // AC-US-0005-03
  const reading = readTrackData(failingC1());
  assert.equal(reading.trackDataStatus, 'INCOMPLETE', 'AC-US-0005-03: a wrong direction must make the data INCOMPLETE');
  assert.deepEqual(checkConsistency(failingC1() as never), ['C1'], 'AC-US-0005-03: only C1 must fail for a wrong direction');
});

test('CHK-TEST-0009-07 a line the centerline does not cross exactly once in the track sense fails C2', () => {
  // AC-US-0005-04
  const reading = readTrackData(failingC2());
  assert.equal(reading.trackDataStatus, 'INCOMPLETE', 'AC-US-0005-04: an uncrossed marker must make the data INCOMPLETE');
  assert.ok(checkConsistency(failingC2() as never).includes('C2'), 'AC-US-0005-04: C2 must be among the failed checks');
});

test('CHK-TEST-0009-08 a start position off the track fails C3', () => {
  // AC-US-0001-06
  const reading = readTrackData(failingC3());
  assert.equal(reading.trackDataStatus, 'INCOMPLETE', 'AC-US-0001-06: a start off the track must make the data INCOMPLETE');
  assert.ok(checkConsistency(failingC3() as never).includes('C3'), 'AC-US-0001-06: C3 must be among the failed checks');
});

test('CHK-TEST-0009-09 markers declared out of their order along the track fail C4', () => {
  // AC-US-0004-02
  const reading = readTrackData(failingC4());
  assert.equal(reading.trackDataStatus, 'INCOMPLETE', 'AC-US-0004-02: markers out of order must make the data INCOMPLETE');
  assert.deepEqual(checkConsistency(failingC4() as never), ['C4'], 'AC-US-0004-02: only C4 must fail for swapped markers');
});

test('CHK-TEST-0009-10 a sector limit without a marker before and after it fails C5', () => {
  // AC-US-0004-05
  const reading = readTrackData(failingC5());
  assert.equal(reading.trackDataStatus, 'INCOMPLETE', 'AC-US-0004-05: a limit not bracketed by markers must make the data INCOMPLETE');
  assert.deepEqual(checkConsistency(failingC5() as never), ['C5'], 'AC-US-0004-05: only C5 must fail when markers do not bracket every limit');
});

test('CHK-TEST-0009-11 a finish line too short to act as a barrier fails C6', () => {
  // AC-US-0002-10
  const reading = readTrackData(failingC6());
  assert.equal(reading.trackDataStatus, 'INCOMPLETE', 'AC-US-0002-10: a short finish line must make the data INCOMPLETE');
  assert.deepEqual(checkConsistency(failingC6() as never), ['C6'], 'AC-US-0002-10: only C6 must fail for a short barrier');
});

test('CHK-TEST-0009-12 two lines closer than 2 m along the centerline fail C7', () => {
  // AC-US-0002-10
  const reading = readTrackData(failingC7());
  assert.equal(reading.trackDataStatus, 'INCOMPLETE', 'AC-US-0002-10: lines too close must make the data INCOMPLETE');
  assert.deepEqual(checkConsistency(failingC7() as never), ['C7'], 'AC-US-0002-10: only C7 must fail for lines 1 m apart');
});

test('CHK-TEST-0009-13 the published synthetic file is COMPLETE with three sector limits and markers distinct from them', () => {
  // AC-US-0002-13
  const reading = readTrackData(SYNTHETIC_TRACK_FILE);
  assert.equal(reading.trackDataStatus, 'COMPLETE', 'AC-US-0002-13: the synthetic file must be COMPLETE');
  if (reading.trackDataStatus !== 'COMPLETE') return;
  assert.equal(reading.sectorLimits.length, 3, 'AC-US-0002-13: three sector limits must be declared');
  assert.ok(reading.markers.length >= 1, 'AC-US-0002-13: at least one marker must be declared');
  const same = (a: typeof reading.finishLine, b: typeof reading.finishLine) => JSON.stringify(a) === JSON.stringify(b);
  for (const m of reading.markers) assert.ok(!reading.sectorLimits.some(l => same(m, l)), 'AC-US-0002-13: markers must be distinct from the sector limits');
  assert.deepEqual(checkConsistency(reading), [], 'AC-US-0002-13: the synthetic file must pass every consistency check');
});

test('CHK-TEST-0009-14 a marker equal to a sector limit makes the data INCOMPLETE', () => {
  // AC-US-0004-05
  const file = syntheticFile();
  file.markers![1] = { ...file.sectorLimits![0] };
  const reading = readTrackData(file);
  assert.equal(reading.trackDataStatus, 'INCOMPLETE', 'AC-US-0004-05: a marker equal to a sector limit must make the data INCOMPLETE');
});

test('CHK-TEST-0009-15 the cut limits are read from the file when declared and default to 3 m and 1000 ms when absent', () => {
  // AC-US-0006-04
  const own = readTrackData(withCutLimits(1, 300));
  assert.equal(own.trackDataStatus, 'COMPLETE', 'AC-US-0006-04: a file with own cut limits must be COMPLETE');
  if (own.trackDataStatus !== 'COMPLETE') return;
  assert.equal(own.cutDistanceM, 1, 'AC-US-0006-04: cutDistanceM must be read from the file');
  assert.equal(own.cutDurationMs, 300, 'AC-US-0006-04: cutDurationMs must be read from the file');
  const absent = readTrackData(syntheticFile());
  if (absent.trackDataStatus !== 'COMPLETE') return;
  assert.equal(absent.cutDistanceM, undefined, 'AC-US-0006-04: an absent cutDistanceM must stay absent in the reading');
  assert.equal(DEFAULT_CUT_DISTANCE_M, 3, 'AC-US-0006-04: the default cut distance must be 3 m');
  assert.equal(DEFAULT_CUT_DURATION_MS, 1000, 'AC-US-0006-04: the default cut duration must be 1000 ms');
  assert.equal(readTrackData({ ...syntheticFile(), cutDurationMs: 0 }).trackDataStatus, 'INCOMPLETE', 'AC-US-0006-04: a non-positive cutDurationMs must not be accepted');
});

test('CHK-TEST-0009-16 reading never mutates the source and reading the same file twice gives the same reading', () => {
  // NFR-0012
  const file = syntheticFile();
  const snapshot = JSON.stringify(file);
  const first = readTrackData(file);
  const second = readTrackData(file);
  assert.equal(JSON.stringify(file), snapshot, 'NFR-0012: readTrackData must not alter the file');
  assert.deepEqual(first, second, 'NFR-0012: two readings of the same file must be equal');
  assert.deepEqual(readTrackData(JSON.stringify(file)), first, 'NFR-0012: the text form must read the same as the object form');
});
