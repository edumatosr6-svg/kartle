---
name: modelo-kart-01
description: Troca o kart provisório da cena pelo modelo Kart 01 (low-poly, escala real, peças nomeadas, piloto) e a câmera de perseguição alta pela câmera de jogo da ficha, atrás e perto do piloto. Ler antes de qualquer mudança no modelo do kart, no piloto, na câmera de corrida ou nos efeitos presos ao kart.
revision: 1
date: 2026-10-22
author: eduardo.matos
channels: [web-desktop, web-mobile]
---

> **RASCUNHO — revisão humana obrigatória antes de qualquer loop.** Redigido a partir da ficha de design
> "Kart 01 — Kartle" (https://claude.ai/artifact/TbeRnYeqGfw89rg3nLQYGX) e do código do modelo,
> `docs/kart-01/kart.js`, trazido do chat do Cowork. Todas as medidas do modelo e do código atual foram
> medidas em 2026-10-22 e estão em `NOTES.md`.

## Visão geral

O kart que o jogador vê hoje é um volume provisório de caixas, maior que um kart real e visto de uma
câmera alta e distante. Esta feature coloca na pista o **Kart 01**: um kart de aluguel low-poly em escala
real, com chassi, rodas, nariz, sidepods, para-choque com o número 01, banco, direção, pedais, motor e um
piloto de macacão azul e capacete branco. A câmera de corrida passa a ficar atrás e perto do piloto,
como na ficha, para que o jogador sinta que está pilotando um kart.

## Contexto

O dono do produto testou o build publicado e relatou que "não parece que estou dirigindo um kart". A
física está sendo refeita na feature `dirigibilidade`. Esta feature cuida do que o jogador **vê**: o
modelo e a câmera. A ficha de design define medidas, peças, cores, piloto e a câmera de jogo. O código
que monta o modelo foi escrito no chat do Cowork e está em `docs/kart-01/kart.js`. Ele é a fonte do
modelo, e a ficha é a referência para conferir o resultado.

## Atores e canais

| Ator | Canal | O que faz |
|---|---|---|
| Jogador | `web-desktop` | Vê o kart e a pista pela câmera de corrida enquanto pilota com o teclado |
| Jogador | `web-mobile` | O mesmo no celular, em paisagem ou retrato |

`remote-wheel` (o quadro "Celular como volante" da ficha) está fora do escopo: é pós-MVP.

## Histórias de usuário

- **US-1** Como Jogador, quero ver um kart de verdade na pista, para reconhecer o que estou pilotando.
  - O kart exibido tem comprimento de 1,93 m, largura de 1,45 m e entre-eixos de 1,05 m, com tolerância de ±2 cm.
  - As rodas dianteiras têm Ø 0,26 m e as traseiras Ø 0,28 m, com bitolas de 1,00 m na frente e 1,14 m atrás.
  - O kart exibe as peças do quadro "Peças separadas" da ficha como 15 grupos nomeados: `chassi`,
    `eixoTraseiro`, `rodaDianteiraEsq`, `rodaDianteiraDir`, `rodaTraseiraEsq`, `rodaTraseiraDir`, `nariz`,
    `painelFrontal`, `sidepodEsq`, `sidepodDir`, `paraChoqueTraseiro`, `banco`, `direcao`, `pedais` e
    `motor`. O piloto é um 16º grupo à parte, `piloto`.
  - As cores seguem a ficha: laranja Kartle `#FF6A13`, grafite do chassi `#2B2E34`, placa branca
    `#F4F3EF` com o número 01 e macacão azul `#2F55D4`.
- **US-2** Como Jogador, quero que o kart reaja ao que faço, para ver o efeito dos meus comandos.
  - As rodas dianteiras esterçam com o ângulo de esterço que a simulação informa a cada quadro.
  - As quatro rodas giram de acordo com a velocidade do kart.
  - O volante gira com o esterço, e os braços do piloto acompanham o volante.
  - O kart exibido fica na posição e com o rumo que a simulação informa, com a frente do modelo
    apontando no sentido de marcha.
- **US-3** Como Jogador, quero a câmera atrás e perto do kart, para sentir velocidade e proximidade da pista.
  - Em corrida, a câmera fica 1,38 m acima do chão e 3,05 m atrás do kart, mirando um ponto 3,2 m à
    frente e 0,30 m acima do chão, com campo de visão vertical de 62°.
  - A câmera acompanha o rumo do kart sem cortes. Uma curva de 90° a 50 km/h não faz o kart sair do quadro.
  - O efeito de campo de visão que já existe para o turbo continua funcionando a partir dessa base.
- **US-4** Como Jogador, quero que o kart novo não deixe o jogo mais lento.
  - Com o Kart 01 em cena, a taxa de quadros continua dentro de RNF03: 60 fps em notebook e 30 fps em
    celular intermediário.
- **US-5** Como Jogador, quero que os efeitos que já existem continuem presos ao kart.
  - Marcas de pneu, fumaça do escapamento e indicação de drift continuam aparecendo nas posições das
    rodas traseiras e do escapamento do Kart 01.

## Regras de domínio

| Regra | Fonte |
|---|---|
| A renderização mostra o estado da simulação e não decide nada | I2 |
| Passo fixo, presets e `Input` não mudam por causa do modelo | I8, feature `dirigibilidade` |
| Um único kart. Karts customizáveis estão fora do MVP | I10, `requirements/01` |
| Medidas, peças, cores, piloto e câmera vêm da ficha "Kart 01 — Kartle" | decisão do dono do produto, 2026-10-22 |
| A fonte do modelo é o código do Cowork salvo em `docs/kart-01/kart.js` | decisão do dono do produto, 2026-10-22 |

## Requisitos não funcionais

| Requisito | Limite |
|---|---|
| Taxa de quadros com o modelo | 60 fps em notebook e 30 fps em celular intermediário (RNF03) |
| Tamanho do download inicial | continua abaixo de 3 MB (RNF02) |
| Nova dependência de execução | nenhuma |
| Custo de desenho do kart | dentro do limite de OPEN-01 |

## Restrições

- Nenhuma mudança em `src/physics.ts`, `src/lap.ts`, `src/track.ts` ou nos presets. Motivo: a física é da
  feature `dirigibilidade`, e a validação de volta já está validada.
- O modelo é montado em Three.js 0.186, já usado pelo projeto. Se o código do Cowork usar outra versão,
  ele é adaptado, e nenhuma versão nova entra como dependência.
- As posições das rodas que a simulação usa para marcas de pneu e telemetria continuam vindo de
  `wheelPositions`. Motivo: esse é um contrato da simulação, e o modelo é só visual.

## Impacto no domínio

- **I2**: tudo fica na camada de aplicação, e a simulação não importa nada do modelo.
- **I8**: o contrato de passo não é tocado.
- **I9**: os critérios de forma e medida são verificados sobre o modelo montado (tamanho da caixa
  envolvente, nomes das peças). Os critérios de câmera e de taxa de quadros são verificados em tela.
- **I10**: um único kart, sem personalização.

## Riscos e incógnitas

- **OPEN-01** Orçamento de desenho do kart. Medido em `kart.js`: 124 malhas (124 chamadas de desenho),
  24 materiais e 5.128 triângulos. Qual é o máximo de chamadas de desenho do kart para caber em RNF03 no
  celular intermediário? Se for menor que 124, as malhas são agrupadas por material, sem mudar a forma.
- **OPEN-02** As medidas da física (entre-eixos de 1,04 m e bitola de 1,20 m) e as do modelo (1,05 m;
  1,00 m na frente e 1,14 m atrás) diferem. A física deve ser alinhada ao modelo? Se sim, isso é decisão
  da feature `dirigibilidade`, não desta.
- **OPEN-03** Câmera no celular em retrato: um campo de visão vertical de 62° fica estreito na
  horizontal. Mantém os 62° ou usa outro valor em retrato?
- **OPEN-04** Visão geral da pista antes da largada: hoje a câmera começa alta, vendo a pista toda.
  Isso continua antes da contagem, ou a câmera já começa atrás do piloto?
- **OPEN-05** Sombras: o kart projeta sombra no chão (custo de desempenho)?

## Fora do escopo

- Celular como volante (o quadro "Celular como volante" da ficha): pós-MVP.
- Mudanças na física, nos presets ou nas medidas usadas pela simulação (OPEN-02).
- Outros karts, cores escolhíveis ou adesivos personalizados (I10).
- Novas pistas e cenário. A pista real Kart Park é outra feature.
