---
id: FEAT-0007
title: Estado da volta visível durante toda a volta
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: [US-0009, NFR-0006, NFR-0007, AC-US-0009-01, AC-US-0009-02, AC-US-0009-03, AC-US-0009-04, AC-US-0009-05, AC-US-0009-06, AC-US-0009-07, AC-US-0009-08, AC-US-0009-09]
---

# FEAT-0007 — Estado da volta visível durante toda a volta

## Resumo

Do sinal verde ao encerramento, a tela mostra se a volta ainda vale: "válida em andamento" ou "inválida" com
o motivo. O estado e o motivo são texto, além de cor, nos idiomas português e inglês conforme o idioma do
navegador, com contraste mínimo de 4,5:1 (WCAG AA) e, em `web-mobile`, com no mínimo 16 px
(`DOMAIN/DEC-09`, `DOMAIN/DEC-11`).

## Canais

| Canal | Diferença |
|---|---|
| `web-desktop` | Vale o contraste; a decisão não fixa tamanho mínimo para o texto de estado e de motivo |
| `web-mobile` | O texto de estado e de motivo tem no mínimo 16 px; vale o contraste. Sensor ausente ou permissão negada: o controle recai para toque com estado visível e a exibição do estado da volta não muda |

Mesmo estado, mesmos textos, mesmos idiomas e mesmo contraste mínimo nos dois canais.

## Requisitos

- REQ-FEAT-0007-01: O sistema SHALL exibir o estado da volta na tela em todos os quadros, do sinal verde ao
  encerramento da volta (AC-US-0009-01).
- REQ-FEAT-0007-02: O sistema SHALL exibir o estado "válida em andamento" enquanto a volta não tem motivo
  de invalidação (AC-US-0009-02).
- REQ-FEAT-0007-03: O sistema SHALL exibir o estado "inválida" com o seu motivo ("marcador pulado", "corte"
  ou "reposicionamento") quando a volta se torna inválida (AC-US-0009-03).
- REQ-FEAT-0007-04: O sistema SHALL exibir o estado da volta em texto, além de qualquer cor
  (AC-US-0009-04).
- REQ-FEAT-0007-05: O sistema SHALL exibir o estado e o motivo em português quando o idioma do navegador é
  português (AC-US-0009-05).
- REQ-FEAT-0007-06: O sistema SHALL exibir o estado e o motivo em inglês quando o idioma do navegador é
  inglês (AC-US-0009-06).
- REQ-FEAT-0007-07: O sistema SHALL exibir o estado e o motivo em inglês quando o idioma do navegador não é
  português nem inglês (AC-US-0009-07).
- REQ-FEAT-0007-08: O sistema SHALL exibir o texto de estado e de motivo com contraste mínimo de 4,5:1 com
  o fundo imediato, em `web-desktop` e em `web-mobile` (AC-US-0009-08).
- REQ-FEAT-0007-09: O sistema SHALL exibir o texto de estado e de motivo com no mínimo 16 px em
  `web-mobile` (AC-US-0009-09).
- REQ-FEAT-0007-10: O sistema SHALL comunicar em texto, além de cor, 100% dos estados e motivos exibidos,
  verificável com a tela em escala de cinza (NFR-0006).
- REQ-FEAT-0007-11: O sistema SHALL manter 100% das mensagens de estado e de motivo disponíveis em
  português e em inglês, usando o idioma do navegador quando ele é português ou inglês e o inglês em
  qualquer outro caso (NFR-0007).
- REQ-FEAT-0007-12: O sistema SHALL exibir, ao continuar depois de pausa, perda de foco ou perda do sensor,
  o mesmo estado da volta do instante da pausa [DOMAIN] (US-0009, caso anormal; `DOMAIN/DEC-08`).
- REQ-FEAT-0007-13: O sistema SHALL seguir o idioma do navegador se ele mudar durante a volta, sem alterar a
  regra de validade [DOMAIN] (US-0009, caso anormal; `DOMAIN/DEC-09`).
- REQ-FEAT-0007-14: O sistema SHALL exibir "inválida" com o motivo ao terminar a volta invalidada, no passo
  da invalidação [DOMAIN] (US-0009, caso anormal; `DOMAIN/DEC-06`).

## Comportamento

Textos e resolução de idioma: [RULE-0006](../rules/RULE-0006-mensagens-de-estado-e-motivo.md). Telas:
[SCR-0001](../screens/SCR-0001-corrida-hud-da-volta.md) e [SCR-0003](../screens/SCR-0003-resultado-da-volta.md).

| Situação | Comportamento |
|---|---|
| Volta em andamento sem motivo | "válida em andamento" / "valid, in progress" |
| Volta invalidada por marcador pulado, corte ou reposicionamento | "Inválida" com o motivo, no passo da invalidação; a volta termina |
| Navegador em português (inclui variantes regionais do português) | Textos em português |
| Navegador em inglês (inclui variantes regionais do inglês) | Textos em inglês |
| Navegador em qualquer outro idioma | Textos em inglês |
| Idioma do navegador muda durante a volta | A exibição segue o novo idioma; a validade não muda |
| Pausa durante a volta | O estado exibido ao continuar é o do instante da pausa |
| Recarregar ou abandonar durante a volta | Nenhum resultado; nada a exibir |
| Rede indisponível | Sem efeito: textos e idiomas são locais (D-FS-08) |

## Estado

Lê `lapPhase`, `lapValidity`, `invalidReason` e o idioma do navegador; não altera estado da volta (a
apresentação só exibe, I2). Definições em [RULE-0002](../rules/RULE-0002-estados-da-volta.md) e
[API-0001](../api/API-0001-resultado-e-estado-da-volta.md).

## Configuração

Nenhuma. O idioma não é uma configuração do jogo: vem do navegador (`DOMAIN/DEC-09`).

## Critérios de aceite

- A tela mostra o estado a cada quadro do sinal verde ao fim: "válida em andamento" ou "inválida" com
  motivo (satisfaz AC-US-0009-01, AC-US-0009-02, AC-US-0009-03; cobre os requisitos 01 a 03 e 14).
- O estado é legível com a cor desconsiderada (tela em escala de cinza) (satisfaz AC-US-0009-04 e o
  NFR-0006; cobre os requisitos 04 e 10).
- Com o navegador em pt, em en e em um idioma que não é pt nem en, os textos saem em pt, em en e em en
  (satisfaz AC-US-0009-05, AC-US-0009-06, AC-US-0009-07 e o NFR-0007; cobre os requisitos 05 a 07, 11 e
  13).
- Contraste mínimo de 4,5:1 medido nos dois canais e 16 px no mínimo em `web-mobile` (satisfaz
  AC-US-0009-08, AC-US-0009-09; cobre os requisitos 08 e 09).
- Ao continuar depois da pausa, o estado é o do instante da pausa (satisfaz AC-US-0009-02; cobre o
  requisito 12).

## Pontos em aberto

Nenhum.
