---
id: DES-0006
title: Leitura e verificação do dado de pista
feature: race-lap-validation
stage: dspec
status: validated
version: 1.1.0
sources: [FEAT-0002, FEAT-0008, REQ-FEAT-0002-13, REQ-FEAT-0008-01, REQ-FEAT-0008-02, REQ-FEAT-0008-03, REQ-FEAT-0008-05, REQ-FEAT-0008-08, REQ-FEAT-0008-09, REQ-FEAT-0008-10, REQ-FEAT-0008-11, REQ-FEAT-0008-12, REQ-FEAT-0008-13, REQ-FEAT-0008-14]
---

# DES-0006 — Leitura e verificação do dado de pista

## Realiza

Os `REQ-*` em `sources`: largada, sentido, chegada, limites dos quatro setores e marcadores vêm do dado da pista e
não de constantes do jogo (AC-US-0002-10); setores e marcadores são conjuntos distintos; dado completo, incompleto,
de esquema desconhecido e ilegível (AC-US-0008-03 a -05); forma anterior lida sem erro; versão de esquema maior que a
anterior (NFR-0012). Contrato: API-0003. Esquema: [DM-0001](../data/DM-0001-arquivo-de-pista-versao-2.md).

## Posicionamento

- Módulo novo `src/trackData.ts`, camada **dado de pista** (não importa nenhuma outra camada; importa só
  `src/track.ts`). Motivo de ser novo: `src/track.ts` guarda a geometria e as primitivas de linha; ler e classificar
  um arquivo versionado é uma responsabilidade própria e testável por `npm test` sem DOM nem WebGL.
- `src/track.ts` (alterado): acrescenta o tipo `Line`, as primitivas `sideOf` e `crossLine`
  ([DES-0003](DES-0003-cruzamentos-marcadores-setores-e-chegada.md)) e a constante `SYNTHETIC_TRACK_FILE`, o arquivo
  da seção "Dado da pista sintética atual" de DM-0001, em literais. `track`, `WIDTH` e `nearest` ficam
  como estão. `LapTracker` (validação preliminar por portões) deixa de ser importado pelo jogo
  ([DES-0007](../web/DES-0007-integracao-da-aplicacao.md)) e continua exportado, sem alteração de código, só para
  `scripts/keyboard-lap.ts` (`bench:handling`) e para o teste existente de `tests/physics.test.ts`, de modo que a
  saída do benchmark permaneça idêntica (NFR-0011).

## Interface

| Símbolo | Assinatura | Descrição |
|---|---|---|
| `TRACK_SCHEMA_VERSION` | `2` nesta feature (DM-0001) | maior versão de esquema que o leitor conhece. Exportada para que toda prova se refira à constante e nunca a um literal de versão: uma feature que acrescente uma versão de esquema sobe a constante junto com o seu leitor (D-DS-02) sem reprovar as provas desta (FB-01 de `pista-kart-park`) |
| `DEFAULT_CUT_DISTANCE_M`, `DEFAULT_CUT_DURATION_MS` | `3`, `1000` | padrões neutros de `DEC-01` |
| `BARRIER_REACH_M` | `WIDTH / 2 + 9` | alcance mínimo das linhas de barreira (DM-0001, C6) |
| `readTrackData(source)` | `(string \| object \| null \| undefined) => TrackReading` | classifica e devolve os campos válidos |
| `checkConsistency(declared)` | `(DeclaredTrack) => string[]` | lista os identificadores C1 a C7 reprovados; vazia significa consistente |

`TrackReading` tem a forma plana de API-0003: o campo `trackDataStatus` e os campos do arquivo no mesmo nível, sem
aninhamento. A união é: `{trackDataStatus: 'COMPLETE', trackId, trackVersion, ...}` com `direction`, `startPosition`
e as linhas presentes; `{trackDataStatus: 'INCOMPLETE', trackId, trackVersion, ...}` com apenas o que o arquivo
declara de forma válida; `{trackDataStatus: 'UNSUPPORTED_SCHEMA', schemaVersion}`; `{trackDataStatus: 'UNREADABLE'}`. A tabela de classificação
(ordem 1 a 7) está em DM-0001; `readTrackData` a segue literalmente.

Quando `source` é texto, `readTrackData` o analisa com `JSON.parse` dentro de `try`; falha é `UNREADABLE`. A
função nunca altera o objeto recebido (copia os valores que devolve) e nunca grava nem apaga nada: o arquivo de
esquema desconhecido é "mantido intacto" porque a função só o lê, e a aplicação não o reescreve.

A oferta de volta (`offeredLapKinds`, [DES-0005](DES-0005-tipos-de-volta-e-reposicionamento.md)) e a rejeição
em `startLap` ([DES-0001](DES-0001-ciclo-da-volta-e-comandos.md)) consomem o `TrackReading`.

## Colaboradores

Chama `track`, `WIDTH`, `nearest` e `crossLine` de `src/track.ts`. É chamado por `src/main.ts` (uma vez, na
inicialização, sobre `SYNTHETIC_TRACK_FILE`) e pelos testes. Nenhuma camada externa é importada.

## Estado e concorrência

Sem estado: leitura pura; ler duas vezes o mesmo arquivo dá o mesmo `trackDataStatus`. Resolve `trackId` e
`trackVersion` do que leu, sem usar data, relógio nem nome de pista como chave (REQ-FEAT-0008-15; I1). Uma pista
publicada nunca é editada no lugar: qualquer mudança do dado é nova `trackVersion` e novo literal em
`src/track.ts`, mantendo o anterior (REQ-FEAT-0008-12).

## Comportamento em falha

| Situação | Resultado | Registro (apenas identificadores) |
|---|---|---|
| texto que não é JSON, entrada ausente, objeto sem forma | `UNREADABLE` | `console.warn('track-data', 'UNREADABLE')` na aplicação |
| `schemaVersion` maior que `TRACK_SCHEMA_VERSION` | `UNSUPPORTED_SCHEMA`; arquivo intacto; nenhuma volta | `console.warn('track-data', 'UNSUPPORTED_SCHEMA', schemaVersion)` |
| campo declarado fora de forma, ou reprovado em C1 a C7 | `INCOMPLETE`; só treino | `console.warn('track-data', 'INCOMPLETE', trackId, trackVersion, ids reprovados)` |

Nada do conteúdo do arquivo além de `trackId`, `trackVersion`, `schemaVersion` e os identificadores C1 a C7 é
registrado. Sem tempo-limite, nova tentativa nem rede: o dado está empacotado (D-DS-03 não se aplica; ver
01-architecture).

## Determinismo (D-DS-07)

Função pura, sem relógio, sem sorteio, sem DOM; o resultado depende só do arquivo e da geometria constante. Provas
em `tests/track-data.test.ts`: o arquivo sintético é `COMPLETE`, passa em C1 a C7 e declara `schemaVersion` igual a
`TRACK_SCHEMA_VERSION`, maior que a versão da forma anterior (NFR-0012); um arquivo na forma anterior
(`tests/fixtures/track-v1.json`) é `INCOMPLETE` sem erro (NFR-0012); um arquivo derivado do sintético com
`schemaVersion` igual a `TRACK_SCHEMA_VERSION + 1` é `UNSUPPORTED_SCHEMA`, devolvido com essa `schemaVersion`, e o
objeto de entrada fica idêntico (congelado antes, comparado depois) (NFR-0012); texto corrompido é `UNREADABLE`; cada
verificação C1 a C7 tem um arquivo derivado do sintético que a reprova e vira `INCOMPLETE`; só um limite de corte
declarado usa o padrão do outro; a leitura repetida é igual. **Nenhuma prova afirma um literal de versão de
esquema**: a versão declarada e a versão posterior são derivadas da constante exportada por `src/trackData.ts`, de
modo que subir a versão do esquema em outra feature (com o seu leitor) não reprova estas verificações (FB-01 de
`pista-kart-park`, aceito na rodada de 2026-10-22).

## Feature flag

Nenhuma: FEAT-0008 não tem chave. Os campos novos do arquivo são aditivos e os de corte têm padrão neutro.

## Pontos em aberto

Nenhum.
