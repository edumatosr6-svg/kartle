---
id: FEAT-0008
title: Dado de pista com largada, sentido, setores e marcadores
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: [NFR-0012, US-0002, US-0004, US-0006, US-0008, AC-US-0002-10, AC-US-0002-13, AC-US-0004-06, AC-US-0006-04, AC-US-0008-03, AC-US-0008-04, AC-US-0008-05]
---

# FEAT-0008 — Dado de pista com largada, sentido, setores e marcadores

## Resumo

Largada, sentido, linha de chegada, setores, marcadores e limites de corte vêm do dado da pista, não de
constantes do jogo (restrição do seed). O dado de pista passa a carregar setores e marcadores como conjuntos
distintos: é uma mudança versionada, com leitor da forma anterior (I3, I5). A pista sintética atual recebe os
seus próprios setores e marcadores. Pista cujo dado não os declara é jogável só como treino.

## Canais

Dado de pista é independente de canal: o mesmo dado serve `web-desktop` e `web-mobile`. O Curador do
catálogo fornece o dado (`requirements/03`, passo 7); não interage com o jogo nesta feature.

## Requisitos

- REQ-FEAT-0008-01: O sistema SHALL obter do dado da pista, e não de constantes do jogo, a posição de
  largada, o sentido da pista, a linha de chegada, os limites dos quatro setores e os marcadores de
  validação (AC-US-0002-10).
- REQ-FEAT-0008-02: O sistema SHALL tratar os quatro setores e os marcadores de validação como conjuntos
  distintos no dado da pista (AC-US-0004-05).
- REQ-FEAT-0008-03: O dado da pista sintética atual SHALL declarar os seus próprios setores e marcadores, de
  modo que uma volta completa válida e uma volta que pula um marcador possam ser exibidas na pista
  sintética (AC-US-0002-13, AC-US-0004-06).
- REQ-FEAT-0008-04: O sistema SHALL aplicar os limites de corte (distância em metros e duração em
  milissegundos) declarados pelo dado da pista e, na ausência de um deles, o valor padrão correspondente:
  3 m ou 1000 ms (AC-US-0006-04).
- REQ-FEAT-0008-05: O sistema SHALL considerar incompleto o dado de pista que não declara largada,
  sentido, linha de chegada, quatro setores ou marcadores (AC-US-0008-03).
- REQ-FEAT-0008-06: O sistema SHALL oferecer, numa pista de dado incompleto, apenas volta de treino
  (AC-US-0008-03).
- REQ-FEAT-0008-07: O sistema SHALL identificar como não oficial todo resultado de uma pista de dado
  incompleto (AC-US-0008-05).
- REQ-FEAT-0008-08: O dado de pista que passa a carregar largada, sentido, setores e marcadores distintos
  SHALL declarar uma versão de esquema maior que a anterior (NFR-0012).
- REQ-FEAT-0008-09: O sistema SHALL ler sem erro 100% dos arquivos de pista na versão anterior de esquema
  (NFR-0012).
- REQ-FEAT-0008-10: O sistema SHALL tratar um arquivo de pista na forma anterior, que não declara setores
  nem marcadores, como dado incompleto, jogável só como treino, preservando-o intacto [DOMAIN] (I4, I5;
  `DOMAIN/DEC-10`).
- REQ-FEAT-0008-11: O sistema SHALL manter intacto, reportar na tela e não usar para volta um dado de pista
  com versão de esquema que o leitor não conhece [DOMAIN] (I3, I4).
- REQ-FEAT-0008-12: O sistema SHALL NOT alterar no lugar uma `trackVersion` já publicada: qualquer mudança
  do dado de uma pista publicada produz uma nova `trackVersion` [DOMAIN] (I3).
- REQ-FEAT-0008-13: O sistema SHALL tratar como dado incompleto o dado de pista cujos marcadores, setores,
  linha de chegada e sentido são inconsistentes entre si, de modo que o resultado seja só treino [DOMAIN]
  (I4; `DOMAIN/DEC-10`).
- REQ-FEAT-0008-14: O dado da pista SHALL declarar a posição de largada de modo que a primeira passagem do
  kart pela linha de chegada, no sentido da pista, só ocorra ao completar o percurso [DOMAIN] (US-0002: a
  volta se encerra ao cruzar a chegada depois de todos os marcadores).
- REQ-FEAT-0008-15: O sistema SHALL resolver `trackId` e `trackVersion` de cada resultado a partir do dado
  de pista lido, sem usar a data, o relógio ou o nome da pista como chave [DOMAIN] (I1; D-FS-01).

## Comportamento

Contrato do dado: [API-0003](../api/API-0003-dado-de-pista.md). Início de volta e verificação de completude:
[FLOW-0004](../flows/FLOW-0004-inicio-da-volta.md).

| Situação | Comportamento |
|---|---|
| Dado completo e consistente | Volta oficial pode ser oferecida pelo desafio diário; treino e reconhecimento disponíveis |
| Dado sem largada, sentido, chegada, quatro setores ou marcadores | Dado incompleto: só treino; todo resultado não oficial |
| Dado na forma anterior (sem setores e marcadores) | Lido sem erro; tratado como dado incompleto |
| Dado com versão de esquema desconhecida | Não é usado; mantido intacto; erro exibido ([SCR-0001](../screens/SCR-0001-corrida-hud-da-volta.md)) |
| Dado declara só um dos limites de corte | O limite ausente usa o padrão; o declarado vale |
| Dado ilegível (corrompido) | Tratado como erro de leitura; nenhuma volta é criada (`TRACK_DATA_UNREADABLE`) |
| Rede indisponível | Sem efeito: o dado já carregado é suficiente para a volta (D-FS-08) |

A forma como o dado de pista é gerado e publicado (importação, revisão, OSM) é da etapa 3, fora do escopo.

## Estado

Não altera estado da volta. Lê o dado de pista ao iniciar a volta; o resultado de leitura é uma de `COMPLETE`,
`INCOMPLETE`, `UNSUPPORTED_SCHEMA`, `UNREADABLE` ([RULE-0005](../rules/RULE-0005-tipos-de-volta-e-reposicionamento.md)).

## Configuração

Nenhuma da feature. Os valores padrão de corte (3 m, 1000 ms) são da decisão `DOMAIN/DEC-01`, substituíveis
pelo dado da pista.

## Critérios de aceite

- Largada, sentido, chegada, setores e marcadores lidos do dado da pista; setores e marcadores são
  conjuntos distintos (satisfaz AC-US-0002-10, AC-US-0004-05; cobre os requisitos 01, 02 e 14).
- A pista sintética atual declara os seus setores e marcadores e produz volta válida e volta com marcador
  pulado (satisfaz AC-US-0002-13, AC-US-0004-06; cobre o requisito 03).
- Limites de corte do dado valem sobre os padrões (satisfaz AC-US-0006-04; cobre o requisito 04).
- Dado incompleto: sem opção de volta oficial, treino pilotável, resultado não oficial (satisfaz
  AC-US-0008-03, AC-US-0008-04, AC-US-0008-05; cobre os requisitos 05, 06, 07, 10 e 13).
- Versão de esquema do arquivo gerado maior que a anterior; saída de `npm test` lendo um arquivo na forma
  anterior sem erro; versão desconhecida mantida intacta e reportada (satisfaz o NFR-0012; cobre os
  requisitos 08, 09 e 11).
- Mudança de dado de pista publicada gera nova `trackVersion`; o resultado traz `trackId` e `trackVersion`
  do dado lido (satisfaz AC-US-0002-10; cobre os requisitos 12 e 15).

## Pontos em aberto

Nenhum.
