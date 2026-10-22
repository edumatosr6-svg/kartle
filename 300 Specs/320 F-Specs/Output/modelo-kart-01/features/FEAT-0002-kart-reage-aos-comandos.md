---
id: FEAT-0002
title: Kart reage aos comandos — rodas, volante, braços, posição e rumo
feature: modelo-kart-01
stage: fspec
status: draft
version: 1.0.0
sources: [US-0002, AC-US-0002-01, AC-US-0002-02, AC-US-0002-03, AC-US-0002-04, AC-US-0002-05, AC-US-0002-06]
---

# FEAT-0002 — Kart reage aos comandos

## Resumo

O Kart 01 exibido mostra, em cada quadro, o estado que a simulação informa: as rodas dianteiras esterçam
pelo ângulo de esterço, as quatro rodas giram à taxa de rolamento, o volante gira com o esterço e as mãos do
piloto ficam no aro, e o kart está na posição e no rumo da simulação. A renderização não estima nem decide
estado (I2).

## Canais

`web-desktop` e `web-mobile`: os requisitos valem igualmente, porque são expressos sobre o que a simulação
informa, qualquer que seja o adaptador que produziu o `Input`. Em `web-mobile` com sensor ausente ou
permissão negada, o controle recai para toque com estado visível (I4), e o modelo continua mostrando o
esterço e a velocidade que a simulação informa a partir do toque. O giro das rodas é verificado na saída de
`npm test`; os demais requisitos, na tela e no estado da simulação
([API-0001](../api/API-0001-estado-do-kart-para-exibicao.md)).

## Requisitos

- REQ-FEAT-0002-01: O sistema SHALL exibir, em corrida e em cada quadro, cada roda dianteira do Kart 01
  girada em relação ao chassi, em torno do seu eixo vertical, pelo ângulo de esterço `steerAngleRad` que a
  simulação informa para esse quadro (AC-US-0002-01).
- REQ-FEAT-0002-02: O sistema SHALL girar cada uma das quatro rodas exibidas em torno do seu eixo, entre dois
  quadros, pela taxa de rolamento — `rollingSpeedMps` dividida por π vezes o diâmetro da roda (0,26 m na
  frente, 0,28 m atrás) — vezes o tempo simulado entre os dois quadros (diferença de `simStepCount` vezes
  `STEP`), no sentido do movimento, com giro de 0 rotações a 0 m/s, reportado no registro `WHEEL_SPIN` da
  saída de `npm test` depois de um número conhecido de passos com velocidade conhecida e constante
  (AC-US-0002-02).
- REQ-FEAT-0002-03: O sistema SHALL girar o volante exibido, em corrida e em cada quadro, por um ângulo com o
  mesmo sinal do ângulo de esterço informado para esse quadro, nulo com esterço 0 e de módulo estritamente
  crescente com o módulo do esterço (AC-US-0002-03).
- REQ-FEAT-0002-04: O sistema SHALL manter as duas mãos do piloto exibido sobre o aro do volante exibido em
  qualquer ângulo do volante, em corrida e em cada quadro (AC-US-0002-04).
- REQ-FEAT-0002-05: O sistema SHALL exibir o Kart 01, em corrida e em cada quadro, com o seu ponto de
  referência na posição (`xM`, `zM`) que a simulação informa para esse quadro e a base das quatro rodas no
  chão (AC-US-0002-05).
- REQ-FEAT-0002-06: O sistema SHALL exibir o Kart 01, em corrida e em cada quadro, com o eixo longitudinal,
  do para-choque traseiro para o nariz, apontando no rumo `headingRad` que a simulação informa para esse
  quadro (AC-US-0002-06).
- REQ-FEAT-0002-07: O sistema SHALL exibir em cada quadro o estado do último passo de `STEP` concluído antes
  do quadro, sem interpolar nem estimar estado entre passos: com vários passos num mesmo quadro, o do
  último; num quadro sem passo novo, o mesmo estado do quadro anterior [DOMAIN] (I2; US-0002, caso anormal
  "Vários passos de simulação num mesmo quadro, ou quadro sem passo novo").
- REQ-FEAT-0002-08: O sistema SHALL manter, enquanto a simulação está suspensa, o kart exibido na última
  posição, rumo e esterço informados, sem girar as rodas [DOMAIN] (US-0002, caso anormal "Pausa").
- REQ-FEAT-0002-09: O sistema SHALL exibir o kart, no primeiro quadro depois de um reposicionamento, na nova
  posição e no novo rumo que a simulação informa, sem nenhum quadro numa posição intermediária que a
  simulação não informou [DOMAIN] (US-0002, caso anormal "Reposicionamento do kart").
- REQ-FEAT-0002-10: O sistema SHALL manter as quatro rodas, o volante e os dois braços do piloto animáveis um
  a um depois do agrupamento por material, cada um com a sua rotação própria em cada quadro (AC-US-0002-01,
  AC-US-0002-02, AC-US-0002-03, AC-US-0002-04; US-0002, Pré-condições).

## Comportamento

Quadro de exibição: [FLOW-0001](../flows/FLOW-0001-quadro-de-exibicao-em-corrida.md). Posição, esterço,
giro, volante e braços: [RULE-0003](../rules/RULE-0003-posicao-animacao-e-efeitos-do-kart-01.md). Leitura
do estado: [API-0001](../api/API-0001-estado-do-kart-para-exibicao.md). Verificação do giro:
[FLOW-0003](../flows/FLOW-0003-verificacao-do-modelo-montado.md),
[API-0002](../api/API-0002-relatorio-do-modelo-montado.md) (`WHEEL_SPIN`).

| Situação | Comportamento |
|---|---|
| Esterço 0 | Rodas dianteiras alinhadas ao chassi; volante centrado |
| Esterço para um lado, maior em módulo | Rodas dianteiras e volante giram para o mesmo lado; o volante gira mais |
| Pausa, perda de foco ou perda do sensor | A simulação não avança; kart parado na última posição, rumo e esterço; rodas sem giro, porque o tempo simulado entre os quadros é 0 |
| Reposicionamento do kart | No primeiro quadro depois dele, nova posição e novo rumo; nenhum quadro intermediário |
| Derrapagem, travamento ou patinação das rodas | As rodas exibidas giram à taxa de rolamento na velocidade do kart em módulo; não há giro por roda com escorregamento |
| Marcha à ré, se a simulação informar velocidade de ré | `rollingSpeedMps` negativa: as rodas giram para trás; o nariz continua apontando no rumo |
| Esterço fora da faixa no `Input` | A simulação o limita à faixa normalizada (I4); o modelo mostra o ângulo de esterço que a simulação informa, nunca o valor bruto do adaptador |
| Vários passos num mesmo quadro, ou quadro sem passo novo | O estado do último passo concluído; o giro acumula o tempo simulado de todos os passos entre os dois quadros |
| Taxa de quadros baixa | O giro depende só do tempo simulado e da velocidade, não do número de quadros |
| Sensor ausente ou permissão negada (`web-mobile`) | Toque com estado visível (I4); os requisitos valem sobre o estado que a simulação informa a partir do toque |
| Rede indisponível | Sem efeito (D-FS-08) |

## Estado

Não define estados próprios. Lê, por quadro, `simStepCount`, `xM`, `zM`, `headingRad`, `steerAngleRad` e
`rollingSpeedMps` ([API-0001](../api/API-0001-estado-do-kart-para-exibicao.md)). O giro acumulado de cada
roda (`spinRevs`) é estado de exibição derivado: avança só quando `simStepCount` avança, na ordem de
`simStepCount`, e nunca volta a ser aplicado para o mesmo passo.

## Configuração

Nenhuma. A razão entre o ângulo do volante e o ângulo de esterço não é configuração exposta (lacuna
deliberada de `01-overview.md`). Nenhuma configuração existe para forçar um evento, injetar um estado ou
habilitar um caminho de depuração.

## Critérios de aceite

- Na tela e no estado da simulação, em corrida, cada roda dianteira exibida está girada pelo `steerAngleRad`
  do quadro (satisfaz AC-US-0002-01; cobre os requisitos 01 e 10).
- `WHEEL_SPIN`: para cada uma das quatro rodas, `spinRevs` igual a `expectedSpinRevs` (`rollingSpeedMps` ×
  `simulatedTimeMs` ÷ 1000 ÷ (π × `diameterM`)), no sentido do movimento, e 0 rotações a 0 m/s (satisfaz
  AC-US-0002-02; cobre os requisitos 02 e 10).
- Na tela, em corrida, o volante centrado com esterço 0, girado para o lado do esterço e mais girado com
  esterço maior em módulo (satisfaz AC-US-0002-03; cobre os requisitos 03 e 10).
- Na tela, em corrida, as duas mãos do piloto sobre o aro do volante em qualquer ângulo (satisfaz
  AC-US-0002-04; cobre os requisitos 04 e 10).
- Na tela e no estado da simulação, em corrida, o ponto de referência do kart exibido na posição `xM`, `zM`
  do quadro, com as rodas no chão; nos quadros sem passo novo, o mesmo estado; na pausa, kart parado e
  rodas sem giro; depois de um reposicionamento, nenhum quadro intermediário (satisfaz AC-US-0002-05; cobre
  os requisitos 05, 07, 08 e 09).
- Na tela e no estado da simulação, em corrida, o eixo do para-choque traseiro para o nariz no rumo
  `headingRad` do quadro (satisfaz AC-US-0002-06; cobre o requisito 06).

## Pontos em aberto

Nenhum.
