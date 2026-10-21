---
stage: code
feature: race-lap-validation
verdict: SUCCESS
generated: 2026-10-21T13:38:48Z
counts: {blocker: 0, error: 0, warning: 3, info: 3, divergence: 0}
seed: {revision: 2, digest: ee91c5706be1}
upstream: {stage: dspec, version: 1.0.0}
files_examined: 55
feedbacks: []
---

# Relatório de validação de código — race-lap-validation

## Summary

Todas as 210 linhas de `99-traceability.md` e todos os pares arquivo:símbolo dos registros `core/`, `data/`, `web/` e `security/` resolvem na árvore; os 11 `arquivo:linha` de `98-divergences.md` marcados `resolved` existem e fazem o que a linha exige.
Nenhum `blocker` nem `error`: a implementação segue o projeto validado, os contratos API-0001/0002/0003 campo a campo, o mapa de camadas (D-CD-02) e as diretivas D-CD-01..07; ficam 3 `warning` e 3 `info`.

## Issues

### ISSUE-01
- severity: warning
- check: C7
- file: `src/lap.ts`
- location: `src/lap.ts:33` (`LapSession.environment`)
- finding: `LapSession` carrega o campo `environment` (`Environment` da física), ausente da tabela de DM-0002.
- expected: Todo campo do modelo em memória consta da tabela de DM-0002; como DES-0001 exige `startLap(..., environment)` e `stepLap(lap, input)` sem parâmetro de ambiente, o campo é necessário e a tabela de DM-0002 deve ser acrescida dele na próxima revisão do projeto (registrado em `97-changelog.md`).

### ISSUE-02
- severity: warning
- check: C2
- file: `src/main.ts`
- location: `src/main.ts:158` (`console.warn('track-data', 'INCOMPLETE', ...)`)
- finding: O aviso de dado `INCOMPLETE` registra `trackId` e `trackVersion`, mas não os identificadores C1 a C7 reprovados que DES-0006 ("Comportamento em falha") manda registrar.
- expected: `console.warn('track-data', 'INCOMPLETE', trackId, trackVersion, <ids reprovados>)`, obtendo os ids por `checkConsistency(reading)` na aplicação ou expondo-os na leitura, sem conteúdo além de identificadores.

### ISSUE-03
- severity: warning
- check: C2
- file: `src/main.ts`
- location: `src/main.ts:331-358` (`renderResult`) e `src/main.ts:249` (`#lap-new-lap`)
- finding: Depois de "nova volta" o painel `#lap-result` fica oculto, mas `lap` segue `ENDED` e `renderResult` roda a cada quadro; se `navigator.language` mudar nesse intervalo, `resultLang !== lang` re-renderiza o painel e remove `hidden`, cobrindo a oferta (`#welcome`).
- expected: O painel de resultado só reaparece por nova transição a `ENDED` (DES-0010: "aparece quando `lapPhase` chega a `ENDED`"); a re-renderização por idioma não deve alterar a visibilidade depois que o Jogador saiu da tela.

### ISSUE-04
- severity: info
- check: C2
- file: `src/lap.ts`
- location: `src/lap.ts:265` (`buildResult(session, finishMs?)`)
- finding: DES-0005 nomeia `buildResult(session)`; a implementação, interna e não exportada, recebe `finishMs` como segundo argumento porque DM-0002 guarda só `b1..b3` em `sectorBoundsMs` e `b4` só existe no resultado.
- expected: Assinatura interna coerente com DES-0003/DM-0002 (como está); a tabela de interface de DES-0005 pode passar a nomear o segundo argumento na próxima revisão do projeto.

### ISSUE-05
- severity: info
- check: C2
- file: `src/main.ts`
- location: `src/main.ts:195-197` (`renderOffer`)
- finding: Leitura `UNREADABLE` exibe `trackDataError`; DES-0009 lista `UNREADABLE` tanto no estado Vazio (`noTrackAvailable`) quanto no estado Erro (`trackDataError`), e SCR-0002 repete a ambiguidade.
- expected: Comportamento compatível com a linha Erro de DES-0009 e API-0003 (como está); a chave `noTrackAvailable` existe em `src/lapMessages.ts` e a ambiguidade é do projeto, a resolver lá.

### ISSUE-06
- severity: info
- check: C7
- file: `src/trackData.ts`
- location: `src/trackData.ts:95` (leitor de `schemaVersion` 1)
- finding: D-CD-03 exige que a mudança de formato publicado venha com o leitor da versão anterior "testado"; o leitor existe, mas `tests/track-data.test.ts` e `tests/fixtures/track-v1.json` (DM-0001, DES-0012) ainda não existem porque a escrita de testes é do estágio de testes, conforme a linha `open` REQ-FEAT-0009-10 de `98-divergences.md`.
- expected: O estágio de testes escreve `tests/track-data.test.ts` com a leitura da forma anterior (`schemaVersion` 1 → `INCOMPLETE`, sem erro, objeto intacto) e fecha a linha REQ-FEAT-0009-10.

## Divergences

- open: REQ-FEAT-0009-10 (`98-divergences.md`, linha 29) — verificações determinísticas por regra em `npm test`; parte de código entregue, arquivos de teste devidos ao estágio de testes (ISSUE-06).
- resolved, código verificado: REQ-FEAT-0001-01/-04/-05/-06/-07/-08/-11/-12 (`src/lap.ts:167`, `:181`, `src/lapTiming.ts:6`, `:11`); REQ-FEAT-0001-02/-03/-09/-10 e REQ-FEAT-0007-01..-14 (`src/lapMessages.ts:38`, `:62`, `src/main.ts:300`, `index.html:20`, `:21`, `src/style.css:6`); REQ-FEAT-0001-13 e REQ-FEAT-0003-07 (`src/main.ts:164`, `:208`, `:370`, `index.html:24`); REQ-FEAT-0002-01..-14 e REQ-FEAT-0004-01..-13 (`src/track.ts:27`, `src/lap.ts:223`, `:265`, `src/lapTiming.ts:17`); REQ-FEAT-0002-06 (`src/lapMessages.ts:48`); REQ-FEAT-0009-01/-12 (`src/lap.ts:95`, `:134`, `:141`, `:149`, `:167`); REQ-FEAT-0003-05/-06/-08..-14 (`src/lap.ts:134`, `:141`, `src/main.ts:255`, `:259`, `:449`); REQ-FEAT-0005-01..-06/-09..-11 (`src/lap.ts:86`, `:218`, `:245`, `src/lapTiming.ts:25`); REQ-FEAT-0006-01..-06/-12..-15 (`src/lap.ts:149`, `:153`, `src/main.ts:183`); REQ-FEAT-0006-07..-11 e REQ-FEAT-0008-05..-07 (`src/lap.ts:211`, `:274`, `src/main.ts:189`, `:331`, `index.html:19`, `:25`); REQ-FEAT-0008-01..-04/-08..-15 e REQ-FEAT-0004-06 (`src/track.ts:42`, `src/trackData.ts:81`, `:89`, `:95`, `:138`, `src/lap.ts:110`).
- resolved sem verificação possível: nenhuma.

## Coverage

- Requisitos com código: todos os `REQ-FEAT-0001-01` a `REQ-FEAT-0009-12` das 210 linhas de `99-traceability.md` (FEAT-0001 a FEAT-0009), cada um com arquivo e símbolo existente no registro `DES-*`/`DM-*` correspondente.
- Requisitos sem código: nenhum; REQ-FEAT-0009-10 tem a parte de código entregue e a verificação em `npm test` pendente do estágio de testes (divergência `open`).
- Arquivos alterados não registrados no manifesto: nenhum (conjunto de mudança: `src/track.ts`, `src/main.ts`, `src/style.css`, `index.html`, `src/trackData.ts`, `src/lapTiming.ts`, `src/lap.ts`, `src/frameClock.ts`, `src/lapMessages.ts`, `docs/lap-validation-bench.md` — todos em `01-implementation.md`).
- Arquivos registrados no manifesto sem mudança: nenhum.
- Arquivos examinados (55): `src/lap.ts`, `src/lapTiming.ts`, `src/trackData.ts`, `src/frameClock.ts`, `src/lapMessages.ts`, `src/track.ts`, `src/main.ts`, `src/style.css`, `index.html`, `docs/lap-validation-bench.md`, `src/physics.ts` (símbolos exportados, parcial); `400 Code/Output/race-lap-validation/` (`00-index.md`, `01-implementation.md`, `97-changelog.md`, `98-divergences.md`, `99-traceability.md`, `core/` 7, `data/` 2, `web/` 4, `security/` 1); `300 Specs/330 D-Specs/Output/race-lap-validation/` (`01-architecture.md`, `98-divergences.md`, `core/` 7, `data/` 2, `web/` 4, `security/` 1, `adr/ADR-0004`, `adr/ADR-0005`); `300 Specs/320 F-Specs/Output/race-lap-validation/` (`api/` 3, `rules/RULE-0002`, `screens/` 3).
