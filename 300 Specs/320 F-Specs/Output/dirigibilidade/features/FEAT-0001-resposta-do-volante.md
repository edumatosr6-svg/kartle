---
id: FEAT-0001
title: Resposta imediata do volante
feature: dirigibilidade
stage: fspec
status: validated
version: 2.0.0
sources: [US-0001, AC-US-0001-01, AC-US-0001-02, AC-US-0001-03, AC-US-0001-04, AC-US-0001-05, AC-US-0001-06]
---

# FEAT-0001 — Resposta imediata do volante

## Resumo

Com o acerto Arcade assistido na sua nova versão, o kart aponta para a curva quando o Jogador manda: em
reta a 50 km/h, a taxa de guinada atinge 90 % do regime em no máximo 180 ms depois do esterço cheio e cai a
10 % em no máximo 250 ms depois de soltá-lo (`DOMAIN/DEC-01`). Em `web-mobile`, o esterço parcial da
inclinação tem os mesmos limites para o regime que lhe corresponde. O ensaio mede só a taxa de guinada;
`understeer` transitório nesse ensaio é aceitável (`DOMAIN/DEC-09`).

## Canais

`web-desktop` e `web-mobile`: mesmos limites, medidos no estado da simulação a partir do `Input` recebido.
No teclado o esterço é 0, 1 ou −1 (requisitos 01 e 02). Na inclinação, os requisitos 01 e 02 valem para o
ângulo que o adaptador mapeia para esterço 1 ou −1, e os requisitos 03 e 04 para esterço parcial. Sem
sensor ou sem permissão, o toque produz esterço binário e valem os requisitos 01 e 02 (I4).

## Requisitos

- REQ-FEAT-0001-01: O sistema SHALL, no estado da simulação, com o kart em reta no asfalto a 50 km/h em
  `grip` e o esterço levado de 0 a 1, ou de 0 a −1, num passo, levar a taxa de guinada a 90 % do seu regime
  em módulo em no máximo 180 ms de tempo simulado contados desse passo (AC-US-0001-01).
- REQ-FEAT-0001-02: O sistema SHALL, no estado da simulação, com o esterço 1, ou −1, mantido até a taxa de
  guinada atingir o regime e então levado a 0 num passo, levar a taxa de guinada a 10 % do regime em
  módulo em no máximo 250 ms de tempo simulado contados desse passo (AC-US-0001-02).
- REQ-FEAT-0001-03: O sistema SHALL, em `web-mobile`, com o esterço levado num passo de 0 a um valor entre
  0 e 1 exclusive e ali mantido, levar a taxa de guinada a 90 % do regime correspondente a esse esterço em
  no máximo 180 ms de tempo simulado contados desse passo (AC-US-0001-03).
- REQ-FEAT-0001-04: O sistema SHALL, em `web-mobile`, com o esterço mantido num valor entre 0 e 1 exclusive
  até a taxa de guinada atingir o regime correspondente e então levado a 0 num passo, levar a taxa de
  guinada a 10 % desse regime em no máximo 250 ms de tempo simulado contados desse passo (AC-US-0001-04).
- REQ-FEAT-0001-05: O sistema SHALL registrar, na saída do ensaio `STEER_RESPONSE`, um veredito que depende
  apenas dos tempos medidos de subida a 90 % e de queda a 10 % do regime; um passo em `understeer` durante
  o ensaio não altera o veredito nem os tempos medidos, e é apenas contado em `understeerStepCount`
  (AC-US-0001-05).
- REQ-FEAT-0001-06: O sistema SHALL conter, na saída de `npm test` ou de `npm run bench:handling`, para o
  acerto Arcade assistido, o registro `STEER_RESPONSE` dos requisitos 01 e 02 com `riseToNinetyPctMs`,
  `fallToTenPctMs` e `settleWindowMs` (AC-US-0001-06).
- REQ-FEAT-0001-07: O sistema SHALL saturar na faixa de `Input` (−1 a 1) um esterço que o adaptador
  entregue fora dela, e o requisito 01 vale para o valor saturado [DOMAIN] (I4; US-0001, caso anormal
  "Esterço fora da faixa").
- REQ-FEAT-0001-08: O sistema SHALL medir os tempos dos requisitos 01 a 04 em tempo simulado, sem contar o
  tempo em que a simulação esteve suspensa por pausa, perda de foco da aba ou perda do sensor, e sem
  depender da taxa de quadros [DOMAIN] (I8; US-0001, casos anormais "Pausa" e "Taxa de quadros baixa").

## Comportamento

Fluxo do passo e do HUD: [FLOW-0001](../flows/FLOW-0001-passo-de-simulacao-e-hud.md). Ensaio e
saída: [FLOW-0002](../flows/FLOW-0002-ensaio-deterministico-e-piloto-de-teste.md),
[RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md) (`STEER_RESPONSE`),
[API-0003](../api/API-0003-saida-dos-ensaios.md). Telemetria lida:
[API-0001](../api/API-0001-telemetria-de-dirigibilidade.md) (`yawRateRadPerS`, `handling`).

| Situação | Comportamento |
|---|---|
| Esterço cheio a 50 km/h em reta, para qualquer lado | 90 % do regime em módulo em ≤ 180 ms; ao soltar, 10 % em ≤ 250 ms |
| Esterço parcial mantido (`web-mobile`) | Mesmos limites para o regime desse esterço |
| `understeer` reportado durante o ensaio | Aceitável; não falha o ensaio; a aderência é julgada só na curva de referência ([FEAT-0002](FEAT-0002-aderencia-em-curva.md)) |
| Esterço fora da faixa | Saturado; limites valem para o valor saturado |
| Esterço invertido antes do regime (1 para −1 num passo) | Nenhum limite fixado (lacuna deliberada de `01-overview.md`); os requisitos 01 e 02 não se aplicam à inversão |
| Velocidade diferente de 50 km/h ao aplicar o esterço | Nenhum limite fixado; o comportamento em curva é de [FEAT-0002](FEAT-0002-aderencia-em-curva.md) e [FEAT-0003](FEAT-0003-traseira-viva-e-controlavel.md) |
| Pausa, perda de foco, perda do sensor durante a manobra | Simulação suspensa; o tempo suspenso não conta |
| Sensor ausente ou permissão negada antes da volta (`web-mobile`) | Toque com estado visível; esterço binário; valem os requisitos 01 e 02 |
| Taxa de quadros baixa | Sem efeito nos limites: resposta em passos de `STEP` |
| Rede indisponível | Sem efeito (D-FS-08) |

## Estado

Não define estados próprios; lê `yawRateRadPerS`, `handling` e `simStepCount`
([API-0001](../api/API-0001-telemetria-de-dirigibilidade.md)). O regime da taxa de guinada é um valor
medido pelo ensaio com a janela `settleWindowMs`, não um estado.

## Configuração

Nenhuma. Nenhuma configuração existe para forçar um evento, injetar um estado ou habilitar um caminho de
depuração; o ensaio coloca o estado inicial pelas mesmas operações públicas da simulação. Os parâmetros do
acerto não são configuração exposta ao Jogador.

## Critérios de aceite

- Em reta a 50 km/h, esterço 0 a 1 e 0 a −1: 90 % do regime em módulo em ≤ 180 ms; esterço mantido e
  solto: 10 % em ≤ 250 ms (satisfaz AC-US-0001-01, AC-US-0001-02; cobre os requisitos 01, 02, 07 e 08).
- Esterço parcial em `web-mobile`: 90 % do regime correspondente em ≤ 180 ms; solto: 10 % em ≤ 250 ms
  (satisfaz AC-US-0001-03, AC-US-0001-04; cobre os requisitos 03 e 04).
- Veredito do `STEER_RESPONSE` com `understeerStepCount` > 0 é `PASS` se, e só se, os tempos ficam dentro de
  180 ms e 250 ms (satisfaz AC-US-0001-05; cobre o requisito 05).
- A saída de `npm test` ou de `npm run bench:handling` contém `STEER_RESPONSE` com `riseToNinetyPctMs`,
  `fallToTenPctMs` e `settleWindowMs` para o Arcade assistido (satisfaz AC-US-0001-06; cobre o requisito 06).

## Pontos em aberto

Nenhum.
