---
id: US-0002
title: Aderência em curva sem sair de frente
feature: dirigibilidade
stage: req
status: validated
version: 1.0.0
sources: [SEED/US-2, SEED/RD-01, SEED/RD-05, SEED/NF-03, SEED/IM-I9, DOMAIN/REF-01, DOMAIN/DEC-02, DOMAIN/DEC-03]
---

# US-0002 — Aderência em curva sem sair de frente

## História

Como Jogador, quero que o kart faça a curva que eu pedi, para não sair de frente.

## Canais

- `web-desktop` e `web-mobile`: mesmos limites (45 km/h no raio de 18 m; 200 ms de `understeer`
  consecutivo; início do subesterço pelo menos 15 % acima da linha de base), medidos no estado da
  simulação com esterço cheio. Nenhuma diferença de limite entre os canais.
- `web-desktop`: esterço cheio é a única entrada de direção que o teclado produz.
- `web-mobile`: esterço cheio corresponde à inclinação no ângulo que o adaptador mapeia para 1; com
  esterço parcial o kart faz raio maior por construção e este conjunto não fixa limite de subesterço.
- `web-mobile` com sensor ausente ou permissão negada: controle por toque, esterço binário, mesmos
  critérios (I4).

## Pré-condições

- Acerto Arcade assistido selecionado, na sua nova versão.
- O kart está no asfalto, na entrada da curva de referência (raio 18 m, o menor da pista sintética), em
  estado `grip`.

## Critérios de aceite

- AC-US-0002-01: No estado da simulação, percorrendo a curva de referência a 45 km/h com esterço cheio
  mantido, em cada uma das duas condições de acelerador ensaiadas — acelerador 0 mantido durante toda a
  curva e acelerador cheio mantido durante toda a curva —, a telemetria não reporta `understeer` por mais
  de 200 ms consecutivos de tempo simulado em nenhum trecho da curva (`DOMAIN/DEC-02`, `DOMAIN/DEC-03`).
- AC-US-0002-02: No estado da simulação, percorrendo a curva de referência a 45 km/h com esterço cheio
  mantido, em cada uma das duas condições de acelerador ensaiadas — acelerador 0 mantido durante toda a
  curva e acelerador cheio mantido durante toda a curva —, a trajetória do kart permanece no asfalto em
  todos os passos: a curva de 18 m é feita a 45 km/h sem sair de frente e sem depender de o Jogador soltar
  o acelerador.
- AC-US-0002-03: O ensaio da curva de referência com velocidade de entrada crescente registra, com a linha
  de base (acerto anterior), a velocidade de início do subesterço V0; com o novo acerto, a velocidade de
  início do subesterço V1 satisfaz V1 ≥ 1,15 × V0 (`SEED/US-2`, segundo critério).
- AC-US-0002-04: No ensaio do critério 03, para velocidades de entrada acima de V1, a duração máxima de
  `understeer` consecutivo não diminui quando a velocidade de entrada aumenta: a perda da frente é
  progressiva, sem salto de aderência total para perda total.
- AC-US-0002-05: A saída de `npm test` ou de `npm run bench:handling` contém, para o acerto Arcade
  assistido, o ensaio dos critérios 01 a 04 com a maior duração de `understeer` consecutivo em ms (para
  cada condição de acelerador dos critérios 01 e 02), V0 e V1 em km/h (`SEED/IM-I9`).

## Casos anormais

- **Velocidade de entrada acima de 45 km/h na curva de referência**: o kart pode reportar `understeer` por
  mais de 200 ms; a perda é progressiva (critério 04) e a direção comum continua sem exigir drift
  (`SEED/RD-01`).
- **Esterço aplicado tarde (kart já fora da linha ideal)**: o conjunto não fixa limite; vale só o critério
  01 para a entrada de curva do ensaio.
- **Grama ou parede durante a curva**: a redução de velocidade de US-0004 se aplica; nenhum critério de
  subesterço é medido fora do asfalto.
- **Linha de base ausente** (ensaio nunca executado com o acerto anterior): o critério 03 não é
  decidível; o ensaio reporta falha e a linha de base precisa ser registrada em `docs/physics.md`
  (NFR-0004) antes de o critério ser julgado.
- **Pausa, perda de foco ou perda do sensor durante a curva**: simulação suspensa; a contagem de 200 ms é
  em tempo simulado e não inclui a suspensão.
- **Sensor ausente ou permissão negada antes da volta (`web-mobile`)**: controle por toque com estado
  visível (I4); critérios inalterados.

## Fontes

- `SEED/US-2` — história e seus dois critérios.
- `SEED/RD-01` — direção comum permanece fácil sem exigir drift.
- `SEED/RD-05`, `DOMAIN/REF-01` — muita aderência em alta velocidade; sintoma relatado: sai de frente.
- `SEED/NF-03` — teclado e inclinação atendem ambos.
- `SEED/IM-I9` — ensaio determinístico.
- `DOMAIN/DEC-02` — 45 km/h no raio de 18 m; `DOMAIN/DEC-03` — 200 ms.

## Pontos em aberto

Nenhum — `DOMAIN/DEC-02` e `DOMAIN/DEC-03` fecham os pontos abertos 02 e 03 do seed.
