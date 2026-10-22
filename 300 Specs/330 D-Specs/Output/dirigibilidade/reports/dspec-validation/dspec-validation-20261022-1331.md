---
stage: dspec
feature: dirigibilidade
verdict: FAIL
generated: 2026-10-22T13:31:32Z
counts: {blocker: 0, error: 2, warning: 2, info: 2, divergence: 17}
seed: {revision: 3, digest: 7dd24c8b6cab}
upstream: {stage: fspec, version: 3.0.0, status: validated, index-generated: 2026-10-21T18:58:17Z}
feedbacks: []
population: "revalidação após dspec-validation-20261021-1805 (SUCCESS, seed revisão 2): ISSUE-01 e ISSUE-02 daquele relatório reverificados primeiro; arquivos com version movida: 01-architecture.md 2.1.0, 97-changelog.md 2.1.0, 98-divergences.md 2.1.0, adr/ADR-0002 1.0.1, adr/ADR-0003 1.2.0, adr/ADR-0004 2.1.0, adr/ADR-0005 1.1.0 (novo), core/DES-0001 3.1.0, core/DES-0002 1.1.0, core/DES-0003 1.1.1, core/DES-0004 3.1.0, data/DM-0001 1.2.0, security/DES-0008 1.0.2, web/DES-0007 1.0.2, test-strategy.md 3.1.0; dois arquivos intocados sorteados (random.sample): adr/ADR-0001, web/DES-0006; toda citação arquivo:linha dos arquivos da população conferida contra a árvore numa passada (src/physics.ts, src/track.ts, src/lap.ts, src/lapTiming.ts, src/setupRecords.ts, src/main.ts, scripts/handlingBench.ts, scripts/keyboard-lap.ts, scripts/physics-bench.ts, tests/physics.test.ts, tests/maneuvers.test.ts, tests/race-lap-validation-frozen.test.ts, docs/physics.md); geometria da pista sintética recalculada por script (raios discretos mínimos, trecho 81-102, lado de fora no índice 83, 368,5 m); API-0001 e API-0003 campo a campo; todo link relativo do conjunto por script; grep de OPEN-/TBD e de segredos"
context-ignored: "nenhuma justificativa do gerador chegou a este passo; 97-changelog.md e as seções Contexto/Alternativas dos ADR foram lidos só como conteúdo do artefato, não como justificativa; reports/feedback/feedback-20261021-1827.md lido como relatório da própria feature"
---

# Relatório de validação — dirigibilidade (D-Spec)

## Summary

- ISSUE-01 e ISSUE-02 do relatório anterior (info) reverificados: sem mudança, reportados como ISSUE-05 e ISSUE-06.
- Dois erros novos de contrato (D3) em `DES-0004`/`ADR-0004`; dois avisos (D1, D8).

## Issues

### ISSUE-01

- severidade: error
- verificação: D3 — contrato do F-Spec servido campo a campo (API-0003: veredito de saída da faixa e `maxUndersteerMsBySpeed` de `UNDERSTEER_ONSET`)
- arquivo: `adr/ADR-0004-ensaios-como-biblioteca-e-parametros-de-ensaio.md`; `core/DES-0004-ensaios-de-dirigibilidade-e-saida.md`; `test-strategy.md`
- localização: `ADR-0004` linhas 81–89 (decisão 8); `DES-0004` linha 139 (`UNDERSTEER_ONSET`) e linha 218 (tabela de falha); `test-strategy.md` linha 93
- achado: o projeto encerra a varredura de `UNDERSTEER_ONSET` sem falha quando o kart sai da faixa numa execução acima de 50 km/h depois de V1 determinado, e tira essa execução de `maxUndersteerMsBySpeed`; API-0003 (linha 119) dá `FAIL` `OFF_ASPHALT` para saída do asfalto em `UNDERSTEER_ONSET`, FLOW-0002 (linha 63) dá `FAIL` `OFF_ASPHALT` para a saída da faixa do arco em `UNDERSTEER_ONSET`, e API-0003 (linha 78) define `maxUndersteerMsBySpeed` para as velocidades acima de V1; com a saída na primeira execução após V1 a lista fica vazia e "não diminui" (REQ-FEAT-0002-05) é aprovado sem medida.
- esperado: o veredito de `UNDERSTEER_ONSET` para saída da faixa coincide com API-0003 e FLOW-0002 (`FAIL` `OFF_ASPHALT`), com um fim de varredura que não dependa do acerto; ou o F-Spec passa a admitir no seu contrato o fim da varredura pela saída da faixa depois de V1 — decisão do dono do F-Spec, não deste estágio.

### ISSUE-02

- severidade: error
- verificação: D3 — contrato do F-Spec servido campo a campo (API-0003: `TEST_PILOT_LAP.sectorMs`)
- arquivo: `core/DES-0004-ensaios-de-dirigibilidade-e-saida.md`
- localização: linha 148 (`TEST_PILOT_LAP`, coluna Medição)
- achado: `sectorMs` = "os quatro setores (ou os concluídos)": numa volta `INVALID` ou não encerrada o registro sai com menos de 4 elementos; API-0003 (linha 97) fixa `sectorMs` como "lista de 4 inteiros", obrigatório, sem forma condicional.
- esperado: `DES-0004` fixa `sectorMs` com 4 inteiros também na volta inválida ou não encerrada (por exemplo, setor não concluído com o mesmo teto de janela que `lapTimeMs` usa), e o caminho de contrato de `test-strategy.md` afirma o comprimento 4.

### ISSUE-03

- severidade: warning
- verificação: D1 — todo bloco mermaid analisa
- arquivo: `01-architecture.md`
- localização: linha 141 (primeiro bloco `sequenceDiagram`, mensagem `M-->>J`)
- achado: o texto da mensagem contém `;`, que o analisador de `sequenceDiagram` do Mermaid trata como separador de instrução; o trecho depois do primeiro `;` vira instrução sem seta e o bloco não analisa.
- esperado: `;` trocado por `,` (ou pelo código `#59;`) nessa linha.

### ISSUE-04

- severidade: warning
- verificação: D8 — caminho declarado pelo qual o teste chega ao critério
- arquivo: `test-strategy.md`; `web/DES-0006-resultado-melhor-tempo-e-texto-compartilhado.md`
- localização: `test-strategy.md` linha 75 (E2E-02); `DES-0006` linhas 51–52
- achado: E2E-02, caminho de tela de AC-US-0005-05, espera "voltar ao Arcade: o melhor tempo do Arcade reaparece", mas `DES-0006:52` mantém `src/main.ts:226`/`:233` zerando `bestRecord` na troca de acerto, logo ao voltar ao Arcade a tela mostra `—`: o passo do roteiro não é alcançável pelo projeto. O critério continua alcançado pelo caminho unitário (`compareLapRecords`, `formatSharedText`).
- esperado: um único comportamento nos dois arquivos: ou `DES-0006` deixa de zerar `bestRecord` na troca de acerto (a exibição já decide por `compareLapRecords`, `DES-0006:51`), ou E2E-02 espera `—` ao voltar ao Arcade.

### ISSUE-05

- severidade: info
- verificação: D5 — I4 (chave mestra desligada por padrão)
- arquivo: `adr/ADR-0001-versao-do-acerto-como-registro-novo-no-codigo.md`; `core/DES-0001-acerto-arcade-assistido-v5-e-assistencias.md`
- localização: `ADR-0001` linhas 33–36 e 44–45; `DES-0001` linhas 208–216
- achado: reverificação da ISSUE-01 anterior: sem chave mestra porque FEAT-0005 (Configuração, 3.0.0) proíbe configuração para escolher entre o acerto antigo e o novo; o padrão sem mudança de I4 está nos campos opcionais ausentes em `RENTAL_KART`/`ARCADE_KART`, inclusive o novo `forcingRampMps` (ausente = degrau as-built), com `REALISTA_UNCHANGED` como prova.
- esperado: nada a mudar.

### ISSUE-06

- severidade: info
- verificação: D3 — cobertura do F-Spec nos dois sentidos
- arquivo: `web/DES-0006-resultado-melhor-tempo-e-texto-compartilhado.md`; `adr/ADR-0002-formato-do-replay-e-registro-de-volta-em-memoria.md`
- localização: `DES-0006` linhas 56–62; `ADR-0002` linhas 50–52
- achado: reverificação da ISSUE-02 anterior (arquivo sorteado; SCR-0002 1.0.0 inalterado): "abrir um tempo ou replay gravado" e "reproduzir um replay" sem tela porque nenhuma feature persiste registros; a redução é declarada e `readReplay`/`replayLap` ficam disponíveis. Nenhum `REQ-*` afetado.
- esperado: nada a mudar nesta rodada; a feature que persistir registros cobre esse ponto de entrada.

## Divergences

`98-divergences.md` (2.1.0): 17 linhas, todas com `REQ-*`, exigência, estado atual em `arquivo:linha` (conferido: `scripts/handlingBench.ts:47, 50-78, 139-172, 211-248, 263-306, 317-361, 365-394, 413-443, 473-483, 506-522, 596-635`; `src/physics.ts:73, 76, 79, 81, 163, 186, 252, 281-286, 298, 313, 327-336`; `src/main.ts:2, 154, 159, 226, 229-239, 396, 458, 473-476`; `scripts/keyboard-lap.ts:1-47`; `scripts/physics-bench.ts:1-38`; `docs/physics.md:116-178`; `tests/race-lap-validation-frozen.test.ts:44-47`), etapa devedora `código`, item de projeto que fecha e estado `open`. Nenhuma linha sem item de projeto; nenhuma `waived-pending`.

## Coverage

- D1: arquivos exigidos presentes; todo link relativo do conjunto resolve (script, 20 arquivos); segundo bloco mermaid de `01-architecture.md` sem caractere especial; primeiro bloco: ISSUE-03. Índice, ids, front matter, rastreabilidade: do gate, não rejulgados.
- D2: 8 itens de projeto com `REQ-*`, caminho, camada, interface, colaboradores, falha e feature flag (ou motivo). Existentes conferidos: `src/physics.ts`, `src/setupRecords.ts`, `scripts/handlingBench.ts` (689 linhas), `src/lap.ts`, `src/lapTiming.ts`, `src/track.ts`, `src/trackData.ts`, `src/main.ts`, `src/lapMessages.ts`, `index.html`, `scripts/keyboard-lap.ts`, `scripts/physics-bench.ts`, `docs/physics.md`, `tests/physics.test.ts`, `tests/maneuvers.test.ts`, `tests/fixtures/trackFiles.ts`, `tests/race-lap-validation-*.test.ts`; declarados novos e ausentes: `src/handlingMessages.ts`, `tests/dirigibilidade-*.test.ts`, `tests/fixtures/records.ts`, `docs/handling-device-log.md`; símbolos novos declarados novos: `testPadLane`, `testPadArc`, `classifyHandlingSteps`, `RECOVERY_MAX_STEPS`, `StepClass`, `forcingRampMps`, `arcEntry`, `grassEntry`. Unidades em toda entrada e saída numérica das interfaces novas.
- D3: requisitos cobertos 61 de 61 (REQ-FEAT-0001-01..09, 0002-01..09, 0003-01..12, 0004-01..10, 0005-01..12, 0006-01..09); NFR 9 de 9 com mecanismo; API-0001 ↔ `DES-0002` campo a campo (11 campos, `NO_STATE`, `surface` inicial `ASPHALT`); API-0002 ↔ `DES-0003` inalterado; API-0003 ↔ `DES-0004` campo a campo salvo ISSUE-01 e ISSUE-02; itens sem fonte: nenhum.
- D4: `DM-0001` 1.2.0: quatro dados versionados, unidades no nome (inclusive `forcingRampMps` e os parâmetros de ensaio novos), M1–M3 com reversão, sem backfill, janela de compatibilidade e retenção/privacidade por dado; `parameters` e `benchEnvironment` na linha de base.
- D5: contexto primário pista e desafio (I1); pista de teste e classificador em `src/physics.ts` (Simulação), chamados só pela biblioteca de ensaios; sentido `scripts/keyboard-lap.ts`/`scripts/physics-bench.ts` (Aplicação) → `scripts/handlingBench.ts` (Simulação) → `src/physics.ts`/`src/lap.ts`/`src/setupRecords.ts`; nenhuma regra de pilotagem fora de `src/physics.ts`; I3 sem campo redefinido; I4 com `forcingRampMps` ausente = sem mudança; I10 com motivo para os acréscimos (ADR-0005); D-DS-01 a D-DS-07 atendidos.
- D6: sem sessão e sem papel, com motivo (RNF10); sem webhook; nenhum segredo (grep); logs só com códigos; `readReplay` com tipo, forma, faixa e tamanho; `oldRecords` pelos mesmos leitores; `readBaseline` em `try`.
- D7: nenhuma escrita de domínio; idempotência de `classifyHandlingSteps` e do acelerador regulado declarada; falha declarada por item; métrica por NFR e por limiar nomeada.
- D8: 6 de 6 `FEAT-*` com nível; 31 de 31 `AC-*` com caminho (fixtures, estados por operação pública, biblioteca de ensaios, roteiro registrado); nenhum gancho só de teste; regras de domínio em unitário/integração. Exceção: ISSUE-04 (passo de tela de AC-US-0005-05).
- D9: nenhum `OPEN-<nn>` nem `TBD` (grep); divergências 17, todas fechadas por item de projeto.
- Feedbacks enviados: nenhum (nenhum achado pertence a outra feature).
