---
title: Divergências — dirigibilidade do Arcade assistido
feature: dirigibilidade
stage: dspec
status: validated
version: 1.1.0
sources: []
---

# Divergências

Registro durável dos requisitos deste conjunto que o sistema em execução não satisfaz (conventions §6). O
F-Spec é normativo: nenhuma linha abaixo enfraquece um requisito. Cada linha cita o que existe hoje em
`arquivo:linha`, a etapa que deve a mudança e o item de projeto que a fecha. Caminhos relativos à raiz do
repositório.

| Requisito | O que exige | O que o sistema faz hoje | Etapa devedora | Item de projeto | Estado |
|---|---|---|---|---|---|
| REQ-FEAT-0001-01 a -04 | 90 % do regime de guinada em ≤ 180 ms e 10 % em ≤ 250 ms a 50 km/h, esterço cheio e parcial | taxas de esterço fixas em `src/physics.ts:135` (5× e 10× o limite por s) e amortecimento de guinada em `:183-189` sem termo de rastreio; nenhuma medida de resposta existe (`scripts/physics-bench.ts:12-15` imprime só guinada após 1 s) | código | DES-0001, DES-0004 | open |
| REQ-FEAT-0002-01 a -03 | curva de referência (18 m) a 50 km/h com `understeer` ≤ 200 ms e no asfalto, com acelerador 0 e cheio | limite de esterço por velocidade em `src/physics.ts:118-124` com `friction` e folga 0,045 fixos; o teste existente `tests/physics.test.ts:75-82` afirma `understeer` com esterço cheio a 57,6 km/h no Realista e nenhum ensaio mede a curva de 18 m | código | DES-0001, DES-0004 | open |
| REQ-FEAT-0002-04, -05, -07 | V1 ≥ 1,15 × V0 com perda progressiva; `BASELINE_MISSING` sem linha de base | não há ensaio de início de subesterço nem linha de base legível: `docs/physics.md:70-77` é prosa com uma tabela de quatro medidas | código | DES-0004, DM-0001, ADR-0003 | open |
| REQ-FEAT-0003-01 a -06, -09 | `oversteer`/`sliding` só com `forcing` ou drift; `sideslipRad` ≤ 0,65 em condução normal; `grip` em ≤ 400 ms ao zerar o esterço | não existe condição de forçar: o atrito traseiro só é reduzido no drift (`src/physics.ts:167`) e o amortecimento de `:175-192` não distingue forçar de condução normal; `handling` em `:106-113` pode reportar `oversteer` em qualquer passo | código | DES-0001, DES-0002, DES-0004 | open |
| REQ-FEAT-0004-01, -02 | 0–60 km/h em ≤ 2,5 s; ≥ 105 km/h estabilizada | `ARCADE_KART` com `enginePower` 10 000 W, `driveForce` 1 000 N e `governorSpeed` 23 m/s (`src/physics.ts:52`); medido 0–40 km/h em 3,21 s e 79,4 km/h (`docs/physics.md:74`, `:77`) | código | DES-0001, DES-0004 | open |
| REQ-FEAT-0004-03, -04, -08 | ≤ 70 % da velocidade de entrada após 1 s na grama | a grama só reduz atrito (`grassFriction` 0,38, `src/physics.ts:43`) e sobe a resistência de rolagem (`:156`); nenhuma perda adicional e nenhuma medida | código | DES-0001, DES-0004 | open |
| REQ-FEAT-0004-05 | contato com a parede reportado e medido em 100 % dos contatos | a física já reduz a velocidade em `src/physics.ts:222-226`, mas nenhum campo reporta o contato (`Telemetry`, `:16-19`) e nenhum ensaio o mede | código | DES-0001, DES-0002, DES-0004 | open |
| REQ-FEAT-0004-06, -09 | HUD lido pelo contrato API-0001 | `src/main.ts:458` e `:474-476` já exibem km/h e texto em todos os quadros e mantêm o valor na pausa, mas leem `state.speed` e `state.telemetry` diretamente, sem `getHandlingTelemetry` (inexistente) | código | DES-0002, DES-0005 | open |
| API-0001 (REQ-FEAT-0003-03, REQ-FEAT-0001-05) | `simStepCount`, `setupId`, `setupVersion`, `surface`, `wallContact`, `forcing`, `driftActive` por passo | `State` (`src/physics.ts:20-25`) não tem contador de passos nem identidade de acerto; `Telemetry` não tem superfície, contato, forçar | código | DES-0001, DES-0002 | open |
| REQ-FEAT-0005-05, -06, -08, -10 e API-0002 | versão do acerto declarada; comparação só `COMPARABLE`; registros antigos lidos; replay reproduzido como não comparável | só existe `PHYSICS_VERSION` (`src/physics.ts:7`); não há replay, registro de volta nem leitor; `src/main.ts:396` compara `best` com qualquer volta válida e `:226`, `:233` zeram ao trocar peso ou acerto; não há texto compartilhado | código | DES-0003, DES-0006, DES-0007, DM-0001, ADR-0002 | open |
| REQ-FEAT-0005-01 a -04, -11, -12 | registros `DETERMINISM` e `TEST_PILOT_LAP` (≤ 25 000 ms, 0 passos fora do asfalto) com os vereditos de API-0003 | `scripts/keyboard-lap.ts:5-41` completa a volta por `LapTracker` com teto de 90 s, imprime `seconds`/`offRoadFraction` próprios e lança erro em vez de registro; a volta não passa por `src/lap.ts`; o determinismo é afirmado só em `tests/physics.test.ts:12-19` e `tests/race-lap-validation-determinism.test.ts` | código | DES-0004 | open |
| REQ-FEAT-0005-07, REQ-FEAT-0006-03 | `STEP_CONTRACT` com `solverRateUnchanged` | a taxa do solver é o literal `STEP / 4` em `src/physics.ts:234`, sem símbolo que um ensaio leia; `STEP` e `Input` já são afirmados por `tests/race-lap-validation-frozen.test.ts:32-40` | código | DES-0001, DES-0004 | open |
| REQ-FEAT-0001-06, REQ-FEAT-0002-06, REQ-FEAT-0003-07, -08, REQ-FEAT-0004-07, REQ-FEAT-0006-05 e API-0003 | registros por `benchId` na saída de `npm test` e dos benches, em `BINARY` e `PROPORTIONAL` | `scripts/physics-bench.ts:10-37` imprime objetos próprios em km/h; não há `benchId`, `verdict`, `inputMode` nem execução em `npm test` | código | DES-0004 | open |
| REQ-FEAT-0006-04 | `REALISTA_UNCHANGED` com 0 medidas diferentes e 0 assistências | `RENTAL_KART` é afirmado literalmente (`tests/race-lap-validation-frozen.test.ts:53-56`), mas nenhuma medida do Realista é comparada com linha de base e nenhum campo conta assistências ativas | código | DES-0001, DES-0004 | open |
| REQ-FEAT-0006-06, -09 | `STEP_COST` ≤ 1,10 × linha de base da mesma máquina e runtime | nenhuma medida de custo por passo; `docs/lap-validation-bench.md` registra só os benchmarks de `race-lap-validation` | código | DES-0004, ADR-0003 | open |
| REQ-FEAT-0006-08 | entrada datada em `docs/physics.md` com todos os campos de API-0003 para linha de base e acerto novo | `docs/physics.md` não tem data por entrada, nem os campos de API-0003, nem bloco legível por máquina | código | DES-0004, DM-0001 | open |

Satisfeitos hoje, sem divergência, e protegidos pelo projeto: saturação do `Input` na faixa
(REQ-FEAT-0001-07: `src/physics.ts:133`, `:137-138`; `src/main.ts:284`); tempo simulado sem contar a
suspensão (REQ-FEAT-0001-08, REQ-FEAT-0002-08, REQ-FEAT-0003-11: `src/lap.ts:173` devolve a sessão em
`PAUSED`); regras de pilotagem só na simulação e simulação sem DOM (REQ-FEAT-0003-10, REQ-FEAT-0006-01,
-02: `tests/race-lap-validation-layering.test.ts`); grama e parede não invalidam a volta por si
(REQ-FEAT-0004-10: `src/lap.ts` só corta por distância e duração); versão anterior intacta
(REQ-FEAT-0005-09: realizada pela decisão de não tocar `ARCADE_KART`, ADR-0001); conjunto de
`race-lap-validation` aprovado (REQ-FEAT-0006-07: nenhum módulo daquela feature é alterado).
