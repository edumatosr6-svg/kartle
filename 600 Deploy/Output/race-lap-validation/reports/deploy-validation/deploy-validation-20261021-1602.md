---
stage: deploy
feature: race-lap-validation
verdict: FAIL
generated: 2026-10-21T16:02:19Z
environment: staging — `https://edumatosr6-svg.github.io/kartle-staging/` (GitHub Pages, repositório `edumatosr6-svg/kartle-staging`, D23)
commit: c41c6c3ddf8ada690a2f2b1581ee87700c837268 (árvore verificada); ponta publicada `c1e488b` (só registro)
counts: {blocker: 0, error: 2, warning: 0, info: 3, divergence: 0}
seed: {revision: 2, digest: ee91c5706be1}
upstream: {stage: test, version: n/a}
previous: deploy-validation-20261021-1501.md
population: {previous-issues: 11, version-moved: [01-release.md, runbook.md, smoke.md, REL-0001-config.md, REL-0002-migration.md, REL-0003-rollout.md, REL-0004-mobile.md, REL-0005-observability.md, 98-divergences.md, 97-changelog.md], new-evidence: [docs/lap-validation-device-log.md execução 2], sampled: [nenhum — os 10 arquivos moveram `version:` desde o relatório anterior; não há arquivo intocado a amostrar]}
feedbacks: []
---

# Relatório de validação de deploy — race-lap-validation (revalidação, rodada 4)

## Evidence

| Prova | Resultado |
|---|---|
| Commit verificado nomeado | sim — `c41c6c3ddf8ada690a2f2b1581ee87700c837268` em `01-release.md` *Proveniência*, `runbook.md` tabela de nomes e precondição 1, `REL-0003` etapa 1; ponta publicada `c1e488b` declarada como registro-apenas (nenhum comando `git` executado por esta validação) |
| Construído pelo pipeline a partir desse commit | **sim, observado** — API pública do Actions (leitura, sem token): `kartle` execução 39627810079 → `waiting`, conclusão `None`, `head_sha` `162b1b3`, tentativa 1 (`build` verde, `deploy` à espera do revisor; **não aprovado**); `kartle-staging` execução 39629837192 → `completed success`, `head_sha` `c1e488b`, tentativa 2 (reexecução), atualizada 15:55:21Z |
| Artefato de staging = árvore verificada | sim — `assets/index-Cqfgl3da.js` servido em staging: 200, 574 785 bytes, sha256 `ec93a23f87961a4a…`; `assets/index-dgojskay.css`: 200, 11 407 bytes, sha256 `cb10bfa773bb92f2…`; **idênticos byte a byte** ao `dist/` local construído da árvore de `c41c6c3` (mesmos hashes); o `index.html` servido tem 7 094 bytes = 7 064 locais + 30 (duas ocorrências de `/kartle-staging`), como `01-release.md` prevê |
| Artefato fresco | sim — `index.html` de staging com `Last-Modified: 2026-10-21 16:02:58 GMT`; última edição de `src/`/`tests/` em 14:03:26Z; o conteúdo dos *assets* é o da árvore verificada (linha acima) |
| Veredito de testes mais novo | SUCCESS — `test-validation-20261021-1411.md`, 170/170, `fresh: true`, seed `{revision: 2, digest: ee91c5706be1}` igual ao desta validação |
| Tamanho (RNF02, limite 3 145 728 bytes) | `measure_dist.py dist` (com `-I`): 3 arquivos, 593 256 bytes brutos, 152 903 gzip, `within_limit=True`, saída 0 — igual a `01-release.md`, `runbook.md` passo 5, `REL-0005`; em staging, execução 2 do log registra `transferSize` total 155 257 bytes |
| Segredos no registro, no workflow, no log de aparelho e neste relatório | nenhum valor — varredura por `ghp_`, `github_pat_`, `sk-`, AKIA, bloco PEM, JWT, `secrets.*`, `password=` em 10 arquivos do registro, `pages.yml` e `docs/lap-validation-device-log.md`: 0 ocorrências; `pages.yml` sem `env:` e sem `secrets.*` (D-DP-05); a correção pela API registrada em `01-release.md`/DIV-DP-13 cita o endpoint, nenhum token |
| Variáveis que o cliente lê vs `REL-0001` | 0 = 0 — nenhuma variável; as duas entradas (nome do repositório, ambiente `github-pages`) vêm do contexto da execução |
| Instalação em staging (P3) | **sim** — `curl` `https://edumatosr6-svg.github.io/kartle-staging/`: HTTP 200, `ssl_verify_result` 0, `Content-Type: text/html; charset=utf-8`, `Cache-Control: max-age=600` (igual à regra de `REL-0003`); o HTML servido referencia `/kartle-staging/assets/index-Cqfgl3da.js` e `/kartle-staging/assets/index-dgojskay.css` (passo 7 do runbook, observável cumprido) |
| Passo manual não descrito pelo runbook (P3) | nenhum restante — a política de ramos do ambiente `github-pages` de staging, descoberta nas execuções falhadas, está como precondição explícita do runbook, linha de `REL-0003`, modo de falha de `REL-0005` e DIV-DP-13 `resolved` |
| Cabeças de migração / upgrade em cópia / backfill | não se aplica — sem banco (`REL-0002`, DM-0001, DM-0002); leitor v1 provado por `CHK-TEST-0009-01/-03` |
| Downgrade / reversão demonstrada (P6) | **não** — R1 (*Unpublish site*) e R2 não ensaiados em `kartle-staging`; o próprio runbook o declara (*Roll back*, nota final) — ISSUE-04 |
| Runbook — estrutura (P6) | precondições, *Promote* (11 passos com *Esperado*, *Leva*, *Desfaz-se por*), *Verify* (7), *Roll back* (R1–R5), gatilhos (D-DP-03), ponto sem retorno nomeado ("não existe nesta release"; `push --force` o único ato irreversível, não feito por nenhum passo) |
| Smoke em staging — `web-desktop` (P5) | **parcial** — execução 2 do log (operador: sessão do pipeline, painel em segundo plano, 467×1218): D1 passa (`https:`, `isSecureContext`, h2, 0 recursos `http://`), D3 passa (155 257 bytes; hashes iguais ao build local), D4 passa (`synthetic`; um botão "volta de treino"), D14 passa (0 ocorrências de OSM/ODbL na página; 0 em `dist/`, reconferido nesta execução); D2 **não medido**; D5–D13 **não executados** em staging (D5, D7–D11 só como estado/texto no build local, execução 1) |
| Smoke em staging — `web-mobile` (P5) | **não executado** — nenhuma linha M1–M12; nenhum aparelho nomeado (I9) |
| NFR observados em staging | RNF02 (155 257 < 3 145 728) e RNF06 (certificado válido, 0 inseguros) observados; RNF01, NFR-0003, NFR-0008 e a contagem de 3 s **sem valor** |
| Registro contradito pela observação | uma linha — `01-release.md` *Evidência do pipeline*, `runbook.md` precondição "primeira execução verde" e passo 10, `REL-0003` ordem 4, `REL-0005` tabela: execução 39629830827 (`c1e488b`) "pendente atrás" → API: `completed cancelled`, atualizada 16:02:10Z; e `Last-Modified` de staging (16:02:58Z) posterior à reexecução de 39629837192 (15:55:21Z) — coerente com um terceiro push (commit só de registro) que entrou na fila do grupo `pages` e cancelou a execução pendente; o conteúdo servido é o mesmo (hashes acima) — ISSUE-16 |
| Elementos observáveis do smoke na página servida | sim — `track-status`, `lap-offer`, `lap-state`, `lap-result`, `lap-countdown`, `lap-paused` presentes no HTML de staging |
| `href="/"` da marca (ISSUE-15) | presente no HTML servido em staging (`<a class="brand" href="/">`); DIV-DP-12 `open`; nenhuma decisão registrada |
| Feature flag / ordem de `REL-0003` (P8) | nenhuma flag, por projeto validado; a ordem foi confrontada com a primeira execução em staging e o passo que faltava (política do ambiente) foi acrescentado — ISSUE-09 fechado |
| Observabilidade (P7) | decisão do dono do produto em `DOMAIN.md` (vigilância manual, sem monitor externo, RNF12); DIV-DP-08 `waived`; registro de implantações = histórico do Actions com as primeiras entradas; nenhum log capturado nesta execução além de cabeçalhos HTTP (sem conteúdo I6) |
| Comparação com o relatório anterior (§11) | blocker+error+warning = **2**, antes 5 — progresso; os dois abertos (ISSUE-03, ISSUE-04) são ambientais: testador com aparelhos nomeados e ensaio humano de R1/R2 |

## Issues

### ISSUE-01
- severity: blocker
- check: P1
- class: ambiental
- status: closed (reverificado)
- file: `600 Deploy/Output/race-lap-validation/01-release.md`
- location: seção *Proveniência*, linha *Evidência do pipeline*
- finding: fechado — artefato construído pelo pipeline observado pela API do Actions (39627810079 `build` verde/`deploy` waiting em `kartle`; 39629837192 `success` em `kartle-staging`); *assets* servidos em staging idênticos (sha256) ao build local da árvore de `c41c6c3`.
- expected: nenhuma ação.

### ISSUE-02
- severity: error
- check: P3
- class: ambiental
- status: closed (reverificado)
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: *Promote* passo 7
- finding: fechado — `https://edumatosr6-svg.github.io/kartle-staging/` responde 200 em HTTPS com certificado válido e o `index.html` servido referencia `/kartle-staging/assets/index-Cqfgl3da.js` e `.css`, ambos 200.
- expected: nenhuma ação.

### ISSUE-03
- severity: error
- check: P5
- class: ambiental
- status: open (reduzido: D1, D3, D4, D14 executados em staging)
- file: `600 Deploy/Output/race-lap-validation/smoke.md`
- location: D2, D5–D13 (`web-desktop`); M1–M12 (`web-mobile`); `docs/lap-validation-device-log.md` execução 2
- finding: das 26 linhas, 4 passaram em staging (D1, D3, D4, D14, por operador de sessão em painel em segundo plano — válidas porque são de carga, estrutura e texto); D2 não medido; D5–D13 não executados em staging; nenhuma linha M executada; nenhum aparelho nomeado; RNF01, NFR-0003, NFR-0008 e a contagem de 3 s sem valor observado (I9).
- expected: D2, D5–D13 e M1–M12 executados em `https://edumatosr6-svg.github.io/kartle-staging/`, janela em primeiro plano, no notebook e no celular de referência nomeados, D13 nos 4 navegadores, registrados como execução 3 no mesmo log com aparelho, navegador, versão e medida.
- precondição humana: um testador com os aparelhos nomeados.

### ISSUE-04
- severity: error
- check: P6
- class: ambiental
- status: open (inalterado; agora possível)
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: *Roll back* R1, R2; nota final da seção
- finding: R1 (*Unpublish site*) e R2 (espera do cache) não foram ensaiados em `kartle-staging`, embora exista execução verde (39629837192) e a URL esteja publicada; o runbook declara o ensaio como pendente.
- expected: em `edumatosr6-svg/kartle-staging`, Settings → Pages → *Unpublish site*; após até 10 min, `https://edumatosr6-svg.github.io/kartle-staging/` responde 404 (R3 caminho A); depois republicar (*Re-run all jobs* da execução verde ou `git push staging master:staging`) e confirmar 200 com o mesmo `<hash>`; registrar em `docs/lap-validation-device-log.md` (R4).
- precondição humana: o executor do runbook ensaia R1/R2 sobre staging.

### ISSUE-05
- severity: error
- check: P6
- class: defeito do registro
- status: closed (inalterado desde a rodada 2)
- file: `600 Deploy/Output/race-lap-validation/runbook.md`
- location: tabela *Alvo de reversão*; R1
- finding: fechado — alvo da primeira release declarado (caminho A) e R1 nomeia caminho e observável.
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
- finding: fechado — resultado único e decidível; 0 ocorrências de OSM/ODbL em `dist/` e na página de staging.
- expected: nenhuma ação.

### ISSUE-08
- severity: warning
- check: P7
- class: ambiental → decidido
- status: closed (reverificado)
- file: `600 Deploy/Output/race-lap-validation/REL-0005-observability.md`
- location: seção *Qual alerta soaria*; `98-divergences.md` DIV-DP-08
- finding: fechado — decisão do dono do produto em `DOMAIN.md` (2026-10-21): vigilância manual conforme o runbook, nenhum monitor externo nesta release (RNF12); DIV-DP-08 `waived` com decisão e data; *Verify* 1 e 7 são a vigilância.
- expected: nenhuma ação.

### ISSUE-09
- severity: info
- check: P8
- class: ambiental
- status: closed (reverificado)
- file: `600 Deploy/Output/race-lap-validation/REL-0003-rollout.md`
- location: seção *Ordem de operações*; tabela *Staging e produção*
- finding: fechado — a ordem foi confrontada com a primeira execução em staging; a divergência encontrada (política de ramos do ambiente) foi registrada como passo, risco e DIV-DP-13.
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
- status: closed (reverificado)
- file: `600 Deploy/Output/race-lap-validation/98-divergences.md`
- location: DIV-DP-05; `smoke.md` D14/M12
- finding: fechado — D-DP-04 ratificado em `DOMAIN.md` (2026-10-21); DIV-DP-05 `resolved`; D14/M12 inalteradas e aprovadas em staging.
- expected: nenhuma ação.

### ISSUE-12
- severity: error
- check: P5
- class: defeito do registro
- status: closed (inalterado desde a rodada 3)
- file: `600 Deploy/Output/race-lap-validation/smoke.md`
- location: D4, D5, D6, D8, M4, M5, M6
- finding: fechado — as linhas esperam só a volta de treino; D4 confirmado em staging (`synthetic`; um botão "volta de treino").
- expected: nenhuma ação.

### ISSUE-13
- severity: info
- check: P5
- class: registro desatualizado por um evento
- status: closed (reverificado)
- file: `600 Deploy/Output/race-lap-validation/98-divergences.md`
- location: DIV-DP-06; `REL-0004-mobile.md` *Dispositivos de referência*
- finding: fechado — DIV-DP-06 e `REL-0004` dizem que o log existe com a execução 1 (local, parcial) e que falta a execução em staging nos aparelhos nomeados; `version:` movido.
- expected: nenhuma ação.

### ISSUE-14
- severity: info
- check: P1
- class: registro desatualizado por um evento
- status: closed (reverificado)
- file: `600 Deploy/Output/race-lap-validation/01-release.md`
- location: *Proveniência*; `98-divergences.md` DIV-DP-01; `REL-0002-migration.md` coluna *Reversão*
- finding: fechado — `npm ci` saída 0 registrado como fato; `REL-0002` descreve o caminho B como *Re-run all jobs* da execução verde anterior, igual ao runbook; `version:` movido (1.0.1).
- expected: nenhuma ação.

### ISSUE-15
- severity: info
- check: P3
- class: defeito de aplicação observável só no Pages de projeto — devido ao estágio de código
- status: open (inalterado; confirmado em staging)
- file: `index.html`
- location: linha 12, `<a class="brand" href="/">`; `98-divergences.md` DIV-DP-12
- finding: o HTML servido em `https://edumatosr6-svg.github.io/kartle-staging/` contém `href="/"`, que leva a `https://edumatosr6-svg.github.io/` e não a `/kartle-staging/`; nenhuma linha de fumaça depende dele; nenhuma decisão do dono do produto registrada.
- expected: decisão do dono do produto (entra na próxima rodada do estágio de código antes ou depois desta release), registrada em `97-changelog.md` ou `SCOPE-BACKLOG.md`.

### ISSUE-16
- severity: info
- check: P1
- class: registro desatualizado por um evento
- status: new
- file: `600 Deploy/Output/race-lap-validation/01-release.md`
- location: *Proveniência*, linha *Evidência do pipeline*; `runbook.md` precondição "primeira execução verde observada" e passo 10; `REL-0003-rollout.md` ordem 4 e parágrafo *Tudo isto existe*; `REL-0005-observability.md` tabela do registro de implantações; `docs/lap-validation-device-log.md` execução 2, *Pendências* item 4
- finding: o registro diz que a execução 39629830827 (`c1e488b`) está "pendente atrás" da 39627810079; a API devolve `completed cancelled` (16:02:10Z), e o `Last-Modified` de staging (16:02:58Z) é posterior à reexecução registrada de 39629837192 (15:55:21Z) — coerente com o terceiro push (commit só de registro) que entrou no grupo de concorrência `pages`, cancelou a execução pendente e produziu novas execuções nos dois repositórios, cujos números o registro não nomeia; o conteúdo servido é o mesmo (hashes dos *assets* idênticos); o item 4 das *Pendências* do log ("URL publicada com HTTPS: D1, D2, D3") está superado para D1 e D3.
- expected: na próxima rodada, as quatro localizações nomeiam as execuções em vigor (número, commit, estado) lidas na aba Actions, dizem que 39629830827 foi cancelada pela fila do grupo `pages`, e o log reduz a pendência 4 a D2; `version:` movido.

### ISSUE-17
- severity: info
- check: P5
- class: comportamento observado em staging sem linha de fumaça — decisão humana
- status: new
- file: `src/style.css`
- location: linha 1, `@import url('https://fonts.googleapis.com/css2?…')`; `docs/lap-validation-device-log.md` execução 2, observação 1; `REL-0005-observability.md` seção *O que a release acrescenta*
- finding: ao carregar, a página de staging faz uma requisição a `fonts.googleapis.com` (dependência pré-existente, não desta feature); nenhuma linha de `smoke.md` a observa e `REL-0005` ("nada que saia do navegador") fala só do que a feature acrescenta; é uma requisição a terceiro no carregamento (RNF10, I6) com fonte do sistema como alternativa offline; NFR-0004 não é afetado (0 requisições entre largada e resultado, execução 1).
- expected: decisão do dono do produto — manter e registrar em `DOMAIN.md`/`SCOPE-BACKLOG.md`, ou embutir as fontes no build numa rodada do estágio de código; nenhuma mudança no registro desta release até lá.

## Promotion question

Não há pergunta de promoção: o veredito é FAIL (ISSUE-03 e ISSUE-04, `error`) e nenhuma promoção é proposta (D-DP-06). Os dois itens abertos são **ambientais** — exigem um humano com aparelhos e um humano a ensaiar a reversão; nenhuma rodada do gerador os fecha. Passos humanos que restam, em ordem:

1. Ensaiar R1/R2 em `edumatosr6-svg/kartle-staging`: Settings → Pages → *Unpublish site*; confirmar que `https://edumatosr6-svg.github.io/kartle-staging/` responde 404 em até 10 min (R3, caminho A); republicar (*Re-run all jobs* da execução verde ou `git push staging master:staging`) e confirmar 200 com `index-Cqfgl3da.js`; registrar como R4 em `docs/lap-validation-device-log.md` (ISSUE-04).
2. Executar em staging, janela em primeiro plano, no notebook de referência nomeado: D2, D5–D12; nos 4 navegadores: D13; no celular de referência nomeado: M1–M12; registrar como execução 3 no log com aparelho, navegador, versão e medida (ISSUE-03).
3. Decidir o `href="/"` da marca (ISSUE-15) e a dependência `fonts.googleapis.com` (ISSUE-17); registrar em `DOMAIN.md` ou `SCOPE-BACKLOG.md`.
4. Próxima rodada do gerador: atualizar as execuções em vigor (39629830827 cancelada; números novos lidos na aba Actions) nas quatro localizações de ISSUE-16, com `version:` movido.
5. Reexecutar esta validação; só então a pergunta de promoção é aberta ao dono do produto, com `600 Deploy/Output/race-lap-validation/runbook.md` (promoção = *Approve and deploy* no passo 10; ponto sem retorno: não existe nesta release). **Não aprovar** o `deploy` de produção antes disso.
