---
id: SCR-0002
title: Resultado da volta e texto compartilhado com a versão do acerto
feature: dirigibilidade
stage: fspec
status: validated
version: 1.0.0
sources: [US-0005, NFR-0009, AC-US-0005-04, AC-US-0005-05]
---

# SCR-0002 — Resultado da volta e texto compartilhado com a versão do acerto

## Propósito

O que esta feature acrescenta à tela de resultado e ao texto compartilhado: a versão do acerto que
produziu o tempo, e a regra de que um tempo só é comparado com outro de versão igual (AC-US-0005-05). A tela
de resultado da volta (tempo total, setores, validade) é da feature `race-lap-validation`, nomeada e não
redefinida; este arquivo especifica apenas o acréscimo. A decisão de comparabilidade é da simulação e do
leitor de registros ([RULE-0003](../rules/RULE-0003-versao-do-acerto-e-comparabilidade.md)); a tela só
exibe o resultado dela (I2).

## Canal

Ambos, sem diferença: mesma regra de comparabilidade, mesma `setupVersion` em texto. A tela usa
[API-0002](../api/API-0002-versao-do-acerto.md) (`compareLapRecords`, `readReplay`, `getSetupVersion`).

## Pontos de entrada

Ao fim da volta, a partir de [SCR-0001](SCR-0001-hud-de-velocidade-e-aderencia.md); ao abrir um tempo ou
replay gravado; ao compartilhar um resultado.

## Estados

| Estado | Condição | Chamadas | O que a tela mostra | Fonte |
|---|---|---|---|---|
| Carregando | O resultado ou o registro gravado ainda está sendo lido | `readReplay`, `getSetupVersion` | Nenhum tempo comparado ainda; nenhuma `setupVersion` exibida até a leitura concluir | API-0002 |
| Vazio | Não há resultado (volta sem resultado) ou nenhum registro gravado para comparar | `readReplay` retorna `UNREADABLE` por ausência | O tempo corrente, se houver, com a sua `setupVersion` em texto; nenhuma comparação | AC-US-0005-04 |
| Populado | Resultado lido; registros para comparar lidos | `compareLapRecords` para cada par exibido | O tempo corrente com `setupVersion` em texto; `COMPARABLE`: comparação (diferença, melhor tempo, ordenação) exibida; `SETUP_VERSION_DIFFERS`, `SETUP_DIFFERS`, `TRACK_DIFFERS`: nenhuma comparação; se o outro tempo é listado, leva a sua própria `setupVersion` em texto ao lado | AC-US-0005-05 |
| Erro | `UNSUPPORTED_FORMAT` ou `INCOMPLETE_RECORD` | `readReplay`, `compareLapRecords` | O registro não é comparado nem descartado; o tempo corrente é exibido com a sua `setupVersion`; nenhuma comparação com o registro em erro | API-0002 (I4) |
| Offline | Sem rede | nenhuma chamada de rede | Nenhuma diferença: registros e dado publicado são locais; nenhum aviso de rede | RNF08, D-FS-08 |
| Permissão negada | `web-mobile` com sensor ausente ou permissão negada | nenhuma | Não se aplica à tela: ela não usa o sensor; o resultado e a comparação não mudam | US-0005, Canais |
| Permissão negada em `web-desktop` | Não se aplica | — | O canal não pede sensor | US-0005, Canais |

O texto compartilhado carrega a `setupVersion` em texto ao lado do tempo (API-0002) e nunca contém
comparação entre tempos de versões diferentes (AC-US-0005-05). Nenhum texto novo de rótulo é fixado por
esta feature além do identificador da versão, que é o próprio valor de `setupVersion`.

## Ações do Jogador

| Ação | Canal | Resultado |
|---|---|---|
| Abrir um tempo ou replay gravado | ambos | `readReplay`; estado Populado, Vazio ou Erro |
| Compartilhar o resultado | ambos | Texto compartilhado com o tempo e a sua `setupVersion`; sem comparação entre versões diferentes |
| Reproduzir um replay | ambos | [FLOW-0003](../flows/FLOW-0003-leitura-de-replay-e-comparacao.md); o tempo obtido de um replay de outra versão nunca é apresentado como equivalente ao gravado |

## Navegação

Entrada a partir do fim da volta ([SCR-0001](SCR-0001-hud-de-velocidade-e-aderencia.md)) ou da abertura de
um registro gravado; a saída é a da tela de resultado de `race-lap-validation`, inalterada.
