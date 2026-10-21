---
id: NFR-0010
title: Contrato de passo fixo preservado
feature: race-lap-validation
stage: req
status: validated
version: 1.0.0
sources: [SEED/RE-02, SEED/IM-I8]
---

# NFR-0010 — Contrato de passo fixo preservado

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| O passo fixo da simulação e o significado dos campos de `Input` não mudam nesta feature | 0 alterações no valor de `STEP` e 0 alterações no significado dos campos de `Input` | Saída de `npm test` comparando `STEP` e o efeito de cada campo de `Input` com os valores anteriores à feature | `web-desktop`, `web-mobile` | `SEED/RE-02` (I8), `SEED/IM-I8` |
