---
id: ADR-0003
title: Linha de base legível por máquina dentro de docs/physics.md e identidade de máquina e runtime sem dado pessoal
feature: dirigibilidade
stage: dspec
status: validated
version: 1.0.1
sources: [API-0003, RULE-0002, FEAT-0002, FEAT-0006, REQ-FEAT-0002-04, REQ-FEAT-0002-07, REQ-FEAT-0006-06, REQ-FEAT-0006-08, REQ-FEAT-0006-09, NFR-0002, NFR-0004, NFR-0007]
---

# ADR-0003 — Linha de base legível por máquina dentro de docs/physics.md e identidade de máquina e runtime sem dado pessoal

## Contexto

`UNDERSTEER_ONSET`, `STEP_COST` e `REALISTA_UNCHANGED` comparam com uma linha de base que o F-Spec manda
registrar em `docs/physics.md` (NFR-0004), com `FAIL` `BASELINE_MISSING` quando ausente e nunca
inventada nem extrapolada. `docs/physics.md` hoje é prosa com tabelas (`docs/physics.md:70-77`), que um
ensaio não lê de forma confiável. O custo por passo só é comparável na mesma máquina e runtime (NFR-0002),
e o repositório não pode carregar nome de máquina nem de usuário (I6).

## Decisão

1. `docs/physics.md` passa a conter um bloco cercado ` ```json handling-baseline ` com a forma de
   [DM-0001](../data/DM-0001-dado-publicado-registros-e-linha-de-base.md), seção 5, ao lado da entrada em
   prosa datada que NFR-0004 pede. Os ensaios leem o bloco; as pessoas leem a prosa; os dois dizem o mesmo.
2. A linha de base do Arcade é a saída do mesmo ensaio executado com `version: 'previous'`
   (`previousConfig` = `ARCADE_KART`), registrada com `setupVersion` `arcade-assistido-v4` — reproduzível
   a qualquer momento, porque a versão anterior permanece em código (ADR-0001). A do Realista é a saída com
   `RENTAL_KART`, registrada antes de qualquer mudança desta feature.
3. `runtimeId` = `${process.platform}-${process.arch}-node${process.versions.node}-${os.cpus()[0].model}`,
   sem `os.hostname()` nem `os.userInfo()`, calculado em `scripts/keyboard-lap.ts` (programa de bench,
   camada Aplicação) e passado à biblioteca como argumento: `scripts/handlingBench.ts` não importa
   `node:os`. `STEP_COST` só compara entradas com `runtimeId` igual.
4. A ausência de bloco, de entrada ou de `runtimeId` igual dá `baselineAvailable` falso e `BASELINE_MISSING`
   onde a linha de base é exigida; nada é estimado.

## Alternativas consideradas

- **Arquivo separado `docs/physics-baseline.json`.** O F-Spec nomeia `docs/physics.md`; um segundo arquivo
  seria "um fato em dois lugares". Recusada.
- **Linha de base literal dentro dos testes.** Não é "registrada em `docs/physics.md`" e não é datada.
  Recusada; os testes leem o bloco.
- **Recalcular V0 em tempo de teste com `ARCADE_KART`.** Possível, mas o F-Spec define V0 como valor
  registrado e manda falhar sem registro; recalcular esconderia a ausência. Recusada; o bench oferece
  `version: 'previous'` para gerar a entrada, e o teste a lê.
- **`os.hostname()` como identidade de máquina.** Identificador potencialmente pessoal num repositório
  público. Recusada.

## Consequências

- A etapa de código começa por produzir e registrar as linhas de base (Arcade anterior, Realista, custo por
  passo na máquina de referência) antes de retunar o acerto; sem isso `npm test` reporta `BASELINE_MISSING`.
- `docs/physics.md` passa a ser lido por `scripts/handlingBench.ts` com `node:fs`; o caminho é relativo à
  raiz do repositório e nunca é impresso.

## Estado

Aceita nesta rodada.
