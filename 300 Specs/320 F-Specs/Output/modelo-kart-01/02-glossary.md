---
title: Glossário — modelo Kart 01 e câmera de jogo
feature: modelo-kart-01
stage: fspec
status: draft
version: 1.0.0
sources: []
---

# Glossário

Os termos valem igualmente em `web-desktop` e `web-mobile`, salvo indicação. Os termos de domínio vêm do
glossário dos requisitos; os termos acrescentados aqui estão marcados "(F-Spec)"; as linhas de enum e de
campo são as dos contratos de `api/` e das regras de `rules/`.

## Termos de domínio

| Termo | Definição |
|---|---|
| Jogador | Quem pilota o kart e o vê pela câmera de corrida: com teclado (`web-desktop`) ou com inclinação e toque (`web-mobile`) |
| Kart 01 | O kart de aluguel low-poly em escala real, com piloto, definido pela ficha "Kart 01 — Kartle" e montado a partir do código do Cowork |
| Kart provisório | O volume de caixas exibido hoje como kart, maior que um kart real; retirado por esta feature |
| Fantasma | Kart exibido que reproduz uma volta gravada; quando o jogo o exibe, também é um kart exibido |
| Ficha "Kart 01 — Kartle" | Ficha de design que define medidas, peças, cores, piloto e câmera de jogo do Kart 01; referência para conferir o resultado |
| Código do Cowork | O código que monta o modelo, escrito no chat do Cowork e salvo sem alteração no repositório (requisitos, `01-context.md`, `SEED/RD-05`); fonte do modelo; é adaptado à versão de biblioteca 3D já usada pelo projeto, sem mudar a forma |
| Modelo montado | O Kart 01 com o piloto, tal como montado para a cena do jogo; é sobre ele que forma, medidas, nomes de peças, cores e custo de desenho são verificados, na saída de `npm test` |
| Grupo de peça | Parte nomeada do modelo montado que exibe uma peça do quadro "Peças separadas" da ficha; são 15: `chassi`, `eixoTraseiro`, `rodaDianteiraEsq`, `rodaDianteiraDir`, `rodaTraseiraEsq`, `rodaTraseiraDir`, `nariz`, `painelFrontal`, `sidepodEsq`, `sidepodDir`, `paraChoqueTraseiro`, `banco`, `direcao`, `pedais`, `motor` |
| Grupo do piloto | O 16º grupo nomeado, `piloto`, fora dos 15 grupos de peças; contém o piloto de macacão azul e capacete branco, com os braços que acompanham o volante |
| Geometria visível | Pelo menos um triângulo do grupo numa malha marcada para ser desenhada (F-Spec) |
| Caixa envolvente do kart | Menor caixa alinhada aos eixos do kart que contém os 15 grupos de peças do modelo montado (sem o piloto); comprimento no eixo longitudinal, largura no eixo transversal |
| Entre-eixos | Distância, no eixo longitudinal do kart, entre o centro das rodas dianteiras e o centro das rodas traseiras |
| Bitola | Distância, no eixo transversal do kart, entre os centros das duas rodas de um mesmo eixo |
| Diâmetro da roda (Ø) | Diâmetro externo da roda com o pneu |
| Medida ao centímetro | Valor medido arredondado ao centímetro e comparado ao valor que os requisitos dão com duas casas decimais em metros |
| Placa do para-choque | Placa branca do para-choque do Kart 01 que exibe o número 01 |
| Volante | Aro de direção exibido diante do piloto, que gira com o esterço |
| Escapamento | Saída de gases do Kart 01, de onde sai a fumaça do escapamento |
| Chamada de desenho do kart | Unidade de custo de desenho, contada como o seed contou as 124 do código do Cowork: uma por malha e por material de cada malha do modelo montado, kart com o piloto; a passagem de sombra não entra na contagem |
| Agrupamento por material | Junção das malhas do modelo que usam o mesmo material, sem mudar a forma, para reduzir as chamadas de desenho; rodas, volante e braços continuam animáveis um a um, e nenhum dos 16 grupos nomeados perde a sua geometria visível |
| Posição do kart | O ponto que a simulação informa como posição do kart no chão (`xM`, `zM`); referência de "atrás" e "à frente" da câmera |
| Rumo | Direção para onde aponta a frente do kart, tal como a simulação informa (`headingRad`); o sentido de marcha para a frente |
| Ângulo de esterço | Ângulo das rodas dianteiras em relação ao chassi que a simulação informa para cada quadro (`steerAngleRad`) |
| Ponto de referência do kart exibido | (F-Spec) O ponto do modelo exibido posto na posição do kart: na linha central longitudinal do modelo, no chão, entre o eixo traseiro e o dianteiro do modelo, na mesma fração do entre-eixos em que a posição da simulação fica entre as posições traseiras e dianteiras de `wheelPositions` ([RULE-0003](rules/RULE-0003-posicao-animacao-e-efeitos-do-kart-01.md)) |
| Velocidade de rolamento | (F-Spec) A velocidade do kart em módulo, com sinal negativo quando o movimento é para trás em relação ao rumo (`rollingSpeedMps`); mesma em derrapagem, sem escorregamento por roda |
| Taxa de rolamento | Velocidade de rolamento em m/s dividida por π vezes o diâmetro da roda em m, em rotações por segundo |
| Giro da roda | Rotação acumulada de uma roda exibida em torno do seu eixo, em rotações (`spinRevs`) |
| Quadro | Uma imagem exibida na tela |
| Passo | Um avanço da simulação com o passo fixo `STEP`; contado por `simStepCount` |
| Tempo simulado | Número de passos vezes `STEP`; nunca o relógio de parede |
| Suspensão | Pausa, perda de foco da aba ou perda do sensor: a simulação não avança |
| Em corrida | Do sinal verde em diante, enquanto o Jogador pilota; termina no fim da volta (`lapPhase` `ENDED`) |
| Câmera de corrida | Câmera de jogo da ficha, usada em corrida: 1,38 m acima do chão, 3,05 m atrás do kart, mirando um ponto 3,2 m à frente do kart e 0,30 m acima do chão |
| Pose de corrida | Posição e ponto de mira da câmera de corrida em relação ao kart exibido |
| Modo da câmera | (F-Spec) `TRACK_OVERVIEW`, `COUNTDOWN_DESCENT` ou `RACE_CHASE` ([RULE-0002](rules/RULE-0002-camera-de-jogo.md)) |
| Chão | O plano da pista, sem elevação (I10) |
| Campo de visão vertical / horizontal | Ângulo de abertura da câmera na vertical / na horizontal da área de jogo exibida, em graus |
| Área de jogo | Região da tela em que a cena é desenhada; a sua largura e altura decidem a forma |
| Paisagem | Área de jogo mais larga que alta ou tão larga quanto alta |
| Retrato | Área de jogo mais alta que larga; em `web-desktop`, uma janela mais alta que larga também é retrato |
| Corte | Quadro em que a câmera deixa a pose de corrida em relação ao kart exibido, passando a outro ponto de vista |
| Visão geral da pista | Vista do alto em que a pista inteira aparece no quadro; a vista antes da contagem regressiva |
| Descida | (F-Spec) Movimento da câmera, durante a contagem regressiva, da visão geral até a pose de corrida |
| Contagem regressiva | Contagem exibida antes da largada, de 3000 ms de tempo de simulação, que termina no sinal verde; já existe no jogo (`race-lap-validation`) |
| Sinal verde | Fim da contagem regressiva e início da corrida |
| Volta encerrada | Volta em `lapPhase` `ENDED`, por conclusão ou invalidação (`race-lap-validation`) |
| Efeito de turbo no campo de visão | Variação do campo de visão vertical aplicada enquanto o turbo está ativo; já existe no jogo e continua, a partir da nova base de campo de visão vertical |
| Marcas de pneu | Rastros deixados no chão pelas rodas traseiras |
| Fumaça do escapamento | Fumaça exibida saindo do escapamento do kart |
| Indicação de drift | Efeito visual exibido junto às rodas traseiras durante o drift |
| `wheelPositions` | Posições das rodas que a simulação informa e usa para marcas de pneu e telemetria; contrato da simulação, citado da seção Restrições do seed (via NFR-0007) |
| Sombra do kart | Sombra que o kart exibido projeta no chão |
| Taxa de quadros | Quadros exibidos por segundo (fps), contados a cada segundo |
| Taxa de quadros sustentada | Taxa de quadros que não fica abaixo do limite em nenhum segundo do intervalo medido |
| Aparelhos de referência de RNF03 | O notebook e o celular intermediário escolhidos para medir RNF03 e nomeados no teste registrado |
| Download inicial | Bytes transferidos, com compressão, para carregar o jogo numa primeira visita com cache vazio |
| Dependência de execução | Biblioteca que o jogo carrega para rodar no navegador |
| Linha de base | Valor medido pela mesma verificação antes desta feature, para comparar com o valor depois dela |
| Sensor de inclinação | Sensor do celular que alimenta a direção em `web-mobile`; ausente ou com permissão negada, o controle recai para toque com estado visível (I4); esta feature não muda esse comportamento |

## Enums e campos dos contratos

| Nome | Valores ou sentido | Onde |
|---|---|---|
| `simStepCount` | Passos de `STEP` desde o estado inicial da simulação; contador de sequência; mesmo significado que na telemetria de dirigibilidade | [API-0001](api/API-0001-estado-do-kart-para-exibicao.md), [API-0003](api/API-0003-camera-da-cena-exibida.md) |
| `xM`, `zM` | Coordenadas da posição do kart no chão, em metros, no referencial da pista | API-0001 |
| `headingRad`, `steerAngleRad` | Rumo e ângulo de esterço, em radianos, na convenção da simulação | API-0001 |
| `rollingSpeedMps` | Velocidade de rolamento, em m/s, com sinal | API-0001 |
| `cameraMode` | `TRACK_OVERVIEW` (visão geral), `COUNTDOWN_DESCENT` (descida), `RACE_CHASE` (câmera de corrida) | API-0003, [RULE-0002](rules/RULE-0002-camera-de-jogo.md) |
| `viewShape` | `LANDSCAPE` (paisagem), `PORTRAIT` (retrato) | API-0003, RULE-0002 |
| `cameraXM`, `cameraZM`, `cameraHeightM` | Posição da câmera: coordenadas no chão e altura acima do chão, em metros | API-0003 |
| `aimXM`, `aimZM`, `aimHeightM` | Ponto de mira da câmera: coordenadas no chão e altura acima do chão, em metros | API-0003 |
| `verticalFovDeg`, `horizontalFovDeg` | Campo de visão vertical e horizontal exibidos, em graus | API-0003 |
| `baseVerticalFovDeg`, `turboFovDeltaDeg` | Campo de visão vertical sem turbo na forma corrente; diferença do efeito de turbo existente para o estado de turbo corrente, em graus | API-0003 |
| `viewWidthPx`, `viewHeightPx` | Largura e altura da área de jogo, em pixels | API-0003 |
| `checkId` | `KART_DIMENSIONS`, `WHEELS_AND_TRACKS`, `PART_GROUPS`, `PART_COLORS`, `DRAW_COST`, `WHEEL_SPIN`, `LAYERING`, `RENDER_NEUTRAL`, `SIM_CONTRACT`, `DETERMINISM`, `WHEEL_POSITIONS`, `TELEMETRY_WHEEL_POSITIONS` | [API-0002](api/API-0002-relatorio-do-modelo-montado.md) |
| `verdict` | `PASS`, `FAIL` | API-0002 |
| `checkFailReason` | `OUT_OF_TOLERANCE`, `GROUP_MISSING`, `GROUP_NESTED`, `COLOR_MISMATCH`, `LIMIT_EXCEEDED`, `SHAPE_CHANGED`, `SPIN_MISMATCH`, `FORBIDDEN_IMPORT`, `STATE_DIFFERS`, `CONTRACT_CHANGED`, `NON_DETERMINISTIC`, `BASELINE_MISSING` | API-0002 |
| `lapPhase`, `countdownRemainingMs` | Fase da volta e tempo de simulação que falta para o sinal verde; do contrato de estado da volta de `race-lap-validation` (`getLapState`), nomeados e não redefinidos | RULE-0002 |
