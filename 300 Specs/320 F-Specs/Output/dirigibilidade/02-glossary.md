---
title: Glossário — dirigibilidade do Arcade assistido
feature: dirigibilidade
stage: fspec
status: validated
version: 2.0.0
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
| Ensaio | Sequência determinística de estado inicial, `Input` por passo e medição, executada em `npm test` ou nos benches, com parâmetros e resultados registrados em `docs/physics.md` |
| Linha de base | Valor medido pelo mesmo ensaio com o acerto Arcade assistido anterior a esta feature, registrado em `docs/physics.md` |
| Taxa de guinada | Velocidade angular do kart em torno do eixo vertical, em rad/s, no estado da simulação |
| Regime da taxa de guinada | Valor estável que a taxa de guinada atinge com esterço mantido; a janela de estabilização usada é parâmetro reportado do ensaio |
| Resposta do volante | Tempo simulado da aplicação do esterço até 90 % do regime (subida) e do esterço voltar a 0 até 10 % do regime (queda) |
| Estado de aderência | Campo `handling` da telemetria: `grip`, `understeer`, `oversteer` ou `sliding` |
| Telemetria | Campos do estado da simulação lidos por passo pelos ensaios e pelo HUD: velocidade, estado de aderência, derrapagem lateral, taxa de guinada, superfície, contato com a parede |
| Subesterço (`understeer`) | O kart faz raio maior que o pedido: "sai de frente" |
| Sobre-esterço (`oversteer`) | A traseira perde aderência antes da frente: "traseira solta" |
| Derrapagem (`sliding`) | Os dois eixos sem aderência |
| Derrapagem lateral | Ângulo entre a direção do kart e a direção do seu movimento, em rad |
| Condição de forçar | Acelerador cheio e esterço cheio com velocidade acima de 50 km/h; fora da manobra de drift, único contexto em que `oversteer` ou `sliding` podem ocorrer |
| Condução normal | Passo em que a condição de forçar não se mantém **e** a manobra de drift não está em andamento |
| Curva de referência | Curva de raio 18 m, o menor da pista sintética, percorrida a 50 km/h com esterço cheio |
| Velocidade de início do subesterço | Menor velocidade de entrada na curva de referência em que a telemetria reporta `understeer` por mais de 200 ms consecutivos; V0 na linha de base, V1 no novo acerto |
| Drift | Manobra de `requirements/11` que pontua; continua possível e continua pontuando |
| Direção comum | Pilotar sem a manobra de drift; permanece fácil |
| Velocidade estabilizada | Velocidade em reta com acelerador cheio mantido, após deixar de crescer |
| Grama | Superfície fora do asfalto que reduz a velocidade |
| Parede | Limite sólido da pista cujo contato reduz a velocidade |
| Asfalto | Superfície da pista; "sair do asfalto" é qualquer passo com o kart fora dela |
| Pista sintética | Pista de teste atual; menor raio de curva de 18 m |
| HUD | Elementos de tela que exibem a velocidade em km/h e o estado de aderência em texto durante a volta; já existem e não regridem |
| Acerto agressivo | Conjunto de limites em vigor após a revisão 2 do seed (`DOMAIN/REF-02`): 180 ms / 250 ms de resposta do volante, 50 km/h na curva de referência, 0–60 km/h em 2,5 s, 105 km/h estabilizada, volta do piloto de teste em 25 s |
| Staging | Publicação de uma rodada de código para o teste do dono do produto no ciclo de fechamento humano (`DOMAIN/DEC-10`); não é critério desta especificação |
| Replay | Sequência de `Input` por passo gravada para uma pista, com a versão do acerto que a produziu |
| Texto compartilhado | Texto que o Jogador compartilha com o resultado de uma volta; contrato publicado (I3) |

## Enums e campos dos contratos

| Nome | Valores ou sentido | Onde |
|---|---|---|
| `handling` | `grip`, `understeer`, `oversteer`, `sliding` | [RULE-0001](rules/RULE-0001-estado-de-aderencia-e-condicao-de-forcar.md) |
| `surface` | `ASPHALT`, `GRASS` | [API-0001](api/API-0001-telemetria-de-dirigibilidade.md) |
| `forcing`, `driftActive`, `wallContact` | booleanos por passo: condição de forçar mantida; manobra de drift em andamento; contato com a parede neste passo | API-0001 |
| `speedMps`, `sideslipRad`, `yawRateRadPerS` | velocidade em m/s; derrapagem lateral em rad; taxa de guinada em rad/s | API-0001 |
| `simStepCount` | passos de `STEP` desde o estado inicial da simulação; contador de sequência | API-0001 |
| `setupId` | `ARCADE_ASSISTIDO`, `REALISTA_ALUGUEL_4T` | [RULE-0003](rules/RULE-0003-versao-do-acerto-e-comparabilidade.md) |
| `setupVersion`, `previousSetupVersion` | identificador da versão corrente do acerto e da versão anterior à feature, declarados no dado publicado | [API-0002](api/API-0002-versao-do-acerto.md) |
| `setupVersionSource` | `DECLARED`, `RESOLVED_FROM_ABSENCE` | API-0002 |
| `replayStatus` | `READABLE`, `UNSUPPORTED_FORMAT`, `UNREADABLE` | API-0002 |
| `comparability` | `COMPARABLE`, `SETUP_VERSION_DIFFERS`, `SETUP_DIFFERS`, `TRACK_DIFFERS` | RULE-0003 |
| `benchId` | identificador de ensaio: `STEER_RESPONSE`, `REFERENCE_CORNER`, `UNDERSTEER_ONSET`, `NORMAL_DRIVING`, `REAR_RECOVERY`, `DRIFT_MANEUVER`, `ACCELERATION`, `TOP_SPEED`, `GRASS_LOSS`, `WALL_CONTACT`, `DETERMINISM`, `TEST_PILOT_LAP`, `SETUP_VERSION`, `STEP_CONTRACT`, `REALISTA_UNCHANGED`, `STEP_COST`; os campos medidos de cada ensaio são SI com a unidade no sufixo (`entrySpeedMps`, `v0Mps`, `v1Mps`, `topSpeedMps`, `zeroToSixtyKmhMs`…), apresentados também em km/h ou s na saída serializada e em `docs/physics.md` | [API-0003](api/API-0003-saida-dos-ensaios.md), [RULE-0002](rules/RULE-0002-ensaios-e-limiares.md) |
| `verdict` | `PASS`, `FAIL` | API-0003 |
| `failReason` | `THRESHOLD_EXCEEDED`, `BASELINE_MISSING`, `OFF_ASPHALT`, `NON_DETERMINISTIC`, `CONTRACT_CHANGED` | API-0003 |
| `inputMode` | `BINARY`, `PROPORTIONAL` — forma do `Input` usada no ensaio | API-0003 |
| `throttleCondition` | `THROTTLE_ZERO`, `THROTTLE_FULL` — acelerador mantido durante a curva de referência | API-0003 |
