---
id: SCR-0001
title: Cena de jogo com o Kart 01 e a câmera
feature: modelo-kart-01
stage: fspec
status: draft
version: 1.0.0
sources: [US-0001, US-0002, US-0003, US-0004, US-0005, AC-US-0001-14, AC-US-0001-15, AC-US-0001-16, AC-US-0002-01, AC-US-0002-03, AC-US-0002-04, AC-US-0002-05, AC-US-0002-06, AC-US-0003-01, AC-US-0003-04, AC-US-0003-05, AC-US-0003-06, AC-US-0003-08, AC-US-0003-10, AC-US-0003-11, AC-US-0003-12, AC-US-0004-01, AC-US-0004-02, AC-US-0005-01, AC-US-0005-02, AC-US-0005-03]
---

# SCR-0001 — Cena de jogo com o Kart 01 e a câmera

## Propósito

A cena 3D da pista, onde o Jogador vê o Kart 01 e a pista pela câmera de jogo: a visão geral antes da
contagem, a descida durante a contagem e a câmera de corrida do sinal verde em diante, com o kart animado, a
sombra e os efeitos presos a ele. A cena só exibe o estado que a simulação e a volta informam; nada nela é
decidido aqui (I2). As telas e os elementos sobrepostos à cena — início de volta, contagem, cronômetro,
estado da volta, resultado e HUD — são das features `race-lap-validation` e `dirigibilidade`, nomeados e não
redefinidos: este arquivo especifica só a cena sob eles. Esta feature não acrescenta texto, controle nem
elemento de HUD.

## Canal

Ambos. A leitura usa [API-0001](../api/API-0001-estado-do-kart-para-exibicao.md) (`getKartPose`) e
[API-0003](../api/API-0003-camera-da-cena-exibida.md) (`getCameraView`).

| Aspecto | `web-desktop` | `web-mobile` |
|---|---|---|
| Entrada de pilotagem | teclado | inclinação e toque; só toque sem sensor ou sem permissão |
| Forma da área de jogo | paisagem; retrato só com a janela mais alta que larga | paisagem ou retrato, conforme o Jogador segura o celular |
| Campo de visão em corrida | 62° na vertical em paisagem; em retrato, horizontal ≥ 60° e vertical ≥ 62° | o mesmo, pela forma |
| Modelo, animação, sombra, efeitos, pose da câmera | os mesmos | os mesmos |
| Taxa de quadros exigida | ≥ 60 fps no notebook de referência | ≥ 30 fps no celular intermediário de referência, nas duas orientações |
| Estado offline | igual (sem rede, tudo funciona) | igual |

## Pontos de entrada

Abertura da pista no jogo, depois da leitura do dado de pista por `race-lap-validation`. A cena fica sob a
tela de início de volta, a tela da corrida e a tela de resultado daquela feature e muda de modo com a fase
da volta ([RULE-0002](../rules/RULE-0002-camera-de-jogo.md)).

## Estados

| Estado | Condição | Chamadas | O que a cena mostra | Fonte |
|---|---|---|---|---|
| Carregando | O dado de pista ainda está sendo lido | `getCameraView` retorna `NO_SCENE`; `getKartPose` retorna `NO_STATE` | Nenhuma cena; a tela de carregamento é de `race-lap-validation`. O modelo não tem carregamento próprio: é montado pelo próprio jogo | US-0001, caso anormal "Recurso do modelo indisponível" |
| Vazio | Nenhuma pista disponível | `getCameraView` retorna `NO_SCENE` | Nenhuma cena; o texto "nenhuma pista disponível" é de `race-lap-validation` | AC-US-0003-10 |
| Visão geral | Pista carregada, sem volta ativa, ou volta encerrada | `getCameraView` (`TRACK_OVERVIEW`); `getKartPose` quando há estado | A pista vista do alto, inteira no quadro; se um kart é exibido, é o Kart 01 com a sua sombra, nunca o kart provisório | AC-US-0003-10, AC-US-0001-14 |
| Contagem | `lapPhase` `COUNTDOWN` | `getCameraView` (`COUNTDOWN_DESCENT`); `getKartPose` | A câmera desce da visão geral para trás do piloto; o Kart 01 parado na largada | AC-US-0003-11, AC-US-0001-14 |
| Em corrida (populado) | `lapPhase` `RUNNING`, do quadro do sinal verde em diante | `getCameraView` (`RACE_CHASE`); `getKartPose` em todos os quadros | O Kart 01 na pose da simulação, com rodas esterçando e girando, volante e mãos no aro; câmera a 1,38 m, 3,05 m atrás, mirando 3,2 m à frente a 0,30 m; o campo de visão da forma; sombra junto ao kart; número 01 na placa do para-choque; marcas de pneu, fumaça e indicação de drift presas ao kart | AC-US-0001-15, AC-US-0001-16, AC-US-0002-01, AC-US-0002-03 a AC-US-0002-06, AC-US-0003-01, AC-US-0003-04 a AC-US-0003-06, AC-US-0003-08, AC-US-0003-12, AC-US-0005-01 a AC-US-0005-03 |
| Pausada | `lapPhase` `PAUSED` (pausa, perda de foco, perda do sensor) | `getCameraView`; `getKartPose` (devolve o último passo) | Kart, rodas, volante, câmera e efeitos parados no último estado; na contagem, a descida parada | US-0002, US-0003 e US-0005, casos anormais "Pausa" |
| Erro | Dado de pista ilegível ou de esquema não suportado: nenhuma pista carregada | `getCameraView` retorna `NO_SCENE` | Nenhuma cena; a mensagem de erro é de `race-lap-validation`; nenhum kart provisório é exibido em lugar do Kart 01 | AC-US-0001-14 |
| Offline | Sem rede | nenhuma chamada de rede | Nenhuma diferença: modelo, câmera e efeitos são locais; nenhum aviso de rede | RNF08, D-FS-08 |
| Permissão negada | `web-mobile` com sensor ausente ou permissão negada | as mesmas do estado corrente | O controle recai para toque com estado visível (I4), exibido pela tela da corrida; a cena não muda | US-0001 a US-0005, Canais |
| Permissão negada em `web-desktop` | Não se aplica | — | O canal usa teclado; não pede sensor | US-0003, Canais |
| Troca de forma | Troca de orientação ou redimensionamento | `getCameraView` no quadro seguinte | Em corrida, o campo de visão da nova forma, a mesma pose; na visão geral, a pista inteira na nova forma | US-0003, caso anormal |

A taxa de quadros exigida no estado Em corrida é a de [FEAT-0004](../features/FEAT-0004-desempenho-do-kart-01.md)
(AC-US-0004-01, AC-US-0004-02).

## Ações do Jogador

| Ação | Canal | Resultado na cena |
|---|---|---|
| Esterçar, acelerar, frear | ambos | O kart, as rodas, o volante e as mãos mostram o estado da simulação no quadro seguinte ([FLOW-0001](../flows/FLOW-0001-quadro-de-exibicao-em-corrida.md)) |
| Iniciar uma volta (tela de `race-lap-validation`) | ambos | A visão geral passa à descida ([FLOW-0002](../flows/FLOW-0002-largada-visao-geral-descida-e-pose-de-corrida.md)) |
| Pausar, perder o foco, perder o sensor | conforme a tela da corrida | Estado Pausada |
| Reposicionar o kart (tela de `race-lap-validation`) | ambos | Kart, câmera e efeitos na nova posição no quadro seguinte, sem quadro intermediário |
| Girar o celular ou redimensionar a janela | ambos | Estado Troca de forma |

Não há ação de escolher kart, cor, adesivo ou câmera (I10).

## Navegação

Nenhuma navegação própria: a cena vive sob as telas de `race-lap-validation` e muda de modo com a fase da
volta. Do início de volta para a contagem, da contagem para a corrida e da corrida, no fim da volta, para a
visão geral sob a tela de resultado.
