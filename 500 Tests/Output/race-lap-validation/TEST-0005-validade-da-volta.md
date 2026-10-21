---
id: TEST-0005
title: Marcadores, limites de setor, chegada e sentido
feature: race-lap-validation
stage: test
status: validated
version: 1.0.0
sources: [AC-US-0002-01, AC-US-0002-07, AC-US-0002-08, AC-US-0002-10, AC-US-0002-12, AC-US-0002-13, AC-US-0004-01, AC-US-0004-02, AC-US-0004-03, AC-US-0004-05, AC-US-0004-06, AC-US-0004-07, AC-US-0005-01, AC-US-0005-02, AC-US-0005-03, AC-US-0005-04, NFR-0009]
---

# TEST-0005 — Marcadores, limites de setor, chegada e sentido

| | |
|---|---|
| Arquivo | `tests/race-lap-validation-validity.test.ts` (estratégia: `lap-validity`) |
| Nível | integração: `src/lap.ts` sobre `step` real e a pista sintética |
| Interface exercitada | `startLap`, `stepLap`, `pauseLap`, `resumeLap`, `getLapState`, `getLapResult`; `readTrackData` sobre os arquivos derivados |
| Fixtures | `syntheticReading()`, `SYNTHETIC_TRACK_FILE`, `withShortMarker(2)` (marcador 2 de −1 m a +9 m do lado direito; o autopilot a +4 m à esquerda não o cruza); `seedLap` e `kartAt` para posições e sentido; oráculo do próprio teste com `crossLine` sobre o deslocamento de cada passo |

## Verificações

| Check | Decide | Teste | O que a faria falhar |
|---|---|---|---|
| CHK-TEST-0005-01 | AC-US-0002-01 | crossing the finish in the track sense after every marker in order ends the lap as valid | volta que não encerra ou encerra inválida |
| CHK-TEST-0005-02 | AC-US-0002-07 | the total time lies strictly inside the step in which the finish line was crossed | tempo igual ao passo inteiro ou de outro passo |
| CHK-TEST-0005-03 | AC-US-0002-08 | the end of each sector lies strictly inside the step in which its limit was crossed | limite registrado no passo inteiro ou em outro passo |
| CHK-TEST-0005-04 | AC-US-0002-10 | each sector ends at the crossing of its declared limit and the first sector starts at the green signal | setor que começa na largada física ou termina fora do limite declarado |
| CHK-TEST-0005-05 | AC-US-0002-12 | crossing the finish again after the lap ended produces no second result | `stepLap` que avança após `ENDED` ou substitui o resultado |
| CHK-TEST-0005-06 | AC-US-0002-13 | a complete lap on the published synthetic track is valid with four sector times | arquivo publicado inconsistente com a geometria |
| CHK-TEST-0005-07 | AC-US-0004-01 | crossing the finish without having passed every marker ends the lap as invalid | chegada aceita com marcador faltando |
| CHK-TEST-0005-08 | AC-US-0004-02 | markers passed out of the declared order do not count and the finish is invalid | contagem de marcadores por conjunto, sem ordem |
| CHK-TEST-0005-09 | AC-US-0004-03 | a lap invalid by marker has a result without lap time, without sector times and not official | tempo gravado em volta inválida |
| CHK-TEST-0005-10 | AC-US-0004-05 | crossing the three sector limits but missing a marker is still a missed-marker lap | limites de setor contados como marcadores |
| CHK-TEST-0005-11 | AC-US-0004-06 | on the published synthetic track, skipping marker 2 makes the finish a missed-marker lap | marcadores do arquivo sintético não lidos ou não exigidos |
| CHK-TEST-0005-12 | AC-US-0004-07 | a lap invalid by marker ends at the finish step: no time is added afterwards and no second result appears | volta inválida que continua contando |
| CHK-TEST-0005-13 | AC-US-0005-01 | crossing the finish against the track sense does not end the lap | contramão aceita como chegada |
| CHK-TEST-0005-14 | AC-US-0005-02 | crossing the finish against the track sense records no result | resultado produzido na contramão |
| CHK-TEST-0005-15 | AC-US-0005-03 | only the crossing in the track sense ends the lap, even after several reverse crossings | fim no passo errado ou contramão acumulada |
| CHK-TEST-0005-16 | AC-US-0005-04 | crossing a marker against the track sense does not count as passing it | passagem contada em qualquer sentido |
| CHK-TEST-0005-17 | AC-US-0004-02 | marker passages recorded before a pause still count after the lap resumes | contador zerado pela pausa |

A verificação 11 difere da fixture da estratégia (excursão lateral de 10,5 m dirigida): ver `97-changelog.md`.
