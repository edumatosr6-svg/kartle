---
id: ADR-0004
title: Zebra como terceira superfície da física, com o caminho da pista sintética inalterado bit a bit
feature: pista-kart-park
stage: dspec
status: validated
version: 1.0.0
sources: [RULE-0001, FEAT-0005, FEAT-0007, REQ-FEAT-0005-05, REQ-FEAT-0005-08, REQ-FEAT-0005-09, REQ-FEAT-0007-08, REQ-FEAT-0007-09, REQ-FEAT-0007-10]
---

# ADR-0004 — Zebra como terceira superfície da física

## Contexto

A física conhece duas superfícies (`src/physics.ts:9`): o coeficiente do pneu é `friction` ou `grassFriction`
(`:143`, `:215`), o rolamento muda na grama (`:208`), a fração de rodas no asfalto entra na assistência e na
perda de velocidade da grama (`:229-230`, `:252`), e a manobra trata como "fora da pista" toda roda que não é
asfalto (`:300-302`, `:318`). RULE-0001 exige que cada pneu na zebra tenha 85 % da aderência do mesmo pneu no
asfalto, com a mesma carga e o mesmo escorregamento, e que a zebra seja pista em toda outra regra de superfície
(REQ-FEAT-0005-08, -09), sem campo de `Input` novo (REQ-FEAT-0007-09). A pista sintética continua a pista dos
ensaios calibrados de `race-lap-validation` e de `dirigibilidade` (REQ-FEAT-0007-10).

## Decisão

1. `Surface` ganha `curb`; o coeficiente de um pneu na zebra é `friction * CURB_GRIP_PC` (0,85), aplicado sobre
   o `friction` já escalado do pneu traseiro (forçar, drift), de modo que a razão para o mesmo pneu no asfalto
   é 0,85 em qualquer condição.
2. Toda outra regra de superfície trata a zebra como asfalto: rolamento, perda de velocidade da grama (que passa
   a usar a fração de rodas na grama), condição de pista da manobra.
3. A média de coeficientes da assistência ganha o termo da zebra, `(CURB_GRIP_PC * friction − grassFriction) *
   curbFraction`, que é 0 sem zebra.
4. A superfície por roda do contrato API-0003 é a da posição de cada roda no fim do passo, lida por
   `getTrackContact`; a telemetria de `dirigibilidade` continua `ASPHALT` ou `GRASS`.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Zebra como asfalto com `friction` reduzido por um campo de `KartConfig` | a aderência seria do acerto, não da superfície; mudaria o acerto publicado de `dirigibilidade` |
| Zebra como grama com outro coeficiente | aplicaria a perda de velocidade e o rolamento da grama, contra REQ-FEAT-0005-09 |
| Campo de `Input` ou sinal da aplicação para a zebra | contraria REQ-FEAT-0007-09 e I2 |
| Reescrever as expressões da fração de rodas | arriscaria mudar o último bit dos resultados da pista sintética; a forma escolhida dá exatamente os mesmos bits sem zebra (`k / 4` é exato e o termo novo é somado como zero) |

## Consequências

- Na pista sintética e em todo ambiente de `dirigibilidade` (sem zebra), cada cálculo dá os mesmos bits de
  hoje; os testes e as linhas de base existentes continuam valendo.
- O drift não é cancelado pela zebra; é cancelado pela grama, como era por "fora do asfalto".
- `wheelGripPc` da grama é `grassFriction / friction` do acerto: a fração da regra existente, só informativa.

## Status

Proposta deste conjunto, a validar.
