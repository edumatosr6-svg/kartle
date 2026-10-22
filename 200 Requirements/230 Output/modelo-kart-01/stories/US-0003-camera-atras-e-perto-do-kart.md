---
id: US-0003
title: Câmera atrás e perto do kart
feature: modelo-kart-01
stage: req
status: validated
version: 1.1.0
sources: [SEED/US-3, SEED/RD-01, SEED/RD-04, SEED/IM-I9, DOMAIN/DEC-03, DOMAIN/DEC-04]
---

# US-0003 — Câmera atrás e perto do kart

## História

Como Jogador, quero a câmera atrás e perto do kart, para sentir velocidade e proximidade da pista.

## Canais

- `web-desktop` e `web-mobile`: a mesma pose de corrida, a mesma visão geral antes da contagem e a mesma
  descida durante a contagem.
- Diferença por forma da área de jogo (`DOMAIN/DEC-03`): em paisagem, o campo de visão vertical é de 62°;
  em retrato, o campo de visão horizontal é de pelo menos 60° e o vertical não fica abaixo de 62°.
  `web-mobile` usa as duas formas, conforme o Jogador segura o celular; `web-desktop` usa a regra de
  paisagem, e a de retrato só quando a janela é mais alta que larga.
- `web-mobile` com sensor ausente ou permissão negada: o controle recai para toque com estado visível (I4);
  a câmera não muda.

## Pré-condições

- Kart 01 em cena (US-0001).
- Para os critérios de corrida: o Jogador em corrida, do sinal verde em diante.
- Para os critérios de largada: a contagem regressiva e o sinal verde que o jogo já tem.

## Critérios de aceite

- AC-US-0003-01: Em corrida, em cada quadro, a câmera da cena exibida na tela está 1,38 m acima do chão
  (`SEED/US-3`, primeiro critério; `SEED/IM-I9`).
- AC-US-0003-02: Em corrida, em cada quadro, a câmera da cena exibida está 3,05 m atrás da posição do kart,
  medidos no chão ao longo do rumo do kart, no sentido oposto a ele (`SEED/US-3`, primeiro critério).
- AC-US-0003-03: Em corrida, em cada quadro, a câmera da cena exibida mira um ponto 3,2 m à frente da
  posição do kart, ao longo do rumo, e 0,30 m acima do chão (`SEED/US-3`, primeiro critério).
- AC-US-0003-04: Em corrida, em paisagem e sem turbo ativo, o campo de visão vertical da cena exibida é de
  62° (`SEED/US-3`, primeiro critério; `DOMAIN/DEC-03`).
- AC-US-0003-05: Em corrida, em retrato e sem turbo ativo, o campo de visão horizontal da cena exibida é de
  pelo menos 60° (`DOMAIN/DEC-03`).
- AC-US-0003-06: Em corrida, em retrato e sem turbo ativo, o campo de visão vertical da cena exibida não
  fica abaixo de 62° (`DOMAIN/DEC-03`: "o vertical cresce em retrato").
- AC-US-0003-07: Em corrida, a câmera acompanha o rumo do kart sem corte: entre dois quadros consecutivos,
  a direção horizontal para onde a câmera mira muda exatamente o quanto muda o rumo do kart exibido
  (`SEED/US-3`, segundo critério).
- AC-US-0003-08: Numa curva de 90° feita a 50 km/h, em paisagem e em retrato, o kart exibido fica inteiro
  dentro do quadro na tela em todos os quadros da curva (`SEED/US-3`, segundo critério).
- AC-US-0003-09: Com o turbo ativo, em paisagem e em retrato, a diferença é medida no campo de visão
  vertical: a diferença entre o campo de visão vertical exibido e o campo de visão vertical exibido sem
  turbo na mesma forma da área de jogo (62° em paisagem, critério 04; em retrato, o vertical que resulta dos
  critérios 05 e 06) é a mesma diferença de campo de visão vertical que o efeito de turbo já existente
  produz, antes desta feature, para o mesmo estado de turbo (`SEED/US-3`, terceiro critério; a base é o
  "campo de visão vertical de 62°" do primeiro critério).
- AC-US-0003-10: Antes do início da contagem regressiva, a tela mostra a visão geral da pista: a pista
  vista do alto, inteira no quadro (`DOMAIN/DEC-04`).
- AC-US-0003-11: Durante a contagem regressiva, a câmera desce da visão geral para trás do piloto: a altura
  da câmera acima do chão diminui ao longo da contagem e não aumenta em nenhum quadro da contagem
  (`DOMAIN/DEC-04`).
- AC-US-0003-12: No quadro do sinal verde, a câmera já está na pose de corrida: 1,38 m acima do chão,
  3,05 m atrás da posição do kart e mirando o ponto 3,2 m à frente e 0,30 m acima do chão
  (`DOMAIN/DEC-04`).

## Casos anormais

- **Reposicionamento do kart em corrida**: no primeiro quadro depois do reposicionamento, a câmera está na
  pose de corrida em relação à nova posição e ao novo rumo do kart; a mudança de visada é igual à mudança
  de rumo do kart (critério 07), por isso não é corte.
- **Rodada ou derrapagem forte**: a câmera acompanha o rumo do kart, não a direção do movimento; numa rodada
  de 180°, a câmera gira junto com o kart.
- **Marcha à ré**, se a simulação a informar: a câmera continua atrás do kart em relação ao rumo; o kart se
  move em direção à câmera.
- **Troca de orientação do celular ou redimensionamento da janela em corrida**: no quadro seguinte vale a
  regra de campo de visão da nova forma da área de jogo (critérios 04 a 06); a pose de corrida não muda.
- **Turbo ativo durante a troca de orientação**: o efeito de turbo passa a valer a partir do campo de visão
  vertical de base da nova forma (critério 09).
- **Kart junto a uma parede ou a uma borda**: a pose de corrida não muda; o seed não pede desvio da câmera
  por obstáculo.
- **Pausa em corrida**: a simulação não avança; a câmera fica na pose de corrida em relação ao kart parado.
- **Pausa ou suspensão durante a contagem regressiva**: a descida acompanha a contagem; enquanto a contagem
  não avança, a câmera não desce, e no sinal verde vale o critério 12.
- **Recarga da página antes da largada**: se a recarga leva de novo a antes da contagem, vale o critério 10,
  e a descida recomeça com a nova contagem.
- **Sensor ausente ou permissão negada (`web-mobile`)**: o controle recai para toque com estado visível
  (I4); a câmera não muda.

## Fontes

- `SEED/US-3` — história e seus três critérios (pose e campo de visão; rumo sem corte e curva de 90° a
  50 km/h; efeito de turbo a partir da nova base de campo de visão vertical).
- `SEED/RD-04` — a câmera vem da ficha "Kart 01 — Kartle".
- `SEED/RD-01` — a câmera mostra o estado da simulação e não decide nada.
- `SEED/IM-I9` — os critérios de câmera são verificados em tela.
- `DOMAIN/DEC-03` — campo de visão em retrato e em paisagem.
- `DOMAIN/DEC-04` — visão geral antes da contagem, descida durante a contagem, pose de corrida no sinal
  verde.

## Pontos em aberto

Nenhum — `DOMAIN/DEC-03` e `DOMAIN/DEC-04` fecham os pontos abertos 03 e 04 do seed.
