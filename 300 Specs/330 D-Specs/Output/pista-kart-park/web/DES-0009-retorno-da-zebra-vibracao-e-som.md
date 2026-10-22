---
id: DES-0009
title: Retorno da zebra — vibração em web-mobile e som em web-desktop
feature: pista-kart-park
stage: dspec
status: validated
version: 1.1.0
sources: [RULE-0004, SCR-0003, FLOW-0002, FEAT-0005, REQ-FEAT-0005-10, REQ-FEAT-0005-11, REQ-FEAT-0005-12, REQ-FEAT-0005-13, REQ-FEAT-0005-14, REQ-FEAT-0005-15, REQ-FEAT-0005-16, REQ-FEAT-0005-17, REQ-FEAT-0005-18, REQ-FEAT-0005-19]
---

# DES-0009 — Retorno da zebra: vibração em `web-mobile` e som em `web-desktop`

## Realiza

RULE-0004: em `web-mobile`, com o navegador permitindo, um pulso de vibração de 20 ms em todo passo com
`curbWheelCount` maior que 0 em que nenhum pulso começou nos 250 ms de tempo simulado anteriores
(REQ-FEAT-0005-10), nunca com `curbWheelCount` 0 (REQ-FEAT-0005-11); em `web-desktop`, com o som ligado, o som
próprio da zebra repetido no intervalo constante de tempo simulado (REQ-FEAT-0005-12), nunca com
`curbWheelCount` 0 (REQ-FEAT-0005-13) nem com o som desligado (REQ-FEAT-0005-14); um som cujo sinal é
diferente de todo outro som do jogo e que só a zebra usa (REQ-FEAT-0005-15); nenhuma vibração em
`web-desktop` (REQ-FEAT-0005-16); o som também em `web-mobile`, com o som ligado, pelas mesmas regras
(REQ-FEAT-0005-17, permitido); nada começa com a simulação suspensa (REQ-FEAT-0005-18); sem vibração no
navegador, nada mais muda e nada é exibido (REQ-FEAT-0005-19).

## Posicionamento

Camada **aplicação**:

- `src/curbFeedback.ts`, **novo**, puro (sem DOM, sem relógio, sem sorteio): a decisão por passo. Motivo de
  ser novo: o registro dos pulsos e repetições pedidos por passo é a observação dos critérios da zebra e tem
  de ser verificado em `npm test`, onde `src/main.ts` não carrega.
- `src/audio.ts`, alterado: o som da zebra e os descritores de sinal dos três sons, dos quais cada som
  constrói o seu sinal.
- `src/main.ts`, alterado: lê `getTrackContact` a cada passo avançado, chama a decisão e executa o pedido.

O retorno nunca volta para a simulação (I2): a regra de pista e a aderência não dependem dele.

## Interface

`src/curbFeedback.ts`:

| Símbolo | Assinatura | Descrição |
|---|---|---|
| `CURB_PULSE_MS` | `20` | duração do pulso, ms (`DOMAIN/DEC-05`) |
| `CURB_PULSE_INTERVAL_STEPS` | `30` | intervalo mínimo entre inícios de pulso, passos de `STEP`: 30 × 25/3 ms = 250 ms exatos |
| `CURB_SOUND_REPEAT_STEPS` | `12` | intervalo de repetição do som, passos: 100 ms de tempo simulado ([ADR-0006](../adr/ADR-0006-lacunas-do-f-spec-resolvidas-no-projeto.md)) |
| `CurbFeedbackState` | `{lastHandledStep?: number; lastPulseStep?: number; lastSoundStep?: number}` (passos) | estado de [DM-0002](../data/DM-0002-registro-de-publicacao-e-estado-em-memoria.md) |
| `initialCurbFeedback()` | `() => CurbFeedbackState` | os três ausentes |
| `decideCurbFeedback(state, input)` | `(CurbFeedbackState, {simStepCount: number; curbWheelCount: number; channel: 'web-desktop' \| 'web-mobile'; vibrationAvailable: boolean; soundOn: boolean}) => {state: CurbFeedbackState; pulse: boolean; sound: boolean}` | a tabela de decisão de RULE-0004, abaixo |

Decisão, para um `simStepCount` maior que `lastHandledStep` (um passo já tratado devolve `pulse` e `sound`
falsos e o mesmo estado):

| Saída | Verdadeira quando |
|---|---|
| `pulse` | `channel` `web-mobile`, `vibrationAvailable`, `curbWheelCount > 0` e (`lastPulseStep` ausente ou `simStepCount − lastPulseStep >= 30`); então `lastPulseStep = simStepCount` |
| `sound` | `soundOn`, `curbWheelCount > 0` e (`lastSoundStep` ausente ou `simStepCount − lastSoundStep >= 12`); então `lastSoundStep = simStepCount`; vale nos dois canais (em `web-mobile` é o MAY de REQ-FEAT-0005-17) |

`lastHandledStep` passa a `simStepCount` em todo passo novo. Com `curbWheelCount` 0 nada começa; um pulso já
começado termina os seus 20 ms no aparelho.

`src/audio.ts`:

| Símbolo | Assinatura | Descrição |
|---|---|---|
| `SoundSignal` | `{source: 'noise' \| 'triangle' \| 'sine'; lowpassHz?: number; durationMs?: number; peakGain: number}` | descritor do sinal de um som; `source` é o tipo da fonte que o som cria: oscilador `triangle` ou `sine`, ou fonte de buffer de ruído (`noise`) |
| `ENGINE_SOUND` | `{source: 'triangle', peakGain: 0.045}` | o motor: `toggle()` cria o oscilador do motor com o tipo `ENGINE_SOUND.source` e `update()` nunca leva o ganho acima de `ENGINE_SOUND.peakGain`; são os valores de hoje (`:11`, `:26`: onda triangular, ganho de no máximo 0,045), e o motor soa como hoje |
| `REWARD_SOUND` | `{source: 'sine', durationMs: 180, peakGain: 0.035}` | a recompensa: `reward()` cria cada tom com o tipo `REWARD_SOUND.source`, pico `REWARD_SOUND.peakGain` e queda até `REWARD_SOUND.durationMs`; são os valores de hoje (`:32-39`: senoide, o tipo padrão do oscilador, pico 0,035, queda em 180 ms, tons a partir de 659 Hz), e a recompensa soa como hoje |
| `CURB_SOUND` | `{source: 'noise', lowpassHz: 160, durationMs: 60, peakGain: 0.05}` | ruído curto e grave (`DOMAIN/DEC-11`); declarado no nível do módulo e lido só por `curb()` |
| `RaceAudio.curb()` | `() => void` | toca uma repetição do som da zebra construída de `CURB_SOUND`: fonte de buffer com ruído branco de `durationMs`, gerado uma vez por um gerador congruencial de semente fixa, ligada a um filtro `lowpass` em `lowpassHz`, com envelope de ataque de 5 ms até `peakGain` e queda exponencial até `durationMs`; não cria nó algum sem contexto de áudio ou com `enabled` falso |
| `RaceAudio.soundOn()` | `() => boolean` | `enabled` verdadeiro e contexto de áudio em `running`: "som ligado" do F-Spec |

Cada som constrói o seu sinal a partir do próprio descritor: o tipo da fonte, o pico e a duração vêm dele, de
modo que o `source` de um descritor é o tipo da fonte que o som toca, e dois sons com o mesmo `source` teriam a
mesma forma de onda. Só `curb()` cria fonte de buffer e filtro; `toggle()`, `update()` e `reward()` criam só
osciladores e nunca leem `CURB_SOUND`.

`src/main.ts`, no laço de passos (`:382-390`), depois de cada `lap = stepLap(lap, input)`:
`contact = getTrackContact(lap.kart, lap.environment, lap.config)`; sem `NO_STATE`, `r =
decideCurbFeedback(curbState, {simStepCount, curbWheelCount, channel, vibrationAvailable, soundOn:
audio.soundOn()})`; `curbState = r.state`; se `r.pulse`, `navigator.vibrate(CURB_PULSE_MS)`; se `r.sound`,
`audio.curb()`. `channel` é `web-mobile` quando `matchMedia('(pointer: coarse)')` casa (o mesmo sinal que o
aviso de toque usa, `:166`) e `web-desktop` senão; `vibrationAvailable` é `typeof navigator.vibrate ===
'function'`. `curbState = initialCurbFeedback()` a cada `beginLap` e a cada `chooseTrack`.

## Colaboradores

`src/curbFeedback.ts` não importa nada além do tipo `TrackContact` de `src/physics.ts`. `src/main.ts` chama
`getTrackContact` (`src/physics.ts`), `decideCurbFeedback`, `navigator.vibrate` e `RaceAudio.curb`.

## Estado e concorrência

O estado guarda só o último passo tratado e os passos do último início de pulso e de repetição. Cada
`simStepCount` é tratado uma vez e em ordem crescente, mesmo quando vários passos avançam num quadro
(deduplicação por `simStepCount`, RULE-0004). Pausa, perda de foco e perda do sensor suspendem a volta
(`stepLap` devolve a mesma sessão), o `simStepCount` não avança e nenhum pulso ou repetição começa
(REQ-FEAT-0005-18). Volta nova e sessão nova recomeçam sem início registrado, porque o `simStepCount` do kart
recomeça em 0.

## Comportamento em falha

Navegador sem `navigator.vibrate` ou que o bloqueia (o retorno `false` de `vibrate` é ignorado): nenhum pulso,
nenhum aviso, nenhum erro, nada mais muda (REQ-FEAT-0005-19). Contexto de áudio ausente ou suspenso: nenhum
som da zebra. Nada é registrado.

## Determinismo (D-DS-07)

A decisão é função pura de `simStepCount` e `curbWheelCount`, que a simulação determina passo a passo; o
relógio de parede não entra. Provas em `tests/pista-kart-park-feedback.test.ts`: com a sequência
(`simStepCount`, `curbWheelCount`) gravada de uma volta do piloto de teste da Kart Park que passa por zebras,
o registro de pulsos (`web-mobile`, vibração disponível) tem inícios só em passos com `curbWheelCount > 0`,
dois inícios nunca a menos de 30 passos e exatamente a 30 passos enquanto as rodas ficam na zebra; o registro de
repetições (`web-desktop`, som ligado) tem o mesmo com 12 passos; com o som desligado, nenhuma repetição; em
`web-desktop`, nenhum pulso; sem vibração disponível, nenhum pulso e o mesmo registro de repetições; o mesmo
`simStepCount` relido não começa outro; uma pausa no meio da volta não acrescenta início no intervalo. O
sinal de cada som é observado com um `AudioContext` de substituição que o teste instala em `globalThis` e que
registra cada nó criado (oscilador com o seu `type`, fonte de buffer, filtro com `type` e `frequency`), sem
nenhuma mudança em `src/audio.ts` para o teste: `toggle()` e `update(...)` criam só um oscilador `triangle`;
`reward(0)` a `reward(2)` só osciladores `sine`; `curb()` só uma fonte de buffer ligada a um filtro `lowpass`
em 160 Hz; nenhum outro método cria fonte de buffer ou filtro; o tipo registrado de cada som é o `source` do
seu descritor, e os três tipos são diferentes entre si; `curb()` com `enabled` falso não cria nó. Nenhum outro
evento usa o som da zebra: `audio.curb(` aparece no texto de `src/main.ts` só no laço de passos, que não
carrega em `npm test`. A prova auditiva, de que o som da zebra é distinguível do motor e da recompensa, é
E2E-04.

## Feature flag

Nenhuma: o retorno só existe com roda na zebra, que só a Kart Park tem; o "som ligado" é o controle de áudio
que o jogo já tem (`#sound`), e esta feature não cria outro (FEAT-0005, Configuração).

## Pontos em aberto

Nenhum.
