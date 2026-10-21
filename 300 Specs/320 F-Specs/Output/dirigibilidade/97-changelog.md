---
title: Registro de mudanças — dirigibilidade do Arcade assistido
feature: dirigibilidade
stage: fspec
status: validated
version: 2.0.0
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

- Decisão do autor "código fica na raiz do repositório; presets em `src/physics.ts`; benches em
  `scripts/`": não escrita em nenhum arquivo desta especificação (F8: esta etapa não decide nem registra
  layout de código); fica como contexto para `300 Specs/330 D-Specs`, que o autor pediu para reprocessar
  contra a revisão 2.
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
