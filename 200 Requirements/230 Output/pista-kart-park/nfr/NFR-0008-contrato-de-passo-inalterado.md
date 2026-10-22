---
id: NFR-0008
title: Contrato de passo inalterado
feature: pista-kart-park
stage: req
status: validated
version: 1.0.0
sources: [SEED/IM-I8]
---

# NFR-0008 — Contrato de passo inalterado

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| O contrato de passo da simulação não muda: o passo fixo `STEP`, a forma de avançar a simulação e o significado de cada campo de `Input` | 0 mudanças no valor de `STEP`, na forma de avançar a simulação e no significado dos campos de `Input` | Comparação do contrato de passo antes e depois da feature, e saída de `npm test` com as verificações existentes desse contrato passando sem alteração | `web-desktop`, `web-mobile` | `SEED/IM-I8` (I8) |
| O efeito da zebra entra como dado de superfície da pista, não como entrada | 0 campos novos de `Input` para a zebra | Comparação dos campos de `Input` antes e depois da feature | `web-desktop`, `web-mobile` | `SEED/IM-I8` (I8) |
