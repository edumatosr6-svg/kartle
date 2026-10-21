---
title: Registro de mudanças — validação de volta de corrida (estágio de deploy)
feature: race-lap-validation
stage: deploy
status: draft
version: 1.1.1
sources: []
---

# Registro de mudanças

## 2026-10-21 — rodada 1, Modo A (nenhum registro de release existia)

**O que foi escrito**

- `01-release.md`: o que é entregue, a proveniência que a release ainda não pode afirmar (zero commits, sem CI, sem
  staging, provedor em aberto), as precondições humanas em ordem, a reprodução do build e a medida real do `dist/`
  (593 256 bytes brutos, 152 903 gzip, 18,9 % do limite de RNF02).
- `REL-0001-config.md` (nenhuma variável lida pelo cliente; papéis, sem valores, do passo de hospedagem futuro),
  `REL-0002-migration.md` (arquivo de pista v1 → v2 com leitor e reversão ensaiada por `CHK-TEST-0009-01/-03`; sem
  backfill; dado persistido intocado), `REL-0003-rollout.md` (passo único, regra de cache, contrato do pipeline futuro),
  `REL-0004-mobile.md` (sem app nativo; o que é específico do celular), `REL-0005-observability.md` (nada sai do
  navegador; métricas por requisito; nenhum alerta automático existe).
- `smoke.md`: 14 verificações em `web-desktop` e 12 em `web-mobile`, cada uma com o limiar observado (RNF01, RNF02,
  RNF03/NFR-0003, RNF06, RNF09, RNF11/NFR-0007, NFR-0002, NFR-0004, NFR-0006, NFR-0008, NFR-0012) e o roteiro `E2E-nn`
  reutilizado.
- `runbook.md`: precondições, promover (11 passos), verificar (7), reverter (5), gatilhos de reversão e ponto sem retorno.
- `tools/measure_dist.py`: a medida de RNF02 como script, para que o número do runbook seja reproduzível e não lido de um
  log.
- `98-divergences.md`: lacunas devidas ao humano. `00-index.md` emitido por `lint_artifacts.py --emit`; este estágio não
  tem `99-traceability.md` entre os arquivos exigidos.
- Executado localmente: `npm run build` (saída 0) e a medida do `dist/`. Nada foi executado contra staging ou produção;
  nenhum arquivo fora de `600 Deploy/Output/race-lap-validation/` foi escrito.

**Itens fechados**: nenhum `ISSUE-<nn>` ou `FB-<nn>` (primeira geração).

**Itens recusados, com motivo**

- **Feature flag desligada em produção (política 9 do estágio, I4)**: não acrescentada. O projeto validado declara em
  todos os doze registros `DES-*` que não há flag, com a razão em DES-0007 (nenhum requisito pede chave; a validação
  preliminar é aposentada na mesma mudança, sem duas validações ativas; a reversão é a do repositório). Acrescentar uma
  chave seria superfície que nenhum item a montante autoriza; a reversão é a republicação do artefato anterior.
- **Nomear o commit verificado e a tag da release**: não há commit nem tag — o repositório tem zero commits e `git` é
  reservado ao dono do produto. Em vez de inventar um identificador, a ausência é a precondição 1 do runbook e uma linha
  de `98-divergences.md`.
- **Arquivo de workflow de CI e configuração de hospedagem**: não criados. Não existe CI (ponto em aberto 04) nem
  provedor (ponto em aberto 03, D23); qualquer arquivo seria para um provedor hipotético. O contrato do pipeline está em
  `REL-0003` como tabela de etapas com saída observável, para ser transcrito quando D23 for decidido.
- **Relatório de validação de staging como precondição cumprida**: staging não existe; a precondição está escrita e
  desmarcada.
- **`migration.md` com revisões de banco, backfill e downgrade ensaiado em cópia restaurada**: não há banco (I5,
  DM-0001). O documento diz o que se aplica: a revisão do arquivo de pista, o leitor da versão anterior e o ensaio da
  reversão por `npm test`.
- **`mobile.md` com build, assinatura e loja**: não há aplicativo nativo (I10); o documento cobre o que vale para
  `web-mobile` (HTTPS para os sensores, perda do sensor, 16 px, 30 fps, 4G).
- **Crédito OSM e aviso ODbL no `smoke.md` como verificação que passa**: não é possível afirmar — a página não os exibe
  e o bundle não contém dado OSM (pista sintética). A linha D14/M12 registra o fato e a decisão fica com o dono do produto
  (`98-divergences.md`). Acrescentar o crédito é mudança de código, fora deste estágio.
- **"O desafio do dia resolve" como verificação de saúde (diretivas)**: o desafio diário é a etapa 5 do produto e não
  existe nesta release; o observável equivalente (`#track-status` com `synthetic` e oferta oficial) está em D4/M4.
- **Alerta automático em `REL-0005`**: nenhum sistema de alerta existe; descrito o mínimo a configurar quando houver
  provedor, e a vigilância humana do runbook até lá.
- **Nomes de arquivo `config.md`, `migration.md`, `rollout.md`, `mobile.md`, `observability.md`** (estrutura do skill):
  gravados como `REL-0001-config.md` a `REL-0005-observability.md`, porque o portão determinístico trata todo arquivo
  deste estágio fora de `NN-*`, `runbook` e `smoke` como artefato com identificador `REL-nnnn`, exigindo `id:` e nome
  começando pelo id (`lint_artifacts.py`, G2/G3). O conteúdo e o papel de cada arquivo são os da estrutura do skill.
- **Nenhum valor de variável, credencial ou domínio** foi escrito, nem de exemplo (D-DP-05).

## 2026-10-21 — rodada 2, Modo B (relatório `deploy-validation-20261021-1426.md`, FAIL)

**O que mudou**

- `runbook.md`: tabela *Alvo de reversão* no cabeçalho com os três caminhos (A despublicar — o único existente nesta
  primeira release, porque não há `dist/` anterior nem commit anterior à feature; B republicar o zip do passo 6, a partir
  da release seguinte; C reverter e reconstruir, o de DM-0001, só com commit anterior à feature e zip perdido). Passo 6
  reescrito para registrar "primeira release: sem artefato anterior". R1 a R4 nomeiam o alvo de cada caminho e o seu
  resultado observável; ponto sem retorno reescrito para a primeira release. Coluna *Desfaz-se por* acrescentada à
  tabela *Promote* (passos 1–5 e 8: nada a desfazer, com o motivo; 7: R1/R2 sobre staging; 9: nada; 10: R1; 11: R2).
  Duração do passo 9 (até 1 dia útil; silêncio vale "não") e de R5 (15 min, no mesmo dia). Precondição 8 e *Verify* 6
  reescritas com o resultado decidível de D14/M12.
- `smoke.md`: D14 e M12 com um único resultado esperado para esta release — nenhum dado OSM publicado, logo nenhum
  crédito exigido; passa com 0 ocorrências de OpenStreetMap/OSM/ODbL em `dist/` **e** nenhuma alegação de atribuição OSM
  na página; falha nos dois casos contrários. Nenhum texto de crédito foi inventado.
- `98-divergences.md`: DIV-DP-05 continua `open`, agora devida à primeira release que publicar uma pista OSM (D-DP-04).
- `REL-0002-migration.md` (coluna *Reversão*) e `REL-0003-rollout.md` (ordem 1, 2 e 4): alinhados aos caminhos do
  runbook — só consistência, nenhuma superfície nova.

**Itens fechados**: ISSUE-05, ISSUE-06, ISSUE-07.

**Itens não tratados nesta rodada, com motivo**

- **ISSUE-01, ISSUE-02, ISSUE-03, ISSUE-04, ISSUE-08** (classe ambiental): dependem de commit, CI, decisão D23, staging,
  aparelhos e monitor que só o dono do produto pode fornecer; continuam como DIV-DP-01 a DIV-DP-04 e DIV-DP-06 a DIV-DP-08
  e como precondições desmarcadas do runbook. Nenhum passo **[provedor]** recebeu comando inventado.
- **ISSUE-09, ISSUE-10** (info): sem ação neste estágio, como o próprio relatório declara; DIV-DP-09 permanece.
- **Comando concreto de "despublicar" no caminho A**: não escrito — depende do provedor (D23); o passo traz o resultado
  observável (a URL deixa de servir `index.html`) e o marcador **[provedor]**, na convenção do registro.

**Superfície**: nenhuma linha de fumaça, arquivo ou precondição acrescentados; a precondição 8 foi reescrita, não criada.

## 2026-10-21 — rodada 3, Modo B com superfície autorizada (relatório `deploy-validation-20261021-1435.md`, FAIL; decisões do dono do produto de 2026-10-21)

Entradas novas do dono do produto (Eduardo Matos): (1) a árvore verificada está em commit —
`c41c6c3ddf8ada690a2f2b1581ee87700c837268`, `master`; (2) **D23 decidido: GitHub Pages**; (3) `.nvmrc` autorizado.
Cada superfície acrescentada nesta rodada tem uma dessas decisões como autorização (§16); nada além delas foi criado.

**O que mudou**

- **Criados na raiz do repositório** (ativos do estágio de deploy): `.github/workflows/pages.yml` — `push` em `master`
  e `staging` e `workflow_dispatch`; `checkout@v4`, `setup-node@v4` (`node-version-file: .nvmrc`, cache npm), `npm ci`,
  `npm test`, `npm run build -- --base=/<repo>/`, `measure_dist.py` (RNF02 como portão), `configure-pages@v5`,
  `upload-pages-artifact@v3` de `dist/`, trabalho `deploy` no ambiente `github-pages` com `deploy-pages@v4`; permissões
  `contents: read`, `pages: write`, `id-token: write`; nenhum segredo; `if` no `deploy` para que `staging` só publique
  em repositório `*-staging`. E `.nvmrc` com `24`. `package.json` e `index.html` não foram editados.
- `01-release.md`: proveniência com o commit `c41c6c3`; "sem remoto GitHub ainda" dito explicitamente; staging e
  produção como dois sites Pages; precondições humanas restantes (criar os dois repositórios e a proteção do ambiente,
  log de aparelho, ratificação de D-DP-04); passo 5 da reprodução com a oferta real (só "volta de treino").
- `runbook.md`: precondição 1 com o hash; precondições 6 e 7 com os cliques exatos (Settings → Pages → *Source* "GitHub
  Actions"; Settings → Environments → `github-pages` → *Required reviewers*); todos os passos **[provedor]** preenchidos
  — 6 (anotar a execução verde anterior), 7 (`git push staging master:staging`), 10 (`git push origin master` +
  *Approve and deploy*), 11 (espera de `max-age=600`; o Pages não tem purga), R1 (A: Settings → Pages → *Unpublish
  site*; B: *Re-run all jobs* da execução verde anterior + aprovação; C: `git revert <sha> && git push origin master`),
  R2 (espera do cache); cada um com resultado observável e duração. *Verify* 4 e 5 e os gatilhos com a volta de treino.
  Ponto sem retorno reescrito (o repositório é o artefato de reversão).
- `smoke.md`: forma da URL `https://<owner>.github.io/<repo>/` em D1, D2 e M1; **ISSUE-12** (abaixo) em D4, D5, D6, D8,
  M4, M5, M6; nota sobre o `href="/"` da marca.
- `REL-0001-config.md`: nenhuma variável de ambiente; as duas únicas entradas (nome do repositório e ambiente
  `github-pages`), OIDC em vez de credencial.
- `REL-0003-rollout.md`: ordem de operações com os comandos; seção *Staging e produção no GitHub Pages* com o que o
  dono do produto cria na interface; regra de cache como o Pages a aplica (10 min, sem purga, só a implantação corrente;
  janela de coexistência de 10 min); o contrato do pipeline reescrito como descrição do workflow existente; riscos do
  `--base` e do link da marca.
- `REL-0005-observability.md`: histórico do Actions como registro de implantações (commit, testes, medida, quem aprovou
  e quando); o Pages não fornece monitor nem registros de acesso — verificação HTTPS manual mantida; falha do pipeline
  como único alerta automático; novo modo de falha dos *assets* em 404.
- `98-divergences.md`: DIV-DP-01, 02, 03, 04 e 09 `resolved`; DIV-DP-05 (ratificação pendente), 06 (log de aparelho, 27
  critérios), 07 (RNF01 na URL), 08 (sem monitor) `open`; novas DIV-DP-10 (sem remoto), DIV-DP-11 (repositório de staging
  não criado) e DIV-DP-12 (`href="/"` da marca — estágio de código).
- `version:` movido para `1.1.0` em todos os arquivos editados (§3): `01-release.md`, `runbook.md`, `smoke.md`,
  `REL-0001`, `REL-0003`, `REL-0005`, `98-divergences.md`, `97-changelog.md`. `REL-0002` e `REL-0004` não foram editados
  e ficam em `1.0.0`.

**Itens fechados**

- **ISSUE-01**, metade "sem commit": fechada pelo commit `c41c6c3`, nomeado em `01-release.md` e na precondição 1. A
  metade "sem CI" é fechada pelo workflow (abaixo). A observação "construído pelo pipeline" só acontece na primeira
  execução, que depende do remoto (DIV-DP-10).
- **ISSUE-02 e ISSUE-04**, metade "provedor": D23 decidido e todos os passos **[provedor]** preenchidos com a ação do
  GitHub; a metade "executado em staging" (instalação observada, R1/R2 ensaiados) depende de DIV-DP-11.
- **ISSUE-10**: `.nvmrc` com `24` na raiz, lida pelo workflow.
- **ISSUE-12** (nova, encontrada pelo condutor do loop ao executar a fumaça de desktop no build do commit; classe:
  desacordo fumaça × projeto validado): D4, D5 e D8 supunham a oferta de "volta oficial", mas DES-0009 ("a oferta de volta
  oficial depende do desafio diário, outra feature") e o código (`offeredLapKinds(reading, [])`, `src/main.ts` linha 200)
  oferecem só a volta de treino nesta release, e a página servida confirma (`#track-status` `synthetic`; `#lap-offer`
  com um botão, "volta de treino"). Reescritos: D4/M4 = `synthetic` + exatamente "volta de treino", nenhuma opção
  oficial; D5/M5 e D6/M6 sobre a volta de treino (resultado com sufixo "não oficial"); D8: marcador pulado e corte com
  motivo, **reposicionamento em treino não invalida** — "sem motivo, volta segue" (DES-0005; ponto em aberto 02 do
  `DOMAIN.md`); referências E2E anotadas. Os mesmos textos em `runbook.md` (*Verify* 4 e 5, gatilhos), `01-release.md`
  (passo 5) e `REL-0005` (modo de falha).

**Itens não tratados ou recusados nesta rodada, com motivo**

- **ISSUE-01, metade "construído pelo pipeline e observado"**: não há remoto GitHub — o workflow nunca correu. Só o
  dono do produto cria o repositório e faz o push (DIV-DP-10).
- **ISSUE-02/ISSUE-04, metade "executado em staging"**: o repositório `<owner>/kartle-staging` não existe (DIV-DP-11);
  nenhum ensaio de R1/R2 foi feito.
- **ISSUE-03** (26 linhas de fumaça executadas, log de aparelho): sem URL de staging nem aparelhos; `docs/lap-validation-device-log.md`
  continua inexistente (DIV-DP-06, DIV-DP-07). A execução parcial do condutor do loop em desktop, sobre o build local,
  produziu ISSUE-12 mas não é a execução em staging que a linha exige. *(Superado após a rodada 3: o log foi criado com
  essa execução como execução 1 — ver rodada 4.)*
- **ISSUE-08** (alerta): o GitHub Pages não fornece monitor nem registros de acesso; nenhum serviço externo foi
  acrescentado porque é decisão de custo do dono do produto (RNF12). O registro de implantações passou a existir
  (histórico do Actions); a verificação HTTPS fica manual (DIV-DP-08 permanece `open`, com o escopo reduzido).
- **ISSUE-09** (info, sem flag): sem ação, como o relatório declara; a ordem de `REL-0003` será confrontada com a
  primeira execução em staging.
- **ISSUE-11** (ratificação de D-DP-04): continua à espera da frase do dono do produto (DIV-DP-05); D14/M12 inalteradas.
- **Editar `index.html` para corrigir o `href="/"` da marca**: recusado — é código, fora da escrita deste estágio (§14);
  registrado como DIV-DP-12 devida ao estágio de código. O `--base` do workflow reescreve os *assets*, não esse link.
- **Purga de cache como comando**: não existe no GitHub Pages; o passo 11 e R2 declaram a espera de `max-age=600` com
  o seu observável, em vez de um comando inventado.
- **Guardar `kartle-dist-<hash>.zip` como alvo de reversão (caminho B da rodada 2)**: substituído por *Re-run all jobs*
  da execução verde anterior — o workflow reconstrói o commit anterior do lockfile, o que é mais rastreável do que um
  zip fora do repositório; o caminho C (`git revert`) cobre a expiração da retenção do Actions.
- **Domínio próprio e monitor externo**: fora desta release; a URL é a do `github.io`.
- **`engines` em `package.json`**: não escrito — o dono do produto pediu `.nvmrc` e vedou a edição de `package.json`.
- **Nenhum comando `git`, `npm` ou chamada a host remoto** foi executado nesta rodada; nenhum valor de segredo escrito.

## 2026-10-21 — rodada 4, Modo B (relatório `deploy-validation-20261021-1501.md`, FAIL; escopo: ISSUE-13 e ISSUE-14)

Rodada restrita aos dois itens `info` de registro desatualizado por um evento; superfície congelada (§16): nenhuma linha
de fumaça, precondição, arquivo, comando ou decisão acrescentados.

**O que mudou**

- **ISSUE-13** — `98-divergences.md` DIV-DP-06, `REL-0004-mobile.md` (*Dispositivos de referência*), `01-release.md`
  (precondição humana 3) e `runbook.md` (precondição 8): `docs/lap-validation-device-log.md` **existe com a execução 1**
  (condutor do loop, Chromium em painel embutido, `vite preview` local, commit `c41c6c3`), parcial, só `web-desktop`, só
  estado e texto — D4, D5 (texto), D7, D8 (parcial), D9, D10, D11 — com página em segundo plano (toda medida de ritmo
  inválida) e nenhum aparelho nomeado; **falta a execução 2** em staging nos aparelhos nomeados. A precondição 8 segue
  desmarcada. A frase da rodada 3 ("continua inexistente") recebeu nota de superação, sem reescrever o histórico.
- **ISSUE-14** — `01-release.md` (*Proveniência*) e DIV-DP-01: "`npm ci` agendado" substituído pelo fato — `npm ci` saída
  0, `npm test` 170/170, `npm run build` saída 0 (593 256 bytes) no commit `c41c6c3`; `runbook.md` precondição 1 cita o
  `npm ci`. `REL-0002-migration.md` (coluna *Reversão* e *Como a reversão foi ensaiada*): caminho B alinhado ao runbook —
  *Re-run all jobs* da última execução verde anterior, reconstruída do lockfile, e não um `dist/` guardado.
- `version:` movido: `01-release.md`, `runbook.md`, `98-divergences.md`, `97-changelog.md` → `1.1.1`; `REL-0002`,
  `REL-0004` → `1.0.1`. `smoke.md`, `REL-0001`, `REL-0003`, `REL-0005` não editados.

**Itens fechados**: ISSUE-13, ISSUE-14.

**Itens recusados**: nenhum. Os demais abertos (ISSUE-01, 02, 03, 04, 08 ambientais; ISSUE-09, 11, 15 decisões humanas)
estão fora do escopo desta rodada e permanecem como DIV-DP-05 a DIV-DP-08 e DIV-DP-10 a DIV-DP-12.

- Nenhum comando `git`, `npm` ou chamada a host remoto executado nesta rodada; nenhum valor de segredo escrito.
