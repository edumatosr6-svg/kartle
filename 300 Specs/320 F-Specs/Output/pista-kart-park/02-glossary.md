---
title: Glossário — pista Kart Park
feature: pista-kart-park
stage: fspec
status: validated
version: 1.0.0
sources: []
---

# Glossário

Os termos valem igualmente em `web-desktop` e `web-mobile`, salvo indicação. Os termos de domínio vêm do
glossário dos requisitos; as definições geométricas e as linhas de enum e de campo são as dos contratos de
`api/` e das regras de `rules/`.

## Termos de domínio

| Termo | Definição |
|---|---|
| Jogador | Quem escolhe a pista no treino e pilota o kart, com teclado (`web-desktop`) ou com inclinação e toque (`web-mobile`) |
| Curador do catálogo | Quem prepara offline o arquivo de pista da Kart Park: conversão, suavização, linhas de volta, zebras, barreira, verificação e versão |
| Kart Park | Pista real de São José dos Pinhais (PR), `trackId` `kart-park`; primeira pista real do Kartle |
| Pista sintética | A pista que o jogo já tem, `trackId` `synthetic`; continua selecionável e continua sendo a pista dos ensaios automáticos de `dirigibilidade` e de `race-lap-validation` |
| Tela inicial | A tela de início de volta de `race-lap-validation`, onde o Jogador escolhe iniciar uma volta, acrescida do seletor de pista |
| Seletor de pista | Controle da tela inicial com duas opções, a Kart Park e a pista sintética; escolher uma opção carrega aquela pista no treino |
| Catálogo do treino | A lista fixa das pistas que o seletor oferece, com o nome, o comprimento exibido e a indicação de crédito OSM de cada uma ([API-0002](api/API-0002-catalogo-e-selecao-da-pista-do-treino.md)) |
| Treino | Pilotagem livre na pista escolhida no seletor, só com volta de treino (`lapKind` `TRAINING`); não gera tentativa nem resultado de desafio diário (I1) |
| Sessão de treino | O estado da simulação e da volta numa pista escolhida no seletor, do momento em que a pista é carregada até a escolha de outra pista ou o fechamento da página ([RULE-0003](rules/RULE-0003-sessao-de-treino-e-selecao-de-pista.md)) |
| Desafio diário | Desafio do dia, ligado a um `challengeNumber`; ainda não existe e é de outra feature |
| Traçado aproximado | Apresentação da Kart Park com a linha central suavizada e 8,3 % mais curta que o traçado oficial de 750 m |
| Arquivo de origem | `kart-park.json`, formato `kartle-pista` v1, entregue pelo dono do produto; 684 pontos com a largura de cada um e 33 zebras com lado e trecho de volta |
| Arquivo de pista gerado | O arquivo da Kart Park produzido offline do arquivo de origem, no formato que o jogo lê (`schemaVersion` 3, [API-0001](api/API-0001-dado-de-pista-com-geometria-zebras-e-barreiras.md)) |
| Linha central original | A poligonal fechada dos pontos do arquivo de origem, convertida para metros nos eixos do jogo, antes da suavização |
| Linha central suavizada | A poligonal fechada `centerline` do arquivo de pista gerado; mesma quantidade e mesma ordem de pontos que a original |
| Ponto correspondente | O ponto de mesmo índice na outra linha central: o ponto *i* gerado corresponde ao ponto *i* da origem |
| Ponto 0 | O primeiro ponto da linha central, onde ficam a linha de largada e a linha de chegada |
| Distância de volta | Distância medida ao longo da linha central suavizada, a partir do ponto 0, no sentido de corrida, em metros |
| Distância de volta na linha original | A mesma medida feita na linha central original; é a régua dos fatos do seed (setores, zebras, trechos quase encostados, curva 4) |
| Índice fracionário | Posição ao longo da linha central expressa como *i* + *f*, com *f* de 0 a 1 entre o ponto *i* e o ponto *i* + 1; leva uma posição da linha original à linha suavizada |
| Sentido de corrida | Anti-horário, visto de cima (`direction` `COUNTER_CLOCKWISE`) |
| Eixos do jogo | Leste = +x, norte = −z, em metros; visto de cima, (x, −z) é o plano com norte para cima e leste para a direita |
| Normal | Em cada ponto *i*, o vetor unitário perpendicular à direção do ponto *i* − 1 ao ponto *i* + 1 (índices em volta fechada), apontando para a esquerda do sentido de corrida |
| Largura do asfalto | `widthM` de cada ponto: a largura do ponto correspondente do arquivo de origem (4,4 m a 10,8 m) |
| Borda do asfalto | Cada uma das duas poligonais formadas pelos pontos a meia largura do asfalto de cada ponto da linha central, ao longo da normal, uma à esquerda e outra à direita |
| Asfalto | A área entre as duas bordas do asfalto, segmento a segmento |
| Zebra | Faixa encostada na borda do asfalto, do lado declarado, para fora, ao longo de um trecho de volta; conta como pista e dá a cada pneu 85 % da aderência do asfalto |
| Trecho de zebra | Uma zebra contínua entre duas distâncias de volta; o arquivo de origem tem 33 e o arquivo gerado tem 34, porque a zebra que cruza a linha de largada é dividida nela |
| Pista | O asfalto mais as zebras |
| Borda da pista | O limite externo da pista: a borda do asfalto ou, onde houver zebra daquele lado, a borda externa da zebra |
| Grama | Tudo o que fica fora da pista; a sua regra não muda nesta feature |
| Saída de pista | Estado do kart com a sua posição além da borda da pista (`beyondTrackEdgeM` maior que 0) |
| Corte | Invalidação da volta quando o kart fica mais de `cutDistanceM` (3 m) além da borda da pista por mais de `cutDurationMs` (1000 ms); regra de `race-lap-validation`, sem mudança |
| Aderência | A força máxima que o pneu transmite ao chão com a mesma carga e o mesmo escorregamento; aqui expressa como fração da do mesmo pneu no asfalto (`wheelGripPc`) |
| Grampo | Curva de raio muito pequeno; a Kart Park tem dois, de raio ≈ 6 m, perto de 78 m e de 218 m de volta |
| Trechos quase encostados | O par de partes da pista entre ≈ 371–414 m e ≈ 580–615 m de volta na linha original, com 0,9 m a 6 m de grama entre as bordas do asfalto |
| Atalho pela grama | Passagem pela grama entre duas partes da pista que encurta a volta; os de 12 a 26 m de grama, como o da curva 4 (≈ 147 m a ≈ 200 m), são invalidados pelos marcadores, sem barreira |
| Barreira | Obstáculo físico desta feature entre os trechos quase encostados; poligonal na grama; o kart bate e não passa |
| Muro existente | O obstáculo da pista sintética; a barreira tem o mesmo efeito de colisão que ele |
| Setor | Cada um dos quatro trechos da volta, separados pelos três limites de setor e pela chegada |
| Linha transversal | Segmento que atravessa a pista num ponto da linha central, ao longo da normal, e se estende `cutDistanceM` além da borda da pista de cada lado, parando antes de uma barreira ou de outra parte da pista |
| Linha de largada e de chegada | Na Kart Park, a mesma linha transversal no ponto 0 |
| Limite de setor | Linha transversal no ponto cuja distância de volta na linha original é a mais próxima de 201,6 m, 350,3 m ou 529,9 m |
| Marcador de percurso | Linha transversal num ponto da linha central; marcadores consecutivos ficam a no máximo 25 m de distância de volta, inclusive do último ao primeiro |
| Marcador pulado | Motivo `MISSED_MARKER` de `race-lap-validation`, exibido como "marcador pulado" |
| Vibração da zebra | Pulso de 20 ms do aparelho, começado no máximo uma vez a cada 0,25 s de tempo simulado enquanto houver ao menos uma roda na zebra, em `web-mobile`, se o navegador permitir |
| Som da zebra | Ruído curto e grave próprio da zebra, repetido enquanto houver ao menos uma roda na zebra, em `web-desktop`, com o som ligado |
| Som ligado | O áudio do jogo está ativo: o navegador permitiu a reprodução e o jogo não está silenciado; "som desligado" é o contrário |
| Tempo simulado | Tempo em passos de `STEP` no estado da simulação; não avança com a simulação suspensa |
| Crédito OSM | Linha com "© colaboradores do OpenStreetMap", a menção "licença ODbL" e um link para `https://openstreetmap.org/copyright` |
| Staging / produção | Os dois ambientes de publicação; a Kart Park fica só em staging até a decisão sobre a licença Esri |
| Versão da pista | O `trackVersion` de um arquivo de pista publicado; nunca muda depois de publicado |

## Enums e campos

| Nome | Onde | Valores ou significado |
|---|---|---|
| `schemaVersion` | [API-0001](api/API-0001-dado-de-pista-com-geometria-zebras-e-barreiras.md) | 2: forma existente, geometria da pista sintética; 3: forma com `centerline` |
| `centerline` | API-0001 | Lista fechada de pontos `{xM, zM, widthM}` |
| `curbs` | API-0001 | Lista de trechos de zebra `{side, fromLapM, toLapM, widthM}` |
| `side` | API-0001 | `LEFT`, `RIGHT`, no sentido de corrida |
| `barriers` | API-0001 | Lista de barreiras, cada uma uma poligonal `points` de pontos `{xM, zM}` |
| `osmDerived` | API-0001 | Booleano: o arquivo deriva de dado OpenStreetMap |
| `trackDataStatus` | API-0001 (de `race-lap-validation`) | `COMPLETE`, `INCOMPLETE`, `UNSUPPORTED_SCHEMA`, `UNREADABLE` |
| `options` | [API-0002](api/API-0002-catalogo-e-selecao-da-pista-do-treino.md) | As duas entradas do catálogo do treino, `{trackId, displayName, displayLengthM, osmCredit}` |
| `sessionState` | API-0002, [RULE-0003](rules/RULE-0003-sessao-de-treino-e-selecao-de-pista.md) | `NO_SESSION`, `LOADING`, `READY`, `FAILED` |
| `wheelSurfaces` | [API-0003](api/API-0003-contato-do-kart-com-a-pista.md) | Lista de 4 valores `ASPHALT`, `CURB`, `GRASS`, na ordem dianteira esquerda, dianteira direita, traseira esquerda, traseira direita |
| `curbWheelCount` | API-0003 | Quantas rodas estão em `CURB`, de 0 a 4 |
| `wheelGripPc` | API-0003 | Aderência de cada roda como fração da do mesmo pneu no asfalto |
| `beyondTrackEdgeM` | API-0003 | Distância da posição do kart além da borda da pista; 0 sobre a pista |
| `barrierContact` | API-0003 | Verdadeiro só no passo em que o kart entra em contato com uma barreira |
