---
id: ADR-0004
title: Lacunas deliberadas do F-Spec que o projeto precisa fechar
feature: race-lap-validation
stage: dspec
status: validated
version: 1.0.0
sources: [FEAT-0005, FEAT-0006, FEAT-0008, REQ-FEAT-0005-11, REQ-FEAT-0006-15, REQ-FEAT-0008-13]
---

# ADR-0004 — Lacunas deliberadas do F-Spec que o projeto precisa fechar

## Contexto

O F-Spec (`01-overview.md`, "Lacunas deliberadas") recusou decidir quatro pontos que uma implementação determinística
não pode deixar indefinidos. A simulação não pode ter comportamento aleatório em nenhum deles (I8, D-DS-07). Cada
escolha abaixo é a mais estreita que fecha a lacuna sem acrescentar interface nova, e é anotada no changelog como
decisão de projeto, não de requisito. A realimentação ao F-Spec só é necessária se o dono do produto discordar.

## Decisão

1. **Precedência no mesmo passo.** Num passo `RUNNING`, avaliam-se primeiro os cruzamentos de linha (marcador, setor,
   chegada) e depois o corte. Uma chegada que encerra a volta prevalece sobre um corte que o mesmo passo
   configuraria, pois o cruzamento acontece dentro do passo e o corte é decidido no fim dele. Um reposicionamento é
   aplicado entre dois passos, antes do seguinte.
2. **Destino do reposicionamento.** O ponto da linha central mais próximo do kart, com o rumo da linha central no
   sentido de percurso, velocidade 0 e estado de física como `initialState()`. O deslocamento é avaliado para
   cruzamentos de linha como qualquer deslocamento do kart.
3. **Volta num dado `INCOMPLETE`.** A volta é pilotável como treino: contagem, cronômetro, pausa, reposicionamento
   livre e corte se aplicam; marcadores, limites de setor e chegada **não** são avaliados, pois não são confiáveis. Por
   isso nenhuma volta nessa pista chega a `VALID` (não há como produzir quatro tempos de setor); um resultado, quando
   existe (corte), é não oficial. O posicionamento inicial usa `startPosition` se for válido, senão o ponto de
   índice 0 da linha central, com o rumo existente. O que se cronometra é o tempo de passos desde o sinal verde.
4. **Pausa manual em `web-mobile`.** Não é projetada: API-0002 não tem causa de pausa para ela, e acrescentar um valor
   a `pauseCause` seria superfície nova fora do F-Spec. Ver ADR-0005.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Cortar antes da chegada no mesmo passo | faria um kart que cruzou a chegada válida dentro do passo perder a volta por um efeito posterior ao cruzamento |
| Reposicionar na última posição segura gravada | exige guardar histórico de posições, estado extra sem requisito que o peça |
| Num dado `INCOMPLETE`, avaliar as linhas que existirem | mistura dado confiável e não confiável; uma volta poderia ficar `VALID` com setores incompletos |
| Pausa manual por toque com nova causa | muda o enum de API-0001 e API-0002; pertence ao F-Spec (proposta ao autor, não deste conjunto) |

## Consequências

- Um corte exatamente no passo da chegada nunca invalida uma volta já concluída.
- Reposicionar em treino perto de um limite de setor pode contar o limite, de forma consistente com a regra
  do deslocamento; isso só afeta voltas não oficiais.
- Pistas de dado incompleto não produzem tempo de volta válido; isso é compatível com "todo resultado é não oficial".
- Se o dono do produto decidir de outra forma qualquer dos quatro pontos, a mudança é local a `src/lap.ts` e a este
  ADR, sem alterar contratos publicados.

## Status

Proposta aceita neste conjunto. Itens 1 a 3 são decisões de projeto; o item 4 é registro de uma não decisão.
