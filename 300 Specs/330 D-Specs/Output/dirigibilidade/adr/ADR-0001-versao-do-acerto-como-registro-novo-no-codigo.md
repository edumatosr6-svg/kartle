---
id: ADR-0001
title: A nova versão do acerto é um registro novo em código; a anterior fica intacta; sem chave mestra
feature: dirigibilidade
stage: dspec
status: validated
version: 1.0.1
sources: [RULE-0003, FEAT-0005, FEAT-0006, REQ-FEAT-0005-05, REQ-FEAT-0005-09, REQ-FEAT-0006-04, REQ-FEAT-0006-07, NFR-0007, NFR-0009]
---

# ADR-0001 — A nova versão do acerto é um registro novo em código; a anterior fica intacta; sem chave mestra

## Contexto

O F-Spec exige que o novo Arcade assistido seja declarado como nova `setupVersion`, que a versão anterior
nunca seja editada no lugar (REQ-FEAT-0005-09, RULE-0003) e que o conjunto de `npm test` de
`race-lap-validation` continue 100 % aprovado (REQ-FEAT-0006-07). Esse conjunto afirma literalmente os
valores de `ARCADE_KART` e `RENTAL_KART` e que `KART_PRESETS.arcade === ARCADE_KART`
(`tests/race-lap-validation-frozen.test.ts:48-60`). Ao mesmo tempo o F-Spec proíbe qualquer configuração
para escolher entre o acerto antigo e o novo (FEAT-0005, Configuração), enquanto a política do estágio pede
uma chave mestra desligada por padrão para toda feature nova (I4).

## Decisão

1. `ARCADE_KART` permanece em `src/physics.ts` com o seu conteúdo e passa a ser o registro da versão
   `arcade-assistido-v4` (`previousSetupVersion`). O novo acerto é o literal novo `ARCADE_ASSISTIDO_V5`,
   versão `arcade-assistido-v5`. `KART_PRESETS` fica como está e deixa de ser lido pelo jogo.
2. O dado publicado é `PUBLISHED_SETUPS` ([DM-0001](../data/DM-0001-dado-publicado-registros-e-linha-de-base.md)),
   lido por `src/main.ts` e pelos ensaios. `previousConfig` existe para os ensaios de linha de base, não
   para o jogo.
3. Os parâmetros novos de assistência são campos **opcionais** de `KartConfig` com padrão igual ao
   comportamento atual, ausentes em `RENTAL_KART` e `ARCADE_KART`.
4. Não há chave mestra: a entrega da versão nova **é** a sua declaração no dado publicado; o "padrão sem
   mudança" de I4 está nos campos opcionais ausentes (Realista e versão anterior inalterados) e numa chave
   para voltar ao acerto antigo seria exatamente a configuração que o F-Spec proíbe. A versão de física
   `PHYSICS_VERSION` não muda.

## Alternativas consideradas

- **Editar `ARCADE_KART` no lugar.** Viola REQ-FEAT-0005-09 e quebra `CHK-TEST-0014-04`, o que exigiria
  um feedback a `race-lap-validation` para afrouxar um teste daquela feature. Recusada.
- **Nova `trackVersion` em vez de `setupVersion`.** O F-Spec decidiu pela versão própria do acerto
  (01-overview, "Decisões de forma"): o dado de pista não muda. Recusada.
- **Chave mestra que liga o acerto novo.** Proibida pelo F-Spec; e uma chave desligada por padrão deixaria
  a feature entregue sem efeito. Recusada; o motivo fica registrado aqui para o validador.
- **Nova `PHYSICS_VERSION`.** Nomeia o modelo, não o acerto; e está congelada por `CHK-TEST-0014-05`.
  Recusada.

## Consequências

- Dois literais de preset Arcade convivem em `src/physics.ts`; o antigo é dado, não código vivo. Toda
  versão futura do Arcade acrescenta um literal e move a anterior para `previousConfig`. Isso inclui cada
  rodada do ciclo de acerto em staging (`DOMAIN/DEC-10`; RULE-0003 1.1.0): uma rodada reprovada pelo dono do
  produto é substituída por nova `setupVersion` com os parâmetros iterados, nunca editada no lugar, e
  nenhum preset experimental é exposto no painel do jogo — o `<select>` de `src/main.ts` continua com os
  dois valores de hoje ([DES-0007](../web/DES-0007-integracao-da-aplicacao-e-adaptadores.md)).
- O teste de congelamento de `race-lap-validation` continua verde sem edição; os testes existentes de
  `tests/physics.test.ts:147-189` e `tests/maneuvers.test.ts:68-79`, que usam `ARCADE_KART`, continuam
  rodando contra a versão anterior e nenhuma verificação é perdida (conventions §17).
- A aplicação e os benches passam a ler `PUBLISHED_SETUPS`; `KART_PRESETS` sobrevive só pelo teste de
  congelamento.

## Estado

Aceita nesta rodada.
