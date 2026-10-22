---
id: DM-0001
title: Arquivo de pista, versão de esquema 2
feature: race-lap-validation
stage: dspec
status: validated
version: 1.0.1
sources: [FEAT-0002, FEAT-0004, FEAT-0008, REQ-FEAT-0002-13, REQ-FEAT-0004-06, REQ-FEAT-0008-01, REQ-FEAT-0008-02, REQ-FEAT-0008-03, REQ-FEAT-0008-04, REQ-FEAT-0008-05, REQ-FEAT-0008-08, REQ-FEAT-0008-09, REQ-FEAT-0008-10, REQ-FEAT-0008-11, REQ-FEAT-0008-12, REQ-FEAT-0008-13, REQ-FEAT-0008-14]
---

# DM-0001 — Arquivo de pista, versão de esquema 2

## Realiza

Os `REQ-*` listados em `sources` (API-0003, FEAT-0008): largada, sentido, chegada, quatro setores, marcadores
distintos, limites de corte opcionais, versão de esquema maior que a anterior, leitura da forma anterior sem
erro, versão desconhecida intacta, `trackVersion` nunca editada no lugar, dado inconsistente tratado como
incompleto. Camada: dado de pista (`src/track.ts`, `src/trackData.ts`). Decisão de esquema: ADR-0003.

## Não há banco

O produto não tem banco no MVP. O "esquema" é o arquivo de pista empacotado com o jogo. Este modelo descreve o
arquivo; o estado da volta em memória está em [DM-0002](DM-0002-estado-da-volta-em-memoria.md).

## Campos do arquivo na versão 2

Unidades no nome: `M` metros, `Ms` milissegundos, `Deg` graus. O plano do chão usa `x` (direita) e `z` (para
baixo na vista de cima), como `src/track.ts`.

| Campo | Tipo | Unidade | Nulável | Padrão | Restrições |
|---|---|---|---|---|---|
| `schemaVersion` | inteiro | — | não | — | `2` neste esquema; inteiro maior ou igual a 1 em qualquer arquivo |
| `trackId` | texto | — | não | — | não vazio |
| `trackVersion` | texto não vazio ou inteiro maior ou igual a 1 | — | não | — | copiado sem interpretação para o resultado; nunca alterado depois de publicado |
| `direction` | `CLOCKWISE` ou `COUNTER_CLOCKWISE` | — | sim (ausente) | ausente | igual ao enrolamento da linha central (C1) |
| `startPosition` | objeto `{xM, zM, headingDeg}` | m, m, graus | sim | ausente | `headingDeg` na convenção do `heading` da física: 0 aponta para `+z`, positivo gira para `+x` |
| `finishLine` | linha | m | sim | ausente | ver "Linha" |
| `sectorLimits` | lista de exatamente 3 linhas, em ordem | m | sim | ausente | outro tamanho: dado incompleto |
| `markers` | lista de 1 ou mais linhas, em ordem | m | sim | ausente | distinta de `sectorLimits`: nenhum item é compartilhado |
| `cutDistanceM` | número finito maior que 0 | m | sim | ausente; vale 3 | neutro: o padrão é o da decisão `DEC-01` |
| `cutDurationMs` | inteiro maior que 0 | ms | sim | ausente; vale 1000 | neutro pelo mesmo motivo |

**Linha** é o objeto `{fromXM, fromZM, toXM, toZM}`, quatro números finitos, com comprimento de pelo menos 1 m.
O **sentido da pista** de uma linha é o cruzamento do lado direito para o lado esquerdo do vetor do primeiro ao
segundo ponto, visto de cima (x à direita, z para baixo). Com `d = (toXM - fromXM, toZM - fromZM)` e
`side(p) = d.z * (p.x - fromXM) - d.x * (p.z - fromZM)`, um deslocamento de `a` para `b` cruza no sentido da pista
quando `side(a) < 0` e `side(b) >= 0`, e na contramão quando `side(a) > 0` e `side(b) <= 0`, com o ponto de
cruzamento dentro do segmento. A geometria da pista (`track`, `WIDTH`, `nearest`) não faz parte do arquivo nesta
versão: continua em `src/track.ts` com nome, unidade e significado inalterados.

Campos desconhecidos são ignorados na leitura e nunca removidos nem reescritos: um campo acrescentado depois é
aditivo (I3).

## Classificação feita por `readTrackData` ([DES-0006](../core/DES-0006-leitura-do-dado-de-pista.md))

| Ordem | Condição | `trackDataStatus` |
|---|---|---|
| 1 | entrada ausente, texto que não é JSON, ou JSON que não é um objeto | `UNREADABLE` |
| 2 | `schemaVersion` ausente, não inteiro ou menor que 1 | `UNREADABLE` |
| 3 | `schemaVersion` maior que a maior versão que o leitor conhece (`TRACK_SCHEMA_VERSION`, 2 neste esquema) | `UNSUPPORTED_SCHEMA` |
| 4 | `trackId` ou `trackVersion` ausente ou fora da forma da tabela | `UNREADABLE` |
| 5 | `schemaVersion` igual a 1 | `INCOMPLETE` (a forma anterior não declara setores nem marcadores) |
| 6 | versão 2 com algum campo obrigatório de dado completo ausente, ou declarado fora da forma da tabela, ou com `cutDistanceM`/`cutDurationMs` inválidos, ou reprovado em qualquer verificação C1 a C7 | `INCOMPLETE` |
| 7 | versão 2 que passa em tudo | `COMPLETE` |

A versão desconhecida é verificada antes da identificação (ordem 3 antes de 4) para que um esquema futuro que
renomeie `trackId` seja reportado como esquema não suportado, e não como ilegível. Em `INCOMPLETE`, a leitura
devolve apenas o que o arquivo declara de forma válida.

## Verificações de consistência (C1 a C7)

Puras, determinísticas, sobre os campos e sobre `track`, `WIDTH` e `nearest`. Qualquer falha torna o dado
`INCOMPLETE` (REQ-FEAT-0008-13); nenhuma lança.

| Id | Verificação |
|---|---|
| C1 | `direction` é igual ao enrolamento da linha central em ordem de índice: com `S` = soma de `x_i * z_(i+1) - x_(i+1) * z_i`, `S > 0` é `CLOCKWISE` e `S < 0` é `COUNTER_CLOCKWISE`. A ordem do arranjo `track` é o sentido de percurso |
| C2 | A linha central fechada cruza cada linha (chegada, 3 limites de setor, cada marcador) em exatamente 1 ponto, e esse cruzamento é no sentido da pista |
| C3 | `startPosition` está a no máximo `WIDTH / 2` da linha central, com `headingDeg` a menos de 90 graus da tangente da linha central no ponto mais próximo, apontando no sentido de percurso |
| C4 | Posições de arco `a(.)` medidas da largada, no sentido de percurso: `a(marcador 1) < ... < a(marcador n)`, `a(limite 1) < a(limite 2) < a(limite 3)` e `a(chegada)` maior que todas as demais. A primeira passagem pela chegada no sentido da pista só ocorre ao completar o percurso (REQ-FEAT-0008-14) |
| C5 | Cada limite de setor tem ao menos um marcador antes e ao menos um depois dele (`a(marcador j) < a(limite k) < a(marcador j+1)`), e o último marcador vem antes da chegada. Assim passar por todos os marcadores em ordem implica atravessar os três limites e chegar à chegada (API-0003) |
| C6 | Cada limite de setor e a chegada vão, a partir do ponto de cruzamento com a linha central, até pelo menos `BARRIER_REACH_M = WIDTH / 2 + 9` metros para cada lado, de modo que o kart não os contorna dentro das paredes do circuito (a parede fica a `WIDTH / 2 + 8` m). Marcadores podem ser mais curtos, pois guardam atalhos |
| C7 | Quaisquer duas linhas consecutivas na ordem de arco distam pelo menos 2 m ao longo da linha central, e a largada dista pelo menos 2 m de toda linha. Com a distância máxima percorrida em um passo abaixo de 0,3 m, no máximo uma linha é cruzada por passo |

## Dado da pista sintética atual (versão 2, `trackVersion` 2)

A pista sintética publica o arquivo abaixo como literais arredondados a 0,001 m, em `src/track.ts`. Literais, e
não cálculos com `Math.cos` ao carregar, mantêm o dado idêntico em todos os motores de JavaScript e o tornam
imutável por publicação (I3). Os valores foram derivados da linha central atual: chegada a 8 m antes do ponto
de índice 0 (comprimento da linha central 368,536 m, chegada na posição de arco 360,536 m), largada no ponto de
índice 0, limites de setor a 1/4, 1/2 e 3/4 do comprimento, e quatro marcadores em 1/8, 3/8, 5/8 e 7/8 do
comprimento, com meio comprimento de 9 m (cobrem a pista e a tolerância de corte de 3 m).

```json
{
  "schemaVersion": 2,
  "trackId": "synthetic",
  "trackVersion": 2,
  "direction": "CLOCKWISE",
  "startPosition": { "xM": 75, "zM": 0, "headingDeg": -1.905 },
  "finishLine": { "fromXM": 88.556, "fromZM": -12.306, "toXM": 58.858, "toZM": -3.417 },
  "sectorLimits": [
    { "fromXM": -0.84, "fromZM": 59.463, "toXM": 9.188, "toZM": 30.129 },
    { "fromXM": -90.449, "fromZM": -1.253, "toXM": -59.551, "toZM": 1.253 },
    { "fromXM": -0.84, "fromZM": -59.463, "toXM": 9.188, "toZM": -30.129 }
  ],
  "markers": [
    { "fromXM": 52.479, "fromZM": 42.524, "toXM": 43.33, "toZM": 27.023 },
    { "fromXM": -39.919, "fromZM": 30.833, "toXM": -32.375, "toZM": 14.49 },
    { "fromXM": -39.919, "fromZM": -30.833, "toXM": -32.375, "toZM": -14.49 },
    { "fromXM": 52.479, "fromZM": -42.524, "toXM": 43.33, "toZM": -27.023 }
  ]
}
```

Os limites de corte ficam ausentes: valem 3 m e 1000 ms. Posições de arco da largada ao longo do percurso:
marcadores em 46,1 m, 138,2 m, 230,3 m e 322,5 m; limites de setor em 92,1 m, 184,3 m e 276,4 m; chegada em
360,5 m. Cada linha cruza a linha central uma única vez, no sentido da pista, e a ordem satisfaz C4 e C5.
A largada fica 8 m depois da chegada, de modo que o primeiro cruzamento da chegada no sentido da pista só ocorre
ao completar o percurso. Uma volta completa leva cerca de 3770 passos (cerca de 31 s) com o controlador de
referência do benchmark de manuseio.

A forma anterior (`schemaVersion` 1, com `trackId` e `trackVersion` 1) existe como arquivo de teste
`tests/fixtures/track-v1.json`, lido como `INCOMPLETE`. Uma pista cujos dados mudam recebe nova `trackVersion`:
trocar um marcador desta pista exige publicar `trackVersion` 3 e manter a 2 intacta.

## Plano de migração

| Item | Conteúdo |
|---|---|
| Revisão | arquivo de pista `schemaVersion` 1 (forma anterior) para `schemaVersion` 2 |
| O que faz | o leitor passa a entender as versões 1 e 2; a pista sintética deixa de ser só constantes e passa a publicar o arquivo da seção anterior; a validação por portões deixa o jogo |
| Reversão (passos executáveis) | 1. `git revert` do commit de integração desta feature. 2. `npm test` e `npm run build` na árvore revertida. 3. Republicar o artefato estático anterior. Nada fica gravado em navegador, então não há dado a desfazer |
| Teste da reversão | a árvore revertida passa em `npm test` e em `npm run bench:physics`/`bench:handling` com as saídas anteriores |

## Preenchimento retroativo

Nenhum: não existe arquivo de pista armazenado nem dado de jogador a converter. O único arquivo é o empacotado.

## Janela de compatibilidade

O código novo lê as versões 1 e 2. O código anterior não lia arquivo de pista (a pista era constante no código),
portanto não há versão em execução que receba um arquivo que não entende nesta entrega. A mudança é em um único
passo de implantação sem indisponibilidade. Quando a pista passar a ser servida por CDN (pós-MVP, D-DS-03), um
cliente que só conheça a versão 1 classificará um arquivo versão 2 como `UNSUPPORTED_SCHEMA`: mantém o arquivo
intacto, exibe o erro e não inicia volta (I4), sem perda.

## Retenção e privacidade

O arquivo guarda geometria e identificadores de pista; nenhum dado pessoal, identificador de jogador nem
segredo (I6, D-DS-04). O jogo nunca grava, altera nem apaga o arquivo. O dado derivado de OpenStreetMap, quando
existir, mantém crédito e aviso ODbL fora deste modelo (RNF09; etapa 3).
