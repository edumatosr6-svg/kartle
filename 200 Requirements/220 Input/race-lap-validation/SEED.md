---
name: race-lap-validation
description: Largada, cronometragem oficial pela simulação, quatro setores, marcadores de percurso e regras que separam volta válida de volta inválida (corte, marcador pulado, chegada na contramão, reposicionamento). Ler antes de qualquer trabalho em corrida, tempo de volta, setores ou validação de percurso.
revision: 2
date: 2026-10-20
author: eduardo.matos
channels: [web-desktop, web-mobile]
---

## Visão geral

Uma corrida no Kartle é uma volta cronometrada numa pista, iniciada por contagem regressiva e encerrada
na linha de chegada. Esta feature define quando essa volta é **válida**, como seu tempo total e os quatro
tempos de setor são medidos, e como o jogador fica sabendo, durante e ao final da volta, se ela vale.
É a base sobre a qual o desafio diário (tentativas, resultado, medalhas) será construído; sem ela, nenhum
tempo do jogo é justo nem reproduzível.

## Contexto

O protótipo atual é treino livre numa pista sintética, com validação preliminar por gates sequenciais que
o próprio `README.md` declara não substituir o sistema final de cortes. A etapa 4 de
`requirements/08-etapas-e-aceite.md` pede: percurso, setores, largada e estados de corrida, com voltas
válidas e inválidas diferenciadas e chegada invertida, corte e reposicionamento verificados.
`requirements/02-regras-do-jogo.md` separa os quatro **setores** de apresentação dos **marcadores de
validação**, porque quatro checkpoints não bastam para detectar atalhos.

## Atores e canais

| Ator | Canal | O que faz |
|---|---|---|
| Jogador | `web-desktop` | Pilota com teclado (RF12), recebe a contagem, o tempo, os setores e o estado da volta |
| Jogador | `web-mobile` | Pilota com inclinação e toque; mesmas regras e mesma informação |
| Curador do catálogo | — (dado de pista) | Fornece, por pista, largada, sentido, setores e marcadores (`requirements/03`, passo 7) |

`remote-wheel` está fora do escopo (pós-MVP).

## Histórias de usuário

- **US-1** Como Jogador, quero uma contagem regressiva antes da largada, para saber exatamente quando a
  volta começa a valer.
  - A contagem é exibida na tela até a largada, com texto legível (não apenas cor).
  - O cronômetro da volta mostra `0` até o instante de início da cronometragem (definido em OPEN-05).
  - O comportamento de acelerar antes do fim da contagem segue OPEN-04.
- **US-2** Como Jogador, quero que uma volta completa no sentido correto, passando por todos os
  marcadores em ordem, registre meu tempo total e meus quatro tempos de setor, para comparar voltas.
  - Ao cruzar a chegada após todos os marcadores em ordem, a volta é exibida como válida com tempo total
    e quatro tempos de setor.
  - A soma dos quatro tempos de setor é igual ao tempo total, dentro da precisão definida em OPEN-03.
  - O tempo de cada setor é exibido ao completá-lo, durante a volta.
- **US-3** Como Jogador, quero que o tempo oficial dependa só da pilotagem, e não do desempenho do meu
  aparelho, para que a comparação seja justa.
  - A mesma sequência de entradas, aplicada à mesma pista e ao mesmo acerto, produz o mesmo tempo total e
    os mesmos tempos de setor em duas execuções.
  - O mesmo tempo é obtido com a renderização a 30 fps e a 60 fps.
- **US-4** Como Jogador, quero que uma volta que pula um marcador não gere tempo válido, para que
  atalhos não compensem.
  - Ao cruzar a chegada sem ter passado por todos os marcadores em ordem, a volta é exibida como
    inválida, sem tempo oficial, com o motivo "marcador pulado".
- **US-5** Como Jogador, quero que cruzar a chegada na contramão não conte como volta, para que o
  percurso só valha no sentido da pista.
  - Cruzar a linha de chegada no sentido oposto ao da pista não encerra a volta nem registra tempo.
  - Uma volta só se encerra cruzando a chegada no sentido da pista.
- **US-6** Como Jogador, quero que sair da pista para cortar caminho invalide a volta, mas que uma
  escapada sem ganho apenas me deixe mais lento, para que erros honestos não sejam punidos como trapaça.
  - Uma saída de pista que satisfaz o critério de corte (OPEN-01) torna a volta inválida no momento em
    que ocorre, com o motivo "corte" exibido.
  - Andar na grama sem satisfazer o critério de corte reduz a velocidade (RF08) e não invalida a volta.
- **US-7** Como Jogador, quero saber que reposicionar o kart numa volta oficial a invalida, para decidir
  conscientemente.
  - Em volta oficial, reposicionar torna a volta inválida, com o motivo "reposicionamento" exibido.
  - Em reconhecimento e em treino, reposicionar não invalida e não exibe motivo.
- **US-8** Como Jogador, quero que voltas de reconhecimento e de treino nunca produzam tempo oficial,
  para que treinar não altere meu resultado.
  - Uma volta de reconhecimento ou de treino completa exibe seu tempo identificado como não oficial.
  - Nenhuma volta de reconhecimento ou de treino é entregue como resultado oficial.
- **US-9** Como Jogador, quero ver a qualquer momento se minha volta atual ainda vale, para não
  continuar pilotando sem saber.
  - O estado da volta (válida em andamento / inválida + motivo) é exibido durante toda a volta, em texto
    além de cor, em português e em inglês conforme o idioma do navegador.

## Regras de domínio

| Regra | Fonte |
|---|---|
| Largada com contagem regressiva, quatro setores e linha de chegada | RF09 |
| Volta que pula checkpoint é inválida | RF10 |
| Setores de apresentação e marcadores de validação são conjuntos distintos | `requirements/02`, `06` |
| Validar ordem e sentido de passagem pelos marcadores e o cruzamento da chegada | `requirements/02` |
| Chegada na contramão ou sem completar o percurso não conclui volta | `requirements/02` |
| Grama reduz velocidade e não invalida sem regra de corte correspondente | RF08, `requirements/02` |
| O relógio oficial acompanha a simulação, não os quadros renderizados | `requirements/02`, RNF07 |
| Os quatro setores compõem o tempo total dentro da regra de precisão | `requirements/02` |
| Reconhecimento e treino não escrevem tempos oficiais | `requirements/02` (estados) |
| Reposicionamento invalida volta oficial; livre em reconhecimento e treino | D08 — **proposta**, ver OPEN-02 |

Cada tentativa oficial cobre uma volta, que registra tempo total e quatro setores (`requirements/source`).

## Requisitos não funcionais

| Requisito | Limite |
|---|---|
| Determinismo: mesmas entradas → mesmo tempo e mesmos setores, no mesmo runtime | idênticos em 100% das execuções (RNF07) |
| Independência de quadros: tempo igual a 30 fps e a 60 fps | sim |
| Desempenho com a validação ativa | 60 fps em notebook, 30 fps em celular intermediário (RNF03) |
| Funciona sem servidor | sim (RNF08) |
| Coleta de dados pessoais | nenhuma (RNF10) |
| Estado da volta comunicado por texto, não só por cor | sim (`requirements/07`, usabilidade) |
| Mensagens de estado e motivo em pt e en | sim (RNF11) |
| Determinismo entre navegadores diferentes | a medir — OPEN-07 |

## Restrições

- A validação e a cronometragem pertencem à simulação; renderização e controles só exibem e alimentam
  entradas (I2). Motivo: a simulação deve poder validar voltas no servidor no futuro (`requirements/06`).
- O contrato de passo fixo da simulação não muda nesta feature (I8). Motivo: qualquer replay e qualquer
  tempo futuro dependem dele.
- Largada, sentido, setores e marcadores vêm do dado da pista, não de constantes do jogo. Motivo: cada
  pista real terá os seus (`requirements/03`).
- A pista sintética atual continua jogável e recebe seus próprios setores e marcadores. Motivo: é a pista
  de teste até as pistas reais da etapa 3.
- Os presets de kart e a física de pilotagem não mudam nesta feature. Motivo: são calibrados à parte
  (`docs/physics.md`).

## Impacto no domínio

- **I1** — a corrida não resolve o desafio, mas seu resultado precisa poder ser ligado a ele; o resultado
  identifica pista e versão da pista.
- **I2** — validação e tempo ficam na camada de simulação.
- **I3 / I5** — o dado de pista passa a carregar setores e marcadores distintos: mudança versionada.
- **I7** — uma volta concluída produz um único resultado, mesmo que a chegada seja cruzada de novo.
- **I8** — o tempo é função da sequência de passos da simulação.
- **I9** — cada regra de validade tem verificação determinística em `npm test`.

## Riscos e incógnitas

- **OPEN-01** (D09) Critério de corte: densidade dos marcadores, tolerância de saída da pista (distância
  em m e/ou duração em ms) e progresso permitido fora dela. Dono: Eduardo Matos.
- **OPEN-02** (D08) Confirmar que reposicionar invalida a volta oficial e é livre em reconhecimento e
  treino.
- **OPEN-03** Precisão interna do tempo e arredondamento de exibição (ex.: ms com 3 casas); se o instante
  de cruzamento é interpolado dentro de um passo.
- **OPEN-04** Queima de largada: acelerar antes do fim da contagem é ignorado, penalizado ou invalida?
- **OPEN-05** Duração da contagem (s) e instante exato em que o cronômetro começa (fim da contagem ou
  cruzamento da linha de largada).
- **OPEN-06** Volta invalidada: continua até a chegada (marcada inválida) ou termina imediatamente?
- **OPEN-07** Equivalência do tempo entre Chrome, Edge, Firefox e Safari ainda não medida (RNF05, RNF07).
- **OPEN-08** (D10) Pausa e perda de foco durante volta oficial, incluindo perda do sensor no celular:
  a volta continua oficial, é invalidada ou é suspensa?

## Fora do escopo

- Tentativas, consumo, persistência e resultado do desafio diário — etapa 5 (RF14–RF18), outra feature.
- Medalhas e cores de setor (D15, D16), fantasma (RF19), ranking — etapas posteriores.
- Importação e revisão de pistas reais (RF01–RF06) — etapa 3; aqui só se exige que o dado de pista
  carregue largada, sentido, setores e marcadores.
- Câmera e minimapa (RF11, parte) — sem regra de validade envolvida.
- Mudanças na física de pilotagem e nos presets.
- `remote-wheel` e salas — pós-MVP.
