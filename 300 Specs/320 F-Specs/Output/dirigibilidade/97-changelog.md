---
title: Registro de mudanças — dirigibilidade do Arcade assistido
feature: dirigibilidade
stage: fspec
status: validated
version: 3.2.0
sources: []
---

# Registro de mudanças

## 2026-10-21 — rodada 1, Mode A

**O que mudou**

- Conjunto gerado do zero a partir dos requisitos validados de `200 Requirements/230 Output/dirigibilidade/`
  (US-0001 a US-0005, NFR-0001 a NFR-0009; seed `revision: 1`; `DOMAIN.md` com REF-01 e DEC-01 a DEC-09,
  rótulos de `01-context.md` daquele conjunto), com as decisões que o autor passou a esta rodada: requisitos
  validados em `req-validation-20261021-1627` (SUCCESS); as sete questões em aberto do seed (resposta do
  volante, velocidade de curva, limite de subesterço, recuperação, aceleração, velocidade de reta e volta do
  piloto de teste) fechadas em `DOMAIN.md` (DEC-01 a DEC-07); o ensaio de resposta do volante mede só a
  guinada e `understeer` transitório nele é aceitável (DEC-09); a oitava questão (rodada de teste do dono
  do produto, DEC-08) é critério humano final e não bloqueia.
- Seis funcionalidades (`FEAT-0001` a `FEAT-0006`), três fluxos (`FLOW-0001` a `FLOW-0003`), três contratos
  (`API-0001` a `API-0003`), duas telas (`SCR-0001`, `SCR-0002`) e três regras (`RULE-0001` a `RULE-0003`).
- Todo critério `AC-*` dos requisitos (31) e todo NFR (9) é realizado por ao menos um requisito: US-0001 a
  US-0004 em `FEAT-0001` a `FEAT-0004`; US-0005, NFR-0001 e NFR-0009 em `FEAT-0005`; NFR-0002 a NFR-0008 em
  `FEAT-0006`.
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os gera com `lint_artifacts.py --emit`.

**Decisões de forma registradas**

- Não existe API de rede no MVP (diretrizes do estágio). Os contratos de `api/` são contratos em processo
  (telemetria lida pelo HUD e pelos ensaios; dado publicado e registros lidos localmente; saída dos
  ensaios), com o único papel `player` (anônimo), erros como códigos de rejeição e idempotência por leitura
  pura. Nomes de campo em `camelCase` com unidade no sufixo (D-FS-06), no lugar do `snake_case` padrão da
  habilidade do gerador: a diretriz do projeto prevalece.
- A versão do acerto é declarada por campo próprio (`setupVersion`, `previousSetupVersion`, `setupId`) e
  não por `trackVersion`: os requisitos admitem as duas formas (critério 04 de US-0005) e o dado de pista
  não muda (NFR-0008).
- Os valores do estado de aderência (`grip`, `understeer`, `oversteer`, `sliding`) ficam em minúsculas,
  como os requisitos os nomeiam; renomeá-los seria refatoração que os requisitos não pedem (I10). Os enums
  novos deste conjunto são em maiúsculas.
- A saída dos ensaios é contrato (`API-0003`, com `benchId` por ensaio) porque os critérios nomeiam a
  saída de `npm test` e dos benches como ponto de observação; a serialização é decisão de projeto. Os
  campos em km/h e s seguem a unidade que os critérios fixam, com a nota na tabela; a telemetria por passo
  (`API-0001`) usa SI (m/s, rad, rad/s).
- Os campos `setupId` e `setupVersion` acrescentados ao resultado da volta, ao replay e ao texto
  compartilhado são aditivos e opcionais na leitura; os contratos de `race-lap-validation` (resultado,
  comandos, dado de pista) são nomeados e não redefinidos nem editados. Nenhum feedback foi enviado àquela
  feature: nenhum requisito dela precisa mudar (como os requisitos desta feature já registram), e o
  acréscimo aditivo é desta feature (I3).
- Parâmetros que os requisitos deixaram ao ensaio (janela de estabilização do regime, acelerador mantido
  no ensaio de resposta, incremento de velocidade de entrada) são campos reportados de `API-0003` e
  registrados em `docs/physics.md`, nunca limiares nem configuração.

**Itens fechados**: nenhum `ISSUE-<nn>` ou `FB-<nn>` (primeira geração).

**Itens recusados, com motivo**

- Limite de resposta para inversão do esterço; limite de recuperação para redução parcial do esterço;
  magnitude da perda na parede; perda na grama abaixo de 45 km/h ou com esterço diferente de 0; limite de
  subesterço com esterço parcial: os requisitos recusaram decidi-los (changelog daquele conjunto, rodadas
  1 e 3) e nenhum critério os pede; esta especificação não os decide e os lista em "Lacunas deliberadas" de
  `01-overview.md`.
- Valor concreto do identificador `setupVersion` e forma de serialização da saída dos ensaios: decisões de
  projeto (D-Spec); o F-Spec fixa só as restrições (diferente da anterior; não vazio; campos e unidades).
- Textos novos de tela (rótulo de "outra versão", mensagem de replay não suportado): nenhum critério fixa
  texto novo e os requisitos dispensaram idioma e acessibilidade como requisito novo; a tela exibe o
  próprio valor de `setupVersion` e nunca a comparação, sem rótulo novo.
- Rodada de teste do dono do produto (`DOMAIN/DEC-08`): condição humana de fechamento, não critério;
  registrada em `01-overview.md` e em `FEAT-0005`.
- Divergências com o sistema em execução: nenhuma registrada. Esta etapa não lê a raiz de código para
  derivar comportamento (conventions §12); apenas os nomes de presets, campos de telemetria e scripts de
  bench foram consultados para não colidir com eles.
- `NOTES.md` da pasta do seed não foi lido (fora da lista de entrada da etapa); `SEED.md` e `DOMAIN.md`
  foram consultados só para escopo, restrições e as decisões que os requisitos já citam.

## 2026-10-21 — rodada 2, Mode B (gate determinístico, 3 erros G5)

**O que mudou**

- Só este arquivo. A entrada da rodada 1 citava os pontos em aberto do seed pelo identificador literal
  ao registrar que o dono do produto os fechou; o gate lê cada identificador desse tipo como item em
  aberto carregado adiante (G5). As três menções (ISSUE-01: primeiro ponto, ISSUE-02: sétimo ponto,
  ISSUE-03: oitavo ponto) foram reescritas em prosa, referindo cada decisão pelo rótulo `DOMAIN/DEC-nn`
  que os requisitos usam (`01-context.md` daquele conjunto, DEC-01 a DEC-08 fecham o ponto de mesmo
  número; DEC-09 não tem ponto próprio). Nenhum ponto em aberto existe neste conjunto: todos estão
  fechados em `DOMAIN.md`, e o oitavo é critério humano final, registrado em `01-overview.md` e
  `FEAT-0005`, não item carregado.
- Nenhum requisito, contrato, campo, tela ou regra foi tocado (conventions §16).

**Itens fechados**: ISSUE-01, ISSUE-02, ISSUE-03.

**Itens recusados, com motivo**: nenhum.

## 2026-10-21 — rodada 3, Mode B (fspec-validation-20261021-1647: 2 erros, 1 aviso)

**O que mudou**

- ISSUE-01 (`API-0003`, D-FS-06): os campos medidos em km/h e em segundos passam a SI com a unidade no
  sufixo, como `speedMps` e `lapMs` — `entrySpeedKmh` → `entrySpeedMps` (em `REFERENCE_CORNER`,
  `GRASS_LOSS` e nos pares de `maxUndersteerMsBySpeed`), `v0Kmh` → `v0Mps`, `v1Kmh` → `v1Mps`,
  `entrySpeedStepKmh` → `entrySpeedStepMps`, `zeroToSixtyKmhS` → `zeroToSixtyKmhMs` (inteiro, ms),
  `topSpeedKmh` → `topSpeedMps`, `speedAfterOneSKmh` → `speedAfterOneSMps`, `speedBeforeContactKmh` /
  `speedAfterContactKmh` → `speedBeforeContactMps` / `speedAfterContactMps`. O cabeçalho do contrato e
  cada linha afetada dizem que a saída serializada e `docs/physics.md` apresentam o valor também em km/h
  ou s porque os critérios de US-0002 e US-0004 nomeiam essas unidades como ponto de observação
  (AC-US-0004-07); a apresentação não é campo do contrato. A decisão de forma da rodada 1 ("os campos em
  km/h e s seguem a unidade que os critérios fixam") fica superada por esta: a diretriz do projeto prevalece
  sobre a regra 1 da política de contrato da habilidade. Nomes novos carregados a todos os sítios:
  `RULE-0002` (tabela de ensaios e nota de conversão dos limiares após a tabela de limiares), `FEAT-0002`
  REQ-06, Configuração e critérios de aceite, `FEAT-0004` REQ-07 e critérios de aceite, `FEAT-0006` REQ-08
  e `02-glossary.md` (linha de `benchId`). O contrato é novo (Compatibilidade de `API-0003`): nenhum campo
  publicado é renomeado, logo nenhuma regra de rejeição é necessária. Nenhum requisito, ensaio ou limiar
  acrescentado.
- ISSUE-02 (`97-changelog.md`): a frase de layout de código da entrada da rodada 1 foi removida; esta
  etapa não decide nem registra layout de código.
- ISSUE-03 (`RULE-0001`): a frase sobre a curva de referência com acelerador cheio deixa de afirmar que
  todos os passos são condução normal; passa a dizer que a exigência de `grip` ou `understeer` em todos os
  passos vem de AC-US-0003-01 (REQ-FEAT-0003-02) e vale qualquer que seja a classe do passo, e que a regra
  só garante a classe de condução normal no passo de entrada — um passo posterior acima de 45 km/h é
  "Forçando" pela definição de `forcing`.
- Versões: `API-0003` 1.1.0; `RULE-0001`, `RULE-0002`, `FEAT-0002`, `FEAT-0004`, `FEAT-0006`,
  `02-glossary.md` 1.0.1. `00-index.md` e `99-traceability.md` não foram escritos: o gate os regenera.
- Nenhum requisito, contrato, campo novo, tela ou elemento de interface foi acrescentado (conventions §16);
  os renomes são de campos que o contrato já carregava.

**Itens fechados**: ISSUE-01, ISSUE-02, ISSUE-03.

**Itens recusados, com motivo**

- Registro da restrição do seed sobre os presets como `SEED/RE-01` via NFR-0005 (sugestão alternativa de
  ISSUE-02): não adotado, porque a frase foi removida inteira e NFR-0005 já é realizado por
  REQ-FEAT-0006-01/02, que citam a restrição sem caminho de código.
- FB-01 enviado a `race-lap-validation` (item de escopo do relatório, fora do veredito): não é item desta
  feature; cabe àquela feature julgá-lo na sua próxima rodada. Os campos `setupId` e `setupVersion` de
  `API-0002` permanecem como estão, opcionais na leitura e aditivos.

## 2026-10-21 — rodada 4, Mode B (gate determinístico, 2 erros G4)

**O que mudou**

- ISSUE-01 e ISSUE-02 (`RULE-0001`, G4): a frase acrescentada na rodada 3 citava o requisito 02 de
  `FEAT-0003` pelo identificador literal `REQ-…`; o gate lê todo identificador desse tipo fora de um
  arquivo `FEAT-*` como definição de requisito filho — daí "filho de FEAT-0003 em arquivo RULE-0001"
  (ISSUE-01) e "já definido em FEAT-0003" (ISSUE-02). A citação foi reescrita como "requisito 02 de
  FEAT-0003", com link relativo ao arquivo da funcionalidade. O requisito continua definido só em
  `FEAT-0003`; o sentido da frase (a exigência de `grip` ou `understeer` em todos os passos da curva de
  referência vem de AC-US-0003-01, qualquer que seja a classe do passo) não muda. Nenhum outro arquivo de
  `rules/`, `api/`, `flows/` ou `screens/` carrega identificador de requisito filho.
- Versão: `RULE-0001` 1.0.2. `00-index.md` e `99-traceability.md` não foram escritos: o gate os regenera.
- Nenhum requisito, contrato, campo, tela, regra ou elemento de interface foi acrescentado ou alterado
  (conventions §16).

**Itens fechados**: ISSUE-01, ISSUE-02.

**Itens recusados, com motivo**: nenhum.

## 2026-10-21 — rodada 5, Mode A (requisitos 2.0.0, seed `revision: 2`, acerto agressivo de `DOMAIN.md`)

**Gatilho**: o conjunto de requisitos passou a 2.0.0 contra o seed `revision: 2` (validado em
`req-validation-20261021-1742`, SUCCESS). Esta especificação era da revisão 1 e foi regenerada contra a
revisão 2, com as decisões que o autor passou a esta rodada carregadas sem redescoberta: acerto agressivo
(`DOMAIN/REF-02`): 180 ms / 250 ms de resposta do volante; 50 km/h na curva de referência de raio 18 m;
200 ms e 400 ms mantidos; 0–60 km/h em 2,5 s; velocidade estabilizada de pelo menos 105 km/h; volta do
piloto de teste em no máximo 25 s; o ensaio de resposta do volante mede só a guinada (`DOMAIN/DEC-09`);
ciclo do critério humano final = staging + feedback curto do dono do produto, sem preset experimental extra
(`DOMAIN/DEC-10`).

**O que mudou**

- Todos os sítios dos cinco limites substituídos foram carregados, não só o primeiro: `01-overview.md`
  (tabela por canal, lacunas deliberadas, verificação), `02-glossary.md` (condição de forçar e curva de
  referência a 50 km/h), `FEAT-0001` (requisitos 01 a 04, comportamento, critérios), `FEAT-0002`
  (requisitos 01 a 03, comportamento, critérios), `FEAT-0003` (resumo, canais, requisito 02), `FEAT-0004`
  (requisitos 01, 02, 04, 08, comportamento, critérios: 2,5 s, 105 km/h, grama a 50 km/h e abaixo de
  50 km/h), `FEAT-0005` (requisitos 04 e 11, comportamento, critérios: 25 000 ms), `FLOW-0002` (estado
  inicial dos ensaios; tempo acima de 25 s), `API-0003` (`entrySpeedMps` 13,89 m/s = 50 km/h em
  `REFERENCE_CORNER` e `GRASS_LOSS`), `RULE-0001` (condição de forçar acima de 50 km/h; passo de entrada da
  curva de referência a 50 km/h) e `RULE-0002` (tabela de limiares e tabela de ensaios: `STEER_RESPONSE`
  180/250 ms; `REFERENCE_CORNER`, `UNDERSTEER_ONSET`, `REAR_RECOVERY`, `GRASS_LOSS` a 50 km/h;
  `ACCELERATION` 2 500 ms; `TOP_SPEED` 105/3,6 m/s; `TEST_PILOT_LAP` 25 000 ms). Todos a 2.0.0.
- `01-overview.md`: cita `DOMAIN/DEC-10` e `DOMAIN/REF-02`; descreve o ciclo em staging como condição
  humana de fechamento, com cada rodada de presets sendo nova versão de acerto e sem preset experimental no
  painel. `02-glossary.md`: termos "Acerto agressivo" e "Staging", como no glossário dos requisitos.
- `FEAT-0005`: linha de comportamento "Rodada de acerto reprovada pelo dono do produto em staging"
  (caso anormal novo de US-0005, `DOMAIN/DEC-10`): os requisitos valem sem mudança para a rodada seguinte,
  que é nova `setupVersion` e repete todos os ensaios; Configuração diz que nenhum preset experimental
  extra é exposto no painel. `FLOW-0002`: linha correspondente na tabela de alternativas. `RULE-0003`
  (1.1.0): cada rodada de presets que altera um parâmetro é nova `setupVersion`, a reprovada passa a
  `SUPERSEDED`, e um replay de uma rodada não é comparável com a seguinte. Nenhum critério novo: o veredito
  do dono do produto não é observável pelo sistema.
- "Bench de física" no lugar do nome do script nos sítios que o nomeavam (`01-overview.md`, `FEAT-0004`
  requisito 07 e critérios, `FLOW-0002`, `API-0003`), como os requisitos 2.0.0 passaram a dizer
  (US-0004 critério 07, NFR-0002, NFR-0004, NFR-0007); `npm run bench:handling` e `npm test` continuam
  nomeados porque os critérios os nomeiam.
- ISSUE-01 (aviso) de `fspec-validation-20261021-1656`: a entrada da rodada 3 deste changelog deixa de
  reproduzir os caminhos de código da frase removida.
- Sem mudança de conteúdo, carregados na versão corrente: `API-0001`, `API-0002`, `FEAT-0006`,
  `FLOW-0001`, `FLOW-0003`, `SCR-0001`, `SCR-0002`, `98-divergences.md` (nenhum número da revisão 2 os
  atinge; `FEAT-0006` realiza NFR-0002, 0004 e 0007, cuja mudança foi só de nomenclatura do bench, que
  aquele arquivo não nomeava).
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os regenera com `lint_artifacts.py --emit`.

**Tabela de migração** (conventions §17): nenhum requisito, contrato, campo, tela, regra ou ensaio retirado
ou acrescentado. Seis funcionalidades, três fluxos, três contratos, duas telas e três regras antes e
depois; 31 critérios `AC-*` e 9 NFRs realizados antes e depois; só valores numéricos, referências e a
descrição do ciclo humano mudaram.

**Itens fechados**: nenhum `ISSUE-<nn>`/`FB-<nn>` pendente (o último relatório era SUCCESS); a ISSUE-01
(aviso) daquele relatório foi aplicada. Divergências registradas: nenhuma.

**Itens recusados, com motivo**

- A decisão do autor sobre o layout do repositório (onde ficam o código, os presets e os benches): não
  escrita em nenhum arquivo desta especificação (F8: esta etapa não decide nem registra layout de código);
  fica como contexto para `300 Specs/330 D-Specs`, que o autor pediu para reprocessar contra a revisão 2.
- Os valores da revisão 1 (250/300 ms, 45 km/h, 3,0 s, 95 km/h, 27 s) não permanecem como critério
  alternativo nem como piso: os requisitos dizem "substitui".
- Nenhum critério de aceite nem campo de `API-0003` para o veredito do dono do produto em staging: não é
  observável pelo sistema (`DOMAIN/DEC-08`, `DOMAIN/DEC-10`); o ciclo só impõe nova `setupVersion` por
  rodada, que já é exigência de `RULE-0003`.
- Valor concreto de cada `setupVersion` por rodada de staging: decisão de projeto (D-Spec), como na
  rodada 1.
- Os itens recusados da rodada 1 continuam recusados pelos mesmos motivos (inversão do esterço; recuperação
  com esterço parcial; magnitude da perda na parede; grama abaixo de 50 km/h ou com esterço diferente de 0;
  subesterço com esterço parcial; textos novos de tela).
- `NOTES.md`, `SEED.md` e `DOMAIN.md` da pasta do seed não foram lidos nesta rodada: os requisitos 2.0.0 já
  carregam os rótulos `DOMAIN/REF-02` e `DOMAIN/DEC-10` com o seu conteúdo, e as decisões do autor vieram
  com a invocação.

## 2026-10-21 — rodada 6, Mode A (requisitos 3.0.0, seed `revision: 3`, correção de fato e método dos ensaios)

**Gatilho**: o conjunto de requisitos passou a 3.0.0 contra o seed `revision: 3` (validado em
`req-validation-20261021-1837`, SUCCESS), depois do FAIL SPEC da etapa de código
(`300 Specs/330 D-Specs/Output/dirigibilidade/reports/feedback/feedback-20261021-1827.md`): a pista
sintética não tem curva de raio 18 m (raios mínimos 24 m e 25 m, grampo de 4 m) e o regime da resposta do
volante com acelerador 0 não é estacionário. Nenhum limiar mudou. Decisões do autor recebidas para esta
rodada e carregadas sem redescoberta: a curva de referência é um ensaio em pista de teste (arco de raio
18 m, faixa da largura da pista, sem paredes, ambiente de ensaio próprio); o ensaio de resposta do volante
roda em reta com a velocidade mantida em 50 km/h pelo acelerador e o regime é o valor estabilizado nessa
condição (janela curta e estacionária); só a volta do piloto de teste usa a pista sintética; o código
parcial existente pode ser lido pelo D-Spec como as-built, mas o projeto vence.

**O que mudou**

- `01-overview.md` (3.0.0): parágrafo "Onde cada ensaio roda" (`SEED/RD-06`, `DOMAIN/REF-03`); linha de
  canal para os ensaios na pista de teste; decisões de forma novas (pista de teste como ambiente de ensaio
  `TEST_PAD` com `surface` `GRASS` fora da faixa e sem parede; recuperação como classe de passo própria);
  lacunas deliberadas novas (modo de manter a velocidade, faixa tolerada e janela como parâmetros de
  ensaio; largura da faixa e comprimento do arco; ambiente dos ensaios de 0–60 km/h e velocidade
  estabilizada).
- `02-glossary.md` (3.0.0): termos "Ambiente de ensaio", "Pista de teste", "Velocidade mantida",
  "Recuperação" (novos); "Pista sintética" (raios reais, sem curva de 18 m), "Curva de referência",
  "Regime da taxa de guinada", "Velocidade de início do subesterço", "Linha de base", "Ensaio",
  "Condição de forçar", "Condução normal" (exclui a recuperação), "Grama", "Parede"; enums e campos
  novos `benchEnvironment`, `speedHoldMode`, `speedMinMps`, `speedMaxMps`, `speedHoldBandMps`,
  `targetSpeedMps`; `failReason` com `SPEED_NOT_HELD`; `arcRadiusM` e `laneWidthM` na linha de `benchId`.
- `FEAT-0001` (3.0.0): requisitos 01 a 04 em reta da pista de teste com a velocidade mantida em 50 km/h
  pelo acelerador e regime estacionário; requisito 05 cita o arco da pista de teste; requisito 06 exige
  `benchEnvironment`, `steadyYawRateRadPerS`, `speedMinMps`, `speedMaxMps` e `speedHoldMode`; requisito
  09 novo (velocidade não mantida: `FAIL` com `SPEED_NOT_HELD`, caso anormal novo de US-0001); Canais diz
  que o Jogador não pilota na pista de teste.
- `FEAT-0002` (3.0.0): curva de referência como arco de raio 18 m da pista de teste em todos os
  requisitos; requisito 03 passa a "dentro da faixa de asfalto do arco"; requisito 04 exige linha de base
  no mesmo ensaio e no mesmo arco; requisito 06 exige `benchEnvironment`, `arcRadiusM` e `laneWidthM`;
  requisito 07 trata linha de base de outro ambiente ou arco como ausente; requisito 09 novo (saída da
  faixa: `OFF_ASPHALT` com passo e posição, caso anormal "Kart sai da faixa de asfalto do arco", que
  substitui "Grama ou parede durante a curva").
- `FEAT-0003` (3.0.0): a recuperação excluída da condução normal nos requisitos 01, 03 e 06 (critérios 01,
  02 e 05 de US-0003); requisito 02 cita o arco da pista de teste; requisito 05 "em nenhum passo da
  recuperação"; requisito 08 exige `benchEnvironment`, `normalDrivingStepCount` e
  `excludedRecoveryStepCount`; requisito 12 novo (recuperação que não volta a `grip` em 400 ms: `FAIL`,
  tempo até o primeiro `grip` ou `gripReached` falso, passos excedentes contados como condução normal —
  caso anormal novo de US-0003). Isso responde, no nível funcional, ao SPEC-ISSUE-06 do feedback do
  código: os passos de recuperação não entram em `NORMAL_DRIVING`.
- `FEAT-0004` (2.1.0): requisito 07 e critério exigem `benchEnvironment`; Configuração registra que o
  ambiente de 0–60 km/h e velocidade estabilizada é reportado e que grama e parede rodam na pista
  sintética por necessidade. `FEAT-0005` (2.1.0): Canais diz que a volta do piloto de teste é o único
  ensaio na pista sintética (raios reais); requisito 03 e critério exigem `benchEnvironment`
  `SYNTHETIC_TRACK`. `FEAT-0006` (2.0.0): requisito 08 e critério exigem na entrada de `docs/physics.md` a
  `setupVersion`, o ambiente de cada ensaio e os parâmetros novos (NFR-0004 3.0.0).
- `FLOW-0001` (1.1.0): passo 4 classifica também a recuperação. `FLOW-0002` (3.0.0): diagrama e passos com
  ambiente, linha de base do mesmo ensaio e acelerador que mantém a velocidade; alternativas novas
  (velocidade não mantida; saída da faixa no arco e na recuperação; recuperação sem `grip` em 400 ms;
  linha de base de outro ambiente ou arco); passo 5 diz "velocidades em m/s, apresentadas também em km/h"
  (ISSUE-01, aviso, de `fspec-validation-20261021-1750`, fechada).
- `API-0001` (1.1.0): linha `speedMps` diz que os ensaios reportam em m/s, apresentados também em km/h
  (ISSUE-02, aviso, do mesmo relatório, fechada); linhas `surface` e `wallContact` dizem o que valem na
  pista de teste.
- `API-0003` (3.0.0): campo `benchEnvironment` em todo registro; `STEER_RESPONSE` com `targetSpeedMps`,
  `speedHoldMode`, `speedHoldBandMps`, `speedMinMps`, `speedMaxMps` e `throttleInputNorm` condicional ao
  modo constante; `REFERENCE_CORNER`, `UNDERSTEER_ONSET` e `REAR_RECOVERY` com `arcRadiusM` e
  `laneWidthM`; `REFERENCE_CORNER` com passo e posição da saída; `NORMAL_DRIVING` com
  `normalDrivingStepCount` e `excludedRecoveryStepCount`; `REAR_RECOVERY` com `gripReached` e `recoveryMs`
  condicional; `failReason` `SPEED_NOT_HELD`; tabela de erros e Compatibilidade atualizadas (os dois
  campos que passam a condicionais mantêm nome, unidade e significado; o contrato não tem registro
  publicado).
- `RULE-0001` (3.0.0): classe "Recuperação" na classificação do passo, definida pelo passo de soltura,
  pela ausência de `grip` e pelo limite de 400 ms; depois de 400 ms sem `grip` os passos são condução
  normal e falham; curva de referência na pista de teste; o que a regra não julga inclui "fora da faixa"
  na pista de teste.
- `RULE-0002` (3.0.0): seção "Ambientes de ensaio" (`TEST_PAD` e `SYNTHETIC_TRACK`, geometria por ensaio,
  grama e parede só na pista sintética, ambiente de `ACCELERATION`/`TOP_SPEED` reportado); coluna
  Ambiente na tabela de ensaios; `STEER_RESPONSE` com velocidade mantida e regime na janela estacionária;
  `REFERENCE_CORNER`, `UNDERSTEER_ONSET` e `REAR_RECOVERY` no arco de raio 18 m da pista de teste;
  `NORMAL_DRIVING` exclui a recuperação; `TEST_PILOT_LAP`, `GRASS_LOSS`, `WALL_CONTACT` e `STEP_COST` na
  pista sintética; linha de base só do mesmo ensaio, ambiente e geometria; idempotência do acelerador
  regulado.
- `97-changelog.md`: a entrada da rodada 5 deixa de reproduzir os caminhos de código da decisão do autor
  (ISSUE-03, aviso, de `fspec-validation-20261021-1750`, fechada).
- Sem mudança de conteúdo, carregados na versão corrente: `FLOW-0003`, `API-0002`, `RULE-0003`,
  `SCR-0001`, `SCR-0002`, `98-divergences.md` (nenhum item da revisão 3 os atinge: versão do acerto,
  comparabilidade, leitura de replay e as duas telas não mudam com o ambiente dos ensaios).
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os regenera com `lint_artifacts.py --emit`.

**Tabela de migração** (conventions §17): nenhum requisito, contrato, campo, tela, regra ou ensaio retirado.
Seis funcionalidades, três fluxos, três contratos, duas telas e três regras antes e depois; 31 critérios
`AC-*` e 9 NFRs realizados antes e depois. Requisitos funcionais: 58 antes, 61 depois (novos: requisito
09 de `FEAT-0001`, requisito 09 de `FEAT-0002`, requisito 12 de `FEAT-0003`, cada um realizando um caso
anormal novo dos requisitos 3.0.0). Campos de contrato acrescentados (aditivos) listados acima; dois
campos passam de obrigatórios a condicionais sem mudar nome, unidade ou significado.

**Itens fechados**: ISSUE-01, ISSUE-02 e ISSUE-03 (avisos) de `fspec-validation-20261021-1750`. Nenhum
`FB-<nn>` pendente para esta feature. Divergências registradas: nenhuma.

**Itens recusados, com motivo**

- SPEC-ISSUE-01 e SPEC-ISSUE-02 do feedback do código: fechados pelo seed (revisão 3) e pelos requisitos
  3.0.0, carregados acima como ambiente `TEST_PAD`, arco de raio 18 m, velocidade mantida e regime
  estacionário; o modo concreto de manter a velocidade (acelerador constante ou regulado) e a janela não
  são fixados aqui — são parâmetros de ensaio reportados (`speedHoldMode`, `speedHoldBandMps`,
  `settleWindowMs`), como os requisitos decidiram; a escolha concreta fica ao D-Spec.
- SPEC-ISSUE-03 (origem dos registros antigos do ensaio de versão), SPEC-ISSUE-04 (entrada do Realista
  nas opções do bench) e SPEC-ISSUE-05 (literal do estado inicial de `surface`): interface e desenho de
  projeto, sem critério funcional que os fixe; os requisitos 3.0.0 também os recusaram. `API-0003` já diz
  o que `SETUP_VERSION` e `REALISTA_UNCHANGED` reportam, e `API-0001` já diz os valores iniciais dos
  demais campos; o valor inicial de `surface` antes do sinal verde não é critério (AC-US-0004-06 vale do
  sinal verde ao fim da volta) e fica ao D-Spec, como o autor decidiu.
- Decisão do autor sobre o layout do repositório e sobre ler o código parcial como as-built: não escrita
  em nenhum arquivo desta especificação (F8); esta etapa não leu a raiz de código para derivar
  comportamento (conventions §12); apenas os nomes do ambiente de ensaio e da largura da pista foram
  consultados para reutilizá-los sem colisão (`TEST_PAD`).
- Tolerância numérica da faixa de velocidade mantida, largura numérica da faixa e comprimento do arco:
  não fixados; os requisitos os recusaram como limiares e esta especificação os reporta como parâmetros
  (`speedHoldBandMps`, `laneWidthM`; o comprimento do arco é o necessário para o ensaio e não é campo).
- Ambiente dos ensaios de 0–60 km/h e de velocidade estabilizada: não fixado; `benchEnvironment` é
  reportado. A proposta de `SCOPE-BACKLOG.md` dos requisitos (rodada 6) segue valendo.
- Os itens recusados das rodadas 1 e 5 continuam recusados pelos mesmos motivos (inversão do esterço;
  recuperação com esterço parcial; magnitude da perda na parede; grama abaixo de 50 km/h ou com esterço
  diferente de 0; subesterço com esterço parcial; textos novos de tela; valores da revisão 1 não
  permanecem como piso; valor concreto de `setupVersion`).
- `NOTES.md`, `SEED.md` e `DOMAIN.md` da pasta do seed não foram lidos nesta rodada: os requisitos 3.0.0 já
  carregam os rótulos `SEED/RD-06` e `DOMAIN/REF-03` com o seu conteúdo, e as decisões do autor vieram
  com a invocação.

## 2026-10-22 — rodada 7, Mode B (fspec-validation-20261022-1359: 1 erro, 3 avisos; requisitos 3.2.0)

**Gatilho**: o relatório FAIL `fspec-validation-20261022-1359` (`ISSUE-03`, erro, F7; `ISSUE-01`,
`ISSUE-02` e `ISSUE-04`, avisos, F3). Os requisitos passaram a US-0002 3.2.0 (com `01-context.md` e
`02-glossary.md` 3.2.0; os demais itens seguem em 3.0.0 ou anterior), que absorvem a decisão do dono do
produto de 2026-10-22 (`DOMAIN/DEC-11`, "Fim da varredura de início do subesterço") e o esclarecimento de
método do mesmo dia (`DOMAIN/REF-04`, patamares de velocidade mantida) em AC-US-0002-03, AC-US-0002-04 e no
critério AC-US-0002-06. Decisão do autor recebida para esta rodada e carregada sem redescoberta: na
varredura de início do subesterço, sair da faixa abaixo de 50 km/h reprova (`OFF_ASPHALT`); sair acima de
50 km/h é o fim natural da varredura e não reprova se pelo menos duas velocidades acima de 50 km/h foram
medidas antes; sair antes da segunda medição acima de 50 km/h reprova por falta de medida, motivo próprio,
distinto de `OFF_ASPHALT`; `API-0003` e `FLOW-0002` ajustados nos vereditos, no motivo de reprovação por
falta de medida e em `maxUndersteerMsBySpeed`. O seed segue em `revision: 3`.

**O que mudou**

- `ISSUE-03` (erro, F7 — ramo de saída da faixa de `UNDERSTEER_ONSET` sem fonte): o ramo passa a vir de
  AC-US-0002-06. `RULE-0002` (3.1.0): seção nova "Fim da varredura de início do subesterço", tabela de
  decisão pela velocidade do kart (`speedMps`) no passo `offAsphaltFirstStep` — abaixo de 50 km/h, `FAIL`
  com `OFF_ASPHALT`; acima de 50 km/h com pelo menos dois patamares completos acima de 50 km/h antes da
  saída, fim natural da varredura sem reprovar; acima de 50 km/h com zero ou um, `FAIL` com
  `MEASUREMENT_MISSING` —, válida para a varredura do novo acerto, com o patamar interrompido fora da
  medida; linha "Patamares completos acima de 50 km/h ... pelo menos 2" na tabela Limiares (`DOMAIN/DEC-11`
  via AC-US-0002-06); linha `UNDERSTEER_ONSET` da tabela Ensaios reescrita para a varredura em patamares de
  velocidade mantida (estado inicial, medição por patamar, veredito com comparação entre patamares e nunca
  máximo acumulado, fontes AC-US-0002-03 a -06, `DOMAIN/DEC-11`, `DOMAIN/REF-04`); linha `TEST_PAD` da tabela
  Ambientes ressalva `UNDERSTEER_ONSET` ("fora da faixa ... o passo falha o ensaio, salvo ..."); o parágrafo
  dos parâmetros de ensaio inclui o tamanho do patamar, a sua duração e o modo de manter a sua velocidade
  (AC-US-0002-04) e diz que só os parâmetros com campo são também reportados na saída. `API-0003` (3.1.0):
  valor `MEASUREMENT_MISSING` em `failReason`; tabela Erros com a condição de `OFF_ASPHALT` em
  `UNDERSTEER_ONSET` restrita à saída abaixo de 50 km/h e linha nova `MEASUREMENT_MISSING`; parágrafo depois
  da tabela Erros dizendo que a saída acima de 50 km/h com dois patamares completos não é erro;
  `maxUndersteerMsBySpeed` passa a um par por patamar completo acima de 50 km/h (antes: velocidades de
  entrada acima de V1), com a maior sequência de `understeer` consecutivo dentro do patamar;
  `entrySpeedStepMps` descrito como o passo entre patamares (tamanho do patamar); seção Compatibilidade
  registra as mudanças da 3.1.0. `FLOW-0002` (3.1.0): diagrama e passos 4 e 5 com a velocidade mantida do
  patamar, o fim da varredura no primeiro passo fora da faixa e a medição por patamar; tabela Alternativas
  separa a saída da faixa em `REFERENCE_CORNER` (`OFF_ASPHALT` em qualquer velocidade) da saída em
  `UNDERSTEER_ONSET` (os três ramos de AC-US-0002-06). `FEAT-0002` (3.1.0): requisito 05 reescrito para
  AC-US-0002-04 3.2.0 (patamares completos acima de 50 km/h, comparação entre patamares); requisito 09
  restrito à curva de referência, "em qualquer velocidade" (US-0002, caso anormal); requisito 10 novo
  (AC-US-0002-06); Resumo, tabela Comportamento (duas linhas de saída da faixa), Configuração e Critérios de
  aceite levados ao mesmo fato. `02-glossary.md` (3.1.0): "Velocidade mantida" cobre também o patamar da
  varredura; "Velocidade de início do subesterço" segue a definição dos requisitos 3.2.0 (menor velocidade
  medida, em patamares); `failReason` com `MEASUREMENT_MISSING`. `01-overview.md` (3.1.0): duas linhas em
  Lacunas deliberadas (saída exatamente a 50 km/h; fim da varredura sem saída da faixa), os dois pontos que
  os requisitos deixaram sem decidir nas suas rodadas 7 e 8.
- `ISSUE-01` (aviso, F3 — condição de `OFF_ASPHALT` lê campos que os registros `UNDERSTEER_ONSET` e
  `REAR_RECOVERY` não carregam): `API-0003`, tabela "Campos medidos por `benchId`", ganha
  `offAsphaltStepCount`, `offAsphaltFirstStep` e `offAsphaltFirstXM`/`offAsphaltFirstZM` nas linhas de
  `UNDERSTEER_ONSET` (0 ou 1 passo, porque a saída encerra a varredura) e de `REAR_RECOVERY` (0 para
  `PASS`), com o significado que já têm em `REFERENCE_CORNER`; a condição de `OFF_ASPHALT` em `REAR_RECOVERY`
  passa a ser `offAsphaltStepCount` > 0. `RULE-0002`, coluna Medição de `UNDERSTEER_ONSET` e de
  `REAR_RECOVERY`, nomeia os mesmos campos; o veredito de `REAR_RECOVERY` diz `offAsphaltStepCount` = 0.
  `FLOW-0002`, linha "Kart sai da faixa durante `REAR_RECOVERY`", cita o campo, o passo e a posição.
- `ISSUE-02` (aviso, F3 — `SETUP_VERSION` sem linha em `RULE-0002`): `RULE-0002` ganha a linha
  `SETUP_VERSION` da tabela Ensaios (sem ambiente; leitura da versão declarada com `getSetupVersion` e dos
  registros antigos e novos com `readReplay`, de `API-0002`; `PASS` se `declaredSetupVersion` ≠
  `previousSetupVersion` e `oldRecordsReadOkCount` = `oldRecordsReadCount`; fontes AC-US-0005-04 e NFR-0009),
  e AC-US-0005-04 e NFR-0009 entram nos `sources:`. A citação de `FEAT-0005` passa a resolver sem mudança
  naquele arquivo.
- `ISSUE-04` (aviso, F3 — passo 3 de `FLOW-0002` fixava 50 km/h para todo ensaio no arco): o passo 3 remete
  ao estado inicial que `RULE-0002` declara para cada ensaio, sem fixar a velocidade.
- Versões: `RULE-0002`, `API-0003`, `FLOW-0002`, `FEAT-0002`, `01-overview.md`, `02-glossary.md` e este
  changelog em 3.1.0, com `status: draft`. Intocados: `FEAT-0001`, `FEAT-0003` a `FEAT-0006`, `FLOW-0001`,
  `FLOW-0003`, `API-0001`, `API-0002`, `RULE-0001`, `RULE-0003`, `SCR-0001`, `SCR-0002`,
  `98-divergences.md`. `00-index.md` e `99-traceability.md` não foram escritos: o gate os regenera.

**Superfície (conventions §16)**: o requisito `REQ-FEAT-0002-10` e o valor `MEASUREMENT_MISSING` realizam o
critério AC-US-0002-06 dos requisitos 3.2.0, que exige o fim da varredura e um motivo de reprovação por falta
de medida distinto da saída do asfalto; sem eles o critério ficaria sem requisito (conjunto fechado,
política de contrato regra 11), que é o que a `ISSUE-03` pede. Os campos de saída da faixa acrescentados a
`UNDERSTEER_ONSET` e `REAR_RECOVERY` já existiam no contrato e já eram lidos pela condição de erro desses
dois ensaios (`ISSUE-01`); a linha `SETUP_VERSION` de `RULE-0002` define um ensaio que `API-0003` e o
glossário já tinham (`ISSUE-02`). No par de `maxUndersteerMsBySpeed`, o primeiro elemento passa de
`entrySpeedMps` a `plateauSpeedMps` porque o valor deixou de ser velocidade de entrada (renomear na mudança
de significado); nenhum registro foi publicado sob a forma anterior, e a Compatibilidade de `API-0003` o
declara. Nenhum endpoint, tela ou configuração novos.

**Tabela de migração** (conventions §17): nenhum requisito, contrato, campo, tela, regra ou ensaio retirado.
Requisitos funcionais: 61 antes, 62 depois (novo `REQ-FEAT-0002-10`); modificados `REQ-FEAT-0002-05`
(patamares acima de 50 km/h em vez de velocidades de entrada acima de V1) e `REQ-FEAT-0002-09` (restrito à
curva de referência, em qualquer velocidade, sem mudar o que exige). Critérios `AC-*` realizados: 31 antes,
32 depois (AC-US-0002-06). `failReason`: seis valores antes, sete depois. Elemento do par de
`maxUndersteerMsBySpeed`: `entrySpeedMps` substituído por `plateauSpeedMps`.

**Itens fechados**: `ISSUE-01`, `ISSUE-02`, `ISSUE-03`, `ISSUE-04` de `fspec-validation-20261022-1359`.
Nenhum `FB-<nn>` pendente para esta feature. Divergências registradas: nenhuma.

**Itens recusados, com motivo**

- Alternativa da `ISSUE-02` (fazer a citação de `FEAT-0005` apontar só para `API-0003` e `RULE-0003`): não
  tomada. A linha em `RULE-0002` torna verdadeira a frase de abertura de `API-0003` ("para cada ensaio de
  `RULE-0002`") também para `SETUP_VERSION`, e `FEAT-0005` fica intocado.
- Velocidade do kart no passo da saída como campo do registro `UNDERSTEER_ONSET`: não acrescentada. Seria
  campo novo numa rodada de correção (§16); AC-US-0002-06 observa o resultado reportado (`verdict` e
  `failReason`), e a velocidade nesse passo é a `speedMps` da telemetria no passo `offAsphaltFirstStep`,
  reproduzível pelo determinismo. Proposta ao autor para `SCOPE-BACKLOG.md`: "2026-10-22 fspec-loop rodada
  7 — o registro `UNDERSTEER_ONSET` deve trazer a velocidade do kart no passo da saída da faixa?"
- Duração do patamar e modo de manter a velocidade do patamar como campos de `API-0003`: não acrescentados
  (campos novos numa rodada de correção). AC-US-0002-04 pede que sejam parâmetros registrados em
  `docs/physics.md`, o que `REQ-FEAT-0006-08` já exige ("os parâmetros ... de 100 % dos ensaios de
  `RULE-0002`"); `RULE-0002` os nomeia entre os parâmetros de ensaio. Pelo mesmo motivo a enumeração entre
  parênteses de `REQ-FEAT-0006-08` não foi estendida e `FEAT-0006` fica intocado. A proposta de
  `SCOPE-BACKLOG.md` da rodada 8 dos requisitos (listar por patamar a velocidade e a maior sequência de
  `understeer`) já está atendida por `maxUndersteerMsBySpeed`.
- Saída da faixa exatamente a 50 km/h e fim da varredura sem saída da faixa: não decididos. Os requisitos
  não os decidem (rodadas 7 e 8 do seu changelog) e esta especificação não inventa ramo de domínio
  (D-FS-02); ficam em Lacunas deliberadas de `01-overview.md` e na nota de `RULE-0002`. A proposta de
  `SCOPE-BACKLOG.md` da rodada 7 dos requisitos (saída exatamente a 50 km/h) segue valendo.
- Velocidade de início da varredura: mantida em 50 km/h, como na versão 3.0.0; nenhuma issue a aponta e os
  requisitos não a fixam de outro modo.
- `DOMAIN.md` foi lido só para conferir a entrada de 2026-10-22; todo conteúdo especificado nesta rodada
  vem de US-0002 3.2.0, que já carrega `DOMAIN/DEC-11` e `DOMAIN/REF-04`.
- Os itens recusados das rodadas 1, 5 e 6 continuam recusados pelos mesmos motivos.

## 2026-10-22 — rodada 8, Mode B (fspec-validation-20261022-1530: 1 erro, 2 avisos; requisitos 3.2.0)

**Gatilho**: o relatório FAIL `fspec-validation-20261022-1530` (`ISSUE-01`, erro, F5; `ISSUE-02` e
`ISSUE-03`, avisos, F3). Decisão do autor recebida para esta rodada e carregada sem redescoberta: a mesma de
2026-10-22 da rodada 7 (`DOMAIN/DEC-11` — fim da varredura de início do subesterço: saída abaixo de 50 km/h
reprova por `OFF_ASPHALT`; acima de 50 km/h é o fim natural e não reprova com pelo menos duas velocidades
acima de 50 km/h medidas antes; antes da segunda, reprova por falta de medida, `MEASUREMENT_MISSING`), já
absorvida por US-0002 3.2.0 e já especificada na rodada 7 em `API-0003` e `FLOW-0002` (vereditos, motivo de
falta de medida, `maxUndersteerMsBySpeed`); esta rodada só a mantém coerente com as correções abaixo. O
seed segue em `revision: 3`; os requisitos seguem em 3.2.0.

**O que mudou**

- `ISSUE-01` (erro, F5 — `driftScore` sem sufixo de unidade, D-FS-06): o campo passa a `driftScorePoints`
  (mesmo tipo, unidade "pontos" e significado) em `API-0003` (tabela "Campos medidos por `benchId`", linha
  `DRIFT_MANEUVER`), em `RULE-0002` (tabela Ensaios, linha `DRIFT_MANEUVER`, colunas Medição e Veredito) e em
  `FEAT-0003` (requisito 07 e critério de aceite de `DRIFT_MANEUVER`). A Compatibilidade de `API-0003`
  registra a troca na versão 3.2.0: o nome anterior deixa de ser emitido, a substituta é `driftScorePoints`,
  nenhum registro foi publicado sob o nome anterior e nenhum consumidor lê o contrato como entrada.
- `ISSUE-02` (aviso, F3 — `v1Mps` obrigatório em desfechos sem V1): a partir do requisito 04 de `FEAT-0002`
  (V1 ≥ 1,15 × V0, AC-US-0002-03) e do requisito 06 (a saída contém V1, AC-US-0002-05), um ensaio sem V1
  medida não atende o critério. `API-0003`: `v1Mps` passa a "só quando V1 foi medida" (algum patamar
  completo com `understeer` acima de 200 ms consecutivos; o patamar interrompido não conta), como `v0Mps` com
  `baselineAvailable` e `recoveryMs` com `gripReached`; a linha `MEASUREMENT_MISSING` da tabela Erros ganha o
  caso (b) — fim natural da varredura sem V1 medida — ao lado do caso (a) já existente; o parágrafo depois
  da tabela Erros diz o veredito sem V1; a Compatibilidade registra as duas mudanças sem campo nem valor
  novo. `RULE-0002`: linha `UNDERSTEER_ONSET` da tabela Ensaios (Medição: `v1Mps` ausente sem V1 medida;
  Veredito: "V1 medida e V1 ≥ 1,15 × V0", sem V1 `MEASUREMENT_MISSING`, e a saída da faixa remetida à
  decisão pela velocidade do kart, em vez de "sem reprovar", que contradizia a primeira e a terceira linhas
  da seção de fim da varredura); seção "Fim da varredura de início do subesterço": o patamar interrompido não
  entra em V1, a segunda linha diz o resultado sem V1 medida, e a nota depois da tabela diz que na primeira e
  na terceira linhas o motivo da saída vale com ou sem V1. Levado também a `FLOW-0002` (linha de
  `UNDERSTEER_ONSET` da tabela Alternativas), `FEAT-0002` (linha nova da tabela Comportamento para a varredura
  sem V1 medida; critério de aceite dos requisitos 04 e 05) e `02-glossary.md` (`MEASUREMENT_MISSING`).
- `ISSUE-03` (aviso, F3 — saída da faixa em `STEER_RESPONSE` sem desfecho definido): o desfecho vem de
  AC-US-0001-05 (o veredito do ensaio de resposta do volante depende apenas do tempo medido da taxa de
  guinada) e de `DOMAIN/DEC-09` (o ensaio mede só o tempo de resposta), já realizados por `REQ-FEAT-0001-05`:
  a saída da faixa da reta não altera o veredito, que depende só dos tempos medidos com a velocidade mantida
  (`SPEED_NOT_HELD` continua valendo, `REQ-FEAT-0001-09`). `RULE-0002`, linha `TEST_PAD` da tabela
  Ambientes, deixa de dizer que todo passo fora da faixa falha o ensaio e diz o resultado de cada ensaio
  (`REFERENCE_CORNER` e `REAR_RECOVERY` falham com `OFF_ASPHALT`; `UNDERSTEER_ONSET` segue a sua seção;
  `STEER_RESPONSE` não muda o veredito e não tem campo de saída da faixa), com as fontes de cada ramo;
  `API-0003` ganha, depois da tabela Erros, o parágrafo que diz que essa saída não é erro nem campo do
  registro (a condição de `OFF_ASPHALT` já não incluía `STEER_RESPONSE`); `FLOW-0002` ganha a linha "Kart sai
  da faixa da reta da pista de teste em `STEER_RESPONSE`" na tabela Alternativas.
- Versões: `API-0003`, `RULE-0002`, `FLOW-0002` e `FEAT-0002` em 3.2.0; `02-glossary.md` em 3.1.1;
  `FEAT-0003` em 3.0.1, de volta a `status: draft` por ter mudado; este changelog em 3.2.0. `sources:` de
  `API-0003` ganha AC-US-0001-05 e AC-US-0002-03; os de `RULE-0002` e `FLOW-0002` ganham AC-US-0001-05.
  Intocados: `01-overview.md`, `FEAT-0001`, `FEAT-0004` a `FEAT-0006`, `FLOW-0001`, `FLOW-0003`, `API-0001`,
  `API-0002`, `RULE-0001`, `RULE-0003`, `SCR-0001`, `SCR-0002`, `98-divergences.md`. `00-index.md` e
  `99-traceability.md` não foram escritos: o gate os regenera.

**Superfície (conventions §16)**: nenhum requisito, campo, valor de enum, endpoint, tela ou configuração
acrescentado. `driftScorePoints` substitui `driftScore` (renomear para levar a unidade, mesma superfície);
`v1Mps` passa de obrigatório a condicional sem mudar nome, unidade ou significado; `MEASUREMENT_MISSING` já
existia e passa a cobrir um desfecho que os critérios já tornavam reprovação. As linhas novas das tabelas
Alternativas de `FLOW-0002` e Comportamento de `FEAT-0002` descrevem desfechos de requisitos existentes
(`REQ-FEAT-0001-05`, `REQ-FEAT-0002-04`).

**Tabela de migração** (conventions §17): nenhum requisito, contrato, campo, tela, regra ou ensaio retirado.
Requisitos funcionais: 62 antes e depois; modificado `REQ-FEAT-0003-07` só no nome do campo
(`driftScore` → `driftScorePoints`). Campo renomeado: `driftScore` → `driftScorePoints` (`DRIFT_MANEUVER`).
Campo que passa a condicional: `v1Mps`. Critérios `AC-*` realizados: 32 antes e depois. `failReason`: sete
valores antes e depois.

**Itens fechados**: `ISSUE-01`, `ISSUE-02`, `ISSUE-03` de `fspec-validation-20261022-1530`. Nenhum
`FB-<nn>` pendente para esta feature. Divergências registradas: nenhuma.

**Itens recusados, com motivo**

- Alternativa da `ISSUE-03` (a saída da faixa reprovar `STEER_RESPONSE` com `OFF_ASPHALT`, com
  `offAsphaltStepCount`, `offAsphaltFirstStep` e a posição no registro): não tomada. Nenhum critério de
  US-0001 a pede; AC-US-0001-05 e `DOMAIN/DEC-09` dizem que o veredito desse ensaio depende só do tempo
  medido da taxa de guinada, e `REQ-FEAT-0001-05` já o exige; os campos seriam acréscimo ao registro numa
  rodada de correção (§16). Proposta ao autor para `SCOPE-BACKLOG.md`: "2026-10-22 fspec-loop rodada 8 — a
  saída da faixa da reta da pista de teste deve reprovar o ensaio de resposta do volante, ou só ser
  reportada?"
- Um `failReason` próprio para "V1 não medida", ou `THRESHOLD_EXCEEDED` nesse caso: não tomados. Um valor
  novo seria superfície numa rodada de correção (§16), e `THRESHOLD_EXCEEDED` diria que um limiar foi
  comparado e excedido, quando V1 não existe para ser comparada; a falta da medida é o sentido de
  `MEASUREMENT_MISSING`, que AC-US-0002-06 já introduz ("reprovado por falta de medida").
- Ordem entre `BASELINE_MISSING` e os demais motivos de `UNDERSTEER_ONSET` quando ambos se aplicam: não
  decidida nesta rodada; nenhuma issue a aponta e a seção "Linha de base" de `RULE-0002` segue como está.
- Saída da faixa exatamente a 50 km/h e fim da varredura sem saída da faixa: seguem não decididos, pelos
  motivos da rodada 7 (Lacunas deliberadas de `01-overview.md`); `v1Mps` ausente nesses casos não é julgado.
- Os itens recusados das rodadas 1, 5, 6 e 7 continuam recusados pelos mesmos motivos.
