---
id: SCR-0001
title: HUD de velocidade e estado de aderência durante a volta
feature: dirigibilidade
stage: fspec
status: validated
version: 1.0.0
sources: [US-0004, NFR-0003, NFR-0005, AC-US-0004-06]
---

# SCR-0001 — HUD de velocidade e estado de aderência durante a volta

## Propósito

Os dois elementos do HUD que esta feature exige que não regridam: a velocidade do kart em km/h e o estado
de aderência em texto, exibidos em todos os quadros entre o sinal verde e o fim da volta (AC-US-0004-06).
A tela só exibe o que a simulação reporta; nenhuma regra de pilotagem é decidida aqui (I2, NFR-0005). Os
elementos já existem; esta feature não os remove, não os oculta e não acrescenta elemento novo. A tela da
corrida (contagem, cronômetro, estado da volta) é da feature `race-lap-validation`, nomeada e não
redefinida: este arquivo especifica apenas os dois elementos de dirigibilidade dentro dela.

## Canal

Ambos. As diferenças estão na tabela abaixo. A leitura usa
[API-0001](../api/API-0001-telemetria-de-dirigibilidade.md).

| Aspecto | `web-desktop` | `web-mobile` |
|---|---|---|
| Entrada de pilotagem | teclado (esterço e acelerador binários) | inclinação (esterço proporcional) e toque (acelerador); só toque sem sensor ou sem permissão |
| Elementos do HUD | velocidade em km/h; estado de aderência em texto | os mesmos |
| Estado offline | igual (sem rede, tudo funciona) | igual |

## Pontos de entrada

Exibido durante a volta, a partir do sinal verde da tela da corrida; deixa de ser exigido no fim da volta,
quando a tela de resultado ([SCR-0002](SCR-0002-resultado-e-texto-compartilhado.md)) assume.

## Estados

| Estado | Condição | Chamadas | O que a tela mostra | Fonte |
|---|---|---|---|---|
| Carregando | O dado de pista ainda está sendo lido; não há estado de simulação | `getHandlingTelemetry` retorna `NO_STATE` | Os dois elementos não exibem valor de telemetria; a tela de carregamento é da tela da corrida | API-0001 |
| Vazio | Estado de simulação existe, antes do sinal verde (contagem) | `getHandlingTelemetry` por quadro | Velocidade 0 km/h e o texto de `grip`, valores do estado inicial; o critério 06 de US-0004 só exige a exibição a partir do sinal verde | AC-US-0004-06 |
| Populado | Entre o sinal verde e o fim da volta | `getHandlingTelemetry` em todos os quadros | `speedMps` convertida para km/h; o texto do estado de aderência correspondente a `handling` (`grip`, `understeer`, `oversteer`, `sliding`), com os textos já existentes para os quatro valores, que esta feature não altera | AC-US-0004-06 |
| Pausada | Simulação suspensa (pausa, perda de foco, perda do sensor) | `getHandlingTelemetry` (devolve o último passo) | Os dois elementos mantêm o último valor exibido | US-0004, caso anormal |
| Erro | Dado de pista ilegível ou de esquema não suportado: nenhuma volta é criada | nenhuma deste conjunto | Os dois elementos não são exibidos, porque não há volta; a mensagem de erro é da tela da corrida de `race-lap-validation` | NFR-0008 |
| Offline | Sem rede | nenhuma chamada de rede | Nenhuma diferença: a telemetria é local; nenhum aviso de rede | RNF08, D-FS-08 |
| Permissão negada | `web-mobile` com sensor ausente ou permissão negada | nenhuma | O controle recai para toque com estado visível (I4), exibido pela tela da corrida; os dois elementos do HUD não mudam e os limites não mudam | US-0004, Canais |
| Permissão negada em `web-desktop` | Não se aplica | — | O canal usa teclado; não pede sensor | US-0004, Canais |
| Fim da volta | Volta encerrada (conclusão ou invalidação) | última leitura | Os dois elementos mostram o último valor; a tela de resultado assume | AC-US-0004-06 |

Os textos do estado de aderência existem além da cor, nos dois idiomas, como já ocorre hoje; esta feature
não acrescenta texto novo (famílias dispensadas em `01-context.md` dos requisitos).

## Ações do Jogador

| Ação | Canal | Resultado |
|---|---|---|
| Esterçar, acelerar, frear | ambos | `Input` entregue à simulação ([FLOW-0001](../flows/FLOW-0001-passo-de-simulacao-e-hud.md)); o HUD reflete o estado no quadro seguinte |
| Pausar, perder o foco, perder o sensor | conforme a tela da corrida | Estado Pausada: últimos valores mantidos |

## Navegação

Nenhuma navegação própria: o HUD vive dentro da tela da corrida e termina com ela. A saída para o
resultado é [SCR-0002](SCR-0002-resultado-e-texto-compartilhado.md).
