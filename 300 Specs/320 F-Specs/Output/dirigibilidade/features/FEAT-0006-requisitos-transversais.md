---
id: FEAT-0006
title: Requisitos transversais — camada de simulação, contrato de passo, Realista, validação de volta, custo por passo, paridade e documentação
feature: dirigibilidade
stage: fspec
status: validated
version: 1.0.1
sources: [NFR-0002, NFR-0003, NFR-0004, NFR-0005, NFR-0006, NFR-0007, NFR-0008]
---

# FEAT-0006 — Requisitos transversais

## Resumo

Reúne o que vale para toda a feature e não pertence a uma história só: toda a mudança fica nos presets e
nas assistências da camada de simulação (I2); o contrato de passo não muda (I8); o preset Realista e a
validação de volta não mudam; o custo por passo não sobe mais de 10 %; teclado e inclinação atendem os
mesmos critérios; e cada mudança de parâmetro registra parâmetros e resultados em `docs/physics.md` (I9).

## Canais

`web-desktop` e `web-mobile`, sem diferença: a paridade entre entrada binária e proporcional é o próprio
objeto do requisito 05.

## Requisitos

- REQ-FEAT-0006-01: O sistema SHALL decidir resposta do volante, aderência, recuperação da traseira,
  aceleração, perda na grama e na parede nos presets e nas assistências da camada de simulação, com 0
  regras de pilotagem em renderização ou em adaptador de controle (NFR-0005; D-FS-05).
- REQ-FEAT-0006-02: O sistema SHALL manter a simulação com 0 importações de camada externa (DOM,
  renderização, áudio, relógio de parede), de modo que todos os ensaios de `RULE-0002` executem sem DOM em
  `npm test` (NFR-0005).
- REQ-FEAT-0006-03: O sistema SHALL manter o valor de `STEP`, a taxa do solver de 480 Hz e o conjunto, a
  faixa e o significado dos campos de `Input` iguais aos da versão anterior à feature, mudando só os
  parâmetros do acerto, com um replay da versão anterior continuando a ser lido e reproduzido passo a
  passo (NFR-0006).
- REQ-FEAT-0006-04: O sistema SHALL manter o acerto Realista — aluguel 4T sem mudança de parâmetro, sem
  assistência arcade e com saída dos ensaios de física e de dirigibilidade idêntica à sua linha de base em
  100 % das medidas, verificado por `REALISTA_UNCHANGED` com `differingMeasureCount` 0 e
  `arcadeAssistActiveCount` 0 (NFR-0007).
- REQ-FEAT-0006-05: O sistema SHALL aprovar cada ensaio de US-0001 a US-0004 (`STEER_RESPONSE`,
  `REFERENCE_CORNER`, `UNDERSTEER_ONSET`, `NORMAL_DRIVING`, `REAR_RECOVERY`, `ACCELERATION`, `TOP_SPEED`,
  `GRASS_LOSS`, `WALL_CONTACT`) com `inputMode` `BINARY` e com `inputMode` `PROPORTIONAL` (esterço 1
  mantido), sem diferença de limite, na saída de `npm test` (NFR-0003).
- REQ-FEAT-0006-06: O sistema SHALL manter o tempo médio por passo de `STEP` sobre a volta completa do
  piloto de teste em no máximo 10 % acima da linha de base registrada, na mesma máquina e no mesmo
  runtime, reportado por `STEP_COST` com `meanStepCostUs` e `baselineMeanStepCostUs` (NFR-0002).
- REQ-FEAT-0006-07: O sistema SHALL manter 0 mudanças nas regras de validade e de cronometragem da volta e
  no dado de pista, com 100 % das verificações de `npm test` da feature `race-lap-validation` aprovadas com
  o novo acerto, na mesma execução de `npm test` (NFR-0008).
- REQ-FEAT-0006-08: O sistema SHALL registrar em `docs/physics.md`, a cada mudança de parâmetro do acerto
  Arcade assistido, uma entrada datada com os parâmetros e os campos de `API-0003` de 100 % dos ensaios de
  `RULE-0002`, com unidade, para a linha de base e para o novo acerto, incluindo os parâmetros de ensaio
  (`settleWindowMs`, `throttleInputNorm`, `entrySpeedStepMps`) (NFR-0004).
- REQ-FEAT-0006-09: O sistema SHALL reportar `FAIL` com `BASELINE_MISSING` em `STEP_COST` quando a linha de
  base do custo por passo não está registrada para a mesma máquina e runtime, sem comparar com linha de
  base de outra máquina [DOMAIN] (I9; NFR-0002).

## Comportamento

Ensaios e linha de base: [RULE-0002](../rules/RULE-0002-ensaios-e-limiares.md),
[FLOW-0002](../flows/FLOW-0002-ensaio-deterministico-e-piloto-de-teste.md),
[API-0003](../api/API-0003-saida-dos-ensaios.md). Contrato de passo e versão:
[API-0002](../api/API-0002-versao-do-acerto.md), [RULE-0003](../rules/RULE-0003-versao-do-acerto-e-comparabilidade.md).
Camadas: [FLOW-0001](../flows/FLOW-0001-passo-de-simulacao-e-hud.md).

| Situação | Comportamento |
|---|---|
| Regra de pilotagem encontrada em renderização ou adaptador | Não atende o requisito 01; a regra pertence à simulação |
| Ensaio que precisa de DOM para rodar | Não atende o requisito 02 |
| `STEP`, solver ou `Input` alterados | `STEP_CONTRACT` dá `FAIL` com `CONTRACT_CHANGED` |
| Medida do Realista diferente da linha de base | `REALISTA_UNCHANGED` dá `FAIL` com `CONTRACT_CHANGED` |
| Ensaio aprovado numa forma de `Input` e reprovado na outra | O requisito 05 não é atendido |
| Custo por passo acima de 1,10 × linha de base | `STEP_COST` dá `FAIL` com `THRESHOLD_EXCEEDED` |
| Linha de base de custo ausente ou de outra máquina | `FAIL` com `BASELINE_MISSING`; nada é comparado |
| Verificação de `race-lap-validation` reprovada com o novo acerto | O requisito 07 não é atendido; a correção é no acerto, nunca na validação de volta |
| Rede indisponível | Sem efeito: tudo roda localmente (D-FS-08) |

## Estado

Não define estados próprios; lê `verdict` e `failReason` dos registros de
[API-0003](../api/API-0003-saida-dos-ensaios.md).

## Configuração

Nenhuma. Nenhuma configuração existe para forçar um evento, injetar um estado ou habilitar um caminho de
depuração; logging, verbosidade e caminhos de arquivo são configurados globalmente e nunca por esta feature.

## Critérios de aceite

- Ensaios executam sem DOM em `npm test`; 0 regras de pilotagem fora da simulação na revisão da etapa de
  código (satisfaz o NFR-0005; cobre os requisitos 01 e 02).
- `STEP_CONTRACT` com os três booleanos verdadeiros e replay anterior reproduzido (satisfaz o NFR-0006;
  cobre o requisito 03).
- `REALISTA_UNCHANGED` com `differingMeasureCount` 0 e `arcadeAssistActiveCount` 0 (satisfaz o NFR-0007;
  cobre o requisito 04).
- Todos os ensaios de US-0001 a US-0004 com `PASS` em `BINARY` e em `PROPORTIONAL` (satisfaz o NFR-0003;
  cobre o requisito 05).
- `STEP_COST` com `meanStepCostUs` ≤ 1,10 × `baselineMeanStepCostUs`; sem linha de base, `BASELINE_MISSING`
  (satisfaz o NFR-0002; cobre os requisitos 06 e 09).
- Conjunto de `npm test` de `race-lap-validation` 100 % aprovado com o novo acerto (satisfaz o NFR-0008;
  cobre o requisito 07).
- `docs/physics.md` com entrada datada, parâmetros e os campos de todos os ensaios para a linha de base e
  para o novo acerto (satisfaz o NFR-0004; cobre o requisito 08).

## Pontos em aberto

Nenhum.
