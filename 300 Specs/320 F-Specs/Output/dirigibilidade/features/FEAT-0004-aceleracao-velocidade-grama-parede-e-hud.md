---
id: FEAT-0004
title: Aceleração, velocidade estabilizada, grama, parede e HUD
feature: dirigibilidade
stage: fspec
status: validated
version: 2.1.0
sources: [US-0004, AC-US-0004-01, AC-US-0004-02, AC-US-0004-03, AC-US-0004-04, AC-US-0004-05, AC-US-0004-06, AC-US-0004-07]
---

# FEAT-0004 — Aceleração, velocidade estabilizada, grama, parede e HUD

## Resumo

O kart acelera com vontade e transmite velocidade e risco (acerto agressivo da revisão 2, `DOMAIN/REF-02`): 0–60 km/h em no máximo 2,5 s com piloto de
75 kg (`DOMAIN/DEC-05`); velocidade estabilizada em reta de pelo menos 105 km/h (`DOMAIN/DEC-06`); sair para
a grama custa pelo menos 30 % da velocidade em 1 s; tocar a parede custa velocidade a cada contato. O HUD
continua exibindo velocidade em km/h e estado de aderência em texto durante toda a volta.

## Canais

`web-desktop` e `web-mobile`: mesmos limites e mesmo HUD. Acelerador binário pelo teclado ou por toque; a
inclinação não afeta os requisitos 01 e 02, medidos com esterço 0. Sem sensor ou sem permissão: toque com
estado visível, requisitos inalterados (I4).

## Requisitos

- REQ-FEAT-0004-01: O sistema SHALL, no estado da simulação, partindo de 0 km/h em reta no asfalto com
  acelerador cheio mantido, esterço 0 e piloto de 75 kg, atingir 60 km/h em no máximo 2,5 s de tempo
  simulado (AC-US-0004-01).
- REQ-FEAT-0004-02: O sistema SHALL, no estado da simulação, em reta no asfalto com acelerador cheio
  mantido e esterço 0, atingir velocidade estabilizada de pelo menos 105 km/h (AC-US-0004-02).
- REQ-FEAT-0004-03: O sistema SHALL, no estado da simulação, com o kart entrando na grama à velocidade
  estabilizada do requisito 02, com acelerador cheio e esterço 0 mantidos, apresentar após 1 s de tempo
  simulado na grama velocidade de no máximo 70 % da velocidade de entrada (AC-US-0004-03).
- REQ-FEAT-0004-04: O sistema SHALL, no estado da simulação, com o kart entrando na grama a 50 km/h, com
  acelerador cheio e esterço 0 mantidos, apresentar após 1 s de tempo simulado na grama velocidade de no
  máximo 70 % de 50 km/h (AC-US-0004-04).
- REQ-FEAT-0004-05: O sistema SHALL, no estado da simulação, em cada passo em que `wallContact` é
  verdadeiro com velocidade maior que 0 no passo anterior, apresentar no passo seguinte ao contato
  velocidade menor que a do passo anterior ao contato, em 100 % dos contatos (AC-US-0004-05).
- REQ-FEAT-0004-06: O sistema SHALL exibir no HUD, em `web-desktop` e em `web-mobile`, a velocidade do kart
  em km/h e o estado de aderência em texto em todos os quadros entre o sinal verde e o fim da volta, sem
  remover nem ocultar nenhum dos dois elementos (AC-US-0004-06).
- REQ-FEAT-0004-07: O sistema SHALL conter, na saída de `npm test` ou do bench de física, para o
  acerto Arcade assistido, os registros `ACCELERATION` (`zeroToSixtyKmhMs`), `TOP_SPEED` (`topSpeedMps`),
  `GRASS_LOSS` (`speedAfterOneSMps` para as duas velocidades de entrada) e `WALL_CONTACT` (`contacts` com
  velocidade antes e depois de cada contato), cada um com o seu `benchEnvironment`, campos SI apresentados
  também em km/h e s (AC-US-0004-07).
- REQ-FEAT-0004-08: O sistema SHALL reduzir a velocidade do kart na grama também abaixo de 50 km/h e com
  esterço diferente de 0, sem percentual exigido [DOMAIN] (`SEED/US-4` via US-0004, casos anormais "Grama a
  velocidade abaixo de 50 km/h" e "Entrada na grama com esterço diferente de 0").
- REQ-FEAT-0004-09: O sistema SHALL manter no HUD o último valor exibido de velocidade e de estado de
  aderência enquanto a simulação está suspensa por pausa, perda de foco ou perda do sensor [DOMAIN] (I8;
  US-0004, caso anormal "Pausa").
- REQ-FEAT-0004-10: O sistema SHALL NOT alterar, por grama ou parede, as regras de corte e de validade da
  volta, que pertencem à feature `race-lap-validation` [DOMAIN] (NFR-0008; US-0004, caso anormal "Grama e
  parede não invalidam a volta por si").

## Comportamento

Passo, telemetria e HUD: [FLOW-0001](../flows/FLOW-0001-passo-de-simulacao-e-hud.md),
[API-0001](../api/API-0001-telemetria-de-dirigibilidade.md) (`speedMps`, `surface`, `wallContact`,
`handling`), [SCR-0001](../screens/SCR-0001-hud-de-velocidade-e-aderencia.md). Ensaios `ACCELERATION`,
`TOP_SPEED`, `GRASS_LOSS` e `WALL_CONTACT`: [RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md),
[FLOW-0002](../flows/FLOW-0002-ensaio-deterministico-e-piloto-de-teste.md),
[API-0003](../api/API-0003-saida-dos-ensaios.md).

| Situação | Comportamento |
|---|---|
| Acelerador cheio do repouso, esterço 0, piloto de 75 kg | 60 km/h em ≤ 2,5 s; velocidade estabilizada ≥ 105 km/h |
| Acelerador solto antes de 60 km/h | O ensaio é interrompido, sem exigência de tempo |
| Entrada na grama à velocidade estabilizada ou a 50 km/h, esterço 0, acelerador cheio | Após 1 s, ≤ 70 % da velocidade de entrada |
| Grama abaixo de 50 km/h ou com esterço diferente de 0 | A velocidade é reduzida; nenhum percentual fixado (lacuna deliberada de `01-overview.md`) |
| Contato com a parede com velocidade > 0 | Velocidade no passo seguinte menor que no passo anterior; magnitude não fixada (lacuna deliberada) |
| Contato com a parede a velocidade 0 (kart encostado) | Não há contato novo a julgar |
| Grama ou parede durante a volta | Não invalidam a volta por si; regras de corte e validade de `race-lap-validation`, inalteradas |
| Pausa, perda de foco, perda do sensor | Simulação suspensa; o HUD mantém o último valor; limites em tempo simulado |
| Sensor ausente ou permissão negada antes da volta (`web-mobile`) | Toque com estado visível; requisitos inalterados |
| Rede indisponível | Sem efeito (D-FS-08) |

## Estado

Não define estados próprios; lê `speedMps`, `surface` (`ASPHALT`, `GRASS`), `wallContact` e `handling`
([API-0001](../api/API-0001-telemetria-de-dirigibilidade.md)). `surface` muda de `ASPHALT` para `GRASS` no
passo em que o kart sai do asfalto e volta no passo em que reentra; `wallContact` é verdadeiro só no passo
do contato: ambos são funções da posição no estado do passo, ordenadas por `simStepCount`, sem reaplicação.

## Configuração

Nenhuma. A massa do piloto (75 kg) é parâmetro do ensaio e do acerto, não configuração exposta; nenhuma
configuração existe para forçar um evento, injetar um estado ou habilitar um caminho de depuração. O
ambiente dos ensaios de 0–60 km/h e de velocidade estabilizada não é fixado pelos requisitos (lacuna
deliberada de `01-overview.md`) e é reportado em `benchEnvironment`; grama e parede são ensaiadas na pista
sintética, porque a pista de teste não tem grama nem parede ([RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md)).

## Critérios de aceite

- `ACCELERATION`: `zeroToSixtyKmhMs` ≤ 2 500 com `driverMassKg` 75; `TOP_SPEED`: `topSpeedMps` ≥ 105/3,6
  (105 km/h) (satisfaz AC-US-0004-01, AC-US-0004-02; cobre os requisitos 01 e 02).
- `GRASS_LOSS` nas duas entradas: `speedAfterOneSMps` ≤ 0,70 × `entrySpeedMps` (satisfaz AC-US-0004-03,
  AC-US-0004-04; cobre os requisitos 03, 04 e 08).
- `WALL_CONTACT`: depois < antes em 100 % dos pares de `contacts` (satisfaz AC-US-0004-05; cobre os
  requisitos 05 e 10).
- Na tela, nos dois canais, velocidade em km/h e estado de aderência em texto em todos os quadros do sinal
  verde ao fim da volta; valores mantidos na pausa (satisfaz AC-US-0004-06; cobre os requisitos 06 e 09).
- A saída de `npm test` ou do bench de física contém os quatro registros com os campos nomeados e o seu
  `benchEnvironment` (satisfaz AC-US-0004-07; cobre o requisito 07).

## Pontos em aberto

Nenhum.
