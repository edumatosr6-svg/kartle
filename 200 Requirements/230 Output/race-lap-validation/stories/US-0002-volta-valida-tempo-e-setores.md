---
id: US-0002
title: Volta válida com tempo total e quatro tempos de setor
feature: race-lap-validation
stage: req
status: validated
version: 2.0.0
sources: [SEED/US-2, SEED/RD-01, SEED/RD-04, SEED/RD-05, SEED/RD-08, SEED/RD-11, SEED/RE-03, SEED/RE-04, SEED/IM-I1, SEED/IM-I7, DOMAIN/DEC-03, DOMAIN/DEC-08]
---

# US-0002 — Volta válida com tempo total e quatro tempos de setor

## História

Como Jogador, quero que uma volta completa no sentido correto, passando por todos os marcadores em ordem,
registre meu tempo total e meus quatro tempos de setor, para comparar voltas.

## Canais

- `web-desktop` e `web-mobile`: mesmas regras de conclusão, mesmos tempos, mesmo formato de exibição,
  mesma informação exibida. Nenhuma diferença de comportamento entre os canais.
- `web-mobile`: com sensor de inclinação ausente ou permissão negada, o controle recai para toque com
  estado visível (I4, `[DOMAIN]`); as regras desta história não mudam.

## Pré-condições

- O sinal verde foi dado (US-0001) e a volta está em andamento, sem motivo de invalidação.
- O dado da pista declara largada, sentido, quatro setores e marcadores (`SEED/RE-03`).

## Critérios de aceite

- AC-US-0002-01: Ao cruzar a linha de chegada no sentido da pista depois de passar por todos os
  marcadores em ordem, a tela exibe a volta como válida.
- AC-US-0002-02: Na volta válida do critério 01, a tela exibe o tempo total.
- AC-US-0002-03: Na volta válida do critério 01, a tela exibe quatro tempos de setor.
- AC-US-0002-04: No resultado de uma volta válida, o tempo total e cada um dos quatro tempos de setor são
  expressos em milissegundos inteiros (`DOMAIN/DEC-03`).
- AC-US-0002-05: No resultado de uma volta válida, a soma dos quatro tempos de setor, em milissegundos, é
  igual ao tempo total em milissegundos, com diferença de 0 ms (`SEED/RD-08`, `DOMAIN/DEC-03`).
- AC-US-0002-06: Na tela, o tempo total e cada tempo de setor são exibidos no formato `m:ss.mmm`, com 3
  casas decimais de segundo (ex.: `1:02.345`) (`DOMAIN/DEC-03`).
- AC-US-0002-07: No estado da simulação, quando a linha de chegada é cruzada entre o passo k e o passo
  k + 1 contados do sinal verde, sem coincidir com nenhum dos dois, o tempo total é maior que k × `STEP` e
  menor que (k + 1) × `STEP` (`DOMAIN/DEC-03`, instante interpolado dentro do passo).
- AC-US-0002-08: No estado da simulação, quando um limite de setor é cruzado entre o passo k e o passo
  k + 1 contados do sinal verde, sem coincidir com nenhum dos dois, o instante de fim desse setor é maior
  que k × `STEP` e menor que (k + 1) × `STEP` (`DOMAIN/DEC-03`).
- AC-US-0002-09: Durante a volta, ao completar cada setor, a tela exibe o tempo desse setor.
- AC-US-0002-10: No estado da simulação, cada tempo de setor termina no cruzamento do limite de setor
  declarado no dado da pista (`SEED/RE-03`).
- AC-US-0002-11: O resultado de uma volta concluída, no estado da simulação, identifica a pista
  (`trackId`) e a versão da pista (`trackVersion`) em que foi corrida (I1).
- AC-US-0002-12: Depois de uma volta concluída, cruzar a linha de chegada de novo não produz um segundo
  resultado: o estado da simulação contém exatamente 1 resultado para essa volta (I7).
- AC-US-0002-13: Na pista sintética atual, uma volta completa no sentido da pista passando por todos os
  marcadores em ordem é exibida como válida com quatro tempos de setor (`SEED/RE-04`).

## Casos anormais

- **Chegada sem todos os marcadores em ordem**: a volta é inválida com motivo "marcador pulado" (US-0004).
- **Chegada na contramão**: não encerra a volta nem registra tempo (US-0005).
- **Linha de chegada cruzada de novo após a conclusão**: nenhum segundo resultado (critério 12).
- **Cruzamento da chegada exatamente sobre um passo**: o tempo total é o desse passo, k × `STEP`; a
  interpolação dos critérios 07 e 08 só se aplica a cruzamentos entre dois passos.
- **Pausa, perda de foco ou perda do sensor durante a volta**: simulação e cronômetro ficam suspensos e,
  ao continuar, a volta segue oficial e com as mesmas regras de conclusão (`DOMAIN/DEC-08`, US-0003).
- **Recarregar ou abandonar a página antes da chegada**: a volta não completa o percurso, portanto não é
  concluída e não produz resultado (`SEED/RD-05`). O consumo de tentativa é da etapa 5, fora do escopo.
- **Dado da pista sem largada, sentido, quatro setores ou marcadores**: a pista só é jogável como treino,
  sem volta oficial (`DOMAIN/DEC-10`, US-0008).
- **Sensor de inclinação ausente ou permissão negada no início (`web-mobile`)**: o controle recai para
  toque com estado visível (I4); a volta segue as mesmas regras.

## Fontes

- `SEED/US-2` — história e seus três critérios.
- `SEED/RD-01`, `SEED/RD-04`, `SEED/RD-05`, `SEED/RD-08`, `SEED/RD-11` — regras de domínio.
- `SEED/RE-03`, `SEED/RE-04` — restrições sobre o dado de pista e a pista sintética.
- `SEED/IM-I1`, `SEED/IM-I7` — impacto no domínio.
- `DOMAIN/DEC-03` — precisão em ms, interpolação do cruzamento e formato de exibição.
- `DOMAIN/DEC-08` — pausa durante a volta.

## Pontos em aberto

Nenhum — a precisão, a pausa e o dado de pista incompleto estão decididos em `DOMAIN.md` de 2026-10-20.
