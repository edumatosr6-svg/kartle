# Contexto do Projeto

## Referências Arquiteturais

Consultar **sempre** antes de alterar fluxos críticos:

| Arquivo | Consultar para |
|---------|---------------|
| `README.md` | Execução, controles, organização dos módulos, limites da entrega atual |
| `requirements/06-arquitetura-e-dados.md` | Separação de responsabilidades, contratos de pista, versionamento |
| `requirements/09-decisoes-pendentes.md` | O que ainda é proposta (`Dnn`) e não pode virar regra no código |
| `docs/physics.md` | Modelo físico, parâmetros, fontes e resultados de ensaio |
| `docs/maneuvers.md` | Regras de drift, turbo e pontuação |

**Fluxos críticos que obrigam consulta:** passo da simulação, validação de volta, pontuação de manobras,
formato de pista e de replay, consumo de tentativa.

---

## Estrutura do Código

O código fica na raiz do repositório.

| Camada | Pasta | Responsabilidade |
|--------|-------|-----------------|
| Dados de pista | `src/track.ts` | Geometria, gates de volta, setores — dados puros |
| Simulação | `src/physics.ts`, `src/maneuvers.ts` | Movimento, colisões, validação de volta, tempo, drift e turbo; determinística, sem DOM nem Three.js |
| Adaptadores de controle | `src/main.ts` (hoje) | Teclado, inclinação e toque → `Input` normalizado |
| Aplicação | `src/main.ts`, `src/audio.ts`, `src/style.css`, `index.html` | Telas, HUD, renderização Three.js, som, persistência |
| Testes | `tests/` | `node:test` via `tsx` |
| Ensaios | `scripts/` | `physics-bench.ts`, `keyboard-lap.ts` |

Os mesmos caminhos aparecem, como papéis de árvore, em
`300 Specs/330 D-Specs/Input/domain-directives.md`. Se divergirem, o D-Spec é a fonte — este arquivo é a
leitura humana daquela tabela.

## Arquivos Críticos por Área

**Física e determinismo:** `src/physics.ts`

**Volta e percurso:** `src/track.ts`, `LapTracker` em `src/physics.ts`

**Manobras e pontuação:** `src/maneuvers.ts`

**Testes base:** `tests/physics.test.ts`, `tests/maneuvers.test.ts`

---

## Fluxo Principal (TL;DR)

1. `src/main.ts` lê teclado, inclinação ou toque e monta o `Input`.
2. `step(state, input)` avança a simulação em passos fixos de `STEP` (1/120 s), com subpassos de 480 Hz, e atualiza manobras.
3. `LapTracker` acompanha os gates sequenciais e fecha a volta.
4. `src/main.ts` renderiza o estado com Three.js, atualiza HUD e som.
