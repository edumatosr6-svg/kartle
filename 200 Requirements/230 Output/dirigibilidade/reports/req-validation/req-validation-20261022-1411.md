---
stage: req
feature: dirigibilidade
verdict: FAIL
generated: 2026-10-22T14:11:11Z
counts: {blocker: 0, error: 2, warning: 0, info: 1, divergence: 0}
seed: {revision: 3, digest: 7dd24c8b6cab}
feedbacks: []
population: "revalidação pedida (iteração 1 de novo loop) após req-validation-20261021-1837.md: issue anterior (US-0003) reverificada primeiro; nenhuma `version:` movida no conjunto; como `DOMAIN.md` (2026-10-22T13:59Z) e `220 Input/README.md` mudaram depois daquele relatório, os 18 arquivos do conjunto foram lidos contra as entradas atuais"
---

# Relatório de validação — dirigibilidade

## Issues

### ISSUE-01
- severity: error
- check: R4
- file: 01-context.md; stories/US-0002-aderencia-em-curva.md
- location: 01-context.md, tabelas "Itens do seed e decisões de domínio" e "Decisões de domínio aplicadas"; US-0002 `sources:`, Fontes, AC-US-0002-03, AC-US-0002-04
- finding: a decisão de `DOMAIN.md` de 2026-10-22 "Fim da varredura de início do subesterço" (no ensaio em que a velocidade sobe no arco de 18 m, sair da faixa abaixo de 50 km/h reprova; sair acima de 50 km/h encerra a varredura sem reprovar desde que pelo menos duas velocidades acima de 50 km/h tenham sido medidas antes da saída; saída antes da segunda medição acima de 50 km/h reprova por falta de medida) não corresponde a nenhum item do conjunto: não tem rótulo, nenhuma história a cita e nenhum critério a declara.
- expected: `01-context.md` rotula a decisão (ex.: `DOMAIN/DEC-11`) nas duas tabelas, e US-0002 a cita em `sources:` e Fontes e declara nos critérios do ensaio de velocidade crescente no arco de 18 m as três regras da decisão, com 50 km/h e o mínimo de duas medições acima de 50 km/h.

### ISSUE-02
- severity: error
- check: R2
- file: stories/US-0002-aderencia-em-curva.md
- location: AC-US-0002-02 (condição de acelerador cheio mantido durante todo o arco); Casos anormais, "Kart sai da faixa de asfalto do arco"
- finding: o conjunto reprova toda saída da faixa do arco ("o passo em que o kart sai da faixa falha o critério 02"; "permanece dentro da faixa de asfalto em todos os passos do arco" com acelerador cheio, em que a velocidade sobe no arco a partir de 50 km/h), o que contradiz a decisão de `DOMAIN.md` de 2026-10-22, segundo a qual, no ensaio em que a velocidade sobe no arco de 18 m, a saída acima de 50 km/h com pelo menos duas velocidades acima de 50 km/h medidas não reprova.
- expected: o critério 02 e o caso anormal reprovam a saída da faixa só no que a decisão reprova no ensaio em que a velocidade sobe no arco (saída abaixo de 50 km/h; saída antes da segunda medição acima de 50 km/h), mantendo a permanência na faixa exigida na condição de acelerador 0, onde a velocidade não sobe.

### ISSUE-03
- severity: info
- check: R3
- file: stories/US-0003-traseira-viva-e-controlavel.md
- location: AC-US-0003-01
- finding: (reverificada de req-validation-20261021-1837.md, ISSUE-01, texto inalterado) a cláusula "em particular, na curva de referência ... com entrada a 50 km/h, esterço cheio e acelerador cheio, o estado é `grip` ou `understeer` em todos os passos do arco" é ligada à condução normal, mas com acelerador cheio a velocidade passa de 50 km/h no arco e a condição de forçar do glossário passa a valer; o critério é decidível (estado de aderência em todos os passos do arco até a saída da faixa) e mais estrito que o seed, só a ligação "em particular" é imprecisa.
- expected: a cláusula da curva de referência é separada da cláusula de condução normal e declara que vale em todos os passos do arco, inclusive acima de 50 km/h, até o fim do ensaio.

## Divergences

None.

## Coverage

Seed items: 27 covered (5 histórias, 6 regras de domínio, 4 NFRs, 4 restrições, 4 impactos no domínio, 4 itens fora do escopo), 0 uncovered. `DOMAIN.md`: 13 entradas cobertas (REF-01 a REF-03, DEC-01 a DEC-10), 1 não coberta — a entrada de 2026-10-22 "Fim da varredura de início do subesterço" (ISSUE-01). Lista "Fora do escopo" de `01-context.md` igual à do seed. Set items with no seed source: 0.
