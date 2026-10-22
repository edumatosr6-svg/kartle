---
id: US-0005
title: Zebra com efeito
feature: pista-kart-park
stage: req
status: validated
version: 1.0.0
sources: [SEED/US-5, SEED/MED, SEED/RD-04, SEED/RD-12, SEED/IM-I2, SEED/IM-I8, SEED/RI-04, DOMAIN/DEC-05, DOMAIN/DEC-11]
---

# US-0005 — Zebra com efeito

## História

Como Jogador, quero sentir a zebra, para usar e respeitar a zebra como num kart de verdade.

## Canais

- `web-desktop` e `web-mobile`: as mesmas zebras, no mesmo lado, com a mesma regra de pista e a mesma
  aderência de 85 %. A zebra é dado de superfície lido pela simulação (I2, I8).
- `web-mobile`: o retorno da zebra é a vibração do aparelho, de 20 ms a cada 0,25 s, se o navegador
  permitir (critérios 07 e 08). O som próprio da zebra é exigido pelo seed só no teclado; em
  `web-mobile` ele não é requisito deste conjunto (`DOMAIN/DEC-05`).
- `web-desktop`: o retorno da zebra é só o som, com o som ligado (critérios 09 a 12); não há vibração
  (`DOMAIN/DEC-05`).
- `web-mobile`: com sensor de inclinação ausente ou permissão negada, o controle recai para toque com
  estado visível na tela (I4, `[DOMAIN]`); a zebra, a aderência e a vibração não mudam.

## Pré-condições

- O arquivo de pista da Kart Park foi gerado offline com as zebras do arquivo de origem.
- Para os critérios observados na simulação, na tela, no aparelho ou no som: a Kart Park está escolhida
  no seletor e o treino foi iniciado.

## Critérios de aceite

- AC-US-0005-01: No arquivo de pista gerado, há 34 trechos de zebra: os 33 do arquivo de origem, com o
  trecho que cruza a linha de largada dividido em dois na linha de largada (`SEED/MED`).
- AC-US-0005-02: No arquivo de pista gerado, cada trecho de zebra tem o lado (esquerda ou direita, no
  sentido de corrida) e cobre o trecho de volta declarados para ele no arquivo de origem.
- AC-US-0005-03: Na tela, cada trecho de zebra é desenhado no lado da pista declarado no arquivo de
  origem.
- AC-US-0005-04: No estado da simulação, um kart com rodas sobre a zebra e nenhuma roda na grama não
  está em saída de pista.
- AC-US-0005-05: Na Kart Park, uma volta em que o kart roda sobre a zebra por mais de 1000 ms, sem
  nenhuma roda além da zebra, não é invalidada por corte no estado da simulação.
- AC-US-0005-06: No estado da simulação, a aderência de cada pneu sobre a zebra é 85 % da aderência do
  mesmo pneu no asfalto, nas mesmas condições (`DOMAIN/DEC-05`).
- AC-US-0005-07: Em `web-mobile`, com o navegador permitindo vibração, enquanto houver ao menos uma roda
  na zebra o aparelho vibra 20 ms a cada 0,25 s (`DOMAIN/DEC-05`).
- AC-US-0005-08: Em `web-mobile`, sem nenhuma roda na zebra, nenhum novo pulso de vibração da zebra
  começa.
- AC-US-0005-09: Em `web-desktop`, com o som ligado, enquanto houver ao menos uma roda na zebra o jogo
  toca o som da zebra, repetido (`DOMAIN/DEC-11`).
- AC-US-0005-10: Em `web-desktop`, sem nenhuma roda na zebra, nenhuma nova repetição do som da zebra
  começa.
- AC-US-0005-11: Em `web-desktop`, com o som desligado, rodar sobre a zebra não produz som.
- AC-US-0005-12: Em `web-desktop`, o som da zebra é diferente de todos os outros sons do jogo.

## Casos anormais

- **Navegador sem vibração, ou que a bloqueia (`web-mobile`)**: não há vibração; a regra de pista, a
  aderência e a volta não mudam (critérios 04 a 06).
- **Som desligado (`web-desktop`)**: não há som da zebra (critério 11); a regra de pista e a aderência
  não mudam.
- **Rodas entrando e saindo da zebra em sequência rápida**: vibração e som só começam um novo pulso ou
  uma nova repetição enquanto houver ao menos uma roda na zebra (critérios 07 a 10).
- **Zebra que cruza a linha de largada**: aparece dividida dos dois lados da linha (critério 01); a
  divisão não acrescenta nem retira zebra da pista, só a separa na linha (critério 02).
- **Kart com rodas na zebra e na grama ao mesmo tempo**: a roda na zebra tem 85 % da aderência do
  asfalto (critério 06); a roda na grama segue a regra da grama, e o corte segue os limites de US-0003.
- **Mudança de uma zebra depois de publicada**: é publicada como versão nova da pista (NFR-0006).
- **Sensor de inclinação ausente ou permissão negada (`web-mobile`)**: o controle recai para toque com
  estado visível (I4); a zebra, a aderência e a vibração não mudam.

## Fontes

- `SEED/US-5` — história e seus cinco critérios.
- `SEED/MED` — 33 trechos de zebra, 389,9 m no total; um passa 3 m da linha de largada.
- `SEED/RD-04` — zebras nas curvas (RF07).
- `SEED/RD-12` — zebra conta como pista, com 85 % de aderência e vibração no celular.
- `SEED/IM-I2`, `SEED/IM-I8` — a zebra é dado de superfície; o contrato de passo não muda.
- `SEED/RI-04`, `DOMAIN/DEC-11` — o som da zebra no teclado é um ruído curto e grave que se repete.
- `DOMAIN/DEC-05` — 85 %, vibração de 20 ms a cada 0,25 s no celular, só o som no teclado.

## Pontos em aberto

Nenhum — `DOMAIN/DEC-05` e `DOMAIN/DEC-11` fixam a aderência, a vibração e o som.
