---
id: FEAT-0003
title: Traseira viva mas controlável
feature: dirigibilidade
stage: fspec
status: validated
version: 2.0.0
sources: [US-0003, AC-US-0003-01, AC-US-0003-02, AC-US-0003-03, AC-US-0003-04, AC-US-0003-05, AC-US-0003-06, AC-US-0003-07]
---

# FEAT-0003 — Traseira viva mas controlável

## Resumo

A traseira só solta quando o Jogador força: acelerador cheio e esterço cheio acima de 50 km/h
(`DOMAIN/DEC-02`), ou dentro da manobra de drift de `requirements/11`. Em condução normal a telemetria nunca
reporta `oversteer` nem `sliding` e a derrapagem lateral não passa de 0,65 rad. Com a traseira solta, zerar
o esterço devolve `grip` em no máximo 400 ms (`DOMAIN/DEC-04`) sem rodar. A manobra de drift continua
possível e continua pontuando.

## Canais

`web-desktop` e `web-mobile`: mesma condição de forçar, mesmo limite de recuperação e mesmo teto de
derrapagem. No teclado, a condição de forçar são as duas teclas mantidas acima de 50 km/h. Na inclinação,
exige o ângulo mapeado para esterço 1 e o toque de acelerador cheio; com esterço parcial a condição não se
mantém e, fora do drift, vale a condução normal. Sem sensor ou sem permissão: toque, entradas binárias,
mesmos requisitos (I4).

## Requisitos

- REQ-FEAT-0003-01: O sistema SHALL, no estado da simulação, em todo passo de condução normal (condição de
  forçar não mantida e manobra de drift não em andamento), reportar `handling` igual a `grip` ou
  `understeer`, nunca `oversteer` nem `sliding` (AC-US-0003-01).
- REQ-FEAT-0003-02: O sistema SHALL, no estado da simulação, na curva de referência a 50 km/h com esterço
  cheio e acelerador cheio, reportar `handling` igual a `grip` ou `understeer` em todos os passos
  (AC-US-0003-01).
- REQ-FEAT-0003-03: O sistema SHALL reportar `oversteer` ou `sliding` apenas em passos em que `forcing` é
  verdadeiro ou `driftActive` é verdadeiro (AC-US-0003-02).
- REQ-FEAT-0003-04: O sistema SHALL, no estado da simulação, com `handling` em `oversteer` ou `sliding` sob
  a condição de forçar e o esterço levado de 1 (ou −1) a 0 num passo com o acelerador mantido cheio,
  reportar `handling` igual a `grip` em no máximo 400 ms de tempo simulado contados desse passo
  (AC-US-0003-03).
- REQ-FEAT-0003-05: O sistema SHALL, durante a recuperação do requisito 04, manter `sideslipRad` em no
  máximo 0,65 rad em todos os passos (AC-US-0003-04).
- REQ-FEAT-0003-06: O sistema SHALL, no estado da simulação, em todo passo de condução normal, manter
  `sideslipRad` em no máximo 0,65 rad (AC-US-0003-05).
- REQ-FEAT-0003-07: O sistema SHALL conter, na saída de `npm test`, para o acerto Arcade assistido, o
  registro `DRIFT_MANEUVER` da verificação existente da manobra de drift de `requirements/11` com `verdict`
  `PASS` e `driftScore` maior que 0 (AC-US-0003-06).
- REQ-FEAT-0003-08: O sistema SHALL conter, na saída de `npm test` ou de `npm run bench:handling`, para o
  acerto Arcade assistido, os registros `REAR_RECOVERY` (com `recoveryMs` e `maxSideslipRad`) e
  `NORMAL_DRIVING` (com `oversteerOrSlidingStepCount` e `maxSideslipRad`) (AC-US-0003-07).
- REQ-FEAT-0003-09: O sistema SHALL, quando esterço e acelerador são levados a 0 no mesmo passo com a
  traseira solta, reportar `grip` em tempo não maior que 400 ms de tempo simulado [DOMAIN] (US-0003, caso
  anormal "Acelerador mantido cheio durante a recuperação").
- REQ-FEAT-0003-10: O sistema SHALL avaliar a condição de forçar e o estado de aderência na simulação, a
  partir do `Input` e do estado do passo, nunca no adaptador de controle nem na renderização [DOMAIN]
  (I2; D-FS-05; NFR-0005).
- REQ-FEAT-0003-11: O sistema SHALL contar os 400 ms do requisito 04 em tempo simulado, sem incluir o tempo
  em que a simulação esteve suspensa por pausa, perda de foco ou perda do sensor [DOMAIN] (I8; US-0003,
  caso anormal "Pausa").

## Comportamento

Classificação do passo, tabela de decisão e recuperação:
[RULE-0001](../rules/RULE-0001-estado-de-aderencia-e-condicao-de-forcar.md). Ensaios `REAR_RECOVERY`,
`NORMAL_DRIVING` e `DRIFT_MANEUVER`: [RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md),
[FLOW-0002](../flows/FLOW-0002-ensaio-deterministico-e-piloto-de-teste.md),
[API-0003](../api/API-0003-saida-dos-ensaios.md). Telemetria:
[API-0001](../api/API-0001-telemetria-de-dirigibilidade.md) (`handling`, `sideslipRad`, `forcing`,
`driftActive`).

| Situação | Comportamento |
|---|---|
| Condução normal | `grip` ou `understeer`; `sideslipRad` ≤ 0,65 rad |
| Condição de forçar mantida | `oversteer`/`sliding` permitidos; a traseira permanece solta; `sideslipRad` pode exceder 0,65 rad; o Jogador segue controlando com o esterço; nenhum estado de "rodada" sem comando é exigido nem proibido |
| Esterço zerado com a traseira solta, acelerador cheio | `grip` em ≤ 400 ms; `sideslipRad` ≤ 0,65 rad até lá |
| Esterço e acelerador zerados juntos | `grip` em tempo não maior que 400 ms |
| Esterço reduzido parcialmente (`web-mobile`) | Nenhum limite fixado (lacuna deliberada de `01-overview.md`) |
| Drift em andamento | `driftActive` verdadeiro; `handling` e derrapagem pela regra de `requirements/11`, inalterada; a manobra pontua |
| Grama ou parede com a traseira solta | Redução de velocidade de [FEAT-0004](FEAT-0004-aceleracao-velocidade-grama-parede-e-hud.md); o requisito 04 é medido no asfalto |
| Pausa, perda de foco, perda do sensor | Simulação suspensa; os 400 ms não contam a suspensão |
| Sensor ausente ou permissão negada antes da volta (`web-mobile`) | Toque com estado visível; requisitos inalterados |
| Rede indisponível | Sem efeito (D-FS-08) |

## Estado

Lê `handling` (`grip`, `understeer`, `oversteer`, `sliding`), `forcing`, `driftActive` e `sideslipRad`
([API-0001](../api/API-0001-telemetria-de-dirigibilidade.md)); a classe do passo (condução normal,
forçando, drift) é derivada por [RULE-0001](../rules/RULE-0001-estado-de-aderencia-e-condicao-de-forcar.md).

| Transição | O que a dispara | Idempotência e contador |
|---|---|---|
| `grip`/`understeer` para `oversteer`/`sliding` | passo com `forcing` verdadeiro (ou drift) em que a traseira perde aderência | Função do estado e do `Input` do passo; ordenada por `simStepCount`; não ocorre em condução normal |
| `oversteer`/`sliding` para `grip` | esterço levado a 0; em no máximo 400 ms | Idem; o tempo suspenso não conta |

## Configuração

Nenhuma. Nenhuma configuração existe para forçar um evento, injetar um estado ou habilitar um caminho de
depuração; o ensaio chega à traseira solta pela condição de forçar, pelas mesmas operações públicas.

## Critérios de aceite

- Em todo passo de condução normal dos ensaios e da volta do piloto de teste, `oversteerOrSlidingStepCount`
  = 0 e `maxSideslipRad` ≤ 0,65; na curva de referência com acelerador cheio, só `grip` ou `understeer`
  (satisfaz AC-US-0003-01, AC-US-0003-02, AC-US-0003-05; cobre os requisitos 01, 02, 03, 06 e 10).
- `REAR_RECOVERY`: `recoveryMs` ≤ 400 e `maxSideslipRad` ≤ 0,65 (satisfaz AC-US-0003-03, AC-US-0003-04;
  cobre os requisitos 04, 05, 09 e 11).
- `DRIFT_MANEUVER` com `PASS` e `driftScore` > 0 na saída de `npm test` (satisfaz AC-US-0003-06; cobre o
  requisito 07).
- A saída de `npm test` ou de `npm run bench:handling` contém `REAR_RECOVERY` e `NORMAL_DRIVING` com os
  campos nomeados (satisfaz AC-US-0003-07; cobre o requisito 08).

## Pontos em aberto

Nenhum.
