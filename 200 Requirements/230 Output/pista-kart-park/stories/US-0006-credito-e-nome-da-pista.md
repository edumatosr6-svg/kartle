---
id: US-0006
title: Crédito e nome da pista
feature: pista-kart-park
stage: req
status: validated
version: 1.0.0
sources: [SEED/US-6, SEED/RD-08, SEED/RD-10, SEED/IM-I6, SEED/FE-04, DOMAIN/DEC-02, DOMAIN/DEC-04, DOMAIN/DEC-07]
---

# US-0006 — Crédito e nome da pista

## História

Como Jogador, quero saber de onde vem a pista, para que os dados sejam creditados.

## Canais

- `web-desktop` e `web-mobile`: o mesmo crédito, nas mesmas duas telas, com o mesmo nome e o mesmo
  comprimento exibidos. Nenhuma diferença de comportamento entre os canais; o link é acionado com clique
  em `web-desktop` e com toque em `web-mobile`.
- `web-mobile`: com sensor de inclinação ausente ou permissão negada, o controle recai para toque com
  estado visível na tela (I4, `[DOMAIN]`); o crédito e o nome não mudam.

## Pré-condições

- A Kart Park está escolhida no seletor de pista.
- Para os critérios da tela de resultado: uma volta na Kart Park terminou e a tela de resultado está
  exibida.

## Critérios de aceite

- AC-US-0006-01: Com a Kart Park selecionada, o seletor de pista exibe o texto "© colaboradores do
  OpenStreetMap" (`DOMAIN/DEC-07`).
- AC-US-0006-02: Com a Kart Park selecionada, o seletor de pista exibe a menção à licença ODbL.
- AC-US-0006-03: Com a Kart Park selecionada, o seletor de pista exibe um link cujo destino é
  `openstreetmap.org/copyright`.
- AC-US-0006-04: Na tela de resultado de uma volta na Kart Park, é exibido o texto "© colaboradores do
  OpenStreetMap" (`DOMAIN/DEC-07`).
- AC-US-0006-05: Na tela de resultado de uma volta na Kart Park, é exibida a menção à licença ODbL.
- AC-US-0006-06: Na tela de resultado de uma volta na Kart Park, é exibido um link cujo destino é
  `openstreetmap.org/copyright`.
- AC-US-0006-07: Toda tela que exibe o nome da Kart Park o exibe como "Kart Park — São José dos Pinhais
  (traçado aproximado)" (`DOMAIN/DEC-04`).
- AC-US-0006-08: Toda tela que exibe o nome da Kart Park exibe, junto a ele, o comprimento de 687 m
  (`DOMAIN/DEC-04`).
- AC-US-0006-09: Nenhuma tela do jogo exibe o recorde de 41,45 s da pista real (`DOMAIN/DEC-04`,
  `SEED/FE-04`).

## Casos anormais

- **Pista sintética selecionada**: ela não tem dado OSM; a regra de crédito vale quando houver dado OSM
  (RNF09, `SEED/RD-08`), e este conjunto não exige o crédito nela.
- **Sem rede**: o link pode não abrir o destino; o texto do crédito, a menção à ODbL e o link continuam
  exibidos nas duas telas (critérios 01 a 06), porque não dependem de rede.
- **Comprimento depois da suavização diferente de 687,5 m** (dentro de ± 1 %, US-0002): o comprimento
  exibido continua 687 m, o comprimento medido decidido pelo dono do produto (`DOMAIN/DEC-04`).
- **Crédito da Esri**: entra junto ao crédito OSM só se a licença for liberada (`DOMAIN/DEC-07`); até a
  decisão, a Kart Park fica só em staging (NFR-0012).
- **Sensor de inclinação ausente ou permissão negada (`web-mobile`)**: o controle recai para toque com
  estado visível (I4); o crédito e o nome não mudam.

## Fontes

- `SEED/US-6` — história e seus três critérios.
- `SEED/RD-08` — crédito OSM e menção à ODbL quando houver dado OSM (RNF09, D-DP-04 ratificado).
- `SEED/RD-10` — apresentar como traçado aproximado.
- `SEED/IM-I6` — crédito e licença dos dados derivados.
- `SEED/FE-04` — recorde da pista real fora do escopo.
- `DOMAIN/DEC-02` — usar os dados agora e mostrar o crédito OSM/ODbL.
- `DOMAIN/DEC-04` — nome, comprimento de 687 m e recorde que não aparece.
- `DOMAIN/DEC-07` — texto, menção, link e as duas telas do crédito.

## Pontos em aberto

Nenhum — `DOMAIN/DEC-04` e `DOMAIN/DEC-07` fixam o nome, o comprimento, o crédito e onde ele aparece.
