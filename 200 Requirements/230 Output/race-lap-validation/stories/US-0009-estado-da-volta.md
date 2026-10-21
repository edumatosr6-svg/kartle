---
id: US-0009
title: Estado da volta visível durante toda a volta
feature: race-lap-validation
stage: req
status: validated
version: 2.0.0
sources: [SEED/US-9, SEED/NF-06, SEED/NF-07, DOMAIN/DEC-06, DOMAIN/DEC-08, DOMAIN/DEC-09, DOMAIN/DEC-11]
---

# US-0009 — Estado da volta visível durante toda a volta

## História

Como Jogador, quero ver a qualquer momento se minha volta atual ainda vale, para não continuar pilotando
sem saber.

## Canais

- `web-desktop` e `web-mobile`: mesmo estado, mesmos textos, mesmos idiomas, mesmo contraste mínimo.
- `web-mobile`: o texto de estado e de motivo tem no mínimo 16 px (`DOMAIN/DEC-11`). `web-desktop`: a
  decisão não fixa tamanho mínimo para esse texto; vale só o contraste.
- `web-mobile`: com sensor de inclinação ausente ou permissão negada, o controle recai para toque com
  estado visível (I4, `[DOMAIN]`); a exibição do estado da volta não muda.

## Pré-condições

- O sinal verde foi dado e a volta está em andamento.

## Critérios de aceite

- AC-US-0009-01: Do sinal verde ao encerramento da volta, a tela exibe o estado da volta em todos os
  quadros.
- AC-US-0009-02: Enquanto a volta não tem motivo de invalidação, a tela exibe o estado "válida em
  andamento".
- AC-US-0009-03: Quando a volta se torna inválida, a tela exibe o estado "inválida" com o seu motivo
  ("marcador pulado", "corte" ou "reposicionamento").
- AC-US-0009-04: O estado da volta é exibido em texto, além de qualquer cor.
- AC-US-0009-05: Com o idioma do navegador em português, o estado e o motivo são exibidos em português
  (RNF11).
- AC-US-0009-06: Com o idioma do navegador em inglês, o estado e o motivo são exibidos em inglês (RNF11).
- AC-US-0009-07: Com o idioma do navegador diferente de português e de inglês, o estado e o motivo são
  exibidos em inglês (`DOMAIN/DEC-09`).
- AC-US-0009-08: Na tela, o texto de estado e de motivo tem contraste mínimo de 4,5:1 com o fundo
  imediato, em `web-desktop` e em `web-mobile` (`DOMAIN/DEC-11`, WCAG AA).
- AC-US-0009-09: Em `web-mobile`, o texto de estado e de motivo é exibido com no mínimo 16 px
  (`DOMAIN/DEC-11`).

## Casos anormais

- **Volta invalidada**: a volta termina no passo da invalidação (`DOMAIN/DEC-06`); a tela exibe
  "inválida" com o motivo ao terminar.
- **Pausa, perda de foco ou perda do sensor durante a volta**: simulação e cronômetro ficam suspensos e a
  volta segue oficial (`DOMAIN/DEC-08`); ao continuar, a tela exibe o mesmo estado da volta do instante da
  pausa.
- **Idioma do navegador mudado durante a volta**: o idioma exibido segue o do navegador conforme os
  critérios 05 a 07; a regra de validade não muda.

## Fontes

- `SEED/US-9` — história e seu critério.
- `SEED/NF-06` — estado comunicado por texto, não só por cor.
- `SEED/NF-07` — mensagens em pt e en (RNF11).
- `DOMAIN/DEC-06` — volta invalidada termina imediatamente.
- `DOMAIN/DEC-08` — pausa durante a volta.
- `DOMAIN/DEC-09` — idioma fora de pt e en recebe inglês.
- `DOMAIN/DEC-11` — legibilidade WCAG AA e tamanho mínimo no celular.

## Pontos em aberto

Nenhum — idioma, legibilidade e pausa estão decididos em `DOMAIN.md` de 2026-10-20.
