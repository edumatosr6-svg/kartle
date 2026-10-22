---
id: NFR-0001
title: Tamanho do arquivo da pista
feature: pista-kart-park
stage: req
status: validated
version: 1.0.0
sources: [SEED/NF-01, SEED/MED]
---

# NFR-0001 — Tamanho do arquivo da pista

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| Tamanho do arquivo de pista gerado da Kart Park, como é entregue ao navegador | Menor que 200 KB; para que as duas leituras de KB (1000 e 1024 bytes) concordem, menor que 200.000 bytes | Tamanho em bytes do arquivo de pista gerado, medido no pacote entregue ao navegador | `web-desktop`, `web-mobile` | `SEED/NF-01` (RNF02); o arquivo de origem mede 32.189 bytes (`SEED/MED`) |
