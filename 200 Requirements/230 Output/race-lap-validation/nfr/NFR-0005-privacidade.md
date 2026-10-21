---
id: NFR-0005
title: Nenhuma coleta de dados pessoais
feature: race-lap-validation
stage: req
status: validated
version: 1.0.0
sources: [SEED/NF-05]
---

# NFR-0005 — Nenhuma coleta de dados pessoais

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| A validação e a cronometragem não coletam dado pessoal | 0 campos de dado pessoal no resultado da volta e 0 requisições de rede que transmitam dados da volta | Inspeção do resultado produzido pela simulação, do dado persistido no navegador e do tráfego de rede durante uma volta | `web-desktop`, `web-mobile` | `SEED/NF-05` (RNF10), I6 |
