---
title: Visão geral — dirigibilidade do Arcade assistido
feature: dirigibilidade
stage: fspec
status: validated
version: 2.0.0
sources: []
---

# Visão geral

## O que é especificado

Esta especificação funcional diz o que a simulação do Kartle faz, com o acerto padrão **Arcade assistido**
na sua nova versão, para que o kart responda ao volante de imediato, segure a curva de referência sem sair
de frente, tenha a traseira viva mas controlável, acelere e transmita velocidade e risco — e para que o jogo
continue justo: mesma sequência de `Input`, mesmo tempo; passo, solver e `Input` inalterados; acerto
declarado como nova versão, com tempos e replays antigos legíveis mas nunca comparáveis. A base é o
conjunto de requisitos validado em `200 Requirements/230 Output/dirigibilidade/` (US-0001 a US-0005,
NFR-0001 a NFR-0009), que já carrega as decisões do dono do produto (`DOMAIN/DEC-01` a `DOMAIN/DEC-10`, `DOMAIN/REF-01` e
`DOMAIN/REF-02`, rótulos definidos em `01-context.md` daquele conjunto). Os limites são os do **acerto
agressivo** da revisão 2 do seed (`DOMAIN/REF-02`): 180 ms / 250 ms de resposta do volante, 50 km/h na curva
de referência, 0–60 km/h em 2,5 s, 105 km/h estabilizada, volta do piloto de teste em 25 s; os valores da
revisão 1 não permanecem como critério alternativo nem como piso.

O produto não tem servidor, conta nem sessão no MVP (RNF08, RNF10). Os contratos de `api/` são contratos
em processo dentro do navegador e nos ensaios, únicos para os dois canais, e não endpoints de rede; o único
papel é `player` (anônimo). Nomes de campo em `camelCase` plano com a unidade no sufixo (D-FS-06).

## Por canal

| Canal | O que esta especificação fixa |
|---|---|
| `web-desktop` | Esterço e acelerador binários pelo teclado (0, 1 ou −1); todos os limites de resposta, aderência, recuperação, aceleração e velocidade valem sem diferença; HUD de velocidade e aderência em todos os quadros da volta |
| `web-mobile` | Esterço proporcional pela inclinação e acelerador por toque; os mesmos limites para a inclinação mantida no ângulo mapeado para esterço 1 (ou −1); limites próprios de resposta para esterço parcial (90 % em 180 ms; 10 % em 250 ms); sem sensor ou sem permissão, controle por toque com estado visível e entradas binárias (I4); o mesmo HUD |
| Piloto de teste (`npm run bench:handling`) | Sem canal de jogo: volta determinística na pista sintética com comandos binários, em no máximo 25 s e com zero passos fora do asfalto; é a régua de regressão |

Todo limite é medido no **estado da simulação**, em tempo simulado (passos de `STEP`), a partir do valor
normalizado de `Input` que o adaptador entrega (I2, I8). Os canais diferem só no adaptador.

## Mapa do conjunto

| Parte | Onde |
|---|---|
| Funcionalidades | `features/FEAT-0001` (resposta do volante), `FEAT-0002` (aderência em curva), `FEAT-0003` (traseira viva e controlável), `FEAT-0004` (aceleração, velocidade, grama, parede e HUD), `FEAT-0005` (determinismo, piloto de teste e versão do acerto), `FEAT-0006` (requisitos transversais) |
| Fluxos | `flows/FLOW-0001` (passo de simulação e HUD), `FLOW-0002` (ensaio determinístico e volta do piloto de teste), `FLOW-0003` (leitura de replay e comparação entre versões) |
| Contratos | `api/API-0001` (telemetria de dirigibilidade por passo), `API-0002` (versão do acerto no resultado, no replay e no texto compartilhado), `API-0003` (saída dos ensaios de dirigibilidade) |
| Telas | `screens/SCR-0001` (HUD de velocidade e aderência), `SCR-0002` (resultado e texto compartilhado com a versão do acerto) |
| Regras | `rules/RULE-0001` (estado de aderência, condução normal e condição de forçar), `RULE-0002` (ensaios e limiares de dirigibilidade), `RULE-0003` (versão do acerto e comparabilidade) |

O índice (`00-index.md`) e a matriz de rastreabilidade (`99-traceability.md`) são gerados pelo gate e não
são escritos à mão.

## Camadas (I2)

Resposta do volante, aderência, recuperação da traseira, aceleração, perda na grama e na parede são
decididas pelos parâmetros do acerto e pelas assistências dentro da simulação. A apresentação só exibe
(HUD, resultado, texto compartilhado) e os adaptadores de controle só entregam o `Input` normalizado;
nenhuma regra de pilotagem é decidida na renderização nem num adaptador (D-FS-05, NFR-0005). A validação
de volta e o dado de pista não mudam (NFR-0008).

## Decisões de forma desta especificação

- A **versão do acerto** é declarada por versão própria do acerto (`setupVersion`), e não por
  `trackVersion`: os requisitos admitem as duas formas (critério 04 de US-0005) e o dado de pista não muda
  (NFR-0008), de modo que só a versão própria preserva as duas exigências ao mesmo tempo.
- Os valores do estado de aderência (`grip`, `understeer`, `oversteer`, `sliding`) são mantidos em
  minúsculas, como os requisitos e o glossário os nomeiam; os enums novos deste conjunto são em
  maiúsculas.
- Os ensaios são especificados como contrato de saída (`API-0003`) porque os critérios dos requisitos
  nomeiam a saída de `npm test` e dos benches como ponto de observação; a forma de serialização dessa
  saída é decisão de projeto.

## Lacunas deliberadas

Os requisitos recusaram, com motivo registrado no seu changelog, decidir os pontos abaixo; nenhum critério
os pede, e esta especificação não os decide nem os inventa:

| Ponto | Situação |
|---|---|
| Limite de resposta para a inversão do esterço (de 1 a −1 num passo) | Não fixado; os ensaios de resposta partem de esterço 0 e de regime atingido |
| Limite de recuperação da traseira para redução parcial do esterço (`web-mobile`) | Não fixado; o ensaio leva o esterço a 0 |
| Magnitude da perda de velocidade no contato com a parede | Não fixada; exige-se redução a cada contato |
| Perda na grama abaixo de 50 km/h ou com esterço diferente de 0 | Não fixada; a grama continua reduzindo a velocidade |
| Janela de estabilização do regime da taxa de guinada e acelerador mantido durante o ensaio de resposta | Parâmetros de ensaio, reportados na saída e registrados em `docs/physics.md`, não limiares de domínio |
| Limite de subesterço com esterço parcial (`web-mobile`) | Não fixado; o kart faz raio maior por construção |

## Fora do escopo

Idêntico ao dos requisitos:

- Novas pistas, novas manobras ou mudança nas regras do drift (`requirements/11`).
- Mudanças no preset Realista — aluguel 4T.
- Som de motor, vibração, câmera (RF13, RF11).
- Volante remoto (`remote-wheel`) e desafio diário.

## Como a especificação é verificada

Cada critério tem ensaio determinístico na saída de `npm test` ou dos benches (`npm run bench:handling`,
bench de física), avançando a simulação com `STEP` sem renderização nem controles (I9). A rodada de
teste do dono do produto na build (`DOMAIN/DEC-08`) é condição humana de fechamento, posterior à etapa de
testes, e não é critério desta especificação. O ciclo dessa rodada é o de `DOMAIN/DEC-10`: cada rodada de
código é publicada em staging, o dono do produto devolve feedback curto (vira? acelera? traseira?) e os
presets são iterados dentro do pipeline até a aprovação dele; cada rodada de presets é nova versão de acerto
([RULE-0003](rules/RULE-0003-versao-do-acerto-e-comparabilidade.md)) e passa de novo por todos os ensaios;
nenhum preset experimental extra é exposto no painel do jogo, e nenhuma configuração permite escolher entre
versões ([FEAT-0005](features/FEAT-0005-determinismo-piloto-de-teste-e-versao.md), Configuração).
