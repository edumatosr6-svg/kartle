# Kartle — Ideia e Requisitos

Oct 20, 2026 · @Eduardo Matos

## Visão geral

Kartle é um jogo de kart no navegador com uma pista real do mundo por dia, igual para todos os jogadores, no espírito do Wordle. A pessoa dá até 5 voltas, fica com o melhor tempo, ganha medalha e compartilha o resultado em texto com emojis.

O diferencial é o celular como volante: no computador aparece um QR code, a pessoa escaneia e dirige inclinando o celular, sem instalar nada. As pistas vêm do OpenStreetMap, então o catálogo cobre pistas de kart reais de vários países.

Objetivo: ser o projeto vitrine do portfólio para conseguir freelas. Ele precisa ser jogável em menos de 10 segundos a partir do link e demonstrar tempo real, 3D, sensores, engenharia de dados e deploy em um só projeto.

**Pitch em uma linha:** "Uma pista de kart real por dia. Escaneie, incline o celular e bata o tempo do mundo."

## Como funciona

O loop diário leva de 3 a 5 minutos e termina num resultado compartilhável.

1. A pessoa abre o site e vê a pista do dia em silhueta, com o número do desafio (ex.: Kartle #42) e a contagem regressiva para a próxima.
2. Escolhe como dirigir: teclado, celular sozinho (inclinando a tela) ou celular como volante do computador (QR code).
3. Faz uma volta de reconhecimento opcional, que não conta tempo.
4. Tem 5 tentativas. Cada volta registra o tempo total e os tempos de 4 setores. Vale a melhor.
5. Ao terminar, recebe medalha (ouro, prata, bronze ou nenhuma), vê a posição no ranking do dia e corre contra o fantasma da sua melhor volta.
6. Modo adivinhar (opcional): se o nome da pista estiver oculto, tenta adivinhar o país num mapa. A distância do palpite vira pontos extras.
7. Compartilha o resultado com um toque:

```
Kartle #42 — 🇮🇹 Lonato
⏱️ 48.312s 🥈
Setores: 🟩🟩🟨🟩
🔥 Sequência: 7 dias
kartle.app
```

No dia seguinte a pista muda para todo mundo ao mesmo tempo, à meia-noite de Brasília (UTC-3).

## Requisitos funcionais

São 30 requisitos em 6 módulos. Os marcados MVP formam a primeira versão publicável; os demais entram depois.

| ID | Módulo | Requisito | Prioridade |
| --- | --- | --- | --- |
| RF01 | Banco de pistas | Script Python busca pistas de kart no OpenStreetMap via Overpass API | MVP |
| RF02 | Banco de pistas | Filtra só circuitos fechados entre 400 m e 1.500 m | MVP |
| RF03 | Banco de pistas | Converte lat/lon para metros, suaviza a curva e reamostra pontos a cada 2 m | MVP |
| RF04 | Banco de pistas | Usa a largura do OSM quando existe, senão 8 m | MVP |
| RF05 | Banco de pistas | Gera imagem de preview de cada pista para revisão manual (aprovar ou rejeitar) | MVP |
| RF06 | Banco de pistas | Salva um JSON por pista aprovada e um calendário com a ordem dos dias | MVP |
| RF07 | Jogo | Gera a pista 3D a partir do JSON: asfalto, zebras nas curvas, grama e barreiras | MVP |
| RF08 | Jogo | Kart com física arcade: aceleração, freio, esterço, perda de aderência e grama mais lenta | MVP |
| RF09 | Jogo | Largada com contagem regressiva, 4 checkpoints/setores e linha de chegada | MVP |
| RF10 | Jogo | Volta inválida se o kart cortar caminho (checkpoint pulado) | MVP |
| RF11 | Jogo | Câmera de perseguição, HUD com tempo, setores e velocidade, e minimapa | MVP |
| RF12 | Jogo | Controle por teclado (setas/WASD) | MVP |
| RF13 | Jogo | Som de motor que acompanha a rotação | Depois |
| RF14 | Camada Wordle | Pista do dia escolhida pela data, igual para todos | MVP |
| RF15 | Camada Wordle | 5 tentativas cronometradas por dia, mais 1 volta de reconhecimento | MVP |
| RF16 | Camada Wordle | Medalhas por tempo, calculadas a partir do comprimento e da curvatura da pista | MVP |
| RF17 | Camada Wordle | Botão de compartilhar com o texto do resultado (área de transferência e Web Share API) | MVP |
| RF18 | Camada Wordle | Sequência de dias jogados e estatísticas salvas no navegador | MVP |
| RF19 | Camada Wordle | Fantasma da melhor volta do jogador | MVP |
| RF20 | Celular | Modo celular sozinho: dirige inclinando a tela, com botões de acelerar e frear | MVP |
| RF21 | Celular | Modo volante: QR code no computador abre a página de controle já ligada à sala | Depois |
| RF22 | Celular | Calibração da posição neutra ao tocar em "começar" e ajuste de sensibilidade | MVP |
| RF23 | Celular | Vibração ao bater ou sair da pista | Depois |
| RF24 | Celular | Reconexão automática se o celular perder a conexão, com o jogo pausado | Depois |
| RF25 | Ranking | Envio do melhor tempo do dia com apelido, sem cadastro | Depois |
| RF26 | Ranking | Top 50 do dia e posição do jogador | Depois |
| RF27 | Ranking | Validação básica no servidor: tempo mínimo possível e replay da volta | Depois |
| RF28 | Ranking | Fantasma do 1º colocado do dia para desafiar | Depois |
| RF29 | Modo adivinhar | Nome e país da pista ocultos até o fim das tentativas | Depois |
| RF30 | Modo adivinhar | Palpite num mapa-múndi, pontuação pela distância, revelação com a localização real | Depois |

## Requisitos não funcionais

As metas abaixo existem para que o jogo abra rápido e responda bem em celular comum, que é onde a primeira impressão acontece.

| ID | Tema | Meta |
| --- | --- | --- |
| RNF01 | Tempo até jogar | Do link aberto até o kart andando em menos de 10 s, numa conexão 4G |
| RNF02 | Tamanho | Página inicial com menos de 3 MB; pista do dia com menos de 200 KB |
| RNF03 | Desempenho | 60 fps em notebook comum e pelo menos 30 fps em celular intermediário |
| RNF04 | Latência do volante | Do celular à tela em menos de 100 ms pela internet; menos de 30 ms na mesma rede |
| RNF05 | Compatibilidade | Chrome, Edge, Firefox e Safari atuais; Android e iOS (com o pedido de permissão do giroscópio no iOS) |
| RNF06 | HTTPS | Obrigatório, senão o navegador bloqueia o giroscópio |
| RNF07 | Determinismo | Física com passo fixo, para a mesma entrada gerar a mesma volta (base para fantasma e validação) |
| RNF08 | Disponibilidade | O modo solo funciona mesmo se o servidor cair; só ranking e volante dependem dele |
| RNF09 | Licença | Crédito visível "© OpenStreetMap contributors" e menção à licença ODbL |
| RNF10 | Privacidade | Sem cadastro e sem coleta de dados pessoais; ranking só com apelido |
| RNF11 | Idioma | Interface em inglês e português, detectando o idioma do navegador |
| RNF12 | Custo | Hospedagem total abaixo de US$ 10 por mês no lançamento |

## Arquitetura e stack

&#91;embedded content: arquitetura · 7 componentes, 3 entram depois do MVP\]

O MVP usa só a linha de cima e a tela do jogo, sem servidor. Servidor e banco entram com o volante e o ranking. No modo celular sozinho, a própria tela do jogo roda no celular.

| Camada | Tecnologia |
| --- | --- |
| Banco de pistas | Python, requests, shapely, scipy (suavização por spline), matplotlib (previews) |
| Jogo | TypeScript, Vite, Three.js, física arcade própria com passo fixo |
| Celular | DeviceOrientation API, Vibration API, Web Share API |
| Servidor | Node.js, Socket.IO (só WebSocket), Fastify para a API |
| Banco | PostgreSQL |
| Deploy | Hospedagem estática com CDN para o jogo; VPS com HTTPS para o servidor |

## Modelo de dados

Tudo gira em torno de dois arquivos: o JSON da pista, gerado offline pelo script, e o registro de volta, gerado pelo jogo.

**Pista** (`tracks/<id>.json`): pontos em metros, já suavizados e no sentido da corrida.

```json
{
  "id": "osm-123456789",
  "name": "Kartodromo Exemplo",
  "city": "Lonato",
  "country": "IT",
  "lat": 45.46, "lon": 10.48,
  "lengthM": 1012,
  "widthM": 8,
  "direction": "clockwise",
  "points": [[0.0, 0.0], [1.9, 0.4], [3.8, 0.9]],
  "startIndex": 0,
  "checkpoints": [0, 126, 253, 380],
  "medals": { "gold": 46.5, "silver": 49.0, "bronze": 53.0 },
  "source": { "osmWayId": 123456789, "license": "ODbL" }
}
```

**Calendário** (`calendar.json`): lista de IDs de pista; o índice do dia é o número de dias desde a data de lançamento.

**Volta** (enviada ao ranking e usada no fantasma):

```json
{
  "day": 42,
  "trackId": "osm-123456789",
  "nickname": "edu",
  "timeMs": 48312,
  "sectorsMs": [11820, 12404, 12911, 11177],
  "inputs": "<entradas do jogador por passo de física, compactadas>",
  "version": "1.0.0"
}
```

Guardar as entradas, e não as posições, deixa o arquivo pequeno e permite ao servidor refazer a volta para conferir o tempo (RNF07). O fantasma pessoal usa o mesmo formato, salvo no navegador.

## Escopo e roadmap

O MVP é o jogo solo com pista do dia, medalhas, compartilhar e celular sozinho, sem servidor. Ele cabe em cerca de 3 fins de semana e já serve de portfólio.

**Fora do escopo do MVP:** multiplayer em tempo real entre jogadores, contas de usuário, editor de pistas, karts customizáveis, elevação do terreno e app nativo.

1. **Banco de pistas** (fim de semana 1): script do OSM, filtros, previews e revisão de 60 a 100 pistas. RF01–RF06.
2. **Jogável no teclado** (fins de semana 1–2): pista 3D, kart arcade, setores e HUD. RF07–RF12.
3. **Camada Wordle** (fim de semana 2): pista do dia, tentativas, medalhas, compartilhar, sequência e fantasma. RF14–RF19.
4. **Celular sozinho e deploy** (fim de semana 3): inclinação, calibração, publicação com HTTPS. RF20, RF22. **Fim do MVP.**
5. **Celular como volante** (fim de semana 4): servidor, salas, QR code, vibração e reconexão. RF21, RF23, RF24.
6. **Ranking** (fim de semana 5): top 50, validação por replay e fantasma do 1º colocado. RF25–RF28.
7. **Modo adivinhar e polimento** (fim de semana 6): país oculto, mapa de palpite, som de motor. RF13, RF29, RF30.

## Riscos e critérios de sucesso

O maior risco é a qualidade das pistas do OSM; por isso a etapa 1 vem antes de qualquer código de jogo.

| Risco | Impacto | Como reduzir |
| --- | --- | --- |
| Pistas mal mapeadas no OSM (pedaços soltos, traçado torto) | Pistas feias ou impossíveis | Filtro automático + revisão manual por preview; juntar segmentos quando possível |
| Poucas pistas boas | Catálogo acaba rápido | Medir na etapa 1; se faltar, incluir autódromos e pistas de corrida com escala reduzida |
| Dirigir pelo giroscópio parecer ruim | Diferencial perde a graça | Zona morta, curva de sensibilidade e calibração; testar com 5 pessoas antes de publicar |
| Latência alta no modo volante | Kart "atrasado" | WebSocket puro, suavização na tela, servidor perto do Brasil |
| Trapaça no ranking | Ranking perde valor | Validação por replay das entradas (RF27) |
| Escopo crescer demais | Projeto nunca é publicado | Publicar o MVP no fim de semana 3, mesmo simples |

**Critérios de sucesso**

- [ ] MVP publicado com pelo menos 60 pistas no calendário
- [ ] Alguém que nunca viu o jogo começa a dirigir em menos de 10 s
- [ ] 5 testadores conseguem completar uma volta pelo celular sem ajuda
- [ ] Vídeo de 30 s do modo volante gravado para portfólio e redes
- [ ] Link do Kartle usado em pelo menos 10 propostas de freela
