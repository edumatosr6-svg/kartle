---
id: NFR-0006
title: Estado da volta por texto além de cor, com legibilidade WCAG AA
feature: race-lap-validation
stage: req
status: validated
version: 2.0.0
sources: [SEED/NF-06, DOMAIN/DEC-11]
---

# NFR-0006 — Estado da volta por texto além de cor, com legibilidade WCAG AA

| Requisito | Limite mensurável | Como é observado | Canal | Fonte |
|---|---|---|---|---|
| Contagem regressiva, sinal verde, estado da volta e motivo são comunicados em texto, além de cor | 100% dos estados e motivos exibidos têm rótulo em texto | Estado da tela durante a contagem e durante a volta, verificado com a cor desconsiderada (tela em escala de cinza) | `web-desktop`, `web-mobile` | `SEED/NF-06` (`requirements/07`) |
| Contraste do texto da contagem, do sinal verde, do estado e do motivo | Contraste mínimo de 4,5:1 com o fundo imediato (WCAG AA), em 100% dos textos medidos | Medida de contraste sobre o estado da tela durante a contagem e durante a volta | `web-desktop`, `web-mobile` | `DOMAIN/DEC-11` |
| Tamanho do texto da contagem regressiva e do sinal verde | No mínimo 48 px | Tamanho do texto renderizado no estado da tela durante a contagem | `web-desktop`, `web-mobile` | `DOMAIN/DEC-11` |
| Tamanho do texto de estado e de motivo | No mínimo 16 px em `web-mobile`; em `web-desktop` a decisão não fixa tamanho mínimo | Tamanho do texto renderizado no estado da tela durante a volta, em celular | `web-mobile` | `DOMAIN/DEC-11` |
