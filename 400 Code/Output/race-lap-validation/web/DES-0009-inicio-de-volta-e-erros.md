---
id: DES-0009
title: Início de volta, oferta de tipo e estados de erro — implementação
feature: race-lap-validation
stage: code
status: draft
version: 1.0.0
sources: [FEAT-0001, FEAT-0006, FEAT-0008, REQ-FEAT-0001-13, REQ-FEAT-0006-09, REQ-FEAT-0006-10, REQ-FEAT-0008-06]
---

# DES-0009 — Início de volta, oferta de tipo e estados de erro — implementação

O painel `#welcome` de `index.html` é a oferta de volta: `#track-status` (texto inicial estático `loadingTrack`) e
`#lap-offer`, preenchido por `renderOffer` em `src/main.ts` com um botão por tipo de `offeredLapKinds(reading, [])`.
O antigo botão `#start` deu lugar a esses botões.

## Realização por requisito

| Requisito | Arquivo e símbolo |
|---|---|
| REQ-FEAT-0001-13 | `src/main.ts` bloco de `#lap-control-fallback` no laço de quadros (`coarsePointer.matches && !tilt` na oferta; `touchFallback` durante a volta); `$('tilt').onclick` existente deixa `tilt` desativado sem permissão |
| REQ-FEAT-0006-09, REQ-FEAT-0008-06 | `src/main.ts` `renderOffer` (exibe exatamente a lista de `offeredLapKinds`, que nunca traz `OFFICIAL` em `INCOMPLETE`) |
| REQ-FEAT-0006-10 | `src/main.ts` `renderOffer` (botão `startTraining` em `COMPLETE` e `INCOMPLETE`) e `beginLap` (`startLap` com `TRAINING`) |

## Estados

`UNSUPPORTED_SCHEMA` ou `UNREADABLE`: `#track-status` = `trackDataError`, nenhum botão, nenhuma volta criada, o dado não é
tocado. `COMPLETE` e `INCOMPLETE`: `#track-status` = `trackId` e um botão por tipo oferecido. O estado Vazio
(`noTrackAvailable`, dado nenhum carregado) não ocorre nesta entrega, porque o arquivo é empacotado e sempre passado a
`readTrackData`; a chave existe em `src/lapMessages.ts`. Cada botão chama `beginLap(kind)`, que emite `startLap(lap,
{lapKind, trackId, trackVersion}, reading, config)` com `trackId` e `trackVersion` copiados de `reading`, limpa
`accumulatorS`, `keys` e `touch` e esconde o painel; a rejeição (`LAP_ALREADY_ACTIVE` por clique duplicado) é ignorada
sem mensagem. O painel reaparece pelo botão `newLap` da tela de resultado (DES-0010).
