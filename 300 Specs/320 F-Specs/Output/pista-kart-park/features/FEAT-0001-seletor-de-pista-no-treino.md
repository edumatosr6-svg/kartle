---
id: FEAT-0001
title: Seletor de pista no treino
feature: pista-kart-park
stage: fspec
status: validated
version: 1.0.1
sources: [US-0001, AC-US-0001-01, AC-US-0001-02, AC-US-0001-03, AC-US-0001-04, AC-US-0001-05, AC-US-0001-06, AC-US-0001-07]
---

# FEAT-0001 — Seletor de pista no treino

## Resumo

O Jogador escolhe, na tela inicial, a pista do treino entre a Kart Park e a pista sintética
(`DOMAIN/DEC-01`). O jogo sempre abre com a Kart Park selecionada e carregada (`DOMAIN/DEC-06`). Escolher a
outra opção carrega aquela pista: o kart vai para a largada dela, sem volta em andamento. O seletor é só
de treino: nenhuma volta iniciada a partir dele é do desafio diário, e nada dela entra no dado persistido
como tentativa ou resultado (I1, `SEED/RD-09`).

## Canais

`web-desktop` e `web-mobile`: o mesmo seletor, as mesmas duas opções, a mesma pista na abertura e o mesmo
efeito da troca. Em `web-desktop` a opção é escolhida por teclado ou ponteiro; em `web-mobile`, por toque.
Em `web-mobile`, sem sensor de inclinação ou com a permissão negada, o controle recai para toque com estado
visível; o seletor e a pista escolhida não mudam (I4).

## Requisitos

- REQ-FEAT-0001-01: O sistema SHALL exibir na tela inicial um seletor de pista com exatamente duas opções,
  a Kart Park (`trackId` `kart-park`) e a pista sintética (`trackId` `synthetic`) (AC-US-0001-01).
- REQ-FEAT-0001-02: O sistema SHALL ter a Kart Park como opção selecionada no seletor sempre que o jogo
  abre, inclusive depois de recarregar a página, qualquer que tenha sido a pista escolhida antes
  (AC-US-0001-02).
- REQ-FEAT-0001-03: O sistema SHALL NOT gravar nem ler, no navegador, a pista escolhida no seletor
  (AC-US-0001-02; requisitos, `01-context.md`, família "Retenção de dados").
- REQ-FEAT-0001-04: O sistema SHALL carregar a Kart Park numa sessão de treino ao abrir o jogo, sem ação do
  Jogador, como se ela tivesse sido escolhida no seletor (AC-US-0001-02, AC-US-0001-03).
- REQ-FEAT-0001-05: O sistema SHALL, quando o Jogador escolhe no seletor uma opção diferente da pista da
  sessão pronta (`READY`), ou qualquer opção sem sessão pronta, encerrar a sessão corrente e carregar a
  pista escolhida numa sessão nova (AC-US-0001-03, AC-US-0001-04).
- REQ-FEAT-0001-06: O sistema SHALL ter, no estado da volta de toda volta iniciada numa sessão de treino,
  o `trackId` da pista dessa sessão: `kart-park` com a Kart Park escolhida (AC-US-0001-03).
- REQ-FEAT-0001-07: O sistema SHALL ter, no estado da volta de toda volta iniciada numa sessão de treino
  na pista sintética, o `trackId` `synthetic` (AC-US-0001-04).
- REQ-FEAT-0001-08: O sistema SHALL colocar o kart, ao carregar uma pista numa sessão nova, na posição e no
  rumo de largada (`startPosition`) declarados no dado dessa pista (AC-US-0001-06).
- REQ-FEAT-0001-09: O sistema SHALL deixar a sessão nova sem volta em andamento: até o Jogador iniciar uma
  volta, `getLapState` retorna `NO_ACTIVE_LAP` (AC-US-0001-07).
- REQ-FEAT-0001-10: O sistema SHALL descartar, ao encerrar uma sessão com uma volta em `COUNTDOWN`,
  `RUNNING` ou `PAUSED`, essa volta sem produzir resultado, sem continuá-la na pista nova e sem tempo de
  volta ou de setor (AC-US-0001-07; US-0001, caso anormal "Troca de pista com uma volta de treino em
  andamento").
- REQ-FEAT-0001-11: O sistema SHALL oferecer, numa sessão de treino, somente volta de treino: toda volta
  iniciada nela é pedida com `lapKind` `TRAINING` e sem `challengeNumber` (AC-US-0001-05; `DOMAIN/DEC-06`).
- REQ-FEAT-0001-12: O sistema SHALL NOT criar nem alterar, por uma volta de uma sessão de treino, qualquer
  que seja a pista e qualquer que seja o seu fim (concluída, invalidada, descartada), nenhum registro de
  desafio diário (tentativa ou resultado) no dado persistido do navegador (AC-US-0001-05).
- REQ-FEAT-0001-13: O sistema SHALL manter o seletor, a pista da sessão e a posição de largada inalterados
  quando, em `web-mobile`, o sensor de inclinação está ausente ou a permissão é negada, com o controle
  recaindo para toque e o estado exibido em texto [DOMAIN] (I4; US-0001, Canais).
- REQ-FEAT-0001-14: O sistema SHALL, quando o dado da pista escolhida é ilegível ou de versão de esquema
  desconhecida, não abrir sessão pronta nessa pista, exibir o erro na tela inicial e manter as duas opções
  selecionáveis [DOMAIN] (I4; [API-0002](../api/API-0002-catalogo-e-selecao-da-pista-do-treino.md), erros).

## Comportamento

Abertura, escolha e troca de pista: [FLOW-0001](../flows/FLOW-0001-abertura-escolha-e-troca-de-pista.md),
[API-0002](../api/API-0002-catalogo-e-selecao-da-pista-do-treino.md) (`getTrainingTrackOptions`,
`selectTrainingTrack`), [SCR-0001](../screens/SCR-0001-tela-inicial-com-seletor-de-pista.md); estados da
sessão: [RULE-0003](../rules/RULE-0003-sessao-de-treino-e-selecao-de-pista.md). A volta em si (contagem,
início, pausa, fim) é de `race-lap-validation`, sem mudança.

| Situação | Comportamento |
|---|---|
| Jogo aberto | Kart Park selecionada e carregada; kart na largada dela; nenhuma volta em andamento |
| Jogador escolhe a pista sintética | A sessão da Kart Park é encerrada; a pista sintética é carregada; kart na largada dela; nenhuma volta em andamento |
| Jogador escolhe a opção que já é a da sessão | Sem efeito: a sessão continua como está ([API-0002](../api/API-0002-catalogo-e-selecao-da-pista-do-treino.md), idempotência) |
| Jogador inicia uma volta | Volta de treino (`TRAINING`, sem `challengeNumber`) na pista da sessão; o `trackId` do estado da volta é o da sessão |
| Escolha de outra pista com volta em andamento | A volta é descartada sem resultado e não continua na pista nova; kart na largada da pista nova (requisito 10). Pelas telas, o seletor só é alcançado sem volta em andamento (ao abrir e depois da tela de resultado); o descarte vale para qualquer outro caminho |
| Recarregar ou abandonar a página | O jogo abre de novo com a Kart Park selecionada; a volta em andamento não continua e não produz resultado (regra de `race-lap-validation`); nenhum registro de desafio diário |
| Perder o foco da aba durante o treino | A pista da sessão não muda; a volta é pausada pela regra de `race-lap-validation`; nenhum registro de desafio diário |
| Dado da pista escolhida ilegível ou de esquema desconhecido | Erro exibido na tela inicial; nenhuma sessão nessa pista; as duas opções continuam selecionáveis; o arquivo não é alterado (I4) |
| Sensor ausente ou permissão negada (`web-mobile`) | Toque com estado visível; seletor, pista e largada inalterados |
| Rede indisponível | Sem efeito: o catálogo e os arquivos de pista vêm com os arquivos do jogo (D-FS-08, NFR-0004) |
| Desafio diário | Não existe ainda; a pista de cada desafio será decidida pela feature do desafio, não por este seletor (I1) |
| Chave dos resultados | A volta de treino leva `trackId` e `trackVersion` da sessão e não é tentativa nem resultado de desafio: nada é chaveado na data, no relógio ou no nome da pista, e nada é gravado (D-FS-01, I1) |

## Estado

Lê e muda o estado da sessão de treino `sessionState` (`NO_SESSION`, `LOADING`, `READY`, `FAILED`,
[RULE-0003](../rules/RULE-0003-sessao-de-treino-e-selecao-de-pista.md)): `selectTrainingTrack` leva de
`NO_SESSION`, de `FAILED` ou de `READY` com outra pista a `LOADING`, e de `LOADING` a `READY` quando o dado
é utilizável ou a `FAILED` quando não é; com a pista da sessão `READY`, não muda nada. Lê o estado da volta de `race-lap-validation` (`lapPhase`, `lapKind`, `trackId`),
sem mudar o seu modelo; o descarte de uma volta em andamento é o fim da sessão que a continha.

## Configuração

Nenhuma. A pista da abertura (Kart Park) e as duas opções são fixas no catálogo do treino, não
configuráveis; nenhuma configuração existe para escolher outra pista de abertura, forçar uma volta oficial
ou injetar uma sessão.

## Critérios de aceite

- Na tela inicial, o seletor exibe duas opções, a Kart Park e a pista sintética, e nenhuma outra (satisfaz
  AC-US-0001-01; cobre o requisito 01).
- Ao abrir o jogo, e ao reabri-lo depois de escolher a pista sintética e recarregar a página, a opção
  selecionada é a Kart Park, e o navegador não guarda a escolha (satisfaz AC-US-0001-02; cobre os
  requisitos 02, 03 e 04).
- Com a Kart Park escolhida, uma volta iniciada tem `trackId` `kart-park` no estado da volta; com a pista
  sintética, `synthetic` (satisfaz AC-US-0001-03, AC-US-0001-04; cobre os requisitos 04 a 07).
- Depois de uma volta concluída, de uma volta invalidada e de uma volta descartada pela troca de pista, em
  cada uma das duas pistas, o dado persistido no navegador não tem nenhum registro de desafio diário que
  não existisse antes, e as voltas foram pedidas com `TRAINING` sem `challengeNumber` (satisfaz
  AC-US-0001-05; cobre os requisitos 11 e 12).
- Depois de trocar de pista, o kart está na `startPosition` da pista escolhida e `getLapState` retorna
  `NO_ACTIVE_LAP`; uma volta em andamento antes da troca não produziu resultado (satisfaz AC-US-0001-06,
  AC-US-0001-07; cobre os requisitos 05, 08, 09 e 10).
- Em `web-mobile` sem sensor ou com permissão negada, o controle por toque é exibido em texto e o seletor,
  a pista e a largada são os mesmos (cobre o requisito 13).
- Com o arquivo da pista escolhida ilegível, a tela inicial exibe o erro, não oferece volta nessa pista e
  as duas opções continuam selecionáveis (cobre o requisito 14).

## Pontos em aberto

Nenhum.
