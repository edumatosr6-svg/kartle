---
stage: fspec
feature: modelo-kart-01
verdict: FAIL
generated: 2026-10-22T15:06:12Z
counts: {blocker: 0, error: 1, warning: 1, info: 0, divergence: 0}
seed: {revision: 1, digest: ef2fe14c9440}
upstream: {stage: req, version: 1.1.0}
feedbacks: []
population: "primeira validação: conjunto inteiro (20 arquivos); requisitos validados em req-validation-20261022-1431"
---

# Relatório de validação do F-Spec — modelo-kart-01

## Summary

- veredito: FAIL
- contagens: 0 blocker, 1 error, 1 warning, 0 info, 0 divergence
- entrada humana: ISSUE-01. Os requisitos não decidem qual é o modo da câmera depois do fim da volta (`lapPhase` `ENDED`)

## Issues

### ISSUE-01

- severidade: error
- verificação: F7, regra de domínio sem fonte (ramo não decidido pelos requisitos; D-FS-02)
- arquivo: `rules/RULE-0002-camera-de-jogo.md`
- localização: tabela Modos, linha `TRACK_OVERVIEW` ("ou `lapPhase` `ENDED`"), parágrafo "`ENDED` é `TRACK_OVERVIEW` porque…", diagrama e tabela de transições, linha `RACE_CHASE` para `TRACK_OVERVIEW`. Também `features/FEAT-0003` (REQ-FEAT-0003-11, "ou com a volta encerrada"; tabela Comportamento, linha "Volta encerrada"; tabela Estado, linha `TRACK_OVERVIEW`), `02-glossary.md` (termo "Em corrida", "termina no fim da volta"), `flows/FLOW-0002` (passos 8 e 9), `flows/FLOW-0001` (linha "Volta encerrada"), `screens/SCR-0001` (estado "Visão geral"; Navegação) e `api/API-0003` (linha `cameraMode`)
- achado: o conjunto põe a câmera em `TRACK_OVERVIEW` quando a volta termina, por conclusão ou por invalidação, e encerra "em corrida" em `ENDED`. Nenhum item dos requisitos decide esse ramo. AC-US-0003-10 e `DOMAIN/DEC-04` falam do período antes da largada. O glossário dos requisitos define "em corrida" como "do sinal verde em diante", sem fim. O próprio changelog do conjunto registra que o autor pode preferir outra leitura. O ramo também tira a câmera da pose de corrida quando uma volta oficial é invalidada com o Jogador ainda pilotando, inclusive por reposicionamento (`race-lap-validation`, RULE-0005). Isso contraria o caso anormal "Reposicionamento do kart em corrida" de US-0003, que exige pose de corrida em relação à nova posição, sem corte.
- esperado: o modo da câmera depois de `ENDED` só é especificado a partir de um item dos requisitos que o carregue, depois que o autor o decidir em `DOMAIN.md` e US-0003 absorver a decisão. Até lá, "em corrida" mantém a definição dos requisitos e nenhum arquivo do conjunto atribui um modo a `ENDED`.

### ISSUE-02

- severidade: warning
- verificação: F4, lista do que o F-Spec deixa de fora confrontada com a dos requisitos
- arquivo: `01-overview.md`
- localização: seção "Lacunas deliberadas": frase de abertura e as linhas "Altura, ponto de mira e campo de visão da visão geral; campo de visão durante a descida", "Razão entre o ângulo do volante e o ângulo de esterço", "Direção da luz e aparência da sombra; sombra do fantasma e de outros objetos" e "Aparência do fantasma além de ser o Kart 01". Também `97-changelog.md`, rodada 1, "Itens recusados", primeiro item
- achado: a seção afirma que os requisitos recusaram fixar todos os pontos listados, com o motivo registrado no changelog deles. O changelog dos requisitos (1.1.0) não registra recusa para essas quatro linhas. São pontos que nenhum critério fixa, e não recusas registradas.
- esperado: a abertura da seção e o item do changelog dizem, linha a linha, o que vale para cada ponto: recusado no changelog dos requisitos, ou não fixado por nenhum critério.

## Divergences

Nenhuma.

## Coverage

- critérios: 39 `AC-*` dos requisitos cobertos por `REQ-*`, 0 descobertos
- NFRs: NFR-0001 a NFR-0007 realizados (7), 0 adiados, 0 descartados
- requisitos sem fonte: nenhum `REQ-*`; ramo sem fonte fora de uma linha de requisito: ISSUE-01
- contratos sem consumidor: nenhum (API-0001 em FLOW-0001, FLOW-0002 e SCR-0001; API-0002 em FLOW-0003; API-0003 em FLOW-0001, FLOW-0002 e SCR-0001)
