// TEST-0010 — texts, language and the m:ss.mmm format (strategy: lap-messages, unit, DES-0008, RULE-0006).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { LapStateView } from '../src/lap';
import { describeLap, formatLapTime, greenSignalVisible, message, MESSAGE_KEYS, resolveLanguage } from '../src/lapMessages';

const base: LapStateView = {
  lapPhase: 'RUNNING', lapKind: 'OFFICIAL', lapValidity: 'VALID', countdownRemainingMs: 0, elapsedMs: 0, stepCount: 0,
  completedSectorMs: [], markersPassedCount: 0, trackId: 'synthetic', trackVersion: 2,
};
const at = (patch: Partial<LapStateView>): LapStateView => ({ ...base, ...patch });

test('CHK-TEST-0010-01 each countdown value is a text numeral 3, 2 or 1 for the whole second it covers', () => {
  // AC-US-0001-02
  const expectations: [number, string][] = [[3000, '3'], [2500, '3'], [2001, '3'], [2000, '2'], [1500, '2'], [1001, '2'], [1000, '1'], [8, '1'], [1, '1']];
  for (const [ms, text] of expectations) {
    const d = describeLap(at({ lapPhase: 'COUNTDOWN', countdownRemainingMs: ms }), 'pt');
    assert.equal(d.countdownText, text, `AC-US-0001-02: countdown text at ${ms} ms must be "${text}"`);
  }
  assert.equal(describeLap(at({ lapPhase: 'RUNNING' }), 'pt').countdownText, undefined, 'AC-US-0001-02: no countdown text once running');
});

test('CHK-TEST-0010-02 the green signal is shown as text on the first running frame, in both languages', () => {
  // AC-US-0001-03
  assert.equal(greenSignalVisible(at({ lapPhase: 'RUNNING', stepCount: 0 })), true, 'AC-US-0001-03: the green signal must be visible on the first RUNNING frame');
  assert.equal(greenSignalVisible(at({ lapPhase: 'COUNTDOWN', countdownRemainingMs: 8 })), false, 'AC-US-0001-03: no green signal during the countdown');
  assert.equal(greenSignalVisible(at({ lapPhase: 'RUNNING', stepCount: 120 })), false, 'AC-US-0001-03: the green signal must not stay forever');
  assert.equal(message('countdownGreenSignal', 'pt'), 'VERDE', 'AC-US-0001-03: the green signal text in Portuguese must be "VERDE"');
  assert.equal(message('countdownGreenSignal', 'en'), 'GREEN', 'AC-US-0001-03: the green signal text in English must be "GREEN"');
});

test('CHK-TEST-0010-03 the timer shown during the countdown is 0:00.000', () => {
  // AC-US-0001-04
  assert.equal(formatLapTime(0), '0:00.000', 'AC-US-0001-04: 0 ms must be shown as 0:00.000');
});

test('CHK-TEST-0010-04 a valid running lap is described as valid in progress, with no reason', () => {
  // AC-US-0001-07
  const d = describeLap(at({ lapValidity: 'VALID' }), 'pt');
  assert.equal(d.stateText, 'válida em andamento', 'AC-US-0001-07: the state text must be "válida em andamento"');
  assert.equal(d.reasonText, undefined, 'AC-US-0001-07: a valid lap must show no reason');
});

test('CHK-TEST-0010-05 times are shown as m:ss.mmm with three decimals and no rounding', () => {
  // AC-US-0002-06
  const expectations: [number, string][] = [[62345, '1:02.345'], [0, '0:00.000'], [59999, '0:59.999'], [60000, '1:00.000'], [3723004, '62:03.004'], [9, '0:00.009']];
  for (const [ms, text] of expectations) assert.equal(formatLapTime(ms), text, `AC-US-0002-06: ${ms} ms must be shown as ${text}`);
  assert.equal(formatLapTime(-5), '0:00.000', 'AC-US-0002-06: a negative input must be clamped to 0');
});

test('CHK-TEST-0010-06 a lap invalid by marker shows the reason "marcador pulado"', () => {
  // AC-US-0004-04
  const d = describeLap(at({ lapValidity: 'INVALID', invalidReason: 'MISSED_MARKER' }), 'pt');
  assert.equal(d.reasonText, 'marcador pulado', 'AC-US-0004-04: the reason text must be "marcador pulado"');
  assert.equal(describeLap(at({ lapValidity: 'INVALID', invalidReason: 'MISSED_MARKER' }), 'en').reasonText, 'missed marker', 'AC-US-0004-04: the English reason must be "missed marker"');
});

test('CHK-TEST-0010-07 a lap invalid by cut shows the reason "corte"', () => {
  // AC-US-0006-05
  assert.equal(describeLap(at({ lapValidity: 'INVALID', invalidReason: 'CUT' }), 'pt').reasonText, 'corte', 'AC-US-0006-05: the reason text must be "corte"');
  assert.equal(describeLap(at({ lapValidity: 'INVALID', invalidReason: 'CUT' }), 'en').reasonText, 'cut', 'AC-US-0006-05: the English reason must be "cut"');
});

test('CHK-TEST-0010-08 a lap invalid by repositioning shows the reason "reposicionamento"', () => {
  // AC-US-0007-02
  assert.equal(describeLap(at({ lapValidity: 'INVALID', invalidReason: 'REPOSITION' }), 'pt').reasonText, 'reposicionamento', 'AC-US-0007-02: the reason text must be "reposicionamento"');
  assert.equal(describeLap(at({ lapValidity: 'INVALID', invalidReason: 'REPOSITION' }), 'en').reasonText, 'repositioning', 'AC-US-0007-02: the English reason must be "repositioning"');
});

test('CHK-TEST-0010-09 a recon or training lap that stays valid shows no reason text', () => {
  // AC-US-0007-05
  for (const lapKind of ['RECON', 'TRAINING'] as const) {
    const d = describeLap(at({ lapKind, lapValidity: 'VALID' }), 'pt');
    assert.equal(d.reasonText, undefined, `AC-US-0007-05: a valid ${lapKind} lap must show no reason`);
    assert.equal(d.stateText, 'válida em andamento', `AC-US-0007-05: a valid ${lapKind} lap must read "válida em andamento"`);
  }
});

test('CHK-TEST-0010-10 a recon or training result is identified in text as not official', () => {
  // AC-US-0008-01
  assert.equal(message('lapUnofficial', 'pt'), 'não oficial', 'AC-US-0008-01: the Portuguese text must be "não oficial"');
  assert.equal(message('lapUnofficial', 'en'), 'unofficial', 'AC-US-0008-01: the English text must be "unofficial"');
});

test('CHK-TEST-0010-11 while the lap has no invalidation reason the state reads "válida em andamento"', () => {
  // AC-US-0009-02
  for (const lapPhase of ['RUNNING', 'PAUSED'] as const) {
    assert.equal(describeLap(at({ lapPhase, lapValidity: 'VALID' }), 'pt').stateText, 'válida em andamento', `AC-US-0009-02: a VALID lap in ${lapPhase} must read "válida em andamento"`);
  }
  assert.equal(describeLap(at({ lapValidity: 'VALID' }), 'en').stateText, 'valid, in progress', 'AC-US-0009-02: the English state must be "valid, in progress"');
});

test('CHK-TEST-0010-12 an invalid lap reads "inválida" with its reason, for every reason', () => {
  // AC-US-0009-03
  const reasons = { MISSED_MARKER: 'marcador pulado', CUT: 'corte', REPOSITION: 'reposicionamento' } as const;
  for (const [reason, text] of Object.entries(reasons) as [keyof typeof reasons, string][]) {
    const d = describeLap(at({ lapPhase: 'ENDED', lapValidity: 'INVALID', invalidReason: reason }), 'pt');
    assert.equal(d.stateText, 'inválida', `AC-US-0009-03: the state for ${reason} must be "inválida"`);
    assert.equal(d.reasonText, text, `AC-US-0009-03: the reason for ${reason} must be "${text}"`);
  }
});

test('CHK-TEST-0010-13 every state and reason is conveyed by a non-empty text', () => {
  // AC-US-0009-04
  const views: LapStateView[] = [
    at({ lapValidity: 'VALID' }), at({ lapPhase: 'PAUSED', pauseCause: 'ESC_KEY' }), at({ lapPhase: 'COUNTDOWN', countdownRemainingMs: 3000 }),
    at({ lapValidity: 'INVALID', invalidReason: 'MISSED_MARKER' }), at({ lapValidity: 'INVALID', invalidReason: 'CUT' }), at({ lapValidity: 'INVALID', invalidReason: 'REPOSITION' }),
  ];
  for (const lang of ['pt', 'en'] as const) {
    for (const v of views) {
      const d = describeLap(v, lang);
      assert.ok(d.stateText.trim().length > 0, `AC-US-0009-04: the state text must be non-empty in ${lang}`);
      if (v.lapValidity === 'INVALID') assert.ok((d.reasonText ?? '').trim().length > 0, `AC-US-0009-04: the reason text for ${v.invalidReason} must be non-empty in ${lang}`);
      if (v.lapPhase === 'PAUSED') assert.ok((d.pausedText ?? '').trim().length > 0, `AC-US-0009-04: the paused text must be non-empty in ${lang}`);
    }
  }
});

test('CHK-TEST-0010-14 a Portuguese browser language gives Portuguese state and reason', () => {
  // AC-US-0009-05
  for (const tag of ['pt-BR', 'pt', 'PT-PT', 'pt_BR']) assert.equal(resolveLanguage(tag), 'pt', `AC-US-0009-05: ${tag} must resolve to pt`);
  const d = describeLap(at({ lapValidity: 'INVALID', invalidReason: 'CUT' }), resolveLanguage('pt-BR'));
  assert.equal(`${d.stateText} ${d.reasonText}`, 'inválida corte', 'AC-US-0009-05: state and reason must be in Portuguese');
});

test('CHK-TEST-0010-15 an English browser language gives English state and reason', () => {
  // AC-US-0009-06
  for (const tag of ['en-US', 'en', 'en-GB']) assert.equal(resolveLanguage(tag), 'en', `AC-US-0009-06: ${tag} must resolve to en`);
  const d = describeLap(at({ lapValidity: 'INVALID', invalidReason: 'CUT' }), resolveLanguage('en-US'));
  assert.equal(`${d.stateText} ${d.reasonText}`, 'invalid cut', 'AC-US-0009-06: state and reason must be in English');
});

test('CHK-TEST-0010-16 a browser language other than Portuguese or English, or none, gives English', () => {
  // AC-US-0009-07
  for (const tag of ['fr', 'es-419', 'de', '', undefined, null, 'ptx', 'es-PT']) assert.equal(resolveLanguage(tag), 'en', `AC-US-0009-07: ${JSON.stringify(tag)} must resolve to en`);
});

test('CHK-TEST-0010-17 all twenty message keys exist with a non-empty text in both languages', () => {
  // NFR-0007
  assert.equal(MESSAGE_KEYS.length, 20, 'NFR-0007: there must be exactly 20 message keys');
  for (const key of MESSAGE_KEYS) {
    for (const lang of ['pt', 'en'] as const) assert.ok(message(key, lang).trim().length > 0, `NFR-0007: message ${key} must be non-empty in ${lang}`);
    assert.notEqual(message(key, 'pt'), '', `NFR-0007: ${key} must have a Portuguese text`);
  }
  const differing = MESSAGE_KEYS.filter(k => message(k, 'pt') !== message(k, 'en'));
  assert.ok(differing.length >= 18, 'NFR-0007: the two languages must be real translations, not copies');
});

test('CHK-TEST-0010-18 the paused text is shown only while paused and the state after resume is the state of the pause', () => {
  // AC-US-0003-09
  const paused = describeLap(at({ lapPhase: 'PAUSED', pauseCause: 'ESC_KEY' }), 'pt');
  assert.equal(paused.pausedText, 'volta pausada', 'AC-US-0003-09: the paused text must be "volta pausada"');
  assert.equal(paused.stateText, 'válida em andamento', 'AC-US-0003-09: the state must still read valid while paused');
  const resumed = describeLap(at({ lapPhase: 'RUNNING' }), 'pt');
  assert.equal(resumed.pausedText, undefined, 'AC-US-0003-09: no paused text after resume');
  assert.equal(resumed.stateText, paused.stateText, 'AC-US-0003-09: the state after resume must equal the state at the pause');
});
