# The seeds of the pipeline

`220 Input/<slug>/SEED.md` holds the **formal seeds** — the only entry point of the chain. Nothing else
in this folder is read by a loop, and no automated process ever writes here: the seed belongs to its
author.

## Collaborative drafts

Delete this section if the project has a single requirements author.

Each collaborator has a folder of their own under
`200 Requirements/240 Colaborative/<collaborator>/<slug>/SEED.md`. Until they are promoted, those files
are drafts and are not input to the pipeline. When a requirement is ready, it is **moved** to
`200 Requirements/220 Input/<slug>/SEED.md`, keeping the same slug.

## The integration gate

**Collaborators' seeds are integrated only once everyone has posted, and the integration is a spoken
step, never an automatic one.** It happens because a product owner declared that it should — not because
a condition was computed, not from a checklist, and never on the initiative of a skill or a loop.

The reason for waiting is about content, not ceremony: one mechanism seen by two collaborators usually
arrives as two slugs, and requirements that contradict each other only surface when the drafts are read
side by side. Promoting the first one that is ready freezes a decision the second draft may still
change — and from there the pipeline generates F-Spec, design and code on top of it.

Until the integration is spoken:

- the drafts stay in `240 Colaborative/<collaborator>/`, evolving by revision;
- `220 Input/` stays empty, and `pipeline-progress` correctly reports that no slug is in the pipeline;
- no loop runs — not even `req-loop`, even if a draft is already complete and free of `OPEN` items.

That state is indistinguishable from a pipeline stopped by mistake, which is why it is written down here:
an empty `Input` is the intended state before integration, not a pending task.

When the integration is spoken, the drafts are read together: duplicate slugs are merged, contradictions
become `OPEN-<nn>` in the seed that carries them, and only then is the set moved into `220 Input/`.

## Current drafts

| Slug | Current location | Channels | Collaborator | Revision | What it covers |
|---|---|---|---|---|---|
| race-lap-validation | `220 Input/race-lap-validation/` | web-desktop, web-mobile | eduardo.matos | 2 | Largada, cronometragem, setores e validade da volta |
| dirigibilidade | `220 Input/dirigibilidade/` | web-desktop, web-mobile | eduardo.matos | 3 | Sensação de pilotagem do Arcade: resposta do volante, aderência, aceleração |
| modelo-kart-01 | `220 Input/modelo-kart-01/` | web-desktop, web-mobile | eduardo.matos | 1 | Kart 01 low-poly em escala real e câmera de jogo atrás do piloto |
| pista-kart-park | `220 Input/pista-kart-park/` | web-desktop, web-mobile | eduardo.matos | 1 | Kart Park, primeira pista real, ao lado da sintética no treino |

## Conventions

- A slug uses only lowercase letters, digits, hyphen or underscore; no `feature-` prefix.
- A slug keeps exactly the same name when promoted, and in every later stage.
- New requirements are created under `200 Requirements/240 Colaborative/<collaborator>/<slug>/`.
- Every requirement states its product channels.
- Supporting material may sit beside the `SEED.md`, but everything needed to understand the requirement
  must be in that Markdown or in a sibling Markdown file.

How to write and revise a seed: `.claude/skills/seed-authoring/SKILL.md`.
