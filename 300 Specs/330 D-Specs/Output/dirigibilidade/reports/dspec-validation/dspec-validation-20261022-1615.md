---
stage: dspec
feature: dirigibilidade
verdict: SUCCESS
generated: 2026-10-22T16:15:42Z
counts: {blocker: 0, error: 0, warning: 0, info: 2, divergence: 17}
seed: {revision: 3, digest: 7dd24c8b6cab}
upstream: {stage: fspec, version: 3.2.0, status: validated, index-generated: 2026-10-22T15:43:08Z}
feedbacks: []
population: "revalidação após dspec-validation-20261022-1331 (FAIL): ISSUE-01 a ISSUE-06 daquele relatório reverificadas primeiro; arquivos com version movida: 01-architecture.md 2.2.0, 97-changelog.md 2.2.0 (só grep), 98-divergences.md 2.2.0, adr/ADR-0003 1.3.0, adr/ADR-0004 3.0.0, core/DES-0001 3.2.0, core/DES-0004 4.0.0, data/DM-0001 1.3.0, test-strategy.md 4.0.0; dois arquivos intocados sorteados (random.SystemRandom, fora dos já nomeados pelas issues anteriores): core/DES-0003, web/DES-0005; upstream movido desde o relatório anterior (API-0003 3.2.0, RULE-0002 3.2.0, FEAT-0002 3.2.0, FEAT-0003 3.0.1, FLOW-0002 3.2.0, AC-US-0002-06 e REQ-FEAT-0002-10 novos): API-0003 conferido campo a campo contra DES-0004 e o tipo as-built de scripts/handlingBench.ts:47-78; lista de REQ-* (62), AC-* (32) e NFR-* (9) do F-Spec comparada por script com os itens de projeto e com test-strategy.md; grep do conjunto por nomes retirados (driftScore, referenceCorner, cornerEntry, grassEnvironment, lapValidity); citações arquivo:linha da população conferidas numa passada (src/physics.ts, src/main.ts, src/setupRecords.ts, src/lap.ts, src/track.ts, scripts/handlingBench.ts, scripts/keyboard-lap.ts, scripts/physics-bench.ts, tests/physics.test.ts, tests/maneuvers.test.ts, tests/race-lap-validation-*.test.ts, index.html, docs/physics.md); blocos mermaid e links relativos por script; grep de segredos"
context-ignored: "nenhuma justificativa do gerador chegou a este passo; o corpo de 97-changelog.md não foi lido (só grep), e as seções Contexto/Alternativas dos ADR foram lidas só como conteúdo do artefato"
---

# Relatório de validação — dirigibilidade (D-Spec)

## Summary

- ISSUE-01 (D3, saída da faixa em `UNDERSTEER_ONSET`) fechada: `DES-0004:142`, `:224` e `ADR-0004` decisão 8 seguem RULE-0002 3.2.0 "Fim da varredura de início do subesterço" e API-0003 3.2.0 (Erros).
- ISSUE-02 (D3, `sectorMs`) fechada: `DES-0004:151`, `:226` fixam 4 inteiros; `test-strategy.md:112` afirma o comprimento 4.
- ISSUE-03 (D1, mermaid) fechada: nenhum `;` nem `#` nos blocos de `01-architecture.md`.
- ISSUE-04 (D8, E2E-02) fechada: `test-strategy.md:75` espera `—` ao voltar ao Arcade, como `DES-0006:51-52`.
- ISSUE-05 e ISSUE-06 (info) sem mudança; reportadas como ISSUE-01 e ISSUE-02.

## Issues

### ISSUE-01

- severidade: info
- verificação: D5 — I4 (chave mestra desligada por padrão)
- arquivo: `adr/ADR-0001-versao-do-acerto-como-registro-novo-no-codigo.md`; `core/DES-0001-acerto-arcade-assistido-v5-e-assistencias.md`
- localização: `ADR-0001` linhas 33–36 e 44–45; `DES-0001` linhas 208–216
- achado: sem chave mestra porque FEAT-0005 (Configuração) proíbe configuração para escolher entre o acerto antigo e o novo; o padrão sem mudança de I4 está nos campos opcionais ausentes em `RENTAL_KART`/`ARCADE_KART`, inclusive `forcingRampMps` (ausente = degrau as-built), com `REALISTA_UNCHANGED` como prova.
- esperado: nada a mudar.

### ISSUE-02

- severidade: info
- verificação: D3 — cobertura do F-Spec nos dois sentidos
- arquivo: `web/DES-0006-resultado-melhor-tempo-e-texto-compartilhado.md`; `adr/ADR-0002-formato-do-replay-e-registro-de-volta-em-memoria.md`
- localização: `DES-0006` linhas 56–62; `ADR-0002` linhas 50–52
- achado: "abrir um tempo ou replay gravado" e "reproduzir um replay" de SCR-0002 sem tela porque nenhuma feature persiste registros; a redução é declarada e `readReplay`/`replayLap` ficam disponíveis. Nenhum `REQ-*` afetado.
- esperado: nada a mudar nesta rodada; a feature que persistir registros cobre esse ponto de entrada.

## Divergences

`98-divergences.md` (2.2.0): 17 linhas, todas com `REQ-*`, exigência, estado atual em `arquivo:linha` (conferido: `scripts/handlingBench.ts:47, 50-53, 54-62, 139-172, 211-231, 233-248, 263-282, 267-274, 275, 279, 284-306, 295, 313, 317-332, 334-343, 350-361, 365-394, 384, 385, 413-423, 425-434, 436-443, 473-483, 506-522, 540-545, 596-635`; `src/physics.ts:73, 76, 79, 81, 102, 114-117, 163, 186, 252, 281-286, 298, 313, 327-336`; `src/main.ts:2, 154, 159, 226, 229-239, 284, 396, 458, 473-476`; `scripts/keyboard-lap.ts:1-47`; `src/setupRecords.ts:39-127`; `src/lap.ts:173`; `docs/physics.md:116-178`; `tests/race-lap-validation-frozen.test.ts:44-47`), etapa devedora `código`, item de projeto que fecha e estado `open`. Nenhuma linha sem item de projeto; nenhuma `waived-pending`.

## Coverage

- Requisitos: 62 de 62 cobertos (REQ-FEAT-0001-01..09, 0002-01..10, 0003-01..12, 0004-01..10, 0005-01..12, 0006-01..09); nenhum descoberto.
- NFR: 9 de 9 com mecanismo e métrica.
- API-0003 3.2.0 ↔ `DES-0004` (`BenchRecord`, tabela de ensaios, `judge`): campo a campo, inclusive `driftScorePoints`, `v1Mps` condicional, `offAsphalt*` em `UNDERSTEER_ONSET`/`REAR_RECOVERY`, pares `[plateauSpeedMps, maxUndersteerMs]`, `MEASUREMENT_MISSING` casos (a) e (b), `sectorMs` com 4 inteiros.
- Itens de projeto sem fonte: nenhum.
- Critérios sem caminho de teste alcançável: nenhum (32 de 32 `AC-*`, inclusive AC-US-0002-06).
- Caminhos novos declarados e ausentes da árvore: `src/handlingMessages.ts`, `tests/dirigibilidade-*.test.ts`, `tests/fixtures/records.ts`, `docs/handling-device-log.md`; existentes conferidos: `src/physics.ts`, `src/setupRecords.ts`, `scripts/handlingBench.ts`, `scripts/keyboard-lap.ts`, `scripts/physics-bench.ts`, `src/main.ts`, `index.html`, `docs/physics.md`.
- Feedbacks enviados: nenhum.
