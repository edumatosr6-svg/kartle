---
stage: fspec
feature: dirigibilidade
verdict: SUCCESS
generated: 2026-10-22T15:42:40Z
counts: {blocker: 0, error: 0, warning: 0, info: 0, divergence: 0}
seed: {revision: 3, digest: 7dd24c8b6cab}
upstream: {stage: req, version: 3.2.0}
feedbacks: []
population: "revalidação após fspec-validation-20261022-1530: ISSUE-01 a ISSUE-03 daquele relatório reverificadas, todas fechadas (driftScore renomeado para driftScorePoints em API-0003, RULE-0002 e FEAT-0003, com a troca na Compatibilidade de API-0003; v1Mps condicional a V1 medida, com veredito e failReason sem V1 em API-0003, RULE-0002, FEAT-0002 e FLOW-0002; saída da faixa no STEER_RESPONSE especificada do mesmo modo em RULE-0002, API-0003 e FLOW-0002); arquivos com version movida: 02-glossary.md, 97-changelog.md, api/API-0003, features/FEAT-0002, features/FEAT-0003, flows/FLOW-0002, rules/RULE-0002 (00-index.md e 99-traceability.md são gerados e ficam com o lint); dois arquivos intocados sorteados (random.SystemRandom): features/FEAT-0004, api/API-0001; cobertura F4 sobre a lista completa de AC-* e NFR-* dos requisitos"
isolation: "97-changelog.md traz a justificativa do gerador; os arquivos com version movida foram identificados pela data de modificação, não pelo changelog, e trechos dele que apareceram numa busca foram ignorados e não entraram em nenhum julgamento"
---

# Relatório de validação — dirigibilidade

## Issues

Nenhuma.

## Divergences

Nenhuma.

## Coverage

- critérios cobertos: AC-US-0001-01 a AC-US-0001-06 (FEAT-0001), AC-US-0002-01 a AC-US-0002-06 (FEAT-0002), AC-US-0003-01 a AC-US-0003-07 (FEAT-0003), AC-US-0004-01 a AC-US-0004-07 (FEAT-0004), AC-US-0005-01 a AC-US-0005-06 (FEAT-0005); NFR-0001 a NFR-0009 (FEAT-0005, FEAT-0006); descobertos: nenhum.
- requisitos sem fonte: nenhum.
- contratos sem consumidor: nenhum (`API-0001`: FEAT-0001 a FEAT-0004, FLOW-0001, FLOW-0002, SCR-0001; `API-0002`: FEAT-0005, FEAT-0006, FLOW-0003, SCR-0002; `API-0003`: FEAT-0001 a FEAT-0006, FLOW-0002).
