---
id: NFR-0004
title: Documentação dos ensaios
feature: dirigibilidade
stage: req
status: validated
version: 3.0.0
sources: [SEED/NF-04, SEED/RD-06, SEED/IM-I9, DOMAIN/REF-02, DOMAIN/REF-03]
---

# NFR-0004 — Documentação dos ensaios

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| Cada mudança de parâmetro do acerto Arcade assistido registra os parâmetros e os resultados dos ensaios em `docs/physics.md`, ao lado da linha de base | 100 % dos ensaios citados nos critérios de US-0001 a US-0005 (resposta do volante com o modo de manter a velocidade em 50 km/h, a faixa de velocidade observada e a janela de estabilização do regime; curva de referência da pista de teste com o raio do arco, a largura da faixa, V0 e V1; recuperação da traseira; 0–60 km/h; velocidade estabilizada; grama; parede; volta do piloto de teste na pista sintética; custo por passo) com ambiente de ensaio (pista de teste ou pista sintética), parâmetros, resultado medido com unidade e data, para a linha de base e para o novo acerto | Leitura de `docs/physics.md`: uma entrada datada por mudança, com os valores que a saída de `npm test`, do bench de física e de `npm run bench:handling` reportam, com o ambiente de cada ensaio (`SEED/RD-06`, `DOMAIN/REF-03`) e com a versão de acerto a que cada entrada se refere (os limites da revisão 2 do seed — `DOMAIN/REF-02` — registrados ao lado dos da linha de base) | nenhum (documentação) | `SEED/NF-04` (I9), `SEED/RD-06`, `SEED/IM-I9` |
