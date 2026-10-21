---
title: Glossário — validação de volta de corrida
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: []
---

# Glossário

Os termos valem igualmente em `web-desktop` e `web-mobile`, salvo indicação. Os termos de domínio vêm do
glossário dos requisitos; as linhas de enum e de campo são as dos contratos de `api/` e de `rules/`.

## Termos de domínio

| Termo | Definição |
|---|---|
| Jogador | Quem pilota o kart e recebe a contagem, o tempo, os setores e o estado da volta |
| Curador do catálogo | Quem fornece e publica o dado de cada pista; não interage com o jogo nesta feature |
| Volta | Percurso cronometrado de uma pista, do sinal verde até o encerramento |
| Contagem regressiva | Sequência de 3 s exibida antes da largada, que termina no sinal verde |
| Sinal verde | Fim da contagem; o cronômetro da volta começa nele |
| Linha de largada | Linha do dado da pista onde os karts partem; seu cruzamento não inicia o cronômetro |
| Linha de chegada | Linha do dado da pista cujo cruzamento, no sentido da pista, encerra a volta |
| Sentido da pista | Direção de percurso declarada no dado da pista |
| Contramão | Passagem por uma linha ou por um marcador no sentido oposto ao da pista |
| Tempo total | Tempo da volta do sinal verde ao instante de cruzamento da chegada, em ms inteiros |
| Instante de cruzamento | Instante em que o kart cruza a chegada ou um limite de setor, interpolado dentro do passo |
| Setor | Cada um dos quatro trechos de apresentação da volta, com limites declarados no dado da pista |
| Marcador de validação (marcador) | Ponto de passagem obrigatório, em ordem e no sentido da pista; conjunto distinto dos setores. O seed também o chama de checkpoint |
| Volta válida | Volta encerrada ao cruzar a chegada no sentido da pista depois de passar por todos os marcadores em ordem, sem invalidação |
| Volta inválida | Volta com motivo de invalidação; termina no momento da invalidação e não tem tempo oficial |
| Motivo | Texto que diz por que a volta é inválida: "marcador pulado", "corte" ou "reposicionamento" |
| Estado da volta | "válida em andamento" ou "inválida" com o motivo, exibido durante a volta |
| Borda da pista | Limite da superfície de pista declarado no dado da pista |
| Grama | Superfície fora da pista que reduz a velocidade do kart (RF08) |
| Limites de corte | Distância além da borda e duração contínua acima das quais uma saída de pista é corte: 3 m e 1000 ms por padrão |
| Corte | Saída de pista além da distância dos limites de corte por mais que a duração dos limites, seguidos; invalida a volta |
| Reposicionamento | Ação do Jogador que recoloca o kart na pista |
| Pausa | Suspensão da simulação e do cronômetro: Esc (`web-desktop`), perda de foco da aba (ambos), perda do sensor (`web-mobile`) |
| Volta oficial | Volta cujo tempo, se válida, é o tempo oficial; quem a define é o desafio diário |
| Volta de reconhecimento | Volta que nunca produz tempo oficial |
| Volta de treino | Volta que nunca produz tempo oficial; único tipo numa pista de dado incompleto |
| Dado de pista incompleto | Dado que não declara largada, sentido, linha de chegada, quatro setores ou marcadores, ou que está na forma anterior ou inconsistente |
| Tempo oficial | Tempo total e tempos de setor de uma volta oficial válida |
| Resultado | Registro produzido pela simulação ao encerrar uma volta |
| Queima de largada | Acelerar antes do sinal verde; ignorada, sem efeito e sem penalidade |
| Dado da pista | Dado versionado de cada pista; `trackId` e `trackVersion` a identificam |
| Pista sintética | Pista de teste atual, mantida jogável até as pistas reais da etapa 3 |
| Passo de simulação (`STEP`) | Passo fixo da simulação; o tempo oficial é função da sequência de passos |
| Acerto | Preset de kart e configuração da simulação usados numa volta |
| Runtime | Navegador e versão em que a simulação executa |
| Sensor de inclinação | Sensor do celular que alimenta a direção em `web-mobile` |

## Enums e campos dos contratos

| Nome | Valores ou sentido | Onde |
|---|---|---|
| `lapPhase` | `COUNTDOWN`, `RUNNING`, `PAUSED`, `ENDED` | [RULE-0002](rules/RULE-0002-estados-da-volta.md) |
| `resumePhase` | `COUNTDOWN`, `RUNNING` | RULE-0002 |
| `pauseCause` | `ESC_KEY`, `FOCUS_LOST`, `SENSOR_LOST` | RULE-0002 |
| `lapValidity` | `VALID`, `INVALID` | [RULE-0001](rules/RULE-0001-validade-da-volta.md) |
| `invalidReason` | `MISSED_MARKER`, `CUT`, `REPOSITION` | RULE-0001 |
| `lapKind` | `OFFICIAL`, `RECON`, `TRAINING` | [RULE-0005](rules/RULE-0005-tipos-de-volta-e-reposicionamento.md) |
| `trackDataStatus` | `COMPLETE`, `INCOMPLETE`, `UNSUPPORTED_SCHEMA`, `UNREADABLE` | RULE-0005 |
| `stepCount` | passos de `STEP` contados do sinal verde; contador de sequência | RULE-0002 |
| `elapsedMs`, `lapMs`, `sectorMs` | tempos em milissegundos inteiros | [API-0001](api/API-0001-resultado-e-estado-da-volta.md) |
| `markersPassedCount` | marcadores passados em ordem | RULE-0001 |
| `offTrackMs` | duração contínua da saída além da distância de corte | [RULE-0004](rules/RULE-0004-corte-e-grama.md) |
| `cutDistanceM`, `cutDurationMs` | limites de corte do dado da pista | [API-0003](api/API-0003-dado-de-pista.md) |
| `official` | verdadeiro só para volta oficial válida e concluída em pista de dado completo | API-0001 |
| `startLap`, `pauseLap`, `resumeLap`, `repositionKart` | comandos da volta | [API-0002](api/API-0002-comandos-da-volta.md) |
