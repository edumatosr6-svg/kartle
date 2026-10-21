---
id: RULE-0001
title: Validade da volta
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: [US-0002, US-0004, US-0005, US-0006, US-0007, US-0008, AC-US-0002-01, AC-US-0004-01, AC-US-0004-02, AC-US-0005-01, AC-US-0005-03, AC-US-0006-01, AC-US-0007-01, AC-US-0007-04]
---

# RULE-0001 — Validade da volta

Decide quando uma volta é válida, inválida ou segue em andamento. A decisão pertence à simulação (I2,
D-FS-05); a tela só exibe o resultado. Cada linha cita a fonte; nenhum limite nasce aqui.

## Vocabulário

| Termo | Valores |
|---|---|
| `lapValidity` | `VALID` (em andamento ou concluída), `INVALID` |
| `invalidReason` | `MISSED_MARKER`, `CUT`, `REPOSITION`, ou ausente quando `lapValidity` é `VALID` |
| `lapKind` | `OFFICIAL`, `RECON`, `TRAINING` |
| Cruzamento no sentido da pista | travessia de uma linha no sentido que o dado da pista declara como o da pista ([API-0003](../api/API-0003-dado-de-pista.md)) |
| Contramão | travessia da mesma linha no sentido oposto |

## Tabela 1 — cruzamento da linha de chegada (fase `RUNNING`)

| Sentido do cruzamento | Todos os marcadores passados em ordem | Efeito | Fonte |
|---|---|---|---|
| Contramão | qualquer | Ignorado: a volta não encerra, nenhum resultado, nenhum tempo | AC-US-0005-01, AC-US-0005-02 |
| Sentido da pista | sim | Volta concluída: `lapValidity` `VALID`, fase `ENDED`, resultado com tempo total e quatro tempos de setor | AC-US-0002-01 |
| Sentido da pista | não, ou na ordem errada | `lapValidity` `INVALID` com `MISSED_MARKER`, fase `ENDED`, sem tempo | AC-US-0004-01, AC-US-0004-02 |

Uma volta só se encerra no passo em que a chegada é cruzada no sentido da pista (AC-US-0005-03), com uma
exceção: uma volta invalidada por corte ou por reposicionamento termina no passo da invalidação (Tabela 2).

## Tabela 2 — eventos que invalidam, por tipo de volta

| Evento | `OFFICIAL` | `RECON` ou `TRAINING` | Fonte |
|---|---|---|---|
| Chegada no sentido da pista sem todos os marcadores em ordem | `INVALID`, `MISSED_MARKER` | `INVALID`, `MISSED_MARKER` | AC-US-0004-01; US-0008, caso anormal |
| Corte (ver [RULE-0004](RULE-0004-corte-e-grama.md)) | `INVALID`, `CUT` | `INVALID`, `CUT` | AC-US-0006-01; US-0008, caso anormal |
| Reposicionamento com fase `RUNNING` | `INVALID`, `REPOSITION` | Nenhum efeito sobre a validade, sem motivo, sem penalidade | AC-US-0007-01, AC-US-0007-04 |
| Chegada na contramão | Nenhum efeito | Nenhum efeito | AC-US-0005-01; US-0008, caso anormal |
| Saída de pista dentro dos limites de corte (grama) | Nenhum efeito sobre a validade; só a redução de velocidade | Igual | AC-US-0006-08 |
| Aceleração antes do sinal verde | Nenhum efeito | Nenhum efeito | AC-US-0001-07 |
| Pausa, perda de foco, perda do sensor | Nenhum efeito sobre a validade | Igual | AC-US-0003-09 |

## Tabela 3 — o que acontece depois da invalidação ou da conclusão

| Condição | Efeito | Fonte |
|---|---|---|
| Volta invalidada | Termina no passo da invalidação: nenhum tempo de volta nem de setor é acrescentado depois dele | AC-US-0004-07, AC-US-0006-06, AC-US-0007-03; `DOMAIN/DEC-06` |
| Volta com `lapValidity` `INVALID` | Não tem tempo oficial; o resultado não carrega tempo total nem tempos de setor | AC-US-0004-03 |
| Volta encerrada (válida ou inválida) e novo evento (chegada, marcador, saída de pista, reposicionamento) | Ignorado: a fase é `ENDED` e o estado contém exatamente 1 resultado | AC-US-0002-12; I7 |
| Duas invalidações possíveis na mesma volta | Vale a primeira na ordem dos passos; a volta já terminou nela. Exemplo: corte e depois chegada sem marcadores mantém o motivo `CUT` | `DOMAIN/DEC-06`; US-0006, caso anormal |
| Passagem por marcador antes do marcador anterior, ou na contramão | Não conta; `markersPassedCount` não avança nem recua | AC-US-0005-04; AC-US-0004-02 |
| Marcador retomado depois de pulado, na ordem e no sentido da pista | Conta | US-0004, caso anormal |

## Contador de marcadores

`markersPassedCount` é um inteiro de 0 ao total de marcadores declarados na pista. A travessia, no sentido da
pista, do marcador de índice `markersPassedCount` + 1 aumenta o contador de 1. Qualquer outra travessia de
marcador (contramão, ou marcador que não é o próximo) deixa o contador como está. A idempotência é natural:
atravessar de novo um marcador já contado não muda o contador. O contador sobrevive à pausa.

## Idempotência e ordem

| Transição | Idempotente sob repetição | Carrega contador de sequência |
|---|---|---|
| Conclusão da volta | Sim: o segundo cruzamento é ignorado (fase `ENDED`) | `stepCount` do passo de encerramento |
| Invalidação | Sim: a segunda invalidação é ignorada (fase `ENDED`) | `stepCount` do passo da invalidação |
| Passagem por marcador | Sim: não aumenta o contador duas vezes | `stepCount` do passo da travessia |

A fonte do estado da volta no resto do conjunto é [RULE-0002](RULE-0002-estados-da-volta.md).
