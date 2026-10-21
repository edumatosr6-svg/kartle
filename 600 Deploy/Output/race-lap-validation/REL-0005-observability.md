---
id: REL-0005
title: Observabilidade — o que a release registra, o que se mede e o que faria soar um alerta
feature: race-lap-validation
stage: deploy
status: draft
version: 1.0.0
sources: [DES-0011, NFR-0003, NFR-0004, NFR-0005, CHK-TEST-0013-03]
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
| Disponibilidade da página | código de resposta e bytes servidos do `index.html` e dos *assets* | **registros de acesso do provedor** (quando houver): contagens por status e por recurso, sem identificadores de jogador | taxa de 5xx ou 404 diferente de zero sobre `index.html` ou sobre os *assets* em vigor |
| Integridade do deploy | o `index.html` servido aponta para o `assets/index-<hash>.js` do build promovido | comparação do HTML servido com o local (`runbook.md`) | hash divergente |

## Qual alerta soaria

Hoje **nenhum alerta automático existe**: não há CI, provedor nem monitor (`98-divergences.md`). O "alerta" desta
release é a **vigilância humana** definida no `runbook.md` (D-DP-03): o dono do produto repete a verificação em
produção ao promover e 24 h depois, e reverte se um limiar da tabela acima for cruzado.

Quando o provedor existir, o mínimo a configurar, em nomes: um monitor de disponibilidade HTTPS sobre a URL de produção
(falha = resposta diferente de 200 ou certificado inválido) e a retenção dos registros de acesso do provedor pelo
período que ele oferecer, sem enriquecimento com dado pessoal (RNF10, I6).

## Novo modo de falha que esta release introduz, e como se vê

| Modo de falha | Sintoma observável | Diagnóstico |
|---|---|---|
| arquivo de pista empacotado lido como `INCOMPLETE`, `UNREADABLE` ou `UNSUPPORTED_SCHEMA` | `#track-status` mostra o texto de erro ou a oferta não inclui volta oficial (DES-0009) | defeito de build ou de dado (`FAIL CODE`); `CHK-TEST-0009-*` deveria ter falhado em `npm test` |
| cronômetro parado com a volta em `RUNNING` | `#lap-state` sem avanço de tempo por quadro | defeito de aplicação (`src/frameClock.ts`, DES-0007) |
| pausa não acontece ao perder o foco ou o sensor | E2E-04 / E2E-05 falham | defeito de aplicação (ADR-0005) |
