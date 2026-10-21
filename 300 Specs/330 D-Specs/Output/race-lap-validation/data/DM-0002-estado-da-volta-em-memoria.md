---
id: DM-0002
title: Estado e resultado da volta em memória
feature: race-lap-validation
stage: dspec
status: validated
version: 1.0.0
sources: [FEAT-0001, FEAT-0002, FEAT-0003, REQ-FEAT-0001-05, REQ-FEAT-0002-04, REQ-FEAT-0002-11, REQ-FEAT-0003-08]
---

# DM-0002 — Estado e resultado da volta em memória

## Realiza

Os `REQ-*` em `sources`: os campos de estado de RULE-0002 e de API-0001 (`lapPhase`, `resumePhase`,
`pauseCause`, `lapKind`, `lapValidity`, `invalidReason`, contadores) e o resultado único da volta. Camada:
simulação, `src/lap.ts`. Não há tabela, banco nem arquivo gravado: o estado vive na memória da página e some
quando a página é recarregada ou abandonada (REQ-FEAT-0009-11).

## `LapSession` (imutável; cada passo ou comando devolve uma nova)

| Campo | Tipo | Unidade | Nulável | Padrão ao iniciar | Observação |
|---|---|---|---|---|---|
| `lapKind` | `OFFICIAL`, `RECON`, `TRAINING` | — | não | do pedido | fixo na sessão |
| `trackId` | texto | — | não | da leitura | nunca da data, do relógio ou do nome |
| `trackVersion` | texto ou inteiro | — | não | da leitura | copiado sem interpretação |
| `challengeNumber` | inteiro | — | sim | ausente | copiado do pedido; ausente não muda nada |
| `trackStatus` | `COMPLETE`, `INCOMPLETE` | — | não | da leitura | decide `official` e quais linhas são avaliadas |
| `lines` | estrutura de linhas e limites de corte | m, ms | não | da leitura | referência ao dado lido, não copiada; vazia em `INCOMPLETE` |
| `config` | `KartConfig` congelado | — | não | configuração vigente ao iniciar | fixa durante a volta; mudar peso ou estilo vale para a volta seguinte |
| `phase` | `COUNTDOWN`, `RUNNING`, `PAUSED`, `ENDED` | — | não | `COUNTDOWN` | RULE-0002 |
| `resumePhase` | `COUNTDOWN`, `RUNNING` | — | sim | ausente | presente só com `PAUSED` |
| `pauseCause` | `ESC_KEY`, `FOCUS_LOST`, `SENSOR_LOST` | — | sim | ausente | presente só com `PAUSED` |
| `validity` | `VALID`, `INVALID` | — | não | `VALID` | |
| `invalidReason` | `MISSED_MARKER`, `CUT`, `REPOSITION` | — | sim | ausente | presente só com `INVALID` |
| `countdownSteps` | inteiro 0 a 360 | passos | não | 0 | 360 passos de `STEP` são 3000 ms exatos |
| `stepCount` | inteiro | passos | não | 0 | contador de sequência da volta; avança só em `RUNNING` |
| `markersPassedCount` | inteiro 0 a total de marcadores | marcadores | não | 0 | |
| `sectorBoundsMs` | lista de 0 a 3 inteiros | ms | não | vazia | `b1`, `b2`, `b3`, em ordem |
| `offTrackSteps` | inteiro | passos | não | 0 | passos seguidos além da distância de corte |
| `kart` | `State` da física | — | não | largada | posição, heading e demais campos do `State` existente |
| `result` | `LapResult` | — | sim | ausente | existe se, e somente se, `phase` é `ENDED` |

Valores derivados (funções puras, não armazenados): `countdownRemainingMs = 3000 - toMs(countdownSteps)` e
`elapsedMs` (ver [DES-0002](../core/DES-0002-tempo-da-volta-e-interpolacao.md)): `toMs(stepCount)` durante a
volta, congelado na pausa, e no fim igual a `lapMs` de uma volta válida ou a `toMs(stepCount)` de uma inválida.

## `LapResult` (API-0001)

| Campo | Tipo | Unidade | Nulável | Observação |
|---|---|---|---|---|
| `trackId` | texto | — | não | |
| `trackVersion` | texto ou inteiro | — | não | |
| `challengeNumber` | inteiro | — | sim | só presente se o pedido o trouxe |
| `lapKind` | enum | — | não | |
| `lapValidity` | `VALID`, `INVALID` | — | não | |
| `invalidReason` | enum | — | sim | só com `INVALID` |
| `official` | booleano | — | não | verdadeiro somente com `OFFICIAL`, `VALID` e `trackStatus` `COMPLETE` |
| `lapMs` | inteiro | ms | sim | só com `VALID`; igual a `b4` |
| `sectorMs` | 4 inteiros | ms | sim | só com `VALID`; `[b1 - b0, b2 - b1, b3 - b2, b4 - b3]` com `b0` = 0 |

O resultado não tem campo de identidade de jogador, de dispositivo, de data nem de relógio (NFR-0005).

## Invariantes verificáveis

| Id | Invariante |
|---|---|
| INV-1 | `phase` `ENDED` se, e somente se, existe exatamente um `result`; depois de `ENDED` nenhum comando nem passo muda a sessão |
| INV-2 | `resumePhase` e `pauseCause` existem se, e somente se, `phase` é `PAUSED` |
| INV-3 | Em `PAUSED` e em `ENDED` nenhum contador (`countdownSteps`, `stepCount`, `offTrackSteps`, `markersPassedCount`, `sectorBoundsMs`) e nem `kart` mudam |
| INV-4 | `lapKind`, `trackId`, `trackVersion`, `challengeNumber`, `trackStatus`, `lines` e `config` não mudam durante a sessão |
| INV-5 | Resultado `VALID` tem `sectorMs` com 4 inteiros cuja soma é `lapMs`, com diferença de 0 ms, e cada elemento maior ou igual a 0 |
| INV-6 | `INVALID` tem `invalidReason`, e o resultado não tem `lapMs` nem `sectorMs` |
| INV-7 | `markersPassedCount` e `sectorBoundsMs.length` só crescem, no máximo de 1 por passo, e nunca passam do total declarado |
| INV-8 | `official` verdadeiro implica `OFFICIAL`, `VALID` e `COMPLETE` |
| INV-9 | `stepCount` só avança em `RUNNING`; `countdownSteps` só avança em `COUNTDOWN`; o tempo exibido é função só desses contadores |

## Plano de migração

Nenhum: o estado não é persistido, não há versão a migrar nem reversão a especificar além do descarte da página.

## Preenchimento retroativo

Nenhum.

## Janela de compatibilidade

Nenhuma: o tipo é interno ao cliente. O contrato visível é o de API-0001 e API-0002, cujos nomes e unidades não
mudam depois de publicados (I3).

## Retenção e privacidade

Retido só enquanto a página está aberta. Contém identificadores de pista e números de passo; não contém dado
pessoal, identificador de jogador, idioma nem horário (D-DS-04, I6). Nada é enviado pela rede nem gravado em
`localStorage`, `sessionStorage` ou IndexedDB por esta feature. A persistência do resultado é do desafio diário
(etapa 5).
