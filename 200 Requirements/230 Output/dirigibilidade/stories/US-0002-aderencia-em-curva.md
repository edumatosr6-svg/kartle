---
id: US-0002
title: Aderência em curva sem sair de frente
feature: dirigibilidade
stage: req
status: validated
version: 3.2.0
sources: [SEED/US-2, SEED/RD-01, SEED/RD-05, SEED/RD-06, SEED/NF-03, SEED/IM-I9, DOMAIN/REF-01, DOMAIN/REF-02, DOMAIN/REF-03, DOMAIN/REF-04, DOMAIN/DEC-02, DOMAIN/DEC-03, DOMAIN/DEC-11]
---

# US-0002 — Aderência em curva sem sair de frente

## História

Como Jogador, quero que o kart faça a curva que eu pedi, para não sair de frente.

## Canais

- `web-desktop` e `web-mobile`: mesmos limites (50 km/h no arco de raio 18 m da pista de teste; 200 ms de
  `understeer` consecutivo; início do subesterço pelo menos 15 % acima da linha de base; fim da varredura
  de início do subesterço acima de 50 km/h, com pelo menos duas velocidades medidas — patamares
  completos — acima de 50 km/h), medidos no estado da simulação com esterço cheio. Nenhuma diferença de
  limite entre os canais.
- `web-desktop`: esterço cheio é a única entrada de direção que o teclado produz.
- `web-mobile`: esterço cheio corresponde à inclinação no ângulo que o adaptador mapeia para 1; com
  esterço parcial o kart faz raio maior por construção e este conjunto não fixa limite de subesterço.
- `web-mobile` com sensor ausente ou permissão negada: controle por toque, esterço binário, mesmos
  critérios (I4).
- Em nenhum canal o Jogador pilota na pista de teste: o ensaio alimenta a simulação com a mesma forma de
  `Input` que o adaptador do canal produz (`SEED/RD-06`).

## Pré-condições

- Acerto Arcade assistido selecionado, na sua nova versão (acerto agressivo, `DOMAIN/REF-02`).
- Ambiente de ensaio: curva de referência da pista de teste — arco de raio 18 m, faixa de asfalto da
  largura da pista, sem paredes —, fora da pista sintética, que não tem curva de 18 m (raios mínimos
  24 m e 25 m, grampo de 4 m) (`SEED/RD-06`, `DOMAIN/REF-03`).
- O kart está no asfalto, na entrada do arco, em estado `grip`, com a velocidade de entrada do ensaio.

## Critérios de aceite

- AC-US-0002-01: No estado da simulação, percorrendo a curva de referência da pista de teste com entrada a
  50 km/h e esterço cheio mantido, em cada uma das duas condições de acelerador ensaiadas — acelerador 0
  mantido durante todo o arco e acelerador cheio mantido durante todo o arco —, a telemetria não reporta
  `understeer` por mais de 200 ms consecutivos de tempo simulado em nenhum trecho do arco
  (`DOMAIN/DEC-02`, `DOMAIN/DEC-03`, `DOMAIN/REF-03`).
- AC-US-0002-02: No estado da simulação, percorrendo a curva de referência da pista de teste com entrada a
  50 km/h e esterço cheio mantido, em cada uma das duas condições de acelerador ensaiadas — acelerador 0
  mantido durante todo o arco e acelerador cheio mantido durante todo o arco —, o kart permanece dentro da
  faixa de asfalto em todos os passos do arco: a curva de 18 m é feita a 50 km/h sem sair de frente e sem
  depender de o Jogador soltar o acelerador (`SEED/US-2`, primeiro critério; `DOMAIN/DEC-02`,
  `DOMAIN/REF-03`).
- AC-US-0002-03: O ensaio de início do subesterço — curva de referência da pista de teste com velocidade
  crescente no arco: a velocidade do kart sobe no arco de raio 18 m em patamares de velocidade mantida,
  numa varredura — registra, com a linha de base (acerto anterior, no mesmo ensaio e no mesmo arco), a
  velocidade de início do subesterço V0; com o novo acerto, a velocidade de início do subesterço V1
  satisfaz V1 ≥ 1,15 × V0 (`SEED/US-2`, segundo critério; `DOMAIN/DEC-11`; `DOMAIN/REF-04`).
- AC-US-0002-04: No ensaio do critério 03 com o novo acerto, a perda da frente acima de 50 km/h é
  progressiva, sem salto de aderência total para perda total: para cada velocidade medida acima de
  50 km/h — um patamar completo de velocidade mantida no arco, cujo tamanho em km/h e cuja duração são
  parâmetros do ensaio registrados em `docs/physics.md` (NFR-0004) —, toma-se a maior sequência de
  `understeer` consecutivo dentro desse patamar, em ms de tempo simulado, e esse valor não diminui de um
  patamar para o patamar seguinte, de velocidade maior. A comparação é entre patamares, nunca um máximo
  acumulado ao longo da varredura, e cobre as velocidades medidas acima de 50 km/h antes do fim da
  varredura, que são pelo menos duas (critério 06) (`SEED/US-2`, segundo critério; `DOMAIN/DEC-11`;
  `DOMAIN/REF-04`).
- AC-US-0002-05: A saída de `npm test` ou de `npm run bench:handling` contém, para o acerto Arcade
  assistido, o ensaio dos critérios 01 a 04 e 06 com o raio do arco em m e a largura da faixa em m usados,
  a maior duração de `understeer` consecutivo em ms (para cada condição de acelerador dos critérios 01 e
  02), V0 e V1 em km/h (`SEED/IM-I9`).
- AC-US-0002-06: No ensaio do critério 03 com o novo acerto, a saída da faixa de asfalto do arco decide
  como a varredura termina, pela velocidade do kart na saída: se o kart sai da faixa abaixo de 50 km/h, o
  ensaio é reportado como reprovado por saída do asfalto; se sai acima de 50 km/h, a saída é o fim da
  varredura e não reprova o ensaio quando, antes dela, foram medidas pelo menos duas velocidades acima de
  50 km/h (dois patamares completos, critério 04); se sai acima de 50 km/h antes da segunda velocidade
  medida acima de 50 km/h, o ensaio é reportado como reprovado por falta de medida, motivo distinto da
  reprovação por saída do asfalto (`SEED/US-2`, segundo critério; `DOMAIN/DEC-11`; `DOMAIN/REF-04`).

## Casos anormais

- **Velocidade de entrada acima de 50 km/h na curva de referência**: o kart pode reportar `understeer` por
  mais de 200 ms; a perda é progressiva (critério 04) e a direção comum continua sem exigir drift
  (`SEED/RD-01`).
- **Esterço aplicado tarde (kart já fora da linha ideal)**: o conjunto não fixa limite; vale só o critério
  01 para a entrada de curva do ensaio.
- **Kart sai da faixa de asfalto do arco**: a pista de teste não tem paredes nem grama a ensaiar. Na curva
  de referência dos critérios 01 e 02 (entrada a 50 km/h, nas duas condições de acelerador), o passo em
  que o kart sai da faixa falha o critério 02, em qualquer velocidade, e o ensaio reporta o passo e a
  posição da saída. No ensaio de início do subesterço dos critérios 03, 04 e 06, a saída da faixa segue
  `DOMAIN/DEC-11` (critério 06): abaixo de 50 km/h, o ensaio reprova por saída do asfalto; acima de
  50 km/h, encerra a varredura sem reprovar se pelo menos duas velocidades medidas acima de 50 km/h
  (patamares completos) a precederam, e o ensaio reprova por falta de medida se ela ocorre antes da
  segunda medição acima de 50 km/h; em todos os casos o ensaio reporta o passo e a posição da saída. Na
  pista sintética, grama e parede seguem US-0004, e nenhum critério de subesterço é medido fora do asfalto.
- **Linha de base ausente** (ensaio nunca executado com o acerto anterior no mesmo arco da pista de
  teste): o critério 03 não é decidível; o ensaio reporta falha e a linha de base precisa ser registrada em
  `docs/physics.md` (NFR-0004) antes de o critério ser julgado. Uma linha de base medida em curva da pista
  sintética não serve: o seed exige "o mesmo ensaio".
- **Pausa, perda de foco ou perda do sensor durante a curva**: simulação suspensa; a contagem de 200 ms é
  em tempo simulado e não inclui a suspensão.
- **Sensor ausente ou permissão negada antes da volta (`web-mobile`)**: controle por toque com estado
  visível (I4); critérios inalterados.

## Fontes

- `SEED/US-2` — história e seus dois critérios (ensaio em pista de teste, arco de raio 18 m, faixa da
  largura da pista, sem paredes, fora da pista sintética).
- `SEED/RD-01` — direção comum permanece fácil sem exigir drift.
- `SEED/RD-05`, `DOMAIN/REF-01` — muita aderência em alta velocidade; sintoma relatado: sai de frente.
- `SEED/RD-06`, `DOMAIN/REF-03` — a curva de referência é ensaio em pista de teste; a pista sintética não
  tem curva de 18 m.
- `DOMAIN/REF-02` — acerto agressivo da revisão 2: o dono do produto relatou que o kart "não vira".
- `SEED/NF-03` — teclado e inclinação atendem ambos.
- `SEED/IM-I9` — ensaio determinístico.
- `DOMAIN/DEC-02` — 50 km/h no raio de 18 m (em vigor; substitui 45 km/h); `DOMAIN/DEC-03` — 200 ms.
- `DOMAIN/DEC-11` — fim da varredura de início do subesterço (2026-10-22): saída da faixa abaixo de
  50 km/h reprova; acima de 50 km/h encerra a varredura sem reprovar, com pelo menos duas velocidades
  acima de 50 km/h medidas antes; antes da segunda medição acima de 50 km/h, reprova por falta de medida.
- `DOMAIN/REF-04` — esclarecimento de método da varredura (2026-10-22, sem mudar `DOMAIN/DEC-11`): a
  varredura mede em patamares de velocidade mantida no arco de 18 m; uma velocidade medida é um patamar
  completo; em cada patamar compara-se a maior sequência de `understeer` consecutivo dentro dele, não um
  máximo acumulado; o tamanho do patamar em km/h e a sua duração são parâmetros do ensaio registrados em
  `docs/physics.md` (NFR-0004), não limiares de domínio.

## Pontos em aberto

Nenhum — `DOMAIN/DEC-02` e `DOMAIN/DEC-03` fecham os pontos abertos 02 e 03 do seed; `DOMAIN/DEC-11` fixa
quando o ensaio de início do subesterço termina e quando reprova; `DOMAIN/REF-04` define a velocidade
medida da varredura.
