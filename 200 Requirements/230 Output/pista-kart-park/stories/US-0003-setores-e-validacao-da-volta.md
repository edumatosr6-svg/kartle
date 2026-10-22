---
id: US-0003
title: Setores e validação da volta
feature: pista-kart-park
stage: req
status: validated
version: 1.0.0
sources: [SEED/US-3, SEED/RD-05, SEED/RD-06, SEED/RI-03, DOMAIN/DEC-10]
---

# US-0003 — Setores e validação da volta

## História

Como Jogador, quero que uma volta na Kart Park tenha setores e seja validada como na pista sintética,
para que meu tempo de treino seja comparável entre voltas.

## Canais

- `web-desktop` e `web-mobile`: os mesmos setores, os mesmos marcadores, as mesmas regras de validade e
  de corte e o mesmo motivo exibido. Nenhuma diferença de comportamento entre os canais.
- `web-mobile`: com sensor de inclinação ausente ou permissão negada, o controle recai para toque com
  estado visível na tela (I4, `[DOMAIN]`); as regras da volta não mudam.

## Pré-condições

- O arquivo de pista da Kart Park foi gerado offline com chegada, limites de setor e marcadores de
  percurso (o arquivo de origem não os traz, `SEED.md` Contexto).
- Para os critérios observados na simulação ou na tela: a Kart Park está escolhida no seletor e uma
  volta de treino está em andamento.

## Critérios de aceite

- AC-US-0003-01: No arquivo de pista gerado, a volta da Kart Park tem 4 setores (RF09).
- AC-US-0003-02: No arquivo de pista gerado, os três limites internos de setor ficam, nos trechos de
  ligação entre curvas, nos pontos da linha central cuja distância de volta, medida na linha central
  original a partir do ponto 0, é a mais próxima de 201,6 m, de 350,3 m e de 529,9 m.
- AC-US-0003-03: No arquivo de pista gerado, a linha de chegada é a linha de largada, no ponto 0.
- AC-US-0003-04: No arquivo de pista gerado, a distância de volta entre dois marcadores de percurso
  consecutivos é de no máximo 25 m, inclusive entre o último marcador da volta e o primeiro.
- AC-US-0003-05: Na Kart Park, uma volta em que o kart pula um marcador de percurso é inválida no estado
  da simulação (RF10).
- AC-US-0003-06: Na Kart Park, quando uma volta é invalidada por marcador pulado, a tela exibe o motivo
  "marcador pulado".
- AC-US-0003-07: Na Kart Park, uma volta em que o kart fica mais de 3 m além da borda da pista por mais
  de 1000 ms é invalidada por corte no estado da simulação (limites padrão de `race-lap-validation`,
  citados por `SEED/US-3`).
- AC-US-0003-08: Na Kart Park, ficar mais de 3 m além da borda da pista por 1000 ms ou menos não
  invalida a volta por corte no estado da simulação.
- AC-US-0003-09: Na Kart Park, uma volta que atravessa a grama por dentro da curva 4, de ≈ 147 m a
  ≈ 200 m de volta, é inválida no estado da simulação (`DOMAIN/DEC-10`: os marcadores a cada 25 m
  bastam para os atalhos de 12 a 26 m de grama).
- AC-US-0003-10: Na Kart Park, uma volta que passa por todos os marcadores de percurso em ordem e cruza
  a chegada sem corte termina válida no estado da simulação.
- AC-US-0003-11: Na Kart Park, ao fim de uma volta válida, a tela de resultado exibe o tempo total e os
  4 tempos de setor, como ao fim de uma volta válida na pista sintética.

## Casos anormais

- **Atalho pela grama de 12 a 26 m** (por exemplo, por dentro da curva 4): não tem barreira (US-0004,
  `DOMAIN/DEC-10`); a volta que o usa pula ao menos um marcador e é inválida (critérios 05 e 09).
- **Atalho pelos trechos quase encostados** (≈ 371–414 m contra ≈ 580–615 m): impedido pela barreira
  (US-0004).
- **Rodas sobre a zebra**: contam como pista e não acumulam tempo para o corte (US-0005).
- **Cruzar a chegada de novo depois de concluir a volta, cruzar na contramão, pausar, perder o foco da
  aba ou recarregar a página durante a volta**: a volta segue as mesmas regras que na pista sintética
  (`race-lap-validation`), porque é "validada como na pista sintética" (`SEED/US-3`). Como o seletor é
  só de treino, nenhum desses casos cria registro de desafio diário (US-0001).
- **Troca de pista no meio da volta**: a volta não continua; o kart vai para a largada da pista
  escolhida, sem volta em andamento (US-0001).
- **Sensor de inclinação ausente ou permissão negada (`web-mobile`)**: o controle recai para toque com
  estado visível (I4); as regras da volta não mudam.

## Fontes

- `SEED/US-3` — história e seus quatro critérios.
- `SEED/RD-05` — largada, 4 setores e chegada (RF09).
- `SEED/RD-06` — volta que pula marcador é inválida (RF10, `race-lap-validation`).
- `SEED/RI-03`, `DOMAIN/DEC-10` — os marcadores a cada 25 m bastam para os atalhos de 12 a 26 m.

## Pontos em aberto

Nenhum — `DOMAIN/DEC-10` fecha a questão dos atalhos pela grama, e os limites de corte são os padrão
citados pelo seed.
