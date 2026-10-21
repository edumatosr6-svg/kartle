---
id: RULE-0005
title: Tipos de volta, reposicionamento e pista de dado incompleto
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: [US-0007, US-0008, AC-US-0007-01, AC-US-0007-04, AC-US-0007-05, AC-US-0007-06, AC-US-0008-01, AC-US-0008-02, AC-US-0008-03, AC-US-0008-04, AC-US-0008-05]
---

# RULE-0005 — Tipos de volta, reposicionamento e pista de dado incompleto

Fontes: `DOMAIN/DEC-02` (D08), `DOMAIN/DEC-10`, I7. Quem define o tipo de uma volta é o desafio diário, fora
do escopo; esta regra só decide o que cada tipo implica aqui.

## Tipo de volta e resultado

| `lapKind` | Reposicionar em `RUNNING` | Volta concluída válida | Campo `official` do resultado | Fonte |
|---|---|---|---|---|
| `OFFICIAL` | Invalida, `REPOSITION`, fim no passo do pedido | Tempo oficial | `true` | AC-US-0007-01; `DOMAIN/DEC-02` |
| `RECON` | Livre, sem invalidar, sem motivo, sem penalidade | Tempo exibido como não oficial | `false` | AC-US-0007-04, AC-US-0007-05, AC-US-0007-06; AC-US-0008-01 |
| `TRAINING` | Livre, sem invalidar, sem motivo, sem penalidade | Tempo exibido como não oficial | `false` | AC-US-0007-04, AC-US-0007-05, AC-US-0007-06; AC-US-0008-01 |

`official` é `true` somente quando `lapKind` é `OFFICIAL`, `lapValidity` é `VALID`, a volta foi concluída e a
pista é de dado completo. Em qualquer outra combinação é `false`. Nenhuma volta de reconhecimento ou de
treino é entregue como resultado oficial (AC-US-0008-02).

## Reposicionamento (comando `repositionKart`)

| Fase da volta | Efeito | Fonte |
|---|---|---|
| `RUNNING` e `OFFICIAL` | Invalida com `REPOSITION` no passo do pedido | AC-US-0007-01, AC-US-0007-03 |
| `RUNNING` e `RECON` ou `TRAINING` | Recoloca o kart na pista; sem efeito sobre validade, tempo e motivo | AC-US-0007-04 a AC-US-0007-06 |
| `COUNTDOWN` ou `PAUSED` | Rejeitado com `NOT_RUNNING`, sem efeito sobre a validade | US-0007, pré-condição e caso anormal sobre pausa |
| `ENDED` | Rejeitado com `LAP_ENDED`, sem efeito; reposicionamentos repetidos não geram segundo resultado | US-0007, caso anormal; I7 |

O tempo da volta de reconhecimento ou de treino, N passos depois do sinal verde, segue N × `STEP` com ou sem
reposicionamento (AC-US-0007-06). O ponto para onde o kart é recolocado não é decidido pelos requisitos (ver
`01-overview.md`).

## Leitura do dado da pista e oferta de volta

`trackDataStatus` resulta da leitura do dado ([API-0003](../api/API-0003-dado-de-pista.md)).

| `trackDataStatus` | Significado | Volta oficial oferecida | Volta de treino oferecida | Fonte |
|---|---|---|---|---|
| `COMPLETE` | Declara largada, sentido, linha de chegada, quatro setores e marcadores, de forma consistente | Sim, se o desafio diário a define | Sim | `DOMAIN/DEC-10` |
| `INCOMPLETE` | Falta algum dos itens acima, ou o dado está na forma anterior, ou é inconsistente | Não: nenhuma opção de volta oficial | Sim: pilotável | AC-US-0008-03, AC-US-0008-04; `DOMAIN/DEC-10` |
| `UNSUPPORTED_SCHEMA` | Versão de esquema desconhecida | Não | Não: o dado não é usado | I3, I4 |
| `UNREADABLE` | Dado ilegível | Não | Não | I4 |

Em pista `INCOMPLETE` todo resultado tem `official` igual a `false` (AC-US-0008-05). Um pedido `startLap`
com `lapKind` `OFFICIAL` que chegue à simulação para uma pista `INCOMPLETE` é rejeitado com
`OFFICIAL_NOT_AVAILABLE` e não cria volta ([API-0002](../api/API-0002-comandos-da-volta.md)).

## Idempotência e ordem

| Transição | Idempotente sob repetição | Contador de sequência |
|---|---|---|
| Invalidação por reposicionamento | Sim: a segunda é rejeitada (`LAP_ENDED`) | `stepCount` do passo do pedido |
| Reposicionamento em reconhecimento ou treino | Pode repetir; cada um recoloca o kart sem outro efeito de validade | `stepCount` do passo do pedido |
| Leitura do dado da pista | Sim: ler duas vezes o mesmo dado dá o mesmo `trackDataStatus` | nenhum |
