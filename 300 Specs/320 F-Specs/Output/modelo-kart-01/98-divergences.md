---
title: Divergências — modelo Kart 01 e câmera de jogo
feature: modelo-kart-01
stage: fspec
status: draft
version: 1.0.0
sources: []
---

# Divergências

Registro durável dos requisitos deste conjunto que o sistema em execução não satisfaz (conventions §6).
Colunas: requisito, o que o requisito exige, o que o sistema faz hoje (`arquivo:linha`), etapa devedora,
estado.

| Requisito | O que exige | O que o sistema faz hoje | Etapa devedora | Estado |
|---|---|---|---|---|

Nenhuma divergência registrada: esta etapa não lê a raiz de código para derivar comportamento (conventions
§12); apenas nomes existentes foram consultados para não colidir com eles (`wheelPositions`, `STEP`,
`Input`, `getHandlingTelemetry`, `speedMps`, `getLapState`, `lapPhase`, `countdownRemainingMs`, `xM`, `zM`,
`headingDeg`). Os requisitos declaram que o jogo exibe hoje o kart provisório de caixas e uma câmera alta e
distante — isso é o motivo da feature; a etapa de código, que lê a raiz de código, registra aqui, com
`arquivo:linha`, os requisitos de FEAT-0001 e FEAT-0003 que o sistema ainda não atende.
