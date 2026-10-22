---
id: NFR-0005
title: Modelo e câmera na camada de aplicação
feature: modelo-kart-01
stage: req
status: validated
version: 1.0.0
sources: [SEED/RD-01, SEED/IM-I2]
---

# NFR-0005 — Modelo e câmera na camada de aplicação

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| A simulação não importa nada do modelo nem da câmera; tudo desta feature fica na camada de aplicação (I2) | 0 importações, na camada de simulação, de qualquer parte do modelo do Kart 01, da câmera ou dos efeitos desta feature | Verificação de dependências entre camadas na saída de `npm test` | `web-desktop`, `web-mobile` | `SEED/IM-I2`, `SEED/RD-01` |
| A renderização mostra o estado da simulação e não decide nada | 0 diferenças no estado da simulação, após o mesmo número de passos de `STEP` com a mesma sequência de `Input`, entre uma execução com o modelo e a câmera desta feature e uma execução sem renderização | Saída de `npm test`: comparação do estado da simulação após N passos de `STEP` | `web-desktop`, `web-mobile` | `SEED/RD-01` |
