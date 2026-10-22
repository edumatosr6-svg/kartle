---
id: DM-0002
title: Registro de publicação das pistas e estado em memória da sessão de treino e do retorno da zebra
feature: pista-kart-park
stage: dspec
status: validated
version: 1.0.1
sources: [RULE-0005, RULE-0003, RULE-0004, API-0002, FLOW-0003, REQ-FEAT-0002-17, REQ-FEAT-0002-18, REQ-FEAT-0007-13, REQ-FEAT-0001-03, REQ-FEAT-0001-12, REQ-FEAT-0005-18, REQ-FEAT-0006-14]
---

# DM-0002 — Registro de publicação das pistas e estado em memória

## Realiza

O registro de publicação de RULE-0005 e FLOW-0003 (passos 10 e 11): `trackId`, `trackVersion` e o resumo
criptográfico de cada versão publicada, deduplicado e imutável (REQ-FEAT-0002-17, -18), com a promoção a
produção condicionada à decisão sobre a licença Esri (REQ-FEAT-0007-13, REQ-FEAT-0006-14). E o estado que a
sessão de treino (RULE-0003) e o retorno da zebra (RULE-0004) guardam **só na memória da página**, sem nada
gravado no navegador (REQ-FEAT-0001-03, -12; REQ-FEAT-0005-18). Camadas: o registro é dado do preparo offline,
fora do cliente (I2); a sessão é da simulação; o estado do retorno é da aplicação.

## Não há banco

O registro é um arquivo JSON versionado no repositório, `tracks/registry.json`, escrito só pelo programa
`scripts/track-pipeline.ts` ([DES-0011](../pipeline/DES-0011-verificacoes-registro-de-publicacao-e-promocao.md))
e lido por ele e por `npm test`. O cliente não o importa nem o empacota.

## `tracks/registry.json` — formato versão 1

| Campo | Tipo | Unidade | Nulável | Padrão | Restrições e motivo |
|---|---|---|---|---|---|
| `registryVersion` | inteiro | — | não | — | `1`; o programa recusa, sem alterar o arquivo, um registro de versão desconhecida (I3, I4) |
| `entries` | lista de entradas | — | não | `[]` | só acrescida; nenhuma entrada é removida |

Entrada:

| Campo | Tipo | Unidade | Nulável | Padrão | Restrições e motivo |
|---|---|---|---|---|---|
| `trackId` | texto de 1 a 40 caracteres em `[a-z0-9-]` | — | não | — | identifica a pista (I1); só um `trackId` do catálogo do treino com origem em `tracks/sources/`, pela validação de argumentos do programa ([DES-0010](../pipeline/DES-0010-preparo-offline-do-arquivo-da-kart-park.md)) |
| `trackVersion` | inteiro de 1 a 999999 | — | não | — | contador de sequência das versões da pista (RULE-0005); faixa da validação de argumentos de DES-0010 |
| `file` | texto | — | não | — | caminho do arquivo publicado a partir da raiz do repositório, `src/tracks/<trackId>-v<trackVersion>.json` |
| `sha256` | texto, 64 dígitos hexadecimais minúsculos | — | não | — | resumo SHA-256 dos bytes do arquivo no momento da publicação (REQ-FEAT-0002-17) |
| `fileBytes` | inteiro | bytes | não | — | tamanho do arquivo, abaixo de 200.000 (V17) |
| `publicationState` | `STAGING` ou `PRODUCTION` | — | não | — | os estados persistidos de RULE-0005; `PREPARED`, `VERIFIED` e `REJECTED` são saídas de execução do programa e não são gravados |
| `stagedAtUtc` | texto ISO 8601 em UTC | — | não | — | quando a versão foi registrada; identifica a ordem das publicações |
| `promotedAtUtc` | texto ISO 8601 em UTC | — | sim | ausente | presente só com `PRODUCTION` |
| `esriDecisionRef` | texto de 1 a 200 caracteres, sem caractere de controle | — | sim | ausente | obrigatório com `PRODUCTION`: a referência da decisão do dono do produto registrada em `DOMAIN.md` (identificador e data da decisão) que libera a promoção (REQ-FEAT-0007-13); o valor de `--esri-decision` validado por DES-0010 |
| `prep` | objeto | — | não | — | evidência do preparo, abaixo |

`prep` (evidência registrada das escolhas do preparo, [ADR-0006](../adr/ADR-0006-lacunas-do-f-spec-resolvidas-no-projeto.md)):

| Campo | Tipo | Unidade | Restrições |
|---|---|---|---|
| `originFile` | texto | — | `tracks/sources/kart-park.json` |
| `originSha256` | texto hexadecimal | — | resumo do arquivo de origem: `52c5adda4ce89bd23a00e04a10d7e12a28900dd4d56414f444e0a4795f2c5302` para a Kart Park |
| `smoothingIterations` | inteiro ≥ 0 | iterações | o número de iterações escolhido pelo preparo |
| `maxSmoothingOffsetM` | número | m | maior distância entre um ponto gerado e o ponto correspondente da origem |
| `lapLengthM` | número | m | comprimento da volta da `centerline` gravada |
| `originOffsetM` | `{xM, zM}` | m | deslocamento aplicado às coordenadas da origem (centro da caixa envolvente) |
| `curbWidthsM` | lista de números | m | largura gravada de cada trecho de `curbs`, na ordem do arquivo |
| `reducedCurbs` | lista de `{curbIndex, widthM, grassClearanceM}` | —, m, m | trechos cuja largura ficou abaixo de 1,0 m pela folga de grama, com a folga que a limitou |

Unicidade: no máximo uma entrada por (`trackId`, `trackVersion`). Índices: não há; o programa e o teste leem a
lista inteira (poucas entradas). Chaves estrangeiras: `file` aponta para um arquivo que existe no repositório
(verificado em `npm test`).

Segunda chegada (idempotência, D-DS-03): publicar de novo o mesmo arquivo com o mesmo (`trackId`,
`trackVersion`) encontra a entrada com o mesmo `sha256` e não muda nada; publicar conteúdo diferente com um
par já registrado é recusado, sem alterar o registro. Promover de novo uma entrada já `PRODUCTION` não muda
nada. A escrita é atômica: o programa escreve num arquivo temporário na mesma pasta e o renomeia sobre o
registro, de modo que uma falha no meio deixa o registro anterior intacto.

## Estado em memória — sessão de treino ([DES-0005](../core/DES-0005-sessao-de-treino-catalogo-e-selecao-de-pista.md))

| Campo | Tipo | Significado |
|---|---|---|
| `sessionState` | `NO_SESSION`, `LOADING`, `READY`, `FAILED` | estado de RULE-0003 |
| `selectedTrackId` | `kart-park` ou `synthetic` | pista do último pedido de seleção; `kart-park` na abertura |
| `reading` | `TrackReading` | leitura do dado da pista da sessão, com `READY` ou `FAILED` |
| `environment` | `Environment` | ambiente da simulação da sessão `READY`: `trackEnvironment(geometria)` na versão 3, `CIRCUIT` na versão 2 |
| `startKart` | `State` | o kart parado na `startPosition` da pista da sessão `READY` |

A volta (`LapSession` de `race-lap-validation`) é guardada ao lado da sessão pela aplicação, como hoje, e só
substituída pelo valor que `selectTrainingTrack` e os comandos da volta devolvem.

## Estado em memória — retorno da zebra ([DES-0009](../web/DES-0009-retorno-da-zebra-vibracao-e-som.md))

| Campo | Tipo | Unidade | Significado |
|---|---|---|---|
| `lastHandledStep` | inteiro ou ausente | passos | o último `simStepCount` tratado; chave de deduplicação |
| `lastPulseStep` | inteiro ou ausente | passos | passo em que começou o último pulso de vibração |
| `lastSoundStep` | inteiro ou ausente | passos | passo em que começou a última repetição do som |

Zerado (os três ausentes) a cada volta iniciada e a cada sessão nova, porque o `simStepCount` recomeça em 0
com o kart de cada volta (RULE-0004: "uma sessão nova começa sem início registrado").

## Plano de migração

| Item | Conteúdo |
|---|---|
| Revisão | criação de `tracks/registry.json`, `registryVersion` 1, com a entrada da Kart Park `trackVersion` 1 em `STAGING` |
| O que faz | passa a existir o registro; nenhum arquivo existente muda |
| Reversão (passos executáveis) | 1. `git revert` do commit que criou o registro (junto com o do arquivo publicado). 2. `npm test` na árvore revertida. O registro não é lido pelo cliente, então nenhum artefato publicado depende dele |
| Teste da reversão | a árvore revertida passa em `npm test`; o artefato de staging construído dela não contém `kart-park` |

Uma versão futura do formato do registro sobe `registryVersion` e o programa passa a ler a anterior; o
registro nunca é reescrito no lugar para mudar de formato.

## Preenchimento retroativo

Nenhum: não há publicação anterior de pista real. A pista sintética não é registrada: ela não é preparada
offline e o seu arquivo é literal em `src/track.ts` desde `race-lap-validation`.

## Janela de compatibilidade

Não se aplica ao cliente, que não lê o registro. Entre o commit do arquivo publicado e o do registro não há
estado intermediário publicável: a etapa de código entrega os dois no mesmo commit, e `npm test` reprova uma
árvore com arquivo publicado sem entrada (ou com entrada sem arquivo).

## Retenção e privacidade

O registro guarda identificadores de pista, resumos, tamanhos, instantes UTC de publicação e promoção, a
referência textual de uma decisão de produto e os parâmetros do preparo. Nenhum nome de pessoa, e-mail,
identificador de jogador, credencial nem conteúdo de jogador (I6, D-DS-04): quem publica não é registrado. As
entradas ficam para sempre (histórico de versões, I3). O estado em memória da sessão e do retorno some com a
página; nada é gravado em `localStorage`, `sessionStorage` nem IndexedDB.
