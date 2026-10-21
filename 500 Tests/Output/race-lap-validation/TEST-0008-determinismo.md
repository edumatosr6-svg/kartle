---
id: TEST-0008
title: Determinismo: mesma sequência, mesmo tempo
feature: race-lap-validation
stage: test
status: validated
version: 1.0.0
sources: [AC-US-0003-01, AC-US-0003-02, AC-US-0003-03, AC-US-0003-04, AC-US-0003-10, NFR-0001, NFR-0002]
---

# TEST-0008 — Determinismo: mesma sequência, mesmo tempo

| | |
|---|---|
| Arquivo | `tests/race-lap-validation-determinism.test.ts` (estratégia: `lap-determinism`) |
| Nível | integração: `src/lap.ts` sobre `step` real; `advanceClock` para agrupar os passos em quadros |
| Interface exercitada | `startLap`, `stepLap`, `pauseLap`, `resumeLap`, `getLapResult`, `advanceClock` |
| Fixtures | volta de referência do `autopilot` com a sequência de `Input` por passo gravada (`reference.inputs`, o roteiro de entradas de E2E-11); `replay` de `tests/helpers/autopilot.ts` |

## Verificações

| Check | Decide | Teste | O que a faria falhar |
|---|---|---|---|
| CHK-TEST-0008-01 | AC-US-0003-01 | two runs of the same input sequence on the same track give the same total time | qualquer fonte de variação (relógio, sorteio, estado compartilhado) |
| CHK-TEST-0008-02 | AC-US-0003-02 | two runs of the same input sequence on the same track give the same four sector times | idem para os setores |
| CHK-TEST-0008-03 | AC-US-0003-03 | the same input sequence rendered at 30 fps and at 60 fps gives the same total time | tempo dependente do tamanho do quadro |
| CHK-TEST-0008-04 | AC-US-0003-04 | the same input sequence rendered at 30 fps and at 60 fps gives the same four sector times | idem para os setores |
| CHK-TEST-0008-05 | AC-US-0003-10 | the same input sequence with a pause of any length in the middle gives the same total and sector times | pausa que consome entradas ou avança passos |
| CHK-TEST-0008-06 | NFR-0001 | the whole session, kart state included, is identical after two runs of the same sequence | estado da física diferente entre execuções |
