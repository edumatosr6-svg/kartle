---
id: NFR-0012
title: Publicação condicionada à licença Esri
feature: pista-kart-park
stage: req
status: validated
version: 1.0.0
sources: [SEED/RI-01, SEED/IM-I6, DOMAIN/DEC-02, DOMAIN/DEC-07, DOMAIN/DEC-08]
---

# NFR-0012 — Publicação condicionada à licença Esri

A dúvida sobre publicar dado derivado da Esri World Imagery bloqueia **só a promoção para produção**; não
bloqueia nenhuma etapa de especificação, e staging pode usar a pista (`DOMAIN/DEC-02`, `DOMAIN/DEC-08`).

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| Enquanto o dono do produto não registrar a decisão sobre a licença Esri, a Kart Park fica só em staging | 0 promoções para produção com a Kart Park antes de a decisão estar registrada em `DOMAIN.md` | Registro de liberação da etapa de deploy comparado com a data da decisão em `DOMAIN.md` | `web-desktop`, `web-mobile` | `SEED/RI-01`, `DOMAIN/DEC-08` |
| Se a licença for liberada, o crédito da Esri entra junto ao crédito OSM | 100 % das telas de crédito de US-0006 (seletor de pista e tela de resultado) exibem também o crédito da Esri a partir da liberação | Inspeção do estado das duas telas com a Kart Park selecionada, em cada canal, depois da liberação | `web-desktop`, `web-mobile` | `DOMAIN/DEC-07` |
