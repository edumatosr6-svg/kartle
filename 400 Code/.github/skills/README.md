# Skills do produto

Estas skills são **do produto**, não do pipeline — e é por isso que o bootstrap não traz nenhuma: elas
só existem depois que o software existe.

A distinção vale a pena manter explícita:

| | `.claude/skills/` na raiz do repo | `<código>/.github/skills/` (aqui) |
|---|---|---|
| Do que sabem | do processo | do produto |
| Podem nomear o domínio? | **nunca** | é a razão de existirem |
| Sobrevivem à troca de projeto? | sim, sem edição | não |
| Quem as escreve | vêm prontas do bootstrap | este projeto, conforme aprende |

Uma skill nasce aqui quando um procedimento do produto foi explicado três vezes e ainda foi executado
errado. Cada uma cobre um fluxo concreto — alterar a definição-fonte do domínio, depurar um estado,
gerar os testes de um caso, mapear o impacto de um refactor, endurecer um webhook para produção.

Registre cada skill nova em `../.claude/claude.json`, no bloco `skills`.
