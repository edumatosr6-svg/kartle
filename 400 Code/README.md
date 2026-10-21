# 400 Code - stage 4

| Folder | Holds |
|---|---|
| `Input` | Code directives: the layer map and the tree roles |
| `Output` | Per-feature manifest, traceability and reports - never a copy of the source |
| `Source` | **The code root.** Every path the directives name is relative to this folder |

The directives state the tree roles - `<source>`, `<web>`, `<mobile>`, `<migrations>`,
`<tests>` - relative to the code root on purpose: moving the code root must not require
rewriting them.

`/code-loop <feature>`.
