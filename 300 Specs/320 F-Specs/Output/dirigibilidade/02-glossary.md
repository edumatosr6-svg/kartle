---
title: Glossário — dirigibilidade do Arcade assistido
feature: dirigibilidade
stage: fspec
status: validated
version: 3.1.1
sources: []
---

# Glossário

Os termos valem igualmente em `web-desktop` e `web-mobile`, salvo indicação. Os termos de domínio vêm do
glossário dos requisitos; as linhas de enum e de campo são as dos contratos de `api/` e de `rules/`.

## Termos de domínio

| Termo | Definição |
|---|---|
| Jogador | Quem pilota o kart com teclado (`web-desktop`) ou com inclinação e toque (`web-mobile`) |
| Piloto de teste | Sequência determinística de comandos binários executada por `npm run bench:handling` na pista sintética; régua de regressão |
| Acerto | Preset de kart (massa, pneu, motor) e conjunto de assistências usados numa volta (I8) |
| Arcade assistido | Acerto padrão do jogo, objeto desta feature; usa assistências de direção, frenagem e amortecimento de derrapagem |
| Realista — aluguel 4T | Acerto sem assistências arcade; referência física documentada; não muda |
| Versão do acerto | Identificador declarado no dado publicado (`setupVersion`) que distingue o acerto novo do anterior; tempos e replays de versões diferentes não são comparáveis |
| Assistências | Regras do acerto Arcade que modulam o `Input` ou o estado dentro da simulação: direção proporcional à velocidade, frenagem equilibrada, amortecimento de derrapagem |
| `Input` | Entrada normalizada que todo adaptador entrega à simulação; conjunto, faixa e significado dos campos não mudam (I8) |
| Esterço | Componente de direção do `Input`, de −1 a 1; esterço cheio é 1 ou −1 |
| Entrada binária | Esterço e acelerador que só assumem 0 ou valor cheio: teclado, e toque em `web-mobile` |
| Entrada proporcional | Esterço com qualquer valor entre −1 e 1: inclinação em `web-mobile` |
| Sensor de inclinação | Sensor do celular que alimenta o esterço proporcional; ausente ou negado, o controle recai para toque com estado visível (I4) |
| Tempo simulado | Tempo em passos de `STEP` no estado da simulação; nunca o relógio de parede |
| `STEP` | Passo fixo da simulação, com solver de 480 Hz; não muda |
| Ensaio | Sequência determinística de estado inicial, ambiente, `Input` por passo e medição, executada em `npm test` ou nos benches, com parâmetros e resultados registrados em `docs/physics.md` |
| Ambiente de ensaio | Onde o ensaio roda: pista de teste (`TEST_PAD`) ou pista sintética (`SYNTHETIC_TRACK`); reportado em `benchEnvironment` e registrado em `docs/physics.md` |
| Pista de teste | Ambiente de ensaio próprio, separado da pista sintética e de qualquer pista publicada: faixa de asfalto da largura da pista, sem paredes nem grama a ensaiar, com a geometria que cada ensaio declara (reta para a resposta do volante; arco de raio 18 m para a curva de referência, o início do subesterço e a recuperação). Usada pelos ensaios de US-0001 a US-0003; o Jogador não pilota nela; não é dado de pista publicado (`SEED/RD-06`, `DOMAIN/REF-03`) |
| Pista sintética | Pista do piloto de teste (`npm run bench:handling`); raios mínimos de curva de 24 m e 25 m, com um grampo de 4 m — não tem curva de 18 m. Só a volta do piloto de teste e os ensaios que precisam de grama ou parede a usam |
| Linha de base | Valor medido pelo mesmo ensaio, no mesmo ambiente e na mesma geometria, com o acerto Arcade assistido anterior a esta feature, registrado em `docs/physics.md` |
| Taxa de guinada | Velocidade angular do kart em torno do eixo vertical, em rad/s, no estado da simulação |
| Velocidade mantida | Condição de ensaio em que a velocidade do kart é mantida num valor constante, em vez de decair com o esterço aplicado: em 50 km/h pelo acelerador durante todo o ensaio de resposta do volante, com o modo de manter (`speedHoldMode`) e a faixa tolerada (`speedHoldBandMps`) reportados como parâmetros de ensaio e o mínimo e o máximo observados provando a condição; e no valor de cada patamar, durante o patamar, na varredura de início do subesterço, com o modo de manter registrado em `docs/physics.md` como parâmetro de ensaio (`DOMAIN/REF-04`) |
| Regime da taxa de guinada | Valor estabilizado que a taxa de guinada atinge com esterço mantido em reta da pista de teste, com a velocidade mantida em 50 km/h; medido numa janela curta e estacionária (`settleWindowMs`), nunca num valor que deriva com a desaceleração |
| Resposta do volante | Tempo simulado da aplicação do esterço até 90 % do regime (subida) e do esterço voltar a 0 até 10 % do regime (queda) |
| Estado de aderência | Campo `handling` da telemetria: `grip`, `understeer`, `oversteer` ou `sliding` |
| Telemetria | Campos do estado da simulação lidos por passo pelos ensaios e pelo HUD: velocidade, estado de aderência, derrapagem lateral, taxa de guinada, superfície, contato com a parede |
| Subesterço (`understeer`) | O kart faz raio maior que o pedido: "sai de frente" |
| Sobre-esterço (`oversteer`) | A traseira perde aderência antes da frente: "traseira solta" |
| Derrapagem (`sliding`) | Os dois eixos sem aderência |
| Derrapagem lateral | Ângulo entre a direção do kart e a direção do seu movimento, em rad |
| Condição de forçar | Acelerador cheio e esterço cheio com velocidade acima de 50 km/h; fora da manobra de drift e da recuperação, único contexto em que `oversteer` ou `sliding` podem ocorrer |
| Recuperação | Os passos entre o passo em que o esterço é levado de 1 (ou −1) a 0 com a traseira solta sob a condição de forçar e o primeiro passo em que a telemetria volta a `grip`; dura no máximo 400 ms; classe de passo própria, não é condução normal |
| Condução normal | Passo em que a condição de forçar não se mantém, a manobra de drift não está em andamento **e** que não pertence a uma recuperação |
| Curva de referência | Ensaio na pista de teste: arco de raio 18 m, faixa da largura da pista, sem paredes, percorrido a 50 km/h com esterço cheio. Não é segmento da pista sintética |
| Velocidade de início do subesterço | Menor velocidade medida, no ensaio de início do subesterço — arco de raio 18 m da pista de teste, esterço cheio, a velocidade do kart subindo no arco em patamares de velocidade mantida, numa varredura que a saída da faixa encerra (`DOMAIN/DEC-11`); cada patamar completo é uma velocidade medida, e o tamanho do patamar em km/h e a sua duração são parâmetros de ensaio registrados em `docs/physics.md` (`DOMAIN/REF-04`) —, em cujo patamar a telemetria reporta `understeer` por mais de 200 ms consecutivos; V0 na linha de base, V1 no novo acerto |
| Drift | Manobra de `requirements/11` que pontua; continua possível e continua pontuando |
| Direção comum | Pilotar sem a manobra de drift; permanece fácil |
| Velocidade estabilizada | Velocidade em reta com acelerador cheio mantido, após deixar de crescer |
| Grama | Superfície fora do asfalto que reduz a velocidade; só na pista sintética |
| Parede | Limite sólido da pista cujo contato reduz a velocidade; só na pista sintética |
| Asfalto | Superfície da pista, ou a faixa da pista de teste; "sair do asfalto" é qualquer passo com o kart fora dela |
| HUD | Elementos de tela que exibem a velocidade em km/h e o estado de aderência em texto durante a volta; já existem e não regridem |
| Acerto agressivo | Conjunto de limites em vigor após a revisão 2 do seed (`DOMAIN/REF-02`): 180 ms / 250 ms de resposta do volante, 50 km/h na curva de referência, 0–60 km/h em 2,5 s, 105 km/h estabilizada, volta do piloto de teste em 25 s |
| Staging | Publicação de uma rodada de código para o teste do dono do produto no ciclo de fechamento humano (`DOMAIN/DEC-10`); não é critério desta especificação |
| Replay | Sequência de `Input` por passo gravada para uma pista, com a versão do acerto que a produziu |
| Texto compartilhado | Texto que o Jogador compartilha com o resultado de uma volta; contrato publicado (I3) |

## Enums e campos dos contratos

| Nome | Valores ou sentido | Onde |
|---|---|---|
| `handling` | `grip`, `understeer`, `oversteer`, `sliding` | [RULE-0001](rules/RULE-0001-estado-de-aderencia-e-condicao-de-forcar.md) |
| `surface` | `ASPHALT`, `GRASS` (`GRASS` é "fora do asfalto"; na pista de teste, fora da faixa) | [API-0001](api/API-0001-telemetria-de-dirigibilidade.md) |
| `forcing`, `driftActive`, `wallContact` | booleanos por passo: condição de forçar mantida; manobra de drift em andamento; contato com a parede neste passo | API-0001 |
| `speedMps`, `sideslipRad`, `yawRateRadPerS` | velocidade em m/s; derrapagem lateral em rad; taxa de guinada em rad/s | API-0001 |
| `simStepCount` | passos de `STEP` desde o estado inicial da simulação; contador de sequência | API-0001 |
| `setupId` | `ARCADE_ASSISTIDO`, `REALISTA_ALUGUEL_4T` | [RULE-0003](rules/RULE-0003-versao-do-acerto-e-comparabilidade.md) |
| `setupVersion`, `previousSetupVersion` | identificador da versão corrente do acerto e da versão anterior à feature, declarados no dado publicado | [API-0002](api/API-0002-versao-do-acerto.md) |
| `setupVersionSource` | `DECLARED`, `RESOLVED_FROM_ABSENCE` | API-0002 |
| `replayStatus` | `READABLE`, `UNSUPPORTED_FORMAT`, `UNREADABLE` | API-0002 |
| `comparability` | `COMPARABLE`, `SETUP_VERSION_DIFFERS`, `SETUP_DIFFERS`, `TRACK_DIFFERS` | RULE-0003 |
| `benchId` | identificador de ensaio: `STEER_RESPONSE`, `REFERENCE_CORNER`, `UNDERSTEER_ONSET`, `NORMAL_DRIVING`, `REAR_RECOVERY`, `DRIFT_MANEUVER`, `ACCELERATION`, `TOP_SPEED`, `GRASS_LOSS`, `WALL_CONTACT`, `DETERMINISM`, `TEST_PILOT_LAP`, `SETUP_VERSION`, `STEP_CONTRACT`, `REALISTA_UNCHANGED`, `STEP_COST`; os campos medidos de cada ensaio são SI com a unidade no sufixo (`entrySpeedMps`, `v0Mps`, `v1Mps`, `topSpeedMps`, `zeroToSixtyKmhMs`, `arcRadiusM`, `laneWidthM`…), apresentados também em km/h ou s na saída serializada e em `docs/physics.md` | [API-0003](api/API-0003-saida-dos-ensaios.md), [RULE-0002](rules/RULE-0002-ensaios-e-limiares.md) |
| `benchEnvironment` | `TEST_PAD` (pista de teste), `SYNTHETIC_TRACK` (pista sintética) — ambiente em que o ensaio rodou | API-0003, RULE-0002 |
| `speedHoldMode` | `THROTTLE_CONSTANT` (acelerador constante, valor em `throttleInputNorm`), `THROTTLE_REGULATED` (acelerador escolhido por passo pelo ensaio para manter a velocidade) — modo de manter a velocidade em `STEER_RESPONSE`; parâmetro de ensaio | API-0003 |
| `speedMinMps`, `speedMaxMps`, `speedHoldBandMps`, `targetSpeedMps` | velocidade mínima e máxima observadas durante o ensaio de resposta; faixa tolerada em torno da velocidade alvo (parâmetro de ensaio); velocidade alvo (13,89 m/s = 50 km/h) | API-0003 |
| `verdict` | `PASS`, `FAIL` | API-0003 |
| `failReason` | `THRESHOLD_EXCEEDED`, `BASELINE_MISSING`, `OFF_ASPHALT`, `NON_DETERMINISTIC`, `CONTRACT_CHANGED`, `SPEED_NOT_HELD`, `MEASUREMENT_MISSING` (falta de medida, na varredura de início do subesterço: saída da faixa acima de 50 km/h antes do segundo patamar completo acima de 50 km/h; ou fim natural da varredura sem V1 medida) | API-0003 |
| `inputMode` | `BINARY`, `PROPORTIONAL` — forma do `Input` usada no ensaio | API-0003 |
| `throttleCondition` | `THROTTLE_ZERO`, `THROTTLE_FULL` — acelerador mantido durante a curva de referência | API-0003 |
