---
id: NFR-0009
title: Acerto declarado como versão
feature: dirigibilidade
stage: req
status: validated
version: 1.0.0
sources: [SEED/RD-04, SEED/IM-I3I5]
---

# NFR-0009 — Acerto declarado como versão

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| A mudança de acerto, por alterar tempos, é uma mudança versionada (I3, I5): o novo acerto é declarado como nova versão no dado publicado (`trackVersion` ou versão própria de acerto), a versão anterior nunca é editada no lugar, e replays e resultados da versão anterior continuam legíveis, sem serem tratados como comparáveis | 1 nova versão declarada; 0 edições na versão anterior; 100 % dos replays e resultados gravados na versão anterior lidos sem erro por `npm test` (leitor da versão anterior, I5) e marcados com a sua versão | Saída de `npm test` lendo um replay e um resultado da versão anterior e um da nova; leitura do dado publicado com as duas versões; critérios 04 e 05 de US-0005 | `web-desktop`, `web-mobile` | `SEED/RD-04`, `SEED/IM-I3I5` |
