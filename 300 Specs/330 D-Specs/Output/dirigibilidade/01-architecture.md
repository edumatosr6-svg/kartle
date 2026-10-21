---
title: Arquitetura — dirigibilidade do Arcade assistido
feature: dirigibilidade
stage: dspec
status: validated
version: 1.0.1
sources: []
---

# Arquitetura

Este conjunto projeta como cada `REQ-*` do F-Spec validado de `dirigibilidade` (2.0.0, contra o seed
`revision: 2`, acerto agressivo de `DOMAIN/REF-02`; FEAT-0001 a FEAT-0006, API-0001 a API-0003, RULE-0001 a
RULE-0003, SCR-0001, SCR-0002, FLOW-0001 a FLOW-0003) é realizado sobre o código em execução. Os caminhos são relativos à raiz do repositório (diretriz do estágio: o código vive em
`src/`, `tests/`, `scripts/`; `400 Code/Source/` está vazio). O produto é um cliente de navegador sem
servidor, sem conta e sem banco: não existem as pastas `backend/` e `mobile/` deste estágio. Os itens da
simulação ficam em `core/`, os de apresentação em `web/` (o mesmo cliente serve `web-desktop` e
`web-mobile`) e as garantias de privacidade em `security/`.

## Contexto primário (I1)

O contexto primário continua sendo o desafio diário e a pista: todo registro desta feature (replay,
resultado gravado, texto compartilhado) é chaveado em `trackId` + `trackVersion` e, quando o desafio o
informa, em `challengeNumber`, exatamente como o resultado de `race-lap-validation`. A versão do acerto
(`setupId`, `setupVersion`) é um **atributo** do registro, usado só para decidir comparabilidade
([RULE-0003](../../../320%20F-Specs/Output/dirigibilidade/rules/RULE-0003-versao-do-acerto-e-comparabilidade.md));
nenhuma chave, regra ou resultado usa a data, o relógio do aparelho ou o nome do acerto como contexto
primário. O tempo é contado em passos de `STEP`, nunca em tempo de parede.

## Posicionamento por camada (I2)

| Camada | Módulo | Situação | Conteúdo desta feature |
|---|---|---|---|
| Dado de pista | `src/track.ts`, `src/trackData.ts` | inalterados | a pista sintética e o seu leitor não mudam (NFR-0008); a curva de referência é localizada pelo ensaio a partir de `track` |
| Simulação | `src/physics.ts` | alterado | preset novo `ARCADE_ASSISTIDO_V5`, parâmetros opcionais de assistência lidos só no ramo `drivingAssists`, dado publicado `PUBLISHED_SETUPS`, `SOLVER_SUBSTEPS`, campos de telemetria por passo (`forcing`, `surface`, `wallContact`, `assistActive`, `stepCount`) e a leitura `getHandlingTelemetry` (API-0001). `ARCADE_KART`, `RENTAL_KART`, `KART_PRESETS`, `STEP`, `Input`, `step` e a linha 3 ficam como estão |
| Simulação | `src/maneuvers.ts` | inalterado | a manobra de drift de `requirements/11` não muda |
| Simulação | `src/lap.ts`, `src/lapTiming.ts` | inalterados | ciclo da volta, validade e cronometragem não mudam (NFR-0008); `getLapResult` mantém exatamente os campos de hoje |
| Simulação | `src/setupRecords.ts` | novo | leitores e construtores dos registros: `getSetupVersion`, `readReplay`, `compareLapRecords`, `buildLapRecord`, `buildReplayRecord`, `replayLap` (API-0002, RULE-0003) |
| Simulação (lugar na árvore: `scripts/`) | `scripts/handlingBench.ts` | novo | biblioteca dos ensaios de RULE-0002: um registro de API-0003 por ensaio, leitura da linha de base, serialização; usada por `npm test` e pelos benches |
| Aplicação (programa de bench em Node; lugar na árvore: `scripts/`) | `scripts/keyboard-lap.ts`, `scripts/physics-bench.ts` | alterados | pontos de entrada de `bench:handling` e `bench:physics`, que passam a emitir os registros de API-0003; único lugar que lê o relógio de parede (`new Date()` para `measuredAtUtc` nos dois; `node:perf_hooks` para `STEP_COST` e `node:os` para `runtimeId()` só em `scripts/keyboard-lap.ts`) |
| Adaptadores de controle | em `src/main.ts` | inalterados | teclado binário, inclinação proporcional e toque continuam entregando `Input` saturado na faixa; nenhuma regra |
| Aplicação | `src/main.ts` | alterado | escolhe o acerto pelo dado publicado, lê o HUD por `getHandlingTelemetry`, constrói o registro da volta, compara só o comparável, compartilha o texto |
| Aplicação | `src/handlingMessages.ts` | novo | texto compartilhado e rótulo do botão de compartilhar, puros e testáveis sem DOM |
| Aplicação | `index.html` | alterado | linha da `setupVersion` e botão de compartilhar na tela de resultado |

Por que módulos novos (I10): `src/setupRecords.ts` importa `src/lap.ts` (para reproduzir um replay) e
`src/physics.ts`; colocá-lo em `src/physics.ts` faria o modelo do veículo importar a volta, invertendo o
sentido de dependência de `src/lap.ts` → `src/physics.ts`. `scripts/handlingBench.ts` existe porque os ensaios
precisam rodar em `npm test` **e** nos benches com o mesmo código, e `scripts/keyboard-lap.ts` é um
programa, não uma biblioteca. `src/handlingMessages.ts` existe porque `src/main.ts` importa Three.js e o DOM
e não carrega em `npm test`, e `src/lapMessages.ts` (de `race-lap-validation`) só pode importar tipos de
`./lap` (verificado por `tests/race-lap-validation-layering.test.ts`). Dividir `src/main.ts` não faz parte
desta feature.

Sentido das dependências (permitido): `setupRecords.ts` importa `physics.ts`, `lap.ts`, `lapTiming.ts`,
`trackData.ts`; `handlingBench.ts` importa `physics.ts`, `lap.ts`, `lapTiming.ts`, `track.ts`,
`trackData.ts`, `setupRecords.ts` e `node:fs` (ler `docs/physics.md`) — **nunca** `node:perf_hooks`,
`node:os`, `Date` ou `performance`; `scripts/keyboard-lap.ts` e `scripts/physics-bench.ts` (programas de
bench, camada Aplicação, que só alteram a simulação por `step`/`stepLap`) importam `handlingBench.ts` e são os únicos a importar `node:perf_hooks`
(custo por passo) e `node:os` (`runtimeId()`) e a ler `new Date()` (`measuredAtUtc`), entregando esses
valores à biblioteca como argumentos; `handlingMessages.ts` importa `lapMessages.ts` e tipos de
`setupRecords.ts`; `main.ts` importa tudo isso. Nenhum módulo de simulação importa `three`, o DOM,
`src/audio.ts` ou `src/main.ts`, nem lê `Date`, `performance.now` ou `Math.random`; o teste de camada de
`race-lap-validation` continua valendo para os módulos que lista e `tests/dirigibilidade-contract.test.ts`
o estende a `src/setupRecords.ts` e `scripts/handlingBench.ts`
([DES-0004](core/DES-0004-ensaios-de-dirigibilidade-e-saida.md)).

## A restrição que molda o projeto: o acerto anterior fica intacto

`tests/race-lap-validation-frozen.test.ts:48-50` afirma, campo a campo, os valores de `ARCADE_KART`, e
`:53-57` que `KART_PRESETS.arcade === ARCADE_KART`; `tests/race-lap-validation-contract.test.ts:35-41`
afirma que `getLapResult` devolve exatamente os campos de hoje. O F-Spec exige que o conjunto de
`race-lap-validation` continue 100 % aprovado (REQ-FEAT-0006-07) e que a versão anterior do acerto nunca
seja editada no lugar (REQ-FEAT-0005-09). As duas exigências se realizam juntas por
[ADR-0001](adr/ADR-0001-versao-do-acerto-como-registro-novo-no-codigo.md): o novo acerto é um **registro
novo** (`ARCADE_ASSISTIDO_V5`) e `ARCADE_KART` permanece em código como o registro da versão anterior
(`previousSetupVersion`); o resultado gravado é um registro próprio (`LapRecord`) que envolve o
`LapResult` sem alterá-lo ([ADR-0002](adr/ADR-0002-formato-do-replay-e-registro-de-volta-em-memoria.md)).
Nenhum feedback à feature `race-lap-validation` é necessário.

## Fluxo alterado

```mermaid
sequenceDiagram
    participant J as Jogador
    participant M as main.ts (aplicacao e adaptadores)
    participant L as lap.ts (volta, inalterado)
    participant P as physics.ts (acerto v5 e telemetria)
    participant R as setupRecords.ts (registros)
    M->>P: PUBLISHED_SETUPS[setupId] -> setup corrente
    J->>M: escolhe o tipo de volta
    M->>L: startLap(lap, pedido, leitura, setup.config com driverMass)
    loop cada passo de STEP em RUNNING
        M->>L: stepLap(lap, Input saturado)
        L->>P: step(kart, Input, STEP, config, CIRCUIT)
        P->>P: forcing, assistencias do ramo drivingAssists, handling, surface, wallContact
    end
    loop cada quadro
        M->>P: getHandlingTelemetry(lap.kart, setup)
        P-->>M: speedMps, handling, ...
        M-->>J: km/h e texto de aderencia no HUD
    end
    L-->>M: fase ENDED, LapResult
    M->>R: buildLapRecord(result, setup) -> LapRecord com setupId e setupVersion
    M->>R: compareLapRecords(melhor, atual)
    R-->>M: comparability
    M-->>J: resultado com setupVersion; melhor tempo so se COMPARABLE; texto compartilhado
```

Os ensaios ([FLOW-0002](../../../320%20F-Specs/Output/dirigibilidade/flows/FLOW-0002-ensaio-deterministico-e-piloto-de-teste.md))
seguem o mesmo caminho a partir de `step`/`stepLap`, sem `main.ts`, com `scripts/handlingBench.ts` no lugar
da aplicação; a leitura de replay ([FLOW-0003](../../../320%20F-Specs/Output/dirigibilidade/flows/FLOW-0003-leitura-de-replay-e-comparacao.md))
é `readReplay` → `getSetupVersion` → `compareLapRecords`, e a reprodução opcional é `replayLap`, que chama
`startLap`/`stepLap` com o acerto corrente.

## Dependências externas

Nenhuma. Não há rede, biblioteca nova, serviço nem armazenamento: o dado publicado é literal em
`src/physics.ts`, os registros vivem na memória da página e nos fixtures, e a linha de base está em
`docs/physics.md`. Não há tempo-limite, política de nova tentativa nem chave de idempotência de rede a
declarar (D-DS-03); a idempotência é a de leituras puras e de funções sobre estado imutável (cada DES nomeia
a sua). A Web Share API é usada pela aplicação quando o navegador a oferece, com recuo para a área de
transferência; a sua falha não altera nenhum registro.

## Estratégia de compatibilidade

| Contrato | Tratamento |
|---|---|
| Presets e `KART_PRESETS` | intactos; o novo acerto é um registro novo; a aplicação passa a ler `PUBLISHED_SETUPS` |
| `LapResult` de `race-lap-validation` | intacto; `LapRecord` = `LapResult` + `setupId` + `setupVersion`, construído por esta feature |
| Replay | formato novo, versão 1 ([DM-0001](data/DM-0001-dado-publicado-registros-e-linha-de-base.md)); a forma anterior à feature (sem `setupVersion`) é lida com `RESOLVED_FROM_ABSENCE`; versão maior é `UNSUPPORTED_FORMAT`, intacta |
| `STEP`, solver de 480 Hz, `Input` | inalterados; `SOLVER_SUBSTEPS` só nomeia o valor que a linha `src/physics.ts:234` já usa |
| Dado de pista | inalterado (`schemaVersion` 2, `trackVersion` 2) |
| Saída dos benches existentes | os campos que `scripts/physics-bench.ts` já imprime continuam; os registros de API-0003 são acrescentados |

## Rastros de decisão

| ADR | Decisão |
|---|---|
| [ADR-0001](adr/ADR-0001-versao-do-acerto-como-registro-novo-no-codigo.md) | a nova versão do acerto é um registro novo em código; a anterior fica intacta; não há chave mestra |
| [ADR-0002](adr/ADR-0002-formato-do-replay-e-registro-de-volta-em-memoria.md) | formato do replay versão 1 e registro de volta que envolve o `LapResult`, sem persistência |
| [ADR-0003](adr/ADR-0003-linha-de-base-legivel-por-maquina-em-docs-physics.md) | linha de base legível por máquina dentro de `docs/physics.md`; identidade de máquina e runtime sem dado pessoal |
| [ADR-0004](adr/ADR-0004-ensaios-como-biblioteca-e-parametros-de-ensaio.md) | ensaios como biblioteca em `scripts/` compartilhada por `npm test` e pelos benches; parâmetros de ensaio fixados |
