---
id: FEAT-0002
title: Aderência em curva sem sair de frente
feature: dirigibilidade
stage: fspec
status: validated
version: 3.2.0
sources: [US-0002, AC-US-0002-01, AC-US-0002-02, AC-US-0002-03, AC-US-0002-04, AC-US-0002-05, AC-US-0002-06]
---

# FEAT-0002 — Aderência em curva sem sair de frente

## Resumo

Na curva de referência — ensaio na pista de teste: arco de raio 18 m, faixa de asfalto da largura da pista,
sem paredes (`DOMAIN/REF-03`) — a 50 km/h com esterço cheio, o kart faz a curva: a telemetria não reporta
`understeer` por mais de 200 ms consecutivos e a trajetória fica dentro da faixa de asfalto do arco, com o
acelerador solto ou mantido cheio durante toda a curva (`DOMAIN/DEC-02`, `DOMAIN/DEC-03`). Acima dessa
velocidade a frente perde aderência de forma progressiva, e a velocidade em que o subesterço começa é pelo
menos 15 % maior que a da linha de base medida no mesmo ensaio e no mesmo arco: uma varredura em patamares
de velocidade mantida no arco, que a saída da faixa encerra (`DOMAIN/DEC-11`, `DOMAIN/REF-04`). A pista
sintética não tem curva de 18 m (raios mínimos 24 m e 25 m, grampo de 4 m): nenhum ensaio desta
funcionalidade roda nela.

## Canais

`web-desktop` e `web-mobile`: mesmos limites, com esterço cheio. No teclado o esterço cheio é a única
direção possível; na inclinação, é o ângulo mapeado para esterço 1. Com esterço parcial o kart faz raio
maior por construção e nenhum limite de subesterço é fixado (lacuna deliberada). Sem sensor ou sem
permissão: toque, esterço binário, mesmos requisitos (I4). Em nenhum canal o Jogador pilota na pista de
teste: o ensaio alimenta a simulação com a mesma forma de `Input` que o adaptador do canal produz
(`SEED/RD-06`).

## Requisitos

- REQ-FEAT-0002-01: O sistema SHALL, no estado da simulação, ao percorrer a curva de referência da pista de
  teste (arco de raio 18 m) com entrada a 50 km/h, esterço cheio mantido e acelerador 0 mantido durante
  todo o arco, não reportar `understeer` por mais de 200 ms consecutivos de tempo simulado em nenhum
  trecho do arco (AC-US-0002-01).
- REQ-FEAT-0002-02: O sistema SHALL, no estado da simulação, ao percorrer a curva de referência da pista de
  teste com entrada a 50 km/h, esterço cheio mantido e acelerador cheio mantido durante todo o arco, não
  reportar `understeer` por mais de 200 ms consecutivos de tempo simulado em nenhum trecho do arco
  (AC-US-0002-01).
- REQ-FEAT-0002-03: O sistema SHALL, no estado da simulação, ao percorrer a curva de referência da pista de
  teste com entrada a 50 km/h e esterço cheio mantido, em cada uma das duas condições de acelerador (0
  mantido; cheio mantido), manter o kart dentro da faixa de asfalto do arco (`surface` `ASPHALT`) em todos
  os passos do arco (AC-US-0002-02).
- REQ-FEAT-0002-04: O sistema SHALL, no ensaio `UNDERSTEER_ONSET` na pista de teste, apresentar velocidade
  de início do subesterço V1 tal que V1 ≥ 1,15 × V0, sendo V0 a velocidade de início do subesterço
  registrada na linha de base pelo mesmo ensaio, no mesmo arco de raio 18 m (AC-US-0002-03).
- REQ-FEAT-0002-05: O sistema SHALL, no ensaio `UNDERSTEER_ONSET` com o novo acerto, apresentar em cada
  patamar completo de velocidade mantida acima de 50 km/h medido antes do fim da varredura uma maior
  sequência de `understeer` consecutivo dentro do patamar, em ms de tempo simulado, não menor que a do
  patamar anterior acima de 50 km/h, de velocidade menor, comparando patamar a patamar e nunca um máximo
  acumulado ao longo da varredura (AC-US-0002-04).
- REQ-FEAT-0002-06: O sistema SHALL conter, na saída de `npm test` ou de `npm run bench:handling`, para o
  acerto Arcade assistido, os registros `REFERENCE_CORNER` (um por `throttleCondition`, com
  `benchEnvironment` `TEST_PAD`, `arcRadiusM`, `laneWidthM` e `maxUndersteerMs`) e `UNDERSTEER_ONSET`
  (com `arcRadiusM`, `laneWidthM`, `v0Mps` e `v1Mps`, apresentados também em km/h) (AC-US-0002-05).
- REQ-FEAT-0002-07: O sistema SHALL reportar `FAIL` com `failReason` `BASELINE_MISSING` no ensaio
  `UNDERSTEER_ONSET` quando a linha de base não está registrada em `docs/physics.md` para o mesmo ensaio,
  no mesmo ambiente (`TEST_PAD`) e no mesmo `arcRadiusM`, sem julgar o requisito 04 nem extrapolar V0; uma
  linha de base medida em curva da pista sintética não serve [DOMAIN] (I9; US-0002, caso anormal "Linha
  de base ausente").
- REQ-FEAT-0002-08: O sistema SHALL contar os 200 ms dos requisitos 01 e 02 em tempo simulado, sem incluir
  o tempo em que a simulação esteve suspensa por pausa, perda de foco da aba ou perda do sensor [DOMAIN]
  (I8; US-0002, caso anormal "Pausa").
- REQ-FEAT-0002-09: O sistema SHALL, quando o kart sai da faixa de asfalto do arco na curva de referência,
  em qualquer velocidade, reportar `REFERENCE_CORNER` como `FAIL` com `failReason` `OFF_ASPHALT`, com
  `offAsphaltFirstStep` e a posição da saída, sem medir critério de subesterço fora do asfalto [DOMAIN]
  (I9; US-0002, caso anormal "Kart sai da faixa de asfalto do arco").
- REQ-FEAT-0002-10: O sistema SHALL, no ensaio `UNDERSTEER_ONSET` com o novo acerto, encerrar a varredura no
  primeiro passo em que o kart sai da faixa de asfalto do arco e decidir o resultado dessa saída pela
  velocidade do kart nesse passo: abaixo de 50 km/h, `FAIL` com `failReason` `OFF_ASPHALT`; acima de
  50 km/h com pelo menos dois patamares completos acima de 50 km/h medidos antes da saída, fim da varredura
  sem reprovar o ensaio por essa saída; acima de 50 km/h antes do segundo patamar completo acima de
  50 km/h, `FAIL` com `failReason` `MEASUREMENT_MISSING` (falta de medida), distinto de `OFF_ASPHALT`;
  em todos os casos com `offAsphaltFirstStep` e a posição da saída (AC-US-0002-06; US-0002, caso anormal
  "Kart sai da faixa de asfalto do arco").

## Comportamento

Passo e telemetria: [FLOW-0001](../flows/FLOW-0001-passo-de-simulacao-e-hud.md),
[API-0001](../api/API-0001-telemetria-de-dirigibilidade.md). Ensaios `REFERENCE_CORNER` e
`UNDERSTEER_ONSET`, ambiente e geometria: [RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md),
[FLOW-0002](../flows/FLOW-0002-ensaio-deterministico-e-piloto-de-teste.md),
[API-0003](../api/API-0003-saida-dos-ensaios.md). Estado de aderência:
[RULE-0001](../rules/RULE-0001-estado-de-aderencia-e-condicao-de-forcar.md).

| Situação | Comportamento |
|---|---|
| Curva de referência da pista de teste a 50 km/h, esterço cheio, acelerador 0 ou cheio | `understeer` consecutivo ≤ 200 ms; `surface` `ASPHALT` em todos os passos do arco |
| Velocidade de entrada acima de 50 km/h | `understeer` pode exceder 200 ms; a perda é progressiva (requisito 05); a direção comum continua sem exigir drift |
| Esterço aplicado tarde (kart fora da linha ideal) | Nenhum limite fixado; vale só a entrada de curva do ensaio |
| Kart sai da faixa de asfalto do arco na curva de referência (`REFERENCE_CORNER`) | `FAIL` com `OFF_ASPHALT` em qualquer velocidade, passo e posição reportados (requisito 09); a pista de teste não tem grama nem parede a ensaiar; nenhum critério de subesterço fora do asfalto. Na pista sintética, grama e parede seguem [FEAT-0004](FEAT-0004-aceleracao-velocidade-grama-parede-e-hud.md) |
| Kart sai da faixa de asfalto do arco na varredura de `UNDERSTEER_ONSET` | A saída encerra a varredura (requisito 10, [RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md), "Fim da varredura de início do subesterço"): abaixo de 50 km/h, `FAIL` com `OFF_ASPHALT`; acima de 50 km/h com pelo menos dois patamares completos acima de 50 km/h medidos antes, fim natural da varredura, sem reprovar pela saída; acima de 50 km/h antes do segundo patamar completo acima de 50 km/h, `FAIL` com `MEASUREMENT_MISSING`; passo e posição reportados em todos os casos; o patamar interrompido pela saída não é velocidade medida nem entra em V1 |
| Varredura de `UNDERSTEER_ONSET` sem V1 medida (nenhum patamar completo com `understeer` por mais de 200 ms consecutivos) | O requisito 04 não é atendido: `v1Mps` ausente; no fim natural da varredura, `FAIL` com `MEASUREMENT_MISSING` (falta de medida); quando a saída da faixa já reprova (abaixo de 50 km/h, ou antes do segundo patamar completo acima de 50 km/h), vale o motivo dessa saída ([RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md), "Fim da varredura de início do subesterço") |
| Linha de base ausente, ou medida em outro ambiente ou outro arco | `FAIL` com `BASELINE_MISSING`; registrar a linha de base no mesmo ensaio e no mesmo arco antes de julgar |
| Pausa, perda de foco, perda do sensor | Simulação suspensa; os 200 ms não contam a suspensão |
| Sensor ausente ou permissão negada antes da volta (`web-mobile`) | Toque com estado visível; requisitos inalterados |
| Rede indisponível | Sem efeito (D-FS-08) |

## Estado

Não define estados próprios; lê `handling`, `surface` e `simStepCount`
([API-0001](../api/API-0001-telemetria-de-dirigibilidade.md)).

## Configuração

Nenhuma. Nenhuma configuração existe para forçar um evento, injetar um estado ou habilitar um caminho de
depuração. A velocidade de entrada do ensaio é estado inicial colocado pelo ensaio; o tamanho do patamar
(`entrySpeedStepMps`), o raio do arco (`arcRadiusM`, 18 m) e a largura da faixa (`laneWidthM`) são parâmetros
de ensaio reportados, e a duração de cada patamar e o modo de manter a sua velocidade são parâmetros de
ensaio registrados em `docs/physics.md` (AC-US-0002-04, NFR-0004); nenhum deles é configuração da feature.

## Critérios de aceite

- Curva de referência da pista de teste a 50 km/h, esterço cheio, acelerador 0 e acelerador cheio:
  `maxUndersteerMs` ≤ 200 nas duas condições e `offAsphaltStepCount` 0 (satisfaz AC-US-0002-01,
  AC-US-0002-02; cobre os requisitos 01, 02, 03 e 08).
- `UNDERSTEER_ONSET` com linha de base no mesmo arco: V1 medida (`v1Mps` presente) e V1 ≥ 1,15 × V0; sem
  V1 medida no fim natural da varredura, `FAIL` com `MEASUREMENT_MISSING`; em `maxUndersteerMsBySpeed`, a
  maior sequência de `understeer` consecutivo de cada patamar completo acima de 50 km/h não é menor que a do
  patamar anterior (satisfaz AC-US-0002-03, AC-US-0002-04; cobre os requisitos 04 e 05).
- Sem linha de base no mesmo ensaio e arco: `FAIL` com `BASELINE_MISSING` (satisfaz AC-US-0002-03, caso
  anormal; cobre o requisito 07).
- Saída da faixa na curva de referência: `FAIL` com `OFF_ASPHALT`, `offAsphaltFirstStep` e posição
  (satisfaz AC-US-0002-02, caso anormal; cobre o requisito 09).
- Saída da faixa na varredura de `UNDERSTEER_ONSET`: abaixo de 50 km/h, `FAIL` com `OFF_ASPHALT`; acima de
  50 km/h com pelo menos dois pares em `maxUndersteerMsBySpeed`, nenhuma reprovação pela saída; acima de
  50 km/h com menos de dois pares, `FAIL` com `MEASUREMENT_MISSING`; `offAsphaltFirstStep` e posição nos
  três casos (satisfaz AC-US-0002-06; cobre o requisito 10).
- A saída de `npm test` ou de `npm run bench:handling` contém `REFERENCE_CORNER` por condição de acelerador
  e `UNDERSTEER_ONSET`, com `benchEnvironment` `TEST_PAD`, `arcRadiusM`, `laneWidthM`, `v0Mps` e `v1Mps`
  (satisfaz AC-US-0002-05; cobre o requisito 06).

## Pontos em aberto

Nenhum.
