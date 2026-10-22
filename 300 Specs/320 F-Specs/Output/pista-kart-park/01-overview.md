---
title: Visão geral — pista Kart Park
feature: pista-kart-park
stage: fspec
status: validated
version: 1.0.0
sources: []
---

# Visão geral

## O que é especificado

Esta especificação funcional diz o que o Kartle faz para ter a sua primeira pista real, a **Kart Park**
(São José dos Pinhais, PR), jogável no treino ao lado da pista sintética: o seletor de pista da tela
inicial, o arquivo de pista gerado offline (linha central suavizada, larguras ponto a ponto, chegada,
setores, marcadores, zebras e barreira), as regras de superfície e de colisão que a simulação aplica
nele, o retorno da zebra (vibração em `web-mobile`, som em `web-desktop`) e o crédito OpenStreetMap/ODbL
com o nome "traçado aproximado". A base é o conjunto de requisitos validado em
`200 Requirements/230 Output/pista-kart-park/` (US-0001 a US-0006, NFR-0001 a NFR-0012, versão 1.0.0),
que já carrega as decisões do dono do produto de 2026-10-22 (`DOMAIN/DEC-01` a `DOMAIN/DEC-11`, rótulos
definidos em `01-context.md` daquele conjunto). Todo número usado aqui vem desses requisitos, que o tomaram
das medições do seed.

O produto não tem servidor, conta nem sessão no MVP (RNF08, RNF10). Os contratos de `api/` são contratos
em processo dentro do navegador e nos ensaios, únicos para os dois canais, e não endpoints de rede; o
único papel é `player` (anônimo). Nomes de campo em `camelCase` plano com a unidade no sufixo (D-FS-06).

## Por canal

| Canal | O que esta especificação fixa |
|---|---|
| `web-desktop` | Seletor com as duas pistas, Kart Park selecionada ao abrir; pilotagem pelo teclado; zebras e barreira desenhadas; retorno da zebra só pelo som, com o som ligado; crédito no seletor e na tela de resultado |
| `web-mobile` | O mesmo seletor, a mesma pista e as mesmas regras; pilotagem por inclinação e toque, ou só toque com estado visível sem sensor ou sem permissão (I4); retorno da zebra pela vibração de 20 ms a cada 0,25 s, se o navegador permitir; o som da zebra é permitido e não exigido; o mesmo crédito |
| Preparo offline (Curador do catálogo) | Sem canal de jogo: gera o arquivo de pista da Kart Park a partir do arquivo de origem, verifica-o e o publica como `trackVersion` 1, só em staging até a decisão sobre a licença Esri |

Geometria, largura, zebra, barreira, setores, marcadores, aderência e colisão são idênticos nos dois
canais e decididos na simulação a partir do dado da pista (I2). Os canais diferem só no adaptador de
controle e no retorno da zebra.

## Mapa do conjunto

| Parte | Onde |
|---|---|
| Funcionalidades | `features/FEAT-0001` (seletor de pista no treino), `FEAT-0002` (forma, largura e versão do arquivo de pista), `FEAT-0003` (setores, chegada, marcadores e validação da volta), `FEAT-0004` (barreira nos trechos quase encostados), `FEAT-0005` (zebra com efeito), `FEAT-0006` (crédito, nome e comprimento), `FEAT-0007` (requisitos transversais) |
| Fluxos | `flows/FLOW-0001` (abertura do jogo, escolha e troca de pista), `FLOW-0002` (passo de simulação na Kart Park e retorno da zebra), `FLOW-0003` (preparo offline, verificação e publicação do arquivo de pista) |
| Contratos | `api/API-0001` (dado de pista com linha central, larguras, zebras e barreiras), `API-0002` (catálogo e seleção da pista do treino), `API-0003` (contato do kart com a pista: superfície por roda, borda da pista e barreira) |
| Telas | `screens/SCR-0001` (tela inicial com o seletor de pista), `SCR-0002` (crédito na tela de resultado), `SCR-0003` (Kart Park na tela de corrida e retorno da zebra) |
| Regras | `rules/RULE-0001` (superfície, borda da pista e obstáculos), `RULE-0002` (geometria e verificações do arquivo de pista gerado), `RULE-0003` (sessão de treino e seleção de pista), `RULE-0004` (retorno da zebra), `RULE-0005` (versão e publicação da pista) |

O índice (`00-index.md`) e a matriz de rastreabilidade (`99-traceability.md`) são gerados pelo gate e não
são escritos à mão.

## Camadas (I2)

A forma da pista, a superfície sob cada roda, a aderência na zebra, a colisão com a barreira, os setores,
os marcadores e o corte são decididos na simulação, a partir do arquivo de pista; a apresentação só
desenha a pista e exibe o estado, e os adaptadores de controle só entregam o `Input` normalizado (D-FS-05,
NFR-0007). O retorno da zebra (vibração e som) é efeito da apresentação disparado pelo estado da
simulação, nunca uma regra de pista. O preparo do arquivo é offline e fica fora do cliente (I10): o jogo não
suaviza, não converte e não edita pista.

## Contratos existentes nomeados, não redefinidos

| Contrato | Dono | O que este conjunto faz com ele |
|---|---|---|
| Dado de pista (`readTrackData`, `schemaVersion`, `trackId`, `trackVersion`, `direction`, `startPosition`, `finishLine`, `sectorLimits`, `markers`, `cutDistanceM`, `cutDurationMs`, `trackDataStatus`) | `race-lap-validation` (API-0003 daquele conjunto) | Acrescenta a versão de esquema 3, com linha central, larguras, zebras, barreiras e indicação de dado OSM ([API-0001](api/API-0001-dado-de-pista-com-geometria-zebras-e-barreiras.md)); a versão 2 continua lida como hoje |
| Volta (`startLap`, `getLapState`, `getLapResult`, `lapKind`, `lapValidity`, `invalidReason`, `lapMs`, `sectorMs`, `challengeNumber`) e as telas de início de volta, de corrida e de resultado | `race-lap-validation` | Usados sem mudança; este conjunto acrescenta o seletor à tela de início de volta, o crédito à tela de resultado e o desenho da Kart Park à tela de corrida |
| Telemetria de dirigibilidade (`getHandlingTelemetry`, `simStepCount`, `surface`, `wallContact`) | `dirigibilidade` (API-0001 daquele conjunto) | Lida sem mudança de nome, valor ou significado; a superfície por roda com a zebra e o contato com a barreira são campos novos de [API-0003](api/API-0003-contato-do-kart-com-a-pista.md) |
| `step(state, input, dt)`, `STEP`, `Input` | contrato de passo (I8) | Inalterados (NFR-0008) |

## Decisões de forma desta especificação

- **Esquema 3 do dado de pista.** O arquivo da Kart Park declara `schemaVersion` 3, que traz a linha
  central com a largura de cada ponto, as zebras e as barreiras. O arquivo da pista sintética continua na
  versão 2, sem nenhuma mudança (NFR-0009; nenhum critério muda a pista sintética), e continua lido como
  hoje, com a geometria existente. É mudança versionada com leitor da versão anterior (I3, I5), e não
  aditiva, porque um leitor da versão 2 que ignorasse a linha central desenharia a Kart Park com a
  geometria errada em silêncio; com a versão nova, ele rejeita o arquivo de forma visível
  (`UNSUPPORTED_SCHEMA`).
- **Correspondência por índice.** A linha central suavizada mantém os pontos do arquivo de origem, na
  mesma quantidade e na mesma ordem: o ponto *i* gerado corresponde ao ponto *i* da origem. É a leitura
  que torna decidíveis "o ponto correspondente" (AC-US-0002-05) e as distâncias medidas na linha central
  original (AC-US-0003-02, AC-US-0005-02): um fato do seed dado em distância de volta da linha original é
  levado à linha gerada pelo mesmo índice fracionário ([RULE-0002](rules/RULE-0002-geometria-e-verificacoes-do-arquivo-de-pista.md)).
- **A zebra fica fora do asfalto.** Cada zebra é uma faixa encostada na borda do asfalto, do lado
  declarado, para fora. Assim a largura do asfalto continua a do arquivo de origem em todo ponto
  (AC-US-0002-05), e a grama é o que fica fora do asfalto e da zebra, como o glossário dos requisitos a
  define.
- **Borda da pista.** A pista é o asfalto mais a zebra (a zebra conta como pista, AC-US-0005-04). A
  distância do corte e a saída de pista são medidas a partir da borda da pista: a borda do asfalto ou,
  onde houver zebra, a borda externa dela ([RULE-0001](rules/RULE-0001-superficie-borda-da-pista-e-obstaculos.md)).
- **Linhas transversais.** Linha de chegada, limites de setor e marcadores atravessam a pista no seu
  ponto, ao longo da normal, e se estendem `cutDistanceM` além da borda da pista de cada lado, parando
  antes de uma barreira ou de outra parte da pista. Um kart dentro da distância que não é corte cruza todas
  elas; um atalho pela grama mais largo que isso pula marcadores (AC-US-0003-09, `DOMAIN/DEC-10`).
- **Obstáculos da Kart Park.** Os únicos obstáculos da Kart Park são as barreiras declaradas no seu
  arquivo. Um muro derivado da linha central, como o da pista sintética, ficaria na grama entre partes da
  pista com mais de 6 m de grama, o que AC-US-0004-02 proíbe.
- **Catálogo do treino.** O nome exibido, o comprimento exibido (687 m) e a indicação de crédito OSM
  ficam no catálogo das pistas do seletor ([API-0002](api/API-0002-catalogo-e-selecao-da-pista-do-treino.md)),
  não no arquivo de pista: o crédito tem de aparecer com a Kart Park selecionada mesmo se o arquivo dela
  não puder ser lido (AC-US-0006-01 a AC-US-0006-03), e nome e comprimento exibidos não estão entre as
  mudanças que exigem versão nova da pista (NFR-0006). O arquivo de pista declara `osmDerived`, a
  proveniência do dado (I6).
- **Retorno da zebra em tempo simulado.** O intervalo de 0,25 s entre pulsos de vibração e o intervalo
  entre repetições do som são contados em passos de `STEP` (I8, I9): com a simulação suspensa (pausa,
  perda de foco, perda do sensor), nenhum pulso ou repetição novo começa.
- **Textos.** O nome da Kart Park, o crédito e o rótulo "Pista sintética" são exibidos em português nos
  dois idiomas do jogo: os critérios fixam o nome e o crédito sem condição de idioma, e os requisitos
  dispensaram o idioma pt/en nesta feature. Os demais textos da tela inicial e da tela de resultado são os
  de `race-lap-validation`, nos dois idiomas, sem mudança.
- **Som da zebra em `web-mobile`.** Permitido e não exigido (MAY): os requisitos o declaram fora do que
  este conjunto exige, sem proibi-lo (US-0005, Canais).

## Lacunas deliberadas

Os requisitos não fixam os pontos abaixo; nenhum critério os pede, e esta especificação não os decide nem
os inventa:

| Ponto | Situação |
|---|---|
| Largura lateral de cada zebra | O arquivo de origem declara só o lado e o trecho de volta de cada zebra. O arquivo gerado declara a largura de cada uma (`widthM`, maior que 0); o valor é dado do preparo offline, decidido no D-Spec com a evidência registrada |
| Método e janela da suavização | Orientação de `DOMAIN/DEC-04` ("cerca de 12 m") ao design; o que se verifica é o resultado: 0,30 m de tolerância e 687,5 m ± 1 % |
| Intervalo entre repetições do som da zebra e o seu timbre | `DOMAIN/DEC-11` diz "ruído curto e grave que se repete"; o intervalo e o som são fixados no D-Spec, constantes; o que se exige é repetir com roda na zebra, não começar repetição sem roda na zebra, não tocar com o som desligado e ser diferente dos outros sons |
| Texto do crédito da Esri | Depende dos termos de uso que a decisão do dono do produto citar; até ela, a Kart Park não vai para produção (NFR-0012) |
| Se o link do crédito abre na mesma aba ou em outra | Qualquer das duas preserva os critérios: o treino não persiste dado (US-0001) e a perda de foco pausa a volta como hoje |
| Cerca ou muro no perímetro externo da Kart Park | Nenhum: o cenário além de asfalto, zebra, grama e barreiras é de outra feature (`SEED/FE-05`) |
| Origem das coordenadas do arquivo gerado | Decisão do preparo offline; só os eixos (leste = +x, norte = −z) e o metro são exigidos |
| Aparência da zebra e da barreira | Decisão de design; exige-se que a zebra apareça no lado declarado e a barreira em todo o seu comprimento |

## Fora do escopo

Idêntico ao dos requisitos:

- As outras duas pistas reais da etapa 3, um catálogo de pistas e o calendário do desafio diário
  (`SEED/FE-01`).
- Elevação do terreno (`SEED/FE-02`, I10).
- Medalhas e cores de setor (`SEED/FE-03`).
- Recorde da pista real e qualquer comparação com tempos reais (`SEED/FE-04`).
- O cenário além de asfalto, zebra, grama e barreiras, como árvores, tribuna e boxes (`SEED/FE-05`).
- O canal `remote-wheel` (pós-MVP, I10) e um editor de pista no jogo (I10).

## Como a especificação é verificada

Os critérios observados no arquivo de pista gerado são verificados lendo o arquivo
([RULE-0002](rules/RULE-0002-geometria-e-verificacoes-do-arquivo-de-pista.md)); os observados no estado da
simulação, avançando a simulação com `STEP` sem renderização (NFR-0007, I9); os observados na tela, no
som e na vibração, no estado da tela e com um registro dos pulsos e repetições pedidos por passo; a taxa de
quadros, por teste registrado nos aparelhos de referência de RNF03 (NFR-0002). A pista sintética continua
sendo a pista dos ensaios automáticos de `dirigibilidade` e de `race-lap-validation` (NFR-0009); os
ensaios desta feature usam a Kart Park.

**Ordem de entrega.** O código desta feature só começa depois que `dirigibilidade` passar nos testes e for
commitada (NFR-0011), porque as duas mudam os mesmos arquivos de simulação e de pista e `dirigibilidade`
congela as regras de volta enquanto está em andamento. Por decisão do autor para esta execução
(2026-10-22), a dependência é registrada no D-Spec, com a lista exata dos arquivos.
