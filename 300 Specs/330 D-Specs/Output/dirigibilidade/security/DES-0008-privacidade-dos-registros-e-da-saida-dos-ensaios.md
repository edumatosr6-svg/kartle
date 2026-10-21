---
id: DES-0008
title: Privacidade dos registros, do texto compartilhado e da saída dos ensaios
feature: dirigibilidade
stage: dspec
status: validated
version: 1.0.1
sources: [API-0001, API-0002, API-0003, FEAT-0005, FEAT-0006, REQ-FEAT-0005-06, REQ-FEAT-0005-08, REQ-FEAT-0006-02, REQ-FEAT-0006-08, NFR-0004, NFR-0009]
---

# DES-0008 — Privacidade dos registros, do texto compartilhado e da saída dos ensaios

## Realiza

A parte de I6 e D-DS-04/D-DS-06 dos `REQ-*` em `sources`: os contratos são públicos no cliente e sem sessão
(API-0001 a API-0003, Auth); o texto compartilhado e os registros não carregam dado pessoal; a saída dos
ensaios e `docs/physics.md` não carregam segredo, identificador real de jogador, nome de máquina nem de
usuário; os módulos de simulação continuam sem rede e sem armazenamento (REQ-FEAT-0006-02).

## Posicionamento

Camada **Aplicação** (`src/main.ts`, onde o único dado sai do processo: Web Share e área de transferência),
com a verificação de camada e de símbolos em `tests/` (como em `race-lap-validation`, DES-0012 daquela
feature). Nenhum módulo novo.

## Interface

Pontos de verificação (não há sessão nem papel: o único papel é `player`, anônimo; não há ponto de
verificação de sessão nem de RBAC porque não há autenticação no produto, RNF10):

| Fronteira | O que atravessa | Validação | Onde |
|---|---|---|---|
| Web Share / área de transferência | `formatSharedText(record, lang)`: `trackId`, `trackVersion`, tempo, `setupVersion`, estado | só campos de `LapRecord`; nenhum campo de aparelho, idioma de sistema, data ou nome | `src/main.ts` (`#lap-share`) |
| `readReplay(source)` | objeto ou texto de origem não confiável | tipo, forma, faixa e tamanho: texto com no máximo `MAX_REPLAY_TEXT_CHARS` (4 194 304 caracteres) e `inputs` com no máximo `MAX_REPLAY_INPUT_STEPS` (36 000 passos), verificados antes de ler qualquer elemento, excesso é `UNREADABLE`; `inputs` só com `throttle`, `brake`, `steer` finitos e `drift` booleano; `replayFormatVersion` inteiro; sem `eval`, sem consulta construída por texto | `src/setupRecords.ts` ([DES-0003](../core/DES-0003-versao-do-acerto-registros-e-comparabilidade.md)) |
| `docs/physics.md` → `readBaseline` | JSON do bloco | `JSON.parse` em `try`; só campos de API-0003 e `runtimeId` lidos | `scripts/handlingBench.ts` |
| stdout dos benches | registros e parâmetros | `runtimeId()` sem `os.hostname()` nem `os.userInfo()`; nenhum caminho de arquivo | `scripts/keyboard-lap.ts` (`runtimeId()`, `node:os`) e `scripts/handlingBench.ts` (`serialize`, sem `node:os`) |

Registro em log: `console.warn` com códigos e identificadores apenas (`replay`/`UNREADABLE`,
`UNSUPPORTED_FORMAT`, `lap-record`/`INCOMPLETE_RECORD`); nunca o conteúdo de um registro nem o texto
compartilhado.

Segredos: nenhum existe nesta feature; nenhum valor é lido do ambiente.

## Colaboradores

É a restrição que [DES-0003](../core/DES-0003-versao-do-acerto-registros-e-comparabilidade.md),
[DES-0004](../core/DES-0004-ensaios-de-dirigibilidade-e-saida.md) e
[DES-0006](../web/DES-0006-resultado-melhor-tempo-e-texto-compartilhado.md) obedecem; verificada por
`tests/dirigibilidade-contract.test.ts` e `tests/dirigibilidade-hud-text.test.ts`.

## Estado e concorrência

Sem estado. Nada é persistido; o texto compartilhado é entregue à API do navegador uma vez por gesto.

## Comportamento em falha

Uma falha de compartilhamento não expõe nada além do `notify` existente. Uma entrada fora de forma em
`readReplay` é `UNREADABLE`, sem lançar.

## Observabilidade

`tests/dirigibilidade-contract.test.ts` afirma que `src/setupRecords.ts`, `src/handlingMessages.ts` e
`scripts/handlingBench.ts` não contêm `fetch`, `XMLHttpRequest`, `WebSocket`, `localStorage`,
`sessionStorage`, `indexedDB`, `navigator.sendBeacon`, `os.hostname`, `os.userInfo`; que
`scripts/keyboard-lap.ts` e `scripts/physics-bench.ts` não contêm `os.hostname` nem `os.userInfo`; e que o
texto compartilhado contém exatamente os campos listados.

## Determinismo (D-DS-07)

Não é código de simulação; a restrição de símbolos protege o determinismo de `src/setupRecords.ts` e de
`scripts/handlingBench.ts` (sem `Date`, `performance`, `Math.random`, `node:perf_hooks`, `node:os`),
afirmado pelo mesmo teste.

## Feature flag

Nenhuma: proteção do que não muda.

## Pontos em aberto

Nenhum.
