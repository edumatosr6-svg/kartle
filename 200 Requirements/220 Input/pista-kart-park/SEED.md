---
name: pista-kart-park
description: Primeira pista real do Kartle, a Kart Park (São José dos Pinhais, PR), jogável no treino ao lado da pista sintética por um seletor, com traçado suavizado e apresentado como aproximado, barreira entre trechos quase encostados, zebras com efeito, quatro setores, marcadores de percurso e crédito OpenStreetMap/ODbL. Ler antes de qualquer trabalho com pistas reais, seleção de pista, zebras ou atribuição de dados de mapa.
revision: 1
date: 2026-10-22
author: eduardo.matos
channels: [web-desktop, web-mobile]
---

> **RASCUNHO: revisão humana obrigatória antes de qualquer loop.** Redigido a partir de
> `kart-park.json` (nesta pasta, copiado do artefato "Box do Kartle") e das decisões do dono do produto
> de 2026-10-22, gravadas em `DOMAIN.md`. Todo número abaixo foi medido no traçado bruto por três
> medições independentes, e não copiado do arquivo. Os scripts estão em `medicoes/` e a origem de cada
> número está em `NOTES.md`.

## Visão geral

O Kartle ganha sua primeira pista real, a **Kart Park**, em São José dos Pinhais (PR). Ela fica ao lado
da pista sintética, e o jogador escolhe uma das duas no treino livre. A pista é apresentada como
**traçado aproximado** da pista real: a linha central, que veio de satélite, é suavizada. Uma barreira
física separa os dois trechos que quase se encostam, as zebras têm efeito na pilotagem e a volta tem
quatro setores. O crédito ao OpenStreetMap aparece onde o jogador vê a pista.

## Contexto

`requirements/08` (etapa 3) prevê três pistas reais com revisão visual e corrida completa. Esta é a
primeira. O traçado (`kart-park.json`, formato `kartle-pista` v1) foi gerado pelo dono do produto a partir
do caminho OpenStreetMap `way/128739206` e de bordas detectadas em imagem Esri World Imagery. O arquivo
não traz linha de chegada, limites de setor nem marcadores. Lido como está, ele seria uma pista
incompleta, só de treino (decisão OPEN-10 de `race-lap-validation`). A pista sintética continua existindo
como pista de teste dos ensaios automáticos (`dirigibilidade`, `race-lap-validation`).

Medições do traçado bruto, de três métodos independentes (`NOTES.md`):

| Fato | Valor medido |
|---|---|
| Comprimento da volta fechada | 687,5 m. O oficial é 750 m, então o traçado está 8,3 % mais curto. |
| Pontos | 684, a cada 1,00 m em média (0,97 a 1,05 m), fechando no ponto 0 |
| Sentido | anti-horário, visto de cima |
| Largada | ponto 0, rumo 234,7° (bússola) |
| Largura do asfalto | 4,4 a 10,8 m, mediana 7,0 m |
| Curvas | 14, com dois grampos de raio ≈ 6 m (perto de 78 m e de 218 m de volta) |
| Ruído da linha central | 0,09 m RMS, com comprimento de onda de 8 a 13 m |
| Trechos quase encostados | entre ≈ 371–414 m e ≈ 580–615 m de volta, com 0,9 m a 6 m de grama entre as bordas |
| Zebras | 33 trechos, 389,9 m no total. Uma passa 3 m da linha de largada. |
| Tamanho do arquivo | 32.189 bytes |

## Atores e canais

| Ator | Canal | O que faz |
|---|---|---|
| Jogador | `web-desktop` | Escolhe a pista no treino e pilota com o teclado |
| Jogador | `web-mobile` | O mesmo no celular, com inclinação e toque, e sente a vibração da zebra |
| Curador do catálogo | dado de pista | Prepara a pista offline: conversão, suavização, linhas de volta e versão |

## Histórias de usuário

- **US-1** Como Jogador, quero escolher a pista do treino, para pilotar numa pista real.
  - A tela inicial oferece um seletor com a Kart Park e a pista sintética.
  - A Kart Park vem selecionada quando o jogo abre.
  - O seletor só oferece treino. Nenhuma pista escolhida no seletor gera resultado de desafio diário.
  - Trocar de pista coloca o kart na largada da pista escolhida, sem volta em andamento.
- **US-2** Como Jogador, quero que a Kart Park tenha a forma da pista real, para reconhecer o traçado.
  - A volta mede 687,5 m ± 1 %, no sentido anti-horário, a partir da linha de largada no ponto 0.
  - A largura do asfalto varia ponto a ponto como no arquivo (4,4 a 10,8 m), sem uma largura fixa.
  - A linha central suavizada não se afasta mais que a tolerância de OPEN-02 da linha original em
    nenhum ponto, e o comprimento é medido de novo depois da suavização.
  - O grampo mais fechado (raio ≈ 6 m, perto de 218 m) é pilotável: as bordas do asfalto não se cruzam.
- **US-3** Como Jogador, quero que uma volta na Kart Park tenha setores e seja validada como na pista
  sintética, para que meu tempo de treino seja comparável entre voltas.
  - A volta tem 4 setores, com limites nos trechos de ligação entre curvas, perto de 201,6 m, 350,3 m e
    529,9 m de volta. A chegada é a linha de largada.
  - Marcadores de percurso existem a no máximo 25 m um do outro ao longo da volta.
  - Uma volta que pula um marcador é inválida, com o motivo "marcador pulado".
  - O corte usa os limites padrão: mais de 3 m além da borda por mais de 1000 ms (OPEN-01 de
    `race-lap-validation`).
- **US-4** Como Jogador, quero que os trechos quase encostados tenham uma barreira, para que ninguém
  corte um terço da volta.
  - Em todo trecho em que a grama entre duas partes não consecutivas da pista mede 6 m ou menos
    (medido: ≈ 371–414 m contra ≈ 580–615 m de volta), existe uma barreira física entre elas.
  - O kart não atravessa a barreira em nenhuma velocidade. Bater nela tem o mesmo efeito que bater no
    muro que já existe.
  - A barreira não invade o asfalto de nenhum dos dois trechos.
- **US-5** Como Jogador, quero sentir a zebra, para usar e respeitar a zebra como num kart de verdade.
  - As zebras do arquivo aparecem no lado declarado. A zebra que cruza a linha de largada aparece
    dividida dos dois lados da linha, num total de 34 trechos.
  - Rodar sobre a zebra conta como estar na pista: não conta como saída nem para o corte.
  - Cada pneu sobre a zebra tem 85 % da aderência que teria no asfalto.
  - No celular, enquanto houver ao menos uma roda na zebra, o aparelho vibra 20 ms a cada 0,25 s, se o
    navegador permitir.
  - No teclado, rodar na zebra produz um som próprio, quando o som está ligado.
- **US-6** Como Jogador, quero saber de onde vem a pista, para que os dados sejam creditados.
  - Com a Kart Park selecionada, o seletor e a tela de resultado mostram "© colaboradores do
    OpenStreetMap", a menção à licença ODbL e um link para `openstreetmap.org/copyright`.
  - O nome exibido é "Kart Park — São José dos Pinhais (traçado aproximado)", com o comprimento de
    687 m.
  - O recorde de 41,45 s da pista real não aparece, porque ele vale para o traçado oficial de 750 m.

## Regras de domínio

| Regra | Fonte |
|---|---|
| Circuito fechado de 400 a 1500 m | RF02 |
| Pista em metros e no sentido de corrida, preparada offline | RF03, RF06, I10 |
| Largura do OSM quando houver, senão 8 m. Aqui a largura é medida ponto a ponto na imagem, um desvio aceito. | RF04, decisão de 2026-10-22 |
| Asfalto, zebras nas curvas, grama e barreiras | RF07 |
| Largada, 4 setores e chegada | RF09 |
| Volta que pula marcador é inválida | RF10, `race-lap-validation` |
| Uma pista publicada nunca muda em sua versão. Mudar é publicar versão nova. | I3, I5 |
| Crédito OSM e menção à ODbL quando houver dado OSM | RNF09, D-DP-04 ratificado |
| Seletor só de treino. A escolha de pista do desafio diário é de outra feature. | I1, RF14, decisão de 2026-10-22 |
| Suavizar e apresentar como traçado aproximado | decisão de 2026-10-22 |
| Barreira física nos trechos quase encostados | decisão de 2026-10-22 |
| Zebra conta como pista, com 85 % de aderência e vibração no celular | decisão de 2026-10-22 |

## Requisitos não funcionais

| Requisito | Limite |
|---|---|
| Arquivo da pista | menor que 200 KB (RNF02) |
| Taxa de quadros na Kart Park | 60 fps em notebook e 30 fps em celular intermediário (RNF03) |
| Determinismo | mesmas entradas, mesmo tempo e mesmos setores na Kart Park (RNF07) |
| Jogar sem servidor | sim (RNF08) |
| Crédito visível | 100 % das telas listadas em US-6 com a Kart Park selecionada (RNF09) |

## Restrições

- A pista sintética continua sendo a pista dos ensaios automáticos de `dirigibilidade` e de
  `race-lap-validation`. Motivo: esses ensaios têm números calibrados nela.
- O código desta feature só começa depois que `dirigibilidade` passar nos testes e for commitada.
  Motivo: as duas mudam `src/physics.ts` e `src/track.ts`, e `dirigibilidade` congela as regras de
  volta enquanto está em andamento (NFR-0008 dela).
- A pista é convertida offline para o formato que o jogo lê, com os eixos do jogo: leste = +x,
  norte = −z. Motivo: I10; com outro mapeamento, o circuito fica espelhado.
- Nenhuma dependência nova de execução.

## Impacto no domínio

- **I1**: o seletor é só de treino. A pista de cada desafio diário continua sendo decidida pela feature
  do desafio.
- **I2**: geometria, largura, zebra e barreira entram na simulação como dado. A tela só desenha.
- **I3 / I5**: `kart-park` entra como versão 1. Suavizar de novo ou mudar a linha é uma versão nova.
- **I6**: crédito e licença dos dados derivados.
- **I8**: o contrato de passo não muda. O efeito da zebra é um dado de superfície.
- **I10**: nenhum editor de pista no jogo.

## Riscos e incógnitas

- **OPEN-01** Licença da imagem Esri: as larguras, bordas e zebras foram medidas sobre a Esri World
  Imagery. Pode-se publicar dado derivado dela? Quem decide, e com qual evidência? **Bloqueia só a
  promoção para produção.** Staging pode usar a pista.
- **OPEN-02** Tolerância da suavização: a proposta é que a linha suavizada fique a até 0,30 m da original
  em todo ponto (3 vezes o ruído medido). O dono do produto confirma esse valor?
- **OPEN-03** A medição mostra atalhos pela grama entre 12 e 26 m de largura (por exemplo, por dentro
  da curva 4, entre ≈ 147 m e ≈ 200 m). Os marcadores a cada 25 m invalidam esses atalhos. Isso basta, ou
  alguns deles também precisam de barreira?
- **OPEN-04** Qual é o som da zebra no teclado? Um ruído curto que se repete, ou outro?

## Fora do escopo

- As outras duas pistas reais da etapa 3, um catálogo de pistas e o calendário do desafio diário.
- Elevação do terreno (I10).
- Medalhas e cores de setor (D15, D16).
- Recorde da pista real e qualquer comparação com tempos reais.
- O cenário além de asfalto, zebra, grama e barreiras, como árvores, tribuna e boxes, que é de outra
  feature.
