---
id: NFR-0009
title: Pista dos ensaios automáticos
feature: pista-kart-park
stage: req
status: validated
version: 1.0.0
sources: [SEED/RE-01, DOMAIN/DEC-06]
---

# NFR-0009 — Pista dos ensaios automáticos

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| A pista sintética continua sendo a pista dos ensaios automáticos de `dirigibilidade` e de `race-lap-validation`, que têm números calibrados nela | 100 % desses ensaios rodam na pista sintética; 0 deles passa a usar a Kart Park | Saída de `npm test` e dos benches desses dois conjuntos, com a pista usada por cada ensaio | `web-desktop`, `web-mobile` | `SEED/RE-01`, `DOMAIN/DEC-06` |
