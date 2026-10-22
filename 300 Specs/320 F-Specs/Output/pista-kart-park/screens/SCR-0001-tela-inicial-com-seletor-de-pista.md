---
id: SCR-0001
title: Tela inicial com o seletor de pista
feature: pista-kart-park
stage: fspec
status: validated
version: 1.0.1
sources: [US-0001, US-0006, NFR-0004, NFR-0005, AC-US-0001-01, AC-US-0001-02, AC-US-0001-05, AC-US-0006-01, AC-US-0006-02, AC-US-0006-03, AC-US-0006-07, AC-US-0006-08, AC-US-0006-09]
---

# SCR-0001 — Tela inicial com o seletor de pista

## Propósito

O que esta feature acrescenta à tela de início de volta de `race-lap-validation`, que passa a ser a tela
inicial do treino: o seletor de pista com a Kart Park e a pista sintética, a Kart Park selecionada ao abrir,
o nome e o comprimento da Kart Park na opção dela e, com a Kart Park selecionada, a linha de crédito OSM. A
oferta de tipo de volta, os textos de carregamento e de erro e o aviso de controle por toque são os de
`race-lap-validation`, nomeados e não redefinidos; com a sessão de treino, a única volta oferecida é a de
treino. A tela não decide nada da pista nem da volta: pede a seleção e exibe o estado (I2).

## Canal

Ambos, com o mesmo conteúdo. Em `web-desktop`, a opção e a volta são escolhidas por teclado ou ponteiro e o
link é acionado com clique; em `web-mobile`, tudo por toque. A tela usa
[API-0002](../api/API-0002-catalogo-e-selecao-da-pista-do-treino.md) (`getTrainingTrackOptions`,
`selectTrainingTrack`) e `startLap` de `race-lap-validation`.

## Pontos de entrada

Abertura do jogo (e reabertura depois de recarregar a página); saída da tela de resultado de
`race-lap-validation` ([SCR-0002](SCR-0002-credito-na-tela-de-resultado.md)).

## Elementos

| Elemento | Conteúdo | Fonte |
|---|---|---|
| Seletor de pista | Duas opções: "Kart Park — São José dos Pinhais (traçado aproximado)" com "687 m" junto, e "Pista sintética"; uma delas marcada como selecionada (`selectedTrackId`) | AC-US-0001-01, AC-US-0006-07, AC-US-0006-08 |
| Linha de crédito OSM | Só quando a opção selecionada tem `osmCredit`: "© colaboradores do OpenStreetMap", a menção "licença ODbL" e um link para `https://openstreetmap.org/copyright`, na mesma linha | AC-US-0006-01, AC-US-0006-02, AC-US-0006-03 |
| Oferta de volta | A de `race-lap-validation` para a pista da sessão; só volta de treino | AC-US-0001-05 |

Nenhum elemento exibe recorde da pista real (AC-US-0006-09). Nome, comprimento, crédito e "Pista sintética"
são exibidos iguais nos dois idiomas; os demais textos seguem o idioma do navegador, como em
`race-lap-validation`.

## Estados

| Estado | Condição | Chamadas | O que a tela mostra | Fonte |
|---|---|---|---|---|
| Carregando | `sessionState` `NO_SESSION` ou `LOADING` | `getTrainingTrackOptions`; `selectTrainingTrack` em curso | O seletor com as duas opções e a selecionada; a linha de crédito, se a selecionada tem `osmCredit`; o texto de carregamento da pista de `race-lap-validation`; nenhuma oferta de volta | AC-US-0001-01, AC-US-0001-02, AC-US-0006-01 |
| Vazio | Não se aplica ao seletor: o catálogo tem sempre as duas opções. Sem sessão pronta (antes da abertura terminar), é o estado Carregando | `getTrainingTrackOptions` | — | API-0002 |
| Populado | `sessionState` `READY` | `getTrainingTrackOptions` | O seletor, a selecionada, a linha de crédito se a selecionada tem `osmCredit`, e a oferta de volta de treino | AC-US-0001-01, AC-US-0001-02, AC-US-0006-01 a AC-US-0006-03 |
| Erro | `sessionState` `FAILED` (`UNREADABLE` ou `UNSUPPORTED_SCHEMA`) | `selectTrainingTrack` retornou `TRACK_DATA_UNREADABLE` ou `TRACK_SCHEMA_UNSUPPORTED` | O seletor com as duas opções selecionáveis; a linha de crédito se a selecionada tem `osmCredit`; a mensagem de erro do dado da pista de `race-lap-validation`; nenhuma oferta de volta | I4; AC-US-0006-01 |
| Offline | Sem rede | nenhuma chamada de rede | Idêntico ao estado online; o link continua exibido, e o destino pode não abrir | NFR-0004; US-0006, caso anormal "Sem rede" |
| Permissão negada | `web-mobile` sem sensor de inclinação ou com permissão negada | nenhuma | O aviso de controle por toque de `race-lap-validation`; o seletor, a selecionada e a oferta de volta não mudam | I4; US-0001, Canais |
| Permissão negada em `web-desktop` | Não se aplica | — | O canal usa teclado e não pede sensor | US-0001, Canais |

## Ações do Jogador

| Ação | Canal | Resultado |
|---|---|---|
| Escolher a opção que não é a da sessão pronta, ou qualquer opção sem sessão pronta | ambos | `selectTrainingTrack` com o `trackId` da opção: estado Carregando, depois Populado ou Erro; kart na largada da pista; nenhuma volta em andamento |
| Escolher a opção que já é a da sessão pronta | ambos | Sem efeito |
| Escolher volta de treino | ambos | `startLap` com `TRAINING`, o `trackId` e o `trackVersion` da sessão, sem `challengeNumber`; segue para a tela de corrida ([SCR-0003](SCR-0003-kart-park-na-tela-de-corrida.md)) |
| Acionar o link do crédito | ambos | O navegador abre `https://openstreetmap.org/copyright`; a sessão não muda |

## Navegação

Sai para a tela de corrida de `race-lap-validation`, com os acréscimos de
[SCR-0003](SCR-0003-kart-park-na-tela-de-corrida.md), quando `startLap` é aceito. Volta a ela a partir da
tela de resultado ([SCR-0002](SCR-0002-credito-na-tela-de-resultado.md)), com a sessão e a opção
selecionada inalteradas. Recarregar a página volta ao estado Carregando com a Kart Park.
