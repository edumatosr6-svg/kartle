---
id: DES-0012
title: Invariantes da simulação, física congelada e verificação das regras
feature: race-lap-validation
stage: dspec
status: validated
version: 1.0.1
sources: [FEAT-0005, FEAT-0009, REQ-FEAT-0005-07, REQ-FEAT-0009-02, REQ-FEAT-0009-03, REQ-FEAT-0009-04, REQ-FEAT-0009-10]
---

# DES-0012 — Invariantes da simulação, física congelada e verificação das regras

## Realiza

Os `REQ-*` em `sources`: a simulação livre de DOM, relógio de parede e sorteio sem semente (REQ-FEAT-0009-02),
`STEP` e `Input` inalterados (REQ-FEAT-0009-03), física e presets inalterados com os benchmarks idênticos
(REQ-FEAT-0009-04, REQ-FEAT-0005-07), e ao menos uma verificação determinística por regra de validade e de
cronometragem (REQ-FEAT-0009-10; NFR-0009). É o item que fixa o que **não** muda e como se prova.

## Posicionamento

Nenhum módulo de produção novo. Camada **Simulação**, onde as invariantes se aplicam; `tests/` é o lugar das
verificações (papel de árvore, não camada). Arquivos de teste novos em `tests/` e um registro de benchmarks em `docs/`. Módulos de produção **inalterados**: `src/physics.ts` (inclusive `STEP`, `Input`, `step`,
`RENTAL_KART`, `ARCADE_KART`, `KART_PRESETS`, `CIRCUIT`, `TEST_PAD`) e `src/maneuvers.ts`. A linha 3 de
`src/physics.ts` (`export { nearest, track, WIDTH, LapTracker } from './track'`) permanece como está.

## Interface (o que cada verificação afirma)

| Arquivo de teste | Afirma | Regra de REQ-FEAT-0009-10 que cobre |
|---|---|---|
| `tests/lap-layering.test.ts` | lê o texto dos módulos `src/physics.ts`, `src/maneuvers.ts`, `src/track.ts`, `src/trackData.ts`, `src/lap.ts`, `src/lapTiming.ts` e afirma: nenhuma importação de `three`, de `./audio` nem de `./main`; ausência dos símbolos `document`, `window`, `Date`, `performance`, `Math.random`, `fetch`, `XMLHttpRequest`, `WebSocket`, `localStorage`, `sessionStorage`, `indexedDB`; que `src/main.ts` não importa `LapTracker` e não contém essas chamadas de rede ou de armazenamento | camada e privacidade |
| `tests/lap-frozen.test.ts` | `1 / STEP === 120`; as chaves de `Input` são `throttle`, `brake`, `steer` e `drift?`; os presets mantêm os valores do início desta feature (cópia literal dos campos de `RENTAL_KART` e `ARCADE_KART` registrada no teste) | passo fixo e entradas |
| `tests/lap-contract.test.ts` | forma e unidades de `getLapState`, `getLapResult` e `readTrackData`; códigos de rejeição por operação; as chaves do resultado são exatamente as de API-0001 (sem dado pessoal) | privacidade do resultado |
| `tests/lap-timing.test.ts` | DES-0002 | interpolação do cruzamento; soma dos setores |
| `tests/lap-crossing.test.ts` | DES-0003 (`crossLine`: sentido, fração, coincidência com o passo, segmento fora do alcance) | interpolação do cruzamento; contramão |
| `tests/lap-validity.test.ts` | DES-0003 | marcador pulado; contramão; início no sinal verde (com a contagem) |
| `tests/lap-state.test.ts` | DES-0001 | queima de largada ignorada; suspensão na pausa; pausa repetida e retomada |
| `tests/lap-cut.test.ts` | DES-0004 | corte pelos limites padrão; corte pelos limites da pista; grama sem corte |
| `tests/lap-kinds.test.ts` | DES-0005 | reposicionamento; reconhecimento e treino; pista de dado incompleto |
| `tests/track-data.test.ts` | DES-0006 | dado incompleto; versão anterior; versão desconhecida |
| `tests/lap-determinism.test.ts` | DES-0001, DES-0002 | duas execuções iguais; 30 e 60 quadros; com e sem pausa |

Nomes em uso na árvore: a etapa de testes nomeia os arquivos `tests/<feature>-<área>.test.ts`; cada
`tests/lap-<área>.test.ts` desta tabela corresponde a `tests/race-lap-validation-<área>.test.ts` e
`tests/track-data.test.ts` a `tests/race-lap-validation-track-data.test.ts`. Os nomes desta tabela, os citados nos
demais itens de projeto e os nomes curtos da test-strategy designam esses arquivos.

Benchmarks: antes de alterar o código, o código registra em `docs/lap-validation-bench.md` a saída completa de
`npm run bench:physics` e de `npm run bench:handling` (NFR-0011); depois da mudança, repete e acrescenta o
resultado de uma comparação linha a linha. Como `src/physics.ts`, `src/maneuvers.ts` e `LapTracker` não são
editados, a diferença esperada é nula em 100% das medidas.

## Colaboradores

Os testes importam `src/*.ts` diretamente (tsx) e `node:fs` para ler o texto dos módulos. Nenhum teste importa
`src/main.ts`.

## Estado e concorrência

Sem estado de produção. Os testes não compartilham estado: cada um constrói a sua sessão.

## Comportamento em falha

Uma violação de camada ou de símbolo proibido faz `npm test` falhar no teste de camada, com o nome do módulo e do
símbolo. Um benchmark diferente do registrado é defeito da feature (REQ-FEAT-0009-04), e não tolerância.

## Determinismo (D-DS-07)

O próprio item é a prova: o teste de camada impede o relógio e o sorteio na simulação; o teste de determinismo
roda a mesma sequência duas vezes. Semeadura: os testes que precisam de variação usam um gerador congruencial
linear com semente fixa escrita no arquivo de teste (`tests/helpers/seeded.ts`), nunca `Math.random`.

## Feature flag

Nenhuma: não é comportamento de usuário; é proteção do que não muda.

## Pontos em aberto

Nenhum.
