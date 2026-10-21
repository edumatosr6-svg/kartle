---
id: NFR-0001
title: Determinismo no mesmo runtime
feature: race-lap-validation
stage: req
status: validated
version: 1.0.0
sources: [SEED/NF-01, SEED/IM-I8]
---

# NFR-0001 — Determinismo no mesmo runtime

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| A mesma sequência de entradas, aplicada à mesma pista (`trackId`, `trackVersion`) e ao mesmo acerto, no mesmo runtime, produz o mesmo tempo total e os mesmos quatro tempos de setor | Resultados idênticos em 100% das execuções, com no mínimo 2 execuções por sequência | Saída de `npm test` comparando os resultados da simulação de execuções repetidas, avançadas com `STEP` | `web-desktop`, `web-mobile` | `SEED/NF-01` (RNF07), `SEED/IM-I8` |
