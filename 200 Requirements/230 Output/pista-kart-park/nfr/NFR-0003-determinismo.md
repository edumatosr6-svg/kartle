---
id: NFR-0003
title: Determinismo na Kart Park
feature: pista-kart-park
stage: req
status: validated
version: 1.0.0
sources: [SEED/NF-03]
---

# NFR-0003 — Determinismo na Kart Park

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| A mesma sequência de entradas, a partir do mesmo estado inicial na Kart Park, dá o mesmo tempo total da volta | Idêntico ao milissegundo em 100 % das execuções repetidas | Saída de `npm test`: a simulação é avançada com `STEP` pela mesma sequência de entradas ao menos 2 vezes, e os tempos totais são comparados | `web-desktop`, `web-mobile` | `SEED/NF-03` (RNF07) |
| A mesma sequência de entradas, a partir do mesmo estado inicial na Kart Park, dá os mesmos 4 tempos de setor | Idênticos ao milissegundo em 100 % das execuções repetidas | Saída de `npm test`: as mesmas execuções da linha anterior, com os 4 tempos de setor comparados um a um | `web-desktop`, `web-mobile` | `SEED/NF-03` (RNF07) |
