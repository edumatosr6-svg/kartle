---
id: ADR-0005
title: Pista de teste como geradores de Environment em src/physics.ts; velocidade mantida por acelerador regulado; classificador de passo na simulação
feature: dirigibilidade
stage: dspec
status: validated
version: 1.1.0
sources: [RULE-0001, RULE-0002, FLOW-0002, FEAT-0001, FEAT-0002, FEAT-0003, FEAT-0004, REQ-FEAT-0001-01, REQ-FEAT-0001-02, REQ-FEAT-0001-09, REQ-FEAT-0002-01, REQ-FEAT-0002-03, REQ-FEAT-0002-09, REQ-FEAT-0003-01, REQ-FEAT-0003-04, REQ-FEAT-0003-10, REQ-FEAT-0003-12, REQ-FEAT-0004-03, REQ-FEAT-0006-02, NFR-0003, NFR-0005, NFR-0008]
---

# ADR-0005 — Pista de teste como geradores de Environment em src/physics.ts; velocidade mantida por acelerador regulado; classificador de passo na simulação

## Contexto

A revisão 3 do seed (`SEED/RD-06`, `DOMAIN/REF-03`) corrige dois fatos do projeto anterior, apontados pelo
feedback da etapa de código: a pista sintética (`src/track.ts:3-6`) não tem curva de raio 18 m (os raios
discretos mínimos são 24,0 m, 25,1 m e um grampo de 4,1 m, em que 50 km/h exigiriam 4,8 g), e o regime
da taxa de guinada medido com acelerador 0 por 2 s não é estacionário (a velocidade cai de 13,9 para
10,5 m/s e a guinada sobe com a desaceleração). O F-Spec 3.0.0 passa a exigir uma **pista de teste**
(`benchEnvironment` `TEST_PAD`): faixa de asfalto da largura da pista, sem paredes, reta para a resposta
do volante e arco de raio 18 m para curva, início do subesterço e recuperação; a velocidade **mantida** em
50 km/h pelo acelerador no ensaio de resposta; e a classe de passo "Recuperação" fora da condução normal.
Deixa ao projeto: o modo de manter a velocidade (constante ou regulado), a faixa tolerada, a janela do
regime, a largura numérica da faixa e o comprimento do arco. Em `BINARY` o acelerador só assume 0 ou 1, e 1
com esterço cheio acima de 50 km/h é a condição de forçar (RULE-0001).

## Decisão

1. **Pista de teste em `src/physics.ts`**, como dois geradores puros de `Environment` ao lado de `CIRCUIT`
   e `TEST_PAD` (`src/physics.ts:161-163`): `testPadLane(laneWidthM)` (reta: faixa ao longo de z) e
   `testPadArc(arcRadiusM, laneWidthM)` (arco: anel centrado na origem). Sem paredes; fora da faixa
   `surface` é `grass` no sentido de "fora do asfalto". A constante `TEST_PAD` (asfalto sem limite) fica
   intacta para os usos existentes. A largura é `WIDTH` (`src/track.ts:2`, 11 m); o raio é 18 m. O anel
   não tem fim: "o arco" de um ensaio é o trecho percorrido na sua janela, e a entrada é tangente em
   `(18, 0)`. A pista de teste não é dado de pista (sem `trackId`, linhas, setores ou marcadores), não
   passa por `src/lap.ts` e não altera a validação de volta (NFR-0008).
2. **Velocidade mantida por acelerador regulado por passo** (`speedHoldMode` `THROTTLE_REGULATED`): o
   acelerador do passo `k` é 1 se a velocidade do passo `k−1` está abaixo de `targetSpeedMps` e 0 caso
   contrário. É binário por construção (vale em `BINARY` e `PROPORTIONAL`), nunca satisfaz a condição de
   forçar (que exige acelerador 1 **com** velocidade acima de 50 km/h) e é função determinística da
   telemetria anterior (RULE-0002, Idempotência). `speedHoldBandMps` 0,5; fora da faixa, `SPEED_NOT_HELD`.
   O regime é a média de `|yawRateRadPerS|` nos últimos `settleWindowMs` 200 de uma fase mantida de
   `holdMs` 600 — curta porque a faixa de 11 m limita quanto o kart pode girar antes de sair dela, e
   estacionária porque a velocidade não deriva ([DES-0004](../core/DES-0004-ensaios-de-dirigibilidade-e-saida.md)).
3. **Classificador de passo em `src/physics.ts`** (`classifyHandlingSteps`, `RECOVERY_MAX_STEPS` 48): a
   classe de RULE-0001 (`NORMAL`, `FORCING`, `DRIFT`, `RECOVERY`) é função pura da sequência de `Input` e
   telemetria, decidida na simulação (REQ-FEAT-0003-10); a biblioteca de ensaios só a chama para excluir a
   recuperação do agregado `NORMAL_DRIVING` e contar `excludedRecoveryStepCount`.
4. Grama, parede, volta do piloto de teste e custo por passo continuam na pista sintética (`CIRCUIT`);
   `GRASS_LOSS` entra na grama a partir do trecho mais reto da pista (índice 83; raio discreto acima de
   190 m dos índices 81 a 102, cerca de 35 m), pelo lado oposto à origem (a pista a envolve), com ângulo
   de saída pequeno (0,15 rad), para que 1 s de grama caiba entre a borda (5,5 m do eixo) e a parede
   (13,5 m, `src/physics.ts:277`). Medido em 2026-10-22 sobre a árvore da rodada de código 1: com
   `ARCADE_KART` e com o candidato, à velocidade estabilizada de cada um e a 50 km/h, os 120 passos ficam
   em `GRASS`, sem contato com a parede, a no máximo 9,0 m do eixo.

## Alternativas consideradas

- **Localizar a curva de referência na pista sintética** (o as-built, `scripts/handlingBench.ts:139-172`).
  Não existe curva de 18 m; o grampo de 4,1 m é inatingível a 50 km/h e a curva de 24 m mudaria o limiar
  observável. Recusada pelo seed e pelo F-Spec.
- **Geometria da pista de teste só na biblioteca `scripts/handlingBench.ts`.** Funcionaria, mas
  `Environment`, `CIRCUIT` e `TEST_PAD` já vivem em `src/physics.ts`, e o F-Spec descreve a pista de
  teste como ambiente da simulação; dois geradores puros ali evitam que a biblioteca redefina o conceito.
  Recusada.
- **Acelerador constante parcial (`THROTTLE_CONSTANT`, por exemplo 0,35).** Mantém a velocidade, mas não
  é binário: falha a paridade `BINARY` (NFR-0003). Recusada.
- **Acelerador constante 1.** Satisfaz a condição de forçar acima de 50 km/h e muda o que o ensaio mede.
  Recusada.
- **Alimentar a simulação com a velocidade constante por fora (zerar a aceleração longitudinal).**
  Exigiria um caminho de simulação que o jogo não tem — superfície só de teste. Recusada.
- **Classificar a recuperação dentro da biblioteca de ensaios** (onde o as-built exclui só `forcing` e
  drift, `scripts/handlingBench.ts:413-423`). RULE-0001 é regra do passo e REQ-FEAT-0003-10 manda decidi-la
  na simulação; a biblioteca é código de ensaio, fora de `src/`. Mantê-la em `src/physics.ts` deixa um único
  lugar que a conhece, verificável pelo teste de contrato. Recusada.
- **Faixa mais larga que `WIDTH` para a reta.** O F-Spec fixa "faixa da largura da pista". Recusada; a
  duração do ensaio é que se ajusta à faixa.

## Consequências

- `src/physics.ts` ganha dois geradores, um classificador e um campo opcional (`forcingRampMps`); nenhum
  deles é chamado pelo jogo, e `RENTAL_KART`/`ARCADE_KART` continuam intactos.
- Toda linha de base do arco e da reta é medida na pista de teste; as medidas da rodada de código 1 na
  pista sintética não são comparáveis (ADR-0003).
- Os ensaios da pista de teste não passam por `src/lap.ts`: `simStepCount` é o `stepCount` do `State`,
  e `toMs` continua sendo a conversão de tempo.
- O trecho de grama e o ângulo de entrada são parâmetros de ensaio fixos e reportados: como todo
  parâmetro de ensaio ([ADR-0004](ADR-0004-ensaios-como-biblioteca-e-parametros-de-ensaio.md), decisão 2),
  só mudam por mudança deste projeto, nunca para fazer `GRASS_LOSS` passar.

## Estado

Aceita nesta rodada.
