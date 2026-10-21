---
id: NFR-0001
title: Determinismo preservado
feature: dirigibilidade
stage: req
status: validated
version: 1.0.0
sources: [SEED/NF-01, SEED/IM-I8]
---

# NFR-0001 — Determinismo preservado

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| A mesma sequência de `Input` por passo, no mesmo estado inicial, na mesma pista e na mesma versão de acerto Arcade assistido, produz o mesmo estado da simulação, o mesmo tempo total e os mesmos quatro tempos de setor | Resultados idênticos em 100 % das execuções repetidas, com no mínimo 2 execuções por sequência, para cada ensaio de US-0001 a US-0005 e para a volta do piloto de teste | Saída de `npm test` comparando, passo a passo com `STEP`, os estados e os tempos de execuções repetidas | `web-desktop`, `web-mobile` | `SEED/NF-01` (RNF07), `SEED/IM-I8` |
