---
stage: deploy
feature: race-lap-validation
verdict: FAIL
generated: 2026-10-21T15:01:14Z
environment: staging não publicado (GitHub Pages decidido, D23; repositório `<owner>/kartle-staging` não criado)
commit: c41c6c3ddf8ada690a2f2b1581ee87700c837268
counts: {blocker: 1, error: 3, warning: 1, info: 5, divergence: 0}
seed: {revision: 2, digest: ee91c5706be1}
upstream: {stage: test, version: n/a}
previous: deploy-validation-20261021-1435.md
population: {previous-issues: 11, version-moved: [01-release.md, runbook.md, smoke.md, REL-0001-config.md, REL-0003-rollout.md, REL-0005-observability.md, 98-divergences.md, 97-changelog.md], new-files: [.github/workflows/pages.yml, .nvmrc, docs/lap-validation-device-log.md], sampled: [REL-0002-migration.md, REL-0004-mobile.md]}
feedbacks: []
---

# Relatório de validação de deploy — race-lap-validation (revalidação, rodada 3)

## Evidence

| Prova | Resultado |
|---|---|
| Commit verificado nomeado | sim — `c41c6c3ddf8ada690a2f2b1581ee87700c837268` (`master`) em `01-release.md` *Proveniência*, `runbook.md` precondição 1 e passo 1, `REL-0003` etapa 1; fato declarado pelo condutor do loop (nenhum comando `git` executado por esta validação) |
| Construído pelo pipeline a partir desse commit | **não observado** — `.github/workflows/pages.yml` existe e descreve o build, mas nunca correu: não há remoto GitHub (DIV-DP-10); o `dist/` desta execução é local |
| Artefato fresco | sim — `npm run build` nesta execução, saída 0; `dist/index.html`, `assets/index-Cqfgl3da.js`, `assets/index-dgojskay.css` gravados em 2026-10-21 15:02:25Z; última edição de `src/`/`tests/` em 14:03:26Z; `index.html` raiz em 13:29:55Z (inalterado); nomes dos *assets* iguais aos de `01-release.md`, `runbook.md` passo 4 e do registro de aparelho |
| Veredito de testes mais novo | SUCCESS — `test-validation-20261021-1411.md`, 170/170, `fresh: true`, seed `{revision: 2, digest: ee91c5706be1}` igual ao desta validação; no commit `c41c6c3` o condutor registra `npm ci` saída 0, `npm test` 170/0/0, `npm run build` saída 0 |
| Tamanho do artefato (RNF02, limite 3 145 728 bytes) | `measure_dist.py dist` (com `-I`): 3 arquivos, 593 256 bytes brutos, 152 903 gzip, ratio 0,189, `within_limit=True`, saída 0 — igual a `01-release.md`, `REL-0003` etapa 5, `runbook.md` passo 5, `REL-0005` |
| Segredos no registro, no workflow, em `dist/` e neste relatório | nenhum valor — varredura de 10 arquivos do registro, 2 relatórios anteriores, `pages.yml` e os 3 arquivos de `dist/` por chave, token, senha, bloco PEM, JWT, AKIA/ghp_/sk-: ocorrências só da palavra em prosa ("token OIDC", "secrets.*" negado, "secret" em comentário do workflow); 0 em `dist/`; `pages.yml` não declara `env:` nem lê `secrets.*` (D-DP-05) |
| Variáveis que o cliente lê vs `REL-0001` | 0 = 0 — `REL-0001` declara nenhuma variável; as duas entradas do pipeline (nome do repositório, ambiente `github-pages`) vêm do contexto do GitHub, não de arquivo do repositório |
| `pages.yml` — sintaxe | `yaml.safe_load` sem erro; `on: {push: {branches: [master, staging]}, workflow_dispatch}`; trabalhos `build`, `deploy` |
| `pages.yml` — permissões e autenticação | `contents: read`, `pages: write`, `id-token: write`; publicação por `actions/deploy-pages@v4` com OIDC; nenhum `secrets.*`, nenhum `env:` |
| `pages.yml` — Node | `actions/setup-node@v4` com `node-version-file: .nvmrc` (`24`) e `cache: npm`; `package-lock.json` presente na raiz; `npm ci` |
| `pages.yml` — base e portão RNF02 | `npm run build -- --base=/${{ github.event.repository.name }}/` — o script `build` é `tsc --noEmit && vite build`, e o npm anexa o argumento ao fim do script, logo o `--base` chega ao `vite build`; `python3 -I ".../measure_dist.py" dist` antes do `upload-pages-artifact` (saída 1 acima do limite interrompe antes de publicar) |
| `pages.yml` — condição do `deploy` | `needs: build`; `if: github.ref_name == 'master' \|\| endsWith(github.event.repository.name, '-staging')` — em `<owner>/kartle` o ramo `staging` constrói e testa sem publicar; em `<owner>/kartle-staging` publica; ambiente `github-pages` com `url` da saída de `deployment` (revisor obrigatório é configuração do repositório, não do arquivo) |
| `pages.yml` — ações fixadas | `checkout@v4`, `setup-node@v4`, `configure-pages@v5`, `upload-pages-artifact@v3`, `deploy-pages@v4` — iguais às citadas em `REL-0003`; fixadas por versão maior, não por hash |
| `pages.yml` — correspondência com o registro | as 7 etapas automáticas de `REL-0003` e a descrição em `01-release.md` *O que o pipeline faz* batem com o arquivo, passo a passo; `concurrency: group: pages`, sem cancelamento |
| Instalação em staging | **não executada** — `<owner>/kartle-staging` não existe (DIV-DP-11); nenhum servidor iniciado por esta validação |
| Cabeças de migração / upgrade em cópia / backfill | não se aplica — sem banco (`REL-0002`, DM-0001, DM-0002); leitor v1 provado por `CHK-TEST-0009-01/-03` |
| Downgrade / reversão demonstrada | **não** — R1/R2 (caminho A: *Unpublish site*) não ensaiados por falta de staging; os passos estão agora como ação concreta do GitHub com observável e duração (ver ISSUE-04) |
| Runbook — passos **[provedor]** | 0 restantes — passos 6, 7, 10, 11, R1, R2 preenchidos (`git push staging master:staging`; `git push origin master` + *Approve and deploy*; espera de `max-age=600`, sem purga no Pages; *Unpublish site*; *Re-run all jobs* + aprovação; `git revert <sha>`); 11 passos *Promote* com *Esperado*, *Leva* e *Desfaz-se por*; ponto sem retorno nomeado (não existe nesta release; `push --force` seria o único ato irreversível e nenhum passo o faz) |
| Smoke — web-desktop / web-mobile em staging | **não executado / não executado** — sem URL de staging |
| Registro de aparelho `docs/lap-validation-device-log.md` | existe — execução 1 (condutor do loop, Chromium 152 em painel do Claude Desktop, `vite preview` em `localhost:4173`, commit `c41c6c3`, HTTP). Cobre como **estado e texto** sobre o build local: D7 (Esc com teclas reais; perda de foco por `blur`/`focus` emulados), D11, D4 (texto: `synthetic`, um botão "volta de treino"), D5 (texto, 61 px, contraste ≈ 17:1; duração de 3 s **não** medida), D8 parcial (corte → "inválida · corte" sem tempo; reposição em treino não invalida; marcador pulado não exercitado), D9 na forma observável (0 requisições; sem bloqueio de rede), D10 emulado (`languagechange`). **Não cobre**: D1, D2, D3 (sem URL HTTPS publicada), D6 (volta completa), D12, D13, todas as M1–M12. Limitação declarada: página em segundo plano, rAF ≈ 2 fps — **toda medida de ritmo inválida** (RNF01, NFR-0003, contagem de 3 s). Não é execução em staging nem em aparelho nomeado (I9) |
| NFR observados em staging | nenhum — RNF01, RNF06, NFR-0003, NFR-0008 só mensuráveis em URL servida e aparelho nomeado |
| Smoke × projeto validado (ISSUE-12 do gerador) | correto — DES-0009 linha 33: `offeredLapKinds(reading, [])` "hoje é só `startTraining`"; linha 80: "a oferta de volta oficial depende do desafio diário (outra feature)"; `src/main.ts` linha 200 confirma; DES-0005 linhas 15–16: reposicionar é livre em treino e reconhecimento; `dist/index.html` traz `track-status`, `lap-offer`, `lap-state`, `lap-result`. A reescrita de D4/D5/D6/D8/M4/M5/M6 corrige uma contradição com o estágio a montante, não rebaixa a barra (§6: o que mudou é o resultado esperado, não o limiar) |
| Superfície da rodada 3 (§16) | dentro do autorizado — arquivos novos: `pages.yml` e `.nvmrc` (decisões D23 e `.nvmrc`); 14 + 12 linhas de fumaça, sem acréscimo; precondições 9 → 10 (repositório de staging separado da de produção, Node fixado — ambas derivadas de D23/`.nvmrc`); 3 linhas novas no registro de divergências (DIV-DP-10, 11, 12), que são registro e não superfície; `package.json` e `index.html` não editados; nenhum comando de provedor inventado; caminho B trocado de "zip guardado" por "reexecutar a execução verde anterior" (consequência de D23) |
| `version:` dos arquivos editados | movido — os 8 arquivos da rodada 3 em `1.1.0`; `REL-0002` e `REL-0004` em `1.0.0`, não editados (amostra: coerentes com o runbook — `REL-0002` ainda descreve o caminho B como "republicar o `dist/` guardado", ver ISSUE-14) |
| Elementos observáveis citados pelo smoke existem em `dist/index.html` | sim — `track-status`, `lap-offer`, `lap-state`, `lap-result`, `lap-countdown`, `lap-paused` |
| Feature flag | nenhuma, por projeto validado (DES-0007, DES-0011); ordem de `REL-0003` não confrontável com ensaio em staging |
| Logs capturados nesta execução | nenhum — nenhum serviço iniciado; verificação I6 sobre logs sem objeto |
| Comparação com o relatório anterior (§11) | blocker+error+warning = 5, igual a 5 — os cinco itens abertos são todos **ambientais** (remoto GitHub, staging, aparelhos, monitor); nenhuma rodada do gerador pode reduzi-los; o que resta é ação humana |

## Issues

### ISSUE-01
- severity: blocker
- check: P1
- class: ambiental
- status: open (metades "sem commit" e "sem CI" fechadas; resta "construído pelo pipeline e observado")
- file: `600 Deploy/Output/race-lap-validation/01-release.md`
- location: seção *Proveniência*; `.github/workflows/pages.yml`
- finding: o commit verificado está nomeado (`c41c6c3`) e o pipeline está escrito, mas nenhum artefato foi construído pelo pipeline — o workflow nunca correu porque não há remoto GitHub; o único `dist/` existente é local.
- expected: primeira execução verde do workflow `pages` em `<owner>/kartle` (e em `<owner>/kartle-staging`) sobre o commit `c41c6c3`, com `npm test` 170 aprovados e `Measure dist` `within_limit=True` no log da execução.
- precondição humana: criar `<owner>/kartle` no GitHub, `git push -u origin master`, Settings → Pages → *Source* = GitHub Actions (DIV-DP-10).

### ISSUE-02
- severity: error
- check: P3
- class: ambiental
- status: open (metade "provedor" fechada por D23)
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: *Promote* passo 7
- finding: a instalação em staging não pôde ser executada — o repositório `<owner>/kartle-staging` não foi criado; bundle servido, HTTPS e o `index.html` com `/kartle-staging/assets/index-<hash>.js` não foram observados.
- expected: execução verde do workflow em `<owner>/kartle-staging` e `https://<owner>.github.io/kartle-staging/` respondendo 200 em HTTPS com o `<hash>` do passo *Build* dessa execução.
- precondição humana: criar `<owner>/kartle-staging`, `git remote add staging <URL>`, `git push staging master:staging` (DIV-DP-11).

### ISSUE-03
- severity: error
- check: P5
- class: ambiental
- status: open (evidência parcial nova: `docs/lap-validation-device-log.md`, execução 1)
- file: `600 Deploy/Output/race-lap-validation/smoke.md`
- location: D1–D14 (`web-desktop`), M1–M12 (`web-mobile`)
- finding: nenhuma das 26 linhas foi executada na URL de staging; a execução 1 do registro de aparelho prova estado e texto de D4, D5, D7, D8 (parcial), D9, D10, D11 sobre o build local em Chromium, em página de segundo plano (ritmo inválido), e não cobre D1–D3, D6, D12, D13 nem nenhuma linha M; RNF01, NFR-0003, NFR-0008 e a contagem de 3 s continuam sem valor observado.
- expected: as 26 linhas executadas em `https://<owner>.github.io/kartle-staging/`, por canal, com janela em primeiro plano, no notebook e no celular de referência nomeados, e o valor medido registrado como execução 2+ no mesmo log.
- precondição humana: staging publicado (ISSUE-02) e um testador com os aparelhos nomeados.

### ISSUE-04
- severity: error
- check: P6
- class: ambiental
- status: open (metade "comandos" fechada; resta "demonstrado em staging")
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: *Roll back* R1, R2
- finding: os passos de publicação e reversão estão como ação concreta do GitHub com observável e duração (D-DP-02 atendido na escrita), mas R1/R2 pelo caminho A (*Unpublish site*) não foram ensaiados em staging.
- expected: em `<owner>/kartle-staging`, após uma execução verde, R1 (*Unpublish site*) e R2 (espera do cache) executados e o observável de R3 confirmado (URL responde 404; nenhum *asset* da release servido); depois republicar com `git push staging master:staging`.
- precondição humana: ISSUE-02 cumprida; o executor do runbook ensaia R1/R2 sobre staging.

### ISSUE-05
- severity: error
- check: P6
- class: defeito do registro
- status: closed (reverificado)
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: tabela *Alvo de reversão*; R1
- finding: fechado — o alvo da primeira release continua declarado (caminho A) e R1 nomeia o caminho e o observável de cada caso.
- expected: nenhuma ação.

### ISSUE-06
- severity: error
- check: P6
- class: defeito do registro
- status: closed (reverificado)
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: tabela *Promote* colunas *Leva* e *Desfaz-se por*
- finding: fechado — 11 de 11 passos com desfazer e duração; passo 9 e R5 com limite de espera.
- expected: nenhuma ação.

### ISSUE-07
- severity: warning
- check: P5
- class: defeito do registro
- status: closed (reverificado)
- file: `600 Deploy/Output/race-lap-validation/smoke.md`
- location: D14, M12
- finding: fechado — resultado único e decidível; medido nesta execução: 0 ocorrências de OSM/ODbL em `dist/` (3 arquivos).
- expected: nenhuma ação; ratificação em ISSUE-11.

### ISSUE-08
- severity: warning
- check: P7
- class: ambiental
- status: open (escopo reduzido: o registro de implantações passou a existir)
- file: `600 Deploy/Output/race-lap-validation/REL-0005-observability.md`
- location: seção *Qual alerta soaria*
- finding: nenhuma métrica ou alerta mostraria RNF01, NFR-0003 ou a disponibilidade sendo violados em produção — o GitHub Pages não fornece monitor nem registros de acesso; o único alerta automático é a falha do próprio workflow.
- expected: decisão do dono do produto por um monitor HTTPS externo sobre `https://<owner>.github.io/kartle/` (falha = resposta diferente de 200 ou certificado inválido, sem dado pessoal), dentro de RNF12, ou aceitação explícita da vigilância manual para o MVP registrada em `DOMAIN.md` (DIV-DP-08).
- precondição humana: uma decisão do dono do produto.

### ISSUE-09
- severity: info
- check: P8
- class: ambiental
- status: open (inalterado)
- file: `600 Deploy/Output/race-lap-validation/REL-0003-rollout.md`
- location: seção *Ordem de operações*
- finding: não há feature flag, por projeto validado; a ordem 1–5 de `REL-0003` não pôde ser comparada com um ensaio em staging.
- expected: nenhuma ação no registro; comparar a ordem com a primeira execução em staging.

### ISSUE-10
- severity: info
- check: P1
- class: ambiental
- status: closed
- file: `.nvmrc`
- location: raiz do repositório
- finding: fechado — `.nvmrc` com `24` na raiz, lida pelo workflow por `node-version-file`; build desta execução com Node v24.20.0.
- expected: nenhuma ação.

### ISSUE-11
- severity: info
- check: P5
- class: decisão humana pendente
- status: open (inalterado)
- file: `600 Deploy/Output/race-lap-validation/98-divergences.md`
- location: DIV-DP-05; `smoke.md` D14/M12
- finding: a leitura "nenhum dado OSM publicado → nenhum crédito exigido" continua sem ratificação do dono do produto.
- expected: uma frase do dono do produto em `DOMAIN.md` ou no `97-changelog.md`; D14/M12 não mudam se ratificada.

### ISSUE-12
- severity: error
- check: P5
- class: defeito do registro (fumaça contradizia o projeto validado)
- status: closed (levantado pelo gerador na rodada 3; verificado)
- file: `600 Deploy/Output/race-lap-validation/smoke.md`
- location: D4, D5, D6, D8, M4, M5, M6; `runbook.md` *Verify* 4 e 5; `01-release.md` passo 5; `REL-0005` modo de falha 1
- finding: fechado — as linhas agora esperam só a volta de treino, como DES-0009 (linhas 33 e 80), `src/main.ts` linha 200 e a página servida (`#track-status` `synthetic`, um botão "volta de treino") determinam; D8 segue DES-0005 (reposicionar não invalida treino); limiares inalterados.
- expected: nenhuma ação.

### ISSUE-13
- severity: info
- check: P5
- class: registro desatualizado por um evento
- status: new
- file: `600 Deploy/Output/race-lap-validation/98-divergences.md`
- location: DIV-DP-06 coluna *O que existe hoje*; `REL-0004-mobile.md` seção *Dispositivos de referência*; `97-changelog.md` rodada 3 (ISSUE-03)
- finding: o registro afirma que `docs/lap-validation-device-log.md` não existe, mas o arquivo existe com a execução 1 (desktop, local, parcial, ritmo inválido), criada depois da rodada 3; a precondição 8 do runbook permanece corretamente desmarcada porque o log não contém a execução em staging nem os aparelhos nomeados.
- expected: na próxima rodada, DIV-DP-06 e `REL-0004` dizem "existe com a execução 1 (local, parcial); falta a execução em staging nos aparelhos nomeados", e a tabela de fumaça remete ao log por número de execução.

### ISSUE-14
- severity: info
- check: P1
- class: registro desatualizado por um evento
- status: new
- file: `600 Deploy/Output/race-lap-validation/01-release.md`
- location: tabela *Proveniência*, linha *Commit verificado* ("`npm ci` nesse commit está agendado"); `98-divergences.md` DIV-DP-01; `REL-0002-migration.md` coluna *Reversão* ("republicar o `dist/` guardado (caminho B)")
- finding: `01-release.md` e DIV-DP-01 dizem que `npm ci` no commit está agendado quando o condutor já o registrou com saída 0; `REL-0002` (não editado, `1.0.0`) ainda descreve o caminho B como "republicar o `dist/` guardado", enquanto o runbook da rodada 3 o define como "reexecutar a execução verde anterior".
- expected: `01-release.md`/DIV-DP-01 com "`npm ci` saída 0 no commit"; `REL-0002` coluna *Reversão* alinhada ao caminho B do `runbook.md` (`version:` movido).

### ISSUE-15
- severity: info
- check: P3
- class: defeito de aplicação observável só no Pages de projeto — devido ao estágio de código
- status: new
- file: `index.html`
- location: linha 12, `<a class="brand" href="/">`; `98-divergences.md` DIV-DP-12
- finding: no Pages de projeto o link da marca leva a `https://<owner>.github.io/` e não a `/<repo>/`; o `--base` do build reescreve os *assets* e não esse `href`; nenhuma linha de fumaça depende dele e o carregamento da página não é afetado, por isso não é `FAIL CODE` desta release; a divergência está registrada, mas nenhum relatório de retorno foi escrito para o estágio de código.
- expected: o dono do produto decide se o `href` entra na próxima rodada do estágio de código (`./` ou `import.meta.env.BASE_URL`, com teste) antes ou depois desta release; a decisão fica em `97-changelog.md` ou `SCOPE-BACKLOG.md`.

## Promotion question

Não há pergunta de promoção: o veredito é FAIL (ISSUE-01 blocker) e nenhuma promoção é proposta (D-DP-06). Os cinco itens que bloqueiam (ISSUE-01, 02, 03, 04, 08) são **inteiramente ambientais** e nenhuma rodada do gerador pode fechá-los; os três itens novos são `info`. O que um humano deve fazer, em ordem:

1. Criar o repositório `<owner>/kartle` no GitHub; `git remote add origin <URL>`; `git push -u origin master`; Settings → Pages → *Source* = GitHub Actions; Settings → Environments → `github-pages` → *Required reviewers* = dono do produto. Observar a primeira execução verde do workflow `pages` sobre `c41c6c3` (`build` verde; `deploy` em *Waiting* — **não aprovar ainda**) (ISSUE-01).
2. Criar `<owner>/kartle-staging` com *Source* = GitHub Actions e sem revisor; `git remote add staging <URL>`; `git push staging master:staging`; confirmar `https://<owner>.github.io/kartle-staging/` em HTTPS com o `<hash>` do passo *Build* (ISSUE-02).
3. Executar as 26 linhas de `smoke.md` em staging, janela em primeiro plano, no notebook e no celular de referência nomeados, nos 4 navegadores para D13; registrar como execução 2 em `docs/lap-validation-device-log.md` (ISSUE-03).
4. Ensaiar R1 (*Unpublish site*) e R2 em `<owner>/kartle-staging`, confirmar R3 (404) e republicar com `git push staging master:staging` (ISSUE-04).
5. Decidir monitor HTTPS externo ou vigilância manual aceita, e registrar (ISSUE-08); ratificar a leitura de D-DP-04 (ISSUE-11); decidir o destino do `href="/"` da marca (ISSUE-15).
6. Próxima rodada do gerador: atualizar DIV-DP-06, `REL-0004`, `01-release.md`/DIV-DP-01 e `REL-0002` (ISSUE-13, ISSUE-14), com `version:` movido.
7. Reexecutar esta validação com a URL de staging e o log da execução 2; só então a pergunta de promoção é aberta ao dono do produto, com `600 Deploy/Output/race-lap-validation/runbook.md` (promoção = clique *Approve and deploy* no passo 10; ponto sem retorno: não existe nesta release — reversão pelo caminho A sempre possível).
