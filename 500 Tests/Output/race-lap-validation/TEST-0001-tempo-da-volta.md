---
id: TEST-0001
title: Tempo da volta em milissegundos inteiros
feature: race-lap-validation
stage: test
status: validated
version: 1.0.0
sources: [AC-US-0001-01, AC-US-0001-05, AC-US-0002-04, AC-US-0002-07, AC-US-0002-08, AC-US-0006-01, AC-US-0006-04]
---

# TEST-0001 — Tempo da volta em milissegundos inteiros

| | |
|---|---|
| Arquivo | `tests/race-lap-validation-timing.test.ts` (estratégia: `lap-timing`) |
| Nível | unitário |
| Interface exercitada | `toMs`, `interpolateMs`, `isCutExceeded`, `COUNTDOWN_MS`, `COUNTDOWN_STEPS` de `src/lapTiming.ts` |
| Fixtures | nenhuma; literais do critério |

## Verificações

| Check | Decide | Teste | O que a faria falhar |
|---|---|---|---|
| CHK-TEST-0001-01 | AC-US-0001-01 | the countdown lasts 360 steps, which convert to exactly 3000 ms | contagem com outra duração ou conversão que não dá 3000 em 360 passos |
| CHK-TEST-0001-02 | AC-US-0002-04 | every step count converts to an integer millisecond value, growing by 8 or 9 | acumulação em ponto flutuante ou arredondamento que pula ou repete um ms |
| CHK-TEST-0001-03 | AC-US-0001-05 | the step count converts to N x STEP within half a millisecond | conversão com viés acumulado (ex.: 8 ms fixos por passo) |
| CHK-TEST-0001-04 | AC-US-0002-07 | a crossing strictly inside the step gets an instant strictly between the two steps | interpolação que devolve o próprio passo ou um valor fora do intervalo |
| CHK-TEST-0001-05 | AC-US-0002-07 | a crossing that coincides with the step gets the instant of that step | fração 1 tratada como interior ao passo |
| CHK-TEST-0001-06 | AC-US-0002-08 | a sector limit crossed inside the step gets an instant strictly between the two steps | idem para os passos dos limites de setor |
| CHK-TEST-0001-07 | AC-US-0006-01 | 120 steps beyond the edge are exactly 1000 ms and do not exceed the default limit; 121 do | comparação `>=` em vez de `>` ou limite em passos diferente de 120 |
| CHK-TEST-0001-08 | AC-US-0006-04 | a track-declared duration is compared in the same integer arithmetic | limite da pista ignorado ou comparado em ponto flutuante |
