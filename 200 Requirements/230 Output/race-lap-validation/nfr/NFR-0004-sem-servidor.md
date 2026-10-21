---
id: NFR-0004
title: Volta sem servidor
feature: race-lap-validation
stage: req
status: validated
version: 1.0.0
sources: [SEED/NF-04]
---

# NFR-0004 — Volta sem servidor

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| Uma volta é iniciada, cronometrada, validada e exibida sem depender de servidor | 0 requisições de rede necessárias entre o início da contagem e a exibição do resultado; resultado exibido com a rede desligada em 100% das voltas testadas | Execução com a rede bloqueada após o carregamento da página: a volta conclui e o resultado é exibido na tela | `web-desktop`, `web-mobile` | `SEED/NF-04` (RNF08), I4 |
