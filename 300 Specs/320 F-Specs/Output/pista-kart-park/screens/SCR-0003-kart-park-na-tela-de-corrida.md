---
id: SCR-0003
title: Kart Park na tela de corrida e retorno da zebra
feature: pista-kart-park
stage: fspec
status: validated
version: 1.0.0
sources: [US-0002, US-0003, US-0004, US-0005, NFR-0002, AC-US-0002-08, AC-US-0003-06, AC-US-0004-06, AC-US-0005-03, AC-US-0005-07, AC-US-0005-08, AC-US-0005-09, AC-US-0005-10, AC-US-0005-11]
---

# SCR-0003 — Kart Park na tela de corrida e retorno da zebra

## Propósito

O que esta feature acrescenta à tela de corrida de `race-lap-validation`: o desenho da Kart Park a partir
do arquivo de pista (asfalto com a largura de cada ponto, zebras no lado declarado, barreira em todo o
comprimento) e o retorno da zebra (vibração em `web-mobile`, som em `web-desktop`). O HUD da volta, o
estado e o motivo ("marcador pulado", "corte"), a pausa e o reposicionamento são de `race-lap-validation`,
e o HUD de velocidade e aderência é de `dirigibilidade`, nomeados e não redefinidos. A tela só desenha e
reage ao estado: nenhuma regra de pista é decidida nela (I2).

## Canal

Ambos para o desenho. O retorno difere: vibração do aparelho em `web-mobile`, se o navegador permitir;
som da zebra em `web-desktop`, com o som ligado, e permitido sem ser exigido em `web-mobile`
([RULE-0004](../rules/RULE-0004-retorno-da-zebra.md)). A tela usa `readTrackData` pelo dado da sessão
([API-0001](../api/API-0001-dado-de-pista-com-geometria-zebras-e-barreiras.md)) e `getTrackContact`
([API-0003](../api/API-0003-contato-do-kart-com-a-pista.md)).

## Pontos de entrada

`startLap` aceito na tela inicial ([SCR-0001](SCR-0001-tela-inicial-com-seletor-de-pista.md)).

## Elementos acrescentados

| Elemento | Conteúdo | Fonte |
|---|---|---|
| Asfalto | Entre as duas bordas do asfalto de `centerline`, com a largura de cada ponto | AC-US-0002-08; I2 |
| Zebras | Cada trecho de `curbs`, no lado `side` e entre `fromLapM` e `toLapM`, como faixa para fora da borda do asfalto | AC-US-0005-03 |
| Barreira | Cada barreira de `barriers`, em todo o seu comprimento | AC-US-0004-06 |
| Vibração da zebra (`web-mobile`) | Pulsos de 20 ms, no máximo um a cada 250 ms de tempo simulado, enquanto `curbWheelCount` é maior que 0 | AC-US-0005-07, AC-US-0005-08 |
| Som da zebra (`web-desktop`) | Repetições do som próprio da zebra, no intervalo constante, enquanto `curbWheelCount` é maior que 0, com o som ligado | AC-US-0005-09, AC-US-0005-10, AC-US-0005-11 |

O desenho sustenta 60 fps em notebook e 30 fps em celular intermediário durante uma volta completa na Kart
Park ([FEAT-0007](../features/FEAT-0007-requisitos-transversais.md), NFR-0002).

## Estados

| Estado | Condição | Chamadas | O que a tela mostra | Fonte |
|---|---|---|---|---|
| Carregando | A sessão ainda não está `READY` | nenhuma: a tela só é aberta com sessão pronta | A tela não é exibida; a tela inicial mostra o carregamento | API-0002 |
| Vazio | Nenhum estado de simulação | `getTrackContact` retorna `NO_STATE` | A tela não é exibida; nenhum retorno da zebra | API-0003 |
| Populado | Volta em andamento ou pausada na pista da sessão | `getTrackContact` a cada passo avançado | Asfalto, zebras e barreira desenhados; HUD de `race-lap-validation` e de `dirigibilidade`; vibração ou som da zebra conforme [RULE-0004](../rules/RULE-0004-retorno-da-zebra.md) | AC-US-0002-08, AC-US-0004-06, AC-US-0005-03, AC-US-0005-07, AC-US-0005-09 |
| Erro | Dado da pista ilegível ou de esquema desconhecido | nenhuma | A tela não é aberta: a sessão fica `FAILED` e o erro é exibido na tela inicial | API-0001; I4 |
| Offline | Sem rede | nenhuma chamada de rede | Idêntico ao estado online | NFR-0004; D-FS-08 |
| Permissão negada — sensor (`web-mobile`) | Sem sensor de inclinação ou com permissão negada | nenhuma | O aviso de controle por toque de `race-lap-validation`; a pista, as zebras, a barreira e a vibração não mudam | I4 |
| Permissão negada — vibração (`web-mobile`) | Navegador sem vibração ou que a bloqueia | nenhuma | Nenhuma vibração e nenhum aviso; o resto não muda | US-0005, caso anormal |
| Permissão negada em `web-desktop` | Não se aplica ao sensor; som desligado não é erro | — | Sem som da zebra com o som desligado; o resto não muda | AC-US-0005-11 |

## Ações do Jogador

| Ação | Canal | Resultado |
|---|---|---|
| Pilotar sobre a zebra | ambos | `curbWheelCount` maior que 0: vibração (`web-mobile`) ou som (`web-desktop`, som ligado), pelas regras de [RULE-0004](../rules/RULE-0004-retorno-da-zebra.md) |
| Bater na barreira | ambos | O kart não passa; mesmo efeito do muro existente ([FEAT-0004](../features/FEAT-0004-barreira-nos-trechos-quase-encostados.md)) |
| Pular um marcador | ambos | Ao cruzar a chegada, volta inválida com "marcador pulado", texto de `race-lap-validation` (AC-US-0003-06) |
| Pausar, perder o foco, perder o sensor | ambos | Pausa de `race-lap-validation`; nenhum pulso nem repetição novo durante a pausa |

## Navegação

Entrada pela tela inicial; saída para a tela de resultado ([SCR-0002](SCR-0002-credito-na-tela-de-resultado.md))
ao `ENDED`, como em `race-lap-validation`. Recarregar ou abandonar a página durante a volta não produz
resultado e reabre o jogo na tela inicial com a Kart Park.
