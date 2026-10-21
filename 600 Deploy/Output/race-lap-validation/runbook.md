---
title: Runbook — promover, verificar e reverter a release de validação de volta
feature: race-lap-validation
stage: deploy
status: draft
version: 1.0.0
sources: [DM-0001, DES-0011, NFR-0003, NFR-0004, TEST-0009]
---

# Runbook

Para quem não escreveu a release. Executar da raiz do repositório, com todo caminho entre aspas. Nenhum passo é
executado por um loop: cada um é de um humano, e a promoção a produção é sempre do dono do produto (D-DP-06). Onde o
provedor ainda não foi escolhido (D23), o passo está marcado **[provedor]** e descreve a ação e o resultado observável;
o comando exato é preenchido quando D23 for decidido, sem alterar o resto deste documento.

Artefato: `dist/` (HTML, JS e CSS estáticos). Não há banco, migração de dado nem aplicativo nativo.

**Alvo de reversão.** Esta é a **primeira release**: produção não serve nenhum `dist/` e o repositório não tem commit
anterior à feature (o primeiro commit será a árvore verificada, que já contém a feature). O estado anterior à feature
**não existe como artefato**. Por isso há dois caminhos de reversão, e cada passo de *Roll back* nomeia qual aplica:

| Caminho | Quando se aplica | O que R1 publica |
|---|---|---|
| **A — despublicar** | primeira release (esta): nenhum `dist/` anterior guardado no passo 6 | nada: o site de produção volta a **não publicado** (a URL deixa de servir `index.html`) |
| **B — republicar artefato guardado** | releases seguintes: o passo 6 guardou `kartle-dist-<hash-anterior>.zip` | o conteúdo do zip |
| **C — reverter e reconstruir** (DM-0001, *Plano de migração*) | só quando existir um commit anterior à feature e o zip de B tiver sido perdido; `git` é do dono do produto | o `dist/` de `npm run build` na árvore após `git revert` do commit de integração, com `npm test` aprovado |

Nesta release só o caminho A existe; B passa a existir na release seguinte, depois de o passo 6 guardar o `dist/` desta.

## Preconditions

- [ ] **Commit verificado existe.** O repositório tem hoje zero commits. O dono do produto faz o commit da árvore
      verificada, anota o hash e, nesse commit, roda `npm ci`, `npm test` (170 aprovados) e `npm run build`, registrando
      a execução com o hash. Sem isso, **parar aqui**: uma release sem proveniência não é uma release.
- [ ] Veredito de testes `SUCCESS`: `500 Tests/Output/race-lap-validation/reports/test-validation/test-validation-20261021-1411.md`
      (ou o relatório mais novo que cite o hash acima).
- [ ] Validação de staging `SUCCESS`: relatório em `600 Deploy/Output/race-lap-validation/reports/deploy-validation/`
      (não existe ainda; depende de staging existir).
- [ ] Histórico de migração: **não se aplica** — não há banco; a única revisão é o arquivo de pista `schemaVersion` 2,
      empacotado no bundle (`REL-0002`).
- [ ] Feature flag: **não há** (DES-0007; `01-release.md`); a feature fica ativa ao servir o `index.html` novo.
- [ ] Provedor de hospedagem escolhido (D23), com site de staging e de produção, HTTPS ativo nos dois e acesso de
      publicação configurado no ambiente de quem executa — nunca num arquivo do repositório (`REL-0001`, D-DP-05).
- [ ] `docs/lap-validation-device-log.md` existe com os roteiros E2E-01 a E2E-11 registrados nos aparelhos nomeados
      (27 critérios `unverified` no veredito de testes dependem dele).
- [ ] D14/M12 decidíveis nesta release: `dist/` sem dado OSM (0 ocorrências de "OpenStreetMap"/"ODbL", pista
      sintética), logo nenhum crédito é exigido (`smoke.md`); D-DP-04 passa a exigir o crédito na primeira release que
      publicar uma pista OSM (`98-divergences.md`, DIV-DP-05).
- [ ] Node na versão fixada (medido hoje: v24.20.0; não há `.nvmrc` ainda).

## Promote

| # | Passo | Esperado | Leva | Desfaz-se por |
|---|---|---|---|---|
| 1 | conferir o hash: a árvore de trabalho é exatamente o commit verificado da precondição 1 | hash igual ao registrado; nenhuma modificação local | 1 min | nada a desfazer: leitura local, sem efeito externo |
| 2 | `npm ci` | saída 0; `package-lock.json` inalterado | 1 a 2 min | nada a desfazer externo: só recria `node_modules/` local (apagável) |
| 3 | `npm test` | saída 0; `170 passed, 0 failed, 0 skipped` | 1 min | nada a desfazer: executa testes, sem efeito externo |
| 4 | `npm run build` | saída 0; `dist/index.html`, `dist/assets/index-<hash>.js`, `dist/assets/index-<hash>.css`; anotar o `<hash>` do JS (hoje `Cqfgl3da`) | 1 min | nada a desfazer externo: apagar `dist/` local, se se quiser |
| 5 | `python -I "600 Deploy/Output/race-lap-validation/tools/measure_dist.py" dist` | `within_limit=True`, saída 0; total da ordem de 593 256 bytes (RNF02) | 10 s | nada a desfazer: leitura, sem efeito externo |
| 6 | **[provedor]** guardar o alvo de reversão: se produção já serve um `dist/`, baixá-lo e guardá-lo fora do repositório como `kartle-dist-<hash-anterior>.zip` (caminho B); **nesta primeira release** produção não serve nada — registrar "primeira release: sem artefato anterior; reversão pelo caminho A (despublicar)" | release seguinte: o zip existe, abre, e o seu `index.html` aponta para o `assets/index-<hash>.js` que produção serve hoje. **Esta release**: a URL de produção confirmada como não servindo `index.html` e a nota registrada em `docs/lap-validation-device-log.md` | 2 min | nada a desfazer: cópia fora do repositório (ou nota); o zip só é apagado depois de a release seguinte ser verificada |
| 7 | **[provedor]** publicar `dist/` no site de **staging** | a URL de staging responde 200 em HTTPS e o `index.html` servido é byte a byte igual a `dist/index.html` (comparar o nome do JS com o anotado no passo 4) | 2 min | R1 e R2 sobre o site de **staging** (caminho A nesta release: despublicar staging; B nas seguintes) |
| 8 | executar `smoke.md` em staging, canais `web-desktop` e `web-mobile`, e registrar em `docs/lap-validation-device-log.md` | todas as linhas dentro do limiar; D14/M12 com 0 ocorrências de OSM/ODbL em `dist/` e nenhuma alegação de atribuição OSM na página | 60 a 90 min | nada a desfazer: observação; o registro no log fica como histórico |
| 9 | **pergunta ao dono do produto**: promover o build `<hash>` a produção? (D-DP-06) | resposta explícita registrada; "não" encerra aqui sem efeito | até 1 dia útil de espera; sem resposta até lá, vale "não" | nada a desfazer: "não" ou silêncio encerram sem efeito externo |
| 10 | **[provedor]** publicar o mesmo `dist/` no site de **produção** | a URL de produção serve o `index.html` novo (nome do JS igual ao do passo 4) | 2 min | R1 (caminho A nesta release; B nas seguintes) |
| 11 | **[provedor]** purgar o cache de `index.html` em produção | uma busca nova (janela anônima) devolve o `index.html` com o JS novo; os *assets* respondem 200 | 1 a 5 min | R2 |

## Verify

| # | Verificação (`smoke.md`, *Verificação em produção*) | Esperado |
|---|---|---|
| 1 | D1 / M1 HTTPS | cadeado válido; 0 recursos inseguros; inclinação ativa no celular (RNF06) |
| 2 | D2 / M2 carregamento em 4G, cache vazio | kart responde em menos de 10 s (RNF01) |
| 3 | D3 / M3 bytes transferidos na primeira visita | abaixo de 3 145 728 bytes (RNF02); esperado da ordem de 153 KB comprimidos |
| 4 | D4 / M4 pista | `#track-status` mostra `synthetic`; oferta com volta oficial (NFR-0012) |
| 5 | D5 e D6 / M5 e M6 volta inteira | contagem em texto com 48 px e 4,5:1; resultado `m:ss.mmm` com 4 setores cuja soma é o total (NFR-0006) |
| 6 | D14 / M12 crédito OSM e ODbL | passa: `dist/` com 0 ocorrências de dado ou texto OSM/ODbL e a página sem alegação de atribuição OSM (nenhum dado OSM publicado → nenhum crédito exigido) |
| 7 | repetir 1 a 4 depois de 24 h | mesmos resultados; registros de acesso do provedor sem 5xx ou 404 sobre `index.html` e os *assets* em vigor (`REL-0005`) |

**Gatilhos de reversão (D-DP-03):** carregamento de 10 s ou mais em 4G; transferência de 3 145 728 bytes ou mais;
`#track-status` sem `synthetic` ou sem a oferta de volta oficial; erro no console ao carregar; resultado da volta não
exibido ao cruzar a chegada; qualquer recurso servido sem HTTPS; fps abaixo de 60 no notebook ou de 30 no celular de
referência (NFR-0003).

## Roll back

| # | Passo (desfaz o passo de *Promote* indicado) | Esperado | Leva |
|---|---|---|---|
| R1 | desfaz 10, pelo caminho que o passo 6 registrou. **Caminho A — esta release**: **[provedor]** despublicar o site de produção (ou removê-lo da publicação), alvo: *site não publicado*. **Caminho B** (release seguinte): **[provedor]** publicar em produção o conteúdo de `kartle-dist-<hash-anterior>.zip`, alvo: o `dist/` do hash anterior. **Caminho C** (só com commit anterior à feature e zip perdido; DM-0001): dono do produto faz `git revert` do commit de integração, `npm test` e `npm run build` na árvore revertida, e **[provedor]** publica esse `dist/` | **A**: a URL de produção deixa de servir `index.html` (resposta de "não publicado"/404 do provedor; nenhum *asset* desta release referenciado). **B**: a URL serve o `index.html` anterior, apontando para `assets/index-<hash-anterior>.js`. **C**: a URL serve o `index.html` reconstruído e `npm test` aprovou na árvore revertida | A e B: 2 min; C: 10 min (revert, testes, build) mais 2 min de publicação |
| R2 | **[provedor]** purgar o cache de `index.html` em produção (desfaz 11) | **A**: busca nova (janela anônima) não devolve mais o `index.html` desta release. **B/C**: busca nova devolve o `index.html` restaurado e os seus *assets* respondem 200 | 1 a 5 min |
| R3 | executar *Verify* 1, 2 e 4 na versão restaurada (**B/C**); no caminho **A**, confirmar que a URL de produção não serve página em nenhum dos 4 navegadores de referência | **B/C**: HTTPS válido; carregamento abaixo de 10 s; a tela anterior funciona. **A**: nenhuma página servida | 10 min |
| R4 | registrar a reversão: hash revertido, alvo restaurado (A: "não publicado"; B/C: hash restaurado), gatilho observado, horário | linha no `docs/lap-validation-device-log.md` e relatório em `reports/deploy-validation/` | 5 min |
| R5 | se a causa for da aplicação (fps, cronômetro, pausa, leitura da pista), abrir `FAIL CODE` para o estágio de código; se for do empacotamento (cache, HTTPS, provedor), `FAIL` deste estágio | relatório com a classificação | 15 min para escrever e arquivar o relatório, no mesmo dia da reversão |

Staging reverte-se do mesmo modo (R1 e R2 sobre o site de staging, pelo mesmo caminho) e nunca é precondição para
reverter produção.

Dados: nada a desfazer. A feature não grava no navegador e não há servidor (DES-0011, `REL-0002`); um jogador com a
página nova em cache continua jogando-a com os seus próprios *assets* até buscar o `index.html` restaurado.

**Point of no return:** não existe nesta release. Na primeira release a reversão é despublicar (caminho A), sempre
possível para um site estático; a partir da release seguinte, o artefato é republicável a qualquer momento enquanto o
passo 6 for cumprido, e o único ato que tornaria a reversão impossível seria **apagar o zip do passo 6 ou os *assets*
anteriores do CDN antes de a release seguinte ser verificada** — por isso ambos são mantidos até lá (`REL-0003`, regra
de cache). Quando existirem pistas publicadas por CDN para dias futuros (pós-MVP), a publicação de uma
`trackVersion` passará a ser o ponto sem retorno (I3: nunca editada no lugar), e este runbook terá de nomeá-lo.
