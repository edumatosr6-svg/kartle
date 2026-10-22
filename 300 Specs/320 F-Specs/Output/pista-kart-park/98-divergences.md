---
title: Divergências — pista Kart Park
feature: pista-kart-park
stage: fspec
status: validated
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
§12); só os nomes de contratos existentes (`readTrackData`, `trackId` `synthetic`, `startLap`,
`getHandlingTelemetry`, `STEP`, `Input`) foram consultados para não colidir com eles. A feature é nova: a
Kart Park, o seletor, a zebra e a barreira não existem no jogo, e esse é o motivo da feature, não uma
divergência a julgar aqui. As linhas serão registradas quando a etapa de implementação citar
`arquivo:linha`.
