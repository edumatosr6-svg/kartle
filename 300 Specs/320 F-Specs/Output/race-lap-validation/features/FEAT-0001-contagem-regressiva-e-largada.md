---
id: FEAT-0001
title: Contagem regressiva e largada
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: [US-0001, AC-US-0001-01, AC-US-0001-02, AC-US-0001-03, AC-US-0001-04, AC-US-0001-05, AC-US-0001-06, AC-US-0001-07, AC-US-0001-08, AC-US-0001-09, AC-US-0001-10]
---

# FEAT-0001 — Contagem regressiva e largada

## Resumo

Antes de cada volta o Jogador vê uma contagem regressiva de 3 s que termina no sinal verde. O cronômetro da
volta começa no sinal verde, não no cruzamento da linha de largada. Acelerar antes do sinal verde é
ignorado: o kart fica parado, sem efeito e sem penalidade (`DOMAIN/DEC-04`, `DOMAIN/DEC-05`).

## Canais

| Canal | O que muda |
|---|---|
| `web-desktop` | A aceleração antes do sinal verde vem do teclado |
| `web-mobile` | A aceleração antes do sinal verde vem do toque. Sensor de inclinação ausente ou permissão negada antes da contagem: o controle recai para toque com estado visível ([SCR-0001](../screens/SCR-0001-corrida-hud-da-volta.md)) |

Contagem, duração, início do cronômetro, efeito da queima de largada e tamanho mínimo do texto são
idênticos nos dois canais.

## Requisitos

- REQ-FEAT-0001-01: Ao iniciar a volta, o sistema SHALL exibir uma contagem regressiva de 3 s (3000 ms de
  tempo de simulação), medida do primeiro valor exibido até o sinal verde (AC-US-0001-01).
- REQ-FEAT-0001-02: O sistema SHALL exibir cada valor da contagem regressiva em texto, além de qualquer
  cor (AC-US-0001-02).
- REQ-FEAT-0001-03: O sistema SHALL indicar o sinal verde em texto, além de qualquer cor (AC-US-0001-03).
- REQ-FEAT-0001-04: O sistema SHALL exibir o valor zero no cronômetro da volta durante toda a contagem
  regressiva (AC-US-0001-04).
- REQ-FEAT-0001-05: O sistema SHALL contar o tempo da volta a partir do sinal verde, de modo que, no
  estado da simulação, o tempo da volta após N passos de `STEP` contados do sinal verde seja N × `STEP`,
  esteja o kart antes ou depois da linha de largada (AC-US-0001-05).
- REQ-FEAT-0001-06: O sistema SHALL manter o kart parado na posição de largada durante a contagem, de modo
  que, com aceleração máxima aplicada em todos os passos da contagem, o kart esteja no sinal verde com
  velocidade 0 m/s e na mesma posição que ocupava no início da contagem (AC-US-0001-06).
- REQ-FEAT-0001-07: O sistema SHALL NOT atribuir motivo de invalidação a uma volta por aceleração anterior
  ao sinal verde: ao sinal verde a tela exibe o estado "válida em andamento" (AC-US-0001-07).
- REQ-FEAT-0001-08: O sistema SHALL NOT acrescentar penalidade ao tempo da volta por aceleração anterior
  ao sinal verde: o tempo da volta após N passos de `STEP` contados do sinal verde é N × `STEP`
  (AC-US-0001-08).
- REQ-FEAT-0001-09: O sistema SHALL exibir o texto de cada valor da contagem regressiva e do sinal verde com
  no mínimo 48 px, em `web-desktop` e em `web-mobile` (AC-US-0001-09).
- REQ-FEAT-0001-10: O sistema SHALL exibir o texto da contagem regressiva e do sinal verde com contraste
  mínimo de 4,5:1 com o fundo imediato, em `web-desktop` e em `web-mobile` (AC-US-0001-10).
- REQ-FEAT-0001-11: O sistema SHALL aplicar a aceleração com seu efeito normal a partir do primeiro passo
  do sinal verde, inclusive quando ela foi mantida desde a contagem (AC-US-0001-05).
- REQ-FEAT-0001-12: O sistema SHALL suspender a simulação, sem avançar nenhum passo, quando houver pausa,
  perda de foco da aba ou perda do sensor de inclinação durante a contagem, mantendo o cronômetro em zero
  [DOMAIN] (US-0001, caso anormal "Pausa ou perda de foco"; `DOMAIN/DEC-08`).
- REQ-FEAT-0001-13: O sistema SHALL, em `web-mobile` com sensor de inclinação ausente ou permissão negada
  antes da contagem, usar o controle por toque com estado visível na tela, sem alterar a duração da
  contagem nem o início do cronômetro [DOMAIN] (I4; US-0001, canais).
- REQ-FEAT-0001-14: O sistema SHALL NOT produzir resultado para uma volta cuja página foi recarregada ou
  abandonada durante a contagem [DOMAIN] (US-0001, caso anormal "Recarregar ou abandonar"; `SEED/RD-05`).

## Comportamento

Fluxo nominal: [FLOW-0001](../flows/FLOW-0001-volta-completa.md), passos 1 a 4. Máquina de estados:
[RULE-0002](../rules/RULE-0002-estados-da-volta.md).

| Situação | Comportamento |
|---|---|
| Início de volta pedido com outra volta ainda não encerrada | O pedido é rejeitado e a volta em andamento não reinicia (`LAP_ALREADY_ACTIVE`, [API-0002](../api/API-0002-comandos-da-volta.md)); repetir o pedido não tem efeito adicional |
| Aceleração antes do sinal verde | Ignorada: sem efeito sobre a posição e sem penalidade; a velocidade no sinal verde é 0 m/s |
| Aceleração mantida do fim da contagem até depois do sinal verde | Passa a ter efeito a partir do sinal verde; o tempo continua contado do sinal verde |
| Pausa ou perda de foco durante a contagem | A simulação não avança; a contagem não progride e o cronômetro segue em zero; a contagem retoma de onde parou ao continuar |
| Perda do sensor de inclinação durante a contagem (`web-mobile`) | Pausa automática, com o mesmo efeito do caso anterior |
| Sensor ausente ou permissão negada antes da contagem (`web-mobile`) | Controle por toque com estado visível; a contagem prossegue com a mesma duração |
| Recarregar ou abandonar a página durante a contagem | Nenhum resultado; o consumo de tentativa é da etapa 5, fora do escopo |
| Tempo de quadro irregular (30 fps ou 60 fps) | A contagem é medida em passos de simulação, não em quadros renderizados; a duração de 3 s não varia com a taxa de quadros ([FEAT-0003](FEAT-0003-tempo-independente-do-aparelho-e-pausa.md)) |
| Rede indisponível | Sem efeito: a contagem não usa rede (D-FS-08, [FEAT-0009](FEAT-0009-requisitos-transversais.md)) |

## Estado

Lê e altera `lapPhase` (`COUNTDOWN` para `RUNNING`) definido em [RULE-0002](../rules/RULE-0002-estados-da-volta.md).

| Transição | O que a dispara | Idempotência |
|---|---|---|
| `COUNTDOWN` para `RUNNING` | o passo em que o tempo de contagem acumulado alcança 3000 ms (passo contado em `stepCount`) | Disparada uma única vez por volta; repetir passos já encerrados não existe, pois o estado só avança passo a passo |
| `COUNTDOWN` para `PAUSED` e volta | pausa e continuar | Pausar com a volta já pausada não tem efeito |

## Configuração

Nenhuma. A duração da contagem (3000 ms) não é configurável por esta feature (`DOMAIN/DEC-05`). Não há
chave para desligar o comportamento: ele vale ligado por padrão (requisitos, `01-context.md`).

## Critérios de aceite

- A tela mostra os valores 3, 2 e 1 em texto e depois o sinal verde em texto; a contagem dura 3 s de
  simulação (satisfaz AC-US-0001-01, AC-US-0001-02, AC-US-0001-03; cobre os requisitos 01 a 03).
- Durante a contagem o cronômetro mostra zero (satisfaz AC-US-0001-04; cobre o requisito 04).
- No estado da simulação, após N passos do sinal verde o tempo da volta é N × `STEP`, com e sem aceleração
  anterior ao sinal verde (satisfaz AC-US-0001-05, AC-US-0001-08; cobre os requisitos 05, 08 e 11).
- Com aceleração máxima em todos os passos da contagem, velocidade 0 m/s e posição de largada no sinal
  verde (satisfaz AC-US-0001-06; cobre o requisito 06).
- A tela exibe "válida em andamento" ao sinal verde, depois de aceleração antecipada (satisfaz
  AC-US-0001-07; cobre o requisito 07).
- Texto da contagem e do sinal verde com no mínimo 48 px e contraste mínimo de 4,5:1 (satisfaz
  AC-US-0001-09, AC-US-0001-10; cobre os requisitos 09 e 10).
- Pausa, perda de foco e perda do sensor durante a contagem não avançam passo algum e o cronômetro segue em
  zero; sensor ausente em `web-mobile` mostra o controle por toque; recarregar não produz resultado
  (satisfaz AC-US-0001-04; cobre os requisitos 12 a 14).

## Pontos em aberto

Nenhum.
