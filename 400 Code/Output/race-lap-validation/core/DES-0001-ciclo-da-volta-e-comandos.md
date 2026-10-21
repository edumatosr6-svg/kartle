---
id: DES-0001
title: Ciclo da volta, comandos e consultas — implementação
feature: race-lap-validation
stage: code
status: draft
version: 1.0.0
sources: [FEAT-0001, FEAT-0002, FEAT-0003, FEAT-0004, FEAT-0008, FEAT-0009, REQ-FEAT-0001-04, REQ-FEAT-0001-06, REQ-FEAT-0001-07, REQ-FEAT-0001-11, REQ-FEAT-0001-12, REQ-FEAT-0002-11, REQ-FEAT-0002-12, REQ-FEAT-0002-15, REQ-FEAT-0003-08, REQ-FEAT-0003-09, REQ-FEAT-0003-10, REQ-FEAT-0003-12, REQ-FEAT-0003-13, REQ-FEAT-0003-14, REQ-FEAT-0004-14, REQ-FEAT-0008-15, REQ-FEAT-0009-01, REQ-FEAT-0009-12]
---

# DES-0001 — Ciclo da volta, comandos e consultas — implementação

Módulo novo `src/lap.ts`, camada simulação: importa só `src/physics.ts`, `src/track.ts`, `src/trackData.ts` e
`src/lapTiming.ts`; nenhum `three`, DOM, áudio, `Date`, `performance` ou `Math.random`.

## Realização por requisito

| Requisito | Arquivo e símbolo |
|---|---|
| REQ-FEAT-0001-04 | `src/lap.ts` `getLapState` (`elapsedMs = toMs(stepCount)` e `stepCount` 0 durante `COUNTDOWN`) |
| REQ-FEAT-0001-06 | `src/lap.ts` `stepLap` (fase `COUNTDOWN`: o `kart` não é integrado; `Input` ignorado); `startLap` (kart em `initialState()` na largada, velocidade 0) |
| REQ-FEAT-0001-07 | `src/lap.ts` `stepLap` (nenhuma transição de validade em `COUNTDOWN`; `validity` segue `VALID`) |
| REQ-FEAT-0001-11 | `src/lap.ts` `stepLap` (o primeiro passo `RUNNING` chama `step` com o `Input` corrente; o acelerador sobe pela taxa da física) |
| REQ-FEAT-0001-12 | `src/lap.ts` `pauseLap` em `COUNTDOWN` (`resumePhase` `COUNTDOWN`); `stepLap` em `PAUSED` devolve a sessão |
| REQ-FEAT-0002-11, REQ-FEAT-0008-15 | `src/lap.ts` `startLap` (`trackId` e `trackVersion` copiados de `reading`, nunca da data ou do nome) |
| REQ-FEAT-0002-12, REQ-FEAT-0009-12 | `src/lap.ts` `stepLap` (`ENDED` devolve a própria sessão); `complete` e `invalidate` criam `result` uma única vez |
| REQ-FEAT-0002-15, REQ-FEAT-0003-09 | `src/lap.ts` `pauseLap` e `resumeLap` (só `phase`, `resumePhase` e `pauseCause` mudam; `lapKind` e `validity` intactos) |
| REQ-FEAT-0003-08, REQ-FEAT-0003-10, REQ-FEAT-0004-14 | `src/lap.ts` `stepLap` (nenhum passo em `PAUSED`); contadores, marcadores e `sectorBoundsMs` preservados |
| REQ-FEAT-0003-12, REQ-FEAT-0003-13, REQ-FEAT-0003-14 | `src/lap.ts` `pauseLap` (`ALREADY_PAUSED` não troca `resumePhase` nem `pauseCause`; `LAP_ENDED`), `resumeLap` (`NOT_PAUSED`, `LAP_ENDED`) |
| REQ-FEAT-0009-01 | `src/lap.ts` inteiro: a validade e o tempo são decididos aqui; `src/main.ts` só encaminha comandos e lê `getLapState`/`getLapResult` |

## Interface

`startLap(current, request, reading, config, environment = CIRCUIT)`, `pauseLap(lap, cause)`, `resumeLap(lap)`,
`repositionKart(lap)`, `stepLap(lap, input)`, `getLapState(lap)`, `getLapResult(lap)`, com os códigos de rejeição de
API-0002 como valores (`{ok: false, code}`), nunca exceções. A ordem das verificações de `startLap` é a de DES-0001
(volta ativa, `UNREADABLE`, `UNSUPPORTED_SCHEMA`, identificação diferente da leitura, `OFFICIAL` em `INCOMPLETE`). A
contagem tem `COUNTDOWN_STEPS` = 360 passos e passa a `RUNNING` com `stepCount` 0 no passo em que os 360 são alcançados.

Chave de deduplicação: a própria volta e a fase (um comando repetido encontra a fase já mudada). Posição inicial:
`startPosition` da leitura quando existe, senão `initialState()`.
