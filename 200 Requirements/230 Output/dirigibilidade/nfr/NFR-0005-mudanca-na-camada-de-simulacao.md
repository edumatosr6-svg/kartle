---
id: NFR-0005
title: Mudança restrita à camada de simulação
feature: dirigibilidade
stage: req
status: validated
version: 1.0.0
sources: [SEED/RE-01, SEED/IM-I2]
---

# NFR-0005 — Mudança restrita à camada de simulação

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| Toda a mudança desta feature fica nos presets e nas assistências de `src/physics.ts` (restrição do seed); nenhuma regra de pilotagem — resposta do volante, aderência, aceleração, perda na grama ou na parede — é decidida em renderização ou em adaptador de controle (I2) | 0 regras de pilotagem fora da camada de simulação; 0 importações de camada externa (DOM, renderização, áudio, relógio de parede) na simulação; os ensaios de US-0001 a US-0005 executam sem DOM em `npm test` | Saída de `npm test` executando os ensaios sem DOM; revisão da etapa de código contra o mapa de camadas (I2) | `web-desktop`, `web-mobile` | `SEED/RE-01`, `SEED/IM-I2` |
