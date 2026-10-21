---
stage: dspec
feature: dirigibilidade
verdict: FAIL
generated: 2026-10-21T17:22:50Z
counts: {blocker: 0, error: 3, warning: 0, info: 4, divergence: 16}
upstream: {stage: fspec, status: validated, index-generated: 2026-10-21T16:58:38Z}
feedbacks: []
population: "primeira validação: todos os 17 arquivos do conjunto; verificação de posicionamento de todo caminho citado contra a árvore (src/, scripts/, tests/, docs/, index.html, package.json) em uma passada; verificação de todo link relativo; grep de OPEN-/TBD, de segredos e de keyboardLap"
context-ignored: "a linha relé do usuário (\"a janela está visível, pode rodar as medições\") não é entrada deste passo e foi ignorada; o texto de 97-changelog.md sobre decisões passadas ao autor foi lido só como conteúdo do artefato, não como justificativa"
---

# Relatório de validação — dirigibilidade (D-Spec)

## Issues

### ISSUE-01

- severidade: error
- verificação: D5 — D-DS-01 (camada nomeada e sentido de dependência de I2)
- arquivo: `01-architecture.md`; `core/DES-0004-ensaios-de-dirigibilidade-e-saida.md`; `test-strategy.md`
- localização: `01-architecture.md` linhas 55–57; `DES-0004` linhas 28, 89 e 113–114; `test-strategy.md` linha 118
- achado: `scripts/handlingBench.ts` é posicionado na camada **Simulação**, cujo mapa proíbe ler `performance.now`; `01-architecture.md:56-57` declara que esse módulo importa `node:perf_hooks` (e `node:os`), `DES-0004:113-114` repete a importação "só `runtimeId` e `STEP_COST`, nos programas de bench" sem dizer em que módulo vive a leitura do relógio, e `DES-0004:89` diz que a leitura é "no programa de bench"; ao mesmo tempo `test-strategy.md:118` afirma que o teste de contrato exige `scripts/handlingBench.ts` sem `performance`. O conjunto diz, ao mesmo tempo, que a biblioteca importa o relógio de parede e que um teste prova que ela não o contém: o projeto é inconsistente quanto à camada do módulo.
- esperado: um único enunciado, nos três arquivos: a biblioteca `scripts/handlingBench.ts` não importa `node:perf_hooks` nem lê `performance`; a medição de `STEP_COST` (e `new Date()` de `measuredAtUtc`) fica em `scripts/keyboard-lap.ts`, que chama a biblioteca com o tempo já medido ou executa a volta cronometrada por conta própria; `runtimeId()` com `node:os` fica onde a assinatura o declara, com a camada daquele módulo coerente com o mapa (ou `runtimeId()` migra para o programa de bench). A lista de dependências de `01-architecture.md` e os Colaboradores de `DES-0004` passam a refletir isso.

### ISSUE-02

- severidade: error
- verificação: D6 — entrada nova que cruza a fronteira declara tipo, faixa e limite de tamanho
- arquivo: `core/DES-0003-versao-do-acerto-registros-e-comparabilidade.md`; `security/DES-0008-privacidade-dos-registros-e-da-saida-dos-ensaios.md`
- localização: `DES-0003` linhas 36 e 42–48 (ordem das verificações de `readReplay`); `DES-0008` linha 34
- achado: `readReplay(source: unknown)` é declarado como fronteira de "origem não confiável" (`DES-0008:34`) e a validação lista tipo, forma e faixa de `replayFormatVersion`, `trackId`, `trackVersion` e de cada `Input`, mas nenhum limite de tamanho é fixado: nem para o texto JSON recebido, nem para `inputs.length`. `DES-0008:34` afirma "tipo, forma, faixa e tamanho", mas o tamanho não está em lugar algum de `DES-0003`. `replayLap` aplica um `stepLap` por elemento de `inputs`, de modo que um registro arbitrariamente longo é aceito como `READABLE` e reproduzido sem teto.
- esperado: `DES-0003` fixa, com unidade, o comprimento máximo do texto aceito (bytes ou caracteres) e o número máximo de elementos de `inputs` (passos; por exemplo o mesmo teto que a validação de volta de `race-lap-validation` já impõe à duração, ou `MAX_LAP_STEPS`), e diz que o excesso é `UNREADABLE` antes de qualquer leitura dos elementos; `DES-0008:34` cita esses limites; `DM-0001` seção 3 registra o teto na linha de `inputs`; `test-strategy.md` acrescenta o fixture que excede o teto.

### ISSUE-03

- severidade: error
- verificação: D4 — toda coluna numérica carrega a unidade no nome
- arquivo: `core/DES-0001-acerto-arcade-assistido-v5-e-assistencias.md`; `data/DM-0001-dado-publicado-registros-e-linha-de-base.md`
- localização: `DES-0001` linhas 46–55 (tabela de campos opcionais de `KartConfig`); `DM-0001` linhas 17 e 28
- achado: `DM-0001:17` declara "unidades no nome de todo campo numérico (D-FS-06)" e `DM-0001:28` remete os campos de `config` a `DES-0001`; lá, os campos **novos** `steerApplyRate` (múltiplo do limite por s), `steerReturnRate` (idem), `yawTrackingGain` (1/s), `yawCorrectGain` (1/s) e `slipDampingGain` (1/s) são numéricos com unidade declarada só na tabela, não no nome. Os campos existentes de `KartConfig` (`steerRate`, `throttleRate`, …) estão congelados e fora do alcance; os cinco novos não estão. Os demais campos novos (`assistLateralG`, `assistSteerAllowanceRad`, `slipDampingCapG`, `forcingRearFrictionScale`, `grassSpeedLossPerS`) cumprem a regra.
- esperado: os cinco campos novos levam a unidade no sufixo (por exemplo `steerApplyRatePerS`, `steerReturnRatePerS`, `yawTrackingGainPerS`, `yawCorrectGainPerS`, `slipDampingGainPerS`), com o nome propagado a `DES-0001`, `DM-0001` e `test-strategy.md`.

### ISSUE-04

- severidade: info
- verificação: D2 — caminho de módulo e linha citada conferidos contra a árvore
- arquivo: `core/DES-0001-acerto-arcade-assistido-v5-e-assistencias.md`; `01-architecture.md`
- localização: `DES-0001` linha 82 (`scripts/keyboard-lap.ts:33`); `01-architecture.md` linha 67 (`tests/race-lap-validation-frozen.test.ts:58-60`)
- achado: o critério `nearest(state).distance > WIDTH / 2` está em `scripts/keyboard-lap.ts:34` (a linha 33 é `peakSlip`); a afirmação `KART_PRESETS.arcade === ARCADE_KART` está em `tests/race-lap-validation-frozen.test.ts:56` (bloco 53–60). Todas as demais citações `arquivo:linha` do conjunto conferem (`src/physics.ts`, `src/main.ts`, `src/lap.ts`, `index.html`, `scripts/physics-bench.ts`, `tests/*`, `docs/physics.md`).
- esperado: `scripts/keyboard-lap.ts:34` e `tests/race-lap-validation-frozen.test.ts:53-57`.

### ISSUE-05

- severidade: info
- verificação: D8 — caminho declarado pelo qual o teste chega ao critério
- arquivo: `test-strategy.md`
- localização: linha 15
- achado: os roteiros E2E-01 a E2E-03 (caminho de AC-US-0004-06 e de AC-US-0005-05 na tela) são registrados em `docs/handling-device-log.md`, que não existe na árvore e não está marcado como **novo**; `docs/lap-validation-bench.md`, o equivalente de `race-lap-validation`, existe.
- esperado: `docs/handling-device-log.md` marcado como novo (etapa de código), ou o registro apontado para um arquivo existente.

### ISSUE-06

- severidade: info
- verificação: D5 — I4 (chave mestra desligada por padrão)
- arquivo: `adr/ADR-0001-versao-do-acerto-como-registro-novo-no-codigo.md`; `core/DES-0001-acerto-arcade-assistido-v5-e-assistencias.md`
- localização: `ADR-0001` linhas 33–36 e 44–45; `DES-0001` linhas 136–142
- achado: a feature não tem chave mestra. O F-Spec validado (FEAT-0005, Configuração) proíbe "configuração para escolher entre o acerto antigo e o novo", e o ADR registra o motivo e a alternativa recusada; o "padrão sem mudança" de I4 está nos campos opcionais ausentes em `RENTAL_KART` e `ARCADE_KART`, com `REALISTA_UNCHANGED` como prova. Registrado como decidido pelo F-Spec, não como erro.
- esperado: nada a mudar.

### ISSUE-07

- severidade: info
- verificação: D3 — cobertura do F-Spec nos dois sentidos
- arquivo: `web/DES-0006-resultado-melhor-tempo-e-texto-compartilhado.md`; `adr/ADR-0002-formato-do-replay-e-registro-de-volta-em-memoria.md`
- localização: `DES-0006` linhas 56–62; `ADR-0002` linhas 50–52
- achado: SCR-0002 nomeia o ponto de entrada "abrir um tempo ou replay gravado" e a ação "reproduzir um replay"; nenhum item de projeto lhes dá tela, porque nenhuma feature persiste registros (`tests/race-lap-validation-layering.test.ts:43-49`) e API-0002 diz que a gravação é da feature que a possui. A redução é declarada, com `readReplay`/`replayLap` disponíveis para a feature que gravar. Todos os 58 `REQ-*` estão realizados; nenhum requisito é afetado.
- esperado: nada a mudar nesta rodada; a feature que persistir registros deve cobrir esse ponto de entrada.

## Divergences

`98-divergences.md`: 16 linhas, todas com `REQ-*`, exigência, estado atual em `arquivo:linha` (conferido contra `src/physics.ts`, `src/main.ts`, `scripts/*.ts`, `docs/physics.md`, `tests/*`), etapa devedora `código`, item de projeto que fecha e estado `open`. Nenhuma linha sem item de projeto; nenhuma `waived-pending`. Os seis requisitos declarados satisfeitos hoje (REQ-FEAT-0001-07, -08, REQ-FEAT-0002-08, REQ-FEAT-0003-10, -11, REQ-FEAT-0004-10, REQ-FEAT-0005-09, REQ-FEAT-0006-01, -02, -07) citam o ponto do código que os realiza e o item que os protege.

## Coverage

- D1: arquivos exigidos presentes; o bloco mermaid de `01-architecture.md` é `sequenceDiagram` bem formado; todo link relativo do conjunto resolve (inclusive os de `../../../../320%20F-Specs/...`). Índice, ids, front matter e rastreabilidade: do gate, não rejulgados.
- D2: 8 itens de projeto (DES-0001 a DES-0008), cada um com `REQ-*`, caminho, camada, interface, colaboradores, comportamento em falha e feature flag (ou motivo de ausência). Caminhos existentes conferidos na árvore: `src/physics.ts`, `src/track.ts`, `src/trackData.ts`, `src/maneuvers.ts`, `src/lap.ts`, `src/lapTiming.ts`, `src/main.ts`, `src/lapMessages.ts`, `scripts/keyboard-lap.ts`, `scripts/physics-bench.ts`, `docs/physics.md`, `index.html`, `tests/fixtures/trackFiles.ts`, `tests/race-lap-validation-*.test.ts`, `tests/physics.test.ts`, `tests/maneuvers.test.ts`; declarados novos e ausentes na árvore, como devem: `src/setupRecords.ts`, `src/handlingMessages.ts`, `scripts/handlingBench.ts`, `tests/dirigibilidade-*.test.ts`, `tests/fixtures/records.ts`. `400 Code/Source/` vazio, como a diretriz diz. Símbolos citados existem (`TEST_PAD`, `CIRCUIT`, `initialState`, `nearest`, `WIDTH`, `SYNTHETIC_TRACK_FILE`, `readTrackData`, `COUNTDOWN_STEPS`, `toMs`, `formatLapTime`, `message`, `LapResult`, `wheelPositions`). `keyboardLap` não tem consumidor fora do próprio programa; a sua substituição é consequência de REQ-FEAT-0005-03/-04, não refatoração não pedida (I10).
- D3: requisitos cobertos 58 de 58 (REQ-FEAT-0001-01..08, 0002-01..08, 0003-01..11, 0004-01..10, 0005-01..12, 0006-01..09); NFR 9 de 9 com mecanismo nomeado (DETERMINISM, STEP_COST, paridade BINARY/PROPORTIONAL, bloco `handling-baseline`, teste de camada, STEP_CONTRACT, REALISTA_UNCHANGED, glob `tests/*.test.ts`, leitores com `RESOLVED_FROM_ABSENCE`); contratos 3 de 3 servidos campo a campo (API-0001 ↔ DES-0002: 11 campos e `NO_STATE`; API-0002 ↔ DES-0003: `getSetupVersion`, `readReplay`, `compareLapRecords`, campos acrescentados e os quatro códigos; API-0003 ↔ DES-0004: campos comuns e por `benchId`, 17 ensaios, cinco `failReason`); itens sem fonte: nenhum.
- D4: `DM-0001` cobre os quatro dados versionados; revisões M1–M3 com reversão; sem backfill; janela de compatibilidade declarada (campos opcionais na leitura, forma anterior lida para sempre); retenção e privacidade por dado. Exceção: ISSUE-03.
- D5: contexto primário pista e desafio (I1); sentido de dependência `setupRecords.ts` → `lap.ts` → `physics.ts` e `handlingMessages.ts` → `lapMessages.ts` respeitado; nenhuma regra de pilotagem fora de `src/physics.ts`; I3 sem campo redefinido; D-DS-02 (replay versão 1 com leitor da forma anterior), D-DS-03 (sem integração externa), D-DS-04 (campos e motivo), D-DS-05 (quatro ADR), D-DS-07 (determinismo e teste em cada item) atendidos. Exceção: ISSUE-01.
- D6: sem sessão e sem papel, com motivo (RNF10) em cada contrato e em DES-0008; sem webhook; nenhum segredo no conjunto (grep); logs só com códigos; `<select>` validado por mapa; `readBaseline` em `try`. Exceção: ISSUE-02.
- D7: nenhuma escrita de domínio (declarado item a item, com o motivo); transições (`PUBLISHED`/`SUPERSEDED`, `handling`) com idempotência e ordem por `simStepCount`/`stepCount`; falha em tempo-limite, dependência e escrita parcial declarada em cada item; métrica por NFR nomeada.
- D8: 6 de 6 `FEAT-*` com nível; 31 de 31 `AC-*` com caminho (fixture, estado inicial por operação pública, biblioteca de ensaios, roteiro registrado); nenhum gancho ou configuração só de teste (`version: 'previous'` é argumento de bench reportado na saída); regras de domínio provadas em unitário/integração, E2E só para "todos os quadros" e compartilhar.
- D9: nenhum `OPEN-<nn>` nem `TBD`; divergências 16, todas fechadas por item de projeto.
- Feedbacks enviados: nenhum (nenhum achado pertence a outra feature; `race-lap-validation` não precisa mudar).
