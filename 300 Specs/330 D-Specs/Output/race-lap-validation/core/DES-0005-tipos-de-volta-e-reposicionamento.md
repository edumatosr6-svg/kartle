---
id: DES-0005
title: Tipos de volta, reposicionamento e resultado oficial
feature: race-lap-validation
stage: dspec
status: validated
version: 1.0.0
sources: [FEAT-0006, FEAT-0008, REQ-FEAT-0006-01, REQ-FEAT-0006-03, REQ-FEAT-0006-04, REQ-FEAT-0006-06, REQ-FEAT-0006-08, REQ-FEAT-0006-11, REQ-FEAT-0006-12, REQ-FEAT-0006-14, REQ-FEAT-0006-15, REQ-FEAT-0008-06, REQ-FEAT-0008-07]
---

# DES-0005 — Tipos de volta, reposicionamento e resultado oficial

## Realiza

Os `REQ-*` em `sources`: reposicionar invalida a volta oficial com o motivo "reposicionamento" e é livre em
reconhecimento e treino (AC-US-0007-01 a -06); reposicionamento fora de `RUNNING` ou com a volta encerrada sem
efeito (REQ-FEAT-0006-14, -15); resultado de reconhecimento, treino e de pista de dado incompleto identificado
como não oficial (AC-US-0008-01, -02, -05); nenhuma volta oficial numa pista de dado incompleto e treino
pilotável (AC-US-0008-03, -04). Regra: RULE-0005.

## Posicionamento

Funções `repositionKart`, `buildResult` e `offeredLapKinds` em `src/lap.ts`, camada **simulação** (estende
DES-0001). O desafio diário, que define o tipo, é outra feature; esta só recebe `lapKind` no pedido.

## Interface

- `repositionKart(lap)` (rejeições em DES-0001). Efeito, com a volta em `RUNNING`:

| `lapKind` | Efeito |
|---|---|
| `OFFICIAL` | `validity` `INVALID`, `invalidReason` `REPOSITION`, fase `ENDED` imediatamente, sem mover o kart nem avançar o `stepCount`; resultado sem tempo. O reposicionamento é aplicado entre dois passos, o que equivale a "o passo do pedido" de RULE-0002: nenhum tempo é acrescentado depois dele |
| `RECON`, `TRAINING` | o kart é recolocado; `validity`, `invalidReason`, `stepCount` e tempo não mudam, e nenhuma penalidade é acrescentada. Pode repetir sem limite |

- **Destino do reposicionamento** (lacuna deliberada do F-Spec, decisão de projeto em ADR-0004): o ponto da linha
  central mais próximo do kart (`nearest(kart).position`), com `heading` igual ao rumo do segmento da linha
  central nesse ponto, no sentido de percurso (`Math.atan2(dx, dz)` do segmento `track[i]` a `track[i + 1]`),
  velocidade 0 e demais campos como em `initialState()`, mantendo `elapsed` do `State`. `offTrackSteps` volta a 0.
  O estilo (`maneuvers`) é reiniciado como no `reset` existente.
- **Princípio do deslocamento**: todo deslocamento do kart é avaliado para cruzamentos de linha, inclusive o do
  reposicionamento. O deslocamento do ponto antigo ao destino passa por `evaluateDisplacement`
  ([DES-0003](DES-0003-cruzamentos-marcadores-setores-e-chegada.md)) com o instante `toMs(stepCount)`. Sem essa
  regra, uma volta de treino poderia saltar um limite de setor sem passar por marcador e terminar sem os quatro
  tempos de setor.
- `buildResult(session)`: monta o `LapResult` único ([DM-0002](../data/DM-0002-estado-da-volta-em-memoria.md)).
  `official` = `lapKind` `OFFICIAL` **e** `validity` `VALID` **e** `trackStatus` `COMPLETE`; em qualquer outra
  combinação é falso. Uma volta de reconhecimento ou de treino nunca produz `official` verdadeiro, nem em pista
  de dado completo (AC-US-0008-02). Em pista `INCOMPLETE` todo resultado é não oficial (AC-US-0008-05).
- `offeredLapKinds(reading, challengeKinds = [])`: `COMPLETE` devolve `TRAINING` mais os tipos que o desafio
  diário definir em `challengeKinds`; `INCOMPLETE` devolve só `TRAINING`, nunca `OFFICIAL` (AC-US-0008-03);
  `UNSUPPORTED_SCHEMA` e `UNREADABLE` devolvem lista vazia. Esta feature chama a função com `challengeKinds`
  vazio, pois o desafio diário não existe ainda; assim a oferta nunca inclui volta oficial nem de reconhecimento
  sem que o desafio as defina. A apresentação exibe exatamente a lista, sem decidir nada (I2).

## Colaboradores

Chama `nearest` e `track` (`src/track.ts`), `initialState` (`src/physics.ts`), `toMs`, DES-0003. Chamado por
`src/main.ts` (tecla `R` e botão de reposicionar) e por `src/lap.ts`.

## Estado e concorrência

Lê `lapKind`, `phase`, `trackStatus`; altera `kart`, `validity`, `invalidReason`, `phase`, `result`,
`offTrackSteps`.

- **Idempotência**: em `OFFICIAL` o primeiro pedido encerra a volta e os seguintes recebem `LAP_ENDED`, sem segundo
  resultado e mantendo o motivo `REPOSITION` do primeiro (REQ-FEAT-0006-14). Em `RECON` e `TRAINING` cada pedido
  recoloca o kart sem outro efeito de validade. Em `COUNTDOWN` e `PAUSED` o pedido é rejeitado com `NOT_RUNNING`,
  porque pausar ou aguardar não é reposicionar (REQ-FEAT-0006-15).
- Contador de sequência: `stepCount` do pedido; o reposicionamento não o avança.
- O tipo não muda durante a sessão (INV-4).

## Comportamento em falha

Sem dependência. Um pedido `OFFICIAL` em leitura `INCOMPLETE` que chegue à simulação é rejeitado em `startLap`
com `OFFICIAL_NOT_AVAILABLE`; a apresentação não deveria tê-lo emitido, e nenhuma volta é criada. Sem registro de
log: a rejeição é um valor devolvido.

## Determinismo (D-DS-07)

O destino é função do estado do kart e da linha central; sem relógio nem sorteio; o passo continua `STEP`. Provas
em `tests/lap-kinds.test.ts`: reposicionar em `OFFICIAL` invalida no ato, sem tempo e com `REPOSITION`; em
`TRAINING` e `RECON` N passos depois do sinal verde o `elapsedMs` é `toMs(N)` com e sem reposicionamentos; o
segundo reposicionamento oficial dá `LAP_ENDED`; `NOT_RUNNING` em contagem e pausa; `official` falso em
`TRAINING` e `RECON` concluídos e em pista `INCOMPLETE`; `OFFICIAL_NOT_AVAILABLE`; `offeredLapKinds` por status.

## Feature flag

Nenhuma: FEAT-0006 não tem chave; o tipo da volta é entrada do pedido, e não ajuste.

## Pontos em aberto

Nenhum.
