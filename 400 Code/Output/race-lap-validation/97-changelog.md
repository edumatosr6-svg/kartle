---
title: Registro de mudanças — validação de volta de corrida (estágio de código)
feature: race-lap-validation
stage: code
status: draft
version: 1.0.0
sources: []
---

# Registro de mudanças

## 2026-10-21 — rodada 1, Mode A

**O que mudou**

- Implementação integral do projeto validado (DES-0001 a DES-0012, DM-0001, DM-0002) na raiz do repositório, na ordem
  dado de pista, simulação, aplicação. Novos: `src/trackData.ts`, `src/lapTiming.ts`, `src/lap.ts`, `src/frameClock.ts`,
  `src/lapMessages.ts`, `docs/lap-validation-bench.md`. Alterados: `src/track.ts` (`Line`, `sideOf`, `crossLine`,
  `SYNTHETIC_TRACK_FILE`), `src/main.ts`, `index.html`, `src/style.css`. Inalterados: `src/physics.ts`,
  `src/maneuvers.ts`, `src/audio.ts`, `scripts/`, `tests/`, `package.json`, `tsconfig.json`.
- Registros de implementação em `core/`, `data/`, `web/` e `security/`, um por item de projeto, com o arquivo e o
  símbolo que realizam cada `REQ-*`; `98-divergences.md` com 11 linhas `resolved` e 1 `open`; `01-implementation.md`.
- `00-index.md` e `99-traceability.md` gerados pelo gate (`lint_artifacts.py --emit`), não escritos à mão.
- Portão: `npx tsc --noEmit` 0; `npm test` 0 (32 testes, 32 aprovados); `npm run build` 0; `bench:physics` e
  `bench:handling` com 0 linhas diferentes da árvore anterior.

**Decisões de implementação, onde o projeto deixava detalhe em aberto** (nenhuma muda contrato ou requisito)

- `LapSession` carrega um campo `environment` além da tabela de DM-0002: é o parâmetro `environment` de `startLap`
  (DES-0001) que `stepLap(lap, input)` precisa passar a `step`; vale `CIRCUIT` por padrão e não muda na sessão.
- `buildResult` ficou interna, com um segundo argumento `finishMs`: `b4` não está em `sectorBoundsMs` (0 a 3 inteiros, DM-0002)
  e só existe no resultado. `getLapResult` é a leitura pública.
- O botão `#start` de `index.html` deu lugar aos botões da oferta em `#lap-offer`, dentro de `#welcome`, conforme DES-0009
  ("o painel de boas-vindas passa a ser a oferta"); `#track-status` mostra `trackId` ou o texto de erro.
- O estado Vazio de SCR-0002 (`noTrackAvailable`) não ocorre com o arquivo empacotado: `UNREADABLE` e
  `UNSUPPORTED_SCHEMA` exibem `trackDataError`, como API-0003 e DES-0009 determinam para dado carregado e ilegível.
  A chave `noTrackAvailable` existe em `src/lapMessages.ts`.
- `lastOrientationAtMs` também é inicializado ao ativar a inclinação, além de ao continuar (ADR-0005), porque a variável
  precisa de um instante inicial; o efeito é a mesma tolerância de 500 ms.
- Trocar peso ou estilo continua zerando `best` (comportamento pré-existente, fora dos requisitos); as notificações
  passaram a dizer "Vale na próxima volta".
- `#lap-state` fica visível desde o início da volta (também na contagem), porque `describeLap` sempre devolve `stateText`
  e DES-0008 só manda escondê-lo sem volta ativa; o requisito "do sinal verde ao fim" fica satisfeito.

**Itens fechados**: nenhum `ISSUE-<nn>` ou `FB-<nn>` (primeira geração).

**Itens recusados, com motivo**

- Arquivos de teste nomeados por DES-0012 e test-strategy (`tests/lap-*.test.ts`, `tests/track-data.test.ts`,
  `tests/frame-clock.test.ts`, `tests/helpers/`, `tests/fixtures/track-v1.json`): pertencem ao estágio de testes;
  por isso a linha REQ-FEAT-0009-10 de `98-divergences.md` fica `open`.
- `docs/lap-validation-device-log.md`: é o teste registrado nos aparelhos e navegadores nomeados (test-strategy, E2E),
  evidência humana que esta rodada não pode produzir.
- Pausa manual por toque em `web-mobile`: não projetada (ADR-0004, item 4); o botão `#pause` só aparece em `PAUSED`.
- Nenhuma dependência, refatoração, renomeação ou reformatação fora dos arquivos que o projeto nomeia.
- Nenhum requisito foi enfraquecido, removido ou dividido.

**Migração de verificações existentes**: nenhuma verificação foi removida ou alterada; `tests/physics.test.ts` e
`scripts/keyboard-lap.ts` continuam usando `LapTracker` por `src/physics.ts`.
