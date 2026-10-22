---
id: DES-0006
title: Invariantes da simulação, contrato de passo, pista dos ensaios, dependências e ordem de entrega
feature: pista-kart-park
stage: dspec
status: validated
version: 1.0.1
sources: [FEAT-0007, FLOW-0002, REQ-FEAT-0007-03, REQ-FEAT-0007-04, REQ-FEAT-0007-06, REQ-FEAT-0007-07, REQ-FEAT-0007-08, REQ-FEAT-0007-09, REQ-FEAT-0007-10, REQ-FEAT-0007-11, REQ-FEAT-0007-12]
---

# DES-0006 — Invariantes da simulação, contrato de passo, pista dos ensaios, dependências e ordem de entrega

## Realiza

Os `REQ-*` transversais em `sources`: a mesma sequência de `Input` a partir do mesmo estado na Kart Park dá o
mesmo `lapMs` e os mesmos 4 `sectorMs` (REQ-FEAT-0007-03, -04); superfície, aderência na zebra, zebra como
pista, colisão com a barreira, setores, marcadores e corte são decididos na simulação a partir do dado da
pista, e a apresentação só desenha e reage (REQ-FEAT-0007-06); cada critério de US-0002 a US-0005 observado
na simulação ou no arquivo tem uma verificação determinística em `npm test`, sem renderização
(REQ-FEAT-0007-07); `STEP`, `step(state, input, dt)` e os campos de `Input` não mudam, e o efeito da zebra não
é campo de `Input` (REQ-FEAT-0007-08, -09); a pista sintética continua a pista de todos os ensaios
automáticos de `dirigibilidade` e de `race-lap-validation` (REQ-FEAT-0007-10); nenhuma dependência de
execução nova (REQ-FEAT-0007-11); o código desta feature começa só depois da entrega de `dirigibilidade` com
os testes passando (REQ-FEAT-0007-12).

## Posicionamento

Não é um módulo: é uma restrição que atravessa `src/trackGeometry.ts`, `src/trackData.ts`, `src/physics.ts`,
`src/lap.ts` e `src/trainingSession.ts` (camada **simulação** e **dado de pista**), com a sua verificação em
`tests/pista-kart-park-layering.test.ts` e `tests/pista-kart-park-determinism.test.ts`. Camada do item:
**simulação** (dona do contrato de passo, I8).

## Interface

Nenhuma função nova. As garantias, cada uma com o ponto que a impõe:

| Garantia | Ponto de aplicação |
|---|---|
| Regras de pista na simulação | `classifySurface`, `beyondTrackEdgeM` (dado de pista); `surfaceMu`, bloco da barreira, `trackEdgeDistanceM` (`src/physics.ts`); corte e linhas (`src/lap.ts`); a aplicação só lê `getTrackContact`, `getLapState`, `getLapResult` e `getTrainingTrackOptions` |
| Simulação sem camada externa | os módulos `src/trackGeometry.ts` e `src/trainingSession.ts` entram na lista de simulação do teste de camada desta feature, com os de `race-lap-validation`: nenhuma importação de `three`, `./audio`, `./main`; nenhum uso de `document`, `window`, `Date`, `performance`, `Math.random`, `requestAnimationFrame`, `setTimeout`, `setInterval` |
| Aplicação pura testável | `src/curbFeedback.ts` entra na lista de aplicação pura: as mesmas proibições de relógio, DOM e sorteio; `src/lapMessages.ts`, que recebe `OSM_CREDIT`, `creditFor` e `optionLabel` ([DES-0007](../web/DES-0007-tela-inicial-seletor-credito-e-resultado.md)), já está na lista de aplicação pura de `race-lap-validation` (`tests/race-lap-validation-layering.test.ts:10`) e continua importando só tipos de `./lap` (`:27-28`) |
| Regra de tela fora da simulação | o teste de camada desta feature afirma que o texto de `src/trainingSession.ts` não contém `openstreetmap`, `ODbL` nem o separador de rótulo `' · '`: os textos do crédito, a regra de exibição do crédito e a formatação do rótulo ficam em `src/lapMessages.ts` (aplicação), e a sessão só entrega as entradas do catálogo |
| Contrato de passo | `export const STEP = 1 / 120;`, o tipo `Input` e a assinatura de `step` ficam literalmente como `tests/race-lap-validation-frozen.test.ts:31-41` afirma; a linha 3 de `src/physics.ts` também |
| Pista dos ensaios | nenhum teste ou bench de `race-lap-validation` e de `dirigibilidade` passa a importar `src/tracks/kart-park-v1.json`, `src/trainingSession.ts` ou `trackEnvironment`; os ensaios desta feature são os únicos a usar a Kart Park |
| Dependências | `package.json` `dependencies` continua só `three`; `devDependencies` não muda; o preparo usa só módulos embutidos do Node |
| Ordem de entrega | o manifesto da etapa de código desta feature registra o hash do commit de entrega de `dirigibilidade` com `npm test` passando e o hash do primeiro commit de código desta feature; `git merge-base --is-ancestor <entrega de dirigibilidade> <primeiro commit desta feature>` sai com 0. A lista exata dos arquivos que as duas features tocam está em [01-architecture](../01-architecture.md), seção "Ordem de entrega" |

## Colaboradores

Os módulos listados acima; os testes de camada, de contrato de passo e de determinismo; a etapa de código
(manifesto) para a ordem de entrega.

## Estado e concorrência

Sem estado próprio. A sequência de `Input` por passo é a única entrada da simulação; a mesma sequência a
partir do mesmo estado dá os mesmos estados, as mesmas superfícies, os mesmos contatos, os mesmos
cruzamentos e o mesmo tempo (I8).

## Comportamento em falha

Uma violação aparece como reprovação em `npm test` (camada, contrato de passo, dependências, determinismo) ou
na verificação de ordem do manifesto da etapa de código, que então não começa ou não avança. Nada em tempo
de execução.

## Determinismo (D-DS-07)

Passo fixo `STEP`, tempo inteiro em ms, sem relógio de parede, sem sorteio sem semente, geometria e barreiras
processadas na ordem do arquivo. Provas em `tests/pista-kart-park-determinism.test.ts`: o piloto de teste da
Kart Park completa uma volta `VALID` duas vezes com a mesma sequência de `Input` e `lapMs` e os 4 `sectorMs`
são iguais um a um; a sessão inteira, kart incluído, é `deepEqual` nas duas execuções; uma sequência
semeada (`tests/helpers/seeded.ts`) de 2.000 passos na Kart Park dá estados `deepEqual` em duas execuções.
`tests/pista-kart-park-layering.test.ts` lê os módulos como texto (como o teste de camada de
`race-lap-validation`) e afirma as proibições acima, que `package.json` mantém as dependências, e que nenhum
arquivo `tests/race-lap-validation-*.test.ts`, `tests/dirigibilidade-*.test.ts`, `scripts/keyboard-lap.ts`,
`scripts/physics-bench.ts` ou `scripts/handlingBench.ts` cita `kart-park`.

## Feature flag

Nenhuma: são restrições, e o estado neutro é o contrato de hoje.

## Pontos em aberto

Nenhum.
