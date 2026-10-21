---
id: DES-0011
title: Privacidade, uso offline e ausência de persistência — implementação
feature: race-lap-validation
stage: code
status: draft
version: 1.0.0
sources: [FEAT-0001, FEAT-0002, FEAT-0003, FEAT-0004, FEAT-0005, FEAT-0006, FEAT-0009, REQ-FEAT-0001-14, REQ-FEAT-0002-16, REQ-FEAT-0003-15, REQ-FEAT-0004-15, REQ-FEAT-0005-12, REQ-FEAT-0006-16, REQ-FEAT-0009-07, REQ-FEAT-0009-08, REQ-FEAT-0009-09, REQ-FEAT-0009-11]
---

# DES-0011 — Privacidade, uso offline e ausência de persistência — implementação

Restrição transversal, camada aplicação. Não há sessão, papel, webhook nem segredo; nenhuma variável de ambiente é lida.

## Realização por requisito

| Requisito | Arquivo e símbolo |
|---|---|
| REQ-FEAT-0001-14, REQ-FEAT-0002-16, REQ-FEAT-0003-15, REQ-FEAT-0004-15, REQ-FEAT-0005-12, REQ-FEAT-0006-16 | `src/main.ts` `lap` (variável de módulo, só na memória da página); `src/lap.ts` `complete` e `invalidate` (o `result` só nasce em `ENDED`); recarregar ou abandonar descarta a sessão sem resultado |
| REQ-FEAT-0009-07, REQ-FEAT-0009-08 | `src/main.ts` `reading = readTrackData(SYNTHETIC_TRACK_FILE)` (arquivo empacotado, lido sem rede); nenhum `fetch`, `XMLHttpRequest`, `WebSocket` ou `navigator.sendBeacon` em `src/` |
| REQ-FEAT-0009-09 | `src/lap.ts` `buildResult` (chaves exatamente as de API-0001: `trackId`, `trackVersion`, `challengeNumber?`, `lapKind`, `lapValidity`, `invalidReason?`, `official`, `lapMs?`, `sectorMs?`; nenhum campo de jogador, aparelho, data ou sensor) |
| REQ-FEAT-0009-11 | nenhum uso de `localStorage`, `sessionStorage` ou `indexedDB` em `src/`; `best` em `src/main.ts` vive só na memória |

## Dados tratados

Identificadores de pista e contadores de passo na `LapSession`; o idioma do navegador é lido a cada quadro em
`src/main.ts` (`resolveLanguage(navigator.language)`) e não é gravado nem enviado. As leituras do sensor viram o número
`tiltSteer` e não são guardadas. Registro em console: só `trackId`, `trackVersion` e `schemaVersion` (DES-0006).
