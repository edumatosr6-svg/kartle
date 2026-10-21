---
id: RULE-0002
title: Ensaios e limiares de dirigibilidade
feature: dirigibilidade
stage: fspec
status: validated
version: 2.0.0
sources: [US-0001, US-0002, US-0003, US-0004, US-0005, NFR-0001, NFR-0002, NFR-0003, NFR-0004, NFR-0006, NFR-0007, NFR-0008, AC-US-0001-01, AC-US-0001-02, AC-US-0001-03, AC-US-0001-04, AC-US-0001-06, AC-US-0002-01, AC-US-0002-02, AC-US-0002-03, AC-US-0002-04, AC-US-0002-05, AC-US-0003-06, AC-US-0003-07, AC-US-0004-01, AC-US-0004-02, AC-US-0004-03, AC-US-0004-04, AC-US-0004-05, AC-US-0004-07, AC-US-0005-01, AC-US-0005-02, AC-US-0005-03, AC-US-0005-06]
---

# RULE-0002 — Ensaios e limiares de dirigibilidade

Tabela única dos limiares desta feature, com a sua fonte, e a definição de cada ensaio determinístico que
os verifica: estado inicial, `Input` por passo, medição e veredito. Todo ensaio avança a simulação com
`STEP`, sem renderização, controles, DOM nem relógio de parede (I9, NFR-0005), com o acerto Arcade
assistido na versão corrente, salvo onde a tabela nomeia o Realista. Os valores medidos são reportados
pelo contrato [API-0003](../api/API-0003-saida-dos-ensaios.md).

## Limiares

| Limiar | Valor | Fonte |
|---|---|---|
| Subida da taxa de guinada a 90 % do regime, esterço cheio a 50 km/h em reta | no máximo 180 ms | `DOMAIN/DEC-01` (AC-US-0001-01) |
| Queda da taxa de guinada a 10 % do regime ao soltar | no máximo 250 ms | `DOMAIN/DEC-01` (AC-US-0001-02) |
| Subida e queda com esterço parcial (`web-mobile`) | 180 ms e 250 ms, para o regime do esterço aplicado | `SEED/US-1` via AC-US-0001-03, AC-US-0001-04 |
| Velocidade da curva de referência (raio 18 m) | 50 km/h | `DOMAIN/DEC-02` (AC-US-0002-01) |
| `understeer` consecutivo na curva de referência | no máximo 200 ms | `DOMAIN/DEC-03` (AC-US-0002-01) |
| Velocidade de início do subesterço | V1 ≥ 1,15 × V0 | `SEED/US-2` via AC-US-0002-03 |
| Recuperação da traseira ao zerar o esterço | no máximo 400 ms | `DOMAIN/DEC-04` (AC-US-0003-03) |
| Derrapagem lateral em condução normal e na recuperação | no máximo 0,65 rad | `SEED/US-3` via AC-US-0003-04, AC-US-0003-05 |
| 0–60 km/h, piloto de 75 kg | no máximo 2,5 s | `DOMAIN/DEC-05` (AC-US-0004-01) |
| Velocidade estabilizada em reta | pelo menos 105 km/h | `DOMAIN/DEC-06` (AC-US-0004-02) |
| Velocidade após 1 s na grama (entrada à velocidade estabilizada e a 50 km/h) | no máximo 70 % da velocidade de entrada | `SEED/US-4` via AC-US-0004-03; `DOMAIN/DEC-02` (AC-US-0004-04) |
| Contato com a parede | velocidade no passo seguinte menor que no passo anterior, em 100 % dos contatos | `SEED/US-4` via AC-US-0004-05 |
| Volta do piloto de teste | no máximo 25 s; 0 passos fora do asfalto | `DOMAIN/DEC-07` (AC-US-0005-02, AC-US-0005-03) |
| Determinismo | resultados idênticos em 100 % de no mínimo 2 execuções | `SEED/NF-01` via AC-US-0005-01, NFR-0001 |
| Custo por passo | média no máximo 10 % acima da linha de base, mesma máquina e runtime | `SEED/NF-02` via NFR-0002 |

"No máximo" e "pelo menos" são inclusivos; "menor que" e "maior que" são estritos. Os limiares são
enunciados na unidade dos critérios (km/h, s); os campos que os verificam são SI (m/s, ms) por D-FS-06
([API-0003](../api/API-0003-saida-dos-ensaios.md)), e a comparação converte o limiar para a unidade do
campo (km/h ÷ 3,6 = m/s; s × 1000 = ms), sem arredondar o valor medido.

## Ensaios

Cada ensaio parte do estado inicial descrito, com acelerador, freio e esterço em 0 salvo indicação, e
aplica o `Input` indicado em todos os passos. Os parâmetros que os requisitos deixam ao ensaio (janela de
estabilização do regime, acelerador mantido no ensaio de resposta, incremento de velocidade de entrada,
posição de entrada da curva) são **parâmetros de ensaio**: reportados na saída e registrados em
`docs/physics.md` (NFR-0004), nunca limiares.

| `benchId` | Estado inicial e `Input` | Medição | Veredito `PASS` se | Fonte |
|---|---|---|---|---|
| `STEER_RESPONSE` | Reta, asfalto, 50 km/h, `grip`, esterço 0; num passo o esterço vai a 1 (e, em repetição, a −1); mantido até o regime; depois, num passo, volta a 0 | `riseToNinetyPctMs`, `fallToTenPctMs`, `settleWindowMs`, `steadyYawRateRadPerS`, `steerInputNorm` | subida ≤ 180 ms e queda ≤ 250 ms, nos dois lados; `understeer` durante o ensaio não altera o veredito | AC-US-0001-01, AC-US-0001-02, AC-US-0001-05, AC-US-0001-06 |
| `STEER_RESPONSE` com `steerInputNorm` entre 0 e 1 exclusive (`inputMode` `PROPORTIONAL`) | Idem, com o esterço levado ao valor parcial e mantido | idem, para o regime desse esterço | subida ≤ 180 ms e queda ≤ 250 ms | AC-US-0001-03, AC-US-0001-04 |
| `REFERENCE_CORNER` | Entrada da curva de 18 m, asfalto, 50 km/h, `grip`; esterço cheio mantido; uma execução com acelerador 0 mantido e outra com acelerador cheio mantido | `maxUndersteerMs` por `throttleCondition`; `offAsphaltStepCount`; `handling` em todos os passos | `maxUndersteerMs` ≤ 200 ms nas duas condições; 0 passos fora do asfalto; com acelerador cheio, `handling` só `grip` ou `understeer` | AC-US-0002-01, AC-US-0002-02, AC-US-0002-05, AC-US-0003-01 |
| `UNDERSTEER_ONSET` | Como `REFERENCE_CORNER`, com velocidade de entrada crescente a partir de 50 km/h em incrementos de `entrySpeedStepMps` | `v0Mps` (linha de base), `v1Mps` (novo acerto); `maxUndersteerMs` por velocidade acima de V1 | V1 ≥ 1,15 × V0; `maxUndersteerMs` não diminui quando a velocidade de entrada aumenta | AC-US-0002-03, AC-US-0002-04, AC-US-0002-05 |
| `NORMAL_DRIVING` | Todos os passos de condução normal de `REFERENCE_CORNER`, `UNDERSTEER_ONSET`, `REAR_RECOVERY` e `TEST_PILOT_LAP` no asfalto | `handling` e `sideslipRad` por passo | nenhum `oversteer`/`sliding`; `sideslipRad` ≤ 0,65 rad | AC-US-0003-01, AC-US-0003-02, AC-US-0003-05 |
| `REAR_RECOVERY` | Asfalto, `grip`, velocidade acima de 50 km/h; acelerador cheio e esterço cheio mantidos até `handling` em `oversteer` ou `sliding`; num passo o esterço vai a 0, acelerador mantido cheio | `recoveryMs`, `maxSideslipRad` | `recoveryMs` ≤ 400 ms; `maxSideslipRad` ≤ 0,65 rad | AC-US-0003-03, AC-US-0003-04, AC-US-0003-07 |
| `DRIFT_MANEUVER` | A verificação existente da manobra de drift de `requirements/11`, com o novo acerto | aprovação; `driftScore` | aprovada e `driftScore` > 0 | AC-US-0003-06 |
| `ACCELERATION` | Reta, asfalto, 0 km/h, piloto de 75 kg; acelerador cheio mantido, esterço 0 | `zeroToSixtyKmhMs` | ≤ 2 500 ms (2,5 s) | AC-US-0004-01, AC-US-0004-07 |
| `TOP_SPEED` | Reta, asfalto; acelerador cheio mantido, esterço 0, até a velocidade deixar de crescer | `topSpeedMps` | ≥ 105/3,6 m/s (105 km/h) | AC-US-0004-02, AC-US-0004-07 |
| `GRASS_LOSS` | Entrada na grama à velocidade estabilizada e, em segunda execução, a 50 km/h (13,89 m/s); acelerador cheio e esterço 0 mantidos; 1 s de tempo simulado na grama | `entrySpeedMps`, `speedAfterOneSMps` por execução | `speedAfterOneSMps` ≤ 0,70 × `entrySpeedMps` nas duas | AC-US-0004-03, AC-US-0004-04, AC-US-0004-07 |
| `WALL_CONTACT` | Trajetória que leva ao contato com a parede com velocidade maior que 0 | `speedBeforeContactMps`, `speedAfterContactMps` por contato (`wallContact` verdadeiro) | depois < antes em 100 % dos contatos | AC-US-0004-05, AC-US-0004-07 |
| `DETERMINISM` | Cada ensaio desta tabela e a volta do piloto de teste, executados no mínimo 2 vezes com a mesma sequência de `Input` | estados por passo, tempo total e quatro tempos de setor | idênticos em 100 % das execuções | AC-US-0005-01, NFR-0001 |
| `TEST_PILOT_LAP` | Pista sintética, largada, comandos binários do piloto de teste | `lapTimeMs`, `offAsphaltStepCount`, `offAsphaltFirstStep` e posição se houver saída, `meanStepCostUs` | `lapTimeMs` ≤ 25 000 ms; `offAsphaltStepCount` = 0 | AC-US-0005-02, AC-US-0005-03, NFR-0002 |
| `STEP_CONTRACT` | Leitura de `STEP`, da taxa do solver e do conjunto, faixa e significado dos campos de `Input` | comparação com a versão anterior à feature | 0 mudanças | AC-US-0005-06, NFR-0006 |
| `REALISTA_UNCHANGED` | Todos os ensaios de física e de dirigibilidade com `setupId` `REALISTA_ALUGUEL_4T` | medidas, comparadas com a linha de base do Realista | idênticas em 100 % das medidas; 0 assistências arcade ativas | NFR-0007 |
| `STEP_COST` | Volta completa do piloto de teste | `meanStepCostUs`, comparado com a linha de base na mesma máquina e runtime | ≤ 1,10 × linha de base | NFR-0002 |

Os ensaios de US-0001 a US-0004 são executados com `inputMode` `BINARY` (sequência do teclado) e com
`inputMode` `PROPORTIONAL` (sequência equivalente da inclinação, esterço 1 mantido), e precisam de `PASS` nas
duas formas (NFR-0003). O conjunto de `npm test` da feature `race-lap-validation` continua aprovado com o
novo acerto (NFR-0008), verificado na mesma execução de `npm test`.

## Linha de base

`UNDERSTEER_ONSET` e `STEP_COST` dependem da linha de base. Sem linha de base registrada em
`docs/physics.md`, o ensaio reporta `FAIL` com `failReason` `BASELINE_MISSING` e o critério não é julgado
até a linha de base ser registrada (US-0002, caso anormal "Linha de base ausente"). A linha de base nunca é
inventada nem extrapolada.

## Suspensão e tempo simulado

Em todo ensaio e na volta do Jogador, os limites são de tempo simulado: a pausa, a perda de foco da aba ou
a perda do sensor suspendem a simulação, nenhum passo avança e nenhum limite conta o tempo suspenso
(casos anormais de US-0001 a US-0005). A taxa de quadros não altera nenhuma medição, porque a resposta é
função dos passos de `STEP`.

## Idempotência e ordem

Um ensaio é uma função pura do acerto, do estado inicial e da sequência de `Input`: repetir o ensaio dá a
mesma saída (`DETERMINISM`). A ordem dos passos é `simStepCount`; não há contador adicional.
