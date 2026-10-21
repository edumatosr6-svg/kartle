---
id: US-0001
title: Contagem regressiva e início da cronometragem
feature: race-lap-validation
stage: req
status: validated
version: 2.0.0
sources: [SEED/US-1, SEED/RD-01, DOMAIN/DEC-04, DOMAIN/DEC-05, DOMAIN/DEC-11]
---

# US-0001 — Contagem regressiva e início da cronometragem

## História

Como Jogador, quero uma contagem regressiva antes da largada, para saber exatamente quando a volta começa
a valer.

## Canais

- `web-desktop` e `web-mobile`: mesma contagem, mesma duração, mesmo instante de início do cronômetro,
  mesmo efeito da queima de largada e mesmo tamanho mínimo do texto da contagem (48 px). Nenhuma diferença
  de comportamento entre os canais.
- `web-desktop`: a aceleração antes do sinal verde vem do teclado; `web-mobile`: vem do toque.
- `web-mobile`: com sensor de inclinação ausente ou permissão negada, o controle recai para toque com
  estado visível na tela (I4, `[DOMAIN]`); a contagem e o início do cronômetro não mudam.

## Pré-condições

- Uma volta foi iniciada numa pista cujo dado declara largada, sentido, quatro setores e marcadores.
- O kart está na posição de largada e a contagem regressiva ainda não começou.

## Critérios de aceite

- AC-US-0001-01: Ao iniciar a volta, a tela exibe uma contagem regressiva com duração de 3 s, medida do
  primeiro valor exibido até o sinal verde (`DOMAIN/DEC-05`).
- AC-US-0001-02: Cada valor da contagem regressiva é exibido na tela em texto, além de qualquer cor.
- AC-US-0001-03: O sinal verde é indicado na tela em texto, além de qualquer cor.
- AC-US-0001-04: Durante toda a contagem regressiva, o cronômetro da volta exibido na tela mostra `0`.
- AC-US-0001-05: No estado da simulação, o tempo da volta após N passos de `STEP` contados a partir do
  sinal verde é N × `STEP`, esteja o kart antes ou depois da linha de largada (`DOMAIN/DEC-05`).
- AC-US-0001-06: No estado da simulação, com aceleração máxima aplicada em todos os passos da contagem
  regressiva, o kart está no sinal verde com velocidade 0 m/s e na mesma posição de largada que ocupava no
  início da contagem (`DOMAIN/DEC-04`).
- AC-US-0001-07: Uma volta em que o Jogador acelerou antes do sinal verde não recebe motivo de
  invalidação por isso: ao sinal verde, a tela exibe o estado "válida em andamento" (`DOMAIN/DEC-04`).
- AC-US-0001-08: No estado da simulação, o tempo da volta de uma volta com aceleração antes do sinal verde,
  após N passos de `STEP` contados a partir do sinal verde, é N × `STEP`, sem acréscimo de penalidade
  (`DOMAIN/DEC-04`).
- AC-US-0001-09: Na tela, o texto de cada valor da contagem regressiva e do sinal verde tem no mínimo
  48 px, em `web-desktop` e em `web-mobile` (`DOMAIN/DEC-11`).
- AC-US-0001-10: Na tela, o texto da contagem regressiva e do sinal verde tem contraste mínimo de 4,5:1
  com o fundo imediato, em `web-desktop` e em `web-mobile` (`DOMAIN/DEC-11`, WCAG AA).

## Casos anormais

- **Queima de largada** (acelerar antes do sinal verde): ignorada — o kart fica parado, sem efeito e sem
  penalidade (critérios 06 a 08, `DOMAIN/DEC-04`).
- **Aceleração mantida do fim da contagem até depois do sinal verde**: a aceleração passa a ter efeito a
  partir do sinal verde; o tempo continua contado do sinal verde (critério 05).
- **Pausa ou perda de foco da aba durante a contagem**: a simulação fica suspensa (`DOMAIN/DEC-08`); o
  cronômetro da volta continua mostrando `0`, porque o sinal verde ainda não foi dado (critério 04).
- **Perda do sensor de inclinação durante a contagem (`web-mobile`)**: pausa automática, com o mesmo efeito
  do caso anterior (`DOMAIN/DEC-08`).
- **Sensor de inclinação ausente ou permissão negada antes da contagem (`web-mobile`)**: o controle recai
  para toque com estado visível (I4); a contagem prossegue com a mesma duração.
- **Recarregar ou abandonar a página durante a contagem**: a volta não chega à linha de chegada, portanto
  não é concluída e não produz resultado (`SEED/RD-05`). O consumo de tentativa é da etapa 5, fora do
  escopo.

## Fontes

- `SEED/US-1` — história e seus três critérios.
- `SEED/RD-01` — largada com contagem regressiva (RF09).
- `DOMAIN/DEC-04` — queima de largada ignorada.
- `DOMAIN/DEC-05` — contagem de 3 s e cronômetro iniciado no sinal verde.
- `DOMAIN/DEC-11` — legibilidade WCAG AA e tamanho mínimo da contagem.

## Pontos em aberto

Nenhum — as decisões de `DOMAIN.md` de 2026-10-20 fixam a duração da contagem, o início do cronômetro, a
queima de largada e a legibilidade.
