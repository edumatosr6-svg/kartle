---
id: RULE-0006
title: Mensagens de estado e motivo, idioma e legibilidade
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: [US-0009, NFR-0006, NFR-0007, AC-US-0009-02, AC-US-0009-03, AC-US-0009-04, AC-US-0009-05, AC-US-0009-06, AC-US-0009-07, AC-US-0009-08, AC-US-0009-09]
---

# RULE-0006 — Mensagens de estado e motivo, idioma e legibilidade

Fontes: `DOMAIN/DEC-09` (idioma), `DOMAIN/DEC-11` (legibilidade), RNF11. Os textos de estado e de motivo em português são os dos
requisitos; os demais textos e os textos em inglês são a redação que o NFR-0007 e a legibilidade exigem e não acrescentam regra.

## Mensagens

| Chave | Português | Inglês | Quando | Fonte |
|---|---|---|---|---|
| `lapStateValidInProgress` | válida em andamento | valid, in progress | `lapValidity` `VALID`, fase de volta em andamento | AC-US-0009-02 |
| `lapStateInvalid` | inválida | invalid | `lapValidity` `INVALID` | AC-US-0009-03 |
| `reasonMissedMarker` | marcador pulado | missed marker | `invalidReason` `MISSED_MARKER` | AC-US-0004-04 |
| `reasonCut` | corte | cut | `invalidReason` `CUT` | AC-US-0006-05 |
| `reasonReposition` | reposicionamento | repositioning | `invalidReason` `REPOSITION` | AC-US-0007-02 |
| `lapUnofficial` | não oficial | unofficial | resultado com `official` igual a `false` | AC-US-0008-01 |
| `countdownGreenSignal` | VERDE | GREEN | fim da contagem | AC-US-0001-03 |
| `lapResultValid` | válida | valid | resultado `VALID` na tela de resultado | AC-US-0002-01 |
| `lapPaused` | volta pausada | lap paused | `lapPhase` `PAUSED` | AC-US-0003-05 |
| `loadingTrack` | carregando a pista | loading track | leitura do dado da pista em curso | FLOW-0004 |
| `noTrackAvailable` | nenhuma pista disponível | no track available | nenhuma pista carregada | FLOW-0004 |
| `trackDataError` | dado da pista indisponível | track data unavailable | `UNREADABLE` ou `UNSUPPORTED_SCHEMA` | I4 |
| `controlFallbackTouch` | controle por toque (sensor de inclinação indisponível) | touch control (tilt sensor unavailable) | `web-mobile` sem sensor ou com permissão negada | I4 |

Os valores da contagem (3, 2 e 1) são numerais, iguais nos dois idiomas. O valor exibido é o teto de
`countdownRemainingMs` dividido por 1000.

## Resolução do idioma

| Idioma do navegador | Idioma exibido | Fonte |
|---|---|---|
| Português, inclusive variantes regionais | Português | AC-US-0009-05 |
| Inglês, inclusive variantes regionais | Inglês | AC-US-0009-06 |
| Qualquer outro | Inglês | AC-US-0009-07; `DOMAIN/DEC-09` |

A comparação usa o idioma primário do navegador, sem a variante regional. Se o idioma mudar durante a volta,
a exibição segue o novo idioma; a validade não muda. O idioma não é gravado nem enviado (NFR-0005).

## Legibilidade (WCAG AA)

| Elemento | Texto | Contraste mínimo com o fundo imediato | Tamanho mínimo | Canal | Fonte |
|---|---|---|---|---|---|
| Valores da contagem e sinal verde | Obrigatório, além de cor | 4,5:1 | 48 px | `web-desktop` e `web-mobile` | AC-US-0001-09, AC-US-0001-10 |
| Estado da volta e motivo | Obrigatório, além de cor | 4,5:1 | 16 px em `web-mobile`; sem mínimo fixado em `web-desktop` | ambos | AC-US-0009-04, AC-US-0009-08, AC-US-0009-09 |

100% dos estados e motivos exibidos têm rótulo em texto, verificável com a tela em escala de cinza
(NFR-0006).

## Idempotência e ordem

Regra sem estado próprio: a mensagem é função de `lapValidity`, `invalidReason`, `official` e do idioma
corrente. Exibir a mesma mensagem duas vezes é sem efeito. Nenhuma mensagem altera o estado da volta (I2).
