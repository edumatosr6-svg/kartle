---
id: FEAT-0006
title: Requisitos transversais — download, dependências, camada de aplicação e simulação inalterada
feature: modelo-kart-01
stage: fspec
status: draft
version: 1.0.0
sources: [NFR-0002, NFR-0003, NFR-0005, NFR-0006]
---

# FEAT-0006 — Requisitos transversais

## Resumo

Reúne o que vale para toda a feature e não pertence a uma história só: o download inicial continua abaixo de
3 MB; nenhuma dependência de execução nova entra; tudo desta feature fica na camada de aplicação e a
renderização não muda o estado da simulação (I2); os arquivos da simulação e os presets não mudam, nem o
passo, o `Input` e as medidas da simulação, e a mesma sequência de `Input` dá o mesmo resultado (I8).

## Canais

`web-desktop` e `web-mobile`, sem diferença. Download e dependências são medidos sobre o build entregue e a
lista de dependências declarada pelo projeto; camadas, neutralidade da renderização, contrato de passo e
determinismo, na saída de `npm test` ([API-0002](../api/API-0002-relatorio-do-modelo-montado.md)); arquivos
da simulação, pela diferença do repositório.

## Requisitos

- REQ-FEAT-0006-01: O sistema SHALL manter o download inicial do jogo, com o Kart 01 e a câmera de jogo
  incluídos, abaixo de 3 MB transferidos com compressão numa primeira visita com cache vazio, medido como a
  soma dos bytes comprimidos dos recursos baixados e conferido pela lista de transferências de rede do
  navegador (NFR-0002).
- REQ-FEAT-0006-02: O sistema SHALL manter a lista de dependências de execução declarada pelo projeto igual
  antes e depois da feature, com 0 dependências de execução novas (NFR-0003).
- REQ-FEAT-0006-03: O sistema SHALL montar o modelo como diz a seção Restrições do seed, citada por
  NFR-0003: "O modelo é montado em Three.js 0.186, já usado pelo projeto"; a versão declarada continua 0.186
  antes e depois da feature, com 0 outras versões declaradas (NFR-0003).
- REQ-FEAT-0006-04: O sistema SHALL manter o modelo, a câmera e os efeitos desta feature na camada de
  aplicação, com 0 importações, na camada de simulação, de qualquer parte deles, reportadas no registro
  `LAYERING` da saída de `npm test` (NFR-0005).
- REQ-FEAT-0006-05: O sistema SHALL produzir, após o mesmo número de passos de `STEP` com a mesma sequência de
  `Input`, o mesmo estado da simulação numa execução com o modelo, a câmera e os efeitos desta feature e numa
  execução sem renderização, com 0 diferenças, reportadas no registro `RENDER_NEUTRAL` (NFR-0005).
- REQ-FEAT-0006-06: O sistema SHALL cumprir a seção Restrições do seed, citada por NFR-0006: "Nenhuma mudança
  em `src/physics.ts`, `src/lap.ts`, `src/track.ts` ou nos presets", com 0 linhas alteradas nesses três
  arquivos e nos presets pelas mudanças desta feature (NFR-0006).
- REQ-FEAT-0006-07: O sistema SHALL manter `STEP`, o conjunto de campos e as faixas de `Input` e as medidas da
  simulação (entre-eixos de 1,04 m e bitola de 1,20 m) iguais aos de antes da feature, reportados no registro
  `SIM_CONTRACT` (NFR-0006).
- REQ-FEAT-0006-08: O sistema SHALL produzir, para a mesma sequência de `Input` a partir do mesmo estado
  inicial, o mesmo estado da simulação e o mesmo tempo de volta de antes da feature, em 100 % das execuções
  comparadas, reportados no registro `DETERMINISM` (NFR-0006).

## Comportamento

Verificações: [FLOW-0003](../flows/FLOW-0003-verificacao-do-modelo-montado.md),
[API-0002](../api/API-0002-relatorio-do-modelo-montado.md). Camadas: `01-overview.md`, seção Camadas.

| Situação | Comportamento |
|---|---|
| Download inicial de 3 MB ou mais | O requisito 01 não é atendido; o modelo é montado por código no próprio jogo, sem arquivo de modelo separado, e o limite não muda |
| Dependência de execução nova ou outra versão da biblioteca 3D declarada | Os requisitos 02 e 03 não são atendidos; o código do Cowork é adaptado à versão já usada |
| Importação, na simulação, de parte do modelo, da câmera ou dos efeitos | `LAYERING` dá `FAIL` com `FORBIDDEN_IMPORT` |
| Estado da simulação diferente com e sem renderização | `RENDER_NEUTRAL` dá `FAIL` com `STATE_DIFFERS`: a renderização decidiu algo |
| `STEP`, campos ou faixas de `Input`, ou medidas da simulação alterados | `SIM_CONTRACT` dá `FAIL` com `CONTRACT_CHANGED` |
| Estado ou tempo de volta diferentes da linha de base | `DETERMINISM` dá `FAIL` com `NON_DETERMINISTIC` |
| Linha de base anterior à feature ausente | `DETERMINISM`, `WHEEL_POSITIONS` ou `SIM_CONTRACT` dão `FAIL` com `BASELINE_MISSING`; nada é comparado |
| Linha alterada num dos três arquivos citados ou nos presets | O requisito 06 não é atendido; a mudança pertence à feature `dirigibilidade` ou a `race-lap-validation` |
| Rede indisponível | Sem efeito: tudo roda localmente (D-FS-08) |

## Estado

Não define estados próprios; lê `verdict` e `checkFailReason` dos registros de
[API-0002](../api/API-0002-relatorio-do-modelo-montado.md).

## Configuração

Nenhuma. Logging, verbosidade e caminhos de arquivo são configurados globalmente e nunca por esta feature;
nenhuma configuração existe para forçar um evento, injetar um estado ou habilitar um caminho de depuração.

## Critérios de aceite

- Medida do build entregue numa primeira visita com cache vazio: menos de 3 MB comprimidos, conferidos pela
  lista de transferências de rede do navegador (satisfaz o NFR-0002; cobre o requisito 01).
- Lista de dependências de execução declarada idêntica antes e depois da feature, com a versão 0.186 da
  biblioteca 3D e nenhuma outra versão dela (satisfaz o NFR-0003; cobre os requisitos 02 e 03).
- `LAYERING` com `forbiddenImportCount` 0 e `RENDER_NEUTRAL` com `differingFieldCount` 0 (satisfaz o
  NFR-0005; cobre os requisitos 04 e 05).
- Diferença do repositório introduzida pela feature com 0 linhas nos três arquivos citados e nos presets;
  `SIM_CONTRACT` com os três booleanos verdadeiros; `DETERMINISM` com `differingRunCount` 0 (satisfaz o
  NFR-0006; cobre os requisitos 06, 07 e 08).

## Pontos em aberto

Nenhum.
