---
id: DES-0001
title: Acerto Arcade assistido v5 e assistências na simulação
feature: dirigibilidade
stage: dspec
status: validated
version: 2.0.0
sources: [FEAT-0001, FEAT-0002, FEAT-0003, FEAT-0004, FEAT-0006, RULE-0001, RULE-0002, FLOW-0001, REQ-FEAT-0001-01, REQ-FEAT-0001-02, REQ-FEAT-0001-03, REQ-FEAT-0001-04, REQ-FEAT-0001-07, REQ-FEAT-0001-08, REQ-FEAT-0002-01, REQ-FEAT-0002-02, REQ-FEAT-0002-03, REQ-FEAT-0002-04, REQ-FEAT-0002-05, REQ-FEAT-0002-08, REQ-FEAT-0003-01, REQ-FEAT-0003-02, REQ-FEAT-0003-03, REQ-FEAT-0003-04, REQ-FEAT-0003-05, REQ-FEAT-0003-06, REQ-FEAT-0003-09, REQ-FEAT-0003-10, REQ-FEAT-0003-11, REQ-FEAT-0004-01, REQ-FEAT-0004-02, REQ-FEAT-0004-03, REQ-FEAT-0004-04, REQ-FEAT-0004-05, REQ-FEAT-0004-08, REQ-FEAT-0004-10, REQ-FEAT-0005-07, REQ-FEAT-0005-09, REQ-FEAT-0006-01, REQ-FEAT-0006-02, REQ-FEAT-0006-03, REQ-FEAT-0006-04]
---

# DES-0001 — Acerto Arcade assistido v5 e assistências na simulação

## Realiza

Os `REQ-*` em `sources`: resposta do volante (AC-US-0001-01 a -04), aderência na curva de referência e
início progressivo do subesterço (AC-US-0002-01 a -04), traseira só solta ao forçar, teto de derrapagem e
recuperação em 400 ms (AC-US-0003-01 a -05), aceleração, velocidade estabilizada, grama e parede
(AC-US-0004-01 a -05), tudo decidido nos presets e nas assistências da camada de simulação (NFR-0005), com
`STEP`, solver e `Input` inalterados (NFR-0006), o Realista intacto (NFR-0007) e a versão anterior do
Arcade nunca editada no lugar (REQ-FEAT-0005-09). Regras: RULE-0001, RULE-0002. Decisão:
[ADR-0001](../adr/ADR-0001-versao-do-acerto-como-registro-novo-no-codigo.md).

## Posicionamento

`src/physics.ts`, camada **Simulação**, alterado. Nenhum módulo novo: o modelo do veículo e os seus presets
já vivem aqui (decisão do autor: presets em `src/physics.ts`). O que **não** muda: `STEP` (`:5`), `Input`
(`:8`), `RENTAL_KART` (`:38-48`), `ARCADE_KART` (`:50-57`), `KART_PRESETS` (`:58`), a assinatura de `step`
(`:232`), a linha 3 e `PHYSICS_VERSION` (`:7`) — tudo afirmado por `tests/race-lap-validation-frozen.test.ts`.
`src/maneuvers.ts` não muda.

## Interface

### Preset novo e dado publicado

| Símbolo | Tipo | Descrição |
|---|---|---|
| `ARCADE_ASSISTIDO_V5` | `Readonly<KartConfig>` | `{...ARCADE_KART, <parâmetros existentes retunados>, <parâmetros opcionais de assistência abaixo>}`, congelado. Os valores são escolhidos na etapa de código pelos ensaios de [DES-0004](DES-0004-ensaios-de-dirigibilidade-e-saida.md); a tabela de alavancas abaixo diz o que cada um move |
| `PUBLISHED_SETUPS` | `Readonly<Record<SetupId, PublishedSetup>>` | o dado publicado de [DM-0001](../data/DM-0001-dado-publicado-registros-e-linha-de-base.md), seção 1 |
| `SetupId`, `PublishedSetup`, `SetupRef` | tipos | `SetupRef = {setupId, setupVersion}` |
| `SOLVER_SUBSTEPS` | `4` | subpassos por `STEP`: `step` passa a usar `Math.ceil(dt / (STEP / SOLVER_SUBSTEPS))` em `:234`, mesmo valor de hoje; 120 × 4 = 480 Hz (REQ-FEAT-0005-07) |

`KartConfig` ganha campos **opcionais**, lidos apenas dentro do ramo `config.drivingAssists` de `integrate` e
de `steeringLimit`; ausente, cada um vale o literal que o código usa hoje, de modo que `RENTAL_KART` e
`ARCADE_KART`, que não os declaram, se comportam exatamente como antes (I4; `REALISTA_UNCHANGED` prova):

| Campo opcional | Unidade | Padrão (comportamento atual) | Onde atua | Alavanca para |
|---|---|---|---|---|
| `steerApplyRatePerS` | múltiplo do limite por s (1/s) | 5 (`:135`) | taxa de aproximação do esterço ao alvo | subida a 90 % em ≤ 180 ms (REQ-FEAT-0001-01, -03) |
| `steerReturnRatePerS` | múltiplo do limite por s (1/s) | 10 (`:135`) | taxa de retorno ao soltar ou inverter | queda a 10 % em ≤ 250 ms (REQ-FEAT-0001-02, -04) |
| `assistLateralG` | g | `friction` (`:122`, `wheelbase * friction * GRAVITY / v²`) | aceleração lateral que o limite de esterço por velocidade pede | raio da curva de referência (18 m) a 50 km/h sem saturar a frente (REQ-FEAT-0002-01 a -03): a 13,89 m/s o raio de 18 m pede 10,7 m/s² (1,09 g) de aceleração lateral |
| `assistSteerAllowanceRad` | rad | 0,045 (`:123`) | folga além do limite cinemático | saturação progressiva da frente acima de V1 (REQ-FEAT-0002-04, -05) |
| `yawTrackingGainPerS` | 1/s | 0 (termo inexistente fora do drift; no drift o ganho 4 de `:191` não muda) | momento `clamp(inertia × (intendedYaw − yawRate) × ganho, ±140 N·m)` aplicado fora do drift | rapidez da guinada ao aplicar e ao soltar (REQ-FEAT-0001-01 a -04) |
| `yawCorrectGainPerS` | 1/s | 9 (`:189`) | amortecimento do excesso de guinada ao soltar | recuperação em ≤ 400 ms (REQ-FEAT-0003-04, -09) |
| `slipDampingGainPerS` | 1/s | 4 (`:181`) | amortecimento da velocidade lateral excedente | `sideslipRad` ≤ 0,65 em condução normal e na recuperação (REQ-FEAT-0003-05, -06) |
| `slipDampingCapG` | g | 0,45 (`:181`) | teto da força de amortecimento | idem |
| `forcingRearFrictionScale` | adimensional | 1 (sem efeito) | multiplicador do atrito dos pneus traseiros só nos passos com `forcing` verdadeiro (como o 0,86 do drift em `:167`) | traseira viva ao forçar, nunca em condução normal (REQ-FEAT-0003-01, -03) |
| `grassSpeedLossPerS` | 1/s | 0 (sem efeito) | força longitudinal extra `−massa × u × k × fração de rodas na grama` | ≥ 30 % de perda em 1 s na grama (REQ-FEAT-0004-03, -04, -08) |

Parâmetros existentes retunados no v5 (mesmas unidades de hoje): `enginePower` (W), `driveForce` (N),
`governorSpeed` (m/s), `throttleRate` (1/s), `friction`, `rearStiffness`, `frontStiffness`, `maxSteer`
(rad). `kartMass`, `driverMass` (75 kg no ensaio), `wheelbase`, `trackWidth`, `frontWeight`, `cgHeight`,
`yawRadius` e `grassFriction` não mudam de nome nem de unidade. Os valores respeitam as restrições numéricas
do acerto agressivo (`DOMAIN/REF-02`, carregadas pelo F-Spec 2.0.0): para 0–60 km/h em 2,5 s com 228 kg a
força líquida média precisa ser ≥ 1 520 N (16,67 m/s ÷ 2,5 s × 228 kg); para 105 km/h estabilizados
(29,17 m/s) `governorSpeed` precisa superar 29,17 m/s mais a rampa de 1,5 m/s do governador (`:141`); e a
curva de referência de 18 m a 50 km/h exige que o limite de esterço por velocidade (`assistLateralG`) admita
ao menos 1,09 g de aceleração lateral sem saturar a frente.

### Condição de forçar e telemetria por passo

`step(state, input, dt, config, environment)` (assinatura inalterada) passa a:

1. Calcular `forcing` uma vez por chamada: `clamp(input.throttle, 0, 1) >= 1` **e** `|clamp(input.steer, −1, 1)| >= 1`
   **e** `state.speed > 50 / 3.6` (13,888… m/s, 50 km/h, `DOMAIN/DEC-02`; o literal vive só em
   `src/physics.ts` e não é configurável; `state` é o estado no início do passo). Esterço parcial nunca
   satisfaz a condição (RULE-0001). A saturação na faixa de `Input` já ocorre em `:133-134` e
   `:137-138`; `forcing` usa o valor saturado (REQ-FEAT-0001-07).
2. Passar `forcing` a `integrate`, que aplica `forcingRearFrictionScale` aos pneus traseiros quando
   `config.drivingAssists && forcing`.
3. Incrementar `stepCount` (inteiro, +1 por chamada de `step`, 0 em `initialState()`).
4. Preencher a telemetria do passo (tipo `Telemetry`, `:16-19`, campos acrescentados):

| Campo novo de `Telemetry` | Tipo | Definição |
|---|---|---|
| `forcing` | booleano | o valor calculado em 1 |
| `surface` | `'asphalt' \| 'grass'` | `environment.surfaceAt({x, z})` no centro do kart **depois** do passo; é o mesmo critério de "fora do asfalto" de `scripts/keyboard-lap.ts:34` (`nearest(state).distance > WIDTH / 2`) em `CIRCUIT` |
| `wallContact` | booleano | verdadeiro se, neste passo, o ramo `environment.walls` (`:216-228`) encontrou `outgoing > 0` e removeu a componente normal da velocidade; falso nos demais, inclusive no kart encostado com velocidade 0 |
| `assistActive` | booleano | verdadeiro se o ramo `config.drivingAssists && state.speed > 0.5` (`:175`) executou neste passo |

Os campos existentes (`handling`, `sideslip`, `frontSlip`, `rearSlip`, `wheels`, G) e o classificador
`handling()` (`:106-113`) não mudam: `oversteer` e `sliding` continuam sendo leituras das forças; a
assistência garante que em condução normal (sem `forcing`, sem drift) a traseira não satura e `|sideslip|`
fica ≤ 0,65 rad, por amortecimento (`slipDampingGainPerS`, `slipDampingCapG`, `yawCorrectGainPerS`), e que ao forçar
o atrito traseiro reduzido deixa a traseira soltar. A parede já reduz a velocidade a cada contato com
`outgoing > 0` (`:222-226`: a componente normal passa a −0,12 × `outgoing`, a tangencial fica, logo o módulo
diminui), o que realiza REQ-FEAT-0004-05 sem alteração; esta feature só o reporta.

A leitura `getHandlingTelemetry` sobre esses campos é [DES-0002](DES-0002-telemetria-de-dirigibilidade.md).

## Colaboradores

Chama `nearest`/`WIDTH` (`src/track.ts`) e `advanceManeuvers` (`src/maneuvers.ts`), como hoje. É chamado por
`src/lap.ts` (`stepLap`), por `src/setupRecords.ts`, por `scripts/handlingBench.ts`, por `scripts/physics-bench.ts`
e pelos testes. `src/main.ts` lê `PUBLISHED_SETUPS` e `getHandlingTelemetry`. Nenhuma importação de `three`,
DOM, `src/audio.ts` ou `src/main.ts`.

## Estado e concorrência

- `State` é imutável por passo: `step` devolve um estado novo; `stepCount` é o contador de sequência
  (`simStepCount` de API-0001) e avança só quando `step` é chamado — na pausa, perda de foco ou perda do
  sensor `stepLap` devolve a mesma sessão (`src/lap.ts:173`) e nenhum contador avança, logo todo limite em
  ms conta só tempo simulado (REQ-FEAT-0001-08, REQ-FEAT-0002-08, REQ-FEAT-0003-11).
- Idempotência: `step` é função pura do estado, do `Input`, de `dt`, do `config` e do ambiente; reaplicar o
  mesmo passo ao mesmo estado dá o mesmo estado. Não há chave de deduplicação porque não há evento externo.
- A versão anterior é um registro intacto: `ARCADE_KART` não é tocado; a nova versão é `ARCADE_ASSISTIDO_V5`
  (REQ-FEAT-0005-09). Não existe caminho para o jogo escolher o acerto anterior: `PUBLISHED_SETUPS` expõe
  `previousConfig` só para os ensaios de linha de base.

## Comportamento em falha

Sem dependência externa, sem tempo-limite, sem escrita parcial. `dt` fora de (0, 0,1] continua lançando
`RangeError` (`:233`), como hoje. Um campo opcional ausente vale o padrão; um campo presente com valor não
finito não é validado em tempo de execução (os presets são literais congelados, verificados por
`tests/dirigibilidade-contract.test.ts`). Nada é registrado em log pela simulação.

## Observabilidade

Os limiares são observados pelos registros de API-0003 ([DES-0004](DES-0004-ensaios-de-dirigibilidade-e-saida.md)):
`riseToNinetyPctMs`, `fallToTenPctMs`, `maxUndersteerMs`, `v1Mps`, `recoveryMs`, `maxSideslipRad`,
`oversteerOrSlidingStepCount`, `zeroToSixtyKmhMs`, `topSpeedMps`, `speedAfterOneSMps`, `contacts`. Uma
regressão aparece como `FAIL` com `THRESHOLD_EXCEEDED` no registro correspondente.

## Determinismo (D-DS-07)

Passo fixo `STEP`, `SOLVER_SUBSTEPS` fixo, sem relógio, sem sorteio; `forcing` é função do `Input` e do
estado. Provas: `tests/dirigibilidade-test-pilot.test.ts` executa cada ensaio e a volta do piloto de teste
duas vezes e afirma `deepEqual` dos estados por passo (`DETERMINISM`); `tests/race-lap-validation-layering.test.ts`
continua afirmando a ausência de `Date`, `performance`, `Math.random` e DOM em `src/physics.ts`.

## Feature flag

Nenhuma chave: a versão corrente é dado publicado ([RULE-0003](../../../../320%20F-Specs/Output/dirigibilidade/rules/RULE-0003-versao-do-acerto-e-comparabilidade.md))
e o F-Spec proíbe configuração para escolher entre o acerto antigo e o novo (FEAT-0005, Configuração). O
"padrão sem mudança" (I4) está nos campos opcionais: ausentes em `RENTAL_KART` e `ARCADE_KART`, cada um vale
o literal atual, e o Realista e a versão anterior não mudam de comportamento; o motivo está em
[ADR-0001](../adr/ADR-0001-versao-do-acerto-como-registro-novo-no-codigo.md).

## Pontos em aberto

Nenhum.
