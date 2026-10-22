---
id: RULE-0001
title: Medidas, grupos de peça, cores e custo de desenho do Kart 01
feature: modelo-kart-01
stage: fspec
status: draft
version: 1.0.0
sources: [US-0001, NFR-0004, AC-US-0001-01, AC-US-0001-02, AC-US-0001-03, AC-US-0001-04, AC-US-0001-05, AC-US-0001-06, AC-US-0001-07, AC-US-0001-08, AC-US-0001-09, AC-US-0001-10, AC-US-0001-11, AC-US-0001-12, AC-US-0001-13, AC-US-0001-16]
---

# RULE-0001 — Medidas, grupos de peça, cores e custo de desenho do Kart 01

Decide o que o modelo montado do Kart 01 tem de medir, que grupos tem de ter, que cores tem de usar e quanto
pode custar para desenhar. Fontes: a ficha "Kart 01 — Kartle", decisão do dono do produto de 2026-10-22, via
US-0001 (`SEED/RD-04`); o código do Cowork como fonte do modelo (`SEED/RD-05`, `DOMAIN/DEC-00`); o
agrupamento por material (`DOMAIN/DEC-01`, via NFR-0004). Verificado sobre o modelo montado na saída de
`npm test` ([API-0002](../api/API-0002-relatorio-do-modelo-montado.md)); nada aqui é decidido pela
simulação nem a altera (I2).

## Medidas

| Medida | Valor | Tolerância ou precisão | Como se mede | Fonte |
|---|---|---|---|---|
| Comprimento da caixa envolvente do kart | 1,93 m | ± 0,02 m | Eixo longitudinal do kart; caixa dos 15 grupos de peças, sem o piloto | AC-US-0001-01 |
| Largura da caixa envolvente do kart | 1,45 m | ± 0,02 m | Eixo transversal do kart; mesma caixa | AC-US-0001-02 |
| Entre-eixos | 1,05 m | ± 0,02 m | Entre o centro das rodas dianteiras e o das traseiras, no eixo longitudinal | AC-US-0001-03 |
| Diâmetro de cada roda dianteira | 0,26 m | ao centímetro | Diâmetro externo da roda com o pneu | AC-US-0001-04 |
| Diâmetro de cada roda traseira | 0,28 m | ao centímetro | Idem | AC-US-0001-05 |
| Bitola dianteira | 1,00 m | ao centímetro | Entre os centros das duas rodas dianteiras, no eixo transversal | AC-US-0001-06 |
| Bitola traseira | 1,14 m | ao centímetro | Entre os centros das duas rodas traseiras | AC-US-0001-07 |

"Ao centímetro": o valor medido é arredondado ao centímetro e comparado ao valor da tabela. Nenhuma outra
tolerância é admitida; uma medida fora é corrigida no modelo, nunca na tabela (US-0001, caso anormal).

## Grupos nomeados

| Grupo | Exigência | Fonte |
|---|---|---|
| `chassi`, `eixoTraseiro`, `rodaDianteiraEsq`, `rodaDianteiraDir`, `rodaTraseiraEsq`, `rodaTraseiraDir`, `nariz`, `painelFrontal`, `sidepodEsq`, `sidepodDir`, `paraChoqueTraseiro`, `banco`, `direcao`, `pedais`, `motor` | Cada um presente, com geometria visível, depois do agrupamento por material | AC-US-0001-08 |
| `piloto` | Presente, com geometria visível, fora de todos os 15 grupos de peças; contém o piloto de macacão azul e capacete branco, com os braços que acompanham o volante | AC-US-0001-09 |

O agrupamento por material junta malhas de mesmo material sem mudar a forma, mas nunca esvazia um dos 16
grupos e nunca funde as rodas, o volante ou os braços com outra peça a ponto de não poderem girar um a um
(`DOMAIN/DEC-01`, via NFR-0004 e as pré-condições de US-0002).

## Cores

| Onde | Cor | Exigência | Fonte |
|---|---|---|---|
| Kart (15 grupos de peças) | Laranja Kartle `#FF6A13` | Entre as cores usadas pelo kart | AC-US-0001-10 |
| Grupo `chassi` | Grafite `#2B2E34` | Entre as cores do grupo | AC-US-0001-11 |
| Placa do para-choque | Branca `#F4F3EF` | Cor da placa | AC-US-0001-12 |
| Macacão do piloto, no grupo `piloto` | Azul `#2F55D4` | Cor do macacão | AC-US-0001-13 |
| Placa do para-choque | Número 01 | Visível na tela no kart exibido | AC-US-0001-16 |

Se o código do Cowork usar outra cor numa destas quatro, vale a da tabela, que é a da ficha, referência para
conferir (`SEED/RD-04`, `DOMAIN/DEC-00`, via US-0001, caso anormal "Cor do código do Cowork diferente da cor
da ficha"). As demais cores, o capacete inclusive, não são critério.

## Custo de desenho

| Medida | Limite | Contagem | Fonte |
|---|---|---|---|
| Chamadas de desenho do kart com o piloto | No máximo 30 | Uma por malha e por material de cada malha do modelo montado, como o seed contou as 124 do código do Cowork; a passagem de sombra não entra | NFR-0004 (`DOMAIN/DEC-01`) |
| Triângulos do kart com o piloto | Exatamente 5.128 | Triângulos do modelo montado, o mesmo número medido no código do Cowork | NFR-0004 ("sem mudar a forma") |

## Tabela de decisão — veredito dos registros de [API-0002](../api/API-0002-relatorio-do-modelo-montado.md)

| Registro | Condição | `verdict` | `checkFailReason` |
|---|---|---|---|
| `KART_DIMENSIONS` | as três medidas dentro de ± 0,02 m | `PASS` | — |
| `KART_DIMENSIONS` | alguma medida fora | `FAIL` | `OUT_OF_TOLERANCE` |
| `WHEELS_AND_TRACKS` | os quatro diâmetros e as duas bitolas iguais ao centímetro | `PASS` | — |
| `WHEELS_AND_TRACKS` | algum valor diferente ao centímetro | `FAIL` | `OUT_OF_TOLERANCE` |
| `PART_GROUPS` | os 16 grupos presentes com geometria visível e `piloto` fora dos 15 | `PASS` | — |
| `PART_GROUPS` | algum grupo ausente ou sem geometria visível | `FAIL` | `GROUP_MISSING` |
| `PART_GROUPS` | `piloto` dentro de um dos 15 grupos | `FAIL` | `GROUP_NESTED` |
| `PART_COLORS` | as quatro cores da tabela presentes onde exigido | `PASS` | — |
| `PART_COLORS` | alguma cor ausente ou diferente | `FAIL` | `COLOR_MISMATCH` |
| `DRAW_COST` | no máximo 30 chamadas e 5.128 triângulos | `PASS` | — |
| `DRAW_COST` | mais de 30 chamadas | `FAIL` | `LIMIT_EXCEEDED` |
| `DRAW_COST` | triângulos diferentes de 5.128 | `FAIL` | `SHAPE_CHANGED` |

Mais de uma condição de `FAIL` no mesmo registro: o registro reporta a primeira na ordem da tabela, e os
campos medidos mostram as demais.

## Estado

A regra não tem estado: o modelo montado é o mesmo em toda a sessão, em todos os canais e nas duas formas da
área de jogo, e a verificação é uma leitura idempotente do modelo, sem contador de sequência.
