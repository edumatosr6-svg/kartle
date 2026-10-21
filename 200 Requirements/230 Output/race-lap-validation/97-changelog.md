---
title: Changelog — validação de volta de corrida
feature: race-lap-validation
stage: req
status: validated
version: 2.2.0
sources: [SEED, DOMAIN]
---

# Changelog

## 2026-10-20 — rodada 1, Mode A (geração a partir do seed revision 1)

**O que mudou**

- Conjunto gerado do zero a partir de `SEED.md` (`revision: 1`) e `DOMAIN.md`: `01-context.md`,
  `02-glossary.md`, nove histórias (US-0001 a US-0009, uma por história do seed), doze NFRs (NFR-0001 a
  NFR-0012) e o registro `98-divergences.md`, sem linhas.
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os gera com `lint_artifacts.py --emit`.
- Decisões de `DOMAIN.md` aplicadas no lugar dos pontos abertos do seed: ponto aberto 05 (contagem de 3 s,
  cronômetro no sinal verde) em US-0001; ponto aberto 06 (volta invalidada termina imediatamente) em US-0004,
  US-0006, US-0007 e US-0009.
- Restrições do seed sem história própria tornadas mensuráveis como NFR: I2 (NFR-0009), passo fixo
  (NFR-0010), física e presets (NFR-0011), versionamento do dado de pista (NFR-0012).

**Itens fechados**: nenhum `ISSUE-<nn>` ou `FB-<nn>` (primeira rodada).

**Pontos em aberto carregados** (bloqueiam a passagem para F-Spec; decisão do dono do produto):

- Do seed: ponto aberto 01, ponto aberto 02, ponto aberto 03, ponto aberto 04, ponto aberto 07, ponto aberto 08.
- Levantados nesta rodada, porque o seed exige o item sem dizer o comportamento: ponto aberto 09 (idioma fora de
  pt/en), ponto aberto 10 (dado de pista incompleto), ponto aberto 11 (limiar de legibilidade de "texto legível").

**Itens recusados, com motivo**

- A faixa "RASCUNHO — revisão humana obrigatória antes de qualquer loop" do seed não foi tratada como
  bloqueio: o loop foi acionado pelo autor (`/req-loop race-lap-validation`) depois de registrar decisões
  em `DOMAIN.md` na mesma data. Se a revisão humana ainda não ocorreu, o autor deve parar o loop e remover
  ou manter a faixa no seed.
- `NOTES.md` da pasta do seed não foi lido (fora da lista de entrada da etapa).
- Nenhum limiar numérico foi inventado para corte, precisão, queima de largada, legibilidade ou
  equivalência entre navegadores: cada um permanece no seu `OPEN-<nn>`.
- O consumo de tentativa em recarga, abandono ou perda de foco não foi especificado: pertence à etapa 5
  (fora do escopo do seed); as histórias dizem apenas que uma volta não concluída não produz resultado.

## 2026-10-20 — rodada 2, Mode A (regeneração com as decisões de `DOMAIN.md`)

**O que mudou**

- Conjunto regenerado a partir de `SEED.md` (`revision: 1`) e das decisões de 2026-10-20 em `DOMAIN.md`,
  que fecham os pontos abertos 01 a 11. Cada decisão ganhou o rótulo de rastreabilidade `DOMAIN/DEC-nn`
  (nn = número do ponto que ela fecha), definido em `01-context.md`.
- Aplicação das decisões, com os critérios novos ou reescritos:
  - DEC-01 (corte: mais de 3 m além da borda por mais de 1000 ms seguidos; limites próprios da pista):
    US-0006, critérios 01 a 04 e 08.
  - DEC-02 (reposicionamento confirmado; livre e sem penalidade em reconhecimento e treino): US-0007,
    critérios 01, 04, 05 e o novo 06.
  - DEC-03 (ms, cruzamento interpolado no passo, exibição `1:02.345`): US-0002, critérios 04 a 08;
    US-0003, critérios 01 e 02.
  - DEC-04 (queima de largada ignorada): US-0001, critérios 06 a 08.
  - DEC-05 (contagem de 3 s, cronômetro no sinal verde): US-0001, critérios 01 e 05 (já aplicada na
    rodada 1; agora citada pelo rótulo).
  - DEC-06 (volta invalidada termina imediatamente): US-0004 critério 07, US-0006 critério 06, US-0007
    critério 03, US-0009 casos anormais (já aplicada na rodada 1; agora citada pelo rótulo).
  - DEC-07 (mesmo tempo, ao ms exibido, em Chrome, Edge, Firefox e Safari atuais): NFR-0008, limite
    fixado em 0 ms.
  - DEC-08 (pausa, perda de foco e perda do sensor suspendem simulação e cronômetro; a volta segue
    oficial): US-0003, critérios 05 a 10; casos anormais de US-0001, US-0002, US-0004 a US-0009.
  - DEC-09 (idioma fora de pt/en recebe inglês): US-0009 critério 07; NFR-0007.
  - DEC-10 (pista de dado incompleto só jogável como treino): US-0008, critérios 03 a 05.
  - DEC-11 (WCAG AA 4,5:1; 16 px no celular para estado e motivo; 48 px na contagem): US-0001 critérios
    09 e 10; US-0009 critérios 08 e 09; NFR-0006.
- Seção de pontos em aberto removida de `01-context.md`; cada história e cada NFR passou a "Nenhum".
- Critérios renumerados em US-0002 (01 a 13) e US-0006 (01 a 08), porque a rodada 1 não passou pelo gate
  e nenhum estágio posterior cita esses ids.
- `01-context.md`, `02-glossary.md`, US-0001 a US-0009 e NFR-0006 a NFR-0009 foram para `version: 2.0.0`;
  NFR-0001 a NFR-0005 e NFR-0010 a NFR-0012 não mudaram.
- Na entrada da rodada 1 deste changelog, as menções aos pontos abertos foram reescritas de "OPEN-nn" para
  "ponto aberto nn", sem mudar o sentido, para que o gate não as leia como pontos ainda abertos.
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os gera com `lint_artifacts.py --emit`.

**Itens fechados**: nenhum `ISSUE-<nn>` ou `FB-<nn>` (nenhum relatório de validação ou de feedback
existe); pontos abertos 01 a 11 fechados por `DOMAIN.md`.

**Itens recusados, com motivo**

- A parte do ponto aberto 01 do seed sobre "densidade dos marcadores" e "progresso permitido fora da pista"
  não virou critério: a decisão DEC-01 define o corte só por distância e duração, e a densidade dos
  marcadores é decisão de desenho (dado de pista), não requisito.
- Nenhum tamanho mínimo de texto de estado e de motivo foi fixado para `web-desktop`: DEC-11 fixa 16 px só
  para o celular, e inventar o limite seria limiar de domínio criado nesta etapa.
- O meio de continuar depois de uma pausa (tecla, toque, botão) não foi especificado: DEC-08 diz "ao
  continuar" sem nomear a ação; fica para F-Spec.
- Nenhuma pausa manual em `web-mobile` foi especificada: DEC-08 nomeia Esc (teclado) e as pausas
  automáticas por perda de foco e de sensor; um controle de pausa por toque seria superfície nova.
- A faixa "RASCUNHO — revisão humana obrigatória antes de qualquer loop" do seed continua sem ser tratada
  como bloqueio: o autor registrou onze decisões em `DOMAIN.md` e acionou este loop. Remover a faixa ou
  subir a revisão do seed é decisão do autor.
- `NOTES.md` da pasta do seed não foi lido (fora da lista de entrada da etapa).

## 2026-10-20 — rodada 3, Mode A (regeneração a partir do seed revision 1 e de `DOMAIN.md`)

**O que mudou**

- O conjunto foi rederivado de `SEED.md` (`revision: 1`, sem mudança desde a rodada 2) e de `DOMAIN.md`
  (decisões DEC-01 a DEC-11, sem mudança desde a rodada 2). A verificação de fechamento (cada história,
  regra de domínio, restrição, impacto, NFR e item fora do escopo do seed presente no conjunto) não achou
  item faltando nem item sem origem; todos os ids existentes foram mantidos, nenhum foi removido ou
  renumerado.
- US-0006, critério 07: a comparação de velocidade na grama e na pista passou a fixar o mesmo estado
  inicial e a mesma entrada em todos os passos, para que dois leitores cheguem ao mesmo veredito
  (`version: 2.1.0`).
- US-0008, casos anormais: a frase "o que dela se cronometra depende do dado presente" foi trocada por uma
  afirmação decidível, que diz que o seed e `DOMAIN.md` não decidem o que se cronometra numa pista sem
  linha de chegada e que este conjunto não acrescenta critério sobre isso (`version: 2.1.0`).
- Nenhum outro arquivo mudou. `00-index.md` e `99-traceability.md` não foram escritos: o gate os gera com
  `lint_artifacts.py --emit`.

**Itens fechados**: nenhum `ISSUE-<nn>` ou `FB-<nn>` (nenhum relatório de validação ou de feedback existe
para esta feature).

**Itens recusados, com motivo**

- Critério para o que se cronometra numa volta de treino em pista sem linha de chegada ou sem setores: não
  acrescentado, porque nem o seed nem `DOMAIN.md` (DEC-10) o decidem; inventá-lo seria widening do seed.
  Proposta ao autor para `SCOPE-BACKLOG.md`: "2026-10-20 req-loop rodada 3 — pista de dado incompleto
  (DEC-10): o que a volta de treino exibe como tempo quando o dado não declara linha de chegada ou setores?"
- Tamanho mínimo de texto de estado e de motivo em `web-desktop`, meio de continuar após a pausa e pausa
  manual por toque em `web-mobile`: continuam fora, pelos motivos registrados na rodada 2.
- A faixa "RASCUNHO — revisão humana obrigatória antes de qualquer loop" do seed continua sem ser tratada
  como bloqueio, pelo motivo registrado nas rodadas 1 e 2; remover a faixa ou subir a revisão do seed é
  decisão do autor.
- `NOTES.md` da pasta do seed não foi lido (fora da lista de entrada da etapa).

## 2026-10-20 — rodada 4, Mode B (relatório `req-validation-20261020-1825.md`)

**O que mudou**

- `01-context.md` (`version: 2.1.0`): acrescentadas duas declarações na seção "O que é a feature" — a
  aposentadoria da validação preliminar por gates sequenciais do protótipo, substituída pelas regras de
  US-0002 e US-0004 a US-0007 (`SEED.md`, Contexto), e o padrão seguro: ligado por padrão, seguro por
  `DOMAIN/DEC-10`, NFR-0004 e NFR-0011. Nenhum requisito novo.
- `stories/US-0008-reconhecimento-e-treino.md` (`version: 2.2.0`): a contramão saiu da lista de causas de
  volta inválida; novo caso anormal diz que a chegada na contramão não encerra a volta nem registra tempo
  em qualquer tipo de volta (US-0005). Os demais sítios do fato (US-0002, US-0004, glossário) já estavam
  coerentes.
- `stories/US-0004-marcador-pulado.md` (`version: 2.1.0`): novo caso anormal para a chegada cruzada de novo
  após a volta inválida por marcador — nenhum segundo resultado (critério 07, `DOMAIN/DEC-06`, I7).
- Nenhum critério, história, NFR ou campo acrescentado. `00-index.md` e `99-traceability.md` não foram
  escritos (gerados pelo gate).

**Itens fechados**: ISSUE-01, ISSUE-02, ISSUE-03, ISSUE-04.

**Itens recusados, com motivo**: nenhum item do relatório recusado. Os itens recusados nas rodadas
anteriores continuam fora, pelos motivos lá registrados.


## 2026-10-20 — rodada 5, Mode A (seed revision 2)

**O que mudou**

- O seed subiu para `revision: 2`: o autor revisou o seed e removeu a faixa de rascunho. O conjunto foi
  rederivado de `SEED.md` (`revision: 2`) e de `DOMAIN.md` (DEC-01 a DEC-11, sem mudança). A verificação de
  fechamento (histórias, regras de domínio, restrições, impactos, NFRs e itens fora do escopo do seed)
  não achou item faltando nem item sem origem; nenhum id foi removido ou renumerado.
- `01-context.md` (`version: 2.2.0`): a referência ao seed passou de `revision: 1` para `revision: 2`.
- Nenhuma história, critério, NFR ou campo mudou. `00-index.md` e `99-traceability.md` não foram escritos:
  o gate os gera com `lint_artifacts.py --emit`.

**Itens fechados**: nenhum `ISSUE-<nn>` ou `FB-<nn>`.

**Itens recusados, com motivo**

- Os itens recusados nas rodadas 2 e 3 (tamanho mínimo de texto em `web-desktop`, meio de continuar após a
  pausa, pausa manual por toque em `web-mobile`, o que a volta de treino exibe em pista sem linha de
  chegada) continuam fora, pelos motivos lá registrados; nenhum é decidido pelo seed revision 2.
- `NOTES.md` da pasta do seed não foi lido (fora da lista de entrada da etapa).
