---
id: DES-0010
title: Tela de resultado da volta — implementação
feature: race-lap-validation
stage: code
status: draft
version: 1.0.0
sources: [FEAT-0002, FEAT-0004, FEAT-0006, REQ-FEAT-0002-02, REQ-FEAT-0002-03, REQ-FEAT-0002-06, REQ-FEAT-0004-03, REQ-FEAT-0006-07]
---

# DES-0010 — Tela de resultado da volta — implementação

Painel `#lap-result` em `index.html` (dentro de `.game-shell`, fundo opaco `--lap-chip-bg`), preenchido por
`renderResult` em `src/main.ts` no quadro em que `lapPhase` chega a `ENDED`, lendo `getLapResult`.

## Realização por requisito

| Requisito | Arquivo e símbolo |
|---|---|
| REQ-FEAT-0002-02 | `src/main.ts` `renderResult` (`#lap-result-total` = `totalLabel` e `formatLapTime(lapMs)`) |
| REQ-FEAT-0002-03 | `src/main.ts` `renderResult` (`#lap-result-sectors` com quatro `sectorLabel` n e `formatLapTime(sectorMs[n-1])`) |
| REQ-FEAT-0002-06 | `src/lapMessages.ts` `formatLapTime` usado em todos os tempos do painel |
| REQ-FEAT-0004-03 | `src/main.ts` `renderResult` (com `INVALID`: título `lapStateInvalid` e motivo; total escondido e lista vazia) |
| REQ-FEAT-0006-07 | `src/main.ts` `renderResult` (`lapUnofficial` ao lado do tempo total quando `official` é falso) |

## Estados e ações

`NO_RESULT`: o painel fica oculto. `VALID` oficial: `lapResultValid`, total e quatro setores. `VALID` não oficial: o mesmo
mais `lapUnofficial`. `INVALID`: `lapStateInvalid` com o motivo, sem tempos. O texto segue o idioma corrente e é
re-renderizado quando o idioma muda. Botão `#lap-new-lap` (`newLap`): esconde o painel e mostra a oferta (`#welcome`).
Nada é gravado; `best` em `src/main.ts` fica só na memória.
