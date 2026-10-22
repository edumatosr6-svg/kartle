---
id: DES-0007
title: Integração da aplicação — escolha do acerto publicado e adaptadores de controle
feature: dirigibilidade
stage: dspec
status: validated
version: 1.0.2
sources: [FLOW-0001, FEAT-0001, FEAT-0003, FEAT-0005, FEAT-0006, REQ-FEAT-0001-07, REQ-FEAT-0003-10, REQ-FEAT-0005-05, REQ-FEAT-0005-09, REQ-FEAT-0006-01, REQ-FEAT-0006-03, NFR-0003, NFR-0005]
---

# DES-0007 — Integração da aplicação — escolha do acerto publicado e adaptadores de controle

## Realiza

Os `REQ-*` em `sources`: a aplicação pilota com o acerto corrente do dado publicado e nunca com a versão
anterior (REQ-FEAT-0005-05, -09); os adaptadores entregam só o `Input` normalizado, saturado na faixa,
binário no teclado e no toque e proporcional na inclinação, sem regra de pilotagem (REQ-FEAT-0001-07,
REQ-FEAT-0003-10, REQ-FEAT-0006-01; NFR-0003, NFR-0005); `Input` e o passo inalterados (REQ-FEAT-0006-03).
Fluxo: FLOW-0001. O Jogador nunca pilota na pista de teste: nenhum adaptador nem tela a alcança.

## Posicionamento

`src/main.ts`, camada **Aplicação** (os adaptadores de controle continuam dentro dele, como o mapa de
camadas registra), alterado (a rodada de código 1 não o tocou: as linhas citadas são as de hoje). Nenhum
módulo novo.

## Interface

| Trecho atual de `src/main.ts` | Mudança |
|---|---|
| `:2` import | passa a importar `PUBLISHED_SETUPS`, `getHandlingTelemetry` e os tipos `PublishedSetup`/`SetupRef` de `./physics`; `KART_PRESETS` e `ARCADE_KART` saem do import (continuam exportados e intactos em `src/physics.ts`) |
| `:120` `wheelPositions(ARCADE_KART)` | `wheelPositions(setup.config)`: geometria idêntica (entre-eixos e bitola não mudam) |
| `:154` `let config = { ...ARCADE_KART }` | `let setup: PublishedSetup = PUBLISHED_SETUPS.ARCADE_ASSISTIDO; let config = { ...setup.config, driverMass: 75 }` |
| `:229-239` seletor `#handling-preset` | os valores `arcade` e `rental` do `<select>` (`index.html:38`) são mapeados para `ARCADE_ASSISTIDO` e `REALISTA_ALUGUEL_4T`; `setup = PUBLISHED_SETUPS[setupId]`; `config = {...setup.config, driverMass: config.driverMass}`; os textos existentes não mudam; não existe opção para a versão anterior nem para preset experimental: durante o ciclo de acerto em staging (`DOMAIN/DEC-10`, FEAT-0005 Configuração) o `<select>` continua com os dois valores de hoje e o Arcade é sempre a `setupVersion` corrente de `PUBLISHED_SETUPS` |
| `:208-218` `beginLap` | `startLap(lap, request, reading, config)` como hoje; o `setupRef = {setupId: setup.setupId, setupVersion: setup.setupVersion}` da volta é fixado no mesmo ponto e usado pelo HUD ([DES-0005](DES-0005-hud-velocidade-e-aderencia.md)) e pelo registro ([DES-0006](DES-0006-resultado-melhor-tempo-e-texto-compartilhado.md)) até a volta encerrar; os controles de peso e acerto já ficam desabilitados durante a volta (`:449-450`), de modo que `setup` e `config` da volta nunca divergem |
| `:372-379` teclado e toque | inalterados: esterço `−1`, `0` ou `1` e acelerador `0` ou `1` por `Number(...)`; é a entrada binária de NFR-0003 |
| `:277-285` inclinação | inalterada: `tiltSteer = clamp(delta / 25, −1, 1)` (`:284`) já satura na faixa; é a entrada proporcional; sem sensor ou sem permissão o toque assume, com o estado visível de `race-lap-validation` (`:454-457`) |
| `:380-390` laço de passos | inalterado: `stepLap(lap, input)` com o `Input` amostrado uma vez por quadro |

Saturação (I4): o adaptador de inclinação satura em `:284`; a simulação satura de novo em
`src/physics.ts:116` (condição de forçar), `:182` (esterço) e `:189-190` (acelerador e freio), de modo que
um `Input` fora da faixa entregue por qualquer adaptador vale o saturado e os limites valem para esse valor
(REQ-FEAT-0001-07). Nenhuma regra de pilotagem é decidida aqui: `forcing`, `handling`, a classe do passo,
superfície e parede só existem em `src/physics.ts`.

## Colaboradores

Chama `PUBLISHED_SETUPS`, `getHandlingTelemetry` (`src/physics.ts`), `startLap`, `stepLap` (`src/lap.ts`) e
os itens de apresentação [DES-0005](DES-0005-hud-velocidade-e-aderencia.md) e
[DES-0006](DES-0006-resultado-melhor-tempo-e-texto-compartilhado.md). Não é chamado por nenhum módulo.

## Estado e concorrência

Estado local: `setup`, `config`, `setupRef` da volta. `setup` só muda com volta ausente ou encerrada
(controles desabilitados durante a volta); `config` é copiado e congelado por `startLap` (`src/lap.ts:120`),
então uma mudança de acerto vale para a volta seguinte (texto existente "vale na próxima volta"). Idempotência:
escolher o mesmo acerto duas vezes atribui o mesmo registro congelado. Nada é persistido.

## Comportamento em falha

Valor do `<select>` fora do mapa: ignorado, como hoje (`:231`). Sensor negado: toque, estado visível
(existente). Sem rede, sem tempo-limite, sem escrita.

## Observabilidade

`tests/dirigibilidade-contract.test.ts` afirma que `src/main.ts` não importa `KART_PRESETS` nem
`ARCADE_KART` e lê `PUBLISHED_SETUPS` (texto do módulo, como `tests/race-lap-validation-layering.test.ts`
faz), e que não importa `testPadLane`, `testPadArc` nem `classifyHandlingSteps`.

## Determinismo (D-DS-07)

Não é código de simulação; o tempo de parede só decide quantos passos rodam num quadro (`advanceClock`, de
`race-lap-validation`). Provas: as de [DES-0001](../core/DES-0001-acerto-arcade-assistido-v5-e-assistencias.md).

## Feature flag

Nenhuma: a escolha do acerto já existe (`#handling-preset`) e passa a apontar para o dado publicado; não há
chave para a versão anterior (FEAT-0005, Configuração;
[ADR-0001](../adr/ADR-0001-versao-do-acerto-como-registro-novo-no-codigo.md)).

## Pontos em aberto

Nenhum.
