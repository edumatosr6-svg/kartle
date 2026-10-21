---
id: US-0005
title: Chegada na contramão não conta como volta
feature: race-lap-validation
stage: req
status: validated
version: 2.0.0
sources: [SEED/US-5, SEED/RD-04, SEED/RD-05, DOMAIN/DEC-08]
---

# US-0005 — Chegada na contramão não conta como volta

## História

Como Jogador, quero que cruzar a chegada na contramão não conte como volta, para que o percurso só valha no
sentido da pista.

## Canais

- `web-desktop` e `web-mobile`: mesma regra. Nenhuma diferença de comportamento entre os canais.
- `web-mobile`: com sensor de inclinação ausente ou permissão negada, o controle recai para toque com
  estado visível (I4, `[DOMAIN]`); a regra desta história não muda.

## Pré-condições

- O sinal verde foi dado e a volta está em andamento.
- O dado da pista declara o sentido da pista e a linha de chegada.

## Critérios de aceite

- AC-US-0005-01: Cruzar a linha de chegada no sentido oposto ao da pista não encerra a volta: a tela
  continua exibindo o estado da volta em andamento.
- AC-US-0005-02: Cruzar a linha de chegada no sentido oposto ao da pista não registra tempo: o estado da
  simulação não contém resultado para essa volta.
- AC-US-0005-03: No estado da simulação, uma volta só se encerra no passo em que a linha de chegada é
  cruzada no sentido da pista.
- AC-US-0005-04: Atravessar um marcador no sentido oposto ao da pista não conta como passagem por esse
  marcador no estado da simulação (`SEED/RD-04`).

## Casos anormais

- **Cruzamentos repetidos da chegada na contramão**: nenhum deles encerra a volta nem registra tempo
  (critérios 01 e 02).
- **Contramão seguida de cruzamento no sentido da pista**: encerra a volta; a validade depende dos
  marcadores (US-0002, US-0004).
- **Pausa, perda de foco ou perda do sensor durante a volta**: simulação e cronômetro ficam suspensos e a
  volta continua em andamento ao continuar (`DOMAIN/DEC-08`).
- **Recarregar ou abandonar a página antes da chegada**: a volta não é concluída e não produz resultado
  (`SEED/RD-05`).

## Fontes

- `SEED/US-5` — história e seus dois critérios.
- `SEED/RD-04`, `SEED/RD-05` — regras de domínio.
- `DOMAIN/DEC-08` — pausa durante a volta.

## Pontos em aberto

Nenhum — a pausa está decidida em `DOMAIN.md` de 2026-10-20.
