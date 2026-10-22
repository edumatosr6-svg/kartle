---
id: RULE-0001
title: Superfície, borda da pista e obstáculos na Kart Park
feature: pista-kart-park
stage: fspec
status: validated
version: 1.0.0
sources: [US-0003, US-0004, US-0005, NFR-0007, AC-US-0003-07, AC-US-0003-08, AC-US-0004-02, AC-US-0004-04, AC-US-0004-05, AC-US-0005-04, AC-US-0005-05, AC-US-0005-06]
---

# RULE-0001 — Superfície, borda da pista e obstáculos na Kart Park

Decide, a cada passo de `STEP`, a superfície sob cada roda, a aderência de cada pneu, a distância do kart
além da borda da pista e a colisão com os obstáculos. Decidido na simulação, a partir do dado da pista
([API-0001](../api/API-0001-dado-de-pista-com-geometria-zebras-e-barreiras.md)); a apresentação só lê o
resultado ([API-0003](../api/API-0003-contato-do-kart-com-a-pista.md)) (I2, NFR-0007). Fontes: `DOMAIN/DEC-03`,
`DOMAIN/DEC-05`, `DOMAIN/DEC-10` e os critérios citados em cada linha.

## Geometria lida do arquivo

| Elemento | Definição | Fonte |
|---|---|---|
| Normal no ponto *i* | Vetor unitário perpendicular à direção do ponto *i* − 1 ao ponto *i* + 1 (índices em volta fechada), apontando para a esquerda do sentido de corrida | AC-US-0002-07 via [RULE-0002](RULE-0002-geometria-e-verificacoes-do-arquivo-de-pista.md) |
| Borda esquerda e borda direita do asfalto | Os pontos *P*ᵢ + *n*ᵢ · `widthM`ᵢ / 2 e *P*ᵢ − *n*ᵢ · `widthM`ᵢ / 2, ligados em volta fechada | AC-US-0002-05 |
| Asfalto | União dos quadriláteros entre as duas bordas de cada segmento, do ponto *i* ao ponto *i* + 1 | AC-US-0002-08 |
| Posição de uma distância de volta | O ponto da linha central suavizada àquela distância do ponto 0, no sentido de corrida; entre dois pontos, borda e normal são interpoladas linearmente | AC-US-0005-02 |
| Zebra | Para cada trecho de `curbs`: a faixa entre a borda do asfalto do lado `side` e a poligonal deslocada `widthM` para fora ao longo da normal, entre as posições de `fromLapM` e `toLapM` | AC-US-0005-03, AC-US-0005-04 |
| Pista | Asfalto mais zebras | AC-US-0005-04 |
| Borda da pista | O limite externo da pista: em cada lado e em cada posição, a borda externa da zebra se houver zebra ali, senão a borda do asfalto | AC-US-0005-04, AC-US-0005-05 |
| Grama | Tudo o que não é pista | `DOMAIN/DEC-05` |

## Tabela de decisão — superfície e aderência de cada roda (por passo)

| Posição da roda no fim do passo | `wheelSurfaces` | `wheelGripPc` | Outras regras de superfície | Fonte |
|---|---|---|---|---|
| Sobre o asfalto | `ASPHALT` | 1 | As do asfalto, sem mudança | AC-US-0005-06 |
| Fora do asfalto e dentro de uma zebra | `CURB` | 0,85: a força máxima que o pneu transmite, com a mesma carga e o mesmo escorregamento, é 0,85 da do mesmo pneu no asfalto | As do asfalto: a perda de velocidade da grama (RF08) não se aplica | AC-US-0005-06; AC-US-0005-04 |
| Fora da pista | `GRASS` | A da regra da grama existente, sem mudança | As da grama, sem mudança | `DOMAIN/DEC-05` (≈ 40 %, referência, não alterada) |

O asfalto tem precedência sobre a zebra e a zebra sobre a grama: uma roda sobre o asfalto é `ASPHALT` mesmo
que a faixa de uma zebra a alcance. `curbWheelCount` é o número de rodas em `CURB`.

## Tabela de decisão — saída de pista e corte (por passo em `RUNNING`)

| Posição do kart | `beyondTrackEdgeM` | Efeito | Fonte |
|---|---|---|---|
| Sobre a pista (asfalto ou zebra) | 0 | Nenhuma saída de pista; a duração contínua do corte volta a 0 | AC-US-0005-04, AC-US-0005-05 |
| Além da borda da pista, a 3 m ou menos | A distância até a borda da pista | Saída de pista sem corte; a duração contínua volta a 0 | AC-US-0003-08 |
| Além da borda da pista, a mais de 3 m | A distância até a borda da pista | A duração contínua avança um `STEP`; ao passar de 1000 ms, corte (`CUT`) neste passo | AC-US-0003-07, AC-US-0003-08 |

A regra de corte é a de `race-lap-validation`, sem mudança, com os padrões `cutDistanceM` 3 m e
`cutDurationMs` 1000 ms; "a mais de" e "a ... ou menos" são estritos como escritos. O que esta regra fixa é
a borda a partir da qual a distância é medida: a borda da pista, que inclui a zebra. Na pista sintética,
sem zebra, a borda da pista é a borda do asfalto, como antes.

## Obstáculos e colisão

| Regra | Fonte |
|---|---|
| Na Kart Park, os únicos obstáculos são as barreiras de `barriers`; nenhum muro é derivado da linha central | AC-US-0004-02; `DOMAIN/DEC-10` |
| Cada barreira é a poligonal aberta dos seus pontos e bloqueia dos dois lados | AC-US-0004-04; `DOMAIN/DEC-03` |
| O contato é decidido no trajeto do kart durante o passo, não só na posição final: em nenhum passo, em nenhuma velocidade que o kart alcance, o kart termina do outro lado de uma barreira | AC-US-0004-04 |
| A resposta ao contato é a do muro existente: para a mesma velocidade, o mesmo ângulo de impacto e o mesmo `Input`, a velocidade e a posição do kart no referencial local do obstáculo (origem no ponto de contato, eixos na normal e na tangente da superfície) são as mesmas a cada passo desde o contato | AC-US-0004-05 |
| `barrierContact` é verdadeiro só no passo em que o kart entra em contato com uma barreira; continua falso enquanto ele raspa ou fica encostado depois desse passo | AC-US-0004-05 |
| A colisão com a barreira não muda a validade da volta por si; o kart que bate está na grama e segue a tabela de corte acima | AC-US-0003-07 |

## Idempotência e ordem

Superfície, aderência, `beyondTrackEdgeM` e `barrierContact` são funções da posição e do trajeto do kart
no passo, calculadas uma vez por passo e ordenadas por `simStepCount`; reaplicar um passo não existe. A
única grandeza acumulada é a duração contínua do corte, de `race-lap-validation`, que avança só por passo em
`RUNNING` e cujo contador de sequência é o `stepCount` da volta. Na suspensão (pausa, perda de foco, perda
do sensor) nada avança.
