---
id: FEAT-0005
title: Corte invalida a volta, grama sem corte só reduz a velocidade
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: [US-0006, AC-US-0006-01, AC-US-0006-02, AC-US-0006-03, AC-US-0006-04, AC-US-0006-05, AC-US-0006-06, AC-US-0006-07, AC-US-0006-08]
---

# FEAT-0005 — Corte invalida a volta, grama sem corte só reduz a velocidade

## Resumo

Sair da pista é corte, e invalida a volta, somente quando o kart fica a mais de 3 m além da borda da pista
por mais de 1000 ms seguidos; esses valores padrão podem ser substituídos pelos limites que o dado da pista
declarar (`DOMAIN/DEC-01`). Uma escapada que não ultrapassa os limites apenas reduz a velocidade (grama,
RF08) e não invalida a volta.

## Canais

`web-desktop` e `web-mobile`: mesmos limites de corte e mesmo motivo exibido; nenhuma diferença de
comportamento. Em `web-mobile` com sensor ausente ou permissão negada, o controle recai para toque com
estado visível e as regras desta feature não mudam.

## Requisitos

- REQ-FEAT-0005-01: O sistema SHALL, no estado da simulação, tornar a volta inválida no passo em que os
  1000 ms seguidos são ultrapassados quando o kart fica a mais de 3 m além da borda da pista por mais de
  1000 ms seguidos e o dado da pista não declara limites de corte próprios (AC-US-0006-01).
- REQ-FEAT-0005-02: O sistema SHALL NOT tornar a volta inválida quando o kart fica a mais de 3 m além da
  borda da pista por no máximo 1000 ms seguidos e volta a ficar a 3 m ou menos dela (AC-US-0006-02).
- REQ-FEAT-0005-03: O sistema SHALL NOT tornar a volta inválida quando o kart fica além da borda da pista a
  no máximo 3 m dela, por qualquer duração (AC-US-0006-03).
- REQ-FEAT-0005-04: O sistema SHALL, numa pista cujo dado declara limites de corte próprios (distância em
  metros e duração em milissegundos), tornar a volta inválida, no estado da simulação, quando o kart
  ultrapassa esses limites, em lugar dos valores de 3 m e 1000 ms (AC-US-0006-04).
- REQ-FEAT-0005-05: O sistema SHALL exibir na tela o motivo "corte" quando a volta se torna inválida por
  corte (AC-US-0006-05).
- REQ-FEAT-0005-06: O sistema SHALL terminar a volta inválida por corte no passo da invalidação, sem
  acrescentar tempo de volta nem tempo de setor depois desse passo (AC-US-0006-06).
- REQ-FEAT-0005-07: O sistema SHALL reduzir a velocidade do kart na grama de modo que, no estado da
  simulação, partindo do mesmo estado inicial e com a mesma entrada em todos os passos, a velocidade após N
  passos de `STEP` na grama seja menor que após N passos de `STEP` na pista (AC-US-0006-07; RF08).
- REQ-FEAT-0005-08: O sistema SHALL manter o estado "válida em andamento" na tela quando o kart anda na
  grama sem ultrapassar os limites de corte (AC-US-0006-08).
- REQ-FEAT-0005-09: O sistema SHALL reiniciar a contagem dos milissegundos seguidos de saída de pista a
  cada nova saída além da distância dos limites de corte, depois de o kart ter voltado a essa distância ou
  menos da borda (AC-US-0006-02).
- REQ-FEAT-0005-10: O sistema SHALL medir a duração da saída de pista no estado da simulação, em passos de
  `STEP`, sem contar o tempo em que a simulação esteve suspensa por pausa, perda de foco ou perda do sensor
  [DOMAIN] (US-0006, caso anormal; `DOMAIN/DEC-08`).
- REQ-FEAT-0005-11: O sistema SHALL exibir o motivo "corte" quando um corte ocorre antes de um marcador
  pulado, porque a volta termina no corte [DOMAIN] (US-0006, caso anormal; `DOMAIN/DEC-06`).
- REQ-FEAT-0005-12: O sistema SHALL NOT produzir resultado para uma volta cuja página foi recarregada ou
  abandonada antes da chegada [DOMAIN] (US-0006, caso anormal; `SEED/RD-05`).

## Comportamento

Regra de decisão e acumulador: [RULE-0004](../rules/RULE-0004-corte-e-grama.md). Invalidação e fim da
volta: [FLOW-0002](../flows/FLOW-0002-invalidacao-e-fim-da-volta.md). Limites declarados pela pista:
[API-0003](../api/API-0003-dado-de-pista.md).

| Situação | Comportamento |
|---|---|
| Distância além da borda maior que o limite de distância, por mais que o limite de duração, seguidos | Corte: volta inválida no passo em que a duração é ultrapassada, motivo "corte" |
| Saída até o limite de duração e retorno a distância menor ou igual ao limite | Sem invalidação; o acumulador volta a zero |
| Saída a distância menor ou igual ao limite de distância, por qualquer duração | Sem invalidação; apenas a redução de velocidade da grama |
| Saída interrompida e retomada | A contagem recomeça a cada saída além do limite de distância |
| Corte seguido de chegada sem marcadores | Já encerrada no corte; motivo "corte"; a chegada posterior é ignorada |
| Pausa, perda de foco ou perda do sensor durante a saída | A simulação não avança; o acumulador não muda |
| Pista que declara limites próprios | Os limites da pista substituem os padrões |
| Recarregar ou abandonar antes da chegada | Nenhum resultado |
| Rede indisponível | Sem efeito (D-FS-08) |

## Estado

Lê e altera `offTrackMs` (acumulador de duração contínua da saída além do limite de distância),
`lapValidity` e `invalidReason` ([RULE-0002](../rules/RULE-0002-estados-da-volta.md)).

| Transição | O que a dispara | Idempotência e contador |
|---|---|---|
| `offTrackMs` aumenta de `STEP` | passo com o kart além do limite de distância da borda | Avança apenas por passo de simulação; não avança em `PAUSED` |
| `offTrackMs` volta a 0 | passo com o kart a no máximo o limite de distância da borda | Idempotente |
| `lapValidity` `VALID` para `INVALID` com `CUT`, fase para `ENDED` | passo em que `offTrackMs` passa a ser maior que o limite de duração | Ocorre uma única vez; ordenada por `stepCount` |

## Configuração

Nenhuma configuração da feature. Os limites de corte são dado da pista: `cutDistanceM` e `cutDurationMs`
([API-0003](../api/API-0003-dado-de-pista.md)); na ausência, valem 3 m e 1000 ms (`DOMAIN/DEC-01`).

## Critérios de aceite

- Mais de 3 m além da borda por mais de 1000 ms seguidos invalida no passo em que os 1000 ms são
  ultrapassados; até 1000 ms e retorno, ou até 3 m por qualquer duração, não invalida (satisfaz
  AC-US-0006-01, AC-US-0006-02, AC-US-0006-03; cobre os requisitos 01 a 03, 09 e 10).
- Numa pista com limites próprios valem os da pista e não 3 m e 1000 ms (satisfaz AC-US-0006-04; cobre o
  requisito 04).
- O motivo "corte" aparece e nenhum tempo é acrescentado depois do passo da invalidação (satisfaz
  AC-US-0006-05, AC-US-0006-06; cobre os requisitos 05, 06 e 11).
- A velocidade na grama é menor que na pista; a volta com escapada dentro dos limites segue "válida em
  andamento" (satisfaz AC-US-0006-07, AC-US-0006-08; cobre os requisitos 07 e 08).
- Recarregar não produz resultado (satisfaz AC-US-0006-06; cobre o requisito 12).

## Pontos em aberto

Nenhum.
