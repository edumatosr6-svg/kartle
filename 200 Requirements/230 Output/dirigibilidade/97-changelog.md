---
title: Changelog — dirigibilidade do Arcade assistido
feature: dirigibilidade
stage: req
status: validated
version: 1.0.0
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
