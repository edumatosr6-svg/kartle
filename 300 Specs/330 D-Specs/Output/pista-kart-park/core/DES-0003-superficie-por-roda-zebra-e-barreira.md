---
id: DES-0003
title: Superfície por roda, aderência na zebra, colisão com a barreira e contato do kart com a pista
feature: pista-kart-park
stage: dspec
status: validated
version: 1.0.1
sources: [API-0003, RULE-0001, FLOW-0002, FEAT-0002, FEAT-0004, FEAT-0005, REQ-FEAT-0002-12, REQ-FEAT-0004-04, REQ-FEAT-0004-05, REQ-FEAT-0004-06, REQ-FEAT-0004-07, REQ-FEAT-0005-05, REQ-FEAT-0005-06, REQ-FEAT-0005-08, REQ-FEAT-0005-09, REQ-FEAT-0007-09]
---

# DES-0003 — Superfície por roda, zebra, barreira e contato do kart com a pista

## Realiza

Os `REQ-*` em `sources`: a cada passo de `STEP` a superfície sob cada roda é `ASPHALT`, `CURB` ou `GRASS`
(REQ-FEAT-0005-05); cada pneu na zebra tem 85 % da aderência do mesmo pneu no asfalto, com a mesma carga e o
mesmo escorregamento (REQ-FEAT-0005-08); a roda na zebra é roda na pista em toda outra regra de superfície,
sem a perda de velocidade da grama (REQ-FEAT-0005-09) e com `beyondTrackEdgeM` 0 (REQ-FEAT-0005-06); na Kart
Park os únicos obstáculos são as barreiras do arquivo (REQ-FEAT-0004-04); o kart nunca termina um passo do
outro lado de uma barreira (REQ-FEAT-0004-05), com a mesma resposta do muro existente (REQ-FEAT-0004-06), e
`barrierContact` marca o passo do contato (REQ-FEAT-0004-07); a simulação usa a geometria do arquivo como
declarada (REQ-FEAT-0002-12); nenhum campo de `Input` novo (REQ-FEAT-0007-09). Contrato: API-0003
(`getTrackContact`). Regra: RULE-0001. Decisões: [ADR-0003](../adr/ADR-0003-colisao-com-a-barreira.md),
[ADR-0004](../adr/ADR-0004-zebra-como-superficie-na-fisica.md).

## Posicionamento

`src/physics.ts`, camada **simulação**, alterado. Passa a importar tipos e funções de `src/trackGeometry.ts`
(dado de pista). A linha 3 (`export { nearest, track, WIDTH, LapTracker } from './track';`), `STEP`, `Input`,
a assinatura de `step`, `RENTAL_KART`, `ARCADE_KART`, `KART_PRESETS`, `PHYSICS_VERSION` e o bloco do muro
(`src/physics.ts:276-290`) ficam como estão. Nenhum módulo novo: superfície, pneu e colisão já moram aqui.

## Interface

| Símbolo | Assinatura | Mudança |
|---|---|---|
| `Surface` | `'asphalt' \| 'curb' \| 'grass'` | ganha `curb` (`src/physics.ts:9`) |
| `CURB_GRIP_PC` | `0.85` | novo: fração da aderência do asfalto de um pneu na zebra (`DOMAIN/DEC-05`) |
| `surfaceMu(config, surface)` | `(KartConfig, Surface) => number` (coeficiente) | novo: `grassFriction` na grama, `friction * CURB_GRIP_PC` na zebra, `friction` no asfalto; substitui as duas escolhas `grass ? grassFriction : friction` de `tireForce` (`:143`) e do freio assistido (`:215`) |
| `Environment` | `{surfaceAt: (p: Point) => Surface; walls: boolean; track?: TrackGeometry}` | ganha o campo opcional `track`; ausente, nada muda (`CIRCUIT`, `TEST_PAD`, os ambientes de teste e os de `dirigibilidade` continuam válidos) |
| `trackEnvironment(geometry)` | `(TrackGeometry) => Environment` | novo: `{surfaceAt: p => classifySurface(geometry, p), walls: false, track: geometry}` — sem muro derivado da linha central (REQ-FEAT-0004-04) |
| `trackEdgeDistanceM(environment, p)` | `(Environment, Point) => number` (m, ≥ 0) | novo: `beyondTrackEdgeM(environment.track, p)` com `track`; senão `Math.max(0, nearest(p).distance - WIDTH / 2)`, a mesma expressão de `edgeDistanceM` (`src/lap.ts:218-220`) |
| `Telemetry` | ganha `barrierTouching: boolean` e `barrierContact: boolean` | aditivo; `emptyTelemetry()` (`:100-103`) os inicia em `false` |
| `TrackContact` | `{simStepCount: number; wheelSurfaces: ['ASPHALT' \| 'CURB' \| 'GRASS' x 4]; curbWheelCount: number; wheelGripPc: [number x 4]; beyondTrackEdgeM: number; barrierContact: boolean}` | novo: a resposta de API-0003, campo a campo |
| `getTrackContact(state, environment, config)` | `(State \| undefined, Environment, KartConfig) => TrackContact \| {code: 'NO_STATE'}` | novo, leitura pura; os três argumentos são o estado corrente da simulação que API-0003 lê (o kart, o ambiente e o acerto da volta, todos guardados na `LapSession`: `lap.kart`, `lap.environment`, `lap.config`), não parâmetros de consulta |

Mudanças dentro de `integrate` e `step` (o resto do modelo não muda):

| Trecho atual | Mudança |
|---|---|
| `tireForce`, `:143` | `const mu = surfaceMu(config, surface)`; no pneu traseiro com escala de forçar ou de drift, `tireConfig.friction` já vem escalado (`:219`), então a zebra dá `0,85` do asfalto escalado do mesmo pneu |
| freio assistido, `:215` | `const mu = surfaceMu(config, surface)` |
| rolamento, `:208` | inalterado: `grass ? 0.18 : 0.018` já trata a zebra como asfalto |
| fração de rodas, `:229-230` | `asphaltFraction` continua `asfalto / 4`; acrescenta `curbFraction = zebra / 4` e `grassFraction = grama / 4`; `mu = grassFriction + (friction − grassFriction) * asphaltFraction + (CURB_GRIP_PC * friction − grassFriction) * curbFraction` |
| perda na grama, `:252` | `(1 − asphaltFraction)` passa a `grassFraction`: a zebra não perde velocidade como a grama |
| manobra, `:300-302` e `:318` | `onRoad` passa a "nenhuma roda em `grass`" e o cancelamento a "alguma roda em `grass`": a zebra conta como pista para o drift |
| depois do bloco do muro, `:290` | bloco novo da barreira, só com `environment.track` (abaixo) |
| `step`, `:310-316` | contrato dos dois campos no fim do passo: `barrierTouching` é verdadeiro quando algum subpasso do passo teve a resposta da barreira (passo 3 do bloco abaixo) ou quando o centro do kart termina o passo a até `BARRIER_HALF_WIDTH_M + BARRIER_TOUCH_TOLERANCE_M` de um segmento de barreira; é falso sem `environment.track` e com uma geometria que não declara barreira (`barriers` vazio, o padrão neutro de API-0001, em que `nearestBarrier` devolve `undefined`), e nesses dois casos nenhuma distância à barreira é consultada; `barrierContact` é verdadeiro só no passo em que `barrierTouching` passa de falso, no estado recebido, a verdadeiro |

Na pista sintética e em todo ambiente sem zebra, `curbFraction` é 0 e `asphaltFraction` é `k / 4` exato, de
modo que `mu`, `1 − asphaltFraction` e `grassFraction` têm exatamente os mesmos bits de hoje e os resultados
de `race-lap-validation` e de `dirigibilidade` não mudam ([ADR-0004](../adr/ADR-0004-zebra-como-superficie-na-fisica.md)).

Bloco da barreira, por subpasso, na ordem do arquivo dos segmentos, com `S` a posição no início do subpasso
e `E` a posição depois da integração:

1. **Trajeto.** Se o segmento `SE` cruza propriamente o segmento da barreira `AB`, o contato é no ponto de
   cruzamento `Q`, do lado de `S`: `m` é a normal unitária de `AB` apontando para o lado de `S`, a posição
   passa a `Q + m * BARRIER_HALF_WIDTH_M`.
2. **Superfície.** Senão, se a distância de `E` a `AB` é menor que `BARRIER_HALF_WIDTH_M`, com `Q` o ponto mais
   próximo, `m = (E − Q) / |E − Q|` (ou a normal do lado de `S`, se `E` está sobre `AB`) e a posição passa a
   `Q + m * BARRIER_HALF_WIDTH_M`.
3. **Resposta**, idêntica à do muro (`:281-288`) com `n = −m` (apontando para a barreira): `outgoing =
   vx * n.x + vz * n.z`; se `outgoing > 0`, `vx −= outgoing * 1.12 * n.x`, `vz −= outgoing * 1.12 * n.z`,
   `yawRate *= 0.65`, `maneuvers = cancelManeuver(maneuvers)` e `barrierHit = true`; `speed` é recalculada.

## Colaboradores

Chama `classifySurface`, `beyondTrackEdgeM`, `nearestBarrier` e os segmentos de `src/trackGeometry.ts`, e
`nearest` de `src/track.ts` (como hoje). É chamado por `src/lap.ts` (`step`, `trackEdgeDistanceM`), por
`src/trainingSession.ts` (`trackEnvironment`), pela aplicação (`getTrackContact`) e pelos testes. Não chama
`three`, o DOM, `src/audio.ts` nem `src/main.ts`.

## Estado e concorrência

`step` continua uma função do estado de entrada; o único estado novo é `barrierTouching` na telemetria, lido
do passo anterior para que `barrierContact` seja verdadeiro só no passo da entrada em contato (RULE-0001):
enquanto o kart raspa ou fica encostado, `barrierTouching` continua verdadeiro e `barrierContact` falso.
`getTrackContact` é leitura pura: as superfícies de `wheelSurfaces` são as das posições das rodas **no fim do
passo** (as mesmas que o primeiro subpasso do passo seguinte usa para as forças), calculadas pela mesma
fórmula de posição de roda de `integrate` (`:206`); `wheelGripPc` é `1` em `ASPHALT`, `CURB_GRIP_PC` em `CURB`
e `config.grassFriction / config.friction` em `GRASS` (a fração da regra da grama existente);
`simStepCount` é `state.stepCount`, o mesmo contador de `getHandlingTelemetry`. Reler o mesmo estado devolve o
mesmo valor; a aplicação usa `simStepCount` para não tratar um passo duas vezes.

## Comportamento em falha

`getTrackContact` sem estado devolve `{code: 'NO_STATE'}` e nenhum campo (API-0003). `step` mantém o
`RangeError` de `dt` fora de `(0, 0.1]` (`:297`). Um kart em velocidade acima de qualquer alcançável continua
sem atravessar: o passo 1 do bloco da barreira decide pelo trajeto, não pela posição final. Nada é registrado
pela física.

## Determinismo (D-DS-07)

Passo fixo `STEP` com 4 subpassos (`SOLVER_SUBSTEPS`); sem relógio, sem sorteio, sem DOM; os segmentos de
barreira são processados na ordem do arquivo. Provas em `tests/pista-kart-park-surface.test.ts` e
`tests/pista-kart-park-barrier.test.ts`: `tireForce(carga, deslize, fx, rigidez, 'curb', acerto).capacity`
é `0,85` do mesmo com `'asphalt'` para várias cargas e deslizes; um kart posto com as rodas de um lado na zebra
e as outras no asfalto tem `wheelSurfaces` com `CURB` e `ASPHALT` nessas rodas, `curbWheelCount` 2,
`wheelGripPc` 0,85 nelas e `beyondTrackEdgeM` 0; o kart lançado contra a barreira dos dois lados, a 5, 10, 20,
30, 34,5, 60 e 200 m/s e em ângulos de 90 e 30 graus, nunca termina um passo do outro lado; num ambiente todo
de grama com a barreira da Kart Park e noutro todo de grama com o muro (`walls: true`), mesma velocidade,
mesmo ângulo e mesmo `Input`, posição e velocidade no referencial local do obstáculo são iguais (tolerância
1e-9 m e 1e-9 m/s) a cada passo desde o passo com `barrierContact` e com `wallContact`; o ambiente de uma
cópia do arquivo publicado com `barriers` vazio dá, numa sequência semeada de 2.000 passos, `barrierTouching` e
`barrierContact` falsos em todo passo, sem erro; a mesma sequência de
`Input` dá estados `deepEqual` em duas execuções; os testes existentes de `tests/physics.test.ts` e de
`race-lap-validation` passam sem alteração.

## Feature flag

Nenhuma: a zebra e a barreira só existem num ambiente com `track`, que só a Kart Park tem; o caminho da pista
sintética é idêntico (FEAT-0007, Configuração: nenhuma configuração para desligar a zebra ou a barreira).

## Pontos em aberto

Nenhum.
