---
id: US-0001
title: Resposta imediata do volante
feature: dirigibilidade
stage: req
status: validated
version: 1.0.0
sources: [SEED/US-1, SEED/RD-05, SEED/NF-03, SEED/IM-I9, DOMAIN/REF-01, DOMAIN/DEC-01, DOMAIN/DEC-09]
---

# US-0001 — Resposta imediata do volante

## História

Como Jogador, quero que o kart responda ao volante de imediato, para apontar para a curva sem antecipar.

## Canais

- `web-desktop` e `web-mobile`: mesmos limites de resposta (250 ms para subir a 90 % do regime; 300 ms
  para cair a 10 %), medidos no estado da simulação a partir do `Input` recebido. Nenhuma diferença de
  limite entre os canais.
- `web-desktop`: o esterço é binário (0, 1 ou −1); os critérios 01 e 02 descrevem exatamente a entrada
  que o teclado produz.
- `web-mobile`: o esterço é proporcional; os critérios 01 e 02 valem para a inclinação mantida no ângulo
  que o adaptador mapeia para esterço 1 (ou −1), e os critérios 03 e 04 fixam o que vale para esterço
  parcial.
- `web-mobile` com sensor ausente ou permissão negada: o controle recai para toque com estado visível
  (I4); o toque produz esterço binário e os critérios 01 e 02 valem sem mudança.

## Pré-condições

- Acerto Arcade assistido selecionado, na sua nova versão.
- O kart está em reta, no asfalto, a 50 km/h, com esterço 0 e estado de aderência `grip`.

## Critérios de aceite

- AC-US-0001-01: No estado da simulação, com o kart em reta a 50 km/h e esterço levado de 0 a 1, ou de 0
  a −1 (curva para o outro lado), num passo, a taxa de guinada atinge 90 % do seu regime em módulo em no
  máximo 250 ms de tempo simulado contados desse passo (`DOMAIN/DEC-01`).
- AC-US-0001-02: No estado da simulação, com o esterço 1, ou −1, mantido até a taxa de guinada atingir o
  regime e então levado a 0 num passo, a taxa de guinada cai a 10 % do regime em módulo em no máximo
  300 ms de tempo simulado contados desse passo (`DOMAIN/DEC-01`).
- AC-US-0001-03: Em `web-mobile`, com a inclinação levada num passo, a partir de esterço 0, a um ângulo
  que o adaptador mapeia para esterço entre 0 e 1 exclusive e ali mantida, a taxa de guinada atinge 90 %
  do regime correspondente a esse esterço em no máximo 250 ms de tempo simulado contados desse passo
  (`SEED/US-1`, terceiro critério; `SEED/NF-03`).
- AC-US-0001-04: Em `web-mobile`, com a inclinação mantida num ângulo que o adaptador mapeia para esterço
  entre 0 e 1 exclusive até a taxa de guinada atingir o regime correspondente e então levada a esterço 0
  num passo, a taxa de guinada cai a 10 % desse regime em no máximo 300 ms de tempo simulado contados
  desse passo (`SEED/US-1`, terceiro critério; `SEED/NF-03`).
- AC-US-0001-05: Nos ensaios dos critérios 01 a 04, o veredito registrado na saída do ensaio depende
  apenas do tempo medido da taxa de guinada (subida a 90 % e queda a 10 % do regime): um passo em que a
  telemetria reporta `understeer` durante o ensaio não falha o ensaio nem altera o tempo medido. A
  aderência em curva não é julgada neste ensaio, e sim só pelo ensaio de 45 km/h no raio de 18 m de
  US-0002 (`DOMAIN/DEC-09`).
- AC-US-0001-06: A saída de `npm test` ou de `npm run bench:handling` contém, para o acerto Arcade
  assistido, o ensaio dos critérios 01 e 02 com o tempo medido em ms até 90 % e até 10 % do regime, e a
  janela de estabilização usada para o regime (`SEED/IM-I9`).

## Casos anormais

- **Esterço fora da faixa** (adaptador entrega valor além de −1 a 1): o valor é saturado na faixa de
  `Input` (I4); o critério 01 vale para o valor saturado.
- **Esterço invertido antes de atingir o regime** (de 1 para −1 num passo): o seed não fixa limite para a
  inversão e este conjunto não fixa nenhum; os critérios 01 e 02 são medidos a partir de esterço 0 e de
  regime atingido, respectivamente, e não se aplicam à inversão. Um limite para a inversão, se desejado,
  é pedido ao autor do seed.
- **Velocidade diferente de 50 km/h ao aplicar o esterço**: os limites de 250 ms e 300 ms são medidos a
  50 km/h; em outras velocidades o conjunto não fixa limite, e o comportamento em curva é coberto por
  US-0002 e US-0003.
- **Pausa, perda de foco da aba ou perda do sensor durante a manobra**: a simulação fica suspensa; os
  limites são de tempo simulado e não contam o tempo de suspensão.
- **Sensor de inclinação ausente ou permissão negada antes da volta (`web-mobile`)**: controle recai para
  toque com estado visível (I4); valem os critérios 01 e 02.
- **Taxa de quadros baixa**: a resposta é função dos passos de `STEP`, não dos quadros; os limites não
  mudam.

## Fontes

- `SEED/US-1` — história e seus três critérios.
- `SEED/RD-05`, `DOMAIN/REF-01` — direção direta e rápida como sensação alvo.
- `SEED/NF-03` — teclado e inclinação atendem ambos.
- `SEED/IM-I9` — ensaio determinístico.
- `DOMAIN/DEC-01` — 250 ms e 300 ms.
- `DOMAIN/DEC-09` — o ensaio de resposta do volante mede só a guinada; `understeer` transitório nesse
  ensaio é aceitável; a aderência em curva é julgada só pelo ensaio de US-0002.

## Pontos em aberto

Nenhum — `DOMAIN/DEC-01` fecha o ponto aberto 01 do seed.
