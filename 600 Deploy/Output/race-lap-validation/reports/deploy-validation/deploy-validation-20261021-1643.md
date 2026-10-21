---
stage: deploy
feature: race-lap-validation
verdict: FAIL
generated: 2026-10-21T16:43:20Z
environment: staging — `https://edumatosr6-svg.github.io/kartle-staging/` (GitHub Pages, repositório `edumatosr6-svg/kartle-staging`, D23)
commit: c41c6c3ddf8ada690a2f2b1581ee87700c837268 (árvore verificada); commit construído em staging `2bee672` (só registro; *assets* idênticos)
counts: {blocker: 0, error: 1, warning: 0, info: 2, divergence: 0}
seed: {revision: 2, digest: ee91c5706be1}
upstream: {stage: test, version: n/a}
previous: deploy-validation-20261021-1602.md
population: {previous-issues: 17, version-moved: [01-release.md, runbook.md, smoke.md, REL-0003-rollout.md, REL-0005-observability.md, 98-divergences.md, 97-changelog.md], new-evidence: [docs/lap-validation-device-log.md "Ensaio de reversão R4" e "Tentativa de medições de ritmo", DOMAIN.md decisões de 2026-10-21, SCOPE-BACKLOG.md], sampled: [REL-0001-config.md, REL-0004-mobile.md]}
feedbacks: []
---

# Relatório de validação de deploy — race-lap-validation (revalidação, rodada 5)

## Evidence

| Prova | Resultado |
|---|---|
| Commit verificado nomeado | sim — `c41c6c3ddf8ada690a2f2b1581ee87700c837268` em `01-release.md` *Proveniência*, `runbook.md` tabela de nomes e precondição 1, `REL-0003` etapa 1 (nenhum comando `git` executado por esta validação) |
| Construído pelo pipeline a partir desse commit | **sim, observado** — API pública do Actions (leitura, sem token): `kartle` execução 39627810079 → `waiting`, conclusão `None`, `head_sha` `162b1b3`, tentativa 1, atualizada 15:41:11Z (`deploy` à espera do revisor; **não aprovado**); `kartle-staging` execução 39631099098 → `completed success`, `head_sha` **`2bee672`**, tentativa **2** (reexecução), criada 16:02:11Z por `push` no ramo `staging`, atualizada 16:30:41Z |
| Artefato de staging = árvore verificada | sim — `assets/index-Cqfgl3da.js` servido: 200, 574 785 bytes, sha256 `ec93a23f87961a4a…ceceea`, **idêntico byte a byte** ao `dist/` local da árvore de `c41c6c3` (mesmo sha256); `index-dgojskay.css` local sha256 `cb10bfa773bb92f2…`; o HTML servido referencia `assets/index-Cqfgl3da.js` e `assets/index-dgojskay.css` |
| Artefato fresco | sim — `index.html` de staging com `Last-Modified: 2026-10-21 16:30:35 GMT` (republicação de R2), `ETag "6ad8e8ab-1bb6"`; última edição de `src/`/`tests/`/`index.html` em 11:03:26 local (anterior); conteúdo dos *assets* = árvore verificada (linha acima) |
| Veredito de testes mais novo | SUCCESS — `test-validation-20261021-1411.md`, único e mais novo no diretório; seed `{revision: 2, digest: ee91c5706be1}` igual ao desta validação |
| Tamanho (RNF02, limite 3 145 728 bytes) | `dist/` local: 574 785 + 11 407 + 7 064 = 593 256 bytes, igual a `01-release.md`; em staging, execução 2 do log registra `transferSize` 155 257 bytes |
| Segredos no registro, no workflow, no log de aparelho e neste relatório | nenhum valor — varredura por `ghp_`, `github_pat_`, `sk-`, AKIA, bloco PEM, JWT, `secrets.*`, `password=` nos 10 arquivos do registro, `pages.yml` e `docs/lap-validation-device-log.md`: a única ocorrência é a frase "não lê `secrets.*`" em `REL-0001` linha 29 (menção, não valor); o ensaio de R1/R2 cita endpoints da API, nenhum token (D-DP-05) |
| Variáveis que o cliente lê vs `REL-0001` | 0 = 0 — nenhuma variável; as duas entradas (nome do repositório, ambiente `github-pages`) vêm do contexto da execução; `REL-0001` (amostra, intocado) coerente |
| Instalação em staging (P3) | **sim** — `curl` `https://edumatosr6-svg.github.io/kartle-staging/`: HTTP 200, `ssl_verify_result` 0, `Content-Type: text/html; charset=utf-8`, `Cache-Control: max-age=600` (regra de `REL-0003`) |
| Passo manual não descrito pelo runbook (P3) | nenhum — a re-liberação da política de ramos do ambiente após uma despublicação (descoberta no ensaio) está na precondição do repositório de staging, em R2, na tabela de `REL-0003` e no modo de falha de `REL-0005`; DIV-DP-13 `resolved` com a recorrência |
| Cabeças de migração / upgrade em cópia / backfill (P4) | não se aplica — sem banco (`REL-0002`, DM-0001, DM-0002); leitor v1 provado por `CHK-TEST-0009-01/-03` |
| Downgrade / reversão demonstrada (P6) | **sim** — *Ensaio de reversão R4* no log: R1 `DELETE /pages` 16:23:52Z → 404 no navegador em ≈ 1 min, `curl` com 200 em cache > 6 min; R2 `POST /pages` + política liberada de novo + *Re-run all jobs* → 39631099098 verde → 200 às 16:31:13Z com `index-Cqfgl3da.js`; **confirmado pela API** (39631099098 `success`, tentativa 2, atualizada 16:30:41Z) e pela página (`Last-Modified` 16:30:35Z; hash servido idêntico); ciclo ≈ 7,5 min — ISSUE-04 fechado |
| Runbook — estrutura (P6) | precondições (12, 10 marcadas), *Promote* (11 passos com *Esperado*, *Leva*, *Desfaz-se por*), *Verify* (7), *Roll back* (R1–R5 com durações observadas), gatilhos (D-DP-03), ponto sem retorno nomeado ("não existe nesta release") |
| Smoke em staging — `web-desktop` (P5) | **parcial** — execução 2 do log: D1, D3, D4, D14 passam em staging; D7–D11 só como estado/texto no build local (execução 1, bundle byte-idêntico); D2 **não medido**; D5 (duração), D6, D12, D13 **não executados**: três tentativas automatizadas sem medida (rAF a 1–2 quadros/s sob automação; temporizadores normais); relato do dono do produto ("fluido") registrado como relato, não como medida — ISSUE-03 |
| Smoke em staging — `web-mobile` (P5) | **não executado** — nenhuma linha M1–M12; nenhum aparelho nomeado (I9) |
| NFR observados em staging | RNF02 (155 257 < 3 145 728) e RNF06 (certificado válido, 0 inseguros) observados; RNF01, NFR-0003, NFR-0008 e a contagem de 3 s **sem valor** |
| Registro contradito pela observação | uma imprecisão — o registro apresenta 39631099098 como *Re-run all jobs* "da execução verde" sem nomear o commit; a API devolve `head_sha` `2bee672` (push só de registro), tentativa 2 da execução criada às 16:02:11Z, ou seja, a reexecução da execução do push de `2bee672`, não de 39629837192; a lista de commits de `master` (`01-release.md`, `runbook.md` precondição 1 e passo 1) para em `c1e488b`; o conteúdo servido é o mesmo (hash idêntico) — ISSUE-18 |
| Crédito OSM / ODbL (D-DP-04, P5) | 0 ocorrências de "OpenStreetMap"/"ODbL" em `dist/index.html`, `index-Cqfgl3da.js`, `index-dgojskay.css` e na página servida em staging; D-DP-04 ratificado em `DOMAIN.md` (2026-10-21); DIV-DP-05 `resolved` |
| Decisões do dono do produto em `DOMAIN.md` (2026-10-21) | D23 (GitHub Pages); D-DP-04 ratificado; monitoramento manual (DIV-DP-08 `waived`); Google Fonts mantido (DIV-DP-14 `waived`; backlog); `href="/"` da marca aceito (DIV-DP-12 `waived`; backlog) — os dois itens constam de `SCOPE-BACKLOG.md`; `<a class="brand" href="/">` continua no HTML servido, como a decisão prevê |
| Feature flag / ordem de `REL-0003` (P8) | nenhuma flag, por projeto validado; ordem 1–2 confrontada com staging (push, falha de política, reexecução, ensaio de R1/R2); 3–5 por executar |
| Observabilidade (P7) | decisão do dono do produto (vigilância manual, RNF12); nenhum log capturado nesta execução além de cabeçalhos HTTP (sem conteúdo I6) |
| Comparação com o relatório anterior (§11) | blocker+error+warning = **1**, antes 2 — progresso; o único `error` restante (ISSUE-03) é ambiental: linhas humanas de aparelho e navegador |

## Issues

### ISSUE-01
- severity: blocker
- check: P1
- class: ambiental
- status: closed (reverificado)
- file: `600 Deploy/Output/race-lap-validation/01-release.md`
- location: seção *Proveniência*, linha *Evidência do pipeline*
- finding: fechado — 39627810079 `waiting` (`build` verde, `deploy` não aprovado) e 39631099098 `success` lidos na API; *asset* servido em staging com sha256 idêntico ao build local da árvore de `c41c6c3`.
- expected: nenhuma ação.

### ISSUE-02
- severity: error
- check: P3
- class: ambiental
- status: closed (reverificado)
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: *Promote* passo 7
- finding: fechado — a URL de staging responde 200 em HTTPS (`ssl_verify_result` 0) e o HTML referencia `index-Cqfgl3da.js` e `index-dgojskay.css`, ambos servidos.
- expected: nenhuma ação.

### ISSUE-03
- severity: error
- check: P5
- class: ambiental
- status: open (inalterado; reduzido ao que só um humano mede)
- file: `600 Deploy/Output/race-lap-validation/smoke.md`
- location: D2, D5 (duração), D6, D12, D13 e, em staging, D7–D11 (`web-desktop`); M1–M12 (`web-mobile`); `docs/lap-validation-device-log.md` "Tentativa de medições de ritmo"
- finding: das 26 linhas, 4 passaram em staging (D1, D3, D4, D14) e 5 só no build local em estado/texto (D7–D11); nenhuma medida de ritmo existe porque o navegador sob automação limita o `requestAnimationFrame` a 1–2 quadros/s (três tentativas, limitação ambiental, não da aplicação); o relato do dono do produto não é medida (I9); nenhuma linha M executada; nenhum aparelho nomeado; RNF01, NFR-0003, NFR-0008 e a contagem de 3 s sem valor.
- expected: no notebook de referência nomeado, janela em primeiro plano, contador de fps do navegador: D2, D5 (duração), D6, D12 e a repetição de D7–D11 sobre a URL de staging; D13 nos 4 navegadores; no celular de referência nomeado: M1–M12; tudo como execução 3 no mesmo log com aparelho, navegador, versão e medida.
- precondição humana: um testador com os aparelhos nomeados.

### ISSUE-04
- severity: error
- check: P6
- class: ambiental
- status: closed (reverificado)
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: precondição *Reversão ensaiada em staging*; *Roll back* R1, R2; `docs/lap-validation-device-log.md` *Ensaio de reversão R4*
- finding: fechado — R1 (despublicar → 404 em ≈ 1 min no navegador; 200 em cache de borda > 6 min) e R2 (republicar → 39631099098 `success`, tentativa 2, 200 às 16:31:13Z com o mesmo hash) ensaiados e confirmados pela API e pelo `Last-Modified` 16:30:35Z da página; as duas lições (cache de borda; re-liberação da política) entraram em R1/R2, na precondição de staging, em `REL-0003` e em `REL-0005`.
- expected: nenhuma ação.

### ISSUE-05
- severity: error
- check: P6
- class: defeito do registro
- status: closed (inalterado desde a rodada 2)
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: tabela *Alvo de reversão*; R1
- finding: fechado — caminho A declarado e ensaiado; R1 nomeia caminho e observável.
- expected: nenhuma ação.

### ISSUE-06
- severity: error
- check: P6
- class: defeito do registro
- status: closed (inalterado desde a rodada 2)
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: tabela *Promote* colunas *Leva* e *Desfaz-se por*
- finding: fechado — 11 de 11 passos com desfazer e duração.
- expected: nenhuma ação.

### ISSUE-07
- severity: warning
- check: P5
- class: defeito do registro
- status: closed (inalterado desde a rodada 2)
- file: `600 Deploy/Output/race-lap-validation/smoke.md`
- location: D14, M12
- finding: fechado — resultado único e decidível; 0 ocorrências de OSM/ODbL em `dist/` e na página de staging, reconferido.
- expected: nenhuma ação.

### ISSUE-08
- severity: warning
- check: P7
- class: ambiental → decidido
- status: closed (inalterado desde a rodada 4)
- file: `600 Deploy/Output/race-lap-validation/REL-0005-observability.md`
- location: seção *Qual alerta soaria*; DIV-DP-08
- finding: fechado — decisão de monitoramento manual em `DOMAIN.md` (2026-10-21); DIV-DP-08 `waived`.
- expected: nenhuma ação.

### ISSUE-09
- severity: info
- check: P8
- class: ambiental
- status: closed (inalterado desde a rodada 4)
- file: `600 Deploy/Output/race-lap-validation/REL-0003-rollout.md`
- location: seção *Ordem de operações*
- finding: fechado — ordem confrontada com staging; o passo de política do ambiente e a sua recorrência após despublicação estão registrados.
- expected: nenhuma ação.

### ISSUE-10
- severity: info
- check: P1
- class: ambiental
- status: closed (inalterado desde a rodada 3)
- file: `.nvmrc`
- location: raiz do repositório
- finding: fechado — `.nvmrc` com `24`, lida pelo workflow.
- expected: nenhuma ação.

### ISSUE-11
- severity: info
- check: P5
- class: decisão humana
- status: closed (inalterado desde a rodada 4)
- file: `600 Deploy/Output/race-lap-validation/98-divergences.md`
- location: DIV-DP-05; `smoke.md` D14/M12
- finding: fechado — D-DP-04 ratificado em `DOMAIN.md`; DIV-DP-05 `resolved`.
- expected: nenhuma ação.

### ISSUE-12
- severity: error
- check: P5
- class: defeito do registro
- status: closed (inalterado desde a rodada 3)
- file: `600 Deploy/Output/race-lap-validation/smoke.md`
- location: D4, D5, D6, D8, M4, M5, M6
- finding: fechado — as linhas esperam só a volta de treino; D4 confirmado em staging.
- expected: nenhuma ação.

### ISSUE-13
- severity: info
- check: P5
- class: registro desatualizado por um evento
- status: closed (inalterado desde a rodada 4)
- file: `600 Deploy/Output/race-lap-validation/98-divergences.md`
- location: DIV-DP-06
- finding: fechado — DIV-DP-06 descreve as execuções 1 e 2 do log e as três tentativas de medição.
- expected: nenhuma ação (a linha correlata de `REL-0004` está em ISSUE-19).

### ISSUE-14
- severity: info
- check: P1
- class: registro desatualizado por um evento
- status: closed (inalterado desde a rodada 4)
- file: `600 Deploy/Output/race-lap-validation/01-release.md`
- location: *Proveniência*; DIV-DP-01; `REL-0002` coluna *Reversão*
- finding: fechado — `npm ci` registrado como fato; caminho B igual ao runbook.
- expected: nenhuma ação.

### ISSUE-15
- severity: info
- check: P3
- class: decisão humana
- status: closed (decidido)
- file: `index.html`
- location: linha 12, `<a class="brand" href="/">`; DIV-DP-12; `DOMAIN.md` *Link da marca*; `SCOPE-BACKLOG.md`
- finding: fechado — o dono do produto aceitou o `href="/"` nesta release (`DOMAIN.md`, 2026-10-21); DIV-DP-12 `waived` com decisão e data; correção (href relativo) em `SCOPE-BACKLOG.md`; o HTML servido em staging ainda contém o `href="/"`, como a decisão prevê.
- expected: nenhuma ação nesta release.

### ISSUE-16
- severity: info
- check: P1
- class: registro desatualizado por um evento
- status: closed (reverificado)
- file: `600 Deploy/Output/race-lap-validation/01-release.md`
- location: *Evidência do pipeline*; `runbook.md` precondição "primeira execução verde" e passo 10; `REL-0003` ordem 4; `REL-0005` tabela do registro de implantações
- finding: fechado — as quatro localizações dizem 39629830827 cancelada pelo grupo `pages`, 39627810079 como a execução de produção mais antiga à espera (API: `waiting`, confirmado) e remetem os números em vigor à aba Actions; o registro diz a pendência 4 do log reduzida a D2.
- expected: nenhuma ação (o commit da execução 39631099098 está em ISSUE-18).

### ISSUE-17
- severity: info
- check: P5
- class: decisão humana
- status: closed (decidido)
- file: `src/style.css`
- location: linha 1, `@import` de `fonts.googleapis.com`; DIV-DP-14; `DOMAIN.md` *Google Fonts*; `SCOPE-BACKLOG.md`; `smoke.md` D9
- finding: fechado — o dono do produto manteve a dependência nesta release (`DOMAIN.md`, 2026-10-21); DIV-DP-14 `waived`; embutir as fontes em `SCOPE-BACKLOG.md`; D9 anota que a requisição é do carregamento e não conta para NFR-0004.
- expected: nenhuma ação nesta release.

### ISSUE-18
- severity: info
- check: P1
- class: registro desatualizado por um evento
- status: new
- file: `600 Deploy/Output/race-lap-validation/01-release.md`
- location: *Proveniência*, linhas *Commits que o `master` enviado contém* e *Evidência do pipeline*; `runbook.md` tabela de nomes (`<sha>`), precondição 1, passo 1, precondição "primeira execução verde"; `REL-0005` tabela (linha 39631099098, coluna *Commit*); `REL-0003` parágrafo *Tudo isto existe*
- finding: a execução 39631099098 tem `head_sha` `2bee672` (push só de registro, ramo `staging`, criada 16:02:11Z) e é a tentativa 2 dessa execução, não um *Re-run all jobs* de 39629837192 como a narrativa sugere; a lista de commits de `master` para em `c1e488b` enquanto a ponta enviada é pelo menos `2bee672` (localmente `f16d65a`), de modo que o passo 1 do runbook (`git log --oneline -4` mostra `c1e488b`, `162b1b3`, `c1f7f28`, `c41c6c3`) já não corresponde ao que o executor verá; a proveniência não é afetada (asset servido idêntico ao build de `c41c6c3`).
- expected: as localizações nomeiam `2bee672` como o commit de 39631099098 (tentativa 2 da execução do push de `2bee672`), acrescentam `2bee672` (e `f16d65a`, se enviado) à lista de commits só de registro que não tocam a árvore verificada, e o passo 1 do runbook pede "o último commit de `master` e, entre os anteriores, `c41c6c3`" em vez de quatro hashes fixos; `version:` movido.

### ISSUE-19
- severity: info
- check: P5
- class: registro desatualizado por um evento
- status: new
- file: `600 Deploy/Output/race-lap-validation/REL-0004-mobile.md`
- location: seção *Dispositivos de referência* (amostra intocada, `version: 1.0.1`); `docs/lap-validation-device-log.md` *Pendências para uma execução humana*, item 4
- finding: `REL-0004` diz "Falta a execução 2, em staging" e "nenhuma linha `M*` executada", mas a execução 2 (staging: D1, D3, D4, D14) existe e o que falta é a execução 3 humana nos aparelhos nomeados; o item 4 das pendências do log ainda lista "D1, D2, D3" embora D1 e D3 tenham passado em staging (o registro já o diz reduzido a D2, mas o log não).
- expected: `REL-0004` nomeia a execução 2 e diz que falta a execução 3 (D2, D5 duração, D6, D12, D13 e M1–M12 nos aparelhos nomeados), `version:` movido; o condutor do loop reduz o item 4 do log a D2 (fora da cerca de escrita do gerador, §14).

## Promotion question

Não há pergunta de promoção: o veredito é FAIL (ISSUE-03, `error`) e nenhuma promoção é proposta (D-DP-06). **O único item que separa esta release de SUCCESS é a execução humana das linhas de aparelho e navegador do `smoke.md` (D2, D5 duração, D6, D12, D13, D7–D11 em staging e M1–M12), que nenhuma rodada do gerador fecha** — o registro de release não tem defeito em aberto (ISSUE-18 e ISSUE-19 são `info`, desatualizações por evento). Passos humanos que restam, em ordem:

1. Nomear o notebook e o celular de referência; em `https://edumatosr6-svg.github.io/kartle-staging/`, janela em primeiro plano, contador de fps do navegador: D2, D5 (duração), D6, D7–D11, D12; D13 nos 4 navegadores; M1–M12 no celular; registrar como execução 3 em `docs/lap-validation-device-log.md` com aparelho, navegador, versão e medida (ISSUE-03); reduzir o item 4 das pendências do log a D2 (ISSUE-19).
2. Próxima rodada do gerador (info, não bloqueia): nomear `2bee672` como commit de 39631099098 e atualizar a lista de commits e o passo 1 do runbook (ISSUE-18); `REL-0004` com a execução 2 feita e a 3 pendente (ISSUE-19); `version:` movido.
3. Reexecutar esta validação; só então a pergunta de promoção é aberta ao dono do produto, com `600 Deploy/Output/race-lap-validation/runbook.md` (promoção = *Approve and deploy* no passo 10, na execução mais recente de `kartle` com `build` verde; ponto sem retorno: não existe nesta release). **Não aprovar** o `deploy` de produção antes disso.
