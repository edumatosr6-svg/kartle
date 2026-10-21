---
id: DES-0004
title: Corte e grama — implementação
feature: race-lap-validation
stage: code
status: draft
version: 1.0.0
sources: [FEAT-0005, FEAT-0008, REQ-FEAT-0005-01, REQ-FEAT-0005-02, REQ-FEAT-0005-03, REQ-FEAT-0005-04, REQ-FEAT-0005-06, REQ-FEAT-0005-07, REQ-FEAT-0005-09, REQ-FEAT-0005-10, REQ-FEAT-0005-11, REQ-FEAT-0008-04]
---

# DES-0004 — Corte e grama — implementação

Função interna `evaluateCut` em `src/lap.ts`, executada depois dos cruzamentos de linha num passo `RUNNING` em que a volta
continua. A física da grama é a existente e não foi alterada.

## Realização por requisito

| Requisito | Arquivo e símbolo |
|---|---|
| REQ-FEAT-0005-01 | `src/lap.ts` `evaluateCut` (distância estritamente maior que `cutDistanceM` e `isCutExceeded(offTrackSteps + 1, cutDurationMs)`); `src/lapTiming.ts` `isCutExceeded` (`25 * 121 > 3000`) |
| REQ-FEAT-0005-02, REQ-FEAT-0005-09 | `src/lap.ts` `evaluateCut` (`offTrackSteps` volta a 0 com distância menor ou igual ao limite) |
| REQ-FEAT-0005-03 | `src/lap.ts` `edgeDistanceM` (`Math.max(0, nearest(p).distance - WIDTH / 2)`) e a comparação estrita em `evaluateCut` |
| REQ-FEAT-0005-04, REQ-FEAT-0008-04 | `src/lap.ts` `resolveCutLimits` (cada limite ausente usa o seu padrão de `src/trackData.ts`); `startLap` guarda os limites em `lines` |
| REQ-FEAT-0005-06 | `src/lap.ts` `invalidate(s, 'CUT')` (fase `ENDED` no passo; `stepCount` conta o passo da invalidação) |
| REQ-FEAT-0005-07 | `src/physics.ts` inalterado (`CIRCUIT.surfaceAt`, atrito e rolagem da grama) |
| REQ-FEAT-0005-10 | `src/lap.ts` `stepLap` (nenhum passo em `PAUSED`, logo `offTrackSteps` não avança) |
| REQ-FEAT-0005-11 | `src/lap.ts` `stepLap` (a sessão `ENDED` por corte ignora a chegada posterior) |

## Interface

`edgeDistanceM(point)`, `resolveCutLimits(reading)` exportados; `evaluateCut(session, kartAfterStep)` interna. Aplica-se a
todos os tipos de volta e a leitura `COMPLETE` ou `INCOMPLETE`. No reposicionamento em reconhecimento ou treino,
`offTrackSteps` volta a 0 (`repositionKart`).
