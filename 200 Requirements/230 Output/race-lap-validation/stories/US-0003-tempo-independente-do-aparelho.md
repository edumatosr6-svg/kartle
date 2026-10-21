---
id: US-0003
title: Tempo oficial dependente só da pilotagem
feature: race-lap-validation
stage: req
status: validated
version: 2.0.0
sources: [SEED/US-3, SEED/RD-07, SEED/IM-I8, SEED/NF-01, SEED/NF-02, DOMAIN/DEC-03, DOMAIN/DEC-07, DOMAIN/DEC-08]
---

# US-0003 — Tempo oficial dependente só da pilotagem

## História

Como Jogador, quero que o tempo oficial dependa só da pilotagem, e não do desempenho do meu aparelho, para
que a comparação seja justa.

## Canais

- `web-desktop` e `web-mobile`: a mesma sequência de entradas normalizadas produz o mesmo tempo nos dois
  canais; o canal só muda o dispositivo que gera as entradas.
- Pausa: em `web-desktop`, a tecla Esc e a perda de foco da aba; em `web-mobile`, a perda de foco da aba e
  a perda do sensor de inclinação (`DOMAIN/DEC-08`). O efeito da pausa é o mesmo nos dois canais.
- `web-mobile`: com sensor de inclinação ausente ou permissão negada antes da volta, o controle recai para
  toque com estado visível (I4, `[DOMAIN]`); a regra desta história não muda.

## Pré-condições

- Uma sequência de entradas, uma pista (`trackId`, `trackVersion`) e um acerto estão fixados.
- Para os critérios 01 a 04, as duas execuções comparadas ocorrem no mesmo runtime.
- Para os critérios 05 a 09, o sinal verde foi dado e a volta está em andamento.

## Critérios de aceite

- AC-US-0003-01: Na saída de `npm test`, duas execuções com a mesma sequência de entradas, a mesma pista e
  o mesmo acerto produzem o mesmo tempo total, em milissegundos.
- AC-US-0003-02: Na saída de `npm test`, duas execuções com a mesma sequência de entradas, a mesma pista e
  o mesmo acerto produzem os mesmos quatro tempos de setor, em milissegundos.
- AC-US-0003-03: A mesma sequência de entradas, com renderização a 30 fps e a 60 fps, produz o mesmo
  tempo total no resultado da simulação (`SEED/RD-07`).
- AC-US-0003-04: A mesma sequência de entradas, com renderização a 30 fps e a 60 fps, produz os mesmos
  quatro tempos de setor no resultado da simulação (`SEED/RD-07`).
- AC-US-0003-05: Em `web-desktop`, ao pressionar Esc durante a volta, o cronômetro da volta exibido na tela
  deixa de avançar até o Jogador continuar (`DOMAIN/DEC-08`).
- AC-US-0003-06: Em `web-desktop` e em `web-mobile`, quando a aba perde o foco durante a volta, a volta é
  pausada sem ação do Jogador: ao voltar à aba, o cronômetro da volta exibido mostra o mesmo valor do
  instante da perda de foco (`DOMAIN/DEC-08`).
- AC-US-0003-07: Em `web-mobile`, quando o sensor de inclinação deixa de fornecer leituras durante a
  volta, a volta é pausada sem ação do Jogador: o cronômetro da volta exibido deixa de avançar
  (`DOMAIN/DEC-08`).
- AC-US-0003-08: Durante a pausa, o estado da simulação não avança nenhum passo de `STEP`: o tempo da volta
  ao continuar é igual ao tempo da volta no instante da pausa (`DOMAIN/DEC-08`).
- AC-US-0003-09: Uma volta oficial pausada e continuada permanece oficial e sem motivo de invalidação pela
  pausa: ao continuar, a tela exibe o estado "válida em andamento" (`DOMAIN/DEC-08`).
- AC-US-0003-10: A mesma sequência de entradas, aplicada uma vez sem pausa e uma vez com uma pausa de
  qualquer duração no meio da volta, produz o mesmo tempo total e os mesmos quatro tempos de setor no
  resultado da simulação (`DOMAIN/DEC-08`, `SEED/IM-I8`).

## Casos anormais

- **Queda da taxa de quadros durante a volta**: o tempo oficial continua função da sequência de passos de
  simulação, não dos quadros renderizados (`SEED/RD-07`, I8); critérios 03 e 04 o verificam.
- **Execuções em navegadores diferentes**: o tempo exibido, ao ms, é o mesmo em Chrome, Edge, Firefox e
  Safari atuais; uma diferença é defeito (`DOMAIN/DEC-07`, NFR-0008).
- **Pausas repetidas na mesma volta**: cada uma suspende simulação e cronômetro; a volta segue oficial
  (critérios 08 a 10).
- **Perda de foco e perda do sensor ao mesmo tempo (`web-mobile`)**: uma única pausa; o efeito é o do
  critério 08.
- **Recarregar ou abandonar a página durante a pausa**: a volta não é concluída e não produz resultado
  (`SEED/RD-05`). O consumo de tentativa é da etapa 5, fora do escopo.
- **Diferença de arredondamento na exibição**: a igualdade dos critérios 01 a 04 e 10 é verificada no
  resultado da simulação, em milissegundos (`DOMAIN/DEC-03`).

## Fontes

- `SEED/US-3` — história e seus dois critérios.
- `SEED/RD-07` — o relógio oficial acompanha a simulação.
- `SEED/IM-I8` — o tempo é função da sequência de passos.
- `SEED/NF-01`, `SEED/NF-02` — determinismo e independência de quadros.
- `DOMAIN/DEC-03` — tempo em milissegundos.
- `DOMAIN/DEC-07` — mesmo tempo entre navegadores.
- `DOMAIN/DEC-08` — pausa, perda de foco e perda do sensor suspendem simulação e cronômetro.

## Pontos em aberto

Nenhum — precisão, equivalência entre navegadores e pausa estão decididas em `DOMAIN.md` de 2026-10-20.
