---
stage: fspec
feature: pista-kart-park
verdict: SUCCESS
generated: 2026-10-22T15:22:17Z
counts: {blocker: 0, error: 0, warning: 0, info: 0, divergence: 0}
seed: {revision: 1, digest: b5aa5be4734a}
upstream: {stage: req, version: 1.0.0}
feedbacks: []
previous: fspec-validation-20261022-1511.md (FAIL, 0/5/3/0); ISSUE-01 a ISSUE-08 reverificados e resolvidos
population: "revalidação (§8): as 8 issues do relatório anterior; os arquivos com version movida (97-changelog.md, api/API-0002, features/FEAT-0001, FEAT-0002, FEAT-0003, FEAT-0005, FEAT-0006, flows/FLOW-0001, FLOW-0003, screens/SCR-0001, SCR-0002); dois arquivos intocados sorteados: rules/RULE-0005, rules/RULE-0002"
isolation: 97-changelog.md traz o raciocínio do gerador; foi examinado só por busca dirigida (vazamento de projeto, OPEN, TBD) e não pesou em nenhum julgamento. Nenhuma justificativa chegou pela invocação.
status-stamp: "status: validated aplicado ao front matter de todos os arquivos do conjunto; as células Status da tabela de 00-index.md são geradas e passam a refletir o estado no próximo lint_artifacts.py --emit"
---

# Relatório de validação F-Spec — pista-kart-park

## Issues

Nenhuma.

## Divergences

Nenhuma; 98-divergences.md não tem linhas.

## Coverage

- Critérios cobertos: 53 de 53 `AC-*` (US-0001 a US-0006), cada um citado por ao menos um `REQ-*`.
- Critérios descobertos: nenhum.
- NFRs: 12 de 12 realizados por requisitos; nenhum adiado ao D-Spec.
- Requisitos sem fonte: nenhum; todo SHALL da população cita um `AC-*` ou um `NFR-*` dos requisitos, ou leva `[DOMAIN]`.
- Contratos sem consumidor: nenhum na população (API-0002 é chamado por FLOW-0001, SCR-0001 e SCR-0002).
