---
id: DM-0001
title: Arquivo de pista, versão de esquema 3
feature: pista-kart-park
stage: dspec
status: validated
version: 1.0.0
sources: [API-0001, FEAT-0002, FEAT-0003, FEAT-0004, FEAT-0005, RULE-0002, REQ-FEAT-0002-01, REQ-FEAT-0002-02, REQ-FEAT-0002-03, REQ-FEAT-0002-04, REQ-FEAT-0002-07, REQ-FEAT-0002-09, REQ-FEAT-0002-12, REQ-FEAT-0002-14, REQ-FEAT-0002-15, REQ-FEAT-0002-16, REQ-FEAT-0002-17, REQ-FEAT-0002-18, REQ-FEAT-0003-01, REQ-FEAT-0003-04, REQ-FEAT-0003-07, REQ-FEAT-0004-01, REQ-FEAT-0005-01, REQ-FEAT-0005-03, REQ-FEAT-0006-09]
---

# DM-0001 — Arquivo de pista, versão de esquema 3

## Realiza

O contrato API-0001: a versão de esquema 3 do arquivo de pista, com a linha central e a largura de cada
ponto, as zebras, as barreiras e a indicação de dado OSM (REQ-FEAT-0002-02, -03, -04, -07, -09; REQ-FEAT-0003-01,
-04, -07; REQ-FEAT-0004-01; REQ-FEAT-0005-01, -03); a leitura da versão 2 como antes (REQ-FEAT-0002-15); o
arquivo de esquema 3 sem linha central utilizável como `UNREADABLE` (REQ-FEAT-0002-16); o arquivo publicado
imutável, abaixo de 200.000 bytes e sem recorde (REQ-FEAT-0002-14, -17, -18; REQ-FEAT-0006-09). Camada: dado
de pista (`src/trackData.ts`, `src/trackGeometry.ts`, `src/tracks/`). Decisão: [ADR-0001](../adr/ADR-0001-esquema-3-do-arquivo-de-pista.md).
Leitor: [DES-0001](../core/DES-0001-leitura-do-dado-de-pista-em-esquema-3.md). Produção do arquivo:
[DES-0010](../pipeline/DES-0010-preparo-offline-do-arquivo-da-kart-park.md).

## Não há banco

O produto não tem banco no MVP. O "esquema" é o arquivo de pista empacotado com o jogo. O esquema 2 é o de
`race-lap-validation` (o DM-0001 daquele conjunto), sem nenhuma mudança: este modelo descreve só o que a
versão 3 acrescenta e como o leitor classifica as três versões. O registro de publicação e o estado em
memória estão em [DM-0002](DM-0002-registro-de-publicacao-e-estado-em-memoria.md).

## Campos do arquivo na versão 3

Unidades no nome: `M` metros, `Ms` milissegundos, `Deg` graus. Eixos do jogo: `x` leste, `z` com norte = −z,
em metros (RULE-0002). Os campos de `race-lap-validation` mantêm nome, tipo, unidade e significado.

| Campo | Tipo | Unidade | Nulável | Padrão | Restrições |
|---|---|---|---|---|---|
| `schemaVersion` | inteiro | — | não | — | `3` |
| `trackId` | texto | — | não | — | não vazio; `kart-park` na Kart Park |
| `trackVersion` | inteiro ≥ 1 ou texto não vazio | — | não | — | `1` na primeira versão da Kart Park; nunca alterado depois de publicado |
| `osmDerived` | booleano | — | sim (ausente) | `false` | `true` na Kart Park; neutro: ausente, o arquivo não declara dado OSM |
| `direction` | `CLOCKWISE` ou `COUNTER_CLOCKWISE` | — | sim | ausente | igual ao enrolamento de `centerline` (C1 v3) |
| `startPosition` | `{xM, zM, headingDeg}` | m, m, graus | sim | ausente | `headingDeg` na convenção do `heading` da física: 0 aponta para `+z`, positivo gira para `+x` |
| `finishLine` | linha | m | sim | ausente | linha `{fromXM, fromZM, toXM, toZM}` de `race-lap-validation` |
| `sectorLimits` | lista de exatamente 3 linhas | m | sim | ausente | em ordem de volta |
| `markers` | lista de 1 ou mais linhas | m | sim | ausente | distinta de `sectorLimits` |
| `cutDistanceM`, `cutDurationMs` | como em `race-lap-validation` | m, ms | sim | ausentes; valem 3 e 1000 | ausentes na Kart Park |
| `centerline` | lista de 3 ou mais pontos `{xM, zM, widthM}` | m | não | — | volta fechada do último ponto ao ponto 0, que não se repete; `xM`, `zM` finitos; `widthM` finito e maior que 0, largura do asfalto centrada no ponto ao longo da normal |
| `curbs` | lista de `{side, fromLapM, toLapM, widthM}` | m | sim | lista vazia | `side` `LEFT` ou `RIGHT` no sentido de corrida; `0 <= fromLapM < toLapM <= lapLengthM + 0,001`; `widthM` finito e maior que 0; neutro: sem zebra, nenhuma superfície nova |
| `barriers` | lista de `{points}`, `points` lista de 2 ou mais `{xM, zM}` | m | sim | lista vazia | pontos finitos; cada barreira é a poligonal aberta dos seus pontos; neutro: sem obstáculo |

`lapLengthM` é a soma dos comprimentos dos segmentos de `centerline`, inclusive do último ponto ao ponto 0,
calculada das coordenadas gravadas; a tolerância de 0,001 m absorve o arredondamento a 3 casas do fim do
último trecho de zebra, que termina no comprimento da volta (RULE-0002, V12).

A versão 3 não tem campo de nome, de comprimento exibido, de comprimento oficial nem de recorde: nome e
comprimento exibidos ficam no catálogo do treino ([DES-0005](../core/DES-0005-sessao-de-treino-catalogo-e-selecao-de-pista.md)),
e o recorde não entra em dado algum (REQ-FEAT-0006-09). Campos desconhecidos são ignorados na leitura e
nunca removidos nem reescritos (I3); o **arquivo publicado da Kart Park**, porém, tem exatamente os campos da
tabela, sem nenhum outro (verificação V18 de [DES-0011](../pipeline/DES-0011-verificacoes-registro-de-publicacao-e-promocao.md)).

## Classificação feita por `readTrackData` ([DES-0001](../core/DES-0001-leitura-do-dado-de-pista-em-esquema-3.md))

As ordens 1 a 5 são as de `race-lap-validation`, com o limite de versão passando de 2 a 3.

| Ordem | Condição | `trackDataStatus` |
|---|---|---|
| 1 | entrada ausente, texto que não é JSON, ou JSON que não é objeto | `UNREADABLE` |
| 2 | `schemaVersion` ausente, não inteiro ou menor que 1 | `UNREADABLE` |
| 3 | `schemaVersion` maior que 3 | `UNSUPPORTED_SCHEMA` |
| 4 | `trackId` ou `trackVersion` fora de forma | `UNREADABLE` |
| 5 | `schemaVersion` 1 | `INCOMPLETE` |
| 6 | `schemaVersion` 3 com `centerline` ausente, não lista, com menos de 3 pontos, ou com ponto de `xM`/`zM` não finito ou `widthM` não finito ou não positivo | `UNREADABLE` |
| 7 | `schemaVersion` 3 com `curbs` presente e não lista, ou com item fora das restrições; ou `barriers` presente e não lista, ou com item sem `points` de 2 ou mais pontos finitos; ou `osmDerived` presente e não booleano | `UNREADABLE` |
| 8 | versão 2 ou 3 com campo de linha da volta ausente ou fora de forma, ou `cutDistanceM`/`cutDurationMs` inválidos, ou reprovada na consistência (C1 a C7 na versão 2, sobre a pista sintética; C1 a C7 da versão 3, abaixo) | `INCOMPLETE` |
| 9 | versão 2 ou 3 que passa em tudo | `COMPLETE` |

Em `INCOMPLETE` de versão 3 a leitura devolve `centerline`, `curbs`, `barriers` e `osmDerived` (já
validados nas ordens 6 e 7) e só os campos de linha declarados de forma válida. A ordem 3 vem antes da 4 pelo
mesmo motivo de `race-lap-validation`: um esquema futuro que renomeie `trackId` é reportado como esquema não
suportado.

## Verificações de consistência da versão 3 (C1 a C7 v3)

Puras, determinísticas, sobre os campos e sobre a geometria do **próprio arquivo**
([DES-0002](../core/DES-0002-geometria-da-pista-declarada-no-arquivo.md)), nunca sobre a pista sintética.
Qualquer falha torna o dado `INCOMPLETE`; nenhuma lança. As de mesmo número têm o mesmo propósito das de
`race-lap-validation`.

| Id | Verificação |
|---|---|
| C1 v3 | `direction` igual ao enrolamento de `centerline` em ordem de índice: com `S` = soma de `x_i * z_(i+1) - x_(i+1) * z_i`, `S > 0` é `CLOCKWISE` e `S < 0` é `COUNTER_CLOCKWISE` (a mesma regra de C1; área positiva no plano (x, −z) é `S < 0`) |
| C2 v3 | a `centerline` fechada cruza cada linha (chegada, 3 limites, cada marcador) em exatamente 1 ponto, no sentido da pista (`crossLine` `FORWARD`) |
| C3 v3 | `startPosition` está na pista (`classifySurface` diferente de `grass`) e `headingDeg` fica a menos de 90 graus da tangente do segmento mais próximo da `centerline`, no sentido de percurso |
| C4 v3 | posições de arco medidas da largada no sentido de percurso: marcadores crescentes, limites crescentes, chegada maior que todas |
| C5 v3 | cada limite de setor tem um marcador antes e um depois; o último marcador vem antes da chegada |
| C6 v3 | as duas pontas de cada linha estão na grama (`classifySurface` igual a `grass`): a linha atravessa a pista de borda a borda no seu cruzamento, de modo que um kart sobre a pista não passa sem cruzá-la. Substitui o alcance fixo `WIDTH / 2 + 9` de C6, que pressupõe o muro da pista sintética, inexistente na versão 3 (REQ-FEAT-0004-04) |
| C7 v3 | duas linhas consecutivas na ordem de arco distam pelo menos 2 m; a largada dista pelo menos 2 m de cada marcador e de cada limite; a largada fica do lado de depois da chegada (`sideOf(finishLine, start) > 0`). A distância mínima da largada à chegada de C7 não se aplica: REQ-FEAT-0002-06 põe a largada no segmento do ponto 0 ao ponto 1 (cerca de 1 m), e a primeira passagem pela chegada no sentido da pista continua só ao completar o percurso, porque a largada está depois dela |

## Arquivo publicado da Kart Park (`src/tracks/kart-park-v1.json`)

Gerado pelo preparo offline ([DES-0010](../pipeline/DES-0010-preparo-offline-do-arquivo-da-kart-park.md)),
verificado por V01 a V18 e registrado ([DES-0011](../pipeline/DES-0011-verificacoes-registro-de-publicacao-e-promocao.md)).
Serialização determinística: JSON compacto numa linha, terminado por uma quebra de linha, chaves na ordem
`schemaVersion`, `trackId`, `trackVersion`, `osmDerived`, `direction`, `startPosition`, `finishLine`,
`sectorLimits`, `markers`, `centerline`, `curbs`, `barriers`; coordenadas, larguras e distâncias arredondadas a
0,001 m e `headingDeg` a 0,001 grau. Valores declarados: `schemaVersion` 3, `trackId` `kart-park`,
`trackVersion` 1, `osmDerived` `true`, `direction` `COUNTER_CLOCKWISE`; `cutDistanceM` e `cutDurationMs`
ausentes; 684 pontos em `centerline`; 34 trechos em `curbs`; uma barreira por trecho contínuo de grama de 6 m
ou menos entre os trechos quase encostados. O tamanho esperado é da ordem de dezenas de kB, abaixo de
200.000 bytes (V17). O cliente o importa como texto (`?raw`) e o lê com `readTrackData(texto)`
([ADR-0002](../adr/ADR-0002-preparo-offline-em-typescript-e-arquivo-empacotado.md)).

Uma versão publicada nunca é editada: qualquer mudança da linha central, de uma largura, de uma zebra, da
barreira, dos setores ou dos marcadores gera `src/tracks/kart-park-v<n+1>.json` com `trackVersion` maior, o
catálogo do treino passa a apontar para ele e o arquivo anterior fica no repositório, intacto
(REQ-FEAT-0002-18; I3). A imutabilidade é verificada em `npm test` pelo resumo SHA-256 registrado
(REQ-FEAT-0002-17).

## Plano de migração

| Item | Conteúdo |
|---|---|
| Revisão | arquivo de pista `schemaVersion` 2 para `schemaVersion` 3, com o leitor das versões 1, 2 e 3 |
| O que faz | `TRACK_SCHEMA_VERSION` passa de 2 a 3; a versão 3 é classificada pelas ordens 6 a 9; o arquivo da Kart Park é acrescentado; o arquivo da pista sintética (`SYNTHETIC_TRACK_FILE`, versão 2, `trackVersion` 2) não muda; nenhum arquivo existente é reescrito |
| Reversão (passos executáveis) | 1. `git revert` dos commits de código desta feature, na ordem inversa. 2. `npm test` e `npm run build` na árvore revertida. 3. Republicar o artefato estático anterior em staging. Nada fica gravado em navegador, então não há dado de jogador a desfazer; `src/tracks/kart-park-v1.json` e `tracks/registry.json` saem com o revert e voltam no próximo avanço sem mudança de conteúdo |
| Teste da reversão | a árvore revertida passa no `npm test` de `race-lap-validation` e de `dirigibilidade` como antes desta feature; `readTrackData` volta a classificar `schemaVersion` 3 como `UNSUPPORTED_SCHEMA` |

## Preenchimento retroativo

Nenhum: não há arquivo de pista armazenado fora do repositório nem dado de jogador a converter. O único
arquivo da versão 2 (pista sintética) continua como está.

## Janela de compatibilidade

O arquivo é empacotado no mesmo artefato do leitor: um cliente com o leitor da versão 2 nunca recebe o arquivo
da Kart Park, e um cliente com o leitor da versão 3 recebe os dois arquivos que conhece. A troca é num único
passo de implantação, sem indisponibilidade. Um artefato antigo em cache do navegador continua coerente
consigo mesmo (pista sintética só). Quando a pista passar a ser servida por CDN (pós-MVP, D-DS-03), um cliente
que só conheça a versão 2 classifica o arquivo da Kart Park como `UNSUPPORTED_SCHEMA`: mantém o arquivo
intacto, exibe o erro e não inicia volta (I4), em vez de usar a geometria errada.

## Retenção e privacidade

O arquivo guarda geometria, identificadores de pista e a indicação `osmDerived`; nenhum dado pessoal,
identificador de jogador, segredo, nome de autor nem recorde (I6, D-DS-04, REQ-FEAT-0006-09). Cada versão
publicada é guardada para sempre no repositório (I3). O jogo nunca grava, altera nem apaga o arquivo. O
crédito OSM/ODbL acompanha o dado na tela ([DES-0007](../web/DES-0007-tela-inicial-seletor-credito-e-resultado.md)).
