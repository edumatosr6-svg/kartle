---
title: Registro de mudanças — validação de volta de corrida (estágio de deploy)
feature: race-lap-validation
stage: deploy
status: draft
version: 1.0.0
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
