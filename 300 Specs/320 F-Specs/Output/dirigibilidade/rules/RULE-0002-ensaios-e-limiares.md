---
id: RULE-0002
title: Ambientes, ensaios e limiares de dirigibilidade
feature: dirigibilidade
stage: fspec
status: validated
version: 3.2.0
sources: [US-0001, US-0002, US-0003, US-0004, US-0005, NFR-0001, NFR-0002, NFR-0003, NFR-0004, NFR-0006, NFR-0007, NFR-0008, NFR-0009, AC-US-0001-01, AC-US-0001-02, AC-US-0001-03, AC-US-0001-04, AC-US-0001-05, AC-US-0001-06, AC-US-0002-01, AC-US-0002-02, AC-US-0002-03, AC-US-0002-04, AC-US-0002-05, AC-US-0002-06, AC-US-0003-06, AC-US-0003-07, AC-US-0004-01, AC-US-0004-02, AC-US-0004-03, AC-US-0004-04, AC-US-0004-05, AC-US-0004-07, AC-US-0005-01, AC-US-0005-02, AC-US-0005-03, AC-US-0005-04, AC-US-0005-06]
---

# RULE-0002 — Ambientes, ensaios e limiares de dirigibilidade

Tabela única dos limiares desta feature, com a sua fonte, os dois ambientes de ensaio e a definição de
cada ensaio determinístico que os verifica: ambiente, estado inicial, `Input` por passo, medição e
veredito. Todo ensaio avança a simulação com `STEP`, sem renderização, controles, DOM nem relógio de
parede (I9, NFR-0005), com o acerto Arcade assistido na versão corrente, salvo onde a tabela nomeia o
Realista. Os valores medidos são reportados pelo contrato [API-0003](../api/API-0003-saida-dos-ensaios.md).

## Ambientes de ensaio

| `benchEnvironment` | O que é | Geometria | Grama e parede | Fonte |
|---|---|---|---|---|
| `TEST_PAD` (pista de teste) | Ambiente de ensaio próprio da simulação, separado da pista sintética e de qualquer pista publicada; não é dado de pista e não altera a validação de volta (NFR-0008) | Faixa de asfalto da largura da pista (`laneWidthM`, parâmetro reportado), sem paredes; a geometria é a que cada ensaio declara: **reta** para `STEER_RESPONSE`; **arco de raio 18 m** (`arcRadiusM`) para `REFERENCE_CORNER`, `UNDERSTEER_ONSET` e `REAR_RECOVERY` | Nenhuma grama nem parede a ensaiar: fora da faixa a telemetria reporta `surface` `GRASS` no sentido de "fora do asfalto". O resultado da saída da faixa é o de cada ensaio: em `REFERENCE_CORNER` e `REAR_RECOVERY`, o passo fora da faixa falha o ensaio (`OFF_ASPHALT`); em `UNDERSTEER_ONSET`, o primeiro passo fora da faixa encerra a varredura e o seu resultado segue "Fim da varredura de início do subesterço" (abaixo); em `STEER_RESPONSE`, a saída da faixa da reta não altera o veredito, que depende só dos tempos medidos de subida e de queda com a velocidade mantida, e o registro não tem campo de saída da faixa. `wallContact` nunca é verdadeiro | `SEED/RD-06`, `DOMAIN/REF-03` (via US-0001 a US-0003); AC-US-0001-05 e `DOMAIN/DEC-09` (`STEER_RESPONSE`); AC-US-0002-02 (`REFERENCE_CORNER`); AC-US-0002-06 (`UNDERSTEER_ONSET`) |
| `SYNTHETIC_TRACK` (pista sintética) | Pista do piloto de teste; raios mínimos de curva de 24 m e 25 m, com um grampo de 4 m — **não tem curva de 18 m** | A da pista sintética, inalterada | Tem grama e parede; é onde `GRASS_LOSS` e `WALL_CONTACT` rodam, por necessidade | `SEED/RD-06`, `DOMAIN/REF-03` (via US-0005) |

O Jogador nunca pilota na pista de teste; os ensaios alimentam a simulação com a mesma forma de `Input`
que os adaptadores produzem (US-0001 a US-0003, Canais). O ambiente dos ensaios `ACCELERATION` e
`TOP_SPEED` não é fixado pelos requisitos: é reportado em `benchEnvironment` (lacuna deliberada de
`01-overview.md`), e a reta usada é longa o bastante para a velocidade deixar de crescer.

## Limiares

| Limiar | Valor | Fonte |
|---|---|---|
| Subida da taxa de guinada a 90 % do regime, esterço cheio em reta da pista de teste a 50 km/h mantidos | no máximo 180 ms | `DOMAIN/DEC-01` (AC-US-0001-01) |
| Queda da taxa de guinada a 10 % do regime ao soltar | no máximo 250 ms | `DOMAIN/DEC-01` (AC-US-0001-02) |
| Subida e queda com esterço parcial (`web-mobile`) | 180 ms e 250 ms, para o regime do esterço aplicado | `SEED/US-1` via AC-US-0001-03, AC-US-0001-04 |
| Velocidade da curva de referência (arco de raio 18 m da pista de teste) | 50 km/h | `DOMAIN/DEC-02`, `DOMAIN/REF-03` (AC-US-0002-01) |
| `understeer` consecutivo na curva de referência | no máximo 200 ms | `DOMAIN/DEC-03` (AC-US-0002-01) |
| Velocidade de início do subesterço | V1 ≥ 1,15 × V0, no mesmo ensaio e no mesmo arco | `SEED/US-2` via AC-US-0002-03 |
| Patamares completos acima de 50 km/h medidos antes da saída da faixa que encerra a varredura de início do subesterço | pelo menos 2 | `DOMAIN/DEC-11` via AC-US-0002-06 |
| Recuperação da traseira ao zerar o esterço | no máximo 400 ms | `DOMAIN/DEC-04` (AC-US-0003-03) |
| Derrapagem lateral em condução normal e na recuperação | no máximo 0,65 rad | `SEED/US-3` via AC-US-0003-04, AC-US-0003-05 |
| 0–60 km/h, piloto de 75 kg | no máximo 2,5 s | `DOMAIN/DEC-05` (AC-US-0004-01) |
| Velocidade estabilizada em reta | pelo menos 105 km/h | `DOMAIN/DEC-06` (AC-US-0004-02) |
| Velocidade após 1 s na grama (entrada à velocidade estabilizada e a 50 km/h) | no máximo 70 % da velocidade de entrada | `SEED/US-4` via AC-US-0004-03; `DOMAIN/DEC-02` (AC-US-0004-04) |
| Contato com a parede | velocidade no passo seguinte menor que no passo anterior, em 100 % dos contatos | `SEED/US-4` via AC-US-0004-05 |
| Volta do piloto de teste (pista sintética) | no máximo 25 s; 0 passos fora do asfalto | `DOMAIN/DEC-07` (AC-US-0005-02, AC-US-0005-03) |
| Determinismo | resultados idênticos em 100 % de no mínimo 2 execuções | `SEED/NF-01` via AC-US-0005-01, NFR-0001 |
| Custo por passo | média no máximo 10 % acima da linha de base, mesma máquina e runtime | `SEED/NF-02` via NFR-0002 |

"No máximo" e "pelo menos" são inclusivos; "menor que" e "maior que" são estritos. Os limiares são
enunciados na unidade dos critérios (km/h, s); os campos que os verificam são SI (m/s, ms, m) por D-FS-06
([API-0003](../api/API-0003-saida-dos-ensaios.md)), e a comparação converte o limiar para a unidade do
campo (km/h ÷ 3,6 = m/s; s × 1000 = ms), sem arredondar o valor medido. Nenhum limiar mudou na revisão 3
do seed: só o ambiente e o método (`DOMAIN/REF-03`).

## Ensaios

Cada ensaio parte do ambiente e do estado inicial descritos, com acelerador, freio e esterço em 0 salvo
indicação, e aplica o `Input` indicado em todos os passos. Os parâmetros que os requisitos deixam ao
ensaio (modo de manter a velocidade e faixa tolerada, janela de estabilização do regime, largura da faixa,
posição de entrada do arco; na varredura de início do subesterço, o tamanho do patamar em km/h, a duração
de cada patamar e o modo de manter a velocidade do patamar) são **parâmetros de ensaio**: registrados em
`docs/physics.md` (NFR-0004) e, os que têm campo em [API-0003](../api/API-0003-saida-dos-ensaios.md),
também reportados na saída; nunca limiares (AC-US-0002-04, `DOMAIN/REF-04`).

| `benchId` | Ambiente | Estado inicial e `Input` | Medição | Veredito `PASS` se | Fonte |
|---|---|---|---|---|---|
| `STEER_RESPONSE` | `TEST_PAD`, reta | Asfalto, `grip`, 50 km/h, esterço 0; a velocidade é mantida em 50 km/h pelo acelerador durante todo o ensaio (`speedHoldMode`: constante ou regulado por passo); num passo o esterço vai a 1 (e, em repetição, a −1); mantido até o regime, medido na janela curta e estacionária `settleWindowMs`; depois, num passo, volta a 0 | `riseToNinetyPctMs`, `fallToTenPctMs`, `settleWindowMs`, `steadyYawRateRadPerS`, `speedMinMps`, `speedMaxMps`, `steerInputNorm` | subida ≤ 180 ms e queda ≤ 250 ms, nos dois lados, com `speedMinMps` e `speedMaxMps` dentro de `targetSpeedMps` ± `speedHoldBandMps`; `understeer` durante o ensaio não altera o veredito; velocidade fora da faixa é `FAIL` com `SPEED_NOT_HELD` | AC-US-0001-01, AC-US-0001-02, AC-US-0001-05, AC-US-0001-06; `DOMAIN/REF-03` |
| `STEER_RESPONSE` com `steerInputNorm` entre 0 e 1 exclusive (`inputMode` `PROPORTIONAL`) | `TEST_PAD`, reta | Idem, com o esterço levado ao valor parcial e mantido | idem, para o regime desse esterço | subida ≤ 180 ms e queda ≤ 250 ms, com a velocidade mantida | AC-US-0001-03, AC-US-0001-04 |
| `REFERENCE_CORNER` | `TEST_PAD`, arco de raio 18 m | Entrada do arco, dentro da faixa, 50 km/h, `grip`; esterço cheio mantido; uma execução com acelerador 0 mantido e outra com acelerador cheio mantido, durante todo o arco | `maxUndersteerMs` por `throttleCondition`; `offAsphaltStepCount` (e passo e posição da saída); `handling` em todos os passos; `arcRadiusM`, `laneWidthM` | `maxUndersteerMs` ≤ 200 ms nas duas condições; 0 passos fora da faixa de asfalto; com acelerador cheio, `handling` só `grip` ou `understeer` | AC-US-0002-01, AC-US-0002-02, AC-US-0002-05, AC-US-0003-01 |
| `UNDERSTEER_ONSET` | `TEST_PAD`, arco de raio 18 m | Entrada do arco, dentro da faixa, 50 km/h, `grip`; esterço cheio mantido; a velocidade do kart sobe no arco numa varredura em **patamares de velocidade mantida**, a partir de 50 km/h, de `entrySpeedStepMps` em `entrySpeedStepMps`; cada patamar mantém a sua velocidade pela duração do patamar (parâmetro de ensaio), e um patamar completo é uma **velocidade medida**; a varredura termina no primeiro passo fora da faixa | `v0Mps` (linha de base, mesmo ensaio e mesmo arco), `v1Mps` (novo acerto: menor velocidade medida em cujo patamar `understeer` dura mais de 200 ms consecutivos; ausente quando nenhum patamar completo o tem — V1 não medida); `maxUndersteerMsBySpeed` (maior sequência de `understeer` consecutivo dentro de cada patamar completo acima de 50 km/h); `offAsphaltStepCount` (e passo e posição da saída); `arcRadiusM`, `laneWidthM`, `entrySpeedStepMps` | V1 medida e V1 ≥ 1,15 × V0 (sem V1 medida, `FAIL` com `MEASUREMENT_MISSING`); em `maxUndersteerMsBySpeed`, o valor de cada patamar não é menor que o do patamar anterior, de velocidade menor (comparação entre patamares, nunca um máximo acumulado ao longo da varredura); a saída da faixa decide pela velocidade do kart nesse passo ("Fim da varredura de início do subesterço"); linha de base de outro ambiente ou outro arco é `BASELINE_MISSING` | AC-US-0002-03, AC-US-0002-04, AC-US-0002-05, AC-US-0002-06; `DOMAIN/DEC-11`, `DOMAIN/REF-04` (via US-0002) |
| `NORMAL_DRIVING` | o de cada ensaio agregado | Todos os passos de **condução normal** ([RULE-0001](RULE-0001-estado-de-aderencia-e-condicao-de-forcar.md)) de `REFERENCE_CORNER`, `UNDERSTEER_ONSET`, `REAR_RECOVERY` e `TEST_PILOT_LAP` no asfalto; os passos de recuperação (até 400 ms após soltar o esterço) são excluídos e contados em `excludedRecoveryStepCount`; os passos além de 400 ms sem `grip` entram | `handling` e `sideslipRad` por passo; `normalDrivingStepCount` | nenhum `oversteer`/`sliding`; `sideslipRad` ≤ 0,65 rad | AC-US-0003-01, AC-US-0003-02, AC-US-0003-05 |
| `REAR_RECOVERY` | `TEST_PAD`, arco de raio 18 m | Asfalto, dentro da faixa, `grip`, velocidade acima de 50 km/h; acelerador cheio e esterço cheio mantidos até `handling` em `oversteer` ou `sliding`; num passo o esterço vai a 0, acelerador mantido cheio | `recoveryMs` (tempo até o primeiro `grip`), `gripReached`, `maxSideslipRad` na recuperação; `offAsphaltStepCount` (e passo e posição da saída); `arcRadiusM`, `laneWidthM` | `gripReached` e `recoveryMs` ≤ 400 ms; `maxSideslipRad` ≤ 0,65 rad; o kart permanece na faixa durante a recuperação (`offAsphaltStepCount` = 0; saída é `OFF_ASPHALT`) | AC-US-0003-03, AC-US-0003-04, AC-US-0003-07 |
| `DRIFT_MANEUVER` | o da verificação existente | A verificação existente da manobra de drift de `requirements/11`, com o novo acerto | aprovação; `driftScorePoints` | aprovada e `driftScorePoints` > 0 | AC-US-0003-06 |
| `ACCELERATION` | reportado | Reta, asfalto, 0 km/h, piloto de 75 kg; acelerador cheio mantido, esterço 0 | `zeroToSixtyKmhMs` | ≤ 2 500 ms (2,5 s) | AC-US-0004-01, AC-US-0004-07 |
| `TOP_SPEED` | reportado | Reta, asfalto; acelerador cheio mantido, esterço 0, até a velocidade deixar de crescer | `topSpeedMps` | ≥ 105/3,6 m/s (105 km/h) | AC-US-0004-02, AC-US-0004-07 |
| `GRASS_LOSS` | `SYNTHETIC_TRACK` | Entrada na grama à velocidade estabilizada e, em segunda execução, a 50 km/h (13,89 m/s); acelerador cheio e esterço 0 mantidos; 1 s de tempo simulado na grama | `entrySpeedMps`, `speedAfterOneSMps` por execução | `speedAfterOneSMps` ≤ 0,70 × `entrySpeedMps` nas duas | AC-US-0004-03, AC-US-0004-04, AC-US-0004-07 |
| `WALL_CONTACT` | `SYNTHETIC_TRACK` | Trajetória que leva ao contato com a parede com velocidade maior que 0 | `speedBeforeContactMps`, `speedAfterContactMps` por contato (`wallContact` verdadeiro) | depois < antes em 100 % dos contatos | AC-US-0004-05, AC-US-0004-07 |
| `DETERMINISM` | o de cada ensaio | Cada ensaio desta tabela e a volta do piloto de teste, executados no mínimo 2 vezes com a mesma sequência de `Input` | estados por passo, tempo total e quatro tempos de setor | idênticos em 100 % das execuções | AC-US-0005-01, NFR-0001 |
| `TEST_PILOT_LAP` | `SYNTHETIC_TRACK` | Largada da pista sintética, comandos binários do piloto de teste | `lapTimeMs`, `offAsphaltStepCount`, `offAsphaltFirstStep` e posição se houver saída, `meanStepCostUs` | `lapTimeMs` ≤ 25 000 ms; `offAsphaltStepCount` = 0 | AC-US-0005-02, AC-US-0005-03, NFR-0002 |
| `SETUP_VERSION` | — | Leitura da versão declarada no dado publicado (`getSetupVersion`, [API-0002](../api/API-0002-versao-do-acerto.md)) e dos registros gravados antes da feature e com a versão nova (`readReplay`) | `declaredSetupVersion`, `previousSetupVersion`, `oldRecordsReadCount`, `oldRecordsReadOkCount` | `declaredSetupVersion` ≠ `previousSetupVersion` e `oldRecordsReadOkCount` = `oldRecordsReadCount` ([RULE-0003](RULE-0003-versao-do-acerto-e-comparabilidade.md)) | AC-US-0005-04, NFR-0009 |
| `STEP_CONTRACT` | — | Leitura de `STEP`, da taxa do solver e do conjunto, faixa e significado dos campos de `Input` | comparação com a versão anterior à feature | 0 mudanças | AC-US-0005-06, NFR-0006 |
| `REALISTA_UNCHANGED` | o de cada ensaio | Todos os ensaios de física e de dirigibilidade com `setupId` `REALISTA_ALUGUEL_4T`, nos mesmos ambientes | medidas, comparadas com a linha de base do Realista | idênticas em 100 % das medidas; 0 assistências arcade ativas | NFR-0007 |
| `STEP_COST` | `SYNTHETIC_TRACK` | Volta completa do piloto de teste | `meanStepCostUs`, comparado com a linha de base na mesma máquina e runtime | ≤ 1,10 × linha de base | NFR-0002 |

Os ensaios de US-0001 a US-0004 são executados com `inputMode` `BINARY` (sequência do teclado) e com
`inputMode` `PROPORTIONAL` (sequência equivalente da inclinação, esterço 1 mantido), e precisam de `PASS` nas
duas formas (NFR-0003). O conjunto de `npm test` da feature `race-lap-validation` continua aprovado com o
novo acerto (NFR-0008), verificado na mesma execução de `npm test`.

## Fim da varredura de início do subesterço

No `UNDERSTEER_ONSET` com o novo acerto, o primeiro passo em que o kart sai da faixa de asfalto do arco
encerra a varredura, e a velocidade do kart nesse passo (`speedMps` da telemetria,
[API-0001](../api/API-0001-telemetria-de-dirigibilidade.md), no passo `offAsphaltFirstStep`) decide o
resultado. O patamar interrompido pela saída não é velocidade medida, nem entra em V1; os patamares
completos acima de 50 km/h medidos antes da saída são os pares de `maxUndersteerMsBySpeed`
([API-0003](../api/API-0003-saida-dos-ensaios.md)).

| Velocidade no passo da saída | Patamares completos acima de 50 km/h antes da saída | Resultado | Fonte |
|---|---|---|---|
| Abaixo de 50 km/h (`speedMps` < 13,89 m/s) | qualquer número | `FAIL` com `failReason` `OFF_ASPHALT`; passo e posição da saída reportados | AC-US-0002-06 (`DOMAIN/DEC-11`) |
| Acima de 50 km/h (`speedMps` > 13,89 m/s) | 2 ou mais | Fim natural da varredura: a saída não reprova o ensaio; o veredito é o de V1 ≥ 1,15 × V0 e o da não diminuição entre os patamares medidos (tabela Ensaios); sem V1 medida (nenhum patamar completo com `understeer` por mais de 200 ms consecutivos), `FAIL` com `failReason` `MEASUREMENT_MISSING`, porque V1 ≥ 1,15 × V0 não é atendido sem V1; passo e posição da saída reportados | AC-US-0002-06 (`DOMAIN/DEC-11`); AC-US-0002-03, AC-US-0002-05 (V1 não medida) |
| Acima de 50 km/h (`speedMps` > 13,89 m/s) | 0 ou 1 | `FAIL` com `failReason` `MEASUREMENT_MISSING` (falta de medida), motivo distinto de `OFF_ASPHALT`: o critério da não diminuição entre patamares fica sem dados; passo e posição da saída reportados | AC-US-0002-06 (`DOMAIN/DEC-11`) |

A tabela vale para a varredura do novo acerto, que é a julgada; a linha de base só fornece V0 ("Linha de
base", abaixo). Na primeira e na terceira linhas o motivo da linha vale com ou sem V1 medida; em todas,
`v1Mps` só é reportado quando V1 foi medida ([API-0003](../api/API-0003-saida-dos-ensaios.md)). Em nenhum caso um critério de subesterço é medido fora do asfalto. A comparação com 50 km/h
converte o limiar para m/s (50 ÷ 3,6) sem arredondar a velocidade medida, como na seção Limiares. A saída
exatamente a 50 km/h e o fim da varredura sem saída da faixa (último patamar do ensaio concluído dentro da
faixa) não são decididos pelos requisitos, e esta especificação não os decide
([01-overview.md](../01-overview.md), Lacunas deliberadas).

## Linha de base

`UNDERSTEER_ONSET` e `STEP_COST` dependem da linha de base. Só conta como linha de base a entrada de
`docs/physics.md` do mesmo ensaio, no mesmo ambiente e na mesma geometria (`arcRadiusM`) — uma linha de
base medida em curva da pista sintética não serve para a curva de referência (US-0002, caso anormal
"Linha de base ausente"). Sem linha de base assim registrada, o ensaio reporta `FAIL` com `failReason`
`BASELINE_MISSING` e o critério não é julgado até a linha de base ser registrada. A linha de base nunca é
inventada nem extrapolada.

## Suspensão e tempo simulado

Em todo ensaio e na volta do Jogador, os limites são de tempo simulado: a pausa, a perda de foco da aba ou
a perda do sensor suspendem a simulação, nenhum passo avança e nenhum limite conta o tempo suspenso
(casos anormais de US-0001 a US-0005). A taxa de quadros não altera nenhuma medição, porque a resposta é
função dos passos de `STEP`.

## Idempotência e ordem

Um ensaio é uma função pura do acerto, do ambiente, do estado inicial e da sequência de `Input`: repetir o
ensaio dá a mesma saída (`DETERMINISM`). No `STEER_RESPONSE` com `speedHoldMode` `THROTTLE_REGULATED`, o
acelerador de cada passo é função determinística da telemetria dos passos anteriores, logo a sequência de
`Input` resultante é a mesma em toda execução. A ordem dos passos é `simStepCount`; não há contador
adicional.
