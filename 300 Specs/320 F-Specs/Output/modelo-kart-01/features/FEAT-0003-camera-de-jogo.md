---
id: FEAT-0003
title: Câmera de jogo — visão geral, descida na contagem, pose de corrida e campo de visão
feature: modelo-kart-01
stage: fspec
status: draft
version: 1.0.0
sources: [US-0003, AC-US-0003-01, AC-US-0003-02, AC-US-0003-03, AC-US-0003-04, AC-US-0003-05, AC-US-0003-06, AC-US-0003-07, AC-US-0003-08, AC-US-0003-09, AC-US-0003-10, AC-US-0003-11, AC-US-0003-12]
---

# FEAT-0003 — Câmera de jogo

## Resumo

A câmera alta e distante de perseguição sai da corrida. Em corrida, a câmera fica atrás e perto do piloto,
como a ficha define: 1,38 m acima do chão, 3,05 m atrás do kart, mirando um ponto 3,2 m à frente e 0,30 m
acima do chão, presa ao rumo do kart, sem corte, com campo de visão vertical de 62° em paisagem e, em
retrato, horizontal de pelo menos 60° (`DOMAIN/DEC-03`). O efeito de turbo continua, a partir da nova base.
Antes da contagem regressiva a tela mostra a pista inteira do alto; durante a contagem a câmera desce até
trás do piloto e, no sinal verde, já está na pose de corrida (`DOMAIN/DEC-04`).

## Canais

`web-desktop` e `web-mobile`: a mesma pose de corrida, a mesma visão geral e a mesma descida. A regra de
campo de visão depende da forma da área de jogo, não do canal: `web-mobile` usa paisagem ou retrato conforme
o Jogador segura o celular; `web-desktop` usa paisagem, e retrato só quando a janela é mais alta que larga.
Em `web-mobile` com sensor ausente ou permissão negada, o controle recai para toque com estado visível
(I4); a câmera não muda. Verificação na tela, com a pose lida em
[API-0003](../api/API-0003-camera-da-cena-exibida.md) e a do kart em
[API-0001](../api/API-0001-estado-do-kart-para-exibicao.md).

## Requisitos

- REQ-FEAT-0003-01: O sistema SHALL posicionar a câmera da cena exibida, em corrida e em cada quadro, 1,38 m
  acima do chão (AC-US-0003-01).
- REQ-FEAT-0003-02: O sistema SHALL posicionar a câmera da cena exibida, em corrida e em cada quadro, 3,05 m
  atrás da posição do kart, medidos no chão ao longo do rumo do kart, no sentido oposto a ele
  (AC-US-0003-02).
- REQ-FEAT-0003-03: O sistema SHALL apontar a câmera da cena exibida, em corrida e em cada quadro, para um
  ponto 3,2 m à frente da posição do kart, ao longo do rumo, e 0,30 m acima do chão (AC-US-0003-03).
- REQ-FEAT-0003-04: O sistema SHALL classificar a área de jogo, em cada quadro e nos dois canais, como
  paisagem quando a sua largura é maior ou igual à sua altura e como retrato quando a sua altura é maior que
  a sua largura (AC-US-0003-04, AC-US-0003-05).
- REQ-FEAT-0003-05: O sistema SHALL exibir a cena, em corrida, em paisagem e sem turbo ativo, a qualquer
  velocidade, com campo de visão vertical de 62° (AC-US-0003-04).
- REQ-FEAT-0003-06: O sistema SHALL exibir a cena, em corrida, em retrato e sem turbo ativo, com campo de
  visão horizontal de pelo menos 60° (AC-US-0003-05).
- REQ-FEAT-0003-07: O sistema SHALL exibir a cena, em corrida, em retrato e sem turbo ativo, com campo de
  visão vertical de pelo menos 62° (AC-US-0003-06).
- REQ-FEAT-0003-08: O sistema SHALL manter a câmera presa ao rumo do kart em corrida, sem suavização, atraso
  nem corte: entre dois quadros consecutivos, a direção horizontal de mira muda exatamente o quanto muda o
  rumo do kart exibido (AC-US-0003-07).
- REQ-FEAT-0003-09: O sistema SHALL exibir o kart inteiro, com o piloto, dentro do quadro em todos os quadros
  de uma curva de 90° feita a 50 km/h, em paisagem e em retrato (AC-US-0003-08).
- REQ-FEAT-0003-10: O sistema SHALL exibir a cena, em corrida e com o turbo ativo, em paisagem e em retrato,
  com campo de visão vertical igual ao campo de visão vertical sem turbo da mesma forma da área de jogo
  somado à diferença de campo de visão vertical que o efeito de turbo já existente produz, antes desta
  feature, para o mesmo estado de turbo (AC-US-0003-09).
- REQ-FEAT-0003-11: O sistema SHALL mostrar a visão geral da pista — a pista vista do alto, inteira no quadro,
  em paisagem e em retrato — em todo quadro anterior ao início da contagem regressiva: sem volta ativa ou
  com a volta encerrada (AC-US-0003-10).
- REQ-FEAT-0003-12: O sistema SHALL, durante a contagem regressiva, mover a câmera da visão geral para trás
  do piloto, partindo da pose da visão geral no primeiro quadro da contagem, com a altura da câmera acima do
  chão menor no fim da contagem do que no início e nunca maior num quadro da contagem do que no quadro
  anterior (AC-US-0003-11).
- REQ-FEAT-0003-13: O sistema SHALL exibir a câmera, no quadro do sinal verde, na pose de corrida: 1,38 m
  acima do chão, 3,05 m atrás da posição do kart e mirando o ponto 3,2 m à frente e 0,30 m acima do chão
  (AC-US-0003-12).
- REQ-FEAT-0003-14: O sistema SHALL determinar a pose da câmera durante a contagem só pelo tempo de
  contagem restante (`countdownRemainingMs`) e pela posição e rumo do kart, de modo que, enquanto a contagem
  não avança, a câmera não desce [DOMAIN] (US-0003, caso anormal "Pausa ou suspensão durante a contagem
  regressiva").
- REQ-FEAT-0003-15: O sistema SHALL aplicar, no quadro seguinte a uma troca de orientação do celular ou a um
  redimensionamento da janela em corrida, a regra de campo de visão da nova forma da área de jogo, com o
  efeito de turbo, se ativo, a partir do campo de visão vertical de base da nova forma, sem mudar a pose de
  corrida [DOMAIN] (US-0003, casos anormais "Troca de orientação do celular ou redimensionamento da janela
  em corrida" e "Turbo ativo durante a troca de orientação").

## Comportamento

Modos, pose e campo de visão: [RULE-0002](../rules/RULE-0002-camera-de-jogo.md). Largada:
[FLOW-0002](../flows/FLOW-0002-largada-visao-geral-descida-e-pose-de-corrida.md). Quadro em corrida:
[FLOW-0001](../flows/FLOW-0001-quadro-de-exibicao-em-corrida.md). Leitura:
[API-0003](../api/API-0003-camera-da-cena-exibida.md). Tela:
[SCR-0001](../screens/SCR-0001-cena-de-jogo-com-o-kart-01.md).

| Situação | Comportamento |
|---|---|
| Pista carregada, sem volta ativa | Visão geral da pista (`TRACK_OVERVIEW`) |
| Volta iniciada (`lapPhase` `COUNTDOWN`) | Descida (`COUNTDOWN_DESCENT`) a partir da pose da visão geral, função de `countdownRemainingMs` |
| Sinal verde (`countdownRemainingMs` chega a 0, `lapPhase` `RUNNING`) | Pose de corrida (`RACE_CHASE`) já no quadro do sinal verde |
| Reposicionamento do kart em corrida | No primeiro quadro depois dele, pose de corrida em relação à nova posição e ao novo rumo; a mudança de visada é igual à mudança de rumo, por isso não é corte |
| Rodada ou derrapagem forte | A câmera acompanha o rumo do kart, não a direção do movimento; numa rodada de 180°, gira junto com o kart |
| Marcha à ré, se a simulação a informar | A câmera continua atrás do kart em relação ao rumo; o kart se move em direção à câmera |
| Troca de orientação ou redimensionamento em corrida | No quadro seguinte, a regra de campo de visão da nova forma; a pose de corrida não muda |
| Turbo ativo durante a troca de orientação | O efeito de turbo passa a valer a partir do campo de visão vertical de base da nova forma |
| Kart junto a uma parede ou a uma borda | A pose de corrida não muda; não há desvio da câmera por obstáculo |
| Pausa em corrida | A simulação não avança; a câmera fica na pose de corrida em relação ao kart parado |
| Pausa ou suspensão durante a contagem | A contagem não avança; a câmera não desce; ao continuar, a descida retoma do ponto em que parou; no sinal verde vale o requisito 13 |
| Volta encerrada (`lapPhase` `ENDED`) | Visão geral da pista: o quadro deixa de ser "em corrida" e passa a ser anterior à contagem da volta seguinte ([RULE-0002](../rules/RULE-0002-camera-de-jogo.md)) |
| Recarga da página antes da largada ou durante a volta | Sem volta ativa: visão geral; a descida recomeça com a nova contagem |
| Sensor ausente ou permissão negada (`web-mobile`) | Toque com estado visível (I4); a câmera não muda |
| Rede indisponível | Sem efeito (D-FS-08) |

## Estado

Lê `lapPhase`, `resumePhase` e `countdownRemainingMs` do contrato de estado da volta de
`race-lap-validation` (`getLapState`), nomeados e não redefinidos, e a pose do kart de
[API-0001](../api/API-0001-estado-do-kart-para-exibicao.md). Define o modo da câmera `cameraMode`:

| `cameraMode` | Quando | O que o dirige |
|---|---|---|
| `TRACK_OVERVIEW` | Sem volta ativa (`NO_ACTIVE_LAP`) ou `lapPhase` `ENDED` | Pista carregada; fim da volta |
| `COUNTDOWN_DESCENT` | `lapPhase` `COUNTDOWN`, ou `PAUSED` com `resumePhase` `COUNTDOWN` | `startLap` aceito; `countdownRemainingMs` |
| `RACE_CHASE` | `lapPhase` `RUNNING`, ou `PAUSED` com `resumePhase` `RUNNING` | Sinal verde; pose do kart por `simStepCount` |

As transições, a sua idempotência e os contadores de sequência estão em
[RULE-0002](../rules/RULE-0002-camera-de-jogo.md).

## Configuração

Nenhuma. Não há escolha de câmera nem ajuste de campo de visão, e não há chave para voltar à câmera alta de
perseguição em corrida (requisitos, `01-context.md`, Padrão seguro). Nenhuma configuração existe para forçar
um evento, injetar um estado ou habilitar um caminho de depuração.

## Critérios de aceite

- Em corrida, em cada quadro, `cameraHeightM` igual a 1,38; a câmera a 3,05 m atrás da posição do kart, no
  chão, ao longo do rumo; o ponto de mira a 3,2 m à frente e `aimHeightM` igual a 0,30 (satisfaz
  AC-US-0003-01, AC-US-0003-02, AC-US-0003-03; cobre os requisitos 01, 02 e 03).
- Em corrida, sem turbo: `viewShape` `LANDSCAPE` para largura ≥ altura e `PORTRAIT` para altura > largura;
  em `LANDSCAPE`, `verticalFovDeg` igual a 62 a qualquer velocidade; em `PORTRAIT`, `horizontalFovDeg` ≥ 60
  e `verticalFovDeg` ≥ 62; depois de uma troca de orientação ou redimensionamento, a regra da nova forma no
  quadro seguinte (satisfaz AC-US-0003-04, AC-US-0003-05, AC-US-0003-06; cobre os requisitos 04, 05, 06,
  07 e 15).
- Em corrida, entre dois quadros consecutivos, a variação da direção horizontal de mira igual à variação de
  `headingRad` do kart exibido (satisfaz AC-US-0003-07; cobre o requisito 08).
- Numa curva de 90° a 50 km/h, em paisagem e em retrato, o kart com o piloto inteiro dentro do quadro em
  todos os quadros da curva (satisfaz AC-US-0003-08; cobre o requisito 09).
- Com o turbo ativo, em paisagem e em retrato, `verticalFovDeg` − `baseVerticalFovDeg` igual a
  `turboFovDeltaDeg`, a diferença do efeito de turbo existente para o mesmo estado de turbo, também depois
  de uma troca de orientação (satisfaz AC-US-0003-09; cobre os requisitos 10 e 15).
- Sem volta ativa e com a volta encerrada, `cameraMode` `TRACK_OVERVIEW`, com a pista inteira no quadro,
  vista do alto (satisfaz AC-US-0003-10; cobre o requisito 11).
- Durante a contagem, `cameraMode` `COUNTDOWN_DESCENT`, pose da visão geral no primeiro quadro,
  `cameraHeightM` nunca maior que no quadro anterior e menor no fim que no início; parada enquanto a
  contagem não avança (satisfaz AC-US-0003-11; cobre os requisitos 12 e 14).
- No quadro do sinal verde, a pose de corrida dos requisitos 01 a 03 (satisfaz AC-US-0003-12; cobre o
  requisito 13).

## Pontos em aberto

Nenhum.
