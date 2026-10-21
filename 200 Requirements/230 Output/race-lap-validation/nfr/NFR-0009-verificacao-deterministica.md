---
id: NFR-0009
title: Verificação determinística das regras de validade
feature: race-lap-validation
stage: req
status: validated
version: 2.0.0
sources: [SEED/IM-I9, SEED/IM-I2, SEED/RE-01]
---

# NFR-0009 — Verificação determinística das regras de validade

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| Cada regra de validade e de cronometragem é verificada pela simulação avançada com `STEP`, sem renderização nem controles | 100% das regras de validade e de cronometragem com no mínimo 1 verificação determinística cada: marcador pulado, contramão, corte pelos limites padrão de 3 m e 1000 ms, corte pelos limites declarados na pista, grama sem corte, reposicionamento, reconhecimento e treino, pista de dado incompleto, início no sinal verde, queima de largada ignorada, suspensão na pausa, interpolação do cruzamento, soma dos setores igual ao tempo total | Saída de `npm test` | `web-desktop`, `web-mobile` | `SEED/IM-I9`, `SEED/IM-I2`, `SEED/RE-01` (I2, I9) |
