---
id: FEAT-0002
title: Aderência em curva sem sair de frente
feature: dirigibilidade
stage: fspec
status: validated
version: 2.0.0
sources: [US-0002, AC-US-0002-01, AC-US-0002-02, AC-US-0002-03, AC-US-0002-04, AC-US-0002-05]
---

# FEAT-0002 — Aderência em curva sem sair de frente

## Resumo

Na curva de referência (raio 18 m, o menor da pista sintética) a 50 km/h com esterço cheio, o kart faz a
curva: a telemetria não reporta `understeer` por mais de 200 ms consecutivos e a trajetória fica no
asfalto, com o acelerador solto ou mantido cheio durante toda a curva (`DOMAIN/DEC-02`, `DOMAIN/DEC-03`).
Acima dessa velocidade a frente perde aderência de forma progressiva, e a velocidade em que o subesterço
começa é pelo menos 15 % maior que a da linha de base.

## Canais

`web-desktop` e `web-mobile`: mesmos limites, com esterço cheio. No teclado o esterço cheio é a única
direção possível; na inclinação, é o ângulo mapeado para esterço 1. Com esterço parcial o kart faz raio
maior por construção e nenhum limite de subesterço é fixado (lacuna deliberada). Sem sensor ou sem
permissão: toque, esterço binário, mesmos requisitos (I4).

## Requisitos

- REQ-FEAT-0002-01: O sistema SHALL, no estado da simulação, ao percorrer a curva de referência a 50 km/h
  com esterço cheio mantido e acelerador 0 mantido durante toda a curva, não reportar `understeer` por mais
  de 200 ms consecutivos de tempo simulado em nenhum trecho da curva (AC-US-0002-01).
- REQ-FEAT-0002-02: O sistema SHALL, no estado da simulação, ao percorrer a curva de referência a 50 km/h
  com esterço cheio mantido e acelerador cheio mantido durante toda a curva, não reportar `understeer` por
  mais de 200 ms consecutivos de tempo simulado em nenhum trecho da curva (AC-US-0002-01).
- REQ-FEAT-0002-03: O sistema SHALL, no estado da simulação, ao percorrer a curva de referência a 50 km/h
  com esterço cheio mantido, em cada uma das duas condições de acelerador (0 mantido; cheio mantido),
  manter `surface` em `ASPHALT` em todos os passos da curva (AC-US-0002-02).
- REQ-FEAT-0002-04: O sistema SHALL, no ensaio `UNDERSTEER_ONSET`, apresentar velocidade de início do
  subesterço V1 tal que V1 ≥ 1,15 × V0, sendo V0 a velocidade de início do subesterço registrada na linha
  de base pelo mesmo ensaio (AC-US-0002-03).
- REQ-FEAT-0002-05: O sistema SHALL, no ensaio `UNDERSTEER_ONSET`, para velocidades de entrada acima de V1,
  apresentar duração máxima de `understeer` consecutivo que não diminui quando a velocidade de entrada
  aumenta (AC-US-0002-04).
- REQ-FEAT-0002-06: O sistema SHALL conter, na saída de `npm test` ou de `npm run bench:handling`, para o
  acerto Arcade assistido, os registros `REFERENCE_CORNER` (um por `throttleCondition`, com
  `maxUndersteerMs`) e `UNDERSTEER_ONSET` (com `v0Mps` e `v1Mps`, apresentados também em km/h) (AC-US-0002-05).
- REQ-FEAT-0002-07: O sistema SHALL reportar `FAIL` com `failReason` `BASELINE_MISSING` no ensaio
  `UNDERSTEER_ONSET` quando a linha de base não está registrada em `docs/physics.md`, sem julgar o
  requisito 04 nem extrapolar V0 [DOMAIN] (I9; US-0002, caso anormal "Linha de base ausente").
- REQ-FEAT-0002-08: O sistema SHALL contar os 200 ms do requisito 01 e 02 em tempo simulado, sem incluir o
  tempo em que a simulação esteve suspensa por pausa, perda de foco da aba ou perda do sensor [DOMAIN]
  (I8; US-0002, caso anormal "Pausa").

## Comportamento

Passo e telemetria: [FLOW-0001](../flows/FLOW-0001-passo-de-simulacao-e-hud.md),
[API-0001](../api/API-0001-telemetria-de-dirigibilidade.md). Ensaios `REFERENCE_CORNER` e
`UNDERSTEER_ONSET`: [RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md),
[FLOW-0002](../flows/FLOW-0002-ensaio-deterministico-e-piloto-de-teste.md),
[API-0003](../api/API-0003-saida-dos-ensaios.md). Estado de aderência:
[RULE-0001](../rules/RULE-0001-estado-de-aderencia-e-condicao-de-forcar.md).

| Situação | Comportamento |
|---|---|
| Curva de referência a 50 km/h, esterço cheio, acelerador 0 ou cheio | `understeer` consecutivo ≤ 200 ms; `surface` `ASPHALT` em todos os passos |
| Velocidade de entrada acima de 50 km/h | `understeer` pode exceder 200 ms; a perda é progressiva (requisito 05); a direção comum continua sem exigir drift |
| Esterço aplicado tarde (kart fora da linha ideal) | Nenhum limite fixado; vale só a entrada de curva do ensaio |
| Grama ou parede durante a curva | Redução de velocidade de [FEAT-0004](FEAT-0004-aceleracao-velocidade-grama-parede-e-hud.md); nenhum critério de subesterço fora do asfalto |
| Linha de base ausente | `FAIL` com `BASELINE_MISSING`; registrar a linha de base antes de julgar |
| Pausa, perda de foco, perda do sensor | Simulação suspensa; os 200 ms não contam a suspensão |
| Sensor ausente ou permissão negada antes da volta (`web-mobile`) | Toque com estado visível; requisitos inalterados |
| Rede indisponível | Sem efeito (D-FS-08) |

## Estado

Não define estados próprios; lê `handling`, `surface` e `simStepCount`
([API-0001](../api/API-0001-telemetria-de-dirigibilidade.md)).

## Configuração

Nenhuma. Nenhuma configuração existe para forçar um evento, injetar um estado ou habilitar um caminho de
depuração. A velocidade de entrada do ensaio é estado inicial colocado pelo ensaio, e o incremento
`entrySpeedStepMps` é parâmetro de ensaio reportado, não configuração da feature.

## Critérios de aceite

- Curva de referência a 50 km/h, esterço cheio, acelerador 0 e acelerador cheio: `maxUndersteerMs` ≤ 200
  nas duas condições e 0 passos fora do asfalto (satisfaz AC-US-0002-01, AC-US-0002-02; cobre os requisitos
  01, 02, 03 e 08).
- `UNDERSTEER_ONSET` com linha de base: V1 ≥ 1,15 × V0; acima de V1, `maxUndersteerMs` não decresce com a
  velocidade (satisfaz AC-US-0002-03, AC-US-0002-04; cobre os requisitos 04 e 05).
- Sem linha de base: `FAIL` com `BASELINE_MISSING` (satisfaz AC-US-0002-03, caso anormal; cobre o requisito
  07).
- A saída de `npm test` ou de `npm run bench:handling` contém `REFERENCE_CORNER` por condição de acelerador
  e `UNDERSTEER_ONSET` com `v0Mps` e `v1Mps` (satisfaz AC-US-0002-05; cobre o requisito 06).

## Pontos em aberto

Nenhum.
