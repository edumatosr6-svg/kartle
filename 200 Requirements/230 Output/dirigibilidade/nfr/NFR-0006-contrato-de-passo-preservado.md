---
id: NFR-0006
title: Contrato de passo preservado
feature: dirigibilidade
stage: req
status: validated
version: 1.0.0
sources: [SEED/RE-02, SEED/RD-03, SEED/IM-I8]
---

# NFR-0006 — Contrato de passo preservado

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| `STEP`, o solver de 480 Hz e o significado de cada campo de `Input` não mudam (restrição do seed, I8); só os parâmetros do acerto mudam | 0 mudanças no valor de `STEP`, na taxa do solver e no conjunto, faixa e significado dos campos de `Input`, comparados com a versão anterior à feature | Saída de `npm test` com a verificação do critério 06 de US-0005; um replay da versão anterior continua sendo lido e reproduzido passo a passo (com tempo diferente, por ser outra versão de acerto, NFR-0009) | `web-desktop`, `web-mobile` | `SEED/RE-02`, `SEED/RD-03`, `SEED/IM-I8` |
