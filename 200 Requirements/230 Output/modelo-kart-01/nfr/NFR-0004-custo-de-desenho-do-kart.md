---
id: NFR-0004
title: Custo de desenho do kart
feature: modelo-kart-01
stage: req
status: validated
version: 1.0.0
sources: [SEED/NF-04, SEED/IM-I9, DOMAIN/DEC-01]
---

# NFR-0004 — Custo de desenho do kart

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| O kart com o piloto cabe no orçamento de desenho decidido para o ponto aberto 01: as 124 malhas do código do Cowork são agrupadas por material | No máximo 30 chamadas de desenho do kart com o piloto, contadas como o seed contou as 124: uma por malha e por material de cada malha do modelo montado | Saída de `npm test` sobre o modelo montado, com a contagem de chamadas de desenho do kart com o piloto | `web-desktop`, `web-mobile` | `SEED/NF-04`, `DOMAIN/DEC-01` |
| O agrupamento por material não muda a forma do modelo | O modelo montado tem 5.128 triângulos, o mesmo número medido no código do Cowork; as medidas de US-0001 continuam valendo depois do agrupamento | Saída de `npm test` sobre o modelo montado, com a contagem de triângulos do kart com o piloto | `web-desktop`, `web-mobile` | `DOMAIN/DEC-01` ("sem mudar a forma"), `SEED.md` ponto aberto 01 (5.128 triângulos) |
