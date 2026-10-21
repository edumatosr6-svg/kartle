---
title: Runbook — promover, verificar e reverter a release de validação de volta
feature: race-lap-validation
stage: deploy
status: draft
version: 1.1.4
sources: [DM-0001, DES-0009, DES-0011, NFR-0003, NFR-0004, TEST-0009]
---

# Runbook

Para quem não escreveu a release. Executar da raiz do repositório, com todo caminho entre aspas. Nenhum passo é
executado por um loop: cada um é de um humano, e a promoção a produção é sempre do dono do produto (D-DP-06). O
provedor é o **GitHub Pages** (D23): o pipeline é `.github/workflows/pages.yml`, a publicação é um push e a promoção
é um clique de aprovação no ambiente `github-pages` do repositório de produção. Nomes usados abaixo:

| Nome | Valor (não é segredo) |
|---|---|
| dono do produto | conta GitHub `edumatosr6-svg` (revisor obrigatório do ambiente `github-pages` de produção) |
| repositório de **produção** | `edumatosr6-svg/kartle` — `https://github.com/edumatosr6-svg/kartle` (público), remoto local `origin`, ramo `master`, site `https://edumatosr6-svg.github.io/kartle/`; execuções em `https://github.com/edumatosr6-svg/kartle/actions` |
| repositório de **staging** | `edumatosr6-svg/kartle-staging` — `https://github.com/edumatosr6-svg/kartle-staging` (público), remoto local `staging`, ramo `staging`, site `https://edumatosr6-svg.github.io/kartle-staging/`; execuções em `https://github.com/edumatosr6-svg/kartle-staging/actions` |
| `<sha>` | o hash do commit da árvore verificada: `c41c6c3ddf8ada690a2f2b1581ee87700c837268`. A ponta de `master` enviada é `c1e488b` (depois de `162b1b3` e `c1f7f28`); os três commits posteriores só acrescentam o workflow, `.nvmrc`, o log de aparelho, este registro e `DOMAIN.md` — a árvore de `src/`, `tests/`, `index.html` e do lockfile é a de `<sha>` |
| `<hash>` | o hash de conteúdo no nome do *asset* (`assets/index-<hash>.js`), impresso no passo *Build* da execução que se publica; no build local, `Cqfgl3da` |
| "execução verde" | uma execução do workflow `pages` com os dois trabalhos (`build`, `deploy`) concluídos com sucesso |

Os números e resultados das **primeiras** execuções do Actions (2026-10-21) constam das precondições abaixo como
evidência de que o pipeline construiu o artefato; os das execuções seguintes são lidos por quem executa na aba Actions
do repositório em causa e registados no log de aparelho e no relatório de validação. Cada push posterior (inclusive um
push só de registro, como `2bee672`) cria uma execução nova nos dois repositórios e, pelo grupo de concorrência `pages`,
**cancela** a execução de produção que ainda esperava atrás da mais antiga — por isso **as execuções em vigor são sempre
as que a aba Actions mostra**, nunca as copiadas deste registro.

Artefato: `dist/` (HTML, JS e CSS estáticos), construído **pelo workflow** a partir de `<sha>`. Não há banco,
migração de dado nem aplicativo nativo. Nesta release a página oferece só a **volta de treino** (DES-0009).

**Alvo de reversão.** Esta é a **primeira release**: produção nunca serviu um `dist/`. Há três caminhos de reversão,
e cada passo de *Roll back* nomeia qual aplica:

| Caminho | Quando se aplica | O que R1 faz |
|---|---|---|
| **A — despublicar** | primeira release (esta): nenhuma execução verde anterior | Settings → Pages → menu "…" ao lado da URL do site → **Unpublish site**; o site volta a **não publicado** (a URL responde 404 do GitHub) |
| **B — reexecutar a última execução verde anterior** | releases seguintes: existe uma execução verde do commit anterior | Actions → workflow `pages` → execução verde do commit anterior → **Re-run all jobs**; o workflow reconstrói esse commit (`npm ci` do lockfile, `npm test`, build) e pede a aprovação do revisor; aprovar |
| **C — reverter e reconstruir** (DM-0001, *Plano de migração*) | quando B não existe ou a execução anterior já não pode ser reexecutada (retenção do Actions, 90 dias) e há commit anterior à feature | `git revert <sha> && git push origin master`; a execução nova roda `npm test` e o build na árvore revertida e pede aprovação; aprovar |

Nesta release só o caminho A existe; B passa a existir na release seguinte, quando a execução verde desta for "a
anterior".

## Preconditions

- [x] **Commit verificado existe**: `c41c6c3ddf8ada690a2f2b1581ee87700c837268` (`master`), a árvore que o veredito de
      testes verificou; `npm ci` (saída 0), `npm test` (170 aprovados) e `npm run build` (saída 0) reexecutados nesse
      commit (relatório de validação de deploy mais novo). Quem executa confere: `git log --oneline -4` na máquina
      mostra `c1e488b`, `162b1b3`, `c1f7f28`, `c41c6c3` e `git status` não acusa modificação em `src/`, `tests/`,
      `index.html`, `package.json`, `package-lock.json`.
- [x] Veredito de testes `SUCCESS`: `500 Tests/Output/race-lap-validation/reports/test-validation/test-validation-20261021-1411.md`
      (ou o relatório mais novo que cite o hash acima).
- [ ] Validação de staging `SUCCESS`: relatório em `600 Deploy/Output/race-lap-validation/reports/deploy-validation/`
      — **aguarda a próxima execução do validador**. O mais novo, `deploy-validation-20261021-1602.md`, é `FAIL`:
      confirmou a execução verde em `kartle-staging`, a URL de staging e os *assets* idênticos ao build local, e deixou
      abertos o ensaio de R1/R2 (feito depois dele — precondição abaixo) e as linhas humanas do `smoke.md` (ISSUE-03).
- [x] Histórico de migração: **não se aplica** — não há banco; a única revisão é o arquivo de pista `schemaVersion` 2,
      empacotado no bundle (`REL-0002`).
- [x] Feature flag: **não há** (DES-0007; `01-release.md`); a feature fica ativa ao servir o `index.html` novo.
- [x] **Repositório de produção `edumatosr6-svg/kartle` criado no GitHub** (público), remoto `origin`, `master` enviado
      (2026-10-21, dono do produto); Settings → Pages → *Build and deployment* → *Source* = **GitHub Actions**
      (`build_type: workflow`); Settings → Environments → `github-pages` → **Required reviewers** = `edumatosr6-svg`
      (DIV-DP-10 `resolved`). Nesse ambiente, *Deployment branches and tags* fica na restrição que o GitHub cria por
      padrão — **só o ramo padrão (`master`) pode implantar** — e assim se mantém: é a segunda tranca da produção,
      ao lado do revisor. Nenhuma credencial é configurada: o Pages usa o token OIDC da execução (D-DP-05).
- [x] **Repositório de staging `edumatosr6-svg/kartle-staging` criado** (público), Settings → Pages → *Source* =
      **GitHub Actions**, **sem** revisor no ambiente; remoto local `staging` apontando para ele; `master` enviado como
      ramo `staging` (2026-10-21) (DIV-DP-11 `resolved`). **E** Settings → Environments → `github-pages` →
      *Deployment branches and tags* = **No restriction** (ou acrescentar o ramo `staging`): o ambiente `github-pages`
      que o GitHub cria ao ativar o Pages vem restrito ao ramo padrão, e sem este passo o trabalho `deploy` de um push
      em `staging` **falha com zero passos executados** (observado nas execuções 39627817908 e 39629837192 de
      2026-10-21; `REL-0005`, modos de falha). Resultado observável: um push em `staging` produz um trabalho `deploy`
      que executa os seus passos e publica. Feito em 2026-10-21 (DIV-DP-13 `resolved`). **Atenção após uma
      despublicação**: republicar o site (`POST /repos/edumatosr6-svg/kartle-staging/pages`, o equivalente a reativar o
      Pages em Settings → Pages) **recria o ambiente `github-pages` com a política padrão** (só o ramo padrão) — a
      liberação tem de ser **refeita** antes do *Re-run all jobs*, senão o `deploy` volta a falhar com zero passos
      (observado no ensaio de R1/R2 de 2026-10-21, abaixo).
- [x] **Primeira execução verde do workflow `pages` observada** nos dois repositórios (2026-10-21): em `kartle-staging`,
      execução **39629837192** (commit `c1e488b`), reexecutada após o passo anterior — `build` concluído e `deploy`
      concluído; `https://edumatosr6-svg.github.io/kartle-staging/` responde **200 em HTTPS** com certificado válido;
      depois do ensaio de reversão, a execução **39631099098** (republicação, *Re-run all jobs*) voltou a ficar verde com
      o mesmo `<hash>` `Cqfgl3da`. Em `kartle`, execução **39627810079** (commit `162b1b3`): `build` concluído e `deploy`
      em *Waiting* à espera do revisor (**não aprovado**; não aprovar antes do passo 9) — é a execução de produção **mais
      antiga ainda à espera**; a execução **39629830827** (commit `c1e488b`) foi **cancelada** pelo grupo de concorrência
      `pages` quando um push posterior a substituiu (lido pela API em 2026-10-21 16:02Z). Os pushes só de registro
      (`2bee672`) criaram execuções mais novas nos dois repositórios: **os números em vigor são lidos na aba Actions**.
      Nada foi promovido.
- [x] **Reversão ensaiada em staging** (R1/R2 sobre `kartle-staging`, 2026-10-21, registrada como *Ensaio de reversão
      R4* em `docs/lap-validation-device-log.md`): R1 despublicar às 16:23:52Z → 404 do GitHub no navegador em ≈ 1 min,
      enquanto `curl` continuou a receber 200 em cache por mais de 6 min (`max-age=600`); R2 republicar (`POST /pages`,
      política do ambiente liberada de novo, *Re-run all jobs* → execução 39631099098 verde) → 200 às 16:31:13Z com o
      mesmo `assets/index-Cqfgl3da.js`. Ciclo completo ≈ 7,5 min, dominado pelo cache. Este era o ensaio exigido antes
      da pergunta de promoção (passo 9).
- [ ] `docs/lap-validation-device-log.md` com os roteiros E2E-01 a E2E-11 registrados **em staging, nos aparelhos
      nomeados** (27 critérios `unverified` no veredito de testes dependem dele). O log existe com a execução 1 (local,
      desktop, parcial, ritmo inválido) e a execução 2 (staging, operador de sessão: D1, D3, D4, D14 passam; D2 não
      medido); três tentativas automatizadas de medir ritmo falharam porque o Chrome limita o `requestAnimationFrame` a
      1–2 quadros/s sob automação (os temporizadores correm normais) — o dono do produto **relata** o jogo fluido na sua
      própria aba, o que é relato, não medida (DIV-DP-06). A precondição só se cumpre com a execução humana de D2, D5
      (duração), D6, D12, D13 e das linhas M nos aparelhos nomeados.
- [x] D14/M12 decidíveis nesta release: `dist/` sem dado OSM (0 ocorrências de "OpenStreetMap"/"ODbL", pista
      sintética), logo nenhum crédito é exigido (`smoke.md`). **D-DP-04 ratificado** pelo dono do produto em 2026-10-21
      (`DOMAIN.md`): o crédito e o aviso ODbL só são exigidos quando uma pista derivada de OSM for publicada
      (`98-divergences.md`, DIV-DP-05 `resolved`).
- [x] Monitoramento decidido: **vigilância manual conforme este runbook**, nenhum monitor externo nesta release (RNF12;
      `DOMAIN.md`, 2026-10-21; DIV-DP-08 `waived`). A verificação HTTPS manual é *Verify* 1 e 7.
- [x] Node na versão fixada: `.nvmrc` = `24` na raiz (o workflow lê `node-version-file`); medido no build: v24.20.0.

## Promote

| # | Passo | Esperado | Leva | Desfaz-se por |
|---|---|---|---|---|
| 1 | conferir os commits: `git log --oneline -4` mostra `c1e488b`, `162b1b3`, `c1f7f28`, `c41c6c3` (a árvore de `src/`, `tests/`, `index.html` e do lockfile é a de `<sha>`); `git status` limpo nos arquivos da release | hashes iguais aos registrados; nenhuma modificação local | 1 min | nada a desfazer: leitura local, sem efeito externo |
| 2 | `npm ci` | saída 0; `package-lock.json` inalterado | 1 a 2 min | nada a desfazer externo: só recria `node_modules/` local (apagável) |
| 3 | `npm test` | saída 0; `170 passed, 0 failed, 0 skipped` | 1 min | nada a desfazer: executa testes, sem efeito externo |
| 4 | `npm run build` | saída 0; `dist/index.html`, `dist/assets/index-<hash>.js`, `dist/assets/index-<hash>.css`; anotar o `<hash>` do JS (hoje `Cqfgl3da`) — é a conferência local; o artefato publicado é o do workflow | 1 min | nada a desfazer externo: apagar `dist/` local, se se quiser |
| 5 | `python -I "600 Deploy/Output/race-lap-validation/tools/measure_dist.py" dist` | `within_limit=True`, saída 0; total da ordem de 593 256 bytes (RNF02) | 10 s | nada a desfazer: leitura, sem efeito externo |
| 6 | registrar o alvo de reversão: em `https://github.com/edumatosr6-svg/kartle/actions` → workflow `pages`, anotar a **última execução verde** (número da execução e commit) — é o alvo do caminho B. **Nesta primeira release** não existe nenhuma: registrar "primeira release: sem execução anterior; reversão pelo caminho A (Unpublish site)" em `docs/lap-validation-device-log.md` | release seguinte: número e commit da execução verde anterior anotados e a execução ainda reexecutável. **Esta release**: Settings → Pages mostra o site como não publicado e a nota registrada | 2 min | nada a desfazer: anotação |
| 7 | publicar em **staging**: `git push staging master:staging` (envia a ponta de `master` ao ramo `staging` de `edumatosr6-svg/kartle-staging`; **feito em 2026-10-21** pelo dono do produto) e acompanhar em `https://github.com/edumatosr6-svg/kartle-staging/actions` a execução `pages` desse commit. **Estado em 2026-10-21**: execução 39629837192 (`c1e488b`) verde após a reexecução; a URL responde 200 em HTTPS; R1/R2 ensaiados sobre este site (execução 39631099098 verde na republicação, mesmo `<hash>`); as execuções seguintes (pushes de registro) são lidas na aba Actions. Se o `deploy` falhar **sem executar nenhum passo**, a causa é a política de ramos do ambiente (precondição do repositório de staging; `REL-0005`) — corrigir e *Re-run all jobs* | execução verde (`build`: `npm ci`, `npm test` 170 aprovados, build, `Measure dist` com `within_limit=True`; `deploy`: concluído, URL `https://edumatosr6-svg.github.io/kartle-staging/`); a URL responde 200 em HTTPS e o `index.html` servido referencia `/kartle-staging/assets/index-<hash>.js` com o `<hash>` impresso no passo *Build* dessa execução | 3 a 5 min (execução) + até 10 min de propagação do cache do Pages | R1 e R2 sobre `edumatosr6-svg/kartle-staging` (caminho A: Unpublish site do repositório de staging; B/C nas releases seguintes) |
| 8 | executar `smoke.md` em staging (`https://edumatosr6-svg.github.io/kartle-staging/`), canais `web-desktop` e `web-mobile`, e registrar em `docs/lap-validation-device-log.md` | todas as linhas dentro do limiar; D4/M4 com um só botão, "volta de treino"; D14/M12 com 0 ocorrências de OSM/ODbL em `dist/` e nenhuma alegação de atribuição OSM na página | 60 a 90 min | nada a desfazer: observação; o registro no log fica como histórico |
| 9 | **pergunta ao dono do produto**: promover o commit `<sha>` a produção? (D-DP-06) | resposta explícita registrada; "não" encerra aqui sem efeito | até 1 dia útil de espera; sem resposta até lá, vale "não" | nada a desfazer: "não" ou silêncio encerram sem efeito externo |
| 10 | publicar em **produção**: `git push origin master` (**o push de 2026-10-21 já foi feito**: a execução `pages` 39627810079 (`162b1b3`) correu `build` com sucesso e **está parada em `deploy` à espera de revisão** em `https://github.com/edumatosr6-svg/kartle/actions` — a mais antiga ainda à espera; a 39629830827 (`c1e488b`) foi **cancelada** pelo grupo de concorrência `pages` quando um push posterior entrou, e os pushes de registro seguintes criaram execuções novas, cujos números se leem na aba Actions; aprovar a execução **mais recente** cujo `build` esteja verde); só depois do "sim" do passo 9, o dono do produto (`edumatosr6-svg`) abre a execução → **Review deployments** → marca `github-pages` → **Approve and deploy** | `build` verde com `npm test` 170 aprovados e `Measure dist` `within_limit=True`; após a aprovação, `deploy` verde com a URL `https://edumatosr6-svg.github.io/kartle/`; a URL serve o `index.html` que referencia `/kartle/assets/index-<hash>.js` com o `<hash>` do passo *Build* dessa execução | 3 a 5 min de execução + o tempo até o clique de aprovação | R1 (caminho A nesta release; B nas seguintes); antes do clique, **Reject** na revisão deixa tudo como está (nada publicado) |
| 11 | propagação do cache: o GitHub Pages **não oferece purga**; serve tudo com `Cache-Control: max-age=600`. Esperar até 10 min e buscar em janela anônima (no ensaio de staging, a borda continuou a servir a resposta antiga por mais de 6 min mesmo a pedidos com `Cache-Control: no-cache`) | uma busca nova devolve o `index.html` com o JS da execução aprovada; `/kartle/assets/index-<hash>.js` e `.css` respondem 200 | até 10 min | R2 |

## Verify

| # | Verificação (`smoke.md`, *Verificação em produção*) | Esperado |
|---|---|---|
| 1 | D1 / M1 HTTPS em `https://edumatosr6-svg.github.io/kartle/` — **verificação manual**, a única vigilância de disponibilidade desta release (decisão de 2026-10-21, `DOMAIN.md`; `REL-0005`) | cadeado válido; 0 recursos inseguros; `index.html` e *assets* com 200; inclinação ativa no celular (RNF06) |
| 2 | D2 / M2 carregamento em 4G, cache vazio | kart responde em menos de 10 s (RNF01) |
| 3 | D3 / M3 bytes transferidos na primeira visita | abaixo de 3 145 728 bytes (RNF02); esperado da ordem de 153 KB comprimidos |
| 4 | D4 / M4 pista | `#track-status` mostra `synthetic`; `#lap-offer` com exatamente um botão, "volta de treino", e nenhuma opção oficial (NFR-0012; DES-0009) |
| 5 | D5 e D6 / M5 e M6 volta de treino inteira | contagem em texto com 48 px e 4,5:1; resultado `m:ss.mmm` com sufixo "não oficial" e 4 setores cuja soma é o total (NFR-0006) |
| 6 | D14 / M12 crédito OSM e ODbL | passa: `dist/` com 0 ocorrências de dado ou texto OSM/ODbL e a página sem alegação de atribuição OSM (nenhum dado OSM publicado → nenhum crédito exigido) |
| 7 | repetir 1 a 4 depois de 24 h (vigilância manual; nenhum monitor externo) | mesmos resultados; a execução aprovada continua a última em `https://github.com/edumatosr6-svg/kartle/actions` e Settings → Pages mostra o site ativo com essa implantação (`REL-0005`) |

**Gatilhos de reversão (D-DP-03):** carregamento de 10 s ou mais em 4G; transferência de 3 145 728 bytes ou mais;
`#track-status` sem `synthetic` ou `#lap-offer` sem o botão "volta de treino"; erro no console ao carregar (inclusive 404
de um *asset* em `/kartle/assets/`); resultado da volta não exibido ao cruzar a chegada; qualquer recurso servido sem
HTTPS; fps abaixo de 60 no notebook ou de 30 no celular de referência (NFR-0003).

## Roll back

| # | Passo (desfaz o passo de *Promote* indicado) | Esperado | Leva |
|---|---|---|---|
| R1 | desfaz 10, pelo caminho que o passo 6 registrou. **Caminho A — esta release**: em `https://github.com/edumatosr6-svg/kartle` → Settings → Pages → menu "…" ao lado de "Your site is live at …" → **Unpublish site** → confirmar; alvo: *site não publicado*. **Caminho B** (release seguinte): Actions → workflow `pages` → a execução verde anotada no passo 6 → **Re-run all jobs** → quando `deploy` pedir revisão, **Approve and deploy**; alvo: o `dist/` do commit anterior, reconstruído do lockfile. **Caminho C** (sem execução anterior reexecutável e com commit anterior à feature; DM-0001): dono do produto faz `git revert <sha>` (sem `--no-commit`), `npm test` local, `git push origin master`, e aprova o `deploy` da execução nova | **A**: `https://edumatosr6-svg.github.io/kartle/` responde 404 do GitHub em até 10 min (nenhum *asset* desta release servido); Settings → Pages sem site publicado. **B**: a URL serve o `index.html` que referencia `/kartle/assets/index-<hash-anterior>.js`. **C**: a execução nova tem `npm test` verde na árvore revertida e a URL serve o `index.html` reconstruído | A: 1 min de ação + até 10 min de cache — **ensaiado em staging** (2026-10-21): 404 no navegador em ≈ 1 min, mas um cliente com a resposta em cache de borda continuou a receber 200 por mais de 6 min; a despublicação **não é imediata para todos os clientes**. B: 3 a 5 min de execução + aprovação + até 10 min de cache; C: 10 min (revert, testes, push) + 3 a 5 min de execução + aprovação + até 10 min de cache |
| R2 | propagação do cache (desfaz 11): sem purga no Pages; esperar até 10 min (`max-age=600`) e buscar em janela anônima. **Para voltar a publicar depois do caminho A** (ensaiado em staging): reativar o Pages (Settings → Pages → *Source* = GitHub Actions; pela API, `POST /pages` com `build_type: workflow`), **conferir a política de ramos do ambiente `github-pages`** — a reativação recria o ambiente com a política padrão (só o ramo padrão): em produção é a desejada; em staging tem de ser liberada **de novo** — e *Re-run all jobs* da execução verde | **A**: busca nova devolve 404 e não mais o `index.html` desta release; na republicação, 200 com o mesmo `<hash>` (em staging: execução 39631099098, 200 às 16:31:13Z com `index-Cqfgl3da.js`; ciclo despublicar → republicar ≈ 7,5 min). **B/C**: busca nova devolve o `index.html` restaurado e os seus *assets* respondem 200 | até 10 min (republicação pelo caminho A: ≈ 7,5 min no ensaio) |
| R3 | executar *Verify* 1, 2 e 4 na versão restaurada (**B/C**); no caminho **A**, confirmar que a URL de produção responde 404 nos 4 navegadores de referência | **B/C**: HTTPS válido; carregamento abaixo de 10 s; a tela anterior funciona. **A**: nenhuma página servida | 10 min |
| R4 | registrar a reversão: hash revertido, alvo restaurado (A: "não publicado"; B/C: hash restaurado e número da execução), gatilho observado, horário | linha no `docs/lap-validation-device-log.md` e relatório em `reports/deploy-validation/` | 5 min |
| R5 | se a causa for da aplicação (fps, cronômetro, pausa, leitura da pista), abrir `FAIL CODE` para o estágio de código; se for do empacotamento (base `/kartle/`, cache, HTTPS, Pages), `FAIL` deste estágio | relatório com a classificação | 15 min para escrever e arquivar o relatório, no mesmo dia da reversão |

Staging reverte-se do mesmo modo (R1 e R2 sobre `edumatosr6-svg/kartle-staging`, pelo mesmo caminho; lá o `deploy`
não pede aprovação) e nunca é precondição para reverter produção. O ensaio de R1/R2 em staging — exigido antes da
pergunta de promoção — **foi feito em 2026-10-21** (*Ensaio de reversão R4* em `docs/lap-validation-device-log.md`):
R1 às 16:23:52Z (`DELETE /repos/edumatosr6-svg/kartle-staging/pages`, o equivalente a *Unpublish site*) → 404 do GitHub
no navegador em ≈ 1 min, `curl` ainda com 200 em cache por mais de 6 min; R2 → `POST /pages` (`build_type: workflow`),
política do ambiente liberada de novo (a reativação recria o ambiente restrito ao ramo padrão), *Re-run all jobs* →
execução **39631099098** verde → 200 às 16:31:13Z com o mesmo `index-Cqfgl3da.js`. Ciclo ≈ 7,5 min. Duas lições
entraram em R1/R2 e nas precondições: a despublicação não é imediata para todo cliente (cache de borda), e a
republicação exige refazer a liberação da política em staging.

Dados: nada a desfazer. A feature não grava no navegador e não há servidor (DES-0011, `REL-0002`); um jogador com a
página nova em cache continua jogando-a por até 10 min; depois disso busca o `index.html` restaurado (ou o 404 do
caminho A). O Pages serve só a implantação corrente: os *assets* desta release deixam de responder quando outra
implantação a substitui, por isso a janela de coexistência é a do `max-age=600` (`REL-0003`).

**Point of no return:** não existe nesta release. Na primeira release a reversão é despublicar (caminho A), sempre
possível; a partir da release seguinte, a execução verde anterior é reexecutável enquanto o Actions a retiver (90 dias
por padrão) e, passado isso, o caminho C reconstrói de um commit — o repositório é o artefato de reversão. O único ato
que tornaria a reversão impossível seria **apagar o histórico do repositório** (`push --force` sobre `master`), que
nenhum passo deste runbook faz. Quando existirem pistas publicadas para dias futuros (pós-MVP), a publicação de uma
`trackVersion` passará a ser o ponto sem retorno (I3: nunca editada no lugar), e este runbook terá de nomeá-lo.
