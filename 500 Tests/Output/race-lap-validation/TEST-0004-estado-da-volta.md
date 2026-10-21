---
id: TEST-0004
title: Máquina de estados da volta: contagem, largada, tempo e pausa
feature: race-lap-validation
stage: test
status: validated
version: 1.0.0
sources: [AC-US-0001-01, AC-US-0001-04, AC-US-0001-05, AC-US-0001-06, AC-US-0001-07, AC-US-0001-08, AC-US-0002-02, AC-US-0002-03, AC-US-0002-05, AC-US-0002-09, AC-US-0002-11, AC-US-0003-05, AC-US-0003-06, AC-US-0003-07, AC-US-0003-08, AC-US-0003-09, AC-US-0009-01, NFR-0002]
---

# TEST-0004 — Máquina de estados da volta: contagem, largada, tempo e pausa

| | |
|---|---|
| Arquivo | `tests/race-lap-validation-state.test.ts` (estratégia: `lap-state`) |
| Nível | integração: `src/lap.ts` sobre `step` real e a pista sintética (`CIRCUIT`) |
| Interface exercitada | `startLap`, `stepLap`, `pauseLap`, `resumeLap`, `getLapState`, `getLapResult`; `describeLap` para o texto de estado |
| Fixtures | `syntheticReading()`; `autopilot`, `seedLap`, `kartAt`, `runCountdown`, `drive` de `tests/helpers/autopilot.ts`; deslocamentos semeados de `tests/helpers/seeded.ts` |

## Verificações

| Check | Decide | Teste | O que a faria falhar |
|---|---|---|---|
| CHK-TEST-0004-01 | AC-US-0001-01 | the countdown runs 360 steps from 3000 ms to 0 and then the lap is RUNNING | contagem com outra duração ou que não termina em RUNNING |
| CHK-TEST-0004-02 | AC-US-0001-04 | the lap timer reads 0 during the whole countdown | cronômetro contando a partir do início da contagem |
| CHK-TEST-0004-03 | AC-US-0001-05 | after N steps from the green signal the lap time is N x STEP, with the kart before or after the finish line | tempo dependente da posição do kart ou de um primeiro cruzamento |
| CHK-TEST-0004-04 | AC-US-0001-06 | full throttle during the countdown leaves the kart at speed 0 on the start position at the green signal | física avançada durante a contagem |
| CHK-TEST-0004-05 | AC-US-0001-07 | a jump start gives no invalidation reason: the lap is valid in progress at the green signal | queima de largada penalizada com motivo |
| CHK-TEST-0004-06 | AC-US-0001-08 | the lap time after N steps is the same with and without throttle during the countdown | acréscimo de penalidade de tempo |
| CHK-TEST-0004-07 | AC-US-0002-02 | the result of a complete lap carries the total time | resultado sem `lapMs` |
| CHK-TEST-0004-08 | AC-US-0002-03 | the result of a complete lap carries exactly four sector times | lista com outro tamanho |
| CHK-TEST-0004-09 | AC-US-0002-05 | the four sector times add up to the total time with 0 ms difference, for the autopilot and for seeded offsets | setores arredondados separadamente do total |
| CHK-TEST-0004-10 | AC-US-0002-09 | completed sector times appear one at a time, in order, during the lap | tempo de setor alterado depois de completado ou dois setores num passo |
| CHK-TEST-0004-11 | AC-US-0002-11 | the result identifies the track and its version as read from the data | identificação ausente ou vinda do pedido em vez da leitura |
| CHK-TEST-0004-12 | AC-US-0003-05 | pausing by the Esc key stops the lap timer until the lap is resumed | cronômetro que avança em `PAUSED` |
| CHK-TEST-0004-13 | AC-US-0003-06 | losing the tab focus pauses the lap and the timer shows the same value when it returns | tempo diferente ao retomar |
| CHK-TEST-0004-14 | AC-US-0003-07 | losing the tilt sensor pauses the lap and the timer stops advancing | causa `SENSOR_LOST` recusada ou cronômetro que avança |
| CHK-TEST-0004-15 | AC-US-0003-08 | no step advances during the pause: the session is unchanged and the time on resume is the time of the pause | `stepLap` que avança o kart ou o contador em `PAUSED` |
| CHK-TEST-0004-16 | AC-US-0003-09 | a paused and resumed official lap stays official and valid in progress | pausa tratada como invalidação ou troca de `lapKind` |
| CHK-TEST-0004-17 | AC-US-0003-09 | repeated pauses in the same lap each freeze the timer and the lap stays official | segunda pausa com efeito diferente da primeira |
| CHK-TEST-0004-18 | AC-US-0001-04 | a pause during the countdown keeps the timer at 0 and resumes the countdown where it stopped | contagem que avança em pausa ou retoma em `RUNNING` |
| CHK-TEST-0004-19 | AC-US-0009-01 | getLapState answers with a complete, well-typed view at every step from the green signal to the end | leitura que devolve `NO_ACTIVE_LAP` ou campo inválido num passo |

A verificação 15 também prova NFR-0002 (a pausa não avança passo).
