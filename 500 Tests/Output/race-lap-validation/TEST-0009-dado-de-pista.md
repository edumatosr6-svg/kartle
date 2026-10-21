---
id: TEST-0009
title: Leitura e classificação do dado de pista versionado
feature: race-lap-validation
stage: test
status: validated
version: 1.0.0
sources: [NFR-0012, AC-US-0008-03, AC-US-0005-03, AC-US-0005-04, AC-US-0001-06, AC-US-0004-02, AC-US-0004-05, AC-US-0002-10, AC-US-0002-13, AC-US-0006-04]
---

# TEST-0009 — Leitura e classificação do dado de pista versionado

| | |
|---|---|
| Arquivo | `tests/race-lap-validation-track-data.test.ts` (estratégia: `track-data`) |
| Nível | unitário |
| Interface exercitada | `readTrackData`, `checkConsistency`, `TRACK_SCHEMA_VERSION`, `DEFAULT_CUT_DISTANCE_M`, `DEFAULT_CUT_DURATION_MS` de `src/trackData.ts` |
| Fixtures | `tests/fixtures/track-v1.json`; `tests/fixtures/trackFiles.ts`: cópia sem `markers`, `withCutLimits`, `failingC1` a `failingC7` (uma inconsistência cada), `schemaVersion` 3 e texto corrompido como literais |

## Verificações

| Check | Decide | Teste | O que a faria falhar |
|---|---|---|---|
| CHK-TEST-0009-01 | NFR-0012 | a track file in the previous schema version is read without error as INCOMPLETE, keeping its identity | erro ou descarte da forma anterior |
| CHK-TEST-0009-02 | NFR-0012 | the declared schema version is greater than the previous one and the synthetic file carries it | versão de esquema não incrementada |
| CHK-TEST-0009-03 | NFR-0012 | a file with a later schema version is reported as UNSUPPORTED_SCHEMA and left untouched | versão desconhecida lida como válida ou alterada |
| CHK-TEST-0009-04 | NFR-0012 | corrupted or absent data is reported as UNREADABLE with no other field | exceção lançada ou campo extra |
| CHK-TEST-0009-05 | AC-US-0008-03 | a file without markers is INCOMPLETE and keeps what it declares | dado sem marcadores lido como `COMPLETE` |
| CHK-TEST-0009-06 | AC-US-0005-03 | a direction opposite to the winding of the centerline fails C1 and makes the data INCOMPLETE | sentido declarado não verificado |
| CHK-TEST-0009-07 | AC-US-0005-04 | a line the centerline does not cross exactly once in the track sense fails C2 | linha fora da pista aceita |
| CHK-TEST-0009-08 | AC-US-0001-06 | a start position off the track fails C3 | largada fora da pista aceita |
| CHK-TEST-0009-09 | AC-US-0004-02 | markers declared out of their order along the track fail C4 | ordem dos marcadores não verificada |
| CHK-TEST-0009-10 | AC-US-0004-05 | a sector limit without a marker before and after it fails C5 | marcadores que não garantem os limites aceitos |
| CHK-TEST-0009-11 | AC-US-0002-10 | a finish line too short to act as a barrier fails C6 | barreira curta aceita |
| CHK-TEST-0009-12 | AC-US-0002-10 | two lines closer than 2 m along the centerline fail C7 | linhas sobrepostas aceitas |
| CHK-TEST-0009-13 | AC-US-0002-13 | the published synthetic file is COMPLETE with three sector limits and markers distinct from them | arquivo publicado inconsistente |
| CHK-TEST-0009-14 | AC-US-0004-05 | a marker equal to a sector limit makes the data INCOMPLETE | marcador igual a limite aceito |
| CHK-TEST-0009-15 | AC-US-0006-04 | the cut limits are read from the file when declared and default to 3 m and 1000 ms when absent | limites da pista não lidos ou padrão diferente |
| CHK-TEST-0009-16 | NFR-0012 | reading never mutates the source and reading the same file twice gives the same reading | leitura com efeito colateral |
