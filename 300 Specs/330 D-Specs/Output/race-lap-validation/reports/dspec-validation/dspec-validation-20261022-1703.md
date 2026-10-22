---
stage: dspec
feature: race-lap-validation
verdict: FAIL
generated: 2026-10-22T17:03:53Z
counts: {blocker: 0, error: 1, warning: 1, info: 1, divergence: 1}
seed: {revision: 2, digest: ee91c5706be1}
upstream: {stage: fspec, version: 1.1.0}
feedbacks: ["300 Specs/330 D-Specs/Output/dirigibilidade/reports/feedbacks/race-lap-validation/feedback-20261022-1703.md"]
---

# Relatório de validação do D-Spec — race-lap-validation

## Summary

- Rodada: revalidação; relatório anterior `dspec-validation-20261020-1923.md` (SUCCESS, 0 issues).
- População (conventions §8): issues anteriores: nenhuma; arquivos com `version:` movida: `01-architecture.md` 1.1.0, `97-changelog.md` 1.1.0, `98-divergences.md` 1.1.0, `test-strategy.md` 1.1.0, `adr/ADR-0003` 1.0.1, `core/DES-0001` 1.1.0, `core/DES-0006` 1.1.0, `data/DM-0001` 1.0.1, `data/DM-0002` 1.1.0, `security/DES-0011` 1.1.0, `web/DES-0009` 1.1.0, `web/DES-0010` 1.1.0; amostra aleatória de dois intocados: `core/DES-0012`, `web/DES-0008`.
- Entradas da rodada: F-Spec `status: validated` (`fspec-validation-20261022-1624.md`, API-0001 1.1.0, API-0002 1.1.0, SCR-0003 1.1.0); feedback FB-01 de `pista-kart-park` (`reports/feedbacks/pista-kart-park/feedback-20261022-1614.md`); diretrizes `330 D-Specs/Input/domain-directives.md` e `100 Admin/120 Processes/domain-invariants.md`.
- Posicionamento verificado na árvore (somente fatos de posição): `src/lap.ts:23`, `:25-46`, `:48-58`, `:113-117`, `:267-270`; `src/setupRecords.ts:39`, `:46`, `:79-90`, `:91-93`; `src/main.ts:160`, `:217-223`, `:226`, `:425-435`; `src/trackData.ts:5`; `src/physics.ts:3`; `index.html` (`#lap-result-setup`, `#lap-share`, elementos de DES-0008); `src/lap.ts` não importa `src/setupRecords.ts`.
- Racional do gerador: nenhum recebido do chamador; as justificativas da rodada 3 em `97-changelog.md` foram lidas como registro de itens fechados e recusados (§17) e não como evidência.
- Itens do gate (front matter, ids, índice, traceabilidade, arquivos obrigatórios, `OPEN`/`TBD`) não rejulgados (§13).

## Issues

### ISSUE-01

- severidade: error
- verificação: D7 — comportamento em falha de dependência não declarado
- arquivo: `web/DES-0009-inicio-de-volta-e-erros.md`
- localização: seção "Interface", linhas 39-44; seção "Colaboradores", linhas 62-64; seção "Comportamento em falha", linhas 74-76
- achado: o item passa a obter `setupId` e `setupVersion` por `getSetupVersion` (`src/setupRecords.ts:39`), cuja assinatura devolve `SetupVersionView | {code: 'UNKNOWN_SETUP'}`, e nenhuma seção diz o que a oferta faz com `UNKNOWN_SETUP` (inicia a volta sem os dois campos, não inicia, registra o código); o texto também deixa ambíguo se a fonte é a chamada a `getSetupVersion` ou o par já guardado pela aplicação (`src/main.ts:160`), de modo que a decisão fica para o implementador.
- esperado: a seção "Comportamento em falha" declara o ramo `UNKNOWN_SETUP`, derivável das entradas: ou os dois campos vêm do `PublishedSetup` corrente que a aplicação já guarda (o mesmo cuja `config` é passada), e o item diz que `UNKNOWN_SETUP` não ocorre nesse caminho; ou, se `getSetupVersion` é chamado, `UNKNOWN_SETUP` inicia a volta sem os dois campos (API-0002: emissor sem os campos continua aceito) com `console.warn('setup', code)`, só o código. Sem rejeição nova e sem bloquear o caminho solo (I4).

### ISSUE-02

- severidade: warning
- verificação: D8 — caminho de teste declarado que a estratégia não contém
- arquivo: `web/DES-0010-resultado-da-volta.md`
- localização: seção "Determinismo (D-DS-07)", linhas 95-97; `test-strategy.md`, roteiro E2E-02, linha 75
- achado: DES-0010 afirma que "a ausência de comparação fora de `COMPARABLE` é verificada no teste registrado de navegador (test-strategy, E2E-02)", mas o passo E2E-02 da estratégia (completar a volta, motivos de invalidação) não contém observação alguma sobre comparação, melhor tempo ou acerto, e nenhuma outra linha da estratégia dá caminho à precondição de SCR-0003 "Comparação de tempos".
- esperado: o roteiro registrado (E2E-02 ou a linha que o item citar) declara o passo: com um melhor registro de outro acerto ou de outra `setupVersion`, a tela de resultado não exibe comparação; com registro comparável, exibe; a decisão permanece em `compareLapRecords`. Alternativa: DES-0010 cita a linha da estratégia que de fato o verifica.

### ISSUE-03

- severidade: info
- verificação: D2 — caminho de módulo existente ou declarado novo
- arquivo: `core/DES-0001-ciclo-da-volta-e-comandos.md`; `core/DES-0006-leitura-do-dado-de-pista.md`; `web/DES-0009-inicio-de-volta-e-erros.md`; `web/DES-0010-resultado-da-volta.md`; `security/DES-0011-privacidade-offline-e-sem-persistencia.md`; `core/DES-0012-invariantes-da-simulacao.md`; `test-strategy.md`
- localização: toda citação de `tests/lap-*.test.ts` e `tests/track-data.test.ts` (DES-0001 linhas 112-113; DES-0006 linha 83; DES-0009 linhas 81-82; DES-0010 linhas 93-94; DES-0011 linhas 25 e 62; DES-0012 tabela "Interface"; test-strategy linha 29 e tabela de critérios)
- achado: os arquivos de teste nomeados pelo projeto não existem com esses nomes; a árvore tem `tests/race-lap-validation-<área>.test.ts` com as mesmas áreas (`contract`, `crossing`, `cut`, `determinism`, `frame-clock`, `frozen`, `hud-css`, `kinds`, `layering`, `messages`, `state`, `timing`, `track-data`, `validity`). A condição de `error` de D2 não se cumpre porque DES-0012 os declara novos, e o changelog registra a renomeação como recusada (dona: etapa de testes). Registrado para a próxima rodada; não entra no veredito.
- esperado: nenhuma ação exigida por este veredito; quando o conjunto for regenerado, as citações passam a usar os nomes em uso ou a estratégia declara a correspondência `<nome curto>` → `tests/race-lap-validation-<área>.test.ts`.

### SCOPE-01

- severidade: scope (não entra no veredito; conventions §14)
- verificação: D3 — forma do contrato compartilhado campo a campo; D9 — linha de divergência devida a outra feature
- arquivo: `98-divergences.md`
- localização: linha 36 (linha da rodada de 2026-10-22)
- achado: a linha atribui à feature `dirigibilidade` a implementação de `setupId`/`setupVersion` em `LapRequest`, `LapSession` e `LapResult` (`src/lap.ts:23`, `:25-46`, `:48-58`, `:113-117`, `:267-270`; `src/main.ts:226`), e o D-Spec validado de `dirigibilidade` afirma o contrário: `core/DES-0003` linha 28 ("o seu `LapResult` fica intacto"), `01-architecture.md` linha 185, `adr/ADR-0002` linha 25 ("`getLapResult` e `LapResult` não mudam") e `data/DM-0001` linha 60, com a identidade do acerto anexada por `buildLapRecord` (`src/setupRecords.ts:91-93`). Contradição entre o contrato de API-0001/API-0002 1.1.0 desta feature e a regra que aquela feature possui.
- esperado: feedback escrito para `dirigibilidade` (caminho no front matter); a decisão é daquela feature, na sua próxima rodada desta etapa.

## Divergences

### DIV-01

- requisito: REQ-FEAT-0002-11 com API-0001 1.1.0, API-0002 1.1.0 e SCR-0003 1.1.0
- exige: `startLap` aceita `setupId` e `setupVersion`; a sessão os guarda; `getLapResult` os devolve copiados sem interpretação e ausentes quando o pedido não os traz; a tela só compara tempos com `comparability` `COMPARABLE`
- hoje: `src/lap.ts:23` (`LapRequest` só com `challengeNumber`), `:25-46` e `:48-58` (tipos sem os campos), `:113-117` e `:267-270` (só `challengeNumber` copiado); `src/main.ts:226` chama `startLap` sem os campos; a precondição de comparação já é satisfeita em `src/main.ts:217-223` e `:425-435` — verificado na árvore
- etapa devedora: código, da feature `dirigibilidade` (registro, linha 36; ver SCOPE-01)
- item de projeto: DM-0002, DES-0001, DES-0009, DES-0010
- estado: open
- registro: `98-divergences.md` mantém 13 linhas `open`; as 12 da rodada 1 citam a árvore anterior ao commit `c41c6c3` (preâmbulo do registro), são devidas à etapa de código e não foram rejulgadas nesta rodada (população §8).

## Coverage

- `REQ-*` do F-Spec: 129 cobertos, 0 descobertos (traceabilidade gerada, 241 linhas; semântica conferida por FEAT: 14, 16, 15, 15, 12, 16, 14, 15, 12).
- Contratos: API-0001 e API-0002 1.1.0 servidos por DES-0001 e DM-0002, campo a campo (`setupId?`, `setupVersion?` em pedido, sessão e resultado; `getLapState` sem os campos); API-0003 por DES-0006 e DM-0001; SCR-0003 "Comparação de tempos" por DES-0010.
- NFR-0001 a NFR-0012: 12 com mecanismo e prova na estratégia; NFR-0012 sem literal de versão de esquema (FB-01 de `pista-kart-park` aplicado em DES-0006, DM-0001, ADR-0003 e test-strategy).
- Itens de projeto sem origem: 0.
- Critérios `AC-*` desta feature sem caminho de teste: 0 de 72. Precondição de SCR-0003 (critério de `dirigibilidade`): caminho citado por DES-0010 não consta da estratégia (ISSUE-02).
- `OPEN-<nn>` e `TBD`: do gate, não rejulgados.
- Camadas (D-DS-01, I2): sentido `src/main.ts` → `src/setupRecords.ts` → `src/lap.ts` conferido; nenhuma importação inversa.
