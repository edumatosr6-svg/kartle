---
id: API-0002
title: Contrato do relatório do modelo montado e das verificações de npm test
feature: modelo-kart-01
stage: fspec
status: draft
version: 1.0.0
sources: [US-0001, US-0002, NFR-0004, NFR-0005, NFR-0006, NFR-0007, AC-US-0001-01, AC-US-0001-02, AC-US-0001-03, AC-US-0001-04, AC-US-0001-05, AC-US-0001-06, AC-US-0001-07, AC-US-0001-08, AC-US-0001-09, AC-US-0001-10, AC-US-0001-11, AC-US-0001-12, AC-US-0001-13, AC-US-0002-02]
---

# API-0002 — Contrato do relatório do modelo montado e das verificações de `npm test`

Contrato do que a saída de `npm test` contém para o modelo montado do Kart 01 e para as verificações de
camada e de simulação desta feature: os critérios de US-0001, o critério 02 de US-0002 e os NFRs 0004 a
0007 nomeiam essa saída como ponto de observação (I9), e este contrato fixa os registros, os campos, as
unidades e o veredito. A forma de serialização (linhas de texto ou JSON) é decisão de projeto; os nomes e as
unidades abaixo são contrato. Nomes em `camelCase` plano com a unidade no sufixo (D-FS-06): comprimentos em
metros (`M`), tempos em milissegundos (`Ms`), velocidades em m/s (`Mps`), rotações (`Revs`), contagens
(`Count`); cores em texto hexadecimal (`Hex`). Os limites e tolerâncias aplicados estão em
[RULE-0001](../rules/RULE-0001-medidas-grupos-e-cores-do-kart-01.md) e
[RULE-0003](../rules/RULE-0003-posicao-animacao-e-efeitos-do-kart-01.md).

## Operações

| Operação | Propósito | Quem chama |
|---|---|---|
| `kartModelReport` | Produz um registro por verificação executada | `npm test` |

## Auth

Sem sessão; executado localmente pelo desenvolvedor ou pela integração. Não é exposto ao Jogador; não há
papel, porque não há acesso em tempo de execução do jogo. Público no repositório porque não contém segredo
nem dado pessoal (I6).

## Registro por verificação

| Campo | Tipo | Unidade | Obrigatório | Padrão e restrições |
|---|---|---|---|---|
| `checkId` | enum `KART_DIMENSIONS`, `WHEELS_AND_TRACKS`, `PART_GROUPS`, `PART_COLORS`, `DRAW_COST`, `WHEEL_SPIN`, `LAYERING`, `RENDER_NEUTRAL`, `SIM_CONTRACT`, `DETERMINISM`, `WHEEL_POSITIONS`, `TELEMETRY_WHEEL_POSITIONS` | — | sim | um registro por verificação; `WHEEL_SPIN` tem um registro por velocidade ensaiada |
| `verdict` | enum `PASS`, `FAIL` | — | sim | |
| `checkFailReason` | enum `OUT_OF_TOLERANCE`, `GROUP_MISSING`, `GROUP_NESTED`, `COLOR_MISMATCH`, `LIMIT_EXCEEDED`, `SHAPE_CHANGED`, `SPIN_MISMATCH`, `FORBIDDEN_IMPORT`, `STATE_DIFFERS`, `CONTRACT_CHANGED`, `NON_DETERMINISTIC`, `BASELINE_MISSING` | — | só com `FAIL` | ausente com `PASS` |

## Campos medidos por `checkId`

| `checkId` | Campo | Tipo | Unidade | Obrigatório | Restrições |
|---|---|---|---|---|---|
| `KART_DIMENSIONS` | `bboxLengthM` | número | m | sim | comprimento da caixa envolvente do kart (15 grupos de peças, sem o piloto); `PASS` em 1,93 ± 0,02 (AC-US-0001-01) |
| `KART_DIMENSIONS` | `bboxWidthM` | número | m | sim | largura da caixa envolvente do kart; `PASS` em 1,45 ± 0,02 (AC-US-0001-02) |
| `KART_DIMENSIONS` | `wheelbaseM` | número | m | sim | entre-eixos do modelo montado; `PASS` em 1,05 ± 0,02 (AC-US-0001-03) |
| `WHEELS_AND_TRACKS` | `frontWheelDiametersM` | lista de 2 números (esquerda, direita) | m | sim | diâmetro externo de cada roda dianteira com o pneu; `PASS` quando cada valor, arredondado ao centímetro, é 0,26 (AC-US-0001-04) |
| `WHEELS_AND_TRACKS` | `rearWheelDiametersM` | lista de 2 números (esquerda, direita) | m | sim | idem, rodas traseiras; `PASS` em 0,28 ao centímetro (AC-US-0001-05) |
| `WHEELS_AND_TRACKS` | `frontTrackM` | número | m | sim | bitola dianteira entre os centros das rodas; `PASS` em 1,00 ao centímetro (AC-US-0001-06) |
| `WHEELS_AND_TRACKS` | `rearTrackM` | número | m | sim | bitola traseira; `PASS` em 1,14 ao centímetro (AC-US-0001-07) |
| `PART_GROUPS` | `partGroups` | lista de entradas `groupName` (texto), `visibleTriangleCount` (inteiro, triângulos), `parentGroupName` (texto, opcional) | — | sim | um item por grupo nomeado encontrado no modelo montado; `parentGroupName` é o grupo nomeado mais próximo que o contém, ausente quando nenhum o contém (AC-US-0001-08, AC-US-0001-09) |
| `PART_GROUPS` | `missingGroupNames` | lista de texto | — | sim | nomes dos 16 grupos esperados ([RULE-0001](../rules/RULE-0001-medidas-grupos-e-cores-do-kart-01.md)) ausentes ou com `visibleTriangleCount` 0; lista vazia no `PASS` |
| `PART_COLORS` | `kartColorHexes` | lista de texto `#RRGGBB` | — | sim | cores distintas dos materiais dos 15 grupos de peças; `PASS` exige `#FF6A13` (AC-US-0001-10) |
| `PART_COLORS` | `chassisColorHexes` | lista de texto `#RRGGBB` | — | sim | cores distintas dos materiais do grupo `chassi`; `PASS` exige `#2B2E34` (AC-US-0001-11) |
| `PART_COLORS` | `bumperPlateColorHex` | texto `#RRGGBB` | — | sim | cor da placa do para-choque; `PASS` em `#F4F3EF` (AC-US-0001-12) |
| `PART_COLORS` | `suitColorHex` | texto `#RRGGBB` | — | sim | cor do macacão do piloto, no grupo `piloto`; `PASS` em `#2F55D4` (AC-US-0001-13) |
| `DRAW_COST` | `meshCount` | inteiro | malhas | sim | malhas do modelo montado, kart com o piloto |
| `DRAW_COST` | `drawCallCount` | inteiro | chamadas | sim | soma, por malha, do número de materiais da malha, kart com o piloto, sem a passagem de sombra; `PASS` em no máximo 30 (NFR-0004) |
| `DRAW_COST` | `triangleCount` | inteiro | triângulos | sim | triângulos do modelo montado, kart com o piloto; `PASS` em 5.128 (NFR-0004) |
| `WHEEL_SPIN` | `checkStepCount` | inteiro | passos | sim | número conhecido de passos de `STEP` da verificação; maior que 0 |
| `WHEEL_SPIN` | `simulatedTimeMs` | número | ms | sim | `checkStepCount` × `STEP`, em ms |
| `WHEEL_SPIN` | `rollingSpeedMps` | número | m/s | sim | velocidade de rolamento conhecida e constante durante a verificação ([API-0001](API-0001-estado-do-kart-para-exibicao.md)); há pelo menos um registro com valor maior que 0 e um com 0 |
| `WHEEL_SPIN` | `wheels` | lista de 4 entradas `groupName` (texto), `diameterM` (número, m), `spinRevs` (número, rotações), `expectedSpinRevs` (número, rotações) | — | sim | uma entrada por roda (`rodaDianteiraEsq`, `rodaDianteiraDir`, `rodaTraseiraEsq`, `rodaTraseiraDir`); `expectedSpinRevs` = `rollingSpeedMps` × `simulatedTimeMs` ÷ 1000 ÷ (π × `diameterM`); `PASS` quando `spinRevs` é igual a `expectedSpinRevs` em cada roda, com o sinal do movimento (AC-US-0002-02) |
| `LAYERING` | `checkedFileCount` | inteiro | arquivos | sim | arquivos da camada de simulação verificados; maior que 0 |
| `LAYERING` | `forbiddenImportCount` | inteiro | importações | sim | importações, na camada de simulação, de qualquer parte do modelo, da câmera ou dos efeitos desta feature; `PASS` em 0 (NFR-0005) |
| `RENDER_NEUTRAL` | `checkStepCount` | inteiro | passos | sim | N passos de `STEP` com a mesma sequência de `Input` nas duas execuções |
| `RENDER_NEUTRAL` | `differingFieldCount` | inteiro | campos | sim | campos do estado da simulação diferentes entre a execução com a apresentação desta feature e a execução sem renderização; `PASS` em 0 (NFR-0005) |
| `SIM_CONTRACT` | `stepUnchanged` | booleano | — | sim | `STEP` igual ao de antes da feature (NFR-0006) |
| `SIM_CONTRACT` | `inputContractUnchanged` | booleano | — | sim | mesmo conjunto de campos e mesmas faixas de `Input` (NFR-0006) |
| `SIM_CONTRACT` | `simMeasuresUnchanged` | booleano | — | sim | entre-eixos e bitola da simulação iguais aos de antes da feature (NFR-0006, `DOMAIN/DEC-02`) |
| `SIM_CONTRACT` | `simWheelbaseM`, `simTrackWidthM` | número | m | sim | entre-eixos (1,04) e bitola (1,20) da simulação, como os requisitos os dão; `PASS` com os três booleanos verdadeiros |
| `DETERMINISM` | `comparedRunCount` | inteiro | execuções | sim | execuções comparadas com a linha de base, mesma sequência de `Input` a partir do mesmo estado inicial; maior que 0 |
| `DETERMINISM` | `differingRunCount` | inteiro | execuções | sim | execuções com estado da simulação ou tempo de volta diferentes da linha de base; `PASS` em 0 (NFR-0006) |
| `WHEEL_POSITIONS` | `checkStepCount` | inteiro | passos | sim | N passos de `STEP` com a mesma sequência de `Input` a partir do mesmo estado inicial |
| `WHEEL_POSITIONS` | `comparedValueCount`, `differingValueCount` | inteiro | valores | sim | valores de `wheelPositions` comparados com a linha de base e quantos diferem; `PASS` com `differingValueCount` 0 (NFR-0007) |
| `TELEMETRY_WHEEL_POSITIONS` | `comparedStepCount` | inteiro | passos | sim | passos em que as posições das rodas da telemetria foram comparadas com `wheelPositions` |
| `TELEMETRY_WHEEL_POSITIONS` | `differingValueCount` | inteiro | valores | sim | posições da telemetria diferentes de `wheelPositions` no mesmo passo; `PASS` em 0 (NFR-0007) |

Nenhum campo tem padrão: cada registro só existe quando a verificação roda, e produzi-lo não altera o jogo nem
a simulação (I4). Nenhum campo carrega dado pessoal (I6).

## Erros

| Código | Condição | Efeito |
|---|---|---|
| `FAIL` com `OUT_OF_TOLERANCE` | medida de `KART_DIMENSIONS` fora de ± 0,02 m, ou de `WHEELS_AND_TRACKS` diferente ao centímetro | o modelo é corrigido, nunca a tolerância (US-0001, caso anormal) |
| `FAIL` com `GROUP_MISSING` | `missingGroupNames` não vazia | o agrupamento por material não pode apagar nenhum dos 16 grupos (US-0001, caso anormal) |
| `FAIL` com `GROUP_NESTED` | `piloto` com `parentGroupName` presente, isto é, dentro de um dos 15 grupos de peças | AC-US-0001-09 |
| `FAIL` com `COLOR_MISMATCH` | cor exigida ausente ou diferente | vale a cor da ficha (US-0001, caso anormal) |
| `FAIL` com `LIMIT_EXCEEDED` | `drawCallCount` acima de 30 | NFR-0004 |
| `FAIL` com `SHAPE_CHANGED` | `triangleCount` diferente de 5.128 | o agrupamento mudou a forma (NFR-0004) |
| `FAIL` com `SPIN_MISMATCH` | `spinRevs` diferente de `expectedSpinRevs` em alguma roda, ou com o sinal oposto ao do movimento | AC-US-0002-02 |
| `FAIL` com `FORBIDDEN_IMPORT` | `forbiddenImportCount` maior que 0 | NFR-0005 |
| `FAIL` com `STATE_DIFFERS` | `differingFieldCount` ou `differingValueCount` maior que 0 | NFR-0005, NFR-0007 |
| `FAIL` com `CONTRACT_CHANGED` | algum booleano de `SIM_CONTRACT` falso | NFR-0006 |
| `FAIL` com `NON_DETERMINISTIC` | `differingRunCount` maior que 0 | defeito de determinismo (NFR-0006), nunca tolerância |
| `FAIL` com `BASELINE_MISSING` | linha de base anterior à feature ausente para `SIM_CONTRACT`, `DETERMINISM` ou `WHEEL_POSITIONS` | nada é comparado; a linha de base precisa ser registrada antes |

## Idempotência

Executar a mesma verificação duas vezes produz registros idênticos. Não há chave; não há estado alterado.

## Paginação e sondagem

Não se aplica.

## Compatibilidade

Contrato novo, sem registro publicado sob ele. Não altera nem renomeia campo de outro relatório: a saída dos
ensaios de dirigibilidade (`handlingBenchReport`, com `benchId` e `failReason`) e as verificações de
`race-lap-validation` continuam como estão; por isso este contrato usa `checkId` e `checkFailReason`, nomes
próprios, e `verdict` com o mesmo significado (`PASS`, `FAIL`). Um campo deste contrato nunca muda de
unidade ou de significado sob o mesmo nome (I3).
