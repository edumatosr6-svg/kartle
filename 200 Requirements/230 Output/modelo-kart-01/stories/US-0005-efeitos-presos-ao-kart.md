---
id: US-0005
title: Efeitos continuam presos ao kart
feature: modelo-kart-01
stage: req
status: validated
version: 1.0.1
sources: [SEED/US-5, SEED/RE-03, SEED/RD-01, DOMAIN/DEC-02]
---

# US-0005 — Efeitos continuam presos ao kart

## História

Como Jogador, quero que os efeitos que já existem continuem presos ao kart, para ver as marcas de pneu, a
fumaça do escapamento e a indicação de drift saírem do Kart 01 que estou pilotando.

## Canais

- `web-desktop` e `web-mobile`: os mesmos efeitos, nas mesmas posições do Kart 01, em paisagem e em retrato.
  Nenhuma diferença entre os canais.
- `web-mobile` com sensor ausente ou permissão negada: o controle recai para toque com estado visível (I4);
  os efeitos não mudam.

## Pré-condições

- Kart 01 em cena (US-0001), em corrida.
- As situações em que o jogo já exibe cada efeito não mudam: esta feature muda onde o efeito aparece, não
  quando (`SEED/RD-01`).
- As posições das rodas que a simulação usa para marcas de pneu e telemetria continuam vindo de
  `wheelPositions` (`SEED/RE-03`, NFR-0007).

## Critérios de aceite

- AC-US-0005-01: Em corrida, sempre que o jogo desenha marcas de pneu, cada trecho novo de marca aparece na
  tela no chão sob o pneu traseiro do Kart 01 exibido, do lado correspondente (esquerdo ou direito)
  (`SEED/US-5`).
- AC-US-0005-02: Em corrida, sempre que o jogo exibe a fumaça do escapamento, ela aparece na tela saindo do
  escapamento do Kart 01 exibido (`SEED/US-5`).
- AC-US-0005-03: Em corrida, sempre que o jogo exibe a indicação de drift, ela aparece na tela junto às
  rodas traseiras do Kart 01 exibido (`SEED/US-5`).

## Casos anormais

- **Diferença conhecida entre as rodas da simulação e as do modelo**: o dono do produto decidiu não alinhar
  as medidas da física às do modelo nesta feature (`DOMAIN/DEC-02`). A bitola da simulação é de 1,20 m e a
  traseira do modelo, de 1,14 m: pelos números do seed, a posição traseira de `wheelPositions` fica 0,03 m
  para fora do centro de cada roda traseira do modelo, e o entre-eixos difere em 0,01 m (1,04 m contra
  1,05 m). As marcas continuam vindo de `wheelPositions` (`SEED/RE-03`); o critério 01 é julgado pela
  marca vista na tela sob o pneu exibido. Se essa diferença puser a marca fora do pneu exibido, o critério
  falha e a decisão volta ao dono do produto: nem `wheelPositions` nem as medidas do modelo mudam nesta
  feature.
- **Reposicionamento do kart**: a partir do primeiro quadro depois do reposicionamento, os trechos novos de
  marca, a fumaça e a indicação de drift aparecem nas posições do Kart 01 na nova posição; as marcas já
  desenhadas no chão não mudam por causa desta feature.
- **Pausa**: a simulação não avança; nenhum trecho novo de marca é desenhado, e os efeitos ficam presos ao
  kart parado.
- **Efeito sem a situação que o dispara**: a renderização não decide nada (`SEED/RD-01`); um efeito só
  aparece quando o jogo já o exibiria, e esta feature não acrescenta nem retira situações.
- **Troca de orientação do celular**: as posições dos efeitos em relação ao Kart 01 não mudam.
- **Sensor ausente ou permissão negada (`web-mobile`)**: o controle recai para toque com estado visível
  (I4); os efeitos continuam presos ao kart.

## Fontes

- `SEED/US-5` — história e seu critério (marcas de pneu, fumaça do escapamento e indicação de drift nas
  posições das rodas traseiras e do escapamento do Kart 01). O seed não diz o valor da história; a oração
  "para ..." o tira do próprio critério do seed, sem acrescentar requisito.
- `SEED/RE-03` — as posições das rodas da simulação continuam vindo de `wheelPositions`.
- `SEED/RD-01` — a renderização mostra o estado da simulação e não decide nada.
- `DOMAIN/DEC-02` — as medidas da física não são alinhadas ao modelo nesta feature.

## Pontos em aberto

Nenhum — `DOMAIN/DEC-02` fecha o ponto aberto 02 do seed.
