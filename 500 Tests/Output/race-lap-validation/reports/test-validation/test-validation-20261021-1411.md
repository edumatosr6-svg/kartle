---
stage: test
feature: race-lap-validation
verdict: SUCCESS
generated: 2026-10-21T14:11:13Z
run: {collected: 170, passed: 170, failed: 0, skipped: 0, fresh: true}
counts: {blocker: 0, error: 0, warning: 2, info: 5, divergence: 27}
seed: {revision: 2, digest: ee91c5706be1}
upstream: {stage: code, version: n/a}
checks: {before: 0, after: 138, migrated: 0, removed: 0}
---

# Relatório de validação de testes — race-lap-validation

## Verification status

- criteria verified: 57 de 84 (50 `AC-US-*` de 72 e 7 `NFR-*` de 12) — decididos integralmente por `npm test`, 138 verificações `CHK-TEST-*` todas executadas e aprovadas.
- unverified: 27 — cada um com a metade de simulação provada em `npm test` e a metade de tela, aparelho ou navegador pendente do roteiro registrado `E2E-nn` (sem ferramenta no projeto, estratégia validada), exceto NFR-0003 e NFR-0008, sem nenhuma verificação automática possível (I9): AC-US-0001-02, AC-US-0001-03, AC-US-0001-09, AC-US-0001-10, AC-US-0002-01, AC-US-0002-02, AC-US-0002-03, AC-US-0002-09, AC-US-0003-05, AC-US-0003-06, AC-US-0003-07, AC-US-0004-04, AC-US-0006-05, AC-US-0007-02, AC-US-0008-01, AC-US-0008-03, AC-US-0008-04, AC-US-0009-01, AC-US-0009-04, AC-US-0009-07, AC-US-0009-08, AC-US-0009-09, NFR-0003, NFR-0004, NFR-0006, NFR-0007, NFR-0008. Ver Divergências.
- covered only by a skip: 0.
- T1: execução de 2026-10-21 14:10Z posterior à última edição de `src/` (13:31Z) e de `tests/` (14:03Z); 170 casos no junit = 138 da feature + 32 pré-existentes, 0 falhas, 0 pulados, 0 cancelados; sem histórico anterior, logo sem flake observável.
- T2: 72/72 `AC-US-*` e 10/12 `NFR-*` com linha em `99-traceability.md`; 138/138 `CHK-*` existem em `tests/`, aparecem no junit e nos registros `TEST-*`; 0 verificações sem critério.
- T4: nenhuma verificação falhou; nada a classificar.
- T5: idempotência provada com o mesmo pedido repetido (CHK-TEST-0012-06, -07, -08, CHK-TEST-0007-11); RBAC, migração, offline e token não se aplicam (sem endpoint, papel, banco ou árvore nativa; API-0001/0002/0003).

## Failures

Nenhuma.

## Issues

### ISSUE-01
- severity: warning
- check: T3
- file: `tests/race-lap-validation-contract.test.ts`
- location: linha 104, CHK-TEST-0012-07
- finding: a asserção `assert.equal(getLapState(paused.lap).toString(), getLapState(paused.lap).toString(), ...)` compara `[object Object]` consigo mesma e nunca falha; a verificação continua decidindo AC-US-0003-08 pelas demais asserções (instantâneo JSON e `pauseCause`).
- expected: a asserção compara duas leituras por `deepEqual` ou é removida.

### ISSUE-02
- severity: warning
- check: T3
- file: `tests/race-lap-validation-crossing.test.ts`, `tests/race-lap-validation-state.test.ts`
- location: linha 30 (CHK-TEST-0002-03, `c.fraction === 1`); linha 64 (CHK-TEST-0004-04, `kart.speed === 0`)
- finding: igualdade exata sobre valores de ponto flutuante; ambos são valores exatos exigidos pela especificação (fração 1 no cruzamento coincidente, velocidade 0 na largada) e representáveis sem erro, por isso não bloqueiam.
- expected: tolerância explícita ou comentário fixando que o valor exato é o contrato.

### ISSUE-03
- severity: info
- check: T3
- file: `tests/race-lap-validation-frozen.test.ts`
- location: linha 59, CHK-TEST-0014-05
- finding: fixa literalmente a linha 3 de `src/physics.ts`; uma reformatação sem mudança de comportamento a faria falhar. A fixação é nomeada por DES-0012 (linha 24) e o comportamento é decidido pelas demais asserções do mesmo check.
- expected: nenhuma ação nesta rodada; registrado para a próxima revisão de DES-0012.

### ISSUE-04
- severity: info
- check: T2
- file: `tests/race-lap-validation-validity.test.ts`
- location: CHK-TEST-0005-11 (AC-US-0004-06)
- finding: a fixture da estratégia (excursão lateral dirigida de 10,5 m em torno do marcador 2) foi substituída por salto semeado do kart para depois do marcador 2 com `markersPassedCount` 1, por ser inalcançável na pista sintética publicada (changelog, rodada 1); o critério segue decidido na pista publicada com estado semeado, recurso previsto na estratégia.
- expected: a estratégia (dspec) atualiza a descrição da fixture na próxima rodada; nada a corrigir nos testes.

### ISSUE-05
- severity: info
- check: T2
- file: `tests/race-lap-validation-cut.test.ts`
- location: CHK-TEST-0006-03, CHK-TEST-0006-04 (AC-US-0006-03)
- finding: o deslocamento constante de 2 m da estratégia foi ajustado para 1,5 m no autopilot (máximo medido 2,62 m, afirmado ≤ 3 m pelo oráculo) mais um kart parado a 2 m por 600 passos; o critério segue decidido.
- expected: nenhuma ação; registrado para a estratégia.

### ISSUE-06
- severity: info
- check: T1
- file: `500 Tests/Output/race-lap-validation/98-divergences.md`
- location: níveis Web E2E e Mobile E2E
- finding: os níveis definidos pela estratégia como roteiro registrado (`E2E-01` a `E2E-11`) não executaram nesta rodada, por ausência de ferramenta e por decisão de não acrescentar dependência; a ausência está declarada, não silenciosa, e cada critério afetado está na tabela de divergências com o roteiro que o decide.
- expected: registro humano em `docs/lap-validation-device-log.md` antes da promoção; nenhum critério ali é decidível por `npm test`.

### ISSUE-07
- severity: info
- check: T5
- file: `500 Tests/Output/race-lap-validation/TEST-0012-contrato-da-volta.md`
- location: nota final
- finding: verificações de acesso não autenticado, papel recusado, migração up/down, offline e falha de token não se aplicam: os contratos não definem endpoint, sessão, papel além de `player` anônimo, banco nem árvore móvel.
- expected: nenhuma ação.

## Divergences

Cada linha abaixo vem de `98-divergences.md`, foi julgada legítima (a parte não verificada exige tela, sensor, taxa de quadros ou navegador nomeado; nenhuma é decidível por `npm test`) e não contribui para o veredito. Estado: `open`; quem deve: registro humano em `docs/lap-validation-device-log.md`.

| Id | Provado em `npm test` | Pendente (roteiro) |
|---|---|---|
| AC-US-0001-02 | CHK-TEST-0010-01 | texto renderizado no HUD (E2E-01) |
| AC-US-0001-03 | CHK-TEST-0010-02 | texto renderizado (E2E-01) |
| AC-US-0001-09 | CHK-TEST-0011-01 | tamanho medido no aparelho (E2E-01) |
| AC-US-0001-10 | CHK-TEST-0011-02 | contraste medido na cena (E2E-01) |
| AC-US-0002-01 | CHK-TEST-0005-01 | exibição (E2E-02) |
| AC-US-0002-02 | CHK-TEST-0004-07 | exibição `m:ss.mmm` (E2E-02) |
| AC-US-0002-03 | CHK-TEST-0004-08 | exibição (E2E-02) |
| AC-US-0002-09 | CHK-TEST-0004-10 | exibição por quadro (E2E-02) |
| AC-US-0003-05 | CHK-TEST-0004-12 | tecla Esc gera `pauseLap('ESC_KEY')` (E2E-03) |
| AC-US-0003-06 | CHK-TEST-0004-13 | evento do navegador gera `pauseLap('FOCUS_LOST')` (E2E-04) |
| AC-US-0003-07 | CHK-TEST-0004-14 | vigilância do sensor no celular (E2E-05) |
| AC-US-0004-04 | CHK-TEST-0010-06 | exibição (E2E-02) |
| AC-US-0006-05 | CHK-TEST-0010-07, CHK-TEST-0006-10 | exibição (E2E-02) |
| AC-US-0007-02 | CHK-TEST-0010-08 | exibição após tecla ou toque (E2E-02) |
| AC-US-0008-01 | CHK-TEST-0007-06, CHK-TEST-0010-10 | exibição (E2E-02) |
| AC-US-0008-03 | CHK-TEST-0007-08 | ausência da opção na tela (E2E-06) |
| AC-US-0008-04 | CHK-TEST-0007-09 | oferta e pilotagem na tela (E2E-06) |
| AC-US-0009-01 | CHK-TEST-0004-19, CHK-TEST-0012-01 | observação por quadro (E2E-02) |
| AC-US-0009-04 | CHK-TEST-0010-13 | escala de cinza (E2E-09) |
| AC-US-0009-07 | CHK-TEST-0010-16 | `navigator.language` trocado (E2E-07) |
| AC-US-0009-08 | CHK-TEST-0011-03 | contraste medido (E2E-07) |
| AC-US-0009-09 | CHK-TEST-0011-04 | tamanho medido no celular (E2E-07) |
| NFR-0003 | — | fps nos aparelhos nomeados (E2E-10) |
| NFR-0004 | CHK-TEST-0013-03 | 0 requisições com rede bloqueada (E2E-08) |
| NFR-0006 | CHK-TEST-0010-13, CHK-TEST-0011-03 | legibilidade em escala de cinza (E2E-09) |
| NFR-0007 | CHK-TEST-0010-17 | idioma do navegador (E2E-07) |
| NFR-0008 | — | mesmo tempo ao ms nos quatro navegadores (E2E-11; sequência: `reference.inputs` de TEST-0008) |
