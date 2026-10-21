---
id: SCR-0003
title: Resultado da volta
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.1
sources: [US-0002, US-0004, US-0008, AC-US-0002-01, AC-US-0002-02, AC-US-0002-03, AC-US-0002-06, AC-US-0004-03, AC-US-0004-04, AC-US-0008-01, NFR-0004, NFR-0005]
---

# SCR-0003 — Resultado da volta

## Propósito

Mostra o fim da volta: válida com tempo total e quatro tempos de setor, válida e não oficial, ou inválida
com o motivo e sem tempo. O resultado é produzido pela simulação ([API-0001](../api/API-0001-resultado-e-estado-da-volta.md));
a tela só o exibe. Esta feature não grava o resultado nem o associa a tentativa: isso é do desafio diário
(etapa 5, fora do escopo).

## Canal

Ambos, com o mesmo conteúdo e o mesmo formato `m:ss.mmm` (RULE-0003). Em `web-mobile` o texto de estado e de
motivo tem no mínimo 16 px.

## Pontos de entrada

Quando `lapPhase` chega a `ENDED` em [SCR-0001](SCR-0001-corrida-hud-da-volta.md).

## Estados

| Estado | Condição | Chamadas | O que a tela mostra | Fonte |
|---|---|---|---|---|
| Carregando | `ENDED` já ocorreu e o resultado é lido no mesmo quadro | `getLapResult` | Nenhum estado visível: o resultado existe no quadro do encerramento (sem rede, sem espera) | NFR-0004 |
| Vazio | Não há volta encerrada | `getLapResult` retorna `NO_RESULT` | A tela não é exibida; a volta cruzada na contramão, recarregada ou abandonada não tem resultado | AC-US-0005-02 |
| Válida oficial | `VALID`, `official` verdadeiro | `getLapResult` | "válida"; tempo total e quatro tempos de setor em `m:ss.mmm` | AC-US-0002-01 a AC-US-0002-03, AC-US-0002-06 |
| Válida não oficial | `VALID`, `official` falso (reconhecimento, treino ou pista de dado incompleto) | `getLapResult` | "válida"; tempo total e quatro tempos de setor em `m:ss.mmm`, identificados em texto como "não oficial" | AC-US-0008-01 |
| Inválida | `INVALID` | `getLapResult` | "inválida" e o motivo; nenhum tempo total, nenhum tempo de setor, nenhum tempo oficial | AC-US-0004-03, AC-US-0004-04 |
| Erro | Resultado ausente com a volta `ENDED` | `getLapResult` | A tela não é exibida e nenhuma mensagem própria é definida; defesa que não deve ocorrer | API-0001 |
| Offline | Sem rede | nenhuma chamada de rede | Idêntico ao estado online; a tela não pede rede (0 requisições com dados da volta) | NFR-0004, NFR-0005 |
| Permissão negada | Não se aplica | — | O resultado não depende de permissão nem de sensor | — |

Todo texto de estado e de motivo está nos dois idiomas, conforme o idioma do navegador
([RULE-0006](../rules/RULE-0006-mensagens-de-estado-e-motivo.md)).

## Ações do Jogador

Esta feature não define ação nesta tela além de sair dela: iniciar outra volta volta a
[SCR-0002](SCR-0002-inicio-de-volta.md). O que se faz com o resultado (compartilhar, gravar, consumir
tentativa) é do desafio diário.

## Navegação

Entrada por [SCR-0001](SCR-0001-corrida-hud-da-volta.md). Saída para [SCR-0002](SCR-0002-inicio-de-volta.md).
