---
stage: fspec
feature: dirigibilidade
verdict: SUCCESS
generated: 2026-10-21T16:56:33Z
counts: {blocker: 0, error: 0, warning: 1, info: 0, divergence: 0}
seed: {revision: 1, digest: 8cc4724d94c7}
upstream: {stage: req, version: 1.0.0}
feedbacks: []
population: "revalidação após fspec-validation-20261021-1647: ISSUE-01 (api/API-0003), ISSUE-02 (97-changelog.md), ISSUE-03 (rules/RULE-0001) do relatório anterior; arquivos com version movida: api/API-0003 1.1.0, rules/RULE-0001 1.0.2, rules/RULE-0002 1.0.1, features/FEAT-0002 1.0.1, features/FEAT-0004 1.0.1, features/FEAT-0006 1.0.1, 02-glossary.md 1.0.1, 97-changelog.md 1.0.3; dois arquivos intocados sorteados: screens/SCR-0001, screens/SCR-0002; grep de Kmh/KmhS, OPEN-/TBD e caminhos de módulo sobre todo o conjunto"
---

# Relatório de validação — dirigibilidade

## Issues

### ISSUE-01

- severidade: warning
- verificação: F8 — vazamento de projeto (módulo, caminho ou pasta de código nomeados fora de citação das Restrições do seed)
- arquivo: `97-changelog.md`
- localização: linhas 117–118, entrada "rodada 3, Mode B", item ISSUE-02
- achado: ao registrar a remoção da frase de layout, a entrada repete os caminhos removidos (`src/`, `tests/`, `src/physics.ts`, `scripts/`); os nomes aparecem só como citação do texto retirado, acompanhada da afirmação de que esta etapa não registra layout de código, e nenhum arquivo de especificação os carrega (grep do conjunto fora de `reports/` e do changelog: nenhuma ocorrência). Não é decisão de projeto lida pela etapa seguinte; registrado para que a citação não sobreviva na próxima rodada.
- esperado: a linha do changelog refere "a frase de layout de código da entrada da rodada 1" sem reproduzir os caminhos.

## Divergences

Nenhuma. `98-divergences.md` está bem formado e vazio.

## Coverage

- ISSUE-01 anterior (D-FS-06, `API-0003`): fechado. Todos os campos medidos são SI com a unidade no sufixo (`entrySpeedMps`, `v0Mps`, `v1Mps`, `entrySpeedStepMps`, `zeroToSixtyKmhMs` em ms, `topSpeedMps`, `speedAfterOneSMps`, `speedBeforeContactMps`/`speedAfterContactMps`); o cabeçalho e cada linha afetada dizem que a apresentação em km/h ou s é da saída serializada e de `docs/physics.md` (AC-US-0002-05, AC-US-0004-07). Nomes novos carregados a `RULE-0002` (tabela de ensaios e nota de conversão), `FEAT-0002` REQ-06 e critérios, `FEAT-0004` REQ-07 e critérios, `FEAT-0006` REQ-08 e `02-glossary.md`; nenhuma ocorrência de `Kmh` restante fora de `zeroToSixtyKmhMs`, cujo sufixo de unidade é `Ms`.
- ISSUE-02 anterior (`97-changelog.md`, rodada 1): fechado; a frase de layout não consta mais da entrada da rodada 1 (ver ISSUE-01 deste relatório para a citação residual na rodada 3).
- ISSUE-03 anterior (`RULE-0001`): fechado; a frase limita a garantia de classe ao passo de entrada e atribui a exigência de `grip` ou `understeer` em todos os passos a AC-US-0003-01, qualquer que seja a classe; a citação ao requisito 02 de FEAT-0003 resolve por link relativo.
- F2 nos arquivos movidos: todo `REQ-FEAT-000{2,4,6}-nn` usa um único modal e cita `AC-*`, `NFR-*` ou `[DOMAIN]` com o item dos requisitos; cada SHALL coberto por critério de aceite do próprio arquivo.
- F3 nos arquivos movidos e sorteados: `NO_STATE` (SCR-0001) definido em `API-0001`; `UNREADABLE`, `UNSUPPORTED_FORMAT`, `INCOMPLETE_RECORD` (SCR-0002) definidos em `API-0002`; `getHandlingTelemetry`, `readReplay`, `getSetupVersion`, `compareLapRecords` resolvem às operações de `API-0001`/`API-0002`; enums de `benchId`, `failReason`, `inputMode`, `throttleCondition` coerentes entre `API-0003`, `RULE-0002` e o glossário.
- F4: critérios cobertos 31 de 31 (inalterado do relatório anterior; os arquivos movidos não removeram nem acrescentaram requisito); NFR 9 de 9 realizados; requisitos sem fonte: nenhum; contratos sem consumidor: nenhum (API-0001 lido por SCR-0001 e FLOW-0001; API-0002 por SCR-0002 e FLOW-0003; API-0003 por FLOW-0002 e FEAT-0002/0004/0006).
- F5 em `API-0003` 1.1.0: nomes planos com unidade no sufixo (D-FS-06), obrigatoriedade e padrão por campo, Auth com motivo de ausência de papel, superfície de erro completa, idempotência por leitura pura, compatibilidade sem renomear campo publicado.
- F6 em SCR-0001 e SCR-0002: estados Carregando, Vazio, Populado, Erro, Permissão negada e Offline presentes nos dois canais, cada um com as chamadas nomeadas e resolvidas em `api/`.
- F7 em `RULE-0001` e `RULE-0002`: limiares citam `DOMAIN/DEC-nn` ou `SEED/*` via `AC-*`; idempotência e ordem por `simStepCount` declaradas.
- F9: nenhum `OPEN-` nem `TBD` no conjunto.
- Carimbo: `status: validated` gravado no front matter dos 22 arquivos do conjunto que liam `draft` (incluindo `00-index.md`); nenhum front matter lê `draft`. A coluna Status da tabela de `00-index.md` é gerada por `lint_artifacts.py --emit` e não foi editada; ela passa a `validated` na próxima regeneração do gate.

## Contexto recebido fora do procedimento

- A requisição do usuário retransmitida pelo harness ("a janela está visível, pode rodar as medições") não diz respeito a esta validação e foi ignorada; nenhuma medição foi executada por esta etapa.
- `97-changelog.md` registra os motivos das escolhas de forma do gerador; essa justificativa não entrou no julgamento.
