# Regras do jogo

## Requisitos originais

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RF07 | Gerar asfalto, zebras nas curvas, grama e barreiras a partir da pista | MVP |
| RF08 | Física arcade com aceleração, freio, esterço, perda de aderência e grama mais lenta | MVP |
| RF09 | Contagem regressiva, quatro setores e chegada | MVP |
| RF10 | Invalidar volta que pula checkpoint | MVP |
| RF11 | Câmera de perseguição, HUD de tempo/setores/velocidade e minimapa | MVP |
| RF13 | Som de motor acompanhando a rotação | Depois |
| RF15 | Cinco tentativas cronometradas e uma volta de reconhecimento | MVP |

## Regras adicionais propostas

- O reconhecimento é opcional e não gera resultado oficial.
- A tentativa é consumida ao terminar a contagem regressiva.
- O consumo deve ser salvo imediatamente, antes de a corrida prosseguir.
- Abandonar, reiniciar ou invalidar uma volta consome a tentativa iniciada.
- Recarregar a página mantém as tentativas consumidas.
- A melhor volta válida define o resultado.
- Depois das cinco tentativas, o treino é livre e não altera o resultado.
- Uma corrida iniciada antes da virada do dia mantém seu desafio original.
- Se não houver volta válida, mostrar resultado sem tempo e sem medalha.
- Reposicionar o kart em uma tentativa oficial invalida a volta.
- Reconhecimento e treino permitem reposicionamento sem penalidade.

Essas propostas precisam ser confirmadas antes de implementar a máquina de estados.

## Percurso e setores

Separar os quatro setores de apresentação dos marcadores de validação.
Passar por quatro checkpoints não é suficiente para detectar todos os atalhos.

Validar ordem e sentido de passagem pelos marcadores, além do cruzamento da
chegada. Definir tolerância de saída da pista e critérios de corte antes de
implementar a validação.

Não concluir volta ao cruzar a chegada na contramão ou sem completar o percurso.
Sair para a grama reduz velocidade; não invalida automaticamente uma volta
sem uma regra de corte correspondente.

## Estados propostos

Seleção de controle → pronto → contagem regressiva → correndo →
resultado da tentativa → próxima tentativa ou resultado final.

Reconhecimento e treino têm estados separados e não escrevem tempos oficiais.
Interrupção, pausa, invalidação e abandono precisam de transições explícitas.

## Cronometragem

O relógio oficial deve acompanhar a simulação, não a quantidade de quadros
renderizados. Definir precisão interna e arredondamento de exibição.
Os quatro tempos de setor devem compor o tempo total dentro da regra de precisão.

## Aceite

- Completar uma volta válida registra tempo total e quatro setores.
- Cortar caminho, inverter o sentido da chegada e pular marcadores não gera
  resultado válido.
- Recarregar não restitui tentativa já consumida.
- Treino não modifica o resultado oficial.
- A virada do dia não troca a pista no meio de uma corrida.
- Abandono e reposicionamento seguem as regras aprovadas.

Pausas, perda de foco e recuperação após falhas estão pendentes em
[09-decisoes-pendentes.md](09-decisoes-pendentes.md).
