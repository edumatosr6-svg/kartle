---
id: API-0001
title: Contrato do dado de pista com linha central, larguras, zebras e barreiras (esquema 3)
feature: pista-kart-park
stage: fspec
status: validated
version: 1.0.0
sources: [US-0002, US-0003, US-0004, US-0005, NFR-0001, NFR-0006, NFR-0008, NFR-0009, AC-US-0002-01, AC-US-0002-03, AC-US-0002-04, AC-US-0002-05, AC-US-0002-08, AC-US-0003-01, AC-US-0003-02, AC-US-0003-03, AC-US-0003-04, AC-US-0004-01, AC-US-0005-01, AC-US-0005-02]
---

# API-0001 — Contrato do dado de pista com linha central, larguras, zebras e barreiras (esquema 3)

Contrato do arquivo de pista que o Curador do catálogo produz offline e que a simulação lê, o mesmo para
`web-desktop` e `web-mobile`. É dado versionado (I3, I5) e leitura em processo: não há endpoint de rede,
caminho HTTP nem prefixo no MVP (diretrizes do estágio). Nomes em `camelCase` plano com a unidade no
sufixo (D-FS-06): `M` para metros. O contrato do dado de pista é de `race-lap-validation`
(`readTrackData`, `trackDataStatus`, `schemaVersion`, `trackId`, `trackVersion`, `direction`,
`startPosition`, `finishLine`, `sectorLimits`, `markers`, `cutDistanceM`, `cutDurationMs`, e a forma de
linha `{fromXM, fromZM, toXM, toZM}`): ele é nomeado aqui e não redefinido. Este contrato acrescenta a
versão de esquema 3 e os campos dela.

## Operações

| Operação | Propósito | Quem chama |
|---|---|---|
| `readTrackData` | A mesma operação de `race-lap-validation`: lê um arquivo de pista e devolve `trackDataStatus` e, quando utilizável, os campos; passa a aceitar `schemaVersion` 3 | `selectTrainingTrack` ([API-0002](API-0002-catalogo-e-selecao-da-pista-do-treino.md)); ensaios de `npm test` |

## Auth

Sem sessão. Papel permitido: `player` (anônimo) lê o arquivo entregue com o jogo. O Curador do catálogo
produz o arquivo offline e não usa este contrato em tempo de execução. Leitura pública no cliente porque o
dado de pista não é segredo e a leitura não altera estado.

## Parâmetros

Nenhum parâmetro de caminho ou de consulta. A operação recebe o conteúdo do arquivo de pista escolhido.

## Campos do arquivo em `schemaVersion` 3

Os campos de `race-lap-validation` continuam com o mesmo nome, unidade e significado; a tabela diz só o que
a Kart Park declara neles.

| Campo | Tipo | Unidade | Obrigatório | Padrão e restrições |
|---|---|---|---|---|
| `schemaVersion` | inteiro | — | sim | 3 para um arquivo com `centerline`; a pista sintética continua em 2 |
| `trackId` | texto | — | sim | `kart-park` para a Kart Park |
| `trackVersion` | inteiro | — | sim | 1 para a primeira versão publicada da Kart Park; nunca editada no lugar ([RULE-0005](../rules/RULE-0005-versao-e-publicacao-da-pista.md)) |
| `direction` | enum de `race-lap-validation` | — | sim | `COUNTER_CLOCKWISE` na Kart Park; consistente com a ordem dos pontos de `centerline` |
| `startPosition` | `{xM, zM, headingDeg}` de `race-lap-validation` | m e graus | sim | sobre o segmento do ponto 0 ao ponto 1, depois da linha de largada, com o rumo desse segmento |
| `finishLine` | linha | m | sim | linha transversal no ponto 0 ([RULE-0002](../rules/RULE-0002-geometria-e-verificacoes-do-arquivo-de-pista.md)) |
| `sectorLimits` | lista de 3 linhas | m | sim | linhas transversais nos pontos de [RULE-0002](../rules/RULE-0002-geometria-e-verificacoes-do-arquivo-de-pista.md), em ordem de volta |
| `markers` | lista de linhas | m | sim | linhas transversais em pontos da linha central, em ordem de volta, a no máximo 25 m de distância de volta uma da outra, inclusive da última à primeira |
| `cutDistanceM`, `cutDurationMs` | como em `race-lap-validation` | m, ms | não | ausentes na Kart Park: valem os padrões de 3 m e 1000 ms |
| `centerline` | lista de pontos `{xM, zM, widthM}` | m | sim, em `schemaVersion` 3 | linha central fechada: o último ponto liga ao ponto 0, que não é repetido; ao menos 3 pontos; na Kart Park, 684 pontos na ordem da origem. `xM` leste, `zM` com norte = −z. `widthM` maior que 0: a largura do asfalto naquele ponto, centrada na linha ao longo da normal |
| `curbs` | lista de `{side, fromLapM, toLapM, widthM}` | m | não | padrão: lista vazia, sem zebra. Neutro: um arquivo sem o campo não tem superfície nova, e a pista se comporta como antes desta feature (I4). `side` enum `LEFT`, `RIGHT`, no sentido de corrida. `fromLapM` menor que `toLapM`, ambos de 0 ao comprimento da volta da `centerline`; nenhum trecho cruza o ponto 0. `widthM` maior que 0: largura da faixa da zebra, para fora a partir da borda do asfalto |
| `barriers` | lista de `{points}`, com `points` lista de 2 ou mais pontos `{xM, zM}` | m | não | padrão: lista vazia, sem barreira. Neutro pelo mesmo motivo. Cada barreira é a poligonal aberta dos seus pontos, um obstáculo de colisão ([RULE-0001](../rules/RULE-0001-superficie-borda-da-pista-e-obstaculos.md)) |
| `osmDerived` | booleano | — | não | padrão: `false`. Neutro: um arquivo sem o campo não declara dado OpenStreetMap. `true` na Kart Park, derivada do caminho OSM `way/128739206` |

Os valores estruturados são os pontos de `centerline`, os trechos de `curbs`, as barreiras com os seus
pontos e as linhas e a posição de largada de `race-lap-validation`; os demais campos são planos. O arquivo
não tem campo de nome, de comprimento exibido, de recorde nem de comprimento oficial: o nome e o
comprimento exibidos ficam no catálogo do treino ([API-0002](API-0002-catalogo-e-selecao-da-pista-do-treino.md)),
e o recorde não entra em nenhum dado do jogo (AC-US-0006-09).

A forma exata de cada linha transversal, a régua das distâncias de volta e as verificações que o arquivo
precisa passar antes de publicado estão em [RULE-0002](../rules/RULE-0002-geometria-e-verificacoes-do-arquivo-de-pista.md).
O arquivo entregue ao navegador mede menos de 200.000 bytes (NFR-0001).

## Resposta de `readTrackData`

A de `race-lap-validation`, sem mudança de forma: `trackDataStatus` (`COMPLETE`, `INCOMPLETE`,
`UNSUPPORTED_SCHEMA`, `UNREADABLE`) e, com `COMPLETE` ou `INCOMPLETE`, os campos declarados. Em
`schemaVersion` 3 a resposta traz também `centerline`, `curbs`, `barriers` e `osmDerived`, com os padrões
acima quando ausentes. A Kart Park declara todas as linhas da volta, então é `COMPLETE`.

Forma vazia: sem arquivo, `UNREADABLE` e nenhum outro campo.

## Erros

Não há status HTTP. A operação devolve o `trackDataStatus` abaixo, sem lançar e sem alterar o arquivo:

| Código | Condição | Efeito |
|---|---|---|
| `UNREADABLE` | arquivo ausente, corrompido ou ilegível; ou `schemaVersion` 3 com `centerline` ausente, com menos de 3 pontos ou com `widthM` não positivo; ou `curbs` ou `barriers` com item fora das restrições acima | nenhuma sessão nessa pista ([API-0002](API-0002-catalogo-e-selecao-da-pista-do-treino.md)); o arquivo fica intacto (I4) |
| `UNSUPPORTED_SCHEMA` | `schemaVersion` maior que 3 | o arquivo é mantido intacto e reportado, não é usado (I3, I4) |
| `INCOMPLETE` | arquivo legível sem uma das linhas da volta, como define `race-lap-validation` | só treino, sem volta oficial, como hoje; não é o caso da Kart Park publicada |

## Idempotência

Leitura sem efeito: ler duas vezes o mesmo arquivo dá a mesma resposta, e a leitura nunca altera nem
descarta o arquivo. Publicar o mesmo arquivo de novo com o mesmo `trackVersion` não cria versão; publicar
conteúdo diferente com um `trackVersion` já publicado é recusado ([RULE-0005](../rules/RULE-0005-versao-e-publicacao-da-pista.md)).

## Paginação e sondagem

Não se aplica: o arquivo é lido uma vez por sessão de treino, sem sondagem.

## Compatibilidade

| Mudança | Tratamento |
|---|---|
| `schemaVersion` 3 com `centerline`, `curbs`, `barriers` e `osmDerived` | Mudança versionada de esquema (I3, I5): o leitor passa a aceitar 2 e 3. Nenhum arquivo existente é reescrito; não há dado de jogador afetado, então não há migração de dado. A reversão é retirar o arquivo da Kart Park e o seletor: o arquivo da pista sintética não muda |
| Arquivo em `schemaVersion` 2 (pista sintética) | Lido sem erro em 100 % dos casos, como antes desta feature, com a geometria existente; os campos novos não são exigidos (NFR-0009). Um ensaio de `npm test` lê o arquivo na forma 2 e um na forma 3 (I5) |
| `curbs`, `barriers`, `osmDerived` | Opcionais, com padrão neutro: ausentes, o comportamento é o de antes desta feature |
| Leitor anterior a esta feature diante de um arquivo em `schemaVersion` 3 | Rejeita com `UNSUPPORTED_SCHEMA`, de forma visível, em vez de usar a geometria errada |
| Campo existente renomeado, removido ou com significado ou unidade alterados | Nenhum: os campos de `race-lap-validation` mantêm nome, unidade e significado |
| `STEP`, `step(state, input, dt)`, campos de `Input` | Inalterados: a zebra e a barreira são dado de pista, não entrada (NFR-0008) |
| Mudança no conteúdo de uma pista publicada | Nova `trackVersion`; a publicada nunca é editada no lugar (I3, NFR-0006) |
