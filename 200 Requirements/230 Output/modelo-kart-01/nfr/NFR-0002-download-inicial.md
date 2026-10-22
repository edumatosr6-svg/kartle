---
id: NFR-0002
title: Download inicial abaixo de 3 MB
feature: modelo-kart-01
stage: req
status: validated
version: 1.0.0
sources: [SEED/NF-02]
---

# NFR-0002 — Download inicial abaixo de 3 MB

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| O download inicial do jogo, com o Kart 01 e a câmera de jogo incluídos, continua abaixo do limite de RNF02 | Menos de 3 MB transferidos, com compressão, numa primeira visita com cache vazio | Medida do build entregue: soma dos bytes comprimidos dos recursos baixados na primeira visita, conferida pela lista de transferências de rede do navegador numa primeira visita com cache vazio | `web-desktop`, `web-mobile` | `SEED/NF-02` (RNF02) |
