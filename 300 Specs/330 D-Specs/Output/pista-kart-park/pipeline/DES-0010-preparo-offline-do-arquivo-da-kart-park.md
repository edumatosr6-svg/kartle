---
id: DES-0010
title: Preparo offline do arquivo de pista da Kart Park
feature: pista-kart-park
stage: dspec
status: validated
version: 1.0.1
sources: [FLOW-0003, RULE-0002, FEAT-0002, FEAT-0003, FEAT-0004, FEAT-0005, REQ-FEAT-0002-01, REQ-FEAT-0002-02, REQ-FEAT-0002-03, REQ-FEAT-0002-04, REQ-FEAT-0002-05, REQ-FEAT-0002-06, REQ-FEAT-0002-07, REQ-FEAT-0002-08, REQ-FEAT-0002-09, REQ-FEAT-0002-10, REQ-FEAT-0002-11, REQ-FEAT-0002-14, REQ-FEAT-0003-01, REQ-FEAT-0003-02, REQ-FEAT-0003-03, REQ-FEAT-0003-04, REQ-FEAT-0003-05, REQ-FEAT-0003-06, REQ-FEAT-0003-07, REQ-FEAT-0003-12, REQ-FEAT-0004-01, REQ-FEAT-0004-02, REQ-FEAT-0004-03, REQ-FEAT-0005-01, REQ-FEAT-0005-02, REQ-FEAT-0005-03, REQ-FEAT-0006-09]
---

# DES-0010 — Preparo offline do arquivo de pista da Kart Park

## Realiza

Os passos 1 a 8 de FLOW-0003: do arquivo de origem ao arquivo de pista gerado em esquema 3, com `trackId`
`kart-park`, `trackVersion` 1 e `schemaVersion` 3 (REQ-FEAT-0002-01, -02); os 684 pontos na ordem da origem,
volta fechada sem repetir o ponto 0 (REQ-FEAT-0002-03, -04); metros nos eixos do jogo, sentido anti-horário
(REQ-FEAT-0002-07, -08); a linha suavizada a no máximo 0,30 m da original, com o comprimento entre
680,625 m e 694,375 m e as bordas sem cruzamento (REQ-FEAT-0002-05, -10, -11); a largura de cada ponto copiada
(REQ-FEAT-0002-09); a largada (REQ-FEAT-0002-06); chegada, 3 limites de setor e marcadores a no máximo 25 m
como linhas transversais estendidas até `cutDistanceM` além da borda da pista ou até a barreira ou outra parte
da pista, sem limites de corte declarados (REQ-FEAT-0003-01 a -07), o que invalida o atalho da curva 4
(REQ-FEAT-0003-12); as 33 zebras levadas por índice fracionário, com a que cruza a largada dividida
(REQ-FEAT-0005-01, -02), cada uma com largura maior que 0 para fora da borda (REQ-FEAT-0005-03); a barreira
entre os trechos quase encostados, na grama (REQ-FEAT-0004-01 a -03); arquivo abaixo de 200.000 bytes e sem
recorde (REQ-FEAT-0002-14, REQ-FEAT-0006-09). O preparo fica fora do cliente (I10): o jogo não suaviza, não
converte e não edita pista.

## Posicionamento

- `scripts/trackPrep.ts`, **novo**, biblioteca pura do preparo; camada **dado de pista** (lugar na árvore:
  `scripts/`): produz dado de pista e importa só `src/track.ts`, `src/trackData.ts` e `src/trackGeometry.ts`.
- `scripts/track-pipeline.ts`, **novo**, programa em Node; camada **aplicação** (programa offline; lugar na
  árvore: `scripts/`), fora do cliente pela I2: lê e escreve arquivos com `node:fs`.
- `tracks/sources/kart-park.json`, **novo**: o arquivo de origem entregue pelo dono do produto (formato
  `kartle-pista` versão 1), copiado byte a byte pelo Curador do catálogo de
  `200 Requirements/220 Input/pista-kart-park/kart-park.json`; 32.189 bytes, SHA-256
  `52c5adda4ce89bd23a00e04a10d7e12a28900dd4d56414f444e0a4795f2c5302`. O preparo recusa uma origem com outro
  resumo, sem alterá-la.
- `package.json`, alterado: o script `"track": "tsx scripts/track-pipeline.ts"`; nenhuma dependência.

Motivo de serem novos: o preparo offline não existe (diretrizes do estágio). Biblioteca separada do programa,
como `scripts/handlingBench.ts` e `scripts/keyboard-lap.ts`, para que `npm test` prove a construção sem
escrever arquivos; verificações em outra biblioteca ([DES-0011](DES-0011-verificacoes-registro-de-publicacao-e-promocao.md)).
Decisão de linguagem e de empacotamento: [ADR-0002](../adr/ADR-0002-preparo-offline-em-typescript-e-arquivo-empacotado.md).

## Interface

`scripts/trackPrep.ts`:

| Símbolo | Assinatura | Descrição |
|---|---|---|
| `OriginTrack` | `{points: {x: number; y: number; widthM: number}[]; curbs: {side: 'LEFT' \| 'RIGHT'; fromM: number; toM: number}[]}` (m) | a origem lida: `pontos` `[x, y, largura]` (x leste, y norte, metros, a partir da largada, no sentido de corrida) e `zebras` `{lado, de_m, ate_m}`, com `esquerda` → `LEFT` e `direita` → `RIGHT` |
| `readOriginTrack(json)` | `(unknown) => OriginTrack \| {error: string}` | exige `formato` `kartle-pista`, `versao` 1, `sentido` `anti-horario`, `largada.indice` 0, pontos com 3 números finitos e largura positiva, zebras com `lado` conhecido e `de_m < ate_m`; não lê nem copia `nome`, `cidade`, `comprimento_m`, `comprimento_oficial_m`, `recorde` |
| `prepareTrack(origin, options)` | `(OriginTrack, {trackId: string; trackVersion: number}) => {file: Schema3File; prep: PrepRecord} \| {error: string}` | os passos abaixo; `PrepRecord` é o objeto `prep` do registro ([DM-0002](../data/DM-0002-registro-de-publicacao-e-estado-em-memoria.md)) |
| `serializeTrackFile(file)` | `(Schema3File) => string` | a serialização determinística de [DM-0001](../data/DM-0001-arquivo-de-pista-versao-de-esquema-3.md) |

Constantes de projeto ([ADR-0006](../adr/ADR-0006-lacunas-do-f-spec-resolvidas-no-projeto.md)):
`SMOOTH_LAMBDA` 0,5; `SMOOTH_MAX_OFFSET_M` 0,295; `SMOOTH_MAX_ITERATIONS` 400; `TARGET_LAP_LENGTH_M` 687,5;
`SECTOR_TARGETS_M` [201,6; 350,3; 529,9]; `MARKER_TARGET_SPACING_M` 18; `MIN_LINE_SPACING_M` 2;
`LINE_MARCH_STEP_M` 0,05; `CUT_DISTANCE_M` 3 (o padrão de `race-lap-validation`); `NEAR_SECTIONS_M`
[[371, 414], [580, 615]]; `BARRIER_GAP_MAX_M` 6; `EDGE_SAMPLE_M` 0,25; `CURB_WIDTH_M` 1,0;
`CURB_MIN_WIDTH_M` 0,3; `CURB_MIN_GRASS_M` 0,4; `OTHER_PART_LAP_M` 30; arredondamento a 0,001.

Passos de `prepareTrack`, em ordem:

1. **Conversão** (RULE-0002, eixos): `O_i = (x_i − cx, −(y_i − cy))`, com `(cx, cy)` o centro da caixa
   envolvente dos pontos da origem, arredondado a 0,001 m; a origem das coordenadas é o centro da pista. A
   linha central original é a poligonal fechada dos `O_i`; `d_o(i)` é a distância de volta nela.
2. **Suavização** com correspondência por índice: iteração de Jacobi `P_i ← P_i + λ((P_(i−1) + P_(i+1)) / 2 −
   P_i)`, índices em volta fechada, seguida de grampo `|P_i − O_i| <= 0,295 m` (projeção sobre o círculo em
   torno de `O_i`). O número de iterações `k` é o de 0 a 400 cujo comprimento da volta (das coordenadas já
   arredondadas) fica mais perto de 687,5 m; empate, o menor `k`. O grampo garante V07 por construção (o ponto
   `O_i` está na linha original, e 0,295 m mais o arredondamento ficam abaixo de 0,30 m).
3. **Larguras**: `widthM_i` igual à largura do ponto `i` da origem, arredondada a 0,001.
4. **Zebras**: para cada zebra da origem, índice fracionário de `de_m` e de `ate_m` em `d_o` e distância de
   volta correspondente na linha suavizada (RULE-0002); a zebra com `ate_m` maior que o comprimento da volta
   original cruza a largada e vira dois trechos do mesmo lado: do início correspondente até `lapLengthM` e de
   0 até o correspondente de `ate_m − comprimento original`; total 34. Largura: `CURB_WIDTH_M`, reduzida, por
   trecho, até deixar `CURB_MIN_GRASS_M` de grama entre a borda externa do trecho e o asfalto ou a zebra
   (largura nominal) de outra parte da volta (a mais de `OTHER_PART_LAP_M` de distância de volta); uma largura
   abaixo de `CURB_MIN_WIDTH_M` faz o preparo falhar, nomeando o trecho. Cada redução entra em
   `prep.reducedCurbs` com a folga que a limitou.
5. **Barreira**: amostras a cada `EDGE_SAMPLE_M` na borda do asfalto voltada para o outro trecho (a borda
   cujo segmento até o outro trecho não atravessa o asfalto do próprio trecho), nos pontos com `d_o` em cada
   trecho de `NEAR_SECTIONS_M`; para cada amostra `p` de um trecho, `q` é o ponto mais próximo das bordas do
   asfalto do outro; com `|p − q| <= 6 m`, o vértice da barreira é o meio da parte de `pq` que está na grama
   (entre a saída da pista de um trecho e a entrada na pista do outro). Os vértices dos dois sentidos são
   ordenados pela distância de volta do ponto mais próximo no primeiro trecho; cada sequência contínua (sem
   salto de distância de volta maior que 1 m) é uma barreira em `barriers`. Cada vértice está sobre um `pq` de
   6 m ou menos entre os asfaltos, o que dá V14 nos vértices e V13 para essas amostras, e na grama, o que dá
   V15 nos vértices; V13 para as demais amostras (as da borda de trás) e V14 e V15 entre vértices são
   verificados, não presumidos. Uma parte de grama
   menor que `2 * BARRIER_HALF_WIDTH_M` faz o preparo falhar: a superfície de contato encostaria na pista.
6. **Largada e chegada**: `finishLine` é a linha transversal no ponto 0; `startPosition` é o meio do segmento
   do ponto 0 ao ponto 1, com `headingDeg = atan2(dx, dz) * 180 / π` desse segmento.
7. **Limites de setor**: o ponto `i` que minimiza `|d_o(i) − D_k|` para cada `D_k` de `SECTOR_TARGETS_M`
   (empate, o menor `i`); a linha transversal nele.
8. **Marcadores**: `n = ceil(lapLengthM / 18)`, `s = lapLengthM / n`; o marcador `k` (de 0 a `n − 1`) fica no
   ponto cujo `d(i)` é o mais próximo de `s / 2 + k * s`; se esse ponto está a menos de 2 m de distância de
   volta do ponto 0 ou de um ponto de limite de setor, passa ao ponto mais próximo que não está (empate, o
   seguinte). Com `s <= 18 m`, o arredondamento ao ponto (cerca de 0,5 m) e o desvio de 2 m, dois marcadores
   consecutivos, inclusive o último e o primeiro passando pelo ponto 0, ficam a no máximo 23 m (V10); duas
   linhas consecutivas ficam a pelo menos 2 m (C7 v3).
9. **Linha transversal no ponto `i`** (RULE-0002): reta por `P_i` na direção `n_i`; de cada lado, a partir
   da borda da pista naquele ponto (borda do asfalto, ou a borda externa da zebra que cobre `d(i)` daquele
   lado), avança em passos de `LINE_MARCH_STEP_M` até `CUT_DISTANCE_M` além dela e para no primeiro passo que
   encontra outra parte da pista (`classifySurface` diferente de `grass`) — terminando no último ponto de
   grama — ou que cruza um segmento de barreira — terminando no ponto de cruzamento. Orientação: `from` é a
   ponta da esquerda e `to` a da direita no sentido de corrida, de modo que o percurso cruza a linha da direita
   para a esquerda de `from → to` (`crossLine` `FORWARD`, como as linhas da pista sintética).
10. **Identidade**: `schemaVersion` 3, `trackId`, `trackVersion`, `osmDerived` `true`, `direction`
    `COUNTER_CLOCKWISE` (o preparo falha se a área com sinal no plano (x, −z) não é positiva); sem
    `cutDistanceM`, `cutDurationMs`, nome, comprimento oficial ou recorde.

Comandos de `scripts/track-pipeline.ts` (`npm run track -- <comando> <trackId> <trackVersion>`):

| Comando | Efeito | Saída |
|---|---|---|
| `prepare kart-park 1` | confere o resumo da origem; `prepareTrack`; escreve `src/tracks/kart-park-v1.json` (arquivo temporário e renomeação); recusa se o par já está no registro | `PREPARED`, o caminho, `k`, o comprimento e as larguras reduzidas; código de saída 0, ou 1 com a mensagem de erro |
| `verify`, `publish`, `promote` | [DES-0011](DES-0011-verificacoes-registro-de-publicacao-e-promocao.md) | |

Argumentos de `scripts/track-pipeline.ts`, validados todos antes de ler o conteúdo de qualquer arquivo ou de
escrever qualquer arquivo (a única consulta ao disco da validação é a existência da origem de `<trackId>`, já
conferido contra o catálogo). Um valor fora da regra encerra o programa com código de saída 1 e a mensagem
`argumento inválido: <nome do argumento>`, que não reproduz o valor recebido, sem ler nem escrever arquivo:

| Argumento | Tipo e regra |
|---|---|
| `<comando>` | um de `prepare`, `verify`, `publish`, `promote` |
| `<trackId>` | cadeia de 1 a 40 caracteres em `[a-z0-9-]`, igual ao `trackId` de uma entrada de `TRAINING_TRACKS` ([DES-0005](../core/DES-0005-sessao-de-treino-catalogo-e-selecao-de-pista.md)) cujo arquivo de origem `tracks/sources/<trackId>.json` existe; hoje só `kart-park` (a pista sintética não tem origem em `tracks/sources/`). O caminho da origem, o caminho escrito `src/tracks/<trackId>-v<trackVersion>.json` e a chave do registro são montados só depois desta validação |
| `<trackVersion>` | cadeia de 1 a 6 dígitos decimais, sem sinal, sem zero à esquerda e sem separador; inteiro de 1 a 999999 |
| `--esri-decision <referência>` | aceito só com `promote`, obrigatório nele e no máximo uma vez; depois de retirados os espaços das pontas, cadeia de 1 a 200 caracteres sem caractere de controle (U+0000 a U+001F e U+007F a U+009F); é esse valor que `promote` grava em `esriDecisionRef` |
| qualquer outro argumento ou opção | recusado |

## Colaboradores

`scripts/trackPrep.ts` chama `buildTrackGeometry`, `classifySurface`, `positionAtLapM`, `lapMAtIndex`
(`src/trackGeometry.ts`) e `serializeTrackFile`. `scripts/track-pipeline.ts` chama a biblioteca, lê
`TRAINING_TRACKS` (`src/trainingSession.ts`) para validar `<trackId>`, e chama `node:fs`, `node:path` e
`node:crypto`. Chamados pelo Curador do catálogo (o programa) e por `npm test` (a biblioteca).

## Estado e concorrência

Sem estado: `prepareTrack` é função pura da origem e das opções. Executar `prepare` duas vezes com a mesma
origem escreve o mesmo arquivo, byte a byte. Um `prepare` de um par (`trackId`, `trackVersion`) já registrado é
recusado, sem escrever: uma versão publicada nunca é regenerada no lugar (I3).

## Comportamento em falha

Argumento fora da tabela de argumentos: código de saída 1, a mensagem nomeia o argumento e não reproduz o
valor, nada lido nem escrito. Origem ausente, com outro resumo, de formato desconhecido ou fora das
restrições: erro nomeado, nada escrito.
Zebra que não cabe, barreira sem grama suficiente ou sentido horário: erro nomeado, nada escrito. Falha no
meio da escrita: o temporário fica para trás e o arquivo publicado anterior, se existe, não é tocado. Sem rede,
sem tempo-limite; nova tentativa é executar de novo. A saída lista só identificadores, contagens e medidas, nunca
o conteúdo do arquivo.

## Determinismo (D-DS-07)

Aritmética em ordem fixa, sem relógio nem sorteio. Prova em `tests/pista-kart-park-prep.test.ts`:
`prepareTrack` sobre `tracks/sources/kart-park.json` com `trackVersion` 1 seguido de `serializeTrackFile` dá
exatamente os bytes de `src/tracks/kart-park-v1.json` (o arquivo publicado é reproduzível) e duas execuções dão
o mesmo texto; `readOriginTrack` recusa uma cópia com `formato` trocado e uma com zebra de `lado` desconhecido.

## Feature flag

Nenhuma: programa offline executado pelo Curador; não roda no cliente.

## Pontos em aberto

Nenhum.
