---
id: NFR-0003
title: Nenhuma dependência de execução nova
feature: modelo-kart-01
stage: req
status: validated
version: 1.0.0
sources: [SEED/NF-03, SEED/RE-02]
---

# NFR-0003 — Nenhuma dependência de execução nova

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| O Kart 01 e a câmera de jogo não acrescentam dependência de execução | 0 dependências de execução novas: a lista de dependências de execução declarada pelo projeto é a mesma antes e depois da feature | Comparação da lista de dependências de execução declarada pelo projeto, antes e depois da feature | `web-desktop`, `web-mobile` | `SEED/NF-03` |
| O modelo é montado em Three.js 0.186, já usado pelo projeto; nenhuma versão nova entra como dependência (citado da seção Restrições do seed) | Versão declarada de Three.js igual a 0.186 antes e depois da feature; 0 outras versões de Three.js declaradas | Comparação da versão de Three.js declarada pelo projeto, antes e depois da feature | `web-desktop`, `web-mobile` | `SEED/RE-02` |
