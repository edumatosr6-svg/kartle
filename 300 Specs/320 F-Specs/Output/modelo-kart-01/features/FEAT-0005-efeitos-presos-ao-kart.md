---
id: FEAT-0005
title: Efeitos presos ao kart e posições das rodas da simulação
feature: modelo-kart-01
stage: fspec
status: draft
version: 1.0.0
sources: [US-0005, NFR-0007, AC-US-0005-01, AC-US-0005-02, AC-US-0005-03]
---

# FEAT-0005 — Efeitos presos ao kart

## Resumo

Os efeitos que já existem continuam saindo do kart que o Jogador pilota, agora o Kart 01: as marcas de pneu
no chão sob os pneus traseiros, a fumaça saindo do escapamento e a indicação de drift junto às rodas
traseiras. As marcas continuam vindo de `wheelPositions`, contrato da simulação que esta feature não muda; a
diferença conhecida entre as rodas da simulação e as do modelo não é corrigida aqui (`DOMAIN/DEC-02`). Esta
feature muda onde cada efeito aparece, não quando.

## Canais

`web-desktop` e `web-mobile`: os mesmos efeitos, nas mesmas posições do Kart 01, em paisagem e em retrato.
Em `web-mobile` com sensor ausente ou permissão negada, o controle recai para toque com estado visível (I4);
os efeitos não mudam. Os efeitos são verificados na tela; `wheelPositions` e a telemetria, na saída de
`npm test` ([API-0002](../api/API-0002-relatorio-do-modelo-montado.md)).

## Requisitos

- REQ-FEAT-0005-01: O sistema SHALL desenhar, em corrida, cada trecho novo de marca de pneu no chão na
  posição traseira de `wheelPositions` do lado correspondente — a esquerda sob o pneu traseiro esquerdo, a
  direita sob o pneu traseiro direito —, levada pela posição e pelo rumo do kart, de modo que apareça na tela
  sob o pneu traseiro do Kart 01 exibido (AC-US-0005-01).
- REQ-FEAT-0005-02: O sistema SHALL exibir, em corrida, a fumaça do escapamento saindo do escapamento do
  Kart 01 exibido, sempre que o jogo a exibe (AC-US-0005-02).
- REQ-FEAT-0005-03: O sistema SHALL exibir, em corrida, a indicação de drift junto às rodas traseiras do
  Kart 01 exibido, sempre que o jogo a exibe (AC-US-0005-03).
- REQ-FEAT-0005-04: O sistema SHALL manter as situações em que cada efeito é exibido iguais às de antes da
  feature, sem acrescentar nem retirar situação [DOMAIN] (I2; US-0005, Pré-condições e caso anormal "Efeito
  sem a situação que o dispara").
- REQ-FEAT-0005-05: O sistema SHALL manter os valores de `wheelPositions` após N passos de `STEP`, para a
  mesma sequência de `Input` a partir do mesmo estado inicial, iguais aos de antes da feature em 100 % das
  execuções comparadas, reportados no registro `WHEEL_POSITIONS` (NFR-0007).
- REQ-FEAT-0005-06: O sistema SHALL reportar na telemetria as posições das rodas que vêm de `wheelPositions`
  e nunca as posições das rodas do modelo, com 0 diferenças, passo a passo, entre as duas, reportadas no
  registro `TELEMETRY_WHEEL_POSITIONS` (NFR-0007).
- REQ-FEAT-0005-07: O sistema SHALL, a partir do primeiro quadro depois de um reposicionamento, desenhar os
  trechos novos de marca e exibir a fumaça e a indicação de drift nas posições do Kart 01 na nova posição,
  sem mover as marcas já desenhadas no chão [DOMAIN] (US-0005, caso anormal "Reposicionamento do kart").
- REQ-FEAT-0005-08: O sistema SHALL, enquanto a simulação está suspensa, não desenhar nenhum trecho novo de
  marca e manter a fumaça e a indicação de drift presas ao kart parado [DOMAIN] (US-0005, caso anormal
  "Pausa").

## Comportamento

Quadro de exibição: [FLOW-0001](../flows/FLOW-0001-quadro-de-exibicao-em-corrida.md). Ancoragem dos efeitos:
[RULE-0003](../rules/RULE-0003-posicao-animacao-e-efeitos-do-kart-01.md). Verificação de `wheelPositions` e
da telemetria: [FLOW-0003](../flows/FLOW-0003-verificacao-do-modelo-montado.md),
[API-0002](../api/API-0002-relatorio-do-modelo-montado.md).

| Situação | Comportamento |
|---|---|
| Diferença conhecida entre as rodas da simulação e as do modelo | A bitola da simulação é de 1,20 m e a traseira do modelo, de 1,14 m: a posição traseira de `wheelPositions` fica 0,03 m para fora do centro de cada roda traseira exibida; com o ponto de referência de [RULE-0003](../rules/RULE-0003-posicao-animacao-e-efeitos-do-kart-01.md), a diferença ao longo do rumo é de no máximo 0,01 m (entre-eixos de 1,04 m contra 1,05 m). As marcas continuam vindo de `wheelPositions`; o requisito 01 é julgado pela marca vista na tela sob o pneu exibido. Se essa diferença puser a marca fora do pneu exibido, o requisito não é atendido e a decisão volta ao dono do produto: nem `wheelPositions` nem as medidas do modelo mudam nesta feature (`DOMAIN/DEC-02`) |
| Reposicionamento do kart | Trechos novos, fumaça e indicação de drift na nova posição; as marcas já desenhadas não mudam |
| Pausa, perda de foco ou perda do sensor | Nenhum trecho novo de marca; efeitos presos ao kart parado |
| Efeito sem a situação que o dispara | A renderização não decide nada: um efeito só aparece quando o jogo já o exibiria |
| Troca de orientação do celular | As posições dos efeitos em relação ao Kart 01 não mudam |
| Sensor ausente ou permissão negada (`web-mobile`) | Toque com estado visível (I4); os efeitos continuam presos ao kart |
| `wheelPositions` diferente da linha de base | `WHEEL_POSITIONS` dá `FAIL` com `STATE_DIFFERS` |
| Posição de roda na telemetria diferente de `wheelPositions` | `TELEMETRY_WHEEL_POSITIONS` dá `FAIL` com `STATE_DIFFERS` |
| Rede indisponível | Sem efeito (D-FS-08) |

## Estado

Não define estados próprios. Lê a pose do kart por `simStepCount`
([API-0001](../api/API-0001-estado-do-kart-para-exibicao.md)) e `wheelPositions`, contrato da simulação
nomeado e não redefinido. Os trechos de marca já desenhados são estado de exibição: um trecho novo é
desenhado só quando `simStepCount` avança, na ordem de `simStepCount`, e nunca de novo para o mesmo passo.

## Configuração

Nenhuma. Nenhuma configuração existe para forçar um efeito, injetar um estado ou habilitar um caminho de
depuração.

## Critérios de aceite

- Na tela, em corrida, sempre que o jogo desenha marcas de pneu, cada trecho novo aparece no chão sob o pneu
  traseiro exibido do lado correspondente; depois de um reposicionamento, os trechos novos saem da nova
  posição e os antigos não se movem; na pausa, nenhum trecho novo (satisfaz AC-US-0005-01; cobre os
  requisitos 01, 07 e 08).
- Na tela, em corrida, a fumaça do escapamento sai do escapamento do Kart 01 exibido, nas mesmas situações
  de antes da feature (satisfaz AC-US-0005-02; cobre os requisitos 02, 04, 07 e 08).
- Na tela, em corrida, a indicação de drift aparece junto às rodas traseiras do Kart 01 exibido, nas mesmas
  situações de antes da feature (satisfaz AC-US-0005-03; cobre os requisitos 03, 04, 07 e 08).
- `WHEEL_POSITIONS`: `differingValueCount` igual a 0 em 100 % das execuções comparadas (satisfaz o NFR-0007;
  cobre o requisito 05).
- `TELEMETRY_WHEEL_POSITIONS`: `differingValueCount` igual a 0 em todos os passos comparados (satisfaz o
  NFR-0007; cobre o requisito 06).

## Pontos em aberto

Nenhum.
