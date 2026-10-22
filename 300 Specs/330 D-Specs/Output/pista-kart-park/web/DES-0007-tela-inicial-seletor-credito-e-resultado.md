---
id: DES-0007
title: Tela inicial com seletor e crédito, crédito na tela de resultado e nome da pista da sessão
feature: pista-kart-park
stage: dspec
status: validated
version: 1.1.0
sources: [SCR-0001, SCR-0002, FLOW-0001, FEAT-0001, FEAT-0003, FEAT-0006, REQ-FEAT-0001-01, REQ-FEAT-0001-02, REQ-FEAT-0001-03, REQ-FEAT-0001-04, REQ-FEAT-0001-11, REQ-FEAT-0001-13, REQ-FEAT-0001-14, REQ-FEAT-0003-09, REQ-FEAT-0003-14, REQ-FEAT-0006-01, REQ-FEAT-0006-02, REQ-FEAT-0006-03, REQ-FEAT-0006-04, REQ-FEAT-0006-05, REQ-FEAT-0006-06, REQ-FEAT-0006-07, REQ-FEAT-0006-08, REQ-FEAT-0006-09, REQ-FEAT-0006-10, REQ-FEAT-0006-11, REQ-FEAT-0006-12, REQ-FEAT-0006-13]
---

# DES-0007 — Tela inicial com seletor e crédito, crédito na tela de resultado e nome da pista da sessão

## Realiza

As telas SCR-0001 e SCR-0002 e os passos de aplicação de FLOW-0001: o seletor com as duas opções na tela
inicial (REQ-FEAT-0001-01), a Kart Park selecionada e carregada a cada abertura, sem ler nem gravar a escolha
(REQ-FEAT-0001-02, -03, -04); só volta de treino oferecida (REQ-FEAT-0001-11); o seletor e a pista inalterados
sem sensor em `web-mobile`, com o aviso de toque existente (REQ-FEAT-0001-13); o erro do dado na tela inicial,
com as duas opções selecionáveis (REQ-FEAT-0001-14); a linha de crédito OSM — texto, menção e link — no
seletor com a Kart Park selecionada e na tela de resultado de uma volta na Kart Park, só para pista com
`osmCredit`, sem rede, nos dois canais e nas duas telas (REQ-FEAT-0006-01 a -06, -10, -12, -13); o nome e o
comprimento da Kart Park em toda tela que exibe o nome, iguais nos dois idiomas (REQ-FEAT-0006-07, -08, -11);
nenhum recorde (REQ-FEAT-0006-09); o motivo "marcador pulado" e a tela de resultado com o tempo total e os 4
setores, de `race-lap-validation`, sem mudança, também na Kart Park (REQ-FEAT-0003-09, -14).

## Posicionamento

Camada **aplicação**:

- `src/main.ts`, alterado: estado da sessão, seletor, crédito, nome da pista, início da volta.
- `index.html`, alterado: dois contêineres em `#welcome` (`index.html:19`), um em `#lap-result` (`:25`) e o
  identificador `#track-name` no rótulo da pista (`:17`).
- `src/style.css`, alterado: regras `.track-selector` e `.track-credit`.
- `src/lapMessages.ts`, alterado (aplicação pura, de `race-lap-validation`): recebe os textos do crédito
  (`OSM_CREDIT`), a regra de tela do crédito (`creditFor`) e a formatação do rótulo da opção (`optionLabel`).
  Continua importando só tipos de `./lap` (`tests/race-lap-validation-layering.test.ts:27-28`): as duas
  funções recebem a entrada do catálogo por tipo estrutural, sem importar `src/trainingSession.ts`. Nenhuma
  chave nova em `MESSAGES` (as 20 chaves de CHK-TEST-0010-17 continuam as mesmas), porque esses textos não
  passam por `message()` nem por `resolveLanguage` (REQ-FEAT-0006-11). Motivo de não ser módulo novo:
  `src/lapMessages.ts` já é o módulo da aplicação pura com os textos das telas e carrega em `npm test`, onde
  `src/main.ts` não carrega.
- `src/rawImports.d.ts`, **novo**, só declaração de tipo: `declare module '*.json?raw' { const text: string;
  export default text; }`, para `tsc --noEmit` aceitar a importação do arquivo de pista como texto (o
  `tsconfig.json` inclui `src`). Motivo de ser novo: nenhum arquivo de declaração existe hoje.

`src/main.ts` não decide regra: a sessão, a escolha e a oferta de volta vêm de `src/trainingSession.ts`
([DES-0005](../core/DES-0005-sessao-de-treino-catalogo-e-selecao-de-pista.md)), que entrega as entradas do
catálogo com `osmCredit`, `displayName` e `displayLengthM`; o crédito e o rótulo de uma entrada vêm de
`creditFor` e `optionLabel` (`src/lapMessages.ts`); a validade, o motivo e os tempos vêm de `src/lap.ts` (I2).

## Interface

`src/lapMessages.ts`, acrescido (o resto do módulo não muda):

| Símbolo | Assinatura | Descrição |
|---|---|---|
| `OSM_CREDIT` | `{text: '© colaboradores do OpenStreetMap', license: 'licença ODbL', url: 'https://openstreetmap.org/copyright'}`, congelado | os textos do crédito, sem tradução (REQ-FEAT-0006-01 a -06, -11) |
| `creditFor(option)` | `({readonly osmCredit: boolean} \| undefined) => typeof OSM_CREDIT \| undefined` | `OSM_CREDIT` só quando a entrada do catálogo recebida declara `osmCredit` verdadeiro (REQ-FEAT-0006-10); `undefined` para a entrada da pista sintética e para entrada ausente (`trackId` fora do catálogo). A entrada é a de `getTrainingTrackOptions(training).options` com o `trackId` da tela: `selectedTrackId` no seletor (SCR-0001), `result.trackId` no resultado (SCR-0002) |
| `optionLabel(option)` | `({readonly displayName: string; readonly displayLengthM?: number}) => string` | `displayName`, seguido de `' · '`, `displayLengthM` e `' m'` quando `displayLengthM` existe; só `displayName` sem ele (REQ-FEAT-0006-07, -08) |

Elementos novos ou alterados em `index.html` ("entrada de `X`" é a entrada de `getTrainingTrackOptions(training).options` com `trackId` `X`):

| Elemento | Onde | Conteúdo |
|---|---|---|
| `#track-selector` | dentro de `#welcome`, antes de `#track-status` | `div` com `role="group"` e `aria-label="Pista"`; dois `button type="button"` com `data-track-id` (`kart-park`, `synthetic`), texto `optionLabel(opção)` e `aria-pressed` `true` na opção de `selectedTrackId` |
| `#track-credit` | dentro de `#welcome`, depois de `#track-selector` | `p` com a classe `lap-chip track-credit`, oculto (`hidden`) salvo quando `creditFor` da entrada de `selectedTrackId` existe: `OSM_CREDIT.text`, ` · `, `OSM_CREDIT.license`, ` · ` e um `a` com `href` `OSM_CREDIT.url`, `target="_blank"`, `rel="noopener noreferrer"` e texto `openstreetmap.org/copyright`, na mesma linha |
| `#lap-result-credit` | dentro de `#lap-result`, antes de `#lap-new-lap` | o mesmo conteúdo, visível só quando `creditFor` da entrada de `result.trackId` existe |
| `#track-name` | o `strong` de `.track-label` (`index.html:17`) | `optionLabel` da opção de `selectedTrackId`; substitui o texto fixo "Circuito Aurora", que nomeia a pista sintética e, com a Kart Park na sessão, a nomearia errado |

O crédito é construído por uma função local de `src/main.ts`, `renderCredit(container, credit)`, que cria o
texto e o `a` a partir de `OSM_CREDIT` com `textContent` e `setAttribute` (nunca `innerHTML`), e que esvazia e
oculta o contêiner quando `credit` é `undefined`. As duas telas usam a mesma função, de modo que o texto, a
menção e o link são idênticos (REQ-FEAT-0006-13).

`src/main.ts`, por trecho atual:

| Trecho atual | Mudança |
|---|---|
| `:5-9` importações | passa a importar `kartParkV1Text from './tracks/kart-park-v1.json?raw'` e, de `./trainingSession`, `initialTrainingSession`, `selectTrainingTrack`, `getTrainingTrackOptions`, `startTrainingLap`, `trainingIdleKart`, `OPENING_TRACK_ID`, `TRAINING_TRACKS`; a importação de `./lapMessages` (`:9`) acrescenta `creditFor` e `optionLabel`; `readTrackData` sai da importação |
| `:152` `idleKart` | `trainingIdleKart(training)`; sem sessão pronta, o kart não é exibido |
| `:155-158` leitura da pista sintética | `TRACK_SOURCES = {'kart-park': kartParkV1Text, synthetic: SYNTHETIC_TRACK_FILE}`; `training = initialTrainingSession()`; `chooseTrack(OPENING_TRACK_ID)` na carga do módulo, sem ler escolha anterior; os avisos `console.warn('track-data', ...)` passam a ser emitidos por `chooseTrack` com os mesmos identificadores |
| `chooseTrack(trackId)` | nova função local: `r = selectTrainingTrack(training, lap, trackId, TRACK_SOURCES)`; guarda `r.session` e `r.lap`; zera o estado do retorno da zebra ([DES-0009](DES-0009-retorno-da-zebra-vibracao-e-som.md)); troca a cena ([DES-0008](DES-0008-desenho-da-kart-park-na-tela-de-corrida.md)); ligada ao `onclick` de cada botão de `#track-selector` |
| `:187-207` `renderOffer` | a guarda de redesenho passa de `offerLang === lang` a uma chave com `lang`, `sessionState`, `selectedTrackId` e `trackDataStatus`; desenha o seletor e o crédito a partir de `getTrainingTrackOptions(training)`; `#track-status` mostra `loadingTrack` com `NO_SESSION`/`LOADING`, `trackDataError` com `FAILED` (textos de `race-lap-validation`) e o `trackId` com `READY`, como hoje; a oferta de volta é `offeredLapKinds(reading, [])`, que numa sessão de treino é só `TRAINING`, e não aparece sem sessão `READY` |
| `:208-218` `beginLap` | `startTrainingLap(training, lap, config)` no lugar de `startLap(...)`; o tipo de volta deixa de ser argumento |
| `:331-358` `renderResult` | além do que já faz, `renderCredit($('lap-result-credit'), creditFor(<entrada de result.trackId>))`; a guarda `resultLang === lang` continua e é zerada a cada volta, como hoje |
| rótulo `.track-label` | `#track-name` recebe `optionLabel` da opção selecionada a cada mudança de sessão |

Os textos do crédito vêm de `OSM_CREDIT` e o nome e "Pista sintética" do `displayName` das entradas do
catálogo, formatados por `optionLabel`; nenhum passa por `message()`/`resolveLanguage` (REQ-FEAT-0006-11). Os
demais textos continuam as chaves de `MESSAGES` de `src/lapMessages.ts`, inalteradas. A navegação continua a de `race-lap-validation`: o seletor é alcançado na abertura e por "nova
volta" (`#lap-new-lap`, `:249`), sem volta em andamento.

`src/style.css`: `.track-selector` (linha flexível de dois botões, com o estado `aria-pressed="true"`
destacado pela cor de `.primary`) e `.track-credit a` (cor `#d5ef91` sobre `--lap-chip-bg`, sublinhado). O
crédito usa a classe `lap-chip`, que já tem o tamanho mínimo de 16 px e o contraste verificados pelo teste de
HUD de `race-lap-validation`.

## Colaboradores

`src/main.ts` chama `src/trainingSession.ts`, `offeredLapKinds`, `getLapResult` (`src/lap.ts`), `message`,
`formatLapTime`, `creditFor`, `optionLabel` (`src/lapMessages.ts`) e o DOM; é chamado pelos manipuladores de
clique e pelo laço de quadros. `creditFor` e `optionLabel` não chamam nada: recebem a entrada do catálogo que
`src/main.ts` lhes passa e são chamados por `src/main.ts` e pelos testes.

## Estado e concorrência

Estado local: `training` (sessão) e `lap` (volta), substituídos só pelos valores que `selectTrainingTrack` e os
comandos da volta devolvem. Clicar duas vezes na mesma opção pronta não tem efeito (idempotência de
API-0002); clicar em outra durante uma volta não acontece pelas telas (o seletor fica em `#welcome`, oculto
durante a volta) e, por qualquer outro caminho, a volta é descartada pela sessão. Nada é gravado: nenhum
`localStorage`, `sessionStorage`, IndexedDB nem cookie (REQ-FEAT-0001-03).

## Comportamento em falha

Dado da pista escolhida ilegível ou de esquema desconhecido: `#track-status` com `trackDataError`, nenhuma
oferta de volta, as duas opções habilitadas, o crédito visível se a opção selecionada tem `osmCredit` (vem do
catálogo). Sem rede: idêntico ao online, porque o arquivo vem no pacote do jogo e o crédito é texto local; o
destino do link pode não abrir. Sensor ausente ou negado em `web-mobile`: o aviso
`controlFallbackTouch` existente (`:454-457`); seletor, sessão e largada não mudam. Registro: só os
identificadores de `console.warn('track-data', ...)`.

## Observabilidade

`tests/pista-kart-park-screens.test.ts` importa `src/lapMessages.ts` e o catálogo de
`src/trainingSession.ts` e afirma: `creditFor` da entrada `kart-park` é `OSM_CREDIT`, com `text`
`© colaboradores do OpenStreetMap`, `license` `licença ODbL` e `url` `https://openstreetmap.org/copyright`;
`creditFor` da entrada `synthetic` e de entrada ausente é `undefined`; `optionLabel` da entrada `kart-park` é
exatamente `Kart Park — São José dos Pinhais (traçado aproximado) · 687 m` e o da entrada `synthetic` é
`Pista sintética`; nenhuma das duas funções recebe idioma, e nenhum desses textos é valor de `MESSAGES`. O mesmo
teste lê `index.html` e `src/main.ts` como texto e afirma: os três contêineres e `#track-name`; `renderCredit`
chamado com `creditFor(...)` nos dois pontos; nenhum uso de `innerHTML` para o crédito; nenhum texto "41,45",
"41.45" nem "Circuito Aurora"; `startLap(` não é chamado diretamente (só `startTrainingLap`). A apresentação
real é provada no roteiro E2E-01 a E2E-03, E2E-05, E2E-07
e E2E-08 ([test-strategy](../test-strategy.md)).

## Determinismo (D-DS-07)

Não é código de simulação. O tempo de parede continua decidindo só quantos passos rodam num quadro
(`advanceClock`).

## Feature flag

Nenhuma: o seletor e o crédito são fixos (FEAT-0001 e FEAT-0006, Configuração: nenhuma); a pista da abertura
não é configurável ([ADR-0005](../adr/ADR-0005-kart-park-sem-chave-e-producao-bloqueada.md)).

## Pontos em aberto

Nenhum.
