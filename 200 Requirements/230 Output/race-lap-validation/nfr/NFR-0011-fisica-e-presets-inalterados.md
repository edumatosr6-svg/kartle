---
id: NFR-0011
title: Física e presets de kart inalterados
feature: race-lap-validation
stage: req
status: validated
version: 1.0.0
sources: [SEED/RE-05]
---

# NFR-0011 — Física e presets de kart inalterados

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| A física de pilotagem e os presets de kart não mudam nesta feature | Saída dos benches de física e de dirigibilidade idêntica antes e depois da feature, em 100% das medidas | Comparação das saídas de `npm run bench:physics` e `npm run bench:handling` registradas em `docs/` (I9) | `web-desktop`, `web-mobile` | `SEED/RE-05` |
