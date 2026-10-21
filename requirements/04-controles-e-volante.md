# Controles e volante

## Requisitos originais

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RF12 | Teclado com setas e WASD | MVP |
| RF20 | Celular sozinho: inclinação, acelerar e frear por botões | MVP |
| RF21 | QR code abre controle já associado à sala do computador | Depois |
| RF22 | Calibrar posição neutra e ajustar sensibilidade | MVP |
| RF23 | Vibrar em colisões ou saída de pista | Depois |
| RF24 | Reconectar automaticamente com jogo pausado | Depois |

## Contrato comum

Cada controle produz acelerar, frear e esterçar em um formato único.
A física não depende diretamente do teclado, dos sensores ou da conexão.
Definir limites, frequência de atualização e normalização no contrato técnico.

## Celular sozinho

- Solicitar permissão de sensores no momento apropriado da interação.
- Calibrar posição neutra ao começar.
- Oferecer ajuste de sensibilidade e zona morta.
- Tratar orientação da tela e mudanças de orientação.
- Proposta: permitir direção por toque se o sensor falhar, for recusado ou
  se o jogador preferir.

Escolher orientação da tela e comportamento após recalibração antes da UI final.

## Volante remoto

1. Computador cria sala temporária.
2. Exibe QR code com link de pareamento.
3. Celular entra, pede permissões e calibra.
4. Computador confirma controlador conectado.
5. Celular transmite entradas; computador simula e desenha.

Requisitos adicionais propostos:

- Token de pareamento não previsível e sala com expiração.
- Um controlador ativo por sala.
- Encerrar ou substituir o controlador mediante ação explícita.
- Não deixar aceleração presa se os pacotes pararem de chegar.
- Exibir estado de conexão e opção de voltar ao teclado.
- Tratar mensagens atrasadas e fora de ordem.
- Limitar frequência e tamanho das mensagens.

Na desconexão, seguir RF24: pausar e tentar reconectar.
A elegibilidade de uma volta pausada para ranking permanece pendente.
RF24 não autoriza criar novas tentativas a cada reconexão.

## Vibração

Aplicar quando suportada. A ausência de vibração não impede jogar.
Não depender dela como único aviso de colisão ou saída.

## Aceite

- Teclado e celular produzem comandos equivalentes para a simulação.
- Recusa de permissão apresenta uma alternativa utilizável conforme escopo aprovado.
- Cinco testadores conseguem parear e completar uma volta sem ajuda.
- Queda de conexão elimina entradas persistentes e mostra o estado correto.
- Reconexão recupera a sala sem duplicar controladores.
- Latência é medida nas condições de rede definidas no plano de qualidade.
