---
title: Registro de mudanças — pista Kart Park
feature: pista-kart-park
stage: dspec
status: validated
version: 1.1.0
sources: []
---

# Registro de mudanças

## 2026-10-22 — rodada 1, Mode A

**O que mudou**

- Conjunto gerado do zero a partir do F-Spec validado de `300 Specs/320 F-Specs/Output/pista-kart-park/`
  (FEAT-0001 a FEAT-0007 com 101 `REQ-*`, API-0001 a API-0003, FLOW-0001 a FLOW-0003, SCR-0001 a SCR-0003,
  RULE-0001 a RULE-0005; validação `fspec-validation-20261022-1522`, SUCCESS; seed `revision: 1`), das
  diretrizes de `300 Specs/330 D-Specs/Input/domain-directives.md` e da árvore de código na raiz do repositório
  (commit `ac84352` mais a rodada de código 1 de `dirigibilidade`, não commitada), lida só para posicionamento.
- `01-architecture.md`, `test-strategy.md`, `98-divergences.md` (13 linhas abertas); doze itens de projeto:
  `core/DES-0001` a `DES-0006` (leitor do esquema 3, geometria do arquivo, superfície, zebra e barreira na
  física, volta na Kart Park, sessão de treino, invariantes e ordem de entrega), `web/DES-0007` a `DES-0009`
  (tela inicial e resultado, desenho, retorno da zebra), `pipeline/DES-0010` e `DES-0011` (preparo offline,
  verificações, registro e promoção), `security/DES-0012`; dois modelos de dado (`data/DM-0001` arquivo em
  esquema 3, `data/DM-0002` registro de publicação e estado em memória); seis ADRs (`adr/ADR-0001` a
  `ADR-0006`).
- Todo `REQ-*` do F-Spec é realizado por ao menos um item; os contratos API-0001, API-0002 e API-0003 são
  servidos por DES-0001 e DM-0001, DES-0005 e DES-0003, campo a campo.
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os gera com `lint_artifacts.py --emit`.

**Decisões do autor para esta execução, aplicadas**

- Seed revisado pelo dono do produto em 2026-10-22, decisões fechadas em `DOMAIN.md`, todo número medido: os
  números do projeto vêm do F-Spec, sem nova medição; os valores que o F-Spec deixou ao D-Spec são constantes
  de projeto com o motivo em ADR-0006, e a evidência por versão publicada fica no registro (`prep`).
- A licença Esri bloqueia só a promoção para produção: ADR-0005, DES-0011 (`promote` exige a referência da
  decisão), DES-0012; nenhuma etapa de especificação nem a publicação em staging é bloqueada.
- O código desta feature só começa depois que `dirigibilidade` passar nos testes: a dependência está em
  `01-architecture.md` ("Ordem de entrega"), com a lista exata dos arquivos que cada feature altera ou congela,
  e em DES-0006 (hash do commit de entrega no manifesto da etapa de código e verificação de ancestralidade).
  `dirigibilidade` congela `src/lap.ts` e `src/track.ts` (NFR-0008 daquela feature) e o dado de pista; este
  projeto altera `src/lap.ts` e `src/trackData.ts` e não altera `src/track.ts`.
- Código na raiz do repositório: todos os caminhos são relativos a ela (`src/`, `scripts/`, `tests/`,
  `index.html`, mais `tracks/` para o dado do preparo offline).
- A pista sintética continua a pista dos ensaios automáticos: o arquivo dela não muda (versão 2) e DES-0006
  verifica que nenhum teste ou bench de `race-lap-validation` e de `dirigibilidade` passa a citar a Kart Park.

**Decisões de projeto registradas**

- Esquema 3 com `TRACK_SCHEMA_VERSION` 3 e consistência própria da versão 3 sobre a geometria do arquivo (C6 v3:
  pontas na grama; C7 v3: largada depois da chegada, sem os 2 m), porque a largada que REQ-FEAT-0002-06 exige
  fica a cerca de 0,5 m da chegada e a versão 3 não tem muro (ADR-0001).
- Preparo offline em TypeScript sob `scripts/` em vez de Python: as verificações V01 a V18 têm de rodar em
  `npm test` e usam as mesmas definições geométricas que a simulação (ADR-0002). Arquivo publicado empacotado
  como texto (`?raw`), sem `fetch`.
- Barreira com 0,1 m de meia espessura de contato e teste no trajeto do subpasso, com a resposta do muro
  repetida sem alterar o bloco do muro (ADR-0003).
- Zebra como terceira superfície, com as expressões da pista sintética mantidas bit a bit (ADR-0004).
- Nenhuma chave de configuração; produção bloqueada na promoção (ADR-0005).
- O rótulo `.track-label` passa a mostrar o nome da pista da sessão (`#track-name`), porque o texto fixo
  "Circuito Aurora" nomearia errado a Kart Park; com a pista sintética ele mostra "Pista sintética", o
  `displayName` do catálogo de API-0002 (REQ-FEAT-0006-07, -08 regem o texto quando a Kart Park é a pista).
- Reposicionamento na Kart Park sobre a linha central do arquivo (REQ-FEAT-0002-12), em vez da linha central
  sintética que `src/lap.ts:154-161` usa hoje.

**Itens fechados**: nenhum `ISSUE-<nn>` ou `FB-<nn>` (primeira geração).

**Itens recusados ou não aplicados, com motivo**

- Feedback a `race-lap-validation` sobre `tests/race-lap-validation-track-data.test.ts:20-21` (CHK-TEST-0009-02)
  e `:24-30` (CHK-TEST-0009-03), que afirmam o literal 2 e usam a versão 3 como "posterior": não escrito por
  este gerador. A consequência e a regra de integração estão em `01-architecture.md`; numa etapa de
  especificação o feedback cruzado é escrito pelo validador, no passo do relatório (conventions §14).
- Chave mestra desligada por padrão (I4 e diretrizes do gerador): não criada; o F-Spec exclui configuração
  de pista de abertura e de liberação da promoção, e o bloqueio de produção fica na promoção (ADR-0005).
- Python para o preparo offline, como as diretrizes do estágio antecipavam: não adotado (ADR-0002).
- Cenário além de asfalto, zebra, grama e barreiras (árvores, tribuna, cerca) na Kart Park: não desenhado
  (`SEED/FE-05`, fora do escopo do F-Spec).
- Texto "PISTA FICTÍCIA" do rodapé (`index.html:44`): não alterado; não exibe nome de pista e nenhum
  requisito o cobre.
- Leituras fora da lista de entrada, declaradas: do arquivo de origem `kart-park.json` da pasta do seed foram
  lidos por script só a estrutura de chaves, os nomes de formato e os valores de enumeração (`formato`,
  `versao`, `pontos_formato`, `sentido`, `lado`, `largada.indice`, a descrição da origem das coordenadas), a
  contagem da forma em que a zebra da largada está codificada (`ate_m` além do comprimento da volta) e o
  resumo SHA-256 e o tamanho do arquivo, para projetar o leitor da origem e fixar a cópia byte a byte; nenhuma
  coordenada, largura ou distância foi lida para o contexto. `SEED.md`, `DOMAIN.md`, `NOTES.md` e
  `medicoes/` não foram lidos. Dos conjuntos de `race-lap-validation` e `dirigibilidade` foram lidos nomes de
  contratos, a forma dos itens de projeto validados e o que `dirigibilidade` altera e congela.

## 2026-10-22 — rodada 2, Mode B

Relatório corrigido: `reports/dspec-validation/dspec-validation-20261022-1614.md` (FAIL; 3 `error`, 2
`warning`, 1 `scope`, 13 divergências). Nenhum módulo, tabela, campo, endpoint ou componente novo (§16): os
símbolos movidos já existiam no conjunto e o módulo que os recebe já existe na árvore.

**O que mudou**

- ISSUE-01 (D5, regra de tela na simulação): `OSM_CREDIT`, `creditFor` e `optionLabel` saem de
  `src/trainingSession.ts` (DES-0005) e passam a `src/lapMessages.ts`, módulo existente da aplicação pura,
  testável em `npm test` (DES-0007). `creditFor` recebe a entrada do catálogo (`osmCredit`) em vez do
  `trackId`, e `optionLabel` a entrada (`displayName`, `displayLengthM`), ambas por tipo estrutural, de modo
  que `src/lapMessages.ts` continua importando só tipos de `./lap` (CHK-TEST-0013-01 de `race-lap-validation`)
  e `MESSAGES` continua com as 20 chaves. `src/trainingSession.ts` guarda só a sessão e as entradas de
  API-0002; REQ-FEAT-0006-01 a -06 saem de `sources` de DES-0005 (continuam em DES-0007). Locais carregados:
  DES-0005 (realiza, posicionamento, interface, colaboradores, provas), DES-0007 (posicionamento, interface,
  importações de `src/main.ts`, colaboradores, observabilidade), DES-0006 (lista de aplicação pura e a
  verificação de que a sessão não guarda texto de crédito), DES-0011 (crédito da Esri acrescido ao que
  `creditFor` devolve), DES-0012 (onde os textos do crédito vivem), `01-architecture.md` (camadas, sentido
  das dependências, ordem de entrega) e `test-strategy.md` (interfaces públicas, FEAT-0006, AC-US-0006-01,
  -04, -07, -08, -09).
- ISSUE-02 (D6, argumentos sem validação): DES-0010 ganha a tabela de argumentos de
  `scripts/track-pipeline.ts` — `<comando>` entre os quatro; `<trackId>` de 1 a 40 caracteres em
  `[a-z0-9-]`, igual a um `trackId` de `TRAINING_TRACKS` com origem em `tracks/sources/` (hoje só
  `kart-park`), antes de montar caminho ou chave; `<trackVersion>` de 1 a 6 dígitos, inteiro de 1 a 999999;
  `--esri-decision` só com `promote`, uma vez, 1 a 200 caracteres sem caractere de controle; qualquer outro
  valor sai com código 1, sem ler nem escrever e sem reproduzir o valor. Locais carregados: DES-0011
  (comandos, `promote`, falha, observabilidade do registro), DM-0002 (restrições de `trackId`,
  `trackVersion`, `esriDecisionRef`), DES-0005 (o programa lê `TRAINING_TRACKS`), DES-0012 (ponto de
  aplicação de `promote`) e `01-architecture.md` (sentido das dependências).
- ISSUE-03 (D8, critério alcançado por artefato só de teste): em DES-0009 o motor, a recompensa e a zebra
  passam a construir o sinal a partir do próprio descritor (tipo da fonte, pico, duração), com os valores de
  hoje para o motor e a recompensa; `CURB_SOUND` é declarado no nível do módulo e lido só por `curb()`. O
  caminho de `npm test` de AC-US-0005-12 observa o sinal construído com um `AudioContext` de substituição
  instalado pelo teste em `globalThis` (sem mudança em `src/audio.ts` para o teste); a prova auditiva fica com
  E2E-04. Locais carregados: `test-strategy.md` (interfaces, fixture, AC-US-0005-12) e `01-architecture.md`.
- ISSUE-04 (D2, corpo de implementação): a linha de `step` da tabela de DES-0003 passa a contrato
  (`barrierTouching` verdadeiro com resposta de barreira num subpasso ou centro a até
  `BARRIER_HALF_WIDTH_M + BARRIER_TOUCH_TOLERANCE_M` de um segmento; falso sem `track` e com `barriers` vazio,
  sem consulta de distância; `barrierContact` só na passagem de falso a verdadeiro). Prova acrescida em
  DES-0003 e a cópia derivada `barriers` vazio em `test-strategy.md`.
- ISSUE-05 (D9, linha sem `arquivo:linha`): a linha REQ-FEAT-0007-13, REQ-FEAT-0006-14 de `98-divergences.md`
  cita `package.json:6-13` (sem script de publicação nem de promoção; sem `tracks/registry.json`) e
  `index.html:19`, `:25` (sem crédito, nem o da Esri).

**Itens fechados**: ISSUE-01, ISSUE-02, ISSUE-03, ISSUE-04, ISSUE-05.

**Migração de verificações planejadas** (nenhuma removida)

| Verificação | Antes | Agora |
|---|---|---|
| `creditFor` da Kart Park e da pista sintética | `session` (DES-0005) | `screens` (DES-0007), sobre as entradas do catálogo |
| `optionLabel` da Kart Park | `session` (DES-0005) | `screens` (DES-0007); `session` prova `displayName` e `displayLengthM` da entrada |
| som da zebra próprio (AC-US-0005-12) | descritores diferentes em `source`; `CURB_SOUND` no texto só dentro de `curb()` | tipo registrado de cada som pelo `AudioContext` de substituição igual ao `source` do descritor e diferente entre os três; só `curb()` cria fonte de buffer e filtro; `audio.curb(` no texto de `src/main.ts` só no laço de passos (mantida) |

**Itens recusados ou não aplicados, com motivo**

- ISSUE-06 (`scope`, `TRACK_SCHEMA_VERSION` 2 no projeto de `race-lap-validation`): nada mudou neste
  conjunto. A decisão é de `race-lap-validation`, pelo FB-01 que o validador escreveu em
  `300 Specs/330 D-Specs/Output/race-lap-validation/reports/feedbacks/pista-kart-park/feedback-20261022-1614.md`;
  a regra de integração continua em `01-architecture.md` ("Consequências para outras features").
- ISSUE-01, módulo novo de aplicação para o crédito (por exemplo `src/trackCredit.ts`): não criado. Uma
  rodada de correção não acrescenta módulo (§16) e `src/lapMessages.ts` já é o módulo de aplicação pura com
  os textos das telas.
- ISSUE-03, segunda alternativa do relatório (manter os descritores só descritivos e verificar o
  comportamento por outro caminho): não adotada; com cada som construído do próprio descritor a comparação
  observa o sinal tocado, e a verificação do grafo de áudio construído chega ao comportamento em `npm test`.
- ISSUE-02, verificação de `npm test` da validação de argumentos: não acrescentada. Exigiria exportar um
  analisador de argumentos do programa (elemento de interface novo numa rodada de correção, §16) ou um teste
  que execute o programa; a regra fica declarada em DES-0010 e é implementada e conferida pela etapa de
  código.
- ISSUE-04, demais linhas da tabela "Mudanças dentro de `integrate` e `step`" e o bloco da barreira de
  DES-0003: não reescritos; o relatório nomeou só a linha de `step`, e as outras descrevem expressões que o
  F-Spec fixa (85 % da aderência, a resposta do muro) e que os testes comparam bit a bit.
