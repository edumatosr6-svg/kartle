---
id: US-0005
title: Jogo continua justo com o novo acerto
feature: dirigibilidade
stage: req
status: validated
version: 2.0.0
sources: [SEED/US-5, SEED/RD-03, SEED/RD-04, SEED/NF-01, SEED/IM-I3I5, SEED/IM-I8, SEED/IM-I9, DOMAIN/REF-02, DOMAIN/DEC-07]
---

# US-0005 — Jogo continua justo com o novo acerto

## História

Como Jogador, quero que o jogo continue justo depois do novo acerto, para que o meu tempo valha o mesmo
que o de qualquer outro jogador com as mesmas entradas.

## Canais

- `web-desktop` e `web-mobile`: mesma regra de determinismo e mesma versão de acerto declarada; o
  resultado de uma volta é função só da sequência de `Input` por passo, seja ela produzida por teclado,
  inclinação ou toque. Nenhuma diferença entre os canais.
- Piloto de teste (`npm run bench:handling`): sem canal de jogo; é a régua do critério 03.
- `web-mobile` com sensor ausente ou permissão negada: controle por toque com estado visível (I4); a
  sequência de `Input` resultante segue a mesma regra de determinismo.

## Pré-condições

- Acerto Arcade assistido na sua nova versão (acerto agressivo, `DOMAIN/REF-02`), declarada no dado
  publicado.
- Uma sequência de `Input` por passo registrada (replay) para a pista sintética.

## Critérios de aceite

- AC-US-0005-01: A mesma sequência de `Input` por passo, aplicada ao mesmo estado inicial na mesma pista
  (`trackId`, `trackVersion`) com a mesma versão de acerto, produz o mesmo tempo total e os mesmos quatro
  tempos de setor em duas execuções, verificado na saída de `npm test` (`SEED/US-5`, primeiro critério;
  `SEED/NF-01`).
- AC-US-0005-02: A saída de `npm run bench:handling` reporta que o piloto de teste completou a volta
  sintética com zero passos fora do asfalto (`DOMAIN/DEC-07`).
- AC-US-0005-03: A saída de `npm run bench:handling` reporta tempo de volta do piloto de teste de no
  máximo 25 s de tempo simulado, menor que a linha de base registrada de ~31,4 s (`DOMAIN/DEC-07`).
- AC-US-0005-04: O dado publicado (`trackVersion` ou versão própria de acerto) declara uma versão de
  acerto diferente da anterior à feature; dois replays gravados com versões diferentes carregam versões
  diferentes e são distinguíveis pela leitura desse campo (`SEED/IM-I3I5`, I3).
- AC-US-0005-05: Nenhum tempo, replay ou resultado gravado com a versão de acerto anterior é apresentado
  na tela ou no texto compartilhado como comparável a um tempo da nova versão: onde o jogo compara tempos,
  só compara tempos de versão igual (`SEED/US-5`, terceiro critério).
- AC-US-0005-06: A saída de `npm test` mostra que o passo `STEP`, a taxa do solver (480 Hz) e o conjunto
  de campos e faixas de `Input` são os mesmos antes e depois da feature (`SEED/RD-03`, `SEED/IM-I8`).

## Casos anormais

- **Replay da versão anterior reproduzido com o novo acerto**: o tempo obtido não é o tempo gravado; o
  replay não é comparável (critério 05) e nenhum resultado é apresentado como equivalente ao original.
- **Piloto de teste sai do asfalto com o novo acerto**: critério 02 falha; o bench reporta o passo e a
  posição da saída; a feature não é entregue com esse resultado.
- **Tempo do piloto de teste acima de 25 s**: critério 03 falha; o bench reporta o tempo; nenhum
  afrouxamento do limite é admitido nesta etapa.
- **Duas execuções com tempos diferentes**: critério 01 falha; é defeito de determinismo (NFR-0001),
  nunca tolerância.
- **Pausa, perda de foco ou perda do sensor durante a volta**: a sequência de `Input` por passo é a mesma
  com ou sem suspensão; o tempo é de tempo simulado (I8).
- **Sensor ausente ou permissão negada antes da volta (`web-mobile`)**: controle por toque com estado
  visível (I4); regra de determinismo inalterada.
- **Rodada de acerto reprovada pelo dono do produto em staging** (`DOMAIN/DEC-10`): os critérios 01 a 06
  continuam valendo sem mudança para a rodada seguinte; cada nova rodada de presets é nova versão de
  acerto (critério 04) e passa de novo por este conjunto de ensaios.

## Fontes

- `SEED/US-5` — história e seus três critérios.
- `SEED/RD-03`, `SEED/IM-I8` — passo, solver e `Input` não mudam.
- `SEED/RD-04`, `SEED/IM-I3I5` — mudança versionada; tempos antigos não comparáveis.
- `SEED/NF-01` — determinismo (RNF07).
- `SEED/IM-I9` — ensaio determinístico.
- `DOMAIN/REF-02` — acerto agressivo da revisão 2.
- `DOMAIN/DEC-07` — 25 s, sem sair do asfalto (em vigor; substitui 27 s).

## Pontos em aberto

Nenhum — `DOMAIN/DEC-07` fecha o ponto aberto 07 do seed. O ponto aberto 08 (rodada de teste do dono do
produto, ciclo em staging) é critério final humano registrado em `01-context.md` e não bloqueia esta etapa
(`DOMAIN/DEC-08`, `DOMAIN/DEC-10`).
