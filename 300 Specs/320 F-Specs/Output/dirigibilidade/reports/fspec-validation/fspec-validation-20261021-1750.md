---
stage: fspec
feature: dirigibilidade
verdict: SUCCESS
generated: 2026-10-21T17:50:05Z
counts: {blocker: 0, error: 0, warning: 3, info: 0, divergence: 0}
seed: {revision: 2, digest: 5407fe2ffc33}
upstream: {stage: req, version: 2.0.0}
feedbacks: []
population: "revalidação após fspec-validation-20261021-1656: ISSUE-01 (97-changelog.md, aviso) do relatório anterior; arquivos com version movida: 01-overview.md 2.0.0, 02-glossary.md 2.0.0, 97-changelog.md 2.0.0, features/FEAT-0001 a FEAT-0005 2.0.0, flows/FLOW-0002 2.0.0, api/API-0003 2.0.0, rules/RULE-0001 2.0.0, rules/RULE-0002 2.0.0, rules/RULE-0003 1.1.0; dois arquivos intocados sorteados: screens/SCR-0002, flows/FLOW-0001; grep sobre todo o conjunto (fora de reports/) de valores da revisão 1 (45 km/h, 27 s, 95 km/h, 3,0 s, 300 ms, bench:physics), de OPEN-/TBD, de caminhos de módulo e de 'km/h' em flows/ e api/"
---

# Relatório de validação — dirigibilidade

## Issues

### ISSUE-01

- severidade: warning
- verificação: F3 — consistência entre arquivos (o mesmo conceito nomeado de duas formas: unidade de medição dos ensaios)
- arquivo: `flows/FLOW-0002-ensaio-deterministico-e-piloto-de-teste.md`
- localização: linha 45, passo 5 da tabela Passos
- achado: o passo diz que o ensaio mede "velocidades em km/h"; o contrato que o passo 6 emite (`API-0003`, cabeçalho e campos `entrySpeedMps`, `v0Mps`, `v1Mps`, `topSpeedMps`, `speedAfterOneSMps`, `speedBeforeContactMps`/`speedAfterContactMps`) e a nota de conversão de `RULE-0002` (após a tabela de limiares) fixam m/s como unidade medida e km/h só como apresentação na saída serializada e em `docs/physics.md`.
- esperado: "velocidades em m/s (apresentadas também em km/h)" ou remissão à unidade de `API-0003`, sem nomear km/h como unidade de medição.

### ISSUE-02

- severidade: warning
- verificação: F3 — consistência entre arquivos (o mesmo conceito nomeado de duas formas: unidade reportada pelos ensaios)
- arquivo: `api/API-0001-telemetria-de-dirigibilidade.md`
- localização: linha 43, linha `speedMps`, coluna Padrão e restrições
- achado: a linha afirma "os ensaios reportam em km/h (API-0003)"; `API-0003` 2.0.0 reporta velocidades em m/s com apresentação em km/h. Arquivo fora da população sorteada, encontrado pelo grep de 'km/h' sobre `api/` e `flows/` que o relatório anterior também executou; mesma inconsistência de ISSUE-01.
- esperado: "os ensaios reportam em m/s, apresentados também em km/h ([API-0003](API-0003-saida-dos-ensaios.md))".

### ISSUE-03

- severidade: warning
- verificação: F8 — vazamento de projeto (módulo, caminho ou pasta de código nomeados fora de citação das Restrições do seed)
- arquivo: `97-changelog.md`
- localização: linhas 216–217, entrada "rodada 5, Mode A", Itens recusados
- achado: a entrada reproduz os caminhos `src/physics.ts` e `scripts/` ao registrar a decisão do autor recusada, citando "decisão do autor" e não as Restrições do seed (`scripts/` não consta delas). A citação removida da rodada 3 (ISSUE-01 de `fspec-validation-20261021-1656`, fechada) reaparece na rodada 5. Nenhum arquivo de especificação fora do changelog carrega caminho de código (grep do conjunto fora de `reports/`: nenhuma ocorrência).
- esperado: a linha refere "a decisão do autor sobre o layout do repositório" sem reproduzir os caminhos.

## Divergences

Nenhuma. `98-divergences.md` está bem formado e vazio.

## Coverage

- ISSUE-01 anterior (`97-changelog.md`, rodada 3): fechado; a entrada da rodada 3 não reproduz mais os caminhos (ver ISSUE-03 deste relatório para a reincidência na rodada 5).
- F1 nos arquivos movidos: `stage: fspec`, `feature:` e `id` coerentes; links relativos de `01-overview.md`, `FEAT-0001` a `FEAT-0005`, `RULE-0001` a `RULE-0003`, `FLOW-0002` e `API-0003` resolvem; blocos mermaid de `FLOW-0002` (sequenceDiagram) e `RULE-0003` (stateDiagram-v2) sem mudança de forma em relação ao conjunto validado anterior.
- F2 nos arquivos movidos: todo `REQ-FEAT-000{1..5}-nn` usa um único modal (SHALL ou SHALL NOT) e cita `AC-*`, `NFR-*` ou `[DOMAIN]` com o item dos requisitos (caso anormal nomeado ou invariante); cada SHALL coberto por critério de aceite do próprio arquivo que o nomeia.
- F3: valores da revisão 2 (180/250 ms; 50 km/h e 13,89 m/s; 2,5 s e 2 500 ms; 105 km/h e 105/3,6 m/s; 25 s e 25 000 ms) idênticos em `01-overview.md`, `02-glossary.md`, `FEAT-0001` a `FEAT-0005`, `FLOW-0002`, `API-0003`, `RULE-0001` e `RULE-0002`; nenhum valor da revisão 1 restante no conjunto (grep). `PUBLISHED`/`SUPERSEDED` (FEAT-0005) definidos em `RULE-0003`; `comparability`, `replayStatus`, `setupVersionSource` definidos em `RULE-0003`/`API-0002`; `benchId`, `failReason`, `inputMode`, `throttleCondition` coerentes entre `API-0003`, `RULE-0002`, `FEAT-0001` a `FEAT-0005` e o glossário; termos "Acerto agressivo", "Staging", "Condição de forçar", "Curva de referência" do glossário usados sem segundo nome. Configuração: nenhum ajuste referenciado em comportamento que não conste da seção Configuração ("Nenhuma" em todos).
- F4: critérios `AC-US-*` dos requisitos 2.0.0: 31; cobertos 31 de 31 (lista construída dos cinco US e comparada com os `sources:` e os critérios de aceite de `features/`); NFR 9 de 9 realizados (NFR-0001 e NFR-0009 em `FEAT-0005`; NFR-0002 a NFR-0008 em `FEAT-0006`, intocado); requisitos sem fonte: nenhum; contratos sem consumidor: nenhum (API-0001 por SCR-0001/FLOW-0001; API-0002 por SCR-0002/FLOW-0003; API-0003 por FLOW-0002 e FEAT-0001 a FEAT-0006); lista Fora do escopo de `01-overview.md` idêntica à de `01-context.md` dos requisitos; `99-traceability.md` gerado pelo gate.
- F5 em `API-0003` 2.0.0: nomes planos com unidade no sufixo (D-FS-06), obrigatoriedade e padrão por campo, Auth com motivo de ausência de papel, superfície de erro completa (cinco `failReason`), idempotência por leitura pura, compatibilidade sem renomear campo publicado; nenhuma configuração para forçar evento, injetar estado ou habilitar depuração (seções Configuração de `FEAT-0001` a `FEAT-0005`).
- F6 em `SCR-0002` (sorteado): estados Carregando, Vazio, Populado, Erro, Offline e Permissão negada nos dois canais, chamadas `readReplay`, `getSetupVersion`, `compareLapRecords` resolvidas em `API-0002`; `FEAT-0004` requisito 06 explícito nos dois canais com `SCR-0001`.
- F7 em `RULE-0001`, `RULE-0002`, `RULE-0003`: cada limiar cita `DOMAIN/DEC-nn` ou `SEED/*` via `AC-*`; idempotência e ordem por `simStepCount` declaradas; `RULE-0003` declara transição idempotente e ausência de contador com a ordem dada por `previousSetupVersion`; `FLOW-0001` (sorteado) e `FLOW-0002` declaram que não recebem evento externo (D-FS-03); nenhuma decisão de domínio colocada na apresentação ou no adaptador (D-FS-05).
- F8: nenhum segredo, credencial ou dado real (D-FS-07); nenhuma mudança de forma de dado (campos `setupId`/`setupVersion` de `API-0002` aditivos e opcionais na leitura, intocados nesta rodada); nenhum refactor, rename ou remoção pedido fora dos requisitos (I10); caminhos de código só no changelog (ISSUE-03).
- F9: nenhum `OPEN-` nem `TBD` no conjunto; `98-divergences.md` bem formado, sem linhas.
- Carimbo: `status: validated` gravado no front matter dos 14 arquivos que liam `draft` (`00-index.md`, `01-overview.md`, `02-glossary.md`, `97-changelog.md`, `FEAT-0001` a `FEAT-0005`, `FLOW-0002`, `API-0003`, `RULE-0001` a `RULE-0003`); nenhum front matter do conjunto lê `draft`.

## Contexto recebido fora do procedimento

- `97-changelog.md` (rodadas 1 e 5) registra os motivos das escolhas de forma do gerador e "as decisões que o autor passou a esta rodada"; essa justificativa não entrou no julgamento. Os valores da revisão 2 foram conferidos contra os requisitos validados 2.0.0 (US-0001 a US-0005, `01-context.md`), não contra o changelog.
