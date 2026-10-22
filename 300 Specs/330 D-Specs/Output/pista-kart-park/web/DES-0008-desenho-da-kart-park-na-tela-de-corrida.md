---
id: DES-0008
title: Desenho da Kart Park na tela de corrida — asfalto, zebras, barreira, linha de largada e minimapa
feature: pista-kart-park
stage: dspec
status: validated
version: 1.0.0
sources: [SCR-0003, FLOW-0002, FEAT-0002, FEAT-0004, FEAT-0005, FEAT-0007, REQ-FEAT-0002-13, REQ-FEAT-0004-08, REQ-FEAT-0005-04, REQ-FEAT-0007-01, REQ-FEAT-0007-02]
---

# DES-0008 — Desenho da Kart Park na tela de corrida

## Realiza

Os acréscimos de SCR-0003: a tela de corrida desenha o asfalto da Kart Park com a linha central e as larguras
do arquivo (REQ-FEAT-0002-13), cada barreira em todo o seu comprimento (REQ-FEAT-0004-08) e cada trecho de
zebra no lado e no trecho declarados (REQ-FEAT-0005-04), sustentando 60 fps em notebook e 30 fps em celular
intermediário numa volta completa (REQ-FEAT-0007-01, -02). A tela só desenha o dado: nenhuma regra de pista
é decidida aqui (I2).

## Posicionamento

- `src/trackScene.ts`, camada **aplicação**, **novo**: constrói, a partir de uma `TrackGeometry`
  ([DES-0002](../core/DES-0002-geometria-da-pista-declarada-no-arquivo.md)), o grupo Three.js de uma pista em
  esquema 3 e a transformação do minimapa. Motivo de ser novo: o desenho precisa de prova em `npm test`
  (AC-US-0002-08, AC-US-0004-06, AC-US-0005-03), e `src/main.ts` não carrega lá; `three` constrói geometria em
  Node sem WebGL. Não acessa o DOM.
- `src/main.ts`, camada **aplicação**, alterado: agrupa a cena atual da pista sintética e alterna os grupos
  pela sessão.

## Interface

`src/trackScene.ts`:

| Símbolo | Assinatura | Descrição |
|---|---|---|
| `CURB_STRIPE_M` | `1` | comprimento de cada faixa vermelha ou branca da zebra, m de distância de volta |
| `buildTrackScene(geometry)` | `(TrackGeometry) => THREE.Group` | grupo com quatro filhos nomeados: `asphalt`, `curbs`, `barriers`, `start-line` |
| `minimapTransform(bounds)` | `({minX, maxX, minZ, maxZ}) => {scale: number; offsetX: number; offsetY: number}` (escala em px/m, deslocamentos em px) | encaixa a caixa da pista em 200 × 130 px, centrada no canvas de 220 × 150 px |

Conteúdo do grupo:

| Filho | Geometria | Aparência |
|---|---|---|
| `asphalt` | uma `BufferGeometry`: os pontos `leftEdge[i]` e `rightEdge[i]` da geometria a `y` 0,03, dois triângulos por segmento, volta fechada | `#434d48`, a cor do asfalto da pista sintética (`src/main.ts:65`) |
| `curbs` | uma `BufferGeometry` com cores por vértice: os quadriláteros de zebra da geometria, subdivididos a cada `CURB_STRIPE_M` de distância de volta, a `y` 0,035 | faixas alternadas `#c8423b` e `#f0e9d5` |
| `barriers` | `InstancedMesh` de caixa unitária, uma instância por segmento de barreira: comprimento do segmento, largura `2 * BARRIER_HALF_WIDTH_M`, altura 0,9 m, centrada no meio do segmento, girada no rumo dele | `#e6dfc9`, projeta sombra |
| `start-line` | quadrados de 1,1 × 0,7 m alternados, atravessando o asfalto no ponto 0 ao longo da normal, a `y` 0,055 | `#eff0df` e `#25362f`, como a linha da pista sintética (`:92-96`) |

Sem árvores, tribuna ou cerca: o cenário além de asfalto, zebra, grama e barreiras é de outra feature
(`SEED/FE-05`).

`src/main.ts`, por trecho atual:

| Trecho atual | Mudança |
|---|---|
| `:44-110` cena da pista sintética (faixas, zebras decorativas, caixas do muro, linha de largada, árvores) | os mesmos objetos, com os mesmos valores, passam a ser filhos de `syntheticScene = new THREE.Group()` em vez de `scene` |
| troca de sessão (`chooseTrack`, [DES-0007](DES-0007-tela-inicial-seletor-credito-e-resultado.md)) | `syntheticScene.visible` com a pista sintética `READY`; com a Kart Park `READY`, `buildTrackScene` na primeira vez (guardado em `trackScenes[trackId]`) e `visible` verdadeiro; com `FAILED`, nenhum grupo de pista visível; as extensões da câmera de sombra (`:34`) passam a `max(120, maior coordenada absoluta da caixa + 10)` |
| `:289-297` `minimap` | desenha a linha central da sessão: na pista sintética, a transformação literal de hoje (`* 1.1 + 110`, `* 1.1 + 75`); na Kart Park, `minimapTransform(geometry.bounds)`; sem sessão pronta, só limpa o canvas |
| `:363-364` câmera de visão geral | inalterada: o preparo centra as coordenadas da Kart Park na origem ([DES-0010](../pipeline/DES-0010-preparo-offline-do-arquivo-da-kart-park.md)) |

## Colaboradores

Chama `three` e lê `TrackGeometry`, `BARRIER_HALF_WIDTH_M` de `src/trackGeometry.ts`. É chamado por
`src/main.ts` e pelos testes. Não chama a simulação nem o DOM.

## Estado e concorrência

O grupo de cada pista é construído uma vez por página e guardado; trocar de pista só alterna `visible`. Nada é
persistido.

## Comportamento em falha

Sem WebGL o jogo já mostra a mensagem de `src/main.ts:22` e para; `buildTrackScene` não depende de WebGL. Uma
geometria sem zebra ou sem barreira dá filhos vazios. Sem rede, sem escrita, sem registro.

## Desempenho (REQ-FEAT-0007-01, -02)

A Kart Park acrescenta 3 objetos desenháveis (asfalto e zebras numa geometria cada, barreiras numa
`InstancedMesh`) mais a linha de largada, contra as 300 caixas (240 de zebra decorativa e 60 de muro,
`src/main.ts:77-90`) e as até 90 árvores (`:99-110`) da cena sintética, que fica oculta. A simulação na Kart Park consulta a grade da geometria ([DES-0002](../core/DES-0002-geometria-da-pista-declarada-no-arquivo.md)).
A métrica que mostraria o limite sendo perdido é a taxa de quadros sustentada numa volta completa, registrada
no notebook e no celular intermediário de referência de RNF03 (E2E-03 e E2E-05 em
`docs/kart-park-device-log.md`); uma execução em desktop não vale para celular. Nenhuma configuração reduz o
desenho para cumprir o limite (FEAT-0007).

## Observabilidade

`tests/pista-kart-park-scene.test.ts` constrói o grupo em Node a partir do arquivo publicado e afirma: os
vértices de `asphalt` são os `leftEdge`/`rightEdge` da geometria, que vêm da linha central e das larguras do
arquivo; cada faixa de `curbs` fica do lado `side` do seu trecho (produto escalar com a normal do ponto, com o
sinal do lado) e entre `fromLapM` e `toLapM`; `barriers` tem uma instância por segmento e a soma dos
comprimentos das instâncias é o comprimento de cada poligonal; `minimapTransform` põe a caixa inteira dentro do
canvas.

## Determinismo (D-DS-07)

Não é código de simulação; a construção é determinística a partir da geometria.

## Feature flag

Nenhuma: o desenho segue a sessão; não há configuração de qualidade de desenho (FEAT-0007).

## Pontos em aberto

Nenhum.
