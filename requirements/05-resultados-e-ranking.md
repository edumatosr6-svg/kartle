# Resultados, fantasmas, ranking e adivinhação

## Requisitos originais

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RF16 | Medalhas por tempo estimadas por comprimento e curvatura | MVP |
| RF17 | Compartilhar texto pela área de transferência e Web Share API | MVP |
| RF18 | Sequência e estatísticas no navegador | MVP |
| RF19 | Fantasma da melhor volta pessoal | MVP |
| RF25 | Enviar melhor tempo diário com apelido, sem cadastro | Depois |
| RF26 | Top 50 e posição do jogador | Depois |
| RF27 | Validar tempo mínimo e replay no servidor | Depois |
| RF28 | Fantasma do primeiro colocado | Depois |
| RF29 | Ocultar nome e país até o fim das tentativas | Depois |
| RF30 | Palpite no mapa, pontos por distância e revelação | Depois |

## Medalhas

A fórmula original gera limites iniciais. Proposta: revisar esses limites
jogando cada pista com a física que será publicada.
Definir limites inclusivos, precisão e regra de recalibração após mudanças.

Proposta para cores dos setores: referências próprias por setor, com faixas
verde, amarela e laranja; setor incompleto neutro.
As referências ainda precisam de definição e armazenamento no contrato da pista.

## Histórico e compartilhamento

Guardar desafio, tentativas, melhor volta, medalha e estatísticas no navegador.
Proposta: sequência aumenta ao completar pelo menos uma volta válida no dia.

O texto compartilhado inclui número do desafio, pista quando revelada, tempo,
medalha, cores dos setores, sequência e URL pública.
Tratar cancelamento do compartilhamento e indisponibilidade da área de transferência.
Não prometer sincronização entre navegadores sem um recurso específico.

## Fantasma

Guardar entradas por passo, estado inicial, versões de física e pista e tempos.
Verificar reprodução antes de adotar entradas como único formato do fantasma.
O fantasma não colide com o kart.
Não reproduzir silenciosamente dados incompatíveis com a versão instalada.

## Ranking

Enviar resultado para uma fila ou fluxo de validação definido na implementação.
Somente resultados validados entram na classificação.

Verificar:

- Desafio e versões permitidos.
- Formato, tamanho e limites das entradas.
- Percurso completo e tempo obtido pela simulação.
- Consistência de setores e tempo total.
- Limites de envio, duplicação e apelido.

Propostas:

- Identidade local anônima para atualizar o melhor resultado do navegador.
- Desempate pelo primeiro envio validado.
- Estados visíveis: pendente, aceito e rejeitado.

Sem conta, não é possível garantir uma única identidade por pessoa.
Replay valida compatibilidade com as regras, não comprova pilotagem humana.
Prazo de envio de desafios anteriores e política de pausas precisam ser definidos.

## Adivinhação

Definir momento do palpite, ponto de referência do país, fórmula de distância,
quantidade de palpites e momento da revelação.
Proposta: pontuação separada do ranking de corrida.
Compartilhamento deve ter política explícita contra revelação antecipada.
Ocultar na interface não torna secreta uma localização presente nos arquivos públicos.

## Aceite

- Melhor resultado persiste após reabrir a página.
- Medalhas e cores respeitam seus limites documentados.
- Fantasma reproduz uma volta de referência na tolerância aprovada.
- Replays inválidos são rejeitados e válidos são aceitos.
- Falha do ranking não impede a corrida solo.
- Adivinhação não altera tempos nem medalhas de corrida.
