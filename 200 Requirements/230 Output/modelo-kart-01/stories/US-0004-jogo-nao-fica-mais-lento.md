---
id: US-0004
title: Jogo não fica mais lento com o Kart 01
feature: modelo-kart-01
stage: req
status: validated
version: 1.0.1
sources: [SEED/US-4, SEED/NF-01, SEED/IM-I9, DOMAIN/DEC-01, DOMAIN/DEC-05]
---

# US-0004 — Jogo não fica mais lento com o Kart 01

## História

Como Jogador, quero que o kart novo não deixe o jogo mais lento, para continuar pilotando na taxa de quadros
que RNF03 fixa, agora com o Kart 01 em cena.

## Canais

- `web-desktop`: pelo menos 60 fps no notebook de referência de RNF03.
- `web-mobile`: pelo menos 30 fps no celular intermediário de referência de RNF03; uma execução em desktop não vale
  como evidência para celular (I9). O limite vale em paisagem e em retrato.
- `web-mobile` com sensor ausente ou permissão negada: o controle recai para toque com estado visível (I4);
  o limite de taxa de quadros é o mesmo.

## Pré-condições

- Kart 01 em cena com a sombra (US-0001, `DOMAIN/DEC-05`), com o agrupamento por material aplicado
  (`DOMAIN/DEC-01`, NFR-0004), e a câmera de corrida (US-0003).
- Os aparelhos de referência de RNF03 (notebook e celular intermediário) escolhidos e nomeados no teste
  registrado (I9).

## Critérios de aceite

- AC-US-0004-01: Em `web-desktop`, no notebook de referência de RNF03, a taxa de quadros sustentada ao
  longo de uma volta completa em corrida, com o Kart 01 e a sua sombra em cena, é de pelo menos 60 fps,
  registrada em teste no aparelho nomeado (`SEED/US-4`; `SEED/NF-01`, RNF03; `SEED/IM-I9`).
- AC-US-0004-02: Em `web-mobile`, no celular intermediário de referência de RNF03, a taxa de quadros
  sustentada ao longo de uma volta completa em corrida, com o Kart 01 e a sua sombra em cena, é de pelo
  menos 30 fps, registrada em teste no aparelho nomeado (`SEED/US-4`; `SEED/NF-01`, RNF03; `SEED/IM-I9`).

## Casos anormais

- **Taxa abaixo do limite no aparelho de referência**: o critério falha; o custo do kart é reduzido sem
  mudar a forma (agrupamento por material, `DOMAIN/DEC-01`), nunca o limite. A sombra continua: o dono do
  produto decidiu que o kart projeta sombra (`DOMAIN/DEC-05`), e retirá-la seria reduzir o escopo.
- **Aparelho abaixo do de referência**: o seed não fixa limite para ele; nenhum critério deste conjunto se
  aplica.
- **Execução só em desktop para o limite de celular**: não vale como evidência (I9); o critério 02 só é
  decidido no celular de referência.
- **Aba em segundo plano ou pausa**: a medida vale para a volta em corrida, com a aba em primeiro plano; um
  intervalo em pausa não entra na medida.
- **Troca de orientação durante a medida (`web-mobile`)**: o limite de 30 fps vale nas duas orientações.
- **Sensor ausente ou permissão negada (`web-mobile`)**: o controle recai para toque com estado visível
  (I4); o limite de taxa de quadros não muda.

## Fontes

- `SEED/US-4` — história e seu critério. O seed não diz o valor da história; a oração "para ..." o tira
  do próprio critério do seed (RNF03), sem acrescentar requisito.
- `SEED/NF-01` — taxa de quadros com o modelo (RNF03).
- `SEED/IM-I9` — taxa de quadros verificada em tela, em teste registrado nos aparelhos nomeados.
- `DOMAIN/DEC-01` — agrupamento por material para no máximo 30 chamadas de desenho.
- `DOMAIN/DEC-05` — o kart projeta sombra.

## Pontos em aberto

Nenhum — `DOMAIN/DEC-01` fecha o ponto aberto 01 do seed.
