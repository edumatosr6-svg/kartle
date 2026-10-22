---
title: Glossário — pista Kart Park
feature: pista-kart-park
stage: req
status: validated
version: 1.0.0
sources: [SEED, DOMAIN]
---

# Glossário

Os termos valem igualmente em `web-desktop` e `web-mobile`, salvo indicação.

| Termo | Definição | Canal |
|---|---|---|
| Jogador | Quem escolhe a pista no treino e pilota o kart | ambos |
| Curador do catálogo | Quem prepara a pista offline: conversão, suavização, linhas de volta e versão (`SEED.md`, Atores e canais) | nenhum (dado) |
| Kart Park | Pista real de kart em São José dos Pinhais (PR); primeira pista real do Kartle, identificada como `kart-park` | ambos |
| Pista sintética | A pista que o jogo já tem; continua selecionável e continua sendo a pista dos ensaios automáticos de `dirigibilidade` e `race-lap-validation` | ambos |
| Seletor de pista | Controle da tela inicial que oferece a Kart Park e a pista sintética para o treino (`SEED/US-1`) | ambos |
| Treino | Sessão de pilotagem livre numa pista escolhida no seletor; não gera tentativa nem resultado de desafio diário (I1, `DOMAIN/DEC-06`) | ambos |
| Desafio diário | Desafio do dia, ligado a um `challengeNumber` que resolve para uma pista e uma versão (I1); ainda não existe e é de outra feature | ambos |
| Traçado aproximado | Apresentação da Kart Park com a linha central suavizada e 8,3 % mais curta que o traçado oficial de 750 m (`DOMAIN/DEC-04`, `SEED/MED`) | ambos |
| Arquivo de origem | O traçado entregue pelo dono do produto: `kart-park.json`, formato `kartle-pista` v1, gerado do caminho OpenStreetMap `way/128739206` e de bordas detectadas na Esri World Imagery (`SEED.md`, Contexto) | nenhum (dado) |
| Arquivo de pista gerado | O arquivo da Kart Park produzido offline a partir do arquivo de origem, no formato que o jogo lê, com linha central suavizada, larguras, setores, chegada, marcadores, zebras e barreira | nenhum (dado) |
| Linha central original | A poligonal dos pontos do arquivo de origem, antes da suavização | nenhum (dado) |
| Linha central suavizada | A linha central do arquivo de pista gerado, depois da suavização | ambos |
| Suavização | Remoção do ruído da linha central original (0,09 m RMS, `SEED/MED`), com janela de cerca de 12 m (`DOMAIN/DEC-04`), sem afastar nenhum ponto mais de 0,30 m da linha central original (`DOMAIN/DEC-09`) | nenhum (dado) |
| Ponto 0 | O primeiro ponto da linha central, onde ficam a linha de largada e a linha de chegada | ambos |
| Distância de volta | Distância medida ao longo da linha central, a partir do ponto 0, no sentido de corrida, em metros | ambos |
| Sentido de corrida | Anti-horário, visto de cima (`SEED/MED`) | ambos |
| Eixos do jogo | Mapeamento das direções geográficas no jogo: leste = +x, norte = −z (`SEED/RE-03`) | ambos |
| Largura do asfalto | Largura da pista em cada ponto da linha central, medida ponto a ponto na imagem (de 4,4 m a 10,8 m, mediana 7,0 m); desvio aceito da regra geral "largura do OSM quando houver, senão 8 m" (`SEED/RD-03`) | ambos |
| Borda do asfalto | Cada uma das duas linhas a meia largura do asfalto da linha central, perpendicular a ela, uma de cada lado | ambos |
| Grampo | Curva de raio muito pequeno; a Kart Park tem dois, de raio ≈ 6 m, perto de 78 m e de 218 m de volta (`SEED/MED`) | ambos |
| Grama | Superfície fora do asfalto e da zebra; tem ≈ 40 % da aderência do asfalto (`DOMAIN/DEC-05`, referência) | ambos |
| Trechos quase encostados | Duas partes da pista que não se seguem ao longo da volta e têm 6 m de grama ou menos entre as bordas do asfalto; a medição do seed encontrou um par: ≈ 371–414 m e ≈ 580–615 m de volta (`SEED/US-4`, `SEED/MED`) | ambos |
| Atalho pela grama | Passagem do kart pela grama entre duas partes da pista que encurta a volta; os de 12 a 26 m de grama são invalidados pelos marcadores, sem barreira (`DOMAIN/DEC-10`) | ambos |
| Barreira | Obstáculo físico acrescentado por esta feature entre os trechos quase encostados; o kart bate e não passa (`DOMAIN/DEC-03`) | ambos |
| Muro existente | O obstáculo que o jogo já tem; a barreira tem o mesmo efeito de colisão que ele (`SEED/US-4`) | ambos |
| Zebra | Faixa declarada por lado (esquerda ou direita, no sentido de corrida) e por trecho de volta; conta como pista e dá a cada pneu 85 % da aderência do asfalto (`DOMAIN/DEC-05`) | ambos |
| Trecho de zebra | Uma zebra contínua entre duas distâncias de volta; o arquivo de origem tem 33, e o arquivo de pista gerado tem 34, porque a zebra que cruza a linha de largada é dividida nela (`SEED/US-5`) | ambos |
| Aderência | Capacidade do pneu de transmitir força ao chão; nesta feature é expressa em relação à do mesmo pneu no asfalto, nas mesmas condições | ambos |
| Vibração da zebra | Pulso de vibração do aparelho de 20 ms a cada 0,25 s enquanto houver ao menos uma roda na zebra, se o navegador permitir (`DOMAIN/DEC-05`) | `web-mobile` |
| Som da zebra | Som próprio de rodar na zebra: um ruído curto e grave que se repete enquanto houver ao menos uma roda na zebra, com o som ligado (`DOMAIN/DEC-11`) | `web-desktop` |
| Setor | Cada um dos quatro trechos da volta, com limites nos trechos de ligação entre curvas (RF09, `SEED/US-3`) | ambos |
| Limite de setor | Linha transversal à pista que separa dois setores; os três internos ficam perto de 201,6 m, 350,3 m e 529,9 m de volta | ambos |
| Linha de largada | Linha transversal no ponto 0 de onde o kart parte | ambos |
| Linha de chegada | Na Kart Park, a própria linha de largada (`SEED/US-3`) | ambos |
| Marcador de percurso | Ponto de controle ao longo da volta pelo qual a volta precisa passar para ser válida; na Kart Park, a no máximo 25 m um do outro (RF10, `SEED/US-3`) | ambos |
| Marcador pulado | Motivo de invalidação de uma volta que não passou por um marcador de percurso (RF10) | ambos |
| Corte | Invalidação da volta quando o kart fica mais de 3 m além da borda da pista por mais de 1000 ms; limites padrão de `race-lap-validation`, citados pelo seed | ambos |
| Saída de pista | Estado do kart fora da pista; rodar sobre a zebra não é saída (`SEED/US-5`) | ambos |
| Tela de resultado | Tela exibida ao fim de uma volta, com o tempo da volta | ambos |
| Crédito OSM | Linha com "© colaboradores do OpenStreetMap", a menção à licença ODbL e um link para `openstreetmap.org/copyright` (`DOMAIN/DEC-07`) | ambos |
| ODbL | Open Database License, a licença dos dados do OpenStreetMap | ambos |
| Esri World Imagery | Imagem de satélite sobre a qual foram medidas larguras, bordas e zebras; a licença para publicar dado derivado dela é decidida antes da promoção para produção (`DOMAIN/DEC-08`) | nenhum (dado) |
| Versão da pista | O `trackVersion` publicado de uma pista; uma versão publicada nunca muda, e mudar a pista é publicar versão nova (I3, I5) | nenhum (dado) |
| Staging / produção | Os dois ambientes de publicação; a Kart Park fica só em staging até a decisão sobre a licença Esri (`DOMAIN/DEC-08`) | ambos |
