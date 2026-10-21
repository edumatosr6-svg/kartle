---
id: TEST-0007
title: Tipos de volta, reposicionamento e dado incompleto
feature: race-lap-validation
stage: test
status: validated
version: 1.0.0
sources: [AC-US-0007-01, AC-US-0007-03, AC-US-0007-04, AC-US-0007-05, AC-US-0007-06, AC-US-0008-01, AC-US-0008-02, AC-US-0008-03, AC-US-0008-04, AC-US-0008-05]
---

# TEST-0007 — Tipos de volta, reposicionamento e dado incompleto

| | |
|---|---|
| Arquivo | `tests/race-lap-validation-kinds.test.ts` (estratégia: `lap-kinds`) |
| Nível | integração: `src/lap.ts` sobre `step` real |
| Interface exercitada | `startLap`, `stepLap`, `repositionKart`, `offeredLapKinds`, `getLapState`, `getLapResult`; `describeLap` |
| Fixtures | `syntheticReading()`; `tests/fixtures/track-v1.json` (`INCOMPLETE`, forma anterior); cópia sem `markers`; `autopilot`, `DRIVE_OUT` |

## Verificações

| Check | Decide | Teste | O que a faria falhar |
|---|---|---|---|
| CHK-TEST-0007-01 | AC-US-0007-01 | repositioning the kart in an official running lap invalidates it with REPOSITION | reposicionamento livre em volta oficial |
| CHK-TEST-0007-02 | AC-US-0007-03 | an official lap invalidated by repositioning ends at that step: no lap time is added afterwards | volta que segue contando depois do reposicionamento |
| CHK-TEST-0007-03 | AC-US-0007-04 | repositioning in a recon or training lap, repeatedly, keeps the lap valid in progress | invalidação em reconhecimento ou treino |
| CHK-TEST-0007-04 | AC-US-0007-05 | repositioning in a recon or training lap sets no invalidation reason | motivo registrado sem invalidar |
| CHK-TEST-0007-05 | AC-US-0007-06 | in a recon or training lap the time after N steps is N x STEP with repositionings in between | penalidade de tempo ao reposicionar |
| CHK-TEST-0007-06 | AC-US-0008-01 | the result of a completed recon or training lap is identified as not official | `official` verdadeiro em treino ou reconhecimento |
| CHK-TEST-0007-07 | AC-US-0008-02 | official is false for recon and training results and true only for an official valid lap on complete data | `official` decidido só pelo tipo |
| CHK-TEST-0007-08 | AC-US-0008-03 | incomplete track data offers no official lap and an official start is rejected | oferta ou aceitação de volta oficial em dado incompleto |
| CHK-TEST-0007-09 | AC-US-0008-04 | incomplete track data offers a training lap that can be driven: the kart moves and the timer advances | treino recusado ou parado em dado incompleto |
| CHK-TEST-0007-10 | AC-US-0008-05 | on incomplete track data every result is identified as not official | resultado oficial em dado incompleto |
| CHK-TEST-0007-11 | AC-US-0007-03 | a second repositioning in an official lap is rejected with LAP_ENDED and the reason stays REPOSITION | segundo reposicionamento aceito |
