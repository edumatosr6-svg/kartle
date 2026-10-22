---
id: API-0003
title: Contrato da saída dos ensaios de dirigibilidade
feature: dirigibilidade
stage: fspec
status: validated
version: 3.2.0
sources: [US-0001, US-0002, US-0003, US-0004, US-0005, NFR-0001, NFR-0002, NFR-0003, NFR-0004, NFR-0006, NFR-0007, NFR-0009, AC-US-0001-05, AC-US-0001-06, AC-US-0002-03, AC-US-0002-04, AC-US-0002-05, AC-US-0002-06, AC-US-0003-06, AC-US-0003-07, AC-US-0004-07, AC-US-0005-01, AC-US-0005-02, AC-US-0005-03, AC-US-0005-04, AC-US-0005-06]
---

# API-0003 — Contrato da saída dos ensaios de dirigibilidade

Contrato do que a saída de `npm test`, de `npm run bench:handling` e do bench de física contém
para cada ensaio de [RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md): os critérios dos requisitos
nomeiam essa saída como ponto de observação, e este contrato fixa os campos, as unidades e o veredito. A
forma de serialização (linhas de texto ou JSON) é decisão de projeto; os nomes e as unidades abaixo são
contrato. Nomes em `camelCase` plano com a unidade SI no sufixo (D-FS-06): velocidades em m/s (`...Mps`),
tempos em milissegundos (`...Ms`), comprimentos em metros (`...M`), como na telemetria
([API-0001](API-0001-telemetria-de-dirigibilidade.md)). Os critérios de US-0001, US-0002 e US-0004 nomeiam
km/h e s como ponto de observação (AC-US-0001-06, AC-US-0002-05, AC-US-0004-07): a saída serializada e
`docs/physics.md` **apresentam** cada velocidade também convertida em km/h (valor × 3,6) e o tempo de
0–60 km/h também em s (valor ÷ 1000) ao lado do campo SI; a apresentação não é campo do contrato e não
altera o nome nem a unidade do campo. Cada linha abaixo diz a unidade do campo.

## Operações

| Operação | Propósito | Quem chama |
|---|---|---|
| `handlingBenchReport` | Produz um registro por ensaio executado | `npm test`, `npm run bench:handling`, bench de física |

## Auth

Sem sessão; executado localmente pelo desenvolvedor ou pela integração. Não é exposto ao Jogador; não há
papel, porque não há acesso em tempo de execução do jogo. Público no repositório porque não contém segredo
nem dado pessoal (I6).

## Registro por ensaio

| Campo | Tipo | Unidade | Obrigatório | Padrão e restrições |
|---|---|---|---|---|
| `benchId` | enum (ver glossário) | — | sim | um registro por ensaio e por variante (`inputMode`, `throttleCondition`, lado do esterço) |
| `benchEnvironment` | enum `TEST_PAD`, `SYNTHETIC_TRACK` | — | sim | ambiente em que o ensaio rodou ([RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md), Ambientes); `TEST_PAD` para `STEER_RESPONSE`, `REFERENCE_CORNER`, `UNDERSTEER_ONSET` e `REAR_RECOVERY`; `SYNTHETIC_TRACK` para `TEST_PILOT_LAP`, `GRASS_LOSS` e `WALL_CONTACT`; reportado para os demais (`SEED/RD-06`) |
| `setupId` | enum `ARCADE_ASSISTIDO`, `REALISTA_ALUGUEL_4T` | — | sim | |
| `setupVersion` | texto | — | sim | versão corrente do acerto ensaiado |
| `inputMode` | enum `BINARY`, `PROPORTIONAL` | — | sim | forma do `Input` (NFR-0003) |
| `verdict` | enum `PASS`, `FAIL` | — | sim | |
| `failReason` | enum `THRESHOLD_EXCEEDED`, `BASELINE_MISSING`, `OFF_ASPHALT`, `NON_DETERMINISTIC`, `CONTRACT_CHANGED`, `SPEED_NOT_HELD`, `MEASUREMENT_MISSING` | — | só com `FAIL` | ausente com `PASS` |
| `measuredAtUtc` | texto (data e hora UTC) | — | sim | data da execução, para `docs/physics.md` (NFR-0004); nunca entra em nenhuma medição |
| `baselineAvailable` | booleano | — | sim | `true` quando a linha de base do ensaio está registrada no mesmo ensaio, no mesmo ambiente e na mesma geometria |

## Campos medidos por `benchId`

| `benchId` | Campo | Tipo | Unidade | Obrigatório | Restrições |
|---|---|---|---|---|---|
| `STEER_RESPONSE` | `steerInputNorm` | número | normalizado (faixa de `Input`) | sim | 1, −1 ou valor entre 0 e 1 exclusive (parcial, `PROPORTIONAL`) |
| `STEER_RESPONSE` | `targetSpeedMps` | número | m/s | sim | 13,89 (50 km/h, `DOMAIN/DEC-01`); apresentado também em km/h |
| `STEER_RESPONSE` | `speedHoldMode` | enum `THROTTLE_CONSTANT`, `THROTTLE_REGULATED` | — | sim | modo de manter a velocidade em 50 km/h pelo acelerador (`DOMAIN/REF-03`); parâmetro de ensaio |
| `STEER_RESPONSE` | `throttleInputNorm` | número | normalizado | só com `speedHoldMode` `THROTTLE_CONSTANT` | acelerador constante mantido durante o ensaio; parâmetro de ensaio; ausente em `THROTTLE_REGULATED`, em que o acelerador de cada passo é escolhido pelo ensaio |
| `STEER_RESPONSE` | `speedHoldBandMps` | número | m/s | sim | meia-largura da faixa tolerada em torno de `targetSpeedMps`; parâmetro de ensaio |
| `STEER_RESPONSE` | `speedMinMps`, `speedMaxMps` | número | m/s | sim | velocidade mínima e máxima observadas enquanto o esterço está aplicado (AC-US-0001-06, prova de velocidade mantida); apresentadas também em km/h; fora de `targetSpeedMps` ± `speedHoldBandMps` o veredito é `FAIL` com `SPEED_NOT_HELD` |
| `STEER_RESPONSE` | `riseToNinetyPctMs` | inteiro | ms | sim | tempo simulado de 0 a 90 % do regime (AC-US-0001-06) |
| `STEER_RESPONSE` | `fallToTenPctMs` | inteiro | ms | sim | tempo simulado do regime a 10 % (AC-US-0001-06) |
| `STEER_RESPONSE` | `settleWindowMs` | inteiro | ms | sim | janela curta e estacionária usada para medir o regime (AC-US-0001-06); parâmetro de ensaio |
| `STEER_RESPONSE` | `steadyYawRateRadPerS` | número | rad/s | sim | regime medido na janela, em módulo, com a velocidade mantida (AC-US-0001-06) |
| `STEER_RESPONSE` | `understeerStepCount` | inteiro | passos | sim | passos em `understeer` durante o ensaio; informativo, não altera `verdict` (AC-US-0001-05) |
| `REFERENCE_CORNER` | `throttleCondition` | enum `THROTTLE_ZERO`, `THROTTLE_FULL` | — | sim | |
| `REFERENCE_CORNER` | `arcRadiusM` | número | m | sim | 18 (`DOMAIN/REF-03`) |
| `REFERENCE_CORNER` | `laneWidthM` | número | m | sim | largura da faixa de asfalto do arco ("faixa da largura da pista"); parâmetro de ensaio |
| `REFERENCE_CORNER` | `maxUndersteerMs` | inteiro | ms | sim | maior duração consecutiva de `understeer` (AC-US-0002-05) |
| `REFERENCE_CORNER` | `offAsphaltStepCount` | inteiro | passos | sim | 0 para `PASS` |
| `REFERENCE_CORNER` | `offAsphaltFirstStep` | inteiro | passos | só com `offAsphaltStepCount` > 0 | passo da saída da faixa (US-0002, caso anormal) |
| `REFERENCE_CORNER` | `offAsphaltFirstXM`, `offAsphaltFirstZM` | número | m | só com `offAsphaltStepCount` > 0 | posição da saída da faixa |
| `REFERENCE_CORNER` | `entrySpeedMps` | número | m/s | sim | 13,89 (50 km/h, `DOMAIN/DEC-02`); apresentado também em km/h |
| `UNDERSTEER_ONSET` | `arcRadiusM`, `laneWidthM` | número | m | sim | como em `REFERENCE_CORNER`; a linha de base só vale com o mesmo `arcRadiusM` |
| `UNDERSTEER_ONSET` | `v0Mps` | número | m/s | só com `baselineAvailable` | linha de base no mesmo ensaio e arco (AC-US-0002-05); apresentado também em km/h |
| `UNDERSTEER_ONSET` | `v1Mps` | número | m/s | só quando V1 foi medida: algum patamar completo da varredura do novo acerto teve `understeer` por mais de 200 ms consecutivos | novo acerto (AC-US-0002-05): a menor velocidade mantida de patamar completo em que isso ocorreu; o patamar interrompido pela saída da faixa não conta; ausente quando nenhum patamar completo o teve, e o veredito segue a tabela Erros (`MEASUREMENT_MISSING`, ou o motivo da saída da faixa); apresentado também em km/h |
| `UNDERSTEER_ONSET` | `entrySpeedStepMps` | número | m/s | sim | passo da varredura a partir da velocidade de entrada de 13,89 m/s (50 km/h): diferença de velocidade mantida entre patamares sucessivos, o tamanho do patamar de AC-US-0002-04 (`DOMAIN/REF-04`); parâmetro de ensaio; apresentado também em km/h |
| `UNDERSTEER_ONSET` | `maxUndersteerMsBySpeed` | lista de pares (`plateauSpeedMps`, `maxUndersteerMs`) | m/s, ms | sim | um par por patamar completo de velocidade mantida acima de 13,89 m/s (50 km/h) medido antes do fim da varredura, em ordem crescente de velocidade: a velocidade mantida do patamar e a maior sequência de `understeer` consecutivo dentro dele, em ms de tempo simulado (AC-US-0002-04); o patamar interrompido pela saída da faixa não entra; lista vazia quando nenhum patamar acima de 50 km/h se completou |
| `UNDERSTEER_ONSET` | `offAsphaltStepCount` | inteiro | passos | sim | 0 ou 1: a varredura termina no primeiro passo fora da faixa; 1 não reprova por si, o resultado da saída segue [RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md), "Fim da varredura de início do subesterço" (AC-US-0002-06) |
| `UNDERSTEER_ONSET` | `offAsphaltFirstStep` | inteiro | passos | só com `offAsphaltStepCount` > 0 | passo da saída da faixa, que encerra a varredura (US-0002, caso anormal) |
| `UNDERSTEER_ONSET` | `offAsphaltFirstXM`, `offAsphaltFirstZM` | número | m | só com `offAsphaltStepCount` > 0 | posição da saída da faixa |
| `NORMAL_DRIVING` | `normalDrivingStepCount` | inteiro | passos | sim | passos classificados como condução normal e agregados ([RULE-0001](../rules/RULE-0001-estado-de-aderencia-e-condicao-de-forcar.md)) |
| `NORMAL_DRIVING` | `excludedRecoveryStepCount` | inteiro | passos | sim | passos de recuperação (até 400 ms) excluídos do agregado |
| `NORMAL_DRIVING` | `oversteerOrSlidingStepCount` | inteiro | passos | sim | 0 para `PASS` (AC-US-0003-07) |
| `NORMAL_DRIVING` | `maxSideslipRad` | número | rad | sim | em condução normal; ≤ 0,65 para `PASS` (AC-US-0003-07) |
| `REAR_RECOVERY` | `arcRadiusM`, `laneWidthM` | número | m | sim | geometria da pista de teste usada; como em `REFERENCE_CORNER` |
| `REAR_RECOVERY` | `gripReached` | booleano | — | sim | `true` quando `handling` voltou a `grip` dentro do ensaio |
| `REAR_RECOVERY` | `recoveryMs` | inteiro | ms | só com `gripReached` | tempo até o primeiro `grip` (AC-US-0003-07); ≤ 400 para `PASS` |
| `REAR_RECOVERY` | `maxSideslipRad` | número | rad | sim | na recuperação (AC-US-0003-07) |
| `REAR_RECOVERY` | `offAsphaltStepCount` | inteiro | passos | sim | passos fora da faixa durante a recuperação; 0 para `PASS` |
| `REAR_RECOVERY` | `offAsphaltFirstStep` | inteiro | passos | só com `offAsphaltStepCount` > 0 | passo da saída da faixa; como em `REFERENCE_CORNER` |
| `REAR_RECOVERY` | `offAsphaltFirstXM`, `offAsphaltFirstZM` | número | m | só com `offAsphaltStepCount` > 0 | posição da saída da faixa; como em `REFERENCE_CORNER` |
| `DRIFT_MANEUVER` | `driftScorePoints` | número | pontos | sim | pontuação da manobra na verificação existente de `requirements/11`; maior que 0 para `PASS` (AC-US-0003-06) |
| `ACCELERATION` | `zeroToSixtyKmhMs` | inteiro | ms | sim | tempo simulado de 0 a 60 km/h (16,67 m/s); apresentado também em s (AC-US-0004-07) |
| `ACCELERATION` | `driverMassKg` | número | kg | sim | 75 |
| `TOP_SPEED` | `topSpeedMps` | número | m/s | sim | apresentado também em km/h (AC-US-0004-07) |
| `GRASS_LOSS` | `entrySpeedMps` | número | m/s | sim | velocidade estabilizada ou 13,89 (50 km/h); apresentado também em km/h |
| `GRASS_LOSS` | `speedAfterOneSMps` | número | m/s | sim | apresentado também em km/h (AC-US-0004-07) |
| `WALL_CONTACT` | `contacts` | lista de pares (`speedBeforeContactMps`, `speedAfterContactMps`) | m/s | sim | um par por contato, apresentado também em km/h (AC-US-0004-07); lista vazia é `FAIL`, porque o ensaio exige ao menos um contato |
| `DETERMINISM` | `runCount` | inteiro | execuções | sim | pelo menos 2 |
| `DETERMINISM` | `identical` | booleano | — | sim | `true` para `PASS` (AC-US-0005-01) |
| `TEST_PILOT_LAP` | `lapTimeMs` | inteiro | ms | sim | tempo total (AC-US-0005-03) |
| `TEST_PILOT_LAP` | `sectorMs` | lista de 4 inteiros | ms | sim | |
| `TEST_PILOT_LAP` | `offAsphaltStepCount` | inteiro | passos | sim | 0 para `PASS` (AC-US-0005-02) |
| `TEST_PILOT_LAP` | `offAsphaltFirstStep` | inteiro | passos | só com `offAsphaltStepCount` > 0 | passo da primeira saída |
| `TEST_PILOT_LAP` | `offAsphaltFirstXM`, `offAsphaltFirstZM` | número | m | só com `offAsphaltStepCount` > 0 | posição da primeira saída (US-0005, caso anormal) |
| `TEST_PILOT_LAP` | `baselineLapTimeMs` | inteiro | ms | só com `baselineAvailable` | ~31 400 na linha de base citada |
| `STEP_COST` | `meanStepCostUs` | número | µs | sim | média por passo sobre a volta (NFR-0002) |
| `STEP_COST` | `baselineMeanStepCostUs` | número | µs | só com `baselineAvailable` | |
| `SETUP_VERSION` | `declaredSetupVersion`, `previousSetupVersion` | texto | — | sim | diferentes para `PASS` (AC-US-0005-04) |
| `SETUP_VERSION` | `oldRecordsReadCount`, `oldRecordsReadOkCount` | inteiro | registros | sim | iguais para `PASS` (NFR-0009) |
| `STEP_CONTRACT` | `stepUnchanged`, `solverRateUnchanged`, `inputFieldsUnchanged` | booleano | — | sim | todos `true` para `PASS` (AC-US-0005-06) |
| `REALISTA_UNCHANGED` | `differingMeasureCount` | inteiro | medidas | sim | 0 para `PASS` (NFR-0007) |
| `REALISTA_UNCHANGED` | `arcadeAssistActiveCount` | inteiro | assistências | sim | 0 para `PASS` |

Forma vazia: uma execução que não roda nenhum ensaio produz zero registros e é reportada como tal; nunca
produz `PASS` implícito.

## Erros

| Código | Condição | Efeito |
|---|---|---|
| `FAIL` com `BASELINE_MISSING` | linha de base exigida (`UNDERSTEER_ONSET`, `STEP_COST`) ausente em `docs/physics.md`, ou registrada em outro ambiente, outro arco ou outra máquina e runtime | o critério não é julgado; a linha de base precisa ser registrada no mesmo ensaio (US-0002, caso anormal) |
| `FAIL` com `SPEED_NOT_HELD` | em `STEER_RESPONSE`, `speedMinMps` ou `speedMaxMps` fora de `targetSpeedMps` ± `speedHoldBandMps` enquanto o esterço está aplicado | o regime não é estacionário; os tempos medidos não valem como veredito (US-0001, caso anormal "Velocidade não mantida") |
| `FAIL` com `OFF_ASPHALT` | `offAsphaltStepCount` > 0 em `TEST_PILOT_LAP`, `REFERENCE_CORNER` ou `REAR_RECOVERY`; em `UNDERSTEER_ONSET`, saída da faixa com `speedMps` abaixo de 13,89 m/s (50 km/h) no passo `offAsphaltFirstStep` | passo e posição reportados; a feature não é entregue com esse resultado (US-0002 e US-0005, casos anormais; AC-US-0002-06) |
| `FAIL` com `MEASUREMENT_MISSING` | em `UNDERSTEER_ONSET` com o novo acerto: (a) saída da faixa com `speedMps` acima de 13,89 m/s (50 km/h) no passo `offAsphaltFirstStep` antes do segundo patamar completo acima de 50 km/h (`maxUndersteerMsBySpeed` com menos de 2 pares); ou (b) fim natural da varredura (saída acima de 50 km/h depois de pelo menos dois patamares completos acima de 50 km/h) sem V1 medida — nenhum patamar completo com `understeer` por mais de 200 ms consecutivos, `v1Mps` ausente | falta de medida, motivo distinto de `OFF_ASPHALT`: em (a) o critério da não diminuição entre patamares fica sem dados (AC-US-0002-06); em (b) V1 ≥ 1,15 × V0 não é atendido, porque V1 não existe na saída (AC-US-0002-03, AC-US-0002-05); passo e posição da saída reportados nos dois casos |
| `FAIL` com `NON_DETERMINISTIC` | execuções repetidas diferem | defeito de determinismo (NFR-0001), nunca tolerância |
| `FAIL` com `CONTRACT_CHANGED` | `STEP_CONTRACT` ou `REALISTA_UNCHANGED` detectam mudança | NFR-0006, NFR-0007 |
| `FAIL` com `THRESHOLD_EXCEEDED` | qualquer limiar de [RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md) não atendido, incluindo recuperação acima de 400 ms ou sem `grip` (`gripReached` falso) | nenhum afrouxamento do limiar é admitido |

Em `UNDERSTEER_ONSET`, a saída da faixa acima de 50 km/h depois de pelo menos dois patamares completos acima
de 50 km/h é o fim natural da varredura e não é erro por si: o registro traz `offAsphaltStepCount` 1, o passo
e a posição da saída, e o veredito de V1 e da não diminuição entre patamares; sem V1 medida, esse veredito é
`FAIL` com `MEASUREMENT_MISSING`, caso (b) da tabela acima
([RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md), "Fim da varredura de início do subesterço";
AC-US-0002-03, AC-US-0002-06).

Em `STEER_RESPONSE`, a saída da faixa da reta da pista de teste não é erro e não tem campo no registro: o
veredito depende só dos tempos medidos de subida e de queda da taxa de guinada, com a velocidade mantida
(`SPEED_NOT_HELD` quando ela sai da faixa tolerada), do mesmo modo que um passo em `understeer` nesse
ensaio não o altera ([RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md), Ambientes de ensaio; AC-US-0001-05,
`DOMAIN/DEC-09`).

## Idempotência

Executar o mesmo ensaio duas vezes produz registros idênticos, exceto `measuredAtUtc` e `meanStepCostUs`
(que depende da máquina e é comparado só com a linha de base da mesma máquina e runtime). Não há chave;
não há estado alterado.

## Paginação e sondagem

Não se aplica.

## Compatibilidade

Contrato novo, ainda sem registro publicado sob ele. Os ensaios existentes do bench de física mantêm os
campos que já reportam; os campos deste contrato são acrescentados. Nenhum campo existente do bench de
física é renomeado, removido ou tem unidade ou significado alterados. Em relação à versão anterior deste
contrato: `benchEnvironment`, `targetSpeedMps`, `speedHoldMode`, `speedHoldBandMps`, `speedMinMps`,
`speedMaxMps`, `arcRadiusM`, `laneWidthM`, `offAsphaltFirstStep` e posição em `REFERENCE_CORNER`,
`normalDrivingStepCount`, `excludedRecoveryStepCount`, `gripReached` e o valor `SPEED_NOT_HELD` de
`failReason` são aditivos; `throttleInputNorm` mantém nome, unidade e significado (acelerador constante
mantido) e passa a ser condicional a `speedHoldMode` `THROTTLE_CONSTANT`, porque a revisão 3 do seed deixa
o acelerador variar por passo para manter a velocidade (`DOMAIN/REF-03`); `recoveryMs` mantém nome e
unidade e passa a ser condicional a `gripReached`, porque sem `grip` no ensaio o tempo não existe. Cada
entrada de `docs/physics.md` registra estes campos, com data, para a linha de base e para o novo acerto
(NFR-0004).

Na versão 3.1.0 deste contrato, por AC-US-0002-04 e AC-US-0002-06 (`DOMAIN/DEC-11`, `DOMAIN/REF-04`):
o valor `MEASUREMENT_MISSING` de `failReason` e os campos `offAsphaltStepCount`, `offAsphaltFirstStep`,
`offAsphaltFirstXM` e `offAsphaltFirstZM` nos registros `UNDERSTEER_ONSET` e `REAR_RECOVERY` são aditivos e
mantêm o nome, a unidade e o significado que já têm em `REFERENCE_CORNER`. A varredura de
`UNDERSTEER_ONSET` passa a medir em patamares de velocidade mantida: `entrySpeedStepMps` mantém nome,
unidade e significado (o passo da varredura a partir da velocidade de entrada), aplicado entre patamares;
`maxUndersteerMsBySpeed` mantém nome e unidades e cobre os patamares completos acima de 50 km/h (antes, as
velocidades de entrada acima de V1); no par, o primeiro elemento deixa de ser uma velocidade de entrada e
passa a se chamar `plateauSpeedMps` (velocidade mantida do patamar), em vez de `entrySpeedMps`, que continua
a significar velocidade de entrada em `REFERENCE_CORNER` e `GRASS_LOSS`. Nenhum registro foi publicado sob
a forma anterior; uma entrada de `docs/physics.md` medida por velocidades de entrada não é o mesmo ensaio e
não serve como linha de base de `UNDERSTEER_ONSET` (`BASELINE_MISSING`, US-0002, caso anormal "Linha de
base ausente").

Na versão 3.2.0 deste contrato: `driftScore` passa a se chamar `driftScorePoints`, com o mesmo tipo, a mesma
unidade (pontos) e o mesmo significado, para levar a unidade no nome (D-FS-06); o nome `driftScore` deixa de
ser emitido em qualquer registro, e a substituta é `driftScorePoints`. Nenhum registro foi publicado sob o
nome anterior e nenhum consumidor lê este contrato como entrada, de modo que não há leitura a rejeitar.
`v1Mps` mantém nome, unidade e significado e passa a ser condicional a V1 ter sido medida, porque sem patamar
completo com `understeer` acima de 200 ms consecutivos a velocidade não existe (como `recoveryMs` com
`gripReached`). `MEASUREMENT_MISSING` mantém o significado (falta de medida) e passa a cobrir também o fim
natural da varredura sem V1 medida, caso (b) da tabela Erros. Nenhum campo nem valor de enum é acrescentado.
