---
id: API-0003
title: Contrato do dado de pista com largada, sentido, setores e marcadores
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.1
sources: [NFR-0012, US-0002, US-0004, US-0006, US-0008, AC-US-0002-10, AC-US-0002-13, AC-US-0004-05, AC-US-0004-06, AC-US-0006-04, AC-US-0008-03]
---

# API-0003 — Contrato do dado de pista com largada, sentido, setores e marcadores

Contrato do arquivo de pista que o Curador do catálogo fornece e que a simulação lê, o mesmo para
`web-desktop` e `web-mobile`. É dado versionado (I3, I5), não um endpoint: não há caminho HTTP nem prefixo no
MVP. Nomes em `camelCase` plano com unidade no sufixo (D-FS-06): `M` para metros, `Ms` para milissegundos.
Os itens já existentes do dado da pista (a geometria e a borda da pista) são referenciados pelo nome e não
são redefinidos aqui.

## Operações

| Operação | Propósito |
|---|---|
| `readTrackData` | Lê o arquivo de pista e devolve o `trackDataStatus` ([RULE-0005](../rules/RULE-0005-tipos-de-volta-e-reposicionamento.md)) e, quando utilizável, os campos abaixo |

## Auth

Sem sessão. Papel permitido: `player` (anônimo) lê o dado já empacotado com o jogo. O Curador do catálogo não
usa este contrato em tempo de execução; ele produz o arquivo (etapa 3, fora do escopo). Leitura pública no
cliente porque o dado de pista não é segredo.

## Campos do arquivo de pista (adições desta feature)

| Campo | Tipo | Unidade | Obrigatório | Padrão e restrições |
|---|---|---|---|---|
| `schemaVersion` | inteiro | — | sim | maior que a versão de esquema anterior (NFR-0012) |
| `trackId` | texto | — | sim | identifica a pista |
| `trackVersion` | texto ou inteiro, como o dado declara | — | sim | nunca editada no lugar depois de publicada (I3) |
| `direction` | enum `CLOCKWISE`, `COUNTER_CLOCKWISE` | — | sim para dado `COMPLETE` | ausente: dado `INCOMPLETE` |
| `startPosition` | ponto `{xM, zM}` e `headingDeg` | m e graus | sim para `COMPLETE` | ausente: `INCOMPLETE`. Posicionada de modo que a primeira passagem pela chegada no sentido da pista só ocorra ao completar o percurso |
| `finishLine` | linha | m | sim para `COMPLETE` | ausente: `INCOMPLETE` |
| `sectorLimits` | lista de exatamente 3 linhas, em ordem | m | sim para `COMPLETE` | ausente ou com outro tamanho: `INCOMPLETE`. Os 3 limites mais a chegada definem os 4 setores; o setor 1 começa no sinal verde |
| `markers` | lista de 1 ou mais linhas, em ordem | m | sim para `COMPLETE` | ausente ou vazia: `INCOMPLETE`. Conjunto distinto de `sectorLimits` (AC-US-0004-05) |
| `cutDistanceM` | número | m | não | padrão 3. Neutro: na ausência, o comportamento é o da decisão `DOMAIN/DEC-01`; um arquivo anterior não tem o campo. Maior que 0 |
| `cutDurationMs` | inteiro | ms | não | padrão 1000. Neutro pelo mesmo motivo. Maior que 0 |

Uma linha é um segmento com dois pontos `{fromXM, fromZM}` e `{toXM, toZM}`, em metros. O cruzamento no
sentido da pista é o que vai do lado direito ao lado esquerdo do vetor do primeiro ao segundo ponto, visto
de cima; o inverso é a contramão. A orientação das linhas é consistente com `direction`; a inconsistência
torna o dado `INCOMPLETE` ([FEAT-0008](../features/FEAT-0008-dado-de-pista-versionado.md)). Os valores
estruturados do contrato são o ponto `{xM, zM}` com `headingDeg` de `startPosition`, a linha (`finishLine` e cada item de
`sectorLimits` e `markers`) e as listas de linhas; todos os demais campos são planos.

Os marcadores são declarados de modo que passar por todos eles em ordem, no sentido da pista, implique
atravessar os três limites de setor e a chegada. Dado cujos marcadores não garantem isso é tratado como
`INCOMPLETE`.

A pista sintética atual declara os seus próprios `sectorLimits` e `markers` (AC-US-0002-13, AC-US-0004-06).

## Resposta de `readTrackData`

| Campo | Tipo | Obrigatório | Restrições |
|---|---|---|---|
| `trackDataStatus` | enum `COMPLETE`, `INCOMPLETE`, `UNSUPPORTED_SCHEMA`, `UNREADABLE` | sim | sempre presente |
| campos do arquivo | conforme a tabela | só com `COMPLETE` ou `INCOMPLETE` | com `INCOMPLETE`, apenas o que o arquivo declara |

Sem dado de pista carregado, a operação retorna `UNREADABLE` e nenhum outro campo.

## Erros

| Código | Condição | Efeito |
|---|---|---|
| `UNREADABLE` | arquivo ausente, corrompido ou ilegível | nenhuma volta; erro exibido ([SCR-0001](../screens/SCR-0001-corrida-hud-da-volta.md)); `startLap` retorna `TRACK_DATA_UNREADABLE` |
| `UNSUPPORTED_SCHEMA` | `schemaVersion` desconhecida | o arquivo é mantido intacto e reportado, não é usado para volta; `startLap` retorna `TRACK_SCHEMA_UNSUPPORTED` (I3, I4) |

## Idempotência

Leitura sem efeito: ler duas vezes o mesmo arquivo dá o mesmo `trackDataStatus`. A leitura nunca altera nem
descarta o arquivo.

## Paginação e sondagem

Não se aplica.

## Compatibilidade

| Mudança | Tratamento |
|---|---|
| Campos novos: `direction`, `startPosition`, `finishLine`, `sectorLimits`, `markers`, `cutDistanceM`, `cutDurationMs` | Mudança versionada: `schemaVersion` maior que a anterior; os campos de corte são opcionais e aditivos (NFR-0012; I3, I5) |
| Arquivo na versão anterior de esquema | Lido sem erro em 100% dos casos; como não declara setores nem marcadores, é `INCOMPLETE`: só treino, sem volta oficial. Não é descartado nem alterado (I4, I5) |
| Arquivo com versão de esquema posterior à conhecida | `UNSUPPORTED_SCHEMA` |
| Campo existente renomeado, removido ou com significado ou unidade alterados | Nenhum nesta feature. Os campos existentes (geometria, borda) mantêm nome, unidade e significado; as adições ocupam nomes novos |
| Mudança nos dados de uma pista publicada | Nova `trackVersion`; a publicada nunca é editada no lugar (I3) |

A verificação do NFR-0012 é a saída de `npm test` lendo um arquivo na forma anterior e um arquivo gerado
com a versão de esquema declarada.
