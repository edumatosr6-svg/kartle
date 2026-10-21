# 600 Deploy - stage 6

| Folder | Holds |
|---|---|
| `Input` | Deploy directives: environments, pipelines, packaging, observability |
| `Output` | Per-feature release candidate: pipelines, migration plan, runbook, smoke checks |

No secret value is ever written here, and no loop promotes to production - `deploy-loop`
ends with the promotion question and a human answers it.

`/deploy-loop <feature>`.
