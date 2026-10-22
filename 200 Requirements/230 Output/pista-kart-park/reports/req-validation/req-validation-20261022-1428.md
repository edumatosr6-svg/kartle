---
stage: req
feature: pista-kart-park
verdict: SUCCESS
generated: 2026-10-22T14:28:35Z
counts: {blocker: 0, error: 0, warning: 2, info: 4, divergence: 0}
seed: {revision: 1, digest: b5aa5be4734a}
upstream: {stage: seed, version: n/a}
feedbacks: []
isolation: 97-changelog.md traz o raciocínio do gerador ("Decisões do autor para esta execução", "Itens recusados, com motivo"); foi lido como artefato e não pesou em nenhum julgamento.
---

# Validação de requisitos — pista-kart-park

## Issues

### ISSUE-01
- severity: warning
- check: R4
- file: nfr/NFR-0011-codigo-depois-de-dirigibilidade.md
- location: tabela, coluna Fonte
- finding: A Fonte acrescenta "por decisão do autor para esta execução (2026-10-22), a dependência é registrada no D-Spec". Essa fonte não está em `SEED.md`, em `DOMAIN.md` nem em `210 Docs/`, embora o requisito em si rastreie a `SEED/RE-02`.
- expected: A Fonte cita só `SEED/RE-02`. Se o autor quiser essa regra, ela entra antes em `DOMAIN.md` e o conjunto a cita como `DOMAIN/DEC-nn`.

### ISSUE-02
- severity: warning
- check: R4
- file: 01-context.md
- location: ## Restrições (citadas do seed, seção Restrições), segundo item (linhas 161-162)
- finding: "Por decisão do autor para esta execução (2026-10-22), essa dependência deve ser registrada no D-Spec" passa uma instrução à etapa de design sem fonte em `SEED.md` nem em `DOMAIN.md`.
- expected: O item cita só a restrição do seed. Se o autor quiser essa regra, ela entra antes em `DOMAIN.md` e o conjunto a cita como `DOMAIN/DEC-nn`.

### ISSUE-03
- severity: info
- check: R3
- file: stories/US-0003-setores-e-validacao-da-volta.md
- location: AC-US-0003-07
- finding: "Borda da pista" não está no glossário, que define só "Borda do asfalto", e a zebra conta como pista. Leitura que decide o critério: no estado da simulação, o kart a mais de 3 m do limite externo de asfalto mais zebra, por mais de 1000 ms, invalida a volta.
- expected: O glossário define "Borda da pista" como o limite externo de asfalto mais zebra (`SEED/US-5`: a zebra conta como pista e não conta para o corte). AC-US-0003-07, AC-US-0003-08 e o verbete Corte usam esse termo.

### ISSUE-04
- severity: info
- check: R3
- file: stories/US-0004-barreira-nos-trechos-quase-encostados.md
- location: AC-US-0004-05
- finding: "A velocidade e a posição do kart depois de uma colisão" não diz o referencial nem o instante da comparação. Leitura que decide o critério: depois do mesmo número de passos de `STEP` desde o contato, a velocidade e a posição do kart no referencial local do obstáculo são iguais na barreira e no muro existente.
- expected: O critério diz o referencial (o ponto e a normal do impacto) e o instante da comparação (o mesmo número de passos de `STEP` desde o contato).

### ISSUE-05
- severity: info
- check: R3
- file: stories/US-0005-zebra-com-efeito.md
- location: AC-US-0005-02
- finding: "Cobre o trecho de volta declarado" não diz em qual linha central a distância é medida, e a suavização pode mudar o comprimento em até 1 %. Leitura que decide o critério: medir o início e o fim de cada zebra na linha central original, como faz AC-US-0003-02.
- expected: O critério diz "distância de volta medida na linha central original", com a exceção da zebra dividida na largada.

### ISSUE-06
- severity: info
- check: R3
- file: stories/US-0002-forma-da-pista-real.md
- location: AC-US-0002-05
- finding: "Ponto correspondente do arquivo de origem" supõe que a suavização mantém os 684 pontos. AC-US-0003-02 supõe o mesmo. Leitura que decide o critério: comparar a largura de cada ponto gerado com a do ponto de origem de mesmo índice.
- expected: O critério diz o que é o ponto correspondente: o de mesmo índice, ou o ponto da origem mais próximo.

## Divergences

Nenhuma.

## Coverage

- Itens do seed: 54 cobertos, 0 descobertos (SEED/US-1 a US-6, MED, RD-01 a RD-12, NF-01 a NF-05, RE-01 a RE-04, IM-I1, IM-I2, IM-I3I5, IM-I6, IM-I8, IM-I10, RI-01 a RI-04, FE-01 a FE-05, DOMAIN/DEC-01 a DEC-11). FE-01, FE-02, FE-03 e FE-05 são cobertos só pela lista Fora do escopo de `01-context.md`.
- Itens do conjunto sem fonte no seed: 0 histórias, critérios ou NFRs. Uma afirmação de prosa sem fonte aparece em dois arquivos (ISSUE-01, ISSUE-02).
