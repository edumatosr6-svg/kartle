// Application layer, pure: lap texts, language resolution and the m:ss.mmm format (DES-0008, RULE-0006).
// No DOM access, so npm test can import it.
import type { LapStateView } from './lap';

export type Language = 'pt' | 'en';
export type MessageKey =
  | 'lapStateValidInProgress' | 'lapStateInvalid'
  | 'reasonMissedMarker' | 'reasonCut' | 'reasonReposition'
  | 'lapUnofficial' | 'countdownGreenSignal' | 'lapResultValid' | 'lapPaused'
  | 'loadingTrack' | 'noTrackAvailable' | 'trackDataError' | 'controlFallbackTouch'
  | 'sectorLabel' | 'totalLabel' | 'startTraining' | 'startOfficial' | 'startRecon' | 'resumeLap' | 'newLap';

const MESSAGES: Record<MessageKey, Record<Language, string>> = {
  lapStateValidInProgress: { pt: 'válida em andamento', en: 'valid, in progress' },
  lapStateInvalid: { pt: 'inválida', en: 'invalid' },
  reasonMissedMarker: { pt: 'marcador pulado', en: 'missed marker' },
  reasonCut: { pt: 'corte', en: 'cut' },
  reasonReposition: { pt: 'reposicionamento', en: 'repositioning' },
  lapUnofficial: { pt: 'não oficial', en: 'unofficial' },
  countdownGreenSignal: { pt: 'VERDE', en: 'GREEN' },
  lapResultValid: { pt: 'válida', en: 'valid' },
  lapPaused: { pt: 'volta pausada', en: 'lap paused' },
  loadingTrack: { pt: 'carregando a pista', en: 'loading track' },
  noTrackAvailable: { pt: 'nenhuma pista disponível', en: 'no track available' },
  trackDataError: { pt: 'dado da pista indisponível', en: 'track data unavailable' },
  controlFallbackTouch: { pt: 'controle por toque (sensor de inclinação indisponível)', en: 'touch control (tilt sensor unavailable)' },
  sectorLabel: { pt: 'setor', en: 'sector' },
  totalLabel: { pt: 'tempo total', en: 'total time' },
  startTraining: { pt: 'volta de treino', en: 'training lap' },
  startOfficial: { pt: 'volta oficial', en: 'official lap' },
  startRecon: { pt: 'volta de reconhecimento', en: 'recon lap' },
  resumeLap: { pt: 'continuar', en: 'resume' },
  newLap: { pt: 'nova volta', en: 'new lap' },
};
export const MESSAGE_KEYS = Object.keys(MESSAGES) as MessageKey[];

// Primary language of the tag, without the regional variant; anything but pt or en is en (DEC-09).
export function resolveLanguage(tag: string | null | undefined): Language {
  const primary = (tag ?? '').trim().toLowerCase().split(/[-_]/)[0];
  return primary === 'pt' ? 'pt' : 'en';
}

export function message(key: MessageKey, lang: Language): string {
  return MESSAGES[key][lang];
}

// m:ss.mmm without rounding: minutes without leading zeros, 2-digit seconds, 3-digit milliseconds.
export function formatLapTime(ms: number): string {
  const total = Math.max(0, Math.trunc(ms));
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor(total / 1000) % 60;
  const millis = total % 1000;
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
}

const REASON_KEY: Record<NonNullable<LapStateView['invalidReason']>, MessageKey> = {
  MISSED_MARKER: 'reasonMissedMarker', CUT: 'reasonCut', REPOSITION: 'reasonReposition',
};

export type LapDescription = { stateText: string; reasonText?: string; pausedText?: string; countdownText?: string };

export function describeLap(view: LapStateView, lang: Language): LapDescription {
  const invalid = view.lapValidity === 'INVALID';
  const description: LapDescription = {
    stateText: message(invalid ? 'lapStateInvalid' : 'lapStateValidInProgress', lang),
  };
  if (invalid && view.invalidReason) description.reasonText = message(REASON_KEY[view.invalidReason], lang);
  if (view.lapPhase === 'PAUSED') description.pausedText = message('lapPaused', lang);
  if (view.lapPhase === 'COUNTDOWN') description.countdownText = String(Math.ceil(view.countdownRemainingMs / 1000));
  return description;
}

// The green signal is shown for the first 120 steps (1 s of simulation) of RUNNING; it freezes on pause.
export function greenSignalVisible(view: LapStateView): boolean {
  return view.lapPhase === 'RUNNING' && view.stepCount < 120;
}
