# Manobras e diversão — treino arcade

Versão de física: `rental-4t-v4`.

## Como jogar

1. Acelerar com W/seta para cima ou botão de toque.
2. Em uma curva, manter Espaço + direção + acelerador para iniciar o drift.
3. Manter o deslizamento no asfalto até carregar o medidor.
4. Soltar Espaço para receber um impulso curto na saída.

No celular, usar o botão **Drift** junto com direção e acelerador. Com inclinação,
a direção vem do sensor. As manobras ficam desativadas no acerto Realista.

O drift é opcional: a direção assistida normal continua funcionando como antes.
Não há direção automática por checkpoints ou linha ideal.

## Regras

- Só inicia com velocidade de pelo menos 6 m/s, direção suficiente e acelerador.
- Só carrega com deriva real de pelo menos 0,055 rad e rotação de pelo menos
  0,15 rad/s. Apertar o botão na reta não produz pontos.
- Exige os quatro pneus no asfalto.
- Frear, sair da pista, inverter a direção da manobra, cair abaixo de 5 m/s
  ou rodar além de 0,65 rad de deriva cancela carga e turbo.
- Colisão com o limite do circuito cancela manobra, turbo e combo.
- Pausar cancela carga/turbo/combo sem dar recompensa por soltar os controles.
- Reposicionar ou trocar peso/acerto reinicia os pontos do treino.
- Pontos já ganhos permanecem ao sair da pista ou bater.
- O melhor tempo da sessão continua separado da pontuação de estilo.

| Carga útil | Turbo | Pontos base |
| --- | --- | --- |
| 0,6 s | 0,8 s | 100 |
| 1,3 s | 1,3 s | 200 |
| 2,2 s | 1,8 s | 300 |

Um novo drift concluído até cinco segundos depois aumenta o multiplicador,
até 3×. A janela usa tempo da simulação. Um prêmio não é concedido duas vezes
ao manter o botão solto. Turbo seguinte substitui a duração anterior, sem acumular.
O acelerador continua necessário para aproveitar o turbo.

## Comportamento

Durante o drift, o esterço disponível aumenta moderadamente, a aderência traseira
diminui e a assistência permite mais deriva. Um momento limitado ajuda a
rotacionar na direção escolhida pelo jogador. Ao soltar, a estabilização normal
recupera o kart gradualmente.

O turbo aplica força adicional limitada pelo governador aumentado temporariamente.
São mecânicas arcade intencionais, não características de um kart de aluguel real.

## Feedback

- Medidor com três níveis e instrução explícita de quando soltar.
- Pontos de estilo e multiplicador separados do cronômetro.
- Marcas de pneu com pool limitado a 320 segmentos.
- Efeito de escapamento e borda iluminada durante o impulso.
- Campo de visão abre suavemente com velocidade/turbo; variação desativada
  quando o navegador indica preferência por movimento reduzido.
- Motor e sons de recompensa sintetizados, opcionais, acionados por botão.

## Verificação

`npm test` cobre carga, cancelamentos, tiers, combos, impulso físico,
determinismo e isolamento do modo Realista.
`npm run bench:handling` verifica que a volta normal por teclado continua
funcionando sem depender de drift.

Ainda é uma primeira calibração de diversão. Precisamos experimentar curvas e
voltas completas com pessoas, incluindo controles por toque em aparelhos reais.
O desafio diário e ranking terão de versionar regras/presets antes de comparar
tempos gerados com e sem manobras.
