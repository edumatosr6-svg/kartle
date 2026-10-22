---
id: ADR-0003
title: Colisão com a barreira — superfície de contato de meia espessura, resposta do muro e trajeto do subpasso
feature: pista-kart-park
stage: dspec
status: validated
version: 1.0.0
sources: [RULE-0001, FEAT-0004, REQ-FEAT-0004-04, REQ-FEAT-0004-05, REQ-FEAT-0004-06, REQ-FEAT-0004-07]
---

# ADR-0003 — Colisão com a barreira

## Contexto

O muro existente (`src/physics.ts:276-290`) é uma restrição de um lado só, derivada da linha central sintética:
depois de cada subpasso, se o centro do kart está a mais de `WIDTH / 2 + 8` da linha central, é projetado
sobre esse limite e a componente da velocidade para fora é refletida com fator 1,12, `yawRate` multiplicado por
0,65, a manobra cancelada e `wallContact` marcado. A barreira da Kart Park é uma poligonal na grama entre dois
trechos, que bloqueia **dos dois lados**, em qualquer velocidade, com a mesma resposta do muro no referencial
local do obstáculo (REQ-FEAT-0004-05, -06), e marca o passo da entrada em contato (REQ-FEAT-0004-07). Uma
linha de espessura zero com o centro projetado exatamente sobre ela deixa o lado do kart indefinido no
subpasso seguinte.

## Decisão

1. Cada segmento de barreira tem uma superfície de contato a `BARRIER_HALF_WIDTH_M` = 0,1 m de cada lado (a
   barreira tem 0,2 m de espessura, também no desenho).
2. A cada subpasso, depois do muro e na ordem do arquivo: se o trajeto do centro no subpasso cruza o segmento,
   o contato é no cruzamento, do lado de origem; senão, se o centro está a menos de 0,1 m do segmento, o
   contato é no ponto mais próximo, do lado em que o centro está. O centro vai para a superfície de contato.
3. A resposta é a do muro, com as mesmas operações e constantes (1,12; 0,65; cancelar a manobra) e a normal
   apontando para a barreira; o bloco do muro não é alterado.
4. `barrierContact` é verdadeiro só no passo em que o kart passa a tocar (contato ou centro a até 0,01 m além
   da superfície) sem ter tocado no passo anterior; raspar ou ficar encostado não o renova.
5. Na Kart Park não há muro (`walls: false`); os únicos obstáculos são as barreiras do arquivo.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Barreira de espessura zero com o lado guardado no estado | um campo de estado novo só para desempatar um centro exatamente sobre a linha; a espessura dá o lado pela geometria |
| Só a verificação da posição final (como o muro) | um kart rápido o bastante atravessaria a linha num subpasso; REQ-FEAT-0004-05 exige decidir no trajeto |
| Barreira como muros derivados das bordas | colocaria obstáculo onde a grama passa de 6 m (contra AC-US-0004-02) e mudaria o muro da pista sintética |
| Generalizar o bloco do muro numa função comum | mexeria no caminho da pista sintética, de que dependem os resultados de `race-lap-validation` e de `dirigibilidade` |

## Consequências

- No referencial local (origem no ponto de contato da superfície, eixos na normal e na tangente), a posição e
  a velocidade depois do contato são as do muro; a comparação de AC-US-0004-05 é feita em ambientes de grama
  em toda parte, para isolar a resposta do obstáculo da superfície.
- O centro do kart para a 0,1 m da linha da barreira; o preparo exige que a grama entre as pistas tenha ao menos
  0,2 m onde há barreira, para a superfície de contato não encostar na pista.
- A física passa a ler os segmentos de barreira só quando o ambiente tem `track`; a pista sintética não paga
  nada.

## Status

Proposta deste conjunto, a validar.
