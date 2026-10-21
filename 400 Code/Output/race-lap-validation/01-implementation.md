---
title: Registro de implementação — validação de volta de corrida
feature: race-lap-validation
stage: code
status: draft
version: 1.0.0
sources: []
---

# Registro de implementação

Rodada 1, Mode A: o projeto validado de `300 Specs/330 D-Specs/Output/race-lap-validation/` foi implementado por inteiro
na raiz do repositório (`src/`, `index.html`; `400 Code/Source/` segue vazio por decisão do dono do produto). Nenhum
arquivo de `tests/`, `scripts/`, `package.json` ou `tsconfig.json` foi tocado; nenhuma dependência foi acrescentada.
A ordem de construção foi a do projeto: dado de pista (DM-0001, DES-0006), simulação (DES-0001 a DES-0005, DES-0002),
aplicação (DES-0007 a DES-0010); o portão determinístico rodou ao fim de cada camada.

## Arquivos tocados (D-CD-01)

| Arquivo | Situação | Camada | Itens de projeto |
|---|---|---|---|
| `src/track.ts` | alterado | dado de pista | DES-0003 (`Line`, `sideOf`, `crossLine`), DES-0006 e DM-0001 (`SYNTHETIC_TRACK_FILE`) |
| `src/trackData.ts` | novo | dado de pista | DES-0006, DM-0001 |
| `src/lapTiming.ts` | novo | simulação | DES-0002 |
| `src/lap.ts` | novo | simulação | DES-0001, DES-0003, DES-0004, DES-0005, DM-0002 |
| `src/frameClock.ts` | novo | aplicação | DES-0007 |
| `src/lapMessages.ts` | novo | aplicação | DES-0008 |
| `src/main.ts` | alterado | aplicação e adaptadores | DES-0007, DES-0009, DES-0010, DES-0011 |
| `index.html` | alterado | aplicação | DES-0008, DES-0009, DES-0010 |
| `src/style.css` | alterado | aplicação | DES-0008, DES-0010 |
| `docs/lap-validation-bench.md` | novo | registro | DES-0012 (NFR-0011) |

Inalterados, como o projeto exige: `src/physics.ts` (inclusive a linha 3 que reexporta `LapTracker`), `src/maneuvers.ts`,
`src/audio.ts`, `scripts/*.ts`, `tests/*.ts`.

## Portão determinístico desta rodada

| Passo | Resultado |
|---|---|
| `npx tsc --noEmit` | saída 0 |
| `npm test` | saída 0; 32 testes, 32 aprovados, 0 reprovados (suíte pré-existente; os testes novos são do estágio de testes) |
| `npm run build` | saída 0 |
| `npm run bench:physics` e `npm run bench:handling` | saída 0; 0 linhas diferentes em relação à árvore anterior (registro em `docs/lap-validation-bench.md`) |

## Rastreabilidade

A matriz `99-traceability.md` é gerada pelo gate a partir dos campos `sources` dos registros `core/`, `data/`, `web/`
e `security/`; cada registro nomeia, por `REQ-*`, o arquivo e o símbolo que o realiza. O índice `00-index.md` também é
gerado. As divergências herdadas do D-Spec estão em `98-divergences.md`, com o `arquivo:linha` de cada resolução.
