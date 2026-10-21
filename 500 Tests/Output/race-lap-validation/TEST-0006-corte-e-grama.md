---
id: TEST-0006
title: Corte e grama com oráculo de distância próprio
feature: race-lap-validation
stage: test
status: validated
version: 1.0.0
sources: [AC-US-0006-01, AC-US-0006-02, AC-US-0006-03, AC-US-0006-04, AC-US-0006-05, AC-US-0006-06, AC-US-0006-07, AC-US-0006-08, NFR-0009]
---

# TEST-0006 — Corte e grama com oráculo de distância próprio

| | |
|---|---|
| Arquivo | `tests/race-lap-validation-cut.test.ts` (estratégia: `lap-cut`) |
| Nível | integração: `src/lap.ts` sobre `step` real; ambiente `CIRCUIT`, `TEST_PAD` e um ambiente só de grama |
| Interface exercitada | `startLap` (com `environment`), `stepLap`, `pauseLap`, `resumeLap`, `getLapState`, `getLapResult`; `describeLap` |
| Fixtures | `syntheticReading()`, `withCutLimits(1, 300)`; `driveOut` (`DRIVE_OUT`), `autopilot(-7)` (1,5 m além da borda, confirmado ≤ 3 m pelo oráculo), karts parados a 2 m e 4 m além da borda por `kartAt`; oráculo: laço do teste com `nearest` contando passos seguidos além da distância |

## Verificações

| Check | Decide | Teste | O que a faria falhar |
|---|---|---|---|
| CHK-TEST-0006-01 | AC-US-0006-01 | driving straight off the track invalidates the lap in the step in which 1000 ms beyond 3 m are exceeded | corte num passo diferente do oráculo (limite `>=`, distância medida do centro) |
| CHK-TEST-0006-02 | AC-US-0006-02 | up to 1000 ms beyond 3 m followed by a return to 3 m or less does not invalidate, and a new exit restarts the count | contador que não zera ao voltar |
| CHK-TEST-0006-03 | AC-US-0006-03 | a kart beyond the edge by 3 m or less, for any duration while driving, is not invalidated | grama a menos de 3 m tratada como corte |
| CHK-TEST-0006-04 | AC-US-0006-03 | a kart standing 2 m beyond the edge for 5 s is not invalidated | corte por duração sem considerar a distância |
| CHK-TEST-0006-05 | AC-US-0006-04 | a track that declares its own cut limits invalidates by those limits, not by 3 m and 1000 ms | limites da pista ignorados |
| CHK-TEST-0006-06 | AC-US-0006-06 | a lap invalid by cut ends at the cut step: no lap time and no sector time is added afterwards | volta cortada que continua contando |
| CHK-TEST-0006-07 | AC-US-0006-07 | from the same state and input, the kart is slower after N steps on grass than on the track | grama sem efeito na velocidade |
| CHK-TEST-0006-08 | AC-US-0006-08 | driving on the grass within the cut limits keeps the lap shown as valid in progress | estado "inválida" exibido na grama sem corte |
| CHK-TEST-0006-09 | AC-US-0006-01 | time spent paused while off the track does not count towards the 1000 ms | pausa contada como passos fora da pista |
| CHK-TEST-0006-10 | AC-US-0006-05 | the result of a cut lap carries the reason CUT and is not official | motivo ausente ou outro |
