---
title: Contexto — pista Kart Park
feature: pista-kart-park
stage: req
status: validated
version: 1.0.0
sources: [SEED, DOMAIN]
---

# Contexto

## O que é a feature

O Kartle ganha sua primeira pista real, a **Kart Park**, em São José dos Pinhais (PR). Ela entra **ao
lado** da pista sintética, e o Jogador escolhe uma das duas no treino livre por um seletor de pista
(`SEED.md`, Visão geral; `DOMAIN/DEC-01`). A Kart Park é apresentada como **traçado aproximado** da pista
real: a linha central, que veio de satélite, é suavizada. Uma barreira física separa os dois trechos que
quase se encostam, as zebras têm efeito na pilotagem e a volta tem quatro setores. O crédito ao
OpenStreetMap aparece onde o Jogador vê a pista.

É a primeira das três pistas reais da etapa 3 de `requirements/08` (`SEED.md`, Contexto). O traçado de
origem (`kart-park.json`, formato `kartle-pista` v1, citado no Contexto do seed) foi gerado pelo dono do
produto a partir do caminho OpenStreetMap `way/128739206` e de bordas detectadas em imagem Esri World
Imagery. Esse arquivo não traz linha de chegada, limites de setor nem marcadores; este conjunto exige
que o arquivo de pista gerado offline os traga (US-0003).

**Compatibilidade.** Hoje o treino usa a pista sintética, a única existente (`SEED.md`, Visão geral).
Esta feature muda a pista com que o jogo abre: passa a ser a Kart Park (US-0001, `DOMAIN/DEC-06`). A
pista sintética **não é aposentada**: continua selecionável no seletor (US-0001) e continua sendo a pista
dos ensaios automáticos (NFR-0009). Nenhum critério deste conjunto muda a pista sintética.

**Padrão seguro.** O comportamento novo vale ligado por padrão assim que a feature é entregue, como o
seed pede ("A Kart Park vem selecionada quando o jogo abre"). É seguro ligado porque o seletor é só de
treino e não gera resultado de desafio diário (US-0001, I1), a pista sintética continua disponível e
intacta para os ensaios (NFR-0009) e a Kart Park fica só em staging até a decisão sobre a licença Esri
(NFR-0012).

Seed: `200 Requirements/220 Input/pista-kart-park/SEED.md`, `revision: 1`, `date: 2026-10-22`, autor
`eduardo.matos`. Camada de domínio durável: `DOMAIN.md` da mesma pasta, cujas decisões de 2026-10-22
prevalecem sobre os pontos em aberto correspondentes do seed. Todos os números do seed foram medidos pelo
dono do produto (`SEED.md`, Contexto).

## Atores e canais

| Ator | Canal | Papel nesta feature |
|---|---|---|
| Jogador | `web-desktop` | Escolhe a pista no treino e pilota com o teclado; ouve o som da zebra |
| Jogador | `web-mobile` | O mesmo no celular, com inclinação e toque; sente a vibração da zebra |
| Curador do catálogo | nenhum canal (dado de pista) | Prepara a pista offline: conversão, suavização, linhas de volta e versão. Os critérios observados no arquivo de pista gerado (US-0002 a US-0005) são o que ele entrega; o seed não lhe dá história própria |

Canal fora do escopo: `remote-wheel` (pós-MVP, I10). Nenhuma história deste conjunto o cobre.

Em todas as histórias, a pista, a geometria, as regras de volta, o efeito da zebra na aderência e a
barreira são idênticos em `web-desktop` e `web-mobile`. O que muda entre os canais é o dispositivo de
entrada e o retorno da zebra: vibração em `web-mobile`, som em `web-desktop` (US-0005, `DOMAIN/DEC-05`).
Em `web-mobile`, sensor de inclinação ausente ou permissão negada faz o controle recair para toque com
estado visível (I4, `[DOMAIN]`).

## Itens do seed e decisões de domínio (chave de rastreabilidade)

Os rótulos abaixo nomeiam os itens do seed e as decisões de `DOMAIN.md`, que não têm identificador
próprio. O `sources:` de cada história e de cada NFR os cita, e a matriz gerada (`99-traceability.md`)
liga cada rótulo aos itens deste conjunto. As decisões de `DOMAIN.md` são numeradas na ordem em que
aparecem no arquivo.

| Rótulo | Item |
|---|---|
| `SEED/US-1` … `SEED/US-6` | As seis histórias de usuário da seção Histórias de usuário, na ordem do seed |
| `SEED/MED` | A tabela de medições do traçado bruto da seção Contexto |
| `SEED/RD-01` | Circuito fechado de 400 a 1500 m (RF02) |
| `SEED/RD-02` | Pista em metros e no sentido de corrida, preparada offline (RF03, RF06, I10) |
| `SEED/RD-03` | Largura do OSM quando houver, senão 8 m; aqui medida ponto a ponto na imagem, um desvio aceito (RF04, decisão de 2026-10-22) |
| `SEED/RD-04` | Asfalto, zebras nas curvas, grama e barreiras (RF07) |
| `SEED/RD-05` | Largada, 4 setores e chegada (RF09) |
| `SEED/RD-06` | Volta que pula marcador é inválida (RF10, `race-lap-validation`) |
| `SEED/RD-07` | Uma pista publicada nunca muda em sua versão; mudar é publicar versão nova (I3, I5) |
| `SEED/RD-08` | Crédito OSM e menção à ODbL quando houver dado OSM (RNF09, D-DP-04 ratificado) |
| `SEED/RD-09` | Seletor só de treino; a escolha de pista do desafio diário é de outra feature (I1, RF14, decisão de 2026-10-22) |
| `SEED/RD-10` | Suavizar e apresentar como traçado aproximado (decisão de 2026-10-22) |
| `SEED/RD-11` | Barreira física nos trechos quase encostados (decisão de 2026-10-22) |
| `SEED/RD-12` | Zebra conta como pista, com 85 % de aderência e vibração no celular (decisão de 2026-10-22) |
| `SEED/NF-01` | Arquivo da pista menor que 200 KB (RNF02) |
| `SEED/NF-02` | Taxa de quadros na Kart Park: 60 fps em notebook e 30 fps em celular intermediário (RNF03) |
| `SEED/NF-03` | Determinismo: mesmas entradas, mesmo tempo e mesmos setores na Kart Park (RNF07) |
| `SEED/NF-04` | Jogar sem servidor (RNF08) |
| `SEED/NF-05` | Crédito visível em 100 % das telas de US-6 com a Kart Park selecionada (RNF09) |
| `SEED/RE-01` | A pista sintética continua sendo a pista dos ensaios automáticos de `dirigibilidade` e `race-lap-validation` |
| `SEED/RE-02` | O código desta feature só começa depois que `dirigibilidade` passar nos testes e for commitada |
| `SEED/RE-03` | Conversão offline para o formato que o jogo lê, com os eixos do jogo leste = +x, norte = −z |
| `SEED/RE-04` | Nenhuma dependência nova de execução |
| `SEED/IM-I1` | O seletor é só de treino; a pista de cada desafio diário é da feature do desafio |
| `SEED/IM-I2` | Geometria, largura, zebra e barreira entram na simulação como dado; a tela só desenha |
| `SEED/IM-I3I5` | `kart-park` entra como versão 1; suavizar de novo ou mudar a linha é versão nova |
| `SEED/IM-I6` | Crédito e licença dos dados derivados |
| `SEED/IM-I8` | O contrato de passo não muda; o efeito da zebra é um dado de superfície |
| `SEED/IM-I10` | Nenhum editor de pista no jogo |
| `SEED/RI-01` … `SEED/RI-04` | Os quatro riscos da seção Riscos e incógnitas, na ordem do seed (licença Esri, tolerância da suavização, atalhos pela grama, som da zebra) |
| `SEED/FE-01` … `SEED/FE-05` | Os cinco itens da seção Fora do escopo, na ordem do seed |
| `DOMAIN/DEC-01` | Entrada da pista: a Kart Park entra ao lado da pista sintética, com um seletor de pista |
| `DOMAIN/DEC-02` | Licença: usar os dados agora e mostrar o crédito OSM/ODbL; a dúvida sobre os dados derivados da Esri bloqueia só a promoção para produção; staging pode usar a pista |
| `DOMAIN/DEC-03` | Atalho entre trechos quase encostados: barreira física entre os trechos; o kart bate e não passa |
| `DOMAIN/DEC-04` | Fidelidade: suavizar a linha central com janela de cerca de 12 m; nome "Kart Park — São José dos Pinhais (traçado aproximado)"; comprimento medido de 687 m; o recorde real de 41,45 s não aparece |
| `DOMAIN/DEC-05` | Zebras: contam como pista e têm efeito; cada pneu sobre a zebra tem 85 % da aderência do asfalto (a grama tem ≈ 40 %); no celular, vibração de 20 ms a cada 0,25 s enquanto houver roda na zebra; no teclado, só o som |
| `DOMAIN/DEC-06` | Seletor: só para treino até o desafio diário existir; o jogo abre na Kart Park; a sintética fica selecionável e continua sendo a pista dos ensaios automáticos |
| `DOMAIN/DEC-07` | Crédito: "© colaboradores do OpenStreetMap", menção à ODbL e link para `openstreetmap.org/copyright` numa linha discreta no seletor de pista e na tela de resultado sempre que a pista for a Kart Park; o crédito da Esri entra junto se a licença for liberada |
| `DOMAIN/DEC-08` | Licença Esri: o dono do produto decide antes da promoção para produção, com base nos termos de uso da Esri; até lá, a Kart Park fica só em staging |
| `DOMAIN/DEC-09` | Tolerância da suavização: a linha central suavizada fica a até 0,30 m da original em todo ponto |
| `DOMAIN/DEC-10` | Atalhos pela grama de 12 a 26 m: os marcadores a cada 25 m bastam; barreira só nos trechos com 6 m de grama ou menos |
| `DOMAIN/DEC-11` | Som da zebra no teclado: um ruído curto e grave que se repete enquanto houver roda na zebra, com o som ligado |

## Decisões de domínio aplicadas

Os quatro riscos do seed foram fechados pelo dono do produto em 2026-10-22 (`SEED.md`, Riscos e
incógnitas). Não resta ponto em aberto neste conjunto.

| Decisão | Fecha | Histórias e NFRs |
|---|---|---|
| `DOMAIN/DEC-01` | — | US-0001 |
| `DOMAIN/DEC-02` | `SEED/RI-01` (uso dos dados agora) | US-0006, NFR-0012 |
| `DOMAIN/DEC-03` | — | US-0004 |
| `DOMAIN/DEC-04` | — | US-0002, US-0006 |
| `DOMAIN/DEC-05` | — | US-0005 |
| `DOMAIN/DEC-06` | — | US-0001, NFR-0009 |
| `DOMAIN/DEC-07` | — | US-0006, NFR-0005, NFR-0012 |
| `DOMAIN/DEC-08` | `SEED/RI-01` (quando e onde se decide) | NFR-0012 |
| `DOMAIN/DEC-09` | `SEED/RI-02` | US-0002 |
| `DOMAIN/DEC-10` | `SEED/RI-03` | US-0003, US-0004 |
| `DOMAIN/DEC-11` | `SEED/RI-04` | US-0005 |

A licença Esri (`SEED/RI-01`) bloqueia **só a promoção para produção**: não bloqueia nenhuma etapa de
especificação, e staging pode usar a pista (`DOMAIN/DEC-02`, `DOMAIN/DEC-08`). Esse limite é o NFR-0012.

A decisão de suavizar com janela de cerca de 12 m (`DOMAIN/DEC-04`) orienta o design; o que este
conjunto verifica é o resultado: a tolerância de 0,30 m e o comprimento de 687,5 m ± 1 % medido depois
da suavização (US-0002).

## Medições do traçado bruto (do seed, seção Contexto)

Medidas pelo dono do produto com três métodos independentes (`SEED/MED`). Os critérios que usam cada
fato estão indicados.

| Fato | Valor medido | Usado em |
|---|---|---|
| Comprimento da volta fechada | 687,5 m; o oficial é 750 m, o traçado está 8,3 % mais curto | US-0002, US-0006 |
| Pontos | 684, a cada 1,00 m em média (0,97 a 1,05 m), fechando no ponto 0 | US-0002 |
| Sentido | anti-horário, visto de cima | US-0002 |
| Largada | ponto 0, rumo 234,7° (bússola) | US-0002 e US-0003 (ponto 0); o rumo é contexto |
| Largura do asfalto | 4,4 a 10,8 m, mediana 7,0 m | US-0002 |
| Curvas | 14, com dois grampos de raio ≈ 6 m (perto de 78 m e de 218 m de volta) | US-0002 |
| Ruído da linha central | 0,09 m RMS, com comprimento de onda de 8 a 13 m | base da tolerância de 0,30 m (`DOMAIN/DEC-09`) |
| Trechos quase encostados | entre ≈ 371–414 m e ≈ 580–615 m de volta, com 0,9 m a 6 m de grama entre as bordas | US-0004 |
| Zebras | 33 trechos, 389,9 m no total; uma passa 3 m da linha de largada | US-0005 |
| Tamanho do arquivo | 32.189 bytes | NFR-0001 |

## Restrições (citadas do seed, seção Restrições)

- "A pista sintética continua sendo a pista dos ensaios automáticos de `dirigibilidade` e de
  `race-lap-validation`. Motivo: esses ensaios têm números calibrados nela." — NFR-0009, US-0001.
- "O código desta feature só começa depois que `dirigibilidade` passar nos testes e for commitada.
  Motivo: as duas mudam `src/physics.ts` e `src/track.ts`, e `dirigibilidade` congela as regras de
  volta enquanto está em andamento (NFR-0008 dela)." — NFR-0011. Por decisão do autor para esta execução
  (2026-10-22), essa dependência deve ser registrada no D-Spec.
- "A pista é convertida offline para o formato que o jogo lê, com os eixos do jogo: leste = +x,
  norte = −z. Motivo: I10; com outro mapeamento, o circuito fica espelhado." — US-0002.
- "Nenhuma dependência nova de execução." — NFR-0010.

## Famílias de requisitos não funcionais

| Família | Tratamento |
|---|---|
| Tamanho de download (RNF02) | Especificada: NFR-0001 |
| Taxa de quadros (RNF03) | Especificada: NFR-0002 |
| Determinismo (RNF07) | Especificada: NFR-0003, NFR-0008 |
| Disponibilidade / solo sem servidor (RNF08) | Especificada: NFR-0004 |
| Comportamento offline | Especificada por NFR-0004 no que toca serviços remotos; o seed não pede jogar sem a entrega dos arquivos do próprio jogo |
| Crédito e licença de dados (RNF09, I6) | Especificada: NFR-0005, NFR-0012 |
| Compatibilidade do dado de pista (I3, I5) | Especificada: NFR-0006 |
| Observabilidade / evidência (I9) | Especificada: NFR-0007; telemetria em tempo de execução dispensada — o produto não coleta dados (RNF10) |
| Restrições de entrega | Especificadas: NFR-0009 (pista dos ensaios), NFR-0010 (dependências), NFR-0011 (ordem do código), NFR-0012 (publicação) |
| Tempo até pilotar (RNF01) | Dispensada: o seed não fixa limite de carregamento para esta feature |
| Latência de entrada (RNF04) | Dispensada: a feature não altera o caminho de entrada e o seed não fixa limite |
| Suporte a navegadores (RNF05) | Dispensada como limite próprio: o único ponto dependente do navegador é a vibração, condicionada a o navegador permitir (US-0005) |
| Privacidade e consentimento (RNF10) | Dispensada: a feature não coleta nem grava dado pessoal; o link para `openstreetmap.org/copyright` só é seguido se o Jogador o acionar |
| Idioma pt/en (RNF11) | Dispensada: o seed fixa os textos do nome e do crédito só em português e não pede a versão em inglês nesta feature |
| Acessibilidade | Dispensada: o seed não fixa requisito de acessibilidade para esta feature; a zebra é desenhada na tela (US-0005), e a vibração e o som são retorno adicional a ela |
| Retenção de dados | Dispensada: a feature não persiste dado novo — a pista escolhida não é lembrada, o jogo sempre abre na Kart Park (US-0001) |
| Exposição por papéis (RBAC) | Dispensada: o produto não tem contas nem papéis (I10, RNF10) |
| Volume de mensagens | Dispensada: a feature não envia mensagens nem usa servidor |

## Fora do escopo (do seed, seção Fora do escopo)

- `SEED/FE-01` — As outras duas pistas reais da etapa 3, um catálogo de pistas e o calendário do desafio
  diário.
- `SEED/FE-02` — Elevação do terreno (I10).
- `SEED/FE-03` — Medalhas e cores de setor (D15, D16).
- `SEED/FE-04` — Recorde da pista real e qualquer comparação com tempos reais.
- `SEED/FE-05` — O cenário além de asfalto, zebra, grama e barreiras, como árvores, tribuna e boxes, que
  é de outra feature.
