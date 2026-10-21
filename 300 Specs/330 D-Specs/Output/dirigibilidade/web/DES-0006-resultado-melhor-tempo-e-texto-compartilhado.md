---
id: DES-0006
title: Resultado com a versão do acerto, melhor tempo comparável e texto compartilhado
feature: dirigibilidade
stage: dspec
status: validated
version: 1.0.0
sources: [SCR-0002, FLOW-0003, API-0002, FEAT-0005, REQ-FEAT-0005-05, REQ-FEAT-0005-06, REQ-FEAT-0005-08, REQ-FEAT-0005-10]
---

# DES-0006 — Resultado com a versão do acerto, melhor tempo comparável e texto compartilhado

## Realiza

Os `REQ-*` em `sources`: a tela de resultado e o texto compartilhado carregam a `setupVersion` em texto ao
lado do tempo, e nenhuma comparação é exibida ou compartilhada fora de `COMPARABLE` (AC-US-0005-04,
AC-US-0005-05); o registro de uma volta leva `setupId` e `setupVersion` (REQ-FEAT-0005-05); registros em erro
não são comparados nem descartados (REQ-FEAT-0005-08); um replay reproduzido nunca é apresentado como
equivalente (REQ-FEAT-0005-10). Tela: SCR-0002.

## Posicionamento

- `src/handlingMessages.ts`, camada **Aplicação**, **novo**, puro (sem DOM). Motivo de ser novo: o texto
  compartilhado precisa de prova em `npm test`; `src/main.ts` não carrega lá e `src/lapMessages.ts` (de
  `race-lap-validation`) só pode importar tipos de `./lap`.
- `src/main.ts`, camada **Aplicação**, alterado: resultado, melhor tempo, compartilhar.
- `index.html`, camada **Aplicação**, alterado: dois elementos no painel `#lap-result` (`index.html:25`).

## Interface

`src/handlingMessages.ts`:

| Símbolo | Assinatura | Descrição |
|---|---|---|
| `formatSharedText(record, lang)` | `(LapRecord, 'pt' \| 'en') => texto` | `Kartle · <trackId> v<trackVersion> · <formatLapTime(lapMs)> · <setupVersion>` para volta válida; para inválida, o estado `lapStateInvalid` de `lapMessages` no lugar do tempo; nunca contém outro tempo nem diferença |
| `shareLabel(lang)` | `('pt' \| 'en') => texto` | `compartilhar` / `share` (chave de apoio redigida por este projeto, como `newLap` em `race-lap-validation`) |

Elementos novos em `index.html`, dentro de `#lap-result`, com a classe `lap-chip` já existente (sem CSS novo):

| Elemento | Conteúdo |
|---|---|
| `#lap-result-setup` | o valor de `record.setupVersion`, em texto; sem rótulo novo (SCR-0002) |
| `#lap-share` | botão com `shareLabel(lang)`; dispara o compartilhamento |

`src/main.ts`, por trecho atual:

| Trecho atual | Mudança |
|---|---|
| `:159` `best = Infinity` | passa a `bestRecord: LapRecord \| undefined` e `lastRecord: LapRecord \| undefined`, na memória da página |
| `:394-397` ao entrar em `ENDED` | `lastRecord = buildLapRecord(result, setupRef)`; se `lapValidity` `VALID`: `bestRecord` passa a `lastRecord` quando não há `bestRecord` ou quando `compareLapRecords(bestRecord, lastRecord)` é `COMPARABLE` e `lastRecord.lapMs < bestRecord.lapMs`; qualquer outro valor de `comparability` (ou `INCOMPLETE_RECORD`) deixa `bestRecord` como está e **não** exibe comparação |
| `$('best')` | mostra `formatLapTime(bestRecord.lapMs)` só quando `bestRecord` existe e `compareLapRecords(bestRecord, {trackId, trackVersion, setupId, setupVersion do acerto corrente})` é `COMPARABLE`; senão `—` (a tela nunca mostra como "melhor" um tempo de outra versão) |
| `:226`, `:233` (peso e acerto) | continuam zerando o melhor tempo: `bestRecord = undefined` |
| `renderResult` (`:331-358`) | além do que já faz, escreve `#lap-result-setup` = `lastRecord.setupVersion` e o rótulo de `#lap-share` |
| `#lap-share` | `onclick`: `text = formatSharedText(lastRecord, lang)`; se `navigator.share` existe, `navigator.share({text})`; senão `navigator.clipboard.writeText(text)`; ambas em `try`/`catch` com `notify` de falha; nada é gravado |

A decisão de comparabilidade é de `compareLapRecords` ([DES-0003](../core/DES-0003-versao-do-acerto-registros-e-comparabilidade.md));
a tela só recebe o resultado (I2). Não existe tela de abertura de registro gravado nem reprodução de replay
nesta feature, porque nenhuma feature persiste registros hoje (`race-lap-validation` proíbe armazenamento
local): `readReplay` e `replayLap` ficam disponíveis para a feature que vier a gravá-los, e os estados
"Carregando", "Vazio" e "Erro" de SCR-0002 se reduzem, nesta entrega, a "nenhum registro além dos da
sessão" — o tempo corrente é exibido com a sua `setupVersion` e nenhuma comparação com registro em erro é
possível. Isso é declarado, não omitido ([ADR-0002](../adr/ADR-0002-formato-do-replay-e-registro-de-volta-em-memoria.md)).

## Colaboradores

Chama `buildLapRecord`, `compareLapRecords` (`src/setupRecords.ts`), `formatSharedText`, `shareLabel`
(`src/handlingMessages.ts`), `formatLapTime`, `message` (`src/lapMessages.ts`), `getLapResult` (`src/lap.ts`),
e as APIs do navegador `navigator.share`/`navigator.clipboard`. Chamado pelo laço de quadros e pelos
manipuladores de `src/main.ts`.

## Estado e concorrência

Estado local: `lastRecord`, `bestRecord`, ambos derivados de `getLapResult` uma vez por volta encerrada
(`lastPhase !== 'ENDED'`, `:394`), o que absorve quadros repetidos em `ENDED`: o registro é construído uma
vez. Clicar duas vezes em compartilhar compartilha duas vezes o mesmo texto, sem efeito sobre registro
algum. Nada é persistido (a proibição de gravação local de `race-lap-validation` continua valendo).

## Comportamento em falha

`navigator.share` rejeitado (cancelado pelo Jogador ou não suportado) ou área de transferência
indisponível: `notify` com texto de falha; o registro não muda. `INCOMPLETE_RECORD` ou `UNSUPPORTED_FORMAT`:
nenhuma comparação; `console.warn` com o código apenas. Rede: não usada. Sem tempo-limite.

## Observabilidade

`tests/dirigibilidade-hud-text.test.ts` afirma o texto compartilhado; o comportamento de tela é o roteiro
E2E-02 ([test-strategy](../test-strategy.md)).

## Determinismo (D-DS-07)

Não é código de simulação; a decisão de comparabilidade é provada na simulação
(`tests/dirigibilidade-setup-version.test.ts`). `formatSharedText` é pura.

## Feature flag

Nenhuma: SCR-0002 não tem chave; o acréscimo é aditivo e a comparação só muda onde antes era indevida.

## Pontos em aberto

Nenhum.
