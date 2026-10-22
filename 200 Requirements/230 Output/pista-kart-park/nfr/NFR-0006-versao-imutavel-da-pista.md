---
id: NFR-0006
title: Versão imutável da pista
feature: pista-kart-park
stage: req
status: validated
version: 1.0.0
sources: [SEED/RD-07, SEED/IM-I3I5]
---

# NFR-0006 — Versão imutável da pista

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| A Kart Park é publicada como versão 1 | `trackVersion` 1 no arquivo de pista publicado | Leitura do `trackVersion` no arquivo de pista publicado da Kart Park | nenhum (dado) | `SEED/IM-I3I5` (I3, I5) |
| Uma versão publicada da Kart Park nunca muda | 0 bytes alterados no arquivo de uma versão depois de publicada | Comparação do resumo criptográfico do arquivo de cada versão publicada com o registrado na publicação | nenhum (dado) | `SEED/RD-07` (I3, I5) |
| Suavizar de novo ou mudar a linha central, uma largura, uma zebra, a barreira, os setores ou os marcadores publica uma versão nova | 100 % dessas mudanças publicadas com `trackVersion` maior que o da versão anterior | Histórico dos arquivos de pista publicados: cada mudança de conteúdo corresponde a um `trackVersion` novo | nenhum (dado) | `SEED/IM-I3I5` (I3, I5) |
