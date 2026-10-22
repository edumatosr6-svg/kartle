---
id: API-0003
title: Contrato do contato do kart com a pista — superfície por roda, borda da pista e barreira
feature: pista-kart-park
stage: fspec
status: validated
version: 1.0.0
sources: [US-0003, US-0004, US-0005, NFR-0007, NFR-0008, AC-US-0003-07, AC-US-0003-08, AC-US-0004-04, AC-US-0004-05, AC-US-0005-04, AC-US-0005-05, AC-US-0005-06, AC-US-0005-07, AC-US-0005-08, AC-US-0005-09, AC-US-0005-10]
---

# API-0003 — Contrato do contato do kart com a pista: superfície por roda, borda da pista e barreira

Contrato único entre a simulação e quem a lê: os ensaios (`npm test`) e a apresentação (retorno da zebra),
em `web-desktop` e `web-mobile`. É contrato em processo, dentro do navegador e nos ensaios: não há endpoint
de rede, caminho HTTP nem prefixo no MVP (diretrizes do estágio). Nomes em `camelCase` plano com a unidade
no sufixo (D-FS-06): `M` metros, `Count` contagem, `Pc` fração de 0 a 1. A telemetria de dirigibilidade
(`getHandlingTelemetry`, com `simStepCount`, `surface` e `wallContact`) é de `dirigibilidade`, nomeada e não
redefinida.

## Operações

| Operação | Propósito | Quem chama |
|---|---|---|
| `getTrackContact` | Lê, do estado corrente da simulação, a superfície sob cada roda, a aderência de cada roda, a distância além da borda da pista e o contato com barreira | Apresentação, a cada passo avançado, para o retorno da zebra ([RULE-0004](../rules/RULE-0004-retorno-da-zebra.md)); ensaios, a cada passo |

## Auth

Sem sessão e sem conta (RNF10). Papel permitido: `player` (anônimo). Contrato público dentro do cliente:
não há segredo, e a leitura não altera estado.

## Parâmetros

Nenhum parâmetro de caminho ou de consulta. A operação lê o estado corrente; nos ensaios, o estado após o
passo em questão.

## Resposta de `getTrackContact`

| Campo | Tipo | Unidade | Obrigatório | Padrão e restrições |
|---|---|---|---|---|
| `simStepCount` | inteiro | passos | sim | o mesmo contador de `getHandlingTelemetry` de `dirigibilidade`, no mesmo passo; não avança na suspensão |
| `wheelSurfaces` | lista de exatamente 4 enum `ASPHALT`, `CURB`, `GRASS` | — | sim | ordem: dianteira esquerda, dianteira direita, traseira esquerda, traseira direita; decisão de [RULE-0001](../rules/RULE-0001-superficie-borda-da-pista-e-obstaculos.md). Na pista sintética, que não tem zebra, nunca `CURB` |
| `curbWheelCount` | inteiro | rodas (`Count`) | sim | número de `CURB` em `wheelSurfaces`, de 0 a 4 |
| `wheelGripPc` | lista de exatamente 4 números | fração | sim | na mesma ordem: 1 para `ASPHALT`; 0,85 para `CURB` (AC-US-0005-06); para `GRASS`, a fração da regra da grama existente, sem mudança por esta feature |
| `beyondTrackEdgeM` | número | m | sim | 0 ou maior: distância da posição do kart além da borda da pista (asfalto ou zebra); 0 sobre a pista. É a distância que a regra de corte de `race-lap-validation` compara com `cutDistanceM` |
| `barrierContact` | booleano | — | sim | `true` só no passo em que o kart entra em contato com uma barreira (AC-US-0004-05); `false` no estado inicial e sempre na pista sintética, que não tem barreira |

Todos os campos são leitura do estado; acrescentá-los não muda nenhum passo da simulação (I4). Nenhum campo
carrega dado pessoal (I6).

Forma vazia: antes de existir estado de simulação (nenhuma sessão pronta), a operação retorna `NO_STATE` e
nenhum campo.

## Erros

Não há status HTTP. A operação retorna o código abaixo, sem lançar nem alterar estado:

| Código | Condição | Corpo |
|---|---|---|
| `NO_STATE` | nenhum estado de simulação existe ainda | apenas o código |

## Idempotência

Leitura pura: repetir a chamada devolve o mesmo valor enquanto a simulação não avança, e não altera estado.
Não há chave. Um valor por passo, ordenado por `simStepCount`; a apresentação usa `simStepCount` para não
tratar duas vezes o mesmo passo no retorno da zebra ([RULE-0004](../rules/RULE-0004-retorno-da-zebra.md)).

## Paginação e sondagem

Sem paginação. A apresentação lê a cada passo avançado da simulação; os ensaios, a cada passo de `STEP`.
Não há intervalo de sondagem de rede.

## Compatibilidade

| Mudança | Tratamento |
|---|---|
| Contrato novo de leitura | Nenhum campo, operação ou parâmetro publicado é renomeado ou removido |
| `surface` e `wallContact` de `dirigibilidade` | Nome, valores e significado inalterados; esta feature não os lê para nenhuma regra e não lhes acrescenta valor. A superfície por roda com a zebra é `wheelSurfaces`; o contato com a barreira é `barrierContact` |
| Regra de corte de `race-lap-validation` | Inalterada; a distância que ela compara é medida da borda da pista, que passa a incluir a zebra onde há zebra ([RULE-0001](../rules/RULE-0001-superficie-borda-da-pista-e-obstaculos.md)); na pista sintética, sem zebra, a borda é a de antes |
| `STEP`, `step(state, input, dt)`, campos de `Input` | Inalterados (NFR-0008): este contrato só lê o estado |
| Significado ou unidade de um campo | Nunca muda sob o mesmo nome; uma mudança futura exige nome novo (I3) |
