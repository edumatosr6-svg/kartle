---
id: NFR-0011
title: Código só depois de dirigibilidade
feature: pista-kart-park
stage: req
status: validated
version: 1.0.0
sources: [SEED/RE-02]
---

# NFR-0011 — Código só depois de dirigibilidade

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| O código desta feature só começa depois que `dirigibilidade` passar nos testes e for commitada, porque as duas mudam os mesmos arquivos de simulação e de pista e `dirigibilidade` congela as regras de volta enquanto está em andamento | 0 commits de código desta feature anteriores ao commit em que `dirigibilidade` foi entregue com os testes passando | Histórico de commits do repositório comparado com o veredito da etapa de testes de `dirigibilidade` | nenhum (processo) | `SEED/RE-02` (Restrições, citadas em `01-context.md`); por decisão do autor para esta execução (2026-10-22), a dependência é registrada no D-Spec |
