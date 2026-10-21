---
id: ADR-0001
title: Tempo da volta em aritmética inteira e arredondamento da interpolação
feature: race-lap-validation
stage: dspec
status: validated
version: 1.0.0
sources: [FEAT-0001, FEAT-0002, FEAT-0003, REQ-FEAT-0001-01, REQ-FEAT-0001-05, REQ-FEAT-0002-07, REQ-FEAT-0002-08, REQ-FEAT-0003-11]
---

# ADR-0001 — Tempo da volta em aritmética inteira e arredondamento da interpolação

## Contexto

O F-Spec (RULE-0003) exige tempos em milissegundos inteiros, soma dos setores igual ao total com diferença de 0 ms,
cruzamento interno ao passo estritamente entre `k × STEP` e `(k + 1) × STEP`, e o mesmo resultado em todo motor de
JavaScript, em 30 e 60 quadros e com ou sem pausa. Deixou ao D-Spec o método de interpolação e a conversão para ms
inteiros. `STEP` vale 1/120 s, isto é, 25/3 ms, que não é inteiro; o campo `elapsed` do `State` da física acumula
`dt` em ponto flutuante e não é exato. Esta decisão é cara de reverter: ela define o que um tempo de volta significa
e, portanto, o que uma repetição (replay) e uma validação de servidor futuras terão de reproduzir (D-DS-05).

## Decisão

1. O tempo da volta é uma **contagem de passos** inteira (`stepCount`, `countdownSteps`), e não um acúmulo de `dt`.
2. A conversão de passos para ms inteiros é `toMs(n) = floor((25n + 1) / 3)`, o inteiro mais próximo de `n × 25/3`,
   em aritmética inteira exata. A contagem regressiva tem 360 passos e `toMs(360) = 3000`.
3. O instante de um cruzamento entre os passos `k` e `k + 1`, na fração `f` do passo, é
   `clamp(round((k + f) × 25/3), toMs(k) + 1, toMs(k + 1) - 1)`; com `f = 1` (coincide com o passo) é `toMs(k + 1)`.
4. Todas as fronteiras `b1` a `b4` são inteiras; tempos de setor são diferenças e o total é `b4`.
5. O limite de corte é comparado em passos: `25 × passos > 3 × cutDurationMs`.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Acumular `dt` em segundos (`elapsed`) e arredondar ao exibir | a soma de 8,333 ms em ponto flutuante deriva e o resultado depende da ordem das operações; o setor 4 menos a soma dos anteriores não fecha em 0 ms por garantia |
| Passo de 8 ms ou 10 ms para ter ms inteiros | muda `STEP`, o que o NFR-0010 proíbe e quebraria toda repetição armazenada (I8) |
| Arredondar o instante interpolado com `Math.floor` ou `Math.round` sem limitador | pode cair em `toMs(k)` ou `toMs(k + 1)` e violar a desigualdade estrita que AC-US-0002-07 e -08 exigem |
| Tempo em microssegundos ou em fração | contraria o F-Spec (ms inteiros) e não resolve a conversão |

## Consequências

- Soma dos setores igual ao total com diferença de 0 ms por construção (telescópica).
- `elapsedMs` após N passos do sinal verde vale `toMs(N)`, o inteiro de ms de N × `STEP` (AC-US-0001-05).
- Dois cruzamentos num mesmo passo preservam a ordem (as duas operações são monótonas).
- O valor de uma volta depende só da sequência de passos e de `Input` (e dos comandos entre passos): é independente
  de quadros, de pausa e do relógio.
- **Risco aceito e medido.** O caminho do tempo usa apenas operações definidas de modo idêntico em todo motor, mas a
  física usa `sin`, `cos`, `tanh`, `exp`, `pow`, `atan2` e `hypot`, cujos resultados a especificação de JavaScript
  permite diferir na última casa entre motores. O arredondamento a ms absorve essas diferenças, exceto num cruzamento
  que caia a cerca de 1e-12 ms de um meio milissegundo. A evidência para NFR-0008 é o teste registrado em Chrome,
  Edge, Firefox e Safari (docs/lap-validation-device-log.md); `npm test` roda só em Node. Qualquer diferença
  registrada é defeito (REQ-FEAT-0003-11) e vira realimentação para esta decisão, não motivo para relaxar o requisito.

## Status

Proposta aceita neste conjunto (aprovação do dono do produto pendente no momento da validação do D-Spec).
