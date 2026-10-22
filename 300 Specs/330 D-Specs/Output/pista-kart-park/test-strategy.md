---
title: Estratégia de testes — pista Kart Park
feature: pista-kart-park
stage: dspec
status: validated
version: 1.0.1
sources: []
---

# Estratégia de testes

Prova é verificação determinística em `npm test` (`node:test` via `tsx`), avançando a simulação com `STEP` ou
lendo o arquivo de pista, sem carregar a renderização WebGL (I9; REQ-FEAT-0007-07). O que depende de tela, de
som, de vibração no aparelho, de taxa de quadros ou de navegador só se prova em teste registrado no aparelho
ou no navegador nomeado, em `docs/kart-park-device-log.md`, com identificadores `E2E-nn`; uma execução em
desktop não vale para celular. O projeto não tem ferramenta de ponta a ponta e esta feature não acrescenta
dependência: os níveis "web E2E" e "mobile E2E" são o roteiro registrado abaixo (como em
`race-lap-validation`). Os testes ficam em `tests/pista-kart-park-<área>.test.ts` e cada verificação nomeia
o critério que verifica.

Nenhum teste usa configuração, ponto de entrada ou gancho criado só para testar. Os testes chegam ao
comportamento pela interface pública de `src/trackData.ts`, `src/trackGeometry.ts`, `src/physics.ts`
(`step`, `trackEnvironment`, `getTrackContact`, `tireForce`), `src/lap.ts`, `src/trainingSession.ts`,
`src/lapMessages.ts` (`OSM_CREDIT`, `creditFor`, `optionLabel`), `src/curbFeedback.ts`, `src/audio.ts`
(`RaceAudio` sobre um `AudioContext` de substituição, e os descritores), `src/trackScene.ts`,
`scripts/trackPrep.ts` e `scripts/trackChecks.ts`; pelo arquivo publicado, pelo arquivo de origem e por cópias derivadas deles; e por
estados de partida semeados (um `State` é dado simples: o teste o cria com `kartAtStart` e lhe dá posição,
rumo e velocidade, como `race-lap-validation` faz com a `LapSession`). Os ambientes de comparação da barreira
com o muro são objetos `Environment` montados no teste, como `tests/physics.test.ts` já faz.

## Níveis

| Nível | Onde roda | O que cobre |
|---|---|---|
| Unitário | `npm test` | funções puras: `readTrackData` e `checkConsistencyV3`, `buildTrackGeometry`, `classifySurface`, `beyondTrackEdgeM`, `surfaceMu`, `tireForce` com `curb`, `decideCurbFeedback`, `creditFor`, `optionLabel`, `minimapTransform`, `readOriginTrack`, `prepareTrack`, `verifyTrackFile` |
| Integração | `npm test` | a física sobre o ambiente da Kart Park (`step`, barreira, zebra), a volta inteira de `src/lap.ts` na Kart Park com o piloto de teste, a sessão de treino com troca de pista e volta, o retorno da zebra sobre os passos de uma volta real, o desenho construído em Node |
| Contrato de API | `npm test` | forma, unidades e códigos de API-0001 (`readTrackData` da versão 3), API-0002 (`getTrainingTrackOptions`, `selectTrainingTrack`) e API-0003 (`getTrackContact`), campo a campo, sem campo além dos contratados |
| Arquivo | `npm test` | V01 a V18 sobre o arquivo publicado e a origem; reprodução do arquivo pelo preparo; registro de publicação e resumos |
| Web E2E | roteiro registrado em Chrome, Edge, Firefox e Safari nas versões atuais, em `web-desktop`, e no notebook de referência de RNF03 | seletor, crédito, nome, tela de resultado, desenho, som da zebra, rede bloqueada, idioma, 60 fps |
| Mobile E2E | roteiro registrado no celular intermediário de referência de RNF03, em `web-mobile` | toque, inclinação negada, vibração, navegador sem vibração, 30 fps |

## Fixtures e como chegar a cada estado

| Fixture | O que é | Estado a que dá acesso |
|---|---|---|
| `kartParkText()` em `tests/fixtures/kartParkFiles.ts` | `readFileSync('src/tracks/kart-park-v1.json', 'utf8')` | leitura `COMPLETE` da versão 3; geometria e ambiente da Kart Park |
| `originJson()` | `JSON.parse` de `tracks/sources/kart-park.json` | verificações que comparam com a origem; preparo |
| cópias derivadas do arquivo publicado | objetos novos com um desvio cada: sem `centerline`; `centerline` de 2 pontos; um `widthM` 0; zebra de `side` inválido; barreira de 1 ponto; `barriers` vazio; `osmDerived` texto; `schemaVersion` 4; texto corrompido; um ponto a 0,4 m da origem; coordenadas escaladas; ordem invertida; um marcador retirado; zebra trocada de lado; vértice de barreira no asfalto; campo `recordeMs`; `trackVersion` 2 com o mesmo resumo | `UNREADABLE`, `UNSUPPORTED_SCHEMA`, reprovação de cada verificação; geometria sem barreira; o arquivo publicado nunca é alterado (I3) |
| `kartParkPilot(offset?, shortcut?)` em `tests/helpers/kartParkPilot.ts` | controlador determinístico: persegue um ponto à frente na linha central da sessão (por distância de volta), esterço proporcional saturado em [−1, 1], acelerador e freio binários por uma velocidade alvo da curvatura local; deslocamento lateral opcional em função da distância de volta; atalho opcional para um ponto alvo por fora da pista. Parâmetros calibrados pela etapa de testes sobre o arquivo publicado | volta completa `VALID`; excursão lateral curta além da borda; permanência sobre a zebra; atalho da curva 4 |
| `seededKart(pose, velocity)` | `kartAtStart` com posição, rumo e velocidade dados | kart lançado contra a barreira; kart com as rodas de um lado na zebra; kart além da borda |
| ambientes de grama | `{surfaceAt: () => 'grass', walls: true}` (muro da pista sintética) e `{surfaceAt: () => 'grass', walls: false, track: geometria da Kart Park}` (barreira) | comparação da resposta do obstáculo sem diferença de superfície |
| `tests/helpers/seeded.ts` (existente) | gerador congruencial de semente fixa | sequências de `Input` repetíveis, nunca `Math.random` |
| fontes da sessão | `{'kart-park': kartParkText(), synthetic: SYNTHETIC_TRACK_FILE}` e a variante com o texto da Kart Park corrompido | sessão `READY` nas duas pistas; sessão `FAILED` |
| sequência de contato | os pares (`simStepCount`, `curbWheelCount`) lidos por `getTrackContact` a cada passo de uma volta do piloto que passa por zebras, calculados no próprio teste | registro de pulsos e de repetições pedidos por passo |
| `AudioContext` de substituição | classe do teste instalada em `globalThis.AudioContext` antes de `RaceAudio.toggle()`, que registra cada nó criado (oscilador com o seu `type`, fonte de buffer, filtro com `type` e `frequency`) e aceita `resume`, as ligações e as rampas de ganho sem produzir som; `src/audio.ts` não muda para o teste | o sinal que o motor, a recompensa e a zebra constroem, em Node |

## Funcionalidade por nível

| Funcionalidade | Unitário | Integração | Contrato | Arquivo | Web E2E | Mobile E2E | Razão |
|---|---|---|---|---|---|---|---|
| FEAT-0001 seletor | sim | sim | sim | — | E2E-01, E2E-02, E2E-08 | E2E-05 | a sessão é regra da simulação (provada em `npm test`); o seletor na tela, a recarga e o armazenamento vazio só no navegador |
| FEAT-0002 forma e versão | sim | sim | sim | sim | E2E-03 | E2E-05 | as verificações do arquivo e a leitura são determinísticas; o desenho do asfalto é conferido também na tela |
| FEAT-0003 setores e validação | sim | sim | — | sim | E2E-03 | E2E-05 | as linhas são verificadas no arquivo e a validade na simulação; o motivo e os tempos na tela |
| FEAT-0004 barreira | sim | sim | sim | sim | E2E-03 | E2E-05 | posição no arquivo, colisão na física; aparência na tela |
| FEAT-0005 zebra | sim | sim | sim | sim | E2E-03, E2E-04 | E2E-05, E2E-06 | superfície e aderência na física, decisão do retorno pura; som e vibração só no aparelho |
| FEAT-0006 crédito, nome e comprimento | sim | — | sim | sim | E2E-01, E2E-03, E2E-07, E2E-08 | E2E-05 | indicação de crédito, nome e comprimento no catálogo; textos, destino e rótulo em `src/lapMessages.ts`; exibição nas duas telas e sem rede no navegador |
| FEAT-0007 transversais | sim | sim | — | sim | E2E-03, E2E-07 | E2E-05 | determinismo, camadas, dependências e contrato de passo em `npm test`; taxa de quadros e rede só no aparelho |

## Como cada critério é alcançado

| Critério | Teste e caminho |
|---|---|
| AC-US-0001-01 | `session`: `getTrainingTrackOptions` tem exatamente as entradas `kart-park` e `synthetic`; `screens`: `#track-selector` com dois botões; E2E-01 |
| AC-US-0001-02 | `session`: a abertura (`initialTrainingSession` e seleção de `OPENING_TRACK_ID`) dá `selectedTrackId` `kart-park` sem argumento de escolha anterior; `layering`: nenhum uso de armazenamento; E2E-01: recarregar depois de escolher a pista sintética volta à Kart Park e o painel de armazenamento da origem fica vazio |
| AC-US-0001-03 | `session`: `startTrainingLap` na sessão da Kart Park dá `getLapState().trackId` `kart-park` |
| AC-US-0001-04 | `session`: o mesmo na sessão sintética dá `synthetic` |
| AC-US-0001-05 | `session`: as voltas são `TRAINING` sem `challengeNumber`, com `official` falso no resultado, depois de volta concluída, invalidada e descartada nas duas pistas; `layering`: nenhum módulo grava no navegador; E2E-01: armazenamento vazio depois das voltas |
| AC-US-0001-06 | `session`: depois da troca, o kart da sessão está na `startPosition` da pista escolhida (posição e rumo iguais aos do arquivo) |
| AC-US-0001-07 | `session`: trocar de pista com volta em `COUNTDOWN`, `RUNNING` e `PAUSED` devolve volta ausente, `getLapState` `NO_ACTIVE_LAP` e nenhum `LapResult` |
| AC-US-0002-01 | `track-file`: V01 e V02 (684 pontos, último diferente do ponto 0) |
| AC-US-0002-02 | `track-file`: V03 |
| AC-US-0002-03 | `track-file`: V04 |
| AC-US-0002-04 | `track-file`: V05, e V01/V07 contra a origem convertida pelos eixos de RULE-0002 |
| AC-US-0002-05 | `track-file`: V06 e V01 |
| AC-US-0002-06 | `track-file`: V07 |
| AC-US-0002-07 | `track-file`: V08 |
| AC-US-0002-08 | `track-data`: `centerline` lido igual ao do arquivo ponto a ponto; `geometry`: as bordas vêm dessas larguras; `scene`: os vértices do asfalto são essas bordas; E2E-03 |
| AC-US-0003-01 | `track-file`: V09 (3 limites) |
| AC-US-0003-02 | `track-file`: V09 (pontos de 201,6 m, 350,3 m, 529,9 m em `d_o`) |
| AC-US-0003-03 | `track-file`: V04 (chegada no ponto 0) |
| AC-US-0003-04 | `track-file`: V10 e V11 |
| AC-US-0003-05 | `lap`: o piloto com uma excursão a 3,5 m além da borda da pista num trecho sem barreira nem outra parte por perto, por menos de 120 passos, termina `INVALID` com `MISSED_MARKER` ao cruzar a chegada |
| AC-US-0003-06 | `lap`: `describeLap` (de `race-lap-validation`) sobre o estado dessa volta dá "marcador pulado"; E2E-03 |
| AC-US-0003-07 | `lap`: kart mantido a mais de 3 m da borda da pista dá `CUT` no passo em que passam 121 passos seguidos |
| AC-US-0003-08 | `lap`: 120 passos a mais de 3 m e retorno a 3 m ou menos não dão `CUT` |
| AC-US-0003-09 | `lap`: o piloto com o atalho que sai perto de 147 m de `d_o`, cruza a grama por dentro da curva 4 e volta perto de 200 m termina `INVALID` |
| AC-US-0003-10 | `lap` e `determinism`: o piloto completa a volta pela pista, sem corte, passando por todos os marcadores, e termina `VALID` |
| AC-US-0003-11 | `lap`: o `LapResult` dessa volta tem `lapMs` e 4 `sectorMs` que somam `lapMs`, formatados por `formatLapTime`; os casos de chegada cruzada de novo, contramão e pausa dão na Kart Park o mesmo resultado que os testes de `race-lap-validation` esperam na sintética; E2E-03 (tela de resultado, perda de foco e recarga) |
| AC-US-0004-01 | `track-file`: V13 |
| AC-US-0004-02 | `track-file`: V14; `barrier`: o ambiente da Kart Park tem `walls` falso e os únicos segmentos de obstáculo são os de `barriers` |
| AC-US-0004-03 | `track-file`: V15 |
| AC-US-0004-04 | `barrier`: `seededKart` lançado contra a barreira dos dois lados, a 5, 10, 20, 30, 34,5, 60 e 200 m/s e a 90 e 30 graus, nunca termina um passo do outro lado |
| AC-US-0004-05 | `barrier`: nos dois ambientes de grama, mesma velocidade, ângulo e `Input`, posição e velocidade no referencial local iguais a cada passo desde o passo com `barrierContact` e com `wallContact`; `barrierContact` verdadeiro só nesse passo |
| AC-US-0004-06 | `scene`: uma instância por segmento, somando o comprimento de cada barreira; E2E-03 |
| AC-US-0005-01 | `track-file`: V12 (34 trechos) |
| AC-US-0005-02 | `track-file`: V12 (lado e trecho por índice fracionário; a zebra da largada dividida) |
| AC-US-0005-03 | `scene`: cada faixa no lado e no trecho declarados; E2E-03 |
| AC-US-0005-04 | `surface`: `seededKart` com as rodas de um lado na zebra e as outras no asfalto: `wheelSurfaces` com `CURB` nessas rodas e `beyondTrackEdgeM` 0; `geometry`: ponto da faixa é `curb` |
| AC-US-0005-05 | `lap`: o piloto rodando com o centro do kart sobre a borda do asfalto do lado de uma zebra longa, com rodas na zebra e nenhuma além dela, por mais de 120 passos, não termina com `CUT` |
| AC-US-0005-06 | `surface`: `tireForce(..., 'curb', acerto).capacity` igual a 0,85 da de `'asphalt'` para as mesmas carga e deslize, nos acertos publicados e com a escala de forçar; `getTrackContact` dá `wheelGripPc` 0,85 na roda em `CURB` |
| AC-US-0005-07 | `feedback`: registro de pulsos com `web-mobile` e vibração disponível: inícios a 30 passos (250 ms) enquanto houver roda na zebra; E2E-05 |
| AC-US-0005-08 | `feedback`: nenhum início com `curbWheelCount` 0, nem com a volta pausada |
| AC-US-0005-09 | `feedback`: registro de repetições com `web-desktop` e som ligado: inícios a 12 passos enquanto houver roda na zebra; E2E-04 |
| AC-US-0005-10 | `feedback`: nenhuma repetição com `curbWheelCount` 0 |
| AC-US-0005-11 | `feedback`: som desligado, nenhuma repetição; E2E-04 |
| AC-US-0005-12 | `feedback`, com o `AudioContext` de substituição: o motor cria só um oscilador `triangle`, a recompensa só osciladores `sine` e `curb()` só uma fonte de buffer de ruído com filtro `lowpass` em 160 Hz; nenhum outro método cria fonte de buffer ou filtro; o tipo registrado de cada som é o `source` do seu descritor e os três são diferentes; `audio.curb(` no texto de `src/main.ts` só no laço de passos; E2E-04 (o som da zebra é distinguível do motor e da recompensa) |
| AC-US-0006-01 | `screens`: `creditFor` da entrada `kart-park` do catálogo dá `OSM_CREDIT` com `text` "© colaboradores do OpenStreetMap"; `renderCredit` em `#track-credit` com `creditFor` da entrada de `selectedTrackId`; E2E-01, E2E-05 |
| AC-US-0006-02 | o mesmo com `license` |
| AC-US-0006-03 | o mesmo com `url` como `href` do `a`; E2E-01: o clique abre `https://openstreetmap.org/copyright` |
| AC-US-0006-04 | `screens`: `renderCredit` em `#lap-result-credit` com `creditFor` da entrada de `result.trackId`; `creditFor` da entrada `synthetic` ausente; E2E-03 (volta válida e inválida na Kart Park, volta na sintética sem crédito) |
| AC-US-0006-05 | o mesmo com a menção |
| AC-US-0006-06 | o mesmo com o link |
| AC-US-0006-07 | `session`: `displayName` da entrada `kart-park`; `screens`: `optionLabel` da entrada `kart-park`, e `#track-name` e os botões recebem `optionLabel`; E2E-01, E2E-08 (navegador em inglês) |
| AC-US-0006-08 | `session`: `displayLengthM` da entrada `kart-park` é 687, independente do comprimento suavizado; `screens`: `optionLabel` dessa entrada termina em `687 m`; E2E-01 |
| AC-US-0006-09 | `track-file`: V18; `session`: nenhum campo de recorde no catálogo; `screens`: nenhum "41,45" nem "41.45" em `index.html`, `src/main.ts`, `src/lapMessages.ts` e `src/trainingSession.ts` |

Os critérios transversais de FEAT-0007 e os requisitos sem critério de história:

| Requisito | Teste e caminho |
|---|---|
| REQ-FEAT-0007-01, -02 | E2E-03 no notebook de referência (60 fps sustentados numa volta completa na Kart Park, medidos pelo medidor de quadros das ferramentas do navegador) e E2E-05 no celular intermediário (30 fps); métrica: quadros por segundo sustentados |
| REQ-FEAT-0007-03, -04 | `determinism`: duas voltas do piloto com a mesma sequência dão `lapMs` e 4 `sectorMs` iguais |
| REQ-FEAT-0007-05 | `layering`: nenhum símbolo de rede nos módulos desta feature; E2E-07: registro de rede do navegador da escolha da Kart Park ao fim da volta sem requisição a outro serviço, nos dois canais |
| REQ-FEAT-0007-06, -07 | `layering` (proibições de camada) e esta tabela: cada critério de US-0002 a US-0005 tem verificação em `npm test` que o nomeia |
| REQ-FEAT-0007-08, -09 | `tests/race-lap-validation-frozen.test.ts` (CHK-TEST-0014-01, -02) sem alteração; `layering`: o tipo `Input` literal |
| REQ-FEAT-0007-10 | `layering`: nenhum teste nem bench de `race-lap-validation` e de `dirigibilidade` cita `kart-park` |
| REQ-FEAT-0007-11 | `layering`: `dependencies` de `package.json` é `{three}` e `devDependencies` não muda |
| REQ-FEAT-0007-12 | manifesto da etapa de código: hash do commit de entrega de `dirigibilidade` e `git merge-base --is-ancestor` com o primeiro commit desta feature |
| REQ-FEAT-0007-13 | `publication`: toda entrada `PRODUCTION` tem `esriDecisionRef`; etapa de deploy: lista de verificação da promoção |
| REQ-FEAT-0002-14, -17, -18 | `track-file`: V17; `publication`: resumos iguais aos registrados, pares únicos, catálogo no maior `trackVersion` |
| REQ-FEAT-0002-15, -16 | `track-data`: `SYNTHETIC_TRACK_FILE` `COMPLETE` como antes; cópias da versão 3 sem linha central utilizável `UNREADABLE` e intactas |
| REQ-FEAT-0001-13 | E2E-05: inclinação negada, toque com o aviso visível, seletor e pista inalterados |
| REQ-FEAT-0001-14 | `session`: texto corrompido dá `FAILED` e `TRACK_DATA_UNREADABLE`; `screens`: sem oferta de volta com `FAILED`; E2E-02 não cobre (o arquivo empacotado é válido) |
| REQ-FEAT-0005-16 a -19 | `feedback`: nenhum pulso em `web-desktop`; som em `web-mobile` pelas mesmas regras; nada com a volta pausada; sem vibração, o mesmo registro de repetições e nenhum erro; E2E-06 |
| REQ-FEAT-0006-12, -13 | E2E-07 (crédito sem rede) e E2E-01, E2E-03, E2E-05 (as duas telas nos dois canais) |
| REQ-FEAT-0006-14 | E2E da entrega que promover a Kart Park a produção, se a decisão liberar a licença Esri: as duas telas com o crédito da Esri no texto da decisão |
| REQ-FEAT-0003-15 | `lap`: chegada cruzada de novo depois do fim, contramão, pausa e retomada na Kart Park como na sintética; E2E-03: perda de foco e recarga |

## Roteiro registrado (`docs/kart-park-device-log.md`)

| Id | Canal e aparelho | Passos e resultado esperado |
|---|---|---|
| E2E-01 | `web-desktop`, os quatro navegadores | abrir: seletor com as duas opções, Kart Park marcada com "Kart Park — São José dos Pinhais (traçado aproximado) · 687 m", crédito com texto, menção e link; clicar no link abre `https://openstreetmap.org/copyright` em outra aba; escolher a pista sintética: crédito some; recarregar: Kart Park marcada; painel de armazenamento da origem vazio depois de voltas nas duas pistas |
| E2E-02 | `web-desktop`, Chrome | trocar de pista: o kart vai para a largada da pista escolhida, sem volta em andamento; volta de treino é a única oferta |
| E2E-03 | `web-desktop`, notebook de referência | volta completa na Kart Park: asfalto com larguras variáveis, zebras nos lados declarados, barreira em todo o comprimento; tela de resultado com tempo total, 4 setores e crédito; volta inválida por marcador pulado com "marcador pulado" e crédito; volta na sintética sem crédito; perda de foco pausa; recarga sem resultado; 60 fps sustentados |
| E2E-04 | `web-desktop`, Chrome e Firefox | som ligado: ruído grave repetido com roda na zebra, distinto do motor e da recompensa, nenhum fora da zebra; som desligado: nenhum |
| E2E-05 | `web-mobile`, celular intermediário de referência | mesmo seletor e crédito; inclinação negada: toque com o aviso; vibração curta repetida com roda na zebra e nenhuma fora dela ou em pausa; 30 fps sustentados numa volta completa |
| E2E-06 | `web-mobile`, navegador sem `navigator.vibrate` | volta com zebras sem vibração, sem erro e sem aviso; volta igual |
| E2E-07 | `web-desktop` e `web-mobile` | depois do carregamento, rede bloqueada: escolha da pista, volta, zebra, barreira e crédito funcionam; registro de rede sem requisição a outro serviço da escolha ao fim da volta |
| E2E-08 | `web-desktop`, navegador em inglês | nome da Kart Park, "Pista sintética" e crédito em português, iguais; demais textos em inglês |

## Testes de outras features

Os testes de `race-lap-validation` e de `dirigibilidade` continuam na pista sintética e na pista de teste e
passam sem alteração, salvo `tests/race-lap-validation-track-data.test.ts:20` (CHK-TEST-0009-02) e `:24-30`
(CHK-TEST-0009-03), que afirmam o literal 2 e usam a versão 3 como posterior; a mudança deles é de
`race-lap-validation` ([01-architecture](01-architecture.md), "Consequências para outras features"). Nenhum
teste desta feature altera um arquivo de teste de outra feature.
