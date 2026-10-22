---
title: Registro de mudanças — pista Kart Park
feature: pista-kart-park
stage: fspec
status: validated
version: 1.0.1
sources: []
---

# Registro de mudanças

## 2026-10-22 — rodada 1, Mode A

**O que mudou**

- Conjunto gerado do zero a partir dos requisitos validados de `200 Requirements/230 Output/pista-kart-park/`
  (US-0001 a US-0006, NFR-0001 a NFR-0012, versão 1.0.0; seed `revision: 1`; validação
  `req-validation-20261022-1428`, SUCCESS), com as decisões de `DOMAIN.md` de 2026-10-22 que os requisitos
  já citam como `DOMAIN/DEC-01` a `DOMAIN/DEC-11`.
- Sete funcionalidades (`FEAT-0001` a `FEAT-0007`), três fluxos (`FLOW-0001` a `FLOW-0003`), três contratos
  (`API-0001` a `API-0003`), três telas (`SCR-0001` a `SCR-0003`) e cinco regras (`RULE-0001` a
  `RULE-0005`), mais `01-overview.md`, `02-glossary.md` e `98-divergences.md` (sem linhas).
- Todo critério `AC-*` dos requisitos (53) é realizado por ao menos um requisito: US-0001 em `FEAT-0001`,
  US-0002 em `FEAT-0002`, US-0003 em `FEAT-0003`, US-0004 em `FEAT-0004`, US-0005 em `FEAT-0005`, US-0006 em
  `FEAT-0006`. Todo NFR (12) é realizado: NFR-0001 e NFR-0006 em `FEAT-0002`; NFR-0005 e a segunda linha de
  NFR-0012 em `FEAT-0006`; NFR-0002, NFR-0003, NFR-0004, NFR-0007 a NFR-0011 e a primeira linha de NFR-0012
  em `FEAT-0007`.
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os gera com `lint_artifacts.py --emit`.

**Decisões do autor para esta execução, aplicadas**

- Seed revisado pelo dono do produto em 2026-10-22, todas as decisões fechadas em `DOMAIN.md`, todo número
  medido: os números entram como os requisitos os dão, sem nova medição.
- A dúvida sobre a licença Esri (`SEED/RI-01`) bloqueia só a promoção para produção e nenhuma etapa de
  especificação: `FEAT-0007` (requisito 13), `FEAT-0006` (requisito 14) e `RULE-0005`.
- O código desta feature só começa depois que `dirigibilidade` passar nos testes: `FEAT-0007` (requisito
  12), com a dependência a registrar no D-Spec, como o autor pediu, e a menção em `01-overview.md`.
- A pista sintética continua sendo a pista dos ensaios automáticos: `FEAT-0007` (requisito 10); o arquivo
  dela continua em `schemaVersion` 2, sem mudança (`FEAT-0002`, requisito 15).

**Decisões de forma registradas**

- Não existe API de rede no MVP (diretrizes do estágio). Os contratos de `api/` são em processo, com o único
  papel `player` (anônimo), erros como códigos e idempotência por leitura pura ou por estado final. Nomes em
  `camelCase` com a unidade no sufixo (D-FS-06), no lugar do `snake_case` padrão da habilidade do gerador:
  a diretriz do projeto prevalece.
- O dado de pista da Kart Park passa para `schemaVersion` 3, com `centerline`, `curbs`, `barriers` e
  `osmDerived`; o contrato de dado de pista de `race-lap-validation` é nomeado e estendido, não redefinido
  nem editado. A mudança é versionada (I3, I5) porque um leitor da versão 2 desenharia a Kart Park com a
  geometria errada em silêncio.
- Correspondência por índice entre a linha original e a suavizada, que torna decidíveis AC-US-0002-05,
  AC-US-0003-02 e AC-US-0005-02 (leitura dada como `info` em ISSUE-05 e ISSUE-06 da validação dos
  requisitos).
- Borda da pista como borda externa da zebra, onde há zebra, para a saída de pista e o corte (leitura dada
  como `info` em ISSUE-03 da validação dos requisitos).
- Comparação da colisão com a barreira e com o muro no referencial local do obstáculo, a cada passo desde o
  contato (leitura dada como `info` em ISSUE-04 da validação dos requisitos).
- A zebra fica fora do asfalto (AC-US-0002-05 e a definição de grama dos requisitos); a extensão das linhas
  transversais é `cutDistanceM` além da borda da pista; a Kart Park não tem muro derivado da linha central
  (AC-US-0004-02); o retorno da zebra é contado em tempo simulado; nome, comprimento exibido e indicação de
  crédito ficam num catálogo do treino, para o crédito aparecer mesmo com o arquivo ilegível.
- O som da zebra em `web-mobile` é MAY: os requisitos o deixam fora do exigido sem proibi-lo.
- Nenhum feedback foi enviado a `race-lap-validation` nem a `dirigibilidade`: nenhum requisito delas precisa
  mudar; os acréscimos (esquema 3, superfície por roda, `barrierContact`, crédito na tela de resultado,
  seletor na tela de início de volta) são aditivos e desta feature, e os campos `surface` e `wallContact`
  de `dirigibilidade` mantêm nome, valores e significado.

**Itens fechados**: nenhum `ISSUE-<nn>` ou `FB-<nn>` (primeira geração).

**Itens recusados, com motivo**

- "Código fica na raiz do repositório" (decisão do autor para esta execução): não entra no conjunto, porque
  é localização de código, decisão de design que esta etapa não registra (proibição de decisões de design);
  cabe ao D-Spec, que lê a raiz de código.
- Lista exata dos arquivos que `dirigibilidade` congela: a decisão do autor nomeia arquivos diferentes dos
  da restrição do seed; este conjunto não nomeia módulo nem arquivo (vazamento de design) e deixa a lista
  ao D-Spec, onde a dependência é registrada.
- Largura lateral de cada zebra: os requisitos e o arquivo de origem dão só lado e trecho; o contrato exige
  o campo (`widthM` maior que 0) e deixa o valor ao preparo offline e ao D-Spec, listado em "Lacunas
  deliberadas" de `01-overview.md`.
- Janela de suavização de cerca de 12 m, intervalo e timbre do som da zebra, texto do crédito da Esri,
  aba de abertura do link do crédito, cerca no perímetro e aparência da zebra e da barreira: nenhum critério
  os fixa; ficam em "Lacunas deliberadas" de `01-overview.md`, sem valor inventado.
- Ação de voltar à tela inicial no meio da volta: não acrescentada. A tela inicial é alcançada ao abrir o
  jogo e depois da tela de resultado (navegação de `race-lap-validation`), o que basta para a troca de
  pista de US-0001; o descarte da volta em andamento ao trocar de pista fica especificado no contrato de
  seleção para qualquer caminho.
- Nome da Kart Park na tela de resultado ou no HUD: não acrescentado; nenhum critério pede, e AC-US-0006-07
  e AC-US-0006-08 valem para toda tela que exibir o nome, hoje só o seletor.
- Divergências com o sistema em execução: nenhuma registrada; esta etapa não lê a raiz de código para
  derivar comportamento (conventions §12).
- Leituras fora da lista de entrada, declaradas: `SEED.md` e `DOMAIN.md` foram consultados só para escopo,
  restrições e as decisões que os requisitos já citam; do arquivo de origem foi lida por script só a
  estrutura de chaves (nomes, sem valores), para confirmar que as zebras não declaram largura, o que os
  requisitos já indicavam; `NOTES.md` e os scripts de medição não foram lidos. Da raiz de código e dos
  conjuntos de `race-lap-validation` e `dirigibilidade` foram lidos só nomes de contratos.

## 2026-10-22 — rodada 2, Mode B (fspec-validation-20261022-1511: 5 erros, 3 avisos)

**O que mudou**

- `FLOW-0001` (1.0.1): as três mensagens do `sequenceDiagram` que tinham `;` separam os itens por vírgula
  (fecha ISSUE-01).
- `FLOW-0003` (1.0.1): a mensagem do `sequenceDiagram` que tinha `;` separa os itens por vírgula (fecha
  ISSUE-02). As mensagens do diagrama e a coluna Estado usam os valores de `publicationState` de
  `RULE-0005`: passo 8 `PREPARED`, passo 9 `VERIFIED` ou `REJECTED`, passo 10 `VERIFIED`, passo 11
  `STAGING`; a linha de promoção recusada diz que a versão fica em `STAGING` (fecha ISSUE-06). O mesmo
  conceito, nomeado em prosa ("preparada, verificada, publicada em staging, promovida a produção") na seção
  Estado de `FEAT-0002` (1.0.1), passou a usar os mesmos valores.
- `FEAT-0003` (1.0.1): REQ-FEAT-0003-15 cita AC-US-0003-10 e AC-US-0003-11, que o caso anormal de US-0003
  liga às mesmas regras da pista sintética; o critério de aceite do requisito 15 cita os mesmos (fecha
  ISSUE-03).
- `FEAT-0005` (1.0.1): REQ-FEAT-0005-16 cita AC-US-0005-07 (vibração é o retorno de `web-mobile`) e
  AC-US-0005-09 (o retorno de `web-desktop` é o som); REQ-FEAT-0005-19 cita AC-US-0005-04, AC-US-0005-05 e
  AC-US-0005-06, que o caso anormal nomeia; o critério de aceite do requisito 19 cita os mesmos (fecha
  ISSUE-04).
- `FEAT-0006` (1.0.1): REQ-FEAT-0006-10 cita AC-US-0006-01 a AC-US-0006-06, que exigem o crédito com a Kart
  Park, e leva `[DOMAIN]` com I6 (fecha ISSUE-05). REQ-FEAT-0006-03 e REQ-FEAT-0006-06 exigem o link e o
  destino sem fixar o texto em que ele está (fecha ISSUE-08); o mesmo fato estava na linha "Linha de crédito
  OSM" de `SCR-0001` (1.0.1) e de `SCR-0002` (1.0.1), que agora listam o texto, a menção e um link para o
  destino na mesma linha, como o glossário já define.
- `FEAT-0001` (1.0.1): REQ-FEAT-0001-01 exige as duas opções sem fixar a ordem (fecha ISSUE-07). O mesmo
  fato estava em `SCR-0001` (linha "Seletor de pista", "nesta ordem") e em `API-0002` (1.0.1: catálogo
  "nesta ordem", `options` "na ordem acima", "a pista da abertura é a primeira entrada"); os três deixam de
  fixar a ordem, e a pista da abertura continua a entrada `kart-park`, sempre. `API-0002` não tem
  consumidor implementado: o conjunto é desta mesma data e nunca foi validado.
- Nenhum requisito, contrato, campo, tela ou elemento de tela foi acrescentado (conventions §16).
  `00-index.md` e `99-traceability.md` não foram escritos: o gate os regenera.

**Itens fechados**: ISSUE-01, ISSUE-02, ISSUE-03, ISSUE-04, ISSUE-05, ISSUE-06, ISSUE-07, ISSUE-08.

**Itens recusados, com motivo**

- Nenhum item do relatório foi recusado.
- Decisões do autor para esta execução, repetidas da rodada 1: continuam aplicadas como lá (licença Esri só
  bloqueia a promoção para produção; o código só começa depois de `dirigibilidade` passar nos testes, com a
  dependência registrada no D-Spec; a pista sintética continua a pista dos ensaios automáticos). "Código
  fica na raiz do repositório" continua fora do conjunto pelo mesmo motivo da rodada 1: localização de
  código é decisão de design e cabe ao D-Spec.
- Sem mudança de conteúdo, carregados na versão corrente: `FLOW-0002`, `FEAT-0004`, `FEAT-0007`,
  `API-0001`, `API-0003`, `SCR-0003`, `RULE-0001` a `RULE-0005`, `01-overview.md`, `02-glossary.md`,
  `98-divergences.md` (nenhum item do relatório os atinge).
