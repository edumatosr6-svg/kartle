---
id: US-0002
title: Forma da pista real
feature: pista-kart-park
stage: req
status: validated
version: 1.0.0
sources: [SEED/US-2, SEED/MED, SEED/RD-01, SEED/RD-02, SEED/RD-03, SEED/RD-10, SEED/RE-03, SEED/IM-I2, SEED/IM-I10, SEED/RI-02, DOMAIN/DEC-04, DOMAIN/DEC-09]
---

# US-0002 — Forma da pista real

## História

Como Jogador, quero que a Kart Park tenha a forma da pista real, para reconhecer o traçado.

## Canais

- `web-desktop` e `web-mobile`: a mesma geometria, a mesma largura e o mesmo sentido. A forma da pista é
  dado lido pela simulação (I2, `SEED/IM-I2`) e não depende do canal. Nenhuma diferença de comportamento
  entre os canais.
- `web-mobile`: com sensor de inclinação ausente ou permissão negada, o controle recai para toque com
  estado visível na tela (I4, `[DOMAIN]`); a pista não muda.

## Pré-condições

- O arquivo de pista da Kart Park foi gerado offline pelo Curador do catálogo a partir do arquivo de
  origem (`kart-park.json`, formato `kartle-pista` v1, `SEED.md` Contexto), com os eixos do jogo
  (`SEED/RE-03`).
- Para o critério observado na simulação: a Kart Park está escolhida no seletor e o treino foi iniciado.

## Critérios de aceite

- AC-US-0002-01: No arquivo de pista gerado, a linha central suavizada é fechada: a volta termina no
  ponto 0, onde começa (`SEED/MED`, RF02).
- AC-US-0002-02: No arquivo de pista gerado, o comprimento da volta fechada da linha central suavizada,
  medido depois da suavização, está entre 680,625 m e 694,375 m (687,5 m ± 1 %).
- AC-US-0002-03: No arquivo de pista gerado, a linha de largada está no ponto 0 da linha central.
- AC-US-0002-04: No arquivo de pista gerado, a linha central percorrida no sentido de corrida e expressa
  nos eixos do jogo (leste = +x, norte = −z) gira no sentido anti-horário visto de cima (`SEED/RE-03`:
  com outro mapeamento, o circuito fica espelhado).
- AC-US-0002-05: No arquivo de pista gerado, a largura do asfalto em cada ponto é a do ponto
  correspondente do arquivo de origem, variando ponto a ponto de 4,4 m a 10,8 m, sem uma largura fixa
  (`SEED/RD-03`).
- AC-US-0002-06: No arquivo de pista gerado, a distância de cada ponto da linha central suavizada à
  linha central original é de no máximo 0,30 m (`DOMAIN/DEC-09`).
- AC-US-0002-07: No arquivo de pista gerado, no grampo mais fechado da volta (raio ≈ 6 m, perto de
  218 m de volta), as duas bordas do asfalto não se cruzam: nenhuma delas cruza a si mesma nem a outra.
- AC-US-0002-08: No estado da simulação com a Kart Park carregada, a linha central e as larguras do
  asfalto são as do arquivo de pista gerado, sem nova suavização nem conversão ao carregar (`SEED/RD-02`,
  `SEED/IM-I10`: preparo offline).

## Casos anormais

- **Suavização que afasta algum ponto mais de 0,30 m, comprimento fora de 680,625–694,375 m ou bordas
  que se cruzam no grampo**: o arquivo gerado reprova nos critérios 02, 06 ou 07 e não atende a esta
  história; a correção é feita no preparo offline, nunca no jogo em execução (I10, `SEED/RD-02`).
- **Conversão com outro mapeamento de eixos**: o circuito fica espelhado e gira no sentido horário; o
  arquivo reprova no critério 04 (`SEED/RE-03`).
- **Mudança da linha central depois de publicada** (suavizar de novo, corrigir uma borda ou uma
  largura): é publicada como versão nova, nunca como edição da versão 1 (NFR-0006, `SEED/IM-I3I5`).
- **Diferença para o traçado oficial de 750 m** (o traçado medido é 8,3 % mais curto): aceita e
  informada ao Jogador pelo nome "traçado aproximado" (US-0006, `DOMAIN/DEC-04`); o comprimento exigido
  continua 687,5 m ± 1 % (critério 02).
- **Regra geral de largura (largura do OSM quando houver, senão 8 m)**: não se aplica à Kart Park; a
  largura medida ponto a ponto na imagem é um desvio aceito (`SEED/RD-03`).
- **Sensor de inclinação ausente ou permissão negada (`web-mobile`)**: o controle recai para toque com
  estado visível (I4); a geometria da pista não muda.

## Fontes

- `SEED/US-2` — história e seus quatro critérios.
- `SEED/MED` — comprimento, pontos, sentido, largada, largura e grampos medidos.
- `SEED/RD-01` — circuito fechado de 400 a 1500 m (RF02); 687,5 m ± 1 % está nessa faixa.
- `SEED/RD-02` — pista em metros, no sentido de corrida, preparada offline (RF03, RF06, I10).
- `SEED/RD-03` — largura medida ponto a ponto, desvio aceito (RF04).
- `SEED/RD-10` — suavizar e apresentar como traçado aproximado.
- `SEED/RE-03` — conversão offline com os eixos do jogo.
- `SEED/IM-I2` — a geometria e a largura entram na simulação como dado.
- `SEED/IM-I10` — nenhum editor de pista no jogo.
- `SEED/RI-02`, `DOMAIN/DEC-09` — tolerância da suavização de 0,30 m.
- `DOMAIN/DEC-04` — suavização com janela de cerca de 12 m (orienta o design; o critério verificável é a
  tolerância).

## Pontos em aberto

Nenhum — `DOMAIN/DEC-09` fixa a tolerância da suavização.
