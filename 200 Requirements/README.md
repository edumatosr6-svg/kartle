# 200 Requirements - stage 1

What the product must do, one feature at a time.

| Folder | Holds |
|---|---|
| `210 Docs` | Product context the stage reads. Context only - never a source of requirements |
| `220 Input` | The seeds: `<feature>/SEED.md`, human-authored. **No loop writes here** - only `colab-promote`, on a declared instruction |
| `230 Output` | Generated requisites sets, one folder per feature |
| `240 Colaborative` | Collaborator drafts before promotion, one folder per author |
| `240 Colaborative/241 Merged` | Stage 0 output: the consolidated set, the decisions register, the questions per round |

Start a feature by authoring `220 Input/<feature>/SEED.md` - see the `seed-authoring` skill -
then run `/req-loop <feature>`. With several authors, each drafts under `240 Colaborative/<author>/<feature>/`,
`/colab-loop` consolidates them and asks the questions, and `/colab-promote` moves the validated
seeds into `220 Input`.
