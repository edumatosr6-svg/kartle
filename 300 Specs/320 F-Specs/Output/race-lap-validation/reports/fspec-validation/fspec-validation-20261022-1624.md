---
stage: fspec
feature: race-lap-validation
verdict: SUCCESS
generated: 2026-10-22T16:24:46Z
counts: {blocker: 0, error: 0, warning: 0, info: 1, divergence: 0}
seed: {revision: 2, digest: ee91c5706be1}
upstream: {stage: req, version: 2.2.0}
feedbacks: []
---

# Relatório de validação do F-Spec — race-lap-validation

## Summary

- Rodada: revalidação; relatório anterior `fspec-validation-20261020-1856.md` (SUCCESS, 0 issues).
- População (conventions §8): issues anteriores: nenhuma; arquivos com `version:` movida: `02-glossary.md` 1.1.0, `97-changelog.md` 1.1.0, `api/API-0001` 1.1.0, `api/API-0002` 1.1.0, `screens/SCR-0003` 1.1.0; amostra aleatória de dois intocados: `rules/RULE-0003`, `features/FEAT-0004`.
- Entrada da rodada: FB-01 de `dirigibilidade` (`reports/feedbacks/dirigibilidade/feedback-20261021-1647.md`), aplicado em Mode C.
- Nomes de `dirigibilidade` citados pelos arquivos alterados (`compareLapRecords`, `getSetupVersion`, `previousSetupVersion`, `UNKNOWN_SETUP`, `readReplay`, valores de `setupId` e `comparability`, `AC-US-0005-05`) verificados por nome apenas: todos existem em `320 F-Specs/Output/dirigibilidade/api/API-0002-versao-do-acerto.md` (`status: validated`) e em `230 Output/dirigibilidade/stories/US-0005`.
- Racional do gerador: nenhum recebido do chamador; o motivo da aceitação de FB-01 registrado em `97-changelog.md` (rodada 3) não foi usado como evidência, só o fato da aceitação e do que foi recusado.
- Itens do gate (front matter, ids, índice, traceabilidade, arquivos obrigatórios, `OPEN`/`TBD`) não rejulgados (§13).

## Issues

### ISSUE-01

- severidade: info
- verificação: F4 — cobertura dos requisitos nos dois sentidos (`AC-*` citado que não pertence aos requisitos desta feature)
- arquivo: `screens/SCR-0003-resultado-da-volta.md`
- localização: seção "Comparação de tempos", linha 55
- achado: o texto cita `AC-US-0005-05` com o id sem qualificador de feature; nos requisitos desta feature `US-0005` tem apenas `AC-US-0005-01` a `AC-US-0005-04`, e o id só se resolve nos requisitos de `dirigibilidade` (a prosa diz "daquela feature", mas o id lido isolado é um critério inexistente neste conjunto).
- esperado: citar o id qualificado (`dirigibilidade/AC-US-0005-05`) ou citar só `FB-01`, de modo que nenhum `AC-*` fora da lista desta feature apareça no conjunto.

## Divergences

Nenhuma.

## Coverage

- `AC-*` dos requisitos: 72 cobertos, 0 descobertos.
- NFR-0001 a NFR-0012: 12 realizados, 0 descartados.
- Requisitos `REQ-*` sem origem: 0 (129 ids).
- Contratos sem consumidor: 0 (nenhum contrato novo nesta rodada; `API-0001` e `API-0002` seguem consumidos por `SCR-0003` e pelos fluxos).
- Contratos consumidos de fora do conjunto: `compareLapRecords` e `getSetupVersion` (`dirigibilidade`, `API-0002`), referidos por nome em `API-0001`, `API-0002` e `SCR-0003`; nenhum estado de tela desta feature os chama (F6 sem erro).
