---
id: RULE-0002
title: Geometria e verificações do arquivo de pista gerado
feature: pista-kart-park
stage: fspec
status: validated
version: 1.0.0
sources: [US-0002, US-0003, US-0004, US-0005, NFR-0001, NFR-0006, AC-US-0002-01, AC-US-0002-02, AC-US-0002-03, AC-US-0002-04, AC-US-0002-05, AC-US-0002-06, AC-US-0002-07, AC-US-0003-01, AC-US-0003-02, AC-US-0003-03, AC-US-0003-04, AC-US-0004-01, AC-US-0004-02, AC-US-0004-03, AC-US-0005-01, AC-US-0005-02, AC-US-0006-09]
---

# RULE-0002 — Geometria e verificações do arquivo de pista gerado

Define as medidas que o arquivo de pista gerado usa e as verificações que ele passa antes de ser publicado
([FLOW-0003](../flows/FLOW-0003-preparo-e-publicacao-do-arquivo-de-pista.md)). Cada verificação é
determinística: lê o arquivo gerado e, quando indicado, o arquivo de origem, sem simulação nem renderização
(NFR-0007). Todo número vem dos requisitos (`SEED/MED`, `DOMAIN/DEC-03`, `DOMAIN/DEC-09`, `DOMAIN/DEC-10`).

## Medidas

| Medida | Definição | Fonte |
|---|---|---|
| Linha central original | Os pontos do arquivo de origem, na ordem, convertidos para metros nos eixos do jogo, ligados em volta fechada | `SEED/RE-03` via US-0002 |
| *P*ᵢ | O ponto *i* de `centerline`, de 0 a 683 | AC-US-0002-05 |
| Distância de volta *d*(*i*) | Soma dos comprimentos dos segmentos de `centerline` do ponto 0 ao ponto *i*; o comprimento da volta é a soma dos 684 segmentos, inclusive do ponto 683 ao ponto 0 | AC-US-0002-02 |
| Distância de volta na linha original *d*ₒ(*i*) | A mesma soma, feita na linha central original | AC-US-0003-02 |
| Índice fracionário de uma distância *D* da linha original | *i* + *f*, com *d*ₒ(*i*) ≤ *D* < *d*ₒ(*i* + 1) e *f* = (*D* − *d*ₒ(*i*)) / (*d*ₒ(*i* + 1) − *d*ₒ(*i*)) | AC-US-0005-02 |
| Distância de volta correspondente | Para o índice fracionário *i* + *f*: *d*(*i*) + *f* · \|*P*ᵢ₊₁ − *P*ᵢ\| | AC-US-0005-02 |
| Normal, bordas do asfalto, zebra, borda da pista | Como em [RULE-0001](RULE-0001-superficie-borda-da-pista-e-obstaculos.md) | AC-US-0002-07 |
| Linha transversal no ponto *i* | Segmento sobre a reta por *P*ᵢ na direção da normal *n*ᵢ: de cada lado, vai da borda da pista mais `cutDistanceM` (3 m), parando antes, se a extensão além da borda da pista encontrar pista ou barreira; orientada como o contrato de linha de `race-lap-validation` exige para o sentido de corrida | AC-US-0003-04, AC-US-0003-09, AC-US-0003-10 |
| Área com sinal | Fórmula da área do polígono de `centerline` com as coordenadas (*x*, −*z*), na ordem dos pontos; positiva significa anti-horário visto de cima | AC-US-0002-04 |

## Verificações do arquivo gerado

Todas precisam passar para o arquivo ser publicado. "Igual", para um valor gravado com arredondamento,
significa diferir no máximo meia unidade da última casa decimal gravada.

| # | Verificação | Passa quando | Fonte |
|---|---|---|---|
| V01 | Correspondência | `centerline` tem o mesmo número de pontos que a origem (684); o ponto *i* gerado é o ponto *i* da origem depois da suavização, sem ponto acrescentado, retirado ou reordenado | AC-US-0002-05, AC-US-0002-06 |
| V02 | Volta fechada | `centerline` tem ao menos 3 pontos, e o último ponto é diferente do ponto 0 (o ponto 0 não é repetido; a volta fecha do último ao ponto 0) | AC-US-0002-01 |
| V03 | Comprimento | O comprimento da volta está entre 680,625 m e 694,375 m, inclusive | AC-US-0002-02 |
| V04 | Largada e chegada | `finishLine` é a linha transversal no ponto 0; `startPosition` está sobre o segmento do ponto 0 ao ponto 1, do lado de depois da `finishLine` no sentido de corrida e antes do ponto 1, com `headingDeg` igual ao rumo desse segmento | AC-US-0002-03, AC-US-0003-03 |
| V05 | Sentido | A área com sinal é positiva e `direction` é `COUNTER_CLOCKWISE` | AC-US-0002-04 |
| V06 | Largura | Para todo *i*, `widthM` do ponto *i* é igual à largura do ponto *i* da origem; o menor valor é 4,4 m e o maior 10,8 m | AC-US-0002-05 |
| V07 | Tolerância da suavização | Para todo *i*, a distância de *P*ᵢ até a poligonal fechada original é de no máximo 0,30 m | AC-US-0002-06 |
| V08 | Bordas | A borda esquerda e a borda direita do asfalto, em volta fechada, não têm autointerseção e não se cruzam; isso inclui o grampo de raio ≈ 6 m perto de 218 m | AC-US-0002-07 |
| V09 | Setores | `sectorLimits` tem 3 linhas, em ordem de distância de volta, e a *k*-ésima é a linha transversal no ponto *i* que minimiza \|*d*ₒ(*i*) − *D*ₖ\|, com *D* = 201,6 m, 350,3 m e 529,9 m | AC-US-0003-01, AC-US-0003-02 |
| V10 | Marcadores | Cada item de `markers` é a linha transversal num ponto da linha central; os pontos estão em ordem crescente de *d*(*i*); nenhum é o ponto 0 nem um ponto de V09; a diferença de *d* entre marcadores consecutivos, e do último ao primeiro passando pelo ponto 0 (comprimento da volta menos a distância do último mais a distância do primeiro), é de no máximo 25 m | AC-US-0003-04 |
| V11 | Extensão das linhas | Para `finishLine`, cada limite de setor e cada marcador: o segmento cobre a pista no seu ponto de borda a borda; cada ponta fica a `cutDistanceM` além da borda da pista, ou antes, no primeiro encontro da extensão com pista ou barreira; a parte além da borda da pista está toda na grama | AC-US-0003-05, AC-US-0003-09, AC-US-0003-10 |
| V12 | Zebras | `curbs` tem 34 trechos; para cada um dos 32 trechos da origem que não cruzam o ponto 0, um trecho gerado com o mesmo lado e com `fromLapM` e `toLapM` iguais às distâncias de volta correspondentes ao início e ao fim declarados; para o trecho da origem que cruza o ponto 0, dois trechos do mesmo lado, um do início correspondente ao comprimento da volta e outro de 0 ao fim correspondente; todo trecho com `fromLapM` menor que `toLapM` e `widthM` maior que 0 | AC-US-0005-01, AC-US-0005-02 |
| V13 | Cobertura da barreira | Para todo ponto *p* das bordas do asfalto do trecho de *d*ₒ 371 m a 414 m, seja *q* o ponto das bordas do asfalto do trecho de *d*ₒ 580 m a 615 m mais próximo de *p*: se \|*p* − *q*\| é de 6 m ou menos, o segmento *pq* cruza uma barreira; e o mesmo trocando os dois trechos | AC-US-0004-01 |
| V14 | Limite da barreira | Para todo ponto de toda barreira, a soma das distâncias até o asfalto dos pontos de 371 m a 414 m e até o asfalto dos pontos de 580 m a 615 m (*d*ₒ) é de no máximo 6 m | AC-US-0004-02 |
| V15 | Barreira fora do asfalto | Nenhuma barreira tem ponto, nem trecho entre pontos, dentro do asfalto | AC-US-0004-03 |
| V16 | Identidade | `schemaVersion` 3, `trackId` `kart-park`, `trackVersion` 1, `osmDerived` verdadeiro; `cutDistanceM` e `cutDurationMs` ausentes | NFR-0006, AC-US-0003-07 |
| V17 | Tamanho | O arquivo, como é entregue ao navegador, tem menos de 200.000 bytes | NFR-0001 |
| V18 | Sem recorde | O arquivo não tem campo de recorde, de tempo da pista real nem de comprimento oficial | AC-US-0006-09 |

Os intervalos de 371–414 m e 580–615 m e o ponto de 218 m são os medidos pelo seed na linha original
(`SEED/MED`); por isso as verificações os aplicam em *d*ₒ. O grampo perto de 78 m, também de raio ≈ 6 m,
está coberto por V08, que vale para a volta inteira.

## Idempotência e ordem

As verificações são funções puras dos dois arquivos: repeti-las dá o mesmo resultado, e nenhuma altera
arquivo. A ordem não importa; a publicação exige todas aprovadas ([RULE-0005](RULE-0005-versao-e-publicacao-da-pista.md)).
