---
id: DES-0002
title: Telemetria de dirigibilidade por passo (API-0001)
feature: dirigibilidade
stage: dspec
status: validated
version: 1.0.0
sources: [API-0001, FLOW-0001, RULE-0001, FEAT-0001, FEAT-0002, FEAT-0003, FEAT-0004, REQ-FEAT-0001-05, REQ-FEAT-0003-03, REQ-FEAT-0003-10, REQ-FEAT-0004-05, REQ-FEAT-0004-06, REQ-FEAT-0006-01, REQ-FEAT-0006-02]
---

# DES-0002 — Telemetria de dirigibilidade por passo (API-0001)

## Realiza

O contrato API-0001 campo a campo: a leitura `getHandlingTelemetry` que o HUD faz em todos os quadros
(AC-US-0004-06) e que os ensaios fazem em todos os passos (AC-US-0001-01 a AC-US-0004-05), com `forcing` e
`driftActive` para classificar o passo (RULE-0001; REQ-FEAT-0003-03), `surface` e `wallContact` para grama e
parede (AC-US-0004-03, -05), `understeerStepCount` possível por `handling` (REQ-FEAT-0001-05), e a regra de
que nada é decidido fora da simulação (REQ-FEAT-0003-10, REQ-FEAT-0006-01, -02).

## Posicionamento

`src/physics.ts`, camada **Simulação**, alterado (estende [DES-0001](DES-0001-acerto-arcade-assistido-v5-e-assistencias.md);
não há módulo novo: a telemetria é leitura do `State` que este módulo produz, sem dependência de `src/lap.ts`).

## Interface

| Função | Entradas | Saída |
|---|---|---|
| `getHandlingTelemetry(state, setup)` | `state: State \| undefined` (o `kart` da `LapSession`, ou o estado de um ensaio); `setup: SetupRef = {setupId, setupVersion}` do acerto em uso, passado por quem iniciou a volta ou o ensaio | `HandlingTelemetry`, ou `{code: 'NO_STATE'}` quando `state` é ausente |

`HandlingTelemetry`, exatamente os campos de API-0001 e nenhum outro:

| Campo | Tipo | Unidade | Origem no `State` |
|---|---|---|---|
| `simStepCount` | inteiro ≥ 0 | passos | `state.stepCount` (DES-0001) |
| `setupId` | enum | — | `setup.setupId` |
| `setupVersion` | texto | — | `setup.setupVersion` |
| `speedMps` | número ≥ 0 | m/s | `state.speed` |
| `handling` | `grip \| understeer \| oversteer \| sliding` | — | `state.telemetry.handling` (minúsculas, como hoje) |
| `sideslipRad` | número ≥ 0 | rad | `Math.abs(state.telemetry.sideslip)` |
| `yawRateRadPerS` | número | rad/s | `state.yawRate`, com sinal |
| `surface` | `ASPHALT \| GRASS` | — | `state.telemetry.surface` mapeado `asphalt` → `ASPHALT`, `grass` → `GRASS` |
| `wallContact` | booleano | — | `state.telemetry.wallContact` |
| `forcing` | booleano | — | `state.telemetry.forcing` |
| `driftActive` | booleano | — | `state.maneuvers.drifting` |

Estado inicial (`initialState()`): `simStepCount` 0, `speedMps` 0, `handling` `grip`, `sideslipRad` 0,
`yawRateRadPerS` 0, `surface` conforme a posição de largada (`ASPHALT` na pista sintética), `wallContact`,
`forcing` e `driftActive` falsos — os valores de "Vazio" de SCR-0001.

Por que `setup` é parâmetro e não campo do `State`: a `LapSession` congela uma cópia do `KartConfig`
(`src/lap.ts:120`) e `RENTAL_KART`/`ARCADE_KART` não podem ganhar campos (frozen test), de modo que a
identidade do acerto não cabe no `config`; quem inicia a volta ou o ensaio conhece o acerto e o passa na
leitura. Em `src/main.ts` o `setup` e o `config` da volta são fixados no mesmo ponto (`beginLap`,
[DES-0007](../web/DES-0007-integracao-da-aplicacao-e-adaptadores.md)), o que impede divergência.

## Colaboradores

Chamado por `src/main.ts` (HUD, por quadro), por `scripts/handlingBench.ts` (por passo) e pelos testes. Não
chama nada além dos campos do `State`.

## Estado e concorrência

Leitura pura: não altera o estado; repetir a chamada sobre o mesmo `state` devolve o mesmo valor. Um valor
por passo, ordenado por `simStepCount`; na suspensão o contador não avança e a leitura devolve o último
passo (o `kart` da sessão pausada). Não há chave de deduplicação porque não há escrita.

## Comportamento em falha

`state` ausente devolve `{code: 'NO_STATE'}` sem lançar. Não há dependência, tempo-limite nem escrita.
Nada é registrado em log.

## Observabilidade

A própria leitura é o instrumento: os ensaios de [DES-0004](DES-0004-ensaios-de-dirigibilidade-e-saida.md)
derivam toda medida dela, e o HUD a exibe.

## Determinismo (D-DS-07)

Função pura do `State`; sem relógio nem sorteio. Prova: `tests/dirigibilidade-telemetry.test.ts` afirma os
campos, os tipos e os valores iniciais, a ordem por `simStepCount`, a transição `ASPHALT` → `GRASS` →
`ASPHALT` num ambiente de teste com fronteira, `wallContact` verdadeiro só no passo do contato em `CIRCUIT`,
e `NO_STATE` sem estado.

## Feature flag

Nenhuma: leitura aditiva do estado que não altera nenhum passo (API-0001, Compatibilidade).

## Pontos em aberto

Nenhum.
