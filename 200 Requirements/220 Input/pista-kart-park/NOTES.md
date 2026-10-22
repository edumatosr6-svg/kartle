# Notas — pista-kart-park

Proveniência (a pipeline não lê este arquivo):

- 2026-10-22: Eduardo Matos pediu para trazer a pista feita no chat do Cowork. O arquivo veio do artefato
  "Box do Kartle" (https://claude.ai/artifact/2La2Y2QhWRG9bNJYNEqLzA), `pistas/kart-park.json`, sha256
  `52c5adda4ce89bd2…`, copiado sem alteração para `kart-park.json` nesta pasta. O próprio arquivo
  declara as fontes: `OpenStreetMap way/128739206` (semente) e `Esri World Imagery (Esri, Maxar,
  Earthstar Geographics, and the GIS User Community)` (bordas), gerado em 2026-10-22T04:04:42Z.
- Nenhum número do seed foi copiado do arquivo sem medição. As medições usaram três métodos
  independentes, com os scripts em `medicoes/` (Python stdlib, `python -I`, cada um lê o JSON passado como
  argumento):
  - **A** (`a_raio_3pontos.py`): raio do círculo pelos pontos i−3, i, i+3 brutos; curvas = trechos com
    R < 60 m;
  - **B** (`b_rumo_suavizado.py`): média móvel de 7 pontos e raio = 1/|dθ/ds| em cordas de 2 m;
  - **C** (`c_arbitro.py`, `c_estabilidade.py`, `c_bordas_brutas.py`): árbitro das divergências entre
    A e B (regressão de rumo em janelas de 8, 12 e 16 m, folgas entre bordas com normais suavizadas,
    ruído pelo resíduo de uma cúbica local);
  - **D** (`d_fatos_do_seed.py`, `d_marcadores.py`, `d_largada.py`): fatos derivados para o seed
    (ligações entre curvas, atalhos, espaço para linhas, conversão de eixos).
- A e B concordaram em: 684 pontos; comprimento fechado de 687,52 m (passo de fechamento de 0,999 m);
  nenhuma auto-interseção; largura de 4,41 a 10,80 m (mediana 7,01, média 7,10); sentido anti-horário
  (área de shoelace +8076,7 m², giro total +360,0°); rumo de largada 234,77° (P0→P3); distância mínima
  entre linhas centrais não consecutivas de 7,39 m (386,5 m × 602,1 m); 33 zebras, 389,9 m.
- Divergências resolvidas por C:
  - quantidade de curvas: pela regra literal (R < 60 m), varia de 10 a 20 conforme a suavização. Com
    rumo consistente e giro ≥ 20°, são 14 curvas, estáveis de 13 a 15 em janelas de 8 a 16 m;
  - raio mínimo: ≈ 6,0 m em 218,7 m, no grampo de 205,6–225,9 m (≈ 104°). O ponto em 78,4 m quase empata,
    e o traçado não resolve entre os dois. Os valores brutos abaixo de 5,7 m vêm da janela, não da pista;
  - reta mais longa: ≈ 20 m dentro de ±0,3 m da corda (221,9–242,0 m). Não há reta de verdade;
  - folga entre bordas nos trechos encostados: 0,89 m (387,5 × 601,1 m) e 0,90 m (371,5 × 614,1 m).
    Outras aproximações de 6 m ou menos: 399,5 × 594,1 (3,37 m), 409,5 × 582,1 (5,08 m), 413,5 × 580,1
    (5,9 m). Uma grama de 6 m ou menos é invisível à regra de corte (2 × 3 m), daí a barreira;
  - ruído: 0,092 m RMS (cúbica local; p95 0,19 m, máx. 0,285 m), ou 0,125 m RMS contra a média de 7 pontos.
- Declarado × medido: `comprimento_m` 687,5 confere; `comprimento_oficial_m` 750 não confere (−8,33 %,
  o próprio arquivo admite −8,3 %); a zebra direita de 676,5–690,5 m passa 2,98 m da volta; o
  `recorde` 00:41.450 (KARTPLAN) vale para o traçado oficial e não é comparável.
- Limites de setor propostos: 201,6 / 350,3 / 529,9 m. Ficam em ligações entre curvas, com 18,6 a 55,5 m
  de espaço além das bordas antes de outro trecho da pista. Marcadores a no máximo 25 m deixam pelo
  menos 2 marcadores dentro do maior trecho que um atalho pela grama pula (50,5 m, por dentro da curva 4).
- Conversão para o jogo: x = leste e z = −norte. Usar z = +norte espelha o circuito e troca esquerda e
  direita.
- Pista sintética, para comparação: 240 pontos, 368,5 m, largura fixa de 11 m, sentido horário.
