---
id: ADR-0002
title: Formato do replay versão 1 e registro de volta que envolve o LapResult, sem persistência
feature: dirigibilidade
stage: dspec
status: validated
version: 1.0.0
sources: [API-0002, RULE-0003, FLOW-0003, FEAT-0005, REQ-FEAT-0005-05, REQ-FEAT-0005-06, REQ-FEAT-0005-08, REQ-FEAT-0005-10, NFR-0006, NFR-0009]
---

# ADR-0002 — Formato do replay versão 1 e registro de volta que envolve o LapResult, sem persistência

## Contexto

API-0002 acrescenta `setupId` e `setupVersion` ao replay, ao resultado da volta e ao texto compartilhado, e
exige leitura sem erro de registros anteriores à feature. No código em execução não existe replay nem
resultado gravado: `race-lap-validation` proíbe armazenamento no navegador
(`tests/race-lap-validation-layering.test.ts:43-49`) e exige que `getLapResult` devolva exatamente os
campos de API-0001 daquela feature (`tests/race-lap-validation-contract.test.ts:35-41`). O F-Spec diz que
a gravação é da feature que a possui e que este contrato não acrescenta gravação.

## Decisão

1. O **registro de volta** é `LapRecord = LapResult + {setupId, setupVersion}`, construído por
   `buildLapRecord` em `src/setupRecords.ts`. `getLapResult` e `LapResult` não mudam: o acréscimo é feito
   no registro, que é o que se grava e se compartilha, não na leitura em processo da volta.
2. O **replay** nasce com formato versão 1 (`replayFormatVersion: 1`): `trackId`, `trackVersion`,
   `challengeNumber?`, `lapKind`, `setupId`, `setupVersion`, `inputs` por passo `RUNNING`. "Forma anterior à
   feature" é a mesma forma sem `replayFormatVersion` e sem os campos de acerto; `readReplay` a lê com
   `RESOLVED_FROM_ABSENCE`. Versão maior que 1 é `UNSUPPORTED_FORMAT`, intacta.
3. Nenhuma persistência é acrescentada: os registros vivem na memória da página e em fixtures. Os leitores
   (`readReplay`, `compareLapRecords`, `replayLap`) são a interface que a feature que vier a persistir ou
   compartilhar registros usará.
4. A reprodução (`replayLap`) usa o acerto corrente e devolve um `LapRecord` com a `setupVersion` corrente,
   cuja comparabilidade com o gravado é decidida por `compareLapRecords`.

## Alternativas consideradas

- **Acrescentar `setupId`/`setupVersion` ao `LapResult`.** Quebra `CHK-TEST-0012-02` de
  `race-lap-validation`; exigiria feedback àquela feature para alterar o seu contrato. O F-Spec diz que os
  contratos daquela feature são nomeados e não redefinidos. Recusada.
- **Persistir registros em `localStorage` nesta feature.** Proibido pelo teste de camada de
  `race-lap-validation` e fora do escopo (o F-Spec não pede gravação). Recusada.
- **Guardar a identidade do acerto dentro de `KartConfig`.** `RENTAL_KART` e `ARCADE_KART` não podem
  ganhar campos (teste de congelamento) e a `LapSession` guarda só uma cópia do `config`; a identidade é
  passada explicitamente por quem inicia a volta ou o ensaio ([DES-0002](../core/DES-0002-telemetria-de-dirigibilidade.md)). Recusada.

## Consequências

- Os estados "Carregando", "Vazio" e "Erro" de SCR-0002 que dependem de registros gravados não têm tela
  nesta entrega além do resultado da sessão; estão declarados em
  [DES-0006](../web/DES-0006-resultado-melhor-tempo-e-texto-compartilhado.md).
- Qualquer feature futura que grave registros deve usar `buildLapRecord`/`buildReplayRecord` para que todo
  registro novo carregue os campos (API-0002: obrigatórios na gravação).
- O formato do replay é contrato publicado (I3): uma mudança futura bumpa `replayFormatVersion` e traz
  leitor da versão 1.

## Estado

Aceita nesta rodada.
