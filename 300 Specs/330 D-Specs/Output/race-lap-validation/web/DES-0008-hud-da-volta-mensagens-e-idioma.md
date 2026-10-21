---
id: DES-0008
title: HUD da volta, mensagens, idioma e legibilidade
feature: race-lap-validation
stage: dspec
status: validated
version: 1.0.0
sources: [FEAT-0001, FEAT-0002, FEAT-0004, FEAT-0005, FEAT-0006, FEAT-0007, REQ-FEAT-0001-02, REQ-FEAT-0001-03, REQ-FEAT-0001-04, REQ-FEAT-0001-09, REQ-FEAT-0001-10, REQ-FEAT-0002-06, REQ-FEAT-0002-09, REQ-FEAT-0004-04, REQ-FEAT-0004-08, REQ-FEAT-0005-05, REQ-FEAT-0005-08, REQ-FEAT-0006-02, REQ-FEAT-0006-05, REQ-FEAT-0007-01, REQ-FEAT-0007-02, REQ-FEAT-0007-03, REQ-FEAT-0007-04, REQ-FEAT-0007-05, REQ-FEAT-0007-06, REQ-FEAT-0007-07, REQ-FEAT-0007-08, REQ-FEAT-0007-09, REQ-FEAT-0007-10, REQ-FEAT-0007-11, REQ-FEAT-0007-12, REQ-FEAT-0007-13, REQ-FEAT-0007-14]
---

# DES-0008 — HUD da volta, mensagens, idioma e legibilidade

## Realiza

Os `REQ-*` em `sources`: contagem 3, 2, 1 e sinal verde em texto, com 48 px no mínimo e contraste de 4,5:1
(AC-US-0001-02, -03, -09, -10); cronômetro em zero na contagem (AC-US-0001-04); estado "válida em andamento" ou
"inválida" com o motivo em todos os quadros do sinal verde ao fim, em texto além de cor, em português e em inglês
conforme o idioma do navegador, com 4,5:1 e 16 px no mínimo em `web-mobile` (AC-US-0009-01 a -09; NFR-0006,
NFR-0007); tempo de cada setor ao completá-lo (AC-US-0002-09); formato `m:ss.mmm` (AC-US-0002-06); volta pausada
indicada em texto. Tela: SCR-0001. Textos: RULE-0006.

## Posicionamento

- `src/lapMessages.ts`, camada **aplicação**, novo, puro (sem DOM, importável por `npm test`). Motivo de ser novo:
  `src/main.ts` não carrega em `npm test`, e os textos, o idioma e o formato precisam de prova automática.
- `index.html` e `src/style.css`, camada **aplicação**, alterados: elementos e estilos do HUD.
- A apresentação só exibe: validade, motivo e tempo vêm de `getLapState` e `getLapResult`; nada é decidido aqui (I2).

## Interface

`src/lapMessages.ts`:

| Símbolo | Assinatura | Descrição |
|---|---|---|
| `resolveLanguage(tag)` | `(texto \| null \| undefined) => 'pt' \| 'en'` | idioma primário da etiqueta, sem a variante regional: `pt` ou `pt-BR` dá `pt`; `en` ou `en-GB` dá `en`; qualquer outro, ausente ou vazio dá `en` (`DEC-09`) |
| `message(key, lang)` | `(MessageKey, 'pt' \| 'en') => texto` | texto da tabela abaixo; total sobre as chaves |
| `formatLapTime(ms)` | `(inteiro >= 0) => texto` | `m:ss.mmm`, minutos sem zeros à esquerda, segundos com 2 dígitos, milissegundos com 3 dígitos, sem arredondar: 62345 dá `1:02.345`, 0 dá `0:00.000`, 3723004 dá `62:03.004`. Entrada negativa ou fracionária é limitada com `Math.max(0, Math.trunc(ms))` (I4) |
| `describeLap(view, lang)` | `(LapStateView, lang) => {stateText, reasonText?, pausedText?, countdownText?}` | `stateText` é `lapStateValidInProgress` com `lapValidity` `VALID` e `lapStateInvalid` com `INVALID`; `reasonText` só com `INVALID`; `pausedText` só com `lapPhase` `PAUSED`; `countdownText` só em `COUNTDOWN`, o numeral `Math.ceil(countdownRemainingMs / 1000)` |
| `greenSignalVisible(view)` | `(LapStateView) => booleano` | verdadeiro com `lapPhase` `RUNNING` e `stepCount` menor que 120 (1 s de simulação); a duração é função de passos, não de relógio, e congela na pausa |

Chaves e textos (RULE-0006, mais as chaves de apoio acrescentadas por este projeto, marcadas com asterisco; o F-Spec
as deixou como redação do D-Spec):

| Chave | Português | Inglês |
|---|---|---|
| `lapStateValidInProgress` | válida em andamento | valid, in progress |
| `lapStateInvalid` | inválida | invalid |
| `reasonMissedMarker` | marcador pulado | missed marker |
| `reasonCut` | corte | cut |
| `reasonReposition` | reposicionamento | repositioning |
| `lapUnofficial` | não oficial | unofficial |
| `countdownGreenSignal` | VERDE | GREEN |
| `lapResultValid` | válida | valid |
| `lapPaused` | volta pausada | lap paused |
| `loadingTrack` | carregando a pista | loading track |
| `noTrackAvailable` | nenhuma pista disponível | no track available |
| `trackDataError` | dado da pista indisponível | track data unavailable |
| `controlFallbackTouch` | controle por toque (sensor de inclinação indisponível) | touch control (tilt sensor unavailable) |
| `sectorLabel`* | setor | sector |
| `totalLabel`* | tempo total | total time |
| `startTraining`* | volta de treino | training lap |
| `startOfficial`* | volta oficial | official lap |
| `startRecon`* | volta de reconhecimento | recon lap |
| `resumeLap`* | continuar | resume |
| `newLap`* | nova volta | new lap |

Os rótulos e textos já existentes da página (cabeçalho, painel de acerto, dicas de tecla) permanecem como estão;
a exigência de dois idiomas vale para os estados, os motivos e os textos novos desta feature.

**Elementos** (índice de SCR-0001), todos em `index.html` dentro de `.game-shell`:

| Elemento | Conteúdo |
|---|---|
| `#lap-countdown` | numeral da contagem (3, 2, 1) ou `countdownGreenSignal`; centralizado; oculto fora da contagem e do sinal verde |
| `#lap-state` | `stateText` e, se houver, `reasonText`, em `role="status"`; atualizado só quando o texto muda |
| `#lap-paused` | `pausedText` quando a fase é `PAUSED` |
| `#lap-sectors` | lista dos setores completados, `sectorLabel` n e `formatLapTime(completedSectorMs[n-1])` |
| `#lap-control-fallback` | `controlFallbackTouch` em `web-mobile` sem inclinação ativa |
| `#timer` (existente) | `formatLapTime(elapsedMs)`; `0:00.000` até o sinal verde |

**Idioma.** A cada quadro a aplicação lê `navigator.language` (uma leitura, sem custo) e chama `resolveLanguage`,
de modo que uma mudança de idioma durante a volta é seguida sem alterar a validade (REQ-FEAT-0007-13). O idioma
não é gravado nem enviado (NFR-0005).

**Legibilidade.** Cada texto de estado, motivo, contagem e setor fica dentro de um bloco com fundo **opaco**
próprio, para que o "fundo imediato" seja determinado e não dependa da cena 3D. Fichas de cores em
`src/style.css`, no `:root`:

| Propriedade | Valor | Uso | Contraste |
|---|---|---|---|
| `--lap-text` | `#ffffff` | texto sobre as fichas | — |
| `--lap-chip-bg` | `#13241e` | ficha de estado válido, contagem, setores, pausa | 16,2:1 com `--lap-text` |
| `--lap-chip-invalid-bg` | `#7a1f12` | ficha de estado inválido | 10,3:1 com `--lap-text` |
| `--lap-countdown-size` | `48px` | tamanho mínimo do numeral e do sinal verde | — |
| `--lap-state-size` | `16px` | tamanho mínimo do texto de estado e de motivo, aplicado em `web-desktop` e `web-mobile` | — |

O tamanho do numeral é `font-size: max(var(--lap-countdown-size), 6vw)`, e o do estado `max(var(--lap-state-size), 1rem)`.
Aplicar 16 px também em `web-desktop` cumpre o mínimo de `web-mobile` e não contraria a decisão do dono do produto,
que não fixa mínimo naquele canal. As fichas ficam na área central e no canto superior, sem cobrir o cronômetro.
A cor distingue válida de inválida **além** do texto, nunca no lugar dele (NFR-0006).

## Colaboradores

Chama `LapStateView` e `LapResult` (tipos de `src/lap.ts`, só como tipos) e nada mais. É chamado por `src/main.ts`
e pelos testes. `src/lapMessages.ts` importa apenas tipos de `src/lap.ts` (camada interna): o sentido é permitido.

## Estado e concorrência

Sem estado próprio: a mensagem é função de `lapValidity`, `invalidReason`, `official` e do idioma corrente. Exibir
a mesma mensagem duas vezes é sem efeito. A mensagem não altera o estado da volta. Ao continuar depois de uma
pausa, o estado exibido é o do instante da pausa, porque nenhum campo de validade mudou (REQ-FEAT-0007-12).

## Comportamento em falha

Chave desconhecida: `message` é total sobre `MessageKey` (o compilador garante); idioma ausente cai em inglês.
`getLapState` devolvendo `NO_ACTIVE_LAP` esconde `#lap-state`, `#lap-sectors` e `#lap-countdown` (estado Vazio).
Registro: nenhum.

## Determinismo (D-DS-07)

Não é código de simulação; mesmo assim é puro e determinístico: a mesma `view` e o mesmo idioma dão o mesmo texto.
Provas: `tests/lap-messages.test.ts` (`resolveLanguage` para `pt`, `pt-BR`, `en`, `en-US`, `fr`, `es-419`, `de`,
vazio e `undefined`; `formatLapTime` nos exemplos de RULE-0003, incluindo 59999 e 3723004; as 20 chaves existem
nos dois idiomas e nenhuma está vazia; `describeLap` para cada combinação de validade e motivo) e
`tests/lap-hud-css.test.ts` (lê `src/style.css`, extrai as propriedades `--lap-*` e afirma contraste maior ou igual a
4,5 para os pares da tabela, 48 px para o numeral e 16 px para o estado).

## Feature flag

Nenhuma: FEAT-0001 e FEAT-0007 não têm chave; o HUD vale ligado.

## Pontos em aberto

Nenhum.
