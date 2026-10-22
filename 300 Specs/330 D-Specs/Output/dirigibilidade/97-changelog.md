---
title: Registro de mudanças — dirigibilidade do Arcade assistido
feature: dirigibilidade
stage: dspec
status: validated
version: 2.2.0
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

## 2026-10-21 — rodada 5, Mode A (F-Spec 3.0.0, seed `revision: 3`; feedback do código `reports/feedback/feedback-20261021-1827.md`)

**Gatilho**: o F-Spec passou a 3.0.0 (`fspec-validation-20261021-1853`, SUCCESS) depois do FAIL SPEC da
rodada de código 1: a pista sintética não tem curva de 18 m e o regime da resposta do volante com acelerador
0 não é estacionário. Decisões do autor recebidas para esta rodada e carregadas sem redescoberta: a curva de
referência é um ensaio em pista de teste (arco de raio 18 m, faixa de `WIDTH`, sem paredes, ambiente de
ensaio próprio como o `TEST_PAD` de `src/physics.ts`); o ensaio de resposta do volante roda em reta com a
velocidade mantida em 50 km/h pelo acelerador e o regime é o valor estabilizado nessa condição (janela
curta, estacionária); só a volta do piloto de teste usa a pista sintética; o código parcial da rodada de
código 1 (`src/physics.ts` com `ARCADE_ASSISTIDO_V5` candidato, `src/setupRecords.ts`,
`scripts/handlingBench.ts`) é lido como as-built e o projeto vence; código na raiz do repositório, presets
em `src/physics.ts`, benches em `scripts/`. Os cinco itens do feedback do código que o F-Spec devolveu ao
projeto (SPEC-ISSUE-02 a 06) são resolvidos nesta rodada.

**O que mudou**

- `01-architecture.md` (2.0.0): F-Spec 3.0.0; estado as-built da rodada de código 1; o que a revisão 3 muda;
  tabela de camadas com os símbolos existentes e os novos de `src/physics.ts`; segundo diagrama (ensaios);
  compatibilidade da constante `TEST_PAD` e da linha de base; ADR-0005.
- `DES-0001` (3.0.0): linhas as-built de `src/physics.ts`; o candidato `ARCADE_ASSISTIDO_V5` como ponto de
  partida; **novos** `testPadLane`, `testPadArc` (pista de teste em reta e arco, largura `WIDTH`, raio
  18 m), `classifyHandlingSteps` + `StepClass` + `RECOVERY_MAX_STEPS` (classe "Recuperação" de RULE-0001,
  decidida na simulação) e o campo opcional `forcingRampMps` (padrão 0 = degrau as-built; margem entre a
  curva de referência com acelerador cheio e o ensaio de recuperação); restrição numérica do regime de
  guinada na faixa de 11 m.
- `DES-0002` (1.1.0): valor inicial de `surface` fixado como o literal `ASPHALT` de `emptyTelemetry`
  (`src/physics.ts:102`), com o motivo (SPEC-ISSUE-05); `surface` `GRASS` como "fora da faixa" na pista de
  teste; `wallContact` nunca verdadeiro ali.
- `DES-0003` (1.1.0): módulo existente (as-built), linhas citadas; sem mudança de interface.
- `DES-0004` (3.0.0): biblioteca existente e alterada, com o que muda marcado; `benchEnvironment` em todo
  registro e a tabela de ambientes; `STEER_RESPONSE` com `speedHoldMode` `THROTTLE_REGULATED` (acelerador
  0/1 por passo, função da velocidade anterior, nunca forçando), `speedHoldBandMps` 0,5, `holdMs` 600,
  `settleWindowMs` 200, `speedMinMps`/`speedMaxMps`, `SPEED_NOT_HELD` (SPEC-ISSUE-02); `REFERENCE_CORNER`,
  `UNDERSTEER_ONSET` e `REAR_RECOVERY` em `testPadArc(18, WIDTH)` com `arcEntry`, `arcRadiusM`, `laneWidthM`,
  parada no primeiro passo fora da faixa, `offAsphaltFirstStep` e posição (SPEC-ISSUE-01, fechado pelo seed e
  pelo F-Spec); `REAR_RECOVERY` com `gripReached`, `recoveryMs` condicional e `OFF_ASPHALT`; `NORMAL_DRIVING`
  por `classifyHandlingSteps`, um registro por ambiente, com `normalDrivingStepCount` e
  `excludedRecoveryStepCount` (SPEC-ISSUE-06); `BenchOptions.oldRecords` e `builtInOldRecords()`
  (SPEC-ISSUE-03) e `BenchOptions.realistaBaseline` (SPEC-ISSUE-04), ambos já no as-built e agora de
  projeto; `GRASS_LOSS` na pista sintética por `grassEntry` (índice 83, trecho reto); `ACCELERATION`/`TOP_SPEED`
  em `testPadLane`; `DETERMINISM` e `REALISTA_UNCHANGED` por ambiente; `TEST_PILOT_LAP` sem `lapValidity`
  (volta sem tempo reporta `toMs(MAX_LAP_STEPS)`); `REFERENCE_CORNER` sem `oversteerOrSlidingStepCount`
  (vai para a linha `#`); `baselineRecord` por ensaio, ambiente, geometria e variante; argumentos
  `--previous`/`--realista` de `bench:handling`.
- `DM-0001` (1.1.0): seção 4 com `benchEnvironment` e os campos da revisão 3; seção 5 com
  `entries[].parameters` e a resolução por ambiente e geometria; nota de que o candidato `arcade-assistido-v5`
  ainda não foi entregue sob esse identificador; M1/M2 marcados como feitos.
- `ADR-0003` (1.1.0): resolução da linha de base por ensaio, ambiente e geometria; alternativas recusadas
  (aceitar por `benchId`/`inputMode`; converter a medida da pista sintética). `ADR-0004` (2.0.0): parâmetros
  da revisão 3; precondições e motivos de falha; decisões 6 (entradas da biblioteca) e 7 (agregados por
  ambiente); consequência de que as medidas da rodada de código 1 não são comparáveis. `ADR-0005` (**novo**,
  1.0.0): pista de teste como geradores em `src/physics.ts`, velocidade mantida por acelerador regulado,
  classificador na simulação, grama no trecho reto da pista sintética; alternativas recusadas (curva da
  pista sintética; geometria só na biblioteca; acelerador constante parcial ou 1; velocidade imposta por
  fora; classificador na biblioteca; faixa mais larga).
- `DES-0007` (1.0.2): linhas as-built da saturação em `src/physics.ts` (`:116`, `:182`, `:189-190`); teste
  de contrato também afirma que `src/main.ts` não importa os símbolos de ensaio. `DES-0008` (1.0.2):
  fronteiras de `parameters`, do texto de `src/physics.ts` e de `oldRecords`.
- `test-strategy.md` (3.0.0): fixtures da pista de teste (`testPadLane`, `testPadArc`, `arcEntry`,
  `grassEntry`, regulador, sequências sintéticas do classificador, `baselineMarkdown()` com geometria
  diferente); caminhos dos critérios com `benchEnvironment`, `SPEED_NOT_HELD`, `OFF_ASPHALT` no arco,
  `gripReached`, `excludedRecoveryStepCount`, `DETERMINISM` e `REALISTA_UNCHANGED` por ambiente; NFR-0004
  com ambiente e parâmetros.
- `98-divergences.md` (2.0.0): todas as linhas recitadas contra a árvore depois da rodada de código 1
  (`scripts/handlingBench.ts`, `src/physics.ts`, `src/setupRecords.ts`, `src/main.ts`, `scripts/keyboard-lap.ts`,
  `scripts/physics-bench.ts`, `docs/physics.md`); 17 linhas abertas (a linha nova é REQ-FEAT-0003-02:
  o degrau de `forcingRearFrictionScale` a 50 km/h); o que a rodada de código 1 já satisfaz passa à lista
  final.
- Sem mudança de conteúdo, carregados na versão corrente: `DES-0005` (1.0.1), `DES-0006` (1.0.0),
  `ADR-0001` (1.0.1), `ADR-0002` (1.0.0) — nenhum item da revisão 3 os atinge (HUD, resultado, versão e
  replay não mudam com o ambiente dos ensaios), e as linhas de `src/main.ts` que citam continuam válidas.
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os regenera com `lint_artifacts.py --emit`.

**Tabela de migração** (conventions §17): 8 DES e 1 DM antes e depois; ADR 4 → 5 (ADR-0005 novo);
31 critérios `AC-*` e 9 NFR cobertos antes e depois; 61 requisitos `REQ-*` do F-Spec 3.0.0 realizados (os
três novos — requisito 09 de FEAT-0001, requisito 09 de FEAT-0002, requisito 12 de FEAT-0003 — entram em
`DES-0004`, `DES-0001` e `ADR-0004`/`ADR-0005`); divergências 16 → 17 (uma nova; nenhuma resolvida: o
código da rodada 1 realiza partes do projeto anterior, não deste). Nenhum item de projeto, modelo, ensaio,
fixture ou verificação retirado. Parâmetros de ensaio que mudam de valor em relação à versão 2.0.1:
`holdMs` 2 000 → 600, `settleWindowMs` 500 → 200, acelerador do `STEER_RESPONSE` constante 0 → regulado
(`speedHoldMode`), `entryArcM` 20 e `cornerWindowMs` sobre a pista sintética → `arcEntry` e janela sobre o
anel de 18 m; parâmetros novos: `targetSpeedMps`, `speedHoldBandMps`, `laneWidthM`, `arcRadiusM`,
`grassEntryIndex`, `grassEntryOffsetM`, `grassEntryAngleRad`; parâmetros retirados: `entryArcM`
(a entrada do arco é o ponto tangente fixo). Campos de registro retirados em relação ao as-built, por não
serem do contrato: `oversteerOrSlidingStepCount` em `REFERENCE_CORNER`, `lapValidity` em `TEST_PILOT_LAP`.

**Itens fechados**: SPEC-ISSUE-02 (regime estacionário: velocidade mantida por acelerador regulado,
`holdMs` 600, `settleWindowMs` 200, `SPEED_NOT_HELD`), SPEC-ISSUE-03 (`BenchOptions.oldRecords` +
`builtInOldRecords()`), SPEC-ISSUE-04 (`BenchOptions.realistaBaseline`), SPEC-ISSUE-05 (`surface` inicial
é o literal `ASPHALT`), SPEC-ISSUE-06 (os passos de recuperação, até 400 ms, não entram em `NORMAL_DRIVING`;
os além de 400 ms entram). SPEC-ISSUE-01 fechado a montante (seed revisão 3, F-Spec 3.0.0) e carregado aqui
como `testPadArc(18, WIDTH)`. ISSUE-01 e ISSUE-02 (info) de `dspec-validation-20261021-1805`: nada a mudar
(sem chave mestra por proibição do F-Spec; abertura de registro gravado fica com a feature que persistir
registros). Nenhum `FB-<nn>` pendente para esta feature.

**Itens recusados, com motivo**

- Curva de referência de 24 m da pista sintética, ou geometria sintética de 18 m dentro da pista: o seed
  (revisão 3) e o F-Spec decidiram pela pista de teste; a pista sintética não muda (NFR-0008).
- `speedHoldMode` `THROTTLE_CONSTANT` com acelerador parcial: não é binário e falharia a paridade `BINARY`
  (NFR-0003); acelerador constante 1 satisfaria a condição de forçar (ADR-0005).
- Velocidade imposta por fora da simulação (zerar a aceleração longitudinal): caminho que o jogo não tem,
  superfície só de teste (I9; ADR-0005).
- Faixa da pista de teste mais larga que `WIDTH` para a reta: o F-Spec fixa "faixa da largura da pista"; a
  duração do ensaio (`holdMs` 600) é que se ajusta, com a conta registrada em `DES-0004`.
- `OFF_ASPHALT` como motivo de falha de `STEER_RESPONSE` e da precondição de `GRASS_LOSS`: API-0003 enumera
  os ensaios em que a saída do asfalto é motivo; fora deles a precondição não mantida segue a regra de
  ADR-0004 (`THRESHOLD_EXCEEDED`), para não alargar o contrato.
- Campo `oversteerOrSlidingStepCount` em `REFERENCE_CORNER` e `lapValidity` em `TEST_PILOT_LAP` (ambos no
  as-built): não são campos de API-0003; o primeiro vai para a linha `#` de apresentação, o segundo é
  substituído pela regra de `lapTimeMs` = `toMs(MAX_LAP_STEPS)` para volta sem tempo.
- Um único registro de `NORMAL_DRIVING`/`DETERMINISM`/`REALISTA_UNCHANGED` com `benchEnvironment` arbitrário:
  tornaria o campo falso; um registro por ambiente (ADR-0004, decisão 7).
- Classificador de recuperação dentro de `scripts/handlingBench.ts` (onde o as-built exclui `forcing`/drift):
  RULE-0001 é regra do passo e REQ-FEAT-0003-10 manda decidi-la na simulação; fica em `src/physics.ts`.
- Aceitar a linha de base por `benchId` e `inputMode` (as-built, `scripts/handlingBench.ts:275`) ou
  converter a medida da pista sintética para o arco: RULE-0002 exige o mesmo ensaio, ambiente e geometria e
  proíbe extrapolar (ADR-0003).
- Mudar `forcingSpeedMps` (16,7 m/s) ou `entrySpeedMaxMps` (25 m/s): nenhum requisito os move; a entrada
  do arco a 16,7 m/s está acima de 50 km/h como `REAR_RECOVERY` exige; a margem contra a curva de
  referência com acelerador cheio vem da alavanca `forcingRampMps`, não do parâmetro de ensaio.
- Editar os valores do candidato `ARCADE_ASSISTIDO_V5` neste estágio: são escolha da etapa de código pelos
  ensaios; o projeto fixa as alavancas e as restrições numéricas (DES-0001).
- Ambiente numérico dos ensaios de 0–60 km/h e velocidade estabilizada como limiar: lacuna deliberada do
  F-Spec; a reta da pista de teste é escolhida e reportada em `benchEnvironment`.
- Os itens recusados das rodadas 1 e 3 continuam recusados pelos mesmos motivos (editar `ARCADE_KART`;
  campos no `LapResult`; tela de replay; tolerância no `DETERMINISM`; custo por passo em `npm test`; chave
  mestra; valores da revisão 1 como piso; arredondar 180 ms para 22 passos; constante configurável da
  condição de forçar; registro de `PUBLISHED_SETUPS` por rodada de staging).
- Nenhum requisito foi enfraquecido; nenhuma divergência resolvida; nenhum feedback a outra feature
  (`race-lap-validation` não precisa mudar: a pista de teste não passa por `src/lap.ts` nem pelo dado de
  pista). A pasta do seed e `200 Requirements/230 Output/` não foram lidas (conventions §12): as decisões do
  autor vieram com a invocação e o F-Spec 3.0.0 carrega `SEED/RD-06` e `DOMAIN/REF-03`.

## 2026-10-22 — rodada 6, Mode A (F-Spec 3.0.0, seed `revision: 3`; feedback do código `reports/feedback/feedback-20261021-1827.md`)

**Gatilho**: nova execução do loop depois de a anterior (`dspec-loop-phases-20261021-1858`) ter sido
interrompida no validador, sem relatório. O conjunto da rodada 5 foi tratado como rascunho e conferido de
novo contra o F-Spec validado (`fspec-validation-20261021-1853`, SUCCESS) e contra a árvore. Decisões do
autor recebidas para esta rodada e carregadas sem redescoberta (as mesmas da rodada 5): curva de referência
como ensaio na pista de teste (arco de raio 18 m, faixa de `WIDTH`, sem paredes, ambiente próprio como o
`TEST_PAD` de `src/physics.ts`); resposta do volante em reta com a velocidade mantida em 50 km/h e regime
estacionário; só a volta do piloto de teste na pista sintética; os itens SPEC-ISSUE-02 a 06 do feedback
resolvidos; código parcial lido como as-built, o projeto vence; código na raiz, presets em
`src/physics.ts`, benches em `scripts/`.

**Verificação do método sobre a árvore** (conventions §12 permite ler a raiz de código; nada foi escrito
nela): as definições deste projeto foram executadas sobre `src/physics.ts`, `src/track.ts` e
`scripts/handlingBench.ts` da rodada de código 1, com scripts fora do repositório, para conferir que cada
ensaio é alcançável. Os números estão nos itens que os usam (DES-0001, DES-0004, ADR-0004, ADR-0005,
`98-divergences.md`) e nenhum é linha de base.

**O que mudou**

- `DES-0004` (3.1.0): `judge(record, observed?)` — o segundo argumento leva a precondição não mantida que o
  ensaio vê no traço e que nenhum campo de API-0003 carrega (kart fora da faixa em `STEER_RESPONSE`,
  `UNDERSTEER_ONSET` e `REAR_RECOVERY`; grama não mantida em `GRASS_LOSS`; V1 não determinado), de modo que
  `judge` continua a fonte única do veredito; a rodada 5 dizia que `judge` decidia "só dos campos" e, ao
  mesmo tempo, fazia vereditos depender de condições fora deles. `UNDERSTEER_ONSET`: a varredura termina
  na primeira execução que sai da faixa; V1 vem dos passos no asfalto, inclusive da execução que depois
  sai; `maxUndersteerMsBySpeed` só com execuções completas acima de V1; saída a 50 km/h ou antes de V1 é
  `OFF_ASPHALT`; teto sem V1 é `THRESHOLD_EXCEEDED`; sem V1, `v1Mps` é a última velocidade executada e o
  registro é `FAIL`. `baselineRecord` só aceita como V0 um registro com V1 determinado. `grassEntry` com o
  lado de fora definido por fórmula (o oposto à origem). `testPilot` e todos os parâmetros de ensaio fixos.
  `--previous` e `--realista` não passam linha de base. Prova de método da fase A de `STEER_RESPONSE` com o
  regime medido. Linha `#` com os diagnósticos novos.
- `ADR-0004` (2.1.0): Contexto com os fatos medidos (pista de 368,5 m; o piloto anterior, com teto de
  13 m/s, não desce de 28,35 s; `ARCADE_KART` com o piloto da biblioteca em 26 703 ms; `understeer` de
  `ARCADE_KART` já a 50 km/h; durações cortadas pela saída caindo com a velocidade); decisão 2 fixa todos os
  parâmetros, o piloto inclusive; decisão 3 com `observed`; decisão 8 nova (varredura até a primeira saída);
  alternativas recusadas correspondentes; consequências sobre `baselineLapTimeMs` e o V0 da linha de base.
  Fontes: `REQ-FEAT-0002-04`, `-05`, `-09` acrescentadas.
- `ADR-0003` (1.2.0): as execuções que produzem linha de base não recebem linha de base; um registro de
  `UNDERSTEER_ONSET` sem V1 determinado não serve de V0.
- `ADR-0005` (1.1.0): o lado e a geometria da entrada na grama, com a medida de que os 120 passos ficam na
  grama sem tocar a parede; o trecho de grama deixa de ser ajustável pela etapa de código; motivo da
  alternativa "classificador na biblioteca" corrigido (REQ-FEAT-0003-10).
- `DES-0001` (3.1.0): `forcingRampMps` calculado uma vez por passo em `step`, sobre o mesmo `state.speed`
  de `isForcing`; alavancas com o que foi medido (`oversteer` na curva de referência com acelerador cheio
  pelo degrau as-built; nenhum V1 com o candidato); a guinada de 0,95 rad/s passa a ser dita teto, com o
  regime medido de 0,72 rad/s; o compromisso entre força motriz, curva de referência com acelerador cheio e
  recuperação declarado; linhas `tests/race-lap-validation-frozen.test.ts:31-60` e
  `tests/maneuvers.test.ts:63-67` corrigidas.
- `DM-0001` (1.2.0): seção 5 com a condição de V1 determinado para V0 e os vereditos dos registros de uma
  entrada de linha de base.
- `DES-0003` (1.1.1): `compareLapRecords` compara a pista por igualdade estrita "sem normalização" (a
  rodada 5 dizia "após normalização" e o contrário na mesma frase); linhas citadas.
- `01-architecture.md` (2.1.0): linhas `tests/race-lap-validation-frozen.test.ts:48-51`/`:53-60` e
  `tests/race-lap-validation-contract.test.ts:34-41` corrigidas; parágrafo da revisão 3 e linha de
  ADR-0004 com a varredura e os parâmetros fixos. `ADR-0002` (1.0.1): mesma linha do teste de contrato.
- `test-strategy.md` (3.1.0): caminhos de AC-US-0002-03 e -04 para a varredura nova e a condição de V0;
  `observed` nos caminhos de AC-US-0001-06, AC-US-0003-03 e AC-US-0004-03; `syntheticReading()` sem a
  sugestão de que a biblioteca importa de `tests/`; `grassEntry` com a geometria.
- `98-divergences.md` (2.1.0): linhas de REQ-FEAT-0002-04/-05/-07, REQ-FEAT-0003-02, REQ-FEAT-0004-01/-02 e
  REQ-FEAT-0005-01 a -04 com `arquivo:linha` adicionais e o que foi medido do candidato; 17 linhas abertas,
  como antes.
- Sem mudança de conteúdo, carregados na versão corrente: `DES-0002` (1.1.0), `DES-0005` (1.0.1),
  `DES-0006` (1.0.0), `DES-0007` (1.0.2), `DES-0008` (1.0.2), `ADR-0001` (1.0.1).
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os regenera com `lint_artifacts.py --emit`.

**Tabela de migração** (conventions §17): 8 DES, 1 DM e 5 ADR antes e depois; 61 requisitos `REQ-*`, 31
critérios `AC-*` e 9 NFR realizados antes e depois; 17 divergências antes e depois. Nenhum item de projeto,
ensaio, fixture ou verificação retirado. Interface que muda: `judge` ganha o segundo argumento opcional
`observed`. Parâmetros de ensaio: nenhum valor muda; `entrySpeedMaxMps` passa de limite da varredura a
teto de segurança; `maxSpeedMps`, `lateralBudgetMps2` e `grassEntryIndex` deixam de ser ajustáveis pela
etapa de código. Nenhum campo de registro de API-0003 acrescentado ou retirado.

**Itens fechados**: SPEC-ISSUE-02 (regime estacionário: velocidade mantida por acelerador regulado,
`holdMs` 600, `settleWindowMs` 200, `SPEED_NOT_HELD`; agora com a medida do método), SPEC-ISSUE-03
(`BenchOptions.oldRecords` + `builtInOldRecords()`; a biblioteca não importa de `tests/`), SPEC-ISSUE-04
(`BenchOptions.realistaBaseline`), SPEC-ISSUE-05 (`surface` inicial é o literal `ASPHALT`), SPEC-ISSUE-06 (os
passos de recuperação, até 400 ms, não entram em `NORMAL_DRIVING`; os além de 400 ms entram) — os cinco
carregados da rodada 5 e reconferidos. SPEC-ISSUE-01 fechado a montante (seed revisão 3, F-Spec 3.0.0).
Nenhum `ISSUE-<nn>` pendente (a rodada 5 não chegou a ter relatório); nenhum `FB-<nn>` pendente.

**Itens recusados, com motivo**

- Toda saída da faixa em `UNDERSTEER_ONSET` como `OFF_ASPHALT`, como a linha de erro de API-0003 e a
  alternativa de FLOW-0002 dizem ao pé da letra: com a varredura subindo até sair da faixa — o que ocorre
  com qualquer kart, porque a 90 km/h só 2,7 g caberiam no arco —, o ensaio reprovaria todo acerto e
  REQ-FEAT-0002-04/-05 ficariam inalcançáveis por construção. O projeto aplica `OFF_ASPHALT` à saída a
  50 km/h e à saída antes de V1 (as falhas do ensaio) e trata a saída depois de V1 como o fim da varredura
  mensurável, sem medir nada fora do asfalto (ADR-0004, decisão 8). A mesma linha de API-0003 já havia sido
  apontada pelo validador do F-Spec (`fspec-validation-20261021-1853`, ISSUE-01, aviso) por citar um campo
  que o registro de `UNDERSTEER_ONSET` não tem; nenhum requisito muda e nenhum feedback ao F-Spec é escrito.
- Teto da varredura abaixo da velocidade de saída da faixa: seria um parâmetro moldado ao acerto para o
  ensaio passar (ADR-0004).
- Contar em `maxUndersteerMsBySpeed` a duração cortada pela saída da faixa: cai com a velocidade por
  geometria e mede subesterço fora do asfalto (ADR-0004).
- Campos de saída da faixa em `UNDERSTEER_ONSET` e `REAR_RECOVERY`: o contrato de API-0003 não os tem; a
  posição e o passo saem na linha `#` e o veredito vem por `observed`.
- Piloto de teste e trecho de grama ajustáveis pela etapa de código (como a rodada 5 permitia): mudariam a
  régua junto com o acerto; ficam fixos.
- Piloto do programa anterior (teto de 13 m/s): a volta não desceria de 28,35 s com acerto algum.
- Tomar como "linha de base citada" os cerca de 31 400 ms de API-0003: é o tempo de outro piloto; a linha
  de base é o mesmo ensaio (RULE-0002), e `baselineLapTimeMs` vem do bloco de `docs/physics.md`.
- Mudar o classificador `handling()` de `src/physics.ts:153-160` para chamar de subesterço o kart que sai
  de frente com a frente sem saturar: mudaria a telemetria do Realista e do HUD; o projeto dá as
  alavancas (`assistSteerAllowanceRad`, `assistLateralG`) para a frente avisar no asfalto.
- Editar os valores do candidato `ARCADE_ASSISTIDO_V5` neste estágio: são escolha da etapa de código pelos
  ensaios; as medidas desta rodada só mostram onde ele ainda não atende.
- Os itens recusados das rodadas 1, 3 e 5 continuam recusados pelos mesmos motivos.
- Nenhum requisito foi enfraquecido; nenhuma divergência resolvida; nenhum feedback a outra feature
  (`race-lap-validation` não muda). A pasta do seed e `200 Requirements/230 Output/` não foram lidas
  (conventions §12).

## 2026-10-22 — rodada 7, Mode B (relatório `reports/dspec-validation/dspec-validation-20261022-1331.md`; F-Spec 3.2.0)

**Gatilho**: o relatório FAIL `dspec-validation-20261022-1331` (`ISSUE-01` e `ISSUE-02`, erros, D3;
`ISSUE-03`, aviso, D1; `ISSUE-04`, aviso, D8; `ISSUE-05` e `ISSUE-06`, info). Depois dele o F-Spec passou a
3.2.0 (rodadas 7 e 8 do seu changelog, `status: validated`), absorvendo a decisão do dono do produto que
a `ISSUE-01` pedia ao dono do F-Spec. Decisão do autor recebida para esta rodada e carregada sem
redescoberta: no ensaio de início do subesterço (`UNDERSTEER_ONSET`, velocidade subindo no arco de 18 m),
sair da faixa abaixo de 50 km/h reprova (`OFF_ASPHALT`); sair acima de 50 km/h é o fim natural da varredura
e não reprova, desde que pelo menos duas velocidades acima de 50 km/h tenham sido medidas antes da saída;
saída antes da segunda medição acima de 50 km/h reprova por falta de medida (`MEASUREMENT_MISSING`, motivo
distinto de `OFF_ASPHALT`). Código na raiz do repositório; presets em `src/physics.ts`; benches em
`scripts/`. A pasta do seed e `200 Requirements/230 Output/` não foram lidas (conventions §12): a decisão
chega a este estágio por RULE-0002, API-0003, FLOW-0002 e FEAT-0002 3.2.0.

**Verificação do método sobre a árvore** (leitura da raiz de código, nada escrito nela): a varredura em
patamares deste projeto (patamares de 1 000 ms, passo de 0,5 m/s, acelerador regulado, esterço `+1`, anel
de raio 18 m e faixa de 11 m, `driverMass` 75) foi executada sobre `src/physics.ts` da rodada de código 1
com um script fora do repositório. `ARCADE_KART`: 808 ms de `understeer` consecutivo no patamar de 50 km/h
(V0 = 50 km/h) e saída da faixa a 51,7 km/h dentro do patamar de 51,8 km/h. Candidato
`ARCADE_ASSISTIDO_V5`: 0 ms no patamar de 50 km/h e saída a 49,3 km/h durante a subida para o patamar de
51,8 km/h, depois de 247 passos sob a condição de forçar. Os números estão em ADR-0003, ADR-0004, DES-0001 e
`98-divergences.md`; nenhum é linha de base.

**O que mudou**

- `ISSUE-01` (erro, D3 — veredito da saída da faixa e `maxUndersteerMsBySpeed` de `UNDERSTEER_ONSET`
  contra API-0003 e FLOW-0002): o projeto passa a realizar a varredura que API-0003, RULE-0002 ("Fim da
  varredura de início do subesterço"), FLOW-0002 e FEAT-0002 3.2.0 definem, em todos os sítios do fato.
  `ADR-0004` (3.0.0): Contexto com a regra do F-Spec 3.2.0 e a medida acima; decisão 2 com `plateauMs`
  1 000 e `plateauSpeedHoldMode` `THROTTLE_REGULATED` (a duração do patamar e o modo de manter a sua
  velocidade, que RULE-0002 manda registrar em `docs/physics.md`) e `entrySpeedMaxMps` como velocidade-alvo
  máxima de patamar; decisão 3 com o que vai por campo e o que vai por `observed`; decisão 8 reescrita (uma
  execução contínua no anel; subida e fase mantida por patamar; V1 e pares só de patamares completos; a
  saída decidida pela velocidade do kart no passo da saída; ordem dos motivos; os dois casos que RULE-0002
  não decide fazem a biblioteca lançar); alternativas e consequências correspondentes; `REQ-FEAT-0002-10`
  nas fontes. `DES-0004` (4.0.0): `BenchRecord` de `UNDERSTEER_ONSET` com `offAsphaltStepCount`,
  `offAsphaltFirstStep`, posição, `v1Mps` opcional e pares `[plateauSpeedMps, maxUndersteerMs]`;
  `FailReason` com `MEASUREMENT_MISSING`; `BENCH_PARAMETERS` com os dois parâmetros de patamar; `judge` com
  `observed` só para `GRASS_LOSS` e para a saída abaixo de 50 km/h em `UNDERSTEER_ONSET`; `baselineRecord`
  aceita como V0 o registro com `v1Mps`, qualquer que seja o seu `failReason`, e exige o mesmo método
  (`entrySpeedStepMps`, `plateauMs`, `plateauSpeedHoldMode`); `runBench` declara o erro dos casos sem
  decisão; linha `UNDERSTEER_ONSET` da tabela de ensaios reescrita; `NORMAL_DRIVING` agrega a varredura;
  linha `#` com a velocidade no passo da saída; tabela de falha com as saídas de `UNDERSTEER_ONSET` e os
  casos sem decisão; `REQ-FEAT-0002-10` nas fontes. `test-strategy.md` (4.0.0): regulador de velocidade e
  `baselineMarkdown()` para os patamares e para o V0 por `v1Mps`; caminhos de AC-US-0002-03, -04 e -05
  reescritos; caminho novo de AC-US-0002-06 (critério novo do F-Spec 3.2.0), por `judge` sobre registros
  sintéticos e pela varredura real; NFR-0003 e NFR-0004 com os patamares. `ADR-0003` (1.3.0): decisões 2, 3
  e 5 com o V0 tirado de `v1Mps` e o mesmo método. `DM-0001` (1.3.0): seção 4 com `MEASUREMENT_MISSING`,
  os campos de API-0003 3.1.0/3.2.0 e os parâmetros de patamar; seção 5 com a resolução de V0. `DES-0001`
  (3.2.0): alavancas `assistSteerAllowanceRad` e `forcingRampMps` descritas sobre a varredura em patamares,
  com a medida acima; `MEASUREMENT_MISSING` em Observabilidade; `REQ-FEAT-0002-10` nas fontes.
  `01-architecture.md` (2.2.0): F-Spec 3.2.0; parágrafo da revisão 3 e linha de ADR-0004 com a varredura
  em patamares. `98-divergences.md` (2.2.0): linha de REQ-FEAT-0002-04/-05/-07 passa a incluir -10, com a
  exigência nova e o `arquivo:linha` do que o as-built faz.
- Carregados nos mesmos sítios que a `ISSUE-01` reescreve, porque cada um deles afirma servir API-0003
  campo a campo e ficaria falso contra a 3.2.0: a saída da faixa da reta em `STEER_RESPONSE` deixa de
  reprovar (`DES-0004`, linha `STEER_RESPONSE` e tabela de falha; `ADR-0004`, decisão 3; `test-strategy.md`,
  AC-US-0001-06), como API-0003 e FLOW-0002 3.2.0 dizem; `REAR_RECOVERY` julga a saída da faixa pelos campos
  `offAsphaltStepCount`, `offAsphaltFirstStep` e posição que API-0003 3.1.0 lhe deu, em vez de `observed`
  (`DES-0004`; `ADR-0004`, decisão 3; `test-strategy.md`, AC-US-0003-03 e -07; `98-divergences.md`);
  `driftScore` passa a `driftScorePoints` (`DES-0004`; `test-strategy.md`, AC-US-0003-06;
  `98-divergences.md`).
- `ISSUE-02` (erro, D3 — `TEST_PILOT_LAP.sectorMs`): `DES-0004` fixa `sectorMs` em 4 inteiros sempre — na
  volta `VALID` os quatro de `LapResult.sectorMs`; na volta inválida ou não encerrada, os setores concluídos
  seguidos de `toMs(MAX_LAP_STEPS)` para cada setor não concluído, o teto de `lapTimeMs` —, também na tabela
  de falha; `test-strategy.md`, caminho de contrato de AC-US-0005-03, afirma o comprimento 4, a soma igual a
  `lapTimeMs` na volta válida e `[50000, 50000, 50000, 50000]` com um controlador parado por
  `testPilotLapWith`; `98-divergences.md`, linha de REQ-FEAT-0005-01 a -04, cita
  `scripts/handlingBench.ts:384-385`.
- `ISSUE-03` (aviso, D1): `01-architecture.md`, mensagem `M-->>J` do primeiro `sequenceDiagram`, com `,` no
  lugar de `;`.
- `ISSUE-04` (aviso, D8): E2E-02 passa a esperar `—` ao trocar de acerto e ao voltar ao Arcade (a troca
  zera `bestRecord`, `DES-0006`), e só o tempo da volta do Realista depois de completá-la; `DES-0006` fica
  como está.
- `ISSUE-05` e `ISSUE-06` (info): nada a mudar, como o relatório diz.
- Versões: `ADR-0004` 3.0.0, `DES-0004` 4.0.0, `test-strategy.md` 4.0.0, `ADR-0003` 1.3.0, `DM-0001` 1.3.0,
  `DES-0001` 3.2.0, `01-architecture.md` 2.2.0, `98-divergences.md` 2.2.0, este changelog 2.2.0. Intocados:
  `DES-0002`, `DES-0003`, `DES-0005`, `DES-0006`, `DES-0007`, `DES-0008`, `ADR-0001`, `ADR-0002`,
  `ADR-0005`. `00-index.md` e `99-traceability.md` não foram escritos: o gate os regenera com
  `lint_artifacts.py --emit`.

**Superfície (conventions §16)**: nenhum módulo, item de projeto, ADR, modelo de dados, tabela, endpoint,
tela ou componente acrescentado. Os elementos novos nas interfaces existentes são os que o contrato a montante
já carrega e que a `ISSUE-01` manda servir campo a campo: o valor `MEASUREMENT_MISSING` (API-0003 3.1.0), os
campos de saída da faixa de `UNDERSTEER_ONSET` e `REAR_RECOVERY` (API-0003 3.1.0), o elemento
`plateauSpeedMps` do par (API-0003 3.1.0, renomeado na mudança de significado), `v1Mps` condicional e
`driftScorePoints` (API-0003 3.2.0, renomeação); e os parâmetros `plateauMs` e `plateauSpeedHoldMode`, a
duração do patamar e o modo de manter a sua velocidade que RULE-0002 3.2.0 nomeia como parâmetros de ensaio
registrados em `docs/physics.md` (AC-US-0002-04). Nada além do que o F-Spec 3.2.0 nomeia.

**Tabela de migração** (conventions §17): 8 DES, 1 DM e 5 ADR antes e depois. Requisitos `REQ-*`
realizados: 61 antes, 62 depois (`REQ-FEAT-0002-10`, novo no F-Spec 3.2.0); critérios `AC-*` com caminho de
teste: 31 antes, 32 depois (AC-US-0002-06); 9 NFR antes e depois; 17 divergências antes e depois (quatro
linhas com exigência ou `arquivo:linha` atualizados). Nenhum caminho de critério retirado. Modificados:
`UNDERSTEER_ONSET` passa de uma execução por velocidade de entrada a uma varredura contínua em patamares; o
ramo "teto atingido sem V1 → `THRESHOLD_EXCEEDED`" e o ramo "saída depois de V1 encerra sem falha" deixam de
existir (substituídos pela decisão de RULE-0002 e pelo erro dos casos sem decisão); `observed` deixa de
valer para `STEER_RESPONSE` (sem efeito) e para `REAR_RECOVERY` (campos); no caminho de AC-US-0001-06, a
afirmação "nenhum passo do traço tem `surface` `GRASS`" sai, porque API-0003 3.2.0 diz que essa saída não
altera o veredito, e entra a afirmação de que um registro julgado com `observed` continua `PASS`; no
caminho de AC-US-0003-03, `observed` `OFF_ASPHALT` é trocado pelos campos. Parâmetros de ensaio: dois
acrescentados (`plateauMs`, `plateauSpeedHoldMode`); `entrySpeedMaxMps` mantém nome e valor e passa a ser
a velocidade-alvo máxima de patamar; nenhum outro valor muda.

**Itens fechados**: `ISSUE-01`, `ISSUE-02`, `ISSUE-03`, `ISSUE-04` de `dspec-validation-20261022-1331`;
`ISSUE-05` e `ISSUE-06` sem mudança. Nenhum `FB-<nn>` pendente.

**Itens recusados, com motivo**

- Primeira alternativa da `ISSUE-01` (toda saída da faixa em `UNDERSTEER_ONSET` como `OFF_ASPHALT`, com um
  fim de varredura independente do acerto): não tomada. A segunda alternativa ocorreu a montante — o F-Spec
  3.2.0 passou a admitir o fim da varredura pela saída da faixa acima de 50 km/h —, e o projeto a segue.
- Alternativa da `ISSUE-04` (`DES-0006` deixar de zerar `bestRecord` na troca de acerto): não tomada. Os
  zeramentos de `src/main.ts:226` (peso) e `:233` (acerto) ficam como estão; o de peso é necessário porque
  `compareLapRecords` não vê o peso do piloto, e com um único `bestRecord` sem zeramento o tempo do Arcade
  ficaria guardado enquanto o do Realista nunca seria mostrado. A correção menor é o roteiro esperar `—`.
- Veredito para os dois casos que RULE-0002 não decide (saída exatamente a 50 km/h; varredura sem saída da
  faixa): não inventado. A biblioteca lança e nenhum registro é emitido (ADR-0004, decisão 8). Proposta ao
  autor para `SCOPE-BACKLOG.md`: "2026-10-22 dspec-loop rodada 7 — `UNDERSTEER_ONSET`: que resultado tem a
  varredura que termina sem sair da faixa (último patamar concluído, ou velocidade que deixa de subir)?"; a
  proposta da rodada 7 dos requisitos sobre a saída exatamente a 50 km/h segue valendo.
- Velocidade do kart no passo da saída como campo de `UNDERSTEER_ONSET`: não acrescentada (não é campo de
  API-0003; seria superfície numa rodada de correção, §16); vai para a linha `#` e chega a `judge` por
  `observed`. A proposta de `SCOPE-BACKLOG.md` da rodada 7 do F-Spec sobre esse campo segue com o autor.
- Acelerador parcial para manter o patamar sem a condição de forçar: recusado (em `BINARY` o acelerador é 0
  ou 1, e o ensaio usa a forma de `Input` do adaptador); a consequência para o acerto está em ADR-0004 e
  DES-0001 (`forcingRampMps`).
- Janela própria para a subida de cada patamar: recusada (parâmetro a mais); o critério e o teto de
  `TOP_SPEED` dizem quando a velocidade deixou de crescer.
- Os itens recusados das rodadas 1, 3, 5 e 6 continuam recusados pelos mesmos motivos, salvo dois da rodada
  6 que o F-Spec 3.1.0/3.2.0 superou: "toda saída da faixa em `UNDERSTEER_ONSET` como `OFF_ASPHALT`" (agora
  decidida por RULE-0002 pela velocidade no passo da saída) e "campos de saída da faixa em `UNDERSTEER_ONSET`
  e `REAR_RECOVERY`" (agora campos de API-0003, servidos acima).
- Nenhum requisito foi enfraquecido; nenhuma divergência resolvida ou acrescentada; nenhum feedback a outra
  feature (`race-lap-validation` não muda).
