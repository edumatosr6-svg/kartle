---
stage: fspec
feature: dirigibilidade
verdict: FAIL
generated: 2026-10-22T13:59:40Z
counts: {blocker: 0, error: 1, warning: 3, info: 0, divergence: 0}
seed: {revision: 3, digest: 7dd24c8b6cab}
upstream: {stage: req, version: 3.0.0}
feedbacks: []
population: "revalidação após fspec-validation-20261021-1853: ISSUE-01 (api/API-0003, flows/FLOW-0002, rules/RULE-0002) e ISSUE-02 (features/FEAT-0005, rules/RULE-0002) do relatório anterior; arquivos com version movida desde então: nenhum (00-index.md e 99-traceability.md só regenerados pelo gate); dois arquivos intocados sorteados (random.SystemRandom): features/FEAT-0003, features/FEAT-0002; requisitos 3.0.0 inalterados desde o relatório anterior; DOMAIN.md (camada de domínio, conventions §15) alterado depois do relatório anterior, com a decisão de 2026-10-22"
---

# Relatório de validação — dirigibilidade

## Issues

### ISSUE-01

- severidade: warning
- verificação: F3 — consistência entre arquivos (campo usado num registro que não o define)
- arquivo: `api/API-0003-saida-dos-ensaios.md`
- localização: tabela Erros, linha `FAIL` com `OFF_ASPHALT`; `flows/FLOW-0002`, tabela Alternativas, linha "Kart sai da faixa durante `REAR_RECOVERY`"; `rules/RULE-0002`, tabela Ensaios, linha `REAR_RECOVERY`, colunas Medição e Veredito
- achado: reverificado, aberto (arquivos inalterados desde o relatório anterior): a condição de `OFF_ASPHALT` lê saída da faixa em `UNDERSTEER_ONSET` e `REAR_RECOVERY`, mas as linhas desses dois ensaios na tabela "Campos medidos por `benchId`" e a coluna Medição de `RULE-0002` não carregam `offAsphaltStepCount`, `offAsphaltFirstStep` nem a posição da saída.
- esperado: o registro `REAR_RECOVERY` (e `UNDERSTEER_ONSET`, na forma que a ISSUE-03 fixar) nomeia os campos de saída da faixa que a condição de erro lê, na tabela de campos de `API-0003` e na coluna Medição de `RULE-0002`.

### ISSUE-02

- severidade: warning
- verificação: F3 — consistência entre arquivos (uso sem definição no arquivo citado)
- arquivo: `features/FEAT-0005-determinismo-piloto-de-teste-e-versao.md`
- localização: seção Comportamento, parágrafo "Ensaios `DETERMINISM`, `TEST_PILOT_LAP`, `SETUP_VERSION` e `STEP_CONTRACT`: [RULE-0002]"
- achado: reverificado, aberto: a tabela Ensaios de `RULE-0002` continua sem linha `SETUP_VERSION`, embora `FEAT-0005` a remeta para esse ensaio e `API-0003` e o glossário o definam.
- esperado: `RULE-0002` ganha a linha `SETUP_VERSION` (leitura do dado publicado e dos registros antigos; `PASS` se `declaredSetupVersion` ≠ `previousSetupVersion` e `oldRecordsReadOkCount` = `oldRecordsReadCount`; fonte AC-US-0005-04, NFR-0009), ou a citação de `FEAT-0005` para esse ensaio aponta só para `API-0003` e `RULE-0003`.

### ISSUE-03

- severidade: error
- verificação: F7 — regra de domínio sem fonte (ramo não decidido pelos requisitos; D-FS-02)
- arquivo: `api/API-0003-saida-dos-ensaios.md`
- localização: tabela Erros, linha `FAIL` com `OFF_ASPHALT` ("`offAsphaltStepCount` > 0 em … `UNDERSTEER_ONSET`"); `flows/FLOW-0002`, tabela Alternativas, linha "Kart sai da faixa de asfalto do arco em `REFERENCE_CORNER` ou `UNDERSTEER_ONSET`"; `rules/RULE-0002`, tabela Ambientes de ensaio, linha `TEST_PAD` ("fora da faixa … o passo falha o ensaio") e tabela Ensaios, linha `UNDERSTEER_ONSET`; `features/FEAT-0002`, tabela Comportamento, linha "Kart sai da faixa de asfalto do arco"
- achado: a saída da faixa durante a varredura de velocidade crescente de `UNDERSTEER_ONSET` é especificada como `FAIL` com `OFF_ASPHALT` citando o caso anormal "Kart sai da faixa de asfalto do arco" de US-0002, que só faz falhar o critério 02 (entrada a 50 km/h); nenhum item dos requisitos 3.0.0 decide esse ramo acima de 50 km/h, a varredura não tem fim especificado além da reprovação, e a decisão fechada do dono do produto em `DOMAIN.md` (2026-10-22) o decide de outro modo: sair abaixo de 50 km/h reprova (`OFF_ASPHALT`), sair acima de 50 km/h com pelo menos duas velocidades acima de 50 km/h já medidas é o fim da varredura e não reprova, e sair antes da segunda medição acima de 50 km/h reprova por falta de medida.
- esperado: o ramo de saída da faixa de `UNDERSTEER_ONSET` (fim da varredura, mínimo de duas velocidades medidas acima de 50 km/h, reprovação abaixo de 50 km/h e reprovação por falta de medida com o seu `failReason`) é especificado em `RULE-0002`, `API-0003`, `FLOW-0002` e `FEAT-0002` a partir de um item dos requisitos que o carregue, depois que US-0002 absorver a decisão de 2026-10-22 de `DOMAIN.md`.

### ISSUE-04

- severidade: warning
- verificação: F3 — consistência entre arquivos (o mesmo estado inicial enunciado de dois modos)
- arquivo: `flows/FLOW-0002-ensaio-deterministico-e-piloto-de-teste.md`
- localização: tabela Passos, passo 3 ("entrada do arco de raio 18 m a 50 km/h")
- achado: o passo 3 põe todo ensaio no arco da pista de teste com entrada a 50 km/h, enquanto `RULE-0002` (tabela Ensaios) parte `REAR_RECOVERY` com velocidade acima de 50 km/h e `UNDERSTEER_ONSET` com velocidade de entrada crescente a partir de 50 km/h.
- esperado: o passo 3 enuncia o estado inicial do arco por ensaio como `RULE-0002` o declara, ou remete a `RULE-0002` sem fixar a velocidade de entrada.

## Divergences

Nenhuma.

## Coverage

- critérios cobertos na população: AC-US-0002-01 a AC-US-0002-05 (FEAT-0002, 9 requisitos), AC-US-0003-01 a AC-US-0003-07 (FEAT-0003, 12 requisitos), AC-US-0005-01 a AC-US-0005-06 e NFR-0001, NFR-0009 (FEAT-0005, 12 requisitos); descobertos: nenhum.
- requisitos sem fonte: nenhum `REQ-*`; ramo sem fonte fora de linha de requisito: ISSUE-03.
- contratos sem consumidor: nenhum (`API-0003` consumido por `FEAT-0001` a `FEAT-0006` e `FLOW-0002`).
