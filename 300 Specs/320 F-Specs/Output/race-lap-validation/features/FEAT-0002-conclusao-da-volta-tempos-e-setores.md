---
id: FEAT-0002
title: Conclusão da volta, tempo total e quatro tempos de setor
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: [US-0002, AC-US-0002-01, AC-US-0002-02, AC-US-0002-03, AC-US-0002-04, AC-US-0002-05, AC-US-0002-06, AC-US-0002-07, AC-US-0002-08, AC-US-0002-09, AC-US-0002-10, AC-US-0002-11, AC-US-0002-12, AC-US-0002-13]
---

# FEAT-0002 — Conclusão da volta, tempo total e quatro tempos de setor

## Resumo

Uma volta completa no sentido da pista, passando por todos os marcadores em ordem, termina ao cruzar a
chegada e produz um único resultado válido com tempo total e quatro tempos de setor, em milissegundos
inteiros, exibidos no formato `m:ss.mmm`. O instante de cruzamento da chegada e dos limites de setor é
interpolado dentro do passo de simulação (`DOMAIN/DEC-03`).

## Canais

`web-desktop` e `web-mobile`: mesmas regras de conclusão, mesmos tempos, mesmo formato e mesma informação
exibida; só o dispositivo de entrada difere. Em `web-mobile` com sensor ausente ou permissão negada, o
controle recai para toque com estado visível e as regras desta feature não mudam.

## Requisitos

- REQ-FEAT-0002-01: O sistema SHALL, ao cruzar a linha de chegada no sentido da pista depois de passar por
  todos os marcadores em ordem, encerrar a volta e exibir na tela a volta como válida (AC-US-0002-01).
- REQ-FEAT-0002-02: O sistema SHALL exibir na tela o tempo total da volta válida (AC-US-0002-02).
- REQ-FEAT-0002-03: O sistema SHALL exibir na tela quatro tempos de setor da volta válida (AC-US-0002-03).
- REQ-FEAT-0002-04: O sistema SHALL expressar, no resultado de uma volta válida, o tempo total e cada um
  dos quatro tempos de setor em milissegundos inteiros (AC-US-0002-04).
- REQ-FEAT-0002-05: O sistema SHALL produzir, no resultado de uma volta válida, quatro tempos de setor cuja
  soma em milissegundos é igual ao tempo total, com diferença de 0 ms (AC-US-0002-05).
- REQ-FEAT-0002-06: O sistema SHALL exibir o tempo total e cada tempo de setor no formato `m:ss.mmm`, com 3
  casas decimais de segundo (AC-US-0002-06).
- REQ-FEAT-0002-07: O sistema SHALL, quando a linha de chegada é cruzada entre o passo k e o passo k + 1
  contados do sinal verde, sem coincidir com nenhum dos dois, produzir um tempo total maior que k × `STEP`
  e menor que (k + 1) × `STEP`, e, quando o cruzamento coincide com um passo, produzir o tempo desse passo,
  k × `STEP` (AC-US-0002-07).
- REQ-FEAT-0002-08: O sistema SHALL, quando um limite de setor é cruzado entre o passo k e o passo k + 1
  contados do sinal verde, sem coincidir com nenhum dos dois, produzir um instante de fim desse setor maior
  que k × `STEP` e menor que (k + 1) × `STEP` (AC-US-0002-08).
- REQ-FEAT-0002-09: O sistema SHALL exibir na tela, durante a volta, o tempo de cada setor ao completá-lo
  (AC-US-0002-09).
- REQ-FEAT-0002-10: O sistema SHALL encerrar cada tempo de setor no cruzamento do limite de setor declarado
  no dado da pista, iniciando o primeiro setor no sinal verde e encerrando o quarto no cruzamento da
  chegada (AC-US-0002-10).
- REQ-FEAT-0002-11: O sistema SHALL identificar, no resultado de uma volta concluída, a pista (`trackId`) e
  a versão da pista (`trackVersion`) em que foi corrida (AC-US-0002-11).
- REQ-FEAT-0002-12: O sistema SHALL produzir exatamente 1 resultado por volta, de modo que cruzar a linha
  de chegada de novo depois da conclusão não produza um segundo resultado (AC-US-0002-12).
- REQ-FEAT-0002-13: O sistema SHALL exibir como válida, com quatro tempos de setor, uma volta completa na
  pista sintética atual no sentido da pista passando por todos os seus marcadores em ordem
  (AC-US-0002-13).
- REQ-FEAT-0002-14: O sistema SHALL contar um limite de setor somente quando cruzado no sentido da pista e
  depois do limite de setor anterior, de modo que cada tempo de setor seja medido entre limites
  consecutivos (AC-US-0002-10).
- REQ-FEAT-0002-15: O sistema SHALL manter a volta oficial e com as mesmas regras de conclusão depois de
  pausa, perda de foco ou perda do sensor durante a volta [DOMAIN] (US-0002, caso anormal; `DOMAIN/DEC-08`).
- REQ-FEAT-0002-16: O sistema SHALL NOT produzir resultado para uma volta cuja página foi recarregada ou
  abandonada antes da chegada [DOMAIN] (US-0002, caso anormal; `SEED/RD-05`).

## Comportamento

Fluxo nominal: [FLOW-0001](../flows/FLOW-0001-volta-completa.md). Cronometragem e interpolação:
[RULE-0003](../rules/RULE-0003-cronometragem-e-interpolacao.md). Resultado:
[API-0001](../api/API-0001-resultado-e-estado-da-volta.md). Tela do resultado:
[SCR-0003](../screens/SCR-0003-resultado-da-volta.md).

| Situação | Comportamento |
|---|---|
| Chegada cruzada sem todos os marcadores em ordem | Volta inválida com motivo "marcador pulado" ([FEAT-0004](FEAT-0004-marcadores-e-sentido-da-pista.md)) |
| Chegada cruzada na contramão | Não encerra a volta nem registra tempo ([FEAT-0004](FEAT-0004-marcadores-e-sentido-da-pista.md)) |
| Chegada cruzada de novo depois da conclusão | Ignorada: o estado contém exatamente 1 resultado para a volta (I7); a deduplicação ocorre na simulação, que só aceita cruzamentos enquanto a fase é `RUNNING` |
| Cruzamento exatamente sobre um passo | Tempo total k × `STEP`; a interpolação só se aplica a cruzamentos entre dois passos |
| Pausa, perda de foco ou perda do sensor durante a volta | Simulação e cronômetro suspensos; ao continuar a volta segue oficial |
| Recarregar ou abandonar a página antes da chegada | Nenhum resultado; o consumo de tentativa é da etapa 5, fora do escopo |
| Dado da pista incompleto | A pista só é jogável como treino, sem volta oficial ([FEAT-0006](FEAT-0006-reposicionamento-e-tipos-de-volta.md), [FEAT-0008](FEAT-0008-dado-de-pista-versionado.md)) |
| Sensor ausente ou permissão negada (`web-mobile`) | Controle por toque com estado visível; as regras não mudam |
| Rede indisponível | Sem efeito: a volta é concluída e exibida sem rede (D-FS-08, [FEAT-0009](FEAT-0009-requisitos-transversais.md)) |

Nenhum resultado é gravado no navegador por esta feature; a persistência do resultado é do desafio diário
(etapa 5, fora do escopo).

## Estado

Lê e altera `lapPhase` (`RUNNING` para `ENDED`), `lapValidity` e o resultado; ver
[RULE-0002](../rules/RULE-0002-estados-da-volta.md).

| Transição | O que a dispara | Idempotência e contador |
|---|---|---|
| `RUNNING` para `ENDED` com `lapValidity` `VALID` | o passo em que a chegada é cruzada no sentido da pista com todos os marcadores passados em ordem | Ocorre uma única vez por volta; o cruzamento seguinte é ignorado. Carrega `stepCount` do passo de encerramento |
| Limite de setor completado | o passo em que o limite de setor seguinte é cruzado no sentido da pista | Cada limite é completado uma única vez; cruzar de novo não altera o tempo do setor |

## Configuração

Nenhuma configuração própria. O formato de exibição `m:ss.mmm` e a unidade (ms inteiros) são fixos
(`DOMAIN/DEC-03`).

## Critérios de aceite

- Volta completa e correta: a tela mostra "válida", o tempo total e quatro tempos de setor (satisfaz
  AC-US-0002-01, AC-US-0002-02, AC-US-0002-03; cobre os requisitos 01 a 03).
- No resultado, tempos em ms inteiros e soma dos quatro setores igual ao total, com diferença de 0 ms
  (satisfaz AC-US-0002-04, AC-US-0002-05; cobre os requisitos 04 e 05).
- Exibição `m:ss.mmm`, por exemplo `1:02.345` (satisfaz AC-US-0002-06; cobre o requisito 06).
- Cruzamento entre dois passos dá tempo estritamente entre k × `STEP` e (k + 1) × `STEP`, para a chegada e
  para um limite de setor (satisfaz AC-US-0002-07, AC-US-0002-08; cobre os requisitos 07 e 08).
- O tempo de cada setor aparece ao completá-lo e termina no limite declarado (satisfaz AC-US-0002-09,
  AC-US-0002-10; cobre os requisitos 09, 10 e 14).
- O resultado traz `trackId` e `trackVersion` (satisfaz AC-US-0002-11; cobre o requisito 11).
- Depois da conclusão, um novo cruzamento da chegada deixa exatamente 1 resultado (satisfaz AC-US-0002-12;
  cobre o requisito 12).
- Na pista sintética atual, a volta completa é exibida como válida com quatro tempos de setor (satisfaz
  AC-US-0002-13; cobre o requisito 13).
- Pausa e recarga: a volta pausada e continuada segue oficial; a página recarregada não produz resultado
  (satisfaz AC-US-0002-01; cobre os requisitos 15 e 16).

## Pontos em aberto

Nenhum.
