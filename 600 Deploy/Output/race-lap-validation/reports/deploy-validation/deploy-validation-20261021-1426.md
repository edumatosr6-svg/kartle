---
stage: deploy
feature: race-lap-validation
verdict: FAIL
generated: 2026-10-21T14:26:36Z
environment: none declared (OPEN-03)
commit: none (repositório com zero commits)
counts: {blocker: 1, error: 5, warning: 2, info: 2, divergence: 0}
seed: {revision: 2, digest: ee91c5706be1}
upstream: {stage: test, version: n/a}
feedbacks: []
---

# Relatório de validação de deploy — race-lap-validation

## Evidence

| Prova | Resultado |
|---|---|
| Construído pelo pipeline a partir de commit verificado | **não** — `git rev-list --all --count` = 0; sem CI (OPEN-04); artefato construído localmente nesta execução (`npm run build`, saída 0) |
| Artefato fresco | sim — `dist/index.html` gravado em 2026-10-21 14:27Z; última edição de `src/`/`tests/` em 14:03Z |
| Veredito de testes mais novo | SUCCESS — `test-validation-20261021-1411.md`, 170/170, `fresh: true` |
| Segredos no registro de release, em `dist/` e neste relatório | nenhum — grep por padrões de chave, token, senha, bloco PEM e JWT: 0 ocorrências nos 11 arquivos do registro e nos 3 arquivos de `dist/` |
| Variáveis que o cliente lê vs `REL-0001` | 0 = 0 — `import.meta.env`/`process.env`: 0 ocorrências em `src/` e `index.html`; `localStorage`/`sessionStorage`/`indexedDB`/`fetch`/`XMLHttpRequest`/`WebSocket`/`sendBeacon`: 0 ocorrências |
| Tamanho do artefato (RNF02, limite 3 145 728 bytes) | `measure_dist.py dist`: 3 arquivos, 593 256 bytes brutos (ratio 0,189), 152 903 gzip, `within_limit=True`, saída 0 — igual ao número de `01-release.md`, `REL-0003` e `runbook.md` |
| Nomes dos *assets* | `assets/index-Cqfgl3da.js`, `assets/index-dgojskay.css` — iguais aos citados no registro |
| Instalação em staging | **não executada** — staging não existe (OPEN-03, D23) |
| Cabeças de migração | não se aplica — sem banco (diretiva "Migration step"; DM-0001, DM-0002); única revisão: arquivo de pista `schemaVersion` 2 empacotado |
| Upgrade em cópia restaurada / backfill | não se aplica — nenhum dado armazenado; leitor da v1 provado por `CHK-TEST-0009-01/-03` no veredito de testes |
| Downgrade executado | **não** — a reversão é republicar o `dist/` anterior em staging/produção; sem provedor nem staging, não ensaiada |
| Smoke — web-desktop / web-mobile | **não executado / não executado** — 14 + 12 linhas em `smoke.md`, todas com limiar nomeado; `docs/lap-validation-device-log.md` não existe |
| NFR observados em staging | nenhum — RNF01, NFR-0003 (60/30 fps), NFR-0008, NFR-0006 (48 px, 16 px, 4,5:1) só mensuráveis em URL servida e aparelho nomeado |
| Cliente móvel não atualizado contra backend novo | não se aplica — sem backend, sem app nativo; `web-mobile` é a mesma página (`REL-0004`) |
| Elementos observáveis citados pelo smoke existem | sim — `#track-status`, `#lap-state`, `#lap-result`, `#lap-offer` em `index.html`; `isSecureContext` e "Inclinação indisponível" em `src/main.ts:268`; `E2E-01..E2E-11` em `test-strategy.md`; `reference.inputs` em `TEST-0008` |
| Crédito OSM / aviso ODbL no build (D-DP-04) | 0 ocorrências de "OpenStreetMap"/"ODbL" em `dist/`, `src/` e `index.html`; nenhum dado OSM no bundle (pista sintética) — decisão humana pendente (DIV-DP-05) |
| Feature flag | nenhuma, por projeto validado (DES-0007, DES-0011); a feature fica ativa ao servir o `index.html` novo |
| Versão do Node do build | v24.20.0 / npm 11.19.0; sem `.nvmrc`, `.node-version` ou `engines` |
| Logs capturados nesta execução | nenhum — nenhum serviço iniciado; verificação I6 sobre logs sem objeto |

## Issues

### ISSUE-01
- severity: blocker
- check: P1
- class: ambiental
- file: `600 Deploy/Output/race-lap-validation/01-release.md`
- location: seção *Proveniência*; `runbook.md` precondição 1
- finding: o candidato não foi construído pelo pipeline a partir do commit que os testes verificaram — o repositório tem zero commits, não há CI (OPEN-04) e o único `dist/` existente foi construído localmente (por esta execução e pelo gerador); a proveniência não pode ser afirmada nem auditada.
- expected: o dono do produto faz o commit da árvore verificada, roda `npm ci`, `npm test` (170 aprovados) e `npm run build` nesse commit e registra o hash em um relatório de testes; o artefato que chega a staging é produzido a partir desse hash (por CI quando existir, ou com o hash registrado no runbook).

### ISSUE-02
- severity: error
- check: P3
- class: ambiental
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: *Promote* passos 7 e 10 (**[provedor]**)
- finding: a instalação não pôde ser executada — nenhum ambiente de staging está declarado (`600 Deploy/Input/domain-directives.md`, OPEN-03, D23); o bundle servido, o HTTPS e a igualdade byte a byte do `index.html` não foram observados.
- expected: decisão D23 com um site de staging em HTTPS; `dist/` publicado nele e o `index.html` servido igual ao local (nome do JS `index-<hash>.js` conferido).

### ISSUE-03
- severity: error
- check: P5
- class: ambiental
- file: `600 Deploy/Output/race-lap-validation/smoke.md`
- location: D1–D14 (`web-desktop`), M1–M12 (`web-mobile`)
- finding: nenhuma das 26 verificações de fumaça foi executada — não há URL de staging nem aparelho nomeado; os limiares RNF01 (10 s em 4G), RNF06 (0 recursos inseguros), NFR-0003 (60/30 fps), NFR-0006 (48 px, 16 px, 4,5:1), NFR-0004 (0 requisições), NFR-0007 e NFR-0008 (0 ms entre navegadores) não têm valor observado; `docs/lap-validation-device-log.md` não existe.
- expected: as 26 linhas executadas na URL de staging, por canal, com o valor medido registrado em `docs/lap-validation-device-log.md` (aparelho, navegador, versão, medida), e cada valor dentro do limiar que a linha nomeia.

### ISSUE-04
- severity: error
- check: P6
- class: ambiental
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: *Promote* 6, 7, 10, 11; *Roll back* R1, R2
- finding: a reversão não foi demonstrada em staging e os passos de publicação, purga de cache e reversão estão como ação e resultado observável, não como comando (D-DP-02 exige "stated as commands"), porque o provedor não foi escolhido (D23; DIV-DP-04); o mesmo vale para o downgrade de P4 (republicar o `dist/` anterior), que não pôde ser executado.
- expected: com D23 decidido, os passos 6, 7, 10, 11, R1 e R2 preenchidos com o comando do provedor; R1 e R2 executados em staging com o `dist/` anterior voltando a servir e *Verify* 1, 2 e 4 passando na versão restaurada.

### ISSUE-05
- severity: error
- check: P6
- class: defeito do registro
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: *Promote* passo 6; *Roll back* R1; `REL-0002` coluna *Reversão*; DM-0001 *Plano de migração*
- finding: o caminho de reversão pressupõe um `dist/` já publicado em produção (`kartle-dist-<hash-anterior>.zip`), mas esta é a primeira release e não existe artefato anterior nem commit anterior — R1 não tem o que publicar; DM-0001 define a reversão como `git revert` do commit de integração seguido de `npm test`, `npm run build` e republicação, e o runbook não reconcilia os dois caminhos nem diz o que R1 faz quando o passo 6 não encontra artefato.
- expected: o runbook declara o alvo de reversão da primeira release (o `dist/` construído a partir da árvore anterior à feature, identificada por commit, ou a indisponibilidade explícita do site) e nomeia em R1 qual dos dois caminhos — republicar artefato guardado ou reconstruir da árvore revertida (DM-0001) — se aplica em cada caso.

### ISSUE-06
- severity: error
- check: P6
- class: defeito do registro
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: tabela *Promote* (passos 1–5, 7, 8); passo 9 e R5 coluna *Leva*
- finding: a tabela *Promote* não tem coluna de desfazer — só os passos 10 e 11 têm desfazer nomeado (R1, R2) e o passo 7 apenas por frase solta no fim de *Roll back*; os passos 1–5 e 8 não dizem que nada há a desfazer; o passo 9 e o R5 têm duração "—".
- expected: cada passo de *Promote* com o seu desfazer na própria tabela ("nada a desfazer: comando local sem efeito externo" onde for o caso; "R1 e R2 sobre staging" no passo 7) e uma duração ou limite de espera declarado para 9 e R5.

### ISSUE-07
- severity: warning
- check: P5
- class: defeito do registro (pendente de decisão humana)
- file: `600 Deploy/Output/race-lap-validation/smoke.md`
- location: D14, M12
- finding: as linhas D14/M12 não têm critério de aprovação decidível — o resultado é "não aplicável se o dono do produto assim decidir; caso contrário, falha"; verificado que `dist/` tem 0 ocorrências de OpenStreetMap/ODbL e nenhum dado OSM, logo pela precedência I6 (crédito só com dado OSM) a diretiva D-DP-04 tende a não se aplicar, mas a decisão não está registrada (DIV-DP-05).
- expected: decisão do dono do produto registrada (D-DP-04 não aplicável enquanto nenhuma pista OSM for publicada, ou crédito acrescentado por mudança de código), e D14/M12 reescritas com um único resultado esperado.

### ISSUE-08
- severity: warning
- check: P7
- class: ambiental
- file: `600 Deploy/Output/race-lap-validation/REL-0005-observability.md`
- location: seção *Qual alerta soaria*
- finding: nenhuma métrica ou alerta mostraria RNF01, NFR-0003 ou a disponibilidade sendo violados em produção fora da reverificação manual do runbook (ao promover e 24 h depois); não há monitor nem retenção de registros de acesso porque não há provedor (DIV-DP-08).
- expected: com D23, um monitor de disponibilidade HTTPS sobre a URL de produção e a retenção dos registros de acesso do provedor, nomeados em `REL-0005`, sem dado pessoal.

### ISSUE-09
- severity: info
- check: P8
- file: `600 Deploy/Output/race-lap-validation/REL-0003-rollout.md`
- location: seção *Feature flag e quem "liga" a feature*
- finding: não há feature flag, por decisão do projeto validado (DES-0007, DES-0011); a feature fica ativa para 100 % dos jogadores ao servir o `index.html` novo e a reversão é a republicação do artefato anterior; a ordem de `REL-0003` não pôde ser comparada com um ensaio em staging.
- expected: nenhuma ação neste estágio; a ordem de `REL-0003` é confrontada com o que for feito em staging quando existir.

### ISSUE-10
- severity: info
- check: P1
- file: `600 Deploy/Output/race-lap-validation/REL-0001-config.md`
- location: tabela *O que o passo de hospedagem precisará*, linha *Versão do Node*
- finding: o build não é reproduzível por versão fixada — sem `.nvmrc`, `.node-version` ou `engines`; esta execução usou Node v24.20.0 / npm 11.19.0, os mesmos do registro (DIV-DP-09).
- expected: `.nvmrc` ou campo `engines` no repositório (fora deste estágio) antes de o pipeline existir.

## Promotion question

Não há pergunta de promoção: o veredito é FAIL e nenhuma promoção é proposta (D-DP-06). O que um humano deve fazer, em ordem:

1. Fazer o commit da árvore verificada; nesse commit rodar `npm ci`, `npm test` e `npm run build` e registrar o hash com os totais (ISSUE-01).
2. Decidir D23 (provedor, staging e produção em HTTPS); preencher os passos **[provedor]** do `runbook.md` com comandos (ISSUE-02, ISSUE-04).
3. Corrigir o registro: alvo de reversão da primeira release e reconciliação com DM-0001 (ISSUE-05); coluna de desfazer e durações no *Promote* (ISSUE-06); decisão sobre D-DP-04 e reescrita de D14/M12 (ISSUE-07).
4. Publicar em staging, executar as 26 linhas de `smoke.md` nos aparelhos nomeados e registrar `docs/lap-validation-device-log.md` (ISSUE-03); ensaiar R1/R2 em staging (ISSUE-04).
5. Reexecutar esta validação; só então a pergunta de promoção é aberta ao dono do produto, com `600 Deploy/Output/race-lap-validation/runbook.md` e o ponto sem retorno nele nomeado.
