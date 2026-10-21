---
id: DES-0007
title: Integração da aplicação, adaptadores de pausa e laço de quadros — implementação
feature: race-lap-validation
stage: code
status: draft
version: 1.0.0
sources: [FEAT-0001, FEAT-0003, FEAT-0007, FEAT-0009, REQ-FEAT-0001-12, REQ-FEAT-0001-13, REQ-FEAT-0003-03, REQ-FEAT-0003-04, REQ-FEAT-0003-05, REQ-FEAT-0003-06, REQ-FEAT-0003-07, REQ-FEAT-0003-12, REQ-FEAT-0007-12, REQ-FEAT-0009-05, REQ-FEAT-0009-06]
---

# DES-0007 — Integração da aplicação, adaptadores de pausa e laço de quadros — implementação

`src/main.ts` alterado (camada aplicação e adaptadores de controle) e `src/frameClock.ts` novo (camada aplicação, puro).
A validação preliminar por portões saiu do jogo: `LapTracker` não é mais importado por `src/main.ts`.

## Realização por requisito

| Requisito | Arquivo e símbolo |
|---|---|
| REQ-FEAT-0001-12 | `src/main.ts` `emitPause` (chamado por Esc, `blur`, `visibilitychange` e vigilância do sensor também em `COUNTDOWN`); laço de quadros só avança passos em `COUNTDOWN` ou `RUNNING` |
| REQ-FEAT-0001-13 | `src/main.ts` `beginLap` (`touchFallback = coarsePointer.matches && !tilt`) e o bloco de `#lap-control-fallback` no laço de quadros |
| REQ-FEAT-0003-03, REQ-FEAT-0003-04 | `src/frameClock.ts` `advanceClock`, `MAX_FRAME_S`; `src/main.ts` laço de quadros (`advanceClock(accumulatorS, dt)` decide só quantos passos rodam) |
| REQ-FEAT-0003-05 | `src/main.ts` `keydown` `Escape` (`emitPause('ESC_KEY')` em contagem ou corrida, `emitResume` em pausa); `renderHud` (`#timer` = `formatLapTime(view.elapsedMs)`, congelado na pausa) |
| REQ-FEAT-0003-06 | `src/main.ts` `window.addEventListener('blur')` e `visibilitychange` (`emitPause('FOCUS_LOST')`; o retorno do foco não retoma) |
| REQ-FEAT-0003-07 | `src/main.ts` `SENSOR_SILENCE_MS` = 500, `lastOrientationAtMs` (atualizado em `deviceorientation` com leitura válida) e a vigilância no laço de quadros (`emitPause('SENSOR_LOST')`) |
| REQ-FEAT-0003-12 | `src/lap.ts` `pauseLap` (`ALREADY_PAUSED`); `src/main.ts` `emitPause` ignora a rejeição |
| REQ-FEAT-0007-12 | `src/main.ts` `renderHud` lê `getLapState` a cada quadro; na pausa nenhum campo de validade muda |
| REQ-FEAT-0009-05, REQ-FEAT-0009-06 | `src/main.ts` laço de quadros (no máximo 12 passos por quadro, teto `MAX_FRAME_S`); a medida nos aparelhos é o teste registrado `docs/lap-validation-device-log.md`, fora desta rodada |

## Mudanças por trecho de `src/main.ts`

Importações: `startLap`, `pauseLap`, `resumeLap`, `repositionKart`, `stepLap`, `getLapState`, `getLapResult`,
`offeredLapKinds` de `./lap`; `readTrackData` de `./trackData`; `SYNTHETIC_TRACK_FILE` de `./track`; `advanceClock` de
`./frameClock`; `LapTracker`, `step` e `STEP` saíram. Estado: `lap`, `reading` (lido uma vez), `accumulatorS`,
`touchFallback`, `lastOrientationAtMs`, `lang`. O antigo `reset` deixou de existir: `#reset` e a tecla `R` emitem
`repositionKart` (`emitReposition`) e ignoram a rejeição. O botão `#pause` fica visível só em `PAUSED`, com o texto
`resumeLap`, e chama `resumeLap` (`emitResume`). Ao pausar, `keys` e `touch` são limpos e `accumulatorS` zerado; ao
continuar, `accumulatorS` é zerado e `lastOrientationAtMs` recebe o instante atual. Os controles de peso e estilo ficam
desabilitados com volta em `COUNTDOWN`, `RUNNING` ou `PAUSED`; a mudança vale na volta seguinte (`config` congelada em
`startLap`). As linhas da decisão de volta por `LapTracker` e de `state.elapsed = 0` foram removidas; `best` é derivado de
`getLapResult(lap).lapMs` na transição para `ENDED`, só na memória. Renderização, câmera, áudio (`audio.update` recebe
`phase === 'RUNNING'`) e minimapa leem `lap.kart` ou `initialState()` sem volta.
