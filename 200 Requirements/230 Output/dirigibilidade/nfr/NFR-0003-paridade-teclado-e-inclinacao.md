---
id: NFR-0003
title: Paridade entre teclado e inclinação
feature: dirigibilidade
stage: req
status: validated
version: 1.0.0
sources: [SEED/NF-03, SEED/IM-I2]
---

# NFR-0003 — Paridade entre teclado e inclinação

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| Os critérios de US-0001 a US-0004 são atendidos tanto com entrada binária (teclado; toque no recuo do sensor) quanto com entrada proporcional (inclinação) | 100 % dos critérios de aceite de US-0001 a US-0004 aprovados para a sequência binária e para a sequência proporcional equivalente (esterço 1 mantido), sem diferença de limite entre os canais; a resposta a esterço parcial é coberta pelos critérios 03 e 04 de US-0001 | Saída de `npm test`: cada ensaio de US-0001 a US-0004 executado com as duas formas de `Input`, aprovado nas duas; o adaptador de controle não contém regra de pilotagem (I2), de modo que o mesmo `Input` produz o mesmo estado | `web-desktop`, `web-mobile` | `SEED/NF-03`, `SEED/IM-I2` |
