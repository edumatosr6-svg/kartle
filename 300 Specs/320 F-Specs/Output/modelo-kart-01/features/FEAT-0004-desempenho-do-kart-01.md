---
id: FEAT-0004
title: Desempenho do Kart 01 — taxa de quadros e custo de desenho
feature: modelo-kart-01
stage: fspec
status: draft
version: 1.0.0
sources: [US-0004, NFR-0001, NFR-0004, AC-US-0004-01, AC-US-0004-02]
---

# FEAT-0004 — Desempenho do Kart 01

## Resumo

O kart novo não deixa o jogo mais lento: com o Kart 01, a sua sombra e a câmera de corrida, a taxa de
quadros sustentada numa volta completa é de pelo menos 60 fps no notebook de referência e de pelo menos
30 fps no celular intermediário de referência de RNF03, em paisagem e em retrato. Para isso, as 124 malhas do
código do Cowork são agrupadas por material até no máximo 30 chamadas de desenho do kart com o piloto, sem
mudar a forma: o modelo montado continua com 5.128 triângulos (`DOMAIN/DEC-01`).

## Canais

- `web-desktop`: pelo menos 60 fps no notebook de referência de RNF03.
- `web-mobile`: pelo menos 30 fps no celular intermediário de referência de RNF03, em paisagem e em retrato;
  uma execução em desktop não vale como evidência para celular (I9). Com sensor ausente ou permissão negada,
  o controle recai para toque com estado visível (I4); o limite é o mesmo.
- Verificação em `npm test`, sem canal de jogo: chamadas de desenho e triângulos do modelo montado
  ([API-0002](../api/API-0002-relatorio-do-modelo-montado.md), `DRAW_COST`).

## Requisitos

- REQ-FEAT-0004-01: O sistema SHALL manter, em `web-desktop`, no notebook de referência de RNF03, taxa de
  quadros sustentada de pelo menos 60 fps em todos os segundos de uma volta completa em corrida, com o
  Kart 01, a sua sombra e a câmera de corrida em cena (AC-US-0004-01; NFR-0001).
- REQ-FEAT-0004-02: O sistema SHALL manter, em `web-mobile`, no celular intermediário de referência de RNF03,
  taxa de quadros sustentada de pelo menos 30 fps em todos os segundos de uma volta completa em corrida, com
  o Kart 01, a sua sombra e a câmera de corrida em cena, em paisagem e em retrato (AC-US-0004-02; NFR-0001).
- REQ-FEAT-0004-03: O sistema SHALL desenhar o kart com o piloto com no máximo 30 chamadas de desenho,
  contadas como uma por malha e por material de cada malha do modelo montado, reportadas em `drawCallCount`
  do registro `DRAW_COST` da saída de `npm test` (NFR-0004).
- REQ-FEAT-0004-04: O sistema SHALL manter o modelo montado, kart com o piloto, com 5.128 triângulos depois do
  agrupamento por material, o mesmo número medido no código do Cowork, reportado em `triangleCount` do
  registro `DRAW_COST` (NFR-0004).
- REQ-FEAT-0004-05: O sistema SHALL ter cada medida de taxa de quadros registrada em teste no aparelho
  nomeado, com o aparelho, o navegador, a orientação, a contagem de quadros de cada segundo da volta e a
  menor delas, numa volta completa em corrida com a aba em primeiro plano e sem intervalo em pausa, sem
  usar uma execução em desktop como evidência para celular [DOMAIN] (I9; NFR-0001, "Como é observado";
  US-0004, casos anormais "Aba em segundo plano ou pausa" e "Execução só em desktop para o limite de
  celular").

## Comportamento

Custo de desenho: [RULE-0001](../rules/RULE-0001-medidas-grupos-e-cores-do-kart-01.md),
[FLOW-0003](../flows/FLOW-0003-verificacao-do-modelo-montado.md),
[API-0002](../api/API-0002-relatorio-do-modelo-montado.md). O quadro medido é o de
[FLOW-0001](../flows/FLOW-0001-quadro-de-exibicao-em-corrida.md), com a câmera de corrida de
[RULE-0002](../rules/RULE-0002-camera-de-jogo.md) e a sombra de
[FEAT-0001](FEAT-0001-kart-01-na-pista.md).

| Situação | Comportamento |
|---|---|
| Taxa abaixo do limite no aparelho de referência | O requisito 01 ou 02 não é atendido; o custo do kart é reduzido sem mudar a forma (agrupamento por material), nunca o limite; a sombra continua (`DOMAIN/DEC-05`) |
| Mais de 30 chamadas de desenho | `DRAW_COST` dá `FAIL` com `LIMIT_EXCEEDED` |
| Contagem de triângulos diferente de 5.128 | `DRAW_COST` dá `FAIL` com `SHAPE_CHANGED`: o agrupamento mudou a forma |
| Agrupamento que junta rodas, volante ou braços com outras peças a ponto de não poderem mais girar um a um | Não atende o requisito 10 de [FEAT-0002](FEAT-0002-kart-reage-aos-comandos.md) |
| Aparelho abaixo do de referência | Nenhum requisito desta feature se aplica |
| Execução só em desktop para o limite de celular | Não vale como evidência (I9); o requisito 02 só é decidido no celular de referência |
| Aba em segundo plano ou pausa | A medida vale para a volta em corrida com a aba em primeiro plano; um intervalo em pausa não entra |
| Troca de orientação durante a medida (`web-mobile`) | O limite de 30 fps vale nas duas orientações |
| Sensor ausente ou permissão negada (`web-mobile`) | Toque com estado visível (I4); o limite não muda |
| Rede indisponível | Sem efeito (D-FS-08) |

## Estado

Não define estados próprios. Lê `drawCallCount` e `triangleCount` do registro `DRAW_COST` de
[API-0002](../api/API-0002-relatorio-do-modelo-montado.md).

## Configuração

Nenhuma. Não há ajuste de qualidade, de sombra ou de detalhe exposto por esta feature; nenhuma configuração
existe para forçar um evento, injetar um estado ou habilitar um caminho de depuração.

## Critérios de aceite

- Teste registrado no notebook de referência nomeado: em nenhum segundo de uma volta completa em corrida, com
  o Kart 01, a sombra e a câmera de corrida, a taxa fica abaixo de 60 fps; o registro nomeia aparelho,
  navegador e orientação e traz a contagem de cada segundo (satisfaz AC-US-0004-01 e o NFR-0001; cobre os
  requisitos 01 e 05).
- Teste registrado no celular intermediário de referência nomeado, em paisagem e em retrato: em nenhum
  segundo da volta a taxa fica abaixo de 30 fps; nenhuma execução em desktop é usada como evidência
  (satisfaz AC-US-0004-02 e o NFR-0001; cobre os requisitos 02 e 05).
- `DRAW_COST`: `drawCallCount` ≤ 30 e `triangleCount` igual a 5.128, com `verdict` `PASS` (satisfaz o
  NFR-0004; cobre os requisitos 03 e 04).

## Pontos em aberto

Nenhum.
