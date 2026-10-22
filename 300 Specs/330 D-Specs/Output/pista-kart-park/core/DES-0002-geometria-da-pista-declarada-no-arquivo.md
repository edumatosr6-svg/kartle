---
id: DES-0002
title: Geometria da pista declarada no arquivo — bordas, zebras, borda da pista e barreiras
feature: pista-kart-park
stage: dspec
status: validated
version: 1.0.0
sources: [RULE-0001, RULE-0002, FEAT-0002, FEAT-0003, FEAT-0005, REQ-FEAT-0002-12, REQ-FEAT-0003-06, REQ-FEAT-0003-10, REQ-FEAT-0005-03, REQ-FEAT-0005-05, REQ-FEAT-0005-06, REQ-FEAT-0005-07]
---

# DES-0002 — Geometria da pista declarada no arquivo

## Realiza

As definições geométricas de RULE-0001 e RULE-0002 sobre um arquivo em esquema 3, num único lugar que a
simulação, o leitor e o preparo offline usam: normal, bordas do asfalto, asfalto, zebra como faixa para fora
da borda do lado declarado, pista, borda da pista, distância de volta e posição de uma distância de volta
(REQ-FEAT-0003-06, REQ-FEAT-0005-03); a classificação de um ponto em asfalto, zebra ou grama
(REQ-FEAT-0005-05); a distância além da borda da pista, 0 sobre o asfalto ou a zebra (REQ-FEAT-0005-06,
-07; REQ-FEAT-0003-10); tudo a partir da linha central e das larguras exatamente como declaradas
(REQ-FEAT-0002-12).

## Posicionamento

`src/trackGeometry.ts`, camada **dado de pista**, **novo**. Importa só `src/track.ts` (tipos `Point`, `Line`
e a primitiva `crossLine`). Motivo de ser novo: `src/track.ts` guarda a pista sintética constante e é
importado por todo teste e bench existente, e congelado por NFR-0008 de `dirigibilidade`; a geometria de
qualquer arquivo em esquema 3 é consultada a cada passo pela simulação e reusada pelo leitor e pelo preparo,
e não cabe no leitor ([01-architecture](../01-architecture.md)).

## Interface

Unidades: metros e radianos; `Point` é `{x, z}` de `src/track.ts`.

| Símbolo | Assinatura | Descrição |
|---|---|---|
| `TrackPoint`, `CurbSpan`, `BarrierLine` | tipos de DM-0001 | entrada |
| `TrackSurface` | `'asphalt' \| 'curb' \| 'grass'` | os mesmos valores do `Surface` da física |
| `GRID_CELL_M` | `8` | lado da célula da grade de busca, m |
| `BARRIER_HALF_WIDTH_M` | `0.1` | meia espessura de contato de uma barreira, m ([ADR-0003](../adr/ADR-0003-colisao-com-a-barreira.md)) |
| `BARRIER_TOUCH_TOLERANCE_M` | `0.01` | folga além da superfície de contato em que o kart ainda conta como encostado, m |
| `TrackGeometry` | `{centerline: readonly TrackPoint[]; curbs: readonly CurbSpan[]; barriers: readonly BarrierLine[]; lapLengthM: number; cumulativeM: readonly number[]; normals: readonly Point[]; leftEdge: readonly Point[]; rightEdge: readonly Point[]; asphaltQuads; curbQuads; barrierSegments: readonly {a: Point; b: Point}[]; bounds: {minX, maxX, minZ, maxZ}; grid}` | estrutura imutável (congelada), construída uma vez por arquivo |
| `buildTrackGeometry(centerline, curbs, barriers)` | `(TrackPoint[], CurbSpan[], BarrierLine[]) => TrackGeometry` | constrói as definições abaixo; nunca lança para entradas já validadas pelo leitor |
| `classifySurface(g, p)` | `(TrackGeometry, Point) => TrackSurface` | `asphalt` dentro de algum quadrilátero de asfalto; senão `curb` dentro de algum quadrilátero de zebra; senão `grass` (precedência de RULE-0001) |
| `beyondTrackEdgeM(g, p)` | `(TrackGeometry, Point) => number` (m, ≥ 0) | 0 dentro do asfalto ou de uma zebra; senão a menor distância de `p` a um quadrilátero de asfalto ou de zebra, que é a distância à borda da pista |
| `nearestOnCenterline(g, p)` | `(TrackGeometry, Point) => {index, fraction, position: Point, distanceM, headingRad}` | ponto mais próximo da linha central fechada; `headingRad` é o rumo do segmento na convenção da física (`atan2(dx, dz)`) |
| `lapMAtIndex(g, i, f)` | `(TrackGeometry, number, number) => number` (m) | distância de volta do índice fracionário `i + f`: `cumulativeM[i] + f * comprimento do segmento i` |
| `positionAtLapM(g, lapM)` | `(TrackGeometry, number) => {index, fraction, center: Point, normal: Point, leftEdge: Point, rightEdge: Point}` | posição de uma distância de volta, com borda e normal interpoladas linearmente entre os pontos (RULE-0001) |
| `nearestBarrier(g, p)` | `(TrackGeometry, Point) => {distanceM, point: Point, segment: number} \| undefined` | barreira mais próxima de `p`; `undefined` sem barreira |

Definições (RULE-0001, RULE-0002), com índices em volta fechada:

- normal `n_i`: unitária, perpendicular a `P_(i+1) − P_(i−1)`, à esquerda do sentido de corrida: para
  `d = P_(i+1) − P_(i−1)`, `n_i = (d.z, −d.x) / |d|` (a mesma "esquerda" de `src/physics.ts:119` e de
  `tests/helpers/geometry.ts`);
- bordas: `L_i = P_i + n_i * widthM_i / 2` e `R_i = P_i − n_i * widthM_i / 2`;
- asfalto: os quadriláteros `[L_i, L_(i+1), R_(i+1), R_i]`, um por segmento;
- zebra: para cada trecho, quadriláteros entre a borda do lado `side` e a mesma borda deslocada `widthM` para
  fora (`+n` em `LEFT`, `−n` em `RIGHT`), com pontos de quebra em `fromLapM`, em cada ponto da linha central
  estritamente dentro do trecho e em `toLapM`; nos extremos fracionários, borda e normal são interpoladas
  linearmente, sem renormalizar;
- `cumulativeM[i]`: soma dos segmentos do ponto 0 ao ponto `i`; `lapLengthM` inclui o segmento do último
  ponto ao ponto 0.

Ponto dentro de um quadrilátero: teste do número de cruzamentos sobre os 4 vértices; ponto na fronteira
conta como dentro. A grade (`grid`) guarda, por célula de `GRID_CELL_M`, os quadriláteros cuja caixa
envolvente a toca: `classifySurface` consulta só os quadriláteros da célula do ponto (fora da caixa da pista
é `grass`); `beyondTrackEdgeM` usa a grade para decidir "dentro" e, fora, varre todos os quadriláteros, o que
dá a distância exata. A grade só poda candidatos: o resultado é sempre igual ao da varredura completa.

## Colaboradores

Chamado por `src/trackData.ts` (consistência da versão 3, [DES-0001](DES-0001-leitura-do-dado-de-pista-em-esquema-3.md)),
`src/physics.ts` (superfície, barreira e borda, [DES-0003](DES-0003-superficie-por-roda-zebra-e-barreira.md)),
`src/lap.ts` (reposicionamento, [DES-0004](DES-0004-volta-na-kart-park-corte-e-reposicionamento.md)),
`src/trainingSession.ts`, `src/trackScene.ts`, `scripts/trackPrep.ts`, `scripts/trackChecks.ts` e os testes.
Não chama nenhuma camada externa.

## Estado e concorrência

A geometria é construída uma vez e congelada; todas as consultas são funções puras dela e do ponto. Nada é
memorizado entre chamadas, de modo que consultar duas vezes dá o mesmo valor e não existe retentativa a
absorver.

## Comportamento em falha

Entradas inválidas não chegam aqui: o leitor as classifica `UNREADABLE` antes (DM-0001, ordens 6 e 7). Um
segmento de comprimento zero (dois pontos iguais) não tem normal definida pela diferença dos vizinhos só se
`P_(i−1) = P_(i+1)`; nesse caso a normal é a do segmento `i` e, se também nula, a do ponto anterior — regra
determinística, coberta por teste com um arquivo de fixture. Sem rede, sem escrita, sem registro.

## Desempenho

Por passo de `STEP` a física chama `classifySurface` 4 vezes no início do passo e 5 vezes em cada um dos 4
subpassos (24 por passo), e a volta chama `beyondTrackEdgeM` uma vez. Com a grade, cada `classifySurface` testa os poucos
quadriláteros de uma célula em vez dos cerca de 700 da Kart Park; o custo fica na mesma ordem do `nearest` da
pista sintética (240 segmentos), o que sustenta os limites de quadros de REQ-FEAT-0007-01 e -02
([DES-0008](../web/DES-0008-desenho-da-kart-park-na-tela-de-corrida.md)).

## Determinismo (D-DS-07)

Pura: sem relógio, sem sorteio, sem DOM; aritmética em ordem fixa (a ordem dos pontos e dos trechos do
arquivo). Prova em `tests/pista-kart-park-geometry.test.ts`: em pontos amostrados numa malha de 0,5 m sobre a
caixa da Kart Park, `classifySurface` e `beyondTrackEdgeM` com grade são iguais aos da varredura completa;
um ponto no centro da faixa de cada zebra é `curb`, um ponto a 0,05 m para dentro da borda do asfalto é
`asphalt`, um ponto a 0,05 m além da borda externa da zebra é `grass` com `beyondTrackEdgeM` 0,05 (± 1e-9);
`buildTrackGeometry` chamado duas vezes dá estruturas `deepEqual`.

## Feature flag

Nenhuma: biblioteca de definições; sem `track` no ambiente, nada a chama.

## Pontos em aberto

Nenhum.
