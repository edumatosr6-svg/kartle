---
id: US-0004
title: Sensação de velocidade e risco
feature: dirigibilidade
stage: req
status: validated
version: 2.0.0
sources: [SEED/US-4, SEED/RD-05, SEED/NF-03, SEED/IM-I9, DOMAIN/REF-01, DOMAIN/REF-02, DOMAIN/DEC-02, DOMAIN/DEC-05, DOMAIN/DEC-06]
---

# US-0004 — Sensação de velocidade e risco

## História

Como Jogador, quero sentir velocidade e risco, para a volta ter tensão.

## Canais

- `web-desktop` e `web-mobile`: mesmos limites de aceleração (2,5 s), de velocidade estabilizada
  (105 km/h), de perda na grama (30 % em 1 s) e de contato com a parede, medidos no estado da simulação;
  mesmo HUD de velocidade e aderência. Nenhuma diferença de limite entre os canais.
- `web-desktop`: acelerador binário pelo teclado.
- `web-mobile`: acelerador por toque; a inclinação não afeta os critérios 01 e 02, medidos com esterço 0.
- `web-mobile` com sensor ausente ou permissão negada: controle por toque com estado visível (I4);
  critérios inalterados.

## Pré-condições

- Acerto Arcade assistido selecionado, na sua nova versão (acerto agressivo, `DOMAIN/REF-02`); piloto de
  75 kg (`DOMAIN/DEC-05`).
- Para os critérios 01 e 02: kart parado em reta, no asfalto, esterço 0.

## Critérios de aceite

- AC-US-0004-01: No estado da simulação, partindo de 0 km/h em reta com acelerador cheio mantido e esterço
  0, o kart atinge 60 km/h em no máximo 2,5 s de tempo simulado (`DOMAIN/DEC-05`).
- AC-US-0004-02: No estado da simulação, em reta com acelerador cheio mantido e esterço 0, a velocidade
  estabilizada é de pelo menos 105 km/h (`DOMAIN/DEC-06`).
- AC-US-0004-03: No estado da simulação, com o kart entrando na grama à velocidade estabilizada do
  critério 02, com acelerador cheio e esterço 0 mantidos, a velocidade após 1 s de tempo simulado na grama
  é no máximo 70 % da velocidade de entrada (`SEED/US-4`, segundo critério).
- AC-US-0004-04: O critério 03 vale também com velocidade de entrada de 50 km/h (`DOMAIN/DEC-02`): a
  velocidade após 1 s na grama é no máximo 70 % de 50 km/h.
- AC-US-0004-05: No estado da simulação, no passo em que o kart entra em contato com a parede, a
  velocidade no passo seguinte ao contato é menor que a velocidade no passo anterior ao contato, em 100 %
  dos contatos do ensaio: a parede custa tempo (`SEED/US-4`, segundo critério).
- AC-US-0004-06: Na tela, em `web-desktop` e em `web-mobile`, o HUD exibe a velocidade do kart em km/h e o
  estado de aderência em texto em todos os quadros entre o sinal verde e o fim da volta; nenhum dos dois
  elementos é removido ou ocultado por esta feature (`SEED/US-4`, terceiro critério).
- AC-US-0004-07: A saída de `npm test` ou do bench de física contém, para o acerto Arcade assistido, o
  tempo 0–60 km/h em s, a velocidade estabilizada em km/h, a velocidade após 1 s na grama em km/h para as
  duas velocidades de entrada e a velocidade antes e depois do contato com a parede (`SEED/IM-I9`).

## Casos anormais

- **Acelerador solto antes de 60 km/h**: o critério 01 é medido com acelerador cheio mantido; soltar
  interrompe o ensaio, sem exigência de tempo.
- **Grama a velocidade abaixo de 50 km/h**: o seed não fixa a perda; nenhum limite é inventado. A grama
  continua reduzindo a velocidade (o seed diz "reduz"), sem percentual exigido.
- **Entrada na grama com esterço diferente de 0 ou com a traseira solta**: os critérios 03 e 04 são
  medidos com esterço 0; nenhum limite para outros esterços.
- **Contato com a parede a velocidade quase nula** (kart encostado): o critério 05 exige redução a cada
  contato; com velocidade 0 antes do contato não há contato novo a julgar.
- **Grama e parede não invalidam a volta por si**: regras de corte e de validade pertencem à feature
  `race-lap-validation`, que não muda (NFR-0008).
- **Pausa, perda de foco ou perda do sensor**: simulação suspensa; o HUD mantém o último valor exibido e
  os limites são de tempo simulado.
- **Sensor ausente ou permissão negada antes da volta (`web-mobile`)**: controle por toque com estado
  visível (I4); critérios inalterados.

## Fontes

- `SEED/US-4` — história e seus três critérios.
- `SEED/RD-05`, `DOMAIN/REF-01` — sensação de velocidade e risco; sintoma relatado: pouca sensação de
  velocidade.
- `DOMAIN/REF-02` — acerto agressivo da revisão 2: o dono do produto relatou que o kart "não ganha
  velocidade".
- `SEED/NF-03` — teclado e inclinação atendem ambos.
- `SEED/IM-I9` — ensaio determinístico.
- `DOMAIN/DEC-02` — 50 km/h; `DOMAIN/DEC-05` — 2,5 s (em vigor; substitui 3,0 s); `DOMAIN/DEC-06` —
  105 km/h (em vigor; substitui 95 km/h).

## Pontos em aberto

Nenhum — `DOMAIN/DEC-05` e `DOMAIN/DEC-06` fecham os pontos abertos 05 e 06 do seed.
