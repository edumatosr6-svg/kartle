---
id: US-0008
title: Reconhecimento e treino nunca produzem tempo oficial
feature: race-lap-validation
stage: req
status: validated
version: 2.2.0
sources: [SEED/US-8, SEED/RD-09, SEED/RE-03, DOMAIN/DEC-10]
---

# US-0008 — Reconhecimento e treino nunca produzem tempo oficial

## História

Como Jogador, quero que voltas de reconhecimento e de treino nunca produzam tempo oficial, para que treinar
não altere meu resultado.

## Canais

- `web-desktop` e `web-mobile`: mesma regra, mesma identificação exibida, mesma restrição para pista de
  dado incompleto. Nenhuma diferença de comportamento entre os canais.
- `web-mobile`: com sensor de inclinação ausente ou permissão negada, o controle recai para toque com
  estado visível (I4, `[DOMAIN]`); a regra desta história não muda.

## Pré-condições

- Para os critérios 01 e 02, a volta foi iniciada como volta de reconhecimento ou de treino; quem define o
  tipo é o desafio diário, fora do escopo.
- Para os critérios 03 a 05, a pista carregada tem dado incompleto: não declara largada, sentido, quatro
  setores ou marcadores (`DOMAIN/DEC-10`).

## Critérios de aceite

- AC-US-0008-01: Ao concluir uma volta de reconhecimento ou de treino, a tela exibe seu tempo identificado
  em texto como não oficial.
- AC-US-0008-02: O resultado de uma volta de reconhecimento ou de treino, no estado da simulação, é
  identificado como não oficial.
- AC-US-0008-03: Numa pista de dado incompleto, a tela não oferece volta oficial: nenhuma opção de
  iniciar volta oficial é exibida (`DOMAIN/DEC-10`).
- AC-US-0008-04: Numa pista de dado incompleto, a tela oferece a volta de treino, que pode ser pilotada
  (`DOMAIN/DEC-10`).
- AC-US-0008-05: Numa pista de dado incompleto, todo resultado no estado da simulação é identificado como
  não oficial (`DOMAIN/DEC-10`).

## Casos anormais

- **Volta de reconhecimento ou de treino inválida** (marcador pulado, corte): as regras de US-0004 e
  US-0006 valem em qualquer tipo de volta; nenhuma delas produz tempo oficial.
- **Chegada na contramão em reconhecimento ou treino**: não encerra a volta nem registra tempo, e a volta
  segue em andamento, como em qualquer tipo de volta (US-0005); não é causa de volta inválida.
- **Reposicionamento em reconhecimento ou treino**: não invalida e não penaliza (US-0007).
- **Chegada cruzada de novo após a conclusão**: nenhum segundo resultado (I7, US-0002).
- **Pista de dado incompleto que não declara linha de chegada ou setores**: a volta de treino pode ser
  pilotada (critério 04) e nenhum resultado dela é identificado como oficial (critério 05). O que se
  cronometra numa pista sem linha de chegada não é decidido pelo seed nem por `DOMAIN.md`; este conjunto
  não acrescenta critério sobre isso.
- **Pausa, perda de foco ou perda do sensor durante a volta**: simulação e cronômetro ficam suspensos
  (`DOMAIN/DEC-08`); a volta continua não oficial.
- **Recarregar ou abandonar a página antes da chegada**: a volta não é concluída e não produz resultado
  (`SEED/RD-05`).

## Fontes

- `SEED/US-8` — história e seus dois critérios.
- `SEED/RD-09` — reconhecimento e treino não escrevem tempos oficiais.
- `SEED/RE-03` — largada, sentido, setores e marcadores vêm do dado da pista.
- `DOMAIN/DEC-10` — pista de dado incompleto só é jogável como treino.

## Pontos em aberto

Nenhum — o tratamento da pista de dado incompleto está decidido em `DOMAIN.md` de 2026-10-20.
