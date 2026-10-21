---
id: ADR-0004
title: Ensaios como biblioteca em scripts/ compartilhada por npm test e pelos benches; parâmetros de ensaio fixados
feature: dirigibilidade
stage: dspec
status: validated
version: 1.0.1
sources: [API-0003, RULE-0002, FLOW-0002, FEAT-0001, FEAT-0002, FEAT-0003, FEAT-0004, FEAT-0005, FEAT-0006, REQ-FEAT-0001-06, REQ-FEAT-0002-06, REQ-FEAT-0003-08, REQ-FEAT-0004-07, REQ-FEAT-0005-03, REQ-FEAT-0005-04, REQ-FEAT-0006-05, NFR-0001, NFR-0003]
---

# ADR-0004 — Ensaios como biblioteca em scripts/ compartilhada por npm test e pelos benches; parâmetros de ensaio fixados

## Contexto

Os critérios nomeiam "a saída de `npm test` ou de `npm run bench:handling`/`bench:physics`" como ponto de
observação dos mesmos registros (API-0003). Hoje `scripts/keyboard-lap.ts` e `scripts/physics-bench.ts`
imprimem objetos próprios e não são importáveis sem efeito colateral; `tests/` não os usa. O F-Spec deixou
ao ensaio parâmetros (janela de estabilização, acelerador mantido, incremento de velocidade, posição de
entrada da curva) e lacunas deliberadas (resposta à inversão, recuperação parcial, magnitude da perda na
parede), e não disse o que fazer quando a precondição de um ensaio não é atingida.

## Decisão

1. Uma biblioteca pura `scripts/handlingBench.ts` ([DES-0004](../core/DES-0004-ensaios-de-dirigibilidade-e-saida.md))
   produz os registros; `npm test` e os dois benches a chamam. O mesmo código, três saídas.
2. Parâmetros de ensaio, fixados e reportados (nunca limiares nem configuração do jogo):
   `settleWindowMs` 500; `holdMs` 2 000; `throttleInputNorm` 0 (evita a condição de forçar durante a
   resposta do volante); `steerInputNorm` parcial 0,5; `entryArcM` 20 antes do ápice da curva de menor raio;
   `cornerWindowMs` 2 500; `entrySpeedStepMps` 0,5; `entrySpeedMaxMps` 25; `forcingSpeedMps` 16,7;
   `forcingWindowMs` 3 000; `wallApproachRad` 0,6; `driverMassKg` 75; piloto de teste com decisão a cada 12
   passos, `maxSpeedMps` e `lateralBudgetMps2` escolhidos na etapa de código e reportados.
3. Precondição não atingida (traseira que não solta em `REAR_RECOVERY`; nenhum contato em `WALL_CONTACT`;
   V1 não encontrado até `entrySpeedMaxMps`; piloto de teste que não termina) é `FAIL` com
   `THRESHOLD_EXCEEDED` e o campo de medida igual ao limite da janela: um ensaio que não chega ao estado
   que mede não aprova o requisito.
4. As lacunas deliberadas do F-Spec não ganham ensaio: nenhum registro mede inversão do esterço, redução
   parcial do esterço ou magnitude da perda na parede.
5. O cenário de `DRIFT_MANEUVER` é o do teste existente `tests/maneuvers.test.ts:68-79`, replicado na
   biblioteca com o acerto corrente; o teste existente não é alterado nem removido.

## Alternativas consideradas

- **Biblioteca em `src/`.** Não é código do jogo e usa `node:fs`; `src/` é o cliente.
  Recusada; `scripts/` é onde as diretrizes põem os benches.
- **Relógio de parede e `runtimeId()` dentro da biblioteca.** A biblioteca é camada Simulação e não pode
  ler `performance.now`; `node:perf_hooks` e `node:os` ficam no programa `scripts/keyboard-lap.ts`, que
  entrega `meanStepCostUs` e `runtimeId` já medidos em `BenchOptions.stepCost`. Recusada.
- **Biblioteca em `tests/helpers/`.** Os benches importariam de `tests/`, invertendo o papel das árvores.
  Recusada.
- **Tolerância numérica no `DETERMINISM`.** O F-Spec a proíbe (REQ-FEAT-0005-12). Recusada.
- **Medir custo por passo em `npm test`.** Relógio de parede em teste contraria I9; fica nos benches.
  Recusada.

## Consequências

- `npm test` passa a executar os ensaios (algumas dezenas de segundos de simulação); a volta do piloto de
  teste roda uma vez por arquivo de teste que a precisa.
- `scripts/keyboard-lap.ts` deixa de usar `LapTracker`; a classe fica exportada e testada como antes.
- Os parâmetros entram em `docs/physics.md` com cada entrada datada (NFR-0004).

## Estado

Aceita nesta rodada.
