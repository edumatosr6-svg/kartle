---
id: RULE-0001
title: Estado de aderência, condução normal, condição de forçar e recuperação
feature: dirigibilidade
stage: fspec
status: validated
version: 3.0.0
sources: [US-0003, AC-US-0003-01, AC-US-0003-02, AC-US-0003-03, AC-US-0003-04, AC-US-0003-05, AC-US-0001-05]
---

# RULE-0001 — Estado de aderência, condução normal, condição de forçar e recuperação

Decide, por passo e no estado da simulação (I2, D-FS-05), em que contexto cada valor do estado de
aderência pode ocorrer e qual é o teto da derrapagem lateral. Fontes: `SEED/US-3` (via US-0003),
`DOMAIN/DEC-02` (50 km/h), `DOMAIN/DEC-04` (400 ms) e `DOMAIN/REF-03` (curva de referência na pista de
teste), citadas nos critérios de US-0003.

## Classificação do passo

| `forcing` (condição de forçar) | `driftActive` | Dentro de uma recuperação | Classe do passo | Fonte |
|---|---|---|---|---|
| falso | falso | não | Condução normal | AC-US-0003-01 |
| verdadeiro | falso | — | Forçando | AC-US-0003-02 |
| qualquer | verdadeiro | — | Drift (regra de `requirements/11`, inalterada) | AC-US-0003-02 |
| falso | falso | sim | Recuperação | AC-US-0003-02, AC-US-0003-03 |

`forcing` é verdadeiro num passo se, e somente se, o `Input` desse passo tem acelerador cheio **e** esterço
cheio (1 ou −1) **e** a velocidade do estado da simulação é maior que 50 km/h (`DOMAIN/DEC-02`). Em
`web-mobile`, esterço parcial (módulo menor que 1) nunca satisfaz a condição de forçar (US-0003, Canais).
`driftActive` é o estado da manobra de drift de `requirements/11`, que esta feature não altera.

Um passo está **dentro de uma recuperação** se, e somente se: num passo anterior o esterço foi levado de 1
(ou −1) a 0 com `handling` em `oversteer` ou `sliding` e `forcing` verdadeiro (o passo de soltura); desde
então `handling` ainda não voltou a `grip`; e o tempo simulado contado do passo de soltura é de no máximo
400 ms (`DOMAIN/DEC-04`). A recuperação termina no primeiro passo em `grip` (inclusive) ou, sem `grip`,
no passo em que os 400 ms se esgotam; os passos seguintes sem `grip` são condução normal — e falham
(US-0003, caso anormal "Recuperação que não volta a `grip` em 400 ms"). A recuperação é classe própria
porque o segundo critério de `SEED/US-3` admite a traseira solta até 400 ms depois de reduzir o esterço:
esses passos não são condução normal (US-0003, Fontes).

## Tabela de decisão (por passo, no asfalto)

| Classe do passo | `handling` permitido | `sideslipRad` permitida | Fonte |
|---|---|---|---|
| Condução normal | `grip` ou `understeer` | no máximo 0,65 rad | AC-US-0003-01, AC-US-0003-05 |
| Forçando | qualquer um dos quatro | sem teto | AC-US-0003-02; US-0003, caso anormal "Condição de forçar mantida" |
| Drift | regra de `requirements/11` | regra de `requirements/11` | US-0003, caso anormal "Drift em andamento" |
| Recuperação | qualquer um dos quatro, voltando a `grip` em no máximo 400 ms | no máximo 0,65 rad em nenhum passo excedido | AC-US-0003-02, AC-US-0003-03, AC-US-0003-04 |

Na curva de referência da pista de teste (arco de raio 18 m, `DOMAIN/REF-03`) com entrada a 50 km/h,
esterço cheio e acelerador cheio, `handling` é `grip` ou `understeer` em todos os passos do arco por
exigência de AC-US-0003-01 (realizada pelo requisito 02 de
[FEAT-0003](../features/FEAT-0003-traseira-viva-e-controlavel.md)), qualquer que seja a classe do passo.
Esta regra só garante a classe do passo de entrada: nele a velocidade não é maior que 50 km/h e o passo é
de condução normal; um passo posterior em que o acelerador cheio leve a velocidade acima de 50 km/h é, pela
definição de `forcing` acima, "Forçando", e a exigência de AC-US-0003-01 vale nele do mesmo modo.

## Recuperação da traseira

| Condição de partida | Evento | Exigência | Fonte |
|---|---|---|---|
| `handling` em `oversteer` ou `sliding` com `forcing` verdadeiro, no asfalto da pista de teste | esterço levado de 1 (ou −1) a 0 num passo, acelerador mantido cheio | `handling` volta a `grip` em no máximo 400 ms de tempo simulado contados desse passo; `sideslipRad` no máximo 0,65 rad em todos os passos até lá | AC-US-0003-03, AC-US-0003-04; `DOMAIN/DEC-04` |
| idem | esterço e acelerador levados a 0 no mesmo passo | o tempo até `grip` não é maior que 400 ms | US-0003, caso anormal "Acelerador mantido cheio" |
| idem | esterço reduzido a valor intermediário (`web-mobile`) | nenhum limite fixado (lacuna deliberada de `01-overview.md`) | US-0003, caso anormal |
| idem | condição de forçar mantida | a traseira permanece solta; `sideslipRad` pode exceder 0,65 rad; o Jogador segue controlando com o esterço | US-0003, caso anormal |
| idem | `grip` não alcançado em 400 ms | a recuperação falha; os passos além de 400 ms contam como condução normal com `oversteer`/`sliding`, e falham também; o ensaio reporta o tempo até o primeiro `grip` ([API-0003](../api/API-0003-saida-dos-ensaios.md), `REAR_RECOVERY`) | US-0003, caso anormal "Recuperação que não volta a `grip` em 400 ms" |

## O que esta regra não julga

- O ensaio de resposta do volante (reta da pista de teste, 50 km/h mantidos, esterço cheio) mede só o
  tempo da taxa de guinada; um passo em `understeer` durante esse ensaio não o falha (AC-US-0001-05,
  `DOMAIN/DEC-09`). A aderência em curva é julgada só pela curva de referência da pista de teste
  ([RULE-0002](RULE-0002-ensaios-e-limiares.md)).
- Fora do asfalto (grama, parede, na pista sintética; fora da faixa, na pista de teste) nenhum critério de
  aderência é medido; na pista sintética vale a redução de velocidade de
  [RULE-0002](RULE-0002-ensaios-e-limiares.md).

## Idempotência e ordem

A classificação e o estado de aderência são funções do estado da simulação e do `Input` do passo, e a
classe "Recuperação" depende só dos passos anteriores pela ordem de `simStepCount`: reavaliar o mesmo
passo com o mesmo histórico dá o mesmo resultado, e nenhum passo é reaplicado. A ordem é a de
`simStepCount` ([API-0001](../api/API-0001-telemetria-de-dirigibilidade.md)); na suspensão por pausa, perda
de foco ou perda do sensor nenhum passo avança e os 400 ms da recuperação não contam o tempo suspenso.
