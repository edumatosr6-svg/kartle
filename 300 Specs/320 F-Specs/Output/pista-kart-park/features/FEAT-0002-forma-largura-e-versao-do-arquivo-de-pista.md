---
id: FEAT-0002
title: Forma, largura e versão do arquivo de pista da Kart Park
feature: pista-kart-park
stage: fspec
status: validated
version: 1.0.1
sources: [US-0002, NFR-0001, NFR-0006, AC-US-0002-01, AC-US-0002-02, AC-US-0002-03, AC-US-0002-04, AC-US-0002-05, AC-US-0002-06, AC-US-0002-07, AC-US-0002-08]
---

# FEAT-0002 — Forma, largura e versão do arquivo de pista da Kart Park

## Resumo

O arquivo de pista gerado dá à Kart Park a forma da pista real, como traçado aproximado: a linha central do
arquivo de origem convertida para metros nos eixos do jogo e suavizada sem se afastar mais de 0,30 m da
original (`DOMAIN/DEC-09`), fechada no ponto 0, com 687,5 m ± 1 % no sentido anti-horário, a largura do
asfalto de cada ponto copiada da origem e as bordas sem cruzamento. A simulação usa esse dado como está. A
Kart Park é publicada como `trackVersion` 1, num arquivo menor que 200.000 bytes, e uma versão publicada
nunca muda (I3, I5).

## Canais

`web-desktop` e `web-mobile`: a mesma geometria, a mesma largura e o mesmo sentido; a forma da pista é dado
lido pela simulação e não depende do canal (I2). O preparo do arquivo é offline, do Curador do catálogo,
sem canal de jogo. Em `web-mobile`, sem sensor ou com permissão negada, o controle recai para toque com
estado visível; a pista não muda (I4).

## Requisitos

- REQ-FEAT-0002-01: O arquivo de pista gerado SHALL declarar `trackId` `kart-park` e `trackVersion` 1
  (NFR-0006).
- REQ-FEAT-0002-02: O arquivo de pista gerado SHALL declarar `schemaVersion` 3 [DOMAIN] (I3, I5: a forma
  com linha central é mudança versionada; `01-overview.md`, decisões de forma).
- REQ-FEAT-0002-03: O arquivo de pista gerado SHALL ter na `centerline` a mesma quantidade de pontos que o
  arquivo de origem (684), na mesma ordem, de modo que o ponto *i* gerado é o ponto correspondente do ponto
  *i* da origem (AC-US-0002-05, AC-US-0002-06).
- REQ-FEAT-0002-04: O arquivo de pista gerado SHALL ter a `centerline` fechada: a volta segue do último
  ponto de volta ao ponto 0, e o ponto 0 não é repetido no fim da lista (AC-US-0002-01).
- REQ-FEAT-0002-05: O arquivo de pista gerado SHALL ter o comprimento da volta fechada da linha central
  suavizada, soma dos 684 segmentos incluindo o do último ponto ao ponto 0, entre 680,625 m e 694,375 m
  (AC-US-0002-02).
- REQ-FEAT-0002-06: O arquivo de pista gerado SHALL declarar a `startPosition` sobre o segmento da linha
  central do ponto 0 ao ponto 1, depois da linha de largada no sentido de corrida e antes do ponto 1, com o
  rumo desse segmento (AC-US-0002-03).
- REQ-FEAT-0002-07: O arquivo de pista gerado SHALL ter as coordenadas em metros nos eixos do jogo, com
  leste = +x e norte = −z (AC-US-0002-04; `SEED/RE-03` via US-0002).
- REQ-FEAT-0002-08: O arquivo de pista gerado SHALL ter a linha central, percorrida na ordem dos pontos,
  girando no sentido anti-horário visto de cima, com área com sinal positiva no plano (x, −z), e declarar
  `direction` `COUNTER_CLOCKWISE` (AC-US-0002-04).
- REQ-FEAT-0002-09: O arquivo de pista gerado SHALL ter em cada ponto `widthM` igual à largura do ponto
  correspondente do arquivo de origem, sem largura fixa (AC-US-0002-05).
- REQ-FEAT-0002-10: O arquivo de pista gerado SHALL ter cada ponto da linha central suavizada a no máximo
  0,30 m da linha central original, medido até a poligonal fechada original (AC-US-0002-06).
- REQ-FEAT-0002-11: O arquivo de pista gerado SHALL ter as duas bordas do asfalto sem cruzamento em toda a
  volta, o que inclui o grampo mais fechado (raio ≈ 6 m, perto de 218 m): nenhuma borda cruza a si mesma
  nem a outra (AC-US-0002-07).
- REQ-FEAT-0002-12: O sistema SHALL usar, no estado da simulação com a Kart Park carregada, a linha central
  e as larguras do arquivo de pista gerado exatamente como declaradas, sem suavizar, reamostrar nem
  converter ao carregar (AC-US-0002-08).
- REQ-FEAT-0002-13: O sistema SHALL desenhar, na tela de corrida, o asfalto da Kart Park com a linha
  central e as larguras do arquivo de pista gerado [DOMAIN] (I2: a tela só desenha o dado; US-0002,
  Canais).
- REQ-FEAT-0002-14: O arquivo de pista gerado da Kart Park SHALL ter menos de 200.000 bytes, como é
  entregue ao navegador (NFR-0001).
- REQ-FEAT-0002-15: O sistema SHALL ler um arquivo de pista em `schemaVersion` 2 como antes desta feature,
  com a geometria existente da pista sintética, sem exigir nenhum campo de [API-0001](../api/API-0001-dado-de-pista-com-geometria-zebras-e-barreiras.md)
  [DOMAIN] (I3, I5; NFR-0009: a pista sintética não muda).
- REQ-FEAT-0002-16: O sistema SHALL tratar como `UNREADABLE` um arquivo em `schemaVersion` 3 cuja
  `centerline` falta, tem menos de 3 pontos ou tem um `widthM` não positivo, sem alterá-lo [DOMAIN] (I4).
- REQ-FEAT-0002-17: O arquivo de cada versão publicada da Kart Park SHALL ficar idêntico byte a byte ao
  publicado, com o resumo criptográfico registrado na publicação (NFR-0006).
- REQ-FEAT-0002-18: Toda mudança na linha central, numa largura, numa zebra, na barreira, nos setores ou
  nos marcadores da Kart Park SHALL ser publicada como arquivo novo com `trackVersion` maior que o da versão
  anterior, nunca como edição de uma versão publicada (NFR-0006).

## Comportamento

Preparo, verificação e publicação: [FLOW-0003](../flows/FLOW-0003-preparo-e-publicacao-do-arquivo-de-pista.md),
[RULE-0002](../rules/RULE-0002-geometria-e-verificacoes-do-arquivo-de-pista.md) (definições e cálculo de
cada verificação), [RULE-0005](../rules/RULE-0005-versao-e-publicacao-da-pista.md). Leitura:
[API-0001](../api/API-0001-dado-de-pista-com-geometria-zebras-e-barreiras.md). Desenho:
[SCR-0003](../screens/SCR-0003-kart-park-na-tela-de-corrida.md).

| Situação | Comportamento |
|---|---|
| Arquivo gerado que passa nas verificações de [RULE-0002](../rules/RULE-0002-geometria-e-verificacoes-do-arquivo-de-pista.md) | Publicável como `trackVersion` 1 (só em staging até a decisão sobre a licença Esri, [RULE-0005](../rules/RULE-0005-versao-e-publicacao-da-pista.md)) |
| Suavização que afasta algum ponto mais de 0,30 m, comprimento fora de 680,625–694,375 m ou bordas que se cruzam | O arquivo reprova e não é publicado; a correção é feita no preparo offline, nunca no jogo (I10) |
| Conversão com outro mapeamento de eixos | O circuito fica espelhado e gira no sentido horário; o arquivo reprova na verificação de sentido |
| Diferença para o traçado oficial de 750 m | Aceita; informada pelo nome "traçado aproximado" ([FEAT-0006](FEAT-0006-credito-nome-e-comprimento.md)) |
| Largura geral "do OSM quando houver, senão 8 m" | Não se aplica à Kart Park: a largura medida ponto a ponto é desvio aceito (`SEED/RD-03`) |
| Mudança de esquema (versão 3) | Declarada e versionada (I3, I5): leitor da versão 2 mantido e um ensaio de `npm test` lendo a forma 2 e a forma 3. Nenhum arquivo existente é reescrito e nenhum dado de jogador muda, então não há migração de dado a fazer; reverter é retirar o arquivo da Kart Park e o seletor, sem tocar no da pista sintética |
| Arquivo em `schemaVersion` 2 (pista sintética) | Lido como hoje, sem mudança |
| Arquivo em `schemaVersion` 3 sem linha central utilizável | `UNREADABLE`: nenhuma sessão nessa pista; o arquivo fica intacto |
| Arquivo em `schemaVersion` maior que 3 | `UNSUPPORTED_SCHEMA`, regra de `race-lap-validation`; intacto e reportado |
| Mudança depois de publicada | Versão nova; a publicada não é editada |
| Rede indisponível | Sem efeito: o arquivo vem com os arquivos do jogo |

## Estado

Não define estado de execução: o arquivo de pista é dado imutável por versão. O estado de publicação de uma
versão (`publicationState`: `PREPARED`, `REJECTED`, `VERIFIED`, `STAGING`, `PRODUCTION`) é o de
[RULE-0005](../rules/RULE-0005-versao-e-publicacao-da-pista.md).

## Configuração

Nenhuma. A tolerância de 0,30 m, a faixa de comprimento e o limite de tamanho são verificações do arquivo,
não configuração do jogo.

## Critérios de aceite

- O arquivo gerado declara `trackId` `kart-park`, `trackVersion` 1, `schemaVersion` 3 e `direction`
  `COUNTER_CLOCKWISE` (cobre os requisitos 01, 02 e 08).
- A `centerline` tem 684 pontos, sem repetir o ponto 0 no fim, e a soma dos 684 segmentos fica entre
  680,625 m e 694,375 m (satisfaz AC-US-0002-01, AC-US-0002-02; cobre os requisitos 03, 04 e 05).
- A `startPosition` está sobre o segmento do ponto 0 ao ponto 1, depois da linha no ponto 0 (satisfaz
  AC-US-0002-03; cobre o requisito 06).
- A área com sinal da `centerline` no plano (x, −z) é positiva (satisfaz AC-US-0002-04; cobre os requisitos
  07 e 08).
- Para cada *i*, `widthM` do ponto *i* é igual à largura do ponto *i* da origem; os valores variam de
  4,4 m a 10,8 m (satisfaz AC-US-0002-05; cobre os requisitos 03 e 09).
- A distância de cada ponto gerado até a poligonal original é de no máximo 0,30 m (satisfaz AC-US-0002-06;
  cobre o requisito 10).
- As bordas esquerda e direita não têm autointerseção nem interseção entre si (satisfaz AC-US-0002-07;
  cobre o requisito 11).
- Com a Kart Park carregada, a linha central e as larguras lidas no estado da simulação são iguais às do
  arquivo, ponto a ponto; a tela de corrida desenha o asfalto com elas (satisfaz AC-US-0002-08; cobre os
  requisitos 12 e 13).
- O arquivo entregue ao navegador mede menos de 200.000 bytes (cobre o requisito 14).
- O arquivo da pista sintética em `schemaVersion` 2 é lido sem erro e sem mudança; um arquivo em
  `schemaVersion` 3 sem `centerline` é `UNREADABLE` e fica intacto (cobre os requisitos 15 e 16).
- O resumo do arquivo publicado é igual ao registrado na publicação; o histórico de publicação não tem
  duas versões com o mesmo `trackVersion` e conteúdo diferente (cobre os requisitos 17 e 18).

## Pontos em aberto

Nenhum.
