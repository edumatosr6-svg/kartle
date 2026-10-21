---
id: NFR-0002
title: Custo por passo da simulação
feature: dirigibilidade
stage: req
status: validated
version: 2.0.0
sources: [SEED/NF-02]
---

# NFR-0002 — Custo por passo da simulação

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| O custo de um passo da simulação com o novo acerto Arcade assistido não aumenta em relação à linha de base de forma que comprometa a taxa de quadros (RNF03) | Tempo médio por passo de `STEP` no bench no máximo 10 % acima da linha de base registrada com o acerto anterior, na mesma máquina e no mesmo runtime, medido sobre a volta completa do piloto de teste | Saída de `npm run bench:handling` (ou do bench de física) com o tempo médio por passo em µs, registrada em `docs/physics.md` ao lado da linha de base (NFR-0004) | `web-desktop`, `web-mobile` | `SEED/NF-02` (RNF03) |
