---
stage: fspec
feature: dirigibilidade
verdict: FAIL
generated: 2026-10-21T16:47:31Z
counts: {blocker: 0, error: 2, warning: 1, info: 0, divergence: 0}
seed: {revision: 1, digest: 8cc4724d94c7}
upstream: {stage: req, version: 1.0.0}
feedbacks: ["300 Specs/320 F-Specs/Output/race-lap-validation/reports/feedbacks/dirigibilidade/feedback-20261021-1647.md"]
population: "primeira validação do conjunto: todos os 21 arquivos de 00-index.md a screens/SCR-0002; F1 mecânico (links relativos, modal único por REQ, grep de OPEN-/TBD/caminhos de módulo) sobre todo o conjunto; lista de 31 AC-* e 9 NFR-* construída de 200 Requirements/230 Output/dirigibilidade/ para F4 nos dois sentidos"
---

# Relatório de validação — dirigibilidade

## Issues

### ISSUE-01

- severidade: error
- verificação: F8 — diretiva D-FS-06 (unidades SI no nome do campo; milissegundos para tempos), com a severidade que a diretriz declara
- arquivo: `api/API-0003-saida-dos-ensaios.md`
- localização: tabela "Campos medidos por `benchId`", linhas 61–65, 71, 73–76, 84 (`entrySpeedKmh`, `v0Kmh`, `v1Kmh`, `entrySpeedStepKmh`, `maxUndersteerMsBySpeed` com `entrySpeedKmh`, `zeroToSixtyKmhS`, `topSpeedKmh`, `speedAfterOneSKmh`, `speedBeforeContactKmh`, `speedAfterContactKmh`); cabeçalho, linhas 17–20
- achado: o contrato declara campos numéricos em km/h e um tempo em segundos (`zeroToSixtyKmhS`), unidades que D-FS-06 (`error`) exclui — SI com a unidade no sufixo e milissegundos para tempos, como `speedMps` e `lapMs`; a justificativa pela unidade dos critérios (AC-US-0004-07) satisfaz a regra 1 da política de contrato do gerador, mas a diretriz do projeto prevalece sobre a habilidade (precedência de governança).
- esperado: campos do contrato em SI com sufixo (`...Mps`, `...Ms`), cada linha dizendo que a saída serializada e `docs/physics.md` apresentam o valor convertido em km/h ou s porque os critérios de US-0002 e US-0004 nomeiam essas unidades como ponto de observação; `zeroToSixtyKmhS` passa a `zeroToSixtyKmhMs`; glossário (linha 73 e seguintes de `02-glossary.md`), `FEAT-0002` REQ-06, `FEAT-0004` REQ-07, `FEAT-0006` REQ-08 e `RULE-0002` atualizados com os nomes novos; nenhum requisito, ensaio ou limiar acrescentado.

### ISSUE-02

- severidade: error
- verificação: F8 — vazamento de projeto (módulo, caminho ou pasta de código nomeados sem ser citação das Restrições do seed com o seed citado)
- arquivo: `97-changelog.md`
- localização: linhas 23–25, entrada "2026-10-21 — rodada 1, Mode A"
- achado: a entrada fixa que "o código fica na raiz do repositório (`src/`, `tests/`), os presets em `src/physics.ts` e os benches em `scripts/`"; `src/`, `tests/` e `scripts/` não constam das Restrições do seed, e `src/physics.ts` consta mas não é citado como tal; o próprio texto reconhece que é contexto de layout para a etapa de projeto, que esta etapa não decide.
- esperado: a frase de layout removida da entrada do changelog; se a restrição do seed sobre os presets precisar ficar registrada, citá-la como `SEED/RE-01` via NFR-0005, sem caminhos além do que o seed enuncia.

### ISSUE-03

- severidade: warning
- verificação: F3 — regra e requisito não se contradizem; uma classificação afirmada pela regra que a sua própria definição não garante
- arquivo: `rules/RULE-0001-estado-de-aderencia-e-condicao-de-forcar.md`
- localização: linhas 39–41 ("Na curva de referência a 45 km/h com esterço cheio e acelerador cheio, a velocidade não é maior que 45 km/h na entrada e o passo é de condução normal")
- achado: pela definição de `forcing` da mesma regra (linhas 25–26), um passo da curva em que o acelerador cheio leve a velocidade acima de 45 km/h é "Forçando", não "Condução normal"; a exigência de `grip` ou `understeer` em todos os passos vale por AC-US-0003-01 e por REQ-FEAT-0003-02 independentemente da classe, mas a justificativa da regra só é verdadeira no passo de entrada.
- esperado: a frase restrita ao que a regra garante — a exigência de `grip` ou `understeer` em todos os passos da curva de referência com acelerador cheio vem de AC-US-0003-01 e vale qualquer que seja a classe do passo; a afirmação de que todos os passos são condução normal removida ou limitada ao passo de entrada.

## Divergences

Nenhuma. `98-divergences.md` está bem formado e vazio; esta etapa não lê a raiz de código para derivar comportamento.

## Coverage

- Critérios cobertos: 31 de 31 (AC-US-0001-01 a 06, AC-US-0002-01 a 05, AC-US-0003-01 a 07, AC-US-0004-01 a 07, AC-US-0005-01 a 06), cada um realizado por ao menos um `REQ-*` que o cita.
- Critérios não cobertos: nenhum.
- NFRs: 9 de 9 realizados por requisito (NFR-0001 → REQ-FEAT-0005-02; NFR-0002 → REQ-FEAT-0006-06/09; NFR-0003 → REQ-FEAT-0006-05; NFR-0004 → REQ-FEAT-0006-08; NFR-0005 → REQ-FEAT-0006-01/02; NFR-0006 → REQ-FEAT-0006-03; NFR-0007 → REQ-FEAT-0006-04; NFR-0008 → REQ-FEAT-0006-07; NFR-0009 → REQ-FEAT-0005-08/09); nenhum adiado à etapa de projeto.
- Requisitos sem fonte: nenhum (58 `REQ-*`; cada um cita `AC-*`, `NFR-*` ou `[DOMAIN]` com o item dos requisitos).
- Contratos sem consumidor: nenhum (API-0001 lido por SCR-0001, FLOW-0001 e os ensaios; API-0002 por SCR-0002 e FLOW-0003; API-0003 por FLOW-0002 e FEAT-0001 a FEAT-0006).
- Fora do escopo de `01-overview.md`: idêntico ao dos requisitos.

## Contexto recebido fora do procedimento

- A requisição do usuário retransmitida pelo harness ("a janela está visível, pode rodar as medições") não diz respeito a esta validação e foi ignorada; nenhuma medição foi executada por esta etapa.
- `97-changelog.md` (linhas 18–25) registra decisões "que o autor passou a esta rodada" e o motivo das escolhas de forma; essa justificativa não entrou no julgamento.

## Scope — item devido a outra feature (fora do veredito)

- FB-01 enviado a `race-lap-validation` (arquivo em `feedbacks:`): `api/API-0002` desta feature acrescenta `setupId` e `setupVersion`, opcionais na leitura, ao resultado da volta, ao replay e ao texto compartilhado, contratos nomeados como daquela feature; o conjunto validado daquela feature não os nomeia.
