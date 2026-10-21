---
id: DES-0004
title: Corte e grama
feature: race-lap-validation
stage: dspec
status: validated
version: 1.0.0
sources: [FEAT-0005, FEAT-0008, REQ-FEAT-0005-01, REQ-FEAT-0005-02, REQ-FEAT-0005-03, REQ-FEAT-0005-04, REQ-FEAT-0005-06, REQ-FEAT-0005-07, REQ-FEAT-0005-09, REQ-FEAT-0005-10, REQ-FEAT-0005-11, REQ-FEAT-0008-04]
---

# DES-0004 — Corte e grama

## Realiza

Os `REQ-*` em `sources`: corte quando o kart fica a mais de 3 m além da borda por mais de 1000 ms seguidos, ou
pelos limites que a pista declara (AC-US-0006-01 a -04); motivo "corte" e fim no passo da invalidação
(AC-US-0006-05, -06); grama sem corte só reduz a velocidade (AC-US-0006-07, -08); contagem recomeçando a cada
nova saída; tempo de pausa fora da conta. Regra de decisão: RULE-0004.

## Posicionamento

Função interna `evaluateCut` em `src/lap.ts`, camada **simulação** (estende DES-0001; não há módulo novo). A
física da grama é a existente: `CIRCUIT.surfaceAt` classifica como grama todo ponto a mais de `WIDTH / 2` da
linha central, e o atrito e a resistência de rolagem de `src/physics.ts` já reduzem a velocidade (REQ-FEAT-0005-07).
Esta feature não altera a física (NFR-0011).

## Interface

- `edgeDistanceM(point)`: `Math.max(0, nearest(point).distance - WIDTH / 2)` em metros, usando `nearest` e
  `WIDTH` de `src/track.ts` e a posição do centro do kart.
- `resolveCutLimits(track)`: `{distanceM, durationMs}` com `distanceM` = `cutDistanceM` da pista se declarado e
  válido, senão 3, e `durationMs` = `cutDurationMs` se declarado e válido, senão 1000. Cada limite ausente usa o
  seu padrão, de modo independente (REQ-FEAT-0008-04). `DEFAULT_CUT_DISTANCE_M` e `DEFAULT_CUT_DURATION_MS` são
  constantes de `src/trackData.ts`.
- `evaluateCut(session, kartAfterStep)`, executado depois dos cruzamentos de linha, num passo `RUNNING` em que a
  volta continua em andamento:

| Condição no passo | Efeito |
|---|---|
| `edgeDistanceM` menor ou igual a `distanceM` (inclui sobre a pista) | `offTrackSteps` = 0; nenhum efeito sobre a validade; só a redução de velocidade da grama |
| `edgeDistanceM` maior que `distanceM` e `isCutExceeded(offTrackSteps + 1, durationMs)` falso | `offTrackSteps` + 1 |
| `edgeDistanceM` maior que `distanceM` e `isCutExceeded(offTrackSteps + 1, durationMs)` verdadeiro | corte: `validity` `INVALID`, `invalidReason` `CUT`, fase `ENDED` neste passo, resultado sem tempo; o passo da invalidação conta no `stepCount`, nenhum tempo de volta nem de setor é acrescentado depois dele |

"Maior" é estrito: 3 m exatos não é corte, e 1000 ms exatos (120 passos) não é corte; com 121 passos,
`25 * 121 = 3025 > 3000`, o corte ocorre no 121º passo seguido (REQ-FEAT-0005-01). A comparação é inteira e
exata ([DES-0002](DES-0002-tempo-da-volta-e-interpolacao.md)), sem arredondar milissegundos.

Aplica-se a todos os tipos de volta e a dado `COMPLETE` ou `INCOMPLETE` (RULE-0001, Tabela 2). Um corte que
ocorre antes de uma chegada sem marcadores mantém o motivo `CUT`, porque a volta já terminou (REQ-FEAT-0005-11).

## Colaboradores

Chama `nearest` e `WIDTH` (`src/track.ts`) e `isCutExceeded` (`src/lapTiming.ts`). Chamado por `stepLap`.

## Estado e concorrência

Lê e altera `offTrackSteps`, `validity`, `invalidReason`, `phase`, `result`.

- `offTrackSteps` avança apenas por passo de simulação em `RUNNING`; não avança em `PAUSED`, então o tempo de
  pausa, de perda de foco ou de perda do sensor não conta para os limites (REQ-FEAT-0005-10) e a contagem de
  uma saída em curso é retomada do mesmo valor ao continuar.
- Idempotência: o corte ocorre uma única vez, pois a fase passa a `ENDED` e novos passos de saída de pista são
  ignorados. Reaplicar o mesmo passo não existe; o estado só avança passo a passo.
- Contador de sequência: `stepCount` do passo da invalidação.
- Uma saída seguida de retorno a `distanceM` ou menos zera o acumulador; uma nova saída recomeça a contagem
  (REQ-FEAT-0005-09).
- No reposicionamento em volta de reconhecimento ou treino, `offTrackSteps` volta a 0 porque o kart é recolocado
  na linha central (DES-0005).

## Comportamento em falha

Sem dependência. Limites de corte declarados fora de forma tornam o dado `INCOMPLETE`
([DES-0006](DES-0006-leitura-do-dado-de-pista.md)) e valem os padrões na sessão. Nenhum registro de log.

## Determinismo (D-DS-07)

Passo fixo; comparação inteira; a distância vem de `nearest`, determinística e sem relógio. Provas em
`tests/lap-cut.test.ts`: o teste dirige o kart (entrada fixa que o leva para fora da pista, em `CIRCUIT`) e, em
paralelo, recalcula com um oráculo independente (um laço de `step` e `nearest` do próprio teste) o primeiro passo
em que o kart está a mais de 3 m da borda por mais de 120 passos seguidos; afirma que a volta fica `INVALID`
`CUT` exatamente nesse passo, que 120 passos exatos e distância de 3 m exatos não invalidam, que uma saída de
120 passos seguida de retorno não invalida, que uma pista com `cutDistanceM` 1 e `cutDurationMs` 300 invalida
pelos limites da pista, e que pausar no meio da saída e continuar dá o mesmo passo de corte. A redução da
grama é provada pelos testes existentes de física (`grass slows the kart more than asphalt`) e por um novo teste
que compara N passos em grama e em asfalto com a mesma entrada.

## Feature flag

Nenhuma: FEAT-0005 não tem chave; os limites são dado da pista com padrão neutro (`DEC-01`: valem 3 m e 1000 ms
quando a pista não declara).

## Pontos em aberto

Nenhum.
