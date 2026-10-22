---
id: ADR-0006
title: Lacunas deliberadas do F-Spec resolvidas no projeto
feature: pista-kart-park
stage: dspec
status: validated
version: 1.0.0
sources: [RULE-0002, RULE-0004, FEAT-0002, FEAT-0004, FEAT-0005, FEAT-0006, REQ-FEAT-0002-05, REQ-FEAT-0002-10, REQ-FEAT-0004-08, REQ-FEAT-0005-03, REQ-FEAT-0005-04, REQ-FEAT-0005-12, REQ-FEAT-0005-15, REQ-FEAT-0006-03]
---

# ADR-0006 — Lacunas deliberadas do F-Spec resolvidas no projeto

## Contexto

O F-Spec (`01-overview.md`, "Lacunas deliberadas") deixa ao D-Spec, sem valor inventado nos requisitos: a
largura lateral de cada zebra ("decidido no D-Spec com a evidência registrada"), o método e a janela da
suavização (orientação de cerca de 12 m; o que se verifica é 0,30 m e 687,5 m ± 1 %), o intervalo e o timbre do
som da zebra, a aba de abertura do link do crédito, a origem das coordenadas do arquivo gerado e a aparência da
zebra e da barreira. O arquivo de origem não declara largura de zebra (só `lado`, `de_m`, `ate_m`).

## Decisão

| Lacuna | Valor | Motivo e evidência |
|---|---|---|
| Largura da zebra | 1,0 m por trecho, reduzida pelo preparo até deixar 0,4 m de grama até outra parte da volta; abaixo de 0,3 m o preparo falha | menor que a bitola do kart (1,2 m, `src/physics.ts:49`): o kart tem no máximo as duas rodas de um lado na zebra, que é o caso de RULE-0001; pequena diante do asfalto de 4,4 m a 10,8 m. A evidência de cada trecho (largura gravada e, quando reduzida, a folga que a limitou) fica em `prep.curbWidthsM` e `prep.reducedCurbs` do registro de publicação ([DM-0002](../data/DM-0002-registro-de-publicacao-e-estado-em-memoria.md)) |
| Suavização | iteração de Jacobi `λ` 0,5 sobre os vizinhos por índice, com grampo de 0,295 m em torno do ponto da origem; número de iterações de 0 a 400 escolhido pelo comprimento mais próximo de 687,5 m | mantém quantidade e ordem dos pontos (correspondência por índice); o grampo garante 0,30 m por construção com folga para o arredondamento a 0,001 m; escolher a intensidade pelo comprimento alvo atende a faixa de ± 1 % sem fixar uma janela que o dado não confirma. A janela de cerca de 12 m é a orientação; a intensidade escolhida fica em `prep.smoothingIterations` e o maior desvio em `prep.maxSmoothingOffsetM` |
| Origem das coordenadas | centro da caixa envolvente dos pontos da origem, arredondado a 0,001 m | a pista fica centrada na origem como a sintética, e a câmera de visão geral e a sombra servem sem caso especial; o deslocamento fica em `prep.originOffsetM` |
| Intervalo do som da zebra | 12 passos de `STEP` (100 ms de tempo simulado), constante | uma repetição por faixa vermelha e branca a cerca de 10 m/s em faixas de 1 m; mais curto que o pulso de vibração (250 ms) e inteiro em passos |
| Timbre do som da zebra | ruído branco de 60 ms, passa-baixa em 160 Hz, ataque de 5 ms e queda exponencial, ganho de pico 0,05 | "ruído curto e grave" (`DOMAIN/DEC-11`); fonte de ruído, enquanto o motor é onda triangular contínua e a recompensa são tons senoidais a partir de 659 Hz: sinal diferente de todo outro som do jogo |
| Aba do link do crédito | outra aba, com `rel="noopener noreferrer"` | o jogo não perde a sessão de treino; o link só aparece sem volta em andamento (tela inicial e resultado) |
| Aparência | asfalto `#434d48`; zebra em faixas de 1 m alternadas `#c8423b` e `#f0e9d5`; barreira de 0,2 m × 0,9 m `#e6dfc9` | as cores da pista sintética para o asfalto e a linha de largada; a faixa da zebra no lado declarado e a barreira em todo o comprimento, como o F-Spec exige |

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Largura da zebra fixa sem redução | nos trechos quase encostados (0,9 m de grama) uma zebra do lado voltado para o outro trecho poderia encostar nele ou na barreira |
| Média móvel de 12 m sem grampo | num grampo de raio cerca de 6 m, a média sobre 12 m desloca o ponto bem mais que 0,30 m (V07) |
| Janela fixa de 12 m com rejeição se a faixa de comprimento falhar | o resultado dependeria de um valor que o dado não confirma; a escolha pelo comprimento é determinística e registrada |
| Som com oscilador | ficaria parecido com o motor (oscilador contínuo) |

## Consequências

- Os valores vivem como constantes em `scripts/trackPrep.ts`, `src/curbFeedback.ts`, `src/audio.ts` e
  `src/trackScene.ts`; mudar um valor do preparo produz um arquivo novo com `trackVersion` maior.
- A largura de cada zebra e os parâmetros da suavização ficam registrados por versão publicada.

## Status

Proposta deste conjunto, a validar.
