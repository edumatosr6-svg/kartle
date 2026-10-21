---
id: NFR-0008
title: Determinismo entre navegadores
feature: race-lap-validation
stage: req
status: validated
version: 2.0.0
sources: [SEED/NF-08, DOMAIN/DEC-07]
---

# NFR-0008 — Determinismo entre navegadores

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| A mesma sequência de entradas, na mesma pista (`trackId`, `trackVersion`) e com o mesmo acerto, produz o mesmo tempo total e os mesmos quatro tempos de setor em Chrome, Edge, Firefox e Safari, nas versões atuais | Diferença de 0 ms no tempo exibido (3 casas decimais) entre os 4 navegadores, em 100% das sequências comparadas; qualquer diferença é defeito | Teste registrado em cada um dos 4 navegadores nomeados (I9), comparando o tempo total e os tempos de setor exibidos para a mesma sequência de entradas | `web-desktop`, `web-mobile` | `SEED/NF-08` (RNF05, RNF07), `DOMAIN/DEC-07` |
