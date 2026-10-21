---
id: DES-0003
title: Cruzamentos, marcadores, setores e chegada — implementação
feature: race-lap-validation
stage: code
status: draft
version: 1.0.0
sources: [FEAT-0002, FEAT-0004, FEAT-0006, FEAT-0009, REQ-FEAT-0002-01, REQ-FEAT-0002-10, REQ-FEAT-0002-12, REQ-FEAT-0002-13, REQ-FEAT-0002-14, REQ-FEAT-0004-01, REQ-FEAT-0004-02, REQ-FEAT-0004-03, REQ-FEAT-0004-04, REQ-FEAT-0004-05, REQ-FEAT-0004-06, REQ-FEAT-0004-07, REQ-FEAT-0004-09, REQ-FEAT-0004-10, REQ-FEAT-0004-11, REQ-FEAT-0004-12, REQ-FEAT-0004-13, REQ-FEAT-0006-13, REQ-FEAT-0009-01]
---

# DES-0003 — Cruzamentos, marcadores, setores e chegada — implementação

Primitivas geométricas em `src/track.ts` (camada dado de pista): `Line`, `sideOf(line, point)` e `crossLine(line, from,
to)`. Avaliação por passo em `src/lap.ts` (função interna `evaluateDisplacement`), camada simulação.

## Realização por requisito

| Requisito | Arquivo e símbolo |
|---|---|
| REQ-FEAT-0002-01, REQ-FEAT-0002-13 | `src/lap.ts` `evaluateDisplacement` (chegada `FORWARD` com `markersPassedCount` igual ao total) e `complete` |
| REQ-FEAT-0002-10, REQ-FEAT-0002-14 | `src/lap.ts` `evaluateDisplacement` (só o limite de índice `sectorBoundsMs.length + 1`, só `FORWARD`, instante por `instantMsAt`) |
| REQ-FEAT-0002-12, REQ-FEAT-0004-13 | `src/lap.ts` `stepLap` (`ENDED` devolve a sessão; nenhum segundo resultado) |
| REQ-FEAT-0004-01, -02, -05, -06 | `src/lap.ts` `evaluateDisplacement` (chegada `FORWARD` com marcadores faltando) e `invalidate(s, 'MISSED_MARKER')`; `src/track.ts` `SYNTHETIC_TRACK_FILE.markers` |
| REQ-FEAT-0004-03 | `src/lap.ts` `buildResult` (sem `lapMs` nem `sectorMs` com `INVALID`) |
| REQ-FEAT-0004-04 | `src/lap.ts` `invalidReason` `MISSED_MARKER`; texto em `src/lapMessages.ts` `describeLap` |
| REQ-FEAT-0004-07 | `src/lap.ts` `invalidate` (fase `ENDED` no passo da chegada; `stepCount` congela) |
| REQ-FEAT-0004-09, REQ-FEAT-0004-10, REQ-FEAT-0006-13 | `src/lap.ts` `evaluateDisplacement` (cruzamento `REVERSE` da chegada ignorado; a fase segue `RUNNING`, sem resultado) |
| REQ-FEAT-0004-11, REQ-FEAT-0004-12 | `src/lap.ts` `evaluateDisplacement` (só o marcador de índice `markersPassedCount + 1`, só `FORWARD`) |
| REQ-FEAT-0009-01 | `src/track.ts` `crossLine` e `src/lap.ts` `evaluateDisplacement` (nenhuma regra na renderização) |

## Interface

`crossLine` devolve `null` ou `{sense, fraction}`: `FORWARD` quando `sideOf(from) < 0` e `sideOf(to) >= 0`, `REVERSE`
quando `sideOf(from) > 0` e `sideOf(to) <= 0`; `fraction = |side(from)| / |side(to) - side(from)|` em (0, 1]; o ponto de
cruzamento tem de cair no segmento (parâmetro de 0 a 1). Ordem no passo: marcador, limite de setor, chegada, depois o corte
(ADR-0004, item 1). Só as linhas de uma leitura `COMPLETE` entram em `LapSession.lines`; em `INCOMPLETE` as listas são
vazias e `finishLine` é ausente, de modo que o passo ignora marcadores, setores e chegada.
