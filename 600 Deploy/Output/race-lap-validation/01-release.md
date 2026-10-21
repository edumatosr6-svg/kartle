---
title: Release — validação de volta de corrida
feature: race-lap-validation
stage: deploy
status: draft
version: 1.1.1
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
| Tag de release | não existe; a release é identificada pelo hash acima e pela execução do workflow que o publicar |
| Remoto GitHub | **não existe ainda**: o dono do produto cria o repositório `<owner>/kartle` no GitHub e faz `git push -u origin master`; só então o workflow abaixo tem a primeira execução (`98-divergences.md`, DIV-DP-10) |
| Sistema de CI | **GitHub Actions**: `.github/workflows/pages.yml` na raiz do repositório (ativo em `push` para `master` e `staging` e por `workflow_dispatch`); etapas em `REL-0003` |
| Staging | o site Pages de um **segundo repositório**, `<owner>/kartle-staging`, alimentado pelo mesmo workflow a partir do ramo `staging` — a ser criado pelo dono do produto (`REL-0003`; DIV-DP-11) |
| Produção | o site Pages deste repositório, `https://<owner>.github.io/kartle/`, com o ambiente `github-pages` protegido por **revisor obrigatório** (o dono do produto): o clique de aprovação é a promoção (D-DP-06). Custo: US$ 0 em repositório público (RNF12). Domínio próprio: fora desta release |

### Precondições humanas que restam, em ordem

1. **Criar o repositório `<owner>/kartle` no GitHub e fazer o push de `master`** (dono do produto); em Settings → Pages,
   *Source* = "GitHub Actions"; em Settings → Environments → `github-pages`, *Required reviewers* = o dono do produto.
   Até lá o workflow nunca correu e a proveniência "construído pelo pipeline" não foi observada.
2. **Criar o repositório `<owner>/kartle-staging`** com *Source* = "GitHub Actions" e sem revisor; fazer o push do ramo
   `staging` (`REL-0003`, *Staging e produção no GitHub Pages*).
3. **Registrar a execução 2 do roteiro de aparelho** em `docs/lap-validation-device-log.md` (E2E-01 a E2E-11 de
   `300 Specs/330 D-Specs/Output/race-lap-validation/test-strategy.md`). O log existe com a **execução 1** (condutor do
   loop, desktop, build local do commit `c41c6c3`, parcial: estado e texto de D4, D5, D7, D8, D9, D10, D11; página em
   segundo plano, ritmo inválido; nenhum aparelho nomeado). Falta a execução em staging, janela em primeiro plano, no
   notebook e no celular de referência nomeados: 27 critérios do veredito de testes têm a metade de tela, sensor, taxa
   de quadros ou navegador `unverified` até esse registro; `smoke.md` reutiliza os mesmos roteiros (DIV-DP-06).
4. **Ratificar a leitura de D-DP-04 nesta release** (`98-divergences.md`, DIV-DP-05): nenhum dado OSM é publicado, logo
   nenhum crédito é exigido até a primeira release com pista OSM; ou o crédito entra por mudança de código.

Cumpridas: o commit da árvore verificada (acima) e a versão do Node fixada — `.nvmrc` com `24` na raiz do repositório,
lida pelo workflow (`node-version-file`); o build medido abaixo usou Node v24.20.0 e npm 11.19.0.

## Reprodução do build

O workflow executa estes passos a cada push; à mão, da raiz do repositório, com caminhos entre aspas:

| Passo | Comando | Resultado esperado |
|---|---|---|
| 1 | `npm ci` | saída 0; `package-lock.json` inalterado; `node_modules/` recriado |
| 2 | `npm test` | saída 0; 170 testes aprovados, 0 reprovados, 0 pulados (138 da feature + 32 pré-existentes) |
| 3 | `npm run build` (no workflow: `npm run build -- --base=/<repo>/`, porque o Pages de projeto serve em `/<repo>/`) | saída 0 (`tsc --noEmit` e depois `vite build`); `dist/index.html`, `dist/assets/index-<hash>.js`, `dist/assets/index-<hash>.css` |
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
- O build do workflow usa `--base=/<repo>/`: o `index.html` publicado referencia `/<repo>/assets/...`; o tamanho total
  difere do local em poucos bytes (o nome do repositório nos caminhos) e a medida que vale é a impressa no passo
  *Measure dist* da execução.

## O que o pipeline faz (`.github/workflows/pages.yml`)

Em ordem, cada passo com saída observável na execução do Actions: checkout do commit → Node da `.nvmrc` com cache do
npm → `npm ci` → `npm test` (170 aprovados) → `npm run build -- --base=/<repo>/` → `measure_dist.py dist` (saída 0) →
`configure-pages` → `upload-pages-artifact` de `dist/` → trabalho `deploy` no ambiente `github-pages`
(`deploy-pages`). Em produção o trabalho `deploy` **espera a aprovação do revisor obrigatório** (D-DP-06); em staging
publica de imediato. Permissões mínimas (`contents: read`, `pages: write`, `id-token: write`); nenhum segredo (I6).
Um ponto não automatizável permanece: o `href="/"` da marca no `index.html` aponta para a raiz de `<owner>.github.io`
e não para `/<repo>/` — item do estágio de código, registrado em `98-divergences.md` (DIV-DP-12), não editado aqui.
