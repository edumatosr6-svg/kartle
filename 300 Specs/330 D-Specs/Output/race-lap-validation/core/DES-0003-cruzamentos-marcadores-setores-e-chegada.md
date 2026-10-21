---
id: DES-0003
title: Cruzamentos, marcadores, setores e chegada
feature: race-lap-validation
stage: dspec
status: validated
version: 1.0.0
sources: [FEAT-0002, FEAT-0004, FEAT-0006, FEAT-0009, REQ-FEAT-0002-01, REQ-FEAT-0002-10, REQ-FEAT-0002-12, REQ-FEAT-0002-13, REQ-FEAT-0002-14, REQ-FEAT-0004-01, REQ-FEAT-0004-02, REQ-FEAT-0004-03, REQ-FEAT-0004-04, REQ-FEAT-0004-05, REQ-FEAT-0004-06, REQ-FEAT-0004-07, REQ-FEAT-0004-09, REQ-FEAT-0004-10, REQ-FEAT-0004-11, REQ-FEAT-0004-12, REQ-FEAT-0004-13, REQ-FEAT-0006-13, REQ-FEAT-0009-01]
---

# DES-0003 — Cruzamentos, marcadores, setores e chegada

## Realiza

Os `REQ-*` em `sources`: conclusão da volta ao cruzar a chegada no sentido da pista com todos os marcadores em
ordem (AC-US-0002-01), um único resultado (AC-US-0002-12), tempo de setor encerrado no limite declarado
(AC-US-0002-10), marcador pulado e fora de ordem (AC-US-0004-01 a -07), chegada e marcador na contramão sem
efeito (AC-US-0005-01 a -04), e as voltas de reconhecimento e treino tratadas como qualquer outra
(AC-US-0008-01, AC-US-0005-01). Tabelas de decisão: RULE-0001 e RULE-0003.

## Posicionamento

- Primitivas geométricas em `src/track.ts`, camada **dado de pista**: `sideOf(line, point)` e
  `crossLine(line, from, to)`. Ficam no dado de pista, e não na simulação, porque a verificação de consistência
  do arquivo ([DES-0006](DES-0006-leitura-do-dado-de-pista.md)) também as usa e uma camada interna não pode importar
  uma externa (I2). O tipo `Line` também é de `src/track.ts`.
- Avaliação por passo em `src/lap.ts` (função interna `evaluateDisplacement`), camada **simulação**. Não há
  módulo novo: estende o de DES-0001.

## Interface

`crossLine(line, from, to)` devolve `null` ou `{sense, fraction}`:

- `sense`: `FORWARD` quando `sideOf(from) < 0` e `sideOf(to) >= 0`; `REVERSE` quando `sideOf(from) > 0` e
  `sideOf(to) <= 0`; a fórmula de `side` está em [DM-0001](../data/DM-0001-arquivo-de-pista-versao-2.md).
- `fraction`: `|side(from)| / |side(to) - side(from)|`, em (0, 1]; vale 1 quando o deslocamento termina
  exatamente sobre a linha (coincide com o passo).
- O ponto de cruzamento tem de cair dentro do segmento da linha (parâmetro de 0 a 1 inclusive); fora dele não há
  cruzamento. Só aritmética de soma, subtração, multiplicação e divisão.

`evaluateDisplacement(session, from, to, instantMsAt)` aplica, nesta ordem, para um deslocamento do kart de
`from` a `to` num passo `RUNNING`; `instantMsAt(fraction)` devolve o instante em ms inteiros
(`interpolateMs(k, fraction)` num passo; `toMs(stepCount)` num reposicionamento, DES-0005):

1. **Marcador.** Só o marcador de índice `markersPassedCount + 1` (o próximo na ordem declarada) é testado. Um
   cruzamento `FORWARD` dele aumenta `markersPassedCount` de 1. `REVERSE`, ou um marcador que não é o próximo, não
   muda o contador (REQ-FEAT-0004-11 e -12). Atravessar de novo um marcador já contado não faz nada.
2. **Limite de setor.** Só o limite de índice `sectorBoundsMs.length + 1` é testado. Um cruzamento `FORWARD`
   acrescenta `instantMsAt(fraction)` a `sectorBoundsMs`. Contramão e limites fora da ordem não contam
   (REQ-FEAT-0002-14).
3. **Chegada.** Um cruzamento `REVERSE` é ignorado: a volta não se encerra, não há resultado e a fase continua
   `RUNNING` (REQ-FEAT-0004-08 a -10). Um cruzamento `FORWARD`:
   - com `markersPassedCount` igual ao total de marcadores: volta concluída. `b4 = instantMsAt(fraction)`,
     resultado `VALID` com `lapMs` = `b4` e `sectorMs` pelos quatro `bi` ([DES-0002](DES-0002-tempo-da-volta-e-interpolacao.md)),
     fase `ENDED`;
   - com menos marcadores passados: `validity` `INVALID`, `invalidReason` `MISSED_MARKER`, fase `ENDED`, resultado
     sem tempo, no passo da chegada, sem tempo acrescentado depois dele.

Invariante dos dados completos (DM-0001, C4 a C7): numa pista `COMPLETE` a ordem dos eventos ao longo da linha
central é marcador, limite, marcador, limite, marcador, limite, marcador, chegada; cada linha é cruzada uma vez
pela linha central, e duas linhas distam pelo menos 2 m, de modo que no máximo uma linha é cruzada por passo. A
chegada e os limites de setor cobrem a pista até além das paredes (C6), então um kart que passou por todos os
marcadores em ordem e chegou à chegada necessariamente cruzou antes os três limites: uma volta `VALID` tem sempre
`sectorBoundsMs.length` igual a 3 antes de `b4`. `tests/lap-validity.test.ts` verifica essa propriedade com
entradas determinísticas semeadas.

Só as linhas de uma leitura `COMPLETE` são avaliadas. Numa leitura `INCOMPLETE` o passo ignora marcadores, setores
e chegada ([ADR-0004](../adr/ADR-0004-lacunas-do-f-spec-resolvidas-no-projeto.md)).

**Precedência no mesmo passo** (lacuna deliberada do F-Spec, decisão de projeto em ADR-0004): primeiro os
cruzamentos de linha na ordem marcador, setor, chegada, depois o corte. Um cruzamento de chegada que encerra a
volta num passo prevalece sobre um corte que o mesmo passo também configuraria, pois o cruzamento ocorre no
interior do passo e o corte é decidido no fim dele.

## Colaboradores

Chama `crossLine` (`src/track.ts`), `interpolateMs` e `toMs` (`src/lapTiming.ts`). É chamado por `stepLap`
(DES-0001) e por `repositionKart` (DES-0005).

## Estado e concorrência

Lê e altera `markersPassedCount`, `sectorBoundsMs`, `validity`, `invalidReason`, `phase` e `result`
(DM-0002).

- **Chave de deduplicação**: o índice do próximo marcador e do próximo limite. Atravessar de novo o que já foi
  contado é idempotente por construção: o contador não se move.
- **Unicidade**: depois de `ENDED` a sessão não muda (DES-0001); um segundo cruzamento da chegada, de volta
  concluída ou invalidada, não gera segundo resultado (REQ-FEAT-0002-12, -0004-13).
- **Ordem**: toda transição carrega o `stepCount` do passo em que ocorreu; um marcador atravessado antes do
  anterior é ignorado (evento fora de ordem sem efeito).
- **Pausa**: nenhum passo roda em `PAUSED`, então as passagens por marcador e os limites de setor já registrados
  se preservam (REQ-FEAT-0004-14).

## Comportamento em falha

Sem dependências. Se um deslocamento não cruza nenhuma linha, a sessão só avança o contador. Um deslocamento de
comprimento 0 não cruza nada. Não há registro de log.

## Determinismo (D-DS-07)

Só aritmética de ponto flutuante básica e comparações; passo fixo; sem relógio nem sorteio. Provas:
`tests/lap-crossing.test.ts` (sentido, fração, coincidência exata com o passo, segmento fora do alcance, duas
execuções iguais) e `tests/lap-validity.test.ts` (volta completa `VALID` na pista sintética; marcador pulado;
chegada na contramão; novo cruzamento depois do fim).

## Feature flag

Nenhuma: FEAT-0002 e FEAT-0004 não têm chave; o comportamento vale ligado.

## Pontos em aberto

Nenhum.
