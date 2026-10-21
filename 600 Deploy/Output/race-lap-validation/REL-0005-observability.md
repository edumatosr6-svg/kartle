---
id: REL-0005
title: Observabilidade — o que a release registra, o que se mede e o que faria soar um alerta
feature: race-lap-validation
stage: deploy
status: draft
version: 1.1.1
sources: [DES-0009, DES-0011, NFR-0003, NFR-0004, NFR-0005, CHK-TEST-0013-03]
---

# REL-0005 — Observabilidade

## O que a release acrescenta aos registros do cliente

**Nada que saia do navegador.** A feature não envia telemetria, não chama rede e não grava no navegador (DES-0011;
`CHK-TEST-0013-03`; NFR-0004, NFR-0005). O que existe de observável no cliente é a própria tela — `#track-status`,
`#lap-state`, `#lap-result` — e o console do navegador, onde um erro de módulo apareceria. Quando algo for registrado
(pós-MVP), só identificadores: `trackId`, `trackVersion`, `schemaVersion`, identificadores de verificação; nunca dado de
jogador (I6, DES-0011 *Comportamento em falha*).

## O que se mede, por requisito, e onde

| Requisito | Métrica | Onde se obtém | Limiar que indica falha |
|---|---|---|---|
| RNF01 carregamento | tempo da navegação até o kart responder a uma entrada, cache vazio, 4G | medida manual (`smoke.md` D2/M2); futuramente o relatório de performance do navegador | 10 s ou mais |
| RNF02 tamanho | bytes transferidos na primeira visita; bytes de `dist/` no build | `measure_dist.py` no build (hoje 593 256 bytes); painel de rede no smoke | 3 145 728 bytes ou mais |
| NFR-0003 / RNF03 quadros | fps médio e mínimo numa volta completa | `docs/lap-validation-device-log.md` (E2E-10) | abaixo de 60 em notebook ou de 30 em celular |
| NFR-0004 sem servidor | requisições de rede entre o início da contagem e o resultado | painel de rede no smoke (E2E-08) | 1 ou mais |
| RNF06 HTTPS | certificado válido; 0 recursos em HTTP | navegador (cadeado) e painel de rede | qualquer recurso inseguro ou aviso de certificado |
| Disponibilidade da página | código de resposta do `index.html` e dos *assets* em `https://edumatosr6-svg.github.io/kartle/` | **verificação manual em HTTPS** (`runbook.md`, *Verify* 1 e 7), por decisão do dono do produto de 2026-10-21 (`DOMAIN.md`, *Monitoramento*): o GitHub Pages **não fornece registros de acesso nem monitor de disponibilidade** e nenhum monitor externo entra nesta release (RNF12) | qualquer resposta diferente de 200 sobre `index.html` ou sobre um *asset* em vigor |
| Integridade do deploy | o `index.html` servido aponta para o `/kartle/assets/index-<hash>.js` do build aprovado | comparação do HTML servido com o `<hash>` impresso no passo *Build* da execução aprovada (`runbook.md` passo 10) | hash divergente |
| RNF02 no pipeline | bytes de `dist/` a cada execução | passo *Measure dist* do workflow (`measure_dist.py`, saída 1 acima do limite — a execução falha antes de publicar) | 3 145 728 bytes ou mais |

## O registro de implantações — o histórico do Actions

O **histórico de execuções do workflow `pages`** (`https://github.com/edumatosr6-svg/kartle/actions`; para staging,
`https://github.com/edumatosr6-svg/kartle-staging/actions`) é o registro de deploy desta release:
cada execução guarda o commit, o resultado de `npm test` (170 aprovados), o log do build com os nomes dos *assets*, a
medida de RNF02, e — no trabalho `deploy` — **quem aprovou e quando** (revisor obrigatório, D-DP-06) e a URL publicada.
Settings → Pages mostra a implantação em vigor. Retenção: 90 dias por padrão; a execução verde anterior é o alvo do
caminho B de reversão enquanto estiver retida (`runbook.md`). Nenhum dado de jogador entra nesse registro: ele só
contém o que o repositório e o workflow produzem (I6).

## Qual alerta soaria

**Nenhum alerta automático sobre a página servida — por decisão.** O GitHub Pages não oferece monitor de
disponibilidade nem registros de acesso, e o dono do produto decidiu em 2026-10-21 (`DOMAIN.md`, *Monitoramento*) que
esta release **não acrescenta monitor externo**: a vigilância é **manual, conforme o runbook** — abrir a URL publicada
após cada deploy (RNF12). A divergência DIV-DP-08 fica `waived` com essa decisão (`98-divergences.md`). O único alerta
automático é o do pipeline — uma execução falhada (teste, build ou RNF02) notifica o dono do produto por e-mail do GitHub
e nada é publicado. Sobre a página, o "alerta" é a **vigilância humana** do `runbook.md` (D-DP-03): o dono do produto
repete a verificação em produção ao promover e 24 h depois (*Verify* 1 a 7, com a verificação HTTPS manual de
`https://edumatosr6-svg.github.io/kartle/`), e reverte se um limiar da tabela acima for cruzado. Se um monitor HTTPS
externo vier numa release futura, observa essa URL com falha = resposta diferente de 200 ou certificado inválido, sem
dado pessoal (RNF10, I6).

## Novo modo de falha que esta release introduz, e como se vê

| Modo de falha | Sintoma observável | Diagnóstico |
|---|---|---|
| arquivo de pista empacotado lido como `INCOMPLETE`, `UNREADABLE` ou `UNSUPPORTED_SCHEMA` | `#track-status` mostra o texto de erro em vez de `synthetic`, ou `#lap-offer` fica sem o botão "volta de treino" (a oferta oficial não existe nesta release em nenhum caso, DES-0009) | defeito de build ou de dado (`FAIL CODE`); `CHK-TEST-0009-*` deveria ter falhado em `npm test` |
| *assets* em 404 em `https://edumatosr6-svg.github.io/kartle/` | console com erro de módulo; tela em branco | bundle construído sem `--base=/kartle/` ou janela de cache de 10 min após uma implantação (`REL-0003`, riscos) — empacotamento (`FAIL` deste estágio) |
| cronômetro parado com a volta em `RUNNING` | `#lap-state` sem avanço de tempo por quadro | defeito de aplicação (`src/frameClock.ts`, DES-0007) |
| pausa não acontece ao perder o foco ou o sensor | E2E-04 / E2E-05 falham | defeito de aplicação (ADR-0005) |
