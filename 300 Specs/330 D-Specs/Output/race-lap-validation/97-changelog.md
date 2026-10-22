---
title: Registro de mudanças — validação de volta de corrida
feature: race-lap-validation
stage: dspec
status: validated
version: 1.1.1
sources: []
---

# Registro de mudanças

## 2026-10-20 — rodada 1, Mode A

**O que mudou**

- Conjunto gerado do zero a partir do F-Spec validado de `300 Specs/320 F-Specs/Output/race-lap-validation/`
  (FEAT-0001 a FEAT-0009, 129 requisitos `REQ-*`, API-0001 a API-0003, RULE-0001 a RULE-0006, FLOW-0001 a
  FLOW-0004, SCR-0001 a SCR-0003) e do código em execução na raiz do repositório (somente leitura, para
  posicionamento).
- Doze itens de projeto (`core/DES-0001` a `DES-0006` e `DES-0012`, `web/DES-0007` a `DES-0010`,
  `security/DES-0011`), dois modelos de dados (`DM-0001` arquivo de pista versão 2, `DM-0002` estado da volta em
  memória), cinco ADR, `01-architecture.md`, `test-strategy.md` (cobre os 72 critérios `AC-*` e os 12 NFR) e
  `98-divergences.md` com 12 linhas abertas.
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os gera com `lint_artifacts.py --emit`.
- As pastas `backend/` e `mobile/` do esqueleto do estágio não existem porque o produto não tem servidor nem
  aplicativo nativo: a simulação e o dado de pista estão em `core/`, a apresentação em `web/`, privacidade e uso
  offline em `security/`.

**Decisões de projeto onde o F-Spec deixou lacuna deliberada** (todas em ADR, nenhuma muda requisito)

- Precedência de duas invalidações no mesmo passo: cruzamentos de linha antes do corte (ADR-0004, item 1).
- Destino do reposicionamento: ponto mais próximo da linha central, no sentido de percurso, velocidade 0
  (ADR-0004, item 2).
- O que se cronometra numa volta de treino em dado incompleto: cronômetro e corte valem; marcadores, setores e chegada
  não são avaliados e nenhuma volta chega a `VALID` (ADR-0004, item 3).
- Meio de continuar a volta: botão `#pause` rotulado "Continuar" e tecla Esc, ambos já existentes (ADR-0005).
- Método de arredondamento do instante interpolado: ADR-0001.

**Itens fechados**: nenhum `ISSUE-<nn>` ou `FB-<nn>` (primeira geração).

**Itens recusados, com motivo**

- Pausa manual por toque em `web-mobile`: acrescentaria um valor a `pauseCause` (API-0001, API-0002), superfície
  que o F-Spec não autoriza. Como consequência o botão `#pause` existente fica visível só durante a pausa. Proposta
  ao autor do F-Spec, se quiser a pausa manual: novo valor de `pauseCause`.
- Mover a linha central e a largura da pista para o arquivo de pista: ampliaria a mudança além do F-Spec e mexeria na
  física (ADR-0003, alternativas).
- Oferecer volta de reconhecimento ou oficial: pertence ao desafio diário (outra feature); `offeredLapKinds` recebe os
  tipos do desafio como parâmetro e hoje recebe lista vazia (DES-0005).
- Instrumento de desempenho dentro do jogo: seria superfície só de teste; o desempenho é medido com as ferramentas
  do navegador em teste registrado (DES-0007).
- Divergências com o sistema em execução: não foram recusadas; estão em `98-divergences.md`.
- Nenhum requisito foi enfraquecido, removido ou dividido.

**Migração de verificações existentes**: o teste `crossing the start alone cannot complete a lap`
(`tests/physics.test.ts:35`) e o uso de `LapTracker` por `scripts/keyboard-lap.ts` permanecem como estão
(`LapTracker` fica exportado só para o benchmark de manuseio); nenhuma verificação existente é removida (§17).

## 2026-10-20 — Rodada Mode B (relatório dspec-validation-20261020-1918)

Fechados:
- ISSUE-01: `TrackReading` em DES-0006 passa à forma plana de API-0003 com `trackDataStatus`; DES-0009 ajustado (`reading.trackDataStatus`, `trackId`/`trackVersion` lidos de `reading`). DM-0001 e DES-0001 já usavam `trackDataStatus`/nomes de estado e não mudaram.
- ISSUE-02: linha de 98-divergences.md ganha `src/main.ts:185` e `src/main.ts:276-281`.
- ISSUE-03: DES-0012 posicionado na camada Simulação; `tests/` tratado como lugar das verificações.
- ISSUE-04: DES-0011 fixado na camada Aplicação; a verificação de camada remete a DES-0012.

Recusados: nenhum.

## 2026-10-22 — rodada 3, Mode C (feedback de `pista-kart-park` e F-Spec revalidado)

**Entrada**

- Feedback `reports/feedbacks/pista-kart-park/feedback-20261022-1614.md`, item FB-01 (severidade `scope`), pendente
  por ser posterior ao relatório de validação `dspec-validation-20261020-1923.md` (2026-10-20T19:23:00Z). É o único
  feedback pendente, de qualquer origem, para esta feature nesta etapa.
- F-Spec desta feature revalidado em `fspec-validation-20261022-1624.md` (SUCCESS): `API-0001` 1.1.0, `API-0002` 1.1.0
  e `SCR-0003` 1.1.0 passaram a carregar os campos opcionais e aditivos `setupId` e `setupVersion` e a precondição
  de comparação de tempos (FB-01 de `dirigibilidade`, aceito lá). Este conjunto é alinhado a essa revisão na mesma
  rodada.
- Decisões do autor para esta rodada, carregadas como estão: FB-01 de `pista-kart-park` aceito, com a prova do
  NFR-0012 declarada sem literais de versão e o ajuste dos checks levado à etapa de testes; os dois campos de acerto
  entram no modelo de dados do resultado e nos itens que o consomem, a tela de resultado só compara tempos com
  `comparability` `COMPARABLE`, e a implementação dos campos é de `dirigibilidade` (divergência devida a ela);
  superfície congelada fora desses dois itens; código na raiz do repositório.

**Itens fechados**

- FB-01 de `pista-kart-park` (aceito): a prova do NFR-0012 deixa de afirmar literais de versão de esquema.
  - `core/DES-0006`: `TRACK_SCHEMA_VERSION` descrita como a maior versão que o leitor conhece (2 nesta feature,
    DM-0001), exportada para que toda prova se refira à constante; a linha de falha passa a "`schemaVersion` maior que
    `TRACK_SCHEMA_VERSION`"; as provas passam a: arquivo sintético com `schemaVersion` igual a `TRACK_SCHEMA_VERSION`
    e maior que a da forma anterior; `TRACK_SCHEMA_VERSION + 1` é `UNSUPPORTED_SCHEMA`, devolvido com essa versão, e
    o objeto de entrada fica intacto; nenhuma verificação afirma literal de versão.
  - `test-strategy.md`: fixture de versão posterior derivada da constante exportada por `src/trackData.ts`; linha do
    NFR-0012 reescrita nos mesmos termos.
  - Mesmo fato carregado aos seus outros sítios, sem mudar a regra: `data/DM-0001` (ordem 3 da classificação) e
    `adr/ADR-0003` (decisão, item 3) passam a dizer "maior que a versão que o leitor conhece (`TRACK_SCHEMA_VERSION`,
    2 neste esquema)".
- Alinhamento ao F-Spec 1.1.0 (FB-01 de `dirigibilidade`, já aceito no F-Spec):
  - `data/DM-0002`: `setupId` e `setupVersion` opcionais na `LapSession` e no `LapResult`, copiados do pedido sem
    interpretação; padrões de leitura aplicados pelo leitor de registros de `dirigibilidade`, nunca pela simulação;
    INV-4 os inclui; janela de compatibilidade e privacidade atualizadas; o replay e o texto compartilhado copiam do
    resultado e não são descritos aqui.
  - `core/DES-0001`: pedido de `startLap` com `setupId?` e `setupVersion?`; `getLapResult` os devolve quando presentes;
    nenhuma verificação, regra ou rejeição com eles; `src/lap.ts` não importa `src/setupRecords.ts`.
  - `web/DES-0009`: a oferta informa os dois campos a partir do acerto corrente (`getSetupVersion`,
    `src/setupRecords.ts`; hoje `setupRef`, `src/main.ts:160`); toda volta iniciada a partir desta mudança os informa.
  - `web/DES-0010`: seção "Comparação de tempos": comparação exibida só com `compareLapRecords` em `COMPARABLE`;
    nada com os demais valores; `INCOMPLETE_RECORD` só registra o código; a decisão nunca é da renderização;
    posicionamento no código atual (`src/main.ts:217-223`, `:421-435`).
  - `security/DES-0011`: os dois campos na tabela de dados tratados (identificadores, sem dado pessoal).
  - `01-architecture.md`: contexto primário (os campos identificam o acerto e nunca são chave de regra) e sentido de
    dependência de `src/setupRecords.ts` (importa `src/lap.ts`; chamado por `src/main.ts`; nenhum módulo desta
    feature o importa).
  - `98-divergences.md`: nova linha, devida ao código da feature `dirigibilidade`, com o que `src/lap.ts`,
    `src/setupRecords.ts` e `src/main.ts` fazem hoje em `arquivo:linha`.

**Item devido à etapa de testes desta feature** (registrado, não alterado por este estágio)

- CHK-TEST-0009-02 e CHK-TEST-0009-03 (`tests/race-lap-validation-track-data.test.ts:20-21` e `:24-30`) afirmam os
  literais 2 e 3; pela prova agora declarada em DES-0006 e na estratégia, passam a: `SYNTHETIC_TRACK_FILE.schemaVersion`
  igual a `TRACK_SCHEMA_VERSION` e maior que a `schemaVersion` da fixture da forma anterior; arquivo derivado com
  `TRACK_SCHEMA_VERSION + 1` lido como `UNSUPPORTED_SCHEMA` com essa versão e intacto. Sem literal de versão.

**Divergência devida a `dirigibilidade`**

- A linha nova de `98-divergences.md` é devida ao código daquela feature (decisão do autor). O D-Spec validado de
  `dirigibilidade` (DES-0003) afirma hoje que o `LapResult` desta feature "fica intacto" e anexa o acerto por
  `buildLapRecord`; para realizar API-0001/API-0002 1.1.0 ele precisa acompanhar. O feedback entre features de uma
  etapa de especificação é escrito pelo validador no relatório (conventions §14); este gerador o aponta aqui e na
  linha do registro, e não escreve na pasta daquela feature.

**Versões** (todas em `status: draft` até a validação)

- `core/DES-0006` 1.0.0 → 1.1.0; `test-strategy.md` 1.0.0 → 1.1.0; `data/DM-0001` 1.0.0 → 1.0.1; `adr/ADR-0003`
  1.0.0 → 1.0.1; `data/DM-0002` 1.0.0 → 1.1.0; `core/DES-0001` 1.0.0 → 1.1.0; `web/DES-0009` 1.0.0 → 1.1.0;
  `web/DES-0010` 1.0.0 → 1.1.0; `security/DES-0011` 1.0.0 → 1.1.0; `01-architecture.md` 1.0.0 → 1.1.0;
  `98-divergences.md` 1.0.0 → 1.1.0; este registro 1.0.0 → 1.1.0.
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os regenera com `lint_artifacts.py --emit`.

**Itens recusados ou limitados, com motivo**

- FB-01 de `pista-kart-park`, alternativa de subir `TRACK_SCHEMA_VERSION` para 3 neste conjunto: recusada. O esquema 3
  é da feature `pista-kart-park` e do seu F-Spec; este conjunto descreve a versão 2 (DM-0001, ADR-0003) e só torna a
  sua prova independente do literal, que era o que o feedback pedia.
- Alterar os checks CHK-TEST-0009-02/03 ou `tests/race-lap-validation-track-data.test.ts` neste estágio: recusado; a
  etapa de testes é a dona (decisão do autor; o D-Spec não escreve em `tests/`).
- Contratos de replay e de texto compartilhado neste conjunto: não criados. O F-Spec desta feature não os tem (os
  registros são de `dirigibilidade`, `src/setupRecords.ts` e `src/handlingMessages.ts`); o resultado é a fonte da
  qual copiam, e isso está dito em DM-0002 e DES-0010.
- Rejeição nova em `startLap` para `setupId` fora do enum ou `setupVersion` vazia: não acrescentada; API-0002 1.1.0 não
  tem rejeição nova e manda copiar sem interpretação; a resolução é do leitor do dado publicado (`UNKNOWN_SETUP`,
  `resolveSetupRef`, `dirigibilidade`).
- Padrões de leitura (`ARCADE_ASSISTIDO`, `previousSetupVersion`) aplicados por `getLapResult`: não; API-0001 diz
  "copiado sem interpretação" e aplicar o padrão exigiria que `src/lap.ts` lesse o dado publicado de
  `dirigibilidade`, invertendo o sentido de dependência já existente (`src/setupRecords.ts` importa `src/lap.ts`).
- `getLapState` com os dois campos: não; API-0001 1.1.0 os põe só em `getLapResult`, e o HUD (SCR-0001) não exibe nem
  compara acerto.
- Elemento de tela para exibir `setupVersion` no resultado: não projetado; SCR-0003 não o pede. O `#lap-result-setup`
  e o `#lap-share` existentes no painel são superfície de `dirigibilidade`, e DES-0010 só o registra como
  posicionamento.
- Re-julgar as doze linhas da rodada 1 de `98-divergences.md` (marcá-las resolvidas pelo commit `c41c6c3`): não
  feito nesta rodada; está fora do feedback e do alinhamento ao F-Spec, e a resolução é registrada pela etapa
  devedora. O preâmbulo do registro data a árvore que cada grupo de linhas cita.
- Renomear na estratégia os arquivos de teste para os nomes em uso (`tests/race-lap-validation-<área>.test.ts`): não
  feito; a correspondência entre os nomes curtos da estratégia e os arquivos é da etapa de testes, e nenhum item do
  feedback a pede.
- Escrever feedback para `dirigibilidade` (DES-0003 dela): não escrito por este gerador; é do validador desta etapa
  (conventions §14), com o achado apontado acima.
- `sources:` dos arquivos alterados inalterado: FB-01 (de qualquer origem) não é id do upstream desta feature (gate
  G6); a fonte é citada no corpo de cada trecho acrescentado.
- Nenhum requisito foi enfraquecido, removido ou dividido; nenhuma verificação existente é removida (§17).

## 2026-10-22 — rodada 4, Mode B (relatório dspec-validation-20261022-1703)

**Entrada**

- Relatório FAIL com 1 `error` (ISSUE-01), 1 `warning` (ISSUE-02), 1 `info` (ISSUE-03), 1 `scope` (SCOPE-01) e
  DIV-01. Nenhum feedback novo pendente para esta feature nesta etapa.
- Decisões do autor, as mesmas da rodada 3, carregadas como estão: FB-01 de `pista-kart-park` aceito e a prova do
  NFR-0012 sem literais de versão (ajuste dos checks devido à etapa de testes); `setupId` e `setupVersion` no modelo
  do resultado e nos itens que o consomem; comparação só com `COMPARABLE`; implementação dos campos devida a
  `dirigibilidade`; superfície congelada fora desses dois itens; código na raiz do repositório.
- A primeira execução desta rodada (CSV de fases, 17:11Z) reescreveu `web/DES-0009` para 1.1.1 e foi interrompida
  antes de registrar; esta execução conferiu esse texto contra a árvore e completou os demais itens.

**Itens fechados**

- ISSUE-01 (`error`, D7): `web/DES-0009` 1.1.0 → 1.1.1 — a fonte de `setupId` e `setupVersion` da oferta é o
  `PublishedSetup` corrente que a aplicação já guarda (`setup`, `src/main.ts:122`, um dos objetos de
  `PUBLISHED_SETUPS`, `src/physics.ts`, trocado só por `#handling-preset` entre voltas, `src/main.ts:248-253`; o
  par `setupRef`, `src/main.ts:160` e `:228`), e não uma chamada a `getSetupVersion`. "Comportamento em falha"
  declara que `UNKNOWN_SETUP` não ocorre neste caminho e que nenhuma rejeição, aviso ou bloqueio é acrescentado
  pelos campos (`startLap` copia sem interpretação, API-0002; o caminho solo não depende deles, I4).
  "Colaboradores" registra que `src/setupRecords.ts` não é chamado para iniciar a volta. Mesmo fato carregado ao seu
  outro sítio, `01-architecture.md` 1.1.0 → 1.1.1 (sentido das dependências: `src/main.ts` chama
  `src/setupRecords.ts` para `compareLapRecords`; a oferta lê o `PublishedSetup` sem `getSetupVersion`). A linha da
  rodada 3 deste registro que citava `getSetupVersion` fica como história; vale o texto desta rodada.
- ISSUE-02 (`warning`, D8): `test-strategy.md` 1.1.0 → 1.1.1 — E2E-02 ganha o passo "comparação de tempos": volta
  válida concluída no acerto corrente; troca de acerto no seletor existente `#handling-preset`; outra volta válida
  sem comparação alguma com o tempo do outro acerto; segunda volta válida no mesmo acerto com a comparação exibida;
  decisão em `compareLapRecords`. `web/DES-0010` 1.1.0 → 1.1.1 cita esse passo em "Determinismo" e declara que
  `SETUP_VERSION_DIFFERS` e `TRACK_DIFFERS` não são alcançáveis pela tela desta feature e ficam provados nos testes
  de `compareLapRecords` de `dirigibilidade`.
- ISSUE-03 (`info`, D2): correspondência de nomes declarada nos dois sítios que a definem, sem renomear citações:
  `test-strategy.md` (preâmbulo da tabela de critérios) e `core/DES-0012` 1.0.0 → 1.0.1 (abaixo da tabela de
  verificações) dizem que `tests/lap-<área>.test.ts`, `tests/track-data.test.ts` e os nomes curtos designam
  `tests/race-lap-validation-<área>.test.ts`, convenção `tests/<feature>-<área>.test.ts` da etapa de testes.

**SCOPE-01 e DIV-01** (não entram no veredito)

- SCOPE-01: o feedback a `dirigibilidade` foi escrito pelo validador desta etapa
  (`300 Specs/330 D-Specs/Output/dirigibilidade/reports/feedbacks/race-lap-validation/feedback-20261022-1703.md`);
  nada muda neste conjunto, e a linha de 2026-10-22 de `98-divergences.md` continua devida ao código daquela
  feature (decisão do autor). A decisão é dela, na sua próxima rodada desta etapa.
- DIV-01: continua `open`; etapa devedora: código de `dirigibilidade`. As doze linhas da rodada 1 não foram
  rejulgadas (ver rodada 3).

**Item devido à etapa de testes desta feature** (inalterado): CHK-TEST-0009-02 e CHK-TEST-0009-03 sem literal de
versão de esquema, como registrado na rodada 3.

**Versões** (todas em `status: draft` até a validação)

- `web/DES-0009` 1.1.1 (desta rodada); `web/DES-0010` 1.1.0 → 1.1.1; `test-strategy.md` 1.1.0 → 1.1.1;
  `01-architecture.md` 1.1.0 → 1.1.1; `core/DES-0012` 1.0.0 → 1.0.1 (de `validated` para `draft`); este registro
  1.1.0 → 1.1.1. Nenhum outro arquivo tocado.
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os regenera com `lint_artifacts.py --emit`.

**Itens recusados ou limitados, com motivo**

- Chamar `getSetupVersion` na oferta e tratar `UNKNOWN_SETUP` (iniciar sem os campos com `console.warn`): não
  adotado. Das duas saídas que o relatório admite, a escolhida lê o objeto publicado que a aplicação já guarda
  (`src/main.ts:122`, `:160`), sem ramo de falha novo e sem dependência da aplicação em `src/setupRecords.ts` nesse
  caminho; a outra criaria um ramo que, por construção, nunca executa.
- Renomear as citações `tests/lap-*.test.ts` e `tests/track-data.test.ts` em DES-0001, DES-0006, DES-0009,
  DES-0010 e DES-0011 para os nomes em uso: não feito; a correspondência está declarada na estratégia e em
  DES-0012 (alternativa aceita pelo relatório) e cada item segue citando o nome do projeto. A propriedade dos nomes
  dos arquivos continua da etapa de testes (rodada 3).
- Passo de E2E para `SETUP_VERSION_DIFFERS` e `TRACK_DIFFERS`: não acrescentado; não há caminho pela tela desta
  feature (uma única pista empacotada; `#handling-preset` só oferece versões publicadas, `src/main.ts:246-247`) e
  criar um seria superfície só de teste (política 10). A prova fica no ponto de decisão, em `dirigibilidade`.
- Escrever ou alterar o feedback a `dirigibilidade` (SCOPE-01): não é deste gerador (conventions §14); o validador
  já o escreveu.
- Rejulgar DIV-01 ou as linhas da rodada 1 de `98-divergences.md`: não; fora dos itens do relatório, e a resolução é
  registrada pela etapa devedora.
- Nenhum módulo, tabela, campo, endpoint, elemento de tela ou componente acrescentado (§16); nenhum requisito
  enfraquecido, removido ou dividido; nenhuma verificação existente é removida (§17).
