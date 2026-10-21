---
title: Release — validação de volta de corrida
feature: race-lap-validation
stage: deploy
status: draft
version: 1.0.0
sources: [DM-0001, DM-0002, DES-0007, DES-0011, NFR-0003, NFR-0004, NFR-0006, NFR-0007, NFR-0012]
---

# 01 — Release

Candidato a release da feature `race-lap-validation`: contagem regressiva, cronometragem por passo fixo, validação da
volta (marcadores, sentido, corte, reposicionamento), tipos de volta e HUD, sobre o arquivo de pista versão 2. O que se
entrega é um **artefato estático** (`dist/`, HTML + JS + CSS) servido por CDN com HTTPS; não há servidor, banco, serviço
nem aplicativo nativo nesta release.

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

## Proveniência — o que a release precisa afirmar e ainda não pode

A política do estágio exige que o artefato que chega a staging seja construído, pelo pipeline, **a partir do commit que
os testes verificaram**. Hoje isso não é possível de afirmar:

| Fato | Estado em 2026-10-21 |
|---|---|
| Veredito de testes | `SUCCESS` — `500 Tests/Output/race-lap-validation/reports/test-validation/test-validation-20261021-1411.md` (170 casos, 170 aprovados, execução de 2026-10-21 14:10Z posterior à última edição de `src/` e `tests/`) |
| Commit verificado | **não existe**: o repositório git não tem nenhum commit (`git` é reservado ao dono do produto); a árvore verificada é a árvore de trabalho não versionada |
| Tag de release | não existe |
| Sistema de CI | não existe (ponto em aberto 04 das diretivas do estágio) |
| Staging | não definido (ponto em aberto 03 das diretivas, ligado à decisão de hospedagem D23) |
| Produção | CDN estática com HTTPS; provedor, domínio e orçamento em aberto (D23, RNF12 abaixo de US$ 10/mês); promoção sempre pelo dono do produto (D-DP-06) |

Nada disto é contornado por este registro: a release fica **bloqueada na primeira precondição** do `runbook.md` até que
o humano a cumpra. As lacunas estão em `98-divergences.md`, uma linha por item, devidas ao humano.

### Precondições humanas, em ordem

1. **Fazer o commit da árvore verificada** (dono do produto) e anotar o hash. Em seguida, nesse commit, rodar
   `npm ci`, `npm test` e `npm run build` e registrar a execução (um novo relatório de validação de testes, ou uma nota
   datada no relatório existente com o hash e os totais), para que a proveniência "testes verificados no commit X" seja
   verdadeira. Até lá o `runbook.md` não passa da precondição 1.
2. **Escolher o provedor de hospedagem** (D23): isso define staging, os comandos de publicação e de reversão e a forma
   de purgar o cache. `REL-0003` descreve o que o pipeline deve fazer assim que o provedor existir.
3. **Registrar o roteiro de aparelho** `docs/lap-validation-device-log.md` (E2E-01 a E2E-11 de
   `300 Specs/330 D-Specs/Output/race-lap-validation/test-strategy.md`): 27 critérios do veredito de testes têm a metade
   de tela, sensor, taxa de quadros ou navegador `unverified` até esse registro; `smoke.md` reutiliza os mesmos roteiros.
4. **Decidir a aplicabilidade de D-DP-04 nesta release**: o bundle não contém dado derivado de OpenStreetMap (a pista
   é sintética, literais em `src/track.ts`; `dist/` não contém a palavra "OpenStreetMap") e a página não exibe crédito OSM
   nem aviso ODbL. Ou a diretiva é declarada não aplicável enquanto nenhuma pista OSM for publicada (e isso fica
   registrado), ou o crédito entra por uma mudança de código fora deste estágio.
5. **Fixar a versão do Node** usada pelo build (não há `.nvmrc`, `.node-version` nem campo `engines`): o build medido
   abaixo usou Node v24.20.0 e npm 11.19.0.

## Reprodução do build hoje (sem CI)

Da raiz do repositório, com caminhos entre aspas:

| Passo | Comando | Resultado esperado |
|---|---|---|
| 1 | `npm ci` | saída 0; `package-lock.json` inalterado; `node_modules/` recriado |
| 2 | `npm test` | saída 0; 170 testes aprovados, 0 reprovados, 0 pulados (138 da feature + 32 pré-existentes) |
| 3 | `npm run build` | saída 0 (`tsc --noEmit` e depois `vite build`); `dist/index.html`, `dist/assets/index-<hash>.js`, `dist/assets/index-<hash>.css` |
| 4 | `python -I "600 Deploy/Output/race-lap-validation/tools/measure_dist.py" dist` | tabela de tamanhos; `within_limit=True`; saída 0 |
| 5 | `npm run preview` | `http://127.0.0.1:4173` serve o bundle; `#track-status` mostra `synthetic` e a oferta inclui volta oficial |

### Medida real do artefato (build local de 2026-10-21, árvore verificada, não versionada)

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

## O que o pipeline deverá fazer quando existir (D23 decidido)

Em ordem, cada passo com saída observável: obter o commit verificado → `npm ci` → `npm test` (170 aprovados) →
`npm run build` → `measure_dist.py dist` (saída 0) → guardar o `dist/` publicado hoje como artefato de reversão, nomeado
pelo hash do commit → publicar `dist/` em staging → `smoke.md` em staging → **parar e perguntar ao dono do produto**
(D-DP-06) → publicar em produção → purgar o cache do `index.html` → `smoke.md` de verificação em produção. Nenhum passo
é automatizado neste repositório nesta rodada: não há arquivo de CI nem configuração de provedor a escrever antes de D23.
