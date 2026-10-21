---
id: DES-0004
title: Ensaios de dirigibilidade, linha de base e saída (API-0003)
feature: dirigibilidade
stage: dspec
status: validated
version: 2.0.1
sources: [API-0003, RULE-0002, FLOW-0002, FEAT-0001, FEAT-0002, FEAT-0003, FEAT-0004, FEAT-0005, FEAT-0006, REQ-FEAT-0001-05, REQ-FEAT-0001-06, REQ-FEAT-0002-04, REQ-FEAT-0002-05, REQ-FEAT-0002-06, REQ-FEAT-0002-07, REQ-FEAT-0003-07, REQ-FEAT-0003-08, REQ-FEAT-0004-07, REQ-FEAT-0005-01, REQ-FEAT-0005-02, REQ-FEAT-0005-03, REQ-FEAT-0005-04, REQ-FEAT-0005-07, REQ-FEAT-0005-11, REQ-FEAT-0005-12, REQ-FEAT-0006-02, REQ-FEAT-0006-04, REQ-FEAT-0006-05, REQ-FEAT-0006-06, REQ-FEAT-0006-07, REQ-FEAT-0006-08, REQ-FEAT-0006-09, NFR-0001, NFR-0002, NFR-0003, NFR-0004, NFR-0007, NFR-0008]
---

# DES-0004 — Ensaios de dirigibilidade, linha de base e saída (API-0003)

## Realiza

O contrato API-0003 campo a campo e a tabela de ensaios de RULE-0002: um registro por `benchId` e variante
na saída de `npm test`, `npm run bench:handling` e do bench de física (`npm run bench:physics`) (AC-US-0001-06, AC-US-0002-05,
AC-US-0003-06, -07, AC-US-0004-07, AC-US-0005-01 a -04, -06); veredito do `STEER_RESPONSE` só pelos tempos
(AC-US-0001-05); `BASELINE_MISSING` sem linha de base (REQ-FEAT-0002-07, REQ-FEAT-0006-09); `OFF_ASPHALT` e
`THRESHOLD_EXCEEDED` no piloto de teste (REQ-FEAT-0005-11); `NON_DETERMINISTIC` como defeito
(REQ-FEAT-0005-12; NFR-0001); paridade `BINARY`/`PROPORTIONAL` (NFR-0003); custo por passo (NFR-0002);
Realista idêntico (NFR-0007); contrato de passo (REQ-FEAT-0005-07); `race-lap-validation` aprovado na mesma
execução (NFR-0008); registro em `docs/physics.md` (NFR-0004). Decisões:
[ADR-0003](../adr/ADR-0003-linha-de-base-legivel-por-maquina-em-docs-physics.md),
[ADR-0004](../adr/ADR-0004-ensaios-como-biblioteca-e-parametros-de-ensaio.md).

## Posicionamento

Dois lugares, com camadas distintas; lugar na árvore: `scripts/`, onde as diretrizes põem os benches, e
`tests/` para as verificações.

- `scripts/handlingBench.ts`, **novo**, camada **Simulação** (os ensaios só avançam a simulação com `STEP`):
  biblioteca pura dos ensaios (sem DOM, sem `three`, sem `node:perf_hooks`, sem `node:os`, sem `Date`, sem
  `performance`), importada por `npm test` e pelos dois benches. Motivo de ser novo: `scripts/keyboard-lap.ts`
  é um programa que imprime ao carregar, não uma biblioteca; e os ensaios não são código do jogo, logo não
  ficam em `src/`. Todo valor de parede (`measuredAtUtc`, `meanStepCostUs`, `runtimeId`) entra por argumento.
- `scripts/keyboard-lap.ts` (`bench:handling`), **alterado**, camada **Aplicação** (programa de bench em Node,
  que só altera a simulação por `startLap`/`stepLap`): passa a chamar a biblioteca e a imprimir os
  registros `STEER_RESPONSE`, `REFERENCE_CORNER`, `UNDERSTEER_ONSET`, `NORMAL_DRIVING`, `REAR_RECOVERY`,
  `TEST_PILOT_LAP`, `DETERMINISM`, `STEP_COST` e `REALISTA_UNCHANGED`; é o único módulo desta feature que
  importa `node:perf_hooks` (mede `meanStepCostUs`, executando ele mesmo a volta cronometrada com
  `testPilot` da biblioteca e `stepLap`) e `node:os` (`runtimeId()`), e que lê `new Date()`
  (`measuredAtUtc`); a função `keyboardLap` e o uso de `LapTracker` saem deste programa (a linha 3 de
  `src/physics.ts` e o teste `tests/physics.test.ts:35` ficam).
- `scripts/physics-bench.ts` (`bench:physics`), **alterado**, camada **Aplicação**: mantém as linhas que já
  imprime (`:10-35`) e acrescenta `ACCELERATION`, `TOP_SPEED`, `GRASS_LOSS` e `WALL_CONTACT`; lê `new Date()`
  para `measuredAtUtc`; não mede custo por passo nem calcula `runtimeId` (nenhum dos seus registros usa um
  nem outro), logo não importa `node:perf_hooks` nem `node:os`.
- `tests/dirigibilidade-*.test.ts`, **novos**: chamam a biblioteca e afirmam o veredito de cada registro
  ([test-strategy](../test-strategy.md)).
- `docs/physics.md`, **alterado** pela etapa de código: entrada datada com parâmetros e campos, e o bloco
  `handling-baseline` ([DM-0001](../data/DM-0001-dado-publicado-registros-e-linha-de-base.md), seção 5).

## Interface

`scripts/handlingBench.ts`:

| Símbolo | Assinatura | Descrição |
|---|---|---|
| `BenchRecord` | união discriminada por `benchId` | exatamente os campos de API-0003 por `benchId`, com os tipos e unidades de lá |
| `BenchOptions` | `{setup: PublishedSetup, version: 'current' \| 'previous', inputMode: 'BINARY' \| 'PROPORTIONAL', baseline?: Baseline, measuredAtUtc: string, stepCost?: {meanStepCostUs: number, runtimeId: string}}` | `version: 'previous'` usa `previousConfig` (só para produzir a linha de base); `measuredAtUtc` vem do chamador (bench: `new Date().toISOString()`; teste: constante), nunca da biblioteca; `stepCost` é a medida de parede já feita pelo programa de bench (µs por passo, média) com o `runtimeId` da máquina, nunca lida pela biblioteca |
| `runBench(benchId, options)` | `(BenchId, BenchOptions) => BenchRecord[]` | um registro por variante do ensaio; `runBench('STEP_COST', options)` exige `options.stepCost` e só compara o valor recebido com a linha de base (não cronometra nada) |
| `handlingBenchReport(options, benchIds?)` | `(BenchOptions, BenchId[]?) => BenchRecord[]` | todos os ensaios, ou os pedidos; `STEP_COST` entra só quando `options.stepCost` está presente; zero ensaios dá lista vazia, nunca `PASS` implícito |
| `readBaseline(markdownText, setupId, setupVersion, runtimeId?)` | `(string, SetupId, string, string?) => Baseline \| undefined` | localiza o bloco `handling-baseline` em `docs/physics.md` e a entrada pedida; `runtimeId` vem do chamador |
| `serialize(records, parameters)` | `(BenchRecord[], object) => string` | uma linha `#` JSON com os parâmetros de ensaio e uma linha JSON por registro |
| `testPilot(config)` | `(KartConfig) => Controller` | o piloto de teste: comandos binários decididos a cada 12 passos (10 Hz) por antecipação sobre `track`, derivado de `scripts/keyboard-lap.ts:14-28`, com `maxSpeedMps` e `lateralBudgetMps2` como parâmetros de ensaio; exportado pela biblioteca e importado por `TEST_PILOT_LAP`, `DETERMINISM`, `npm test` e por `measureStepCost` em `scripts/keyboard-lap.ts` |

`scripts/keyboard-lap.ts` (programa de bench, camada Aplicação; importa `testPilot` da biblioteca, nunca o
contrário — o programa não é importável):

| Símbolo | Assinatura | Descrição |
|---|---|---|
| `runtimeId()` | `() => string` | `${platform}-${arch}-node${versions.node}-${modelo da CPU}` com `node:os` (ADR-0003); nunca nome de máquina ou de usuário; local ao programa, não exportado |
| `measureStepCost(setup)` | `(PublishedSetup) => {meanStepCostUs: number}` | executa a volta de `TEST_PILOT_LAP` (`startLap`, `COUNTDOWN_STEPS` passos nulos, `testPilot` importado de `scripts/handlingBench.ts`, `stepLap`) com `performance.now()` de `node:perf_hooks` lido antes e depois de cada `stepLap`; local ao programa, não exportado; o tempo medido nunca entra em medida de domínio (I9) |

Toda medida vem de `getHandlingTelemetry` ([DES-0002](DES-0002-telemetria-de-dirigibilidade.md)) ou de
`getLapResult`/`getLapState` (`src/lap.ts`); todo tempo em ms é `toMs(passos)` de `src/lapTiming.ts`
(inteiro exato); toda comparação com limiar converte o limiar para a unidade do campo sem arredondar o
medido (RULE-0002). Os limiares são os do acerto agressivo (`DOMAIN/REF-02`, F-Spec 2.0.0), comparados em
ms sobre `toMs` (`Math.floor((25 × passos + 1) / 3)`): 180 ms não é múltiplo de um passo — `toMs(21)` = 175
é `PASS` e `toMs(22)` = 183 é `FAIL`, sem arredondar o limiar para 22 passos; 250 ms = 30 passos, 200 ms =
24, 400 ms = 48, 2 500 ms = 300, 25 000 ms = 3 000. Velocidades: 60 km/h = 16,666… m/s (`60 / 3.6`),
105 km/h = `105 / 3.6` (29,166… m/s), 50 km/h = `50 / 3.6` (13,888… m/s), a mesma expressão da condição
de forçar em `src/physics.ts` ([DES-0001](DES-0001-acerto-arcade-assistido-v5-e-assistencias.md)).

### Definição de cada ensaio (estado inicial, `Input`, medição, veredito)

Ambientes: `TEST_PAD` (asfalto infinito, sem paredes) para reta e recuperação; `CIRCUIT` com a pista
sintética (`readTrackData(SYNTHETIC_TRACK_FILE)`) para curva, parede e piloto de teste. "Reta a V" é
`{...initialState(), x: 0, z: 0, heading: 0, vx: 0, vz: V, speed: V}` como em `tests/physics.test.ts:5`.
Acelerador, freio e esterço começam em 0 salvo indicação. `inputMode` `PROPORTIONAL` entrega os mesmos
valores de esterço cheio (1 ou −1) e acelerador que `BINARY`, por um `Input` construído como o adaptador de
inclinação constrói (número contínuo saturado), e acrescenta a variante parcial onde a tabela a nomeia.

| `benchId` | Estado inicial e `Input` por passo | Medição | `PASS` se |
|---|---|---|---|
| `STEER_RESPONSE` (variantes: lado +1 e −1; `PROPORTIONAL` acrescenta `steerInputNorm` 0,5 nos dois lados) | reta a `50 / 3.6` m/s (13,889 m/s, 50 km/h), `handling` `grip`, `TEST_PAD`, acerto corrente com `driverMass` 75; `throttleInputNorm` 0 mantido (parâmetro: evita a condição de forçar); no passo 0 o esterço vai ao valor da variante e fica por `holdMs` 2 000; depois volta a 0 num passo e fica por mais 2 000 ms | `steadyYawRateRadPerS` = média de `\|yawRateRadPerS\|` nos últimos `settleWindowMs` 500 do período mantido; `riseToNinetyPctMs` = `toMs` do primeiro passo em que `\|yawRateRadPerS\| >= 0.9 × steady`; `fallToTenPctMs` = `toMs` dos passos entre a soltura e o primeiro passo em que `\|yawRateRadPerS\| <= 0.1 × steady`; `understeerStepCount` = passos com `handling` `understeer` | `riseToNinetyPctMs <= 180` e `fallToTenPctMs <= 250`; `understeerStepCount` nunca altera o veredito (AC-US-0001-05) |
| `REFERENCE_CORNER` (variantes: `THROTTLE_ZERO`, `THROTTLE_FULL`) | `CIRCUIT`; curva de referência = segmento de `track` de menor raio de curvatura discreta (três pontos consecutivos; 18 m na pista sintética), localizado pela biblioteca; entrada = ponto da linha central `entryArcM` antes do ápice (parâmetro, 20 m), `heading` tangente, `entrySpeedMps` `50 / 3.6` (13,89); esterço cheio para o lado interno da curva mantido; acelerador 0 ou 1 mantido; janela `cornerWindowMs` 2 500 | `maxUndersteerMs` = maior sequência consecutiva de `understeer` em ms; `offAsphaltStepCount` = passos com `surface` `GRASS`; `handling` por passo | `maxUndersteerMs <= 200`, `offAsphaltStepCount = 0` e, em `THROTTLE_FULL`, nenhum passo com `oversteer` ou `sliding`; senão `OFF_ASPHALT` (se saiu) ou `THRESHOLD_EXCEEDED` |
| `UNDERSTEER_ONSET` | como `REFERENCE_CORNER` com acelerador 0, para `entrySpeedMps` de `50 / 3.6` (13,89) subindo de `entrySpeedStepMps` 0,5 até `entrySpeedMaxMps` 25 (parâmetro); cada velocidade mede até o fim da janela ou o primeiro passo fora do asfalto | `v1Mps` = menor velocidade com `maxUndersteerMs > 200`; `maxUndersteerMsBySpeed` para as velocidades acima de V1; `v0Mps` da linha de base (`baselineAvailable`) | com linha de base: `v1Mps >= 1.15 × v0Mps` e `maxUndersteerMs` não decrescente em `maxUndersteerMsBySpeed`; sem linha de base: `FAIL` `BASELINE_MISSING`, sem julgar; V1 não encontrado até o máximo: `THRESHOLD_EXCEEDED` |
| `NORMAL_DRIVING` | agrega os passos de `REFERENCE_CORNER`, `UNDERSTEER_ONSET`, `REAR_RECOVERY` e `TEST_PILOT_LAP` em que `forcing` e `driftActive` são falsos e `surface` é `ASPHALT` | `oversteerOrSlidingStepCount`; `maxSideslipRad` | 0 e `<= 0.65` |
| `REAR_RECOVERY` | reta a `forcingSpeedMps` 16,7 (parâmetro, 60 km/h), `TEST_PAD`; acelerador 1 e esterço 1 mantidos até o primeiro passo com `handling` `oversteer` ou `sliding` (janela `forcingWindowMs` 3 000); nesse passo o esterço vai a 0 e o acelerador fica em 1 | `recoveryMs` = `toMs` dos passos até `handling` `grip`; `maxSideslipRad` nesses passos | `recoveryMs <= 400` e `maxSideslipRad <= 0.65`; se a traseira não solta dentro da janela, `FAIL` `THRESHOLD_EXCEEDED` com `recoveryMs` igual à janela (ADR-0004) |
| `DRIFT_MANEUVER` | o cenário de `tests/maneuvers.test.ts:68-79` com o acerto corrente: reta a 12 m/s, `{throttle: 1, steer: 0.7, drift: true}` por 2 s, depois `{throttle: 1, steer: 0}` por 1 s | `driftScore` = `maneuvers.score` ao fim | `driftScore > 0` (o teste existente continua rodando com `ARCADE_KART`, intacto) |
| `ACCELERATION` | reta a 0, `TEST_PAD`, `driverMassKg` 75, acelerador 1 e esterço 0 mantidos | `zeroToSixtyKmhMs` = `toMs` do primeiro passo com `speedMps >= 60 / 3.6` | `<= 2500` |
| `TOP_SPEED` | idem, até a velocidade deixar de crescer (diferença entre passos < 1e-6 m/s por 120 passos, teto de 60 s simulados) | `topSpeedMps` | `>= 105 / 3.6` |
| `GRASS_LOSS` (duas execuções) | execução 1: estado de `TOP_SPEED`; execução 2: reta a `50 / 3.6` (13,89); em ambas o ambiente passa a `{surfaceAt: () => 'grass', walls: false}` por 120 passos com acelerador 1 e esterço 0 | `entrySpeedMps`, `speedAfterOneSMps` | `speedAfterOneSMps <= 0.70 × entrySpeedMps` nas duas |
| `WALL_CONTACT` | `CIRCUIT`, kart na largada com `heading` desviado de `wallApproachRad` 0,6 (parâmetro) e acelerador 1, esterço 0, por 10 s | para cada passo com `wallContact` verdadeiro e `speedMps` do passo anterior > 0: par (`speedBeforeContactMps`, `speedAfterContactMps`) com a velocidade do passo anterior e a do passo seguinte | lista não vazia e `after < before` em 100 % dos pares |
| `DETERMINISM` | cada ensaio desta tabela (salvo `STEP_COST`) e a volta do piloto de teste, executados `runCount` 2 vezes | `identical` = `deepEqual` dos estados por passo, do tempo total e dos quatro setores | `identical`; senão `FAIL` `NON_DETERMINISTIC` |
| `TEST_PILOT_LAP` | `startLap` em `TRAINING` sobre a leitura da pista sintética com o acerto corrente e `driverMass` 75; `COUNTDOWN_STEPS` passos nulos; `testPilot` até `ENDED` ou `MAX_LAP_STEPS` 6 000 | `lapTimeMs` = `lapMs`; `sectorMs`; `offAsphaltStepCount` = passos `RUNNING` com `surface` `GRASS`; `offAsphaltFirstStep`, `offAsphaltFirstXM`, `offAsphaltFirstZM` do primeiro; `baselineLapTimeMs` da linha de base | `lapValidity` `VALID`, `offAsphaltStepCount = 0` (senão `OFF_ASPHALT`) e `lapTimeMs <= 25000` (senão `THRESHOLD_EXCEEDED`) |
| `STEP_COST` (só em `bench:handling`) | nenhum estado: `meanStepCostUs` e `runtimeId` chegam em `options.stepCost`, medidos por `measureStepCost` em `scripts/keyboard-lap.ts` (a volta de `TEST_PILOT_LAP` com `performance.now()` de `node:perf_hooks` lido antes e depois de cada `stepLap`); a biblioteca não lê relógio | `meanStepCostUs` recebido; `baselineMeanStepCostUs` da entrada com o mesmo `runtimeId` | `meanStepCostUs <= 1.10 × baselineMeanStepCostUs`; sem entrada para este `runtimeId`: `BASELINE_MISSING` |
| `SETUP_VERSION` | leitura de `PUBLISHED_SETUPS` e dos fixtures de `tests/fixtures/records.ts` (replay e resultado sem `setupVersion`; replay e resultado com a versão nova) | `declaredSetupVersion`, `previousSetupVersion`; `oldRecordsReadCount`, `oldRecordsReadOkCount` (leituras `READABLE` com `RESOLVED_FROM_ABSENCE` e `compareLapRecords` sem `INCOMPLETE_RECORD`) | diferentes; contagens iguais |
| `STEP_CONTRACT` | leitura de `STEP`, `SOLVER_SUBSTEPS` e do texto de `src/physics.ts` | `stepUnchanged` = `1 / STEP === 120`; `solverRateUnchanged` = `120 × SOLVER_SUBSTEPS === 480` e a linha de `step` usa `SOLVER_SUBSTEPS`; `inputFieldsUnchanged` = a linha `export type Input` é literalmente a de hoje (`src/physics.ts:8`) | os três verdadeiros; senão `CONTRACT_CHANGED` |
| `REALISTA_UNCHANGED` | todos os ensaios acima com `setupId` `REALISTA_ALUGUEL_4T` (`RENTAL_KART`), comparados campo a campo com a entrada do Realista na linha de base; `arcadeAssistActiveCount` = passos com `assistActive` verdadeiro somados em todos eles | `differingMeasureCount` (campos numéricos e booleanos diferentes, excluídos `measuredAtUtc` e `meanStepCostUs`); `arcadeAssistActiveCount` | 0 e 0; sem entrada do Realista: `BASELINE_MISSING`; medida diferente: `CONTRACT_CHANGED` |

Os ensaios de US-0001 a US-0004 (`STEER_RESPONSE` a `WALL_CONTACT`) rodam com `inputMode` `BINARY` e
`PROPORTIONAL` e precisam de `PASS` nos dois (REQ-FEAT-0006-05). O conjunto de `race-lap-validation` roda na
mesma execução de `npm test` (`tests/*.test.ts`) e continua aprovado porque `src/lap.ts`, `src/track.ts`,
`src/trackData.ts`, `ARCADE_KART` e `RENTAL_KART` não mudam (REQ-FEAT-0006-07).

Serialização: `serialize` imprime, por programa de bench, uma linha `# {"parameters": {...}}` com
`settleWindowMs`, `holdMs`, `throttleInputNorm`, `entryArcM`, `cornerWindowMs`, `entrySpeedStepMps`,
`entrySpeedMaxMps`, `forcingSpeedMps`, `forcingWindowMs`, `wallApproachRad`, `maxSpeedMps`,
`lateralBudgetMps2`, `driverMassKg` e, em `bench:handling`, `runtimeId` (calculado pelo programa de bench e
passado em `parameters`), e depois uma linha JSON por registro; cada velocidade em
m/s e o `zeroToSixtyKmhMs` são apresentados também convertidos (`× 3.6` km/h, `÷ 1000` s) numa linha de
apresentação `#` separada, nunca como campo do registro (API-0003). Em `npm test`, cada teste imprime o
registro por `t.diagnostic`.

## Colaboradores

Chama `step`, `initialState`, `getHandlingTelemetry`, `PUBLISHED_SETUPS`, `TEST_PAD`, `CIRCUIT`, `STEP`,
`SOLVER_SUBSTEPS` (`src/physics.ts`); `startLap`, `stepLap`, `getLapState`, `getLapResult` (`src/lap.ts`);
`toMs`, `COUNTDOWN_STEPS` (`src/lapTiming.ts`); `track`, `nearest`, `WIDTH`, `SYNTHETIC_TRACK_FILE`
(`src/track.ts`); `readTrackData` (`src/trackData.ts`); `readReplay`, `compareLapRecords`, `replayLap`,
`buildLapRecord` (`src/setupRecords.ts`); `node:fs` (ler `docs/physics.md`). A biblioteca **não** importa
`node:os` nem `node:perf_hooks`: `runtimeId()` e `measureStepCost` vivem em `scripts/keyboard-lap.ts`, que
entrega os valores em `BenchOptions.stepCost`. É chamada por `scripts/keyboard-lap.ts`,
`scripts/physics-bench.ts` e `tests/dirigibilidade-*.test.ts`. Nunca por `src/`.

## Estado e concorrência

Sem estado entre ensaios: cada `runBench` constrói o seu estado inicial. Um ensaio é função pura do acerto,
do estado inicial e da sequência de `Input` (RULE-0002); repetir produz registros idênticos exceto
`measuredAtUtc` (do chamador) e `meanStepCostUs`. Não há chave: nada é escrito. O registro em
`docs/physics.md` é feito pelo desenvolvedor na etapa de código, com a data, para a linha de base
(`version: 'previous'`, Realista) e para o acerto novo, antes e depois da mudança de parâmetros
(REQ-FEAT-0006-08). Cada rodada de presets do ciclo em staging (`DOMAIN/DEC-10`, FLOW-0002) repete todos os
ensaios desta tabela contra os mesmos limiares, como nova `setupVersion`
([ADR-0001](../adr/ADR-0001-versao-do-acerto-como-registro-novo-no-codigo.md)), e acrescenta a sua entrada
datada; nenhum ensaio, limiar ou preset experimental é acrescentado por rodada.

## Comportamento em falha

| Situação | Resultado |
|---|---|
| `docs/physics.md` ausente ou sem bloco | `readBaseline` devolve `undefined`; `baselineAvailable` falso; `UNDERSTEER_ONSET`, `STEP_COST` e `REALISTA_UNCHANGED` dão `FAIL` `BASELINE_MISSING`; os demais ensaios não dependem dela |
| bloco JSON corrompido | idem (`JSON.parse` em `try`); o arquivo não é alterado |
| piloto de teste não termina em `MAX_LAP_STEPS` | `TEST_PILOT_LAP` `FAIL` `THRESHOLD_EXCEEDED` com `lapTimeMs` = `toMs(6000)` |
| precondição de `REAR_RECOVERY` não atingida | `FAIL` `THRESHOLD_EXCEEDED`, `recoveryMs` = `forcingWindowMs` |
| `WALL_CONTACT` sem contato | `FAIL` `THRESHOLD_EXCEEDED`, `contacts` vazia |
| execuções diferentes | `DETERMINISM` `FAIL` `NON_DETERMINISTIC`; nunca tolerância |

Sem rede, sem tempo-limite. Registro em log: só a saída serializada (identificadores, campos de API-0003 e
`runtimeId`); nunca caminho de arquivo, nome de máquina ou de usuário.

## Observabilidade

Cada limiar tem o seu campo e cada falha o seu `failReason`; `docs/physics.md` guarda a série datada que
mostra uma regressão entre entregas (NFR-0004). `STEP_COST` é a métrica de NFR-0002; `DETERMINISM` a de
NFR-0001; `REALISTA_UNCHANGED` a de NFR-0007; o conjunto de `race-lap-validation` verde a de NFR-0008.

## Determinismo (D-DS-07)

A biblioteca avança a simulação só com `STEP` e nunca lê relógio: não importa `node:perf_hooks` nem
`node:os` e não contém `Date` nem `performance`; `measuredAtUtc` e `stepCost` vêm do chamador, e só
`scripts/keyboard-lap.ts` (camada Aplicação) lê `performance.now()`, em `measureStepCost`, cujo valor nunca
entra em medida de domínio (I9). Provas: `DETERMINISM` em `tests/dirigibilidade-test-pilot.test.ts`;
`tests/dirigibilidade-contract.test.ts` afirma a ausência desses símbolos em `scripts/handlingBench.ts`.

## Feature flag

Nenhuma: não é comportamento de usuário. `version: 'previous'` e `setup` são argumentos dos programas de
bench para produzir a linha de base, reportados na saída, não configuração do jogo nem gancho de teste.

## Pontos em aberto

Nenhum.
