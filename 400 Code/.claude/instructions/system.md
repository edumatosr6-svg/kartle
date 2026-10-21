# Instruções de Sistema

## Identidade do Projeto

Kartle é um jogo de kart 3D no navegador, com uma pista real por dia igual para todos, sessões de 3 a 5
minutos e resultado compartilhável, para jogadores no computador (teclado) e no celular (inclinação e
toque).

**Princípio central: CHALLENGE-FIRST.** Tudo é chaveado pelo desafio diário — `challengeNumber`, que
resolve para um único `trackId` + `trackVersion` (invariante I1 de
`100 Admin/120 Processes/domain-invariants.md`). Nada é chaveado só pela data local, pelo relógio ou pelo
nome da pista.

Stack: TypeScript 5.9 + Vite 8 + Three.js 0.186 | dados do jogador no armazenamento do navegador (sem
banco no MVP) | dados de pista do OpenStreetMap via pipeline offline (ODbL)

O código fica na **raiz do repositório** (`src/`, `tests/`, `scripts/`), não em `400 Code/Source/`.
Todos os caminhos abaixo são relativos à raiz do repositório.

---

## Hierarquia de Conflito

Em caso de conflito entre fontes, esta ordem prevalece:

1. `400 Code/.claude/instructions/` (este arquivo e irmãos)
2. `100 Admin/120 Processes/domain-invariants.md`
3. `requirements/` (planejamento; um `Dnn` aberto é proposta, não regra)
4. `docs/physics.md` e `docs/maneuvers.md`

---

## Regras Absolutas

Poucas, absolutas, e cada uma verificável por quem revisa o diff.

1. **Challenge-first é inviolável** — proibido criar tentativa, resultado, fantasma, medalha, sequência
   ou estatística chaveada por data local, relógio ou nome da pista.
2. **Formatos persistidos são área protegida** — arquivo de pista, replay e dados do jogador: sem
   alteração sem autorização explícita; toda mudança leva versão e leitor da versão anterior.
3. **Sem remoção sem autorização** — arquivos, funções, presets, testes, benches: preservar na dúvida.
4. **Escopo estrito** — alterar apenas arquivos citados na task. Arquivos adicionais: identificar,
   justificar, aguardar aprovação.
5. **Sem refatoração espontânea** — reorganização, renomeação, limpeza e "melhoria" não solicitada são
   violação de escopo. Dividir `src/main.ts` é uma tarefa própria, nunca efeito colateral.
6. **Camadas arquiteturais obrigatórias** — `track → physics/maneuvers → adaptadores de controle →
   main`. A simulação (`src/track.ts`, `src/physics.ts`, `src/maneuvers.ts`) nunca importa `three`, DOM,
   `src/audio.ts` ou `src/main.ts`.
7. **Simulação determinística** — passo fixo `STEP`; nada de `Date`, `performance.now` ou `Math.random`
   na simulação. Mudar o passo, a taxa do solver ou o significado de um campo de `Input` invalida replays
   e é mudança versionada.
8. **Git é exclusivo do usuário** — proibido commit, add, push, merge, rebase ou qualquer ação git sem
   instrução explícita.

---

## Áreas Críticas (autorização explícita obrigatória)

- `src/physics.ts` — dinâmica dos pneus, passo fixo de 120 Hz com solver de 480 Hz, `LapTracker`.
  Determinismo e sensação de pilotagem.
- `src/track.ts` — geometria e gates de volta; define o que é volta válida.
- `src/maneuvers.ts` — carga de drift, turbo, pontos e combos; pontuação determinística.

---

## Conduta em Caso de Dúvida

Quando houver ambiguidade, conflito arquitetural ou necessidade de alteração estrutural: **parar e
solicitar direcionamento.**

Nunca assumir. Previsibilidade arquitetural tem prioridade sobre otimização oportunista.

---

## Formato de Entrega (sem git)

Após implementação, apresentar:
1. Arquivos alterados
2. Resumo objetivo das mudanças
3. Testes executados
4. Próximos comandos sugeridos (sem executá-los)
