---
id: TEST-0003
title: Relógio de quadros em passos fixos
feature: race-lap-validation
stage: test
status: validated
version: 1.0.0
sources: [AC-US-0003-03, AC-US-0003-04, NFR-0002]
---

# TEST-0003 — Relógio de quadros em passos fixos

| | |
|---|---|
| Arquivo | `tests/race-lap-validation-frame-clock.test.ts` (estratégia: `frame-clock`) |
| Nível | unitário |
| Interface exercitada | `advanceClock`, `MAX_FRAME_S` de `src/frameClock.ts` |
| Fixtures | durações de quadro literais (1/60 s, 1/30 s, 1 s) |

## Verificações

| Check | Decide | Teste | O que a faria falhar |
|---|---|---|---|
| CHK-TEST-0003-01 | AC-US-0003-03 | a 60 fps frame runs 2 steps and a 30 fps frame runs 4 steps | passo variável por quadro ou acumulador errado |
| CHK-TEST-0003-02 | AC-US-0003-04 | one second rendered at 30 fps and at 60 fps runs the same number of steps | resto do acumulador descartado entre quadros |
| CHK-TEST-0003-03 | NFR-0002 | a stalled frame is capped so a frame drop cannot run more than 12 steps at once | ausência do teto de 0,1 s |
