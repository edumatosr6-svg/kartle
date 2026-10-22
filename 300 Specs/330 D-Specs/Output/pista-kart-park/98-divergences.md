---
title: Divergências — pista Kart Park
feature: pista-kart-park
stage: dspec
status: validated
version: 1.0.1
sources: []
---

# Divergências

Registro durável dos requisitos deste conjunto que o sistema em execução não satisfaz (conventions §6). O
F-Spec é normativo: nenhuma linha abaixo enfraquece um requisito. Cada linha cita o que existe hoje em
`arquivo:linha` — a árvore do commit `ac84352` com a rodada de código 1 de `dirigibilidade` —, a etapa que
deve a mudança e o item de projeto que a fecha. Caminhos relativos à raiz do repositório. A feature é nova:
quase todo requisito diverge porque a Kart Park, o seletor, a zebra e a barreira ainda não existem.

| Requisito | O que exige | O que o sistema faz hoje | Etapa devedora | Item de projeto | Estado |
|---|---|---|---|---|---|
| REQ-FEAT-0002-02, -16; API-0001 | leitor da versão de esquema 3; versão 3 sem linha central utilizável é `UNREADABLE` | `src/trackData.ts:5` declara `TRACK_SCHEMA_VERSION` 2 e `:89` classifica toda versão maior que 2 como `UNSUPPORTED_SCHEMA`; nenhum campo `centerline`, `curbs`, `barriers`, `osmDerived` é lido | código | DES-0001, DM-0001, ADR-0001 | open |
| REQ-FEAT-0002-01, -03 a -11, -14, -17, -18; REQ-FEAT-0003-01 a -07; REQ-FEAT-0004-01 a -03; REQ-FEAT-0005-01 a -03; REQ-FEAT-0006-09 | arquivo de pista da Kart Park em esquema 3, preparado offline, verificado, registrado e imutável | não existe arquivo da Kart Park, preparo offline nem registro: `src/` não tem pasta `tracks/`, a raiz não tem `tracks/`, `scripts/` tem só `handlingBench.ts`, `keyboard-lap.ts` e `physics-bench.ts`, e `package.json:6-13` não tem script de preparo | código | DES-0010, DES-0011, DM-0001, DM-0002, ADR-0002, ADR-0006 | open |
| REQ-FEAT-0001-01 a -12, -14; API-0002 | seletor com as duas pistas, Kart Park na abertura, sessão de treino, troca com descarte da volta, só treino | `index.html:19` não tem seletor; `src/main.ts:155` lê só `SYNTHETIC_TRACK_FILE`; `:152` põe o kart parado em `initialState()` da pista sintética; `:208-218` inicia a volta com a leitura sintética e o tipo vindo da oferta; não existe catálogo nem `sessionState` | código | DES-0005, DES-0007 | open |
| REQ-FEAT-0002-12, REQ-FEAT-0005-05, -08, -09; API-0003 | superfície por roda com `CURB`, 85 % da aderência na zebra, zebra como pista nas demais regras, `getTrackContact` | `src/physics.ts:9` só tem `asphalt` e `grass`; `:143` e `:215` escolhem o coeficiente entre `friction` e `grassFriction`; `:229-230` e `:252` usam a fração de rodas no asfalto; `:300-302` e `:318` tratam como fora da pista toda roda que não é asfalto; `:162` (`CIRCUIT`) é a única pista; não existe `getTrackContact` (`:321-336` tem só `getHandlingTelemetry`) | código | DES-0002, DES-0003, ADR-0004 | open |
| REQ-FEAT-0004-04 a -07 | na Kart Park, só as barreiras do arquivo como obstáculo, colisão no trajeto igual à do muro, `barrierContact` | `src/physics.ts:276-290` só tem o muro derivado da linha central sintética (`nearest`, `WIDTH / 2 + 8`), verificado na posição final; não há barreira nem `barrierContact` | código | DES-0003, ADR-0003 | open |
| REQ-FEAT-0003-10, -11, REQ-FEAT-0005-06, -07 | corte medido da borda da pista da Kart Park, que inclui a zebra | `src/lap.ts:218-220` mede `nearest(point).distance - WIDTH / 2` da linha central sintética e `:245-252` usa essa medida em toda volta | código | DES-0004, DES-0002 | open |
| REQ-FEAT-0002-12 (reposicionamento), REQ-FEAT-0001-08 | linha central e largada do arquivo no estado da simulação | `src/lap.ts:154-161` reposiciona o kart na linha central sintética; a largada declarada já é usada por `startLap` (`:109-112`) | código | DES-0004 | open |
| REQ-FEAT-0003-08, -12, -13, -14, -15 | volta na Kart Park validada pelas regras de `race-lap-validation` | as regras existem (`src/lap.ts:223-252`), mas nenhuma volta roda na Kart Park, que não existe | código | DES-0004, DES-0005, DES-0010 | open |
| REQ-FEAT-0002-13, REQ-FEAT-0004-08, REQ-FEAT-0005-04; REQ-FEAT-0007-01, -02 | desenho do asfalto, das zebras e da barreira da Kart Park, com a taxa de quadros dos aparelhos de referência | `src/main.ts:44-110` desenha só a pista sintética (faixas de largura `WIDTH`, zebras decorativas a cada 2 pontos, caixas do muro, árvores) e `:289-297` o minimapa sintético | código | DES-0008 | open |
| REQ-FEAT-0005-10 a -19 | vibração de 20 ms a cada 250 ms em `web-mobile`, som próprio repetido em `web-desktop`, sem retorno na suspensão | `src/audio.ts:1-43` tem só o motor e a recompensa; nenhum módulo chama `navigator.vibrate`; não existe leitura do contato com a zebra | código | DES-0009 | open |
| REQ-FEAT-0006-01 a -08, -10 a -13 | crédito OSM/ODbL no seletor e no resultado, nome e "687 m" da Kart Park | `index.html:19` e `:25` não têm crédito; `index.html:17` exibe o texto fixo "Circuito Aurora" no rótulo da pista | código | DES-0005, DES-0007, DES-0012 | open |
| REQ-FEAT-0007-03, -04, -06, -07 | verificações de `npm test` na Kart Park: determinismo, camadas, critérios de US-0002 a US-0005 | não existe `tests/pista-kart-park-*.test.ts`; `tests/race-lap-validation-layering.test.ts:9-10` não lista os módulos novos | testes | DES-0006 e a estratégia de testes | open |
| REQ-FEAT-0007-13, REQ-FEAT-0006-14 | promoção a produção com a Kart Park só com a decisão Esri registrada | `package.json:6-13` não tem script de publicação nem de promoção de pista e a raiz não tem `tracks/registry.json`, de modo que não há registro de publicação nem passo de promoção que o consulte; `index.html:19` (tela inicial) e `:25` (`#lap-result`) não têm crédito algum, nem o da Esri | código, deploy | DES-0011, DES-0012, ADR-0005 | open |

Satisfeitos hoje, sem divergência, e protegidos pelo projeto: leitura da versão 2 como hoje
(REQ-FEAT-0002-15: `src/trackData.ts:81-101`, caminho mantido por DES-0001); contrato de passo
(REQ-FEAT-0007-08, -09: `src/physics.ts:5`, `:8`, `:296`, verificados por
`tests/race-lap-validation-frozen.test.ts:31-41`, preservados por DES-0003 e DES-0006); nenhuma dependência de
execução além de `three` (REQ-FEAT-0007-11: `package.json:14`); nenhuma rede nem armazenamento no cliente
(REQ-FEAT-0001-03, REQ-FEAT-0007-05: `tests/race-lap-validation-layering.test.ts:43-49`, estendido por DES-0012);
pista sintética como pista dos ensaios (REQ-FEAT-0007-10: os testes e benches existentes usam `CIRCUIT` e
`SYNTHETIC_TRACK_FILE`); ordem de entrega (REQ-FEAT-0007-12: nenhum código desta feature existe, e a
dependência está registrada em `01-architecture.md`).
