---
id: ADR-0002
title: A volta é um módulo sobre o passo da física, com comandos fora de Input
feature: race-lap-validation
stage: dspec
status: validated
version: 1.0.0
sources: [FEAT-0003, FEAT-0009, REQ-FEAT-0003-14, REQ-FEAT-0009-01, REQ-FEAT-0009-03]
---

# ADR-0002 — A volta é um módulo sobre o passo da física, com comandos fora de `Input`

## Contexto

O contrato de simulação é `step(state, input, dt)` com `STEP` fixo e `Input` com o significado atual (I8, NFR-0010).
A validação de volta precisa de estado próprio (fase, contadores, marcadores, resultado), de comandos (pausa,
retomada, reposicionamento, início) e de regras que hoje não existem na simulação (a validação preliminar está em
`src/main.ts:276`, camada de aplicação, o que infringe I2). O benchmark de física e a configuração dos karts não
podem mudar (NFR-0011). A decisão é cara de reverter porque define o formato do que um replay precisará registrar.

## Decisão

1. A volta vive em `src/lap.ts` (simulação), como funções puras sobre uma `LapSession` imutável que **contém** o `State`
   da física e chama o `step` existente sem alterá-lo. `src/physics.ts` e `src/maneuvers.ts` ficam intactos.
2. Os comandos (`startLap`, `pauseLap`, `resumeLap`, `repositionKart`) **não** são campos de `Input`: são operações
   aplicadas entre dois passos. O avanço continua sendo `stepLap(lap, input)` com o `Input` normalizado atual.
3. Uma sessão é reproduzível pela tripla (configuração, dado de pista lido, sequência de pares passo e `Input`) mais o
   cronograma de comandos, indexado pelo `stepCount` ou `countdownSteps` vigente quando cada comando foi aplicado.
   O formato de gravação do replay, da submissão e da persistência não é definido por esta feature.
4. A sessão é imutável: um passo devolve uma nova sessão, como `step` devolve um novo `State`.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Acrescentar fase e contadores ao `State` e à função `step` da física | altera `src/physics.ts`, arrisca as saídas dos benchmarks e mistura o modelo do veículo com regras de volta |
| Acrescentar campos de comando a `Input` (por exemplo `pause`, `reposition`) | muda o significado de `Input`, que o NFR-0010 congela, e quebra replays armazenados |
| Manter a validação em `src/main.ts` | a regra ficaria na aplicação, contra I2 e REQ-FEAT-0009-01, e não rodaria em `npm test` |
| Sessão mutável (objeto com métodos) | mais fácil de aliasing e de passo duplicado; a imutabilidade torna "passo repetido" e "estado anterior" explícitos e a prova mais simples |

## Consequências

- Mudança local: um módulo novo, dois pequenos de apoio, um retoque em `src/track.ts` e a integração em `src/main.ts`.
- O teste de camada garante que a simulação não importa DOM, Three.js nem áudio e não lê relógio (I2).
- Uma sessão é cópia barata de campos e de uma referência ao `State`; a alocação por passo é da mesma ordem da do
  `step` atual (um objeto por passo).
- O custo de futura validação em servidor é baixo: a mesma função roda em Node.

## Status

Proposta aceita neste conjunto.
