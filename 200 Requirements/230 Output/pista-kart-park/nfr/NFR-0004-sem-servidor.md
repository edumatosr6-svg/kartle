---
id: NFR-0004
title: Jogar sem servidor
feature: pista-kart-park
stage: req
status: validated
version: 1.0.0
sources: [SEED/NF-04]
---

# NFR-0004 — Jogar sem servidor

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| Escolher a Kart Park no seletor e completar uma volta nela não depende de nenhum serviço remoto além da entrega dos arquivos do próprio jogo | 0 requisições a outros serviços entre a escolha da pista e o fim da volta, sem contar a navegação que o Jogador inicia ao acionar o link do crédito | Registro das requisições de rede do navegador durante a escolha da pista e uma volta completa, em cada canal | `web-desktop`, `web-mobile` | `SEED/NF-04` (RNF08) |
