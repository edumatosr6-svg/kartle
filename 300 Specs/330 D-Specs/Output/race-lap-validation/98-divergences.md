---
title: Divergências — validação de volta de corrida
feature: race-lap-validation
stage: dspec
status: validated
version: 1.0.0
sources: []
---

# Divergências

Registro durável dos requisitos deste conjunto que o sistema em execução não satisfaz (conventions §6). O F-Spec é
normativo: nenhuma linha abaixo enfraquece um requisito. Cada linha cita o que existe hoje em `arquivo:linha`, a
etapa que deve a mudança e o item de projeto que a fecha. Todos os caminhos são relativos à raiz do repositório.

| Requisito | O que exige | O que o sistema faz hoje | Etapa devedora | Item de projeto | Estado |
|---|---|---|---|---|---|
| REQ-FEAT-0001-01, -04, -05, -06, -07, -08, -11, -12 | contagem de 3000 ms, cronômetro em zero até o sinal verde, kart parado, tempo desde o sinal verde, sem penalidade | não há contagem nem sinal verde: `src/main.ts:185` põe o jogo em andamento ao entrar; `src/physics.ts:205` acumula `elapsed` desde o primeiro passo; a aceleração move o kart de imediato (`src/main.ts:262-270`) | código | DES-0001, DES-0002 | open |
| REQ-FEAT-0001-02, -03, -09, -10, REQ-FEAT-0007-01 a -14 | contagem, sinal verde, estado e motivo em texto, em pt e en, com 48 px, 16 px e 4,5:1 | nenhum texto de contagem, sinal verde ou estado; só a mensagem genérica `#message` (`src/main.ts:155`, `src/main.ts:361`); textos fixos em português (`src/main.ts:17`, `index.html:2`); sem resolução de idioma | código | DES-0008 | open |
| REQ-FEAT-0001-13, REQ-FEAT-0003-07 | controle por toque com estado visível sem sensor; pausa automática ao perder o sensor | a inclinação é opcional por botão e a falha só gera notificação passageira (`src/main.ts:218-228`); nada detecta que as leituras pararam (`src/main.ts:229-236` só reage a eventos que chegam) | código | DES-0007, DES-0009 | open |
| REQ-FEAT-0002-01 a -14, REQ-FEAT-0004-01 a -13 | conclusão pela chegada no sentido da pista com todos os marcadores, resultado único, quatro tempos de setor em ms inteiros, interpolação, marcador pulado e contramão | volta decidida por portões de índice, sem sentido, sem marcadores, sem setores e sem resultado (`src/track.ts:20-28`, chamada em `src/main.ts:276`); o tempo é `state.elapsed` zerado na volta (`src/main.ts:280`) | código | DES-0001, DES-0002, DES-0003 | open |
| REQ-FEAT-0002-06 | formato `m:ss.mmm` sem arredondar | formato `mm:ss.mmm` com `toFixed(3)` sobre segundos em ponto flutuante (`src/main.ts:154`) | código | DES-0008 | open |
| REQ-FEAT-0009-01, REQ-FEAT-0009-12 | validade e tempo decididos na simulação; evento repetido sem efeito | a regra de volta está na aplicação, em `src/main.ts:276-281`, contra I2; não há estado de volta que absorva evento repetido | código | DES-0001, DES-0012 | open |
| REQ-FEAT-0003-05 a -06, -08 a -14 | pausa por Esc e por perda de foco com causa, suspensão sem avançar passo, retomada só pelo Jogador, pausa idempotente | uma pausa alternável sem causa (`src/main.ts:194-202`), que também retoma pela mesma tecla (`src/main.ts:208`); trocar peso ou estilo reinicia o treino no meio da volta (`src/main.ts:167-184`) | código | DES-0001, DES-0007 | open |
| REQ-FEAT-0005-01 a -06, -09 a -11 | corte por distância e duração, com limites da pista, motivo e fim no passo | não existe corte: a grama só reduz a velocidade (`src/physics.ts:115`, `src/physics.ts:156`) e a parede só limita a posição (`src/physics.ts:216`) | código | DES-0004 | open |
| REQ-FEAT-0006-01 a -06, -12 a -15 | tipos de volta; reposicionamento invalida a volta oficial e é livre nas demais | `reset` reinicia o treino sem tipo, sem motivo e sem regra (`src/main.ts:156-161`, `src/main.ts:193`, `src/main.ts:207`) | código | DES-0005 | open |
| REQ-FEAT-0006-07 a -11, REQ-FEAT-0008-05 a -07 | resultado não oficial para reconhecimento, treino e dado incompleto; nenhuma volta oficial em dado incompleto | não há resultado nem noção de oficial: o botão `start` abre o jogo sem oferta de volta (`src/main.ts:185`) e o tempo de volta nasce em `src/main.ts:276-281` sem tipo nem resultado | código | DES-0005, DES-0009, DES-0010 | open |
| REQ-FEAT-0008-01 a -04, -08 a -15, REQ-FEAT-0004-06 | largada, sentido, chegada, setores, marcadores e limites de corte vêm do arquivo de pista versionado, com leitor da forma anterior e de versão desconhecida | a pista é constante de código sem `schemaVersion`, `trackId` nem `trackVersion` (`src/track.ts:2-6`); a largada é fixa no ponto de índice 0 (`src/physics.ts:66`); não há leitor | código | DES-0006, DM-0001 | open |
| REQ-FEAT-0009-10 | ao menos uma verificação determinística por regra de volta em `npm test` | o único teste de volta cobre os portões preliminares (`tests/physics.test.ts:35`); nenhuma das regras listadas é testada | código e testes | DES-0012 | open |

Satisfeitos hoje, sem divergência: `STEP` e significado de `Input` (REQ-FEAT-0009-03), física e presets
(REQ-FEAT-0009-04), uso sem rede (REQ-FEAT-0009-07, -08), ausência de dado pessoal (REQ-FEAT-0009-09) e de
gravação no navegador (REQ-FEAT-0009-11). Esses requisitos continuam protegidos pelo teste de camada e de
congelamento (DES-0012). Os requisitos de desempenho (REQ-FEAT-0009-05 e -06) não têm medida registrada hoje e
dependem do teste registrado no aparelho (test-strategy, E2E-10).
