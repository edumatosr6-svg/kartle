---
id: ADR-0003
title: Linha de base legível por máquina dentro de docs/physics.md, resolvida por ensaio, ambiente e geometria; identidade de máquina e runtime sem dado pessoal
feature: dirigibilidade
stage: dspec
status: validated
version: 1.3.0
sources: [API-0003, RULE-0002, FEAT-0002, FEAT-0006, REQ-FEAT-0002-04, REQ-FEAT-0002-07, REQ-FEAT-0002-10, REQ-FEAT-0006-06, REQ-FEAT-0006-08, REQ-FEAT-0006-09, NFR-0002, NFR-0004, NFR-0007]
---

# ADR-0003 — Linha de base legível por máquina dentro de docs/physics.md, resolvida por ensaio, ambiente e geometria; identidade de máquina e runtime sem dado pessoal

## Contexto

`UNDERSTEER_ONSET`, `STEP_COST` e `REALISTA_UNCHANGED` comparam com uma linha de base que o F-Spec manda
registrar em `docs/physics.md` (NFR-0004), com `FAIL` `BASELINE_MISSING` quando ausente e nunca
inventada nem extrapolada. A revisão 3 do seed acrescenta que só conta como linha de base a entrada do
**mesmo ensaio, no mesmo ambiente e na mesma geometria** (`arcRadiusM`): uma linha de base medida em curva
da pista sintética não serve para o arco da pista de teste (RULE-0002, Linha de base; REQ-FEAT-0002-07).
`docs/physics.md` hoje é prosa com tabelas (`docs/physics.md:116-178`), sem bloco legível por máquina. O
custo por passo só é comparável na mesma máquina e runtime (NFR-0002), e o repositório não pode carregar
nome de máquina nem de usuário (I6).

## Decisão

1. `docs/physics.md` passa a conter um bloco cercado ` ```json handling-baseline ` com a forma de
   [DM-0001](../data/DM-0001-dado-publicado-registros-e-linha-de-base.md), seção 5, ao lado da entrada em
   prosa datada que NFR-0004 pede. Os ensaios leem o bloco; as pessoas leem a prosa; os dois dizem o mesmo.
   Cada entrada traz `parameters` (os parâmetros de ensaio da execução) e cada registro traz
   `benchEnvironment`.
2. A linha de base do Arcade é a saída do mesmo ensaio executado com `version: 'previous'`
   (`previousConfig` = `ARCADE_KART`; `npm run bench:handling -- --previous`), **nos mesmos ambientes da
   versão corrente** (pista de teste em reta e arco de 18 m; pista sintética para volta, grama e parede),
   registrada com `setupVersion` `arcade-assistido-v4` — reproduzível a qualquer momento, porque a versão
   anterior permanece em código (ADR-0001). A do Realista é a saída com `RENTAL_KART`
   (`--realista`), registrada antes de qualquer mudança desta feature nos presets. As execuções que
   produzem linha de base (`--previous`, `--realista`) não recebem `baseline` nem `realistaBaseline`: uma
   linha de base nunca é julgada contra outra, e os seus registros saem com `BASELINE_MISSING` onde a
   linha de base é exigida, salvo quando outro motivo vem antes na ordem do ensaio. O `verdict` e o
   `failReason` de um registro de linha de base não decidem se ele serve: em `UNDERSTEER_ONSET`, serve de
   V0 o registro com `v1Mps` presente — V1 medida num patamar completo da varredura da linha de base; o
   campo é condicional em API-0003 —, qualquer que seja o motivo com que a execução da linha de base o
   julgou, porque RULE-0002 aplica o fim da varredura só ao novo acerto e a linha de base só fornece V0
   ([DES-0004](../core/DES-0004-ensaios-de-dirigibilidade-e-saida.md),
   [ADR-0004](ADR-0004-ensaios-como-biblioteca-e-parametros-de-ensaio.md), decisão 8). Medido em 2026-10-22
   sobre a árvore da rodada de código 1 (prova de método): `ARCADE_KART` reporta 808 ms de `understeer` no
   patamar de 50 km/h e sai da faixa a 51,7 km/h, antes do segundo patamar completo acima de 50 km/h; o seu
   registro sai com `MEASUREMENT_MISSING` e `v1Mps` `50 / 3.6`, que é o V0.
3. A resolução de um registro da linha de base exige igualdade de `benchId`, `benchEnvironment`,
   `inputMode`, variante e, quando o registro os carrega, `arcRadiusM` e `laneWidthM`
   (`baselineRecord`, [DES-0004](../core/DES-0004-ensaios-de-dirigibilidade-e-saida.md)); em
   `UNDERSTEER_ONSET`, também o mesmo `entrySpeedStepMps` e os mesmos `plateauMs` e `plateauSpeedHoldMode`
   nos `parameters` da entrada, porque uma varredura por velocidades de entrada, ou com outro patamar, não
   é o mesmo ensaio (API-0003, Compatibilidade). Um registro sem `benchEnvironment` (medido sob a versão
   anterior deste projeto) nunca é igual e é ignorado.
4. `runtimeId` = `${process.platform}-${process.arch}-node${process.versions.node}-${os.cpus()[0].model}`,
   sem `os.hostname()` nem `os.userInfo()`, calculado em `scripts/keyboard-lap.ts` (programa de bench,
   camada Aplicação) e passado à biblioteca como argumento: `scripts/handlingBench.ts` não importa
   `node:os`. `STEP_COST` só compara entradas com `runtimeId` igual.
5. A ausência de bloco, de entrada, de registro igual ou de `runtimeId` igual — e, em `UNDERSTEER_ONSET`,
   um registro de linha de base sem `v1Mps` — dá `baselineAvailable` falso e `BASELINE_MISSING` onde a
   linha de base é exigida; nada é estimado. Um V0 nunca é tirado de uma velocidade que a varredura da
   linha de base não mediu.

## Alternativas consideradas

- **Arquivo separado `docs/physics-baseline.json`.** O F-Spec nomeia `docs/physics.md`; um segundo arquivo
  seria "um fato em dois lugares". Recusada.
- **Linha de base literal dentro dos testes.** Não é "registrada em `docs/physics.md`" e não é datada.
  Recusada; os testes leem o bloco.
- **Recalcular V0 em tempo de teste com `ARCADE_KART`.** Possível, mas o F-Spec define V0 como valor
  registrado e manda falhar sem registro; recalcular esconderia a ausência. Recusada; o bench oferece
  `--previous` para gerar a entrada, e o teste a lê.
- **Aceitar a linha de base por `benchId` e `inputMode` apenas** (como o as-built faz em
  `scripts/handlingBench.ts:275`). Deixaria uma entrada medida na curva da pista sintética valer para o arco
  da pista de teste, o que RULE-0002 proíbe. Recusada.
- **Converter a linha de base medida na pista sintética para o arco de 18 m.** É extrapolação; o F-Spec a
  proíbe. Recusada: a linha de base é medida de novo no arco.
- **`os.hostname()` como identidade de máquina.** Identificador potencialmente pessoal num repositório
  público. Recusada.

## Consequências

- A etapa de código começa por produzir e registrar as linhas de base (Arcade anterior na pista de teste e
  na pista sintética, Realista, custo por passo na máquina de referência) antes de retunar o acerto; sem
  isso `npm test` reporta `BASELINE_MISSING`.
- `docs/physics.md` passa a ser lido por `scripts/handlingBench.ts` com `node:fs`; o caminho é relativo à
  raiz do repositório e nunca é impresso.
- Uma mudança futura de `arcRadiusM` ou `laneWidthM` invalida a linha de base do arco por construção e
  exige nova entrada: é o custo de a linha de base significar sempre a mesma geometria.

## Estado

Aceita nesta rodada.
