---
id: SCR-0002
title: Início de volta e oferta de tipo de volta
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: [US-0008, NFR-0012, AC-US-0008-03, AC-US-0008-04, AC-US-0008-05]
---

# SCR-0002 — Início de volta e oferta de tipo de volta

## Propósito

Ponto em que o Jogador escolhe iniciar uma volta. Esta feature só restringe o que é oferecido: numa pista de
dado incompleto não há opção de volta oficial e há volta de treino (`DOMAIN/DEC-10`). Quem define quando uma
volta oficial existe, e as opções de reconhecimento e de treino fora desta restrição, são do desafio diário
(etapa 5, fora do escopo).

## Canal

Ambos, com o mesmo conteúdo. Em `web-mobile` a ação é por toque; em `web-desktop`, por teclado ou ponteiro.

## Pontos de entrada

Abertura da pista no jogo, após a leitura do dado ([API-0003](../api/API-0003-dado-de-pista.md)).

## Estados

| Estado | Condição | Chamadas | O que a tela mostra | Fonte |
|---|---|---|---|---|
| Carregando | O dado da pista está sendo lido | `readTrackData` | Texto de carregamento; nenhuma opção de volta | FLOW-0004 |
| Vazio | Nenhuma pista carregada | `readTrackData` retorna `UNREADABLE` | Texto "nenhuma pista disponível" nos dois idiomas; nenhuma opção de volta | API-0003 |
| Completo | `trackDataStatus` `COMPLETE` | `readTrackData` | Opção de volta de treino; opção de volta oficial apenas quando o desafio diário a define | AC-US-0008-04; `DOMAIN/DEC-10` |
| Incompleto | `trackDataStatus` `INCOMPLETE` | `readTrackData` | Nenhuma opção de volta oficial; opção de volta de treino, pilotável | AC-US-0008-03, AC-US-0008-04 |
| Erro | `UNSUPPORTED_SCHEMA` ou `UNREADABLE` | `readTrackData` | Mensagem de erro em texto; nenhuma opção de volta; o dado de versão desconhecida fica intacto | API-0003 |
| Permissão negada | `web-mobile` sem sensor ou com permissão negada | nenhuma | Aviso em texto de que o controle será por toque; as opções de volta continuam | I4 |
| Offline | Sem rede | nenhuma chamada de rede | Idêntico ao estado online | NFR-0004 |

Em `web-desktop` o estado Permissão negada não se aplica: o canal usa teclado.

## Ações do Jogador

| Ação | Resultado |
|---|---|
| Escolher volta de treino | `startLap` `TRAINING`; segue para [SCR-0001](SCR-0001-corrida-hud-da-volta.md) |
| Escolher volta oficial (quando oferecida) | `startLap` `OFFICIAL`; em pista `INCOMPLETE` a simulação rejeita com `OFFICIAL_NOT_AVAILABLE` e a tela não deve ter oferecido a opção |
| Escolher de novo enquanto a volta está ativa | `LAP_ALREADY_ACTIVE`: sem efeito |

## Navegação

Sai para [SCR-0001](SCR-0001-corrida-hud-da-volta.md) quando `startLap` é aceito. Todo resultado de uma pista
incompleta aparece como não oficial em [SCR-0003](SCR-0003-resultado-da-volta.md) (AC-US-0008-05).
