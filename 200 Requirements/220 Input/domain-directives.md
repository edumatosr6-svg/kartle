# Requirements stage — project directives (Kartle)

Read by `req-generator`, `req-validator` and `req-loop` as the directives of this stage. The pipeline
skills carry no knowledge of this project; everything Kartle-specific those loops enforce is here.

Invariants referenced by id (`I1`…`In`) are defined in
[domain-invariants.md](../../100%20Admin/120%20Processes/domain-invariants.md).

## Language

**Every artifact of this project is written in Brazilian Portuguese (pt-BR)** — seeds, requisites, specs,
design, reports and commit-facing documents alike. This is the project's declaration under conventions §2
and it binds every stage, not only this one.

Never translated, because a machine reads them: the identifier prefixes (`US-`, `NFR-`, `AC-`, `FEAT-`,
`REQ-`, `FLOW-`, `API-`, `SCR-`, `DES-`, `DM-`, `ADR-`, `TEST-`, `CHK-`, `REL-`, `OPEN-`, `ISSUE-`); the
front-matter keys and their values (`stage`, `status: draft | validated`, `verdict: SUCCESS | FAIL`); the
severities (`blocker`, `error`, `warning`, `info`, `divergence`); the fixed file names (`00-index.md`,
`98-divergences.md`, `99-traceability.md`, `SEED.md`); the channel names; and the slug itself.

Domain vocabulary kept in its original form: the planning ids of `requirements/` (`RF01`–`RF30`,
`RNF01`–`RNF12`, `D01`–`D30`); `OSM`, `ODbL`; the kart presets **Arcade assistido** and
**Realista — aluguel 4T**; the code names `challengeNumber`, `trackId`, `trackVersion`, `STEP`, `Input`.

## Section names

**Seed (`SEED.md`)**

| Canonical | This project |
|---|---|
| Overview | `## Visão geral` |
| Context | `## Contexto` |
| Actors and channels | `## Atores e canais` |
| User stories | `## Histórias de usuário` |
| Domain rules | `## Regras de domínio` |
| Non-functional requirements | `## Requisitos não funcionais` |
| Constraints | `## Restrições` |
| Domain impact | `## Impacto no domínio` |
| Risks and unknowns | `## Riscos e incógnitas` |
| Out of scope | `## Fora do escopo` |

**Story file (`stories/US-nnnn-*.md`)**

| Canonical | This project |
|---|---|
| Story | `## História` |
| Channels | `## Canais` |
| Preconditions | `## Pré-condições` |
| Acceptance criteria | `## Critérios de aceite` |
| Abnormal cases | `## Casos anormais` |
| Sources | `## Fontes` |
| Open points | `## Pontos em aberto` |

**Requisites set**

| Canonical | This project |
|---|---|
| `01-context.md` heading | `# Contexto` |
| `02-glossary.md` heading | `# Glossário` |
| `98-divergences.md` heading | `# Divergências` |
| `99-traceability.md` heading | `# Rastreabilidade` |

## Vocabulary

| | Values |
|---|---|
| Actors | Jogador; Curador do catálogo (revisa e publica pistas); Pipeline de pistas (processo offline) |
| Channels | `web-desktop` (teclado), `web-mobile` (inclinação e toque), `remote-wheel` (celular como volante — pós-MVP) |
| Observation points for a criterion | estado da tela/HUD; estado da simulação após N passos de `STEP`; dado persistido no navegador; texto compartilhado; arquivo de pista gerado; saída de `npm test` ou dos benches |

## Directives

| # | Directive | Severity when broken |
|---|---|---|
| D-REQ-01 | Every game rule (attempts, lap validity, cuts, pauses, timing, medals, calendar) cites its source: an `RF`/`RNF` id, a closed `Dnn`, or a decision of the product owner. A `Dnn` still open in `requirements/09-decisoes-pendentes.md` is not a rule: it becomes an `OPEN-<nn>` addressed to the product owner, and no threshold is invented at this stage. | `error` |
| D-REQ-02 | No story keys attempts, results, ghosts, streaks or statistics on the local date, the clock or the track name instead of the challenge (I1). | `error` |
| D-REQ-03 | A story that changes attempt or result state states what a reload, an abandonment, a lost focus or a repeated event does (I7). | `error` |
| D-REQ-04 | No secret, credential, real user identifier or real production content appears in any file of this stage (I6). | `blocker` |
| D-REQ-05 | Every story names its channels; a `web-mobile` story states what happens when the sensor is missing or permission is denied (I4). | `error` |
| D-REQ-06 | A post-MVP feature (remote wheel, ranking, country guessing) or anything in I10 does not appear as an MVP story. | `error` |
| D-REQ-07 | Non-functional requirements cover, where they apply: load time to driving (RNF01), download size (RNF02), frame rate (RNF03), input latency (RNF04), browser support (RNF05), determinism (RNF07), solo without server (RNF08), privacy (RNF10), pt/en language (RNF11), accessibility, and offline behaviour. | `warning` |

## Seed authoring

A Kartle seed's `## Regras de domínio` cites, for each rule, the `RF`/`RNF`/`Dnn` it comes from in
`requirements/` or the product owner's decision, and lists the open `Dnn` it depends on as risks. It
names the challenge as the key of every result it introduces (I1). It never carries real player data,
copied OSM geometry or a physics constant tuned at seed time — tuning belongs to the design and its bench.
