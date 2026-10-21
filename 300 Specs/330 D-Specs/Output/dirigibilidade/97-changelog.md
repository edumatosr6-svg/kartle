---
title: Registro de mudanças — dirigibilidade do Arcade assistido
feature: dirigibilidade
stage: dspec
status: validated
version: 1.2.0
sources: []
---

# Registro de mudanças

## 2026-10-21 — rodada 1, Mode A

**O que mudou**

- Conjunto gerado do zero a partir do F-Spec validado de `300 Specs/320 F-Specs/Output/dirigibilidade/`
  (FEAT-0001 a FEAT-0006 com 58 requisitos `REQ-*`, API-0001 a API-0003, RULE-0001 a RULE-0003, FLOW-0001
  a FLOW-0003, SCR-0001 e SCR-0002) e do código em execução na raiz do repositório (somente leitura, para
  posicionamento), com as decisões que o autor passou a esta rodada: requisitos validados em
  `req-validation-20261021-1627`; decisões do dono do produto em `DOMAIN.md` já carregadas pelo F-Spec
  (resposta do volante mede só guinada; `understeer` transitório no ensaio de 50 km/h é aceitável); a rodada
  de teste do dono do produto é critério humano final e não bloqueia; o código fica na raiz do repositório,
  presets em `src/physics.ts`, benches em `scripts/`.
- Oito itens de projeto (`core/DES-0001` a `DES-0004`, `web/DES-0005` a `DES-0007`, `security/DES-0008`),
  um modelo de dados (`DM-0001`: dado publicado, registros de volta e replay, saída dos ensaios, linha de
  base), quatro ADR, `01-architecture.md`, `test-strategy.md` (cobre os 31 critérios `AC-*` e os 9 NFR) e
  `98-divergences.md` com 16 linhas abertas.
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os gera com `lint_artifacts.py --emit`.
- As pastas `backend/` e `mobile/` do esqueleto do estágio não existem porque o produto não tem servidor nem
  aplicativo nativo; a simulação está em `core/`, a apresentação em `web/`, a privacidade em `security/`.

**Decisões de projeto onde o F-Spec deixou lacuna ou decisão de projeto** (todas em ADR, nenhuma muda requisito)

- Identificadores concretos de versão: `arcade-assistido-v5` (nova), `arcade-assistido-v4` (anterior, o
  conteúdo de `ARCADE_KART`), `realista-aluguel-4t-v4` (Realista, sem anterior) — ADR-0001, DM-0001.
- O novo acerto é um literal novo (`ARCADE_ASSISTIDO_V5`) e `ARCADE_KART` fica intacto como registro da
  versão anterior, o que preserva o teste de congelamento de `race-lap-validation` — ADR-0001.
- Sem chave mestra: o F-Spec proíbe configuração para escolher o acerto; o padrão neutro de I4 está nos
  campos opcionais de `KartConfig`, ausentes nos presets antigos — ADR-0001.
- Registro de volta `LapRecord` envolve o `LapResult` sem alterá-lo; replay com formato versão 1; nenhuma
  persistência — ADR-0002.
- Linha de base como bloco JSON dentro de `docs/physics.md`; `runtimeId` sem nome de máquina — ADR-0003.
- Ensaios como biblioteca em `scripts/handlingBench.ts`; parâmetros de ensaio fixados; precondição não
  atingida é `FAIL` — ADR-0004.
- Serialização da saída dos ensaios: linhas JSON, um registro por linha, parâmetros e apresentação em
  km/h e s em linhas `#` separadas, para manter o registro campo a campo igual a API-0003 — DES-0004.

**Itens fechados**: nenhum `ISSUE-<nn>` ou `FB-<nn>` (primeira geração).

**Itens recusados, com motivo**

- Editar `ARCADE_KART` no lugar: viola REQ-FEAT-0005-09 e quebra `tests/race-lap-validation-frozen.test.ts`,
  o que contraria REQ-FEAT-0006-07 (ADR-0001).
- Acrescentar `setupId`/`setupVersion` ao `LapResult` de `src/lap.ts`: quebra
  `tests/race-lap-validation-contract.test.ts:35-41`; o F-Spec diz que os contratos daquela feature são
  nomeados e não redefinidos; o acréscimo é feito no registro (ADR-0002). Nenhum feedback a
  `race-lap-validation` é necessário, porque nenhum módulo nem teste daquela feature precisa mudar.
- Tela de abertura de registro gravado e reprodução de replay na interface: nenhuma feature persiste
  registros hoje e o F-Spec diz que a gravação é da feature que a possui; os leitores ficam disponíveis e
  os estados de SCR-0002 que dependem de registros gravados são declarados em DES-0006 (ADR-0002).
- Mover os rótulos do estado de aderência para um módulo puro: refatoração que o F-Spec não pede
  (I10); continuam em `src/main.ts:474`.
- Ensaios para as lacunas deliberadas do F-Spec (inversão do esterço, redução parcial, magnitude da perda
  na parede, grama abaixo de 45 km/h com percentual): não há critério; nenhum registro os mede (ADR-0004).
- Tolerância numérica no `DETERMINISM`: proibida por REQ-FEAT-0005-12 (ADR-0004).
- Medir custo por passo em `npm test`: relógio de parede em teste contraria I9; fica nos benches (ADR-0004).
- Chave mestra desligada por padrão: proibida pelo F-Spec e deixaria a feature sem efeito (ADR-0001).
- Divergências com o sistema em execução: não foram recusadas; estão em `98-divergences.md`.
- Nenhum requisito foi enfraquecido, removido ou dividido.

**Migração de verificações existentes**: `tests/physics.test.ts:147-189` e `tests/maneuvers.test.ts:68-79`
(usam `ARCADE_KART`, intacto), `tests/physics.test.ts:35` (`LapTracker`) e todo `tests/race-lap-validation-*.test.ts`
permanecem como estão; a função `keyboardLap` de `scripts/keyboard-lap.ts` é substituída pelo piloto de
teste da biblioteca (`testPilot`), que reporta `TEST_PILOT_LAP` em vez do objeto anterior — nenhuma
verificação é removida (§17).

## 2026-10-21 — rodada 2, Mode B (relatório `reports/dspec-validation/dspec-validation-20261021-1722.md`)

**O que mudou** (só os pontos do relatório; nenhum módulo, tabela, campo de contrato, endpoint ou
componente novo em relação ao conjunto reprovado, §16)

- ISSUE-01 (error, D-DS-01) — fechado. Um único enunciado em `01-architecture.md`, `DES-0004`, `DES-0008`,
  `ADR-0003`, `ADR-0004` e `test-strategy.md`: a biblioteca `scripts/handlingBench.ts` (camada Simulação)
  não importa `node:perf_hooks` nem `node:os` e não contém `Date` nem `performance`; o relógio de parede
  (`measureStepCost`, com `performance.now()`) e `runtimeId()` (com `node:os`) vivem em
  `scripts/keyboard-lap.ts`, declarado na camada **Aplicação** (programa de bench em Node que só altera a
  simulação por `startLap`/`stepLap`), e entram na biblioteca como argumento `BenchOptions.stepCost`
  (`meanStepCostUs`, `runtimeId`), ao lado de `measuredAtUtc`, que já vinha do chamador;
  `runBench('STEP_COST')` só compara o valor recebido com a linha de base. `scripts/physics-bench.ts`
  passa à mesma camada e não importa nenhum dos dois módulos. A lista de dependências de
  `01-architecture.md`, a tabela de camadas, os Colaboradores e o Determinismo de `DES-0004`, a tabela de
  fronteiras e o teste de `DES-0008` e as linhas NFR-0002/NFR-0005 de `test-strategy.md` refletem isso.
- ISSUE-02 (error, D6) — fechado. `DES-0003` fixa `MAX_REPLAY_TEXT_CHARS` = 4 194 304 caracteres do texto
  recebido e `MAX_REPLAY_INPUT_STEPS` = 36 000 elementos de `inputs` (300 s simulados a 120 Hz; distinto
  de `MAX_LAP_STEPS` 6 000 do piloto de teste), ambos verificados antes de ler qualquer elemento, excesso
  `UNREADABLE`; a ordem das verificações de `readReplay` ganhou o passo do teto; `DES-0008` cita os limites;
  `DM-0001` seção 3 registra o teto na linha de `inputs` e o teto do texto; `test-strategy.md` acrescenta
  os fixtures `oversizedReplay()` e `oversizedReplayText()` e a prova de que nenhum elemento é lido.
- ISSUE-03 (error, D4) — fechado. Os cinco campos opcionais novos de `KartConfig` levam a unidade no
  sufixo: `steerApplyRatePerS`, `steerReturnRatePerS`, `yawTrackingGainPerS`, `yawCorrectGainPerS`,
  `slipDampingGainPerS` (`DES-0001`, tabela e prosa). `DM-0001` remete à tabela de `DES-0001` e
  `test-strategy.md` não nomeava esses campos; nada mais a propagar.
- ISSUE-04 (info, D2) — fechado. `DES-0001`: `scripts/keyboard-lap.ts:34`; `01-architecture.md`:
  `tests/race-lap-validation-frozen.test.ts:53-57`.
- ISSUE-05 (info, D8) — fechado. `docs/handling-device-log.md` marcado como **novo**, criado pela etapa de
  código no molde de `docs/lap-validation-bench.md`.
- ISSUE-06 (info, I4) e ISSUE-07 (info, D3) — nada a mudar, como o relatório pede; registrados aqui para
  que a decisão fique explícita: sem chave mestra por proibição do F-Spec (ADR-0001); o ponto de entrada
  "abrir um tempo ou replay gravado" de SCR-0002 fica com a feature que persistir registros (ADR-0002).
- `00-index.md` e `99-traceability.md` não foram tocados: o gate os regenera.

**Itens recusados, com motivo**: nenhum. Nenhum requisito foi enfraquecido; nenhuma divergência nova
(`98-divergences.md` inalterado); nenhum feedback a outra feature.

## 2026-10-21 — rodada 3, Mode B (mesmo relatório `dspec-validation-20261021-1722.md`; F-Spec movido a 2.0.0)

**Gatilho**: a rodada 2 deixou os sete pontos do relatório fechados, mas o F-Spec passou a 2.0.0 (seed
`revision: 2`, `fspec-validation-20261021-1750`, SUCCESS) antes de o validador deste estágio rodar de novo.
Esta rodada reverifica os pontos do relatório e carrega as decisões que o autor passou à invocação, sem
redescoberta: acerto agressivo de `DOMAIN/REF-02` (180 ms / 250 ms; 50 km/h na curva de referência de
raio 18 m; 200 ms e 400 ms mantidos; 0–60 km/h em 2,5 s; ≥ 105 km/h; volta do piloto de teste ≤ 25 s;
ensaio de resposta do volante mede só a guinada; ciclo `DOMAIN/DEC-10` = staging + feedback curto, sem
preset experimental); código na raiz do repositório, presets em `src/physics.ts`, benches em `scripts/`.

**O que mudou** (só valores, referências e prosa; nenhum módulo, tabela, campo, endpoint, componente,
ensaio ou parâmetro de ensaio acrescentado em relação ao conjunto reprovado, §16)

- ISSUE-01 a ISSUE-05: conferidos como aplicados nos arquivos (rodada 2); ISSUE-06 e ISSUE-07: nada a mudar.
  Os arquivos tocados na rodada 2 sem bump de versão (`01-architecture.md`, `DES-0003`, `DES-0008`,
  `ADR-0003`, `ADR-0004`) passam a 1.0.1 para que a população de revalidação os inclua.
- Limiares da revisão 2 carregados em todos os sítios: `DES-0001` (2.0.0: alavancas 180/250 ms e curva de
  18 m a 50 km/h; restrições numéricas recalculadas — ≥ 1 520 N médios para 0–60 km/h em 2,5 s com 228 kg,
  `governorSpeed` acima de 29,17 m/s mais a rampa, ao menos 1,09 g lateral na curva de referência; condição
  de forçar `state.speed > 50 / 3.6`); `DES-0004` (2.0.0: tabela de conversão — 180 ms comparado em ms
  sobre `toMs`, `toMs(21)` = 175 `PASS` e `toMs(22)` = 183 `FAIL`, 2 500 ms = 300 passos, 25 000 ms = 3 000,
  105 km/h = `105 / 3.6`, 50 km/h = `50 / 3.6`; `STEER_RESPONSE` ≤ 180/250; `REFERENCE_CORNER`,
  `UNDERSTEER_ONSET` e `GRASS_LOSS` a `50 / 3.6` m/s; `ACCELERATION` ≤ 2 500; `TOP_SPEED` ≥ `105 / 3.6`;
  `TEST_PILOT_LAP` ≤ 25 000); `test-strategy.md` (2.0.0: fixtures `moving(50 / 3.6)` e `forcingSequence`
  acima de 50 km/h; caminhos de AC-US-0001-01 a -04, AC-US-0003-02, AC-US-0004-01, -02, -04, AC-US-0005-03 e
  NFR-0005 com os valores novos); `98-divergences.md` (1.1.0: linhas de REQ-FEAT-0001-01 a -04,
  REQ-FEAT-0002-01 a -03, REQ-FEAT-0004-01/-02 e REQ-FEAT-0005-01 a -04 com a exigência da revisão 2; o
  estado atual do código, em `arquivo:linha`, não muda); `DES-0005` (1.0.1: literais proibidos em
  `src/main.ts` passam a `50 / 3.6` / `13.88`).
- Ciclo em staging (`DOMAIN/DEC-10`, RULE-0003 1.1.0, FEAT-0005 Configuração): `ADR-0001` (1.0.1,
  Consequências), `DM-0001` (1.0.1, seção 1), `DES-0004` (Estado e concorrência) e `DES-0007` (1.0.1,
  `<select>`) dizem que cada rodada de presets reprovada é substituída por nova `setupVersion`, nunca editada
  no lugar, que `PUBLISHED_SETUPS` segue com um registro por `setupId` (corrente e anterior) e que nenhum
  preset experimental entra no painel; todos os ensaios se repetem por rodada contra os mesmos limiares.
- `01-architecture.md` (1.0.1): cita o F-Spec 2.0.0 e a revisão 2 do seed. `DES-0004` nomeia "bench de
  física" ao lado de `npm run bench:physics`, como o F-Spec 2.0.0 passou a dizer; o nome do script é
  posicionamento deste estágio e permanece.
- `00-index.md` e `99-traceability.md` não foram tocados: o gate os regenera com `lint_artifacts.py --emit`.

**Tabela de migração** (conventions §17): nenhum item de projeto, ADR, modelo de dados, ensaio, fixture,
critério ou verificação retirado ou acrescentado; 8 DES, 1 DM, 4 ADR, 31 `AC-*` e 9 NFR cobertos antes e
depois; 16 divergências antes e depois.

**Itens fechados**: ISSUE-01 a ISSUE-05 (reconfirmados); ISSUE-06, ISSUE-07 (nada a mudar). Nenhum
`FB-<nn>` pendente.

**Itens recusados, com motivo**

- Os valores da revisão 1 (250/300 ms, 45 km/h, 3,0 s, 95 km/h, 27 s) não ficam como piso nem como
  alternativa: o F-Spec 2.0.0 diz "substitui".
- Arredondar 180 ms para 22 passos (183 ms): afrouxaria o limiar; a comparação é feita em ms sobre `toMs`,
  como RULE-0002 manda ("sem arredondar o valor medido").
- Constante exportada ou configurável para a velocidade da condição de forçar: seria superfície nova numa
  rodada de correção (§16) e configuração que FEAT-0005 proíbe; o literal `50 / 3.6` vive só em
  `src/physics.ts`, como o 12,5 anterior.
- Registro de `PUBLISHED_SETUPS` por rodada de staging (um literal por rodada reprovada): RULE-0003 só exige
  que a versão reprovada não seja editada no lugar e continue legível nos registros; a comparabilidade e a
  linha de base precisam só da versão anterior (`previousConfig`), e a reprodução usa sempre o acerto
  corrente (API-0002). Recusado como superfície nova sem requisito.
- Parâmetros de ensaio (`forcingSpeedMps` 16,7, `entrySpeedMaxMps` 25, janelas): inalterados; 16,7 m/s
  continua acima dos 50 km/h que `REAR_RECOVERY` exige, e nenhum requisito os move.
- Nenhum requisito foi enfraquecido; nenhuma divergência nova ou resolvida; nenhum feedback a outra feature
  (`race-lap-validation` não precisa mudar: os valores da revisão 2 só atingem os presets, os ensaios e os
  limiares desta feature).

## 2026-10-21 — rodada 4, Mode B (relatório `reports/dspec-validation/dspec-validation-20261021-1800.md`)

**O que mudou** (só o ponto do relatório; nenhum módulo, tabela, campo, endpoint, componente, ensaio ou
parâmetro de ensaio acrescentado em relação ao conjunto reprovado, §16)

- ISSUE-01 (error, D5/D2) — fechado. A linha `testPilot(config)` sai da tabela de símbolos de
  `scripts/keyboard-lap.ts` e entra na tabela de `scripts/handlingBench.ts` em `DES-0004` (2.0.1), com a
  mesma assinatura e descrição, acrescida de quem a importa (`TEST_PILOT_LAP`, `DETERMINISM`, `npm test` e
  `measureStepCost`); a tabela de `scripts/keyboard-lap.ts` fica só com `runtimeId()` e
  `measureStepCost(setup)`, e a descrição de `measureStepCost` diz "importado de `scripts/handlingBench.ts`".
  O sentido de dependência passa a ser um só em todo o conjunto: Aplicação (`keyboard-lap.ts`) importa a
  biblioteca de Simulação (`handlingBench.ts`), nunca o contrário. `test-strategy.md` (2.0.1) nomeia o módulo
  do fixture `testPilot(config)` na tabela de fixtures. `01-architecture.md:39`, `97-changelog.md` (rodada 1)
  e `DES-0004:41, 106` já diziam "da biblioteca" e não mudam.
- ISSUE-02 (info, I4) e ISSUE-03 (info, D3) — nada a mudar, como o relatório pede: sem chave mestra por
  proibição do F-Spec (ADR-0001); o ponto de entrada "abrir um tempo ou replay gravado" de SCR-0002 fica
  com a feature que persistir registros (ADR-0002).
- `00-index.md` e `99-traceability.md` não foram tocados: o gate os regenera com `lint_artifacts.py --emit`.

**Itens fechados**: ISSUE-01; ISSUE-02 e ISSUE-03 (nada a mudar). Nenhum `FB-<nn>` pendente.

**Itens recusados, com motivo**: nenhum. Nenhum requisito foi enfraquecido; nenhuma divergência nova ou
resolvida (`98-divergences.md` inalterado); nenhum feedback a outra feature.
