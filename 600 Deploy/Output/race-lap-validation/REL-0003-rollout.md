---
id: REL-0003
title: Rollout — ordem de operações, janela de compatibilidade e o pipeline do GitHub Pages
feature: race-lap-validation
stage: deploy
status: draft
version: 1.1.1
sources: [DM-0001, DES-0007, DES-0011, NFR-0003, NFR-0004, TEST-0009]
---

# REL-0003 — Rollout

## Ordem de operações

A ordem típica do estágio (migração aditiva → backend → web → mobile → parte destrutiva) colapsa aqui num único passo,
e a razão é estrutural: não há backend, não há banco, não há aplicativo nativo e a "migração" viaja dentro do próprio
bundle (`REL-0002`).

| Ordem | Passo | Quem | Desfaz-se por |
|---|---|---|---|
| 1 | anotar a última execução verde do workflow `pages` em `edumatosr6-svg/kartle` (alvo do caminho B); **nesta primeira release não existe** — o alvo de reversão é o site não publicado (`runbook.md`, caminho A) | executor do runbook | não se desfaz: é a rede de segurança |
| 2 | `git push staging master:staging` → o workflow constrói e publica em **staging** (`https://edumatosr6-svg.github.io/kartle-staging/`); rodar `smoke.md`. **Estado em 2026-10-21**: o push foi feito pelo dono do produto; o resultado da execução é lido em `https://github.com/edumatosr6-svg/kartle-staging/actions` e registrado pela próxima validação | executor do runbook | reexecutar a execução verde anterior de `kartle-staging` (B); nesta release, *Unpublish site* de `kartle-staging` (A) |
| 3 | **pergunta ao dono do produto** — promover? (D-DP-06) | dono do produto | não promover |
| 4 | `git push origin master` → o workflow constrói em `edumatosr6-svg/kartle` e **para à espera do revisor** no ambiente `github-pages`; o dono do produto clica *Approve and deploy*; o cache do Pages renova em até 10 min (`max-age=600`, sem purga). **Estado em 2026-10-21**: o push foi feito; a execução deve estar parada em `deploy` (*Waiting*) — **nada aprovado**; o passo 3 ainda não foi respondido | dono do produto | R1 do `runbook.md`: *Unpublish site* (A, esta release) ou *Re-run all jobs* da execução anterior + aprovação (B) |
| 5 | `smoke.md`, seção *Verificação em produção*, e vigilância por 24 h (`REL-0005`) | dono do produto | idem 4 |

Não há parte destrutiva adiada para uma release seguinte: nada é removido de nenhum armazenamento.

## Staging e produção no GitHub Pages — o que o dono do produto cria na interface do GitHub

O GitHub Pages serve **um site por repositório**. Staging e produção são, portanto, dois repositórios alimentados pelo
**mesmo** arquivo de workflow (ele deriva a base dos caminhos e a URL do nome do repositório):

| | Produção | Staging |
|---|---|---|
| Repositório | `edumatosr6-svg/kartle` (este) — `https://github.com/edumatosr6-svg/kartle`, remoto local `origin` | `edumatosr6-svg/kartle-staging` — `https://github.com/edumatosr6-svg/kartle-staging`, remoto local `staging` |
| Visibilidade | público | público |
| Ramo que publica | `master` | `staging` (o dono do produto envia com `git push staging master:staging` ou mantém um ramo `staging` local) |
| URL | `https://edumatosr6-svg.github.io/kartle/` | `https://edumatosr6-svg.github.io/kartle-staging/` |
| Settings → Pages → *Build and deployment* → *Source* | **GitHub Actions** (`build_type: workflow`) — configurado | **GitHub Actions** — configurado |
| Settings → Environments → `github-pages` → *Required reviewers* | **`edumatosr6-svg`** — configurado; o trabalho `deploy` espera o clique *Approve and deploy*; esse clique é a promoção (D-DP-06) | nenhum: publica ao fim do `build` |
| Push de `staging` para este repositório | construído e testado, **não publicado** (`if` do trabalho `deploy`) | — |

**Tudo isto existe desde 2026-10-21** (dono do produto, interface do GitHub; DIV-DP-10 e DIV-DP-11 `resolved`):
os dois repositórios foram criados e configurados, `master` foi enviado a `origin` e a `staging` (como ramo `staging`).
O que **ainda não está registrado** é o resultado das primeiras execuções: o número da execução, o log de `npm test`,
a medida de `Measure dist` e a URL publicada em staging são lidos pelo humano na aba Actions de cada repositório e
entram no próximo relatório de validação — este documento não os inventa. Custo: US$ 0 em repositórios públicos (RNF12).

## Feature flag e quem "liga" a feature

Não há flag (DES-0007, DES-0011; `01-release.md`). A feature fica ativa para 100 % dos jogadores no instante em que o
`index.html` novo é servido. Quem a liga é o dono do produto ao executar o passo 4; o que ele observa está em
`REL-0005` e os limiares que mandam reverter, no `runbook.md`. Não há remoção de flag a agendar.

## Janela de compatibilidade e versão mínima do cliente

| Pergunta | Resposta |
|---|---|
| O que o código antigo precisa continuar funcionando contra | nada: não há servidor, contrato de rede nem dado persistido compartilhado entre as versões (DES-0011) |
| Por quanto tempo as duas versões coexistem | **até 10 min**: o Pages serve todo arquivo com `Cache-Control: max-age=600`, e serve só a implantação corrente — passado esse tempo o navegador busca o `index.html` novo; uma página antiga ainda aberta continua a correr em memória (não refaz download de módulo) |
| Versão mínima do cliente | não há versão de cliente instalada: a página é o cliente. Navegadores de referência: Chrome, Edge, Firefox e Safari nas versões atuais (`test-strategy.md`, roteiro E2E-11), em `web-desktop` e `web-mobile` |
| Atualização forçada | não se aplica; o único mecanismo é o cache (abaixo) |

### Regra de cache — o que o GitHub Pages aplica (não configurável)

| Recurso | Política do Pages | Consequência |
|---|---|---|
| `index.html` | `Cache-Control: max-age=600`; **não há comando de purga** | o ponteiro para a versão em vigor renova em até 10 min; a promoção e a reversão ficam visíveis nesse prazo (`runbook.md` passos 11 e R2) |
| `assets/*.js`, `assets/*.css` | os mesmos 10 min (o Pages não marca `immutable`) | o nome carrega hash de conteúdo, então uma versão nunca muda sob o mesmo nome (I3 aplicado ao artefato); o cache curto só custa revalidações |
| *assets* da versão anterior | **não são mantidos**: o Pages serve apenas a implantação corrente | uma página antiga que recarregue um módulo depois de uma nova implantação recebe 404 — mitigado pelo `max-age` de 10 min e por o bundle ser um único módulo carregado na abertura; a reversão não depende de *assets* antigos, porque reconstrói do commit (`runbook.md`, caminhos B e C) |

## O pipeline — `.github/workflows/pages.yml` (fecha o ponto em aberto 04 das diretivas)

Um workflow, `pages`, disparado por `push` em `master` e `staging` e por `workflow_dispatch`. Permissões mínimas
(`contents: read`, `pages: write`, `id-token: write`), ações fixadas por versão maior (`checkout@v4`, `setup-node@v4`,
`configure-pages@v5`, `upload-pages-artifact@v3`, `deploy-pages@v4`), nenhum segredo (o Pages autentica com o token
OIDC da execução). Etapas e a saída que aprova cada uma, na própria execução do Actions:

| # | Etapa | Comando ou ação no workflow | Saída observável que aprova a etapa |
|---|---|---|---|
| 1 | obter o commit | `actions/checkout` do commit do push (`c41c6c3` nesta release) | o cabeçalho da execução mostra o hash |
| 2 | Node e instalação | `actions/setup-node` com `node-version-file: .nvmrc` e `cache: npm`; `npm ci` | Node 24.x no log; saída 0; lockfile inalterado |
| 3 | testar | `npm test` | saída 0; 170 aprovados, 0 reprovados, 0 pulados |
| 4 | construir | `npm run build -- --base=/kartle/` em produção, `--base=/kartle-staging/` em staging (o nome vem de `github.event.repository.name`; o Pages de projeto serve em `/<nome do repositório>/` e o `index.html` referencia `/kartle/assets/...` ou `/kartle-staging/assets/...`) | saída 0; o log do Vite lista `dist/index.html`, `dist/assets/index-<hash>.js`, `dist/assets/index-<hash>.css` |
| 5 | medir | `python3 -I "600 Deploy/Output/race-lap-validation/tools/measure_dist.py" dist` | `within_limit=True` (RNF02: abaixo de 3 145 728 bytes); saída 0, senão a execução falha aqui. Medido localmente: 593 256 bytes |
| 6 | empacotar | `actions/configure-pages`; `actions/upload-pages-artifact` com `path: dist` | artefato `github-pages` anexado à execução |
| 7 | publicar | trabalho `deploy`, ambiente `github-pages`, `actions/deploy-pages` | **staging**: publica de imediato; **produção**: fica em *Waiting* até o revisor obrigatório clicar *Approve and deploy* (D-DP-06); depois, a URL do ambiente na execução |
| 8 | smoke em staging | `smoke.md` (humano) | todas as linhas com resultado dentro do limiar |
| 9 | **parar** | a execução de produção parada em *deploy* é a pergunta de promoção; o clique é a resposta | aprovação registrada na execução, com quem e quando |
| 10 | verificar | `smoke.md`, *Verificação em produção*, depois dos 10 min de cache | limiares de RNF01, RNF02, RNF06 observados |

O workflow **foi disparado pela primeira vez em 2026-10-21** pelos pushes de `master` a `origin` e a `staging`
(DIV-DP-10, DIV-DP-11). A sua primeira execução verde é a prova de que o build é reproduzido pelo pipeline a partir do
commit; o resultado é lido em `https://github.com/edumatosr6-svg/kartle/actions` e
`https://github.com/edumatosr6-svg/kartle-staging/actions` e registrado pela próxima validação de deploy — nenhum
número de execução nem resultado é afirmado aqui. O `runbook.md` continua a reproduzir as etapas 2 a 5 à mão como
conferência. Um push de `staging` para o repositório de produção constrói e testa, mas o `if` do trabalho `deploy`
impede a publicação.

## Riscos específicos deste rollout e como são observados

| Risco | Como se vê | Resposta |
|---|---|---|
| `index.html` novo servido com *assets* antigos, ou antigo com *assets* já removidos (janela de 10 min do cache) | tela em branco ou erro de módulo no console (404 em `/kartle/assets/` ou `/kartle-staging/assets/`); `#track-status` nunca sai de "carregando a pista" | esperar os 10 min do `max-age` e recarregar em janela anônima; se persistir, reverter |
| bundle construído sem `--base=/kartle/` (ou `/kartle-staging/`; workflow editado) | `index.html` referencia `/assets/...` e os *assets* respondem 404 em `https://edumatosr6-svg.github.io/kartle/` (ou `/kartle-staging/`) | defeito de empacotamento (`FAIL` deste estágio): restaurar o flag no workflow e reexecutar |
| link da marca `href="/"` no cabeçalho | leva a `https://edumatosr6-svg.github.io/` (fora do site) em vez de `/kartle/` | item do estágio de código (DIV-DP-12); não é gatilho de reversão — nenhuma verificação depende dele |
| sensor de inclinação indisponível em `web-mobile` | a página avisa "Inclinação indisponível" quando `window.isSecureContext` é falso (`src/main.ts`) | é sintoma de HTTPS ausente (RNF06): corrigir o certificado, não o código |
| queda de taxa de quadros | E2E-10 abaixo de 60 fps em notebook ou 30 fps em celular (NFR-0003) | reverter; a causa é defeito de aplicação (`FAIL CODE`), não de empacotamento |
