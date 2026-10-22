---
id: ADR-0004
title: Ensaios como biblioteca em scripts/ compartilhada por npm test e pelos benches; parâmetros de ensaio fixados; entradas da biblioteca
feature: dirigibilidade
stage: dspec
status: validated
version: 3.0.0
sources: [API-0003, RULE-0002, FLOW-0002, FEAT-0001, FEAT-0002, FEAT-0003, FEAT-0004, FEAT-0005, FEAT-0006, REQ-FEAT-0001-06, REQ-FEAT-0001-09, REQ-FEAT-0002-04, REQ-FEAT-0002-05, REQ-FEAT-0002-06, REQ-FEAT-0002-09, REQ-FEAT-0002-10, REQ-FEAT-0003-08, REQ-FEAT-0004-07, REQ-FEAT-0005-03, REQ-FEAT-0005-04, REQ-FEAT-0006-04, REQ-FEAT-0006-05, NFR-0001, NFR-0003, NFR-0007, NFR-0009]
---

# ADR-0004 — Ensaios como biblioteca em scripts/ compartilhada por npm test e pelos benches; parâmetros de ensaio fixados; entradas da biblioteca

## Contexto

Os critérios nomeiam "a saída de `npm test` ou de `npm run bench:handling`/bench de física" como ponto de
observação dos mesmos registros (API-0003). A rodada de código 1 escreveu a biblioteca
`scripts/handlingBench.ts` segundo uma versão anterior deste projeto; `scripts/keyboard-lap.ts` e
`scripts/physics-bench.ts` ainda imprimem objetos próprios e não a chamam. O F-Spec 3.2.0 deixa ao ensaio
parâmetros (modo de manter a velocidade e faixa tolerada, janela de estabilização, largura da faixa; na
varredura de início do subesterço, o tamanho do patamar, a sua duração e o modo de manter a sua velocidade)
e lacunas deliberadas (resposta à inversão, recuperação parcial, magnitude da perda na parede). Em
`UNDERSTEER_ONSET`, RULE-0002 ("Fim da varredura de início do subesterço", `DOMAIN/DEC-11`) define a
varredura como uma subida da velocidade do kart no arco em **patamares de velocidade mantida** a partir de
50 km/h, encerrada pelo primeiro passo fora da faixa, e decide essa saída pela velocidade do kart no passo
da saída: abaixo de 50 km/h, `FAIL` `OFF_ASPHALT`; acima, com pelo menos dois patamares completos acima de
50 km/h, fim natural da varredura, sem reprovar pela saída; acima, com zero ou um, `FAIL`
`MEASUREMENT_MISSING`; no fim natural sem V1 medida, `FAIL` `MEASUREMENT_MISSING`. A saída exatamente a
50 km/h e o fim da varredura sem saída da faixa ficam sem decisão (lacunas deliberadas de `01-overview.md`
do F-Spec). A velocidade do kart no passo da saída não é campo do registro (API-0003). O feedback da etapa
de código apontou que a biblioteca não pode importar de `tests/` e que a sua interface não dizia de onde
`SETUP_VERSION` recebe os registros antigos nem como a entrada do Realista chega a `REALISTA_UNCHANGED`.

Fatos medidos em 2026-10-22 com as definições deste projeto sobre `src/physics.ts` e `src/track.ts` da
rodada de código 1 (prova de método, não linha de base):

- A pista sintética tem 368,5 m. O programa anterior de `bench:handling` (`scripts/keyboard-lap.ts:21`)
  limita o piloto a 13 m/s, o que põe a volta em pelo menos 28,35 s com qualquer acerto: o limiar de
  25 s não é alcançável com aquele piloto. O piloto da biblioteca (`maxSpeedMps` 26, `lateralBudgetMps2`
  9,5) faz a volta com `ARCADE_KART` em 26 703 ms, válida, sem passo fora do asfalto; com o candidato
  `ARCADE_ASSISTIDO_V5`, sai do asfalto a partir do passo 1 400.
- Varredura em patamares no arco de 18 m (patamares de 1 000 ms, passo de 0,5 m/s, acelerador regulado,
  esterço `+1`, `BINARY`): `ARCADE_KART` reporta `understeer` por 808 ms consecutivos no patamar de
  50 km/h e sai da faixa a 51,7 km/h, dentro do patamar de 51,8 km/h, sem patamar completo acima de
  50 km/h; o candidato `ARCADE_ASSISTIDO_V5` não reporta `understeer` no patamar de 50 km/h e sai da faixa
  a 49,3 km/h durante a subida para o patamar de 51,8 km/h, depois de 247 passos sob a condição de forçar
  (acelerador 1, esterço cheio, acima de 50 km/h; RULE-0001), com a traseira solta pelo degrau as-built de
  `forcingRearFrictionScale`. Uma velocidade de 90 km/h só caberia na faixa (raio externo 23,5 m) com 2,7 g
  de aceleração lateral: a varredura sai da faixa muito antes de 25 m/s com qualquer acerto de kart.

## Decisão

1. Uma biblioteca pura `scripts/handlingBench.ts` ([DES-0004](../core/DES-0004-ensaios-de-dirigibilidade-e-saida.md))
   produz os registros; `npm test` e os dois benches a chamam. O mesmo código, três saídas.
2. Parâmetros de ensaio, fixados em `BENCH_PARAMETERS` e reportados (nunca limiares nem configuração do
   jogo): `targetSpeedMps` `50 / 3.6`; `speedHoldMode` `THROTTLE_REGULATED`; `speedHoldBandMps` 0,5
   (±1,8 km/h); `holdMs` 600; `settleWindowMs` 200; `steerInputNorm` parcial 0,5; `laneWidthM` = `WIDTH`
   (11); `arcRadiusM` 18; `cornerWindowMs` 2 500 (curva de referência); `entrySpeedStepMps` 0,5 (tamanho do
   patamar); `plateauMs` 1 000 (duração da fase mantida de cada patamar); `plateauSpeedHoldMode`
   `THROTTLE_REGULATED` (modo de manter a velocidade do patamar); `entrySpeedMaxMps` 25 (velocidade do
   último patamar, teto de segurança, decisão 8); `forcingSpeedMps` 16,7; `forcingWindowMs` 3 000;
   `grassEntryIndex` 83; `grassEntryOffsetM` 0,2; `grassEntryAngleRad` 0,15; `grassWindowMs` 1 000;
   `wallApproachRad` 0,6; `wallWindowMs` 10 000; `topSpeedWindowMs` 60 000; `driverMassKg` 75; `runCount`
   2; piloto de teste com decisão a cada 12 passos, `maxSpeedMps` 26 e `lateralBudgetMps2` 9,5. **Todos
   são fixos**: a etapa de código ajusta o acerto, nunca um parâmetro de ensaio; mudar um deles é mudança
   deste projeto, com nova linha de base. O piloto de teste em particular é a régua de regressão (glossário
   do F-Spec): a linha de base e o acerto novo rodam com o mesmo piloto, e um piloto retunado mudaria a
   régua junto com o acerto. Os parâmetros que API-0003 tem como campo saem no registro; os demais na linha
   `#` e em `parameters` da entrada de `docs/physics.md` — inclusive `plateauMs` e `plateauSpeedHoldMode`,
   que RULE-0002 manda registrar ali (AC-US-0002-04).
3. Precondição não atingida é `FAIL`: um ensaio que não chega ao estado que mede não aprova o requisito. O
   que o registro de API-0003 carrega é julgado pelos campos: saída da faixa em `REFERENCE_CORNER`,
   `REAR_RECOVERY` e `TEST_PILOT_LAP` (`offAsphaltStepCount` > 0, `OFF_ASPHALT`), traseira que não solta em
   `REAR_RECOVERY` (`gripReached` falso), nenhum contato em `WALL_CONTACT` (`contacts` vazia), piloto de
   teste que não termina ou volta invalidada (`lapTimeMs` = `toMs(MAX_LAP_STEPS)`). O que o ensaio vê no seu
   traço e nenhum campo carrega chega a `judge(record, observed)` pelo segundo argumento: `GRASS_LOSS` que
   toca a parede ou volta ao asfalto antes de 1 s (`THRESHOLD_EXCEEDED`) e, em `UNDERSTEER_ONSET`, a saída
   da faixa com a velocidade do kart abaixo de 50 km/h (`OFF_ASPHALT`; a velocidade no passo da saída não é
   campo). A velocidade fora da faixa mantida é `SPEED_NOT_HELD`. A saída da faixa da reta em
   `STEER_RESPONSE` não altera o veredito, que depende só dos tempos com a velocidade mantida (API-0003,
   AC-US-0001-05).
4. As lacunas deliberadas do F-Spec não ganham ensaio: nenhum registro mede inversão do esterço, redução
   parcial do esterço ou magnitude da perda na parede.
5. O cenário de `DRIFT_MANEUVER` é o do teste existente `tests/maneuvers.test.ts:68-79`, replicado na
   biblioteca com o acerto corrente e no mesmo ambiente (`TEST_PAD`); o teste existente não é alterado nem
   removido.
6. Entradas da biblioteca que vêm de fora dela, como campos opcionais de `BenchOptions`: `oldRecords`
   (os registros antigos que `SETUP_VERSION` lê; `npm test` passa os fixtures de `tests/fixtures/records.ts`;
   ausente, a biblioteca usa `builtInOldRecords()`, dois registros mínimos literais na forma anterior à
   feature) e `realistaBaseline` (a entrada do Realista lida com `readBaseline`, usada só por
   `REALISTA_UNCHANGED`; `baseline` continua sendo a entrada da versão anterior do acerto ensaiado). A
   biblioteca nunca importa de `tests/`.
7. Os agregados `NORMAL_DRIVING`, `DETERMINISM` e `REALISTA_UNCHANGED` saem um registro por ambiente, para
   que `benchEnvironment` seja sempre o ambiente em que a medida foi feita; `SETUP_VERSION` e
   `STEP_CONTRACT`, sem passo de simulação, reportam `TEST_PAD` por convenção documentada.
8. **A varredura de `UNDERSTEER_ONSET` realiza RULE-0002 em patamares e termina na primeira saída da
   faixa** (REQ-FEAT-0002-10). Uma única execução contínua no anel de 18 m, com esterço `+1` mantido; o
   patamar `k` (k = 0, 1, 2, …) tem a velocidade-alvo `50 / 3.6 + k × entrySpeedStepMps`; o acelerador de
   cada passo segue `plateauSpeedHoldMode` `THROTTLE_REGULATED` — 1 se a velocidade do passo anterior está
   abaixo do alvo do patamar corrente, senão 0 —, a mesma regra de `STEER_RESPONSE`
   ([ADR-0005](ADR-0005-pista-de-teste-como-ambiente-da-simulacao-e-velocidade-mantida.md), decisão 2),
   binária nos dois `inputMode`. Cada patamar tem uma fase de subida até o primeiro passo com a velocidade
   no alvo e uma fase mantida de `plateauMs`; o patamar está completo ao fim da fase mantida dentro da faixa.
   V1 é a menor velocidade-alvo de patamar completo com `understeer` por mais de 200 ms consecutivos na fase
   mantida (`v1Mps` ausente quando nenhum); `maxUndersteerMsBySpeed` traz os patamares completos acima de
   50 km/h; o patamar interrompido pela saída não conta. A velocidade do kart no passo da saída decide o
   resultado como RULE-0002 manda: abaixo de `50 / 3.6`, `OFF_ASPHALT` (pelo segundo argumento de `judge`,
   decisão 3); acima, com menos de dois pares, `MEASUREMENT_MISSING`; acima, com dois ou mais, fim natural,
   e o veredito é o de linha de base, V1 e não diminuição, com `MEASUREMENT_MISSING` sem V1 medida. Entre
   os motivos, a ordem é: os dois resultados da saída que reprovam por si (que valem com ou sem V1),
   `BASELINE_MISSING` (sem linha de base o critério de V1 não é julgado, RULE-0002, Linha de base), V1 não
   medida, limiares. Os dois casos que RULE-0002 não decide — saída com a velocidade exatamente igual a
   `50 / 3.6`, e fim sem saída da faixa (o patamar de `entrySpeedMaxMps` completo, ou uma subida que não
   alcança o alvo: a velocidade deixa de crescer pelo critério de `TOP_SPEED` ou `topSpeedWindowMs` se
   esgota) — não recebem veredito: a biblioteca lança um erro com o `benchId` e o caso, e nenhum registro é
   emitido. `entrySpeedMaxMps` é só o teto que garante o fim da execução.

## Alternativas consideradas

- **Biblioteca em `src/`.** Não é código do jogo e usa `node:fs`; `src/` é o cliente.
  Recusada; `scripts/` é onde as diretrizes põem os benches.
- **Relógio de parede e `runtimeId()` dentro da biblioteca.** A biblioteca é camada Simulação e não pode
  ler `performance.now`; `node:perf_hooks` e `node:os` ficam no programa `scripts/keyboard-lap.ts`, que
  entrega `meanStepCostUs` e `runtimeId` já medidos em `BenchOptions.stepCost`. Recusada.
- **Biblioteca em `tests/helpers/`, ou biblioteca importando `tests/fixtures/records.ts`.** Os benches
  importariam de `tests/`, invertendo o papel das árvores. Recusada; os registros antigos entram por
  `oldRecords`.
- **`baseline` como bloco inteiro resolvido por ensaio dentro da biblioteca.** Faria a biblioteca decidir
  qual entrada é "a anterior" do Realista e qual é a do Arcade a partir de `PUBLISHED_SETUPS`, misturando
  leitura de arquivo com veredito; dois campos explícitos são mais simples de testar. Recusada.
- **Precondição decidida pelo ensaio fora de `judge`, gravando `verdict` direto.** Haveria duas fontes de
  veredito, e um teste que julga um registro sintético não reproduziria o do bench. Recusada em favor do
  segundo argumento `observed`.
- **A velocidade do kart no passo da saída como campo de `UNDERSTEER_ONSET`.** API-0003 não a tem;
  acrescentá-la mudaria o contrato. Recusada; a saída abaixo de 50 km/h chega a `judge` por `observed`, e a
  velocidade sai na linha `#`.
- **Um veredito para os dois casos que RULE-0002 não decide** (`OFF_ASPHALT` para a saída exatamente a
  50 km/h; `THRESHOLD_EXCEEDED` para a varredura sem saída da faixa). Seria um ramo de domínio que o F-Spec
  recusou decidir. Recusada; a biblioteca lança, o que impede um registro com resultado inventado e deixa o
  caso visível ao autor.
- **Acelerador parcial para manter o patamar sem ativar a condição de forçar.** Em `BINARY` o acelerador do
  teclado só assume 0 ou 1, e o ensaio alimenta a simulação com a forma de `Input` do adaptador
  (RULE-0002). Recusada; os passos de acelerador 1 acima de 50 km/h são "Forçando" por RULE-0001, como em
  `REFERENCE_CORNER` com acelerador cheio.
- **Patamar como janela fixa que inclui a subida.** Com a subida lenta no arco, a velocidade do patamar não
  estaria mantida durante a medida, e o par levaria uma velocidade que o kart não teve. Recusada em favor de
  subida e fase mantida separadas.
- **Contar na lista, ou em V1, o patamar interrompido pela saída da faixa.** RULE-0002 o exclui; a duração
  cortada pela saída mede subesterço que continua fora do asfalto, onde nada é medido. Recusada.
- **Uma janela própria para a subida de cada patamar.** Seria mais um parâmetro; o critério de "a
  velocidade deixou de crescer" e o teto `topSpeedWindowMs` de `TOP_SPEED` já dizem quando o kart não tem
  mais como acelerar. Recusada.
- **Campos novos no registro para a precondição de `GRASS_LOSS`.** O registro de API-0003 não os tem;
  acrescentá-los mudaria o contrato. Recusada; o motivo sai na linha `#`.
- **Piloto de teste retunável pela etapa de código.** Faria o limiar de 25 s ser atendido mudando a régua
  em vez do acerto. Recusada (decisão 2).
- **Manter o piloto do programa anterior (teto de 13 m/s).** A volta nunca desceria de 28,35 s: o
  requisito seria inalcançável por construção do ensaio, não do acerto. Recusada.
- **Tolerância numérica no `DETERMINISM`.** O F-Spec a proíbe (REQ-FEAT-0005-12). Recusada.
- **Medir custo por passo em `npm test`.** Relógio de parede em teste contraria I9; fica nos benches.
  Recusada.
- **Um único registro agregado com `benchEnvironment` arbitrário.** Tornaria o campo falso em metade das
  medidas. Recusada em favor de um registro por ambiente.

## Consequências

- `npm test` passa a executar os ensaios (algumas dezenas de segundos de simulação); a volta do piloto de
  teste roda uma vez por arquivo de teste que a precisa.
- `scripts/keyboard-lap.ts` deixa de usar `LapTracker`; a classe fica exportada e testada como antes.
- Os parâmetros entram em `docs/physics.md` com cada entrada datada (NFR-0004), no objeto `parameters`.
- A mudança de `holdMs` (2 000 → 600), `settleWindowMs` (500 → 200) e do acelerador (constante 0 →
  regulado) em relação ao as-built muda o que `STEER_RESPONSE` mede, e a varredura em patamares muda o que
  `UNDERSTEER_ONSET` mede (o as-built roda uma execução por velocidade de entrada): as medidas da rodada de
  código 1 não são comparáveis com as desta versão e não entram em linha de base alguma (ADR-0003,
  decisão 3).
- `baselineLapTimeMs` é o tempo do mesmo piloto com `arcade-assistido-v4` (26 703 ms na medida acima); o
  valor de cerca de 31 400 ms que API-0003 cita como "linha de base citada" é do programa anterior, com
  outro piloto, e não é linha de base deste ensaio (RULE-0002: linha de base é o mesmo ensaio).
- Como `ARCADE_KART` já excede 200 ms de `understeer` no patamar de 50 km/h, o V0 da linha de base é a
  velocidade do primeiro patamar (50 km/h), e o novo acerto precisa de V1 ≥ 1,15 × V0 (57,5 km/h); na grade
  dos patamares (0,5 m/s a partir de `50 / 3.6`) o primeiro alvo que atende é `50 / 3.6 + 2.5` (59,0 km/h).
  O registro da linha de base sai com `MEASUREMENT_MISSING` (a saída a 51,7 km/h vem antes do segundo
  patamar completo acima de 50 km/h) e serve de V0 mesmo assim, porque tem `v1Mps`: RULE-0002 aplica o fim
  da varredura só ao novo acerto, e a linha de base só fornece V0 (ADR-0003, decisão 2).
- Para `PASS`, o novo acerto não pode ter `understeer` acima de 200 ms consecutivos em patamar abaixo de
  59,0 km/h e precisa completar, dentro da faixa, um patamar de 59,0 km/h ou mais com `understeer` acima de
  200 ms consecutivos (o que já traz os patamares completos acima de 50 km/h que o fim natural pede), com a
  subida de cada patamar acima de 50 km/h feita sob a condição de forçar. A etapa de código ajusta
  `assistSteerAllowanceRad` e `assistLateralG` (a frente avisa no asfalto antes de o kart sair) e
  `forcingRampMps` (a traseira não solta nos passos de acelerador 1 logo acima de 50 km/h)
  ([DES-0001](../core/DES-0001-acerto-arcade-assistido-v5-e-assistencias.md)); um acerto que só sai da faixa,
  sem reportar subesterço, reprova com `OFF_ASPHALT` ou `MEASUREMENT_MISSING`.
- Os dois casos sem decisão do F-Spec, se ocorrerem, aparecem como erro da execução de `npm test` ou do
  bench, e cabe ao autor decidi-los no seed; com a medida acima, nenhum acerto de kart chega ao teto de
  25 m/s dentro da faixa.

## Estado

Aceita nesta rodada.
