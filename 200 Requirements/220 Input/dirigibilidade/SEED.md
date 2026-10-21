---
name: dirigibilidade
description: Sensação de pilotagem do acerto Arcade assistido — resposta do volante, aderência em curva, aceleração e sensação de velocidade — com referência em Karting Superstars. Ler antes de qualquer mudança nos presets de kart, nas assistências de direção ou no bench de volta.
revision: 2
date: 2026-10-21
author: eduardo.matos
channels: [web-desktop, web-mobile]
---

## Visão geral

O acerto padrão **Arcade assistido** deve ser divertido de pilotar nos primeiros segundos: o kart vira
quando o jogador manda, segura a curva em vez de sair de frente, acelera com vontade e transmite
velocidade e risco. A referência de sensação é **Karting Superstars**: direção direta e rápida, muita
aderência em alta, traseira viva mas que se segura. O jogo não deixa de ser um jogo de tempo justo:
nada aqui muda o passo da simulação, a validação de volta nem o determinismo.

## Contexto

Hoje o Arcade usa a mesma massa e o mesmo modelo de pneu do kart de aluguel, com assistências
(direção proporcional à velocidade, frenagem equilibrada, amortecimento de derrapagem) e um motor
acima da especificação do aluguel. Os ensaios atuais estão em `docs/physics.md` (0–40 km/h em 3,21 s;
54,3 km/h após 5 s; velocidade estabilizada 79,4 km/h; volta do piloto de teste em ~31,4 s na pista
sintética). O dono do produto testou a build publicada e relatou subesterço, resposta lenta e pouca
sensação de velocidade. O acerto **Realista — aluguel 4T** continua existindo e não muda.

## Atores e canais

| Ator | Canal | O que faz |
|---|---|---|
| Jogador | `web-desktop` | pilota com teclado (entradas binárias: esterço cheio ou zero) |
| Jogador | `web-mobile` | pilota com inclinação (esterço proporcional) e toque |
| Piloto de teste | — (`npm run bench:handling`) | volta determinística com comandos binários; é a régua de regressão |

## Histórias de usuário

- **US-1** Como Jogador, quero que o kart responda ao volante de imediato, para apontar para a curva
  sem antecipar.
  - Em reta a 50 km/h, ao aplicar esterço cheio, a taxa de guinada atinge 90 % do seu regime em no
    máximo `OPEN-01` ms de tempo simulado.
  - Ao soltar o esterço, a guinada cai a 10 % do regime em no máximo `OPEN-01` ms.
  - O comportamento vale para entrada binária (teclado) e proporcional (inclinação).
- **US-2** Como Jogador, quero que o kart faça a curva que eu pedi, para não sair de frente.
  - Em curva de raio 18 m (o menor raio da pista sintética) a `OPEN-02` km/h com esterço cheio, a
    telemetria não reporta `understeer` por mais de `OPEN-03` ms consecutivos.
  - Acima dessa velocidade, o kart perde a frente de forma progressiva: a velocidade em que o
    subesterço começa é pelo menos 15 % maior que a de hoje no mesmo ensaio.
- **US-3** Como Jogador, quero uma traseira viva mas controlável, para escorregar e segurar.
  - Em curva com acelerador cheio, o kart entra em `oversteer`/`sliding` só quando o jogador força
    (acelerador + esterço cheio acima de `OPEN-02` km/h), nunca em curva normal.
  - Ao reduzir o esterço com a traseira solta, o kart volta a `grip` em no máximo `OPEN-04` ms, sem
    rodar (derrapagem lateral nunca passa de 0,65 rad em condução normal).
  - A manobra de drift de `requirements/11` continua possível e continua pontuando.
- **US-4** Como Jogador, quero sentir velocidade e risco, para a volta ter tensão.
  - 0–60 km/h em no máximo `OPEN-05` s; velocidade estabilizada em reta de pelo menos `OPEN-06` km/h.
  - Sair para a grama reduz a velocidade de forma perceptível (pelo menos 30 % em 1 s), e a parede
    custa tempo.
  - O HUD comunica a velocidade e o estado de aderência durante toda a volta (já existe; não regride).
- **US-5** Como Jogador, quero que o jogo continue justo depois do novo acerto.
  - A mesma sequência de entradas dá o mesmo tempo e os mesmos setores em duas execuções.
  - O piloto de teste completa a volta sintética sem sair do asfalto, em tempo menor que o atual
    (`OPEN-07` s como alvo).
  - Nenhum replay, tempo ou resultado anterior é tratado como comparável: a mudança de acerto é
    uma nova `trackVersion`/versão de acerto, declarada no dado publicado (I3).

## Regras de domínio

| Regra | Fonte |
|---|---|
| Direção comum permanece fácil sem exigir drift | `requirements/11` |
| Realista permanece sem assistências arcade e não muda | `requirements/10`, README |
| Passo fixo `STEP`, solver e significado de `Input` não mudam | I8 |
| Mudar acerto que altera tempos é mudança versionada | I3 |
| Sensação alvo: Karting Superstars (direção direta, aderência alta em velocidade, traseira viva controlável) | decisão do dono do produto, 2026-10-21 |

## Requisitos não funcionais

| Requisito | Limite |
|---|---|
| Determinismo preservado | tempos idênticos em 100 % das execuções repetidas (RNF07) |
| Custo por passo da simulação | não aumenta mais de 10 % no bench (RNF03) |
| Teclado e inclinação | ambos atendem US-1 a US-4 |
| Documentação dos ensaios | cada mudança registra parâmetros e resultados em `docs/physics.md` (I9) |

## Restrições

- Mudanças ficam nos presets e nas assistências de `src/physics.ts`; nada de regra de pilotagem em
  renderização ou controle (I2). Motivo: a simulação roda sem DOM e no servidor futuro.
- `STEP`, solver de 480 Hz e `Input` não mudam (I8). Motivo: contrato de todos os replays.
- O preset Realista não muda. Motivo: é a referência física documentada.
- A validação de volta (`src/lap.ts`, `src/track.ts`) não muda. Motivo: feature própria já validada.

## Impacto no domínio

- **I2** — toda a mudança na camada de simulação.
- **I3 / I5** — novo acerto declarado como versão; tempos antigos não comparáveis.
- **I8** — contrato de passo preservado; só os parâmetros mudam.
- **I9** — cada critério tem ensaio determinístico em `npm test` ou nos benches.

## Riscos e incógnitas

- **OPEN-01** Tempo de resposta do volante (fechado em `DOMAIN.md`: 180 ms para 90 %; 250 ms para cair a 10 %).
- **OPEN-02** Velocidade de curva de referência no raio de 18 m (fechado em `DOMAIN.md`: 50 km/h).
- **OPEN-03** Tolerância de `understeer` consecutivo (fechado em `DOMAIN.md`: 200 ms).
- **OPEN-04** Tempo para recuperar `grip` ao soltar o esterço (fechado em `DOMAIN.md`: 400 ms).
- **OPEN-05** 0–60 km/h (fechado em `DOMAIN.md`: 2,5 s; hoje ~6 s extrapolado).
- **OPEN-06** Velocidade estabilizada (fechado em `DOMAIN.md`: 105 km/h; hoje 79,4).
- **OPEN-07** Tempo-alvo do piloto de teste na volta sintética (fechado em `DOMAIN.md`: ≤ 25 s; hoje ~31,4).
- **OPEN-08** A sensação é subjetiva: critérios numéricos são necessários, não suficientes. Prevista uma
  rodada de teste do dono do produto antes de fechar a feature.

## Fora do escopo

- Novas pistas, novas manobras ou mudança nas regras do drift (`requirements/11`).
- Mudanças no preset Realista.
- Som de motor, vibração, câmera (RF13, RF11).
- Volante remoto e desafio diário.
