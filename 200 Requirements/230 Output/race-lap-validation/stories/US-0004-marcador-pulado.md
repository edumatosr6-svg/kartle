---
id: US-0004
title: Volta que pula marcador não gera tempo válido
feature: race-lap-validation
stage: req
status: validated
version: 2.1.0
sources: [SEED/US-4, SEED/RD-02, SEED/RD-03, SEED/RD-04, SEED/RE-03, SEED/RE-04, DOMAIN/DEC-06, DOMAIN/DEC-08]
---

# US-0004 — Volta que pula marcador não gera tempo válido

## História

Como Jogador, quero que uma volta que pula um marcador não gere tempo válido, para que atalhos não
compensem.

## Canais

- `web-desktop` e `web-mobile`: mesma regra, mesmo motivo exibido. Nenhuma diferença de comportamento entre
  os canais.
- `web-mobile`: com sensor de inclinação ausente ou permissão negada, o controle recai para toque com
  estado visível (I4, `[DOMAIN]`); a regra desta história não muda.

## Pré-condições

- O sinal verde foi dado e a volta está em andamento.
- O dado da pista declara os marcadores, distintos dos quatro setores (`SEED/RD-03`, `SEED/RE-03`).

## Critérios de aceite

- AC-US-0004-01: Ao cruzar a linha de chegada no sentido da pista sem ter passado por todos os marcadores,
  a tela exibe a volta como inválida.
- AC-US-0004-02: Ao cruzar a linha de chegada no sentido da pista tendo passado por todos os marcadores
  fora da ordem declarada no dado da pista, a tela exibe a volta como inválida.
- AC-US-0004-03: Numa volta inválida por marcador, a tela não exibe tempo oficial.
- AC-US-0004-04: Numa volta inválida por marcador, a tela exibe o motivo "marcador pulado".
- AC-US-0004-05: Uma volta que cruza os limites dos quatro setores mas deixa de passar por um marcador é
  exibida como inválida com o motivo "marcador pulado" (`SEED/RD-03`).
- AC-US-0004-06: Na pista sintética atual, cruzar a chegada sem passar por um dos seus marcadores exibe a
  volta como inválida com o motivo "marcador pulado" (`SEED/RE-04`).
- AC-US-0004-07: No estado da simulação, a volta inválida por marcador termina no passo em que a chegada
  é cruzada: nenhum tempo de volta é acrescentado depois desse passo (`DOMAIN/DEC-06`).

## Casos anormais

- **Marcador pulado e depois retomado antes da chegada** (voltar e passar pelo marcador na ordem): a
  regra exige todos os marcadores em ordem; a passagem conta se ocorrer na ordem e no sentido da pista
  (`SEED/RD-04`).
- **Marcador atravessado na contramão**: não conta como passagem (US-0005).
- **Linha de chegada cruzada de novo após a volta inválida por marcador**: nenhum segundo resultado; a
  volta já terminou no passo do primeiro cruzamento (critério 07, `DOMAIN/DEC-06`, I7).
- **Pausa, perda de foco ou perda do sensor durante a volta**: simulação e cronômetro ficam suspensos; as
  passagens por marcador registradas antes da pausa continuam valendo ao continuar (`DOMAIN/DEC-08`).
- **Recarregar ou abandonar a página antes da chegada**: a volta não é concluída e não produz resultado
  (`SEED/RD-05`).

## Fontes

- `SEED/US-4` — história e seu critério.
- `SEED/RD-02`, `SEED/RD-03`, `SEED/RD-04` — regras de domínio.
- `SEED/RE-03`, `SEED/RE-04` — dado de pista e pista sintética.
- `DOMAIN/DEC-06` — volta invalidada termina imediatamente.
- `DOMAIN/DEC-08` — pausa durante a volta.

## Pontos em aberto

Nenhum — o fim da volta invalidada e a pausa estão decididos em `DOMAIN.md` de 2026-10-20.
