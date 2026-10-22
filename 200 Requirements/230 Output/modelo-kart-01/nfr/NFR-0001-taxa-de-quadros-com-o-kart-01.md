---
id: NFR-0001
title: Taxa de quadros com o Kart 01
feature: modelo-kart-01
stage: req
status: validated
version: 1.0.0
sources: [SEED/NF-01, SEED/US-4, SEED/IM-I9, DOMAIN/DEC-05]
---

# NFR-0001 — Taxa de quadros com o Kart 01

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| Taxa de quadros sustentada durante uma volta completa em corrida, com o Kart 01, a sua sombra e a câmera de corrida, em notebook | Pelo menos 60 fps em todos os segundos da volta, no notebook de referência de RNF03 | Teste registrado no aparelho nomeado (I9): quadros contados a cada segundo ao longo de uma volta completa | `web-desktop` | `SEED/NF-01` (RNF03), `DOMAIN/DEC-05` |
| Taxa de quadros sustentada durante uma volta completa em corrida, com o Kart 01, a sua sombra e a câmera de corrida, em celular intermediário, em paisagem e em retrato | Pelo menos 30 fps em todos os segundos da volta, no celular intermediário de referência de RNF03 | Teste registrado no aparelho nomeado (I9): quadros contados a cada segundo ao longo de uma volta completa; uma execução em desktop não vale como evidência para celular | `web-mobile` | `SEED/NF-01` (RNF03), `DOMAIN/DEC-05` |
