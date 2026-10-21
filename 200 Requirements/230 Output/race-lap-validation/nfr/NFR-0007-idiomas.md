---
id: NFR-0007
title: Mensagens em português e inglês
feature: race-lap-validation
stage: req
status: validated
version: 2.0.0
sources: [SEED/NF-07, DOMAIN/DEC-09]
---

# NFR-0007 — Mensagens em português e inglês

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| As mensagens de estado da volta e de motivo existem em português e em inglês e seguem o idioma do navegador | 100% das mensagens de estado e de motivo disponíveis nos 2 idiomas; idioma exibido igual ao do navegador quando este é pt ou en; inglês em 100% dos casos com o navegador em qualquer outro idioma | Estado da tela com o navegador configurado em pt, em en e em pelo menos 1 idioma que não é pt nem en | `web-desktop`, `web-mobile` | `SEED/NF-07` (RNF11), `DOMAIN/DEC-09` |
