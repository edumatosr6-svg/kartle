---
id: FEAT-0005
title: Zebra com efeito
feature: pista-kart-park
stage: fspec
status: validated
version: 1.0.1
sources: [US-0005, AC-US-0005-01, AC-US-0005-02, AC-US-0005-03, AC-US-0005-04, AC-US-0005-05, AC-US-0005-06, AC-US-0005-07, AC-US-0005-08, AC-US-0005-09, AC-US-0005-10, AC-US-0005-11, AC-US-0005-12]
---

# FEAT-0005 — Zebra com efeito

## Resumo

As 33 zebras do arquivo de origem entram no arquivo de pista gerado no lado e no trecho declarados, com a
que cruza a linha de largada dividida nela (34 trechos). A zebra conta como pista: rodar sobre ela não é
saída de pista nem conta para o corte. Cada pneu sobre a zebra tem 85 % da aderência que teria no asfalto
(`DOMAIN/DEC-05`). Enquanto houver ao menos uma roda na zebra, o celular vibra 20 ms a cada 0,25 s, se o
navegador permitir; no teclado, o jogo toca o som próprio da zebra, repetido, com o som ligado
(`DOMAIN/DEC-11`). A zebra é dado de superfície lido pela simulação; o retorno é efeito da apresentação
disparado pelo estado da simulação (I2, I8).

## Canais

| Canal | O que muda |
|---|---|
| `web-desktop` e `web-mobile` | As mesmas zebras, no mesmo lado, com a mesma regra de pista e a mesma aderência de 85 % |
| `web-mobile` | Retorno pela vibração do aparelho, se o navegador permitir; o som da zebra é permitido e não exigido (requisito 17). Sem sensor ou com permissão negada, toque com estado visível; zebra, aderência e vibração não mudam (I4) |
| `web-desktop` | Retorno só pelo som, com o som ligado; nenhuma vibração (`DOMAIN/DEC-05`) |

## Requisitos

- REQ-FEAT-0005-01: O arquivo de pista gerado SHALL declarar em `curbs` 34 trechos de zebra: os 33 do
  arquivo de origem, com o trecho que cruza a linha de largada dividido em dois no ponto 0
  (AC-US-0005-01).
- REQ-FEAT-0005-02: O arquivo de pista gerado SHALL dar a cada trecho de zebra o lado (`LEFT` ou `RIGHT`,
  no sentido de corrida) do trecho de origem e as distâncias de volta `fromLapM` e `toLapM` das posições,
  na linha suavizada, de mesmo índice fracionário que o início e o fim declarados na linha original; os
  dois pedaços da zebra dividida vão do início declarado até o fim da volta e do ponto 0 até o fim
  declarado (AC-US-0005-02).
- REQ-FEAT-0005-03: O arquivo de pista gerado SHALL declarar cada trecho de zebra como faixa encostada na
  borda do asfalto do seu lado, para fora, com largura `widthM` maior que 0, sem reduzir a largura do
  asfalto (AC-US-0005-04, AC-US-0005-06; AC-US-0002-05: a largura do asfalto é a da origem em todo ponto).
- REQ-FEAT-0005-04: O sistema SHALL desenhar, na tela de corrida, cada trecho de zebra no lado da pista e
  no trecho de volta declarados para ele (AC-US-0005-03).
- REQ-FEAT-0005-05: O sistema SHALL classificar, a cada passo de `STEP`, a superfície sob cada roda como
  `ASPHALT` sobre o asfalto, `CURB` sobre uma zebra fora do asfalto e `GRASS` fora da pista
  (AC-US-0005-04, AC-US-0005-06; [RULE-0001](../rules/RULE-0001-superficie-borda-da-pista-e-obstaculos.md)).
- REQ-FEAT-0005-06: O sistema SHALL ter, no estado da simulação, `beyondTrackEdgeM` igual a 0, e portanto
  nenhuma saída de pista, para um kart com rodas sobre a zebra e nenhuma roda na grama (AC-US-0005-04).
- REQ-FEAT-0005-07: O sistema SHALL medir a distância usada pelo corte a partir da borda da pista, que,
  onde há zebra daquele lado, é a borda externa da zebra, de modo que rodar sobre a zebra por mais de
  1000 ms, sem nenhuma roda além dela, não invalida a volta por corte (AC-US-0005-05).
- REQ-FEAT-0005-08: O sistema SHALL dar a cada pneu sobre a zebra 85 % da aderência do mesmo pneu no
  asfalto, com a mesma carga e o mesmo escorregamento, reportando `wheelGripPc` 0,85 para a roda em `CURB`
  e 1 para a roda em `ASPHALT` (AC-US-0005-06).
- REQ-FEAT-0005-09: O sistema SHALL tratar a roda sobre a zebra como roda na pista em toda regra de
  superfície além da aderência do requisito 08: a perda de velocidade da grama (RF08) não se aplica a ela
  (AC-US-0005-04; `SEED/US-5` via US-0005: "conta como estar na pista").
- REQ-FEAT-0005-10: O sistema SHALL, em `web-mobile` com o navegador permitindo vibração, começar um pulso
  de vibração de 20 ms em todo passo com `curbWheelCount` maior que 0 em que nenhum pulso começou nos
  250 ms de tempo simulado anteriores (AC-US-0005-07).
- REQ-FEAT-0005-11: O sistema SHALL NOT começar pulso de vibração da zebra num passo com `curbWheelCount`
  igual a 0 (AC-US-0005-08).
- REQ-FEAT-0005-12: O sistema SHALL, em `web-desktop` com o som ligado, começar o som da zebra em todo passo
  com `curbWheelCount` maior que 0 em que nenhuma repetição começou dentro do intervalo de repetição
  anterior, constante e em tempo simulado (AC-US-0005-09).
- REQ-FEAT-0005-13: O sistema SHALL NOT começar repetição do som da zebra num passo com `curbWheelCount`
  igual a 0 (AC-US-0005-10).
- REQ-FEAT-0005-14: O sistema SHALL NOT produzir o som da zebra com o som desligado (AC-US-0005-11).
- REQ-FEAT-0005-15: O sistema SHALL usar para a zebra um som próprio, cujo sinal é diferente do de todo
  outro som do jogo e que nenhum outro evento do jogo usa (AC-US-0005-12).
- REQ-FEAT-0005-16: O sistema SHALL NOT vibrar o aparelho pela zebra em `web-desktop` (AC-US-0005-07: a
  vibração é o retorno de `web-mobile`; AC-US-0005-09: o retorno de `web-desktop` é o som; US-0005,
  Canais; `DOMAIN/DEC-05`: no teclado, só o som).
- REQ-FEAT-0005-17: O sistema MAY tocar o som da zebra em `web-mobile`, pelas mesmas regras dos requisitos
  12 a 15 (US-0005, Canais: em `web-mobile` o som não é requisito deste conjunto).
- REQ-FEAT-0005-18: O sistema SHALL NOT começar pulso de vibração nem repetição do som da zebra enquanto a
  simulação está suspensa por pausa, perda de foco ou perda do sensor [DOMAIN] (I8: o intervalo é contado
  em passos de `STEP`, e nenhum passo avança na suspensão).
- REQ-FEAT-0005-19: O sistema SHALL manter a zebra, a aderência e a volta inalteradas, sem erro nem aviso,
  quando o navegador não oferece vibração ou a bloqueia (AC-US-0005-04, AC-US-0005-05, AC-US-0005-06;
  US-0005, caso anormal "Navegador sem vibração, ou que a bloqueia", que nomeia os critérios 04 a 06).

## Comportamento

Contrato: [API-0001](../api/API-0001-dado-de-pista-com-geometria-zebras-e-barreiras.md) (`curbs`),
[API-0003](../api/API-0003-contato-do-kart-com-a-pista.md) (`wheelSurfaces`, `curbWheelCount`, `wheelGripPc`,
`beyondTrackEdgeM`). Regras: [RULE-0001](../rules/RULE-0001-superficie-borda-da-pista-e-obstaculos.md)
(superfície, aderência, borda da pista), [RULE-0002](../rules/RULE-0002-geometria-e-verificacoes-do-arquivo-de-pista.md)
(contagem, lado e trecho das zebras no arquivo), [RULE-0004](../rules/RULE-0004-retorno-da-zebra.md)
(vibração e som). Passo: [FLOW-0002](../flows/FLOW-0002-passo-de-simulacao-na-kart-park.md). Tela e
retorno: [SCR-0003](../screens/SCR-0003-kart-park-na-tela-de-corrida.md).

| Situação | Comportamento |
|---|---|
| Rodas sobre a zebra, nenhuma na grama | Na pista: `beyondTrackEdgeM` 0; sem tempo de corte; aderência de 85 % nos pneus sobre a zebra |
| Kart com rodas na zebra e na grama ao mesmo tempo | A roda na zebra tem 85 %; a roda na grama segue a regra da grama, sem mudança; o corte segue [FEAT-0003](FEAT-0003-setores-chegada-marcadores-e-validacao.md), medido da borda externa da zebra |
| Zebra que cruza a linha de largada | Dois trechos, um de cada lado da linha; a divisão não acrescenta nem retira zebra |
| Roda entrando na zebra (`web-mobile`, vibração permitida) | Pulso de 20 ms no passo, se nenhum começou nos 250 ms anteriores; depois, um a cada 250 ms enquanto houver roda na zebra |
| Rodas entrando e saindo em sequência rápida | Nunca dois pulsos com menos de 250 ms entre os inícios; nenhum pulso ou repetição começa sem roda na zebra; um pulso já começado termina os seus 20 ms |
| Roda entrando na zebra (`web-desktop`, som ligado) | O som da zebra começa; repete no intervalo constante enquanto houver roda na zebra |
| Som desligado (`web-desktop`) | Nenhum som da zebra; regra de pista e aderência inalteradas |
| Navegador sem vibração ou que a bloqueia (`web-mobile`) | Nenhuma vibração; nada mais muda; nenhum aviso |
| Pausa, perda de foco, perda do sensor | Nenhum passo avança; nenhum pulso nem repetição novo |
| Mudança de uma zebra depois de publicada | Versão nova da pista ([FEAT-0002](FEAT-0002-forma-largura-e-versao-do-arquivo-de-pista.md)) |
| Rede indisponível | Sem efeito (D-FS-08) |

## Estado

Não define enums de estado próprios além dos valores de superfície `ASPHALT`, `CURB` e `GRASS` de
`wheelSurfaces` ([API-0003](../api/API-0003-contato-do-kart-com-a-pista.md)). A superfície de cada roda é
função da sua posição no passo, ordenada por `simStepCount`. O retorno guarda só o passo em que começou o
último pulso e a última repetição ([RULE-0004](../rules/RULE-0004-retorno-da-zebra.md)); reler o mesmo passo
não começa outro.

## Configuração

Nenhuma. A aderência de 85 %, o pulso de 20 ms e o intervalo de 250 ms são regras de domínio
(`DOMAIN/DEC-05`), não configuração; o intervalo de repetição do som é constante do design. O "som
ligado" é o estado de áudio que o jogo já tem; esta feature não cria controle de som.

## Critérios de aceite

- O arquivo gerado tem 34 trechos de zebra; 32 têm o lado de um trecho da origem e o trecho de volta
  correspondente a ele por índice fracionário, e os outros dois, do mesmo lado, juntos cobrem o trecho de
  origem que cruza a largada, divididos no ponto 0; todo trecho tem `widthM` maior que 0 (satisfaz
  AC-US-0005-01, AC-US-0005-02; cobre os requisitos 01, 02 e 03).
- Na tela de corrida, cada trecho de zebra aparece no lado e no trecho declarados (satisfaz AC-US-0005-03;
  cobre o requisito 04).
- Com o kart posto com rodas na zebra e nenhuma na grama, `wheelSurfaces` tem `CURB` nessas rodas e
  `beyondTrackEdgeM` é 0 (satisfaz AC-US-0005-04; cobre os requisitos 05, 06 e 09).
- Uma volta com o kart rodando sobre a zebra por mais de 1000 ms, sem roda além dela, não termina com
  `CUT` (satisfaz AC-US-0005-05; cobre o requisito 07).
- Para a mesma carga e o mesmo escorregamento, a força máxima do pneu na zebra é 0,85 da do pneu no
  asfalto, e `wheelGripPc` é 0,85 nessa roda (satisfaz AC-US-0005-06; cobre o requisito 08).
- Em `web-mobile`, com a vibração permitida, o registro dos pulsos pedidos mostra pulsos de 20 ms com
  inícios a 250 ms de tempo simulado um do outro enquanto houver roda na zebra, e nenhum início com
  `curbWheelCount` 0 ou com a simulação suspensa (satisfaz AC-US-0005-07, AC-US-0005-08; cobre os
  requisitos 10, 11 e 18).
- Em `web-desktop`, com o som ligado, o registro das repetições pedidas mostra repetições no intervalo
  constante enquanto houver roda na zebra e nenhuma com `curbWheelCount` 0; com o som desligado, nenhuma;
  nenhum pulso de vibração em `web-desktop` (satisfaz AC-US-0005-09, AC-US-0005-10, AC-US-0005-11; cobre
  os requisitos 12, 13, 14 e 16).
- O sinal do som da zebra é diferente do de cada outro som do jogo, e nenhum outro evento o usa (satisfaz
  AC-US-0005-12; cobre os requisitos 15 e 17).
- Sem vibração no navegador, a volta e a aderência são as mesmas que com vibração, e nenhum erro é exibido
  (satisfaz AC-US-0005-04, AC-US-0005-05, AC-US-0005-06 sem vibração; cobre o requisito 19).

## Pontos em aberto

Nenhum.
