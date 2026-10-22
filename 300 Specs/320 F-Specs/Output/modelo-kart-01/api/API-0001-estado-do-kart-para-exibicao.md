---
id: API-0001
title: Contrato do estado do kart para exibição
feature: modelo-kart-01
stage: fspec
status: draft
version: 1.0.0
sources: [US-0002, US-0003, US-0005, NFR-0005, NFR-0006, AC-US-0002-01, AC-US-0002-02, AC-US-0002-05, AC-US-0002-06, AC-US-0003-02, AC-US-0003-03, AC-US-0003-07, AC-US-0005-01]
---

# API-0001 — Contrato do estado do kart para exibição

Contrato único entre a simulação e a apresentação desta feature, em `web-desktop` e `web-mobile`: o que a
apresentação lê, a cada quadro, para pôr o Kart 01 na posição e no rumo da simulação, esterçar e girar as
rodas, apontar a câmera e prender os efeitos. É um contrato em processo, dentro do navegador e na saída de
`npm test`: não há endpoint de rede, caminho HTTP nem prefixo no MVP (diretrizes do estágio). Nomes em
`camelCase` plano com a unidade no sufixo (D-FS-06): `M` metros, `Rad` radianos, `Mps` metros por segundo.

A leitura usa só o que o estado da simulação já expõe: o contrato não acrescenta campo ao estado da
simulação, não muda o passo e não muda `wheelPositions` (NFR-0006, NFR-0007). A telemetria de dirigibilidade
(`getHandlingTelemetry`, feature `dirigibilidade`) e o estado da volta (`getLapState`, feature
`race-lap-validation`) são nomeados e não redefinidos.

## Operações

| Operação | Propósito | Quem chama |
|---|---|---|
| `getKartPose` | Lê a pose, o esterço e a velocidade de rolamento do kart no estado corrente da simulação | Apresentação, em todos os quadros em que a cena é desenhada (AC-US-0002-01, AC-US-0002-05, AC-US-0002-06); regra da câmera ([RULE-0002](../rules/RULE-0002-camera-de-jogo.md)); verificações de `npm test` ([API-0002](API-0002-relatorio-do-modelo-montado.md), `WHEEL_SPIN`) |

## Auth

Sem sessão e sem conta (RNF10). Papel permitido: `player` (anônimo), único papel do produto. Contrato
deliberadamente público dentro do cliente: não há segredo a proteger e a leitura não altera estado.

## Parâmetros

Nenhum parâmetro de caminho ou de consulta. A operação lê o estado corrente da simulação: o do último passo
de `STEP` concluído.

## Resposta de `getKartPose`

| Campo | Tipo | Unidade | Obrigatório | Padrão e restrições |
|---|---|---|---|---|
| `simStepCount` | inteiro | passos | sim | passos de `STEP` desde o estado inicial da simulação; 0 no estado inicial; incrementa 1 por passo; não avança na suspensão; contador de sequência; mesmo significado que na telemetria de dirigibilidade |
| `xM` | número | m | sim | coordenada da posição do kart no chão, no referencial da pista, como a simulação a informa |
| `zM` | número | m | sim | a outra coordenada da posição do kart no chão, no mesmo referencial |
| `headingRad` | número | rad | sim | rumo do kart, na convenção de ângulo da simulação |
| `steerAngleRad` | número | rad | sim | ângulo de esterço das rodas dianteiras em relação ao chassi que a simulação informa, já limitado à faixa da simulação (I4); 0 com as rodas alinhadas; o sinal segue a convenção da simulação |
| `rollingSpeedMps` | número | m/s | sim | velocidade do kart em módulo, com sinal negativo quando o movimento é para trás em relação ao rumo; em derrapagem continua sendo a velocidade do kart, sem escorregamento por roda; 0 com o kart parado |

Todos os campos são obrigatórios e nenhum tem padrão que mude comportamento: a leitura não altera nenhum
passo da simulação e acrescentá-la não muda o estado (I4, NFR-0005). Nenhum campo carrega dado pessoal (I6).

Resposta na forma vazia: antes de existir estado de simulação (nenhuma volta iniciada e nenhum kart em cena)
a operação retorna `NO_STATE` e nenhum campo.

## Erros

Não há status HTTP. A operação retorna o código abaixo, sem lançar nem alterar estado:

| Código | Condição | Corpo |
|---|---|---|
| `NO_STATE` | nenhum estado de simulação existe ainda | apenas o código |

## Idempotência

Leitura pura: repetir a chamada devolve o mesmo valor enquanto a simulação não avança e não altera estado.
Não há chave. Um valor por passo, ordenado por `simStepCount`; na suspensão o contador não avança e a leitura
devolve o último passo. Vários passos entre dois quadros: a leitura devolve o último; nenhum passo
intermediário é estimado.

## Paginação e sondagem

Sem paginação. A apresentação lê uma vez por quadro desenhado; as verificações de `npm test` leem a cada
passo de `STEP`. Não há intervalo de sondagem de rede.

## Compatibilidade

| Mudança | Tratamento |
|---|---|
| Contrato novo de leitura | Nenhum campo, caminho ou parâmetro publicado é renomeado ou removido. Os campos nomeiam, com a unidade no sufixo, o que a simulação já informa à apresentação (posição, rumo, esterço, velocidade) |
| `rollingSpeedMps` | Nome novo, porque tem sinal; `speedMps` da telemetria de dirigibilidade (0 ou maior) mantém o seu significado (I3) |
| `xM`, `zM` | Mesmo referencial e mesma unidade das coordenadas `xM`, `zM` já usadas pelo dado de pista para a posição de largada |
| `STEP`, campos e faixas de `Input`, `wheelPositions` | Inalterados (NFR-0006, NFR-0007): este contrato só lê o estado e não muda `step(state, input, dt)` (I8) |
| Significado ou unidade de um campo | Nunca muda sob o mesmo nome; uma mudança futura exige nome novo (I3) |
