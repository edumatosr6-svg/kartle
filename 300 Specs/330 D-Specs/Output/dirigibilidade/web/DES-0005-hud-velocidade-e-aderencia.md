---
id: DES-0005
title: HUD de velocidade e estado de aderência
feature: dirigibilidade
stage: dspec
status: validated
version: 1.0.1
sources: [SCR-0001, FLOW-0001, API-0001, FEAT-0004, FEAT-0006, REQ-FEAT-0004-06, REQ-FEAT-0004-09, REQ-FEAT-0006-01]
---

# DES-0005 — HUD de velocidade e estado de aderência

## Realiza

Os `REQ-*` em `sources`: velocidade em km/h e estado de aderência em texto em todos os quadros entre o
sinal verde e o fim da volta, nos dois canais, sem remover nem ocultar os dois elementos (AC-US-0004-06);
último valor mantido na suspensão (REQ-FEAT-0004-09); nenhuma regra decidida na apresentação
(REQ-FEAT-0006-01). Tela: SCR-0001.

## Posicionamento

`src/main.ts`, camada **Aplicação**, alterado em dois trechos; `index.html` e `src/style.css` **não** mudam
para este item: os elementos `#speed` (`index.html:29`) e `#handling` (`index.html:28`) já existem e
continuam no mesmo lugar, com o mesmo estilo.

## Interface

| Trecho atual de `src/main.ts` | Mudança |
|---|---|
| `:458` `$('speed').textContent = Math.round(state.speed * 3.6)` | lê `const t = getHandlingTelemetry(state, setupRef)`; com `'code' in t` (nunca ocorre, porque `state` é `lap.kart` ou `idleKart`) os dois elementos não exibem valor; senão `Math.round(t.speedMps * 3.6)` |
| `:473-476` `labels[t.handling]` | `labels[telemetria.handling]` com a mesma tabela de rótulos de hoje (`:474`), inalterada; `data-state` igual |

`state` continua sendo `lap?.kart ?? idleKart` (`:392`): na pausa, perda de foco ou perda do sensor
`stepLap` devolve a mesma sessão, logo o `kart` e a telemetria não mudam e o HUD mantém o último valor por
construção. Antes do sinal verde a leitura devolve o estado inicial (0 km/h, `grip`): o estado "Vazio" de
SCR-0001. Ao fim da volta o `kart` é o do último passo: estado "Fim da volta". O estado "Erro" (dado de
pista ilegível) já não cria volta (`beginLap`, `:209`) e o HUD mostra o estado inicial, como hoje. As
leituras de G lateral, G longitudinal, deriva por eixo e carga por roda (`:477-487`) continuam lendo
`state.telemetry` diretamente: não são elementos desta feature e não mudam.

Conversão: `km/h = speedMps × 3,6`, arredondada ao inteiro para exibição; nenhuma outra transformação. O
canal `web-mobile` usa os mesmos elementos e a mesma leitura; a inclinação só muda o adaptador.

## Colaboradores

Chama `getHandlingTelemetry` (`src/physics.ts`, [DES-0002](../core/DES-0002-telemetria-de-dirigibilidade.md)).
Chamado pelo laço de quadros de `src/main.ts`. Não é chamado por nenhum módulo.

## Estado e concorrência

Sem estado próprio: o HUD é função da leitura do quadro. Idempotência: redesenhar o mesmo quadro mostra o
mesmo valor. Nenhum dado é gravado.

## Comportamento em falha

`NO_STATE` deixa os dois elementos sem valor de telemetria (SCR-0001, "Carregando"); não há dependência
externa, tempo-limite nem escrita. Nada é registrado em log.

## Observabilidade

A prova de "todos os quadros" é o teste registrado E2E-01 ([test-strategy](../test-strategy.md)); a regra
que o HUD exibe é provada em `npm test` pela telemetria.

## Determinismo (D-DS-07)

Não é código de simulação; só lê. Prova de que não decide nada: `tests/race-lap-validation-layering.test.ts`
continua afirmando que `src/main.ts` não decide validade, e `tests/dirigibilidade-contract.test.ts` afirma
que `src/main.ts` não contém os literais da condição de forçar (`50 / 3.6`, `13.88`), o teto 0,65 nem `forcing` calculado localmente (a classificação do
passo só existe em `src/physics.ts`).

## Feature flag

Nenhuma: os elementos já existem e a feature não os altera além da fonte da leitura.

## Pontos em aberto

Nenhum.
