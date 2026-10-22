---
stage: dspec
feature: pista-kart-park
verdict: FAIL
generated: 2026-10-22T16:14:20Z
counts: {blocker: 0, error: 3, warning: 2, info: 0, divergence: 13}
seed: {revision: 1, digest: b5aa5be4734a}
upstream: {stage: fspec, version: 1.0.1}
feedbacks: ["300 Specs/330 D-Specs/Output/race-lap-validation/reports/feedbacks/pista-kart-park/feedback-20261022-1614.md"]
population: "primeira validação: os 24 arquivos do conjunto"
isolation: "nenhuma justificativa do gerador chegou pela invocação; 97-changelog.md foi examinado só por busca dirigida (OPEN, TBD, segredo) e não pesou em nenhum julgamento"
---

# Relatório de validação D-Spec — pista-kart-park

## Summary

- verdict: FAIL
- blocker: 0
- error: 3 (ISSUE-01, ISSUE-02, ISSUE-03)
- warning: 2 (ISSUE-04, ISSUE-05)
- scope: 1 (ISSUE-06, fora do veredito, enviado como FB-01)
- divergence: 13, todas `open`, em `98-divergences.md`

## Issues

### ISSUE-01

- severity: error
- check: D5 — regra posta numa camada que o mapa não lhe dá
- file: core/DES-0005-sessao-de-treino-catalogo-e-selecao-de-pista.md
- location: seção "Interface", linhas `OSM_CREDIT` (43), `creditFor` (52) e `optionLabel` (53); usados por web/DES-0007
- finding: `src/trainingSession.ts`, camada simulação, guarda o conteúdo e as regras de tela do crédito e do rótulo (os textos de `OSM_CREDIT`, a regra "crédito só para pista com `osmCredit`" de REQ-FEAT-0006-10 em `creditFor` e a formatação "nome · 687 m" de REQ-FEAT-0006-08 em `optionLabel`), que o mapa de camadas põe na aplicação ("screens") e que SCR-0001 e SCR-0002 põem na tela, a partir do `osmCredit` lido em `getTrainingTrackOptions`.
- expected: `src/trainingSession.ts` guarda só a sessão e as entradas do catálogo de API-0002 (`trackId`, `displayName`, `displayLengthM`, `osmCredit`); `OSM_CREDIT`, `creditFor` e `optionLabel` ficam num módulo da camada aplicação testável em `npm test` (como o `src/lapMessages.ts`, aplicação pura), com DES-0007, DES-0006 (listas do teste de camada), `01-architecture.md` e `test-strategy.md` acompanhando.

### ISSUE-02

- severity: error
- check: D6 — entrada nova sem validação declarada
- file: pipeline/DES-0010-preparo-offline-do-arquivo-da-kart-park.md
- location: tabela "Comandos de `scripts/track-pipeline.ts`" (linhas 116-121); pipeline/DES-0011, tabela de comandos (linhas 70-76)
- finding: os argumentos `<trackId>`, `<trackVersion>` e `--esri-decision` de `scripts/track-pipeline.ts` entram no programa sem tipo, faixa nem limite de tamanho declarados, e `trackId` e `trackVersion` montam o caminho escrito `src/tracks/<trackId>-v<trackVersion>.json` e a chave do registro, enquanto a referência da decisão é gravada em `tracks/registry.json`.
- expected: cada argumento declara a sua validação (`trackId` igual a um `trackId` do catálogo com origem em `tracks/sources/`, `trackVersion` inteiro maior ou igual a 1, referência não vazia, de tamanho máximo declarado e sem caractere de controle), e qualquer outro valor é recusado com código de saída 1, sem escrever nada.

### ISSUE-03

- severity: error
- check: D8 — critério alcançado por artefato só de teste
- file: web/DES-0009-retorno-da-zebra-vibracao-e-som.md
- location: tabela de `src/audio.ts` (linhas 61-72) e "Determinismo" (linhas 112-113); test-strategy.md, linha de AC-US-0005-12 (114)
- finding: `ENGINE_SOUND` e `REWARD_SOUND` não são lidos por nenhum código de execução ("os descritores só os descrevem"), então a verificação de `npm test` que compara os três descritores por `source` alcança AC-US-0005-12 por um artefato que só o teste usa e passaria com sinais reais iguais; além disso, a afirmação de que `CURB_SOUND` aparece no texto de `src/audio.ts` só dentro de `curb()` contradiz a sua declaração no nível do módulo.
- expected: o motor, a recompensa e a zebra constroem o seu sinal a partir do próprio descritor (a comparação passa a observar o sinal real), ou o caminho de `npm test` de AC-US-0005-12 verifica o comportamento em si e a prova auditiva fica com E2E-04; a afirmação textual sobre `CURB_SOUND` é coerente com o lugar em que ele é declarado.

### ISSUE-04

- severity: warning
- check: D2 — corpo de implementação num item de projeto
- file: core/DES-0003-superficie-por-roda-zebra-e-barreira.md
- location: tabela "Mudanças dentro de `integrate` e `step`", linha `step, :310-316` (linha 58)
- finding: o item escreve instruções de código em vez de contrato, e a expressão de `barrierTouching` lê `nearestBarrier(next).distanceM`, que DES-0002 devolve `undefined` quando a geometria não tem barreira (o padrão neutro `barriers` vazio de API-0001), de modo que uma pista de esquema 3 sem barreira lançaria erro em `step`.
- expected: o item declara o contrato (`barrierTouching` verdadeiro quando um subpasso teve contato ou o centro termina a até `BARRIER_HALF_WIDTH_M + BARRIER_TOUCH_TOLERANCE_M` de um segmento de barreira, falso quando a geometria não declara barreira; `barrierContact` verdadeiro só no passo em que ele passa a verdadeiro) e deixa as instruções para a etapa de código.

### ISSUE-05

- severity: warning
- check: D9 — linha de divergência sem `arquivo:linha`
- file: 98-divergences.md
- location: linha "REQ-FEAT-0007-13, REQ-FEAT-0006-14" (linha 32)
- finding: a linha diz o que existe hoje ("não há registro de publicação de pista nem passo de promoção que o consulte") sem citar `arquivo:linha`, ao contrário das demais.
- expected: a linha cita o lugar da árvore em que a ausência se vê (por exemplo `package.json:6-13`, sem script de publicação nem de promoção; `index.html:19` e `:25`, sem crédito da Esri), como as outras linhas.

### ISSUE-06

- severity: scope
- check: D5 — I3 (contrato publicado do arquivo de pista: versão de esquema 2 para 3)
- file: core/DES-0001-leitura-do-dado-de-pista-em-esquema-3.md
- location: seção "Interface", linha `TRACK_SCHEMA_VERSION` (linha 34)
- finding: o projeto de `race-lap-validation` fixa `TRACK_SCHEMA_VERSION` em 2 e prova `schemaVersion` 3 como `UNSUPPORTED_SCHEMA` (DES-0006, linhas 37 e 84; test-strategy, linha 41; CHK-TEST-0009-02 e -03), o que este projeto, por REQ-FEAT-0002-02 e -16, torna falso.
- expected: decidido por `race-lap-validation` a partir de FB-01 (`300 Specs/330 D-Specs/Output/race-lap-validation/reports/feedbacks/pista-kart-park/feedback-20261022-1614.md`); não entra neste veredito.

## Divergences

### REQ-FEAT-0002-02, -16; API-0001
- estado: open
- hoje: `src/trackData.ts:5`, `:89`
- fecha: DES-0001, DM-0001, ADR-0001

### REQ-FEAT-0002-01, -03 a -11, -14, -17, -18; REQ-FEAT-0003-01 a -07; REQ-FEAT-0004-01 a -03; REQ-FEAT-0005-01 a -03; REQ-FEAT-0006-09
- estado: open
- hoje: `package.json:6-13`; sem `src/tracks/`, `tracks/` nem preparo em `scripts/`
- fecha: DES-0010, DES-0011, DM-0001, DM-0002, ADR-0002, ADR-0006

### REQ-FEAT-0001-01 a -12, -14; API-0002
- estado: open
- hoje: `index.html:19`; `src/main.ts:152`, `:155`, `:208-218`
- fecha: DES-0005, DES-0007

### REQ-FEAT-0002-12, REQ-FEAT-0005-05, -08, -09; API-0003
- estado: open
- hoje: `src/physics.ts:9`, `:143`, `:162`, `:215`, `:229-230`, `:252`, `:300-302`, `:318`, `:321-336`
- fecha: DES-0002, DES-0003, ADR-0004

### REQ-FEAT-0004-04 a -07
- estado: open
- hoje: `src/physics.ts:276-290`
- fecha: DES-0003, ADR-0003

### REQ-FEAT-0003-10, -11, REQ-FEAT-0005-06, -07
- estado: open
- hoje: `src/lap.ts:218-220`, `:245-252`
- fecha: DES-0004, DES-0002

### REQ-FEAT-0002-12 (reposicionamento), REQ-FEAT-0001-08
- estado: open
- hoje: `src/lap.ts:154-161`, `:109-112`
- fecha: DES-0004

### REQ-FEAT-0003-08, -12, -13, -14, -15
- estado: open
- hoje: `src/lap.ts:223-252`
- fecha: DES-0004, DES-0005, DES-0010

### REQ-FEAT-0002-13, REQ-FEAT-0004-08, REQ-FEAT-0005-04; REQ-FEAT-0007-01, -02
- estado: open
- hoje: `src/main.ts:44-110`, `:289-297`
- fecha: DES-0008

### REQ-FEAT-0005-10 a -19
- estado: open
- hoje: `src/audio.ts:1-43`
- fecha: DES-0009

### REQ-FEAT-0006-01 a -08, -10 a -13
- estado: open
- hoje: `index.html:17`, `:19`, `:25`
- fecha: DES-0005, DES-0007, DES-0012

### REQ-FEAT-0007-03, -04, -06, -07
- estado: open
- hoje: `tests/race-lap-validation-layering.test.ts:9-10`
- fecha: DES-0006, test-strategy.md

### REQ-FEAT-0007-13, REQ-FEAT-0006-14
- estado: open
- hoje: sem `arquivo:linha` (ISSUE-05)
- fecha: DES-0011, DES-0012, ADR-0005

## Coverage

- requisitos cobertos: 101 de 101 (REQ-FEAT-0001-01 a REQ-FEAT-0007-13)
- requisitos sem cobertura: nenhum
- itens de projeto sem fonte: nenhum
- critérios sem caminho de teste alcançável: nenhum (53 de 53); o caminho de `npm test` de AC-US-0005-12 passa por artefato só de teste (ISSUE-03), o de E2E-04 é válido
