---
stage: dspec
feature: race-lap-validation
verdict: SUCCESS
generated: 2026-10-22T17:54:09Z
counts: {blocker: 0, error: 0, warning: 0, info: 0, divergence: 1}
seed: {revision: 2, digest: ee91c5706be1}
upstream: {stage: fspec, version: 1.1.0}
feedbacks: []
---

# Relatório de validação do D-Spec — race-lap-validation

## Summary

- Rodada: revalidação; relatório anterior `dspec-validation-20261022-1703.md` (FAIL: 1 `error`, 1 `warning`, 1 `info`, 1 `scope`, DIV-01).
- População (conventions §8): issues anteriores ISSUE-01, ISSUE-02, ISSUE-03, SCOPE-01 e DIV-01; arquivos com `version:` movida desde aquele relatório: `01-architecture.md` 1.1.1, `97-changelog.md` 1.1.1, `test-strategy.md` 1.1.1, `core/DES-0012` 1.0.1, `web/DES-0009` 1.1.1, `web/DES-0010` 1.1.1; amostra aleatória de dois intocados (`Get-Random` sobre os 17 restantes): `core/DES-0001` 1.1.0, `adr/ADR-0001` 1.0.0.
- Entradas da rodada: F-Spec com `status: validated` em todos os arquivos (`fspec-validation-20261022-1624.md`; API-0001 1.1.0, API-0002 1.1.0, SCR-0003 1.1.0, SCR-0002 1.0.0, RULE-0003 1.0.0, FEAT-0001 1.0.0); diretrizes `330 D-Specs/Input/domain-directives.md` e `100 Admin/120 Processes/domain-invariants.md`; nenhum feedback pendente para esta feature nesta etapa (o único existente, de `pista-kart-park`, 2026-10-22T16:14Z, é anterior ao relatório de 17:03Z e já foi aplicado na rodada 3).
- Racional do gerador: nenhum recebido do chamador; `97-changelog.md` lido como registro de itens fechados e recusados (§17), não como evidência.
- Itens do gate (front matter, ids, índice, traceabilidade, arquivos obrigatórios, `OPEN`/`TBD`) não rejulgados (§13).
- D1 além do gate: links relativos do conjunto conferidos por script (0 quebrados); um único bloco mermaid (`01-architecture.md`, `sequenceDiagram`) com `loop`/`alt`/`else`/`end` balanceados.
- Posicionamento verificado na árvore (somente fatos de posição): `src/main.ts:122` (`setup: PublishedSetup = PUBLISHED_SETUPS.ARCADE_ASSISTIDO`), `:160` e `:228` (`setupRef`), `:217-223` (`renderBest`, `compareLapRecords` em `:220`), `:226` (`startLap` sem `setupId`/`setupVersion`), `:246-247` (`SETUP_BY_PRESET`), `:248-253` (`#handling-preset` → `PUBLISHED_SETUPS`), `:426-435` (melhor registro em `ENDED`; `buildLapRecord` `:429`, `compareLapRecords` `:433`), `:493` (seletor desabilitado durante a volta); `src/physics.ts:3` (`export { nearest, track, WIDTH, LapTracker }`), `:84-91` (`SetupId`, `PublishedSetup`, `PUBLISHED_SETUPS`); `src/setupRecords.ts:4` (importa `src/lap.ts`), `:39` (`getSetupVersion`), `:46` (`resolveSetupRef`), `:79-88` (`compareLapRecords`, resolve os dois lados por `resolveSetupRef` em `:84`); `src/lap.ts:3-6` (importa só `physics`, `track`, `trackData`, `lapTiming`), `:23` (`LapRequest` só com `challengeNumber`), `:117` e `:270` (só `challengeNumber` copiado); `src/trackData.ts:3` (importa só `track`); `index.html:19` (`#welcome`, `#lap-offer`), `:24` (`#lap-control-fallback`), `:25` (`#lap-result`, `#lap-result-setup`, `#lap-share`, `#lap-new-lap`), `:33` (`#tilt`, `#reset`, `#pause`), `:38` (`#handling-preset` com as opções `arcade` e `rental`); `tests/race-lap-validation-<área>.test.ts` nas 14 áreas da estratégia; `tests/fixtures/track-v1.json`, `tests/helpers/autopilot.ts`, `tests/helpers/seeded.ts`; `docs/lap-validation-bench.md`, `docs/lap-validation-device-log.md`.
- ISSUE-01 do relatório anterior (`error`, D7, `web/DES-0009`): resolvida em 1.1.1 — "Interface" e "Comportamento em falha" fixam a fonte dos dois campos no `PublishedSetup` corrente da aplicação (`src/main.ts:122`, objeto de `PUBLISHED_SETUPS`, trocado só por `#handling-preset` entre voltas) e declaram que `UNKNOWN_SETUP` não ocorre nesse caminho e que nenhuma rejeição, aviso ou bloqueio é acrescentado (API-0002; I4); "Colaboradores" registra que `src/setupRecords.ts` não é chamado para iniciar a volta; conferido na árvore. Mesmo fato em `01-architecture.md` 1.1.1 (sentido das dependências).
- ISSUE-02 do relatório anterior (`warning`, D8, `web/DES-0010` e `test-strategy.md`): resolvida em 1.1.1 — E2E-02 ganha o passo "comparação de tempos" (troca de acerto por `#handling-preset`, volta sem comparação, segunda volta no mesmo acerto com comparação; decisão em `compareLapRecords`); DES-0010 cita esse passo em "Determinismo"; os ramos `SETUP_VERSION_DIFFERS` e `TRACK_DIFFERS` ficam provados no ponto de decisão, em `dirigibilidade`, sem superfície só de teste (D8).
- ISSUE-03 do relatório anterior (`info`, D2): resolvida — `test-strategy.md` (preâmbulo da tabela de critérios) e `core/DES-0012` 1.0.1 declaram a correspondência `tests/lap-<área>.test.ts` e `tests/track-data.test.ts` → `tests/race-lap-validation-<área>.test.ts`; os 14 arquivos existem.
- SCOPE-01 do relatório anterior (`scope`, §14): inalterado e fora do veredito — o feedback `300 Specs/330 D-Specs/Output/dirigibilidade/reports/feedbacks/race-lap-validation/feedback-20261022-1703.md` continua pendente (posterior ao relatório mais novo daquela feature nesta etapa, `dspec-validation-20261022-1615.md`); nenhum feedback novo foi enviado nesta rodada para não duplicar o item pendente.
- `status: validated` aplicado aos 14 arquivos que liam `draft`; `00-index.md` regenerado com `lint_artifacts.py --emit` para que as células de status geradas acompanhem (`99-traceability.md` regenerado pelo mesmo comando, conteúdo idêntico).

## Issues

Nenhuma.

## Divergences

### DIV-01

- requisito: REQ-FEAT-0002-11 com API-0001 1.1.0, API-0002 1.1.0 e SCR-0003 1.1.0
- exige: `startLap` aceita `setupId` e `setupVersion`; a sessão os guarda; `getLapResult` os devolve copiados sem interpretação e ausentes quando o pedido não os traz; a tela só compara tempos com `comparability` `COMPARABLE`
- hoje: `src/lap.ts:23` (`LapRequest` só com `challengeNumber`), `:117` e `:270` (só `challengeNumber` copiado); `src/main.ts:226` chama `startLap` sem os campos; a identidade do acerto é anexada por `buildLapRecord` (`src/main.ts:429`, `src/setupRecords.ts:91-93`); a precondição de comparação já é satisfeita em `src/main.ts:217-223` e `:426-435` — verificado na árvore
- etapa devedora: código, da feature `dirigibilidade` (registro, linha 36; SCOPE-01)
- item de projeto: DM-0002, DES-0001, DES-0009, DES-0010
- estado: open
- registro: `98-divergences.md` 1.1.0 inalterado, 13 linhas `open`; as 12 da rodada 1 citam a árvore anterior ao commit `c41c6c3`, são devidas à etapa de código e não foram rejulgadas (população §8).

## Coverage

- `REQ-*` do F-Spec: 129 cobertos, 0 descobertos (traceabilidade gerada, 241 linhas; itens sem origem: 0).
- Contratos, nos itens da população: `startLap` de DES-0001 com `{lapKind, trackId, trackVersion, challengeNumber?, setupId?, setupVersion?}` e as quatro rejeições de API-0002; `pauseLap`, `resumeLap`, `repositionKart` com os códigos de API-0002; `getLapState`/`getLapResult` com `NO_ACTIVE_LAP`/`NO_RESULT` e os campos opcionais de API-0001 1.1.0; DES-0009 com os sete estados de SCR-0002; DES-0010 com os oito estados de SCR-0003 e a precondição "Comparação de tempos" (`COMPARABLE` só; `INCOMPLETE_RECORD` só registra o código); ADR-0001 com RULE-0003 (ms inteiros, intervalo estrito dentro do passo, coincidência com o passo, soma telescópica).
- NFR-0001 a NFR-0012: 12 com mecanismo e prova na estratégia (NFR-0012 sem literal de versão de esquema).
- Critérios `AC-*` desta feature sem caminho de teste: 0 de 72; nenhum alcançado por configuração, ponto de entrada ou gancho só de teste (`#handling-preset` e as fixtures de arquivo de pista são superfície de produção e fixtures).
- Camadas (D-DS-01, I2): `src/main.ts` → `src/setupRecords.ts` → `src/lap.ts` → `src/physics.ts`/`src/track.ts`/`src/trackData.ts`/`src/lapTiming.ts`; `src/trackData.ts` → `src/track.ts`; nenhuma importação inversa; nenhum módulo desta feature importa `src/setupRecords.ts`.
- Chaves de feature: nenhuma, com o motivo citado do F-Spec (FEAT-0001 "Configuração: Nenhuma", ligado por padrão) — sem superfície nova.
- `OPEN-<nn>` e `TBD`: do gate, não rejulgados.
