# Diretrizes do Projeto

## Checklist Rápido para Implementação Nova

1. O dado novo é chaveado por `challengeNumber` (e carrega `trackVersion`), e não pela data ou pelo nome da pista (I1)?
2. A regra de jogo (validade de volta, tempo, tentativa, medalha) ficou na simulação ou na aplicação, e não na renderização nem num adaptador de controle?
3. A simulação continua sem `three`, DOM, relógio e aleatório não semeado?
4. Formato persistido ou publicado mudou? Então há versão nova e leitor da anterior, com teste.
5. Sem servidor, sem sensor ou com permissão negada, o jogo solo continua funcionando (I4)?
6. Existe teste em `tests/` que avança a simulação com `STEP`?

---

## Padrões Obrigatórios

### Simulação (`src/track.ts`, `src/physics.ts`, `src/maneuvers.ts`)
- Fluxo: `track → physics/maneuvers` (nunca importar da aplicação)
- Funções puras: recebem estado e entrada, devolvem estado novo
- Parâmetros de kart ficam nos presets de `src/physics.ts` (`ARCADE_KART`, `RENTAL_KART`), não espalhados como literais

### Cliente (`src/main.ts`, `src/audio.ts`)
- Adaptadores de controle só produzem o `Input` normalizado
- O estado da simulação só muda por `step`
- Texto para o jogador previsto em português e inglês (RNF11)
- Nenhum dado pessoal coletado; nenhuma requisição de rede da qual o modo solo dependa

### Testes
- Toda alteração relevante vem com teste
- Formato: teste que **falha antes** e **passa depois** da correção
- Cobertura mínima: fluxo principal + regressão + edge case
- Mudança na simulação mantém um teste de determinismo (mesma entrada duas vezes → mesmo estado)
- Mudança de sensação de pilotagem registra a saída de `npm run bench:physics` / `npm run bench:handling` em `docs/physics.md`

---

## O Que Não Fazer

Ainda sem entradas: cada linha aqui deve nascer de um erro real que custou um bug neste projeto.
