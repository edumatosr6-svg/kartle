---
id: NFR-0007
title: Preset Realista inalterado
feature: dirigibilidade
stage: req
status: validated
version: 2.0.0
sources: [SEED/RE-03, SEED/RD-02]
---

# NFR-0007 — Preset Realista inalterado

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| O acerto **Realista — aluguel 4T** não muda: nenhum parâmetro, nenhuma assistência arcade adicionada, nenhum resultado de ensaio alterado (restrição do seed; `requirements/10`) | Saída dos ensaios de física e de dirigibilidade com o preset Realista idêntica à linha de base em 100 % das medidas; 0 assistências arcade ativas no Realista | Comparação das saídas do bench de física e de `npm run bench:handling` para o Realista, antes e depois da feature, registradas em `docs/physics.md` (NFR-0004) | `web-desktop`, `web-mobile` | `SEED/RE-03`, `SEED/RD-02` |
