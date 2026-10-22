---
id: FEAT-0001
title: Kart 01 na pista — modelo, medidas, peças, cores, número 01 e sombra
feature: modelo-kart-01
stage: fspec
status: draft
version: 1.0.0
sources: [US-0001, AC-US-0001-01, AC-US-0001-02, AC-US-0001-03, AC-US-0001-04, AC-US-0001-05, AC-US-0001-06, AC-US-0001-07, AC-US-0001-08, AC-US-0001-09, AC-US-0001-10, AC-US-0001-11, AC-US-0001-12, AC-US-0001-13, AC-US-0001-14, AC-US-0001-15, AC-US-0001-16]
---

# FEAT-0001 — Kart 01 na pista

## Resumo

O Jogador vê na pista um kart de verdade: o Kart 01, montado a partir do código do Cowork e conferido contra
a ficha "Kart 01 — Kartle", em escala real (1,93 m × 1,45 m, entre-eixos de 1,05 m), com as rodas e bitolas
da ficha, os 15 grupos de peças e o piloto, as quatro cores da ficha, o número 01 na placa do para-choque e
sombra no chão. O kart provisório de caixas deixa de aparecer. Não há escolha de kart, cor ou adesivo (I10).

## Canais

`web-desktop` e `web-mobile`: o mesmo modelo, com as mesmas medidas, peças, cores, número e sombra, em
paisagem e em retrato. Nenhuma diferença entre os canais. Em `web-mobile` com sensor ausente ou permissão
negada, o controle recai para toque com estado visível (I4); o modelo exibido é o mesmo. As medidas, os
grupos e as cores são verificados sobre o modelo montado na saída de `npm test`, sem canal de jogo; o
número 01, a sombra e a retirada do kart provisório são verificados na tela.

## Requisitos

- REQ-FEAT-0001-01: O sistema SHALL exibir com o modelo do Kart 01, antes da largada e em corrida, todo kart
  da cena — o do Jogador e qualquer outro kart que o jogo exiba, como o fantasma —, sem exibir o kart
  provisório de caixas em nenhum quadro (AC-US-0001-14).
- REQ-FEAT-0001-02: O sistema SHALL montar o Kart 01 com comprimento da caixa envolvente do kart de 1,93 m,
  com tolerância de ±0,02 m, reportado em `bboxLengthM` do registro `KART_DIMENSIONS` da saída de `npm test`
  (AC-US-0001-01).
- REQ-FEAT-0001-03: O sistema SHALL montar o Kart 01 com largura da caixa envolvente do kart de 1,45 m, com
  tolerância de ±0,02 m, reportada em `bboxWidthM` do registro `KART_DIMENSIONS` (AC-US-0001-02).
- REQ-FEAT-0001-04: O sistema SHALL montar o Kart 01 com entre-eixos de 1,05 m, com tolerância de ±0,02 m,
  reportado em `wheelbaseM` do registro `KART_DIMENSIONS` (AC-US-0001-03).
- REQ-FEAT-0001-05: O sistema SHALL montar cada uma das duas rodas dianteiras do Kart 01 com diâmetro de
  0,26 m, medida ao centímetro, reportado em `frontWheelDiametersM` do registro `WHEELS_AND_TRACKS`
  (AC-US-0001-04).
- REQ-FEAT-0001-06: O sistema SHALL montar cada uma das duas rodas traseiras do Kart 01 com diâmetro de
  0,28 m, medida ao centímetro, reportado em `rearWheelDiametersM` do registro `WHEELS_AND_TRACKS`
  (AC-US-0001-05).
- REQ-FEAT-0001-07: O sistema SHALL montar o Kart 01 com bitola dianteira de 1,00 m, medida ao centímetro,
  reportada em `frontTrackM` do registro `WHEELS_AND_TRACKS` (AC-US-0001-06).
- REQ-FEAT-0001-08: O sistema SHALL montar o Kart 01 com bitola traseira de 1,14 m, medida ao centímetro,
  reportada em `rearTrackM` do registro `WHEELS_AND_TRACKS` (AC-US-0001-07).
- REQ-FEAT-0001-09: O sistema SHALL montar o Kart 01, depois do agrupamento por material, com um grupo de
  peça com geometria visível para cada um dos 15 nomes `chassi`, `eixoTraseiro`, `rodaDianteiraEsq`,
  `rodaDianteiraDir`, `rodaTraseiraEsq`, `rodaTraseiraDir`, `nariz`, `painelFrontal`, `sidepodEsq`,
  `sidepodDir`, `paraChoqueTraseiro`, `banco`, `direcao`, `pedais` e `motor`, listados no registro
  `PART_GROUPS` sem faltar nenhum (AC-US-0001-08).
- REQ-FEAT-0001-10: O sistema SHALL montar o Kart 01 com um 16º grupo chamado `piloto`, com geometria
  visível, que não está dentro de nenhum dos 15 grupos de peças, listado no registro `PART_GROUPS`
  (AC-US-0001-09).
- REQ-FEAT-0001-11: O sistema SHALL usar no kart do modelo montado a cor laranja Kartle `#FF6A13`, reportada
  entre as cores de `kartColorHexes` do registro `PART_COLORS` (AC-US-0001-10).
- REQ-FEAT-0001-12: O sistema SHALL dar ao grupo `chassi` do modelo montado a cor grafite `#2B2E34`,
  reportada entre as cores de `chassisColorHexes` do registro `PART_COLORS` (AC-US-0001-11).
- REQ-FEAT-0001-13: O sistema SHALL dar à placa do para-choque do modelo montado a cor branca `#F4F3EF`,
  reportada em `bumperPlateColorHex` do registro `PART_COLORS` (AC-US-0001-12).
- REQ-FEAT-0001-14: O sistema SHALL dar ao macacão do piloto, no grupo `piloto` do modelo montado, a cor azul
  `#2F55D4`, reportada em `suitColorHex` do registro `PART_COLORS` (AC-US-0001-13).
- REQ-FEAT-0001-15: O sistema SHALL exibir na tela o número 01 na placa do para-choque do kart exibido
  (AC-US-0001-16).
- REQ-FEAT-0001-16: O sistema SHALL fazer o kart exibido projetar sombra no chão da pista, de modo que, em
  corrida e pela câmera de corrida, a tela mostre essa sombra no chão junto ao kart (AC-US-0001-15).
- REQ-FEAT-0001-17: O sistema SHALL exibir o mesmo modelo, com as mesmas medidas, peças, cores, número e
  sombra, em `web-desktop` e em `web-mobile`, em paisagem e em retrato, e depois de uma recarga da página ou
  de uma troca de orientação [DOMAIN] (US-0001, Canais e caso anormal "Recarga da página ou troca de
  orientação").

## Comportamento

Medidas, grupos, cores e custo: [RULE-0001](../rules/RULE-0001-medidas-grupos-e-cores-do-kart-01.md),
[FLOW-0003](../flows/FLOW-0003-verificacao-do-modelo-montado.md),
[API-0002](../api/API-0002-relatorio-do-modelo-montado.md). Exibição na cena:
[FLOW-0001](../flows/FLOW-0001-quadro-de-exibicao-em-corrida.md),
[FLOW-0002](../flows/FLOW-0002-largada-visao-geral-descida-e-pose-de-corrida.md),
[SCR-0001](../screens/SCR-0001-cena-de-jogo-com-o-kart-01.md).

| Situação | Comportamento |
|---|---|
| Medida fora da tolerância ou abaixo da precisão pedida (por exemplo, por arredondamento na adaptação do código do Cowork à versão de biblioteca do projeto) | O registro correspondente dá `FAIL` com `OUT_OF_TOLERANCE`; o modelo é corrigido, nunca a tolerância |
| Grupo faltando, com outro nome ou sem geometria visível (por exemplo, esvaziado pelo agrupamento por material) | `PART_GROUPS` dá `FAIL` com `GROUP_MISSING`; o agrupamento não pode apagar nenhum dos 16 grupos nomeados |
| `piloto` dentro de um dos 15 grupos de peças | `PART_GROUPS` dá `FAIL` com `GROUP_NESTED` |
| Cor do código do Cowork diferente da cor da ficha numa das quatro cores nomeadas | Vale a cor da ficha, que é a dos requisitos 11 a 14; `PART_COLORS` dá `FAIL` com `COLOR_MISMATCH` até o modelo usar essa cor |
| Antes da contagem regressiva | Se o jogo exibe um kart, ele é o Kart 01, na posição que a simulação informa, visto pela visão geral ([RULE-0002](../rules/RULE-0002-camera-de-jogo.md)) |
| Recarga da página ou troca de orientação | O mesmo modelo, com as mesmas medidas, peças e cores; nenhuma dessas ações exibe o kart provisório |
| Recurso do modelo indisponível | Não se aplica: o modelo é montado por código que entra no próprio jogo, sem arquivo de modelo separado para baixar; não há carregamento próprio que possa falhar ou atrasar |
| Sensor ausente ou permissão negada (`web-mobile`) | O controle recai para toque com estado visível (I4); o modelo exibido não muda |
| Pedido de outro kart, outra cor ou adesivo | Não há: um único kart, sem personalização (I10); nenhuma configuração o oferece |
| Rede indisponível | Sem efeito: o modelo é montado localmente (D-FS-08) |

## Estado

Não define estados próprios. O modelo é o mesmo em todas as fases da volta (`lapPhase` de
`race-lap-validation`) e em todos os modos da câmera; só a sua pose e a animação mudam
([FEAT-0002](FEAT-0002-kart-reage-aos-comandos.md)).

## Configuração

Nenhuma. Não há chave para voltar ao kart provisório: a mudança é só visual e vale como padrão assim que a
feature é entregue (requisitos, `01-context.md`, Padrão seguro). Não há escolha de kart, cor ou adesivo
(I10). Nenhuma configuração existe para forçar um evento, injetar um estado ou habilitar um caminho de
depuração.

## Critérios de aceite

- `KART_DIMENSIONS`: `bboxLengthM` em 1,93 ± 0,02, `bboxWidthM` em 1,45 ± 0,02 e `wheelbaseM` em 1,05 ± 0,02,
  com `verdict` `PASS` (satisfaz AC-US-0001-01, AC-US-0001-02, AC-US-0001-03; cobre os requisitos 02, 03 e
  04).
- `WHEELS_AND_TRACKS`: os dois valores de `frontWheelDiametersM` arredondados ao centímetro iguais a 0,26, os
  dois de `rearWheelDiametersM` iguais a 0,28, `frontTrackM` igual a 1,00 e `rearTrackM` igual a 1,14
  (satisfaz AC-US-0001-04, AC-US-0001-05, AC-US-0001-06, AC-US-0001-07; cobre os requisitos 05 a 08).
- `PART_GROUPS`: os 15 nomes e `piloto` presentes, cada um com `visibleTriangleCount` maior que 0,
  `missingGroupNames` vazia e `piloto` sem `parentGroupName` (satisfaz AC-US-0001-08, AC-US-0001-09; cobre
  os requisitos 09 e 10).
- `PART_COLORS`: `#FF6A13` em `kartColorHexes`, `#2B2E34` em `chassisColorHexes`, `bumperPlateColorHex`
  igual a `#F4F3EF` e `suitColorHex` igual a `#2F55D4` (satisfaz AC-US-0001-10, AC-US-0001-11,
  AC-US-0001-12, AC-US-0001-13; cobre os requisitos 11 a 14).
- Na tela, antes da largada e em corrida, nenhum quadro mostra o kart provisório, e todo kart exibido é o
  Kart 01, também depois de recarga e de troca de orientação, nos dois canais (satisfaz AC-US-0001-14; cobre
  os requisitos 01 e 17).
- Na tela, o número 01 aparece na placa do para-choque do kart exibido (satisfaz AC-US-0001-16; cobre o
  requisito 15).
- Na tela, em corrida, pela câmera de corrida, a sombra do kart aparece no chão junto ao kart (satisfaz
  AC-US-0001-15; cobre o requisito 16).

## Pontos em aberto

Nenhum.
