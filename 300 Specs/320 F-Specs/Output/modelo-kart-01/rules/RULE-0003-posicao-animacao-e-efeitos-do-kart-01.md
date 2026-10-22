---
id: RULE-0003
title: Posição, animação e ancoragem dos efeitos do Kart 01
feature: modelo-kart-01
stage: fspec
status: draft
version: 1.0.0
sources: [US-0002, US-0005, NFR-0007, AC-US-0002-01, AC-US-0002-02, AC-US-0002-03, AC-US-0002-04, AC-US-0002-05, AC-US-0002-06, AC-US-0005-01, AC-US-0005-02, AC-US-0005-03]
---

# RULE-0003 — Posição, animação e ancoragem dos efeitos do Kart 01

Decide onde o Kart 01 exibido fica em relação ao estado da simulação, como as rodas, o volante e os braços se
movem, e onde cada efeito sai do kart. Fontes: US-0002 (`SEED/US-2`, `SEED/RD-01`), US-0005 (`SEED/US-5`,
`SEED/RE-03`), NFR-0007 e a decisão do dono do produto de não alinhar as medidas da física às do modelo
(`DOMAIN/DEC-02`). A apresentação só mostra o estado que a simulação informa
([API-0001](../api/API-0001-estado-do-kart-para-exibicao.md)) e não decide nada (I2).

## Posição do kart exibido

| Elemento | Regra | Fonte |
|---|---|---|
| Ponto de referência do kart exibido | Na linha central longitudinal do modelo, no chão, entre o eixo traseiro e o dianteiro do modelo, na mesma fração do entre-eixos em que a posição da simulação fica entre as posições traseiras e dianteiras de `wheelPositions` | AC-US-0002-05; US-0005, caso anormal "Diferença conhecida entre as rodas da simulação e as do modelo" |
| Posição | O ponto de referência fica em (`xM`, `zM`) do quadro | AC-US-0002-05 |
| Altura | A base das quatro rodas exibidas toca o chão, plano e sem elevação (I10) | AC-US-0002-05 |
| Orientação | O eixo do para-choque traseiro para o nariz aponta em `headingRad` do quadro | AC-US-0002-06 |
| Estado mostrado | O do último passo de `STEP` concluído antes do quadro; nunca interpolado nem estimado entre passos | US-0002, caso anormal "Vários passos de simulação num mesmo quadro, ou quadro sem passo novo" |

Com esse ponto de referência, a diferença entre as rodas exibidas e as de `wheelPositions` é só a das
medidas, que esta feature não alinha (`DOMAIN/DEC-02`): cada posição traseira de `wheelPositions` fica
0,03 m para fora do centro da roda traseira exibida (bitola de 1,20 m na simulação contra 1,14 m no modelo),
e ao longo do rumo a diferença é de no máximo 0,01 m (entre-eixos de 1,04 m contra 1,05 m).

## Rodas, volante e braços

| Elemento | Regra | Fonte |
|---|---|---|
| Esterço das rodas dianteiras | Cada roda dianteira exibida girada em relação ao chassi, em torno do seu eixo vertical, por `steerAngleRad` do quadro | AC-US-0002-01 |
| Giro das quatro rodas | Entre dois quadros, cada roda gira em torno do seu eixo `rollingSpeedMps` ÷ (π × diâmetro) × tempo simulado entre os quadros (diferença de `simStepCount` × `STEP`), em rotações, no sentido do movimento; diâmetro de 0,26 m na frente e 0,28 m atrás; 0 a 0 m/s | AC-US-0002-02 |
| Volante | Ângulo com o mesmo sinal de `steerAngleRad`, nulo com esterço 0, módulo estritamente crescente com o módulo do esterço; a razão entre os dois não é fixada | AC-US-0002-03 |
| Braços do piloto | As duas mãos sobre o aro do volante em qualquer ângulo do volante | AC-US-0002-04 |
| Animação depois do agrupamento | Rodas, volante e braços giram um a um, cada um com a sua rotação | US-0002, Pré-condições (`DOMAIN/DEC-01`) |

## Tabela de decisão — giro das rodas

| Situação | `rollingSpeedMps` | Tempo simulado entre os quadros | Giro exibido | Fonte |
|---|---|---|---|---|
| Em movimento para a frente | maior que 0 | maior que 0 | para a frente, à taxa de rolamento | AC-US-0002-02 |
| Kart parado | 0 | qualquer | nenhum | AC-US-0002-02 |
| Simulação suspensa (pausa, perda de foco, perda do sensor) | qualquer | 0 | nenhum | US-0002, caso anormal "Pausa" |
| Marcha à ré, se a simulação informar | menor que 0 | maior que 0 | para trás, à taxa de rolamento | US-0002, caso anormal "Marcha à ré" |
| Derrapagem, travamento ou patinação | velocidade do kart em módulo, com o sinal do movimento | maior que 0 | à taxa de rolamento na velocidade do kart, sem escorregamento por roda | US-0002, caso anormal "Derrapagem, travamento ou patinação das rodas" |

## Ancoragem dos efeitos

| Efeito | Onde aparece | Quando | Fonte |
|---|---|---|---|
| Marcas de pneu | Cada trecho novo, no chão, na posição traseira de `wheelPositions` do lado correspondente, levada pela posição e pelo rumo do kart; aparece sob o pneu traseiro exibido do mesmo lado | Nas situações em que o jogo já desenha marcas | AC-US-0005-01; NFR-0007 (`SEED/RE-03`) |
| Fumaça do escapamento | Saindo do escapamento do Kart 01 exibido | Nas situações em que o jogo já exibe a fumaça | AC-US-0005-02 |
| Indicação de drift | Junto às rodas traseiras do Kart 01 exibido | Nas situações em que o jogo já exibe a indicação | AC-US-0005-03 |

Esta regra muda onde cada efeito aparece, não quando: nenhuma situação é acrescentada nem retirada (US-0005,
Pré-condições). As marcas continuam vindo de `wheelPositions`, nunca das rodas do modelo; se a diferença de
0,03 m puser uma marca fora do pneu exibido, o critério 01 de US-0005 falha e a decisão volta ao dono do
produto, sem mudar `wheelPositions` nem as medidas do modelo nesta feature (`DOMAIN/DEC-02`).

## Estado e repetição

| Estado de exibição | Avança quando | Idempotência e contador |
|---|---|---|
| Giro acumulado de cada roda | `simStepCount` avança | Contador de sequência: `simStepCount`; o mesmo passo nunca é aplicado duas vezes; quadro sem passo novo não gira |
| Trechos de marca já desenhados | Um trecho novo por avanço de `simStepCount` em que o jogo desenha marcas | Contador: `simStepCount`; o mesmo passo não desenha um segundo trecho; um reposicionamento não move os trechos já desenhados |
| Fumaça e indicação de drift | Seguem o kart a cada quadro | Leitura idempotente da pose do quadro |
