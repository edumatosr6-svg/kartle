---
id: DES-0007
title: Integração da aplicação, adaptadores de pausa e laço de quadros
feature: race-lap-validation
stage: dspec
status: validated
version: 1.0.0
sources: [FEAT-0001, FEAT-0003, FEAT-0007, FEAT-0009, REQ-FEAT-0001-12, REQ-FEAT-0001-13, REQ-FEAT-0003-03, REQ-FEAT-0003-04, REQ-FEAT-0003-05, REQ-FEAT-0003-06, REQ-FEAT-0003-07, REQ-FEAT-0003-12, REQ-FEAT-0007-12, REQ-FEAT-0009-05, REQ-FEAT-0009-06]
---

# DES-0007 — Integração da aplicação, adaptadores de pausa e laço de quadros

## Realiza

Os `REQ-*` em `sources`: pausa por Esc, perda de foco e perda do sensor, sem ação do Jogador nos dois últimos
(AC-US-0003-05 a -07); o cronômetro exibido para e volta com o mesmo valor; a contagem suspensa na pausa; o
controle por toque com estado visível quando o sensor falta (REQ-FEAT-0001-13); tempo independente da taxa de
quadros (AC-US-0003-03, -04); 60 fps e 30 fps com a validação ativa (NFR-0003); e a retirada da validação
preliminar por portões. Nenhuma regra de volta é decidida aqui (I2, REQ-FEAT-0009-01).

## Posicionamento

- `src/main.ts`, camada **aplicação**, alterado. Os **adaptadores de controle** continuam dentro de `src/main.ts`,
  como hoje (mapa de camadas); cada um só converte um evento em um comando ou em `Input` normalizado. Dividir
  `src/main.ts` não faz parte desta feature.
- `src/frameClock.ts`, camada **aplicação**, novo. Motivo: a conversão de tempo de quadro em passos hoje é um laço
  interno de `main.ts`, que importa Three.js e o DOM e não carrega em `npm test`; extraí-la como função pura permite
  provar a independência de taxa de quadros.

## Interface

`src/frameClock.ts`:

| Símbolo | Assinatura | Descrição |
|---|---|---|
| `MAX_FRAME_S` | `0.1` | teto do tempo de quadro, como o laço atual (`Math.min(..., 0.1)`) |
| `advanceClock(accumulatorS, frameDtS)` | `(número >= 0, número >= 0) => {steps: inteiro, accumulatorS: número}` | soma `min(frameDtS, MAX_FRAME_S)` ao acumulador e subtrai `STEP` enquanto o acumulador for maior ou igual a `STEP`, contando os passos, com a mesma aritmética do laço atual |

O tempo de parede só decide **quantos** passos rodam num quadro; o resultado da volta depende apenas da sequência
de passos e de `Input` (DES-0002). A queda de quadros reduz a velocidade percebida do jogo, nunca altera o tempo
oficial.

`src/main.ts`, por trecho do código atual:

| Trecho atual | Mudança |
|---|---|
| import (linha 2) | passa a importar `startLap`, `pauseLap`, `resumeLap`, `repositionKart`, `stepLap`, `getLapState`, `getLapResult`, `offeredLapKinds` de `./lap`; `readTrackData` e `SYNTHETIC_TRACK_FILE` de `./trackData` e `./track`; `advanceClock` de `./frameClock`; `LapTracker` sai do import |
| estado (linhas 146 a 152) | `state` e `laps` saem; entram `lap: LapSession \| undefined`, `reading: TrackReading` (lido uma vez, com `readTrackData(SYNTHETIC_TRACK_FILE)`) e `accumulatorS`. Antes de qualquer volta o kart exibido é `initialState()` na largada |
| `reset` (linhas 156 a 161) e botão `#reset` (linha 193), tecla `R` (linha 207) | passam a emitir `repositionKart(lap)` e a ignorar a rejeição. O antigo "reiniciar tudo" deixa de existir; recomeçar é uma nova volta |
| `$('start').onclick` (linha 185) | passa a apresentar a oferta de volta ([DES-0009](DES-0009-inicio-de-volta-e-erros.md)) e, ao escolher um tipo, a chamar `startLap(lap, request, reading, config)` e limpar `accumulatorS`, `keys` e `touch` |
| seletor de estilo e peso (linhas 162 a 184) | os controles ficam desabilitados enquanto houver volta em `COUNTDOWN`, `RUNNING` ou `PAUSED`; a mudança vale para a volta seguinte, pois `config` é fixada no `startLap` (INV-4). O texto existente "reinicia o treino" passa a "vale na próxima volta" |
| `pause()` (linhas 194 a 202) e botão `#pause` | `pause()` sai. O botão `#pause` fica visível e ativo apenas com a fase `PAUSED`, com o rótulo "Continuar", e chama `resumeLap(lap)`; fora da pausa fica oculto. Pausar manualmente é a tecla Esc em `web-desktop`; em `web-mobile` não há pausa manual por toque, porque os requisitos não a exigem e API-0002 não tem causa de pausa para ela ([ADR-0005](../adr/ADR-0005-pausa-retomada-e-perda-do-sensor.md)). Ao pausar, a aplicação limpa `keys` e `touch` e zera `accumulatorS`; ao continuar, zera `accumulatorS` para não liberar passos acumulados |
| `keydown` Esc (linha 208) | Esc em `COUNTDOWN` ou `RUNNING` emite `pauseLap(lap, 'ESC_KEY')`; em `PAUSED` emite `resumeLap(lap)` ([ADR-0005](../adr/ADR-0005-pausa-retomada-e-perda-do-sensor.md)) |
| `blur` e `visibilitychange` (linhas 211 e 212) | emitem `pauseLap(lap, 'FOCUS_LOST')`; o retorno do foco **não** retoma a volta (RULE-0002) |
| inclinação (linhas 218 a 237) | a lógica de calibração não muda; acrescenta-se `lastOrientationAtMs` (relógio de parede, só do adaptador) atualizado a cada `deviceorientation` com leitura válida, e a vigilância descrita abaixo |
| laço de quadros (linhas 255 a 283) | `dt` é lido como hoje; se a fase for `COUNTDOWN` ou `RUNNING`, `advanceClock` dá o número de passos e cada passo chama `lap = stepLap(lap, input)`, interrompendo o laço quando a fase vira `ENDED`. O `Input` é amostrado uma vez por quadro, como hoje. As linhas 276 a 281 (decisão de volta, `best`, `state.elapsed = 0`) são removidas; a regra vive em `src/lap.ts` |
| renderização do kart, câmera, áudio e minimapa (linhas 284 a 329) | leem `lap.kart` (ou `initialState()` sem volta); `audio.update` recebe `fase === 'RUNNING'` no lugar de `running` |
| `$('timer')` (linha 330) | exibe `formatLapTime(view.elapsedMs)` ([DES-0008](DES-0008-hud-da-volta-mensagens-e-idioma.md)), e não `format(state.elapsed)` |
| `best` (linha 149, 277) | passa a ser derivado de `getLapResult(lap).lapMs` quando `lapValidity` é `VALID`, apenas na memória da página; nada é gravado (REQ-FEAT-0009-11) |

**Vigilância do sensor (web-mobile).** Com `tilt` ativo e a fase `COUNTDOWN` ou `RUNNING`, se
`performance.now() - lastOrientationAtMs` passar de `SENSOR_SILENCE_MS` = 500, o adaptador emite
`pauseLap(lap, 'SENSOR_LOST')` uma vez (um segundo evento recebe `ALREADY_PAUSED`). Ao continuar, `lastOrientationAtMs`
recebe o instante atual, dando 500 ms de tolerância. O relógio de parede é usado só para decidir **quando** emitir o
comando; nunca altera o tempo da volta. Esta é a única leitura de relógio, e fica no adaptador da camada de aplicação
(permitido pelo mapa de camadas).

**Sensor ausente ou permissão negada antes da volta.** Em `web-mobile` (canal reconhecido por
`matchMedia('(pointer: coarse)')` no início da volta, como o CSS já faz), se `tilt` não está ativo, a aplicação
usa o controle por toque e exibe o texto `controlFallbackTouch` durante toda a volta ([DES-0008](DES-0008-hud-da-volta-mensagens-e-idioma.md));
a duração da contagem e as regras não mudam. Em `web-desktop` o estado não se aplica.

## Colaboradores

Chama `src/lap.ts`, `src/trackData.ts`, `src/track.ts`, `src/frameClock.ts`, `src/lapMessages.ts`, `src/audio.ts`
(existente). É o único chamador de comandos de volta. Não é chamado por nenhum outro módulo.

## Estado e concorrência

- Estado local: `lap`, `reading`, `accumulatorS`, `keys`, `touch`, `tilt`, `lastOrientationAtMs`. A volta é a
  fonte única; a aplicação não copia validade nem tempo.
- Eventos de pausa chegam de três origens independentes (Esc, `blur`/`visibilitychange`, vigilância) e podem
  coincidir: a deduplicação é da simulação (`ALREADY_PAUSED`), não do adaptador. Pausa e `blur` ao mesmo tempo viram
  uma pausa.
- Recarregar ou abandonar a página descarta `lap`: nenhum resultado e nada gravado.
- Mudar `config` entre voltas não afeta voltas já iniciadas (cópia congelada na sessão).

## Comportamento em falha

- `readTrackData` devolvendo `UNREADABLE` ou `UNSUPPORTED_SCHEMA`: não se cria volta, a oferta fica vazia e o erro
  é exibido ([DES-0009](DES-0009-inicio-de-volta-e-erros.md)).
- WebGL ausente: o tratamento existente (linhas 14 a 19) é mantido.
- Rede: nenhuma chamada; a ausência de rede não tem efeito observável.
- Aba oculta: `requestAnimationFrame` é suspenso pelo navegador e a volta já foi pausada por `FOCUS_LOST`.
- Registro: apenas os avisos de DES-0006, com identificadores; nada de conteúdo de jogador.

## Observabilidade das metas de desempenho

NFR-0003 (60 fps em notebook, 30 fps em celular) é medido no aparelho nomeado com as ferramentas de desempenho do
navegador, em teste registrado em `docs/lap-validation-device-log.md` (aparelho, navegador, versão, fps médio e
mínimo numa volta completa). Não se acrescenta instrumento ao jogo para isso: seria superfície só de teste. A
validação de volta custa uma chamada a `nearest` (240 segmentos) por passo, já usada pela física por roda; o orçamento
a conferir no teste registrado é de no máximo 12 passos por quadro (teto de 0,1 s).

## Determinismo (D-DS-07)

A aplicação não está na simulação; ainda assim a independência de taxa de quadros é provada:
`tests/frame-clock.test.ts` aplica `advanceClock` com quadros de 1/30 s e de 1/60 s à mesma duração, conferindo a
contagem de passos; `tests/lap-determinism.test.ts` executa a mesma sequência de `Input` por passo agrupada em
quadros de 2 e de 4 passos e compara os resultados com `deepEqual`.

## Feature flag

Nenhuma: nenhum requisito pede chave; a aposentadoria da validação preliminar acontece na mesma mudança que
introduz a nova, de modo que não há duas validações ativas. A reversão é a do repositório (DM-0001).

## Pontos em aberto

Nenhum.
