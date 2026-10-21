---
id: API-0001
title: Contrato do resultado e do estado da volta
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: [US-0002, US-0004, US-0008, US-0009, AC-US-0002-04, AC-US-0002-05, AC-US-0002-11, AC-US-0002-12, AC-US-0004-03, AC-US-0008-02, AC-US-0008-05, AC-US-0009-01, NFR-0004, NFR-0005]
---

# API-0001 — Contrato do resultado e do estado da volta

Contrato único entre a simulação e a apresentação (`web-desktop` e `web-mobile`). É um contrato em processo,
dentro do navegador: não há endpoint de rede, caminho HTTP nem prefixo no MVP (diretrizes do estágio; o
prefixo `/challenges/{challengeNumber}` é proposta pós-MVP e não se aplica). Os nomes seguem a diretriz D-FS-06
do projeto: `camelCase` plano, com a unidade como sufixo (`Ms`, `M`, `Count`, `Mps`), no lugar de `snake_case`.

## Operações

| Operação | Propósito | Quem chama |
|---|---|---|
| `getLapState` | Lê o estado corrente da volta para exibição | Apresentação, em todos os quadros do sinal verde ao fim (AC-US-0009-01) |
| `getLapResult` | Lê o resultado da volta encerrada | Apresentação, ao encerrar a volta; testes de `npm test` |

## Auth

Sem sessão e sem conta (RNF10). Papel permitido: `player` (anônimo), único papel do produto. Contrato
deliberadamente público dentro do cliente: não existe segredo a proteger e a leitura não altera estado.

## Parâmetros

Nenhum parâmetro de caminho ou de consulta.

## Resposta de `getLapState`

| Campo | Tipo | Unidade | Obrigatório | Padrão e restrições |
|---|---|---|---|---|
| `lapPhase` | enum `COUNTDOWN`, `RUNNING`, `PAUSED`, `ENDED` | — | sim | sem padrão; ver [RULE-0002](../rules/RULE-0002-estados-da-volta.md) |
| `resumePhase` | enum `COUNTDOWN`, `RUNNING` | — | só com `lapPhase` `PAUSED` | ausente nos demais casos |
| `pauseCause` | enum `ESC_KEY`, `FOCUS_LOST`, `SENSOR_LOST` | — | só com `lapPhase` `PAUSED` | ausente nos demais casos |
| `lapKind` | enum `OFFICIAL`, `RECON`, `TRAINING` | — | sim | fixado em `startLap` |
| `lapValidity` | enum `VALID`, `INVALID` | — | sim | `VALID` até a primeira invalidação |
| `invalidReason` | enum `MISSED_MARKER`, `CUT`, `REPOSITION` | — | só com `lapValidity` `INVALID` | ausente com `VALID` |
| `countdownRemainingMs` | inteiro | ms | sim | de 3000 a 0; 0 depois do sinal verde |
| `elapsedMs` | inteiro | ms | sim | 0 na contagem; N × `STEP` convertido em ms após N passos do sinal verde; congela na pausa e no fim |
| `stepCount` | inteiro | passos | sim | 0 na contagem; contador de sequência da volta |
| `completedSectorMs` | lista de 0 a 4 inteiros | ms | sim | tempos dos setores já completados, em ordem; lista vazia antes do primeiro limite |
| `markersPassedCount` | inteiro | marcadores | sim | de 0 ao total de marcadores da pista |
| `trackId` | texto | — | sim | copiado do dado da pista lido ([API-0003](API-0003-dado-de-pista.md)) |
| `trackVersion` | valor do dado da pista | — | sim | copiado do dado da pista lido, sem interpretação |

O estado exibido na tela é derivado destes campos: `lapValidity` e `invalidReason` dão o estado e o motivo
([RULE-0006](../rules/RULE-0006-mensagens-de-estado-e-motivo.md)).

Resposta quando não há volta (nenhum `startLap` aceito): a operação retorna `NO_ACTIVE_LAP` e nenhum campo
de estado (ver Erros).

## Resposta de `getLapResult`

Existe um resultado se, e somente se, a volta chegou a `ENDED` (conclusão ou invalidação). Uma volta
cruzada na contramão, recarregada ou abandonada não tem resultado.

| Campo | Tipo | Unidade | Obrigatório | Padrão e restrições |
|---|---|---|---|---|
| `trackId` | texto | — | sim | identifica a pista (AC-US-0002-11) |
| `trackVersion` | valor do dado da pista | — | sim | identifica a versão da pista (AC-US-0002-11) |
| `challengeNumber` | inteiro | — | não | padrão: ausente. Copiado do pedido `startLap` quando o desafio diário o informa; esta feature não o deriva. Neutro: ausente não muda nenhum comportamento da volta (I1; `SEED/IM-I1`) |
| `lapKind` | enum `OFFICIAL`, `RECON`, `TRAINING` | — | sim | |
| `lapValidity` | enum `VALID`, `INVALID` | — | sim | |
| `invalidReason` | enum `MISSED_MARKER`, `CUT`, `REPOSITION` | — | só com `INVALID` | |
| `official` | booleano | — | sim | `true` somente em volta `OFFICIAL`, `VALID`, concluída e em pista de dado `COMPLETE` ([RULE-0005](../rules/RULE-0005-tipos-de-volta-e-reposicionamento.md)); `false` nos demais casos (AC-US-0008-02, AC-US-0008-05) |
| `lapMs` | inteiro | ms | só com `VALID` | tempo total; ausente com `INVALID` (AC-US-0004-03) |
| `sectorMs` | lista de exatamente 4 inteiros | ms | só com `VALID` | soma igual a `lapMs`, diferença de 0 ms (AC-US-0002-05); ausente com `INVALID` |

Todos os valores de tempo são milissegundos inteiros (AC-US-0002-04). A forma na resposta vazia: sem
resultado, a operação retorna `NO_RESULT` e nenhum campo.

Nenhum campo do resultado carrega dado pessoal (NFR-0005).

## Erros

Não há status HTTP. Cada operação retorna um destes resultados de rejeição, sem lançar nem alterar estado:

| Código | Operação | Condição | Corpo |
|---|---|---|---|
| `NO_ACTIVE_LAP` | `getLapState` | nenhuma volta foi aceita ainda | apenas o código |
| `NO_RESULT` | `getLapResult` | a volta não chegou a `ENDED`, ou não há volta | apenas o código |

## Idempotência

As duas operações são leituras: repetir a chamada devolve o mesmo valor enquanto o estado da simulação não
avança, e não altera estado. Não há chave. Exatamente 1 resultado por volta: depois de `ENDED` o resultado
não muda, mesmo que a chegada seja cruzada de novo (AC-US-0002-12; I7).

## Paginação e sondagem

Sem paginação. A apresentação lê `getLapState` em todos os quadros renderizados durante `COUNTDOWN`,
`RUNNING`, `PAUSED` e `ENDED` (AC-US-0009-01); não há intervalo de sondagem de rede.

## Compatibilidade

Contrato novo: nenhum campo, caminho ou parâmetro publicado é renomeado ou removido por ele. A validação
preliminar por gates sequenciais do protótipo é aposentada e substituída por este contrato e por
[API-0002](API-0002-comandos-da-volta.md); os requisitos não nomeiam campo publicado dessa validação, então
não há campo a rejeitar. Os campos de unidade carregam o sufixo no nome (`Ms`), e o significado de nenhum
deles muda em versões futuras sem mudança de nome (I3).
