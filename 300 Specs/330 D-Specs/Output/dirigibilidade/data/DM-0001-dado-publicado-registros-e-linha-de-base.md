---
id: DM-0001
title: Dado publicado do acerto, registros de volta e replay, saída dos ensaios e linha de base
feature: dirigibilidade
stage: dspec
status: validated
version: 1.0.1
sources: [API-0002, API-0003, RULE-0003, FEAT-0005, FEAT-0006, REQ-FEAT-0005-05, REQ-FEAT-0005-08, REQ-FEAT-0005-09, REQ-FEAT-0006-08, NFR-0004, NFR-0009]
---

# DM-0001 — Dado publicado do acerto, registros de volta e replay, saída dos ensaios e linha de base

Não há banco de dados nem armazenamento no navegador nesta feature (`race-lap-validation` proíbe gravação
local, `tests/race-lap-validation-layering.test.ts:43-49`). Os "esquemas" desta feature são quatro formas de
dado versionado (I3, I5): o dado publicado com o jogo (literal em código), o registro de volta e o replay
(dados simples, em memória e em fixtures), a saída dos ensaios (linhas JSON) e a linha de base em
`docs/physics.md`. Nenhum campo carrega dado pessoal (I6). Unidades no nome de todo campo numérico (D-FS-06).

## 1. Dado publicado — `PUBLISHED_SETUPS` (`src/physics.ts`)

Um registro por `setupId`, congelado (`Object.freeze`), literal em código.

| Campo | Tipo | Unidade | Nulo | Padrão | Restrições |
|---|---|---|---|---|---|
| `setupId` | `'ARCADE_ASSISTIDO' \| 'REALISTA_ALUGUEL_4T'` | — | não | — | chave única |
| `setupVersion` | texto não vazio | — | não | — | única entre todas as versões declaradas; diferente de `previousSetupVersion` |
| `previousSetupVersion` | texto não vazio | — | sim | ausente | presente só quando houve versão anterior declarada |
| `config` | `Readonly<KartConfig>` | campos com unidade em [DES-0001](../core/DES-0001-acerto-arcade-assistido-v5-e-assistencias.md) | não | — | o preset da versão corrente |
| `previousConfig` | `Readonly<KartConfig>` | idem | sim | ausente | o preset da versão anterior, intacto; presente se e só se `previousSetupVersion` presente |

Valores publicados por esta feature:

| `setupId` | `setupVersion` | `previousSetupVersion` | `config` | `previousConfig` |
|---|---|---|---|---|
| `ARCADE_ASSISTIDO` | `arcade-assistido-v5` | `arcade-assistido-v4` | `ARCADE_ASSISTIDO_V5` (novo) | `ARCADE_KART` (intacto, `src/physics.ts:50-57`) |
| `REALISTA_ALUGUEL_4T` | `realista-aluguel-4t-v4` | ausente | `RENTAL_KART` (intacto, `src/physics.ts:38-48`) | ausente |

`arcade-assistido-v4` nomeia o conteúdo que `ARCADE_KART` já tem (o acerto Arcade entregue com
`PHYSICS_VERSION` `rental-4t-v4`); `realista-aluguel-4t-v4` nomeia o conteúdo inalterado de `RENTAL_KART`,
que nunca teve versão declarada antes (API-0002: ausência de `previousSetupVersion` é neutra). A versão de
física `PHYSICS_VERSION` (`src/physics.ts:7`) não muda e não é versão de acerto.

Rodadas do ciclo em staging (RULE-0003 1.1.0, `DOMAIN/DEC-10`): cada rodada de presets que altera um
parâmetro do Arcade declara nova `setupVersion` (`arcade-assistido-v6`, e assim por diante), com
`previousSetupVersion` apontando para a rodada anterior, cujo literal passa a `previousConfig`; o
identificador da rodada reprovada nunca é reutilizado nem editado, e `PUBLISHED_SETUPS` continua com um
único registro por `setupId` (corrente e anterior), sem registro experimental.

Índices e unicidade: `setupId` é a chave do registro; `setupVersion` e `previousSetupVersion` são únicos no
conjunto de todas as versões declaradas (verificado por `tests/dirigibilidade-setup-version.test.ts`).

## 2. Registro de volta — `LapRecord` (`src/setupRecords.ts`)

O `LapResult` de `race-lap-validation` (`src/lap.ts:48-58`) acrescido dos campos de API-0002. Só esta
feature constrói o registro (`buildLapRecord`); `getLapResult` continua devolvendo exatamente os campos de
hoje ([ADR-0002](../adr/ADR-0002-formato-do-replay-e-registro-de-volta-em-memoria.md)).

| Campo | Tipo | Unidade | Nulo na leitura | Nulo na gravação | Padrão na leitura |
|---|---|---|---|---|---|
| `trackId`, `trackVersion`, `lapKind`, `lapValidity`, `official`, `challengeNumber?`, `invalidReason?`, `lapMs?`, `sectorMs?` | como em `LapResult` | ms nos tempos | como hoje | como hoje | como hoje |
| `setupId` | enum | — | sim (registro antigo) | não | `ARCADE_ASSISTIDO` |
| `setupVersion` | texto | — | sim (registro antigo) | não | `previousSetupVersion` do `setupId` resolvido; se o `setupId` não tem versão anterior declarada, a sua `setupVersion` corrente |

## 3. Replay — `ReplayRecord` versão 1 (`src/setupRecords.ts`)

| Campo | Tipo | Unidade | Nulo na leitura | Nulo na gravação | Padrão na leitura |
|---|---|---|---|---|---|
| `replayFormatVersion` | inteiro ≥ 1 | — | sim | não (1) | ausente lê-se como 1 (a forma anterior à feature); maior que 1 é `UNSUPPORTED_FORMAT` |
| `trackId` | texto não vazio | — | não | não | ausente é `UNREADABLE` |
| `trackVersion` | texto não vazio ou inteiro ≥ 1 | — | não | não | ausente é `UNREADABLE` |
| `challengeNumber` | inteiro ≥ 1 | — | sim | sim | ausente |
| `lapKind` | `'OFFICIAL' \| 'RECON' \| 'TRAINING'` | — | sim | não | `TRAINING` |
| `setupId` | enum | — | sim (registro antigo) | não | `ARCADE_ASSISTIDO` |
| `setupVersion` | texto | — | sim (registro antigo) | não | como em `LapRecord` |
| `inputs` | lista de `Input` por passo `RUNNING`, do sinal verde ao fim; no máximo `MAX_REPLAY_INPUT_STEPS` (36 000) elementos | um por passo de `STEP` | não | não | lista vazia, acima do teto ou elemento fora de forma é `UNREADABLE` |

Teto do registro serializado: um texto JSON com mais de `MAX_REPLAY_TEXT_CHARS` (4 194 304) caracteres é
`UNREADABLE` antes de ser analisado ([DES-0003](../core/DES-0003-versao-do-acerto-registros-e-comparabilidade.md)).

`Input` por passo: `{throttle: 0..1, brake: 0..1, steer: -1..1, drift?: boolean}` — o conjunto, a faixa e o
significado de `src/physics.ts:8`, inalterados (NFR-0006). Os passos da contagem não são gravados: a
reprodução aplica `Input` nulo na contagem.

## 4. Saída dos ensaios — registro de API-0003

Uma linha JSON por registro (`JSON.stringify`), um registro por `benchId` e por variante (`inputMode`,
`throttleCondition`, lado do esterço). Os campos são exatamente os de API-0003, com os tipos e unidades de
lá: nenhum campo é acrescentado ao registro. Os parâmetros de ensaio que API-0003 não lista (posição de
entrada da curva, janela da curva, velocidade do ensaio de recuperação, parâmetros do piloto de teste)
saem em uma linha de parâmetros separada, prefixada por `#` e também JSON, e vão para `docs/physics.md`
([ADR-0004](../adr/ADR-0004-ensaios-como-biblioteca-e-parametros-de-ensaio.md)). Em `npm test` cada
registro é impresso como diagnóstico do teste (`t.diagnostic(JSON.stringify(record))`), de modo que a
saída de `npm test` o contém.

## 5. Linha de base — bloco em `docs/physics.md`

Um único bloco cercado ` ```json handling-baseline ` dentro de `docs/physics.md`, ao lado da entrada datada
em prosa que NFR-0004 exige (os dois registram o mesmo dado; a prosa é para pessoas, o bloco para o ensaio).

| Campo | Tipo | Unidade | Nulo | Restrições |
|---|---|---|---|---|
| `entries` | lista de entradas | — | não | pode ser vazia |
| `entries[].setupId` | enum | — | não | |
| `entries[].setupVersion` | texto | — | não | a versão medida (`arcade-assistido-v4` para a linha de base do Arcade) |
| `entries[].measuredAtUtc` | texto ISO 8601 UTC | — | não | data da medição; nunca entra em medição |
| `entries[].runtimeId` | texto | — | sim | presente só quando a entrada traz `STEP_COST`; forma em [ADR-0003](../adr/ADR-0003-linha-de-base-legivel-por-maquina-em-docs-physics.md), sem nome de máquina nem de usuário |
| `entries[].records` | lista de registros de API-0003 | — | não | os mesmos campos da seção 4 |

Resolução: a linha de base de `UNDERSTEER_ONSET` do Arcade é o `v1Mps` do registro `UNDERSTEER_ONSET` da
entrada com `setupId` `ARCADE_ASSISTIDO` e `setupVersion` igual a `previousSetupVersion`; a de `STEP_COST` é
o `meanStepCostUs` da entrada com a mesma `setupVersion` anterior e o mesmo `runtimeId` da execução; a do
Realista é a entrada com `setupId` `REALISTA_ALUGUEL_4T` e `setupVersion` `realista-aluguel-4t-v4`. Entrada
ausente é `baselineAvailable` falso e, onde a linha de base é exigida, `FAIL` com `BASELINE_MISSING`.

## Plano de migração

Não há revisão de esquema de banco. As mudanças são de leitor versionado (D-DS-02):

| Passo | O que faz | Reversão (downgrade) |
|---|---|---|
| M1 | Declara `PUBLISHED_SETUPS` com a versão nova e a anterior | remover a declaração; `ARCADE_KART` e `RENTAL_KART` continuam intactos, nada a desfazer |
| M2 | Introduz `LapRecord` e `ReplayRecord` versão 1, com `setupId` e `setupVersion` opcionais na leitura | remover os leitores; nenhum registro foi persistido por esta feature, nada a reverter |
| M3 | Acrescenta o bloco `handling-baseline` a `docs/physics.md` | apagar o bloco; a prosa permanece |

Cada passo é executável como um commit e revertível como o seu `git revert`.

## Backfill

Nenhum: não há registro persistido a preencher. Um registro antigo (sem `setupVersion`) é resolvido na
leitura, a cada leitura, sem ser reescrito (idempotente por construção).

## Janela de compatibilidade

Código antigo e novo coexistem sem janela: os campos novos são opcionais na leitura e a forma anterior do
replay (sem `replayFormatVersion` e sem `setupVersion`) é lida sem erro para sempre, com
`RESOLVED_FROM_ABSENCE`. Um replay de versão de formato maior que 1 é devolvido como `UNSUPPORTED_FORMAT`
sem ser alterado nem descartado (I4). Como nada é persistido por esta feature, não há dado antigo em
navegador algum a migrar; a compatibilidade é provada com fixtures (`tests/fixtures/records.ts`).

## Retenção e privacidade

| Dado | Onde vive | Por quanto tempo | O que nunca contém |
|---|---|---|---|
| `PUBLISHED_SETUPS` | código empacotado | a vida do build | nada além de parâmetros físicos e identificadores de versão |
| `LapRecord`, `ReplayRecord` | memória da página (`main.ts`), fixtures de teste | até recarregar a página | nome, apelido, aparelho, data, relógio, posição geográfica |
| saída dos ensaios | stdout do desenvolvedor; `docs/physics.md` (prosa e bloco) | o repositório | nome de máquina, usuário, caminho de arquivo |
| texto compartilhado | passado à Web Share API ou à área de transferência pelo gesto do Jogador | não retido pela aplicação | comparação entre versões; dado pessoal |
