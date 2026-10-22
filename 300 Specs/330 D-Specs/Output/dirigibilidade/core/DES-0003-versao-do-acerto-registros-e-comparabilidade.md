---
id: DES-0003
title: Versão do acerto, registros de volta e replay e comparabilidade (API-0002)
feature: dirigibilidade
stage: dspec
status: validated
version: 1.1.1
sources: [API-0002, RULE-0003, FLOW-0003, FEAT-0005, FEAT-0006, REQ-FEAT-0005-01, REQ-FEAT-0005-05, REQ-FEAT-0005-06, REQ-FEAT-0005-08, REQ-FEAT-0005-09, REQ-FEAT-0005-10, REQ-FEAT-0006-03]
---

# DES-0003 — Versão do acerto, registros de volta e replay e comparabilidade (API-0002)

## Realiza

O contrato API-0002 campo a campo: `getSetupVersion`, `readReplay` e `compareLapRecords`; a versão nova
distinguível da anterior pela leitura do campo (AC-US-0005-04); nenhuma comparação fora de `COMPARABLE`
decidida aqui e só exibida pela tela (AC-US-0005-05); registros anteriores lidos sem erro com
`RESOLVED_FROM_ABSENCE` (NFR-0009); replay da versão anterior reproduzido passo a passo com o acerto
corrente e tratado como não comparável (REQ-FEAT-0005-10; AC-US-0005-06); o mesmo replay dá o mesmo tempo
(AC-US-0005-01). Regra: RULE-0003. Formatos: [DM-0001](../data/DM-0001-dado-publicado-registros-e-linha-de-base.md).
Decisão: [ADR-0002](../adr/ADR-0002-formato-do-replay-e-registro-de-volta-em-memoria.md).

## Posicionamento

Módulo `src/setupRecords.ts`, camada **Simulação**, **existente** (escrito pela rodada de código 1 segundo
este item; 127 linhas) e mantido sem mudança nesta rodada. Motivo de ser módulo próprio: reproduzir um
replay exige `startLap`/`stepLap` de `src/lap.ts`, e `src/physics.ts` não pode importar a volta (sentido
de dependência); `src/lap.ts` é de `race-lap-validation` e o seu `LapResult` fica intacto. Importa
`src/physics.ts` (`PUBLISHED_SETUPS`, tipos), `src/lap.ts`, `src/lapTiming.ts` (`COUNTDOWN_STEPS`) e tipos
de `src/trackData.ts` (`:3-6`).

## Interface

| Função | Entradas | Saída | Rejeições |
|---|---|---|---|
| `getSetupVersion(setupId)` (`:39-43`) | `setupId: unknown` | `{setupId, setupVersion, previousSetupVersion?}` copiados de `PUBLISHED_SETUPS`, `previousSetupVersion` só quando declarada | `{code: 'UNKNOWN_SETUP'}` para valor fora do enum |
| `resolveSetupRef(partial)` (`:46-51`) | `{setupId?: unknown, setupVersion?: unknown}` | `{setupId, setupVersion, setupVersionSource}`: `setupId` ausente ou inválido → `ARCADE_ASSISTIDO`; `setupVersion` texto não vazio → `DECLARED`; ausente → `previousSetupVersion` do `setupId` (ou a `setupVersion` corrente se não há anterior), `RESOLVED_FROM_ABSENCE` | nenhuma |
| `readReplay(source)` (`:54-76`) | `source: unknown` (objeto, texto JSON de no máximo `MAX_REPLAY_TEXT_CHARS` caracteres, `null`, `undefined`); `inputs` com no máximo `MAX_REPLAY_INPUT_STEPS` elementos | `{replayStatus: 'READABLE', trackId, trackVersion, setupId, setupVersion, setupVersionSource, inputStepCount}` | `{replayStatus: 'UNREADABLE'}` (inclusive texto ou `inputs` acima do teto); `{replayStatus: 'UNSUPPORTED_FORMAT'}` |
| `MAX_REPLAY_TEXT_CHARS` (`:8`) | constante `4_194_304` (caracteres UTF-16 de `source.length`; 4 Mi) | teto do texto aceito por `readReplay`: 36 000 `Input` serializados ocupam cerca de 2,2 M caracteres | — |
| `MAX_REPLAY_INPUT_STEPS` (`:9`) | constante `36_000` (passos de `STEP`; 300 s simulados a 120 Hz) | teto de `inputs.length`: nenhuma volta do desafio chega a 5 min, e `replayLap` aplica um `stepLap` por elemento, logo o teto limita o trabalho da reprodução; distinto de `MAX_LAP_STEPS` 6 000 (teto do piloto de teste, [DES-0004](DES-0004-ensaios-de-dirigibilidade-e-saida.md)) | — |
| `compareLapRecords(a, b)` (`:79-88`) | dois registros com `trackId?`, `trackVersion?`, `setupId?`, `setupVersion?` | `{comparability}` pela tabela de RULE-0003, após `resolveSetupRef` em cada um | `{code: 'INCOMPLETE_RECORD'}` se `trackId` ou `trackVersion` ausente em um deles; nenhuma comparação |
| `buildLapRecord(result, setup)` (`:91-93`) | `result: LapResult` (de `getLapResult`), `setup: SetupRef` | `LapRecord = {...result, setupId, setupVersion}` | nenhuma |
| `buildReplayRecord(lap, inputs, setup)` (`:96-104`) | `lap: LapSession` encerrada, `inputs: readonly Input[]` por passo `RUNNING`, `setup: SetupRef` | `ReplayRecord` versão 1 (DM-0001, seção 3) | nenhuma |
| `replayLap(record, reading, setup, driverMassKg = 75)` (`:107-127`) | `record: ReplayRecord` legível, `reading: TrackReading`, `setup: PublishedSetup` corrente, `driverMassKg` (kg) | `{ok: true, record: LapRecord, comparability}` com `comparability = compareLapRecords(replay, obtido).comparability` | `{ok: false, code}` com `code` de `startLap` (`TRACK_DATA_UNREADABLE`, `TRACK_SCHEMA_UNSUPPORTED`, `OFFICIAL_NOT_AVAILABLE`) ou `NO_RESULT` quando os `Input` acabam antes do fim da volta |

Ordem das verificações de `readReplay`, para resposta determinística: (1) texto → se
`source.length > MAX_REPLAY_TEXT_CHARS`, `UNREADABLE` antes de qualquer análise; senão `JSON.parse` em `try`,
falha é `UNREADABLE`; (2) não objeto, `null` ou `undefined` → `UNREADABLE`; (3) `replayFormatVersion`
presente e não inteiro ≥ 1 → `UNREADABLE`; inteiro > 1 → `UNSUPPORTED_FORMAT` (sem ler mais nada; o objeto
não é alterado); ausente ou 1 → segue; (4) `trackId` texto não vazio e `trackVersion` texto não vazio ou
inteiro ≥ 1, senão `UNREADABLE`; (5) `inputs` é lista (`Array.isArray`) não vazia com
`inputs.length <= MAX_REPLAY_INPUT_STEPS`, senão `UNREADABLE` **antes de ler qualquer elemento**; (6) cada
elemento tem `throttle`, `brake`, `steer` numéricos finitos e `drift` ausente ou booleano, senão
`UNREADABLE`; (7) `resolveSetupRef`; `inputStepCount = inputs.length`. Um registro acima do teto nunca chega
a `replayLap`, que só aceita um registro `READABLE`. A função nunca grava, apaga nem altera `source`: o
registro de formato desconhecido é "mantido intacto" porque só é lido (I4).

`compareLapRecords`: `trackId` e `trackVersion` comparados por igualdade estrita, sem normalização
(`trackVersion` inteiro e texto do mesmo inteiro são diferentes, como `src/lap.ts:102` já trata);
`setupId` e `setupVersion` comparados depois de `resolveSetupRef` em cada lado; decisão na ordem
`TRACK_DIFFERS` → `SETUP_DIFFERS` → `SETUP_VERSION_DIFFERS` → `COMPARABLE` (`:79-88`).

`replayLap`: `startLap(undefined, {lapKind, trackId, trackVersion, challengeNumber?}, reading,
{...setup.config, driverMass: driverMassKg})`; `COUNTDOWN_STEPS` passos com `Input` nulo; um `stepLap` por
`Input` do replay até a fase `ENDED`; o `LapRecord` obtido carrega o `setup` corrente. O tempo obtido é o da
reprodução com o acerto corrente, nunca o gravado: um replay de `arcade-assistido-v4` reproduzido dá
`SETUP_VERSION_DIFFERS` entre o gravado e o obtido, e nenhum chamador o apresenta como equivalente
(REQ-FEAT-0005-10). O contrato de passo não mudou (NFR-0006), por isso a sequência é aplicável.

## Colaboradores

Chama `PUBLISHED_SETUPS` (`src/physics.ts`), `startLap`, `stepLap`, `getLapResult` (`src/lap.ts`),
`COUNTDOWN_STEPS` (`src/lapTiming.ts`). É chamado por `src/main.ts` (resultado, melhor tempo, texto
compartilhado), por `src/handlingMessages.ts` (tipos), por `scripts/handlingBench.ts` (`SETUP_VERSION`:
`readReplay`, `compareLapRecords`, `resolveSetupRef`) e pelos testes.

## Estado e concorrência

- Todas as operações são puras: nenhuma altera `PUBLISHED_SETUPS`, o registro lido ou a sessão. Repetir a
  chamada devolve o mesmo valor (API-0002, Idempotência).
- **Declaração de versão**: ocorre uma vez por entrega, como registro literal em `PUBLISHED_SETUPS`; redeclarar
  o mesmo identificador é o mesmo literal, não uma versão nova; a ordem entre versões é dada por
  `previousSetupVersion`, sem contador (RULE-0003). `tests/dirigibilidade-setup-version.test.ts` afirma que
  os identificadores são únicos e que `setupVersion ≠ previousSetupVersion` para o Arcade.
- **Gravação**: esta feature não grava registro algum (API-0002: a gravação é da feature que a possui). Os
  construtores produzem um registro por volta encerrada, na memória da aplicação; chamar `buildLapRecord` duas
  vezes para o mesmo `LapResult` devolve dois registros iguais e não cria estado.
- Contador de sequência da reprodução: o `stepCount` da `LapSession` (`src/lap.ts`).

## Comportamento em falha

| Situação | Resultado | Registro (apenas identificadores) |
|---|---|---|
| registro ausente, corrompido, fora de forma ou acima do teto (`MAX_REPLAY_TEXT_CHARS`, `MAX_REPLAY_INPUT_STEPS`) | `UNREADABLE`; nenhuma comparação; nada é descartado | `console.warn('replay', 'UNREADABLE')` na aplicação, quando ela o lê |
| `replayFormatVersion` > 1 | `UNSUPPORTED_FORMAT`; intacto | `console.warn('replay', 'UNSUPPORTED_FORMAT', replayFormatVersion)` |
| registro sem `trackId` ou `trackVersion` em `compareLapRecords` | `INCOMPLETE_RECORD`; nenhuma comparação exibida | `console.warn('lap-record', 'INCOMPLETE_RECORD')` |
| `replayLap` com leitura de pista que não bate com o replay | rejeição de `startLap` (`TRACK_DATA_UNREADABLE`) | nenhum |
| `Input` esgotado antes do fim | `NO_RESULT`; nenhum registro obtido | nenhum |

Sem tempo-limite, nova tentativa nem rede: tudo é local. Nenhum conteúdo de registro é registrado em log.

## Observabilidade

`SETUP_VERSION` ([DES-0004](DES-0004-ensaios-de-dirigibilidade-e-saida.md)) reporta `declaredSetupVersion`,
`previousSetupVersion`, `oldRecordsReadCount` e `oldRecordsReadOkCount`; uma regressão de leitura aparece
como contagens diferentes (NFR-0009).

## Determinismo (D-DS-07)

Funções puras sem relógio nem sorteio; a reprodução usa `STEP` por `stepLap`. Provas:
`tests/dirigibilidade-setup-version.test.ts` reproduz o mesmo `ReplayRecord` duas vezes e afirma
`deepEqual` dos `LapRecord` obtidos e dos estados finais; e afirma que reproduzir um replay gravado com
`arcade-assistido-v4` (fixture) com o acerto corrente dá `SETUP_VERSION_DIFFERS`.

## Feature flag

Nenhuma: a declaração de versão é dado publicado; não há configuração para escolher versão, ler ou não ler
registros antigos (FEAT-0005, Configuração). Os campos novos dos registros são opcionais na leitura, com os
padrões neutros de API-0002.

## Pontos em aberto

Nenhum.
