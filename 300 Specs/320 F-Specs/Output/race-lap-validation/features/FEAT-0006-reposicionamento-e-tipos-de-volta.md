---
id: FEAT-0006
title: Reposicionamento, reconhecimento e treino
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: [US-0007, US-0008, AC-US-0007-01, AC-US-0007-02, AC-US-0007-03, AC-US-0007-04, AC-US-0007-05, AC-US-0007-06, AC-US-0008-01, AC-US-0008-02, AC-US-0008-03, AC-US-0008-04, AC-US-0008-05]
---

# FEAT-0006 — Reposicionamento, reconhecimento e treino

## Resumo

Reposicionar o kart invalida a volta oficial, com o motivo "reposicionamento", e é livre e sem penalidade em
volta de reconhecimento e de treino (`DOMAIN/DEC-02`). Volta de reconhecimento e de treino nunca produz
tempo oficial: o tempo é identificado como não oficial. Numa pista de dado incompleto só há volta de treino
(`DOMAIN/DEC-10`). Quem define o tipo de cada volta é o desafio diário, fora do escopo; esta feature recebe
o tipo ao iniciar a volta ([API-0002](../api/API-0002-comandos-da-volta.md)).

## Canais

| Canal | Reposicionamento |
|---|---|
| `web-desktop` | Acionado pelo teclado (RF12) |
| `web-mobile` | Acionado por toque |

A regra, o motivo exibido, a identificação de "não oficial" e a restrição para pista de dado incompleto são
iguais nos dois canais. Em `web-mobile` com sensor ausente ou permissão negada, o controle recai para toque
com estado visível e as regras não mudam.

## Requisitos

- REQ-FEAT-0006-01: O sistema SHALL, em volta oficial, tornar a volta inválida, no estado da simulação,
  quando o kart é reposicionado (AC-US-0007-01).
- REQ-FEAT-0006-02: O sistema SHALL exibir na tela o motivo "reposicionamento" quando uma volta oficial é
  reposicionada (AC-US-0007-02).
- REQ-FEAT-0006-03: O sistema SHALL terminar a volta oficial invalidada por reposicionamento no passo do
  reposicionamento, sem acrescentar tempo de volta depois desse passo (AC-US-0007-03).
- REQ-FEAT-0006-04: O sistema SHALL NOT tornar inválida uma volta de reconhecimento ou de treino por
  reposicionamento: a tela continua exibindo o estado "válida em andamento" (AC-US-0007-04).
- REQ-FEAT-0006-05: O sistema SHALL NOT exibir motivo na tela quando o kart é reposicionado em volta de
  reconhecimento ou de treino (AC-US-0007-05).
- REQ-FEAT-0006-06: O sistema SHALL contar, numa volta de reconhecimento ou de treino, o tempo da volta
  após um reposicionamento, N passos de `STEP` depois do sinal verde, como N × `STEP`, sem acréscimo de
  penalidade (AC-US-0007-06).
- REQ-FEAT-0006-07: O sistema SHALL exibir o tempo de uma volta de reconhecimento ou de treino concluída
  identificado em texto como não oficial (AC-US-0008-01).
- REQ-FEAT-0006-08: O sistema SHALL identificar como não oficial, no estado da simulação, o resultado de
  uma volta de reconhecimento ou de treino (AC-US-0008-02).
- REQ-FEAT-0006-09: O sistema SHALL NOT oferecer volta oficial numa pista de dado incompleto: nenhuma opção
  de iniciar volta oficial é exibida (AC-US-0008-03).
- REQ-FEAT-0006-10: O sistema SHALL oferecer a volta de treino, pilotável, numa pista de dado incompleto
  (AC-US-0008-04).
- REQ-FEAT-0006-11: O sistema SHALL identificar como não oficial, no estado da simulação, todo resultado
  numa pista de dado incompleto (AC-US-0008-05).
- REQ-FEAT-0006-12: O sistema SHALL aplicar as regras de marcador pulado e de corte a voltas de
  reconhecimento e de treino como a qualquer tipo de volta, sem que nenhuma delas produza tempo oficial
  (AC-US-0008-01).
- REQ-FEAT-0006-13: O sistema SHALL tratar a chegada cruzada na contramão em reconhecimento e treino como
  em qualquer volta, sem encerrar a volta, sem registrar tempo e sem invalidá-la (AC-US-0005-01).
- REQ-FEAT-0006-14: O sistema SHALL tratar um reposicionamento pedido com a volta encerrada como sem
  efeito, de modo que reposicionamentos repetidos em volta oficial mantenham o motivo "reposicionamento" do
  primeiro e não produzam segundo resultado [DOMAIN] (US-0007, caso anormal; I7).
- REQ-FEAT-0006-15: O sistema SHALL rejeitar um pedido de reposicionamento recebido fora da fase de volta
  em andamento (contagem ou pausa) sem efeito sobre a validade, porque pausar ou aguardar não é
  reposicionar [DOMAIN] (US-0007, pré-condição e caso anormal sobre pausa; `DOMAIN/DEC-08`).
- REQ-FEAT-0006-16: O sistema SHALL NOT produzir resultado para uma volta cuja página foi recarregada ou
  abandonada antes da chegada [DOMAIN] (US-0007, US-0008, caso anormal; `SEED/RD-05`).

## Comportamento

Tabela de decisão por tipo de volta: [RULE-0005](../rules/RULE-0005-tipos-de-volta-e-reposicionamento.md).
Oferta de volta: [SCR-0002](../screens/SCR-0002-inicio-de-volta.md). Início da volta:
[FLOW-0004](../flows/FLOW-0004-inicio-da-volta.md).

| Situação | Comportamento |
|---|---|
| Volta oficial, reposicionamento | Invalida no passo do pedido, motivo "reposicionamento", fim imediato, sem tempo oficial |
| Reposicionamentos repetidos em volta oficial | O primeiro encerra a volta; os seguintes são ignorados |
| Reconhecimento ou treino, reposicionamento (repetido ou não) | Sem invalidação, sem motivo, sem penalidade no tempo |
| Reconhecimento ou treino concluído | Tempo exibido e identificado como não oficial; nunca entregue como resultado oficial |
| Reconhecimento ou treino inválido por marcador ou corte | As regras de [FEAT-0004](FEAT-0004-marcadores-e-sentido-da-pista.md) e [FEAT-0005](FEAT-0005-corte-e-grama.md) valem; nenhum tempo oficial |
| Pista de dado incompleto | Sem opção de volta oficial; volta de treino oferecida; todo resultado não oficial |
| Pista de dado incompleto que não declara linha de chegada ou setores | A volta de treino pode ser pilotada e nenhum resultado dela é oficial; o que se cronometra sem linha de chegada não é decidido pelos requisitos (ver `01-overview.md`) |
| Pedido de volta oficial numa pista de dado incompleto que chega à simulação | Rejeitado com `OFFICIAL_NOT_AVAILABLE`; nenhuma volta é criada |
| Pausa, perda de foco ou perda do sensor | Simulação e cronômetro suspensos; pausar não é reposicionar e não invalida |
| Recarregar ou abandonar antes da chegada | Nenhum resultado |
| Rede indisponível | Sem efeito (D-FS-08) |

## Estado

Lê `lapKind` (`OFFICIAL`, `RECON`, `TRAINING`), altera `lapValidity` e `invalidReason`
([RULE-0002](../rules/RULE-0002-estados-da-volta.md)) e define `official` no resultado
([API-0001](../api/API-0001-resultado-e-estado-da-volta.md)).

| Transição | O que a dispara | Idempotência e contador |
|---|---|---|
| `lapValidity` `VALID` para `INVALID` com `REPOSITION`, fase para `ENDED` | reposicionamento pedido com `lapKind` `OFFICIAL` e fase `RUNNING` | Ocorre uma única vez; pedidos seguintes ignorados. Ordenada por `stepCount` |
| Nenhuma mudança de validade | reposicionamento com `lapKind` `RECON` ou `TRAINING` | O reposicionamento pode repetir sem efeito sobre a validade ou o tempo |

## Configuração

Nenhuma. O tipo de volta é entrada do pedido de início, não uma configuração.

## Critérios de aceite

- Em volta oficial, reposicionar invalida, exibe "reposicionamento" e nenhum tempo é acrescentado depois do
  passo do pedido (satisfaz AC-US-0007-01, AC-US-0007-02, AC-US-0007-03; cobre os requisitos 01 a 03, 14 e
  15).
- Em reconhecimento e treino, reposicionar não invalida, não exibe motivo e o tempo após N passos é
  N × `STEP` (satisfaz AC-US-0007-04, AC-US-0007-05, AC-US-0007-06; cobre os requisitos 04 a 06).
- Volta de reconhecimento ou treino concluída exibe o tempo como não oficial e o resultado é não oficial
  (satisfaz AC-US-0008-01, AC-US-0008-02; cobre os requisitos 07, 08, 12 e 13).
- Em pista de dado incompleto não há opção de volta oficial, há volta de treino pilotável e todo resultado é
  não oficial (satisfaz AC-US-0008-03, AC-US-0008-04, AC-US-0008-05; cobre os requisitos 09 a 11).
- Recarregar não produz resultado (satisfaz AC-US-0007-03; cobre o requisito 16).

## Pontos em aberto

Nenhum.
