---
id: ADR-0003
title: Esquema do arquivo de pista na versão 2 e leitor da forma anterior
feature: race-lap-validation
stage: dspec
status: validated
version: 1.0.0
sources: [FEAT-0008, REQ-FEAT-0008-08, REQ-FEAT-0008-09, REQ-FEAT-0008-10, REQ-FEAT-0008-11, REQ-FEAT-0008-12]
---

# ADR-0003 — Esquema do arquivo de pista na versão 2 e leitor da forma anterior

## Contexto

A pista sintética atual é uma constante de código (`src/track.ts:2-6`) sem `schemaVersion`, sem `trackVersion` e sem
largada, sentido, chegada, setores nem marcadores. O F-Spec exige que esses itens venham do dado da pista, que setores
e marcadores sejam conjuntos distintos, que a mudança seja versionada com leitor da forma anterior e que uma versão
desconhecida seja mantida intacta e reportada (FEAT-0008; NFR-0012; I3, I5). O esquema do arquivo de pista é um
contrato publicado e caro de reverter (D-DS-05). O arquivo é produzido pela etapa 3 (pipeline de pistas), fora desta
feature.

## Decisão

1. O arquivo é um objeto JSON com `schemaVersion` inteiro. A versão atual é 2; a anterior é 1. O que é publicado em
   campos fica em DM-0001.
2. A forma anterior (`schemaVersion` 1, com `trackId` e `trackVersion`) é lida **sem erro** e classificada
   `INCOMPLETE`: só treino. Não é descartada, alterada nem convertida no lugar.
3. `schemaVersion` maior que 2 é `UNSUPPORTED_SCHEMA`: o arquivo fica intacto, é reportado e não é usado.
4. Campos novos: `direction`, `startPosition`, `finishLine`, `sectorLimits` (exatamente 3), `markers` (1 ou mais),
   `cutDistanceM`, `cutDurationMs`. Os de corte são opcionais, com padrão neutro de 3 m e 1000 ms.
5. A geometria (linha central e largura) continua em `src/track.ts` e **não** entra no arquivo nesta versão: seus
   nomes, unidades e significado não mudam. Mover a geometria para o arquivo é uma versão de esquema futura.
6. Dado declarado fora de forma ou inconsistente (verificações C1 a C7) é `INCOMPLETE`, nunca `COMPLETE` por boa
   vontade: o efeito seguro é jogar só treino.
7. A pista sintética publica o arquivo como **literais** (`trackVersion` 2) e a forma anterior vira arquivo de teste.
   Uma mudança de dado de pista publicada gera nova `trackVersion`; a antiga nunca é editada.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Calcular setores e marcadores a partir dos índices da linha central ao carregar | torna o dado função de `Math.cos` e de constantes do jogo, contra "dado da pista, e não constantes do jogo"; não distingue duas pistas |
| Incluir a linha central e a largura no arquivo agora | amplia a mudança além do que o F-Spec pede e obriga a mexer em `nearest`, em `CIRCUIT` e na física |
| Tratar a forma anterior como erro ou convertê-la | viola NFR-0012 (ler sem erro 100%) e I3/I5 (não descartar nem reescrever) |
| Aceitar versões maiores "no que for compreensível" | viola I3/I4: dado desconhecido é mantido e reportado, não interpretado |

## Consequências

- A etapa 3 tem um contrato claro do que entregar para uma pista ser `COMPLETE`; enquanto não entrega, a pista é
  só treino.
- A versão 1 existe só como forma lida; nenhuma pista real a usa hoje (a constante sem versão não era um arquivo).
- Trocar um marcador, um limite ou o valor de corte de uma pista publicada exige nova `trackVersion`.
- A verificação de consistência é pura e roda em `npm test`; ela também vale para o arquivo da etapa 3.

## Status

Proposta aceita neste conjunto.
