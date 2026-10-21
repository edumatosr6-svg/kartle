---
title: Divergências — dirigibilidade do Arcade assistido
feature: dirigibilidade
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
§12); apenas os nomes existentes (presets, campos de telemetria, scripts de bench) foram consultados para
não colidir com eles. Os requisitos declaram que o acerto atual não atende os limites desta feature
(0–40 km/h em 3,21 s; 79,4 km/h estabilizada; ~31,4 s na volta sintética; subesterço e resposta lenta
relatados) — isso é o motivo da feature, e o código devedor é o da etapa de implementação; as linhas serão
registradas quando aquela etapa citar `arquivo:linha`.
