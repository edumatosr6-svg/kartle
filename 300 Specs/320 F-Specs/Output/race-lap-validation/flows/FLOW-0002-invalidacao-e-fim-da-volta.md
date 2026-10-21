---
id: FLOW-0002
title: Invalidação e fim imediato da volta
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: [US-0004, US-0006, US-0007, AC-US-0004-07, AC-US-0006-01, AC-US-0006-05, AC-US-0006-06, AC-US-0007-01, AC-US-0007-03, AC-US-0007-04]
---

# FLOW-0002 — Invalidação e fim imediato da volta

Como uma volta se torna inválida e termina no passo da invalidação (`DOMAIN/DEC-06`), nos três motivos.
Realiza [FEAT-0004](../features/FEAT-0004-marcadores-e-sentido-da-pista.md),
[FEAT-0005](../features/FEAT-0005-corte-e-grama.md) e
[FEAT-0006](../features/FEAT-0006-reposicionamento-e-tipos-de-volta.md). Igual nos dois canais; sem rede
(D-FS-08).

```mermaid
sequenceDiagram
    participant J as Jogador
    participant S as Simulacao
    participant A as Apresentacao
    alt chegada sem todos os marcadores em ordem
        S->>S: chegada cruzada no sentido da pista
        S->>S: MISSED_MARKER
    else corte
        S->>S: duracao alem do limite supera cutDurationMs
        S->>S: CUT
    else reposicionamento em volta oficial
        J->>A: aciona reposicionamento
        A->>S: repositionKart
        S->>S: REPOSITION
    end
    S->>S: lapValidity INVALID e fase ENDED neste passo
    S-->>A: resultado sem tempo
    A-->>J: inválida e motivo
    Note over S: eventos posteriores sao ignorados
```

## Passos

| Passo | Ator | Ação | Estado | Fonte |
|---|---|---|---|---|
| 1 | Simulação | Detecta um dos três eventos num passo em `RUNNING` | `RUNNING` | AC-US-0004-01, AC-US-0006-01, AC-US-0007-01 |
| 2 | Simulação | Fixa `lapValidity` `INVALID` e `invalidReason` do evento | `VALID` para `INVALID` | [RULE-0001](../rules/RULE-0001-validade-da-volta.md) |
| 3 | Simulação | Termina a volta nesse passo: `ENDED`; nenhum tempo de volta nem de setor é acrescentado depois | `RUNNING` para `ENDED` | AC-US-0004-07, AC-US-0006-06, AC-US-0007-03 |
| 4 | Simulação | Produz o resultado: sem `lapMs` e sem `sectorMs`; `official` igual a `false` | `ENDED` | AC-US-0004-03 |
| 5 | Apresentação | Exibe "inválida" e o motivo ([RULE-0006](../rules/RULE-0006-mensagens-de-estado-e-motivo.md)) | `ENDED` | AC-US-0006-05, AC-US-0009-03 |
| 6 | Simulação | Ignora qualquer evento posterior: chegada, marcador, saída de pista, novo reposicionamento | `ENDED` | I7 |

## Motivos e tipos de volta

| Evento | Volta oficial | Reconhecimento ou treino |
|---|---|---|
| Chegada sem todos os marcadores em ordem | passos 1 a 6 com `MISSED_MARKER` | passos 1 a 6 com `MISSED_MARKER` |
| Corte | passos 1 a 6 com `CUT` | passos 1 a 6 com `CUT` |
| Reposicionamento | passos 1 a 6 com `REPOSITION` | não invalida: o kart é recolocado e a volta continua em andamento (AC-US-0007-04) |

## Alternativas, erros e eventos fora de ordem

| Situação | Tratamento |
|---|---|
| Duas invalidações possíveis na mesma volta (corte e depois chegada sem marcadores) | Vale a primeira na ordem dos passos; o motivo é o dela |
| Chegada cruzada de novo depois da invalidação | Ignorada; nenhum segundo resultado (I7); a deduplicação ocorre na simulação pela fase `ENDED` |
| Reposicionamento repetido em volta oficial | O primeiro invalida; os seguintes retornam `LAP_ENDED` |
| Reposicionamento durante a contagem ou a pausa | `NOT_RUNNING`; sem efeito na validade |
| Pausa durante a saída de pista | Nenhum passo avança; o tempo em pausa não conta para os limites de corte |
| Recarregar ou abandonar | Nenhum resultado |
| Rede indisponível | Sem efeito |
