---
id: TEST-0010
title: Textos de estado e motivo, idioma e formato de tempo
feature: race-lap-validation
stage: test
status: validated
version: 1.0.0
sources: [AC-US-0001-02, AC-US-0001-03, AC-US-0001-04, AC-US-0001-07, AC-US-0002-06, AC-US-0003-09, AC-US-0004-04, AC-US-0006-05, AC-US-0007-02, AC-US-0007-05, AC-US-0008-01, AC-US-0009-02, AC-US-0009-03, AC-US-0009-04, AC-US-0009-05, AC-US-0009-06, AC-US-0009-07, NFR-0006, NFR-0007]
---

# TEST-0010 — Textos de estado e motivo, idioma e formato de tempo

| | |
|---|---|
| Arquivo | `tests/race-lap-validation-messages.test.ts` (estratégia: `lap-messages`) |
| Nível | unitário |
| Interface exercitada | `describeLap`, `greenSignalVisible`, `formatLapTime`, `resolveLanguage`, `message`, `MESSAGE_KEYS` de `src/lapMessages.ts` |
| Fixtures | `LapStateView` literal por combinação de fase, validade e motivo; etiquetas de idioma literais |

## Verificações

| Check | Decide | Teste | O que a faria falhar |
|---|---|---|---|
| CHK-TEST-0010-01 | AC-US-0001-02 | each countdown value is a text numeral 3, 2 or 1 for the whole second it covers | numeral ausente ou arredondado para baixo (0 ou 2 em 2001 ms) |
| CHK-TEST-0010-02 | AC-US-0001-03 | the green signal is shown as text on the first running frame, in both languages | sinal verde só por cor ou invisível no primeiro quadro |
| CHK-TEST-0010-03 | AC-US-0001-04 | the timer shown during the countdown is 0:00.000 | formato diferente para zero |
| CHK-TEST-0010-04 | AC-US-0001-07 | a valid running lap is described as valid in progress, with no reason | texto diferente ou motivo exibido em volta válida |
| CHK-TEST-0010-05 | AC-US-0002-06 | times are shown as m:ss.mmm with three decimals and no rounding | arredondamento ou zeros à esquerda nos minutos |
| CHK-TEST-0010-06 | AC-US-0004-04 | a lap invalid by marker shows the reason "marcador pulado" | texto do motivo diferente |
| CHK-TEST-0010-07 | AC-US-0006-05 | a lap invalid by cut shows the reason "corte" | texto do motivo diferente |
| CHK-TEST-0010-08 | AC-US-0007-02 | a lap invalid by repositioning shows the reason "reposicionamento" | texto do motivo diferente |
| CHK-TEST-0010-09 | AC-US-0007-05 | a recon or training lap that stays valid shows no reason text | motivo exibido sem invalidação |
| CHK-TEST-0010-10 | AC-US-0008-01 | a recon or training result is identified in text as not official | texto "não oficial" ausente |
| CHK-TEST-0010-11 | AC-US-0009-02 | while the lap has no invalidation reason the state reads "válida em andamento" | estado diferente em `PAUSED` ou em inglês |
| CHK-TEST-0010-12 | AC-US-0009-03 | an invalid lap reads "inválida" with its reason, for every reason | motivo sem mapeamento |
| CHK-TEST-0010-13 | AC-US-0009-04 | every state and reason is conveyed by a non-empty text | estado comunicado só por cor |
| CHK-TEST-0010-14 | AC-US-0009-05 | a Portuguese browser language gives Portuguese state and reason | `pt-BR` resolvido para inglês |
| CHK-TEST-0010-15 | AC-US-0009-06 | an English browser language gives English state and reason | `en-US` resolvido para outro idioma |
| CHK-TEST-0010-16 | AC-US-0009-07 | a browser language other than Portuguese or English, or none, gives English | padrão diferente de inglês ou exceção com `undefined` |
| CHK-TEST-0010-17 | NFR-0007 | all twenty message keys exist with a non-empty text in both languages | chave sem tradução |
| CHK-TEST-0010-18 | AC-US-0003-09 | the paused text is shown only while paused and the state after resume is the state of the pause | texto de pausa que persiste ou estado alterado pela pausa |

A verificação 13 é a parte de `npm test` de NFR-0006 (estado por texto); a escala de cinza fica em E2E-09.
