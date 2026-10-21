---
id: NFR-0012
title: Mudança versionada do dado de pista
feature: race-lap-validation
stage: req
status: validated
version: 1.0.0
sources: [SEED/IM-I3I5, SEED/RE-03]
---

# NFR-0012 — Mudança versionada do dado de pista

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| O dado de pista que passa a carregar largada, sentido, setores e marcadores distintos é uma mudança versionada | Versão de esquema do dado de pista maior que a anterior; 100% dos arquivos de pista na versão anterior lidos sem erro | Arquivo de pista gerado (versão de esquema declarada) e saída de `npm test` lendo um arquivo na forma anterior (I3, I5) | `web-desktop`, `web-mobile` | `SEED/IM-I3I5`, `SEED/RE-03` |
