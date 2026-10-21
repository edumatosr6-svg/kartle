---
stage: req
feature: dirigibilidade
verdict: FAIL
generated: 2026-10-21T16:08:25Z
counts: {blocker: 0, error: 2, warning: 0, info: 0, divergence: 0}
seed: {revision: 1, digest: 8cc4724d94c7}
feedbacks: []
population: "revalidação do relatório req-validation-20261021-1603.md: arquivos das ISSUE-01 a 05 (US-0001, US-0003, 01-context.md, 02-glossary.md); arquivo tocado pela renumeração (NFR-0003); nenhuma `version:` movida; dois arquivos intocados sorteados (NFR-0002, US-0002); 98-divergences.md para R8"
---

# Relatório de validação — dirigibilidade

## Issues anteriores

- ISSUE-01 (R3, US-0003 / glossário) — fechada: "Condução normal" exige condição de forçar não mantida **e** drift não em andamento; AC-US-0003-01 e AC-US-0003-05 carregam a ressalva.
- ISSUE-02 (R3, AC-US-0001-04) — fechada: o critério só contém a queda a 10 % em 300 ms com esterço parcial.
- ISSUE-03 (R3, AC-US-0001-03) — fechada: a condição "1 ou −1" está em AC-US-0001-01 e AC-US-0001-02; o critério 03 agora é a subida com esterço parcial.
- ISSUE-04 (R3, US-0001, caso anormal "Esterço invertido") — fechada: o limiar de 550 ms foi retirado; o caso declara que nenhum limite é fixado.
- ISSUE-05 (R7, 01-context.md, Restrições) — fechada: a frase sobre layout do repositório foi removida; só a restrição citada do seed permanece.

## Issues

### ISSUE-01
- severity: error
- check: R4
- file: stories/US-0001-resposta-do-volante.md
- location: AC-US-0001-05
- finding: "Durante os critérios 01 a 04, o estado de aderência reportado pela telemetria é `grip` em todos os passos: a resposta do volante não é obtida com perda de aderência" — critério sem fonte: não cita item do seed, decisão de `DOMAIN.md` nem necessidade `[DOMAIN]`; `SEED/US-1` fixa só a taxa de guinada, e `SEED/US-3` proíbe só `oversteer`/`sliding` em condução normal, não `understeer`. Exigir `grip` a 50 km/h com esterço cheio acrescenta um limite que o seed não pede e que interage com `SEED/US-2` (acima de 45 km/h a perda da frente é admitida e progressiva).
- expected: o critério retirado, ou restrito ao que o seed fixa (nenhum `oversteer`/`sliding` durante os critérios 01 a 04, citando `SEED/US-3`, primeiro critério); se o autor quiser `grip` estrito a 50 km/h com esterço cheio, o item entra como `OPEN-<nn>` para o seed, não como critério desta etapa.

### ISSUE-02
- severity: error
- check: R3
- file: stories/US-0002-aderencia-em-curva.md
- location: AC-US-0002-05
- finding: "Os critérios 01 e 02 valem com acelerador 0 e com acelerador cheio mantidos durante a curva" — critério que junta, por referência, dois comportamentos (critérios 01 e 02) sob duas condições; não é atômico (mesma forma do antigo AC-US-0001-03, ISSUE-03 do relatório anterior).
- expected: a condição "com acelerador 0 ou acelerador cheio mantido durante a curva" incorporada a AC-US-0002-01 e AC-US-0002-02 (e o critério 05 retirado), com AC-US-0002-06 e os casos anormais renumerados se preciso.

## Divergences

None.

## Coverage

Seed items: 26 covered (5 histórias, 5 regras de domínio, 4 NFRs, 4 restrições, 4 impactos no domínio, 4 itens fora do escopo), 0 uncovered. `DOMAIN.md`: REF-01 e DEC-01 a DEC-07 aplicados; DEC-08 registrado em `01-context.md` como condição humana de fechamento. Lista "Fora do escopo" de `01-context.md` igual à do seed. Set items with no seed source: 1 — AC-US-0001-05 (ISSUE-01).

## Contexto recebido fora do procedimento

Nenhum: a tarefa não trouxe justificativa do gerador. `NOTES.md` da pasta do seed declara-se fora da leitura da pipeline e não foi usado como fonte de julgamento. O changelog `97-changelog.md` foi lido só para localizar os arquivos tocados pela rodada 3; a sua argumentação não entrou no julgamento.
