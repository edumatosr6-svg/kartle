---
id: NFR-0007
title: Posições das rodas da simulação preservadas
feature: modelo-kart-01
stage: req
status: validated
version: 1.0.0
sources: [SEED/RE-03, DOMAIN/DEC-02]
---

# NFR-0007 — Posições das rodas da simulação preservadas

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| "As posições das rodas que a simulação usa para marcas de pneu e telemetria continuam vindo de `wheelPositions`" (citado da seção Restrições do seed); o modelo é só visual | Para a mesma sequência de `Input` a partir do mesmo estado inicial, os valores de `wheelPositions` após N passos de `STEP` são iguais antes e depois da feature, em 100 % das execuções comparadas | Saída de `npm test`: comparação de `wheelPositions` após N passos de `STEP` com a linha de base anterior à feature | `web-desktop`, `web-mobile` | `SEED/RE-03`, `DOMAIN/DEC-02` |
| A telemetria reporta as posições das rodas que vêm de `wheelPositions`, não as posições das rodas do modelo | 0 diferenças entre as posições das rodas reportadas pela telemetria e os valores de `wheelPositions` no mesmo passo | Saída de `npm test`: comparação, passo a passo, das posições das rodas na telemetria com `wheelPositions` | `web-desktop`, `web-mobile` | `SEED/RE-03` |
