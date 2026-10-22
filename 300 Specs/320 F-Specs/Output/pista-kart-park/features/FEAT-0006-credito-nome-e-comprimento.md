---
id: FEAT-0006
title: Crédito, nome e comprimento da Kart Park
feature: pista-kart-park
stage: fspec
status: validated
version: 1.0.1
sources: [US-0006, NFR-0005, NFR-0012, AC-US-0006-01, AC-US-0006-02, AC-US-0006-03, AC-US-0006-04, AC-US-0006-05, AC-US-0006-06, AC-US-0006-07, AC-US-0006-08, AC-US-0006-09]
---

# FEAT-0006 — Crédito, nome e comprimento da Kart Park

## Resumo

Onde o Jogador vê a Kart Park, o dado é creditado: o seletor de pista, com a Kart Park selecionada, e a
tela de resultado de uma volta na Kart Park exibem a linha de crédito OSM — "© colaboradores do
OpenStreetMap", a menção à licença ODbL e o link para `https://openstreetmap.org/copyright`
(`DOMAIN/DEC-07`, RNF09). A Kart Park é apresentada como "Kart Park — São José dos Pinhais (traçado
aproximado)", com o comprimento de 687 m, e o recorde real de 41,45 s não aparece em nenhuma tela
(`DOMAIN/DEC-04`). O crédito da Esri só entra se a licença for liberada (`DOMAIN/DEC-07`, NFR-0012).

## Canais

`web-desktop` e `web-mobile`: o mesmo crédito, nas mesmas duas telas, com o mesmo nome e o mesmo
comprimento; o link é acionado com clique em `web-desktop` e com toque em `web-mobile`. Em `web-mobile`,
sem sensor ou com permissão negada, o controle recai para toque com estado visível; crédito e nome não
mudam (I4).

## Requisitos

- REQ-FEAT-0006-01: O sistema SHALL exibir no seletor de pista, com a Kart Park selecionada, o texto
  "© colaboradores do OpenStreetMap" (AC-US-0006-01).
- REQ-FEAT-0006-02: O sistema SHALL exibir no seletor de pista, com a Kart Park selecionada, a menção
  "licença ODbL" (AC-US-0006-02).
- REQ-FEAT-0006-03: O sistema SHALL exibir no seletor de pista, com a Kart Park selecionada, um link cujo
  destino é `https://openstreetmap.org/copyright` (AC-US-0006-03).
- REQ-FEAT-0006-04: O sistema SHALL exibir na tela de resultado de uma volta na Kart Park o texto
  "© colaboradores do OpenStreetMap" (AC-US-0006-04).
- REQ-FEAT-0006-05: O sistema SHALL exibir na tela de resultado de uma volta na Kart Park a menção
  "licença ODbL" (AC-US-0006-05).
- REQ-FEAT-0006-06: O sistema SHALL exibir na tela de resultado de uma volta na Kart Park um link cujo
  destino é `https://openstreetmap.org/copyright` (AC-US-0006-06).
- REQ-FEAT-0006-07: O sistema SHALL exibir o nome da Kart Park, em toda tela que o exibe, como
  "Kart Park — São José dos Pinhais (traçado aproximado)" (AC-US-0006-07).
- REQ-FEAT-0006-08: O sistema SHALL exibir, junto a todo nome exibido da Kart Park, o comprimento "687 m",
  qualquer que seja o comprimento medido da linha central suavizada (AC-US-0006-08).
- REQ-FEAT-0006-09: O sistema SHALL NOT exibir em nenhuma tela o recorde de 41,45 s da pista real, nem
  carregar recorde da pista real no catálogo do treino ou no arquivo de pista gerado (AC-US-0006-09).
- REQ-FEAT-0006-10: O sistema SHALL exibir o crédito OSM somente para pista cuja entrada do catálogo do
  treino declara `osmCredit` verdadeiro, que é a Kart Park e não a pista sintética (AC-US-0006-01,
  AC-US-0006-02, AC-US-0006-03, AC-US-0006-04, AC-US-0006-05, AC-US-0006-06: o crédito é exigido com a Kart
  Park; [DOMAIN] I6: o crédito acompanha o dado derivado do OpenStreetMap; US-0006, caso anormal "Pista
  sintética selecionada"; RNF09: crédito quando houver dado OSM).
- REQ-FEAT-0006-11: O sistema SHALL exibir o nome, o comprimento e os textos do crédito da Kart Park iguais
  nos dois idiomas do jogo, sem tradução (AC-US-0006-01, AC-US-0006-07: textos fixados sem condição de
  idioma).
- REQ-FEAT-0006-12: O sistema SHALL exibir o crédito nas duas telas sem depender de rede: o texto, a menção
  e o link continuam exibidos sem conexão (US-0006, caso anormal "Sem rede"; NFR-0005).
- REQ-FEAT-0006-13: O sistema SHALL exibir o crédito OSM completo (texto, menção e link) em 100 % das duas
  telas, o seletor com a Kart Park selecionada e a tela de resultado de uma volta na Kart Park, em
  `web-desktop` e em `web-mobile` (NFR-0005).
- REQ-FEAT-0006-14: O sistema SHALL, se a decisão do dono do produto registrada em `DOMAIN.md` liberar a
  licença Esri, exibir a partir da liberação, junto ao crédito OSM nas mesmas duas telas, o crédito da Esri
  no texto que essa decisão fixar (NFR-0012; `DOMAIN/DEC-07`).

## Comportamento

Catálogo e indicação de crédito: [API-0002](../api/API-0002-catalogo-e-selecao-da-pista-do-treino.md)
(`displayName`, `displayLengthM`, `osmCredit`). Telas: [SCR-0001](../screens/SCR-0001-tela-inicial-com-seletor-de-pista.md)
(seletor), [SCR-0002](../screens/SCR-0002-credito-na-tela-de-resultado.md) (resultado). A proveniência do
arquivo é `osmDerived` de [API-0001](../api/API-0001-dado-de-pista-com-geometria-zebras-e-barreiras.md);
a publicação condicionada à licença é [RULE-0005](../rules/RULE-0005-versao-e-publicacao-da-pista.md).

| Situação | Comportamento |
|---|---|
| Kart Park selecionada no seletor | Linha de crédito OSM no seletor; a opção da Kart Park exibe o nome e "687 m" |
| Pista sintética selecionada | Sem linha de crédito: ela não tem dado OSM; a opção da Kart Park continua exibindo o nome e "687 m" |
| Tela de resultado de uma volta na Kart Park, válida ou inválida | Linha de crédito OSM, além do conteúdo de `race-lap-validation`, sem mudança |
| Tela de resultado de uma volta na pista sintética | Sem linha de crédito; conteúdo de `race-lap-validation`, sem mudança |
| Arquivo da Kart Park ilegível, com a Kart Park selecionada | O crédito continua exibido no seletor: vem do catálogo, não do arquivo |
| Jogador aciona o link | O navegador abre `https://openstreetmap.org/copyright`; é a única navegação a outro serviço, e só por ação do Jogador (NFR-0004). Se em outra aba, a perda de foco pausa a volta como hoje |
| Sem rede | O crédito continua exibido; o destino do link pode não abrir |
| Comprimento suavizado diferente de 687,5 m (dentro de ± 1 %) | O comprimento exibido continua "687 m" |
| Idioma do navegador inglês ou outro | Nome e crédito em português, iguais; os demais textos seguem `race-lap-validation` |
| Licença Esri ainda sem decisão | Só o crédito OSM; a Kart Park fica só em staging ([RULE-0005](../rules/RULE-0005-versao-e-publicacao-da-pista.md)) |
| Sensor ausente ou permissão negada (`web-mobile`) | Crédito e nome inalterados |

## Estado

Não define estados próprios. Lê a sessão de treino ([RULE-0003](../rules/RULE-0003-sessao-de-treino-e-selecao-de-pista.md))
para saber a pista selecionada e o `trackId` do resultado de `race-lap-validation` para saber de que pista
é a volta.

## Configuração

Nenhuma. Nome, comprimento exibido e indicação de crédito são dados fixos do catálogo do treino; o crédito
da Esri não tem chave de configuração: ele entra numa entrega nova, depois da decisão.

## Critérios de aceite

- Com a Kart Park selecionada, o seletor exibe "© colaboradores do OpenStreetMap", "licença ODbL" e o link
  para `https://openstreetmap.org/copyright`, nos dois canais, com e sem rede (satisfaz AC-US-0006-01,
  AC-US-0006-02, AC-US-0006-03; cobre os requisitos 01, 02, 03, 12 e 13).
- A tela de resultado de uma volta válida e a de uma volta inválida na Kart Park exibem os mesmos três
  elementos, nos dois canais; a de uma volta na pista sintética não exibe crédito (satisfaz AC-US-0006-04,
  AC-US-0006-05, AC-US-0006-06; cobre os requisitos 04, 05, 06, 10, 12 e 13).
- Toda tela que exibe o nome da Kart Park o exibe como "Kart Park — São José dos Pinhais (traçado
  aproximado)", com "687 m" junto, nos dois idiomas (satisfaz AC-US-0006-07, AC-US-0006-08; cobre os
  requisitos 07, 08 e 11).
- Nenhuma tela exibe "41,45" nem outro recorde da pista real, e nem o catálogo nem o arquivo gerado têm
  campo de recorde (satisfaz AC-US-0006-09; cobre o requisito 09).
- Na entrega que promover a Kart Park a produção depois de uma decisão que libere a licença Esri, as duas
  telas exibem também o crédito da Esri no texto da decisão (cobre o requisito 14).

## Pontos em aberto

Nenhum.
