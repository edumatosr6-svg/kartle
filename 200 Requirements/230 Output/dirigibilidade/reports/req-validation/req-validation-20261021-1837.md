---
stage: req
feature: dirigibilidade
verdict: SUCCESS
generated: 2026-10-21T18:37:24Z
counts: {blocker: 0, error: 0, warning: 0, info: 1, divergence: 0}
seed: {revision: 3, digest: 7dd24c8b6cab}
feedbacks: []
population: "revalidação do relatório req-validation-20261021-1742.md: arquivo da ISSUE-01 info (01-context.md); todos os arquivos com `version:` movida para 3.0.0 (01-context, 02-glossary, 97-changelog, US-0001, US-0002, US-0003, US-0005, NFR-0004); dois arquivos intocados sorteados (NFR-0008, NFR-0009); 98-divergences.md para R8; grep de `OPEN-`/`TBD`/vocabulário proibido/valores da revisão 1 em todo o conjunto"
---

# Relatório de validação — dirigibilidade

## Issues anteriores

- ISSUE-01 (R4, info, 01-context.md) — fechada: o parágrafo "Padrão seguro" declara que a tela de seleção de acerto não recebe elemento novo e que nenhum preset experimental extra é exposto no painel (`DOMAIN/DEC-10`).

## Issues

### ISSUE-01
- severity: info
- check: R3
- file: stories/US-0003-traseira-viva-e-controlavel.md
- location: AC-US-0003-01
- finding: a cláusula "em particular, na curva de referência da pista de teste com entrada a 50 km/h, esterço cheio e acelerador cheio, o estado é `grip` ou `understeer` em todos os passos do arco" é apresentada como caso da condução normal, mas com acelerador cheio a velocidade pode passar de 50 km/h dentro do arco, o que satisfaz a condição de forçar do glossário (acelerador cheio + esterço cheio acima de 50 km/h). O critério é decidível — observação que o decide: estado de aderência em todos os passos do arco, independentemente da velocidade — e é mais estrito que o seed, não contrário a ele; só a ligação "em particular" com a condução normal é imprecisa.
- expected: opcionalmente separar a cláusula da curva de referência da cláusula de condução normal, dizendo que ela vale em todos os passos do arco mesmo que a velocidade ultrapasse 50 km/h, ou fixar que o ensaio mantém a entrada a 50 km/h sem exceder.

## Divergences

None.

## Coverage

Seed items: 27 covered (5 histórias, 6 regras de domínio incluindo `SEED/RD-06`, 4 NFRs, 4 restrições, 4 impactos no domínio, 4 itens fora do escopo), 0 uncovered. `DOMAIN.md`: REF-01 a REF-03 e DEC-01 a DEC-10 aplicados; a entrada da revisão 3 (pista de teste para US-0001 a US-0003, velocidade mantida em 50 km/h e regime estacionário em US-0001, pista sintética só para a volta do piloto de teste em US-0005) está refletida em pré-condições, critérios, seção Canais, glossário e NFR-0004 sem alterar nenhum limiar (180 ms / 250 ms; 50 km/h; 200 ms; 400 ms; 2,5 s; 105 km/h; 25 s). Lista "Fora do escopo" de `01-context.md` igual à do seed. Set items with no seed source: 0. Nenhum `OPEN-<nn>` nem `TBD` no conjunto; nenhum vocabulário proibido em critério ("rápida" ocorre só na citação da sensação alvo, fora de critério); nenhum bloco mermaid. Design (R7): `src/physics.ts`, `src/lap.ts`, `src/track.ts`, `npm run bench:handling`, `docs/physics.md`, solver de 480 Hz citados da seção Restrições/Contexto/Atores do seed; `TEST_PAD` e `WIDTH` de `DOMAIN.md` não aparecem no conjunto; `trackId`/`trackVersion` são vocabulário de domínio das diretivas. Famílias de NFR (R5, D-REQ-07): todas especificadas ou dispensadas em uma linha em `01-context.md`. NFR-0008 e NFR-0009 (amostra): limite com unidade e método de observação presentes. R8: `98-divergences.md` sem linhas, bem formado.

## Contexto recebido fora do procedimento

Nenhuma justificativa do gerador veio na tarefa. A tarefa cita `SCOPE-BACKLOG.md` na pasta do seed; o arquivo não existe e nada foi inferido dele. `97-changelog.md` foi lido só para localizar os arquivos tocados pela rodada 6; a sua argumentação (itens recusados, motivos) não entrou no julgamento. `NOTES.md` declara-se fora da leitura da pipeline e não foi usado como fonte.

## Condição de fechamento humana (fora do veredito)

`DOMAIN/DEC-08` e `DOMAIN/DEC-10`: rodada de teste do dono do produto em staging antes de fechar a feature — julgamento subjetivo que o seed entrega ao dono do produto; não bloqueia esta etapa.
