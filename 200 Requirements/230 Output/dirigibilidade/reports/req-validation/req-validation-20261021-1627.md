---
stage: req
feature: dirigibilidade
verdict: SUCCESS
generated: 2026-10-21T16:27:02Z
counts: {blocker: 0, error: 0, warning: 0, info: 1, divergence: 0}
seed: {revision: 1, digest: 8cc4724d94c7}
feedbacks: []
population: "revalidação do relatório req-validation-20261021-1608.md: arquivos das ISSUE-01 e 02 (US-0001, US-0002); arquivo tocado pela rodada 4 sem `version:` movida (01-context.md); nenhuma `version:` movida; dois arquivos intocados sorteados (US-0004, NFR-0009); 98-divergences.md para R8; grep de `OPEN-`/`TBD`/vocabulário proibido em todo o conjunto"
---

# Relatório de validação — dirigibilidade

## Issues anteriores

- ISSUE-01 (R4, AC-US-0001-05) — fechada: o critério passou a citar `DOMAIN/DEC-09` (decisão de 2026-10-21 em `DOMAIN.md`, última entrada), que fixa exatamente o seu conteúdo: veredito do ensaio em reta depende só do tempo da taxa de guinada; `understeer` transitório aceitável; aderência julgada só pelo ensaio de 45 km/h no raio de 18 m. Observação que o decide: saída de `npm test`/`npm run bench:handling` do ensaio 01–04 com ao menos um passo `understeer` registrado — o veredito é aprovado se, e só se, os tempos medidos ficam dentro de 250 ms / 300 ms. O rótulo `DOMAIN/DEC-09` consta das duas tabelas de `01-context.md` e de `sources:` e Fontes de US-0001.
- ISSUE-02 (R3, AC-US-0002-05) — fechada: a condição de acelerador (0 mantido / cheio mantido durante toda a curva) foi incorporada a AC-US-0002-01 e AC-US-0002-02, cada um com um único comportamento sob duas condições de ensaio; o antigo critério 05 foi retirado e a saída do ensaio é AC-US-0002-05, reportando a maior duração de `understeer` por condição de acelerador. Nenhum outro arquivo referenciava os critérios 05/06 antigos.

## Issues

### ISSUE-01
- severity: info
- check: R7
- file: stories/US-0004-sensacao-de-velocidade-e-risco.md
- location: AC-US-0004-07
- finding: "A saída de `npm test` ou de `npm run bench:physics` contém…" — o nome de script `bench:physics` não consta do seed (que nomeia só `npm run bench:handling`, `npm test` e "os benches") nem de `DOMAIN.md`; é ponto de observação da família que as diretivas admitem ("saída de `npm test` ou dos benches"), não escolha de desenho, por isso não é erro.
- expected: opcionalmente "a saída de `npm test` ou do bench de física" (sem fixar o nome do script), deixando o nome do script à etapa de desenho.

## Divergences

None.

## Coverage

Seed items: 26 covered (5 histórias, 5 regras de domínio, 4 NFRs, 4 restrições, 4 impactos no domínio, 4 itens fora do escopo), 0 uncovered. `DOMAIN.md`: REF-01 e DEC-01 a DEC-07 aplicados; DEC-08 registrado em `01-context.md` como condição humana de fechamento; DEC-09 aplicado em AC-US-0001-05. Lista "Fora do escopo" de `01-context.md` igual à do seed. Set items with no seed source: 0. Nenhum `OPEN-<nn>` nem `TBD` no conjunto; nenhum vocabulário proibido em critério (as ocorrências de "rápida" estão em citações da sensação alvo do seed, fora de critérios).

## Contexto recebido fora do procedimento

Nenhum: a tarefa não trouxe justificativa do gerador. `NOTES.md` da pasta do seed declara-se fora da leitura da pipeline e não foi usado como fonte de julgamento. `97-changelog.md` foi lido só para localizar os arquivos tocados pela rodada 4; a sua argumentação não entrou no julgamento.

## Condição de fechamento humana (fora do veredito)

`DOMAIN/DEC-08`: rodada de teste do dono do produto na build antes de fechar a feature — domínio subjetivo que o seed não decide por critério numérico; não bloqueia esta etapa, mas é de responsabilidade humana depois da etapa de testes.
