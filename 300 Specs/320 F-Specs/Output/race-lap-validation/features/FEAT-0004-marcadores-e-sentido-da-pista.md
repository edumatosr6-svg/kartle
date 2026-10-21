---
id: FEAT-0004
title: Marcador pulado e chegada na contramão
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: [US-0004, US-0005, AC-US-0004-01, AC-US-0004-02, AC-US-0004-03, AC-US-0004-04, AC-US-0004-05, AC-US-0004-06, AC-US-0004-07, AC-US-0005-01, AC-US-0005-02, AC-US-0005-03, AC-US-0005-04]
---

# FEAT-0004 — Marcador pulado e chegada na contramão

## Resumo

Os marcadores de validação são um conjunto distinto dos quatro setores. Cruzar a chegada no sentido da pista
sem ter passado por todos os marcadores em ordem torna a volta inválida com o motivo "marcador pulado" e sem
tempo oficial. Cruzar a chegada, ou atravessar um marcador, no sentido oposto ao da pista não conta: não
encerra a volta, não registra tempo e não avança o progresso pelos marcadores.

## Canais

`web-desktop` e `web-mobile`: mesma regra e mesmo motivo exibido; nenhuma diferença de comportamento. Em
`web-mobile` com sensor ausente ou permissão negada, o controle recai para toque com estado visível e as
regras desta feature não mudam.

## Requisitos

- REQ-FEAT-0004-01: O sistema SHALL exibir a volta como inválida quando a linha de chegada é cruzada no
  sentido da pista sem que o Jogador tenha passado por todos os marcadores (AC-US-0004-01).
- REQ-FEAT-0004-02: O sistema SHALL exibir a volta como inválida quando a linha de chegada é cruzada no
  sentido da pista tendo o Jogador passado por todos os marcadores fora da ordem declarada no dado da pista
  (AC-US-0004-02).
- REQ-FEAT-0004-03: O sistema SHALL NOT exibir tempo oficial numa volta inválida por marcador
  (AC-US-0004-03).
- REQ-FEAT-0004-04: O sistema SHALL exibir o motivo "marcador pulado" numa volta inválida por marcador
  (AC-US-0004-04).
- REQ-FEAT-0004-05: O sistema SHALL exibir como inválida, com o motivo "marcador pulado", uma volta que
  cruza os limites dos quatro setores mas deixa de passar por um marcador (AC-US-0004-05).
- REQ-FEAT-0004-06: O sistema SHALL exibir como inválida, com o motivo "marcador pulado", uma volta na
  pista sintética atual que cruza a chegada sem passar por um dos seus marcadores (AC-US-0004-06).
- REQ-FEAT-0004-07: O sistema SHALL terminar a volta inválida por marcador no passo em que a chegada é
  cruzada, sem acrescentar tempo de volta depois desse passo (AC-US-0004-07).
- REQ-FEAT-0004-08: O sistema SHALL manter a tela exibindo o estado da volta em andamento quando a linha de
  chegada é cruzada no sentido oposto ao da pista (AC-US-0005-01).
- REQ-FEAT-0004-09: O sistema SHALL NOT registrar resultado nem tempo para um cruzamento da linha de
  chegada no sentido oposto ao da pista: o estado da simulação não contém resultado para essa volta
  (AC-US-0005-02).
- REQ-FEAT-0004-10: O sistema SHALL encerrar uma volta somente no passo em que a linha de chegada é
  cruzada no sentido da pista (AC-US-0005-03).
- REQ-FEAT-0004-11: O sistema SHALL NOT contar como passagem por um marcador a travessia desse marcador
  no sentido oposto ao da pista (AC-US-0005-04).
- REQ-FEAT-0004-12: O sistema SHALL contar a passagem por um marcador somente quando ela ocorre no sentido
  da pista e esse marcador é o próximo na ordem declarada no dado da pista, de modo que um marcador
  retomado depois de pulado conte se for passado na ordem e no sentido (AC-US-0004-02).
- REQ-FEAT-0004-13: O sistema SHALL NOT produzir um segundo resultado quando a linha de chegada é cruzada
  de novo depois de a volta ter sido invalidada por marcador (AC-US-0004-07; I7).
- REQ-FEAT-0004-14: O sistema SHALL preservar, depois de pausa, perda de foco ou perda do sensor durante a
  volta, as passagens por marcador registradas antes da pausa [DOMAIN] (US-0004, caso anormal;
  `DOMAIN/DEC-08`).
- REQ-FEAT-0004-15: O sistema SHALL NOT produzir resultado para uma volta cuja página foi recarregada ou
  abandonada antes da chegada [DOMAIN] (US-0004, US-0005, caso anormal; `SEED/RD-05`).

## Comportamento

Fluxos: [FLOW-0001](../flows/FLOW-0001-volta-completa.md) e [FLOW-0002](../flows/FLOW-0002-invalidacao-e-fim-da-volta.md).
Regra de decisão: [RULE-0001](../rules/RULE-0001-validade-da-volta.md).

| Situação | Comportamento |
|---|---|
| Chegada no sentido da pista com todos os marcadores em ordem | Volta válida ([FEAT-0002](FEAT-0002-conclusao-da-volta-tempos-e-setores.md)) |
| Chegada no sentido da pista sem todos os marcadores em ordem | Volta inválida, motivo "marcador pulado", fim imediato, sem tempo oficial |
| Marcador pulado e depois retomado antes da chegada | A passagem conta se for o próximo marcador esperado, na ordem e no sentido da pista |
| Marcador atravessado na contramão | Não conta; o progresso pelos marcadores não recua nem avança |
| Cruzamentos repetidos da chegada na contramão | Nenhum encerra a volta nem registra tempo |
| Contramão seguida de cruzamento no sentido da pista | Encerra a volta; a validade depende dos marcadores |
| Chegada cruzada de novo depois da volta inválida | Ignorada: nenhum segundo resultado; a deduplicação ocorre na simulação, que só avalia cruzamentos com a fase `RUNNING` |
| Pausa durante a volta | Progresso pelos marcadores preservado |
| Recarregar ou abandonar antes da chegada | Nenhum resultado |
| Rede indisponível | Sem efeito (D-FS-08) |

## Estado

Lê e altera `markersPassedCount` (quantos marcadores já foram passados em ordem), `lapValidity` e
`invalidReason` ([RULE-0002](../rules/RULE-0002-estados-da-volta.md)).

| Transição | O que a dispara | Idempotência e contador |
|---|---|---|
| `markersPassedCount` aumenta de 1 | travessia, no sentido da pista, do marcador de índice `markersPassedCount` + 1 | Idempotente: atravessar de novo um marcador já passado não altera a contagem. Ordenada por `stepCount` |
| `lapValidity` `VALID` para `INVALID` com `MISSED_MARKER`, fase para `ENDED` | chegada cruzada no sentido da pista com `markersPassedCount` menor que o total de marcadores | Ocorre uma única vez; cruzamentos seguintes são ignorados |

## Configuração

Nenhuma. A lista e a ordem dos marcadores vêm do dado da pista ([API-0003](../api/API-0003-dado-de-pista.md)),
não de uma constante do jogo.

## Critérios de aceite

- Chegada no sentido da pista sem todos os marcadores, ou com todos fora da ordem, exibe volta inválida,
  sem tempo oficial, com o motivo "marcador pulado" (satisfaz AC-US-0004-01 a AC-US-0004-04; cobre os
  requisitos 01 a 04 e 12).
- Cruzar os quatro limites de setor sem passar por um marcador também é "marcador pulado" (satisfaz
  AC-US-0004-05; cobre o requisito 05).
- Na pista sintética atual, pular um dos seus marcadores exibe inválida com o motivo "marcador pulado"
  (satisfaz AC-US-0004-06; cobre o requisito 06).
- O tempo da volta não avança depois do passo da chegada inválida, e um novo cruzamento não gera segundo
  resultado (satisfaz AC-US-0004-07; cobre os requisitos 07 e 13).
- Chegada na contramão: a tela continua em andamento e o estado da simulação não contém resultado
  (satisfaz AC-US-0005-01, AC-US-0005-02; cobre os requisitos 08 e 09).
- A volta só se encerra no passo da chegada no sentido da pista; marcador na contramão não conta (satisfaz
  AC-US-0005-03, AC-US-0005-04; cobre os requisitos 10 e 11).
- Pausa preserva as passagens; recarregar não produz resultado (satisfaz AC-US-0004-07 e AC-US-0005-03;
  cobre os requisitos 14 e 15).

## Pontos em aberto

Nenhum.
