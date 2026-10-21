---
id: TEST-0013
title: Camadas, simulação pura e ausência de rede
feature: race-lap-validation
stage: test
status: validated
version: 1.0.0
sources: [NFR-0001, NFR-0004, NFR-0005, NFR-0011]
---

# TEST-0013 — Camadas, simulação pura e ausência de rede

| | |
|---|---|
| Arquivo | `tests/race-lap-validation-layering.test.ts` (estratégia: `lap-layering`) |
| Nível | estático sobre o texto dos módulos (`node:fs`), comentários removidos |
| Interface exercitada | `src/physics.ts`, `src/maneuvers.ts`, `src/track.ts`, `src/trackData.ts`, `src/lap.ts`, `src/lapTiming.ts`, `src/lapMessages.ts`, `src/frameClock.ts`, `src/main.ts` |
| Fixtures | listas de símbolos proibidos de DES-0012 |

## Verificações

| Check | Decide | Teste | O que a faria falhar |
|---|---|---|---|
| CHK-TEST-0013-01 | NFR-0004 | the simulation modules import nothing from the renderer, the audio or the application | importação de `three`, `./audio` ou `./main` numa camada interna |
| CHK-TEST-0013-02 | NFR-0001 | the simulation never touches the DOM, the wall clock or an unseeded random | `Date`, `performance`, `Math.random`, `window`, `document` ou temporizador na simulação |
| CHK-TEST-0013-03 | NFR-0005 | no module of the feature, the application included, uses the network or browser storage | `fetch`, `XMLHttpRequest`, `WebSocket`, `localStorage`, `sessionStorage`, `indexedDB` ou `sendBeacon` |
| CHK-TEST-0013-04 | NFR-0011 | the application no longer decides lap validity with the retired gate tracker | `LapTracker` usado em `main.ts` ou motivo decidido fora da simulação |

A ausência de requisições durante uma volta no navegador real fica em E2E-08.
