---
stage: dspec
feature: dirigibilidade
verdict: FAIL
generated: 2026-10-21T18:00:16Z
counts: {blocker: 0, error: 1, warning: 0, info: 2, divergence: 16}
seed: {revision: 2, digest: 5407fe2ffc33}
upstream: {stage: fspec, version: 2.0.0, status: validated, index-generated: 2026-10-21T17:53:33Z}
feedbacks: []
population: "revalidação após dspec-validation-20261021-1722: ISSUE-01 a ISSUE-07 daquele relatório reverificados primeiro; arquivos com version movida: 01-architecture.md 1.0.1, 97-changelog.md 1.1.0, 98-divergences.md 1.1.0, ADR-0001 1.0.1, ADR-0003 1.0.1, ADR-0004 1.0.1, DES-0001 2.0.0, DES-0003 1.0.1, DES-0004 2.0.0, DES-0005 1.0.1, DES-0007 1.0.1, DES-0008 1.0.1, DM-0001 1.0.1, test-strategy.md 2.0.0; dois arquivos intocados sorteados: core/DES-0002, web/DES-0006; toda citação arquivo:linha dos arquivos da população conferida contra a árvore numa passada (src/physics.ts, src/main.ts, src/lap.ts, index.html, scripts/*.ts, tests/*.test.ts, docs/physics.md, package.json); existência de todo caminho citado; grep do conjunto por OPEN-/TBD, nomes antigos de ISSUE-03, valores da revisão 1 e segredos"
context-ignored: "nenhuma justificativa do gerador chegou a este passo; o texto de 97-changelog.md sobre decisões passadas ao autor foi lido só como conteúdo do artefato, não como justificativa"
---

# Relatório de validação — dirigibilidade (D-Spec)

## Summary

- Reverificação do relatório anterior: ISSUE-01 (error, D-DS-01) fechado — `01-architecture.md:39-40, 55-66`, `DES-0004:31-47, 132-135, 171-175`, `DES-0008:36`, `ADR-0003:30-33`, `ADR-0004:45-47` e `test-strategy.md:116, 119` dizem a mesma coisa: `scripts/handlingBench.ts` sem `node:perf_hooks`, `node:os`, `Date`, `performance`; relógio e `runtimeId()` em `scripts/keyboard-lap.ts`, camada Aplicação. ISSUE-02 (error, D6) fechado — `MAX_REPLAY_TEXT_CHARS` 4 194 304 e `MAX_REPLAY_INPUT_STEPS` 36 000 em `DES-0003:36-38, 44-52`, `DES-0008:34`, `DM-0001:75-78`, `test-strategy.md:49, 123`. ISSUE-03 (error, D4) fechado — `steerApplyRatePerS`, `steerReturnRatePerS`, `yawTrackingGainPerS`, `yawCorrectGainPerS`, `slipDampingGainPerS` em `DES-0001:48-54`; nenhum nome antigo no conjunto (grep). ISSUE-04 (info) fechado — `scripts/keyboard-lap.ts:34` e `tests/race-lap-validation-frozen.test.ts:53-57` conferem. ISSUE-05 (info) fechado — `docs/handling-device-log.md` marcado **novo** em `test-strategy.md:15`. ISSUE-06 e ISSUE-07 (info): sem mudança, reportados abaixo.
- F-Spec 2.0.0 carregado no projeto: 180/250 ms, curva de 18 m a 50 km/h, 200/400 ms, 2 500 ms, `105 / 3.6`, 25 000 ms, condição de forçar `> 50 / 3.6`, `GRASS_LOSS` a `50 / 3.6`, "bench de física" — conferidos em `DES-0001`, `DES-0004`, `DES-0005`, `test-strategy.md`, `98-divergences.md`; nenhum valor da revisão 1 fora do histórico de `97-changelog.md`.
- Um erro novo (D5/D2) em `DES-0004`, abaixo.

## Issues

### ISSUE-01

- severidade: error
- verificação: D5 — D-DS-01 (sentido de dependência de I2) e D2 (caminho de módulo exato da interface)
- arquivo: `core/DES-0004-ensaios-de-dirigibilidade-e-saida.md`
- localização: linhas 66–72 (tabela "`scripts/keyboard-lap.ts` (programa de bench, camada Aplicação)", linha de `testPilot(config)`) contra as linhas 41, 71 e 106 (`TEST_PILOT_LAP` e `measureStepCost` usam "`testPilot` da biblioteca")
- achado: a tabela de símbolos de `scripts/keyboard-lap.ts` (camada **Aplicação**, programa que imprime ao carregar e não é importável, linha 33–34) lista `testPilot(config)` como símbolo desse programa; ao mesmo tempo `measureStepCost` (linha 71) diz "`testPilot` da biblioteca", o ensaio `TEST_PILOT_LAP` (linha 106, executado pela biblioteca `scripts/handlingBench.ts`, camada **Simulação**, e por `npm test`) chama `testPilot`, `01-architecture.md:39` põe o piloto de teste na biblioteca, `97-changelog.md:73-74` diz "piloto de teste da biblioteca (`testPilot`)" e `test-strategy.md:46` o usa como fixture em `npm test`. Lida como está, a tabela faz a biblioteca de Simulação importar um símbolo de um programa de Aplicação (chamada para trás) que não pode ser importado; o conjunto diz ao mesmo tempo que `testPilot` vive no programa e na biblioteca.
- esperado: a linha `testPilot(config)` sai da tabela de `scripts/keyboard-lap.ts` e entra na tabela de `scripts/handlingBench.ts` (linhas 57–64), com a mesma assinatura e descrição, de modo que `measureStepCost` e `TEST_PILOT_LAP` importem o piloto de teste da biblioteca; `scripts/keyboard-lap.ts` fica só com `runtimeId()` e `measureStepCost(setup)`.

### ISSUE-02

- severidade: info
- verificação: D5 — I4 (chave mestra desligada por padrão)
- arquivo: `adr/ADR-0001-versao-do-acerto-como-registro-novo-no-codigo.md`; `core/DES-0001-acerto-arcade-assistido-v5-e-assistencias.md`
- localização: `ADR-0001` linhas 33–36 e 44–45; `DES-0001` linhas 140–146
- achado: reverificação da ISSUE-06 anterior: a feature não tem chave mestra porque o F-Spec validado (FEAT-0005, Configuração) proíbe configuração para escolher entre o acerto antigo e o novo; o "padrão sem mudança" de I4 está nos campos opcionais ausentes em `RENTAL_KART` e `ARCADE_KART`, com `REALISTA_UNCHANGED` como prova. Decidido pelo F-Spec, não erro.
- esperado: nada a mudar.

### ISSUE-03

- severidade: info
- verificação: D3 — cobertura do F-Spec nos dois sentidos
- arquivo: `web/DES-0006-resultado-melhor-tempo-e-texto-compartilhado.md`; `adr/ADR-0002-formato-do-replay-e-registro-de-volta-em-memoria.md`
- localização: `DES-0006` linhas 56–62; `ADR-0002` linhas 50–52
- achado: reverificação da ISSUE-07 anterior (arquivo intocado, sorteado): SCR-0002 nomeia "abrir um tempo ou replay gravado" e "reproduzir um replay"; nenhum item de projeto lhes dá tela porque nenhuma feature persiste registros (`tests/race-lap-validation-layering.test.ts:43-49`) e API-0002 diz que a gravação é da feature que a possui; a redução é declarada e `readReplay`/`replayLap` ficam disponíveis. Nenhum `REQ-*` afetado.
- esperado: nada a mudar nesta rodada; a feature que persistir registros deve cobrir esse ponto de entrada.

## Divergences

`98-divergences.md` (1.1.0): 16 linhas, todas com `REQ-*`, exigência (valores da revisão 2), estado atual em `arquivo:linha` (conferido: `src/physics.ts:7, 16-25, 52, 106-113, 118-124, 135, 156, 167, 175-192, 222-226, 234`; `src/main.ts:226, 233, 396, 458, 474-476`; `scripts/keyboard-lap.ts:5-41`; `scripts/physics-bench.ts:10-37`; `docs/physics.md:70-77`; `tests/physics.test.ts:12-19, 75-82`; `tests/race-lap-validation-frozen.test.ts:32-40, 53-56`), etapa devedora `código`, item de projeto que fecha e estado `open`. Nenhuma linha sem item de projeto; nenhuma `waived-pending`.

## Coverage

- D1: arquivos exigidos presentes; bloco mermaid de `01-architecture.md` (`sequenceDiagram`) bem formado; links relativos dos arquivos da população resolvem (`core/` → `../../../../320%20F-Specs/...`, raiz → `../../../320%20F-Specs/...`). Índice, ids, front matter, rastreabilidade: do gate, não rejulgados.
- D2: 8 itens de projeto com `REQ-*`, caminho, camada, interface, colaboradores, falha e feature flag (ou motivo). Caminhos existentes conferidos: `src/physics.ts`, `src/track.ts`, `src/trackData.ts`, `src/maneuvers.ts`, `src/lap.ts`, `src/lapTiming.ts`, `src/lapMessages.ts`, `src/main.ts`, `src/audio.ts`, `src/style.css`, `index.html`, `scripts/keyboard-lap.ts`, `scripts/physics-bench.ts`, `docs/physics.md`, `docs/lap-validation-bench.md`, `tests/fixtures/trackFiles.ts`, `tests/race-lap-validation-*.test.ts`, `tests/physics.test.ts`, `tests/maneuvers.test.ts`; declarados novos e ausentes: `src/setupRecords.ts`, `src/handlingMessages.ts`, `scripts/handlingBench.ts`, `tests/dirigibilidade-*.test.ts`, `tests/fixtures/records.ts`, `docs/handling-device-log.md`. `400 Code/Source/` vazio. Símbolos citados existem (`TEST_PAD`, `CIRCUIT`, `initialState`, `step`, `nearest`, `WIDTH`, `track`, `SYNTHETIC_TRACK_FILE`, `readTrackData`, `COUNTDOWN_STEPS`, `toMs`, `startLap`, `stepLap`, `getLapState`, `getLapResult`, `formatLapTime`, `message`); scripts npm `test`, `bench:handling`, `bench:physics` conferem com `package.json`. Unidades em toda entrada e saída numérica das interfaces. Exceção: ISSUE-01 (caminho de `testPilot`).
- D3: requisitos cobertos 58 de 58 (`99-traceability.md`); NFR 9 de 9 com mecanismo; contratos 3 de 3 campo a campo (API-0001 ↔ DES-0002: 11 campos e `NO_STATE`; API-0002 ↔ DES-0003: `getSetupVersion`, `readReplay` com 7 campos, `compareLapRecords`, quatro códigos; API-0003 ↔ DES-0004: 8 campos comuns e campos por `benchId` para os 17 ensaios, cinco `failReason`); itens sem fonte: nenhum.
- D4: `DM-0001` 1.0.1: quatro dados versionados, unidades no nome, M1–M3 com reversão, sem backfill, janela de compatibilidade e retenção/privacidade por dado; tetos de `readReplay` registrados.
- D5: contexto primário pista e desafio (I1); sentido `setupRecords.ts` → `lap.ts` → `physics.ts`, `handlingBench.ts` → `physics.ts`/`lap.ts`/`setupRecords.ts`, `keyboard-lap.ts`/`physics-bench.ts` → `handlingBench.ts`, `handlingMessages.ts` → `lapMessages.ts`; nenhuma regra de pilotagem fora de `src/physics.ts`; I3 sem campo redefinido; D-DS-02, D-DS-03, D-DS-04, D-DS-05, D-DS-07 atendidos. Exceção: ISSUE-01.
- D6: sem sessão e sem papel, com motivo (RNF10); sem webhook; nenhum segredo (grep); logs só com códigos; `readReplay` com tipo, forma, faixa e tamanho; `<select>` por mapa; `readBaseline` em `try`.
- D7: nenhuma escrita de domínio; transições (`PUBLISHED`/`SUPERSEDED`, `handling`) com idempotência e ordem por `simStepCount`/`stepCount`; falha declarada por item; métrica por NFR nomeada.
- D8: 6 de 6 `FEAT-*` com nível; 31 de 31 `AC-*` com caminho; fixtures `oversizedReplay()`/`oversizedReplayText()` acrescentados; nenhum gancho só de teste; regras de domínio em unitário/integração.
- D9: nenhum `OPEN-<nn>` nem `TBD`; divergências 16, todas fechadas por item de projeto.
- Feedbacks enviados: nenhum.
