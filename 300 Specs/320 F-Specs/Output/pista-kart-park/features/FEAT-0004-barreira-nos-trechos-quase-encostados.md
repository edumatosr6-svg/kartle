---
id: FEAT-0004
title: Barreira nos trechos quase encostados
feature: pista-kart-park
stage: fspec
status: validated
version: 1.0.0
sources: [US-0004, AC-US-0004-01, AC-US-0004-02, AC-US-0004-03, AC-US-0004-04, AC-US-0004-05, AC-US-0004-06]
---

# FEAT-0004 — Barreira nos trechos quase encostados

## Resumo

Entre os dois trechos da Kart Park que quase se encostam (≈ 371–414 m e ≈ 580–615 m de volta, com 0,9 m a
6 m de grama entre as bordas do asfalto), o arquivo de pista gerado declara uma barreira física. O kart
bate nela e não passa, em qualquer velocidade e dos dois lados, com o mesmo efeito de bater no muro
existente (`DOMAIN/DEC-03`). A barreira fica na grama, não invade o asfalto, e só existe onde a grama mede
6 m ou menos; os atalhos de 12 a 26 m ficam sem barreira e são invalidados pelos marcadores
(`DOMAIN/DEC-10`). A barreira é dado lido pela simulação; a tela só a desenha (I2).

## Canais

`web-desktop` e `web-mobile`: a mesma barreira, no mesmo lugar, com o mesmo efeito de colisão. Em
`web-mobile`, sem sensor ou com permissão negada, o controle recai para toque com estado visível; a
barreira não muda (I4).

## Requisitos

- REQ-FEAT-0004-01: O arquivo de pista gerado SHALL declarar em `barriers` a barreira entre o trecho de
  371 m a 414 m e o trecho de 580 m a 615 m de distância de volta na linha original, de modo que todo
  segmento reto de 6 m ou menos entre um ponto da borda do asfalto de um trecho e o ponto mais próximo da
  borda do asfalto do outro cruza a barreira (AC-US-0004-01).
- REQ-FEAT-0004-02: O arquivo de pista gerado SHALL ter todo ponto de toda barreira a uma soma de
  distâncias de no máximo 6 m até o asfalto de cada um dos dois trechos que ela separa, de modo que nenhuma
  barreira fica entre partes da pista com mais de 6 m de grama (AC-US-0004-02).
- REQ-FEAT-0004-03: O arquivo de pista gerado SHALL ter toda barreira fora do asfalto dos dois trechos:
  nenhum ponto dela está sobre o asfalto (AC-US-0004-03).
- REQ-FEAT-0004-04: O sistema SHALL ter como únicos obstáculos da Kart Park as barreiras declaradas no seu
  arquivo de pista, sem muro derivado da linha central (AC-US-0004-02; `DOMAIN/DEC-10`).
- REQ-FEAT-0004-05: O sistema SHALL impedir, no estado da simulação, que o kart conduzido contra uma
  barreira, de qualquer dos dois lados e em qualquer velocidade que ele alcance, esteja do outro lado da
  barreira em qualquer passo de `STEP` (AC-US-0004-04).
- REQ-FEAT-0004-06: O sistema SHALL produzir, depois do contato com a barreira, a mesma velocidade e a mesma
  posição do kart que depois do contato com o muro existente, para a mesma velocidade, o mesmo ângulo de
  impacto e o mesmo `Input`, comparadas a cada passo de `STEP` desde o contato no referencial local do
  obstáculo (origem no ponto de contato, eixos na normal e na tangente da superfície) (AC-US-0004-05).
- REQ-FEAT-0004-07: O sistema SHALL reportar `barrierContact` verdadeiro somente no passo em que o kart
  entra em contato com uma barreira, para marcar o passo de contato da comparação do requisito 06
  (AC-US-0004-05).
- REQ-FEAT-0004-08: O sistema SHALL desenhar, na tela de corrida, cada barreira em todo o seu comprimento
  (AC-US-0004-06).

## Comportamento

Contrato: [API-0001](../api/API-0001-dado-de-pista-com-geometria-zebras-e-barreiras.md) (`barriers`),
[API-0003](../api/API-0003-contato-do-kart-com-a-pista.md) (`barrierContact`). Regras e verificações:
[RULE-0001](../rules/RULE-0001-superficie-borda-da-pista-e-obstaculos.md) (obstáculos e colisão),
[RULE-0002](../rules/RULE-0002-geometria-e-verificacoes-do-arquivo-de-pista.md) (cobertura, limite de 6 m e
asfalto livre). Passo: [FLOW-0002](../flows/FLOW-0002-passo-de-simulacao-na-kart-park.md). Desenho:
[SCR-0003](../screens/SCR-0003-kart-park-na-tela-de-corrida.md).

| Situação | Comportamento |
|---|---|
| Impacto em qualquer velocidade, até a máxima | O kart não atravessa; efeito igual ao do muro existente |
| Kart raspando ao longo da barreira ou parado encostado nela | Mesmo efeito que no muro existente; nunca do outro lado |
| Tentativa no sentido contrário (do trecho de ≈ 580–615 m para o de ≈ 371–414 m) | Bloqueada do mesmo modo |
| Kart rápido, que num passo percorre mais que a distância até a barreira | Nenhum passo termina com o kart do outro lado: o contato é decidido no trajeto do passo, não só na posição final |
| Atalhos pela grama de 12 a 26 m | Sem barreira e sem muro; invalidados pelos marcadores ([FEAT-0003](FEAT-0003-setores-chegada-marcadores-e-validacao.md)) |
| Kart que bate na barreira | Está na grama, além da borda da pista; o corte segue os limites de [FEAT-0003](FEAT-0003-setores-chegada-marcadores-e-validacao.md); a colisão em si não muda a validade da volta |
| Mudança da barreira depois de publicada | Versão nova da pista ([FEAT-0002](FEAT-0002-forma-largura-e-versao-do-arquivo-de-pista.md)) |
| Sensor ausente ou permissão negada (`web-mobile`) | Toque com estado visível; barreira inalterada |
| Rede indisponível | Sem efeito (D-FS-08) |

## Estado

Não define estados próprios. `barrierContact` é função do trajeto do kart no passo, ordenada por
`simStepCount`, sem reaplicação: verdadeiro no passo do contato e falso nos demais.

## Configuração

Nenhuma. A posição da barreira é dado do arquivo de pista; o limite de 6 m é verificação do arquivo.

## Critérios de aceite

- No arquivo gerado, todo segmento de 6 m ou menos entre as bordas do asfalto dos dois trechos cruza uma
  barreira (satisfaz AC-US-0004-01; cobre o requisito 01).
- No arquivo gerado, todo ponto de barreira tem soma de distâncias até o asfalto dos dois trechos de no
  máximo 6 m, e na simulação da Kart Park não há outro obstáculo (satisfaz AC-US-0004-02; cobre os
  requisitos 02 e 04).
- No arquivo gerado, nenhuma barreira intercepta o asfalto (satisfaz AC-US-0004-03; cobre o requisito 03).
- Com o kart lançado contra a barreira dos dois lados, a velocidades crescentes até a máxima que ele
  alcança, nenhum passo termina com o kart do outro lado (satisfaz AC-US-0004-04; cobre o requisito 05).
- Para a mesma velocidade, o mesmo ângulo e o mesmo `Input`, a velocidade e a posição no referencial local
  são iguais na barreira e no muro existente a cada passo desde o passo com `barrierContact` (barreira) e
  `wallContact` (muro) verdadeiros (satisfaz AC-US-0004-05; cobre os requisitos 06 e 07).
- Na tela de corrida, a barreira aparece em todo o seu comprimento (satisfaz AC-US-0004-06; cobre o
  requisito 08).

## Pontos em aberto

Nenhum.
