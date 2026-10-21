---
stage: dspec
feature: dirigibilidade
verdict: SUCCESS
generated: 2026-10-21T18:05:54Z
counts: {blocker: 0, error: 0, warning: 0, info: 2, divergence: 16}
seed: {revision: 2, digest: 5407fe2ffc33}
upstream: {stage: fspec, version: 2.0.0, status: validated, index-generated: 2026-10-21T17:53:33Z}
feedbacks: []
population: "revalidação após dspec-validation-20261021-1800: ISSUE-01 a ISSUE-03 daquele relatório reverificados primeiro; arquivos com version movida: core/DES-0004 2.0.1, test-strategy.md 2.0.1, 97-changelog.md 1.2.0; dois arquivos intocados sorteados (Get-Random): web/DES-0007, web/DES-0006; toda citação arquivo:linha desses arquivos conferida contra a árvore numa passada (scripts/keyboard-lap.ts:3-41, scripts/physics-bench.ts:10-35, src/physics.ts:3, 8, 133, 137-138, src/main.ts:2, 120, 154, 159, 208-218, 226, 229-239, 277-285, 331-358, 372-390, 394-397, 449-450, 454-457, 474, src/lap.ts:120, index.html:25, 38, tests/physics.test.ts:5, 35, 137, 147-189, tests/maneuvers.test.ts:68-79, package.json scripts); existência de todo caminho e símbolo citado; API-0003 campo a campo contra DES-0004 2.0.1; grep do conjunto por OPEN-/TBD e segredos"
context-ignored: "nenhuma justificativa do gerador chegou a este passo; o texto de 97-changelog.md (rodada 4) foi lido só como conteúdo do artefato, não como justificativa"
---

# Relatório de validação — dirigibilidade (D-Spec)

## Summary

- Reverificação do relatório anterior: ISSUE-01 (error, D5/D2) fechado — `DES-0004:65` lista `testPilot(config)` na tabela de `scripts/handlingBench.ts` (camada Simulação), importado por `TEST_PILOT_LAP`, `DETERMINISM`, `npm test` e `measureStepCost`; `DES-0004:67-73` deixa `scripts/keyboard-lap.ts` (camada Aplicação) só com `runtimeId()` e `measureStepCost(setup)`, este dizendo "`testPilot` importado de `scripts/handlingBench.ts`"; `DES-0004:41, 106, 134-136` e `test-strategy.md:46` dizem o mesmo; o sentido Aplicação → Simulação é único no conjunto. ISSUE-02 e ISSUE-03 (info): sem mudança, reportados abaixo.
- Arquivos movidos: `DES-0004` 2.0.1 só na tabela de símbolos; `test-strategy.md` 2.0.1 só na linha do fixture `testPilot(config)`; `97-changelog.md` 1.2.0 com a entrada da rodada 4, nenhum item recusado, nenhuma divergência nova.
- Amostra intocada: `DES-0007` 1.0.1 e `DES-0006` 1.0.0 sem achado novo; toda citação `src/main.ts:linha` dos dois conferida.

## Issues

### ISSUE-01

- severidade: info
- verificação: D5 — I4 (chave mestra desligada por padrão)
- arquivo: `adr/ADR-0001-versao-do-acerto-como-registro-novo-no-codigo.md`; `core/DES-0001-acerto-arcade-assistido-v5-e-assistencias.md`
- localização: `ADR-0001` linhas 33–36 e 44–45; `DES-0001` linhas 140–146
- achado: reverificação da ISSUE-02 anterior: a feature não tem chave mestra porque o F-Spec validado (FEAT-0005, Configuração, linhas 108-111) proíbe configuração para escolher entre o acerto antigo e o novo; o "padrão sem mudança" de I4 está nos campos opcionais ausentes em `RENTAL_KART` e `ARCADE_KART`, com `REALISTA_UNCHANGED` como prova. Decidido pelo F-Spec, não erro.
- esperado: nada a mudar.

### ISSUE-02

- severidade: info
- verificação: D3 — cobertura do F-Spec nos dois sentidos
- arquivo: `web/DES-0006-resultado-melhor-tempo-e-texto-compartilhado.md`; `adr/ADR-0002-formato-do-replay-e-registro-de-volta-em-memoria.md`
- localização: `DES-0006` linhas 56–62; `ADR-0002` linhas 50–52
- achado: reverificação da ISSUE-03 anterior (arquivo sorteado de novo): SCR-0002 (linhas 29-30, 52, 54) nomeia "abrir um tempo ou replay gravado" e "reproduzir um replay"; nenhum item de projeto lhes dá tela porque nenhuma feature persiste registros e API-0002 diz que a gravação é da feature que a possui; a redução é declarada em `DES-0006:57-62` e `readReplay`/`replayLap` ficam disponíveis. Nenhum `REQ-*` afetado.
- esperado: nada a mudar nesta rodada; a feature que persistir registros deve cobrir esse ponto de entrada.

## Divergences

`98-divergences.md` (1.1.0, intocado desde o relatório anterior): 16 linhas, todas com `REQ-*`, exigência, estado atual em `arquivo:linha`, etapa devedora `código`, item de projeto que fecha e estado `open`. Nenhuma linha sem item de projeto; nenhuma `waived-pending`.

## Coverage

- D1: arquivos exigidos presentes; links relativos dos arquivos da população resolvem (`DES-0004` → `../adr/ADR-0003`, `../adr/ADR-0004`, `../adr/ADR-0001`, `../test-strategy.md`, `../data/DM-0001`, `DES-0001`, `DES-0002`; `DES-0006` → `../core/DES-0003`, `../adr/ADR-0002`, `../test-strategy.md`; `DES-0007` → `DES-0005`, `DES-0006`, `../core/DES-0001`, `../adr/ADR-0001`). Índice, ids, front matter, rastreabilidade: do gate, não rejulgados.
- D2: `DES-0004`, `DES-0006`, `DES-0007` com `REQ-*`, caminho, camada, interface, colaboradores, falha e feature flag (ou motivo). Caminhos existentes conferidos: `scripts/keyboard-lap.ts`, `scripts/physics-bench.ts`, `src/physics.ts`, `src/lap.ts`, `src/lapTiming.ts`, `src/lapMessages.ts`, `src/track.ts`, `src/trackData.ts`, `src/main.ts`, `index.html`, `docs/physics.md`, `docs/lap-validation-bench.md`, `tests/fixtures/trackFiles.ts`, `tests/physics.test.ts`, `tests/maneuvers.test.ts`; declarados novos e ausentes: `scripts/handlingBench.ts`, `src/setupRecords.ts`, `src/handlingMessages.ts`, `tests/dirigibilidade-*.test.ts`, `tests/fixtures/records.ts`, `docs/handling-device-log.md`. Símbolos citados existem (`toMs`, `COUNTDOWN_STEPS`, `TEST_PAD`, `CIRCUIT`, `STEP`, `initialState`, `step`, `nearest`, `track`, `WIDTH`, `LapTracker`, `SYNTHETIC_TRACK_FILE`, `readTrackData`, `startLap`, `stepLap`, `getLapState`, `getLapResult`, `formatLapTime`, `message`, `lapStateInvalid`, `newLap`, `lap-chip`, `#lap-result`, `#handling-preset`, `KART_PRESETS`, `ARCADE_KART`, `RENTAL_KART`); scripts npm `test`, `bench:handling`, `bench:physics` conferem com `package.json:9-11`. Unidades em toda entrada e saída numérica das interfaces dos três itens.
- D3: requisitos cobertos 58 de 58 (`99-traceability.md`, do gate); API-0003 ↔ `DES-0004` 2.0.1 campo a campo (8 campos comuns, campos por `benchId` para os 17 ensaios, cinco `failReason`, forma vazia sem `PASS` implícito); itens sem fonte: nenhum.
- D4: `DM-0001` fora da população (1.0.1, intocado); nenhuma mudança de dado nos arquivos movidos.
- D5: sentido `scripts/keyboard-lap.ts`/`scripts/physics-bench.ts` (Aplicação) → `scripts/handlingBench.ts` (Simulação) → `src/physics.ts`/`src/lap.ts`/`src/setupRecords.ts`; `src/handlingMessages.ts` → `src/lapMessages.ts`; nenhuma regra de pilotagem fora de `src/physics.ts` (`DES-0007:39-42`); D-DS-01 e D-DS-07 atendidos nos três itens; I10 com motivo para `scripts/handlingBench.ts` e `src/handlingMessages.ts`.
- D6: sem sessão e sem papel, com motivo (API-0003 Auth; RNF10); sem webhook; nenhum segredo (grep); logs só com códigos e campos de API-0003; `<select>` por mapa; `readBaseline` em `try`.
- D7: nenhuma escrita de domínio; `bestRecord`/`lastRecord` construídos uma vez por `ENDED`; falha declarada por item; métrica por NFR nomeada em `DES-0004` Observabilidade.
- D8: 6 de 6 `FEAT-*` com nível; 31 de 31 `AC-*` com caminho; fixture `testPilot(config)` com módulo nomeado; nenhum gancho só de teste; regras de domínio em unitário/integração.
- D9: nenhum `OPEN-<nn>` nem `TBD` (grep); divergências 16, todas fechadas por item de projeto.
- Feedbacks enviados: nenhum.
