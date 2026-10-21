---
title: Visão geral — validação de volta de corrida
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: []
---

# Visão geral

## O que é especificado

Esta especificação funcional diz o que o jogo faz para que uma volta de corrida seja justa, reproduzível e
compreensível: a contagem regressiva e o início do cronômetro no sinal verde, a validade da volta (marcador
pulado, chegada na contramão, corte, grama, reposicionamento), o tempo total e os quatro tempos de setor com
interpolação dentro do passo, a pausa, os tipos de volta (oficial, reconhecimento, treino), o dado de pista
que carrega largada, sentido, setores e marcadores, e o estado da volta exibido em texto, em português e em
inglês. A base é o conjunto de requisitos validado em `200 Requirements/230 Output/race-lap-validation/`.

O produto não tem servidor, conta nem sessão no MVP (RNF08, RNF10). Por isso os contratos de `api/` são
contratos em processo dentro do navegador, únicos para os dois canais, e não endpoints de rede; o único
papel é `player` (anônimo).

## Por canal

| Canal | O que esta especificação fixa |
|---|---|
| `web-desktop` | Pilotagem por teclado; pausa por Esc e por perda de foco da aba; reposicionamento por teclado; contraste mínimo de 4,5:1 no estado, no motivo e na contagem; contagem e sinal verde com 48 px no mínimo |
| `web-mobile` | Pilotagem por inclinação e toque; pausa por perda de foco da aba e por perda do sensor; reposicionamento por toque; recaída para toque com estado visível sem sensor ou sem permissão; texto de estado e de motivo com 16 px no mínimo; as mesmas regras de validade e de tempo |

As regras de validade e de cronometragem são idênticas nos dois canais.

## Mapa do conjunto

| Parte | Onde |
|---|---|
| Funcionalidades | `features/FEAT-0001` a `FEAT-0009` |
| Fluxos | `flows/FLOW-0001` a `FLOW-0004` |
| Contratos | `api/API-0001` (resultado e estado), `API-0002` (comandos), `API-0003` (dado de pista) |
| Telas | `screens/SCR-0001` a `SCR-0003` |
| Regras | `rules/RULE-0001` a `RULE-0006` |

O índice (`00-index.md`) e a matriz de rastreabilidade (`99-traceability.md`) são gerados pelo gate e não são
escritos à mão.

## Camadas (I2)

A validade da volta, a cronometragem e o resultado pertencem à simulação. A apresentação só exibe e os
adaptadores de controle só alimentam entradas normalizadas. Nenhuma regra de validade, tempo ou motivo é
decidida na renderização nem num adaptador de controle (D-FS-05).

## Lacunas deliberadas

Os requisitos recusaram, com motivo registrado, decidir os pontos abaixo; nenhum critério os pede, e esta
especificação não os decide nem os inventa:

| Ponto | Situação |
|---|---|
| Meio pelo qual o Jogador continua a volta depois da pausa | Os contratos definem o comando `resumeLap`; a tecla, o toque ou o botão que o aciona não são decididos |
| Pausa manual por toque em `web-mobile` | Os requisitos nomeiam a pausa por Esc só em `web-desktop`; não exigem pausa manual em `web-mobile` |
| Tamanho mínimo do texto de estado e de motivo em `web-desktop` | A decisão do dono do produto não fixa mínimo |
| O que se cronometra numa volta de treino em pista sem linha de chegada | Não decidido; só se exige que a volta seja pilotável e que o resultado seja não oficial |
| Ponto para onde o kart é recolocado ao reposicionar | Os requisitos fixam o efeito sobre validade e tempo, não o destino |
| Dois eventos de invalidação no mesmo passo | Os requisitos fixam o motivo quando um vem antes do outro, não a precedência dentro do mesmo passo |

## Fora do escopo

Idêntico ao dos requisitos:

- Tentativas, consumo, persistência e resultado do desafio diário (etapa 5, RF14 a RF18), outra feature.
- Medalhas e cores de setor (D15, D16), fantasma (RF19) e ranking, etapas posteriores.
- Importação e revisão de pistas reais (RF01 a RF06), etapa 3; aqui só se exige que o dado de pista carregue
  largada, sentido, setores e marcadores.
- Câmera e minimapa (RF11, parte), sem regra de validade envolvida.
- Mudanças na física de pilotagem e nos presets de kart.
- `remote-wheel` e salas, pós-MVP.

## Como a especificação é verificada

Cada regra de validade e de cronometragem tem verificação determinística na saída de `npm test`, avançando a
simulação com `STEP` (NFR-0009). Taxa de quadros, navegadores e dispositivos só se provam em teste registrado
no aparelho ou navegador nomeado (I9).
