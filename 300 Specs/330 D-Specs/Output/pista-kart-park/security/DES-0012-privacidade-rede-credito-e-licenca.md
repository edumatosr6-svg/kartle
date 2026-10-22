---
id: DES-0012
title: Privacidade, rede, crédito OSM/ODbL e licença Esri
feature: pista-kart-park
stage: dspec
status: validated
version: 1.0.1
sources: [FEAT-0001, FEAT-0006, FEAT-0007, RULE-0005, REQ-FEAT-0001-03, REQ-FEAT-0001-12, REQ-FEAT-0006-12, REQ-FEAT-0006-14, REQ-FEAT-0007-05, REQ-FEAT-0007-13]
---

# DES-0012 — Privacidade, rede, crédito OSM/ODbL e licença Esri

## Realiza

Os `REQ-*` em `sources`: a pista escolhida não é gravada nem lida no navegador (REQ-FEAT-0001-03) e nenhuma
volta de treino cria ou altera registro de desafio diário (REQ-FEAT-0001-12); 0 requisições a outros serviços
entre a escolha da Kart Park e o fim da volta, salvo a navegação que o Jogador inicia no link do crédito
(REQ-FEAT-0007-05); o crédito exibido sem rede (REQ-FEAT-0006-12); a Kart Park nunca promovida a produção
antes da decisão do dono do produto sobre a licença Esri, com o crédito da Esri na entrega que promover se a
decisão o liberar (REQ-FEAT-0007-13, REQ-FEAT-0006-14).

## Posicionamento

Não é um módulo: é uma restrição que atravessa `src/trainingSession.ts`, `src/lapMessages.ts` (textos do
crédito, [DES-0007](../web/DES-0007-tela-inicial-seletor-credito-e-resultado.md)), `src/main.ts`, `index.html` e o
preparo offline, com a sua verificação em `tests/pista-kart-park-layering.test.ts` e no registro de
publicação ([DES-0011](../pipeline/DES-0011-verificacoes-registro-de-publicacao-e-promocao.md)). Camada do
item: **aplicação** (dona da rede, do armazenamento e das telas).

## Autenticação e papéis

Não há caminho autenticado. O produto não tem sessão de usuário, conta nem papel além de `player` anônimo
(RNF10); os contratos API-0001 a API-0003 são em processo, no navegador.

| Pergunta | Resposta |
|---|---|
| Onde a sessão de usuário é verificada | em lugar nenhum: não existe; a "sessão de treino" é estado local da simulação, não identidade |
| Onde o papel é verificado | em lugar nenhum: o único papel é `player` anônimo; a decisão de aceitar ou recusar uma seleção ou uma volta é de estado, em `src/trainingSession.ts` e `src/lap.ts` |
| Webhooks | nenhum |
| Segredos | nenhum: nenhuma variável de ambiente, chave ou credencial é lida, nem no cliente nem no preparo offline (D-DS-06, I6) |

## Dados que a feature trata (D-DS-04)

| Dado | Onde vive | Para que serve | Persistido ou transmitido |
|---|---|---|---|
| arquivo de pista da Kart Park | `src/tracks/kart-park-v1.json`, no pacote do jogo | desenhar e simular a pista | publicado com o jogo; nunca enviado pelo cliente |
| `sessionState`, `selectedTrackId`, leitura e ambiente da sessão | memória da página | sessão de treino | não |
| `simStepCount`, `curbWheelCount` e o estado do retorno | memória da página | decidir vibração e som | não |
| registro de publicação | `tracks/registry.json`, no repositório | resumo, versão, estado de publicação, decisão Esri | no repositório, sem dado pessoal ([DM-0002](../data/DM-0002-registro-de-publicacao-e-estado-em-memoria.md)) |

Nenhum campo de identidade de jogador, de dispositivo, de posição geográfica do jogador nem de sensor bruto é
guardado ou transmitido. A escolha do canal (`pointer: coarse`) e a existência de `navigator.vibrate` são
lidas na hora e não guardadas.

## Rede e uso offline (D-DS-03)

O arquivo da Kart Park é empacotado no JavaScript do jogo pela importação `?raw`; o catálogo
(`src/trainingSession.ts`) e os textos do crédito (`src/lapMessages.ts`) são literais. Nenhum módulo desta
feature usa `fetch`, `XMLHttpRequest`, `WebSocket` ou `navigator.sendBeacon`; `src/main.ts` e
`src/lapMessages.ts` continuam cobertos pela proibição do teste de camada de `race-lap-validation`
(`tests/race-lap-validation-layering.test.ts:43-49`) e o teste de camada desta feature
estende a mesma lista a `src/trainingSession.ts`, `src/trackGeometry.ts`, `src/trackScene.ts` e
`src/curbFeedback.ts`. O link do crédito é um `a` com `target="_blank"` e `rel="noopener noreferrer"`: a
navegação é do Jogador, em outra aba, sem enviar a página de origem como referência e sem dar à página aberta
acesso ao jogo; o jogo não espera por ela. Sem integração externa em tempo de execução, não há tempo-limite,
nova tentativa nem chave de idempotência de rede a declarar.

## Persistência e recarga

Esta feature não usa `localStorage`, `sessionStorage`, IndexedDB nem cookie. Recarregar ou fechar a página
encerra a sessão e a volta como em `race-lap-validation`; a reabertura volta à Kart Park porque o código
seleciona `OPENING_TRACK_ID` na carga, não porque algo foi lembrado.

## Crédito e licenças (I6, RNF09)

O dado derivado do OpenStreetMap leva, nas duas telas em que a Kart Park é vista (o seletor com ela
selecionada e o resultado de uma volta nela), o crédito "© colaboradores do OpenStreetMap", a menção "licença
ODbL" e o link para `https://openstreetmap.org/copyright` ([DES-0007](../web/DES-0007-tela-inicial-seletor-credito-e-resultado.md));
o arquivo declara `osmDerived` `true`. A licença Esri, que ainda não tem decisão do dono do produto, bloqueia
só a produção:

| Ponto de aplicação | Regra |
|---|---|
| `scripts/track-pipeline.ts promote` | recusa promover a `PRODUCTION` sem a referência da decisão registrada em `DOMAIN.md` ou com uma referência fora da regra de `--esri-decision` ([DES-0010](../pipeline/DES-0010-preparo-offline-do-arquivo-da-kart-park.md)); grava a referência na entrada |
| etapa de deploy, promoção humana a produção | nenhuma promoção de artefato que contenha `kart-park` antes da decisão registrada; a lista de verificação da release confere a entrada `PRODUCTION` do registro e a referência |
| entrega que promover, se a decisão liberar a licença | acrescenta o crédito da Esri no texto da decisão às duas telas, ao lado do crédito OSM ([DES-0011](../pipeline/DES-0011-verificacoes-registro-de-publicacao-e-promocao.md)) |

Staging pode usar a Kart Park (REQ-FEAT-0007-13); nenhuma etapa de especificação é bloqueada pela licença.
Consequência registrada em [ADR-0005](../adr/ADR-0005-kart-park-sem-chave-e-producao-bloqueada.md): enquanto a
decisão não existe, nenhum artefato construído de um commit que contenha esta feature vai a produção.

## Comportamento em falha

Rede indisponível depois do carregamento: escolha da pista, volta, zebra, barreira e crédito funcionam; só o
destino do link pode não abrir. Navegador que bloqueia a abertura de outra aba: o link não abre, nada mais
muda. Registro: só os identificadores de `console.warn('track-data', ...)`, nunca conteúdo de jogador.

## Determinismo (D-DS-07)

Não é código de simulação. A garantia de que a simulação não lê relógio, DOM, rede nem armazenamento é a de
[DES-0006](../core/DES-0006-invariantes-ensaios-e-ordem-de-entrega.md).

## Feature flag

Nenhuma: a ausência de rede e de armazenamento é o estado neutro, e a promoção é um ato humano registrado,
não uma chave.

## Pontos em aberto

Nenhum.
