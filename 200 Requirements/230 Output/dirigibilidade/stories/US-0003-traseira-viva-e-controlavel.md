---
id: US-0003
title: Traseira viva mas controlável
feature: dirigibilidade
stage: req
status: validated
version: 3.0.0
sources: [SEED/US-3, SEED/RD-01, SEED/RD-05, SEED/RD-06, SEED/NF-03, SEED/IM-I9, DOMAIN/REF-01, DOMAIN/REF-02, DOMAIN/REF-03, DOMAIN/DEC-02, DOMAIN/DEC-04]
---

# US-0003 — Traseira viva mas controlável

## História

Como Jogador, quero uma traseira viva mas controlável, para escorregar e segurar.

## Canais

- `web-desktop` e `web-mobile`: mesma condição de forçar (acelerador cheio + esterço cheio acima de
  50 km/h), mesmo limite de recuperação (400 ms) e mesmo teto de derrapagem lateral (0,65 rad), medidos no
  estado da simulação. Nenhuma diferença de limite entre os canais.
- `web-desktop`: acelerador e esterço são binários; a condição de forçar é atingida pelas duas teclas
  mantidas acima de 50 km/h.
- `web-mobile`: a condição de forçar exige inclinação no ângulo mapeado para esterço 1 e toque de
  acelerador cheio; com esterço parcial a condição de forçar não se mantém e, fora da manobra de drift e
  da recuperação, vale a condução normal.
- `web-mobile` com sensor ausente ou permissão negada: controle por toque, entradas binárias, mesmos
  critérios (I4).
- Os ensaios dos critérios 01 (curva de referência) e 03 a 05 rodam na pista de teste; o critério 02 vale
  em qualquer asfalto, pista de teste ou pista sintética (`SEED/RD-06`).

## Pré-condições

- Acerto Arcade assistido selecionado, na sua nova versão (acerto agressivo, `DOMAIN/REF-02`).
- Ambiente de ensaio dos critérios 01 e 03 a 05: pista de teste (curva de referência — arco de raio 18 m,
  faixa da largura da pista, sem paredes; e a geometria que o ensaio de recuperação declara), fora da
  pista sintética (`SEED/RD-06`, `DOMAIN/REF-03`).
- O kart está no asfalto, em estado `grip`.

## Critérios de aceite

- AC-US-0003-01: No estado da simulação, em todo passo de condução normal (condição de forçar não
  mantida, fora da manobra de drift de `requirements/11` e fora de uma recuperação), a telemetria não
  reporta `oversteer` nem `sliding`; em particular, na curva de referência da pista de teste com entrada a
  50 km/h, esterço cheio e acelerador cheio, o estado é `grip` ou `understeer` em todos os passos do arco
  (`SEED/US-3`, primeiro critério; `DOMAIN/DEC-02`, `DOMAIN/REF-03`).
- AC-US-0003-02: No estado da simulação, os estados `oversteer` e `sliding` só ocorrem em passos em que a
  condição de forçar se mantém, dentro da manobra de drift de `requirements/11`, ou dentro de uma
  recuperação (os passos entre soltar o esterço sob a condição de forçar e o primeiro `grip`, limitados
  pelo critério 03).
- AC-US-0003-03: No estado da simulação, com a traseira solta (telemetria em `oversteer` ou `sliding`
  sob a condição de forçar) e o esterço levado de 1 a 0 num passo, a telemetria volta a `grip` em no
  máximo 400 ms de tempo simulado contados desse passo (`DOMAIN/DEC-04`).
- AC-US-0003-04: No ensaio do critério 03, a derrapagem lateral não passa de 0,65 rad em nenhum passo da
  recuperação: o kart não roda ao recuperar (`SEED/US-3`, segundo critério).
- AC-US-0003-05: No estado da simulação, em todo passo de condução normal (condição de forçar não
  mantida, fora da manobra de drift de `requirements/11` e fora de uma recuperação), a derrapagem lateral
  não passa de 0,65 rad (`SEED/US-3`, segundo critério).
- AC-US-0003-06: A saída de `npm test` contém, para o acerto Arcade assistido, a verificação da manobra de
  drift de `requirements/11` com resultado de aprovação e pontuação maior que zero: a manobra continua
  possível e continua pontuando (`SEED/US-3`, terceiro critério).
- AC-US-0003-07: A saída de `npm test` ou de `npm run bench:handling` contém, para o acerto Arcade
  assistido, o ensaio dos critérios 01 a 05 com o tempo de recuperação em ms, a derrapagem lateral máxima
  em rad na recuperação e em condução normal, e a contagem de passos de condução normal com `oversteer`
  ou `sliding` (`SEED/IM-I9`).

## Casos anormais

- **Esterço reduzido parcialmente em vez de zerado (`web-mobile`)**: o seed não fixa limite para redução
  parcial; o critério 03 é medido com esterço levado a 0. Nenhum limite é inventado para valores
  intermediários.
- **Acelerador mantido cheio durante a recuperação**: o critério 03 é medido com o acelerador mantido
  cheio, porque é o estado que soltou a traseira; soltar o acelerador junto com o esterço não pode
  resultar em tempo de recuperação maior que 400 ms.
- **Recuperação que não volta a `grip` em 400 ms**: o critério 03 falha e os passos além de 400 ms contam
  como condução normal com `oversteer`/`sliding` (critérios 01 e 05 falham também); o ensaio reporta o
  tempo até o primeiro `grip`.
- **Condição de forçar mantida sem soltar o esterço**: a traseira permanece solta; a derrapagem lateral
  pode exceder 0,65 rad, porque não é condução normal; o Jogador continua controlando o kart com o
  esterço (nenhum estado de "rodada" sem comando é exigido nem proibido pelo seed).
- **Drift em andamento**: os estados `oversteer`/`sliding` e a derrapagem lateral seguem a regra de
  `requirements/11`, que não muda (`SEED.md`, Fora do escopo).
- **Grama ou parede com a traseira solta** (pista sintética): a redução de velocidade de US-0004 se
  aplica; o critério 03 é medido no asfalto da pista de teste, que não tem grama nem parede.
- **Pausa, perda de foco ou perda do sensor durante a recuperação**: simulação suspensa; os 400 ms são de
  tempo simulado.
- **Sensor ausente ou permissão negada antes da volta (`web-mobile`)**: controle por toque com estado
  visível (I4); critérios inalterados.

## Fontes

- `SEED/US-3` — história e seus três critérios; o segundo critério admite a traseira solta até 400 ms
  depois de reduzir o esterço (a recuperação), o que exclui esses passos da condução normal.
- `SEED/RD-01` — direção comum fácil sem exigir drift.
- `SEED/RD-05`, `DOMAIN/REF-01` — traseira viva mas controlável.
- `SEED/RD-06`, `DOMAIN/REF-03` — a curva de referência é ensaio em pista de teste.
- `DOMAIN/REF-02` — acerto agressivo da revisão 2: a condição de forçar sobe com a velocidade de
  referência.
- `SEED/NF-03` — teclado e inclinação atendem ambos.
- `SEED/IM-I9` — ensaio determinístico.
- `DOMAIN/DEC-02` — 50 km/h (em vigor; substitui 45 km/h); `DOMAIN/DEC-04` — 400 ms (mantido).

## Pontos em aberto

Nenhum — `DOMAIN/DEC-04` fecha o ponto aberto 04 do seed.
