---
id: DES-0001
title: Leitura do dado de pista em esquema 3
feature: pista-kart-park
stage: dspec
status: validated
version: 1.0.0
sources: [API-0001, FEAT-0002, FEAT-0003, REQ-FEAT-0002-02, REQ-FEAT-0002-12, REQ-FEAT-0002-15, REQ-FEAT-0002-16, REQ-FEAT-0001-14, REQ-FEAT-0003-08, REQ-FEAT-0003-13]
---

# DES-0001 — Leitura do dado de pista em esquema 3

## Realiza

Os `REQ-*` em `sources`: `readTrackData` passa a aceitar `schemaVersion` 3 e devolve, além dos campos de
`race-lap-validation`, `centerline`, `curbs`, `barriers` e `osmDerived` com os padrões de API-0001
(REQ-FEAT-0002-02); a simulação recebe a linha central e as larguras exatamente como declaradas, sem
suavizar, reamostrar nem converter (REQ-FEAT-0002-12); a versão 2 é lida como antes (REQ-FEAT-0002-15); uma
versão 3 sem linha central utilizável é `UNREADABLE` e fica intacta (REQ-FEAT-0002-16), o que leva a sessão a
`FAILED` (REQ-FEAT-0001-14); as linhas da volta da Kart Park chegam à volta como na pista sintética, de modo
que `MISSED_MARKER` e `VALID` saem das regras de `race-lap-validation` sem mudança (REQ-FEAT-0003-08, -13).
Contrato: API-0001. Esquema e classificação: [DM-0001](../data/DM-0001-arquivo-de-pista-versao-de-esquema-3.md).

## Posicionamento

`src/trackData.ts`, camada **dado de pista**, alterado. Importa `src/track.ts` (como hoje) e
`src/trackGeometry.ts` ([DES-0002](DES-0002-geometria-da-pista-declarada-no-arquivo.md)), da mesma camada.
Nenhum módulo novo: a classificação de um arquivo versionado já mora aqui.

## Interface

| Símbolo | Assinatura | Mudança |
|---|---|---|
| `TRACK_SCHEMA_VERSION` | `3` | era `2` (`src/trackData.ts:5`); continua sendo "maior versão que o leitor conhece" |
| `TrackPoint`, `CurbSpan`, `BarrierLine` | tipos reexportados de `src/trackGeometry.ts`: `{xM, zM, widthM}` (m), `{side: 'LEFT' \| 'RIGHT', fromLapM, toLapM, widthM}` (m), `{points: {xM, zM}[]}` (m) | novos |
| `Schema3Fields` | `{centerline: TrackPoint[]; curbs: CurbSpan[]; barriers: BarrierLine[]; osmDerived: boolean}` | novo |
| `TrackReading` | `COMPLETE` e `INCOMPLETE` passam a ser `{trackDataStatus, trackId, trackVersion} & (campos de linha) & Partial<Schema3Fields>`; `UNSUPPORTED_SCHEMA` e `UNREADABLE` inalterados | aditivo: os quatro campos só existem numa leitura de versão 3 e estão sempre os quatro juntos |
| `readTrackData(source)` | `(string \| object \| null \| undefined) => TrackReading` | segue a tabela de classificação de DM-0001 (ordens 1 a 9) literalmente |
| `checkConsistency(declared)` | `(DeclaredTrack) => string[]` | **inalterada**: C1 a C7 sobre a pista sintética, usada pela versão 2 e pelos testes de `race-lap-validation` |
| `checkConsistencyV3(declared, geometry)` | `(DeclaredTrack, TrackGeometry) => string[]` | nova: C1 a C7 v3 de DM-0001 sobre a geometria do arquivo; devolve os identificadores reprovados (`C1` a `C7`), vazia quando consistente |

Na versão 3, `readTrackData` valida `centerline` (ordem 6), `curbs`, `barriers` e `osmDerived` (ordem 7),
constrói `buildTrackGeometry(centerline, curbs, barriers)` só para a consistência e devolve os campos
copiados (novos objetos; o `source` nunca é alterado). A restrição `toLapM <= lapLengthM + 0,001` usa o
comprimento da volta calculado pela geometria. A ordem 8 aplica `checkConsistencyV3` na versão 3 e
`checkConsistency` na versão 2. Nada da leitura de versão 2 muda: o mesmo caminho de código, os mesmos
campos devolvidos, os mesmos módulos de geometria sintética (`src/trackData.ts:103-135`).

## Colaboradores

Chama `buildTrackGeometry`, `classifySurface`, `nearestOnCenterline` de `src/trackGeometry.ts` e `crossLine`,
`sideOf` de `src/track.ts`. É chamado por `selectTrainingTrack` ([DES-0005](DES-0005-sessao-de-treino-catalogo-e-selecao-de-pista.md)),
por `scripts/trackChecks.ts` ([DES-0011](../pipeline/DES-0011-verificacoes-registro-de-publicacao-e-promocao.md)) e
pelos testes. Não chama nenhuma camada externa.

## Estado e concorrência

Sem estado: leitura pura. Ler duas vezes o mesmo arquivo dá a mesma resposta (API-0001, idempotência). A
leitura não grava, não apaga e não reescreve nada: o arquivo de esquema desconhecido ou ilegível fica
intacto porque a função só o lê.

## Comportamento em falha

| Situação | Resultado | Registro (só identificadores, pela aplicação) |
|---|---|---|
| texto que não é JSON, entrada ausente, objeto sem forma | `UNREADABLE` | `console.warn('track-data', 'UNREADABLE')` |
| versão 3 com `centerline` ausente, curta, com ponto não finito ou largura não positiva; `curbs`, `barriers` ou `osmDerived` fora das restrições | `UNREADABLE`; arquivo intacto | `console.warn('track-data', 'UNREADABLE')` |
| `schemaVersion` maior que 3 | `UNSUPPORTED_SCHEMA`; arquivo intacto | `console.warn('track-data', 'UNSUPPORTED_SCHEMA', schemaVersion)` |
| linha da volta ausente ou inconsistente (C1 a C7 v3) | `INCOMPLETE`; só treino | `console.warn('track-data', 'INCOMPLETE', trackId, trackVersion)` |

Nada do conteúdo do arquivo além de `trackId`, `trackVersion` e `schemaVersion` é registrado (I6). Sem rede,
tempo-limite ou nova tentativa: o arquivo vem empacotado.

## Determinismo (D-DS-07)

Função pura: sem relógio, sem sorteio, sem DOM; o resultado depende só do arquivo. A geometria usada na
consistência é construída por aritmética de ponto flutuante em ordem fixa. Prova em
`tests/pista-kart-park-track-data.test.ts`: o arquivo publicado da Kart Park é `COMPLETE` e
`checkConsistencyV3` dá lista vazia; `centerline` lido é igual, ponto a ponto e campo a campo (`===`), ao do
arquivo (REQ-FEAT-0002-12); a leitura repetida é igual (`deepEqual`); `SYNTHETIC_TRACK_FILE` continua
`COMPLETE` com o mesmo resultado de antes; cópias da Kart Park sem `centerline`, com 2 pontos, com um `widthM`
0, com `curbs` de `side` inválido, com barreira de 1 ponto e com `osmDerived` texto são `UNREADABLE` e ficam
idênticas ao objeto de entrada (congelado antes, comparado depois); `schemaVersion` 4 é `UNSUPPORTED_SCHEMA`.

## Feature flag

Nenhuma: a versão 3 é aditiva no leitor (FEAT-0002, Configuração: nenhuma), os campos opcionais têm padrão
neutro e a versão 2 segue o caminho de antes.

## Pontos em aberto

Nenhum.
