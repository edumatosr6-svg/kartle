---
title: Changelog — dirigibilidade do Arcade assistido
feature: dirigibilidade
stage: req
status: validated
version: 3.2.0
sources: [SEED, DOMAIN]
---

# Changelog

## 2026-10-21 — rodada 1, Mode A (geração a partir do seed revision 1 e de `DOMAIN.md`)

**O que mudou**

- Conjunto gerado do zero a partir de `SEED.md` (`revision: 1`, `date: 2026-10-21`) e das decisões de
  2026-10-21 em `DOMAIN.md`: `01-context.md`, `02-glossary.md`, cinco histórias (US-0001 a US-0005, uma
  por história do seed), nove NFRs (NFR-0001 a NFR-0009) e o registro `98-divergences.md`, sem linhas.
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os gera com `lint_artifacts.py --emit`.
- Decisões de `DOMAIN.md` aplicadas no lugar dos pontos abertos do seed, com o rótulo `DOMAIN/DEC-nn`
  (nn = número do ponto que fecha), definido em `01-context.md`: DEC-01 (250 ms / 300 ms) em US-0001;
  DEC-02 (45 km/h no raio de 18 m) em US-0002, US-0003 e US-0004; DEC-03 (200 ms) em US-0002; DEC-04
  (400 ms) em US-0003; DEC-05 (3,0 s, piloto de 75 kg) e DEC-06 (95 km/h) em US-0004; DEC-07 (27 s, sem
  sair do asfalto) em US-0005. A referência de sensação (Karting Superstars) ganhou o rótulo
  `DOMAIN/REF-01`.
- Ponto aberto 08 do seed (rodada de teste do dono do produto) mantido como critério final humano, fora
  dos critérios de aceite, registrado em `01-context.md` e em US-0005 (`DOMAIN/DEC-08`); não bloqueia.
- Restrições do seed sem história própria tornadas mensuráveis como NFR: camada de simulação
  (NFR-0005), contrato de passo (NFR-0006), preset Realista (NFR-0007), validação de volta (NFR-0008),
  acerto versionado (NFR-0009). Os quatro NFRs do seed viraram NFR-0001 a NFR-0004.
- Decisão do autor para esta rodada registrada em `01-context.md`: o código fica na raiz do repositório
  (`src/`, `tests/`), não em `400 Code/Source/`; os presets ficam em `src/physics.ts`.
- Interações com `race-lap-validation` registradas em `01-context.md` e NFR-0008: nenhum feedback
  enviado, porque nenhum requisito daquela feature precisa mudar.

**Itens fechados**: nenhum `ISSUE-<nn>` ou `FB-<nn>` (primeira rodada); pontos abertos 01 a 07 fechados
por `DOMAIN.md`.

**Itens recusados, com motivo**

- `NOTES.md` da pasta do seed não foi lido (fora da lista de entrada da etapa).
- `docs/physics.md`, `requirements/10`, `requirements/11` e a raiz de código não foram lidos (fora da
  lista de entrada da etapa, conventions §12); os números "de hoje" usados são os que o seed cita.
- Magnitude da perda de velocidade no contato com a parede: não fixada. O seed diz só "a parede custa
  tempo"; AC-US-0004-05 exige redução de velocidade a cada contato, sem percentual, para não inventar
  limiar de domínio.
- Perda na grama abaixo de 45 km/h e com esterço diferente de 0: não fixada; o seed dá um único
  percentual (30 % em 1 s) sem velocidade de entrada, e este conjunto o aplica nas duas velocidades que o
  seed e `DOMAIN.md` já nomeiam (velocidade estabilizada e 45 km/h).
- Limite de recuperação da traseira para redução parcial do esterço (`web-mobile`): não fixado; DEC-04
  diz "ao reduzir o esterço" e o critério foi medido com esterço levado a 0, única forma comum aos dois
  canais. Proposta ao autor para `SCOPE-BACKLOG.md`: "2026-10-21 req-loop rodada 1 — em `web-mobile`,
  vale o limite de 400 ms também para redução parcial do esterço (por exemplo, a metade)?"
- Janela de estabilização para medir o regime da taxa de guinada: não fixada neste conjunto; é parâmetro
  de ensaio, registrado em `docs/physics.md` (NFR-0004) e reportado pelo ensaio (AC-US-0001-06), não
  limiar de domínio.
- Limite de resposta para inversão do esterço (de 1 a −1): não fixado pelo seed; o caso anormal de
  US-0001 usa a soma dos limites existentes (250 ms + 300 ms), sem número novo.
- Nenhum critério de acessibilidade, idioma, latência de entrada, carregamento ou download foi
  acrescentado: o seed não altera esses aspectos (famílias dispensadas em `01-context.md`).

## 2026-10-21 — rodada 2, Mode B (gate determinístico, 8 erros G4)

**Issues desta rodada** (uma por linha de erro do gate)

- ISSUE-01 — `nfr/NFR-0003`: `AC-US-0001-04` lido como definição de critério filho de US-0001 dentro de NFR-0003.
- ISSUE-02 — `nfr/NFR-0006`: `AC-US-0005-06` lido como definição dentro de NFR-0006.
- ISSUE-03 — `nfr/NFR-0009`: `AC-US-0005-04` lido como definição dentro de NFR-0009.
- ISSUE-04 — `nfr/NFR-0009`: `AC-US-0005-05` lido como definição dentro de NFR-0009.
- ISSUE-05 — `stories/US-0001`: `AC-US-0001-04` já definido em NFR-0003 (duplicata).
- ISSUE-06 — `stories/US-0005`: `AC-US-0005-04` já definido em NFR-0009 (duplicata).
- ISSUE-07 — `stories/US-0005`: `AC-US-0005-05` já definido em NFR-0009 (duplicata).
- ISSUE-08 — `stories/US-0005`: `AC-US-0005-06` já definido em NFR-0006 (duplicata).

**O que mudou**

- Causa única: o gate trata todo token `AC-US-nnnn-nn` num arquivo com id como definição de critério
  filho; os três NFRs só referenciavam critérios das histórias. As referências foram reescritas em prosa,
  sem id de critério: NFR-0003 → "critério 04 de US-0001"; NFR-0006 → "critério 06 de US-0005";
  NFR-0009 → "critérios 04 e 05 de US-0005". Fecha ISSUE-01 a ISSUE-04 por edição.
- ISSUE-05 a ISSUE-08 são consequência das mesmas definições indevidas: com os NFRs corrigidos, cada
  critério fica definido uma única vez, na sua história. Nenhuma linha das histórias foi alterada; os
  critérios AC-US-0001-04 e AC-US-0005-04 a 06 continuam com o mesmo texto. Fechados pelas mesmas
  edições.
- Nenhum requisito, história, critério, campo ou limite acrescentado ou removido (conventions §16).
- `00-index.md` e `99-traceability.md` não foram tocados: o gate os regenera.

**Itens fechados**: ISSUE-01 a ISSUE-08. Divergências registradas: nenhuma.

**Itens recusados, com motivo**: nenhum.

## 2026-10-21 — rodada 3, Mode B (relatório `req-validation-20261021-1603.md`, 5 erros)

**O que mudou**

- ISSUE-01 (R3, US-0003 / glossário): "Condução normal" redefinida em `02-glossary.md` como passo em que
  a condição de forçar não se mantém **e** a manobra de drift de `requirements/11` não está em andamento;
  "Condição de forçar" passou a dizer "fora da manobra de drift, único contexto…". AC-US-0003-01 e
  AC-US-0003-05 carregam a mesma ressalva entre parênteses; a seção Canais de US-0003 (`web-mobile`)
  carrega a mesma ressalva. AC-US-0003-02 e o caso anormal "Drift em andamento" não mudaram. Fechada por
  edição.
- ISSUE-02 e ISSUE-03 (R3, US-0001), fechadas juntas pela segunda forma que ISSUE-03 oferece: a condição
  "esterço 1 ou −1" foi incorporada a AC-US-0001-01 (subida) e AC-US-0001-02 (queda), com o regime em
  módulo; o antigo AC-US-0001-03 (lado oposto por referência) foi retirado e o seu número passou a ser a
  subida com esterço parcial em `web-mobile` (90 % em 250 ms), enquanto AC-US-0001-04 ficou só com a
  queda com esterço parcial (10 % em 300 ms). Seis critérios antes, seis depois; nenhum limite, canal ou
  comportamento novo. Referências renumeradas: seção Canais de US-0001 ("critérios 03 e 04" para esterço
  parcial; esterço binário "0, 1 ou −1"), AC-US-0001-06 ("critérios 01 e 02"), caso anormal "Sensor
  ausente" ("critérios 01 e 02") e NFR-0003 ("critérios 03 e 04 de US-0001").
- ISSUE-04 (R3, US-0001, caso anormal "Esterço invertido"): o limiar derivado de 250 ms + 300 ms foi
  retirado; o caso registra que o seed não fixa limite para a inversão, que este conjunto não fixa nenhum e
  que um limite, se desejado, é pedido ao autor do seed. Supera o item "Limite de resposta para inversão do
  esterço" dos recusados da rodada 1. Fechada por edição.
- ISSUE-05 (R7, `01-context.md`, Restrições): a frase "O código deste projeto fica na raiz do repositório
  (`src/`, `tests/`); os presets ficam em `src/physics.ts` (decisão do autor para esta rodada)" foi
  removida; permanece só a restrição citada do seed. A decisão do autor sobre o layout do repositório
  continua registrada neste changelog (rodada 1) como contexto para `300 Specs/330 D-Specs`, não como
  requisito. Fechada por edição.
- Nenhum requisito, história, critério, campo ou limite acrescentado (conventions §16). `00-index.md` e
  `99-traceability.md` não foram tocados: o gate os regenera.

**Itens fechados**: ISSUE-01 a ISSUE-05. Divergências registradas: nenhuma.

**Itens recusados, com motivo**: nenhum. Proposta ao autor para `SCOPE-BACKLOG.md`, sem acrescentar nada ao
conjunto: "2026-10-21 req-loop rodada 3 — a inversão do esterço (de 1 a −1 num passo) a 50 km/h deve ter
limite de resposta próprio? O seed não o fixa."

## 2026-10-21 — rodada 4, Mode B (relatório `req-validation-20261021-1608.md`, 2 erros)

**O que mudou**

- ISSUE-01 (R4, US-0001, AC-US-0001-05): o critério que exigia `grip` em todos os passos dos critérios
  01 a 04 (sem fonte) foi reescrito com a decisão do dono do produto de 2026-10-21 em `DOMAIN.md`
  (rotulada `DOMAIN/DEC-09` em `01-context.md`): o veredito dos ensaios 01 a 04 depende só do tempo
  medido da taxa de guinada; `understeer` reportado durante o ensaio não falha o ensaio; a aderência em
  curva é julgada só pelo ensaio de 45 km/h no raio de 18 m (US-0002). A forma "nenhum `oversteer`/
  `sliding`" que o relatório oferecia não foi usada: a decisão do autor restringe o critério ao tempo de
  resposta, e a 50 km/h com esterço cheio e acelerador o seed (`SEED/US-3`) admite a traseira solta
  quando o Jogador força. `sources:` de US-0001 e a seção Fontes ganharam `DOMAIN/DEC-09`; a tabela de
  rótulos e a tabela de aplicação de `01-context.md` ganharam a linha de `DOMAIN/DEC-09`. Fechada por
  edição.
- ISSUE-02 (R3, US-0002, AC-US-0002-05): a condição "acelerador 0 mantido ou acelerador cheio mantido
  durante toda a curva" foi incorporada a AC-US-0002-01 e AC-US-0002-02, cada um valendo nas duas
  condições; o antigo critério 05 foi retirado e o antigo 06 (saída do ensaio) passou a ser
  AC-US-0002-05, reportando a maior duração de `understeer` por condição de acelerador. Seis critérios
  antes, cinco depois, com o mesmo conteúdo. Nenhum caso anormal nem outro arquivo referenciava o
  critério 05 ou 06 de US-0002. Fechada por edição.
- Nenhum requisito, história, critério, campo ou limite acrescentado (conventions §16). `00-index.md` e
  `99-traceability.md` não foram tocados: o gate os regenera.

**Itens fechados**: ISSUE-01 e ISSUE-02. Divergências registradas: nenhuma.

**Itens recusados, com motivo**: nenhum.

## 2026-10-21 — rodada 5, Mode A (seed `revision: 2`, acerto agressivo de `DOMAIN.md`)

**Gatilho**: o seed passou a `revision: 2` (mesma data, mesmo autor). O dono do produto testou a build atual
("não vira, não ganha velocidade") e, na última entrada de `DOMAIN.md`, substituiu os valores fechados dos
pontos abertos 01, 02, 05, 06 e 07 pelo acerto agressivo; 03, 04 e a regra "resposta do volante só mede
guinada" permanecem; o ciclo do ponto 08 ficou definido (staging + feedback curto do dono, sem preset
experimental extra). Decisões do autor recebidas para esta rodada e carregadas sem redescoberta.

**O que mudou**

- `01-context.md` (2.0.0): seed `revision: 2`; novo rótulo `DOMAIN/REF-02` (acerto agressivo) e
  `DOMAIN/DEC-10` (ciclo de teste do ponto 08); `DOMAIN/DEC-01`, `02`, `05`, `06` e `07` redefinidos com
  os valores em vigor (180 ms / 250 ms; 50 km/h; 2,5 s; 105 km/h; 25 s), cada um dizendo qual valor
  substitui; `DOMAIN/DEC-09` passa a citar o ensaio de 50 km/h; parágrafo do ponto 08 descreve o ciclo em
  staging e a ausência de preset experimental no painel. Famílias de NFR, restrições e lista fora do escopo
  inalteradas.
- `02-glossary.md` (2.0.0): "Condição de forçar" e "Curva de referência" a 50 km/h; termos novos "Acerto
  agressivo" e "Staging".
- US-0001 (2.0.0): 180 ms (subida) e 250 ms (queda) nos critérios 01 a 04, na seção Canais e no caso
  anormal de velocidade; critério 05 cita o ensaio de 50 km/h; `DOMAIN/REF-02` em `sources:`.
- US-0002 (2.0.0): curva de referência a 50 km/h nos critérios 01 e 02, na seção Canais e no primeiro
  caso anormal; 200 ms e 15 % mantidos.
- US-0003 (2.0.0): condição de forçar acima de 50 km/h na seção Canais e no critério 01; 400 ms e
  0,65 rad mantidos.
- US-0004 (2.0.0): 2,5 s no critério 01; 105 km/h no critério 02; grama com entrada a 50 km/h no critério
  04 e no caso anormal; critério 07 passa a dizer "bench de física" em vez de nomear o script
  (`ISSUE-01` info do relatório `req-validation-20261021-1627.md`, aceita).
- US-0005 (2.0.0): 25 s no critério 03 e no caso anormal; caso anormal novo "Rodada de acerto reprovada
  pelo dono do produto em staging" (`DOMAIN/DEC-10`), sem critério novo.
- NFR-0002, NFR-0007 (2.0.0): "bench de física" em vez de `npm run bench:physics` (mesma info).
  NFR-0004 (2.0.0): idem, e a entrada de `docs/physics.md` passa a dizer a versão de acerto a que se
  refere, com os limites da revisão 2 ao lado dos da linha de base (`DOMAIN/REF-02` em `sources:`).
- NFR-0001, NFR-0003, NFR-0005, NFR-0006, NFR-0008, NFR-0009 e `98-divergences.md`: sem mudança de
  conteúdo; carregados na versão 1.0.0 (nenhum número da revisão 2 os atinge).
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os regenera.

**Tabela de migração** (conventions §17): nenhum item retirado. Cinco histórias e nove NFRs antes e depois;
32 critérios antes e depois (6 + 5 + 7 + 7 + 6 + 0 novos); só valores numéricos e referências mudaram.

**Itens fechados**: nenhum `ISSUE-<nn>`/`FB-<nn>` pendente (o último relatório era SUCCESS); a `ISSUE-01`
info daquele relatório foi aplicada. Divergências registradas: nenhuma.

**Itens recusados, com motivo**

- Decisão do autor "código fica na raiz do repositório (`src/`, `tests/`); presets em `src/physics.ts`;
  benches em `scripts/`": não escrita em `01-context.md` nem em critério, pelo mesmo motivo da rodada 3
  (ISSUE-05, R7: escolha de desenho). Fica registrada aqui como contexto para as etapas de F-Spec e D-Spec,
  que o autor pediu para reprocessar contra a revisão 2.
- "Sem preset experimental extra" não entrou na lista Fora do escopo: a lista é a do seed, que não o
  nomeia; a decisão está no parágrafo do ponto 08 de `01-context.md` (`DOMAIN/DEC-10`).
- Nenhum critério de aceite para o ciclo em staging: o veredito do dono do produto não é observável pelo
  sistema; permanece condição humana de fechamento (`DOMAIN/DEC-08`, `DOMAIN/DEC-10`).
- Os valores anteriores (250/300 ms, 45 km/h, 3,0 s, 95 km/h, 27 s) não permanecem como critério
  alternativo nem como piso: `DOMAIN.md` diz "substitui".
- Os itens recusados das rodadas 1 e 3 continuam recusados pelos mesmos motivos (parede sem percentual;
  grama abaixo da velocidade de referência; recuperação com esterço parcial; janela de estabilização;
  inversão do esterço). As duas propostas de `SCOPE-BACKLOG.md` daquelas rodadas seguem valendo.

## 2026-10-21 — rodada 6, Mode A (seed `revision: 3`, correção de fato e método dos ensaios)

**Gatilho**: o seed passou a `revision: 3` (mesma data, mesmo autor) depois do FAIL SPEC da etapa de código
(`300 Specs/330 D-Specs/Output/dirigibilidade/reports/feedback/feedback-20261021-1827.md`): a pista
sintética não tem curva de raio 18 m (raios mínimos 24 m e 25 m, grampo de 4 m), e o regime da resposta do
volante com acelerador 0 não é estacionário. Nenhum limiar do dono do produto mudou. Decisões do autor
recebidas para esta rodada e carregadas sem redescoberta: a curva de referência é um ensaio em pista de
teste (arco de raio 18 m, faixa da largura da pista, sem paredes, ambiente de ensaio próprio); o ensaio de
resposta do volante roda em reta com a velocidade mantida em 50 km/h pelo acelerador e o regime é o valor
estabilizado nessa condição; só a volta do piloto de teste usa a pista sintética.

**O que mudou**

- `01-context.md` (3.0.0): seed `revision: 3`; parágrafo novo "Onde cada ensaio roda"; rótulos novos
  `SEED/RD-06` (regra de domínio da revisão 3) e `DOMAIN/REF-03` (entrada da revisão 3 de `DOMAIN.md`);
  `DOMAIN/DEC-01`, `DEC-02`, `DEC-03` e `DEC-09` redigidos com o local (pista de teste) e o método
  (velocidade mantida, regime estacionário), mesmos valores; linha de aplicação de `DOMAIN/REF-03` /
  `SEED/RD-06`; parágrafo "Padrão seguro" declara que a tela de seleção de acerto não recebe elemento
  novo (`ISSUE-01` info do relatório `req-validation-20261021-1742.md`, aceita na forma de declaração em
  contexto, sem critério novo); relação com `race-lap-validation` diz que a pista de teste não é pista
  publicada nem toca a pista sintética. Famílias de NFR, restrições e lista fora do escopo inalteradas.
- `02-glossary.md` (3.0.0): "Pista de teste" (termo novo), "Pista sintética" (raios reais; sem curva de
  18 m; só a volta do piloto de teste), "Curva de referência" (ensaio na pista de teste), "Velocidade
  mantida" (termo novo), "Regime da taxa de guinada" (velocidade mantida, janela curta e estacionária),
  "Velocidade de início do subesterço" (na pista de teste), "Linha de base" (mesmo ambiente), "Ensaio"
  (inclui ambiente), "Asfalto" (inclui a faixa da pista de teste); "Recuperação" (termo novo: passos entre
  soltar o esterço sob a condição de forçar e o primeiro `grip`, no máximo 400 ms) e "Condução normal"
  passa a excluir a recuperação; "Condição de forçar" cita a recuperação.
- US-0001 (3.0.0): pré-condições e critérios 01 a 04 na reta da pista de teste com a velocidade mantida
  em 50 km/h pelo acelerador; critério 01 define o regime como valor estabilizado com a velocidade mantida
  numa janela curta e estacionária; critério 05 cita o arco da pista de teste; critério 06 passa a exigir
  na saída do ensaio o regime em rad/s e a velocidade mínima e máxima observadas (prova de velocidade
  mantida), além dos tempos e da janela; caso anormal novo "Velocidade não mantida durante o ensaio";
  seção Canais diz que o Jogador não pilota na pista de teste. Seis critérios antes e depois.
- US-0002 (3.0.0): pré-condições e critérios 01 a 03 na curva de referência da pista de teste (arco de
  raio 18 m, faixa da largura da pista, sem paredes); critério 02 passa de "permanece no asfalto" a
  "permanece dentro da faixa de asfalto do arco" (mesma exigência, no ambiente certo); critério 03 exige a
  linha de base no mesmo ensaio e no mesmo arco; critério 05 reporta também o raio do arco e a largura da
  faixa; caso anormal "Grama ou parede durante a curva" substituído por "Kart sai da faixa de asfalto do
  arco" (a pista de teste não tem grama nem parede) e "Linha de base ausente" diz que uma linha de base
  em curva da pista sintética não serve. Cinco critérios antes e depois.
- US-0003 (3.0.0): critério 01 cita a curva de referência da pista de teste; critérios 01, 02 e 05
  carregam a exclusão da recuperação da condução normal (derivada do segundo critério de `SEED/US-3`,
  que admite a traseira solta até 400 ms depois de reduzir o esterço); critério 04 diz "em nenhum passo
  da recuperação"; critério 07 reporta também a derrapagem máxima em condução normal e a contagem de
  passos de condução normal com `oversteer`/`sliding`; caso anormal novo "Recuperação que não volta a
  `grip` em 400 ms". Sete critérios antes e depois. Isso responde, no nível dos requisitos, ao
  SPEC-ISSUE-06 do feedback do código: os passos de recuperação não são condução normal.
- US-0005 (3.0.0): seção Canais diz que a volta do piloto de teste é o único ensaio na pista sintética
  (raios reais); `SEED/RD-06` e `DOMAIN/REF-03` nas fontes. Critérios inalterados.
- NFR-0004 (3.0.0): a entrada de `docs/physics.md` registra o ambiente de cada ensaio, o modo de manter a
  velocidade, a faixa de velocidade observada, o raio do arco e a largura da faixa.
- US-0004, NFR-0001, NFR-0002, NFR-0003, NFR-0005, NFR-0006, NFR-0007, NFR-0008, NFR-0009 e
  `98-divergences.md`: sem mudança de conteúdo; carregados na versão em que estavam (nenhum item da
  revisão 3 os atinge: a grama, a parede, 0–60 km/h e a velocidade estabilizada não têm ambiente fixado
  pelo seed e continuam como estavam).
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os regenera.

**Tabela de migração** (conventions §17): nenhum item retirado. Cinco histórias e nove NFRs antes e depois;
32 critérios antes e depois (6 + 5 + 7 + 7 + 6 + 0 novos); três termos novos no glossário (Pista de
teste, Velocidade mantida, Recuperação); só ambiente, método e referências mudaram, nenhum valor
numérico.

**Itens fechados**: nenhum `ISSUE-<nn>`/`FB-<nn>` pendente (o último relatório era SUCCESS); a `ISSUE-01`
info daquele relatório foi aplicada como declaração em `01-context.md`. Divergências registradas: nenhuma.

**Itens recusados, com motivo**

- SPEC-ISSUE-01 e SPEC-ISSUE-02 do feedback do código: fechados pelo próprio seed (revisão 3) e carregados
  acima; nenhuma ação própria desta etapa além de refletir o seed.
- SPEC-ISSUE-03 (origem dos registros antigos de `SETUP_VERSION`), SPEC-ISSUE-04 (entrada do Realista em
  `BenchOptions`) e SPEC-ISSUE-05 (literal do estado inicial de `surface`): são interface e desenho de
  projeto (R7); nenhum critério deste conjunto os fixa. O seed não fixa o estado de aderência exibido
  antes do sinal verde (AC-US-0004-06 vale entre o sinal verde e o fim da volta), por isso nada foi
  acrescentado. Ficam para o D-Spec, como o autor decidiu.
- Decisão do autor "código fica na raiz do repositório; presets em `src/physics.ts`; benches em
  `scripts/`; o código parcial existente pode ser lido como as-built, mas o projeto vence": não escrita em
  critério (escolha de desenho, R7); registrada aqui como contexto para as etapas de F-Spec e D-Spec. A
  raiz de código não foi lida (conventions §12).
- Modo de manter a velocidade em 50 km/h (acelerador parcial, janela, ou alimentação a velocidade
  constante): não fixado; é parâmetro de ensaio registrado em `docs/physics.md` (NFR-0004) e reportado na
  saída do ensaio (AC-US-0001-06). O que o conjunto exige é a condição observável: velocidade mantida e
  regime estacionário.
- Largura da faixa e comprimento do arco da pista de teste: não fixados em número; o seed diz "faixa da
  largura da pista" e não dá o comprimento; o ensaio reporta o raio e a largura usados (AC-US-0002-05).
- Ambiente dos ensaios de grama, parede, 0–60 km/h e velocidade estabilizada (US-0004): não fixado; a
  revisão 3 só atribui ambiente aos ensaios de resposta do volante, curva de referência e volta do piloto
  de teste. Proposta ao autor para `SCOPE-BACKLOG.md`: "2026-10-21 req-loop rodada 6 — os ensaios de
  US-4 (0–60 km/h, velocidade estabilizada, grama, parede) rodam na pista sintética ou na pista de teste?"
- Os itens recusados das rodadas 1, 3 e 5 continuam recusados pelos mesmos motivos (parede sem percentual;
  grama abaixo da velocidade de referência; recuperação com esterço parcial; janela de estabilização;
  inversão do esterço; valores anteriores não permanecem como piso). As propostas de `SCOPE-BACKLOG.md`
  daquelas rodadas seguem valendo.

## 2026-10-22 — rodada 7, Mode B (relatório `req-validation-20261022-1411.md`, 2 erros e 1 info)

**Gatilho**: a entrada de 2026-10-22 de `DOMAIN.md`, "Fim da varredura de início do subesterço", decidida
pelo dono do produto após a parada do D-Spec, e a decisão do autor passada a esta rodada: incorporá-la em
US-0002 e nos seus critérios de aceite, com o motivo de reprovação por falta de medida, e nada mais muda
nos requisitos. O seed segue em `revision: 3`.

**O que mudou**

- `01-context.md` (3.1.0): rótulo novo `DOMAIN/DEC-11` na tabela "Itens do seed e decisões de domínio",
  com o texto da decisão; linha `DOMAIN/DEC-11` na tabela "Decisões de domínio aplicadas" (US-0002,
  critérios 03 e 04 e caso anormal de saída da faixa; não muda os critérios 01 e 02); o parágrafo da
  camada de domínio e a introdução das decisões aplicadas citam a entrada de 2026-10-22.
- US-0002 (3.1.0): `DOMAIN/DEC-11` em `sources:` e em Fontes. Critério 03: o ensaio de início do
  subesterço é descrito como na decisão — velocidade crescente no arco de raio 18 m, numa varredura (antes:
  "velocidade de entrada crescente") — e, com o novo acerto, a saída da faixa abaixo de 50 km/h reprova
  por saída do asfalto. Critério 04: a não diminuição do `understeer` vale nas velocidades medidas acima de
  50 km/h (antes: "velocidades de entrada acima de V1"); a saída da faixa acima de 50 km/h é o fim da
  varredura e não reprova se pelo menos duas velocidades acima de 50 km/h foram medidas antes; a saída
  antes da segunda medição acima de 50 km/h reprova por falta de medida, motivo distinto da saída do
  asfalto. Caso anormal "Kart sai da faixa de asfalto do arco": separa a curva de referência dos
  critérios 01 e 02 (toda saída falha o critério 02, em qualquer velocidade) do ensaio de início do
  subesterço dos critérios 03 e 04 (as três regras da decisão). Seção Canais: os limites da decisão
  constam entre os limites iguais nos dois canais. Pontos em aberto: cita `DOMAIN/DEC-11`.
- `02-glossary.md` (3.1.0): a definição de "Velocidade de início do subesterço" descreve o ensaio como o
  critério 03 (velocidade crescente no arco, varredura que termina na saída da faixa, `DOMAIN/DEC-11`).
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os regenera.

**Leituras registradas** (sem decisão nova):

- A mudança do critério 04 de "acima de V1" para "acima de 50 km/h" carrega a decisão: ela declara que
  as duas velocidades medidas acima de 50 km/h são os dados do critério de que o subesterço não diminui,
  o que só vale se o critério cobre as velocidades acima de 50 km/h. É também a letra do seed ("Acima
  dessa velocidade", a de referência, 50 km/h) e o que o caso anormal "Velocidade de entrada acima de
  50 km/h" já dizia do critério 04.
- As regras de fim e de reprovação valem para a varredura do novo acerto, que é o que o ensaio julga; a
  linha de base (acerto anterior) só fornece V0 e continua regida pelo caso anormal "Linha de base
  ausente".
- O código de motivo de reprovação citado na decisão não é escrito no conjunto (é identificador de
  desenho, R7); os critérios dizem "saída do asfalto" (glossário, Asfalto) e "falta de medida".
- A decisão diz "abaixo" e "acima" de 50 km/h; o conjunto repete os termos e não inventa o caso de saída
  exatamente a 50 km/h. Proposta ao autor para `SCOPE-BACKLOG.md`: "2026-10-22 req-loop rodada 7 — no
  ensaio de início do subesterço, a saída da faixa exatamente a 50 km/h reprova ou encerra a varredura?"

**Tabela de migração** (conventions §17): nenhum item retirado. Cinco histórias e nove NFRs antes e
depois; 32 critérios antes e depois, nenhum novo (as regras da decisão entram nos critérios 03 e 04 de
US-0002); nenhum termo novo no glossário (uma definição ajustada); um rótulo de rastreabilidade novo
(`DOMAIN/DEC-11`), exigido pela `ISSUE-01`.

**Itens fechados**: `ISSUE-01`. Divergências registradas em `98-divergences.md`: nenhuma.

**Itens recusados, com motivo**

- `ISSUE-02` (afrouxar o critério 02 e o caso anormal na condição de acelerador cheio, admitindo a saída da
  faixa acima de 50 km/h): recusada. O autor decidiu, para esta rodada, que a decisão de 2026-10-22 vale
  para o ensaio de início do subesterço (a varredura com a velocidade subindo no arco) e que nada mais
  muda nos requisitos; o título da entrada de `DOMAIN.md` é "Fim da varredura de início do subesterço".
  O critério 02 é a curva de referência com entrada a 50 km/h (`SEED/US-2`, primeiro critério;
  `DOMAIN/DEC-02`, `DOMAIN/DEC-03`), outro ensaio, e admitir nele a saída da faixa enfraqueceria um
  critério, o que nenhuma rodada faz para fechar uma issue. O caso anormal de saída da faixa agora diz
  qual regra vale em cada ensaio: na curva de referência, toda saída falha o critério 02, em qualquer
  velocidade; só na varredura dos critérios 03 e 04 valem as regras de `DOMAIN/DEC-11`.
- `ISSUE-03` (info, separar a cláusula da curva de referência da condução normal em AC-US-0003-01):
  recusada nesta rodada. O autor determinou que nada além da decisão de 2026-10-22 muda nos requisitos;
  a issue é `info`, o próprio validador diz que o critério é decidível e mais estrito que o seed, e a
  mudança seria só de redação, moveria a versão de US-0003 e levaria às etapas de F-Spec e D-Spec uma
  mudança sem conteúdo. Fica para a próxima rodada que tocar US-0003 por motivo de conteúdo.
- Os itens recusados das rodadas 1, 3, 5 e 6 continuam recusados pelos mesmos motivos, e as propostas de
  `SCOPE-BACKLOG.md` daquelas rodadas seguem valendo.

## 2026-10-22 — rodada 8, Mode B (relatório `req-validation-20261022-1425.md`, 3 erros e 1 info)

**Gatilho**: o relatório da rodada 7 (FAIL: `ISSUE-01` a `ISSUE-03`, R3, em US-0002; `ISSUE-04`, info, em
US-0003). Decisão do autor carregada sem redescoberta: a decisão de 2026-10-22 de `DOMAIN.md` ("Fim da
varredura de início do subesterço") fica incorporada em US-0002 e nos seus critérios, com o motivo de
reprovação por falta de medida, e nada mais muda nos requisitos. Fonte nova lida nesta rodada: a entrada
de 2026-10-22 de `DOMAIN.md` "Esclarecimento de método da varredura (redator, sem mudar a decisão acima)",
que define a velocidade medida da varredura. O seed segue em `revision: 3`.

**O que mudou**

- `ISSUE-01` (R3, AC-US-0002-03 não atômico): o critério 03 passa a declarar só a velocidade de início do
  subesterço, V1 ≥ 1,15 × V0. As três regras de `DOMAIN/DEC-11` sobre a saída da faixa na varredura —
  abaixo de 50 km/h reprova por saída do asfalto; acima de 50 km/h encerra a varredura sem reprovar com
  pelo menos duas velocidades medidas acima de 50 km/h antes; antes da segunda medição acima de 50 km/h
  reprova por falta de medida — ficam juntas num critério próprio, AC-US-0002-06: uma única observação
  (a velocidade do kart no passo da saída e as velocidades medidas antes dela) decide como a varredura
  termina. As duas últimas regras saíram do critério 04, que juntava a perda progressiva (telemetria de
  `understeer`) com a saída da faixa, a mesma junção que a issue aponta no critério 03. Fechada por
  edição.
- `ISSUE-02` (R3, AC-US-0002-04 sem velocidade medida definida): o critério 04 aplica `DOMAIN/REF-04`
  — cada velocidade medida é um patamar completo de velocidade mantida no arco, cujo tamanho em km/h e
  cuja duração são parâmetros do ensaio registrados em `docs/physics.md` (NFR-0004); em cada patamar
  toma-se a maior sequência de `understeer` consecutivo dentro dele, em ms de tempo simulado, e esse valor
  não diminui de um patamar para o seguinte, de velocidade maior; a comparação é entre patamares, nunca um
  máximo acumulado. O mínimo de duas velocidades medidas acima de 50 km/h fica com grão (dois patamares
  completos) e é citado do critério 06. Fechada por edição.
- O fato "a varredura mede em patamares de velocidade mantida" foi levado a todos os seus lugares:
  critério 03 (descrição do ensaio), critérios 04 e 06, caso anormal "Kart sai da faixa de asfalto do
  arco" (agora cita os critérios 03, 04 e 06 e diz que as regras são as do critério 06), seção Canais
  ("duas velocidades medidas — patamares completos — acima de 50 km/h"), Fontes e Pontos em aberto de
  US-0002; `02-glossary.md`, "Velocidade de início do subesterço" (menor velocidade medida, em cujo
  patamar a telemetria reporta `understeer` por mais de 200 ms consecutivos) e "Velocidade mantida"
  (passa a cobrir também o valor de cada patamar da varredura, além dos 50 km/h do ensaio de resposta do
  volante, sem mudar o que US-0001 exige); `01-context.md`, rótulo novo `DOMAIN/REF-04` na tabela de
  itens do seed e decisões de domínio, linha `DOMAIN/REF-04` na tabela de decisões aplicadas, linha
  `DOMAIN/DEC-11` passando a citar os critérios 03, 04 e 06, e o parágrafo da camada de domínio citando a
  entrada nova. O critério 05 passa a dizer "o ensaio dos critérios 01 a 04 e 06" (mesmo ensaio, mesmos
  campos).
- `ISSUE-03` (R3, AC-US-0002-02 sem citação dos limiares): o critério 02 cita `SEED/US-2` (primeiro
  critério), `DOMAIN/DEC-02` e `DOMAIN/REF-03`. Fechada por edição.
- Versões: US-0002, `01-context.md`, `02-glossary.md` e este changelog em 3.2.0. `00-index.md` e
  `99-traceability.md` não foram escritos: o gate os regenera.

**Superfície (conventions §16)**: AC-US-0002-06 é um id novo, não um requisito novo. O seu conteúdo — as
três regras de `DOMAIN/DEC-11` — já estava no conjunto reprovado (critérios 03 e 04 e caso anormal de
saída da faixa); a divisão é a que `ISSUE-01` pede ("critério próprio"). O id é o próximo livre: os
critérios existentes mantêm os seus números, porque ids não são reaproveitados nem renumerados
(conventions §4). Nenhum campo novo na saída do ensaio, nenhum limiar novo, nenhum termo novo no
glossário.

**Tabela de migração** (conventions §17): nenhum item retirado. AC-US-0002-03 perde a regra de saída da
faixa abaixo de 50 km/h; AC-US-0002-04 perde as regras de fim da varredura e de falta de medida e ganha a
definição de velocidade medida; as três regras passam a AC-US-0002-06. US-0002 vai de cinco para seis
critérios; o conjunto, de 32 para 33, com o mesmo conteúdo exigido. Cinco histórias e nove NFRs antes e
depois; um rótulo de rastreabilidade novo (`DOMAIN/REF-04`).

**Itens fechados**: `ISSUE-01`, `ISSUE-02`, `ISSUE-03`. Divergências registradas em `98-divergences.md`:
nenhuma.

**Itens recusados, com motivo**

- `ISSUE-04` (info, separar a cláusula da curva de referência da condução normal em AC-US-0003-01):
  recusada de novo, pelo mesmo motivo da rodada 7. O autor determinou para esta rodada que nada além da
  decisão de 2026-10-22 muda nos requisitos; a issue é `info` e não bloqueia; o validador diz que o
  critério é decidível e mais estrito que o seed; a mudança seria só de redação e levaria às etapas de
  F-Spec e D-Spec uma nova versão de US-0003 sem conteúdo. Fica para a próxima rodada que tocar US-0003
  por motivo de conteúdo.
- NFR-0004 não foi tocado: ele já exige, para 100 % dos ensaios citados nos critérios de US-0001 a
  US-0005, o registro dos "parâmetros" de cada ensaio em `docs/physics.md`; o tamanho e a duração do
  patamar são parâmetros do ensaio dos critérios 03, 04 e 06 (`DOMAIN/REF-04`) e já estão cobertos.
  Acrescentá-los à enumeração entre parênteses de NFR-0004 seria item de listagem novo numa rodada de
  correção (conventions §16) e moveria a versão de um NFR validado sem mudar o que ele exige.
- A saída do ensaio (critério 05) não ganhou a lista de patamares, a maior sequência de `understeer` por
  patamar nem o motivo de reprovação: seriam campos novos numa rodada de correção (conventions §16). Os
  critérios 04 e 06 são observados na telemetria por passo e no veredito reportado pelo ensaio, como já
  eram. Proposta ao autor para `SCOPE-BACKLOG.md`: "2026-10-22 req-loop rodada 8 — a saída do ensaio de
  início do subesterço deve listar, por patamar, a velocidade e a maior sequência de `understeer`
  consecutivo em ms, e o motivo da reprovação?"
- O caso em que a varredura termina sem saída da faixa (último patamar do ensaio concluído dentro da
  faixa) não é fixado: `DOMAIN/DEC-11` trata só do fim pela saída da faixa, e o número de patamares é
  parâmetro do ensaio (`DOMAIN/REF-04`). Nada foi acrescentado.
- A proposta de `SCOPE-BACKLOG.md` da rodada 7 (saída da faixa exatamente a 50 km/h) segue valendo, e os
  itens recusados das rodadas 1, 3, 5, 6 e 7 continuam recusados pelos mesmos motivos.
