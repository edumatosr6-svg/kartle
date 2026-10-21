---
id: FEAT-0005
title: Jogo justo — determinismo, piloto de teste e versão do acerto
feature: dirigibilidade
stage: fspec
status: validated
version: 2.0.0
sources: [US-0005, NFR-0001, NFR-0009, AC-US-0005-01, AC-US-0005-02, AC-US-0005-03, AC-US-0005-04, AC-US-0005-05, AC-US-0005-06]
---

# FEAT-0005 — Jogo justo — determinismo, piloto de teste e versão do acerto

## Resumo

Depois do novo acerto, o jogo continua justo: a mesma sequência de `Input` dá o mesmo tempo e os mesmos
setores (NFR-0001); o piloto de teste completa a volta sintética sem sair do asfalto em no máximo 25 s
(`DOMAIN/DEC-07`); o novo Arcade assistido é declarado como nova versão de acerto no dado publicado, os
replays e resultados antigos continuam legíveis mas nunca são apresentados como comparáveis (NFR-0009,
I3, I5); `STEP`, o solver e `Input` não mudam.

## Canais

`web-desktop` e `web-mobile`: mesma regra de determinismo e mesma versão declarada; o resultado de uma
volta é função só da sequência de `Input` por passo, seja de teclado, inclinação ou toque. O piloto de teste
não tem canal de jogo. Sem sensor ou sem permissão: toque com estado visível; a sequência resultante segue
a mesma regra (I4).

## Requisitos

- REQ-FEAT-0005-01: O sistema SHALL, para a mesma sequência de `Input` por passo aplicada ao mesmo estado
  inicial na mesma pista (`trackId`, `trackVersion`) com a mesma `setupVersion`, produzir o mesmo tempo
  total e os mesmos quatro tempos de setor em duas execuções, verificado na saída de `npm test`
  (AC-US-0005-01).
- REQ-FEAT-0005-02: O sistema SHALL, para cada ensaio de `RULE-0002` e para a volta do piloto de teste,
  produzir estados por passo, tempo total e tempos de setor idênticos em 100 % de no mínimo 2 execuções
  repetidas, verificado na saída de `npm test` passo a passo com `STEP` (NFR-0001).
- REQ-FEAT-0005-03: O sistema SHALL reportar, na saída de `npm run bench:handling`, o registro
  `TEST_PILOT_LAP` com `offAsphaltStepCount` igual a 0 para a volta sintética do piloto de teste
  (AC-US-0005-02).
- REQ-FEAT-0005-04: O sistema SHALL reportar, na saída de `npm run bench:handling`, `lapTimeMs` do piloto de
  teste de no máximo 25 000 ms de tempo simulado (AC-US-0005-03).
- REQ-FEAT-0005-05: O sistema SHALL declarar, no dado publicado, uma `setupVersion` do acerto
  `ARCADE_ASSISTIDO` diferente de `previousSetupVersion`, de modo que dois replays gravados com versões
  diferentes carreguem `setupVersion` diferentes e sejam distinguíveis pela leitura desse campo
  (AC-US-0005-04).
- REQ-FEAT-0005-06: O sistema SHALL NOT apresentar, na tela nem no texto compartilhado, um tempo, replay ou
  resultado gravado com outra `setupVersion` como comparável a um tempo da versão corrente: toda comparação
  exibida ou compartilhada tem `comparability` igual a `COMPARABLE` (AC-US-0005-05).
- REQ-FEAT-0005-07: O sistema SHALL mostrar, na saída de `npm test`, o registro `STEP_CONTRACT` com
  `stepUnchanged`, `solverRateUnchanged` e `inputFieldsUnchanged` verdadeiros: `STEP`, a taxa do solver
  (480 Hz) e o conjunto, a faixa e o significado dos campos de `Input` são os mesmos antes e depois da
  feature (AC-US-0005-06).
- REQ-FEAT-0005-08: O sistema SHALL ler sem erro, em 100 % dos casos, replays e resultados gravados antes
  da feature, resolvendo `setupVersion` ausente para `previousSetupVersion` com `setupVersionSource`
  `RESOLVED_FROM_ABSENCE`, sem editar nem descartar o registro (NFR-0009).
- REQ-FEAT-0005-09: O sistema SHALL NOT editar no lugar a versão anterior do acerto Arcade assistido: a
  nova versão é um registro novo no dado publicado e a anterior permanece com o seu identificador e o seu
  conteúdo (NFR-0009).
- REQ-FEAT-0005-10: O sistema SHALL, ao reproduzir um replay da versão anterior com o acerto corrente,
  reproduzi-lo passo a passo e tratar o tempo obtido como não comparável ao gravado, sem apresentar nenhum
  resultado como equivalente ao original [DOMAIN] (I3; US-0005, caso anormal "Replay da versão anterior").
- REQ-FEAT-0005-11: O sistema SHALL reportar `FAIL` com `failReason` `OFF_ASPHALT`, com `offAsphaltFirstStep`
  e a posição da saída, quando o piloto de teste sai do asfalto, e `FAIL` com `THRESHOLD_EXCEEDED` quando
  `lapTimeMs` excede 25 000 ms, sem afrouxar nenhum dos dois limites [DOMAIN] (I9; US-0005, casos anormais
  "Piloto de teste sai do asfalto" e "Tempo acima de 25 s").
- REQ-FEAT-0005-12: O sistema SHALL tratar duas execuções com tempos ou estados diferentes como defeito de
  determinismo, reportado como `FAIL` com `NON_DETERMINISTIC`, nunca como tolerância [DOMAIN] (NFR-0001;
  US-0005, caso anormal "Duas execuções com tempos diferentes").

## Comportamento

Versão, comparabilidade e leitura de registros:
[RULE-0003](../rules/RULE-0003-versao-do-acerto-e-comparabilidade.md),
[API-0002](../api/API-0002-versao-do-acerto.md),
[FLOW-0003](../flows/FLOW-0003-leitura-de-replay-e-comparacao.md),
[SCR-0002](../screens/SCR-0002-resultado-e-texto-compartilhado.md). Ensaios `DETERMINISM`,
`TEST_PILOT_LAP`, `SETUP_VERSION` e `STEP_CONTRACT`: [RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md),
[FLOW-0002](../flows/FLOW-0002-ensaio-deterministico-e-piloto-de-teste.md),
[API-0003](../api/API-0003-saida-dos-ensaios.md).

| Situação | Comportamento |
|---|---|
| Mesma sequência de `Input`, mesma pista, mesma `setupVersion`, duas execuções | Mesmo tempo total, mesmos quatro setores, mesmos estados por passo |
| Duas execuções diferentes | `FAIL` com `NON_DETERMINISTIC`; defeito |
| Piloto de teste | `lapTimeMs` ≤ 25 000; `offAsphaltStepCount` = 0; senão `FAIL` com o passo e a posição |
| Replay ou resultado antigo (sem `setupVersion`) | Lido sem erro; versão resolvida para `previousSetupVersion`; `RESOLVED_FROM_ABSENCE` |
| Replay antigo reproduzido com o acerto corrente | Reproduzido; tempo obtido não comparável; nada apresentado como equivalente |
| Comparação entre versões diferentes | Nunca exibida nem compartilhada; cada tempo leva a sua `setupVersion` em texto |
| Formato de replay desconhecido | `UNSUPPORTED_FORMAT`; intacto e reportado (I4) |
| Pausa, perda de foco, perda do sensor durante a volta | A sequência de `Input` por passo é a mesma com ou sem suspensão; tempo simulado (I8) |
| Sensor ausente ou permissão negada antes da volta (`web-mobile`) | Toque com estado visível; regra de determinismo inalterada |
| Rodada de acerto reprovada pelo dono do produto em staging (`DOMAIN/DEC-10`) | Os requisitos 01 a 12 valem sem mudança para a rodada seguinte; cada nova rodada de presets é nova `setupVersion` (requisito 05, [RULE-0003](../rules/RULE-0003-versao-do-acerto-e-comparabilidade.md)) e passa de novo por todos os ensaios de [RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md); a versão reprovada não é editada no lugar (requisito 09) |
| Rede indisponível | Sem efeito: registros e dado publicado são locais (D-FS-08) |

## Estado

Lê e declara a versão do acerto (`PUBLISHED`, `SUPERSEDED`,
[RULE-0003](../rules/RULE-0003-versao-do-acerto-e-comparabilidade.md)) e lê `comparability`
(`COMPARABLE`, `SETUP_VERSION_DIFFERS`, `SETUP_DIFFERS`, `TRACK_DIFFERS`) e `replayStatus`
(`READABLE`, `UNSUPPORTED_FORMAT`, `UNREADABLE`).

| Transição | O que a dispara | Idempotência e contador |
|---|---|---|
| Versão anterior para `SUPERSEDED`; nova para `PUBLISHED` | Entrega desta feature com a nova `setupVersion` no dado publicado | Uma vez por entrega; redeclarar o mesmo identificador não cria versão; sem contador, a ordem é dada por `previousSetupVersion` |

## Configuração

Nenhuma. A `setupVersion` é dado publicado com a entrega, não configuração; nenhuma configuração existe
para escolher entre o acerto antigo e o novo, forçar um evento, injetar um estado ou habilitar um caminho
de depuração. Nenhum preset experimental extra é exposto no painel do jogo durante o ciclo de acerto
(`DOMAIN/DEC-10`): a única versão em uso é a `setupVersion` corrente do dado publicado.

## Critérios de aceite

- `DETERMINISM` com `runCount` ≥ 2 e `identical` verdadeiro para cada ensaio e para a volta do piloto de
  teste; execuções diferentes dão `FAIL` com `NON_DETERMINISTIC` (satisfaz AC-US-0005-01 e o NFR-0001; cobre
  os requisitos 01, 02 e 12).
- `TEST_PILOT_LAP` com `offAsphaltStepCount` 0 e `lapTimeMs` ≤ 25 000 na saída de `npm run bench:handling`;
  saída do asfalto ou tempo maior dão `FAIL` com passo e posição ou `THRESHOLD_EXCEEDED` (satisfaz
  AC-US-0005-02, AC-US-0005-03; cobre os requisitos 03, 04 e 11).
- `SETUP_VERSION` com `declaredSetupVersion` diferente de `previousSetupVersion`, e dois replays de versões
  diferentes distinguíveis pelo campo (satisfaz AC-US-0005-04; cobre os requisitos 05 e 09).
- Nenhuma comparação na tela ou no texto compartilhado com `comparability` diferente de `COMPARABLE`; o
  replay antigo reproduzido não é apresentado como equivalente (satisfaz AC-US-0005-05; cobre os requisitos
  06 e 10).
- `STEP_CONTRACT` com os três booleanos verdadeiros (satisfaz AC-US-0005-06; cobre o requisito 07).
- `oldRecordsReadOkCount` igual a `oldRecordsReadCount` com `RESOLVED_FROM_ABSENCE` (satisfaz o NFR-0009;
  cobre o requisito 08).

## Pontos em aberto

Nenhum. A rodada de teste do dono do produto (`DOMAIN/DEC-08`), no ciclo em staging de `DOMAIN/DEC-10`, é
condição humana de fechamento, fora dos critérios desta especificação.
