---
stage: req
feature: dirigibilidade
verdict: FAIL
generated: 2026-10-21T16:03:00Z
counts: {blocker: 0, error: 5, warning: 0, info: 0, divergence: 0}
seed: {revision: 1, digest: 8cc4724d94c7}
feedbacks: []
population: "primeira validação do conjunto; todos os 18 arquivos lidos"
---

# Relatório de validação — dirigibilidade

## Issues

### ISSUE-01
- severity: error
- check: R3
- file: stories/US-0003-traseira-viva-e-controlavel.md
- location: AC-US-0003-01, AC-US-0003-05 (e `02-glossary.md`, termo "Condução normal")
- finding: "em todo passo de condução normal (condição de forçar não mantida), a telemetria não reporta `oversteer` nem `sliding`" e "em todo passo de condução normal, a derrapagem lateral não passa de 0,65 rad" — "condução normal" é definida no glossário como qualquer passo sem a condição de forçar, o que inclui a manobra de drift de `requirements/11`; AC-US-0003-02 e o caso anormal "Drift em andamento" admitem `oversteer`/`sliding` e derrapagem pela regra do drift. Um passo de drift com `oversteer` abaixo de 45 km/h reprova o critério 01 e aprova o critério 02: a observação que decide o critério 01 não é determinável a partir das entradas.
- expected: "Condução normal" definida como passo em que a condição de forçar não se mantém **e** a manobra de drift não está em andamento; AC-US-0003-01 e AC-US-0003-05 com a mesma ressalva que AC-US-0003-02 já carrega ("ou dentro da manobra de drift de `requirements/11`").

### ISSUE-02
- severity: error
- check: R3
- file: stories/US-0001-resposta-do-volante.md
- location: AC-US-0001-04
- finding: "a taxa de guinada atinge 90 % do regime correspondente a esse esterço em no máximo 250 ms de tempo simulado, e cai a 10 % dele em no máximo 300 ms ao voltar a 0" — dois comportamentos (subida e queda) num só critério; os critérios 01 e 02 os separam.
- expected: dois critérios, um para a subida a 90 % em 250 ms com esterço parcial e outro para a queda a 10 % em 300 ms ao voltar a 0.

### ISSUE-03
- severity: error
- check: R3
- file: stories/US-0001-resposta-do-volante.md
- location: AC-US-0001-03
- finding: "Os critérios 01 e 02 valem para o esterço −1 (curva para o outro lado) com os mesmos limites de 250 ms e 300 ms" — um critério que junta a subida e a queda por referência; não é atômico.
- expected: a condição "esterço 1 ou −1" incorporada a AC-US-0001-01 e AC-US-0001-02 (e o critério 03 retirado), ou dois critérios separados para o lado oposto.

### ISSUE-04
- severity: error
- check: R3
- file: stories/US-0001-resposta-do-volante.md
- location: Casos anormais, "Esterço invertido antes de atingir o regime"
- finding: "o seed não fixa limite para a inversão; este conjunto exige só que a taxa de guinada mude de sinal e atinja 90 % do regime oposto em no máximo 250 ms + 300 ms de tempo simulado" — limiar de domínio (550 ms) sem fonte no seed nem em `DOMAIN.md`; o próprio texto declara que o seed não o fixa. Esta etapa não inventa limiar.
- expected: o caso anormal registra que o conjunto não fixa limite para a inversão (como fazem os demais casos anormais da história); se um limite for desejado, ele é pedido ao autor do seed, não derivado aqui.

### ISSUE-05
- severity: error
- check: R7
- file: 01-context.md
- location: seção "Restrições", primeiro item
- finding: "O código deste projeto fica na raiz do repositório (`src/`, `tests/`); os presets ficam em `src/physics.ts` (decisão do autor para esta rodada)." — a organização do repositório e a pasta `tests/` não vêm da seção Restrições do seed nem de `DOMAIN.md`; é decisão de layout de código, que pertence a `300 Specs/330 D-Specs`.
- expected: a frase removida; permanece só a restrição citada do seed ("Mudanças ficam nos presets e nas assistências de `src/physics.ts` …").

## Divergences

None.

## Coverage

Seed items: 26 covered (5 histórias, 5 regras de domínio, 4 NFRs, 4 restrições, 4 impactos no domínio, 4 itens fora do escopo), 0 uncovered. `DOMAIN.md`: REF-01 e DEC-01 a DEC-07 aplicados; DEC-08 registrado em `01-context.md` como condição humana de fechamento, fora dos critérios de aceite. Lista "Fora do escopo" de `01-context.md` igual à do seed. Set items with no seed source: 1 — o limiar de 550 ms do caso anormal de US-0001 (ISSUE-04).

## Contexto recebido fora do procedimento

Nenhum: a tarefa não trouxe justificativa do gerador. `NOTES.md` da pasta do seed existe, mas declara-se fora da leitura da pipeline e não foi usado como fonte de julgamento.
