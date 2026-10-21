---
id: TEST-0002
title: Cruzamento de linhas, sentido e fração
feature: race-lap-validation
stage: test
status: validated
version: 1.0.0
sources: [AC-US-0002-07, AC-US-0002-08, AC-US-0002-13, AC-US-0004-01, AC-US-0005-01, AC-US-0005-03]
---

# TEST-0002 — Cruzamento de linhas, sentido e fração

| | |
|---|---|
| Arquivo | `tests/race-lap-validation-crossing.test.ts` (estratégia: `lap-crossing`) |
| Nível | unitário |
| Interface exercitada | `crossLine` de `src/track.ts`; as linhas do arquivo sintético por `readTrackData` |
| Fixtures | uma linha literal ao longo do eixo z; `syntheticReading()`; `centerlineCrossings` de `tests/helpers/geometry.ts` |

## Verificações

| Check | Decide | Teste | O que a faria falhar |
|---|---|---|---|
| CHK-TEST-0002-01 | AC-US-0005-03 | a displacement from the right side to the left side of the line is a FORWARD crossing inside the step | sentido invertido ou fração fora de (0, 1) |
| CHK-TEST-0002-02 | AC-US-0005-01 | the opposite displacement is a REVERSE crossing | contramão ignorada ou reportada como FORWARD |
| CHK-TEST-0002-03 | AC-US-0002-07 | a displacement that ends on the line has fraction exactly 1 | lado 0 tratado como não cruzado ou fração diferente de 1 |
| CHK-TEST-0002-04 | AC-US-0002-08 | the fraction is the proportion of the displacement travelled before the line | fração calculada sobre o lado errado |
| CHK-TEST-0002-05 | AC-US-0004-01 | a displacement beyond the reach of the segment does not cross it | linha tratada como reta infinita |
| CHK-TEST-0002-06 | AC-US-0002-13 | the centerline of the synthetic track crosses every declared line exactly once, in the track sense | linha publicada mal orientada ou que não alcança a linha central |
