---
stage: deploy
feature: race-lap-validation
verdict: FAIL
generated: 2026-10-21T14:35:38Z
environment: none declared (OPEN-03)
commit: none (repositório com zero commits)
counts: {blocker: 1, error: 3, warning: 1, info: 3, divergence: 0}
seed: {revision: 2, digest: ee91c5706be1}
upstream: {stage: test, version: n/a}
previous: deploy-validation-20261021-1426.md
population: {previous-issues: 10, version-moved: 0, edited-without-bump: [runbook.md, smoke.md, 98-divergences.md, REL-0002-migration.md, REL-0003-rollout.md, 97-changelog.md], sampled: [REL-0001-config.md, REL-0005-observability.md]}
feedbacks: []
---

# Relatório de validação de deploy — race-lap-validation (revalidação, rodada 2)

## Evidence

| Prova | Resultado |
|---|---|
| Construído pelo pipeline a partir de commit verificado | **não** — zero commits no repositório (fato ambiental declarado; nenhum comando `git` executado por esta validação); sem CI (OPEN-04; `.github/` ausente); `dist/` construído localmente nesta execução (`npm run build`, saída 0) |
| Artefato fresco | sim — `dist/index.html`, `assets/index-Cqfgl3da.js`, `assets/index-dgojskay.css` gravados em 2026-10-21 14:34:33Z; última edição de `src/`/`tests/` em 14:03:26Z (`tests/race-lap-validation-frozen.test.ts`); `index.html` raiz em 13:29:55Z |
| Veredito de testes mais novo | SUCCESS — `test-validation-20261021-1411.md`, 170/170, `fresh: true`, seed `{revision: 2, digest: ee91c5706be1}` igual ao desta validação |
| Segredos no registro de release, em `dist/`, no relatório anterior e neste | nenhum valor — varredura de 17 arquivos (3 de `dist/`, 14 do registro e relatórios) por chave, token, senha, bloco PEM, JWT, AKIA/ghp_/sk-: 2 ocorrências, ambas a palavra em prosa ("token" no relatório anterior linha 23; "secrets" em `REL-0001` linha 22), nenhum valor |
| Variáveis que o cliente lê vs `REL-0001` | 0 = 0 — `import.meta.env`/`process.env`/`localStorage`/`sessionStorage`/`indexedDB`/`fetch(`/`XMLHttpRequest`/`WebSocket`/`sendBeacon`: 0 ocorrências em `src/*.ts` e `index.html` |
| Tamanho do artefato (RNF02, limite 3 145 728 bytes) | `measure_dist.py dist` (com `-I`): 3 arquivos, 593 256 bytes brutos, 152 903 gzip, ratio 0,189, `within_limit=True`, saída 0 — igual ao número de `01-release.md`, `REL-0003` etapa 5 e `runbook.md` passo 5 |
| Nomes dos *assets* | `assets/index-Cqfgl3da.js`, `assets/index-dgojskay.css` — iguais aos citados no `runbook.md` passo 4 |
| Instalação em staging | **não executada** — staging não existe (OPEN-03, D23); nenhum servidor iniciado |
| Cabeças de migração | não se aplica — sem banco (diretiva "Migration step"; DM-0001, DM-0002); única revisão: arquivo de pista `schemaVersion` 2 empacotado (`REL-0002`) |
| Upgrade em cópia restaurada / backfill | não se aplica — nenhum dado armazenado; leitor da v1 provado por `CHK-TEST-0009-01/-03` no veredito de testes |
| Downgrade executado | **não** — a reversão desta release é despublicar (caminho A do `runbook.md`); sem provedor nem staging, não ensaiada |
| Alvo de reversão da primeira release (ISSUE-05) | declarado: caminho A (site volta a não publicado) como único existente nesta release; B (zip do passo 6) a partir da release seguinte; C (`git revert` + `npm test` + `npm run build`, DM-0001 *Plano de migração* linha 133) só com commit anterior à feature e zip perdido; R1 nomeia o alvo e o observável de cada caminho; `REL-0002` coluna *Reversão* e `REL-0003` ordens 1, 2 e 4 dizem o mesmo |
| Coluna de desfazer e durações (ISSUE-06) | `runbook.md` *Promote*: 11 de 11 passos com *Desfaz-se por*; passo 9 "até 1 dia útil; silêncio vale não"; R5 "15 min, no mesmo dia da reversão"; nenhuma duração "—" restante |
| D14/M12 decidíveis (ISSUE-07) | sim — um único resultado esperado: passa com 0 ocorrências de OpenStreetMap/OSM/ODbL em `dist/` **e** 0 alegações de atribuição na página; falha nos dois casos contrários; medido nesta execução: 0 ocorrências em `dist/` (3 arquivos); a regra deriva da precedência I6 (crédito exigido só com dado OSM) e fica registrada em `98-divergences.md` DIV-DP-05 (`open`, devida à primeira release com pista OSM) |
| Superfície da rodada Modo B (§16) | nenhuma linha de fumaça, arquivo, precondição, variável, etapa ou comando **[provedor]** acrescentados: 26 linhas de fumaça (14 + 12), 11 passos *Promote*, 7 *Verify*, 5 *Roll back*, 9 precondições, 9 divergências — a tabela *Alvo de reversão* e a coluna *Desfaz-se por* são o que ISSUE-05 e ISSUE-06 pediram; o caminho A é a "indisponibilidade explícita do site" que ISSUE-05 ofereceu como alternativa; nenhum comando de provedor foi inventado |
| `version:` dos arquivos editados | **não movido** — os 6 arquivos editados pela rodada 2 continuam em `1.0.0` (`00-index.md` emitido 14:33:34Z); a população desta revalidação foi fixada pela lista de arquivos editados que o `97-changelog.md` declara, não pelo `version:` |
| Smoke — web-desktop / web-mobile | **não executado / não executado** — sem URL de staging nem aparelho nomeado; `docs/lap-validation-device-log.md` não existe |
| NFR observados em staging | nenhum — RNF01, NFR-0003, NFR-0006, NFR-0008 só mensuráveis em URL servida e aparelho nomeado |
| Cliente móvel não atualizado contra backend novo | não se aplica — sem backend, sem app nativo (`REL-0004`) |
| Elementos observáveis citados pelo smoke existem em `dist/index.html` | sim — `id="track-status"`, `id="lap-state"`, `id="lap-result"`, `id="lap-offer"` |
| Feature flag | nenhuma, por projeto validado (DES-0007, DES-0011); ordem de `REL-0003` não confrontável com ensaio em staging |
| Versão do Node do build | v24.20.0 / npm 11.19.0; sem `.nvmrc`, `.node-version` ou `engines` |
| Logs capturados nesta execução | nenhum — nenhum serviço iniciado; verificação I6 sobre logs sem objeto |

## Issues

### ISSUE-01
- severity: blocker
- check: P1
- class: ambiental
- status: open (inalterado desde o relatório anterior)
- file: `600 Deploy/Output/race-lap-validation/01-release.md`
- location: seção *Proveniência*; `runbook.md` precondição 1
- finding: o candidato não foi construído pelo pipeline a partir do commit que os testes verificaram — o repositório tem zero commits, não há CI (OPEN-04) e o `dist/` existente foi construído localmente por esta execução; a proveniência não pode ser afirmada nem auditada.
- expected: o dono do produto faz o commit da árvore verificada, roda `npm ci`, `npm test` (170 aprovados) e `npm run build` nesse commit e registra o hash em um relatório de testes; o artefato que chega a staging é produzido a partir desse hash (por CI quando existir, ou com o hash registrado no runbook).
- precondição humana: commit da árvore verificada pelo dono do produto (`git` é reservado a ele); sem isso nenhuma rodada do gerador pode fechar este item.

### ISSUE-02
- severity: error
- check: P3
- class: ambiental
- status: open (inalterado)
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: *Promote* passos 7 e 10 (**[provedor]**)
- finding: a instalação não pôde ser executada — nenhum ambiente de staging está declarado (OPEN-03, D23); o bundle servido, o HTTPS e a igualdade byte a byte do `index.html` não foram observados.
- expected: decisão D23 com um site de staging em HTTPS; `dist/` publicado nele e o `index.html` servido igual ao local (nome do JS `index-Cqfgl3da.js` conferido).
- precondição humana: decisão D23 (provedor, staging e produção em HTTPS) pelo dono do produto.

### ISSUE-03
- severity: error
- check: P5
- class: ambiental
- status: open (inalterado)
- file: `600 Deploy/Output/race-lap-validation/smoke.md`
- location: D1–D14 (`web-desktop`), M1–M12 (`web-mobile`)
- finding: nenhuma das 26 verificações de fumaça foi executada — não há URL de staging nem aparelho nomeado; os limiares RNF01, RNF06, NFR-0003, NFR-0006, NFR-0004, NFR-0007 e NFR-0008 não têm valor observado; `docs/lap-validation-device-log.md` não existe.
- expected: as 26 linhas executadas na URL de staging, por canal, com o valor medido registrado em `docs/lap-validation-device-log.md` (aparelho, navegador, versão, medida), e cada valor dentro do limiar que a linha nomeia.
- precondição humana: staging publicado (ISSUE-02) e um testador com o notebook e o celular de referência nomeados.

### ISSUE-04
- severity: error
- check: P6
- class: ambiental
- status: open (inalterado)
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: *Promote* 6, 7, 10, 11; *Roll back* R1, R2
- finding: a reversão não foi demonstrada em staging e os passos de publicação, purga de cache e reversão (incluindo "despublicar" do caminho A) estão como ação e resultado observável, não como comando (D-DP-02 exige "stated as commands"), porque o provedor não foi escolhido (D23; DIV-DP-04).
- expected: com D23 decidido, os passos 6, 7, 10, 11, R1 e R2 preenchidos com o comando do provedor; R1 e R2 executados em staging pelo caminho A (staging deixa de servir `index.html`) e *Verify* confirmado como R3 descreve.
- precondição humana: decisão D23; o executor do runbook ensaia R1/R2 sobre staging.

### ISSUE-05
- severity: error
- check: P6
- class: defeito do registro
- status: **closed**
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: tabela *Alvo de reversão*; *Promote* passo 6; *Roll back* R1–R4; `REL-0002` coluna *Reversão*; `REL-0003` ordens 1, 2, 4
- finding: fechado — o alvo da primeira release está declarado (site não publicado, caminho A), R1 nomeia qual caminho se aplica em cada caso e o seu observável, o caminho C reproduz os passos 1–3 de DM-0001 *Plano de migração* com a condição que os torna aplicáveis (commit anterior à feature), e `REL-0002`/`REL-0003` dizem o mesmo que o runbook.
- expected: nenhuma ação; o comando concreto de "despublicar" permanece em ISSUE-04 (ambiental).

### ISSUE-06
- severity: error
- check: P6
- class: defeito do registro
- status: **closed**
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: tabela *Promote* coluna *Desfaz-se por*; passo 9 e R5 coluna *Leva*
- finding: fechado — os 11 passos de *Promote* têm desfazer na própria tabela (1–5 e 8: nada a desfazer, com o motivo; 7: R1/R2 sobre staging; 9: nada; 10: R1; 11: R2); passo 9 com limite de espera (1 dia útil, silêncio vale "não") e R5 com 15 min no mesmo dia.
- expected: nenhuma ação.

### ISSUE-07
- severity: warning
- check: P5
- class: defeito do registro
- status: **closed**
- file: `600 Deploy/Output/race-lap-validation/smoke.md`
- location: D14, M12; `runbook.md` precondição 8 e *Verify* 6; `98-divergences.md` DIV-DP-05
- finding: fechado — D14/M12 têm um único resultado esperado (passa com 0 ocorrências de OSM/ODbL em `dist/` e 0 alegações de atribuição na página; falha nos dois casos contrários), verificável hoje (0 ocorrências medidas), e a regra que o justifica (I6: crédito exigido só com dado OSM) está escrita no registro.
- expected: nenhuma ação no registro; a ratificação pelo dono do produto fica em ISSUE-11.

### ISSUE-08
- severity: warning
- check: P7
- class: ambiental
- status: open (inalterado)
- file: `600 Deploy/Output/race-lap-validation/REL-0005-observability.md`
- location: seção *Qual alerta soaria*
- finding: nenhuma métrica ou alerta mostraria RNF01, NFR-0003 ou a disponibilidade sendo violados em produção fora da reverificação manual do runbook; não há monitor nem retenção de registros de acesso porque não há provedor (DIV-DP-08).
- expected: com D23, um monitor de disponibilidade HTTPS sobre a URL de produção e a retenção dos registros de acesso do provedor, nomeados em `REL-0005`, sem dado pessoal.
- precondição humana: decisão D23.

### ISSUE-09
- severity: info
- check: P8
- class: ambiental
- status: open (inalterado)
- file: `600 Deploy/Output/race-lap-validation/REL-0003-rollout.md`
- location: seção *Feature flag e quem "liga" a feature*
- finding: não há feature flag, por decisão do projeto validado (DES-0007, DES-0011); a feature fica ativa para 100 % dos jogadores ao servir o `index.html` novo; a ordem de `REL-0003` não pôde ser comparada com um ensaio em staging.
- expected: nenhuma ação neste estágio; a ordem de `REL-0003` é confrontada com o que for feito em staging quando existir.

### ISSUE-10
- severity: info
- check: P1
- class: ambiental
- status: open (inalterado)
- file: `600 Deploy/Output/race-lap-validation/REL-0001-config.md`
- location: tabela *O que o passo de hospedagem precisará*, linha *Versão do Node*
- finding: o build não é reproduzível por versão fixada — sem `.nvmrc`, `.node-version` ou `engines`; esta execução usou Node v24.20.0 / npm 11.19.0, os mesmos do registro (DIV-DP-09).
- expected: `.nvmrc` ou campo `engines` no repositório (fora deste estágio) antes de o pipeline existir.
- precondição humana: edição do repositório fora do estágio de deploy.

### ISSUE-11
- severity: info
- check: P5
- class: decisão humana pendente (não é defeito do registro)
- status: new
- file: `600 Deploy/Output/race-lap-validation/98-divergences.md`
- location: DIV-DP-05; `smoke.md` D14/M12
- finding: a regra "nenhum dado OSM publicado → nenhum crédito exigido" foi derivada pelo gerador da precedência I6 sobre D-DP-04 e está registrada, mas não há ratificação do dono do produto; D-DP-04, lida literalmente, pede o crédito "no build publicado" sem condição.
- expected: o dono do produto ratifica a leitura (D-DP-04 aplicável só a release com pista OSM) ou manda acrescentar o crédito por mudança de código; a resposta entra em `DOMAIN.md` ou no `97-changelog.md`; D14/M12 não mudam no primeiro caso.
- precondição humana: uma frase do dono do produto.

## Promotion question

Não há pergunta de promoção: o veredito é FAIL (ISSUE-01 blocker) e nenhuma promoção é proposta (D-DP-06). Os três defeitos do registro do relatório anterior (ISSUE-05, ISSUE-06, ISSUE-07) estão fechados e a rodada não acrescentou superfície; **o que resta é inteiramente ambiental** e nenhuma rodada do gerador pode fechá-lo. O que um humano deve fazer, em ordem:

1. Fazer o commit da árvore verificada; nesse commit rodar `npm ci`, `npm test` e `npm run build` e registrar o hash com os totais (ISSUE-01, blocker).
2. Decidir D23 (provedor, staging e produção em HTTPS); preencher os passos **[provedor]** 6, 7, 10, 11, R1 e R2 do `runbook.md` com os comandos do provedor, incluindo "despublicar" do caminho A (ISSUE-02, ISSUE-04).
3. Publicar em staging, executar as 26 linhas de `smoke.md` no notebook e no celular de referência e criar `docs/lap-validation-device-log.md` (ISSUE-03); ensaiar R1/R2 sobre staging (ISSUE-04).
4. Configurar o monitor HTTPS e a retenção de registros do provedor nomeados em `REL-0005` (ISSUE-08) e fixar a versão do Node (`.nvmrc` ou `engines`, ISSUE-10).
5. Ratificar a leitura de D-DP-04 registrada em DIV-DP-05 (ISSUE-11).
6. Na próxima rodada do gerador, mover o `version:` dos arquivos editados (os 6 da rodada 2 continuam em `1.0.0`, contra a convenção §3) para que a população da revalidação volte a ser fixada pelo `version:`.
7. Reexecutar esta validação; só então a pergunta de promoção é aberta ao dono do produto, com `600 Deploy/Output/race-lap-validation/runbook.md` (ponto sem retorno: não existe nesta release — reversão pelo caminho A sempre possível).
