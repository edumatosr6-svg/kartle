---
id: US-0002
title: Kart reage aos comandos
feature: modelo-kart-01
stage: req
status: validated
version: 1.1.0
sources: [SEED/US-2, SEED/RD-01, SEED/IM-I2, DOMAIN/DEC-01]
---

# US-0002 — Kart reage aos comandos

## História

Como Jogador, quero que o kart reaja ao que faço, para ver o efeito dos meus comandos.

## Canais

- `web-desktop` e `web-mobile`: o modelo mostra o estado que a simulação informa (ângulo de esterço,
  velocidade, posição e rumo), qualquer que seja o adaptador que produziu o `Input`. Os critérios valem
  igualmente para os dois canais, porque são expressos sobre o que a simulação informa (`SEED/RD-01`, I2).
- `web-mobile` com sensor ausente ou permissão negada: o controle recai para toque com estado visível (I4);
  o modelo continua mostrando o esterço e a velocidade que a simulação informa a partir do toque.

## Pré-condições

- Kart 01 em cena (US-0001), em corrida.
- Rodas, volante e braços do piloto animáveis depois do agrupamento por material (`DOMAIN/DEC-01`).

## Critérios de aceite

- AC-US-0002-01: Em corrida, em cada quadro, cada roda dianteira exibida está girada em relação ao chassi,
  em torno do seu eixo vertical, pelo ângulo de esterço que a simulação informa para esse quadro, observado
  na tela e no estado da simulação (`SEED/US-2`, primeiro critério).
- AC-US-0002-02: A saída de `npm test` reporta, para cada uma das quatro rodas do modelo montado, o giro em
  torno do seu eixo depois de um número conhecido de passos `STEP` da simulação com uma velocidade do kart
  conhecida e constante (I9), e esse giro, em rotações, é igual à taxa de rolamento — velocidade em m/s
  dividida por π vezes o diâmetro da roda em m (0,26 m na frente, 0,28 m atrás) — vezes o tempo simulado em
  s (número de passos vezes `STEP`), no sentido do movimento; com velocidade de 0 m/s, o giro reportado é
  de 0 rotações (`SEED/US-2`, segundo critério).
- AC-US-0002-03: Em corrida, em cada quadro, o volante exibido gira com o esterço informado pela
  simulação: fica centrado com esterço 0, gira para o mesmo lado do esterço e gira mais quando o esterço é
  maior em módulo, observado na tela (`SEED/US-2`, terceiro critério).
- AC-US-0002-04: Em corrida, em cada quadro, os braços do piloto acompanham o volante exibido: as duas mãos
  do piloto ficam sobre o aro do volante em qualquer ângulo do volante, observado na tela (`SEED/US-2`,
  terceiro critério).
- AC-US-0002-05: Em corrida, em cada quadro, o kart exibido está na posição do kart que a simulação informa
  para esse quadro, observado na tela e no estado da simulação (`SEED/US-2`, quarto critério).
- AC-US-0002-06: Em corrida, em cada quadro, o eixo longitudinal do kart exibido, do para-choque traseiro
  para o nariz, aponta no rumo que a simulação informa para esse quadro, observado na tela e no estado da
  simulação (`SEED/US-2`, quarto critério).

## Casos anormais

- **Pausa**: a simulação não avança; o kart exibido
  fica na última posição, rumo e esterço informados, e as rodas não giram, porque a velocidade de rolamento
  é a da simulação, que está parada no tempo (`SEED/RD-01`).
- **Reposicionamento do kart**: no primeiro quadro depois do reposicionamento, o kart exibido está na nova
  posição e no novo rumo que a simulação informa (critérios 05 e 06); nenhum quadro mostra o kart numa
  posição intermediária que a simulação não informou.
- **Derrapagem, travamento ou patinação das rodas**: as rodas exibidas continuam girando à taxa de rolamento
  na velocidade do kart; o seed pede rotação de acordo com a velocidade do kart, não rotação por roda com
  escorregamento.
- **Marcha à ré**, se a simulação informar velocidade de ré: as rodas giram no sentido do movimento, isto é,
  para trás; o nariz continua apontando no rumo (critério 06).
- **Esterço fora da faixa no `Input`**: a simulação o limita à faixa normalizada (I4); o modelo mostra o
  ângulo de esterço que a simulação informa, nunca o valor bruto do adaptador.
- **Vários passos de simulação num mesmo quadro, ou quadro sem passo novo**: o kart exibido mostra o estado
  que a simulação informa para esse quadro; a renderização não estima nem decide estado (`SEED/RD-01`).
- **Sensor ausente ou permissão negada (`web-mobile`)**: o controle recai para toque com estado visível
  (I4); os critérios 01 a 06 valem sobre o estado que a simulação informa a partir do toque.

## Fontes

- `SEED/US-2` — história e seus quatro critérios (esterço das dianteiras, giro das rodas, volante e braços,
  posição e rumo).
- `SEED/RD-01`, `SEED/IM-I2` — a renderização mostra o estado da simulação e não decide nada.
- `DOMAIN/DEC-01` — rodas, volante e braços continuam animáveis depois do agrupamento por material.

## Pontos em aberto

Nenhum.
