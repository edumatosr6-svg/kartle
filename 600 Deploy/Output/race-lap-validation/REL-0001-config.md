---
id: REL-0001
title: Configuração de ambiente — nomes e significados, nunca valores
feature: race-lap-validation
stage: deploy
status: draft
version: 1.1.0
sources: [DES-0011, NFR-0004, NFR-0005]
---

# REL-0001 — Configuração de ambiente

## O cliente do MVP não lê configuração

A página não lê variável de ambiente, chave, credencial nem arquivo de configuração em tempo de execução nem de build:

| Evidência | Resultado |
|---|---|
| `import.meta.env` ou `process.env` em `src/` e `index.html` | 0 ocorrências |
| `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `localStorage`, `sessionStorage`, `indexedDB` nos módulos da feature e em `src/main.ts` | 0 ocorrências, garantido por `CHK-TEST-0013-03` (NFR-0004, NFR-0005) |
| Projeto validado | DES-0011: "a feature não lê variável de ambiente, chave nem credencial" |
| Diretivas do estágio | "Configuração e secrets: none in the MVP client" |

Não há, portanto, arquivo `.env`, template de configuração nem segredo a gerenciar para esta release. Nenhum valor —
real, de exemplo ou de preenchimento — aparece neste estágio (D-DP-05).

## O que a hospedagem usa (D23: GitHub Pages) — nenhuma variável de ambiente

O workflow `.github/workflows/pages.yml` não declara `env:`, não lê `secrets.*` e não recebe `inputs`. Os únicos
dados de configuração são dois, nenhum deles segredo e nenhum deles escrito neste repositório:

| Entrada | Para que serve | Quem define | Obrigatória | Onde vive |
|---|---|---|---|---|
| Nome do repositório (`github.event.repository.name`) | base dos caminhos do bundle (`--base=/<repo>/`) e, por consequência, a URL `https://<owner>.github.io/<repo>/`; `kartle` é produção, `kartle-staging` é staging | o GitHub, a partir do repositório em que o workflow corre | sim (fornecida pelo evento, nada a configurar) | contexto da execução |
| Ambiente `github-pages` | onde o trabalho `deploy` publica; em produção leva o **revisor obrigatório** (o dono do produto), em staging nenhum | dono do produto, em Settings → Environments → `github-pages` | sim | configuração do repositório no GitHub; não é segredo |

A autenticação da publicação é o token OIDC da própria execução (`permissions: id-token: write`, `pages: write`):
nenhuma credencial é criada, guardada ou copiada (I6, D-DP-05). A versão do Node vem de `.nvmrc` (`24`) na raiz do
repositório, lida por `node-version-file`; o build medido usou Node v24.20.0. Domínio próprio: fora desta release; a URL
é a do `github.io`.

Nada desta tabela é lido pela página publicada: o bundle difere entre staging e produção apenas na base dos caminhos
(`/kartle-staging/` contra `/kartle/`), que o workflow deriva do nome do repositório.
