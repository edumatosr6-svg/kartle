---
id: TEST-0014
title: Passo fixo, Input e presets inalterados
feature: race-lap-validation
stage: test
status: validated
version: 1.0.0
sources: [NFR-0010, NFR-0011]
---

# TEST-0014 — Passo fixo, Input e presets inalterados

| | |
|---|---|
| Arquivo | `tests/race-lap-validation-frozen.test.ts` (estratégia: `lap-frozen`) |
| Nível | unitário, mais leitura do texto de `src/physics.ts` |
| Interface exercitada | `STEP`, `RENTAL_KART`, `ARCADE_KART`, `KART_PRESETS`, `PHYSICS_VERSION` de `src/physics.ts` |
| Fixtures | cópia literal dos presets no início da feature, escrita no teste (DES-0012) |

## Verificações

| Check | Decide | Teste | O que a faria falhar |
|---|---|---|---|
| CHK-TEST-0014-01 | NFR-0010 | the fixed step is still 1/120 s | `STEP` alterado |
| CHK-TEST-0014-02 | NFR-0010 | the Input type still has exactly throttle, brake, steer and the optional drift | campo acrescentado, removido ou renomeado em `Input` ou na assinatura de `step` |
| CHK-TEST-0014-03 | NFR-0011 | the rental preset keeps every value it had at the start of the feature | qualquer campo de `RENTAL_KART` alterado |
| CHK-TEST-0014-04 | NFR-0011 | the arcade preset keeps every value it had at the start of the feature | qualquer campo de `ARCADE_KART` alterado |
| CHK-TEST-0014-05 | NFR-0011 | the preset table, the physics version and the re-export line of the physics module are unchanged | `KART_PRESETS`, `PHYSICS_VERSION` ou a linha 3 de `src/physics.ts` alterados |

Os benchmarks antes e depois (`npm run bench:physics`, `npm run bench:handling`) estão registrados pela etapa de código em `docs/lap-validation-bench.md` com 0 linhas diferentes; este arquivo não os reexecuta.
