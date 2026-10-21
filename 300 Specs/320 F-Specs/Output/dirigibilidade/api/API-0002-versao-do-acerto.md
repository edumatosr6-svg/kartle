---
id: API-0002
title: Contrato da versão do acerto no dado publicado, no replay, no resultado e no texto compartilhado
feature: dirigibilidade
stage: fspec
status: validated
version: 1.0.0
sources: [US-0005, NFR-0006, NFR-0007, NFR-0009, AC-US-0005-04, AC-US-0005-05, AC-US-0005-06]
---

# API-0002 — Contrato da versão do acerto no dado publicado, no replay, no resultado e no texto compartilhado

Contrato único, para `web-desktop` e `web-mobile`, do que declara a versão de um acerto e de como ela é
carregada por replays, resultados e texto compartilhado — os contratos publicados que I3 protege. É dado
versionado e leitura em processo: não há endpoint de rede, caminho HTTP nem prefixo no MVP (diretrizes do
estágio). Nomes em `camelCase` plano (D-FS-06). O resultado da volta e o dado de pista são contratos da
feature `race-lap-validation`, nomeados aqui e não redefinidos: este contrato só acrescenta campos
opcionais e aditivos a eles.

## Operações

| Operação | Propósito | Quem chama |
|---|---|---|
| `getSetupVersion` | Lê, para um `setupId`, a versão corrente e a anterior declaradas no dado publicado | Simulação ao iniciar volta ou ensaio; ensaios `SETUP_VERSION` |
| `readReplay` | Lê um replay gravado e devolve a sua identidade de acerto e pista | Reprodução de replay; ensaios `SETUP_VERSION` |
| `compareLapRecords` | Decide a comparabilidade de dois tempos, replays ou resultados | Apresentação antes de exibir ou compartilhar qualquer comparação ([SCR-0002](../screens/SCR-0002-resultado-e-texto-compartilhado.md)) |

## Auth

Sem sessão. Papel permitido: `player` (anônimo) lê o dado empacotado com o jogo e os registros gravados no
próprio navegador. Público no cliente: o dado publicado não é segredo e as leituras não alteram estado.

## Dado publicado — declaração de versão por acerto

| Campo | Tipo | Unidade | Obrigatório | Padrão e restrições |
|---|---|---|---|---|
| `setupId` | enum `ARCADE_ASSISTIDO`, `REALISTA_ALUGUEL_4T` | — | sim | um registro por acerto |
| `setupVersion` | texto não vazio | — | sim | versão corrente; para `ARCADE_ASSISTIDO`, diferente de `previousSetupVersion` (AC-US-0005-04); para `REALISTA_ALUGUEL_4T`, igual à de antes da feature (NFR-0007) |
| `previousSetupVersion` | texto não vazio | — | não | padrão: ausente. Para `ARCADE_ASSISTIDO`, a versão anterior à feature; ausente significa que o acerto não teve versão anterior declarada. Neutro: ausente não muda nenhum comportamento da volta, só a resolução de registros antigos ([RULE-0003](../rules/RULE-0003-versao-do-acerto-e-comparabilidade.md)) |

A versão anterior do Arcade assistido nunca é editada no lugar: a nova versão é um registro novo (I3).

## Pedido e resposta de `getSetupVersion`

| Campo | Direção | Tipo | Obrigatório | Restrições |
|---|---|---|---|---|
| `setupId` | pedido | enum | sim | |
| `setupId`, `setupVersion`, `previousSetupVersion` | resposta | como acima | `previousSetupVersion` só quando declarada | copiados do dado publicado, sem interpretação |

Forma vazia: `setupId` desconhecido retorna `UNKNOWN_SETUP` e nenhum campo.

## Campos acrescentados ao replay, ao resultado da volta e ao texto compartilhado

| Campo | Tipo | Unidade | Obrigatório | Padrão e restrições |
|---|---|---|---|---|
| `setupId` | enum | — | não (registros antigos); sim em todo registro gravado a partir desta feature | padrão quando ausente: `ARCADE_ASSISTIDO`, o acerto padrão anterior à feature. Neutro: um registro antigo é lido como o acerto que o produziu (I5) |
| `setupVersion` | texto | — | não (registros antigos); sim em todo registro gravado a partir desta feature | padrão quando ausente: `previousSetupVersion` do `setupId`. Neutro: um registro antigo continua legível e passa a ser distinguível do novo pela leitura deste campo (AC-US-0005-04) |

O replay continua carregando `trackId`, `trackVersion` e a sequência de `Input` por passo, cujo conjunto,
faixa e significado não mudam (AC-US-0005-06, NFR-0006). O resultado continua chaveado em
`challengeNumber` com `trackVersion` quando o desafio diário o informa (D-FS-01), sem mudança. O texto
compartilhado passa a conter a `setupVersion` em texto ao lado do tempo (AC-US-0005-05).

## Resposta de `readReplay`

| Campo | Tipo | Obrigatório | Restrições |
|---|---|---|---|
| `replayStatus` | enum `READABLE`, `UNSUPPORTED_FORMAT`, `UNREADABLE` | sim | sempre presente |
| `trackId`, `trackVersion` | como no dado de pista | só com `READABLE` | copiados do registro |
| `setupId` | enum | só com `READABLE` | declarado ou resolvido (padrão acima) |
| `setupVersion` | texto | só com `READABLE` | declarada ou resolvida (padrão acima) |
| `setupVersionSource` | enum `DECLARED`, `RESOLVED_FROM_ABSENCE` | só com `READABLE` | diz se o campo veio do registro ou do padrão |
| `inputStepCount` | inteiro | só com `READABLE` | passos de `Input` no replay; maior que 0 |

Forma vazia: sem replay carregado, `UNREADABLE` e nenhum outro campo.

## Pedido e resposta de `compareLapRecords`

| Campo | Direção | Tipo | Obrigatório | Restrições |
|---|---|---|---|---|
| dois registros, cada um com `trackId`, `trackVersion`, `setupId`, `setupVersion` | pedido | como acima | sim | campos ausentes resolvidos pelos padrões acima antes da comparação |
| `comparability` | resposta | enum `COMPARABLE`, `SETUP_VERSION_DIFFERS`, `SETUP_DIFFERS`, `TRACK_DIFFERS` | sim | tabela de decisão de [RULE-0003](../rules/RULE-0003-versao-do-acerto-e-comparabilidade.md) |

## Erros

Não há status HTTP. Cada operação retorna um destes códigos, sem lançar nem alterar estado:

| Código | Operação | Condição | Corpo |
|---|---|---|---|
| `UNKNOWN_SETUP` | `getSetupVersion` | `setupId` fora do enum | apenas o código |
| `UNREADABLE` | `readReplay` | registro ausente, corrompido ou ilegível | `replayStatus` apenas |
| `UNSUPPORTED_FORMAT` | `readReplay` | formato de replay de versão desconhecida; o registro é mantido intacto e reportado (I4) | `replayStatus` apenas |
| `INCOMPLETE_RECORD` | `compareLapRecords` | um dos registros não tem `trackId` ou `trackVersion` | apenas o código; nenhuma comparação é exibida |

## Idempotência

As três operações são leituras puras: repetir a chamada devolve o mesmo valor e não altera estado nem
registro. A declaração de versão no dado publicado ocorre uma vez por entrega; redeclarar o mesmo
identificador não cria versão ([RULE-0003](../rules/RULE-0003-versao-do-acerto-e-comparabilidade.md)). A
gravação do resultado e do replay é da feature que a possui e é feita uma vez por volta (I7); este
contrato não acrescenta gravação.

## Paginação e sondagem

Não se aplica.

## Compatibilidade

| Mudança | Tratamento |
|---|---|
| Campos novos `setupId` e `setupVersion` no replay, no resultado e no texto compartilhado | Aditivos e opcionais na leitura; obrigatórios na gravação nova (I3). Registros anteriores são lidos sem erro em 100 % dos casos, com os padrões acima (NFR-0009, I5) |
| Nova `setupVersion` do Arcade assistido | Registro novo no dado publicado; a anterior fica como `previousSetupVersion`, legível e intacta (I3) |
| Formato de replay posterior ao conhecido | `UNSUPPORTED_FORMAT`, intacto e reportado |
| Campo existente renomeado, removido ou com significado ou unidade alterados | Nenhum nesta feature: `trackId`, `trackVersion`, `challengeNumber`, os tempos e a sequência de `Input` mantêm nome, unidade e significado |
| `STEP`, taxa do solver e campos de `Input` | Inalterados (NFR-0006) |

A verificação do NFR-0009 é a saída de `npm test` lendo um replay e um resultado sem `setupVersion` e um de
cada com a versão nova ([API-0003](API-0003-saida-dos-ensaios.md), `SETUP_VERSION`).
