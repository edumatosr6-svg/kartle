---
id: NFR-0002
title: Independência da taxa de quadros
feature: race-lap-validation
stage: req
status: validated
version: 1.0.0
sources: [SEED/NF-02, SEED/RD-07]
---

# NFR-0002 — Independência da taxa de quadros

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| O tempo total e os quatro tempos de setor não dependem da taxa de quadros renderizados | Resultados idênticos com renderização a 30 fps e a 60 fps, em 100% das comparações | Resultado da simulação para a mesma sequência de entradas executada com renderização limitada a 30 fps e a 60 fps | `web-desktop`, `web-mobile` | `SEED/NF-02`, `SEED/RD-07` (RNF07) |
