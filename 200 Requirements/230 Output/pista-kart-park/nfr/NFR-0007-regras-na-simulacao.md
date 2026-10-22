---
id: NFR-0007
title: Regras na simulação, verificadas sem a tela
feature: pista-kart-park
stage: req
status: validated
version: 1.0.0
sources: [SEED/IM-I2]
---

# NFR-0007 — Regras na simulação, verificadas sem a tela

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| Geometria, largura, zebra e barreira entram na simulação como dado, e as regras que dependem delas (aderência na zebra, zebra como pista, colisão com a barreira, setores, marcadores e corte) são decididas na simulação; a tela só desenha | 100 % dos critérios de US-0002 a US-0005 observados no estado da simulação ou no arquivo de pista gerado têm uma verificação determinística, e 0 dessas verificações precisa da renderização | Saída de `npm test`: cada verificação avança a simulação com `STEP` ou lê o arquivo de pista gerado, sem carregar a renderização, e indica o critério que verifica | `web-desktop`, `web-mobile` | `SEED/IM-I2` (I2, I9) |
