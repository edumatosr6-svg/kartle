---
id: US-0001
title: Kart de verdade na pista
feature: modelo-kart-01
stage: req
status: validated
version: 1.1.0
sources: [SEED/US-1, SEED/RD-03, SEED/RD-04, SEED/RD-05, SEED/IM-I9, SEED/IM-I10, SEED/FE-03, DOMAIN/DEC-00, DOMAIN/DEC-05]
---

# US-0001 — Kart de verdade na pista

## História

Como Jogador, quero ver um kart de verdade na pista, para reconhecer o que estou pilotando.

## Canais

- `web-desktop` e `web-mobile`: o mesmo modelo, com as mesmas medidas, peças, cores e sombra, em paisagem e
  em retrato. Nenhuma diferença entre os canais.
- `web-mobile` com sensor ausente ou permissão negada: o controle recai para toque com estado visível (I4);
  o modelo exibido é o mesmo.

## Pré-condições

- Uma pista carregada e o kart do Jogador em cena (antes da largada ou em corrida).
- O modelo montado a partir do código do Cowork (`SEED/RD-05`, `DOMAIN/DEC-00`), conferido contra a ficha
  "Kart 01 — Kartle" (`SEED/RD-04`).

## Critérios de aceite

- AC-US-0001-01: A saída de `npm test` reporta, para o modelo montado, comprimento da caixa envolvente do
  kart de 1,93 m, com tolerância de ±2 cm (`SEED/US-1`, primeiro critério; `SEED/IM-I9`).
- AC-US-0001-02: A saída de `npm test` reporta, para o modelo montado, largura da caixa envolvente do kart
  de 1,45 m, com tolerância de ±2 cm (`SEED/US-1`, primeiro critério).
- AC-US-0001-03: A saída de `npm test` reporta, para o modelo montado, entre-eixos de 1,05 m, com
  tolerância de ±2 cm (`SEED/US-1`, primeiro critério).
- AC-US-0001-04: A saída de `npm test` reporta, para o modelo montado, diâmetro de 0,26 m em cada uma das
  duas rodas dianteiras, medida ao centímetro (`SEED/US-1`, segundo critério).
- AC-US-0001-05: A saída de `npm test` reporta, para o modelo montado, diâmetro de 0,28 m em cada uma das
  duas rodas traseiras, medida ao centímetro (`SEED/US-1`, segundo critério).
- AC-US-0001-06: A saída de `npm test` reporta, para o modelo montado, bitola dianteira de 1,00 m, medida
  ao centímetro (`SEED/US-1`, segundo critério).
- AC-US-0001-07: A saída de `npm test` reporta, para o modelo montado, bitola traseira de 1,14 m, medida ao
  centímetro (`SEED/US-1`, segundo critério).
- AC-US-0001-08: A saída de `npm test` lista, no modelo montado, um grupo de peça com geometria visível
  para cada um destes 15 nomes, sem faltar nenhum: `chassi`, `eixoTraseiro`, `rodaDianteiraEsq`,
  `rodaDianteiraDir`, `rodaTraseiraEsq`, `rodaTraseiraDir`, `nariz`, `painelFrontal`, `sidepodEsq`,
  `sidepodDir`, `paraChoqueTraseiro`, `banco`, `direcao`, `pedais` e `motor` (`SEED/US-1`, terceiro
  critério; `SEED/IM-I9`).
- AC-US-0001-09: A saída de `npm test` lista, no modelo montado, um 16º grupo chamado `piloto`, com
  geometria visível, que não está dentro de nenhum dos 15 grupos de peças (`SEED/US-1`, terceiro critério).
- AC-US-0001-10: A saída de `npm test` reporta que o kart do modelo montado usa a cor laranja Kartle
  `#FF6A13` (`SEED/US-1`, quarto critério).
- AC-US-0001-11: A saída de `npm test` reporta que o grupo `chassi` do modelo montado tem a cor grafite
  `#2B2E34` (`SEED/US-1`, quarto critério).
- AC-US-0001-12: A saída de `npm test` reporta que a placa do para-choque do modelo montado tem a cor branca
  `#F4F3EF` (`SEED/US-1`, quarto critério).
- AC-US-0001-13: A saída de `npm test` reporta que o macacão do piloto, no grupo `piloto` do modelo
  montado, tem a cor azul `#2F55D4` (`SEED/US-1`, quarto critério).
- AC-US-0001-14: Antes da largada e em corrida, todo kart exibido na tela é o Kart 01; o kart provisório de
  caixas não aparece em nenhum quadro (`SEED/RD-03`, `SEED/IM-I10`; retirada declarada em `01-context.md`).
- AC-US-0001-15: O kart exibido projeta sombra no chão da pista: em corrida, pela câmera de corrida, a tela
  mostra essa sombra no chão junto ao kart (`DOMAIN/DEC-05`).
- AC-US-0001-16: A tela mostra o número 01 na placa do para-choque do kart exibido (`SEED/US-1`, quarto
  critério; `SEED.md`, Visão geral).

## Casos anormais

- **Medida fora da tolerância ou abaixo da precisão pedida** (por exemplo, por arredondamento na adaptação
  do código do Cowork à versão de Three.js do projeto, `SEED/RE-02`): o critério correspondente falha; o
  modelo é corrigido, nunca a tolerância.
- **Peça faltando, com outro nome ou sem geometria visível** (por exemplo, esvaziada pelo agrupamento por
  material, `DOMAIN/DEC-01`): o critério 08 ou 09 falha; o agrupamento não pode apagar nenhum dos 16 grupos
  nomeados.
- **Cor do código do Cowork diferente da cor da ficha** numa das quatro cores nomeadas pelo seed: vale a cor
  da ficha, referência para conferir (`SEED/RD-04`, `DOMAIN/DEC-00`); o critério da cor falha até o modelo
  usar a cor da ficha.
- **Recarga da página ou troca de orientação**: o modelo exibido é o mesmo, com as mesmas medidas, peças e
  cores; nenhuma dessas ações exibe o kart provisório.
- **Recurso do modelo indisponível**: não se aplica. O modelo é montado por código que entra no próprio jogo
  (`SEED.md`, Contexto: "o código que monta o modelo"), sem arquivo de modelo separado para baixar; não há
  download próprio que possa falhar ou atrasar.
- **Sensor ausente ou permissão negada (`web-mobile`)**: o controle recai para toque com estado visível
  (I4); o modelo exibido não muda.
- **Pedido de outro kart, outra cor ou adesivo**: não há; o jogo tem um único kart, sem personalização
  (`SEED/RD-03`, `SEED/FE-03`, I10).

## Fontes

- `SEED/US-1` — história e seus quatro critérios (medidas, rodas e bitolas, 15 grupos e o piloto, cores).
- `SEED/RD-03`, `SEED/IM-I10`, `SEED/FE-03` — um único kart, sem personalização.
- `SEED/RD-04` — medidas, peças, cores e piloto vêm da ficha.
- `SEED/RD-05`, `DOMAIN/DEC-00` — a fonte do modelo é o código do Cowork; a ficha é a referência para
  conferir.
- `SEED/IM-I9` — forma e medida verificadas sobre o modelo montado.
- `DOMAIN/DEC-05` — o kart projeta sombra no chão.

## Pontos em aberto

Nenhum — `DOMAIN/DEC-05` fecha o ponto aberto 05 do seed; os demais pontos do seed não tocam esta história.
