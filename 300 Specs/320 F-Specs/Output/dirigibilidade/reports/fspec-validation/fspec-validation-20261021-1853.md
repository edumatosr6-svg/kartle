---
stage: fspec
feature: dirigibilidade
verdict: SUCCESS
generated: 2026-10-21T18:53:37Z
counts: {blocker: 0, error: 0, warning: 2, info: 0, divergence: 0}
seed: {revision: 3, digest: 7dd24c8b6cab}
upstream: {stage: req, version: 3.0.0}
feedbacks: []
population: "revalidação após fspec-validation-20261021-1750: ISSUE-01 (flows/FLOW-0002, aviso), ISSUE-02 (api/API-0001, aviso) e ISSUE-03 (97-changelog.md, aviso) do relatório anterior; arquivos com version movida: 01-overview.md 3.0.0, 02-glossary.md 3.0.0, 97-changelog.md 3.0.0, api/API-0001 1.1.0, api/API-0003 3.0.0, features/FEAT-0001 a FEAT-0003 3.0.0, features/FEAT-0004 2.1.0, features/FEAT-0005 2.1.0, features/FEAT-0006 2.0.0, flows/FLOW-0001 1.1.0, flows/FLOW-0002 3.0.0, rules/RULE-0001 3.0.0, rules/RULE-0002 3.0.0; dois arquivos intocados sorteados (Get-Random): rules/RULE-0003, screens/SCR-0001; grep sobre todo o conjunto (fora de reports/) de OPEN-/TBD, de caminhos de código (src/, scripts/, .ts), de valores da revisão 1 e de SETUP_VERSION; verificação por script de todo link relativo do conjunto"
---

# Relatório de validação — dirigibilidade

## Issues

### ISSUE-01

- severidade: warning
- verificação: F3 — consistência entre arquivos (campo usado num registro que não o define)
- arquivo: `api/API-0003-saida-dos-ensaios.md`
- localização: tabela Erros, linha `FAIL` com `OFF_ASPHALT` ("`offAsphaltStepCount` > 0 em `TEST_PILOT_LAP`, `REFERENCE_CORNER` ou `UNDERSTEER_ONSET`, ou saída da faixa durante `REAR_RECOVERY`"); mesma condição em `flows/FLOW-0002`, tabela Alternativas, linha "Kart sai da faixa de asfalto do arco em `REFERENCE_CORNER` ou `UNDERSTEER_ONSET`" (nomeia `offAsphaltFirstStep` e posição) e linha "Kart sai da faixa durante `REAR_RECOVERY`"
- achado: a tabela "Campos medidos por `benchId`" só define `offAsphaltStepCount`, `offAsphaltFirstStep`, `offAsphaltFirstXM`/`offAsphaltFirstZM` para `REFERENCE_CORNER` e `TEST_PILOT_LAP`; as linhas de `UNDERSTEER_ONSET` e de `REAR_RECOVERY` não carregam nenhum campo de saída da faixa, e `RULE-0002` (tabela Ensaios, `UNDERSTEER_ONSET` e `REAR_RECOVERY`, coluna Medição) também não os lista, embora o veredito de `REAR_RECOVERY` diga "saída é `OFF_ASPHALT`"; o registro que o erro condiciona não tem o campo que a condição lê.
- esperado: as linhas de `UNDERSTEER_ONSET` e `REAR_RECOVERY` da tabela de campos (e a coluna Medição de `RULE-0002`) nomeiam os campos de saída da faixa que já existem em `REFERENCE_CORNER` ("como em `REFERENCE_CORNER`"), ou a linha de erro e as alternativas de `FLOW-0002` deixam de condicionar `OFF_ASPHALT` desses dois ensaios a um campo que os seus registros não carregam.

### ISSUE-02

- severidade: warning
- verificação: F3 — consistência entre arquivos (uso sem definição no arquivo citado)
- arquivo: `features/FEAT-0005-determinismo-piloto-de-teste-e-versao.md`
- localização: seção Comportamento, parágrafo "Ensaios `DETERMINISM`, `TEST_PILOT_LAP`, `SETUP_VERSION` e `STEP_CONTRACT`: [RULE-0002]"
- achado: `SETUP_VERSION` é definido como `benchId` em `API-0003` (campos `declaredSetupVersion`, `previousSetupVersion`, `oldRecordsReadCount`, `oldRecordsReadOkCount`) e no glossário, mas a tabela Ensaios de `RULE-0002` (ambiente, estado inicial, medição, veredito, fonte) não tem linha `SETUP_VERSION` (grep do conjunto: nenhuma ocorrência em `rules/`); `REQ-FEAT-0006-08` exige em `docs/physics.md` os campos de "100 % dos ensaios de `RULE-0002`", o que deixa `SETUP_VERSION` fora dessa exigência.
- esperado: `RULE-0002` ganha a linha `SETUP_VERSION` (sem ambiente; leitura do dado publicado e dos registros antigos; `PASS` se `declaredSetupVersion` ≠ `previousSetupVersion` e `oldRecordsReadOkCount` = `oldRecordsReadCount`; fonte AC-US-0005-04, NFR-0009), ou a citação em `FEAT-0005` aponta só para `API-0003` e `RULE-0003` para esse ensaio.

## Divergences

Nenhuma. `98-divergences.md` está bem formado e vazio.

## Coverage

- ISSUE-01 anterior (`flows/FLOW-0002`, passo 5): fechado; o passo diz "velocidades em m/s, apresentadas também em km/h".
- ISSUE-02 anterior (`api/API-0001`, linha `speedMps`): fechado; a linha diz "os ensaios reportam em m/s, apresentados também em km/h".
- ISSUE-03 anterior (`97-changelog.md`, rodada 5, Itens recusados): fechado; a entrada refere "a decisão do autor sobre o layout do repositório (onde ficam o código, os presets e os benches)" sem caminho; grep do conjunto fora de `reports/` por `src/`, `scripts/`, `.ts`: nenhuma ocorrência fora das entradas históricas do changelog que citam os relatórios anteriores.
- F1 nos arquivos movidos e sorteados: `stage: fspec`, `feature:` e `id` coerentes; todo link relativo do conjunto resolve (script sobre os 21 arquivos); blocos mermaid de `FLOW-0001` e `FLOW-0002` (sequenceDiagram) e `RULE-0003` (stateDiagram-v2) sintaticamente válidos.
- F2 nos arquivos movidos: 61 requisitos `REQ-FEAT-000{1..6}-nn`, cada um com um único modal (SHALL ou SHALL NOT), citando `AC-*`, `NFR-*` ou `[DOMAIN]` com o item dos requisitos (caso anormal nomeado ou invariante); os três requisitos novos (FEAT-0001-09, FEAT-0002-09, FEAT-0003-12) citam o caso anormal de US-0001, US-0002 e US-0003 3.0.0 que os pede; cada SHALL coberto por critério de aceite do próprio arquivo que o nomeia (contagem por arquivo: 9/9, 9/9, 12/12, 10/10, 12/12, 9/9).
- F3: valores (180/250 ms; 50 km/h e 13,89 m/s; 200 ms; 400 ms; 0,65 rad; 2 500 ms; 105/3,6 m/s; 25 000 ms; raio 18 m; raios 24 m e 25 m, grampo 4 m) idênticos em `01-overview.md`, `02-glossary.md`, `FEAT-0001` a `FEAT-0005`, `FLOW-0002`, `API-0003`, `RULE-0001` e `RULE-0002`; `TEST_PAD`/`SYNTHETIC_TRACK`, `speedHoldMode` e seus dois valores, `SPEED_NOT_HELD`, `speedMinMps`/`speedMaxMps`/`speedHoldBandMps`/`targetSpeedMps`/`settleWindowMs`, `arcRadiusM`/`laneWidthM`, `normalDrivingStepCount`/`excludedRecoveryStepCount`, `gripReached`/`recoveryMs` definidos em `API-0003` e usados com o mesmo nome em `FEAT-0001` a `FEAT-0006`, `FLOW-0002`, `RULE-0002` e no glossário; classe "Recuperação" definida em `RULE-0001` e usada em `FEAT-0003`, `FLOW-0001` (passo 4), `RULE-0002` (`NORMAL_DRIVING`) e glossário com a mesma definição (soltura sob a condição de forçar até o primeiro `grip`, no máximo 400 ms; excedente é condução normal); termos "Pista de teste", "Ambiente de ensaio", "Velocidade mantida", "Regime da taxa de guinada" com um só nome; Configuração: nenhum ajuste referenciado em comportamento que não conste da seção Configuração ("Nenhuma" em todos). Exceções: ISSUE-01 e ISSUE-02.
- F4: critérios `AC-US-*` dos requisitos 3.0.0: 31 (US-0001: 6; US-0002: 5; US-0003: 7; US-0004: 7; US-0005: 6); cobertos 31 de 31 (lista construída dos cinco US e comparada com os `sources:` e os critérios de aceite de `features/`); NFR 9 de 9 realizados (NFR-0001 e NFR-0009 em `FEAT-0005`; NFR-0002 a NFR-0008 em `FEAT-0006`, com NFR-0004 3.0.0 realizado por `REQ-FEAT-0006-08` incluindo ambiente e parâmetros novos); requisitos sem fonte: nenhum; contratos sem consumidor: nenhum (API-0001 por SCR-0001/FLOW-0001/FEAT-0001 a FEAT-0004; API-0002 por SCR-0002/FLOW-0003/FEAT-0005; API-0003 por FLOW-0002 e FEAT-0001 a FEAT-0006); lista Fora do escopo de `01-overview.md` idêntica à de `01-context.md` dos requisitos; lacunas deliberadas de `01-overview.md` coincidem com o que os requisitos 3.0.0 recusaram fixar (modo de manter a velocidade, faixa, janela, largura da faixa, ambiente de 0–60 e velocidade estabilizada).
- F5 em `API-0003` 3.0.0 e `API-0001` 1.1.0: nomes planos com unidade SI no sufixo (D-FS-06), inclusive os campos novos (`...Mps`, `...Ms`, `...M`, `...Count`, `...Norm`); obrigatoriedade e condição de presença por campo; os dois campos que passam a condicionais (`throttleInputNorm`, `recoveryMs`) mantêm nome, unidade e significado (I3) e a seção Compatibilidade o declara; Auth com motivo; superfície de erro com seis `failReason`; idempotência por leitura pura e por função pura do ensaio; nenhuma retirada; nenhuma configuração para forçar evento, injetar estado ou habilitar depuração (seções Configuração de `FEAT-0001` a `FEAT-0006`).
- F6 em `SCR-0001` (sorteado): estados Carregando, Vazio, Populado, Pausada, Erro, Offline, Permissão negada e Fim da volta nos dois canais, chamada `getHandlingTelemetry` resolvida em `API-0001`; a revisão 3 não implica tela nova (a pista de teste é ambiente de ensaio sem tela, `01-overview.md`, Camadas); `FEAT-0004` requisito 06 explícito nos dois canais.
- F7 em `RULE-0001` e `RULE-0002`: cada limiar cita `DOMAIN/DEC-nn`, `DOMAIN/REF-03` ou `SEED/*` via `AC-*`; `arcRadiusM` 18 e `targetSpeedMps` 13,89 citam `DOMAIN/REF-03` e `DOMAIN/DEC-01`/`DEC-02`; classificação do passo com a classe Recuperação como tabela de decisão; idempotência e ordem por `simStepCount` declaradas, inclusive para o acelerador regulado (`THROTTLE_REGULATED`); `RULE-0003` (sorteado) declara transição idempotente e ordem por `previousSetupVersion`; `FLOW-0001` e `FLOW-0002` declaram não receber evento externo (D-FS-03) e rodar sem rede (D-FS-08); nenhuma decisão de domínio na apresentação ou no adaptador (D-FS-05; `REQ-FEAT-0003-10`, `REQ-FEAT-0006-01`).
- F8: nenhum segredo, credencial ou dado real (D-FS-07); nenhuma mudança de forma de dado (campos de `API-0003` aditivos; `API-0002` intocado); nenhum refactor, rename ou remoção pedido fora dos requisitos (I10); nenhum caminho de módulo, tabela, classe, biblioteca ou framework nos arquivos de especificação (`docs/physics.md`, `npm test` e `npm run bench:handling` são nomeados pelos critérios dos requisitos; `TEST_PAD` é valor de enum do contrato).
- F9: nenhum `OPEN-` nem `TBD` no conjunto; `98-divergences.md` bem formado, sem linhas.
- Carimbo: `status: validated` gravado no front matter dos 16 arquivos que liam `draft` (`00-index.md`, `01-overview.md`, `02-glossary.md`, `97-changelog.md`, `API-0001`, `API-0003`, `FEAT-0001` a `FEAT-0006`, `FLOW-0001`, `FLOW-0002`, `RULE-0001`, `RULE-0002`); nenhum front matter do conjunto lê `draft`.

## Contexto recebido fora do procedimento

- `97-changelog.md` (rodada 6) registra "decisões do autor recebidas para esta rodada", o feedback da etapa de código (`SPEC-ISSUE-01` a `SPEC-ISSUE-06`) e os motivos das escolhas de forma do gerador; essa justificativa não entrou no julgamento. O ambiente dos ensaios, a velocidade mantida e a classe Recuperação foram conferidos contra os requisitos validados 3.0.0 (US-0001 a US-0005, NFR-0004, `01-context.md`, `02-glossary.md`), não contra o changelog nem contra o feedback do código.
