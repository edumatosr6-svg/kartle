---
id: REL-0001
title: Configuração de ambiente — nomes e significados, nunca valores
feature: race-lap-validation
stage: deploy
status: draft
version: 1.0.0
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

## O que o passo de hospedagem precisará, quando existir (D23)

Somente **nomes e papéis**; o nome exato é o que o provedor escolhido definir, e o valor vive no ambiente do executor
(CI ou máquina do dono do produto), nunca num arquivo do repositório (I6).

| Papel | Para que serve | Quem define | Obrigatória | Onde vive |
|---|---|---|---|---|
| Credencial de publicação do provedor | autorizar o envio de `dist/` ao CDN e a purga do cache | dono do produto, no painel do provedor | sim, assim que houver CI ou publicação por linha de comando | ambiente do executor; nunca no repositório |
| Identificador do site ou projeto no provedor | apontar a publicação para o site certo (staging e produção são dois identificadores ou dois ramos do mesmo) | provedor | sim | arquivo de configuração do provedor ou ambiente; não é segredo |
| Domínio de produção | URL verificada pelo `smoke.md` e pelo certificado HTTPS | dono do produto (D23) | sim | configuração do provedor; não é segredo |
| Versão do Node para o build | reproduzir o build (`REL-0003`); medido hoje com Node v24.20.0 | dono do produto | recomendada (`.nvmrc` ou campo `engines`) | repositório; não é segredo |

Nada desta tabela é lido pela página publicada: o bundle é idêntico em dev, staging e produção, e a diferença entre os
ambientes é apenas a URL que o serve.
