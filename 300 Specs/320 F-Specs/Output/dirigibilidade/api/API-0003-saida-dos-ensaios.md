---
id: API-0003
title: Contrato da saída dos ensaios de dirigibilidade
feature: dirigibilidade
stage: fspec
status: validated
version: 2.0.0
sources: [US-0001, US-0002, US-0003, US-0004, US-0005, NFR-0001, NFR-0002, NFR-0003, NFR-0004, NFR-0006, NFR-0007, NFR-0009, AC-US-0001-06, AC-US-0002-05, AC-US-0003-06, AC-US-0003-07, AC-US-0004-07, AC-US-0005-01, AC-US-0005-02, AC-US-0005-03, AC-US-0005-04, AC-US-0005-06]
---

# API-0003 — Contrato da saída dos ensaios de dirigibilidade

Contrato do que a saída de `npm test`, de `npm run bench:handling` e do bench de física contém
para cada ensaio de [RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md): os critérios dos requisitos
nomeiam essa saída como ponto de observação, e este contrato fixa os campos, as unidades e o veredito. A
forma de serialização (linhas de texto ou JSON) é decisão de projeto; os nomes e as unidades abaixo são
contrato. Nomes em `camelCase` plano com a unidade SI no sufixo (D-FS-06): velocidades em m/s (`...Mps`),
tempos em milissegundos (`...Ms`), como na telemetria ([API-0001](API-0001-telemetria-de-dirigibilidade.md)).
Os critérios de US-0002 e US-0004 nomeiam km/h e s como ponto de observação (AC-US-0004-07): a saída
serializada e `docs/physics.md` **apresentam** cada velocidade também convertida em km/h (valor × 3,6) e o
tempo de 0–60 km/h também em s (valor ÷ 1000) ao lado do campo SI; a apresentação não é campo do contrato
e não altera o nome nem a unidade do campo. Cada linha abaixo diz a unidade do campo.

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
| `setupId` | enum `ARCADE_ASSISTIDO`, `REALISTA_ALUGUEL_4T` | — | sim | |
| `setupVersion` | texto | — | sim | versão corrente do acerto ensaiado |
| `inputMode` | enum `BINARY`, `PROPORTIONAL` | — | sim | forma do `Input` (NFR-0003) |
| `verdict` | enum `PASS`, `FAIL` | — | sim | |
| `failReason` | enum `THRESHOLD_EXCEEDED`, `BASELINE_MISSING`, `OFF_ASPHALT`, `NON_DETERMINISTIC`, `CONTRACT_CHANGED` | — | só com `FAIL` | ausente com `PASS` |
| `measuredAtUtc` | texto (data e hora UTC) | — | sim | data da execução, para `docs/physics.md` (NFR-0004); nunca entra em nenhuma medição |
| `baselineAvailable` | booleano | — | sim | `true` quando a linha de base do ensaio está registrada |

## Campos medidos por `benchId`

| `benchId` | Campo | Tipo | Unidade | Obrigatório | Restrições |
|---|---|---|---|---|---|
| `STEER_RESPONSE` | `steerInputNorm` | número | normalizado (faixa de `Input`) | sim | 1, −1 ou valor entre 0 e 1 exclusive (parcial, `PROPORTIONAL`) |
| `STEER_RESPONSE` | `riseToNinetyPctMs` | inteiro | ms | sim | tempo simulado de 0 a 90 % do regime (AC-US-0001-06) |
| `STEER_RESPONSE` | `fallToTenPctMs` | inteiro | ms | sim | tempo simulado do regime a 10 % (AC-US-0001-06) |
| `STEER_RESPONSE` | `settleWindowMs` | inteiro | ms | sim | janela de estabilização usada para o regime (AC-US-0001-06); parâmetro de ensaio |
| `STEER_RESPONSE` | `steadyYawRateRadPerS` | número | rad/s | sim | regime medido, em módulo |
| `STEER_RESPONSE` | `throttleInputNorm` | número | normalizado | sim | acelerador mantido durante o ensaio; parâmetro de ensaio |
| `STEER_RESPONSE` | `understeerStepCount` | inteiro | passos | sim | passos em `understeer` durante o ensaio; informativo, não altera `verdict` (AC-US-0001-05) |
| `REFERENCE_CORNER` | `throttleCondition` | enum `THROTTLE_ZERO`, `THROTTLE_FULL` | — | sim | |
| `REFERENCE_CORNER` | `maxUndersteerMs` | inteiro | ms | sim | maior duração consecutiva de `understeer` (AC-US-0002-05) |
| `REFERENCE_CORNER` | `offAsphaltStepCount` | inteiro | passos | sim | 0 para `PASS` |
| `REFERENCE_CORNER` | `entrySpeedMps` | número | m/s | sim | 13,89 (50 km/h, `DOMAIN/DEC-02`); apresentado também em km/h |
| `UNDERSTEER_ONSET` | `v0Mps` | número | m/s | só com `baselineAvailable` | linha de base (AC-US-0002-05); apresentado também em km/h |
| `UNDERSTEER_ONSET` | `v1Mps` | número | m/s | sim | novo acerto (AC-US-0002-05); apresentado também em km/h |
| `UNDERSTEER_ONSET` | `entrySpeedStepMps` | número | m/s | sim | incremento de velocidade de entrada; parâmetro de ensaio; apresentado também em km/h |
| `UNDERSTEER_ONSET` | `maxUndersteerMsBySpeed` | lista de pares (`entrySpeedMps`, `maxUndersteerMs`) | m/s, ms | sim | em ordem crescente de velocidade, para as velocidades acima de V1 |
| `NORMAL_DRIVING` | `oversteerOrSlidingStepCount` | inteiro | passos | sim | 0 para `PASS` |
| `NORMAL_DRIVING` | `maxSideslipRad` | número | rad | sim | ≤ 0,65 para `PASS` |
| `REAR_RECOVERY` | `recoveryMs` | inteiro | ms | sim | tempo até `grip` (AC-US-0003-07) |
| `REAR_RECOVERY` | `maxSideslipRad` | número | rad | sim | (AC-US-0003-07) |
| `DRIFT_MANEUVER` | `driftScore` | número | pontos | sim | maior que 0 para `PASS` (AC-US-0003-06) |
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
| `FAIL` com `BASELINE_MISSING` | linha de base exigida (`UNDERSTEER_ONSET`, `STEP_COST`) ausente em `docs/physics.md` | o critério não é julgado; a linha de base precisa ser registrada (US-0002, caso anormal) |
| `FAIL` com `OFF_ASPHALT` | `offAsphaltStepCount` > 0 em `TEST_PILOT_LAP` ou `REFERENCE_CORNER` | passo e posição reportados; a feature não é entregue com esse resultado (US-0005, caso anormal) |
| `FAIL` com `NON_DETERMINISTIC` | execuções repetidas diferem | defeito de determinismo (NFR-0001), nunca tolerância |
| `FAIL` com `CONTRACT_CHANGED` | `STEP_CONTRACT` ou `REALISTA_UNCHANGED` detectam mudança | NFR-0006, NFR-0007 |
| `FAIL` com `THRESHOLD_EXCEEDED` | qualquer limiar de [RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md) não atendido | nenhum afrouxamento do limiar é admitido |

## Idempotência

Executar o mesmo ensaio duas vezes produz registros idênticos, exceto `measuredAtUtc` e `meanStepCostUs`
(que depende da máquina e é comparado só com a linha de base da mesma máquina e runtime). Não há chave;
não há estado alterado.

## Paginação e sondagem

Não se aplica.

## Compatibilidade

Contrato novo. Os ensaios existentes do bench de física mantêm os campos que já reportam;
os campos deste contrato são acrescentados. Nenhum campo existente é renomeado, removido ou tem unidade ou
significado alterados. Cada entrada de `docs/physics.md` registra estes campos, com data, para a linha de
base e para o novo acerto (NFR-0004).
