---
id: DES-0001
title: Ciclo da volta, comandos e consultas
feature: race-lap-validation
stage: dspec
status: validated
version: 1.0.0
sources: [FEAT-0001, FEAT-0002, FEAT-0003, FEAT-0004, FEAT-0008, FEAT-0009, REQ-FEAT-0001-04, REQ-FEAT-0001-06, REQ-FEAT-0001-07, REQ-FEAT-0001-11, REQ-FEAT-0001-12, REQ-FEAT-0002-11, REQ-FEAT-0002-12, REQ-FEAT-0002-15, REQ-FEAT-0003-08, REQ-FEAT-0003-09, REQ-FEAT-0003-10, REQ-FEAT-0003-12, REQ-FEAT-0003-13, REQ-FEAT-0003-14, REQ-FEAT-0004-14, REQ-FEAT-0008-15, REQ-FEAT-0009-01, REQ-FEAT-0009-12]
---

# DES-0001 — Ciclo da volta, comandos e consultas

## Realiza

Os `REQ-*` em `sources`, em particular: a contagem e o início do cronômetro no sinal verde (AC-US-0001-01,
-04, -05, -06, -07, -08), o resultado único por volta (AC-US-0002-12), a pausa e a retomada (AC-US-0003-05 a
-10), o estado e o resultado de API-0001 e os comandos de API-0002. É o item que mantém a máquina de estados de
RULE-0002 e a deduplicação de eventos (REQ-FEAT-0009-12).

## Posicionamento

Módulo novo `src/lap.ts`, camada **simulação**. Motivo de ser novo: `src/physics.ts` é o modelo do veículo e
deve permanecer inalterado (NFR-0010, NFR-0011); as regras de volta usam `step` sem reabri-lo
([ADR-0002](../adr/ADR-0002-volta-como-modulo-sobre-step-inalterado.md)). O tipo `LapSession` está em
[DM-0002](../data/DM-0002-estado-da-volta-em-memoria.md).

## Interface

Funções puras sobre `LapSession` imutável: cada comando ou passo devolve uma nova sessão e nunca altera a
anterior. Rejeições são valores, não exceções (API-0002).

| Função | Entradas | Saída | Rejeições |
|---|---|---|---|
| `startLap(current, request, reading, config, environment = CIRCUIT)` | `current: LapSession`, ausente ou encerrada; `request: {lapKind, trackId, trackVersion, challengeNumber?}`; `reading: TrackReading`; `config: KartConfig` | `{ok: true, lap}` em `COUNTDOWN`, ou `{ok: false, code}` | `LAP_ALREADY_ACTIVE`, `TRACK_DATA_UNREADABLE`, `TRACK_SCHEMA_UNSUPPORTED`, `OFFICIAL_NOT_AVAILABLE` |
| `pauseLap(lap, cause)` | `cause`: `ESC_KEY`, `FOCUS_LOST`, `SENSOR_LOST` | `{ok: true, lap}` em `PAUSED` com `resumePhase` | `NO_ACTIVE_LAP`, `LAP_ENDED`, `ALREADY_PAUSED` |
| `resumeLap(lap)` | — | `{ok: true, lap}` na fase em `resumePhase` | `NO_ACTIVE_LAP`, `LAP_ENDED`, `NOT_PAUSED` |
| `repositionKart(lap)` | — | `{ok: true, lap}` (efeito em [DES-0005](DES-0005-tipos-de-volta-e-reposicionamento.md)) | `NO_ACTIVE_LAP`, `LAP_ENDED`, `NOT_RUNNING` |
| `stepLap(lap, input)` | `input: Input` normalizado, inalterado | nova `LapSession`; a própria `lap` em `PAUSED` e `ENDED` | nenhuma |
| `getLapState(lap)` | `LapSession` ou ausente | `LapStateView` com os campos de API-0001, ou `{code: 'NO_ACTIVE_LAP'}` | — |
| `getLapResult(lap)` | `LapSession` ou ausente | `LapResult`, ou `{code: 'NO_RESULT'}` | — |

Ordem das verificações de `startLap`, para que a resposta seja determinística: (1) volta em `COUNTDOWN`,
`RUNNING` ou `PAUSED` em `current`: `LAP_ALREADY_ACTIVE`; (2) `reading` `UNREADABLE`:
`TRACK_DATA_UNREADABLE`; (3) `reading` `UNSUPPORTED_SCHEMA`: `TRACK_SCHEMA_UNSUPPORTED`; (4) `request.trackId` ou
`request.trackVersion` diferentes dos da leitura: `TRACK_DATA_UNREADABLE` (o dado nomeado não é o dado lido; não
se cria código novo); (5) `OFFICIAL` com leitura `INCOMPLETE`: `OFFICIAL_NOT_AVAILABLE`. Em qualquer rejeição a
sessão anterior fica como estava. `trackId` e `trackVersion` da sessão vêm da leitura (REQ-FEAT-0008-15).

Posição inicial: com leitura que traz `startPosition`, o `kart` inicial é `initialState()` com `x` = `xM`, `z` = `zM`
e `heading` = `headingDeg * Math.PI / 180`; sem ela (dado `INCOMPLETE` sem largada válida), é `initialState()`
como hoje. Velocidade 0 e a mesma largada em toda volta (REQ-FEAT-0001-06).

Ordem das verificações de `pauseLap`, `resumeLap` e `repositionKart`: ausente, depois `ENDED`, depois a
condição própria do comando.

`stepLap` por fase:

| Fase | Efeito de um passo |
|---|---|
| `COUNTDOWN` | `countdownSteps` + 1; o `kart` não é integrado: fica na posição de largada com velocidade 0 e qualquer `Input` é ignorado. Ao chegar a 360 passos (3000 ms exatos) a fase passa a `RUNNING` com `stepCount` 0: é o sinal verde. Não há penalidade nem motivo de invalidação por `Input` anterior ao sinal verde |
| `RUNNING` | chama `step(kart, input, STEP, config, environment)` e, com o deslocamento resultante, avalia marcadores, limites de setor e chegada ([DES-0003](DES-0003-cruzamentos-marcadores-setores-e-chegada.md)), depois o corte ([DES-0004](DES-0004-corte-e-grama.md)); `stepCount` + 1 |
| `PAUSED`, `ENDED` | devolve a própria sessão: nenhum passo avança nenhum contador |

A aceleração mantida desde a contagem tem efeito normal a partir do primeiro passo `RUNNING`, porque o `step` da
física só passa a ser chamado nele e o acelerador sobe pela taxa normal (REQ-FEAT-0001-11).

## Colaboradores

Chama: `step`, `CIRCUIT`, `STEP`, `initialState` (`src/physics.ts`); `TrackReading` e as linhas
(`src/trackData.ts`, `src/track.ts`); `toMs`, `COUNTDOWN_STEPS` e `interpolateMs` (`src/lapTiming.ts`).
É chamado por `src/main.ts` (aplicação) e pelos testes. Nenhuma importação de `three`, DOM, `src/audio.ts` ou
`src/main.ts`.

## Estado e concorrência

- A fonte única é a `LapSession`; a apresentação só lê (`getLapState`), nunca altera (I2).
- **Chave de deduplicação**: a própria volta ativa e a fase (API-0002: não há identificador de pedido). Um
  comando repetido encontra a fase já mudada e é rejeitado sem efeito: `pauseLap` com `PAUSED` dá
  `ALREADY_PAUSED`, `resumeLap` sem pausa dá `NOT_PAUSED`, `startLap` com volta ativa dá `LAP_ALREADY_ACTIVE`,
  qualquer comando em `ENDED` dá `LAP_ENDED`. A deduplicação ocorre na simulação, seja qual for a origem do
  evento (Esc, foco da aba, sensor). Uma perda de foco e uma perda do sensor ao mesmo tempo viram uma única
  pausa: o segundo `pauseLap` retorna `ALREADY_PAUSED` e não troca `resumePhase` nem `pauseCause`.
- **Restrição de unicidade do resultado**: `result` é criado uma única vez, na transição para `ENDED`; como `ENDED`
  devolve a mesma sessão, um segundo cruzamento da chegada, um novo marcador, uma saída de pista ou um
  reposicionamento não produzem segundo resultado nem o alteram.
- **Contador de sequência**: `stepCount` só avança em `RUNNING`; `countdownSteps` só em `COUNTDOWN`. Toda transição
  de validade registra o `stepCount` em que ocorreu. Eventos atrasados ou fora de ordem (um comando que chega
  depois de `ENDED`; um marcador atravessado antes do anterior) não têm efeito.
- Eventos externos chegam entre dois passos (laço de eventos de página única): comando e passo nunca se
  intercalam. Um comando é aplicado antes do próximo passo, o que equivale a "o próximo passo que roda" de RULE-0002.
- **Recarregar ou abandonar**: a sessão existe só na memória; o resultado só nasce em `ENDED`. Uma página
  recarregada durante a contagem, a volta ou a pausa não tem resultado (REQ-FEAT-0001-14, -0002-16).

## Comportamento em falha

- Nenhuma função lança por entrada de rede ou de dado: o dado de pista inválido é classificado antes
  ([DES-0006](DES-0006-leitura-do-dado-de-pista.md)). Um `Input` fora da faixa é limitado pela física existente
  (I4); um `Input` não numérico é responsabilidade do adaptador, que entrega números.
- Falha de dependência: não há. Pausa por perda de foco ou de sensor é a "falha" prevista e é só um comando.
- Escrita parcial: não existe; a sessão é substituída por inteiro a cada passo.
- Log: nenhum para rejeições (são fluxo normal de eventos duplicados). Um erro inesperado de programação sobe
  como exceção ao navegador sem conteúdo de jogador.

## Determinismo (D-DS-07)

Passo fixo `STEP`; nenhuma leitura de `Date`, `performance.now` nem `Math.random`; nenhum acesso ao DOM. Mesma
sessão inicial, mesma configuração e mesma sequência de `Input` e de comandos entre passos dão o mesmo estado e o
mesmo resultado. Prova: `tests/lap-determinism.test.ts` executa duas voltas completas com a mesma sequência,
compara os resultados com `deepEqual` e repete com uma pausa no meio; `tests/lap-layering.test.ts` proíbe os
símbolos acima nos módulos da simulação.

## Feature flag

Nenhuma. FEAT-0001, FEAT-0003 e FEAT-0009 não têm chave: o comportamento vale ligado (Configuração: "Nenhuma"). A
feature não acrescenta ajuste de jogo, de ambiente nem de teste (política 10).

## Pontos em aberto

Nenhum.
