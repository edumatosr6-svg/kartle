---
stage: fspec
feature: dirigibilidade
verdict: FAIL
generated: 2026-10-22T15:30:51Z
counts: {blocker: 0, error: 1, warning: 2, info: 0, divergence: 0}
seed: {revision: 3, digest: 7dd24c8b6cab}
upstream: {stage: req, version: 3.2.0}
feedbacks: []
population: "revalidação após fspec-validation-20261022-1359: ISSUE-01 a ISSUE-04 daquele relatório reverificadas, todas fechadas (campos de saída da faixa em UNDERSTEER_ONSET e REAR_RECOVERY; linha SETUP_VERSION em RULE-0002; ramo de saída da faixa de UNDERSTEER_ONSET vindo de AC-US-0002-06; passo 3 de FLOW-0002 remetido a RULE-0002); arquivos com version movida: 01-overview.md, 02-glossary.md, 97-changelog.md, api/API-0003, features/FEAT-0002, flows/FLOW-0002, rules/RULE-0002; dois arquivos intocados sorteados (random.SystemRandom): features/FEAT-0004, api/API-0002; cobertura F4 sobre a lista completa de AC-* e NFR-* dos requisitos (US-0002 3.2.0, com AC-US-0002-06)"
isolation: "97-changelog.md (rodada 7) traz a justificativa do gerador; foi usado só para identificar os arquivos com version movida e não entrou em nenhum julgamento"
---

# Relatório de validação — dirigibilidade

## Issues

### ISSUE-01

- severidade: error
- verificação: F5 — campo numérico sem sufixo de unidade (D-FS-06)
- arquivo: `api/API-0003-saida-dos-ensaios.md`
- localização: tabela "Campos medidos por `benchId`", linha `DRIFT_MANEUVER` / `driftScore`; `rules/RULE-0002-ensaios-e-limiares.md`, tabela Ensaios, linha `DRIFT_MANEUVER`, colunas Medição e Veredito
- achado: `driftScore` é campo numérico cuja unidade ("pontos") está só na coluna Unidade; o nome não carrega sufixo de unidade, ao contrário de todos os demais campos numéricos do contrato.
- esperado: o campo numérico da pontuação da manobra de drift tem nome com o sufixo da sua unidade, em `API-0003` e em toda citação do conjunto (`RULE-0002`; `FEAT-0003`, requisito 07 e critérios de aceite), com a troca registrada na Compatibilidade de `API-0003`.

### ISSUE-02

- severidade: warning
- verificação: F3 — consistência entre arquivos (campo obrigatório sem valor definido em desfechos que a regra especifica)
- arquivo: `api/API-0003-saida-dos-ensaios.md`
- localização: tabela "Campos medidos por `benchId`", linha `UNDERSTEER_ONSET` / `v1Mps` (Obrigatório "sim"); `rules/RULE-0002-ensaios-e-limiares.md`, seção "Fim da varredura de início do subesterço" e tabela Ensaios, linha `UNDERSTEER_ONSET`, coluna Medição
- achado: `v1Mps` é obrigatório em todo registro `UNDERSTEER_ONSET`, mas V1 é a menor velocidade medida (patamar completo) em cujo patamar `understeer` passa de 200 ms, e `RULE-0002` especifica desfechos alcançáveis sem esse patamar: saída da faixa durante o primeiro patamar (`OFF_ASPHALT`, ou `MEASUREMENT_MISSING` sem nenhum patamar completo) e fim natural da varredura em que o `understeer` acima de 200 ms só ocorre no patamar interrompido pela saída, que não é velocidade medida.
- esperado: `v1Mps` declara a condição em que está presente (como `v0Mps` com `baselineAvailable` e `recoveryMs` com `gripReached`), e `API-0003` e `RULE-0002` dizem o veredito e o `failReason` do `UNDERSTEER_ONSET` quando V1 não existe, a partir do requisito 04 de `FEAT-0002`.

### ISSUE-03

- severidade: warning
- verificação: F3 — consistência entre arquivos (desfecho da regra sem motivo nem campos no registro)
- arquivo: `rules/RULE-0002-ensaios-e-limiares.md`
- localização: tabela Ambientes de ensaio, linha `TEST_PAD`, coluna "Grama e parede" ("fora da faixa … o passo falha o ensaio, salvo em `UNDERSTEER_ONSET`"); `api/API-0003-saida-dos-ensaios.md`, tabela Erros, linha `OFF_ASPHALT`, e tabela "Campos medidos por `benchId`", linhas `STEER_RESPONSE`; `flows/FLOW-0002-ensaio-deterministico-e-piloto-de-teste.md`, tabela Alternativas
- achado: pela linha `TEST_PAD`, um passo fora da faixa falha também o `STEER_RESPONSE` (reta da pista de teste), mas a condição de `OFF_ASPHALT` de `API-0003` não inclui `STEER_RESPONSE`, o registro `STEER_RESPONSE` não carrega `offAsphaltStepCount`, `offAsphaltFirstStep` nem a posição da saída, e `FLOW-0002` não tem a alternativa; esse `FAIL` fica sem `failReason` nem campos definidos.
- esperado: o desfecho da saída da faixa no `STEER_RESPONSE` é especificado do mesmo modo em `RULE-0002`, em `API-0003` (condição de erro e campos do registro) e em `FLOW-0002` (tabela Alternativas).

## Divergences

Nenhuma.

## Coverage

- critérios cobertos: AC-US-0001-01 a AC-US-0001-06 (FEAT-0001), AC-US-0002-01 a AC-US-0002-06 (FEAT-0002; AC-US-0002-06 pelo requisito 10), AC-US-0003-01 a AC-US-0003-07 (FEAT-0003), AC-US-0004-01 a AC-US-0004-07 (FEAT-0004), AC-US-0005-01 a AC-US-0005-06 (FEAT-0005); NFR-0001 e NFR-0009 (FEAT-0005), NFR-0002 a NFR-0008 (FEAT-0006); descobertos: nenhum.
- requisitos sem fonte: nenhum.
- contratos sem consumidor: nenhum (`API-0001`: FEAT-0001 a FEAT-0004, FLOW-0001, SCR-0001; `API-0002`: FEAT-0005, FLOW-0003, SCR-0002; `API-0003`: FEAT-0001 a FEAT-0006, FLOW-0002).
