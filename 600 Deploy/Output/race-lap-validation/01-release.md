---
title: Release — validação de volta de corrida
feature: race-lap-validation
stage: deploy
status: draft
version: 1.1.6
sources: [DM-0001, DM-0002, DES-0007, DES-0009, DES-0011, NFR-0003, NFR-0004, NFR-0006, NFR-0007, NFR-0012]
---

# 01 — Release

Candidato a release da feature `race-lap-validation`: contagem regressiva, cronometragem por passo fixo, validação da
volta (marcadores, sentido, corte, reposicionamento), tipos de volta e HUD, sobre o arquivo de pista versão 2. O que se
entrega é um **artefato estático** (`dist/`, HTML + JS + CSS) servido pelo **GitHub Pages** com HTTPS (decisão D23 de
2026-10-21); não há servidor, banco, serviço nem aplicativo nativo nesta release. Nesta release a página oferece
**apenas a volta de treino**: a oferta de volta oficial (e de reconhecimento) depende do desafio diário, outra feature
(DES-0009; `offeredLapKinds(reading, [])` em `src/main.ts`), e o resultado da volta traz o sufixo "não oficial".

## O que é entregue

| Item | Conteúdo | Fonte |
|---|---|---|
| Canais | `web-desktop` e `web-mobile` — a mesma página, com teclado no computador e inclinação ou toque no celular | diretivas do estágio; `REL-0004` |
| Arquivos de origem | `src/track.ts`, `src/trackData.ts`, `src/lapTiming.ts`, `src/lap.ts`, `src/frameClock.ts`, `src/lapMessages.ts`, `src/main.ts`, `index.html`, `src/style.css`, `docs/lap-validation-bench.md` | `400 Code/Output/race-lap-validation/01-implementation.md` |
| Inalterados nesta feature | `src/physics.ts`, `src/maneuvers.ts`, `src/audio.ts`, `scripts/`, `package.json`, `tsconfig.json`; dependências: nenhuma acrescentada | idem |
| Formato publicado que muda | arquivo de pista `schemaVersion` 2 (`trackId` `synthetic`, `trackVersion` 2), empacotado no bundle; leitor da versão 1 incluído | DM-0001, `REL-0002` |
| Formato persistido que muda | nenhum: a feature não grava nada no navegador | DES-0011, DM-0002 |
| Feature flag | **nenhuma**, por decisão do projeto validado: "nenhum requisito pede chave; a aposentadoria da validação preliminar acontece na mesma mudança que introduz a nova, de modo que não há duas validações ativas. A reversão é a do repositório" (DES-0007, seção *Feature flag*; o mesmo em DES-0011). A reversão desta release é, portanto, a republicação do artefato anterior (`runbook.md`) | DES-0007, DES-0011 |
| Variáveis de ambiente | nenhuma lida pelo cliente | `REL-0001` |

## Proveniência — o commit que a release nomeia

A política do estágio exige que o artefato que chega a staging seja construído, pelo pipeline, **a partir do commit que
os testes verificaram**.

| Fato | Estado em 2026-10-21 |
|---|---|
| Veredito de testes | `SUCCESS` — `500 Tests/Output/race-lap-validation/reports/test-validation/test-validation-20261021-1411.md` (170 casos, 170 aprovados, execução de 2026-10-21 14:10Z posterior à última edição de `src/` e `tests/`) |
| Commit verificado | **`c41c6c3ddf8ada690a2f2b1581ee87700c837268`** (curto `c41c6c3`), ramo `master`, mensagem "Kartle: pipeline de desenvolvimento e validação de volta (race-lap-validation)", feito pelo dono do produto em 2026-10-21 com a árvore que o veredito acima verificou. Reexecutados nesse commit pelo condutor do loop: `npm ci` saída 0, `npm test` 170 aprovados / 0 reprovados / 0 pulados, `npm run build` saída 0 (`dist/` com 593 256 bytes, tabela abaixo). O relatório de validação de deploy registra o resultado |
| Commits que o `master` enviado contém | do mais antigo ao mais novo: `c41c6c3` (árvore verificada: `npm ci`, 170 testes, build), `c1f7f28` (preparação da release: `.github/workflows/pages.yml`, `.nvmrc`, `docs/lap-validation-device-log.md`, este registro), `162b1b3` (decisões D23, D-DP-04 e monitoramento em `DOMAIN.md`), `c1e488b` (registro de release da rodada 5, só `600 Deploy/Output/`), `2bee672` (staging publicado, política do ambiente e execução 2 do log de aparelho) e `f16d65a` (ensaio de reversão R4, decisões em `DOMAIN.md`, seed e requisitos de `dirigibilidade`). Os cinco commits posteriores a `c41c6c3` são **só de registro**: **não alteram** `src/`, `tests/`, `index.html`, `package.json` nem `package-lock.json` — a árvore que o workflow constrói é a verificada em `c41c6c3`, e o veredito de testes continua a valer. A ponta de `master` enviada ao `kartle-staging` é `2bee672` (commit da execução 39631099098); localmente a ponta é `f16d65a`, e cada push posterior de registro cria uma execução nova cujo número se lê na aba Actions |
| Tag de release | não existe; a release é identificada pelo hash acima e pela execução do workflow que o publicar |
| Remoto GitHub | **existe** (2026-10-21, dono do produto `edumatosr6-svg`): repositório de produção `https://github.com/edumatosr6-svg/kartle` (público), remoto local `origin`; `master` enviado. Settings → Pages → *Source* = **GitHub Actions** (`build_type: workflow`); Settings → Environments → `github-pages` com **Required reviewers = `edumatosr6-svg`** e *Deployment branches and tags* na restrição padrão (só `master`). As execuções do workflow `pages` constroem e **param em `deploy` à espera da aprovação**: nada foi promovido (linha *Evidência do pipeline*; DIV-DP-10 `resolved`) |
| Sistema de CI | **GitHub Actions**: `.github/workflows/pages.yml` na raiz do repositório (ativo em `push` para `master` e `staging` e por `workflow_dispatch`); etapas em `REL-0003` |
| Staging | o site Pages de um **segundo repositório**, `https://github.com/edumatosr6-svg/kartle-staging` (público), remoto local `staging`, ramo `staging` (enviado com `git push staging master:staging`), *Source* = GitHub Actions, **sem revisor**, ambiente `github-pages` com *Deployment branches and tags* = **No restriction** (necessário para o ramo `staging` implantar — `REL-0003`; DIV-DP-13); site `https://edumatosr6-svg.github.io/kartle-staging/` (`REL-0003`; DIV-DP-11 `resolved`). **Instalado e observado** em 2026-10-21 (linha abaixo) e **confirmado pelo validador** (`deploy-validation-20261021-1602.md`: 200 em HTTPS, *assets* servidos idênticos byte a byte ao build local da árvore de `c41c6c3`). **R1/R2 ensaiados** sobre este site em 2026-10-21 (linha abaixo). De `smoke.md`, D1, D3, D4 e D14 passaram em staging (execução 2 do log); as linhas de ritmo e as linhas M esperam o testador humano |
| **Evidência do pipeline** (execuções do workflow `pages`, 2026-10-21) | **Produção** (`kartle`): execução **39627810079**, commit `162b1b3` — trabalho `build` concluído com sucesso, trabalho `deploy` em *Waiting* à espera do revisor obrigatório (por desenho; **não aprovado**) — a execução de produção **mais antiga ainda à espera**; execução **39629830827**, commit `c1e488b` — **cancelada** pelo grupo de concorrência `pages` quando um push posterior a substituiu (API: `completed cancelled`, 16:02:10Z). Os pushes só de registro (`2bee672`) criaram execuções mais novas nos dois repositórios; **os números em vigor são lidos na aba Actions**, não copiados deste registro. **Staging** (`kartle-staging`): execução **39627817908**, commit `162b1b3` — `build` concluído, `deploy` **falhado com zero passos executados**; execução **39629837192**, commit `c1e488b` — a mesma falha. Causa: o ambiente `github-pages`, criado automaticamente ao ativar o Pages, restringe as implantações ao ramo padrão (`custom_branch_policies: true, protected_branches: false`), e uma implantação a partir do ramo `staging` é recusada na preparação do trabalho. Correção aplicada pelo condutor do loop pela API do GitHub (`PUT repos/edumatosr6-svg/kartle-staging/environments/github-pages` com `deployment_branch_policy: null` — qualquer ramo); **reexecução de 39629837192**: `build` concluído, `deploy` concluído; `https://edumatosr6-svg.github.io/kartle-staging/` responde **HTTP 200 em HTTPS** com certificado válido (verificado por `curl`). **Ensaio de reversão em staging** (*Ensaio de reversão R4*, `docs/lap-validation-device-log.md`): R1 `DELETE /repos/edumatosr6-svg/kartle-staging/pages` às 16:23:52Z → 404 do GitHub no navegador em ≈ 1 min, `curl` ainda com 200 em cache por mais de 6 min (`max-age=600`); R2 `POST /pages` (`build_type: workflow`) + política do ambiente liberada de novo (a reativação recria o ambiente restrito ao ramo padrão) + *Re-run all jobs* → execução **39631099098** verde → 200 às 16:31:13Z com o mesmo `index-Cqfgl3da.js`; ciclo ≈ 7,5 min. A execução **39631099098** é a do push só de registro de **`2bee672`** ao ramo `staging` (criada 16:02:11Z), na sua **tentativa 2** (*Re-run all jobs* dessa execução, não de 39629837192); como `2bee672` não toca a árvore verificada, o *asset* servido é byte a byte o do build de `c41c6c3` (confirmado pelo validador, sha256 idêntico). Conclusão: **existe artefato construído pelo pipeline para a ponta enviada de `master` nos dois repositórios** (`c1e488b` e `2bee672`, mesma árvore de `c41c6c3`); o de produção espera aprovação, o de staging está publicado e a sua reversão foi demonstrada |
| Produção | o site Pages deste repositório, `https://edumatosr6-svg.github.io/kartle/`, com o ambiente `github-pages` protegido por **revisor obrigatório** (`edumatosr6-svg`): o clique de aprovação é a promoção (D-DP-06). Custo: US$ 0 em repositório público (RNF12). Domínio próprio: fora desta release |

### Precondições humanas que restam, em ordem

1. **Registrar a execução humana do roteiro de aparelho** em `docs/lap-validation-device-log.md` (E2E-01 a E2E-11 de
   `300 Specs/330 D-Specs/Output/race-lap-validation/test-strategy.md`), sobre a URL de staging. O log tem a
   **execução 1** (condutor do loop, desktop, build local do commit `c41c6c3`, parcial: estado e texto de D4, D5, D7,
   D8, D9, D10, D11; página em segundo plano, ritmo inválido) e a **execução 2** (staging, operador de sessão: D1, D3,
   D4, D14 passam; D2 não medido; D5–D13 não executados). **Três tentativas automatizadas de medir ritmo** (painel
   embutido, Chrome do dono do produto em primeiro plano, janela da extensão) **não produziram medida**: o Chrome
   limita o `requestAnimationFrame` a 1–2 quadros/s sob automação, com os temporizadores normais; o dono do produto
   **relata** o jogo fluido na sua própria aba — relato, não medida. Ficam para execução humana, com o contador de fps
   do navegador, no notebook e no celular de referência nomeados: D2, D5 (duração), D6, D12, D13 e as linhas M; 27
   critérios do veredito de testes têm a metade de tela, sensor, taxa de quadros ou navegador `unverified` até esse
   registro; `smoke.md` reutiliza os mesmos roteiros (DIV-DP-06). A pendência 4 do log ("URL publicada com HTTPS: D1,
   D2, D3") está reduzida a D2.

Cumpridas: o commit da árvore verificada (acima); **a primeira execução do pipeline observada** nos dois repositórios
(linha *Evidência do pipeline*: `build` verde em todas as execuções; produção em *Waiting* sem aprovação; staging
publicado e a responder 200 em HTTPS depois de corrigida a política de ramos do ambiente); **o ensaio de R1/R2 em
staging** (2026-10-21, linha *Evidência do pipeline*: despublicar → 404; republicar → execução 39631099098 (`2bee672`,
tentativa 2) verde com o mesmo `<hash>`; ciclo ≈ 7,5 min); a versão do Node fixada —
`.nvmrc` com `24` na raiz do repositório, lida pelo workflow (`node-version-file`), build medido abaixo com Node
v24.20.0 e npm 11.19.0; os dois repositórios no
GitHub com *Source* = GitHub Actions e a proteção do ambiente `github-pages` em produção (DIV-DP-10, DIV-DP-11); a
**ratificação de D-DP-04** (`DOMAIN.md`, 2026-10-21: "esta release, pista sintética, 0 dados OSM, não exibe crédito";
DIV-DP-05); e a **decisão de monitoramento** — vigilância manual conforme o runbook, nenhum monitor externo nesta
release (RNF12; `DOMAIN.md`, 2026-10-21; DIV-DP-08).

## Reprodução do build

O workflow executa estes passos a cada push; à mão, da raiz do repositório, com caminhos entre aspas:

| Passo | Comando | Resultado esperado |
|---|---|---|
| 1 | `npm ci` | saída 0; `package-lock.json` inalterado; `node_modules/` recriado |
| 2 | `npm test` | saída 0; 170 testes aprovados, 0 reprovados, 0 pulados (138 da feature + 32 pré-existentes) |
| 3 | `npm run build` (no workflow: `npm run build -- --base=/kartle/` em produção e `--base=/kartle-staging/` em staging — o nome vem de `github.event.repository.name`, porque o Pages de projeto serve em `/<nome do repositório>/`) | saída 0 (`tsc --noEmit` e depois `vite build`); `dist/index.html`, `dist/assets/index-<hash>.js`, `dist/assets/index-<hash>.css` |
| 4 | `python -I "600 Deploy/Output/race-lap-validation/tools/measure_dist.py" dist` | tabela de tamanhos; `within_limit=True`; saída 0 |
| 5 | `npm run preview` | `http://127.0.0.1:4173` serve o bundle; `#track-status` mostra `synthetic` e `#lap-offer` tem exatamente um botão, "volta de treino" (DES-0009) |

### Medida real do artefato (build local de 2026-10-21, árvore do commit `c41c6c3`, base `/`)

| Arquivo | bytes | gzip bytes |
|---|---:|---:|
| `assets/index-Cqfgl3da.js` | 574 785 | 146 813 |
| `assets/index-dgojskay.css` | 11 407 | 3 244 |
| `index.html` | 7 064 | 2 846 |
| **total** | **593 256** | **152 903** |

- Limite de RNF02 (download inicial abaixo de 3 MB = 3 145 728 bytes): **593 256 bytes brutos (18,9 % do limite)**;
  152 903 bytes comprimidos com gzip, se o CDN comprimir.
- Limite de RNF02 para a pista (abaixo de 200 KB): o arquivo de pista não é um download separado — está empacotado
  como literais no JS (`SYNTHETIC_TRACK_FILE`); a medida separada só se aplica quando a pista for servida por CDN
  (pós-MVP).
- O Vite avisa que o chunk principal passa de 500 kB minificado (Three.js); é um aviso de ferramenta, não uma violação
  de limiar deste projeto.
- Os nomes dos *assets* carregam hash de conteúdo: o `index.html` publicado é o que aponta para a versão em vigor
  (`REL-0003`, regra de cache).
- O build do workflow usa `--base=/kartle/` (produção) ou `/kartle-staging/` (staging): o `index.html` publicado
  referencia `/kartle/assets/...` ou `/kartle-staging/assets/...`; o tamanho total difere do local em poucos bytes (o
  nome do repositório nos caminhos) e a medida que vale é a impressa no passo *Measure dist* da execução.

## O que o pipeline faz (`.github/workflows/pages.yml`)

Em ordem, cada passo com saída observável na execução do Actions: checkout do commit → Node da `.nvmrc` com cache do
npm → `npm ci` → `npm test` (170 aprovados) → `npm run build -- --base=/kartle/` (ou `/kartle-staging/`) →
`measure_dist.py dist` (saída 0) → `configure-pages` → `upload-pages-artifact` de `dist/` → trabalho `deploy` no
ambiente `github-pages` (`deploy-pages`). Em produção (`edumatosr6-svg/kartle`) o trabalho `deploy` **espera a
aprovação do revisor obrigatório** `edumatosr6-svg` (D-DP-06); em staging (`edumatosr6-svg/kartle-staging`) publica de
imediato — desde que o ambiente `github-pages` desse repositório admita o ramo `staging` (política de ramos sem
restrição; sem isso o `deploy` falha com zero passos, como nas execuções 39627817908 e 39629837192). Permissões mínimas (`contents: read`, `pages: write`, `id-token: write`); nenhum segredo (I6). As execuções
ficam em `https://github.com/edumatosr6-svg/kartle/actions` e `https://github.com/edumatosr6-svg/kartle-staging/actions`.
Um ponto não automatizável permanece: o `href="/"` da marca no `index.html` aponta para `https://edumatosr6-svg.github.io/`
e não para `/kartle/` — item do estágio de código, registrado em `98-divergences.md` (DIV-DP-12), não editado aqui.

## Limitações conhecidas — divergências aceitas nesta release

- **Duas divergências aceitas** pelo dono do produto em 2026-10-21 (`DOMAIN.md`): o `href="/"` da marca sai de `/kartle/` no GitHub Pages (DIV-DP-12, ISSUE-15) e a página faz uma requisição a `fonts.googleapis.com` no carregamento — não durante a volta (DIV-DP-14, ISSUE-17); ambas `waived` em `98-divergences.md`, com a correção (href relativo; fontes embutidas no build) como itens de `200 Requirements/220 Input/race-lap-validation/SCOPE-BACKLOG.md` para a próxima release.
