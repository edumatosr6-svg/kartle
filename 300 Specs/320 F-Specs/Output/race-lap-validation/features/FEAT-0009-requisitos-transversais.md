---
id: FEAT-0009
title: Requisitos transversais de simulação, desempenho, privacidade e verificação
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: [NFR-0003, NFR-0004, NFR-0005, NFR-0009, NFR-0010, NFR-0011]
---

# FEAT-0009 — Requisitos transversais de simulação, desempenho, privacidade e verificação

## Resumo

Reúne o que vale para toda a feature e não pertence a uma história só: validação e cronometragem ficam na
simulação (I2); o passo fixo, as entradas, a física e os presets não mudam (I8); a volta roda sem servidor e
sem coleta de dado pessoal; a taxa de quadros se mantém com a validação ativa; e cada regra de validade tem
verificação determinística em `npm test` (I9).

## Canais

`web-desktop` e `web-mobile`. Os limites de taxa de quadros diferem por canal (60 fps em notebook, 30 fps em
celular intermediário); todo o restante é igual.

## Requisitos

- REQ-FEAT-0009-01: O sistema SHALL decidir a validade da volta e a cronometragem na camada de simulação,
  sem que a renderização ou um adaptador de controle decida validade ou tempo [DOMAIN] (I2; D-FS-05;
  `SEED/RE-01`).
- REQ-FEAT-0009-02: O sistema SHALL manter a simulação livre de acesso ao DOM, ao relógio de parede e a
  sorteio sem semente ao validar e cronometrar a volta [DOMAIN] (I2).
- REQ-FEAT-0009-03: O sistema SHALL manter inalterados o valor de `STEP` e o significado dos campos de
  `Input` (NFR-0010).
- REQ-FEAT-0009-04: O sistema SHALL manter inalteradas a física de pilotagem e os presets de kart, de modo
  que as saídas de `npm run bench:physics` e de `npm run bench:handling` sejam idênticas antes e depois da
  feature em 100% das medidas (NFR-0011).
- REQ-FEAT-0009-05: O sistema SHALL sustentar 60 fps em `web-desktop` (notebook), nos aparelhos de
  referência de RNF03, durante uma volta completa com a validação e a cronometragem ativas, comprovado por
  teste registrado no aparelho nomeado (NFR-0003).
- REQ-FEAT-0009-06: O sistema SHALL sustentar 30 fps em `web-mobile` (celular intermediário), nos aparelhos
  de referência de RNF03, durante uma volta completa com a validação e a cronometragem ativas, comprovado
  por teste registrado no aparelho nomeado; uma execução em desktop não vale como evidência para celular
  (NFR-0003).
- REQ-FEAT-0009-07: O sistema SHALL iniciar, cronometrar, validar e exibir a volta sem depender de servidor,
  com 0 requisições de rede necessárias entre o início da contagem e a exibição do resultado (NFR-0004).
- REQ-FEAT-0009-08: O sistema SHALL exibir o resultado com a rede desligada em 100% das voltas testadas com
  a rede bloqueada após o carregamento da página (NFR-0004).
- REQ-FEAT-0009-09: O sistema SHALL NOT coletar dado pessoal na validação e na cronometragem: 0 campos de
  dado pessoal no resultado da volta e 0 requisições de rede que transmitam dados da volta (NFR-0005).
- REQ-FEAT-0009-10: O sistema SHALL ter ao menos 1 verificação determinística, na saída de `npm test`,
  avançando a simulação com `STEP` sem renderização nem controles, para cada regra de validade e de
  cronometragem: marcador pulado, contramão, corte pelos limites padrão de 3 m e 1000 ms, corte pelos
  limites declarados na pista, grama sem corte, reposicionamento, reconhecimento e treino, pista de dado
  incompleto, início no sinal verde, queima de largada ignorada, suspensão na pausa, interpolação do
  cruzamento e soma dos setores igual ao tempo total (NFR-0009).
- REQ-FEAT-0009-11: O sistema SHALL NOT gravar no navegador o resultado da volta nesta feature: a
  persistência do resultado é do desafio diário [DOMAIN] (I7; requisitos, fora do escopo; D-FS-04).
- REQ-FEAT-0009-12: O sistema SHALL tratar como sem efeito um evento de volta repetido, atrasado ou fora de
  ordem em relação ao estado da volta, sem produzir segundo resultado nem alterar o resultado já produzido
  [DOMAIN] (I7; D-FS-03).

## Comportamento

Resultados e estados: [API-0001](../api/API-0001-resultado-e-estado-da-volta.md) e
[RULE-0002](../rules/RULE-0002-estados-da-volta.md). Evidência por regra: a saída de `npm test`; sensores,
taxa de quadros e navegadores só se provam em teste registrado no aparelho ou navegador nomeado (I9).

| Situação | Comportamento |
|---|---|
| Evento de volta repetido (por exemplo, a chegada cruzada de novo) | Sem efeito; a deduplicação ocorre na simulação, pelo estado `lapPhase` e pelo contador `stepCount` |
| Evento fora de ordem (por exemplo, marcador atravessado antes do anterior) | Sem efeito sobre o progresso (ver [RULE-0001](../rules/RULE-0001-validade-da-volta.md)) |
| Rede bloqueada após o carregamento | A volta conclui e o resultado é exibido; nenhuma requisição é necessária |
| Rede indisponível durante a contagem, a volta ou o resultado | Sem efeito observável |
| Erro de leitura do dado de pista | Nenhuma volta é criada; o erro é exibido ([SCR-0001](../screens/SCR-0001-corrida-hud-da-volta.md)) |
| Recarga da página durante a volta | Nenhum resultado e nenhum dado gravado por esta feature |

## Estado

Não define estados próprios; lê `lapPhase` e `stepCount` ([RULE-0002](../rules/RULE-0002-estados-da-volta.md)).

## Configuração

Nenhuma. Nenhuma configuração existe para forçar um evento, injetar um estado ou habilitar um caminho de
depuração; as verificações de `npm test` avançam a simulação com `STEP` pelas mesmas operações públicas.

## Critérios de aceite

- Validade e tempo decididos na simulação, verificados sem renderização nem controles (satisfaz o NFR-0009;
  cobre os requisitos 01, 02 e 10).
- `STEP` e `Input` com valores e significados anteriores; benches idênticos (satisfaz o NFR-0010 e o
  NFR-0011; cobre os requisitos 03 e 04).
- 60 fps em notebook e 30 fps em celular intermediário, registrados nos aparelhos de referência (satisfaz o
  NFR-0003; cobre os requisitos 05 e 06).
- Volta concluída com a rede bloqueada; 0 campos pessoais e 0 requisições com dados da volta (satisfaz o
  NFR-0004 e o NFR-0005; cobre os requisitos 07 a 09 e 11).
- Evento repetido, atrasado ou fora de ordem sem efeito e sem segundo resultado (satisfaz o NFR-0009; cobre
  o requisito 12).

## Pontos em aberto

Nenhum.
