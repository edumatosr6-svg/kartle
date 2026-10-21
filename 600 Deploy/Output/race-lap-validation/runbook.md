---
title: Runbook — promover, verificar e reverter a release de validação de volta
feature: race-lap-validation
stage: deploy
status: draft
version: 1.1.1
sources: [DM-0001, DES-0009, DES-0011, NFR-0003, NFR-0004, TEST-0009]
---

# Runbook

Para quem não escreveu a release. Executar da raiz do repositório, com todo caminho entre aspas. Nenhum passo é
executado por um loop: cada um é de um humano, e a promoção a produção é sempre do dono do produto (D-DP-06). O
provedor é o **GitHub Pages** (D23): o pipeline é `.github/workflows/pages.yml`, a publicação é um push e a promoção
é um clique de aprovação no ambiente `github-pages` do repositório de produção. Nomes usados abaixo:

| Nome | Valor (não é segredo) |
|---|---|
| `<owner>` | a conta GitHub do dono do produto |
| repositório de **produção** | `<owner>/kartle`, ramo `master`, site `https://<owner>.github.io/kartle/` |
| repositório de **staging** | `<owner>/kartle-staging`, ramo `staging`, site `https://<owner>.github.io/kartle-staging/` |
| `<sha>` | o hash do commit que se publica; nesta release `c41c6c3ddf8ada690a2f2b1581ee87700c837268` |
| "execução verde" | uma execução do workflow `pages` com os dois trabalhos (`build`, `deploy`) concluídos com sucesso |

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

- [ ] **Commit verificado existe**: `c41c6c3ddf8ada690a2f2b1581ee87700c837268` (`master`), a árvore que o veredito de
      testes verificou; `npm ci` (saída 0), `npm test` (170 aprovados) e `npm run build` (saída 0) reexecutados nesse
      commit (relatório de validação de deploy mais novo). `git rev-parse HEAD` na máquina de quem executa devolve esse hash e `git status` não acusa
      modificação em `src/`, `tests/`, `index.html`, `package.json`, `package-lock.json`.
- [ ] Veredito de testes `SUCCESS`: `500 Tests/Output/race-lap-validation/reports/test-validation/test-validation-20261021-1411.md`
      (ou o relatório mais novo que cite o hash acima).
- [ ] Validação de staging `SUCCESS`: relatório em `600 Deploy/Output/race-lap-validation/reports/deploy-validation/`
      (depende de staging publicado).
- [ ] Histórico de migração: **não se aplica** — não há banco; a única revisão é o arquivo de pista `schemaVersion` 2,
      empacotado no bundle (`REL-0002`).
- [ ] Feature flag: **não há** (DES-0007; `01-release.md`); a feature fica ativa ao servir o `index.html` novo.
- [ ] **Repositório de produção `<owner>/kartle` criado no GitHub**, `master` enviado (`git remote add origin
      <URL do repositório>` e `git push -u origin master`), Settings → Pages → *Build and deployment* → *Source* =
      **GitHub Actions**, e Settings → Environments → `github-pages` → **Required reviewers** = o dono do produto
      (DIV-DP-10). Nenhuma credencial é configurada: o Pages usa o token OIDC da execução (D-DP-05).
- [ ] **Repositório de staging `<owner>/kartle-staging` criado**, Settings → Pages → *Source* = **GitHub Actions**,
      **sem** revisor no ambiente; remoto local `staging` apontando para ele (`git remote add staging <URL>`) (DIV-DP-11).
- [ ] `docs/lap-validation-device-log.md` com os roteiros E2E-01 a E2E-11 registrados **em staging, nos aparelhos
      nomeados** (27 critérios `unverified` no veredito de testes dependem dele). O log existe com a execução 1 (local,
      desktop, parcial, ritmo inválido — DIV-DP-06); a precondição só se cumpre com a execução 2.
- [ ] D14/M12 decidíveis nesta release: `dist/` sem dado OSM (0 ocorrências de "OpenStreetMap"/"ODbL", pista
      sintética), logo nenhum crédito é exigido (`smoke.md`); D-DP-04 passa a exigir o crédito na primeira release que
      publicar uma pista OSM (`98-divergences.md`, DIV-DP-05).
- [ ] Node na versão fixada: `.nvmrc` = `24` na raiz (o workflow lê `node-version-file`); medido no build: v24.20.0.

## Promote

| # | Passo | Esperado | Leva | Desfaz-se por |
|---|---|---|---|---|
| 1 | conferir o hash: `git rev-parse HEAD` = `c41c6c3ddf8ada690a2f2b1581ee87700c837268`; `git status` limpo nos arquivos da release | hash igual ao registrado; nenhuma modificação local | 1 min | nada a desfazer: leitura local, sem efeito externo |
| 2 | `npm ci` | saída 0; `package-lock.json` inalterado | 1 a 2 min | nada a desfazer externo: só recria `node_modules/` local (apagável) |
| 3 | `npm test` | saída 0; `170 passed, 0 failed, 0 skipped` | 1 min | nada a desfazer: executa testes, sem efeito externo |
| 4 | `npm run build` | saída 0; `dist/index.html`, `dist/assets/index-<hash>.js`, `dist/assets/index-<hash>.css`; anotar o `<hash>` do JS (hoje `Cqfgl3da`) — é a conferência local; o artefato publicado é o do workflow | 1 min | nada a desfazer externo: apagar `dist/` local, se se quiser |
| 5 | `python -I "600 Deploy/Output/race-lap-validation/tools/measure_dist.py" dist` | `within_limit=True`, saída 0; total da ordem de 593 256 bytes (RNF02) | 10 s | nada a desfazer: leitura, sem efeito externo |
| 6 | registrar o alvo de reversão: em `<owner>/kartle` → Actions → workflow `pages`, anotar a **última execução verde** (número da execução e commit) — é o alvo do caminho B. **Nesta primeira release** não existe nenhuma: registrar "primeira release: sem execução anterior; reversão pelo caminho A (Unpublish site)" em `docs/lap-validation-device-log.md` | release seguinte: número e commit da execução verde anterior anotados e a execução ainda reexecutável. **Esta release**: Settings → Pages mostra o site como não publicado e a nota registrada | 2 min | nada a desfazer: anotação |
| 7 | publicar em **staging**: `git push staging master:staging` (envia o commit `<sha>` ao ramo `staging` de `<owner>/kartle-staging`) e acompanhar em `<owner>/kartle-staging` → Actions a execução `pages` do commit `<sha>` | execução verde (`build`: `npm ci`, `npm test` 170 aprovados, build, `Measure dist` com `within_limit=True`; `deploy`: concluído, URL `https://<owner>.github.io/kartle-staging/`); a URL responde 200 em HTTPS e o `index.html` servido referencia `/kartle-staging/assets/index-<hash>.js` com o `<hash>` impresso no passo *Build* dessa execução | 3 a 5 min (execução) + até 10 min de propagação do cache do Pages | R1 e R2 sobre `<owner>/kartle-staging` (caminho A: Unpublish site do repositório de staging; B/C nas releases seguintes) |
| 8 | executar `smoke.md` em staging (`https://<owner>.github.io/kartle-staging/`), canais `web-desktop` e `web-mobile`, e registrar em `docs/lap-validation-device-log.md` | todas as linhas dentro do limiar; D4/M4 com um só botão, "volta de treino"; D14/M12 com 0 ocorrências de OSM/ODbL em `dist/` e nenhuma alegação de atribuição OSM na página | 60 a 90 min | nada a desfazer: observação; o registro no log fica como histórico |
| 9 | **pergunta ao dono do produto**: promover o commit `<sha>` a produção? (D-DP-06) | resposta explícita registrada; "não" encerra aqui sem efeito | até 1 dia útil de espera; sem resposta até lá, vale "não" | nada a desfazer: "não" ou silêncio encerram sem efeito externo |
| 10 | publicar em **produção**: `git push origin master` (primeira vez: `git push -u origin master`); em `<owner>/kartle` → Actions, a execução `pages` do commit `<sha>` corre `build` e **para em `deploy` à espera de revisão**; o dono do produto abre a execução → **Review deployments** → marca `github-pages` → **Approve and deploy** | `build` verde com `npm test` 170 aprovados e `Measure dist` `within_limit=True`; após a aprovação, `deploy` verde com a URL `https://<owner>.github.io/kartle/`; a URL serve o `index.html` que referencia `/kartle/assets/index-<hash>.js` com o `<hash>` do passo *Build* dessa execução | 3 a 5 min de execução + o tempo até o clique de aprovação | R1 (caminho A nesta release; B nas seguintes) |
| 11 | propagação do cache: o GitHub Pages **não oferece purga**; serve tudo com `Cache-Control: max-age=600`. Esperar até 10 min e buscar em janela anônima | uma busca nova devolve o `index.html` com o JS da execução aprovada; `/kartle/assets/index-<hash>.js` e `.css` respondem 200 | até 10 min | R2 |

## Verify

| # | Verificação (`smoke.md`, *Verificação em produção*) | Esperado |
|---|---|---|
| 1 | D1 / M1 HTTPS em `https://<owner>.github.io/kartle/` | cadeado válido; 0 recursos inseguros; inclinação ativa no celular (RNF06) |
| 2 | D2 / M2 carregamento em 4G, cache vazio | kart responde em menos de 10 s (RNF01) |
| 3 | D3 / M3 bytes transferidos na primeira visita | abaixo de 3 145 728 bytes (RNF02); esperado da ordem de 153 KB comprimidos |
| 4 | D4 / M4 pista | `#track-status` mostra `synthetic`; `#lap-offer` com exatamente um botão, "volta de treino", e nenhuma opção oficial (NFR-0012; DES-0009) |
| 5 | D5 e D6 / M5 e M6 volta de treino inteira | contagem em texto com 48 px e 4,5:1; resultado `m:ss.mmm` com sufixo "não oficial" e 4 setores cuja soma é o total (NFR-0006) |
| 6 | D14 / M12 crédito OSM e ODbL | passa: `dist/` com 0 ocorrências de dado ou texto OSM/ODbL e a página sem alegação de atribuição OSM (nenhum dado OSM publicado → nenhum crédito exigido) |
| 7 | repetir 1 a 4 depois de 24 h | mesmos resultados; a execução aprovada continua a última em `<owner>/kartle` → Actions e Settings → Pages mostra o site ativo com essa implantação (`REL-0005`) |

**Gatilhos de reversão (D-DP-03):** carregamento de 10 s ou mais em 4G; transferência de 3 145 728 bytes ou mais;
`#track-status` sem `synthetic` ou `#lap-offer` sem o botão "volta de treino"; erro no console ao carregar (inclusive 404
de um *asset* em `/kartle/assets/`); resultado da volta não exibido ao cruzar a chegada; qualquer recurso servido sem
HTTPS; fps abaixo de 60 no notebook ou de 30 no celular de referência (NFR-0003).

## Roll back

| # | Passo (desfaz o passo de *Promote* indicado) | Esperado | Leva |
|---|---|---|---|
| R1 | desfaz 10, pelo caminho que o passo 6 registrou. **Caminho A — esta release**: em `<owner>/kartle` → Settings → Pages → menu "…" ao lado de "Your site is live at …" → **Unpublish site** → confirmar; alvo: *site não publicado*. **Caminho B** (release seguinte): Actions → workflow `pages` → a execução verde anotada no passo 6 → **Re-run all jobs** → quando `deploy` pedir revisão, **Approve and deploy**; alvo: o `dist/` do commit anterior, reconstruído do lockfile. **Caminho C** (sem execução anterior reexecutável e com commit anterior à feature; DM-0001): dono do produto faz `git revert <sha>` (sem `--no-commit`), `npm test` local, `git push origin master`, e aprova o `deploy` da execução nova | **A**: `https://<owner>.github.io/kartle/` responde 404 do GitHub em até 10 min (nenhum *asset* desta release servido); Settings → Pages sem site publicado. **B**: a URL serve o `index.html` que referencia `/kartle/assets/index-<hash-anterior>.js`. **C**: a execução nova tem `npm test` verde na árvore revertida e a URL serve o `index.html` reconstruído | A: 1 min de ação + até 10 min de cache; B: 3 a 5 min de execução + aprovação + até 10 min de cache; C: 10 min (revert, testes, push) + 3 a 5 min de execução + aprovação + até 10 min de cache |
| R2 | propagação do cache (desfaz 11): sem purga no Pages; esperar até 10 min (`max-age=600`) e buscar em janela anônima | **A**: busca nova devolve 404 e não mais o `index.html` desta release. **B/C**: busca nova devolve o `index.html` restaurado e os seus *assets* respondem 200 | até 10 min |
| R3 | executar *Verify* 1, 2 e 4 na versão restaurada (**B/C**); no caminho **A**, confirmar que a URL de produção responde 404 nos 4 navegadores de referência | **B/C**: HTTPS válido; carregamento abaixo de 10 s; a tela anterior funciona. **A**: nenhuma página servida | 10 min |
| R4 | registrar a reversão: hash revertido, alvo restaurado (A: "não publicado"; B/C: hash restaurado e número da execução), gatilho observado, horário | linha no `docs/lap-validation-device-log.md` e relatório em `reports/deploy-validation/` | 5 min |
| R5 | se a causa for da aplicação (fps, cronômetro, pausa, leitura da pista), abrir `FAIL CODE` para o estágio de código; se for do empacotamento (base `/kartle/`, cache, HTTPS, Pages), `FAIL` deste estágio | relatório com a classificação | 15 min para escrever e arquivar o relatório, no mesmo dia da reversão |

Staging reverte-se do mesmo modo (R1 e R2 sobre `<owner>/kartle-staging`, pelo mesmo caminho; lá o `deploy` não pede
aprovação) e nunca é precondição para reverter produção.

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
