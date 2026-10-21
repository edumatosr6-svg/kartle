---
id: DM-0001
title: Arquivo de pista, versão de esquema 2 — implementação
feature: race-lap-validation
stage: code
status: draft
version: 1.0.0
sources: [FEAT-0002, FEAT-0004, FEAT-0008, REQ-FEAT-0002-13, REQ-FEAT-0004-06, REQ-FEAT-0008-01, REQ-FEAT-0008-02, REQ-FEAT-0008-03, REQ-FEAT-0008-04, REQ-FEAT-0008-05, REQ-FEAT-0008-08, REQ-FEAT-0008-09, REQ-FEAT-0008-10, REQ-FEAT-0008-11, REQ-FEAT-0008-12, REQ-FEAT-0008-13, REQ-FEAT-0008-14]
---

# DM-0001 — Arquivo de pista, versão de esquema 2 — implementação

Não há banco nem migração: o esquema é o arquivo de pista empacotado. A versão 2 é publicada como literais em
`src/track.ts` (`SYNTHETIC_TRACK_FILE`, `trackVersion` 2) e lida por `src/trackData.ts`, que também entende a versão 1
(leitor da forma anterior, classificada `INCOMPLETE`). Reversão: `git revert` do commit de integração; nada é gravado em
navegador.

## Realização por requisito

| Requisito | Arquivo e símbolo |
|---|---|
| REQ-FEAT-0008-01, -02, -03, REQ-FEAT-0002-13, REQ-FEAT-0004-06 | `src/track.ts` `SYNTHETIC_TRACK_FILE` (largada, sentido, chegada, 3 limites de setor e 4 marcadores, conjuntos distintos); `src/trackData.ts` `readDeclared` (um marcador igual a um limite torna o dado `INCOMPLETE`) |
| REQ-FEAT-0008-04 | `src/trackData.ts` `DEFAULT_CUT_DISTANCE_M`, `DEFAULT_CUT_DURATION_MS`; `src/lap.ts` `resolveCutLimits` |
| REQ-FEAT-0008-05, -13 | `src/trackData.ts` `readTrackData` (ordem 6) e `checkConsistency` (C1 a C7) |
| REQ-FEAT-0008-08 | `src/trackData.ts` `TRACK_SCHEMA_VERSION` = 2; `SYNTHETIC_TRACK_FILE.schemaVersion` = 2 |
| REQ-FEAT-0008-09, -10 | `src/trackData.ts` `readTrackData` (ordem 5: `schemaVersion` 1 é `INCOMPLETE`, sem erro, sem alteração) |
| REQ-FEAT-0008-11 | `src/trackData.ts` `readTrackData` (ordem 3: `UNSUPPORTED_SCHEMA`, objeto não alterado) |
| REQ-FEAT-0008-12 | `src/track.ts` `SYNTHETIC_TRACK_FILE` como literal congelado (`as const`); mudança de dado exige novo literal com nova `trackVersion` |
| REQ-FEAT-0008-14 | `src/track.ts` `SYNTHETIC_TRACK_FILE.finishLine` a 8 m antes da largada; `src/trackData.ts` `checkConsistency` C4 e C7 |

## Campos lidos

`readDeclared` em `src/trackData.ts` valida cada campo da tabela de DM-0001 (`direction`, `startPosition`, `finishLine`,
`sectorLimits` com exatamente 3, `markers` com 1 ou mais, `cutDistanceM` finito maior que 0, `cutDurationMs` inteiro maior
que 0) e descarta o que está fora de forma; campos desconhecidos são ignorados e nunca reescritos. Uma linha precisa de
quatro números finitos e comprimento de pelo menos 1 m (`readLine`).
