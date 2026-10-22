---
id: DES-0004
title: Ensaios de dirigibilidade, ambientes, linha de base e saída (API-0003)
feature: dirigibilidade
stage: dspec
status: validated
version: 4.0.0
sources: [API-0003, RULE-0001, RULE-0002, FLOW-0002, FEAT-0001, FEAT-0002, FEAT-0003, FEAT-0004, FEAT-0005, FEAT-0006, REQ-FEAT-0001-05, REQ-FEAT-0001-06, REQ-FEAT-0001-09, REQ-FEAT-0002-04, REQ-FEAT-0002-05, REQ-FEAT-0002-06, REQ-FEAT-0002-07, REQ-FEAT-0002-09, REQ-FEAT-0002-10, REQ-FEAT-0003-07, REQ-FEAT-0003-08, REQ-FEAT-0003-12, REQ-FEAT-0004-07, REQ-FEAT-0005-01, REQ-FEAT-0005-02, REQ-FEAT-0005-03, REQ-FEAT-0005-04, REQ-FEAT-0005-07, REQ-FEAT-0005-11, REQ-FEAT-0005-12, REQ-FEAT-0006-02, REQ-FEAT-0006-04, REQ-FEAT-0006-05, REQ-FEAT-0006-06, REQ-FEAT-0006-07, REQ-FEAT-0006-08, REQ-FEAT-0006-09, NFR-0001, NFR-0002, NFR-0003, NFR-0004, NFR-0007, NFR-0008]
---

# DES-0004 — Ensaios de dirigibilidade, ambientes, linha de base e saída (API-0003)

## Realiza

O contrato API-0003 campo a campo e a tabela de ensaios e ambientes de RULE-0002: um registro por `benchId`
e variante, com `benchEnvironment`, na saída de `npm test`, `npm run bench:handling` e do bench de física
(`npm run bench:physics`) (AC-US-0001-06, AC-US-0002-05, AC-US-0003-06, -07, AC-US-0004-07, AC-US-0005-01 a
-04, -06); veredito do `STEER_RESPONSE` só pelos tempos, com a velocidade mantida, inclusive com o kart
fora da faixa da reta (AC-US-0001-05; REQ-FEAT-0001-09: `SPEED_NOT_HELD`); `BASELINE_MISSING` sem linha de
base do mesmo ensaio, ambiente e geometria (REQ-FEAT-0002-07, REQ-FEAT-0006-09); `OFF_ASPHALT` com passo e
posição no arco e no piloto de teste (REQ-FEAT-0002-09, REQ-FEAT-0005-11); varredura de `UNDERSTEER_ONSET`
em patamares de velocidade mantida, encerrada pela primeira saída da faixa e decidida pela velocidade do
kart nesse passo, com `MEASUREMENT_MISSING` por falta de medida (REQ-FEAT-0002-05, REQ-FEAT-0002-10;
AC-US-0002-04, AC-US-0002-06); recuperação sem `grip` reportada e os passos excedentes
contados como condução normal (REQ-FEAT-0003-12); `NON_DETERMINISTIC` como defeito (REQ-FEAT-0005-12;
NFR-0001); paridade `BINARY`/`PROPORTIONAL` (NFR-0003); custo por passo (NFR-0002); Realista idêntico
(NFR-0007); contrato de passo (REQ-FEAT-0005-07); `race-lap-validation` aprovado na mesma execução
(NFR-0008); registro em `docs/physics.md` com ambiente e parâmetros (NFR-0004). Decisões:
[ADR-0003](../adr/ADR-0003-linha-de-base-legivel-por-maquina-em-docs-physics.md),
[ADR-0004](../adr/ADR-0004-ensaios-como-biblioteca-e-parametros-de-ensaio.md),
[ADR-0005](../adr/ADR-0005-pista-de-teste-como-ambiente-da-simulacao-e-velocidade-mantida.md).

## Posicionamento

Dois lugares, com camadas distintas; lugar na árvore: `scripts/`, onde as diretrizes põem os benches, e
`tests/` para as verificações.

- `scripts/handlingBench.ts`, **existente** (escrito pela rodada de código 1 contra a versão 2.0.1 deste
  item; 689 linhas) e **alterado** nesta rodada, camada **Simulação** (os ensaios só avançam a simulação
  com `STEP`): biblioteca pura dos ensaios (sem DOM, sem `three`, sem `node:perf_hooks`, sem `node:os`,
  sem `Date`, sem `performance`), importada por `npm test` e pelos dois benches. Motivo de ser módulo
  próprio: `scripts/keyboard-lap.ts` é um programa que imprime ao carregar, não uma biblioteca; e os
  ensaios não são código do jogo, logo não ficam em `src/`. Todo valor de parede (`measuredAtUtc`,
  `meanStepCostUs`, `runtimeId`) entra por argumento. `node:fs` é usado só para ler `docs/physics.md`
  (`loadBaselineText`, `:659-661`) e o texto de `src/physics.ts` (`STEP_CONTRACT`, `:476`). O que muda em
  relação ao as-built está marcado **(muda)** abaixo; o restante é mantido.
- `scripts/keyboard-lap.ts` (`bench:handling`), **alterado** (hoje é o programa anterior à feature,
  `:1-47`), camada **Aplicação** (programa de bench em Node, que só altera a simulação por
  `startLap`/`stepLap`): passa a chamar a biblioteca e a imprimir os registros `STEER_RESPONSE`,
  `REFERENCE_CORNER`, `UNDERSTEER_ONSET`, `NORMAL_DRIVING`, `REAR_RECOVERY`, `TEST_PILOT_LAP`,
  `DETERMINISM`, `STEP_COST`, `SETUP_VERSION`, `STEP_CONTRACT` e `REALISTA_UNCHANGED`; é o único módulo
  desta feature que importa `node:perf_hooks` (mede `meanStepCostUs`, executando ele mesmo a volta
  cronometrada com `testPilot` da biblioteca e `stepLap`) e `node:os` (`runtimeId()`), e que lê
  `new Date()` (`measuredAtUtc`); a função `keyboardLap` (`:5-41`) e o uso de `LapTracker` saem deste
  programa (a linha 3 de `src/physics.ts` e o teste `tests/physics.test.ts:35` ficam).
- `scripts/physics-bench.ts` (`bench:physics`), **alterado**, camada **Aplicação**: mantém as linhas que já
  imprime (`:10-37`) e acrescenta `ACCELERATION`, `TOP_SPEED`, `GRASS_LOSS` e `WALL_CONTACT`; lê `new Date()`
  para `measuredAtUtc`; não mede custo por passo nem calcula `runtimeId` (nenhum dos seus registros usa um
  nem outro), logo não importa `node:perf_hooks` nem `node:os`.
- `tests/dirigibilidade-*.test.ts`, **novos**: chamam a biblioteca e afirmam o veredito de cada registro
  ([test-strategy](../test-strategy.md)). `tests/fixtures/records.ts`, **novo**: os registros antigos e
  novos, passados à biblioteca por `BenchOptions.oldRecords`.
- `docs/physics.md`, **alterado** pela etapa de código: entrada datada por `setupVersion` com ambiente,
  parâmetros e campos, e o bloco `handling-baseline` ([DM-0001](../data/DM-0001-dado-publicado-registros-e-linha-de-base.md), seção 5).

## Interface

`scripts/handlingBench.ts`:

| Símbolo | Assinatura | Descrição |
|---|---|---|
| `BenchRecord` | união discriminada por `benchId` (`:54-78`) **(muda)** | exatamente os campos de API-0003 por `benchId`, com os tipos e unidades de lá, e nenhum outro: `BenchCommon` ganha `benchEnvironment: 'TEST_PAD' \| 'SYNTHETIC_TRACK'`; `STEER_RESPONSE` ganha `targetSpeedMps`, `speedHoldMode`, `speedHoldBandMps`, `speedMinMps`, `speedMaxMps`, e `throttleInputNorm` passa a opcional (presente só em `THROTTLE_CONSTANT`); `REFERENCE_CORNER` ganha `arcRadiusM`, `laneWidthM`, `offAsphaltFirstStep?`, `offAsphaltFirstXM?`, `offAsphaltFirstZM?` e perde `oversteerOrSlidingStepCount` (não é campo do contrato; vai para a linha de apresentação); `UNDERSTEER_ONSET` ganha `arcRadiusM`, `laneWidthM`, `offAsphaltStepCount` (0 ou 1), `offAsphaltFirstStep?`, `offAsphaltFirstXM?`, `offAsphaltFirstZM?`, `v1Mps` passa a opcional (presente só com V1 medida) e `maxUndersteerMsBySpeed` passa a lista de pares `[plateauSpeedMps, maxUndersteerMs]` (m/s, ms) dos patamares completos acima de 50 km/h; `NORMAL_DRIVING` ganha `normalDrivingStepCount`, `excludedRecoveryStepCount`; `REAR_RECOVERY` ganha `arcRadiusM`, `laneWidthM`, `gripReached`, `offAsphaltStepCount` (0 ou 1), `offAsphaltFirstStep?`, `offAsphaltFirstXM?`, `offAsphaltFirstZM?`, e `recoveryMs` passa a opcional; `DRIFT_MANEUVER`: `driftScore` passa a `driftScorePoints` (mesmo valor, unidade pontos; o nome anterior não é emitido); `TEST_PILOT_LAP` perde `lapValidity` (não é campo do contrato; uma volta sem tempo reporta `lapTimeMs` = `toMs(MAX_LAP_STEPS)`) e `sectorMs` tem sempre 4 elementos; `FailReason` (`:47`) ganha `SPEED_NOT_HELD` e `MEASUREMENT_MISSING` |
| `BenchOptions` | `{setup: PublishedSetup, version: 'current' \| 'previous', inputMode: 'BINARY' \| 'PROPORTIONAL', baseline?: Baseline, realistaBaseline?: Baseline, oldRecords?: readonly unknown[], measuredAtUtc: string, stepCost?: {meanStepCostUs: number, runtimeId: string}}` (`:81-88`, mantido) | `version: 'previous'` usa `previousConfig` (só para produzir a linha de base); `baseline` é a entrada da versão anterior do acerto ensaiado (`UNDERSTEER_ONSET`, `STEP_COST`, `TEST_PILOT_LAP`); `realistaBaseline` é a entrada do Realista (`REALISTA_ALUGUEL_4T`, `realista-aluguel-4t-v4`), lida pelo programa de bench ou pelo teste com `readBaseline` e usada só por `REALISTA_UNCHANGED`; `oldRecords` são os registros antigos que `SETUP_VERSION` lê — os fixtures de `tests/fixtures/records.ts` em `npm test`, e `builtInOldRecords()` quando ausente (a biblioteca não importa de `tests/`); `measuredAtUtc` vem do chamador (bench: `new Date().toISOString()`; teste: constante), nunca da biblioteca; `stepCost` é a medida de parede já feita pelo programa de bench (µs por passo, média) com o `runtimeId` da máquina, nunca lida pela biblioteca |
| `BENCH_PARAMETERS` | objeto congelado (`:19-25`) **(muda)** | os parâmetros de ensaio de [ADR-0004](../adr/ADR-0004-ensaios-como-biblioteca-e-parametros-de-ensaio.md), reportados na linha `#` e em `docs/physics.md`: `targetSpeedMps` 13,89 (`50 / 3.6`), `speedHoldMode` `THROTTLE_REGULATED`, `speedHoldBandMps` 0,5, `holdMs` 600, `settleWindowMs` 200, `steerInputNormPartial` 0,5, `laneWidthM` = `WIDTH` (11), `arcRadiusM` 18, `cornerWindowMs` 2 500 (curva de referência), `entrySpeedStepMps` 0,5 (tamanho do patamar de `UNDERSTEER_ONSET`), `plateauMs` 1 000 (duração da fase mantida de cada patamar, 120 passos), `plateauSpeedHoldMode` `THROTTLE_REGULATED` (modo de manter a velocidade do patamar), `entrySpeedMaxMps` 25 (velocidade-alvo máxima de patamar: teto de segurança; a varredura termina antes, no primeiro passo fora da faixa), `forcingSpeedMps` 16,7, `forcingWindowMs` 3 000, `grassEntryIndex` 83, `grassEntryOffsetM` 0,2, `grassEntryAngleRad` 0,15, `grassWindowMs` 1 000, `wallApproachRad` 0,6, `wallWindowMs` 10 000, `topSpeedWindowMs` 60 000, `maxSpeedMps` 26 e `lateralBudgetMps2` 9,5 (piloto de teste), `driverMassKg` 75, `runCount` 2. Todos fixos: um parâmetro de ensaio só muda por mudança deste projeto, nunca para fazer um ensaio passar (ADR-0004, decisão 2) |
| `THRESHOLDS` | objeto congelado (`:30-34`, mantido) | os limiares de RULE-0002 na unidade do campo: 180, 250, 200, 400 ms; 0,65 rad; 2 500 ms; `105 / 3.6` m/s; 0,70; 25 000 ms; 1,15; 1,10 |
| `runBench(benchId, options)` | `(BenchId, BenchOptions) => BenchRecord[]` (`:596-618`) | um registro por variante do ensaio; `runBench('STEP_COST', options)` exige `options.stepCost` e só compara o valor recebido com a linha de base (não cronometra nada); lança `Error` (mensagem só com o `benchId` e o caso) nos dois resultados de `UNDERSTEER_ONSET` que RULE-0002 não decide (tabela abaixo), e quando a leitura da pista sintética não é `COMPLETE` |
| `handlingBenchReport(options, benchIds?)` | `(BenchOptions, BenchId[]?) => BenchRecord[]` (`:622-635`) | todos os ensaios, ou os pedidos; `STEP_COST` entra só quando `options.stepCost` está presente; zero ensaios dá lista vazia, nunca `PASS` implícito |
| `judge(record, observed?)` | `<T extends BenchRecord>(T, ('OFF_ASPHALT' \| 'THRESHOLD_EXCEEDED')?) => T` (`:528-592`) **(muda: segundo argumento)** | fonte única do veredito: recalcula `verdict` e `failReason` dos campos medidos do registro e de `observed`, o que o ensaio viu no seu traço e que nenhum campo de API-0003 carrega — grama não mantida ou parede em `GRASS_LOSS` (`THRESHOLD_EXCEEDED`); saída da faixa com a velocidade do kart abaixo de `50 / 3.6` no passo da saída em `UNDERSTEER_ONSET` (`OFF_ASPHALT`); a posição de `observed` na ordem de cada ensaio é a da tabela de vereditos abaixo. As saídas da faixa de `REFERENCE_CORNER`, `REAR_RECOVERY` e `TEST_PILOT_LAP` são julgadas pelos campos; a de `STEER_RESPONSE` não altera o veredito, e `observed` é ignorado nesse ensaio. Sem `observed`, o veredito vem só dos campos, de modo que um teste julga um registro sintético como o bench. Um registro `UNDERSTEER_ONSET` com `offAsphaltStepCount` 0 (varredura sem saída da faixa, resultado que RULE-0002 não decide) faz `judge` lançar, como o ensaio (ADR-0004, decisão 8) |
| `readBaseline(markdownText, setupId, setupVersion, runtimeId?)` | `(string, SetupId, string, string?) => Baseline \| undefined` (`:645-656`) | localiza o bloco `handling-baseline` em `docs/physics.md` e a entrada pedida; `runtimeId` vem do chamador; a entrada traz `records` e `parameters` |
| `baselineRecord(baseline, benchId, match)` | `(Baseline?, BenchId, (BenchRecord) => boolean) => BenchRecord \| undefined` (`:259-261`) **(muda)** | localiza na entrada o registro do mesmo ensaio **e** do mesmo `benchEnvironment`, com `arcRadiusM` e `laneWidthM` iguais quando o registro os tem (`\|Δ\| < 1e-9`), mesmo `inputMode` e mesma variante; para `UNDERSTEER_ONSET`, além disso, o mesmo `entrySpeedStepMps` no registro e os mesmos `plateauMs` e `plateauSpeedHoldMode` nos `parameters` da entrada (uma entrada medida por velocidades de entrada, ou sem esses parâmetros, não é o mesmo ensaio: API-0003, Compatibilidade), e só um registro com `v1Mps` presente (V1 medida na varredura da linha de base), qualquer que seja o `verdict` ou o `failReason` com que a execução da linha de base o julgou — RULE-0002 aplica o fim da varredura só ao novo acerto, e a linha de base só fornece V0 ([ADR-0003](../adr/ADR-0003-linha-de-base-legivel-por-maquina-em-docs-physics.md), decisão 2); sem igual, `baselineAvailable` falso (RULE-0002, Linha de base) |
| `loadBaselineText()` | `() => string` (`:659-661`) | lê `docs/physics.md` relativo à raiz do repositório; `''` quando ausente; o caminho nunca é impresso |
| `baselineEntry(records, setupId, setupVersion, measuredAtUtc, runtimeId?, parameters?)` | `(BenchRecord[], SetupId, string, string, string?, object?) => Baseline` (`:663-665`) **(muda)** | constrói a entrada do bloco a partir dos registros de uma execução, com os parâmetros |
| `serialize(records, parameters)` | `(readonly BenchRecord[], object) => string` (`:681-689`) | uma linha `#` JSON com os parâmetros de ensaio e, por registro, uma linha JSON com os campos de API-0003 e uma linha `#` de apresentação (km/h, s, contagens diagnósticas) |
| `testPadLane`, `testPadArc` | importados de `src/physics.ts` ([DES-0001](DES-0001-acerto-arcade-assistido-v5-e-assistencias.md)) | `laneEnvironment = testPadLane(BENCH_PARAMETERS.laneWidthM)`; `arcEnvironment = testPadArc(BENCH_PARAMETERS.arcRadiusM, BENCH_PARAMETERS.laneWidthM)` |
| `straight(speedMps)` | `(number /* m/s */) => State` (`:116-118`) | "reta a V": `{...initialState(), x: 0, z: 0, heading: 0, vx: 0, vz: V, speed: V}` (o fixture de `tests/physics.test.ts:5`), no eixo da faixa de `testPadLane` |
| `arcEntry(speedMps)` | `(number /* m/s */) => State` **(novo; substitui `referenceCorner` e `cornerEntry`, `:139-172`)** | entrada do arco: `{...initialState(), x: arcRadiusM, z: 0, heading: 0, vx: 0, vz: V, speed: V}`, tangente ao anel, centro à direita; o esterço para dentro é `+1` (DES-0001, Pista de teste); estado inicial de `REFERENCE_CORNER`, de `UNDERSTEER_ONSET` (no alvo do primeiro patamar) e de `REAR_RECOVERY` |
| `grassEntry(speedMps)` | `(number /* m/s */) => State` **(novo; substitui `grassEnvironment`, `:334`)** | entrada na grama da pista sintética: com `p = track[grassEntryIndex]`, `q = track[grassEntryIndex + 1]`, `h = atan2(q.x − p.x, q.z − p.z)` (sentido dos índices crescentes) e `n = (cos h, −sin h)` (esquerda do corpo, `src/physics.ts:119`), o lado de fora é o de `n` quando `n · p > 0` (a pista envolve a origem; no índice 83 é a esquerda) e o de `−n` caso contrário; o kart fica em `p ± n × (WIDTH / 2 + grassEntryOffsetM)` (5,7 m do eixo, já `grass` por `CIRCUIT.surfaceAt`), com `heading` `h` girado `grassEntryAngleRad` para fora (`+` à esquerda, guinada positiva vira à esquerda) e velocidade V. O índice 83 abre o trecho mais reto da pista (raio discreto acima de 190 m dos índices 81 a 102, cerca de 35 m) |
| `wallApproach()` | `() => State` (`:345-348`) | largada da pista sintética com `heading` desviado de `wallApproachRad` |
| `testPilot(config)` | `(KartConfig) => Controller` (`:178-207`) | o piloto de teste — a régua de regressão, a mesma para a linha de base e para o acerto novo: comandos binários decididos a cada `PILOT_DECISION_STEPS` 12 passos (10 Hz) por antecipação sobre `track`, derivado de `scripts/keyboard-lap.ts:12-28`, com `maxSpeedMps` 26 e `lateralBudgetMps2` 9,5 como parâmetros de ensaio fixos; não lê o `config` que recebe; exportado pela biblioteca e importado por `TEST_PILOT_LAP`, `DETERMINISM`, `npm test` e por `measureStepCost` em `scripts/keyboard-lap.ts` |
| `testPilotLapWith(options, controller)` | `(BenchOptions, Controller) => TestPilotLapRecord` (`:638-640`) | a volta do piloto de teste com outro controlador (o piloto deslocado dos testes) |
| `makeInput(mode, throttle, brake, steer, drift?)` | `(InputMode, number, number, number, boolean?) => Input` (`:107-113`) | `BINARY` é o teclado (`0`/`1`, `−1`/`0`/`1`); `PROPORTIONAL` é o adaptador de inclinação (número contínuo saturado) |
| `builtInOldRecords()` | `() => unknown[]` (`:446-451`) | dois registros mínimos na forma anterior à feature (um replay e um resultado, sem `setupId`, `setupVersion` nem `replayFormatVersion`), usados por `SETUP_VERSION` quando `options.oldRecords` está ausente |
| `countDifferingMeasures(current, baseline)` | `(BenchRecord[], BenchRecord[]) => number` (`:492-504`) **(muda)** | campos numéricos, booleanos e listas que diferem entre cada registro e o seu par na linha de base (mesmo `benchId`, `benchEnvironment`, `inputMode` e variante), excluídos `measuredAtUtc` e `meanStepCostUs`; par ausente conta 1 |

`scripts/keyboard-lap.ts` (programa de bench, camada Aplicação; importa `testPilot` e as demais funções da
biblioteca, nunca o contrário — o programa não é importável):

| Símbolo | Assinatura | Descrição |
|---|---|---|
| `runtimeId()` | `() => string` | `${platform}-${arch}-node${versions.node}-${modelo da CPU}` com `node:os` (ADR-0003); nunca nome de máquina ou de usuário; local ao programa, não exportado |
| `measureStepCost(setup)` | `(PublishedSetup) => {meanStepCostUs: number}` | executa a volta de `TEST_PILOT_LAP` (`startLap`, `COUNTDOWN_STEPS` passos nulos, `testPilot` importado de `scripts/handlingBench.ts`, `stepLap`) com `performance.now()` de `node:perf_hooks` lido antes e depois de cada `stepLap`; local ao programa, não exportado; o tempo medido nunca entra em medida de domínio (I9) |
| argumentos de linha de comando | `--previous`, `--realista` | `--previous` roda com `version: 'previous'` (linha de base do Arcade, `arcade-assistido-v4`); `--realista` roda com `setup` `REALISTA_ALUGUEL_4T`; sem argumento, o Arcade corrente. O programa roda `BINARY` e `PROPORTIONAL` e imprime `serialize(records, {...BENCH_PARAMETERS, runtimeId})`. Sem argumento, lê `baseline` e `realistaBaseline` com `readBaseline(loadBaselineText(), …)`; com `--previous` ou `--realista` (execuções que **produzem** linha de base) não passa `baseline` nem `realistaBaseline`: uma linha de base nunca é julgada contra outra, e os seus registros saem com `BASELINE_MISSING` onde a linha de base é exigida |

Toda medida vem de `getHandlingTelemetry` ([DES-0002](DES-0002-telemetria-de-dirigibilidade.md)) ou de
`getLapResult`/`getLapState` (`src/lap.ts`); todo tempo em ms é `toMs(passos)` de `src/lapTiming.ts`
(inteiro exato); toda comparação com limiar converte o limiar para a unidade do campo sem arredondar o
medido (RULE-0002). Os limiares são os do acerto agressivo (`DOMAIN/REF-02`, inalterados na revisão 3),
comparados em ms sobre `toMs` (`Math.floor((25 × passos + 1) / 3)`): 180 ms não é múltiplo de um passo —
`toMs(21)` = 175 é `PASS` e `toMs(22)` = 183 é `FAIL`, sem arredondar o limiar para 22 passos; 250 ms = 30
passos, 200 ms = 24, 400 ms = 48 (`RECOVERY_MAX_STEPS`), 2 500 ms = 300, 25 000 ms = 3 000. Velocidades:
60 km/h = `60 / 3.6`, 105 km/h = `105 / 3.6`, 50 km/h = `50 / 3.6` (13,888… m/s), a mesma expressão da
condição de forçar em `src/physics.ts:114`.

### Ambientes e `benchEnvironment`

| Ambiente | Construção | `benchEnvironment` | Ensaios |
|---|---|---|---|
| Pista de teste, reta | `testPadLane(WIDTH)` (DES-0001): faixa de 11 m ao longo de z, sem paredes | `TEST_PAD` | `STEER_RESPONSE`, `ACCELERATION`, `TOP_SPEED` |
| Pista de teste, arco | `testPadArc(18, WIDTH)`: anel de raio 18 m e largura 11 m, sem paredes | `TEST_PAD` | `REFERENCE_CORNER`, `UNDERSTEER_ONSET`, `REAR_RECOVERY` |
| Asfalto sem limite | constante `TEST_PAD` de `src/physics.ts:163`: o ambiente da verificação existente de `tests/maneuvers.test.ts:63-67` | `TEST_PAD` | `DRIFT_MANEUVER` |
| Pista sintética | `CIRCUIT` (`src/physics.ts:162`) com `readTrackData(SYNTHETIC_TRACK_FILE)` para a volta | `SYNTHETIC_TRACK` | `GRASS_LOSS`, `WALL_CONTACT`, `TEST_PILOT_LAP`, `STEP_COST` |
| Agregados | um registro **por ambiente**: `NORMAL_DRIVING`, `DETERMINISM` e `REALISTA_UNCHANGED` são emitidos duas vezes, um com `TEST_PAD` (sobre os ensaios da pista de teste) e um com `SYNTHETIC_TRACK` (sobre os da pista sintética); os dois precisam de `PASS` | ambos | — |
| Sem passo de simulação | `SETUP_VERSION` e `STEP_CONTRACT` não avançam a simulação; reportam `TEST_PAD` por convenção (o ambiente neutro, sem dado de pista), para que o campo obrigatório de API-0003 tenha um valor fixo e documentado | `TEST_PAD` | — |

O ambiente dos ensaios `ACCELERATION` e `TOP_SPEED` não é fixado pelos requisitos (lacuna deliberada do
F-Spec): a reta da pista de teste é escolhida porque não tem fim em z e nenhuma parede, e é reportada.

### Definição de cada ensaio (estado inicial, `Input`, medição, veredito)

Acelerador, freio e esterço começam em 0 salvo indicação. `inputMode` `PROPORTIONAL` entrega os mesmos
valores de esterço cheio (1 ou −1) e acelerador que `BINARY`, por um `Input` construído como o adaptador de
inclinação constrói (número contínuo saturado), e acrescenta a variante parcial onde a tabela a nomeia. O
acelerador regulado de `STEER_RESPONSE` e de `UNDERSTEER_ONSET` só assume 0 ou 1 nos dois modos. Cada ensaio guarda a sua
sequência de `Input` e de telemetria (o *traço*), que alimenta `NORMAL_DRIVING` e `DETERMINISM`. A
coluna "`PASS` se" é a ordem em que `judge` decide: o primeiro motivo encontrado é o `failReason`; uma
condição marcada `observed` é a que o ensaio entrega a `judge` no segundo argumento.

| `benchId` | Ambiente, estado inicial e `Input` por passo | Medição | `PASS` se |
|---|---|---|---|
| `STEER_RESPONSE` (variantes: lado +1 e −1; `PROPORTIONAL` acrescenta `steerInputNorm` ±0,5) **(muda)** | `testPadLane(WIDTH)`, `straight(50 / 3.6)`, `handling` `grip`, acerto corrente com `driverMass` 75. **Fase A** (`holdMs` 600 = 72 passos): esterço no valor da variante; acelerador do passo `k` = 1 se `speedMps` do passo `k−1` (ou do estado inicial em `k` = 0) < `targetSpeedMps`, senão 0 (`speedHoldMode` `THROTTLE_REGULATED`; binário por construção; nunca satisfaz a condição de forçar, que exige acelerador 1 **com** velocidade acima de 50 km/h). **Fase B** (até 72 passos): esterço 0 num passo, mesma regulação; termina no primeiro passo com `\|yawRateRadPerS\| <= 0.1 × steady` | `steadyYawRateRadPerS` = média de `\|yawRateRadPerS\|` nos últimos `settleWindowMs` 200 (24 passos: 49 a 72) da fase A — janela curta e estacionária porque a velocidade é mantida; `riseToNinetyPctMs` = `toMs` do primeiro passo da fase A com `\|yawRateRadPerS\| >= 0.9 × steady` (nenhum: `toMs(72)`); `fallToTenPctMs` = `toMs` dos passos da fase B até o primeiro com `\|yawRateRadPerS\| <= 0.1 × steady` (nenhum: `toMs(72)`); `speedMinMps`/`speedMaxMps` = mínimo e máximo de `speedMps` na fase A (esterço aplicado); `understeerStepCount` = passos em `understeer` nas duas fases; `targetSpeedMps`, `speedHoldMode`, `speedHoldBandMps`, `settleWindowMs`, `steerInputNorm` copiados dos parâmetros; `throttleInputNorm` ausente | na ordem: `speedMinMps < targetSpeedMps − speedHoldBandMps` ou `speedMaxMps > targetSpeedMps + speedHoldBandMps` → `FAIL` `SPEED_NOT_HELD` (os tempos não valem); senão `riseToNinetyPctMs <= 180` e `fallToTenPctMs <= 250`; `understeerStepCount` nunca altera o veredito, nem um passo com `surface` `GRASS` (saída da faixa da reta: não é erro nem campo do registro, API-0003; AC-US-0001-05) |
| `REFERENCE_CORNER` (variantes: `THROTTLE_ZERO`, `THROTTLE_FULL`) **(muda)** | `testPadArc(18, WIDTH)`, `arcEntry(50 / 3.6)`, `grip`; esterço `+1` (para dentro) mantido; acelerador 0 ou 1 mantido; janela `cornerWindowMs` 2 500 (300 passos, ≈ 35 m de arco a 50 km/h); a execução **para no primeiro passo** com `surface` `GRASS` (nenhum critério é medido fora do asfalto) | `maxUndersteerMs` = `toMs` da maior sequência consecutiva de `understeer`; `offAsphaltStepCount` (0 ou 1), `offAsphaltFirstStep` = `simStepCount` do passo da saída, `offAsphaltFirstXM`/`offAsphaltFirstZM` = `x`/`z` do kart nesse passo; `handling` por passo (em `THROTTLE_FULL`, a contagem de passos em `oversteer`/`sliding` vai para a linha `#` de apresentação, não é campo); `arcRadiusM` 18, `laneWidthM` 11, `entrySpeedMps` 13,89 copiados dos parâmetros | `offAsphaltStepCount > 0` → `FAIL` `OFF_ASPHALT`; senão `maxUndersteerMs <= 200` e, em `THROTTLE_FULL`, nenhum passo em `oversteer`/`sliding` (REQ-FEAT-0003-02; os passos acima de 50 km/h são `FORCING` por RULE-0001 e a exigência vale neles do mesmo modo); senão `THRESHOLD_EXCEEDED` |
| `UNDERSTEER_ONSET` **(muda: varredura em patamares de velocidade mantida)** | `testPadArc(18, WIDTH)`, `arcEntry(50 / 3.6)`, `grip`; esterço `+1` (para dentro) mantido; **uma execução contínua** no anel. O patamar `k` (k = 0, 1, 2, …) tem a velocidade-alvo `plateauSpeedMps = 50 / 3.6 + k × entrySpeedStepMps` (0,5 m/s); o acelerador do passo `n` segue `plateauSpeedHoldMode` `THROTTLE_REGULATED`: 1 se `speedMps` do passo `n−1` (ou do estado inicial) < alvo do patamar corrente, senão 0 (0 ou 1 nos dois `inputMode`; acima de 50 km/h, os passos de acelerador 1 são "Forçando" por RULE-0001). Cada patamar tem a **subida** (do fim do patamar anterior até o primeiro passo com `speedMps >= alvo`; vazia em k = 0, que parte do alvo) e a **fase mantida** de `plateauMs` 1 000 (120 passos) a partir desse passo; o patamar está **completo** ao fim da fase mantida dentro da faixa, e então o alvo passa ao patamar seguinte. A varredura termina no **primeiro passo com `surface` `GRASS`**, na subida ou na fase mantida (esse patamar é o interrompido, nunca completo) ([ADR-0004](../adr/ADR-0004-ensaios-como-biblioteca-e-parametros-de-ensaio.md), decisão 8) | por patamar completo, `maxUndersteerMs` = `toMs` da maior sequência consecutiva de `understeer` na fase mantida; `v1Mps` = menor `plateauSpeedMps` de patamar completo (k ≥ 0) com `maxUndersteerMs > 200`, **ausente** quando nenhum (V1 não medida); `maxUndersteerMsBySpeed` = pares `[plateauSpeedMps, maxUndersteerMs]` dos patamares completos com `plateauSpeedMps > 50 / 3.6` (k ≥ 1), em ordem crescente, sem o patamar interrompido; `offAsphaltStepCount` = 1 e `offAsphaltFirstStep`, `offAsphaltFirstXM`, `offAsphaltFirstZM` = `simStepCount`, `x`, `z` do passo da saída; a velocidade do kart nesse passo (`speedMps` da telemetria) decide o resultado da saída e vai para a linha `#`, não para um campo; `v0Mps` = `v1Mps` do registro `UNDERSTEER_ONSET` da linha de base aceito por `baselineRecord`; `arcRadiusM`, `laneWidthM`, `entrySpeedStepMps` copiados. **Sem registro** nos dois casos que RULE-0002 não decide: saída com `speedMps` exatamente igual a `50 / 3.6`; fim sem saída da faixa — o patamar de alvo `entrySpeedMaxMps` (o maior que não passa de 25 m/s) completo, ou uma subida que não alcança o alvo (a velocidade deixa de crescer pelo critério de `TOP_SPEED`, ou `topSpeedWindowMs` se esgota): `runBench` lança um `Error` cuja mensagem traz só o `benchId` e o caso | na ordem: saída com `speedMps < 50 / 3.6` → `FAIL` `OFF_ASPHALT` (`observed`), com ou sem V1; saída acima de 50 km/h com menos de 2 pares em `maxUndersteerMsBySpeed` → `FAIL` `MEASUREMENT_MISSING` (falta de medida, caso (a) de API-0003), com ou sem V1; sem linha de base igual → `FAIL` `BASELINE_MISSING`, sem julgar nem extrapolar; `v1Mps` ausente → `FAIL` `MEASUREMENT_MISSING` (caso (b): fim natural sem V1 medida); senão `v1Mps >= 1.15 × v0Mps` e, em `maxUndersteerMsBySpeed`, cada `maxUndersteerMs` não menor que o do par anterior (patamar a patamar, nunca um máximo acumulado), ou `THRESHOLD_EXCEEDED`. A saída acima de 50 km/h com 2 pares ou mais é o fim natural da varredura e não reprova por si (REQ-FEAT-0002-10) |
| `NORMAL_DRIVING` (um registro por ambiente) **(muda)** | classifica cada passo dos traços com `classifyHandlingSteps` (DES-0001; RULE-0001): `TEST_PAD` agrega `REFERENCE_CORNER` (as duas condições), a varredura de `UNDERSTEER_ONSET` (subidas e fases mantidas, até o passo anterior à saída) e `REAR_RECOVERY`; `SYNTHETIC_TRACK` agrega `TEST_PILOT_LAP`; entram no agregado os passos de classe `NORMAL` com `surface` `ASPHALT` | `normalDrivingStepCount` = passos agregados; `excludedRecoveryStepCount` = passos de classe `RECOVERY` no asfalto (até 400 ms após a soltura; os passos além de 400 ms sem `grip` são `NORMAL` e entram); `oversteerOrSlidingStepCount` e `maxSideslipRad` sobre os agregados; passos `FORCING` e `DRIFT` não entram em contagem alguma | `oversteerOrSlidingStepCount = 0` e `maxSideslipRad <= 0.65`; senão `THRESHOLD_EXCEEDED` |
| `REAR_RECOVERY` **(muda)** | `testPadArc(18, WIDTH)`, `arcEntry(forcingSpeedMps)` (16,7 m/s, 60 km/h: acima de 50 km/h, `forcing` verdadeiro desde o primeiro passo), `grip`. **Fase A**: acelerador 1 e esterço `+1` mantidos até o primeiro passo com `handling` `oversteer` ou `sliding` (janela `forcingWindowMs` 3 000). **Fase B** (passo de soltura inclusive): esterço 0, acelerador 1, até o primeiro passo em `grip` ou até 3 000 ms; a execução **para no primeiro passo** com `surface` `GRASS`, em qualquer fase (nada é medido fora do asfalto) | `gripReached` = houve passo em `grip` na fase B; `recoveryMs` = `toMs` dos passos da fase B até o primeiro `grip`, inclusive (presente só com `gripReached`; o passo de soltura é o passo 1); `maxSideslipRad` = máximo de `sideslipRad` nos passos da fase B até o primeiro `grip` (ou em toda a fase B sem `grip`; 0 se a fase B não ocorreu); `offAsphaltStepCount` (0 ou 1), `offAsphaltFirstStep` = `simStepCount` do passo da saída, `offAsphaltFirstXM`/`offAsphaltFirstZM` = `x`/`z` do kart nesse passo; `arcRadiusM`, `laneWidthM` copiados | `offAsphaltStepCount > 0` → `FAIL` `OFF_ASPHALT` (campo; a saída antes da soltura também, porque o passo fora da faixa falha o ensaio, RULE-0002, Ambientes); traseira não solta na fase A → `FAIL` `THRESHOLD_EXCEEDED` com `gripReached` falso (ADR-0004); `gripReached` falso → `THRESHOLD_EXCEEDED` (REQ-FEAT-0003-12); senão `recoveryMs <= 400` e `maxSideslipRad <= 0.65` |
| `DRIFT_MANEUVER` **(muda: nome do campo)** | `TEST_PAD` (constante), `straight(12)`: `{throttle: 1, steer: 0.7, drift: true}` por 240 passos, depois `{throttle: 1, steer: 0}` por 120 — o cenário de `tests/maneuvers.test.ts:68-79` com o acerto corrente (`:308-315`) | `driftScorePoints` = `maneuvers.score` ao fim | `driftScorePoints > 0` (o teste existente continua rodando com `ARCADE_KART`, intacto) |
| `ACCELERATION` **(muda: ambiente)** | `testPadLane(WIDTH)`, `straight(0)`, `driverMassKg` 75, acelerador 1 e esterço 0 mantidos (`:317-332`) | `zeroToSixtyKmhMs` = `toMs` do primeiro passo com `speedMps >= 60 / 3.6` (nenhum em `topSpeedWindowMs`: `toMs` da janela); `driverMassKg` | `<= 2500` |
| `TOP_SPEED` **(muda: ambiente)** | idem, até a velocidade deixar de crescer (diferença entre passos < 1e-6 m/s por 120 passos, teto `topSpeedWindowMs` 60 s) | `topSpeedMps` | `>= 105 / 3.6` |
| `GRASS_LOSS` (duas execuções) **(muda)** | `CIRCUIT`; execução 1: `grassEntry(topSpeedMps)` com o `topSpeedMps` medido por `TOP_SPEED` nas mesmas opções; execução 2: `grassEntry(50 / 3.6)`; acelerador 1 e esterço 0 por `grassWindowMs` 1 000 (120 passos) | `entrySpeedMps` = velocidade de entrada; `speedAfterOneSMps` = `speedMps` após os 120 passos | precondição: os 120 passos com `surface` `GRASS` e nenhum `wallContact` (senão `FAIL` `THRESHOLD_EXCEEDED` por `observed`: o ensaio não chegou ao estado que mede, ADR-0004); `speedAfterOneSMps <= 0.70 × entrySpeedMps` nas duas |
| `WALL_CONTACT` | `CIRCUIT`, `wallApproach()` com acelerador 1, esterço 0, por `wallWindowMs` 10 s (`:350-361`) | para cada passo com `wallContact` verdadeiro e `speedMps` do passo anterior > 0: par (`speedBeforeContactMps`, `speedAfterContactMps`) com a velocidade do passo anterior e a do passo seguinte | lista não vazia e `after < before` em 100 % dos pares |
| `DETERMINISM` (um registro por ambiente) **(muda)** | os ensaios do ambiente (salvo `STEP_COST`) e, em `SYNTHETIC_TRACK`, a volta do piloto de teste, executados `runCount` 2 vezes com a mesma sequência de `Input` | `identical` = `deepEqual` dos estados por passo de cada traço e, em `SYNTHETIC_TRACK`, do `LapResult` (tempo total e quatro setores) | `identical`; senão `FAIL` `NON_DETERMINISTIC` |
| `TEST_PILOT_LAP` **(muda: campos)** | `startLap` em `TRAINING` sobre a leitura da pista sintética com o acerto corrente e `driverMass` 75; `COUNTDOWN_STEPS` passos nulos; `testPilot` até `ENDED` ou `MAX_LAP_STEPS` 6 000 (`:365-394`) | `lapTimeMs` = `lapMs` do `LapResult` (volta `VALID`); volta `INVALID` ou não encerrada: `lapTimeMs` = `toMs(MAX_LAP_STEPS)` = 50 000 (a volta não produziu tempo; o valor é o teto da janela, ADR-0004); `sectorMs` = **sempre 4 inteiros** em ms: na volta `VALID`, os quatro de `LapResult.sectorMs` (somam `lapTimeMs`); na volta `INVALID` ou não encerrada, os setores concluídos (`completedSectorMs` de `getLapState`, em ordem) seguidos de `toMs(MAX_LAP_STEPS)` = 50 000 para cada setor não concluído, o mesmo teto de janela de `lapTimeMs`; `offAsphaltStepCount` = passos `RUNNING` com `surface` `GRASS`; `offAsphaltFirstStep`, `offAsphaltFirstXM`, `offAsphaltFirstZM` do primeiro; `baselineLapTimeMs` do registro `TEST_PILOT_LAP` da linha de base (`SYNTHETIC_TRACK`) | `offAsphaltStepCount = 0` (senão `OFF_ASPHALT`) e `lapTimeMs <= 25000` (senão `THRESHOLD_EXCEEDED`) |
| `STEP_COST` (só em `bench:handling`) | nenhum estado: `meanStepCostUs` e `runtimeId` chegam em `options.stepCost`, medidos por `measureStepCost` em `scripts/keyboard-lap.ts`; a biblioteca não lê relógio (`:436-443`) | `meanStepCostUs` recebido; `baselineMeanStepCostUs` do registro `STEP_COST` da entrada com o mesmo `runtimeId` | `meanStepCostUs <= 1.10 × baselineMeanStepCostUs`; sem entrada para este `runtimeId`: `BASELINE_MISSING` |
| `SETUP_VERSION` | leitura de `PUBLISHED_SETUPS` e de `options.oldRecords ?? builtInOldRecords()` (`:453-471`): cada registro com `inputs` é lido por `readReplay`; os demais por `compareLapRecords(r, r)` e `resolveSetupRef` | `declaredSetupVersion`, `previousSetupVersion`; `oldRecordsReadCount` = registros recebidos; `oldRecordsReadOkCount` = leituras `READABLE`/sem `INCOMPLETE_RECORD` com `RESOLVED_FROM_ABSENCE` | diferentes; contagens iguais; senão `THRESHOLD_EXCEEDED` |
| `STEP_CONTRACT` | leitura de `STEP`, `SOLVER_SUBSTEPS` e do texto de `src/physics.ts` (`:473-483`) | `stepUnchanged` = `1 / STEP === 120`; `solverRateUnchanged` = `120 × SOLVER_SUBSTEPS === 480` e a linha de `step` usa `Math.ceil(dt / (STEP / SOLVER_SUBSTEPS))`; `inputFieldsUnchanged` = a linha `export type Input` é literalmente a de `src/physics.ts:8` | os três verdadeiros; senão `CONTRACT_CHANGED` |
| `REALISTA_UNCHANGED` (um registro por ambiente) **(muda)** | todos os ensaios do ambiente com `setupId` `REALISTA_ALUGUEL_4T` (`RENTAL_KART`), em `BINARY` e `PROPORTIONAL` (`:506-522`), comparados registro a registro com os da entrada `options.realistaBaseline` do mesmo ambiente; `arcadeAssistActiveCount` = passos com `assistActive` verdadeiro somados nos traços do ambiente | `differingMeasureCount` (`countDifferingMeasures`); `arcadeAssistActiveCount` | sem `realistaBaseline`: `BASELINE_MISSING`; senão 0 e 0, ou `CONTRACT_CHANGED` |

Os ensaios de US-0001 a US-0004 (`STEER_RESPONSE` a `WALL_CONTACT`) rodam com `inputMode` `BINARY` e
`PROPORTIONAL` e precisam de `PASS` nos dois (REQ-FEAT-0006-05). O conjunto de `race-lap-validation` roda na
mesma execução de `npm test` (`tests/*.test.ts`) e continua aprovado porque `src/lap.ts`, `src/track.ts`,
`src/trackData.ts`, `ARCADE_KART` e `RENTAL_KART` não mudam (REQ-FEAT-0006-07).

Por que a fase A de `STEER_RESPONSE` dura 600 ms: com a velocidade mantida a 13,9 m/s e a guinada
pedida pelo limite de esterço (`u × tan(limite) / wheelbase`, cerca de 0,95 rad/s no candidato, DES-0001,
um teto, porque a guinada real fica abaixo dela), o kart se desloca lateralmente no máximo cerca de
`v × ω × t² / 2` ≈ 6,6 × t² m — 2,4 m em 0,6 s, dentro dos 5,5 m da meia-faixa; ao soltar, com rumo
≈ 0,5 rad, a velocidade lateral é ≈ 6,7 m/s e os 3,1 m restantes dão ≈ 0,45 s, mais que os 250 ms do limiar
de queda. A janela de regime (400 a 600 ms) é curta e estacionária porque a velocidade não deriva; o
requisito pede 90 % em 180 ms, logo o regime está atingido bem antes dela. Medido em 2026-10-22 com esta
definição sobre `src/physics.ts` da rodada de código 1 (prova de método, não linha de base): candidato
`ARCADE_ASSISTIDO_V5`, regime 0,72 rad/s, variação de 4 % na janela, velocidade entre 13,86 e 13,93 m/s
(dentro de ±0,5), afastamento lateral máximo de 1,54 m nas duas fases, subida 125 ms e queda 67 ms;
`ARCADE_KART`, regime 0,65 rad/s, subida 217 ms (o acerto anterior não atende os 180 ms, como os requisitos
dizem), afastamento 1,34 m.

Serialização: `serialize` imprime, por programa de bench, uma linha `# {"parameters": {...}}` com
`BENCH_PARAMETERS` e, em `bench:handling`, `runtimeId` (calculado pelo programa e passado em
`parameters`), e depois, por registro, uma linha JSON com exatamente os campos de API-0003 e uma linha `#`
de apresentação: cada velocidade em m/s também em km/h (`× 3.6`), `zeroToSixtyKmhMs` também em s
(`÷ 1000`), e os diagnósticos que não são campo — em `REFERENCE_CORNER` `THROTTLE_FULL`, a contagem de
passos em `oversteer`/`sliding`; em `UNDERSTEER_ONSET`, a velocidade do kart no passo da saída da faixa
(m/s e km/h), a velocidade-alvo do patamar interrompido, o número de patamares completos e se V1 foi
medida; em todo `FAIL` por `observed`, o motivo. Em `npm test`, cada teste
imprime o registro por `t.diagnostic`.

## Colaboradores

Chama `step`, `initialState`, `getHandlingTelemetry`, `classifyHandlingSteps`, `RECOVERY_MAX_STEPS`,
`testPadLane`, `testPadArc`, `PUBLISHED_SETUPS`, `TEST_PAD`, `CIRCUIT`, `STEP`, `SOLVER_SUBSTEPS`
(`src/physics.ts`); `startLap`, `stepLap`, `getLapState`, `getLapResult` (`src/lap.ts`); `toMs`,
`COUNTDOWN_STEPS` (`src/lapTiming.ts`); `track`, `nearest`, `WIDTH`, `SYNTHETIC_TRACK_FILE`
(`src/track.ts`); `readTrackData` (`src/trackData.ts`); `readReplay`, `compareLapRecords`,
`resolveSetupRef` (`src/setupRecords.ts`); `node:fs` (ler `docs/physics.md` e o texto de
`src/physics.ts`). A biblioteca **não** importa `node:os` nem `node:perf_hooks`: `runtimeId()` e
`measureStepCost` vivem em `scripts/keyboard-lap.ts`, que entrega os valores em `BenchOptions.stepCost`.
É chamada por `scripts/keyboard-lap.ts`, `scripts/physics-bench.ts` e `tests/dirigibilidade-*.test.ts`.
Nunca por `src/`.

## Estado e concorrência

Sem estado entre ensaios: cada `runBench` constrói o seu estado inicial e o seu ambiente. Um ensaio é
função pura do acerto, do ambiente, do estado inicial e da sequência de `Input` (RULE-0002); no
`STEER_RESPONSE` e no `UNDERSTEER_ONSET` o acelerador de cada passo é função determinística da telemetria do
passo anterior e do alvo corrente (que só muda ao fim de uma fase mantida, contada em passos), logo
a sequência de `Input` resultante é a mesma em toda execução; repetir produz registros idênticos exceto
`measuredAtUtc` (do chamador) e `meanStepCostUs`. Não há chave: nada é escrito. O registro em
`docs/physics.md` é feito pelo desenvolvedor na etapa de código, com a data, para a linha de base
(`--previous`, `--realista`) e para o acerto novo, antes e depois da mudança de parâmetros
(REQ-FEAT-0006-08). Cada rodada de presets do ciclo em staging (`DOMAIN/DEC-10`, FLOW-0002) repete todos os
ensaios desta tabela, nos mesmos ambientes e contra os mesmos limiares, como nova `setupVersion`
([ADR-0001](../adr/ADR-0001-versao-do-acerto-como-registro-novo-no-codigo.md)), e acrescenta a sua entrada
datada; nenhum ensaio, limiar ou preset experimental é acrescentado por rodada.

## Comportamento em falha

| Situação | Resultado |
|---|---|
| `docs/physics.md` ausente ou sem bloco | `readBaseline` devolve `undefined`; `baselineAvailable` falso; `UNDERSTEER_ONSET`, `STEP_COST` e `REALISTA_UNCHANGED` dão `FAIL` `BASELINE_MISSING` (em `UNDERSTEER_ONSET`, salvo quando a saída da faixa já reprova por si, motivo que vem antes na ordem); os demais ensaios não dependem dela |
| entrada da linha de base de outro ambiente, outro `arcRadiusM` ou outro `laneWidthM`; em `UNDERSTEER_ONSET`, registro sem `v1Mps` ou entrada sem os mesmos `plateauMs`/`plateauSpeedHoldMode`/`entrySpeedStepMps` | `baselineRecord` não a aceita; idem `BASELINE_MISSING` (uma linha de base medida na pista sintética, ou por velocidades de entrada, não serve para a varredura em patamares no arco) |
| bloco JSON corrompido | idem (`JSON.parse` em `try`); o arquivo não é alterado |
| velocidade não mantida em `STEER_RESPONSE` | `FAIL` `SPEED_NOT_HELD` com `speedMinMps`/`speedMaxMps`; os tempos ficam no registro mas não valem como veredito |
| kart fora da faixa durante `STEER_RESPONSE` | sem efeito no veredito nem campo no registro (API-0003; AC-US-0001-05) |
| precondição de `GRASS_LOSS` não atingida | `FAIL` `THRESHOLD_EXCEEDED` por `observed` (ensaio que não chegou ao estado que mede) |
| kart fora da faixa em `REFERENCE_CORNER` ou em `REAR_RECOVERY`; piloto de teste fora do asfalto | `FAIL` `OFF_ASPHALT` pelos campos, com `offAsphaltFirstStep` e posição |
| kart sai da faixa na varredura de `UNDERSTEER_ONSET` | encerra a varredura, com `offAsphaltStepCount` 1, passo e posição; abaixo de 50 km/h no passo da saída: `FAIL` `OFF_ASPHALT` (por `observed`); acima de 50 km/h com menos de 2 patamares completos acima de 50 km/h: `FAIL` `MEASUREMENT_MISSING`; acima com 2 ou mais: fim natural, sem reprovar pela saída, e `FAIL` `MEASUREMENT_MISSING` se V1 não foi medida; o patamar interrompido não entra em V1 nem em `maxUndersteerMsBySpeed` |
| `UNDERSTEER_ONSET` com resultado que RULE-0002 não decide: saída exatamente a 50 km/h; varredura sem saída da faixa (último patamar completo, ou subida que não alcança o alvo) | a biblioteca lança (`runBench`, e `judge` diante de um registro sem saída); nenhum registro é emitido; `npm test` e o bench falham com o erro, que traz só o `benchId` e o caso; cabe ao autor decidir o caso (lacuna deliberada do F-Spec) |
| piloto de teste não termina em `MAX_LAP_STEPS`, ou volta invalidada | `TEST_PILOT_LAP` `FAIL` `THRESHOLD_EXCEEDED` com `lapTimeMs` = `toMs(6000)` e cada setor não concluído com `toMs(6000)` em `sectorMs`, que segue com 4 elementos |
| traseira não solta em `REAR_RECOVERY`; `grip` não alcançado | `FAIL` `THRESHOLD_EXCEEDED`, `gripReached` falso, `recoveryMs` ausente |
| `WALL_CONTACT` sem contato | `FAIL` `THRESHOLD_EXCEEDED`, `contacts` vazia |
| execuções diferentes | `DETERMINISM` `FAIL` `NON_DETERMINISTIC`; nunca tolerância |
| leitura da pista sintética não `COMPLETE` em `TEST_PILOT_LAP` | a biblioteca lança (`:368-370`): é defeito do repositório, não resultado de ensaio |

Sem rede, sem tempo-limite. Registro em log: só a saída serializada (identificadores, campos de API-0003,
parâmetros e `runtimeId`); nunca caminho de arquivo, nome de máquina ou de usuário.

## Observabilidade

Cada limiar tem o seu campo e cada falha o seu `failReason`; `docs/physics.md` guarda a série datada, por
ambiente, que mostra uma regressão entre entregas (NFR-0004). `STEP_COST` é a métrica de NFR-0002;
`DETERMINISM` a de NFR-0001; `REALISTA_UNCHANGED` a de NFR-0007; o conjunto de `race-lap-validation` verde
a de NFR-0008; `speedMinMps`/`speedMaxMps` a da condição de velocidade mantida.

## Determinismo (D-DS-07)

A biblioteca avança a simulação só com `STEP` e nunca lê relógio: não importa `node:perf_hooks` nem
`node:os` e não contém `Date` nem `performance`; `measuredAtUtc` e `stepCost` vêm do chamador, e só
`scripts/keyboard-lap.ts` (camada Aplicação) lê `performance.now()`, em `measureStepCost`, cujo valor nunca
entra em medida de domínio (I9). O acelerador regulado é função da telemetria do passo anterior. Provas:
`DETERMINISM` por ambiente em `tests/dirigibilidade-test-pilot.test.ts`;
`tests/dirigibilidade-contract.test.ts` afirma a ausência desses símbolos em `scripts/handlingBench.ts`.

## Feature flag

Nenhuma: não é comportamento de usuário. `--previous`, `--realista`, `version` e `setup` são argumentos dos
programas de bench para produzir a linha de base, reportados na saída, não configuração do jogo nem gancho
de teste; `speedHoldMode`, `speedHoldBandMps`, `settleWindowMs`, `arcRadiusM`, `laneWidthM`,
`entrySpeedStepMps`, `plateauMs`, `plateauSpeedHoldMode` e os demais são parâmetros de ensaio fixados e
reportados, não limiares nem configuração.

## Pontos em aberto

Nenhum.
