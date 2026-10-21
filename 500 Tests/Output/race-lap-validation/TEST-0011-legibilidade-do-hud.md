---
id: TEST-0011
title: Tamanho e contraste das fichas do HUD
feature: race-lap-validation
stage: test
status: validated
version: 1.0.0
sources: [AC-US-0001-09, AC-US-0001-10, AC-US-0009-08, AC-US-0009-09, NFR-0006]
---

# TEST-0011 — Tamanho e contraste das fichas do HUD

| | |
|---|---|
| Arquivo | `tests/race-lap-validation-hud-css.test.ts` (estratégia: `lap-hud-css`) |
| Nível | unitário sobre o texto de `src/style.css` |
| Interface exercitada | as propriedades `--lap-text`, `--lap-chip-bg`, `--lap-chip-invalid-bg`, `--lap-countdown-size`, `--lap-state-size` e as regras `#lap-countdown` e `.lap-chip` |
| Fixtures | nenhuma; luminância relativa e razão de contraste WCAG 2.x calculadas no teste |

## Verificações

| Check | Decide | Teste | O que a faria falhar |
|---|---|---|---|
| CHK-TEST-0011-01 | AC-US-0001-09 | the countdown numeral and green signal have a minimum size of 48 px | ficha menor que 48 px ou tamanho sem piso |
| CHK-TEST-0011-02 | AC-US-0001-10 | the countdown text has a contrast of at least 4.5:1 with its own background | cor de ficha com contraste insuficiente ou fundo transparente |
| CHK-TEST-0011-03 | AC-US-0009-08 | the state and reason texts have a contrast of at least 4.5:1 on both the valid and the invalid chip | ficha inválida com contraste insuficiente |
| CHK-TEST-0011-04 | AC-US-0009-09 | the state and reason texts have a minimum size of 16 px | ficha menor que 16 px ou tamanho sem piso |

O tamanho renderizado em aparelho e navegador (E2E-01, E2E-07) e a escala de cinza (E2E-09) ficam no roteiro registrado.
