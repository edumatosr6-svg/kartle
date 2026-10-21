---
id: FEAT-0003
title: Tempo independente do aparelho e pausa
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: [US-0003, NFR-0001, NFR-0002, NFR-0008, AC-US-0003-01, AC-US-0003-02, AC-US-0003-03, AC-US-0003-04, AC-US-0003-05, AC-US-0003-06, AC-US-0003-07, AC-US-0003-08, AC-US-0003-09, AC-US-0003-10]
---

# FEAT-0003 — Tempo independente do aparelho e pausa

## Resumo

O tempo da volta é função apenas da sequência de passos da simulação e das entradas, nunca dos quadros
renderizados nem do relógio do aparelho. Pausa, perda de foco da aba e perda do sensor de inclinação
suspendem simulação e cronômetro; ao continuar, a volta segue oficial e o resultado é o mesmo que teria sem
a pausa (`DOMAIN/DEC-08`, `SEED/RD-07`, I8).

## Canais

| Canal | Entradas de pausa |
|---|---|
| `web-desktop` | Tecla Esc; perda de foco da aba (automática) |
| `web-mobile` | Perda de foco da aba (automática); perda do sensor de inclinação (automática) |

O efeito da pausa é o mesmo nos dois canais. Em `web-mobile` com sensor ausente ou permissão negada antes da
volta, o controle recai para toque com estado visível e a regra desta feature não muda. O meio pelo qual o
Jogador continua a volta depois da pausa não é decidido pelos requisitos (ver `01-overview.md`).

## Requisitos

- REQ-FEAT-0003-01: O sistema SHALL produzir o mesmo tempo total, em milissegundos, em duas execuções com a
  mesma sequência de entradas, a mesma pista e o mesmo acerto, verificado na saída de `npm test`
  (AC-US-0003-01).
- REQ-FEAT-0003-02: O sistema SHALL produzir os mesmos quatro tempos de setor, em milissegundos, em duas
  execuções com a mesma sequência de entradas, a mesma pista e o mesmo acerto, verificado na saída de
  `npm test` (AC-US-0003-02).
- REQ-FEAT-0003-03: O sistema SHALL produzir o mesmo tempo total no resultado da simulação para a mesma
  sequência de entradas com renderização a 30 fps e a 60 fps (AC-US-0003-03).
- REQ-FEAT-0003-04: O sistema SHALL produzir os mesmos quatro tempos de setor no resultado da simulação
  para a mesma sequência de entradas com renderização a 30 fps e a 60 fps (AC-US-0003-04).
- REQ-FEAT-0003-05: O sistema SHALL, em `web-desktop`, parar de avançar o cronômetro da volta exibido na
  tela quando o Jogador pressiona Esc durante a volta, até o Jogador continuar (AC-US-0003-05).
- REQ-FEAT-0003-06: O sistema SHALL pausar a volta, sem ação do Jogador, quando a aba perde o foco durante
  a volta, em `web-desktop` e em `web-mobile`, de modo que o cronômetro exibido ao voltar à aba mostre o
  mesmo valor do instante da perda de foco (AC-US-0003-06).
- REQ-FEAT-0003-07: O sistema SHALL pausar a volta, sem ação do Jogador, em `web-mobile`, quando o sensor de
  inclinação deixa de fornecer leituras durante a volta, de modo que o cronômetro exibido deixe de avançar
  (AC-US-0003-07).
- REQ-FEAT-0003-08: O sistema SHALL NOT avançar nenhum passo de `STEP` durante a pausa, de modo que o tempo
  da volta ao continuar seja igual ao tempo da volta no instante da pausa (AC-US-0003-08).
- REQ-FEAT-0003-09: O sistema SHALL manter oficial e sem motivo de invalidação uma volta oficial pausada e
  continuada, exibindo o estado "válida em andamento" ao continuar (AC-US-0003-09).
- REQ-FEAT-0003-10: O sistema SHALL produzir o mesmo tempo total e os mesmos quatro tempos de setor no
  resultado da simulação para a mesma sequência de entradas aplicada sem pausa e com uma pausa de qualquer
  duração no meio da volta (AC-US-0003-10).
- REQ-FEAT-0003-11: O sistema SHALL produzir o mesmo tempo total e os mesmos quatro tempos de setor,
  exibidos com 3 casas decimais, para a mesma sequência de entradas, pista e acerto em Chrome, Edge,
  Firefox e Safari nas versões atuais, com diferença de 0 ms; qualquer diferença é defeito (NFR-0008).
- REQ-FEAT-0003-12: O sistema SHALL tratar como uma única pausa a perda de foco e a perda do sensor que
  ocorrem ao mesmo tempo em `web-mobile`, com o efeito da suspensão descrita no requisito 08 [DOMAIN]
  (US-0003, caso anormal; `DOMAIN/DEC-08`).
- REQ-FEAT-0003-13: O sistema SHALL aceitar pausas repetidas na mesma volta, cada uma suspendendo simulação
  e cronômetro, sem invalidar a volta [DOMAIN] (US-0003, caso anormal; `DOMAIN/DEC-08`).
- REQ-FEAT-0003-14: O sistema SHALL tratar um pedido de pausa recebido com a volta já pausada, ou com a volta
  encerrada, como sem efeito, e um pedido de continuar recebido com a volta não pausada como sem efeito
  [DOMAIN] (I7; D-FS-04).
- REQ-FEAT-0003-15: O sistema SHALL NOT produzir resultado para uma volta cuja página foi recarregada ou
  abandonada durante a pausa [DOMAIN] (US-0003, caso anormal; `SEED/RD-05`).

## Comportamento

Pausa e retomada: [FLOW-0003](../flows/FLOW-0003-pausa-e-retomada.md). Estados:
[RULE-0002](../rules/RULE-0002-estados-da-volta.md). Comandos: [API-0002](../api/API-0002-comandos-da-volta.md).

| Situação | Comportamento |
|---|---|
| Queda da taxa de quadros durante a volta | O tempo oficial segue função da sequência de passos; nada muda no resultado |
| Execução em navegador diferente | Mesmo tempo ao ms; diferença é defeito (requisito 11) |
| Pausa e perda de foco no mesmo instante (`web-mobile`) | Uma única pausa |
| Foco da aba volta enquanto a volta está pausada | A volta continua pausada e o cronômetro mostra o mesmo valor; ela só deixa a pausa quando o Jogador continua |
| Pausa durante a contagem | Ver [FEAT-0001](FEAT-0001-contagem-regressiva-e-largada.md): simulação suspensa, cronômetro em zero |
| Pausa durante saída de pista | A simulação não avança; o tempo em pausa não conta para os limites de corte ([FEAT-0005](FEAT-0005-corte-e-grama.md)) |
| Recarregar ou abandonar durante a pausa | Nenhum resultado; consumo de tentativa é da etapa 5, fora do escopo |
| Pausa pedida duas vezes (evento duplicado) | Sem efeito adicional (requisito 14) |
| Rede indisponível | Sem efeito: pausa e retomada não usam rede (D-FS-08) |

A igualdade dos requisitos 01 a 04 e 10 é verificada no resultado da simulação, em milissegundos, e não na
exibição.

## Estado

Lê e altera `lapPhase` (`COUNTDOWN` ou `RUNNING` para `PAUSED` e de volta) e `pauseCause`, definidos em
[RULE-0002](../rules/RULE-0002-estados-da-volta.md).

| Transição | O que a dispara | Idempotência e contador |
|---|---|---|
| `RUNNING` ou `COUNTDOWN` para `PAUSED` | Esc (`web-desktop`), perda de foco da aba, perda do sensor (`web-mobile`) | Idempotente: pausar de novo não muda nada. `stepCount` não avança durante `PAUSED` |
| `PAUSED` para a fase anterior | o Jogador continua | Idempotente: continuar sem pausa não muda nada. Não acrescenta passos nem tempo |

## Configuração

Nenhuma.

## Critérios de aceite

- Duas execuções iguais dão o mesmo tempo total e os mesmos quatro tempos de setor na saída de `npm test`
  (satisfaz AC-US-0003-01, AC-US-0003-02; cobre os requisitos 01 e 02).
- A mesma sequência a 30 fps e a 60 fps dá o mesmo resultado (satisfaz AC-US-0003-03, AC-US-0003-04; cobre
  os requisitos 03 e 04).
- Esc pausa em `web-desktop`; a perda de foco pausa nos dois canais; a perda do sensor pausa em
  `web-mobile`; o cronômetro exibido para de avançar e mostra o mesmo valor ao voltar (satisfaz
  AC-US-0003-05, AC-US-0003-06, AC-US-0003-07; cobre os requisitos 05 a 07).
- Nenhum passo de `STEP` avança durante a pausa; o tempo ao continuar é o do instante da pausa (satisfaz
  AC-US-0003-08; cobre os requisitos 08, 12, 13 e 14).
- A volta continuada segue oficial e mostra "válida em andamento"; o resultado com pausa é igual ao sem
  pausa (satisfaz AC-US-0003-09, AC-US-0003-10; cobre os requisitos 09 e 10).
- O tempo exibido é igual nos quatro navegadores nomeados, registrado em teste em cada um (satisfaz o
  NFR-0008; cobre o requisito 11).
- Recarregar durante a pausa não produz resultado (satisfaz AC-US-0003-08; cobre o requisito 15).

## Pontos em aberto

Nenhum.
