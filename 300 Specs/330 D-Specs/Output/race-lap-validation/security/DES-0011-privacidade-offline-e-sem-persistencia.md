---
id: DES-0011
title: Privacidade, uso offline e ausência de persistência
feature: race-lap-validation
stage: dspec
status: validated
version: 1.1.0
sources: [FEAT-0001, FEAT-0002, FEAT-0003, FEAT-0004, FEAT-0005, FEAT-0006, FEAT-0009, REQ-FEAT-0001-14, REQ-FEAT-0002-16, REQ-FEAT-0003-15, REQ-FEAT-0004-15, REQ-FEAT-0005-12, REQ-FEAT-0006-16, REQ-FEAT-0009-07, REQ-FEAT-0009-08, REQ-FEAT-0009-09, REQ-FEAT-0009-11]
---

# DES-0011 — Privacidade, uso offline e ausência de persistência

## Realiza

Os `REQ-*` em `sources`: a volta inicia, é cronometrada, validada e exibida sem servidor, com 0 requisições de rede
entre o início da contagem e o resultado, e com o resultado exibido com a rede bloqueada depois do carregamento
(REQ-FEAT-0009-07, -08; NFR-0004); 0 campos de dado pessoal no resultado e 0 requisições que transmitam dados da
volta (REQ-FEAT-0009-09; NFR-0005); o resultado não é gravado no navegador por esta feature (REQ-FEAT-0009-11); e
recarregar ou abandonar a página antes da chegada não produz resultado (REQ-FEAT-0001-14, REQ-FEAT-0002-16,
REQ-FEAT-0003-15, REQ-FEAT-0004-15, REQ-FEAT-0005-12 e REQ-FEAT-0006-16).

## Posicionamento

Não é um módulo: é uma restrição de projeto que atravessa `src/lap.ts`, `src/trackData.ts`, `src/lapTiming.ts`,
`src/lapMessages.ts`, `src/frameClock.ts` e `src/main.ts`, e a sua verificação em `tests/lap-layering.test.ts`
([DES-0012](../core/DES-0012-invariantes-da-simulacao.md)). Camada do item: **Aplicação** (a restrição de privacidade é dona da aplicação). A verificação de que a simulação e o
dado de pista não importam rede, DOM nem armazenamento pertence a DES-0012 (camada Simulação).

## Autenticação e papéis

Não há caminho autenticado. O produto não tem sessão, conta nem papel além de `player` anônimo (RNF10); os
contratos de API-0001, API-0002 e API-0003 são **em processo**, dentro do navegador. Pontos de aplicação exigidos
pela política de segurança:

| Pergunta | Resposta |
|---|---|
| Onde a sessão é verificada | em lugar nenhum: não existe sessão |
| Onde o papel é verificado | em lugar nenhum: o único papel é `player` anônimo e todo comando é aceito do cliente; a decisão de aceitar ou rejeitar é de estado (fase da volta), em `src/lap.ts` |
| Webhooks | nenhum; nada recebe carga de terceiros |
| Segredos | nenhum; a feature não lê variável de ambiente, chave nem credencial (D-DS-06, I6) |

Quando existir servidor (pós-MVP), a mesma simulação poderá validar um resultado submetido; esse contrato e a sua
autenticação são de outra feature e não são projetados aqui.

## Dados que a feature trata (D-DS-04)

| Dado | Onde vive | Para que serve | Persistido ou transmitido |
|---|---|---|---|
| `trackId`, `trackVersion`, `challengeNumber` (opcional), `setupId` e `setupVersion` (opcionais) | `LapSession`, `LapResult` | identificar a pista, o desafio e o acerto do resultado (I1; API-0001); os dois últimos são identificadores do dado publicado de `dirigibilidade`, copiados sem interpretação, sem dado pessoal | não |
| contadores de passos, marcadores, setores, validade, motivo | `LapSession` | regras de volta | não |
| `lapMs`, `sectorMs` | `LapResult` | mostrar o tempo | não |
| idioma do navegador | lido a cada quadro | escolher o texto | não gravado, não enviado |

Nenhum campo de identidade de jogador, de dispositivo, de data, de horário, de posição geográfica nem de sensor bruto
entra no resultado. As leituras do sensor de inclinação viram um número normalizado de direção em `Input` e não são
guardadas.

## Uso offline e rede

Nenhuma chamada de rede é adicionada: o arquivo de pista está empacotado, a simulação é local e nenhum módulo novo
usa `fetch`, `XMLHttpRequest`, `WebSocket`, `navigator.sendBeacon` nem armazenamento. O teste de camada
(`tests/lap-layering.test.ts`) falha se esses símbolos aparecerem nos módulos novos ou em `src/main.ts`.
Não há integração externa, portanto não há tempo-limite, nova tentativa nem chave de idempotência de rede a declarar
(D-DS-03): a idempotência é a do estado da volta (DES-0001).

## Persistência e recarga

Esta feature não usa `localStorage`, `sessionStorage` nem IndexedDB. A `LapSession` vive na memória da página e é
descartada ao recarregar ou abandonar; como o resultado só nasce em `ENDED`, uma volta interrompida na contagem, na
corrida ou na pausa não tem resultado nem deixa dado gravado. O consumo da tentativa do desafio diário diante de
recarga ou abandono é da etapa 5.

## Comportamento em falha

Rede indisponível: sem efeito, pois nada a usa. Dado de pista corrompido: sem volta e com erro exibido
(DES-0006, DES-0009). Registro: somente identificadores (`trackId`, `trackVersion`, `schemaVersion`, identificadores
de verificação), nunca conteúdo de jogador (I6).

## Determinismo (D-DS-07)

Não é código de simulação. A garantia de que a simulação não lê relógio, DOM nem sorteio é a do teste de camada.

## Feature flag

Nenhuma: são restrições, e a ausência de rede e de armazenamento é o estado neutro.

## Pontos em aberto

Nenhum.
