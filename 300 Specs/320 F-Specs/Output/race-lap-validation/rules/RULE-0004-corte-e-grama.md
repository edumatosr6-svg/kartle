---
id: RULE-0004
title: Corte e grama
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: [US-0006, AC-US-0006-01, AC-US-0006-02, AC-US-0006-03, AC-US-0006-04, AC-US-0006-06, AC-US-0006-07, AC-US-0006-08]
---

# RULE-0004 — Corte e grama

Decide quando uma saída de pista é corte. Fonte dos limites: `DOMAIN/DEC-01` (D09), com os valores padrão que
o dado da pista pode substituir. Decidido na simulação (I2).

## Limites

| Limite | Padrão | Declarado pela pista | Fonte |
|---|---|---|---|
| Distância além da borda, `cutDistanceM` | 3 m | Sim, opcional ([API-0003](../api/API-0003-dado-de-pista.md)) | AC-US-0006-01, AC-US-0006-04 |
| Duração contínua, `cutDurationMs` | 1000 ms | Sim, opcional | AC-US-0006-01, AC-US-0006-04 |

Cada limite ausente no dado da pista usa o padrão. Com limite declarado, vale o da pista e não o padrão
(AC-US-0006-04).

## Tabela de decisão (por passo em `RUNNING`)

| Distância do kart além da borda | `offTrackMs` antes do passo | Efeito no passo | Fonte |
|---|---|---|---|
| Sobre a pista, ou 0 | qualquer | `offTrackMs` = 0; sem efeito na validade | AC-US-0006-03 |
| Maior que 0 e menor ou igual a `cutDistanceM` | qualquer | `offTrackMs` = 0; sem invalidação; só a redução de velocidade da grama (RF08) | AC-US-0006-03, AC-US-0006-08 |
| Maior que `cutDistanceM` | `offTrackMs` + `STEP` menor ou igual a `cutDurationMs` | `offTrackMs` = `offTrackMs` + `STEP`; sem invalidação | AC-US-0006-02 |
| Maior que `cutDistanceM` | `offTrackMs` + `STEP` maior que `cutDurationMs` | Corte: `lapValidity` `INVALID` com `CUT`, fase `ENDED`, neste passo | AC-US-0006-01 |

"Maior" e "menor ou igual" são estritos como escritos: 3 m exatos não é corte; 1000 ms exatos não é corte.
A duração é medida em passos de `STEP` do estado da simulação, convertidos em ms, e é contínua: qualquer
passo com o kart a `cutDistanceM` ou menos da borda reinicia `offTrackMs` em 0 (AC-US-0006-02).

## Efeitos

| Efeito | Regra | Fonte |
|---|---|---|
| Fim da volta | Termina no passo da invalidação; nenhum tempo de volta nem de setor é acrescentado depois dele | AC-US-0006-06; `DOMAIN/DEC-06` |
| Motivo exibido | "corte" ([RULE-0006](RULE-0006-mensagens-de-estado-e-motivo.md)) | AC-US-0006-05 |
| Pausa, perda de foco, perda do sensor | Nenhum passo avança; `offTrackMs` não muda; o tempo em pausa não conta | US-0006, caso anormal; `DOMAIN/DEC-08` |
| Corte seguido de marcador pulado | O motivo é `CUT`; a volta já terminou | US-0006, caso anormal |
| Grama sem corte | A velocidade do kart após N passos na grama é menor que após N passos na pista, partindo do mesmo estado e com a mesma entrada | AC-US-0006-07; RF08 |

A redução de velocidade na grama é a física existente (RF08) e não muda nesta feature (NFR-0011).

## Idempotência e ordem

`offTrackMs` só avança por passo de simulação; reaplicar o mesmo passo não existe. O corte ocorre uma única
vez por volta: depois dele a fase é `ENDED` e novos passos de saída de pista são ignorados. O contador de
sequência é `stepCount` do passo da invalidação ([RULE-0002](RULE-0002-estados-da-volta.md)).
