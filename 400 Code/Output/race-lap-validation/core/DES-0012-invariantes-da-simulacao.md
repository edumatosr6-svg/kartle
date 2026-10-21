---
id: DES-0012
title: Invariantes da simulação, física congelada e verificação das regras — implementação
feature: race-lap-validation
stage: code
status: draft
version: 1.0.0
sources: [FEAT-0005, FEAT-0009, REQ-FEAT-0005-07, REQ-FEAT-0009-02, REQ-FEAT-0009-03, REQ-FEAT-0009-04, REQ-FEAT-0009-10]
---

# DES-0012 — Invariantes da simulação, física congelada e verificação das regras — implementação

Nenhum módulo de produção novo. Este item fixa o que não mudou e registra a evidência.

## Realização por requisito

| Requisito | Arquivo e símbolo |
|---|---|
| REQ-FEAT-0005-07, REQ-FEAT-0009-04 | `src/physics.ts` e `src/maneuvers.ts` inalterados (idênticos à árvore anterior); `docs/lap-validation-bench.md` registra `bench:physics` e `bench:handling` antes e depois com 0 linhas diferentes |
| REQ-FEAT-0009-02 | `src/lap.ts`, `src/lapTiming.ts`, `src/trackData.ts`, `src/track.ts`: nenhuma importação de `three`, `./audio` ou `./main`; nenhum uso de `document`, `window`, `Date`, `performance`, `Math.random`, `fetch`, `XMLHttpRequest`, `WebSocket`, `localStorage`, `sessionStorage`, `indexedDB` |
| REQ-FEAT-0009-03 | `src/physics.ts` `STEP` e `Input` inalterados; `src/lap.ts` `stepLap` passa `Input` a `step` sem redefini-lo |
| REQ-FEAT-0009-10 | as regras estão expostas pela interface pública de `src/lap.ts`, `src/trackData.ts`, `src/lapTiming.ts`, `src/lapMessages.ts` e `src/frameClock.ts`, sem gancho de teste; os arquivos `tests/lap-*.test.ts`, `tests/track-data.test.ts`, `tests/frame-clock.test.ts` e `tests/helpers/` são do estágio de testes e não foram escritos nesta rodada |

## Evidência desta rodada

`npm test` coleta e aprova a suíte pré-existente (32 testes, 0 reprovados), incluindo `crossing the start alone cannot
complete a lap`, que continua usando `LapTracker` reexportado por `src/physics.ts`. `scripts/keyboard-lap.ts` segue
compilando e completando a volta limpa.
