---
id: DM-0002
title: Estado e resultado da volta em memória — implementação
feature: race-lap-validation
stage: code
status: draft
version: 1.0.0
sources: [FEAT-0001, FEAT-0002, FEAT-0003, REQ-FEAT-0001-05, REQ-FEAT-0002-04, REQ-FEAT-0002-11, REQ-FEAT-0003-08]
---

# DM-0002 — Estado e resultado da volta em memória — implementação

Tipos `LapSession`, `LapResult` e `LapStateView` em `src/lap.ts`. A sessão é imutável: cada comando ou passo devolve um
objeto novo; nada é gravado em `localStorage`, `sessionStorage` ou IndexedDB.

## Realização por requisito

| Requisito | Arquivo e símbolo |
|---|---|
| REQ-FEAT-0001-05 | `src/lap.ts` `LapSession.stepCount` (avança só em `RUNNING`, em `stepLap`); `getLapState` deriva `elapsedMs = toMs(stepCount)` |
| REQ-FEAT-0002-04 | `src/lap.ts` `LapResult.lapMs`, `LapResult.sectorMs` (inteiros em ms, montados por `buildResult`) |
| REQ-FEAT-0002-11 | `src/lap.ts` `LapResult.trackId`, `LapResult.trackVersion` (copiados da leitura em `startLap`) |
| REQ-FEAT-0003-08 | `src/lap.ts` `stepLap` devolve a própria sessão em `PAUSED`; nenhum contador muda |

## Campos

`LapSession` carrega os campos da tabela de DM-0002 (`lapKind`, `trackId`, `trackVersion`, `challengeNumber?`,
`trackStatus`, `lines`, `config` congelado, `phase`, `resumePhase?`, `pauseCause?`, `validity`, `invalidReason?`,
`countdownSteps`, `stepCount`, `markersPassedCount`, `sectorBoundsMs`, `offTrackSteps`, `kart`, `result?`) e mais um campo
`environment` (`Environment` da física), que guarda o parâmetro `environment` de `startLap` para que `stepLap(lap, input)`
chame `step` com ele, como DES-0001 exige; é o `CIRCUIT` por padrão e não muda na sessão (INV-4). Os campos opcionais são
omitidos quando ausentes (INV-2), de modo que `getLapResult` devolve exatamente as chaves de API-0001.

Derivados em `getLapState`: `countdownRemainingMs = 3000 - toMs(countdownSteps)`, `elapsedMs` (`lapMs` após volta válida,
senão `toMs(stepCount)`), `completedSectorMs` (diferenças de `sectorBoundsMs`; os quatro `sectorMs` do resultado após volta
válida).
