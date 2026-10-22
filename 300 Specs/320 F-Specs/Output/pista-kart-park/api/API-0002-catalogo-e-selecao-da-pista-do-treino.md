---
id: API-0002
title: Contrato do catálogo e da seleção da pista do treino
feature: pista-kart-park
stage: fspec
status: validated
version: 1.0.1
sources: [US-0001, US-0006, NFR-0004, NFR-0005, AC-US-0001-01, AC-US-0001-02, AC-US-0001-03, AC-US-0001-04, AC-US-0001-05, AC-US-0001-06, AC-US-0001-07, AC-US-0006-01, AC-US-0006-07, AC-US-0006-08]
---

# API-0002 — Contrato do catálogo e da seleção da pista do treino

Contrato único, para `web-desktop` e `web-mobile`, entre a tela inicial e a simulação: quais pistas o
seletor oferece, como cada uma é apresentada e o que a escolha de uma pista faz. É contrato em processo,
dentro do navegador: não há endpoint de rede, caminho HTTP nem prefixo no MVP (diretrizes do estágio).
Nomes em `camelCase` plano com a unidade no sufixo (D-FS-06). Os comandos e o estado da volta
(`startLap`, `getLapState`, `lapKind`, `NO_ACTIVE_LAP`) são de `race-lap-validation`, nomeados e não
redefinidos.

## Operações

| Operação | Propósito | Quem chama |
|---|---|---|
| `getTrainingTrackOptions` | Lê o catálogo do treino e a pista da sessão corrente | Tela inicial, ao ser exibida e depois de cada seleção ([SCR-0001](../screens/SCR-0001-tela-inicial-com-seletor-de-pista.md)); tela de resultado, para saber se a pista da volta tem crédito ([SCR-0002](../screens/SCR-0002-credito-na-tela-de-resultado.md)) |
| `selectTrainingTrack` | Carrega a pista escolhida numa sessão de treino nova: lê o dado da pista, põe o kart na largada, sem volta em andamento | A abertura do jogo, com `kart-park`; a tela inicial, quando o Jogador escolhe uma opção |

## Auth

Sem sessão de usuário e sem conta (RNF10). Papel permitido: `player` (anônimo), único papel do produto.
Contrato público dentro do cliente: o catálogo não é segredo, e a seleção só muda o estado local da
simulação, sem dado pessoal (I6).

## Catálogo do treino

Dado fixo do jogo, entregue com os seus arquivos; duas entradas.

| Campo | Tipo | Unidade | Obrigatório | Kart Park | Pista sintética |
|---|---|---|---|---|---|
| `trackId` | texto | — | sim | `kart-park` | `synthetic` |
| `displayName` | texto | — | sim | "Kart Park — São José dos Pinhais (traçado aproximado)" | "Pista sintética" |
| `displayLengthM` | inteiro | m | não | 687 | ausente: a opção não exibe comprimento |
| `osmCredit` | booleano | — | sim | `true` | `false` |

`displayLengthM` é o comprimento medido decidido pelo dono do produto (`DOMAIN/DEC-04`), exibido como está,
e não o comprimento calculado da linha central suavizada. É opcional; padrão: ausente, e a opção não exibe
comprimento. Neutro: a pista sintética continua sem comprimento exibido, como antes desta feature. Os
demais campos são obrigatórios e não têm padrão; o catálogo é novo e não altera nenhum comportamento
existente. Os textos são exibidos iguais nos dois idiomas do
jogo. O catálogo não tem campo de recorde. A pista da abertura é a entrada `kart-park`, sempre.

## Pedido e resposta de `getTrainingTrackOptions`

| Campo | Direção | Tipo | Obrigatório | Restrições |
|---|---|---|---|---|
| (nenhum) | pedido | — | — | sem parâmetro |
| `options` | resposta | lista das 2 entradas do catálogo | sim | sempre as duas |
| `selectedTrackId` | resposta | texto | sim | `trackId` da última seleção pedida; `kart-park` antes de qualquer seleção do Jogador |
| `sessionState` | resposta | enum `NO_SESSION`, `LOADING`, `READY`, `FAILED` | sim | estado da sessão de treino ([RULE-0003](../rules/RULE-0003-sessao-de-treino-e-selecao-de-pista.md)) |
| `trackDataStatus` | resposta | enum de [API-0001](API-0001-dado-de-pista-com-geometria-zebras-e-barreiras.md) | só com `READY` ou `FAILED` | resultado da leitura do dado da pista selecionada |

Forma vazia: não existe; o catálogo tem sempre as duas entradas. Antes da abertura terminar, `sessionState`
é `NO_SESSION` ou `LOADING` e `trackDataStatus` está ausente.

## Pedido e resposta de `selectTrainingTrack`

| Campo | Direção | Tipo | Obrigatório | Restrições |
|---|---|---|---|---|
| `trackId` | pedido | texto | sim | um `trackId` do catálogo |
| `sessionState` | resposta | enum | sim | `READY` ou `FAILED` ao terminar a leitura |
| `trackId` | resposta | texto | sim | o pedido |
| `trackVersion` | resposta | valor do dado da pista | só com `READY` | copiado do dado lido |
| `trackDataStatus` | resposta | enum de API-0001 | sim | `COMPLETE` ou `INCOMPLETE` com `READY`; `UNREADABLE` ou `UNSUPPORTED_SCHEMA` com `FAILED` |

Efeito com `READY`: a sessão anterior é encerrada (uma volta em `COUNTDOWN`, `RUNNING` ou `PAUSED` nela é
descartada sem resultado); o estado da simulação passa a ser o da pista pedida, com o kart na
`startPosition` dela; nenhuma volta em andamento, e `getLapState` retorna `NO_ACTIVE_LAP` até o Jogador
iniciar uma volta. Toda volta pedida a partir dessa sessão vai com `lapKind` `TRAINING`, o `trackId` e o
`trackVersion` da sessão e sem `challengeNumber`. Nada é gravado no navegador: nem a escolha, nem a sessão.

Efeito com `FAILED`: a sessão anterior também é encerrada; nenhuma sessão fica pronta; nenhuma volta pode
ser iniciada até uma seleção que termine `READY`; o arquivo de pista não é alterado (I4).

## Erros

Não há status HTTP. A operação devolve um destes códigos, sem lançar:

| Código | Operação | Condição | Corpo e efeito |
|---|---|---|---|
| `UNKNOWN_TRACK` | `selectTrainingTrack` | `trackId` fora do catálogo | apenas o código; a sessão corrente não muda |
| `TRACK_DATA_UNREADABLE` | `selectTrainingTrack` | o dado da pista é `UNREADABLE` | `sessionState` `FAILED`, `trackId`, `trackDataStatus` |
| `TRACK_SCHEMA_UNSUPPORTED` | `selectTrainingTrack` | o dado da pista é `UNSUPPORTED_SCHEMA` | `sessionState` `FAILED`, `trackId`, `trackDataStatus`; o arquivo é mantido intacto e reportado |

`getTrainingTrackOptions` não tem erro: é leitura do catálogo fixo e do estado corrente.

## Idempotência

`getTrainingTrackOptions` é leitura pura. `selectTrainingTrack` com o `trackId` de uma sessão `READY` não
tem efeito: devolve o estado corrente, não encerra a sessão, não move o kart e não descarta a volta. Com
outro `trackId`, ou sem sessão `READY`, cada pedido abre uma sessão nova; repetir o mesmo pedido leva ao
mesmo estado final (kart na largada, nenhuma volta em andamento) e nunca cria registro de desafio diário nem
resultado. Não há chave: a operação é local, síncrona em relação à tela e ordenada pela ordem dos pedidos;
um pedido feito enquanto outro está em `LOADING` é atendido depois dele, e vale o último (D-FS-04).

## Paginação e sondagem

Não se aplica. A tela inicial relê `getTrainingTrackOptions` depois de cada `selectTrainingTrack`; não há
sondagem.

## Compatibilidade

| Mudança | Tratamento |
|---|---|
| Contrato novo | Nenhum campo, operação ou código publicado é renomeado ou removido. `TRACK_DATA_UNREADABLE` e `TRACK_SCHEMA_UNSUPPORTED` têm o mesmo nome e o mesmo significado que nas rejeições de `startLap` de `race-lap-validation` |
| `startLap` e o estado da volta | Inalterados; esta feature só fixa, numa sessão de treino, `lapKind` `TRAINING` sem `challengeNumber` |
| Dado persistido do jogador | Nenhum campo novo; nenhuma leitura ou gravação nova (I5) |
