---
id: US-0003
title: Traseira viva mas controlável
feature: dirigibilidade
stage: req
status: validated
version: 1.0.0
sources: [SEED/US-3, SEED/RD-01, SEED/RD-05, SEED/NF-03, SEED/IM-I9, DOMAIN/REF-01, DOMAIN/DEC-02, DOMAIN/DEC-04]
---

# US-0003 — Traseira viva mas controlável

## História

Como Jogador, quero uma traseira viva mas controlável, para escorregar e segurar.

## Canais

- `web-desktop` e `web-mobile`: mesma condição de forçar (acelerador cheio + esterço cheio acima de
  45 km/h), mesmo limite de recuperação (400 ms) e mesmo teto de derrapagem lateral (0,65 rad), medidos no
  estado da simulação. Nenhuma diferença de limite entre os canais.
- `web-desktop`: acelerador e esterço são binários; a condição de forçar é atingida pelas duas teclas
  mantidas acima de 45 km/h.
- `web-mobile`: a condição de forçar exige inclinação no ângulo mapeado para esterço 1 e toque de
  acelerador cheio; com esterço parcial a condição de forçar não se mantém e, fora da manobra de drift,
  vale a condução normal.
- `web-mobile` com sensor ausente ou permissão negada: controle por toque, entradas binárias, mesmos
  critérios (I4).

## Pré-condições

- Acerto Arcade assistido selecionado, na sua nova versão.
- O kart está no asfalto, em estado `grip`.

## Critérios de aceite

- AC-US-0003-01: No estado da simulação, em todo passo de condução normal (condição de forçar não
  mantida e fora da manobra de drift de `requirements/11`), a telemetria não reporta `oversteer` nem
  `sliding`; em particular, na curva de referência a
  45 km/h com esterço cheio e acelerador cheio, o estado é `grip` ou `understeer` em todos os passos
  (`SEED/US-3`, primeiro critério; `DOMAIN/DEC-02`).
- AC-US-0003-02: No estado da simulação, os estados `oversteer` e `sliding` só ocorrem em passos em que a
  condição de forçar se mantém ou dentro da manobra de drift de `requirements/11`.
- AC-US-0003-03: No estado da simulação, com a traseira solta (telemetria em `oversteer` ou `sliding`
  sob a condição de forçar) e o esterço levado de 1 a 0 num passo, a telemetria volta a `grip` em no
  máximo 400 ms de tempo simulado contados desse passo (`DOMAIN/DEC-04`).
- AC-US-0003-04: No ensaio do critério 03, a derrapagem lateral não passa de 0,65 rad em nenhum passo: o
  kart não roda ao recuperar (`SEED/US-3`, segundo critério).
- AC-US-0003-05: No estado da simulação, em todo passo de condução normal (condição de forçar não
  mantida e fora da manobra de drift de `requirements/11`), a derrapagem lateral não passa de 0,65 rad
  (`SEED/US-3`, segundo critério).
- AC-US-0003-06: A saída de `npm test` contém, para o acerto Arcade assistido, a verificação da manobra de
  drift de `requirements/11` com resultado de aprovação e pontuação maior que zero: a manobra continua
  possível e continua pontuando (`SEED/US-3`, terceiro critério).
- AC-US-0003-07: A saída de `npm test` ou de `npm run bench:handling` contém, para o acerto Arcade
  assistido, o ensaio dos critérios 01 a 05 com o tempo de recuperação em ms e a derrapagem lateral máxima
  em rad (`SEED/IM-I9`).

## Casos anormais

- **Esterço reduzido parcialmente em vez de zerado (`web-mobile`)**: o seed não fixa limite para redução
  parcial; o critério 03 é medido com esterço levado a 0. Nenhum limite é inventado para valores
  intermediários.
- **Acelerador mantido cheio durante a recuperação**: o critério 03 é medido com o acelerador mantido
  cheio, porque é o estado que soltou a traseira; soltar o acelerador junto com o esterço não pode
  resultar em tempo de recuperação maior que 400 ms.
- **Condição de forçar mantida sem soltar o esterço**: a traseira permanece solta; a derrapagem lateral
  pode exceder 0,65 rad, porque não é condução normal; o Jogador continua controlando o kart com o
  esterço (nenhum estado de "rodada" sem comando é exigido nem proibido pelo seed).
- **Drift em andamento**: os estados `oversteer`/`sliding` e a derrapagem lateral seguem a regra de
  `requirements/11`, que não muda (`SEED.md`, Fora do escopo).
- **Grama ou parede com a traseira solta**: a redução de velocidade de US-0004 se aplica; o critério 03
  é medido no asfalto.
- **Pausa, perda de foco ou perda do sensor durante a recuperação**: simulação suspensa; os 400 ms são de
  tempo simulado.
- **Sensor ausente ou permissão negada antes da volta (`web-mobile`)**: controle por toque com estado
  visível (I4); critérios inalterados.

## Fontes

- `SEED/US-3` — história e seus três critérios.
- `SEED/RD-01` — direção comum fácil sem exigir drift.
- `SEED/RD-05`, `DOMAIN/REF-01` — traseira viva mas controlável.
- `SEED/NF-03` — teclado e inclinação atendem ambos.
- `SEED/IM-I9` — ensaio determinístico.
- `DOMAIN/DEC-02` — 45 km/h; `DOMAIN/DEC-04` — 400 ms.

## Pontos em aberto

Nenhum — `DOMAIN/DEC-04` fecha o ponto aberto 04 do seed.
