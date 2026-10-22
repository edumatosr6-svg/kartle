---
id: SCR-0002
title: Crédito na tela de resultado da volta
feature: pista-kart-park
stage: fspec
status: validated
version: 1.0.1
sources: [US-0006, US-0003, NFR-0005, AC-US-0003-11, AC-US-0006-04, AC-US-0006-05, AC-US-0006-06, AC-US-0006-09]
---

# SCR-0002 — Crédito na tela de resultado da volta

## Propósito

O que esta feature acrescenta à tela de resultado da volta de `race-lap-validation`: a linha de crédito OSM
quando a volta é na Kart Park. O resto da tela (validade, motivo, tempo total, quatro tempos de setor em
`m:ss.mmm`, "não oficial" para a volta de treino) é de `race-lap-validation`, nomeado e não redefinido, e
vale na Kart Park como na pista sintética (AC-US-0003-11). A tela não decide a validade nem o tempo: só os
exibe (I2).

## Canal

Ambos, com o mesmo conteúdo; o link é acionado com clique em `web-desktop` e com toque em `web-mobile`. A
tela usa `getLapResult` de `race-lap-validation` para o `trackId` da volta e
[API-0002](../api/API-0002-catalogo-e-selecao-da-pista-do-treino.md) (`getTrainingTrackOptions`) para saber
se essa pista tem `osmCredit`.

## Pontos de entrada

Fim da volta (`ENDED`), a partir da tela de corrida ([SCR-0003](SCR-0003-kart-park-na-tela-de-corrida.md)).

## Elementos acrescentados

| Elemento | Conteúdo | Fonte |
|---|---|---|
| Linha de crédito OSM | Só quando a entrada do catálogo do `trackId` da volta tem `osmCredit`: "© colaboradores do OpenStreetMap", a menção "licença ODbL" e um link para `https://openstreetmap.org/copyright`, na mesma linha, iguais nos dois idiomas | AC-US-0006-04, AC-US-0006-05, AC-US-0006-06 |

A tela não exibe recorde da pista real nem comparação com tempos reais (AC-US-0006-09).

## Estados

| Estado | Condição | Chamadas | O que a tela mostra | Fonte |
|---|---|---|---|---|
| Carregando | `ENDED` ocorreu e o resultado é lido no mesmo quadro | `getLapResult`, `getTrainingTrackOptions` | Nenhum estado visível próprio, como em `race-lap-validation` | AC-US-0006-04 |
| Vazio | Não há volta encerrada | `getLapResult` retorna `NO_RESULT` | A tela não é exibida; nenhuma linha de crédito | `race-lap-validation` |
| Populado — Kart Park | Resultado com `trackId` `kart-park`, válido ou inválido | `getLapResult`, `getTrainingTrackOptions` | O conteúdo de `race-lap-validation` e a linha de crédito OSM | AC-US-0003-11, AC-US-0006-04 a AC-US-0006-06 |
| Populado — pista sintética | Resultado com `trackId` `synthetic` | `getLapResult`, `getTrainingTrackOptions` | O conteúdo de `race-lap-validation`, sem linha de crédito | US-0006, caso anormal "Pista sintética selecionada" |
| Erro | Resultado ausente com a volta `ENDED`, ou `trackId` fora do catálogo | `getLapResult` | Nenhuma mensagem própria; sem linha de crédito para pista fora do catálogo | `race-lap-validation`; API-0002 |
| Offline | Sem rede | nenhuma chamada de rede | Idêntico ao estado online; o link continua exibido, e o destino pode não abrir | NFR-0005; US-0006, caso anormal "Sem rede" |
| Permissão negada | Não se aplica | — | O resultado e o crédito não dependem de sensor nem de permissão | US-0006, Canais |

## Ações do Jogador

| Ação | Canal | Resultado |
|---|---|---|
| Acionar o link do crédito | ambos | O navegador abre `https://openstreetmap.org/copyright`; o resultado não muda e nada é gravado |
| Sair da tela | ambos | Volta à tela inicial ([SCR-0001](SCR-0001-tela-inicial-com-seletor-de-pista.md)), como em `race-lap-validation` |

## Navegação

Entrada pela tela de corrida ao `ENDED`; saída para a tela inicial ([SCR-0001](SCR-0001-tela-inicial-com-seletor-de-pista.md)),
com a sessão de treino e a pista selecionada inalteradas.
