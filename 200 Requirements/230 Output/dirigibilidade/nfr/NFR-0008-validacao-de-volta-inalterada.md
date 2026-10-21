---
id: NFR-0008
title: Validação de volta inalterada
feature: dirigibilidade
stage: req
status: validated
version: 1.0.0
sources: [SEED/RE-04]
---

# NFR-0008 — Validação de volta inalterada

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| A validação de volta e o dado de pista (`src/lap.ts`, `src/track.ts`, restrição do seed) não mudam: regras de largada, setores, marcadores, corte, grama e reposicionamento da feature `race-lap-validation` continuam as mesmas | 0 mudanças nas regras de validade e de cronometragem; 100 % das verificações de `npm test` da feature `race-lap-validation` continuam aprovadas com o novo acerto | Saída de `npm test` do conjunto de `race-lap-validation`, executada após a mudança de acerto | `web-desktop`, `web-mobile` | `SEED/RE-04` |
