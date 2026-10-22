---
title: Estratégia de testes — validação de volta de corrida
feature: race-lap-validation
stage: dspec
status: validated
version: 1.1.1
sources: []
---

# Estratégia de testes

Prova é verificação determinística em `npm test` (node:test via tsx), avançando a simulação com `STEP`, nunca
medida contra o relógio de parede (I9). O que depende de tela, de sensor, de taxa de quadros ou de navegador
específico só se prova em teste registrado no aparelho ou no navegador nomeado, em `docs/lap-validation-device-log.md`,
e uma execução em desktop não vale para celular. O projeto não tem ferramenta de teste de ponta a ponta e esta
feature não acrescenta dependência: os níveis "web E2E" e "mobile E2E" são o roteiro registrado abaixo, com
identificadores `E2E-nn`. Nenhum teste usa configuração, ponto de entrada ou gancho criado só para testar: os testes
chegam ao comportamento pela interface pública de `src/lap.ts`, `src/trackData.ts`, `src/lapTiming.ts`,
`src/lapMessages.ts` e `src/frameClock.ts`, por arquivos de pista de fixture e por sessões de estado semeado
(a `LapSession` é dado simples; o teste cria uma por `startLap` e, quando precisa de um instante específico, copia-a
com a posição do kart ou um contador alterados, como um estado de partida semeado).

## Níveis

| Nível | Onde roda | O que cobre |
|---|---|---|
| Unitário | `npm test` | funções puras: `toMs`, `interpolateMs`, `isCutExceeded`, `crossLine`, `readTrackData`, `checkConsistency`, `resolveLanguage`, `formatLapTime`, `describeLap`, `advanceClock`, `offeredLapKinds` |
| Integração | `npm test` | a máquina de estados completa de `src/lap.ts` sobre a física real (`step`, `CIRCUIT`) e a pista sintética: volta inteira, marcador pulado, corte, pausa, reposicionamento |
| Contrato de API | `npm test` | `tests/lap-contract.test.ts`: forma e unidades de `getLapState`, `getLapResult`, `readTrackData`, códigos de rejeição por operação, ausência de campo além dos contratados (inclusive de dado pessoal); os campos opcionais `setupId` e `setupVersion` de API-0001 presentes no resultado exatamente quando o pedido `startLap` os trouxe, copiados sem interpretação, e ausentes quando não (API-0002) |
| Web E2E | roteiro registrado em Chrome, Edge, Firefox e Safari nas versões atuais, em `web-desktop` | texto na tela, tamanhos, contraste, escala de cinza, Esc, perda de foco, idioma, rede bloqueada, tempos iguais entre navegadores |
| Mobile E2E | roteiro registrado em celular intermediário de referência (RNF03), em `web-mobile` | inclinação e perda do sensor, retorno ao toque com estado visível, texto de 16 px, 30 fps |

## Fixtures e como chegar a cada estado

| Fixture | O que é | Estado a que dá acesso |
|---|---|---|
| `syntheticReading()` | `readTrackData(SYNTHETIC_TRACK_FILE)`, `COMPLETE` | volta completa na pista sintética |
| `tests/fixtures/track-v1.json` | `{schemaVersion: 1, trackId, trackVersion: 1}` | leitura da forma anterior, `INCOMPLETE` (NFR-0012) |
| arquivo derivado sem `markers` | cópia do sintético sem a lista de marcadores | `INCOMPLETE` por dado faltante |
| arquivos derivados reprovando C1 a C7 | cópias do sintético com uma única inconsistência cada | `INCOMPLETE` por inconsistência |
| `schemaVersion` igual a `TRACK_SCHEMA_VERSION + 1`, e texto corrompido | cópia do sintético cuja versão de esquema é derivada da constante exportada por `src/trackData.ts` (nenhum literal de versão no teste); texto corrompido em literal | `UNSUPPORTED_SCHEMA` (devolvido com essa `schemaVersion`, objeto de entrada intacto) e `UNREADABLE` |
| pedido de `startLap` com `setupId` e `setupVersion` | literais do enum de API-0002 e um texto de versão, no teste, copiados sem interpretação | resultado com os dois campos; o mesmo pedido sem eles dá resultado sem os campos (os padrões de leitura são do leitor de registros de `dirigibilidade`, fora deste conjunto) |
| `withCutLimits(1, 300)` | cópia do sintético com `cutDistanceM` 1 e `cutDurationMs` 300 (`trackVersion` 3) | corte pelos limites da pista |
| `withShortMarker(2)` | cópia do sintético em que o marcador 2 é um segmento curto de −1 m a +9 m do lado direito da linha central | marcador que um kart a −4 m da linha central não cruza |
| `autopilot(state, offsetM)` em `tests/helpers/autopilot.ts` | controlador determinístico de entradas a 10 Hz, derivado do de `scripts/keyboard-lap.ts`, com deslocamento lateral opcional em função da posição de arco | volta completa (cerca de 3770 passos); excursões laterais curtas; marcador pulado na pista sintética publicada |
| `driveOut` | `Input` `{throttle: 1, brake: 0, steer: 0}` fixo | saída de pista em linha reta, para o corte |
| `seedLap(lap, patch)` | cópia da `LapSession` com `kart`, `markersPassedCount` ou `sectorBoundsMs` alterados | marcadores fora de ordem; cruzamento na contramão; cruzamento repetido depois do fim; volta que começa depois de um limite |
| `tests/helpers/seeded.ts` | gerador congruencial linear com semente fixa | sequências de `Input` variadas e repetíveis; nunca `Math.random` |
| oráculo de corte | laço do próprio teste com `step` e `nearest` | primeiro passo em que o kart passa de 3 m além da borda por mais de 120 passos seguidos |

Cruzamento exatamente sobre o passo: a física não permite posicionar o kart numa linha com precisão arbitrária; o
caso é provado em `crossLine` (deslocamento que termina em `side` igual a 0 dá `fraction` 1) e em `interpolateMs(k, 1)`
igual a `toMs(k + 1)`, que são as funções que a volta usa, e o caso interno ao passo, nas voltas inteiras, pela
comparação com o oráculo do próprio teste (`toMs(k) < lapMs < toMs(k + 1)` para o `k` do passo da chegada).

## Funcionalidade por nível

| Funcionalidade | Unitário | Integração | Contrato | Web E2E | Mobile E2E | Razão |
|---|---|---|---|---|---|---|
| FEAT-0001 contagem e largada | sim | sim | sim | E2E-01 | E2E-01, E2E-05 | a regra é da simulação (provada em `npm test`); o texto e os tamanhos exigem tela e aparelho |
| FEAT-0002 conclusão e tempos | sim | sim | sim | E2E-02 | E2E-02 | tempo e soma em `npm test`; a exibição `m:ss.mmm` na tela |
| FEAT-0003 tempo independente e pausa | sim | sim | sim | E2E-03, E2E-04, E2E-11 | E2E-05 | determinismo em `npm test`; Esc, foco, sensor e navegadores só em teste registrado |
| FEAT-0004 marcadores e sentido | sim | sim | sim | E2E-02 | E2E-02 | regra da simulação; motivo exibido na tela |
| FEAT-0005 corte e grama | sim | sim | sim | E2E-02 | E2E-02 | regra com oráculo independente em `npm test` |
| FEAT-0006 reposicionamento e tipos | sim | sim | sim | E2E-06 | E2E-06 | tipos e oferta em `npm test`; ausência da opção oficial na tela |
| FEAT-0007 estado na tela | sim | não | não | E2E-02, E2E-07, E2E-09 | E2E-02, E2E-07 | textos e idioma puros; contraste por fichas; tamanho, escala de cinza e idioma do navegador na tela |
| FEAT-0008 dado de pista | sim | sim | sim | E2E-06 | E2E-06 | leitor e verificação puros; erro exibido na tela |
| FEAT-0009 transversais | sim | sim | sim | E2E-08, E2E-10 | E2E-08, E2E-10 | camada, privacidade e passo fixo em `npm test`; rede bloqueada e quadros em aparelho |

## Roteiro registrado (web E2E e mobile E2E)

| Id | O que se faz e se registra | Canal |
|---|---|---|
| E2E-01 | iniciar a volta; ver 3, 2, 1 e VERDE em texto com 48 px no mínimo e contraste de 4,5:1; cronômetro `0:00.000` durante a contagem; acelerar antes do VERDE sem efeito | desktop e celular |
| E2E-02 | completar uma volta; ver "válida em andamento", tempo de cada setor ao completá-lo e o resultado com tempo total e quatro tempos; repetir pulando um marcador, cortando e reposicionando em volta oficial de fixture, e ver os motivos. Comparação de tempos (SCR-0003, DES-0010): com uma volta válida concluída no acerto corrente, trocar o acerto no seletor existente `#handling-preset` (só entre voltas) e concluir outra volta válida — a tela de resultado não exibe comparação alguma com o tempo do outro acerto (diferença, melhor tempo ou ordenação) e o melhor tempo exibido não é o dele; concluir uma segunda volta válida no mesmo acerto — a comparação é exibida (melhor tempo entre as duas). A decisão fica em `compareLapRecords`; os ramos `SETUP_VERSION_DIFFERS` e `TRACK_DIFFERS` não são alcançáveis pela tela desta feature (uma única pista empacotada; o seletor só oferece versões publicadas de acerto) e, sem superfície só de teste, ficam provados nos testes de `compareLapRecords` de `dirigibilidade` | desktop e celular |
| E2E-03 | Esc pausa; o cronômetro para; continuar pelo botão ou por Esc; o cronômetro retoma do mesmo valor | desktop |
| E2E-04 | trocar de aba e voltar: a volta fica pausada com o mesmo cronômetro e só continua quando o Jogador continua | desktop e celular |
| E2E-05 | cobrir ou desativar o sensor com a inclinação ativa: a volta pausa em cerca de 0,5 s; negar a permissão antes da volta: o texto de controle por toque fica visível | celular |
| E2E-06 | abrir uma pista de fixture `INCOMPLETE`: nenhuma opção de volta oficial e volta de treino pilotável; abrir uma de esquema desconhecido: erro exibido e nenhuma volta | desktop e celular |
| E2E-07 | trocar o idioma do navegador entre pt, en e outro: os textos de estado e de motivo seguem; medir 16 px no celular | desktop e celular |
| E2E-08 | bloquear a rede depois do carregamento e completar uma volta: resultado exibido; registrar 0 requisições durante a volta | desktop e celular |
| E2E-09 | tela em escala de cinza: todo estado e motivo é legível por texto | desktop e celular |
| E2E-10 | uma volta completa com a validação ativa: fps médio e mínimo, 60 em notebook e 30 em celular intermediário (NFR-0003) | notebook e celular, nomeados |
| E2E-11 | a mesma sequência de entradas reproduzida (script de entradas de `tests/helpers`) em Chrome, Edge, Firefox e Safari: tempo total e quatro tempos iguais ao ms (NFR-0008) | quatro navegadores |

## Critérios de aceite: como o teste chega a cada um

`U` é unitário, `I` integração; o arquivo está em `tests/`. Nome em uso na árvore: a etapa de testes nomeia os
arquivos `tests/<feature>-<área>.test.ts`, de modo que o nome curto desta estratégia (`lap-<área>`, `frame-clock`,
`track-data`) e o nome `tests/lap-<área>.test.ts` ou `tests/track-data.test.ts` citado nos itens de projeto designam
`tests/race-lap-validation-<área>.test.ts` (áreas: `contract`, `crossing`, `cut`, `determinism`, `frame-clock`,
`frozen`, `hud-css`, `kinds`, `layering`, `messages`, `state`, `timing`, `track-data`, `validity`).

| Critério | Teste e caminho |
|---|---|
| AC-US-0001-01 | `lap-state` (I): `startLap` com `syntheticReading()`, 360 `stepLap` na contagem; `countdownRemainingMs` de 3000 a 0 e fase `RUNNING`; `lap-timing` (U): `toMs(360) === 3000` |
| AC-US-0001-02 | `lap-messages` (U): `describeLap` devolve `countdownText` 3, 2 e 1 para 3000, 2000 e 1000 ms e valores intermediários; E2E-01 |
| AC-US-0001-03 | `lap-messages` (U): `greenSignalVisible` no primeiro quadro de `RUNNING` e `message('countdownGreenSignal')`; E2E-01 |
| AC-US-0001-04 | `lap-state` (I): `elapsedMs` 0 nos 360 passos da contagem; `lap-messages` (U): `formatLapTime(0) === '0:00.000'` |
| AC-US-0001-05 | `lap-state` (I): após N passos do sinal verde `elapsedMs === toMs(N)`, com o kart posto, por `seedLap`, antes e depois da linha de chegada |
| AC-US-0001-06 | `lap-state` (I): `Input` `{throttle: 1}` nos 360 passos; no sinal verde `kart.speed === 0` e posição igual à da largada |
| AC-US-0001-07 | `lap-state` (I): no sinal verde, depois de aceleração antecipada, `lapValidity` `VALID` sem `invalidReason`; `lap-messages` (U): texto "válida em andamento" |
| AC-US-0001-08 | `lap-state` (I): `elapsedMs` após N passos igual com e sem aceleração antes do sinal verde |
| AC-US-0001-09 | `lap-hud-css` (U): numeral com `--lap-countdown-size` de 48 px; E2E-01 mede em desktop e celular |
| AC-US-0001-10 | `lap-hud-css` (U): contraste de `--lap-text` sobre `--lap-chip-bg` maior ou igual a 4,5; E2E-01 |
| AC-US-0002-01 | `lap-validity` (I): `autopilot` completa a volta sintética; fase `ENDED`, `VALID`; E2E-02 |
| AC-US-0002-02 | `lap-state` (I): `getLapResult` traz `lapMs`; E2E-02 mostra na tela |
| AC-US-0002-03 | `lap-state` (I): `sectorMs` com 4 inteiros; E2E-02 |
| AC-US-0002-04 | `lap-contract` (U): `Number.isInteger` em `lapMs` e em cada `sectorMs` |
| AC-US-0002-05 | `lap-state` (I): soma de `sectorMs` igual a `lapMs`, para a volta do autopilot e para voltas com entradas semeadas |
| AC-US-0002-06 | `lap-messages` (U): `formatLapTime` para 62345, 0, 59999, 3723004 |
| AC-US-0002-07 | `lap-timing` e `lap-crossing` (U): `interpolateMs` e `crossLine` em frações de 0,001 a 1; `lap-validity` (I): `toMs(k) < lapMs < toMs(k + 1)` com o `k` do passo da chegada, medido pelo oráculo do teste |
| AC-US-0002-08 | idem para `sectorBoundsMs`, com os passos dos limites de setor |
| AC-US-0002-09 | `lap-state` (I): `completedSectorMs` cresce de 1 em 1 e em ordem durante a volta; E2E-02 |
| AC-US-0002-10 | `lap-validity` (I): cada fronteira `bi` fica no passo de cruzamento do limite `i` do arquivo, medido pelo oráculo; primeiro setor desde o sinal verde |
| AC-US-0002-11 | `lap-state` (I): o resultado traz `trackId` `synthetic` e `trackVersion` 2, vindos da leitura |
| AC-US-0002-12 | `lap-validity` (I): `seedLap` recoloca o kart antes da chegada depois do fim e dá passos; a sessão devolvida é a mesma e `getLapResult` não muda |
| AC-US-0002-13 | `lap-validity` (I): `autopilot` na pista sintética publicada dá `VALID` com 4 setores |
| AC-US-0003-01 | `lap-determinism` (I): duas execuções do autopilot dão `lapMs` iguais |
| AC-US-0003-02 | idem para `sectorMs` |
| AC-US-0003-03 | `lap-determinism` (I): a mesma sequência de `Input` por passo agrupada em quadros de 2 e de 4 passos dá `lapMs` igual; `frame-clock` (U) |
| AC-US-0003-04 | idem para `sectorMs` |
| AC-US-0003-05 | `lap-state` (I): `pauseLap('ESC_KEY')` congela `elapsedMs`; E2E-03 prova a tecla |
| AC-US-0003-06 | `lap-state` (I): `pauseLap('FOCUS_LOST')`; o cronômetro é o mesmo ao voltar; E2E-04 prova o evento |
| AC-US-0003-07 | `lap-state` (I): `pauseLap('SENSOR_LOST')`; E2E-05 prova a vigilância no celular |
| AC-US-0003-08 | `lap-state` (I): `stepLap` em `PAUSED` devolve a mesma sessão, `stepCount` congelado, e o tempo ao continuar é o do instante da pausa |
| AC-US-0003-09 | `lap-state` (I): depois de `resumeLap` a volta segue `VALID` e com o mesmo `lapKind`; `lap-messages` (U): "válida em andamento" |
| AC-US-0003-10 | `lap-determinism` (I): resultado sem pausa igual ao com uma pausa de qualquer duração no meio |
| AC-US-0004-01 | `lap-validity` (I): `withShortMarker(2)` e `autopilot` a −4 m: `INVALID` `MISSED_MARKER` na chegada |
| AC-US-0004-02 | `lap-validity` (I): `seedLap` posiciona o kart depois do marcador 1 e antes do 2 com contador 0; os marcadores 2 a 4 não contam; chegada `MISSED_MARKER` |
| AC-US-0004-03 | `lap-state` (I): resultado inválido sem `lapMs` nem `sectorMs`, `official` falso |
| AC-US-0004-04 | `lap-messages` (U): "marcador pulado"; E2E-02 |
| AC-US-0004-05 | `lap-validity` (I): na volta de `withShortMarker(2)` os três limites de setor são cruzados e o resultado é `MISSED_MARKER` |
| AC-US-0004-06 | `lap-validity` (I): pista sintética publicada com excursão lateral curta de 10,5 m em torno do marcador 2 (menos de 120 passos além de 3 m da borda, sem corte): `MISSED_MARKER` |
| AC-US-0004-07 | `lap-validity` (I): `elapsedMs` não muda depois do passo da chegada inválida e um novo cruzamento não gera segundo resultado |
| AC-US-0005-01 | `lap-validity` (I): `seedLap` põe o kart depois da chegada, de costas; ao cruzar, a fase segue `RUNNING` e `lapValidity` `VALID` |
| AC-US-0005-02 | `lap-validity` (I): na mesma situação `getLapResult` devolve `NO_RESULT` |
| AC-US-0005-03 | `lap-validity` (I): só o cruzamento no sentido da pista encerra; vários cruzamentos na contramão e depois um no sentido da pista |
| AC-US-0005-04 | `lap-validity` (I): `seedLap` antes do marcador 1, de costas: `markersPassedCount` continua 0 |
| AC-US-0006-01 | `lap-cut` (I): `driveOut` com oráculo: `INVALID` `CUT` no primeiro passo em que 120 passos seguidos são ultrapassados com mais de 3 m da borda |
| AC-US-0006-02 | `lap-cut` (I): saída de até 120 passos e retorno a 3 m ou menos não invalida; nova saída recomeça a contagem |
| AC-US-0006-03 | `lap-cut` (I): `autopilot` com deslocamento constante de 2 m além da borda por 600 passos não invalida (oráculo confirma distância menor ou igual a 3 m) |
| AC-US-0006-04 | `lap-cut` (I): `withCutLimits(1, 300)` invalida pelos limites da pista |
| AC-US-0006-05 | `lap-messages` (U): "corte"; E2E-02 |
| AC-US-0006-06 | `lap-cut` (I): `elapsedMs` e `sectorBoundsMs` não mudam depois do passo da invalidação |
| AC-US-0006-07 | `lap-cut` (I): mesma entrada por N passos em grama e em asfalto: velocidade menor na grama |
| AC-US-0006-08 | `lap-cut` (I): na escapada de AC-US-0006-03 `describeLap` mostra "válida em andamento" |
| AC-US-0007-01 | `lap-kinds` (I): `repositionKart` em `OFFICIAL` e `RUNNING` dá `INVALID` `REPOSITION` |
| AC-US-0007-02 | `lap-messages` (U): "reposicionamento"; E2E-02 |
| AC-US-0007-03 | `lap-kinds` (I): `stepCount` e `elapsedMs` não mudam depois do reposicionamento oficial e os passos seguintes são ignorados |
| AC-US-0007-04 | `lap-kinds` (I): em `TRAINING` e `RECON` a validade continua `VALID` depois de reposicionar, repetidamente |
| AC-US-0007-05 | `lap-kinds` (I) e `lap-messages` (U): sem `invalidReason` e sem texto de motivo |
| AC-US-0007-06 | `lap-kinds` (I): `elapsedMs` após N passos do sinal verde é `toMs(N)` com reposicionamentos intercalados |
| AC-US-0008-01 | `lap-state` e `lap-messages`: resultado `VALID` de `TRAINING` e `RECON` com `official` falso e texto "não oficial"; E2E-02 |
| AC-US-0008-02 | `lap-kinds` (I): `official` falso para `TRAINING` e `RECON` concluídos, e verdadeiro só para `OFFICIAL` `VALID` `COMPLETE` |
| AC-US-0008-03 | `lap-kinds` (U): `offeredLapKinds` de `INCOMPLETE` não contém `OFFICIAL`; `startLap` `OFFICIAL` dá `OFFICIAL_NOT_AVAILABLE`; E2E-06 |
| AC-US-0008-04 | `lap-kinds` (I): `startLap` `TRAINING` sobre leitura `INCOMPLETE`, 1200 passos de `Input`: kart anda e o cronômetro avança |
| AC-US-0008-05 | `lap-kinds` (I): em leitura `INCOMPLETE` o resultado de um corte tem `official` falso |
| AC-US-0009-01 | `lap-state` (I): `getLapState` devolve estado válido a cada passo do sinal verde ao fim; E2E-02 observa a tela por quadro |
| AC-US-0009-02 | `lap-messages` (U): "válida em andamento" |
| AC-US-0009-03 | `lap-messages` (U): "inválida" mais motivo para cada `invalidReason` |
| AC-US-0009-04 | `lap-messages` (U): todo estado e motivo tem texto não vazio; E2E-09 em escala de cinza |
| AC-US-0009-05 | `lap-messages` (U): `resolveLanguage('pt-BR')` e `'pt'` dão `pt` |
| AC-US-0009-06 | `lap-messages` (U): `'en-US'` e `'en'` dão `en` |
| AC-US-0009-07 | `lap-messages` (U): `'fr'`, `'es-419'`, `'de'`, vazio e `undefined` dão `en`; E2E-07 |
| AC-US-0009-08 | `lap-hud-css` (U): contraste de cada par de fichas maior ou igual a 4,5; E2E-07 |
| AC-US-0009-09 | `lap-hud-css` (U): `--lap-state-size` de 16 px; E2E-07 mede no celular |

## Requisitos não funcionais

| NFR | Como é provado |
|---|---|
| NFR-0001 | `lap-determinism` |
| NFR-0002 | `lap-state` (pausa não avança passo) |
| NFR-0003 | E2E-10 nos aparelhos de referência |
| NFR-0004 | `lap-layering` (nenhum símbolo de rede nos módulos) e E2E-08 |
| NFR-0005 | `lap-contract` (chaves do resultado são exatamente as de API-0001) e `lap-layering` |
| NFR-0006 | E2E-09 e `lap-messages` |
| NFR-0007 | `lap-messages` (20 chaves nos dois idiomas) e E2E-07 |
| NFR-0008 | E2E-11 |
| NFR-0009 | os arquivos da tabela de DES-0012, um por regra |
| NFR-0010 | `lap-frozen` |
| NFR-0011 | registro de benchmarks em `docs/lap-validation-bench.md`, antes e depois |
| NFR-0012 | `track-data`: forma anterior lida sem erro; o arquivo sintético declara `schemaVersion` igual a `TRACK_SCHEMA_VERSION`, maior que a versão da forma anterior; `TRACK_SCHEMA_VERSION + 1` é `UNSUPPORTED_SCHEMA` com o objeto de entrada intacto. Sem literal de versão de esquema em nenhuma verificação: os valores derivam da constante exportada, para que subir o esquema em outra feature não reprove a prova (FB-01 de `pista-kart-park`) |

## Cobertura das regras de REQ-FEAT-0009-10

Marcador pulado, contramão, corte pelos limites padrão, corte pelos limites da pista, grama sem corte,
reposicionamento, reconhecimento e treino, pista de dado incompleto, início no sinal verde, queima de largada
ignorada, suspensão na pausa, interpolação do cruzamento e soma dos setores igual ao total: cada uma tem ao menos um
teste nas linhas acima, executado sem renderização nem controles.
