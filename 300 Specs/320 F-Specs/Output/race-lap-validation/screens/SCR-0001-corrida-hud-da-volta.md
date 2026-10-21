---
id: SCR-0001
title: Corrida, contagem e estado da volta
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.1
sources: [US-0001, US-0003, US-0007, US-0009, NFR-0004, NFR-0006, NFR-0007, AC-US-0001-02, AC-US-0001-03, AC-US-0001-04, AC-US-0001-09, AC-US-0001-10, AC-US-0002-09, AC-US-0003-05, AC-US-0003-06, AC-US-0003-07, AC-US-0009-01, AC-US-0009-02, AC-US-0009-03, AC-US-0009-04, AC-US-0009-08, AC-US-0009-09]
---

# SCR-0001 — Corrida, contagem e estado da volta

## Propósito

Tela da volta em andamento: mostra a contagem regressiva, o sinal verde, o cronômetro, os tempos de setor já
completados e, em todos os quadros do sinal verde ao fim, o estado da volta ("válida em andamento" ou
"inválida" com o motivo). A tela só exibe e encaminha entradas; validade e tempo são da simulação (I2).

## Canal

Ambos. As diferenças estão na tabela de canais abaixo. A leitura do estado usa
[API-0001](../api/API-0001-resultado-e-estado-da-volta.md); os comandos usam
[API-0002](../api/API-0002-comandos-da-volta.md); o dado da pista vem de
[API-0003](../api/API-0003-dado-de-pista.md).

| Aspecto | `web-desktop` | `web-mobile` |
|---|---|---|
| Entrada de pilotagem | teclado (RF12) | inclinação e toque |
| Pausa manual | tecla Esc | nenhuma exigida pelos requisitos |
| Pausa automática | perda de foco da aba | perda de foco da aba; perda do sensor de inclinação |
| Reposicionamento | teclado | toque |
| Tamanho mínimo do texto de estado e de motivo | sem mínimo fixado | 16 px |
| Estado offline | igual (sem rede, tudo funciona) | igual |

## Pontos de entrada

Depois de `startLap` aceito em [SCR-0002](SCR-0002-inicio-de-volta.md). A volta termina em
[SCR-0003](SCR-0003-resultado-da-volta.md).

## Estados

| Estado | Condição | Chamadas | O que a tela mostra | Fonte |
|---|---|---|---|---|
| Carregando | O dado da pista ainda está sendo lido | `readTrackData` | Texto de carregamento; nenhuma ação de volta | FLOW-0004 |
| Vazio | Dado lido e nenhuma volta iniciada | `getLapState` retorna `NO_ACTIVE_LAP` | Sem estado da volta, sem tempos; o início é feito em [SCR-0002](SCR-0002-inicio-de-volta.md) | FLOW-0004 |
| Contagem | `lapPhase` `COUNTDOWN` | `getLapState` por quadro | Valor da contagem (3, 2, 1) em texto de no mínimo 48 px, contraste mínimo 4,5:1; cronômetro em zero | AC-US-0001-02, AC-US-0001-04, AC-US-0001-09, AC-US-0001-10 |
| Sinal verde | Primeiro quadro de `RUNNING` | `getLapState` | Rótulo do sinal verde em texto (48 px, 4,5:1) | AC-US-0001-03 |
| Em andamento | `RUNNING`, `lapValidity` `VALID` | `getLapState` por quadro | Cronômetro `m:ss.mmm`; tempos de setor completados; estado "válida em andamento" em texto | AC-US-0009-01, AC-US-0009-02, AC-US-0002-09 |
| Inválida | `ENDED` e `lapValidity` `INVALID` | `getLapState`, `getLapResult` | Estado "inválida" e o motivo ("marcador pulado", "corte" ou "reposicionamento") em texto; cronômetro parado; leva a [SCR-0003](SCR-0003-resultado-da-volta.md) | AC-US-0009-03 |
| Pausada | `lapPhase` `PAUSED` | `getLapState` | Cronômetro parado no valor do instante da pausa; o estado da volta do instante da pausa; indicação em texto de que a volta está pausada | AC-US-0003-05, AC-US-0003-06, AC-US-0003-07 |
| Encerrada válida | `ENDED` e `VALID` | `getLapResult` | Leva a [SCR-0003](SCR-0003-resultado-da-volta.md) | AC-US-0002-01 |
| Erro | `UNSUPPORTED_SCHEMA` ou `UNREADABLE` | `readTrackData` | Mensagem `trackDataError` em texto, nos dois idiomas ([RULE-0006](../rules/RULE-0006-mensagens-de-estado-e-motivo.md)), sem volta iniciada; o dado de versão desconhecida fica intacto. As rejeições de `startLap` (`LAP_ALREADY_ACTIVE`, `OFFICIAL_NOT_AVAILABLE`, `TRACK_DATA_UNREADABLE`, `TRACK_SCHEMA_UNSUPPORTED`) não têm mensagem própria: são sem efeito e não são exibidas | API-0003 |
| Offline | Sem rede | nenhuma chamada de rede | Nenhuma diferença: contagem, volta e resultado funcionam; nenhum aviso de rede é exibido | NFR-0004 |
| Permissão negada | `web-mobile` com sensor ausente ou permissão negada | nenhuma | O controle recai para toque e a tela mostra, em texto, "controle por toque (sensor de inclinação indisponível)" ([RULE-0006](../rules/RULE-0006-mensagens-de-estado-e-motivo.md)); contagem e regras não mudam | I4 |
| Permissão negada em `web-desktop` | Não se aplica | — | O canal usa teclado; não pede sensor | RF12 |

Todo texto de estado, motivo e contagem existe além da cor, em português e em inglês conforme o idioma do
navegador (NFR-0006, NFR-0007).

## Ações do Jogador

| Ação | Canal | Resultado |
|---|---|---|
| Pausar | `web-desktop` (Esc) | `pauseLap` `ESC_KEY`: estado Pausada |
| Perder o foco da aba | ambos (automático) | `pauseLap` `FOCUS_LOST` |
| Perder o sensor | `web-mobile` (automático) | `pauseLap` `SENSOR_LOST` |
| Continuar | ambos | `resumeLap`; o meio de acionar não é decidido pelos requisitos |
| Reposicionar | teclado em `web-desktop`; toque em `web-mobile` | `repositionKart`: em volta oficial, estado Inválida com "reposicionamento"; em reconhecimento ou treino, o kart é recolocado e o estado segue "válida em andamento", sem motivo |
| Acelerar antes do sinal verde | ambos | Sem efeito; sem penalidade |

## Navegação

Entrada por [SCR-0002](SCR-0002-inicio-de-volta.md); saída para [SCR-0003](SCR-0003-resultado-da-volta.md) ao
`ENDED`. Recarregar ou abandonar a tela durante a volta não produz resultado.
