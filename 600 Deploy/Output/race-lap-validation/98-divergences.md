---
title: Registro de divergências e lacunas devidas ao humano (estágio de deploy)
feature: race-lap-validation
stage: deploy
status: draft
version: 1.0.0
sources: []
---

# 98 — Divergências

Nenhuma linha abaixo é um defeito do artefato: cada uma é algo que a política do estágio exige da release e que o
repositório, hoje, não pode fornecer sem uma decisão ou uma ação humana. Nenhuma contribui para o veredito; cada uma
bloqueia uma precondição do `runbook.md` até ser resolvida. Estado: `open`.

| Id | Estado | O que o estágio exige | O que existe hoje (evidência) | Quem deve | Resolve-se por |
|---|---|---|---|---|---|
| DIV-DP-01 | open | a release nomeia o commit que os testes verificaram (política 2; `01-release.md`) | zero commits no repositório; a árvore verificada em 2026-10-21 14:10Z é a árvore de trabalho; `git` reservado ao dono do produto | dono do produto | commit da árvore verificada; `npm ci`, `npm test`, `npm run build` nesse commit; registro do hash no relatório de testes ou em novo relatório |
| DIV-DP-02 | open | o pipeline reproduz o build a partir do commit verificado (política 2; `REL-0003`) | nenhum sistema de CI (ponto em aberto 04 das diretivas) | dono do produto (D23 primeiro) | transcrever as etapas 1 a 11 de `REL-0003` no CI do provedor escolhido |
| DIV-DP-03 | open | staging onde a release é provada e a reversão ensaiada (política 3; runbook, precondição 3) | staging não definido (ponto em aberto 03 das diretivas, ligado a D23) | dono do produto | decisão D23 com um site de staging e um de produção |
| DIV-DP-04 | open | comandos exatos de publicação, purga de cache e reversão (D-DP-02) | provedor, domínio e orçamento em aberto (D23; RNF12 abaixo de US$ 10/mês); os passos **[provedor]** do runbook descrevem ação e resultado, não o comando | dono do produto | decisão D23; preencher os passos 6, 7, 10, 11, R1 e R2 do runbook |
| DIV-DP-05 | open | crédito OSM e aviso ODbL visíveis no build publicado (D-DP-04, RNF09) | nesta release nenhum dado OSM é publicado (pista sintética, literais em `src/track.ts`; 0 ocorrências de "OpenStreetMap"/"ODbL" em `dist/`), logo D14/M12 têm resultado decidível: passam com 0 ocorrências e nenhuma alegação de atribuição na página. A regra de D-DP-04 fica devida à **primeira release que publicar uma pista OSM** | dono do produto, na primeira release com pista OSM | acrescentar o crédito e o aviso por mudança de código (estágio de código) nessa release, e então D14/M12 passam a exigir a sua presença |
| DIV-DP-06 | open | roteiros E2E-01 a E2E-11 registrados nos aparelhos e navegadores nomeados (`smoke.md`; 27 critérios `unverified` no veredito de testes) | `docs/lap-validation-device-log.md` não existe | dono do produto ou testador humano | criar o log e registrar cada roteiro com aparelho, navegador, versão e medida |
| DIV-DP-07 | open | medida de RNF01 (carregamento abaixo de 10 s em 4G) na URL publicada | só há medida de tamanho (593 256 bytes; `01-release.md`); o tempo depende de uma URL servida por CDN | dono do produto, após D23 | D2/M2 de `smoke.md` em staging e em produção |
| DIV-DP-08 | open | alerta que soaria se um requisito fosse violado em produção (política 8; `REL-0005`) | nenhum monitor nem alerta; vigilância humana do runbook | dono do produto, após D23 | monitor de disponibilidade HTTPS sobre a URL de produção e retenção dos registros de acesso do provedor |
| DIV-DP-09 | open | versão do Node fixada para reproduzir o build (`REL-0001`) | sem `.nvmrc`, `.node-version` nem `engines`; build medido com Node v24.20.0 e npm 11.19.0 | dono do produto | acrescentar `.nvmrc` ou `engines` ao repositório (fora deste estágio) |

Nenhuma divergência código-versus-especificação foi aberta por este estágio: o veredito de testes é `SUCCESS` e a
release não altera o comportamento verificado.
