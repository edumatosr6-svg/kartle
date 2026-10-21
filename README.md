# Kartle

Protótipo local de kart 3D, feito com TypeScript, Vite e Three.js.
Esta versão é treino livre em uma pista fictícia; não implementa ainda o
desafio diário, pistas OSM, ranking ou volante remoto.

## Executar

```sh
npm install
npm run dev
```

Abra a URL exibida pelo Vite. Para verificar:

```sh
npm test
npm run build
npm run bench:physics
```

## Controles

- W / seta para cima: acelerar.
- S / seta para baixo: frear.
- A e D / setas laterais: dirigir.
- R: reposicionar na largada.
- Escape: pausar ou continuar.
- Espaço + direção + acelerador: drift no modo Arcade. Solte Espaço com carga
  para receber turbo de saída. No celular, use o botão Drift.
- Som: botão para ativar motor e sinais de recompensa; desligado por padrão.
- Toque: direção, freio e acelerador em telas de toque.
- Inclinação: botão de ativação e calibração automática na primeira leitura.
  Sensores dependem de suporte, permissão e contexto seguro. Para testar em um
  celular físico, servir por HTTPS; localhost do computador não é o do celular.

O melhor tempo permanece apenas durante a sessão. Pausar e reposicionar são
permitidos neste treino livre. Não há limite de tentativas oficiais.
O acerto padrão é **Arcade assistido — fácil de pilotar**. Em **Acerto & telemetria**, você pode
compará-lo com **Realista — aluguel 4T**. Alterar estilo ou peso reinicia o treino
e o melhor tempo; massa e transferência de carga continuam ativas em ambos.
O arcade inclui direção proporcional à velocidade, frenagem equilibrada e
estabilização de derrapagem. O realista permanece sem essas assistências.
Execute `npm run bench:handling` para o ensaio de volta com comandos binários;
esse piloto de teste não está incluído no jogo.

## Organização

- `src/physics.ts`: dinâmica plana de quatro pneus, entrada de 120 Hz e solver de 480 Hz.
- `src/track.ts`: circuito sintético e gates de volta.
- `src/maneuvers.ts`: carga de drift, turbo, pontos e combos determinísticos.
- `src/main.ts`: renderização, controles e interface.
- `tests/physics.test.ts`: verificação de simulação e progresso de volta.
- `requirements/`: especificação e etapas de evolução.

## Limites desta entrega

Validação de volta por gates sequenciais é preliminar. Não substitui o sistema
final de cortes. Determinismo foi testado no mesmo runtime; equivalência entre
navegadores ainda precisa ser medida. Sensores precisam de teste em aparelhos reais.

A física agora considera massa, inércia, transferência de carga, deriva lateral,
saturação combinada dos pneus e tração/frenagem traseiras. O peso do piloto pode
ser ajustado no painel; alterações reiniciam treino e melhor tempo.
O modelo é inspirado em kart de aluguel 4T, ainda sem calibração contra um kart
real. Consulte [a documentação da física](docs/physics.md) para fontes,
parâmetros, resultados de ensaio e limitações.
As regras do drift e os controles estão em [manobras](docs/maneuvers.md).
