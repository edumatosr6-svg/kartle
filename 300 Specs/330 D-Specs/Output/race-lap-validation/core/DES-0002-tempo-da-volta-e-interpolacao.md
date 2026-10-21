---
id: DES-0002
title: Tempo da volta em passos e interpolação do cruzamento
feature: race-lap-validation
stage: dspec
status: validated
version: 1.0.0
sources: [FEAT-0001, FEAT-0002, FEAT-0003, REQ-FEAT-0001-01, REQ-FEAT-0001-05, REQ-FEAT-0001-08, REQ-FEAT-0002-04, REQ-FEAT-0002-05, REQ-FEAT-0002-07, REQ-FEAT-0002-08, REQ-FEAT-0003-01, REQ-FEAT-0003-02, REQ-FEAT-0003-11]
---

# DES-0002 — Tempo da volta em passos e interpolação do cruzamento

## Realiza

Os `REQ-*` em `sources`: contagem de 3000 ms de simulação, tempo da volta igual a N × `STEP` após N passos do
sinal verde, sem penalidade (AC-US-0001-01, -05, -08); tempo total e tempos de setor em milissegundos inteiros
cuja soma é o total, com diferença de 0 ms (AC-US-0002-04, -05); instante de cruzamento estritamente dentro do
passo e igual ao passo quando coincide (AC-US-0002-07, -08); mesmo tempo em duas execuções, em 30 fps e 60 fps,
com e sem pausa e entre navegadores (AC-US-0003-01 a -04, -10; NFR-0001, NFR-0008). Decisão: [ADR-0001](../adr/ADR-0001-tempo-inteiro-em-ms-e-interpolacao.md).

## Posicionamento

Módulo novo `src/lapTiming.ts`, camada **simulação**, funções puras sobre números inteiros e uma fração. Motivo
de ser novo: a aritmética do tempo é usada pela máquina de estados e pelos testes e precisa ser provada
isoladamente; `src/physics.ts` não é alterado.

## Interface

`STEP` vale 1/120 s, de modo que um passo dura 25/3 ms, número que não é inteiro em ms. Por isso o tempo da volta
é carregado como contagem de passos e convertido para ms inteiros por funções exatas, sem acumular `dt` em ponto
flutuante (o campo `elapsed` do `State` da física não é usado como cronômetro da volta).

| Símbolo | Tipo e unidade | Definição |
|---|---|---|
| `COUNTDOWN_STEPS` | inteiro, passos | 360 (3000 ms ÷ 25/3 ms) |
| `COUNTDOWN_MS` | inteiro, ms | 3000 |
| `toMs(steps)` | `(inteiro >= 0) => inteiro, ms` | `Math.floor((25 * steps + 1) / 3)`: o inteiro de ms mais próximo de `steps × 25/3`; para `steps` = 360 devolve exatamente 3000 |
| `interpolateMs(k, fraction)` | `(inteiro >= 0, número em (0, 1]) => inteiro, ms` | ver abaixo |
| `isCutExceeded(offSteps, durationMs)` | `(inteiro >= 0, inteiro > 0) => booleano` | `25 * offSteps > 3 * durationMs`, aritmética inteira exata (usada por [DES-0004](DES-0004-corte-e-grama.md)) |

`interpolateMs(k, fraction)`: o deslocamento do passo `k` ao passo `k + 1` cruzou a linha na fração `fraction` do
passo. Se `fraction` for 1, o cruzamento coincide com o passo `k + 1` e o resultado é `toMs(k + 1)`. Caso
contrário, com `lo = toMs(k) + 1` e `hi = toMs(k + 1) - 1` (sempre `lo <= hi`, pois o passo tem mais de 8 ms),
o resultado é `Math.round((k + fraction) * 25 / 3)` limitado ao intervalo `[lo, hi]`. Assim o valor inteiro fica
estritamente entre `toMs(k)` e `toMs(k + 1)`, e portanto estritamente entre `k × STEP` e `(k + 1) × STEP`
(REQ-FEAT-0002-07 e -08). Como `Math.round` e o limitador são monótonos, dois cruzamentos no mesmo passo mantêm a
ordem dos instantes. O instante "no passo" de uma volta que coincide com o passo `k` é `toMs(k)`.

Tempos da volta: fronteiras `b0` = 0, `b1`, `b2`, `b3` (limites de setor) e `b4` (chegada), todas inteiras em ms,
vindas de `interpolateMs` ou de `toMs`. O tempo do setor `i` é `bi - b(i-1)` e o tempo total é `b4`, de modo que a
soma dos quatro setores é igual ao total com diferença de 0 ms por construção (REQ-FEAT-0002-05).

Derivados expostos por `getLapState`: `countdownRemainingMs = 3000 - toMs(countdownSteps)` (de 3000 a 0) e
`elapsedMs = toMs(stepCount)` (0 durante a contagem). Depois de uma volta válida `elapsedMs` passa a valer
`lapMs`, para que o cronômetro final e o resultado coincidam.

## Colaboradores

Chamado só por `src/lap.ts`, por `src/lapMessages.ts` (que formata o inteiro de ms) e pelos testes. Importa
`STEP` de `src/physics.ts` apenas para que o teste afirme `1 / STEP === 120`; nenhuma outra dependência.

## Estado e concorrência

Sem estado: funções puras. Os instantes de fronteira são produzidos uma única vez por volta, no `stepCount` em
que a linha é cruzada (DES-0003 decide quando); cruzar de novo uma linha já contada não os recalcula.

## Comportamento em falha

Entradas fora do domínio (`steps` negativo ou não inteiro, `fraction` fora de (0, 1]) não ocorrem por
construção: `steps` é contador inteiro e a fração vem de `crossLine`. Defesa: `toMs` e `interpolateMs` usam
`Math.max(0, Math.trunc(...))` nos argumentos inteiros, sem lançar, e `fraction` é limitada a (0, 1] pela própria
`crossLine`. Nada é registrado.

## Determinismo (D-DS-07)

Passo fixo `STEP`, nenhum relógio, nenhum sorteio. As operações de ponto flutuante do caminho do tempo são só
soma, subtração, multiplicação, divisão e `Math.round`/`Math.floor`, definidas de modo idêntico em todo motor de
JavaScript; a conversão final é inteira. Provas em `tests/lap-timing.test.ts`: `toMs(360) === 3000`;
`toMs(k + 1) - toMs(k)` vale 8 ou 9; para `k` de 0 a 2000 e frações de 0,001 a 1 em passos de 0,001,
`toMs(k) < interpolateMs(k, f) <= toMs(k + 1)` e estritamente menor quando `f < 1`; soma dos setores igual ao
total em voltas sintéticas; repetir é igual. Reserva honesta sobre NFR-0008: as funções de `Math` usadas pela
física (`sin`, `cos`, `tanh`, `exp`, `pow`, `atan2`, `hypot`) podem diferir na última casa entre motores. O
arredondamento a ms absorve diferenças desse tamanho, salvo num instante que caia a menos de cerca de 1e-12 ms de
um meio milissegundo; a evidência é o teste registrado nos quatro navegadores (test-strategy), e qualquer
diferença registrada é defeito, conforme REQ-FEAT-0003-11.

## Feature flag

Nenhuma: FEAT-0002 e FEAT-0003 não têm chave, e a unidade (ms inteiros) é fixa (`DEC-03`).

## Pontos em aberto

Nenhum.
