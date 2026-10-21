---
stage: fspec
feature: race-lap-validation
verdict: FAIL
generated: 2026-10-20T18:53:00Z
counts: {blocker: 0, error: 2, warning: 1, info: 0, divergence: 0}
seed: {revision: 2, digest: ee91c5706be1}
feedbacks: []
---

# Relatório de validação do F-Spec — race-lap-validation

## Issues

### ISSUE-01
- severity: error
- check: F7 (D-FS-03)
- file: flows/FLOW-0003-pausa-e-retomada.md
- location: "Alternativas, erros e eventos fora de ordem"; diagrama de sequência
- finding: o fluxo recebe eventos externos (Esc, perda de foco da aba, perda do sensor) e trata o repetido como `ALREADY_PAUSED`, mas não diz onde a deduplicação acontece (FLOW-0001 e FLOW-0002 dizem "na simulação").
- expected: declarar no fluxo que a deduplicação do `pauseLap`/`resumeLap` repetido ocorre na simulação, pelo estado `lapPhase`.

### ISSUE-02
- severity: error
- check: F3
- file: screens/SCR-0001-corrida-hud-da-volta.md; screens/SCR-0003-resultado-da-volta.md
- location: SCR-0001 estado "Erro" (rejeição de `startLap`); SCR-0003 estado "Erro"
- finding: as telas exibem "mensagem de erro em texto, nos dois idiomas" para rejeições de `startLap` (`LAP_ALREADY_ACTIVE`, `OFFICIAL_NOT_AVAILABLE`) e para resultado ausente, mas RULE-0006 só define `trackDataError` (`UNREADABLE`/`UNSUPPORTED_SCHEMA`); as demais mensagens são usadas e não definidas.
- expected: definir em RULE-0006 as chaves pt/en dessas mensagens, ou dizer que a rejeição não é exibida.

### ISSUE-03
- severity: warning
- check: F5
- file: api/API-0003-dado-de-pista.md
- location: "Campos do arquivo de pista"; parágrafo "Uma linha é um segmento..."
- finding: o texto afirma que "a lista de linhas é o único aninhamento do contrato", mas `startPosition` (`{xM, zM}` + `headingDeg`) e `finishLine` também são valores estruturados, contra o campo plano.
- expected: achatar (`startXM`, `startZM`, `startHeadingDeg`, etc.) ou corrigir a afirmação.

## Divergences

None.

## Coverage

AC-* dos requisitos: 72 cobertos, 0 descobertos (US-0001 a US-0009). NFR-0001 a NFR-0012: 12 realizados, 0 descartados. Requisitos sem origem (AC, NFR ou [DOMAIN]): 0. Contratos sem consumidor: 0.
