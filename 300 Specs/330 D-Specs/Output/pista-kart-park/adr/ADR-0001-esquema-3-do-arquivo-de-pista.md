---
id: ADR-0001
title: Esquema 3 do arquivo de pista — geometria no arquivo e leitor das versões 1, 2 e 3
feature: pista-kart-park
stage: dspec
status: validated
version: 1.0.0
sources: [API-0001, FEAT-0002, REQ-FEAT-0002-02, REQ-FEAT-0002-12, REQ-FEAT-0002-15, REQ-FEAT-0002-16, REQ-FEAT-0004-04]
---

# ADR-0001 — Esquema 3 do arquivo de pista: geometria no arquivo e leitor das versões 1, 2 e 3

## Contexto

O esquema 2 de `race-lap-validation` não leva a geometria: a linha central e a largura são constantes de
`src/track.ts` (`:2-6`), e as verificações de consistência C1 a C7 (`src/trackData.ts:138`) e a borda do corte
(`src/lap.ts:218-220`) usam essa constante. A Kart Park é a primeira pista com geometria própria. O F-Spec
decide a versão de esquema 3 com `centerline`, `curbs`, `barriers` e `osmDerived`, a versão 2 lida como hoje
e a versão 3 sem linha central utilizável como `UNREADABLE` (API-0001; REQ-FEAT-0002-02, -15, -16). O esquema
do arquivo de pista é caro de reverter (D-DS-05).

## Decisão

1. `TRACK_SCHEMA_VERSION` passa a 3; o leitor classifica 1, 2 e 3 pela tabela de [DM-0001](../data/DM-0001-arquivo-de-pista-versao-de-esquema-3.md);
   maior que 3 é `UNSUPPORTED_SCHEMA`.
2. A versão 2 segue exatamente o caminho de hoje, com a geometria sintética; o arquivo da pista sintética não
   muda (continua 2, `trackVersion` 2).
3. A versão 3 traz a geometria inteira no arquivo; a simulação a usa como declarada, sem suavizar,
   reamostrar nem converter ao carregar (REQ-FEAT-0002-12). A geometria derivada (bordas, zebras, grade)
   é construída do arquivo por `src/trackGeometry.ts`, nunca gravada nele.
4. A consistência da versão 3 roda sobre a geometria do próprio arquivo (`checkConsistencyV3`), com C6 e a
   cláusula da largada de C7 adaptadas: C6 v3 exige que as pontas de cada linha estejam na grama (não há muro
   na versão 3, REQ-FEAT-0004-04) e C7 v3 exige a largada do lado de depois da chegada, em vez de a 2 m dela
   (REQ-FEAT-0002-06 a põe a cerca de 0,5 m).
5. Os campos opcionais `curbs`, `barriers` e `osmDerived` têm padrão neutro (lista vazia, lista vazia,
   `false`).

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Acrescentar a geometria à versão 2 como campo opcional | um leitor da versão 2 que ignorasse `centerline` desenharia e simularia a Kart Park com a geometria sintética, em silêncio (I3, I4); o F-Spec decide versão nova |
| Manter `TRACK_SCHEMA_VERSION` em 2 e criar outra constante para a versão 3 | redefiniria o significado de um nome existente ("maior versão que o leitor conhece", I3) |
| Generalizar `checkConsistency` para receber a geometria | muda o caminho da versão 2, que `race-lap-validation` verifica (`tests/race-lap-validation-track-data.test.ts`); uma função nova para a versão 3 deixa o caminho existente intacto |
| Passar a pista sintética para a versão 3 | contraria REQ-FEAT-0002-15 e NFR-0009 (a pista sintética não muda) e mexeria nos ensaios calibrados de `dirigibilidade` |

## Consequências

- Uma pista nova com geometria própria é só um arquivo novo em esquema 3, preparado offline.
- Dois testes de `race-lap-validation` que afirmam o literal 2 e usam 3 como "versão posterior"
  (`tests/race-lap-validation-track-data.test.ts:20-21`, `:24-30`) passam a reprovar; a mudança deles é da
  etapa de testes daquela feature, por feedback ([01-architecture](../01-architecture.md), "Consequências para
  outras features").
- Um cliente antigo diante de um arquivo da versão 3 o rejeita de forma visível (`UNSUPPORTED_SCHEMA`).

## Status

Proposta deste conjunto, a validar.
