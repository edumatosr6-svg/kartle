---
id: RULE-0004
title: Retorno da zebra — vibração e som
feature: pista-kart-park
stage: fspec
status: validated
version: 1.0.0
sources: [US-0005, AC-US-0005-07, AC-US-0005-08, AC-US-0005-09, AC-US-0005-10, AC-US-0005-11, AC-US-0005-12]
---

# RULE-0004 — Retorno da zebra: vibração e som

Decide quando a apresentação começa um pulso de vibração ou uma repetição do som da zebra. A entrada é o
estado da simulação lido em [API-0003](../api/API-0003-contato-do-kart-com-a-pista.md) (`simStepCount`,
`curbWheelCount`); a regra de pista e a aderência não dependem do retorno, e o retorno nunca volta para a
simulação (I2). Fontes: `DOMAIN/DEC-05` (20 ms a cada 0,25 s no celular; no teclado, só o som) e
`DOMAIN/DEC-11` (ruído curto e grave que se repete, com o som ligado).

## Constantes

| Constante | Valor | Fonte |
|---|---|---|
| Duração do pulso de vibração | 20 ms | AC-US-0005-07; `DOMAIN/DEC-05` |
| Intervalo mínimo entre inícios de pulso | 250 ms de tempo simulado | AC-US-0005-07; `DOMAIN/DEC-05` |
| Intervalo de repetição do som | Constante fixada no D-Spec, em tempo simulado; maior que 0 | AC-US-0005-09; `DOMAIN/DEC-11` (o valor não é dado pelos requisitos) |

O tempo simulado é o número de passos de `STEP` vezes `STEP`. Um intervalo "nos 250 ms anteriores" conta
os passos desde o passo em que o último pulso começou.

## Tabela de decisão — por passo novo (`simStepCount` ainda não tratado)

| Canal | Condição do canal | `curbWheelCount` | Último início | Efeito no passo | Fonte |
|---|---|---|---|---|---|
| `web-mobile` | Navegador permite vibração | maior que 0 | Nenhum pulso começou, ou o último começou há 250 ms ou mais | Começa um pulso de 20 ms; registra o passo | AC-US-0005-07 |
| `web-mobile` | Navegador permite vibração | maior que 0 | O último pulso começou há menos de 250 ms | Nenhum pulso novo | AC-US-0005-07 |
| `web-mobile` | qualquer | 0 | qualquer | Nenhum pulso novo; um pulso já começado termina os seus 20 ms | AC-US-0005-08 |
| `web-mobile` | Navegador sem vibração ou que a bloqueia | qualquer | qualquer | Nenhum pulso; nenhum aviso; nada mais muda | US-0005, caso anormal |
| `web-desktop` | Som ligado | maior que 0 | Nenhuma repetição começou, ou a última começou há um intervalo de repetição ou mais | Começa uma repetição do som da zebra; registra o passo | AC-US-0005-09 |
| `web-desktop` | Som ligado | maior que 0 | A última repetição começou há menos de um intervalo de repetição | Nenhuma repetição nova | AC-US-0005-09 |
| `web-desktop` | qualquer | 0 | qualquer | Nenhuma repetição nova | AC-US-0005-10 |
| `web-desktop` | Som desligado | qualquer | qualquer | Nenhum som da zebra | AC-US-0005-11 |
| `web-desktop` | qualquer | qualquer | qualquer | Nenhum pulso de vibração | US-0005, Canais; `DOMAIN/DEC-05` |
| `web-mobile` | Som ligado | qualquer | qualquer | O som da zebra é permitido pelas linhas de `web-desktop` acima, e não exigido | US-0005, Canais |

## Som da zebra

| Regra | Fonte |
|---|---|
| O som da zebra é um ruído curto e grave próprio dela | `DOMAIN/DEC-11` |
| O sinal do som da zebra é diferente do sinal de todo outro som do jogo, e nenhum outro evento usa o som da zebra | AC-US-0005-12 |

## Idempotência e ordem

Cada `simStepCount` é tratado uma vez: reler o mesmo passo não começa outro pulso nem outra repetição
(deduplicação na apresentação, por `simStepCount`). Os passos são tratados em ordem crescente de
`simStepCount`, mesmo quando vários avançam num quadro. Com a simulação suspensa (pausa, perda de foco,
perda do sensor), nenhum passo novo existe e nenhum pulso ou repetição começa. O estado guardado é só o
passo do último início de pulso e o do último início de repetição; uma sessão nova
([RULE-0003](RULE-0003-sessao-de-treino-e-selecao-de-pista.md)) começa sem início registrado.
