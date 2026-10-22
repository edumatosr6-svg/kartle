---
id: NFR-0006
title: Simulação, validação de volta e presets inalterados
feature: modelo-kart-01
stage: req
status: validated
version: 1.0.0
sources: [SEED/RE-01, SEED/RD-02, SEED/IM-I8, SEED/FE-02, DOMAIN/DEC-02]
---

# NFR-0006 — Simulação, validação de volta e presets inalterados

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| "Nenhuma mudança em `src/physics.ts`, `src/lap.ts`, `src/track.ts` ou nos presets" (citado da seção Restrições do seed) | 0 linhas alteradas nesses três arquivos e nos presets pelas mudanças desta feature | Diferença do repositório introduzida pelas mudanças desta feature, restrita a esses três arquivos e aos presets | `web-desktop`, `web-mobile` | `SEED/RE-01` |
| Passo fixo, presets e `Input` não mudam por causa do modelo; as medidas da simulação não são alinhadas ao modelo nesta feature | Mesmo `STEP`, mesmo conjunto de campos e faixas de `Input` e mesmas medidas da simulação (entre-eixos de 1,04 m e bitola de 1,20 m) antes e depois da feature | Saída de `npm test` comparando `STEP`, campos e faixas de `Input` e as medidas da simulação com os valores anteriores à feature | `web-desktop`, `web-mobile` | `SEED/RD-02`, `SEED/IM-I8`, `SEED/FE-02`, `DOMAIN/DEC-02` |
| O contrato de passo não é tocado: a mesma sequência de `Input` dá o mesmo resultado (RNF07) | Mesmo estado da simulação e mesmo tempo de volta, antes e depois da feature, para a mesma sequência de `Input` a partir do mesmo estado inicial, em 100 % das execuções comparadas | Saída de `npm test`: estado da simulação após N passos de `STEP` e tempo de volta, comparados com a linha de base anterior à feature | `web-desktop`, `web-mobile` | `SEED/IM-I8` (I8, RNF07) |
