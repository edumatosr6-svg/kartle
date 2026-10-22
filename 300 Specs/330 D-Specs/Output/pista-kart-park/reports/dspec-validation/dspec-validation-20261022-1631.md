---
stage: dspec
feature: pista-kart-park
verdict: SUCCESS
generated: 2026-10-22T16:31:30Z
counts: {blocker: 0, error: 0, warning: 0, info: 0, divergence: 13}
seed: {revision: 1, digest: b5aa5be4734a}
upstream: {stage: fspec, version: 1.0.1}
feedbacks: []
feedbacks-pending: ["300 Specs/330 D-Specs/Output/race-lap-validation/reports/feedbacks/pista-kart-park/feedback-20261022-1614.md"]
previous: "dspec-validation-20261022-1614.md (FAIL, 0/3/2/0); ISSUE-01 a ISSUE-05 reverificados e resolvidos; ISSUE-06 (scope) continua de pé e já está em FB-01, pendente em race-lap-validation (a última validação D-Spec de lá é 20261020-1923), por isso não foi reenviado"
population: "revalidação (§8): as 6 issues do relatório anterior; os arquivos com version movida (01-architecture.md, 97-changelog.md, 98-divergences.md, test-strategy.md, core/DES-0003, core/DES-0005, core/DES-0006, data/DM-0002, pipeline/DES-0010, pipeline/DES-0011, security/DES-0012, web/DES-0007, web/DES-0009); dois arquivos intocados sorteados: core/DES-0004, adr/ADR-0004"
isolation: "nenhuma justificativa do gerador chegou pela invocação; 97-changelog.md foi examinado só por busca dirigida (OPEN, TBD, segredo) e não pesou em nenhum julgamento"
status-stamp: "status: validated aplicado ao front matter de todos os arquivos do conjunto que liam draft; as células Status da tabela de 00-index.md são geradas e passam a refletir o estado no próximo lint_artifacts.py --emit"
---

# Relatório de validação D-Spec — pista-kart-park

## Summary

- verdict: SUCCESS
- blocker: 0
- error: 0
- warning: 0
- scope: 1 (ISSUE-01, fora do veredito, já enviado como FB-01 em 20261022-1614)
- divergence: 13, todas `open`, em `98-divergences.md`

## Issues

### ISSUE-01

- severity: scope
- check: D5 — I3 (contrato publicado do arquivo de pista: versão de esquema 2 para 3)
- file: core/DES-0001-leitura-do-dado-de-pista-em-esquema-3.md
- location: seção "Interface", linha `TRACK_SCHEMA_VERSION`; reverificação de ISSUE-06 de dspec-validation-20261022-1614.md
- finding: o projeto de `race-lap-validation` ainda fixa `TRACK_SCHEMA_VERSION` em 2 (`core/DES-0006-leitura-do-dado-de-pista.md:37` daquele conjunto) e os testes `tests/race-lap-validation-track-data.test.ts:20` e `:24-30` ainda provam o literal 2 e `schemaVersion` 3 como `UNSUPPORTED_SCHEMA`, o que REQ-FEAT-0002-02 e -16 deste projeto tornam falso.
- expected: decidido por `race-lap-validation` a partir de FB-01 (`300 Specs/330 D-Specs/Output/race-lap-validation/reports/feedbacks/pista-kart-park/feedback-20261022-1614.md`), ainda pendente; não entra neste veredito.

## Divergences

### REQ-FEAT-0002-02, -16; API-0001
- estado: open
- hoje: `src/trackData.ts:5`, `:89`
- fecha: DES-0001, DM-0001, ADR-0001

### REQ-FEAT-0002-01, -03 a -11, -14, -17, -18; REQ-FEAT-0003-01 a -07; REQ-FEAT-0004-01 a -03; REQ-FEAT-0005-01 a -03; REQ-FEAT-0006-09
- estado: open
- hoje: `package.json:6-13`; sem `src/tracks/`, `tracks/` nem preparo em `scripts/`
- fecha: DES-0010, DES-0011, DM-0001, DM-0002, ADR-0002, ADR-0006

### REQ-FEAT-0001-01 a -12, -14; API-0002
- estado: open
- hoje: `index.html:19`; `src/main.ts:152`, `:155`, `:208-218`
- fecha: DES-0005, DES-0007

### REQ-FEAT-0002-12, REQ-FEAT-0005-05, -08, -09; API-0003
- estado: open
- hoje: `src/physics.ts:9`, `:143`, `:162`, `:215`, `:229-230`, `:252`, `:300-302`, `:318`, `:321-336`
- fecha: DES-0002, DES-0003, ADR-0004

### REQ-FEAT-0004-04 a -07
- estado: open
- hoje: `src/physics.ts:276-290`
- fecha: DES-0003, ADR-0003

### REQ-FEAT-0003-10, -11, REQ-FEAT-0005-06, -07
- estado: open
- hoje: `src/lap.ts:218-220`, `:245-252`
- fecha: DES-0004, DES-0002

### REQ-FEAT-0002-12 (reposicionamento), REQ-FEAT-0001-08
- estado: open
- hoje: `src/lap.ts:154-161`, `:109-112`
- fecha: DES-0004

### REQ-FEAT-0003-08, -12, -13, -14, -15
- estado: open
- hoje: `src/lap.ts:223-252`
- fecha: DES-0004, DES-0005, DES-0010

### REQ-FEAT-0002-13, REQ-FEAT-0004-08, REQ-FEAT-0005-04; REQ-FEAT-0007-01, -02
- estado: open
- hoje: `src/main.ts:44-110`, `:289-297`
- fecha: DES-0008

### REQ-FEAT-0005-10 a -19
- estado: open
- hoje: `src/audio.ts:1-43`
- fecha: DES-0009

### REQ-FEAT-0006-01 a -08, -10 a -13
- estado: open
- hoje: `index.html:17`, `:19`, `:25`
- fecha: DES-0005, DES-0007, DES-0012

### REQ-FEAT-0007-03, -04, -06, -07
- estado: open
- hoje: `tests/race-lap-validation-layering.test.ts:9-10`
- fecha: DES-0006, test-strategy.md

### REQ-FEAT-0007-13, REQ-FEAT-0006-14
- estado: open
- hoje: `package.json:6-13`; `index.html:19`, `:25`
- fecha: DES-0011, DES-0012, ADR-0005

## Coverage

- requisitos cobertos: 101 de 101 (REQ-FEAT-0001-01 a REQ-FEAT-0007-13)
- requisitos sem cobertura: nenhum
- itens de projeto sem fonte: nenhum
- critérios sem caminho de teste alcançável: nenhum (53 de 53)
