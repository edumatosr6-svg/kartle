---
id: NFR-0003
title: Taxa de quadros com a validação ativa
feature: race-lap-validation
stage: req
status: validated
version: 1.0.0
sources: [SEED/NF-03]
---

# NFR-0003 — Taxa de quadros com a validação ativa

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| Taxa de quadros sustentada durante uma volta completa com a validação e a cronometragem ativas, em notebook | 60 fps, nos aparelhos de referência de RNF03 | Teste registrado no aparelho nomeado (I9): medida de quadros por segundo ao longo de uma volta completa | `web-desktop` | `SEED/NF-03` (RNF03) |
| Taxa de quadros sustentada durante uma volta completa com a validação e a cronometragem ativas, em celular intermediário | 30 fps, nos aparelhos de referência de RNF03 | Teste registrado no aparelho nomeado (I9): medida de quadros por segundo ao longo de uma volta completa; uma execução em desktop não vale como evidência para celular | `web-mobile` | `SEED/NF-03` (RNF03) |
