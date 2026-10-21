---
id: API-0001
title: Contrato da telemetria de dirigibilidade por passo
feature: dirigibilidade
stage: fspec
status: validated
version: 1.0.0
sources: [US-0001, US-0002, US-0003, US-0004, NFR-0005, NFR-0006, AC-US-0001-01, AC-US-0001-02, AC-US-0002-01, AC-US-0003-01, AC-US-0003-02, AC-US-0003-03, AC-US-0003-04, AC-US-0004-03, AC-US-0004-05, AC-US-0004-06]
---

# API-0001 — Contrato da telemetria de dirigibilidade por passo

Contrato único entre a simulação e quem a lê: os ensaios (`npm test`, benches) e a apresentação (HUD),
em `web-desktop` e `web-mobile`. É um contrato em processo, dentro do navegador e nos ensaios: não há
endpoint de rede, caminho HTTP nem prefixo no MVP (diretrizes do estágio). Nomes em `camelCase` plano com
a unidade no sufixo (D-FS-06): `Mps` metros por segundo, `Rad` radianos, `RadPerS` radianos por segundo,
`Count` contagem. Os campos existentes do estado da volta (fase, validade, tempos, setores) são do
contrato de resultado e estado da volta da feature `race-lap-validation`, nomeado e não redefinido aqui.

## Operações

| Operação | Propósito | Quem chama |
|---|---|---|
| `getHandlingTelemetry` | Lê a telemetria de dirigibilidade do estado corrente da simulação | HUD, em todos os quadros do sinal verde ao fim da volta (AC-US-0004-06); ensaios, em todos os passos |

## Auth

Sem sessão e sem conta (RNF10). Papel permitido: `player` (anônimo), único papel do produto. Contrato
deliberadamente público dentro do cliente: não há segredo a proteger e a leitura não altera estado.

## Parâmetros

Nenhum parâmetro de caminho ou de consulta. A operação lê o estado corrente; nos ensaios, o estado após o
passo em questão.

## Resposta de `getHandlingTelemetry`

| Campo | Tipo | Unidade | Obrigatório | Padrão e restrições |
|---|---|---|---|---|
| `simStepCount` | inteiro | passos | sim | 0 no estado inicial; incrementa 1 por passo de `STEP`; contador de sequência; não avança na suspensão |
| `setupId` | enum `ARCADE_ASSISTIDO`, `REALISTA_ALUGUEL_4T` | — | sim | acerto em uso ([RULE-0003](../rules/RULE-0003-versao-do-acerto-e-comparabilidade.md)) |
| `setupVersion` | texto | — | sim | versão corrente do acerto em uso ([API-0002](API-0002-versao-do-acerto.md)) |
| `speedMps` | número | m/s | sim | 0 ou maior; a apresentação converte para km/h para o HUD (AC-US-0004-06); os ensaios reportam em km/h ([API-0003](API-0003-saida-dos-ensaios.md)) |
| `handling` | enum `grip`, `understeer`, `oversteer`, `sliding` | — | sim | estado de aderência ([RULE-0001](../rules/RULE-0001-estado-de-aderencia-e-condicao-de-forcar.md)); `grip` no estado inicial |
| `sideslipRad` | número | rad | sim | derrapagem lateral, em módulo; 0 no estado inicial |
| `yawRateRadPerS` | número | rad/s | sim | taxa de guinada, com sinal; 0 no estado inicial |
| `surface` | enum `ASPHALT`, `GRASS` | — | sim | superfície sob o kart neste passo; `GRASS` é "fora do asfalto" |
| `wallContact` | booleano | — | sim | `true` só no passo em que o kart entra em contato com a parede (AC-US-0004-05); `false` no estado inicial |
| `forcing` | booleano | — | sim | condição de forçar mantida neste passo ([RULE-0001](../rules/RULE-0001-estado-de-aderencia-e-condicao-de-forcar.md)); `false` no estado inicial |
| `driftActive` | booleano | — | sim | manobra de drift de `requirements/11` em andamento; `false` no estado inicial |

Todos os campos são obrigatórios e nenhum tem padrão que mude comportamento: a telemetria é leitura do
estado e acrescentá-la não altera nenhum passo da simulação (I4). Nenhum campo carrega dado pessoal (I6).

Resposta na forma vazia: antes de existir estado de simulação (nenhuma volta nem ensaio iniciado) a
operação retorna `NO_STATE` e nenhum campo.

## Erros

Não há status HTTP. A operação retorna o código abaixo, sem lançar nem alterar estado:

| Código | Condição | Corpo |
|---|---|---|
| `NO_STATE` | nenhum estado de simulação existe ainda | apenas o código |

## Idempotência

Leitura pura: repetir a chamada devolve o mesmo valor enquanto a simulação não avança, e não altera estado.
Não há chave. Um valor por passo, ordenado por `simStepCount`; a suspensão (pausa, perda de foco, perda do
sensor) não avança o contador e a leitura devolve o último passo.

## Paginação e sondagem

Sem paginação. O HUD lê em todos os quadros renderizados entre o sinal verde e o fim da volta
(AC-US-0004-06); os ensaios leem a cada passo de `STEP`. Não há intervalo de sondagem de rede.

## Compatibilidade

| Mudança | Tratamento |
|---|---|
| Contrato novo de leitura | Nenhum campo, caminho ou parâmetro publicado é renomeado ou removido. O estado da simulação já expõe velocidade, estado de aderência, derrapagem lateral e taxa de guinada ao HUD (glossário dos requisitos, "Telemetria"); este contrato os nomeia com a unidade no sufixo e acrescenta `surface`, `wallContact`, `forcing`, `driftActive`, `setupId` e `setupVersion`, todos aditivos |
| `STEP`, taxa do solver, campos e faixas de `Input` | Inalterados (NFR-0006): este contrato só lê o estado, não muda `step(state, input, dt)` (I8) |
| Significado ou unidade de um campo | Nunca muda sob o mesmo nome; uma mudança futura exige nome novo (I3) |
