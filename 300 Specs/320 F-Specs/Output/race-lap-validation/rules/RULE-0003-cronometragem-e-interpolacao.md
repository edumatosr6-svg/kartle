---
id: RULE-0003
title: Cronometragem, interpolação e formato do tempo
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: [US-0001, US-0002, US-0003, AC-US-0001-05, AC-US-0002-04, AC-US-0002-05, AC-US-0002-06, AC-US-0002-07, AC-US-0002-08, AC-US-0002-10, AC-US-0003-03, NFR-0001, NFR-0002, NFR-0008]
---

# RULE-0003 — Cronometragem, interpolação e formato do tempo

Como o tempo da volta nasce da simulação, como o instante de um cruzamento é obtido dentro de um passo e
como o tempo é exibido. Fontes: `DOMAIN/DEC-03`, `DOMAIN/DEC-05`, I8.

## Linha do tempo

| Instante | Valor | Fonte |
|---|---|---|
| Início da contagem | `countdownRemainingMs` = 3000 | AC-US-0001-01; `DOMAIN/DEC-05` |
| Sinal verde | Fim da contagem; tempo da volta = 0 | `DOMAIN/DEC-05` |
| Passo j do sinal verde | Tempo da volta = j × `STEP` | AC-US-0001-05 |
| Cruzamento da linha de largada | Não inicia nem altera o cronômetro | `DOMAIN/DEC-05` |
| Fim do setor i | Instante de cruzamento do limite de setor i; o setor 4 termina no cruzamento da chegada | AC-US-0002-10 |
| Fim da volta | Instante de cruzamento da chegada no sentido da pista (volta válida) | AC-US-0002-01 |

O tempo é função da sequência de passos da simulação e nunca do relógio de parede, da taxa de quadros nem de
uma pausa (I8; AC-US-0003-03, AC-US-0003-10). Pausa não acrescenta nem retira passos (RULE-0002).

## Instante de cruzamento

| Caso | Instante | Fonte |
|---|---|---|
| A linha é cruzada entre o passo k e o passo k + 1 e não coincide com nenhum | O instante é interpolado dentro do passo e é estritamente maior que k × `STEP` e estritamente menor que (k + 1) × `STEP` | AC-US-0002-07, AC-US-0002-08 |
| O cruzamento coincide exatamente com um passo | O instante é o desse passo, k × `STEP` | US-0002, caso anormal |
| Mais de uma linha cruzada no mesmo passo | Cada instante é interpolado separadamente; a ordem das linhas é a de [RULE-0001](RULE-0001-validade-da-volta.md) e dos setores | AC-US-0002-10 |

O método de interpolação e a conversão do instante para milissegundos inteiros são decisão do D-Spec. A
restrição que o F-Spec impõe a esse método: o resultado em ms inteiros fica estritamente dentro do intervalo
do passo quando o cruzamento é interno ao passo, é o mesmo em todo runtime nomeado (NFR-0008, diferença de
0 ms) e é o mesmo para as mesmas entradas (NFR-0001).

## Tempos de setor e soma

| Grandeza | Definição | Fonte |
|---|---|---|
| Instante de fronteira `b0` | 0 (sinal verde) | `DOMAIN/DEC-05` |
| Instantes `b1`, `b2`, `b3` | Instantes de cruzamento dos três limites de setor, em ms inteiros | AC-US-0002-08 |
| Instante `b4` | Instante de cruzamento da chegada, em ms inteiros | AC-US-0002-07 |
| Tempo do setor i | `bi` menos `b(i-1)`, em ms inteiros | AC-US-0002-10 |
| Tempo total | `b4`, em ms inteiros | AC-US-0002-04 |

Como cada tempo de setor é a diferença entre fronteiras consecutivas, a soma dos quatro tempos de setor é
igual ao tempo total, com diferença de 0 ms (AC-US-0002-05). O tempo total e os tempos de setor são
expressos em milissegundos inteiros no resultado (AC-US-0002-04).

## Formato de exibição

| Valor em ms | Exibição `m:ss.mmm` | Observação |
|---|---|---|
| 62345 | `1:02.345` | Exemplo de `DOMAIN/DEC-03` |
| 0 | `0:00.000` | Cronômetro na contagem |
| 59999 | `0:59.999` | Segundos de 00 a 59 |
| 3723004 | `62:03.004` | Minutos sem limite superior; milissegundos sempre com 3 dígitos |

Minutos sem zeros à esquerda, segundos com 2 dígitos, milissegundos com 3 dígitos. A exibição converte o
inteiro em ms sem arredondar. A igualdade entre execuções é verificada no resultado em ms, não no texto
(US-0003, caso anormal).

## Idempotência e ordem

Os instantes de fronteira são produzidos uma única vez por volta, cada um no `stepCount` em que a linha é
cruzada; cruzar de novo uma linha já contada não altera nenhum instante (I7).
