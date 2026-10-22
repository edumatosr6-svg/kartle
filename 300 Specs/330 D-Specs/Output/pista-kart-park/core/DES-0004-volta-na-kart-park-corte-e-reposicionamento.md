---
id: DES-0004
title: Volta na Kart Park — corte pela borda da pista, reposicionamento e largada
feature: pista-kart-park
stage: dspec
status: validated
version: 1.0.0
sources: [FEAT-0003, FEAT-0005, FLOW-0002, RULE-0001, REQ-FEAT-0001-08, REQ-FEAT-0002-12, REQ-FEAT-0003-08, REQ-FEAT-0003-10, REQ-FEAT-0003-11, REQ-FEAT-0003-12, REQ-FEAT-0003-13, REQ-FEAT-0003-15, REQ-FEAT-0005-07]
---

# DES-0004 — Volta na Kart Park: corte pela borda da pista, reposicionamento e largada

## Realiza

Os `REQ-*` em `sources`: na Kart Park a volta é validada pelas regras de `race-lap-validation`, sem mudança de
regra: marcador pulado dá `INVALID` com `MISSED_MARKER` (REQ-FEAT-0003-08), a volta completa pelos marcadores
em ordem dá `VALID` (REQ-FEAT-0003-13), o atalho pela grama da curva 4 dá `INVALID` (REQ-FEAT-0003-12),
chegada cruzada de novo, contramão, pausa, perda de foco e recarga seguem as mesmas regras
(REQ-FEAT-0003-15); o corte compara com `cutDistanceM` a distância medida da **borda da pista** da Kart Park,
que inclui a zebra (REQ-FEAT-0003-10, -11; REQ-FEAT-0005-07); o kart começa na `startPosition` declarada
(REQ-FEAT-0001-08); a linha central usada no estado da simulação é a do arquivo (REQ-FEAT-0002-12), também no
reposicionamento, que hoje usa a linha central da pista sintética.

## Posicionamento

`src/lap.ts`, camada **simulação**, alterado. Passa a importar `trackEdgeDistanceM` de `src/physics.ts` e
`nearestOnCenterline` de `src/trackGeometry.ts`. O modelo de estados da volta (`LapSession`, `LapResult`,
`LapStateView`, os comandos e os seus códigos) não muda. Nenhum módulo novo.

## Interface

| Trecho atual | Mudança |
|---|---|
| `startLap`, `:109-112` | a construção do kart parado na largada passa a ser a função exportada `kartAtStart(start)`; `startLap` a chama com o mesmo resultado bit a bit |
| `kartAtStart(start)` | nova: `(StartPosition \| undefined) => State`: `{...initialState(), x: start.xM, z: start.zM, heading: start.headingDeg * Math.PI / 180}`, ou `initialState()` sem largada; usada também pela sessão de treino ([DES-0005](DES-0005-sessao-de-treino-catalogo-e-selecao-de-pista.md)) |
| `evaluateCut`, `:245-252` | `edgeDistanceM(kart)` passa a `trackEdgeDistanceM(session.environment, kart)`; as comparações estritas, o acumulador `offTrackSteps` e `isCutExceeded` não mudam |
| `repositionKart`, `:154-161` | com `lap.environment.track`, o destino é `nearestOnCenterline(track, from)`: posição no ponto mais próximo da linha central do arquivo e rumo do segmento no sentido de percurso; sem `track`, o código de hoje (`nearest` e `track` da pista sintética) |
| `edgeDistanceM`, `:218-220` | inalterado e ainda exportado (pista sintética) |

As linhas da volta (chegada, limites, marcadores) continuam vindo da leitura (`:106-108`) e os cruzamentos de
`evaluateDisplacement` (`:223-242`) continuam os mesmos: a Kart Park só entrega linhas transversais que
atravessam a pista e se estendem até `cutDistanceM` além da borda da pista
([DES-0010](../pipeline/DES-0010-preparo-offline-do-arquivo-da-kart-park.md)). Por isso o atalho da curva 4,
feito a mais de 3 m da borda da pista na grama de 12 a 26 m, não cruza ao menos um marcador e termina
`INVALID` com `MISSED_MARKER` ao cruzar a chegada, ou com `CUT` antes, se passar 1000 ms a mais de 3 m da
borda.

## Colaboradores

Chama `step`, `trackEdgeDistanceM`, `initialState` (`src/physics.ts`), `nearestOnCenterline`
(`src/trackGeometry.ts`), `crossLine`, `nearest`, `track` (`src/track.ts`) e `src/lapTiming.ts`. É chamado por
`src/trainingSession.ts` (`startLap` via `startTrainingLap`, `kartAtStart`), pela aplicação (comandos da
volta) e pelos testes.

## Estado e concorrência

Sem mudança: funções puras sobre uma `LapSession` imutável, rejeições como valores, contador de sequência
`stepCount` da volta, duração do corte em passos de `STEP` (`offTrackSteps`), que só avança em `RUNNING` e
volta a 0 sobre a pista. Uma volta repetida pela mesma sequência de `Input` dá a mesma sessão.

## Comportamento em falha

Os códigos de rejeição de `race-lap-validation` não mudam (`LAP_ALREADY_ACTIVE`, `TRACK_DATA_UNREADABLE`,
`TRACK_SCHEMA_UNSUPPORTED`, `OFFICIAL_NOT_AVAILABLE`, `NO_ACTIVE_LAP`, `LAP_ENDED`, `ALREADY_PAUSED`,
`NOT_PAUSED`, `NOT_RUNNING`). Sem rede, sem escrita, sem registro.

## Determinismo (D-DS-07)

Passo fixo, tempo inteiro em ms (`lapTiming`), sem relógio nem sorteio. Provas em
`tests/pista-kart-park-lap.test.ts`, com o piloto de teste da Kart Park ([test-strategy](../test-strategy.md)):
volta completa `VALID` com 4 setores; marcador pulado por uma excursão lateral curta a 3,5 m da borda da
pista dá `MISSED_MARKER` e não `CUT`; kart mantido a mais de 3 m da borda da pista por 121 passos dá `CUT` no
passo 121 e por 120 passos não dá; o atalho de cerca de 147 m a cerca de 200 m termina `INVALID`; kart
rodando sobre a zebra por mais de 1000 ms, sem roda além dela, não dá `CUT`; reposicionamento na Kart Park põe
o kart sobre a linha central do arquivo; a mesma sequência de `Input` dá `lapMs` e `sectorMs` iguais em duas
execuções. Os testes de `race-lap-validation` sobre a pista sintética (corte, reposicionamento, tipos de
volta) passam sem alteração, porque o caminho sem `track` é o de hoje.

## Feature flag

Nenhuma: na pista sintética o comportamento é o de antes, e na Kart Park a borda é a da pista que o F-Spec
define; não há configuração dos limites de corte (FEAT-0003, Configuração).

## Pontos em aberto

Nenhum.
