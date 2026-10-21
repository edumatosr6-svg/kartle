---
title: Registro de divergências e de critérios não verificados em npm test
feature: race-lap-validation
stage: test
status: validated
version: 1.0.0
---

# 98 — Divergências

Nenhuma verificação derivada de um critério falha contra a implementação atual: a execução de 2026-10-21 (`npm test`, totais do
próprio runner) coletou as 138 verificações novas e todas passaram. Não há divergência código-versus-especificação aberta neste estágio.

## Critérios cuja metade de tela, aparelho ou navegador só é verificável pelo roteiro registrado

O projeto não tem ferramenta de E2E e a estratégia define os níveis web E2E e mobile E2E como roteiro registrado
(`E2E-01` a `E2E-11` em `test-strategy.md`), gravado por um humano em `docs/lap-validation-device-log.md`. Cada linha
abaixo tem a sua regra provada em `npm test` (coluna "Verificado por"); a parte que exige tela, sensor, taxa de quadros ou
navegador nomeado fica **unverified** até o registro humano da execução. Não é um teste pulado: é um nível sem execução.

| Id | Estado | O que a especificação exige | Verificado por (`npm test`) | Parte não verificada e roteiro que a decide | Quem deve |
|---|---|---|---|---|---|
| AC-US-0001-02 | unverified | numeral da contagem em texto na tela | CHK-TEST-0010-01 | texto renderizado no HUD: E2E-01 | registro humano em `docs/lap-validation-device-log.md` |
| AC-US-0001-03 | unverified | sinal verde em texto na tela | CHK-TEST-0010-02 | texto renderizado: E2E-01 | registro humano |
| AC-US-0001-09 | unverified | 48 px no mínimo em desktop e celular | CHK-TEST-0011-01 | tamanho medido no aparelho: E2E-01 | registro humano |
| AC-US-0001-10 | unverified | contraste 4,5:1 na tela | CHK-TEST-0011-02 | contraste medido na cena: E2E-01 | registro humano |
| AC-US-0002-01 | unverified | tela exibe a volta como válida | CHK-TEST-0005-01 | exibição: E2E-02 | registro humano |
| AC-US-0002-02 | unverified | tela exibe o tempo total | CHK-TEST-0004-07 | exibição em `m:ss.mmm`: E2E-02 | registro humano |
| AC-US-0002-03 | unverified | tela exibe quatro tempos de setor | CHK-TEST-0004-08 | exibição: E2E-02 | registro humano |
| AC-US-0002-09 | unverified | tempo de cada setor ao completá-lo | CHK-TEST-0004-10 | exibição por quadro: E2E-02 | registro humano |
| AC-US-0003-05 | unverified | tecla Esc pausa | CHK-TEST-0004-12 | a tecla gera `pauseLap('ESC_KEY')`: E2E-03 | registro humano |
| AC-US-0003-06 | unverified | perda de foco pausa sem ação | CHK-TEST-0004-13 | o evento do navegador gera `pauseLap('FOCUS_LOST')`: E2E-04 | registro humano |
| AC-US-0003-07 | unverified | perda do sensor pausa em cerca de 0,5 s | CHK-TEST-0004-14 | vigilância do sensor no celular: E2E-05 | registro humano |
| AC-US-0004-04 | unverified | motivo "marcador pulado" na tela | CHK-TEST-0010-06 | exibição: E2E-02 | registro humano |
| AC-US-0006-05 | unverified | motivo "corte" na tela | CHK-TEST-0010-07, CHK-TEST-0006-10 | exibição: E2E-02 | registro humano |
| AC-US-0007-02 | unverified | motivo "reposicionamento" na tela | CHK-TEST-0010-08 | exibição após a tecla ou o toque: E2E-02 | registro humano |
| AC-US-0008-01 | unverified | tempo identificado como não oficial na tela | CHK-TEST-0007-06, CHK-TEST-0010-10 | exibição: E2E-02 | registro humano |
| AC-US-0008-03 | unverified | nenhuma opção de volta oficial na tela | CHK-TEST-0007-08 | ausência da opção: E2E-06 | registro humano |
| AC-US-0008-04 | unverified | treino oferecido e pilotável na tela | CHK-TEST-0007-09 | oferta e pilotagem: E2E-06 | registro humano |
| AC-US-0009-01 | unverified | estado exibido em todos os quadros | CHK-TEST-0004-19, CHK-TEST-0012-01 | observação por quadro: E2E-02 | registro humano |
| AC-US-0009-04 | unverified | estado em texto além da cor | CHK-TEST-0010-13 | escala de cinza: E2E-09 | registro humano |
| AC-US-0009-07 | unverified | idioma do navegador seguido | CHK-TEST-0010-16 | `navigator.language` trocado: E2E-07 | registro humano |
| AC-US-0009-08 | unverified | contraste 4,5:1 na tela | CHK-TEST-0011-03 | contraste medido: E2E-07 | registro humano |
| AC-US-0009-09 | unverified | 16 px em `web-mobile` | CHK-TEST-0011-04 | tamanho medido no celular: E2E-07 | registro humano |
| NFR-0003 | unverified | 60 fps em notebook e 30 fps em celular intermediário | — (não há verificação determinística possível, I9) | E2E-10 nos aparelhos nomeados | registro humano |
| NFR-0004 | unverified | nenhuma requisição durante a volta | CHK-TEST-0013-03 | 0 requisições com a rede bloqueada: E2E-08 | registro humano |
| NFR-0006 | unverified | legível em escala de cinza | CHK-TEST-0010-13, CHK-TEST-0011-03 | E2E-09 | registro humano |
| NFR-0007 | unverified | pt e en conforme o navegador | CHK-TEST-0010-17 | E2E-07 | registro humano |
| NFR-0008 | unverified | mesmo tempo ao ms em Chrome, Edge, Firefox e Safari | — (um runtime só; a sequência de entradas está em `tests/helpers/autopilot.ts`, `reference.inputs` de TEST-0008) | E2E-11 nos quatro navegadores | registro humano |

Nenhuma linha acima contribui para o veredito deste estágio (conventions §6); cada uma permanece aberta até a execução
registrada, que é uma decisão humana e não uma verificação pulada.
