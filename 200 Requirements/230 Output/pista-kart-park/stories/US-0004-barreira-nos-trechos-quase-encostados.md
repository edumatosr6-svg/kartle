---
id: US-0004
title: Barreira nos trechos quase encostados
feature: pista-kart-park
stage: req
status: validated
version: 1.0.0
sources: [SEED/US-4, SEED/MED, SEED/RD-04, SEED/RD-11, SEED/IM-I2, SEED/RI-03, DOMAIN/DEC-03, DOMAIN/DEC-10]
---

# US-0004 — Barreira nos trechos quase encostados

## História

Como Jogador, quero que os trechos quase encostados tenham uma barreira, para que ninguém corte um terço
da volta.

## Canais

- `web-desktop` e `web-mobile`: a mesma barreira, no mesmo lugar, com o mesmo efeito de colisão. A
  barreira é dado lido pela simulação e a tela só a desenha (I2, `SEED/IM-I2`). Nenhuma diferença de
  comportamento entre os canais.
- `web-mobile`: com sensor de inclinação ausente ou permissão negada, o controle recai para toque com
  estado visível na tela (I4, `[DOMAIN]`); a barreira não muda.

## Pré-condições

- O arquivo de pista da Kart Park foi gerado offline com a barreira.
- Para os critérios observados na simulação ou na tela: a Kart Park está escolhida no seletor e o treino
  foi iniciado.

## Critérios de aceite

- AC-US-0004-01: No arquivo de pista gerado, existe uma barreira entre o trecho de ≈ 371–414 m e o
  trecho de ≈ 580–615 m de volta em todo ponto em que a grama entre as bordas do asfalto dos dois trechos
  mede 6 m ou menos (`DOMAIN/DEC-03`).
- AC-US-0004-02: No arquivo de pista gerado, nenhuma barreira desta feature fica entre partes da pista
  com mais de 6 m de grama entre as bordas do asfalto; os atalhos pela grama de 12 a 26 m não recebem
  barreira (`DOMAIN/DEC-10`).
- AC-US-0004-03: No arquivo de pista gerado, nenhum ponto da barreira fica sobre o asfalto de nenhum dos
  dois trechos.
- AC-US-0004-04: No estado da simulação, um kart conduzido contra a barreira, de qualquer dos dois lados
  e em qualquer velocidade que o kart alcance, não está do outro lado da barreira em nenhum passo de
  `STEP` (`DOMAIN/DEC-03`).
- AC-US-0004-05: No estado da simulação, a velocidade e a posição do kart depois de uma colisão com a
  barreira são as mesmas que depois de uma colisão com o muro existente, para a mesma velocidade e o
  mesmo ângulo de impacto.
- AC-US-0004-06: Na tela, a barreira é desenhada em todo o seu comprimento (RF07, `SEED/IM-I2`).

## Casos anormais

- **Impacto na velocidade máxima**: o kart não atravessa a barreira (critério 04) e o efeito é o mesmo
  de bater no muro existente (critério 05).
- **Kart raspando ao longo da barreira ou parado encostado nela**: mesmo efeito que no muro existente
  (critério 05).
- **Tentativa de atravessar no sentido contrário** (do trecho de ≈ 580–615 m para o de ≈ 371–414 m): a
  barreira bloqueia dos dois lados (critério 04).
- **Atalhos pela grama de 12 a 26 m**: sem barreira (critério 02); invalidados pelos marcadores de
  percurso (US-0003, `DOMAIN/DEC-10`).
- **Mudança da barreira depois de publicada**: é publicada como versão nova da pista (NFR-0006).
- **Sensor de inclinação ausente ou permissão negada (`web-mobile`)**: o controle recai para toque com
  estado visível (I4); a barreira não muda.

## Fontes

- `SEED/US-4` — história e seus três critérios.
- `SEED/MED` — trechos quase encostados medidos, com 0,9 m a 6 m de grama entre as bordas.
- `SEED/RD-04` — a pista tem asfalto, zebras, grama e barreiras (RF07).
- `SEED/RD-11` — barreira física nos trechos quase encostados.
- `SEED/IM-I2` — a barreira entra na simulação como dado; a tela só desenha.
- `SEED/RI-03`, `DOMAIN/DEC-10` — barreira só nos trechos com 6 m de grama ou menos.
- `DOMAIN/DEC-03` — o kart bate e não passa.

## Pontos em aberto

Nenhum — `DOMAIN/DEC-03` e `DOMAIN/DEC-10` fixam onde há barreira e o seu efeito.
