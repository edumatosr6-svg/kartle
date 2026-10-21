---
id: TEST-0012
title: Contrato do estado, do resultado e dos comandos
feature: race-lap-validation
stage: test
status: validated
version: 1.0.0
sources: [AC-US-0002-04, AC-US-0002-11, AC-US-0002-12, AC-US-0003-08, AC-US-0004-03, AC-US-0005-02, AC-US-0008-03, AC-US-0009-01, NFR-0005, NFR-0012]
---

# TEST-0012 — Contrato do estado, do resultado e dos comandos

| | |
|---|---|
| Arquivo | `tests/race-lap-validation-contract.test.ts` (estratégia: `lap-contract`) |
| Nível | contrato de API (API-0001, API-0002, API-0003), em processo |
| Interface exercitada | `getLapState`, `getLapResult`, `startLap`, `pauseLap`, `resumeLap`, `repositionKart`, `readTrackData` |
| Fixtures | `syntheticReading()`, `syntheticFile()` com `schemaVersion` alterada, `track-v1.json`, texto ilegível literal |

## Verificações

| Check | Decide | Teste | O que a faria falhar |
|---|---|---|---|
| CHK-TEST-0012-01 | AC-US-0009-01 | getLapState carries exactly the fields of API-0001, with the optional ones only in their phase | campo a mais, a menos ou opcional presente fora da fase |
| CHK-TEST-0012-02 | NFR-0005 | getLapResult carries exactly the fields of API-0001 and nothing else, so no personal data can travel in it | campo não contratado no resultado |
| CHK-TEST-0012-03 | AC-US-0002-04 | every time value of the result and of the state is an integer number of milliseconds | tempo fracionário |
| CHK-TEST-0012-04 | AC-US-0005-02 | without a lap the reads answer NO_ACTIVE_LAP and NO_RESULT with no other field | exceção ou campos vazios em vez do código |
| CHK-TEST-0012-05 | AC-US-0008-03 | startLap rejects with the code of API-0002 for each condition and creates no lap | código diferente ou volta criada em dado inválido |
| CHK-TEST-0012-06 | AC-US-0003-08 | pauseLap, resumeLap and repositionKart reject with the code of API-0002 for each phase | código diferente por fase |
| CHK-TEST-0012-07 | AC-US-0003-08 | a rejected command leaves the session exactly as it was | rejeição com efeito colateral |
| CHK-TEST-0012-08 | AC-US-0002-12 | a repeated startLap does not restart the countdown nor create a second lap; after ENDED a new lap gets its own result | `startLap` repetido que reinicia a contagem |
| CHK-TEST-0012-09 | AC-US-0002-11 | challengeNumber is copied to the result when given and absent otherwise, without changing the lap | `challengeNumber` derivado ou com efeito na volta |
| CHK-TEST-0012-10 | NFR-0012 | readTrackData answers UNREADABLE with no other field and UNSUPPORTED_SCHEMA with the version only | campo extra na resposta de erro |
| CHK-TEST-0012-11 | AC-US-0004-03 | an invalid result carries its reason and no time field | tempo em resultado inválido |

Não há endpoint autenticado nem papel além de `player` anônimo (API-0001/0002, I6): não cabem verificações de acesso não autenticado ou de papel recusado.
