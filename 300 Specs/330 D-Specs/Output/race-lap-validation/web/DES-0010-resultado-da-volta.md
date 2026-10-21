---
id: DES-0010
title: Tela de resultado da volta
feature: race-lap-validation
stage: dspec
status: validated
version: 1.0.0
sources: [FEAT-0002, FEAT-0004, FEAT-0006, REQ-FEAT-0002-02, REQ-FEAT-0002-03, REQ-FEAT-0002-06, REQ-FEAT-0004-03, REQ-FEAT-0006-07]
---

# DES-0010 — Tela de resultado da volta

## Realiza

Os `REQ-*` em `sources`: exibir a volta como válida com o tempo total e os quatro tempos de setor (AC-US-0002-01
a -03), no formato `m:ss.mmm` (AC-US-0002-06); identificar em texto como "não oficial" o tempo de uma volta de
reconhecimento, de treino ou de pista de dado incompleto (AC-US-0008-01); não exibir tempo oficial numa volta inválida
e exibir o motivo (AC-US-0004-03, -04). Tela: SCR-0003.

## Posicionamento

`index.html`, `src/style.css` e `src/main.ts`, camada **aplicação**: um painel `#lap-result` dentro de
`.game-shell`. Sem módulo novo; os textos e o formato vêm de `src/lapMessages.ts`
([DES-0008](DES-0008-hud-da-volta-mensagens-e-idioma.md)). A tela só exibe o `LapResult` produzido pela simulação.

## Interface

O painel aparece quando `lapPhase` chega a `ENDED`, no quadro do encerramento, lendo `getLapResult` (sem espera,
sem rede). Estados:

| Estado | Condição | Conteúdo |
|---|---|---|
| Válida oficial | `lapValidity` `VALID` e `official` verdadeiro | `lapResultValid`; `totalLabel` com `formatLapTime(lapMs)`; os quatro `sectorLabel` n com `formatLapTime(sectorMs[n-1])` |
| Válida não oficial | `VALID` e `official` falso | o mesmo, mais `lapUnofficial` ao lado do tempo total |
| Inválida | `INVALID` | `lapStateInvalid` e o texto do motivo; nenhum tempo total, nenhum tempo de setor, nenhum tempo oficial |
| Vazio | `getLapResult` devolve `NO_RESULT` (volta na contramão, recarregada ou abandonada) | o painel não é exibido |
| Erro | volta `ENDED` sem resultado (defesa que não deve ocorrer) | o painel não é exibido e nenhuma mensagem própria é definida |
| Offline | sem rede | idêntico ao online |
| Permissão negada | não se aplica | — |

Ações: um botão `newLap` que leva à oferta ([DES-0009](DES-0009-inicio-de-volta-e-erros.md)). Esta feature não
oferece compartilhar, gravar nem consumir tentativa (pertencem ao desafio diário). O texto de estado e de motivo
usa as mesmas fichas e tamanhos de DES-0008 (4,5:1; 16 px no mínimo); o painel tem fundo opaco, de modo que o fundo
imediato é determinado.

O tempo total e os de setor exibidos são a conversão direta dos inteiros do resultado; a exibição não
arredonda e a igualdade entre execuções é verificada no resultado em ms, e não no texto (RULE-0003).

## Colaboradores

Chama `getLapResult` (`src/lap.ts`), `formatLapTime` e `message` (`src/lapMessages.ts`). Chamado por
`src/main.ts`.

## Estado e concorrência

Sem estado próprio. O resultado é lido, nunca gravado: nada é persistido no navegador por esta feature
(REQ-FEAT-0009-11). Ler duas vezes dá o mesmo valor, pois o resultado não muda depois de `ENDED`.

## Comportamento em falha

Sem dependência. Resultado ausente com a volta encerrada: o painel não aparece e nada é registrado.

## Determinismo (D-DS-07)

Exibição pura de um inteiro. Provas: `tests/lap-messages.test.ts` (formato dos tempos, texto "não oficial" por
`official`) e `tests/lap-state.test.ts` (resultado `VALID` com quatro setores e soma igual ao total; resultado
`INVALID` sem tempos).

## Feature flag

Nenhuma: FEAT-0002 não tem chave.

## Pontos em aberto

Nenhum.
