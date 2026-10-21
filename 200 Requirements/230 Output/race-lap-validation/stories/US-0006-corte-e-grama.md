---
id: US-0006
title: Corte invalida a volta, grama sem corte só reduz a velocidade
feature: race-lap-validation
stage: req
status: validated
version: 2.1.0
sources: [SEED/US-6, SEED/RD-06, SEED/RE-03, DOMAIN/DEC-01, DOMAIN/DEC-06, DOMAIN/DEC-08]
---

# US-0006 — Corte invalida a volta, grama sem corte só reduz a velocidade

## História

Como Jogador, quero que sair da pista para cortar caminho invalide a volta, mas que uma escapada sem ganho
apenas me deixe mais lento, para que erros honestos não sejam punidos como trapaça.

## Canais

- `web-desktop` e `web-mobile`: mesmos limites de corte, mesmo motivo exibido. Nenhuma diferença de
  comportamento entre os canais.
- `web-mobile`: com sensor de inclinação ausente ou permissão negada, o controle recai para toque com
  estado visível (I4, `[DOMAIN]`); a regra desta história não muda.

## Pré-condições

- O sinal verde foi dado e a volta está em andamento, sem motivo de invalidação.
- Para os critérios 01 a 03, o dado da pista não declara limites de corte próprios.

## Critérios de aceite

- AC-US-0006-01: No estado da simulação, quando o kart fica a mais de 3 m além da borda da pista por mais
  de 1000 ms seguidos, a volta se torna inválida no passo em que os 1000 ms são ultrapassados
  (`DOMAIN/DEC-01`).
- AC-US-0006-02: No estado da simulação, quando o kart fica a mais de 3 m além da borda da pista por no
  máximo 1000 ms seguidos e volta a ficar a 3 m ou menos dela, a volta não se torna inválida
  (`DOMAIN/DEC-01`).
- AC-US-0006-03: No estado da simulação, quando o kart fica além da borda da pista a no máximo 3 m dela,
  por qualquer duração, a volta não se torna inválida (`DOMAIN/DEC-01`).
- AC-US-0006-04: Numa pista cujo dado declara limites de corte próprios (distância em m e duração em ms),
  a volta se torna inválida, no estado da simulação, quando o kart ultrapassa esses limites, e não os
  valores de 3 m e 1000 ms (`DOMAIN/DEC-01`, `SEED/RE-03`).
- AC-US-0006-05: Quando a volta se torna inválida por corte, a tela exibe o motivo "corte".
- AC-US-0006-06: No estado da simulação, a volta inválida por corte termina no passo da invalidação:
  nenhum tempo de volta e nenhum tempo de setor é acrescentado depois desse passo (`DOMAIN/DEC-06`).
- AC-US-0006-07: No estado da simulação, partindo do mesmo estado inicial e com a mesma entrada em todos
  os passos, a velocidade do kart após N passos de `STEP` na grama é menor que após N passos de `STEP` na
  pista (RF08).
- AC-US-0006-08: Andar na grama sem ultrapassar os limites de corte não torna a volta inválida: a tela
  continua exibindo o estado "válida em andamento" (`SEED/RD-06`, `DOMAIN/DEC-01`).

## Casos anormais

- **Saída de pista interrompida e retomada** (o kart volta a 3 m ou menos da borda e sai de novo): a
  contagem de 1000 ms seguidos recomeça a cada saída além de 3 m (critérios 01 e 02, "seguidos" em
  `DOMAIN/DEC-01`).
- **Saída de pista seguida de marcador pulado**: a volta já terminou no corte (`DOMAIN/DEC-06`); o motivo
  exibido é "corte".
- **Pausa, perda de foco ou perda do sensor durante a saída de pista**: a simulação fica suspensa e não
  avança nenhum passo (`DOMAIN/DEC-08`); como a duração é medida no estado da simulação, o tempo em pausa
  não conta para os 1000 ms.
- **Recarregar ou abandonar a página antes da chegada**: a volta não é concluída e não produz resultado
  (`SEED/RD-05`).

## Fontes

- `SEED/US-6` — história e seus dois critérios.
- `SEED/RD-06` — grama reduz velocidade e não invalida sem regra de corte (RF08).
- `SEED/RE-03` — os limites próprios vêm do dado da pista.
- `DOMAIN/DEC-01` — critério de corte: 3 m e 1000 ms seguidos, substituíveis pelo dado da pista.
- `DOMAIN/DEC-06` — volta invalidada termina imediatamente.
- `DOMAIN/DEC-08` — pausa durante a volta.

## Pontos em aberto

Nenhum — o critério de corte, o fim da volta invalidada e a pausa estão decididos em `DOMAIN.md` de
2026-10-20.
