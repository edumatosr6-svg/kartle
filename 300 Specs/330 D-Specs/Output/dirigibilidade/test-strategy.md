---
title: Estratégia de testes — dirigibilidade do Arcade assistido
feature: dirigibilidade
stage: dspec
status: validated
version: 4.0.0
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
criado só para testar: os testes chegam ao comportamento por `step`/`getHandlingTelemetry`/
`testPadLane`/`testPadArc`/`classifyHandlingSteps` (`src/physics.ts`), `startLap`/`stepLap`/`getLapResult`
(`src/lap.ts`), `src/setupRecords.ts`, `src/handlingMessages.ts`, pela biblioteca de ensaios
`scripts/handlingBench.ts` (a mesma dos benches), por estados iniciais colocados pelas operações públicas
(um `State` com velocidade dada, como `tests/physics.test.ts:5` já faz) e por fixtures de registro. Os
ambientes de ensaio (pista de teste, pista sintética) são os mesmos que os benches usam e não existem só
para teste: são o ambiente que o F-Spec declara para cada ensaio (RULE-0002).

## Níveis

| Nível | Onde roda | O que cobre |
|---|---|---|
| Unitário | `npm test` | funções puras: `getHandlingTelemetry`, `testPadLane`, `testPadArc`, `classifyHandlingSteps`, `getSetupVersion`, `resolveSetupRef`, `readReplay`, `compareLapRecords`, `buildLapRecord`, `buildReplayRecord`, `readBaseline`, `baselineRecord`, `judge`, `serialize`, `formatSharedText`, `shareLabel`, `SOLVER_SUBSTEPS` |
| Integração | `npm test` | os ensaios de RULE-0002 sobre a física real, na pista de teste (`testPadLane`, `testPadArc`) e em `CIRCUIT` com a pista sintética, via `scripts/handlingBench.ts`; a volta do piloto de teste por `src/lap.ts`; `replayLap` |
| Contrato | `npm test` | `tests/dirigibilidade-contract.test.ts` e `tests/dirigibilidade-telemetry.test.ts`: forma e unidades de API-0001, API-0002 e API-0003 campo a campo (inclusive `benchEnvironment` em todo registro e os campos condicionais); códigos de rejeição; `STEP_CONTRACT`; `REALISTA_UNCHANGED`; presets congelados sem campos novos; camada e símbolos proibidos nos módulos novos |
| Bench | `npm run bench:handling`, `npm run bench:physics` | os mesmos registros mais `STEP_COST`; produção das linhas de base (`--previous`, `--realista`) |
| Web E2E | roteiro registrado em Chrome, Edge, Firefox e Safari atuais, `web-desktop` | HUD em todos os quadros, resultado com `setupVersion`, melhor tempo só comparável, texto compartilhado |
| Mobile E2E | roteiro registrado em celular intermediário de referência, `web-mobile` | inclinação proporcional e toque com o mesmo HUD; compartilhar pela Web Share API |

## Fixtures e como chegar a cada estado

| Fixture | O que é | Estado a que dá acesso |
|---|---|---|
| `straight(v)` em `scripts/handlingBench.ts` | `{...initialState(), x: 0, z: 0, heading: 0, vx: 0, vz: v, speed: v}` no eixo da faixa de `testPadLane(WIDTH)` | reta da pista de teste a 50 km/h (`50 / 3.6`), 60 km/h, repouso |
| `testPadLane(WIDTH)`, `testPadArc(18, WIDTH)` (`src/physics.ts`) | os ambientes da pista de teste | `surface` `ASPHALT` dentro da faixa e `GRASS` fora; `wallContact` sempre falso |
| `arcEntry(speedMps)` em `scripts/handlingBench.ts` | `(18, 0)`, `heading` 0, tangente ao anel | entrada do arco de raio 18 m a qualquer velocidade; início da varredura de `UNDERSTEER_ONSET` no alvo do primeiro patamar |
| regulador de velocidade (interno à biblioteca) | acelerador 1 se a velocidade anterior < alvo, senão 0; em `STEER_RESPONSE` o alvo é 50 km/h, em `UNDERSTEER_ONSET` o alvo do patamar corrente (`plateauSpeedHoldMode`) | velocidade mantida em 50 km/h (a prova é `speedMinMps`/`speedMaxMps` no registro) e em cada patamar da varredura, com subida e fase mantida de `plateauMs` |
| `grassEntry(speedMps)` em `scripts/handlingBench.ts` | 5,7 m do eixo, do lado oposto à origem, no trecho reto da pista sintética (índice 83), rumo 0,15 rad para fora | 1 s na grama de `CIRCUIT` a partir de qualquer velocidade, sem tocar a parede |
| `boundaryEnvironment` | `{surfaceAt: p => p.x > 0 ? 'grass' : 'asphalt', walls: false}` (como `tests/physics.test.ts:137`) | transição `ASPHALT` → `GRASS` → `ASPHALT` na telemetria |
| `wallApproach()` | largada da pista sintética com `heading` desviado de `wallApproachRad` | contatos com a parede em `CIRCUIT` |
| `syntheticReading()` | leitura `COMPLETE` da pista sintética, `readTrackData(SYNTHETIC_TRACK_FILE)`: a de `tests/fixtures/trackFiles.ts` (existente) nos testes, a de `scripts/handlingBench.ts` dentro da biblioteca, que não importa de `tests/` | volta do piloto de teste; `replayLap` |
| `testPilot(config)` em `scripts/handlingBench.ts` | controlador binário determinístico (10 Hz), exportado pela biblioteca (DES-0004) | volta completa com o acerto corrente |
| `forcingSequence` | `{throttle: 1, steer: 1}` mantido acima de 50 km/h no arco, depois `steer: 0` | traseira solta e recuperação; é o que `REAR_RECOVERY` aplica |
| sequências sintéticas para `classifyHandlingSteps` | listas de `{input, telemetry}` construídas à mão: soltura sob `forcing` com `oversteer`, `grip` no passo 10; `grip` só no passo 60; esterço reaplicado no meio; esterço parcial | as quatro classes de RULE-0001 e o teto de 48 passos, sem física |
| `driftScenario` | o `Input` de `tests/maneuvers.test.ts:68-79` | manobra de drift com o acerto corrente |
| `tests/fixtures/records.ts` (**novo**) | `oldReplay()` e `oldResult()` sem `setupId`/`setupVersion` e sem `replayFormatVersion`; `newReplay()`/`newResult()` com `arcade-assistido-v5`; `v4Replay()` com `arcade-assistido-v4` e `inputs` gravados de uma volta de `ARCADE_KART`; `futureReplay()` com `replayFormatVersion` 2; `corruptReplay()` texto inválido; `oversizedReplay()` com `inputs` de `MAX_REPLAY_INPUT_STEPS + 1` elementos e `oversizedReplayText()` texto JSON válido com `MAX_REPLAY_TEXT_CHARS + 1` caracteres; `incompleteResult()` sem `trackVersion` | leitura de registro antigo, novo, não suportado, ilegível, acima do teto e incompleto; reprodução de replay da versão anterior; passados a `BenchOptions.oldRecords` |
| `baselineMarkdown()` | texto com um bloco `handling-baseline` válido (entradas com `benchEnvironment`, `arcRadiusM`, `laneWidthM`, `entrySpeedStepMps` e, em `parameters`, `plateauMs` e `plateauSpeedHoldMode`; o registro `UNDERSTEER_ONSET` com `v1Mps` e `failReason` `MEASUREMENT_MISSING`, como o de `ARCADE_KART` sai), um sem bloco, um corrompido, um com registro `UNDERSTEER_ONSET` de outro ambiente ou outro arco, um com registro `UNDERSTEER_ONSET` sem `v1Mps` (V1 não medida na linha de base) e um cuja entrada não traz `plateauMs`/`plateauSpeedHoldMode` (medida por velocidades de entrada) | `baselineAvailable` verdadeiro e falso; V0 aceito qualquer que seja o `failReason` do registro da linha de base; `BASELINE_MISSING` por ausência, por geometria diferente, por V0 não medido e por método diferente |
| `docs/physics.md` real | o bloco registrado pela etapa de código | os vereditos reais de `UNDERSTEER_ONSET`, `TEST_PILOT_LAP` (linha de base) e `REALISTA_UNCHANGED` |
| `inputMode` `PROPORTIONAL` | mesmo `Input` com esterço como número contínuo saturado e a variante 0,5 | paridade com a inclinação |

## Funcionalidade por nível

| Funcionalidade | Unitário | Integração | Contrato | Bench | Web E2E | Mobile E2E | Razão |
|---|---|---|---|---|---|---|---|
| FEAT-0001 resposta do volante | sim | sim | sim | `bench:handling` | — | — | limiares medidos no estado da simulação, na pista de teste; nenhum elemento de tela próprio |
| FEAT-0002 aderência em curva | sim | sim | sim | `bench:handling` | — | — | idem, no arco de 18 m, com linha de base de `docs/physics.md` |
| FEAT-0003 traseira viva e controlável | sim | sim | sim | `bench:handling` | — | — | classificação do passo e recuperação na simulação |
| FEAT-0004 aceleração, velocidade, grama, parede e HUD | sim | sim | sim | `bench:physics` | E2E-01 | E2E-01 | limiares na simulação; "todos os quadros" exige tela |
| FEAT-0005 determinismo, piloto de teste e versão | sim | sim | sim | `bench:handling` | E2E-02 | E2E-02, E2E-03 | registros e comparabilidade puros; a exibição e o compartilhar exigem tela |
| FEAT-0006 transversais | sim | sim | sim | `bench:handling`, `bench:physics` | — | — | camada, contrato de passo, Realista, paridade, custo, `race-lap-validation` e `docs/physics.md` |

## Roteiro registrado (web E2E e mobile E2E)

| Id | O que se faz e se registra | Canal |
|---|---|---|
| E2E-01 | iniciar uma volta com o Arcade assistido; gravar a tela do sinal verde ao fim; verificar que `#speed` (km/h) e `#handling` (texto) estão visíveis com valor em todos os quadros, inclusive em grama e após bater; pausar (Esc, troca de aba; cobrir o sensor no celular) e verificar que os dois mantêm o último valor | desktop e celular |
| E2E-02 | completar uma volta com o Arcade; ver no resultado o tempo e a `setupVersion` em texto; trocar o acerto para Realista: o melhor tempo passa a `—` (a troca de acerto zera `bestRecord`, [DES-0006](web/DES-0006-resultado-melhor-tempo-e-texto-compartilhado.md)); completar uma volta com o Realista: o melhor tempo mostra só o tempo dessa volta, nunca o do Arcade nem uma diferença entre os dois; voltar ao Arcade: o melhor tempo volta a `—` (zerado de novo; o tempo do Arcade não reaparece e o do Realista não é mostrado); compartilhar e verificar o texto (tempo e `setupVersion`, sem comparação) | desktop (área de transferência) e celular (Web Share) |
| E2E-03 | com a inclinação ativa, uma volta inteira; verificar o mesmo HUD e que o esterço parcial não força a traseira (texto de aderência nunca "Saindo de traseira"/"Derrapando" sem acelerador cheio e esterço cheio) | celular |

## Critérios de aceite: como o teste chega a cada um

`U` unitário, `I` integração, `C` contrato; arquivos em `tests/`, prefixo `dirigibilidade-`.

| Critério | Teste e caminho |
|---|---|
| AC-US-0001-01 | `steer-response` (I): `runBench('STEER_RESPONSE')` em `testPadLane(WIDTH)` com `straight(50 / 3.6)`, lados +1 e −1, `BINARY` e `PROPORTIONAL`; `benchEnvironment` `TEST_PAD`, `speedHoldMode` `THROTTLE_REGULATED`, `speedMinMps >= 50/3.6 − 0.5`, `speedMaxMps <= 50/3.6 + 0.5` e `riseToNinetyPctMs <= 180` nos quatro registros (um registro sintético com 21 passos, 175 ms, é `PASS`; com 22 passos, 183 ms, é `FAIL`, por `judge`); o registro é impresso por `t.diagnostic` |
| AC-US-0001-02 | idem: `fallToTenPctMs <= 250` |
| AC-US-0001-03 | `steer-response` (I): variante `steerInputNorm` 0,5 em `PROPORTIONAL`, lados +1 e −1; `riseToNinetyPctMs <= 180` para o regime desse esterço, com a velocidade mantida |
| AC-US-0001-04 | idem: `fallToTenPctMs <= 250` |
| AC-US-0001-05 | `steer-response` (I): o veredito recalculado só pelos dois tempos e pela faixa de velocidade é igual ao `verdict` do registro para todo registro, tenha `understeerStepCount` 0 ou maior; um registro sintético com tempos dentro, velocidade dentro e `understeerStepCount` 50 é `PASS` (`judge`) |
| AC-US-0001-06 | `steer-response` (C): o registro tem `benchId` `STEER_RESPONSE`, `benchEnvironment` `TEST_PAD`, `setupId` `ARCADE_ASSISTIDO`, `riseToNinetyPctMs`, `fallToTenPctMs`, `settleWindowMs` inteiros, `steadyYawRateRadPerS`, `speedMinMps`, `speedMaxMps`, `speedHoldMode`, `speedHoldBandMps`, `targetSpeedMps` e nenhum `throttleInputNorm` (modo regulado) nem campo de saída da faixa; um registro sintético com `speedMaxMps` = alvo + 0,6 é `FAIL` `SPEED_NOT_HELD` por `judge` (caso anormal, requisito 09), e um com tempos e velocidade dentro julgado com `observed` `OFF_ASPHALT` continua `PASS` (a saída da faixa da reta não altera o veredito, API-0003); `bench:handling` imprime o mesmo |
| AC-US-0002-01 | `cornering` (I): `REFERENCE_CORNER` em `testPadArc(18, WIDTH)`, `THROTTLE_ZERO` e `THROTTLE_FULL`: `maxUndersteerMs <= 200` |
| AC-US-0002-02 | `cornering` (I): `offAsphaltStepCount === 0` nas duas condições; `surface` `ASPHALT` em todos os passos do traço; um registro sintético com `offAsphaltStepCount` 1, `offAsphaltFirstStep` e posição é `FAIL` `OFF_ASPHALT` por `judge` (caso anormal, requisito 09) |
| AC-US-0002-03 | `cornering` (I): `UNDERSTEER_ONSET` com `readBaseline(docs/physics.md)`: `baselineAvailable`, `v1Mps` presente (V1 medida num patamar completo), `v1Mps >= 1.15 * v0Mps` e `verdict` `PASS`; `cornering` (U) por `judge`, com registros sintéticos de saída acima de 50 km/h (`offAsphaltStepCount` 1, sem `observed`) e 2 pares: V0 `50 / 3.6` e V1 `50 / 3.6 + 2.5` (59,0 km/h) é `PASS`; V1 `50 / 3.6 + 2.0` (57,2 km/h, abaixo de 1,15 × V0 = 57,5 km/h) é `THRESHOLD_EXCEEDED`; sem `v1Mps` (fim natural sem V1 medida) é `FAIL` `MEASUREMENT_MISSING`; `baselineRecord` aceita como V0 o registro de linha de base com `v1Mps` e `failReason` `MEASUREMENT_MISSING`, e não aceita um sem `v1Mps` nem o de uma entrada sem `plateauMs`/`plateauSpeedHoldMode` (`baselineMarkdown()`), que dão `BASELINE_MISSING` |
| AC-US-0002-04 | `cornering` (I): `maxUndersteerMsBySpeed` só com patamares completos acima de `50 / 3.6`, em ordem crescente de `plateauSpeedMps`, separados de `entrySpeedStepMps`, e não decrescente em `maxUndersteerMs`; o patamar interrompido pela saída (linha `#`) não está na lista; `plateauMs` e `plateauSpeedHoldMode` estão na linha `#` de parâmetros; o acelerador do traço só assume 0 ou 1; `cornering` (U) por `judge`: lista com uma duração menor que a do par anterior é `THRESHOLD_EXCEEDED`, com durações iguais é `PASS` (comparação patamar a patamar, nunca máximo acumulado) |
| AC-US-0002-05 | `cornering` (C): dois registros `REFERENCE_CORNER` (um por `throttleCondition`) e um `UNDERSTEER_ONSET`, todos com `benchEnvironment` `TEST_PAD`, `arcRadiusM` 18, `laneWidthM` 11; `UNDERSTEER_ONSET` com `v0Mps`, `v1Mps`, `entrySpeedStepMps`, `maxUndersteerMsBySpeed` em pares `[plateauSpeedMps, maxUndersteerMs]`, `offAsphaltStepCount` 1, `offAsphaltFirstStep`, `offAsphaltFirstXM`, `offAsphaltFirstZM`; `serialize` imprime as velocidades também em km/h; `baselineMarkdown()` sem bloco, ou com registro de outro ambiente ou outro arco, dá `FAIL` `BASELINE_MISSING` sem `v0Mps` (requisito 07) |
| AC-US-0002-06 | `cornering` (U) por `judge`, sobre registros sintéticos `UNDERSTEER_ONSET` com `offAsphaltStepCount` 1, `offAsphaltFirstStep` e posição: julgado com `observed` `OFF_ASPHALT` (saída abaixo de 50 km/h) é `FAIL` `OFF_ASPHALT` com 0, 1 ou 2 pares, com ou sem `v1Mps` e com ou sem linha de base; sem `observed` (saída acima de 50 km/h), com 0 ou 1 par, é `FAIL` `MEASUREMENT_MISSING` com ou sem `v1Mps`; com 2 pares, `v1Mps` suficiente e linha de base, é `PASS` (fim natural: a saída não reprova); um registro com `offAsphaltStepCount` 0 faz `judge` lançar; `cornering` (I): a varredura real termina no primeiro passo com `surface` `GRASS` do traço (`offAsphaltStepCount` 1, `offAsphaltFirstStep` e posição iguais aos desse passo), e o registro segue a tabela de RULE-0002 para a `speedMps` desse passo do traço (`< 50 / 3.6`: `OFF_ASPHALT`; `> 50 / 3.6` com menos de 2 pares: `MEASUREMENT_MISSING`; com 2 ou mais: a saída não é o motivo de `FAIL` algum) |
| AC-US-0003-01 | `rear` (I): `NORMAL_DRIVING` (`TEST_PAD` e `SYNTHETIC_TRACK`): `oversteerOrSlidingStepCount === 0`; `REFERENCE_CORNER` `THROTTLE_FULL`: `handling` só `grip`/`understeer` em todos os passos do traço |
| AC-US-0003-02 | `rear` (I) e `telemetry` (C): em todos os traços, todo passo com `oversteer`/`sliding` tem classe `FORCING`, `DRIFT` ou `RECOVERY` por `classifyHandlingSteps`; `forcing` é verdadeiro só com acelerador 1, esterço ±1 e `speedMps > 50 / 3.6` do passo anterior (a 13,88 m/s é falso; a 13,90 m/s é verdadeiro); esterço 0,9 nunca o liga; `classify` (U): as sequências sintéticas dão as quatro classes, o passo de soltura e o primeiro `grip` são `RECOVERY`, o passo 49 sem `grip` é `NORMAL`, um esterço reaplicado encerra a recuperação |
| AC-US-0003-03 | `rear` (I): `REAR_RECOVERY` no arco com `forcingSequence`: `gripReached` verdadeiro e `recoveryMs <= 400`; um registro sintético com `gripReached` falso, ou com `recoveryMs` 404, é `FAIL` `THRESHOLD_EXCEEDED` (requisito 12), e um com `offAsphaltStepCount` 1, `offAsphaltFirstStep` e posição é `FAIL` `OFF_ASPHALT`; nos registros reais, `offAsphaltStepCount === 0` e nenhum passo do traço tem `surface` `GRASS` |
| AC-US-0003-04 | idem: `maxSideslipRad <= 0.65` |
| AC-US-0003-05 | `rear` (I): `NORMAL_DRIVING`: `maxSideslipRad <= 0.65`; `excludedRecoveryStepCount` igual ao número de passos `RECOVERY` do traço de `REAR_RECOVERY`, e `normalDrivingStepCount` não os inclui |
| AC-US-0003-06 | `rear` (I): `DRIFT_MANEUVER` com `driftScenario` e `ARCADE_ASSISTIDO_V5`: `verdict` `PASS`, `driftScorePoints > 0`; `tests/maneuvers.test.ts` continua passando com `ARCADE_KART` na mesma execução |
| AC-US-0003-07 | `rear` (C): registros `REAR_RECOVERY` (`benchEnvironment` `TEST_PAD`, `arcRadiusM`, `laneWidthM`, `gripReached`, `recoveryMs`, `maxSideslipRad`, `offAsphaltStepCount`) e `NORMAL_DRIVING` (`normalDrivingStepCount`, `excludedRecoveryStepCount`, `oversteerOrSlidingStepCount`, `maxSideslipRad`) presentes e com as unidades de API-0003 |
| AC-US-0004-01 | `speed` (I): `ACCELERATION` em `testPadLane(WIDTH)` com `straight(0)`, `driverMassKg` 75: `zeroToSixtyKmhMs <= 2500` |
| AC-US-0004-02 | `speed` (I): `TOP_SPEED`: `topSpeedMps >= 105 / 3.6` |
| AC-US-0004-03 | `speed` (I): `GRASS_LOSS` execução 1 (`grassEntry(topSpeedMps)` em `CIRCUIT`, 120 passos): `speedAfterOneSMps <= 0.7 * entrySpeedMps`; todos os 120 passos com `surface` `GRASS` e `wallContact` falso; um registro sintético dentro do limiar julgado com `observed` `THRESHOLD_EXCEEDED` (precondição não mantida) é `FAIL` |
| AC-US-0004-04 | idem, execução 2 com `grassEntry(50 / 3.6)` |
| AC-US-0004-05 | `speed` (I): `WALL_CONTACT` com `wallApproach()`: `contacts` não vazia e `after < before` em todos; `telemetry` (C): `wallContact` falso no passo seguinte ao contato, com o kart encostado a velocidade 0 e em toda a pista de teste |
| AC-US-0004-06 | `telemetry` (C): `getHandlingTelemetry` devolve `speedMps` e `handling` em todo passo de uma volta do piloto de teste, do sinal verde ao fim, e o estado inicial antes (`surface` `ASPHALT`, `grip`, 0 m/s); `hud-text` (U): a tabela de rótulos tem texto não vazio para os quatro valores; E2E-01 observa a tela por quadro e a pausa |
| AC-US-0004-07 | `speed` (C): os quatro registros com os campos nomeados, em m/s e ms, com `benchEnvironment` (`TEST_PAD` para aceleração e velocidade estabilizada; `SYNTHETIC_TRACK` para grama e parede); `serialize` imprime a linha de apresentação em km/h e s; `bench:physics` imprime o mesmo |
| AC-US-0005-01 | `setup-version` (I): `replayLap` do mesmo `newReplay()` duas vezes sobre `syntheticReading()`: `deepEqual` dos `LapRecord` (`lapMs`, `sectorMs`) e dos estados finais; `test-pilot` (I): `DETERMINISM` por ambiente com `runCount` 2 e `identical`; duas sequências diferentes dão `FAIL` `NON_DETERMINISTIC` (registro construído a partir de dois estados distintos) |
| AC-US-0005-02 | `test-pilot` (I): `TEST_PILOT_LAP` com `testPilot(ARCADE_ASSISTIDO_V5)`: `benchEnvironment` `SYNTHETIC_TRACK` e `offAsphaltStepCount === 0`; um piloto deliberadamente desviado (deslocamento lateral de 8 m, como `autopilot(offsetM)` de `race-lap-validation`, via `testPilotLapWith`) dá `FAIL` `OFF_ASPHALT` com `offAsphaltFirstStep` e posição |
| AC-US-0005-03 | `test-pilot` (I): `lapTimeMs <= 25000`; `baselineLapTimeMs` lido do bloco; um registro com `lapTimeMs` 25 001 dá `THRESHOLD_EXCEEDED` (`judge`); `test-pilot` (C): `sectorMs` é uma lista de exatamente 4 inteiros em todo registro `TEST_PILOT_LAP` — na volta `VALID`, com soma igual a `lapTimeMs`; com um controlador parado (acelerador, freio e esterço 0 em todo passo, via `testPilotLapWith`), a volta não se encerra em `MAX_LAP_STEPS` e o registro traz `lapTimeMs` 50 000 e `sectorMs` `[50000, 50000, 50000, 50000]` (nenhum setor concluído); o registro do piloto desviado de AC-US-0005-02 também traz 4 inteiros |
| AC-US-0005-04 | `setup-version` (U): `getSetupVersion('ARCADE_ASSISTIDO')` tem `setupVersion !== previousSetupVersion`; `readReplay(v4Replay())` e `readReplay(newReplay())` devolvem `setupVersion` diferentes; `SETUP_VERSION` com `oldRecords` dos fixtures e `declaredSetupVersion`/`previousSetupVersion` diferentes |
| AC-US-0005-05 | `setup-version` (U): tabela de RULE-0003 linha a linha em `compareLapRecords` (mesma pista e acerto e versão: `COMPARABLE`; versão diferente: `SETUP_VERSION_DIFFERS`; acerto diferente: `SETUP_DIFFERS`; pista diferente: `TRACK_DIFFERS`; `incompleteResult()`: `INCOMPLETE_RECORD`); `hud-text` (U): `formatSharedText` contém o tempo e a `setupVersion` e nenhum segundo tempo; `setup-version` (I): `replayLap(v4Replay())` dá `comparability` `SETUP_VERSION_DIFFERS`; E2E-02 na tela |
| AC-US-0005-06 | `contract` (C): `STEP_CONTRACT` com os três booleanos verdadeiros (`1 / STEP === 120`, `SOLVER_SUBSTEPS === 4`, linha de `Input` literal); `setup-version` (I): `v4Replay()` reproduzido passo a passo até `ENDED` com o acerto corrente |

## Requisitos não funcionais

| NFR | Como é provado |
|---|---|
| NFR-0001 | `test-pilot` (I): `DETERMINISM` por ambiente para cada ensaio e para a volta, `identical` verdadeiro; `NON_DETERMINISTIC` nunca tolerado |
| NFR-0002 | `bench:handling`: `STEP_COST` com `meanStepCostUs <= 1.10 * baselineMeanStepCostUs` para o `runtimeId` da máquina de referência, registrado em `docs/physics.md` (medido por `measureStepCost` em `scripts/keyboard-lap.ts` e entregue em `BenchOptions.stepCost`); `contract` (U): `readBaseline` sem `runtimeId` igual dá `BASELINE_MISSING`; `runBench('STEP_COST', {stepCost: {meanStepCostUs: 11, runtimeId}})` com linha de base 10 dá `FAIL` `THRESHOLD_EXCEEDED` e com 10 dá `PASS` (valores constantes, sem relógio) |
| NFR-0003 | `steer-response`, `cornering`, `rear`, `speed` (I): cada ensaio de US-0001 a US-0004 roda em `BINARY` e em `PROPORTIONAL` e exige `PASS` nos dois registros; o acelerador regulado de `STEER_RESPONSE` e de `UNDERSTEER_ONSET` só assume 0 ou 1 nos dois modos (afirmado sobre os `Input` do traço) |
| NFR-0004 | `contract` (U): `docs/physics.md` contém o bloco `handling-baseline` com entradas para `arcade-assistido-v4`, `arcade-assistido-v5` e `realista-aluguel-4t-v4`, cada uma com `measuredAtUtc`, `parameters` (com `plateauMs` e `plateauSpeedHoldMode`) e os registros de todos os `benchId` com os campos de API-0003, inclusive `benchEnvironment` em cada registro e `speedHoldMode`, `speedHoldBandMps`, `speedMinMps`, `speedMaxMps`, `settleWindowMs`, `arcRadiusM`, `laneWidthM`, `entrySpeedStepMps` onde o contrato os põe; a prosa datada é verificada na revisão da etapa de código |
| NFR-0005 | `contract` (C): `src/setupRecords.ts`, `scripts/handlingBench.ts` e `src/physics.ts` sem `three`, DOM, `Date`, `performance`, `Math.random`, `node:perf_hooks`, `node:os` (o relógio de parede e `runtimeId()` ficam só em `scripts/keyboard-lap.ts`); `src/main.ts` sem os literais da regra (`50 / 3.6`, `13.88`; 0,65), sem `KART_PRESETS`/`ARCADE_KART` e sem `classifyHandlingSteps`/`testPadLane`/`testPadArc`; todos os ensaios rodam em `npm test` sem DOM |
| NFR-0006 | `contract` (C): `STEP_CONTRACT`; `race-lap-validation-frozen` continua verde; `v4Replay()` reproduzido |
| NFR-0007 | `contract` (C): `REALISTA_UNCHANGED` nos dois ambientes com `differingMeasureCount === 0` e `arcadeAssistActiveCount === 0`, com `realistaBaseline` lido do bloco; `{...RENTAL_KART}` sem campo opcional novo; sem `realistaBaseline`, `BASELINE_MISSING` |
| NFR-0008 | a mesma execução de `npm test` roda `tests/race-lap-validation-*.test.ts` (glob `tests/*.test.ts`); `contract` (C): `src/lap.ts`, `src/track.ts`, `src/trackData.ts` e `src/lapTiming.ts` não importam `src/setupRecords.ts` nem contêm `setupVersion`, `testPadLane` ou `testPadArc` |
| NFR-0009 | `setup-version` (U): `oldReplay()` e `oldResult()` lidos com `READABLE`/`RESOLVED_FROM_ABSENCE` e `setupVersion` `arcade-assistido-v4`; `futureReplay()` dá `UNSUPPORTED_FORMAT` e o objeto fica idêntico (`deepEqual` antes e depois); `corruptReplay()` dá `UNREADABLE`; `oversizedReplay()` e `oversizedReplayText()` dão `UNREADABLE` sem que nenhum elemento de `inputs` seja lido (um elemento `Proxy` que lança ao ser acessado prova a ordem); `SETUP_VERSION` com `oldRecords` dos fixtures e `oldRecordsReadOkCount === oldRecordsReadCount` |

## Verificações existentes

Nenhuma é removida (conventions §17). `tests/physics.test.ts:147-189` e `tests/maneuvers.test.ts:68-79`
usam `ARCADE_KART` e a constante `TEST_PAD`, que não mudam, e continuam como estão; `tests/physics.test.ts:35`
(`LapTracker`) idem. Os testes de `race-lap-validation` não são tocados. As medidas da rodada de código 1
feitas com a biblioteca na forma anterior (curva na pista sintética, acelerador 0 por 2 s) não são
verificações registradas e não entram em linha de base.
