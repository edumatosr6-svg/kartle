---
title: Estratégia de testes — dirigibilidade do Arcade assistido
feature: dirigibilidade
stage: dspec
status: validated
version: 2.0.1
sources: []
---

# Estratégia de testes

Prova é verificação determinística em `npm test` (node:test via tsx), avançando a simulação com `STEP`,
nunca medida contra o relógio de parede (I9); o custo por passo é a única medida de parede e fica nos
benches. O que depende de tela, de sensor ou de aparelho só se prova em teste registrado, em
`docs/handling-device-log.md` (**novo**, criado pela etapa de código no molde de `docs/lap-validation-bench.md`
de `race-lap-validation`), e uma execução em desktop não vale para celular. O projeto não tem
ferramenta de teste de ponta a ponta e esta feature não acrescenta dependência: "web E2E" e "mobile E2E"
são o roteiro registrado abaixo, `E2E-nn`. Nenhum teste usa configuração, ponto de entrada ou gancho
criado só para testar: os testes chegam ao comportamento por `step`/`getHandlingTelemetry`
(`src/physics.ts`), `startLap`/`stepLap`/`getLapResult` (`src/lap.ts`), `src/setupRecords.ts`,
`src/handlingMessages.ts`, pela biblioteca de ensaios `scripts/handlingBench.ts` (a mesma dos benches),
por estados iniciais colocados pelas operações públicas (um `State` com velocidade dada, como
`tests/physics.test.ts:5` já faz) e por fixtures de registro.

## Níveis

| Nível | Onde roda | O que cobre |
|---|---|---|
| Unitário | `npm test` | funções puras: `getHandlingTelemetry`, `getSetupVersion`, `resolveSetupRef`, `readReplay`, `compareLapRecords`, `buildLapRecord`, `buildReplayRecord`, `readBaseline`, `serialize`, `formatSharedText`, `shareLabel`, `SOLVER_SUBSTEPS` |
| Integração | `npm test` | os ensaios de RULE-0002 sobre a física real, `TEST_PAD` e `CIRCUIT` com a pista sintética, via `scripts/handlingBench.ts`; a volta do piloto de teste por `src/lap.ts`; `replayLap` |
| Contrato | `npm test` | `tests/dirigibilidade-contract.test.ts` e `tests/dirigibilidade-telemetry.test.ts`: forma e unidades de API-0001, API-0002 e API-0003 campo a campo; códigos de rejeição; `STEP_CONTRACT`; `REALISTA_UNCHANGED`; presets congelados sem campos novos; camada e símbolos proibidos nos módulos novos |
| Bench | `npm run bench:handling`, `npm run bench:physics` | os mesmos registros mais `STEP_COST`; produção das linhas de base (`version: 'previous'`, Realista) |
| Web E2E | roteiro registrado em Chrome, Edge, Firefox e Safari atuais, `web-desktop` | HUD em todos os quadros, resultado com `setupVersion`, melhor tempo só comparável, texto compartilhado |
| Mobile E2E | roteiro registrado em celular intermediário de referência, `web-mobile` | inclinação proporcional e toque com o mesmo HUD; compartilhar pela Web Share API |

## Fixtures e como chegar a cada estado

| Fixture | O que é | Estado a que dá acesso |
|---|---|---|
| `moving(v)` | `{...initialState(), x: 0, z: 0, heading: 0, vx: 0, vz: v, speed: v}` em `TEST_PAD` | reta a 50 km/h (`50 / 3.6`), 60 km/h, repouso |
| `cornerEntry(speedMps)` em `scripts/handlingBench.ts` | ponto da linha central `entryArcM` antes do ápice de menor raio, `heading` tangente, em `CIRCUIT` | curva de referência a qualquer velocidade de entrada |
| `grassEnvironment` | `{surfaceAt: () => 'grass', walls: false}` | 1 s na grama a partir de qualquer estado |
| `boundaryEnvironment` | `{surfaceAt: p => p.x > 0 ? 'grass' : 'asphalt', walls: false}` (como `tests/physics.test.ts:137`) | transição `ASPHALT` → `GRASS` → `ASPHALT` na telemetria |
| `wallApproach` | largada da pista sintética com `heading` desviado de `wallApproachRad` | contatos com a parede em `CIRCUIT` |
| `syntheticReading()` (de `tests/fixtures/trackFiles.ts`, existente) | leitura `COMPLETE` da pista sintética | volta do piloto de teste; `replayLap` |
| `testPilot(config)` em `scripts/handlingBench.ts` | controlador binário determinístico (10 Hz), exportado pela biblioteca (DES-0004) | volta completa com o acerto corrente |
| `forcingSequence` | `{throttle: 1, steer: 1}` mantido acima de 50 km/h, depois `steer: 0` | traseira solta e recuperação |
| `driftScenario` | o `Input` de `tests/maneuvers.test.ts:68-79` | manobra de drift com o acerto corrente |
| `tests/fixtures/records.ts` | `oldReplay()` e `oldResult()` sem `setupId`/`setupVersion` e sem `replayFormatVersion`; `newReplay()`/`newResult()` com `arcade-assistido-v5`; `v4Replay()` com `arcade-assistido-v4` e `inputs` gravados de uma volta de `ARCADE_KART`; `futureReplay()` com `replayFormatVersion` 2; `corruptReplay()` texto inválido; `oversizedReplay()` com `inputs` de `MAX_REPLAY_INPUT_STEPS + 1` elementos e `oversizedReplayText()` texto JSON válido com `MAX_REPLAY_TEXT_CHARS + 1` caracteres; `incompleteResult()` sem `trackVersion` | leitura de registro antigo, novo, não suportado, ilegível, acima do teto e incompleto; reprodução de replay da versão anterior |
| `baselineMarkdown()` | texto com um bloco `handling-baseline` válido, um sem bloco e um corrompido | `baselineAvailable` verdadeiro e falso; `BASELINE_MISSING` |
| `docs/physics.md` real | o bloco registrado pela etapa de código | os vereditos reais de `UNDERSTEER_ONSET` e `REALISTA_UNCHANGED` |
| `inputMode` `PROPORTIONAL` | mesmo `Input` com esterço como número contínuo saturado e a variante 0,5 | paridade com a inclinação |

## Funcionalidade por nível

| Funcionalidade | Unitário | Integração | Contrato | Bench | Web E2E | Mobile E2E | Razão |
|---|---|---|---|---|---|---|---|
| FEAT-0001 resposta do volante | sim | sim | sim | `bench:handling` | — | — | limiares medidos no estado da simulação; nenhum elemento de tela próprio |
| FEAT-0002 aderência em curva | sim | sim | sim | `bench:handling` | — | — | idem, com linha de base de `docs/physics.md` |
| FEAT-0003 traseira viva e controlável | sim | sim | sim | `bench:handling` | — | — | classificação do passo e recuperação na simulação |
| FEAT-0004 aceleração, velocidade, grama, parede e HUD | sim | sim | sim | `bench:physics` | E2E-01 | E2E-01 | limiares na simulação; "todos os quadros" exige tela |
| FEAT-0005 determinismo, piloto de teste e versão | sim | sim | sim | `bench:handling` | E2E-02 | E2E-02, E2E-03 | registros e comparabilidade puros; a exibição e o compartilhar exigem tela |
| FEAT-0006 transversais | sim | sim | sim | `bench:handling`, `bench:physics` | — | — | camada, contrato de passo, Realista, paridade, custo, `race-lap-validation` e `docs/physics.md` |

## Roteiro registrado (web E2E e mobile E2E)

| Id | O que se faz e se registra | Canal |
|---|---|---|
| E2E-01 | iniciar uma volta com o Arcade assistido; gravar a tela do sinal verde ao fim; verificar que `#speed` (km/h) e `#handling` (texto) estão visíveis com valor em todos os quadros, inclusive em grama e após bater; pausar (Esc, troca de aba; cobrir o sensor no celular) e verificar que os dois mantêm o último valor | desktop e celular |
| E2E-02 | completar uma volta; ver no resultado o tempo e a `setupVersion` em texto; trocar o acerto para Realista e completar outra: o melhor tempo não compara com o anterior (mostra `—`); voltar ao Arcade: o melhor tempo do Arcade reaparece; compartilhar e verificar o texto (tempo e `setupVersion`, sem comparação) | desktop (área de transferência) e celular (Web Share) |
| E2E-03 | com a inclinação ativa, uma volta inteira; verificar o mesmo HUD e que o esterço parcial não força a traseira (texto de aderência nunca "Saindo de traseira"/"Derrapando" sem acelerador cheio e esterço cheio) | celular |

## Critérios de aceite: como o teste chega a cada um

`U` unitário, `I` integração, `C` contrato; arquivos em `tests/`, prefixo `dirigibilidade-`.

| Critério | Teste e caminho |
|---|---|
| AC-US-0001-01 | `steer-response` (I): `runBench('STEER_RESPONSE')` com `moving(50 / 3.6)`, lados +1 e −1, `BINARY` e `PROPORTIONAL`; `riseToNinetyPctMs <= 180` nos quatro registros (um registro sintético com 21 passos, 175 ms, é `PASS`; com 22 passos, 183 ms, é `FAIL`, pela função de veredito); o registro é impresso por `t.diagnostic` |
| AC-US-0001-02 | idem: `fallToTenPctMs <= 250` |
| AC-US-0001-03 | `steer-response` (I): variante `steerInputNorm` 0,5 em `PROPORTIONAL`, lados +1 e −1; `riseToNinetyPctMs <= 180` para o regime desse esterço |
| AC-US-0001-04 | idem: `fallToTenPctMs <= 250` |
| AC-US-0001-05 | `steer-response` (I): o veredito recalculado só pelos dois tempos é igual ao `verdict` do registro para todo registro, tenha `understeerStepCount` 0 ou maior; um registro sintético com tempos dentro e `understeerStepCount` 50 é `PASS` (função de veredito exportada da biblioteca) |
| AC-US-0001-06 | `steer-response` (C): o registro tem `benchId` `STEER_RESPONSE`, `setupId` `ARCADE_ASSISTIDO`, `riseToNinetyPctMs`, `fallToTenPctMs`, `settleWindowMs` inteiros e os demais campos de API-0003; `bench:handling` imprime o mesmo |
| AC-US-0002-01 | `cornering` (I): `REFERENCE_CORNER` em `THROTTLE_ZERO` e `THROTTLE_FULL`: `maxUndersteerMs <= 200` |
| AC-US-0002-02 | `cornering` (I): `offAsphaltStepCount === 0` nas duas condições; `surface` `ASPHALT` em todos os passos lidos pelo gancho do ensaio |
| AC-US-0002-03 | `cornering` (I): `UNDERSTEER_ONSET` com `readBaseline(docs/physics.md)`: `baselineAvailable` e `v1Mps >= 1.15 * v0Mps` |
| AC-US-0002-04 | `cornering` (I): `maxUndersteerMsBySpeed` não decrescente em `maxUndersteerMs` ao crescer `entrySpeedMps` |
| AC-US-0002-05 | `cornering` (C): dois registros `REFERENCE_CORNER` (um por `throttleCondition`) e um `UNDERSTEER_ONSET` com `v0Mps`, `v1Mps`, `entrySpeedStepMps`; `baselineMarkdown()` sem bloco dá `FAIL` `BASELINE_MISSING` sem `v0Mps` |
| AC-US-0003-01 | `rear` (I): `NORMAL_DRIVING` sobre os passos agregados: `oversteerOrSlidingStepCount === 0`; `REFERENCE_CORNER` `THROTTLE_FULL`: `handling` só `grip`/`understeer` em todos os passos |
| AC-US-0003-02 | `rear` (I) e `telemetry` (C): em todos os ensaios, todo passo com `oversteer`/`sliding` tem `forcing` ou `driftActive` verdadeiro; `forcing` é verdadeiro só com acelerador 1, esterço ±1 e `speedMps > 50 / 3.6` do passo anterior (a 13,88 m/s é falso; a 13,90 m/s é verdadeiro); esterço 0,9 nunca o liga |
| AC-US-0003-03 | `rear` (I): `REAR_RECOVERY` com `forcingSequence`: `recoveryMs <= 400` |
| AC-US-0003-04 | idem: `maxSideslipRad <= 0.65` |
| AC-US-0003-05 | `rear` (I): `NORMAL_DRIVING`: `maxSideslipRad <= 0.65` |
| AC-US-0003-06 | `rear` (I): `DRIFT_MANEUVER` com `driftScenario` e `ARCADE_ASSISTIDO_V5`: `verdict` `PASS`, `driftScore > 0`; `tests/maneuvers.test.ts` continua passando com `ARCADE_KART` na mesma execução |
| AC-US-0003-07 | `rear` (C): registros `REAR_RECOVERY` (`recoveryMs`, `maxSideslipRad`) e `NORMAL_DRIVING` (`oversteerOrSlidingStepCount`, `maxSideslipRad`) presentes e com as unidades de API-0003 |
| AC-US-0004-01 | `speed` (I): `ACCELERATION` com `moving(0)`, `driverMassKg` 75: `zeroToSixtyKmhMs <= 2500` |
| AC-US-0004-02 | `speed` (I): `TOP_SPEED`: `topSpeedMps >= 105 / 3.6` |
| AC-US-0004-03 | `speed` (I): `GRASS_LOSS` execução 1 (estado de `TOP_SPEED` + `grassEnvironment` por 120 passos): `speedAfterOneSMps <= 0.7 * entrySpeedMps` |
| AC-US-0004-04 | idem, execução 2 com `moving(50 / 3.6)` |
| AC-US-0004-05 | `speed` (I): `WALL_CONTACT` com `wallApproach`: `contacts` não vazia e `after < before` em todos; `telemetry` (C): `wallContact` falso no passo seguinte ao contato e com o kart encostado a velocidade 0 |
| AC-US-0004-06 | `telemetry` (C): `getHandlingTelemetry` devolve `speedMps` e `handling` em todo passo de uma volta do piloto de teste, do sinal verde ao fim, e o estado inicial antes; `hud-text` (U): a tabela de rótulos tem texto não vazio para os quatro valores; E2E-01 observa a tela por quadro e a pausa |
| AC-US-0004-07 | `speed` (C): os quatro registros com os campos nomeados e em m/s e ms; `serialize` imprime a linha de apresentação em km/h e s; `bench:physics` imprime o mesmo |
| AC-US-0005-01 | `setup-version` (I): `replayLap` do mesmo `newReplay()` duas vezes sobre `syntheticReading()`: `deepEqual` dos `LapRecord` (`lapMs`, `sectorMs`) e dos estados finais; `test-pilot` (I): `DETERMINISM` com `runCount` 2 e `identical` para cada ensaio e a volta; duas sequências diferentes dão `FAIL` `NON_DETERMINISTIC` (registro construído a partir de dois estados distintos) |
| AC-US-0005-02 | `test-pilot` (I): `TEST_PILOT_LAP` com `testPilot(ARCADE_ASSISTIDO_V5)`: `offAsphaltStepCount === 0`; um piloto deliberadamente desviado (deslocamento lateral de 8 m, como `autopilot(offsetM)` de `race-lap-validation`) dá `FAIL` `OFF_ASPHALT` com `offAsphaltFirstStep` e posição |
| AC-US-0005-03 | `test-pilot` (I): `lapTimeMs <= 25000` e `lapValidity` `VALID`; `baselineLapTimeMs` lido do bloco; um registro com `lapTimeMs` 25 001 dá `THRESHOLD_EXCEEDED` (função de veredito) |
| AC-US-0005-04 | `setup-version` (U): `getSetupVersion('ARCADE_ASSISTIDO')` tem `setupVersion !== previousSetupVersion`; `readReplay(v4Replay())` e `readReplay(newReplay())` devolvem `setupVersion` diferentes; `SETUP_VERSION` com `declaredSetupVersion`/`previousSetupVersion` diferentes |
| AC-US-0005-05 | `setup-version` (U): tabela de RULE-0003 linha a linha em `compareLapRecords` (mesma pista e acerto e versão: `COMPARABLE`; versão diferente: `SETUP_VERSION_DIFFERS`; acerto diferente: `SETUP_DIFFERS`; pista diferente: `TRACK_DIFFERS`; `incompleteResult()`: `INCOMPLETE_RECORD`); `hud-text` (U): `formatSharedText` contém o tempo e a `setupVersion` e nenhum segundo tempo; `setup-version` (I): `replayLap(v4Replay())` dá `comparability` `SETUP_VERSION_DIFFERS`; E2E-02 na tela |
| AC-US-0005-06 | `contract` (C): `STEP_CONTRACT` com os três booleanos verdadeiros (`1 / STEP === 120`, `SOLVER_SUBSTEPS === 4`, linha de `Input` literal); `setup-version` (I): `v4Replay()` reproduzido passo a passo até `ENDED` com o acerto corrente |

## Requisitos não funcionais

| NFR | Como é provado |
|---|---|
| NFR-0001 | `test-pilot` (I): `DETERMINISM` para cada ensaio e para a volta, `identical` verdadeiro; `NON_DETERMINISTIC` nunca tolerado |
| NFR-0002 | `bench:handling`: `STEP_COST` com `meanStepCostUs <= 1.10 * baselineMeanStepCostUs` para o `runtimeId` da máquina de referência, registrado em `docs/physics.md` (medido por `measureStepCost` em `scripts/keyboard-lap.ts` e entregue em `BenchOptions.stepCost`); `contract` (U): `readBaseline` sem `runtimeId` igual dá `BASELINE_MISSING`; `runBench('STEP_COST', {stepCost: {meanStepCostUs: 11, runtimeId}})` com linha de base 10 dá `FAIL` `THRESHOLD_EXCEEDED` e com 10 dá `PASS` (valores constantes, sem relógio) |
| NFR-0003 | `steer-response`, `cornering`, `rear`, `speed` (I): cada ensaio de US-0001 a US-0004 roda em `BINARY` e em `PROPORTIONAL` e exige `PASS` nos dois registros |
| NFR-0004 | `contract` (U): `docs/physics.md` contém o bloco `handling-baseline` com entradas para `arcade-assistido-v4`, `arcade-assistido-v5` e `realista-aluguel-4t-v4`, cada uma com `measuredAtUtc` e os registros de todos os `benchId` com os campos de API-0003 (os parâmetros de ensaio inclusive); a prosa datada é verificada na revisão da etapa de código |
| NFR-0005 | `contract` (C): `src/setupRecords.ts`, `scripts/handlingBench.ts` e `src/physics.ts` sem `three`, DOM, `Date`, `performance`, `Math.random`, `node:perf_hooks`, `node:os` (o relógio de parede e `runtimeId()` ficam só em `scripts/keyboard-lap.ts`); `src/main.ts` sem os literais da regra (`50 / 3.6`, `13.88`; 0,65) e sem `KART_PRESETS`/`ARCADE_KART`; todos os ensaios rodam em `npm test` sem DOM |
| NFR-0006 | `contract` (C): `STEP_CONTRACT`; `race-lap-validation-frozen` continua verde; `v4Replay()` reproduzido |
| NFR-0007 | `contract` (C): `REALISTA_UNCHANGED` com `differingMeasureCount === 0` e `arcadeAssistActiveCount === 0`; `{...RENTAL_KART}` sem campo opcional novo |
| NFR-0008 | a mesma execução de `npm test` roda `tests/race-lap-validation-*.test.ts` (glob `tests/*.test.ts`); `contract` (C): `src/lap.ts`, `src/track.ts`, `src/trackData.ts` e `src/lapTiming.ts` não importam `src/setupRecords.ts` nem contêm `setupVersion` |
| NFR-0009 | `setup-version` (U): `oldReplay()` e `oldResult()` lidos com `READABLE`/`RESOLVED_FROM_ABSENCE` e `setupVersion` `arcade-assistido-v4`; `futureReplay()` dá `UNSUPPORTED_FORMAT` e o objeto fica idêntico (`deepEqual` antes e depois); `corruptReplay()` dá `UNREADABLE`; `oversizedReplay()` e `oversizedReplayText()` dão `UNREADABLE` sem que nenhum elemento de `inputs` seja lido (um elemento `Proxy` que lança ao ser acessado prova a ordem); `SETUP_VERSION` com `oldRecordsReadOkCount === oldRecordsReadCount` |

## Verificações existentes

Nenhuma é removida (conventions §17). `tests/physics.test.ts:147-189` e `tests/maneuvers.test.ts:68-79`
usam `ARCADE_KART`, que não muda, e continuam como estão; `tests/physics.test.ts:35` (`LapTracker`) idem.
Os testes de `race-lap-validation` não são tocados.
