# Notas — modelo-kart-01

Proveniência (a pipeline não lê este arquivo):

- 2026-10-22: Eduardo Matos pediu para trazer o kart feito no chat do Cowork. A sessão do Cowork
  (`cse_01AGzB1V9WhrqK6hfdp4V1LR`) não é acessível pelo Claude Code. A ficha publicada é o artefato de
  design https://claude.ai/artifact/TbeRnYeqGfw89rg3nLQYGX ("Kart 01 — Kartle"), com os quadros "Ficha do
  kart", "Vistas e medidas", "Peças separadas", "Piloto e capacete", "Câmera do jogo" e "Celular como
  volante". O artefato tem só imagens. O dono do produto vai salvar o código do modelo em `docs/kart-01/`.
- As medidas, cores, peças e a câmera do seed foram copiadas da ficha, sem nenhuma estimativa:
  comprimento 1,93 m; largura 1,45 m; entre-eixos 1,05 m; altura com piloto 0,95 m; rodas Ø 0,26 m e
  0,28 m (larguras 0,13 m e 0,19 m); bitolas de 1,00 m e 1,14 m; origem no chão, no meio do
  entre-eixos; frente −Z, direita +X e cima +Y; câmera 1,38 m acima e 3,05 m atrás, mira 3,2 m à frente
  a 0,30 m, FOV vertical 62°.
- Código atual, medido em `src/main.ts` no commit `8bb09da`:
  - o kart é um grupo de caixas com corpo de 1,30 × 0,35 × 2,15 m e para-choque de 1,45 m de largura;
  - as rodas são cilindros de raio 0,31 m (Ø 0,62 m), posicionados por `wheelPositions(ARCADE_KART)`;
  - a frente do modelo atual aponta para +Z (sentido de marcha da simulação), enquanto a ficha usa −Z;
  - a câmera de corrida fica 18 m atrás e 14 m acima, mira 9 m à frente a 0,5 m, com FOV base de 48°
    (`src/main.ts:17`, `:436–438`).
- Física (`src/physics.ts`): entre-eixos 1,04 m e bitola 1,20 m (`RENTAL_KART`), daí OPEN-02.
- 2026-10-22: o código do modelo chegou colado pelo dono do produto e foi salvo sem alteração em
  `docs/kart-01/kart.js` (exporta `criarKart`, `atualizarKart`, `explodirKart`, `criarPiloto`,
  `criarCapacete`, `atualizarBracos`, `posicionarTubo`, `CORES`, `MEDIDAS`). Medido com o Three.js
  r186 do projeto, em Node com um `canvas` simulado só para os adesivos (script fora do repositório):
  - caixa envolvente com piloto: 1,450 × 0,956 × 1,927 m (X × Y × Z), com Z de −0,990 a +0,936;
    sem piloto, altura de 0,590 m;
  - entre-eixos de 1,050 m e bitolas de 1,000 m (frente) e 1,140 m (trás), medidos nas posições das rodas;
  - as 16 peças nomeadas existem (as 15 da ficha e `piloto`);
  - 124 malhas, 24 materiais e 5.128 triângulos;
  - `atualizarKart` custa 0,008 ms por chamada (1.000 chamadas, média);
  - convenção do código: `direcao` positivo = esquerda, frente = −Z. A simulação usa a frente em +Z
    (rumo 0) e o esterço do teclado positivo = direita, então a integração precisa girar o modelo e
    conferir o sinal do esterço.
