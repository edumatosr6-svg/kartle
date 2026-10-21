# Diversão e manobras

O usuário pediu uma experiência mais divertida, incluindo pilotagem e manobras.
A implementação inicial adiciona uma manobra voluntária no treino Arcade:
**drift controlado → carga → turbo de saída**.

## Critérios

- Direção comum permanece fácil sem exigir drift.
- A manobra depende de direção, velocidade e deslizamento reais.
- Feedback claro do progresso e do momento de soltar.
- Recompensa graduada e combo curto para ligar curvas.
- Evitar pontuação por segurar o botão parado ou na reta.
- Cancelar bônus pendente em saída de pista, colisão ou rodada.
- Separar pontuação de estilo do tempo de volta.
- Suportar teclado e botão de toque.
- Preservar Realista sem manobras arcade.
- Testar efeitos sem degradar a fluidez.

Regras e limites estão em [docs/maneuvers.md](../docs/maneuvers.md).
O ajuste de diversão permanece iterativo com o usuário; não é uma validação
de usabilidade concluída.
