---
id: DES-0006
title: Leitura e verificação do dado de pista — implementação
feature: race-lap-validation
stage: code
status: draft
version: 1.0.0
sources: [FEAT-0002, FEAT-0008, REQ-FEAT-0002-13, REQ-FEAT-0008-01, REQ-FEAT-0008-02, REQ-FEAT-0008-03, REQ-FEAT-0008-05, REQ-FEAT-0008-08, REQ-FEAT-0008-09, REQ-FEAT-0008-10, REQ-FEAT-0008-11, REQ-FEAT-0008-12, REQ-FEAT-0008-13, REQ-FEAT-0008-14]
---

# DES-0006 — Leitura e verificação do dado de pista — implementação

Módulo novo `src/trackData.ts`, camada dado de pista; importa só `src/track.ts` (`track`, `WIDTH`, `nearest`, `crossLine`).
`src/track.ts` ganhou `Line`, `sideOf`, `crossLine` e `SYNTHETIC_TRACK_FILE`; `track`, `WIDTH`, `nearest` e `LapTracker`
estão como estavam, e `LapTracker` deixou de ser importado por `src/main.ts`.

## Realização por requisito

| Requisito | Arquivo e símbolo |
|---|---|
| REQ-FEAT-0002-13, REQ-FEAT-0008-01, -02, -03 | `src/trackData.ts` `readTrackData` (largada, sentido, chegada, limites e marcadores vêm do arquivo); `src/track.ts` `SYNTHETIC_TRACK_FILE` |
| REQ-FEAT-0008-05, REQ-FEAT-0008-13 | `src/trackData.ts` `readTrackData` (ordem 6) e `checkConsistency` (C1 enrolamento, C2 um cruzamento no sentido da pista, C3 largada, C4 ordem de arco, C5 marcador antes e depois de cada limite, C6 alcance `BARRIER_REACH_M`, C7 espaçamento de 2 m) |
| REQ-FEAT-0008-08 | `src/trackData.ts` `TRACK_SCHEMA_VERSION` = 2 |
| REQ-FEAT-0008-09, REQ-FEAT-0008-10 | `src/trackData.ts` `readTrackData` (ordem 5; sem exceção, sem alteração do objeto) |
| REQ-FEAT-0008-11 | `src/trackData.ts` `readTrackData` (ordem 3, antes da identificação); `src/main.ts` `renderOffer` (texto `trackDataError`, nenhum botão) e `console.warn('track-data', 'UNSUPPORTED_SCHEMA', schemaVersion)` |
| REQ-FEAT-0008-12 | `src/track.ts` `SYNTHETIC_TRACK_FILE` (literal `as const`, `trackVersion` 2) |
| REQ-FEAT-0008-14 | `src/trackData.ts` `checkConsistency` C4 e C7; `src/track.ts` `SYNTHETIC_TRACK_FILE.finishLine` |

## Interface

`TRACK_SCHEMA_VERSION`, `DEFAULT_CUT_DISTANCE_M`, `DEFAULT_CUT_DURATION_MS`, `BARRIER_REACH_M`, `readTrackData(source)`
(texto, objeto, `null` ou `undefined`; `JSON.parse` dentro de `try`), `checkConsistency(declared)`. `TrackReading` tem a
forma plana de API-0003. A leitura nunca altera o objeto recebido: os valores devolvidos são copiados. Registro: só em
`src/main.ts`, com identificadores (`trackId`, `trackVersion`, `schemaVersion`). Verificado nesta rodada: o arquivo
sintético lê `COMPLETE` com C1 a C7 aprovados; `schemaVersion` 1 lê `INCOMPLETE`; `schemaVersion` 3 lê
`UNSUPPORTED_SCHEMA`; texto corrompido e entrada ausente leem `UNREADABLE`.
