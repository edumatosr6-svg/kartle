---
title: Registro de divergências e lacunas devidas ao humano (estágio de deploy)
feature: race-lap-validation
stage: deploy
status: draft
version: 1.1.1
sources: []
---

# 98 — Divergências

Nenhuma linha `open` abaixo é um defeito do artefato: cada uma é algo que a política do estágio exige da release e que o
repositório, hoje, não pode fornecer sem uma decisão ou uma ação humana. Nenhuma contribui para o veredito; cada `open`
bloqueia uma precondição do `runbook.md` até ser resolvida. Uma linha `resolved` nomeia o que a resolveu e fica como
histórico.

| Id | Estado | O que o estágio exige | O que existe hoje (evidência) | Quem deve | Resolve-se por |
|---|---|---|---|---|---|
| DIV-DP-01 | resolved (2026-10-21, rodada 3) | a release nomeia o commit que os testes verificaram (política 2; `01-release.md`) | commit `c41c6c3ddf8ada690a2f2b1581ee87700c837268` (`master`) da árvore verificada, feito pelo dono do produto; `npm ci` (saída 0), `npm test` (170 aprovados, 0 reprovados) e `npm run build` (saída 0; `dist/` com 593 256 bytes) reexecutados nele pelo condutor do loop | — | o commit; nomeado em `01-release.md` e na precondição 1 do `runbook.md` |
| DIV-DP-02 | resolved (2026-10-21, rodada 3) | o pipeline reproduz o build a partir do commit verificado (política 2; `REL-0003`) | `.github/workflows/pages.yml` (GitHub Actions): `npm ci`, `npm test`, `npm run build -- --base=/<repo>/`, `measure_dist.py`, `upload-pages-artifact`, `deploy-pages`; a primeira execução depende do remoto (DIV-DP-10) | — | o workflow; etapas em `REL-0003` |
| DIV-DP-03 | resolved (2026-10-21, rodada 3) | staging onde a release é provada e a reversão ensaiada (política 3; runbook, precondição 3) | D23 decidido: GitHub Pages; staging = site Pages de `<owner>/kartle-staging` (ramo `staging`, sem revisor), produção = site Pages de `<owner>/kartle` com revisor obrigatório no ambiente `github-pages` (`REL-0003`); a criação dos repositórios fica em DIV-DP-10 e DIV-DP-11 | — | a decisão D23 e o desenho em `REL-0003` |
| DIV-DP-04 | resolved (2026-10-21, rodada 3) | comandos exatos de publicação, purga de cache e reversão (D-DP-02) | `runbook.md` passos 6, 7, 10, 11, R1, R2 com a ação concreta do GitHub: `git push staging master:staging`, `git push origin master` + *Approve and deploy*, espera de `max-age=600` (o Pages não tem purga), *Unpublish site* (A), *Re-run all jobs* + aprovação (B), `git revert <sha> && git push` (C); o ensaio de R1/R2 em staging fica pendente de DIV-DP-11 | — | os passos preenchidos |
| DIV-DP-05 | open | crédito OSM e aviso ODbL visíveis no build publicado (D-DP-04, RNF09) | nesta release nenhum dado OSM é publicado (pista sintética, literais em `src/track.ts`; 0 ocorrências de "OpenStreetMap"/"ODbL" em `dist/`), logo D14/M12 têm resultado decidível: passam com 0 ocorrências e nenhuma alegação de atribuição na página. A regra de D-DP-04 fica devida à **primeira release que publicar uma pista OSM**; a **ratificação desta leitura pelo dono do produto está pendente** (ISSUE-11) | dono do produto (ratificação agora; crédito na primeira release com pista OSM) | uma frase do dono do produto no `DOMAIN.md` ou no `97-changelog.md`; depois, o crédito por mudança de código nessa release |
| DIV-DP-06 | open | roteiros E2E-01 a E2E-11 registrados nos aparelhos e navegadores nomeados (`smoke.md`; **27 critérios `unverified`** no veredito de testes) | `docs/lap-validation-device-log.md` **existe com a execução 1** (condutor do loop, Chromium em painel embutido, `vite preview` local, commit `c41c6c3`): parcial, só `web-desktop`, só estado e texto — D4, D5 (texto), D7, D8 (parcial), D9, D10, D11; página em segundo plano, logo **toda medida de ritmo é inválida** (3 s, fps, 4G); não cobre D1–D3, D6, D12, D13 nem nenhuma linha M; nenhum aparelho nomeado. **Falta a execução 2** em staging nos aparelhos nomeados | dono do produto ou testador humano | registrar a execução 2 no mesmo log: cada roteiro com aparelho, navegador, versão e medida, janela em primeiro plano, sobre a URL de staging |
| DIV-DP-07 | open | medida de RNF01 (carregamento abaixo de 10 s em 4G) na URL publicada | só há medida de tamanho (593 256 bytes; `01-release.md`); a URL de staging ainda não existe (DIV-DP-11) | dono do produto, após DIV-DP-11 | D2/M2 de `smoke.md` em staging e em produção, registrados no log de DIV-DP-06 |
| DIV-DP-08 | open | alerta que soaria se um requisito fosse violado em produção (política 8; `REL-0005`) | o registro de implantações existe (histórico do Actions, `REL-0005`); o GitHub Pages **não fornece** monitor de disponibilidade nem registros de acesso; a verificação HTTPS fica manual (`runbook.md`, *Verify*) | dono do produto | decidir por um monitor HTTPS externo dentro de RNF12, ou aceitar a vigilância manual como suficiente para o MVP e registrar no `DOMAIN.md` |
| DIV-DP-09 | resolved (2026-10-21, rodada 3) | versão do Node fixada para reproduzir o build (`REL-0001`) | `.nvmrc` com `24` na raiz do repositório, lida pelo workflow (`node-version-file`); build medido com Node v24.20.0 | — | o arquivo `.nvmrc` |
| DIV-DP-10 | open | o artefato que chega a staging e a produção é construído pelo pipeline (política 2) — exige o repositório no GitHub | **não há remoto GitHub**: o repositório `<owner>/kartle` não foi criado e `master` não foi enviado; o workflow nunca correu | dono do produto | criar `<owner>/kartle`, `git push -u origin master`, Settings → Pages → *Source* = GitHub Actions, Settings → Environments → `github-pages` → *Required reviewers* = dono do produto (`runbook.md`, precondição 6) |
| DIV-DP-11 | open | site de staging publicado onde `smoke.md` corre e R1/R2 se ensaiam (política 3) | o repositório `<owner>/kartle-staging` não foi criado | dono do produto | criar `<owner>/kartle-staging` com *Source* = GitHub Actions e sem revisor; `git remote add staging <URL>`; `git push staging master:staging` (`runbook.md`, precondição 7) |
| DIV-DP-12 | open | a página publicada em `https://<owner>.github.io/kartle/` não aponta para fora do site | `index.html` linha 12: `<a class="brand" href="/">` — no Pages de projeto leva a `https://<owner>.github.io/`, não a `/kartle/`; o build com `--base=/<repo>/` reescreve os *assets*, não esse `href` | estágio de código (feedback deste estágio; não editado aqui) | trocar o `href` por um caminho relativo (`./`) ou por `import.meta.env.BASE_URL` no estágio de código, com o teste correspondente |

Nenhuma divergência código-versus-especificação foi aberta por este estágio: o veredito de testes é `SUCCESS` e a
release não altera o comportamento verificado. A linha DIV-DP-12 é um defeito de empacotamento observável só no Pages de
projeto, devido ao estágio de código.
