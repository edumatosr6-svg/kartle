---
stage: req
feature: dirigibilidade
verdict: SUCCESS
generated: 2026-10-21T17:42:07Z
counts: {blocker: 0, error: 0, warning: 0, info: 1, divergence: 0}
seed: {revision: 2, digest: 5407fe2ffc33}
feedbacks: []
population: "revalidação do relatório req-validation-20261021-1627.md: arquivo da ISSUE-01 info (US-0004); todos os arquivos com `version:` movida para 2.0.0 (01-context, 02-glossary, 97-changelog, US-0001 a US-0005, NFR-0002, NFR-0004, NFR-0007); dois arquivos intocados sorteados (NFR-0001, NFR-0003); 98-divergences.md para R8; grep de `OPEN-`/`TBD`/vocabulário proibido/valores da revisão 1 em todo o conjunto"
---

# Relatório de validação — dirigibilidade

## Issues anteriores

- ISSUE-01 (R7, info, AC-US-0004-07) — fechada: o critério passou a dizer "bench de física" em vez de nomear o script; NFR-0002, NFR-0004 e NFR-0007 receberam a mesma forma.

## Issues

### ISSUE-01
- severity: info
- check: R4
- file: 01-context.md
- location: parágrafo "Padrão seguro" e rótulo `DOMAIN/DEC-10`
- finding: a decisão "nenhum preset experimental extra no painel" (`DOMAIN.md`, entrada "Ciclo de teste") está coberta só em prosa de contexto; é condição observável na tela (lista de acertos do painel) e nenhum critério de aceite a fixa. Cobertura existe, por isso não é erro.
- expected: opcionalmente um critério em US-0005 do tipo "na tela de seleção de acerto, em `web-desktop` e `web-mobile`, só os acertos Arcade assistido e Realista — aluguel 4T são oferecidos durante o ciclo de acerto (`DOMAIN/DEC-10`)", ou a declaração em `01-context.md` de que o painel não muda nesta feature.

## Divergences

None.

## Coverage

Seed items: 26 covered (5 histórias, 5 regras de domínio, 4 NFRs, 4 restrições, 4 impactos no domínio, 4 itens fora do escopo), 0 uncovered. `DOMAIN.md`: REF-01, REF-02 e DEC-01 a DEC-07 aplicados com os valores da revisão 2 (180 ms / 250 ms; 50 km/h; 200 ms; 400 ms; 2,5 s; 105 km/h; 25 s) — nenhum valor da revisão 1 permanece em critério, pré-condição ou seção Canais (ocorrências restantes só em "substitui …" nas Fontes/rótulos e no changelog); DEC-08 e DEC-10 registrados em `01-context.md` e no caso anormal de US-0005 como condição humana de fechamento; DEC-09 aplicado em AC-US-0001-05 citando o ensaio de 50 km/h. Lista "Fora do escopo" de `01-context.md` igual à do seed. Set items with no seed source: 0. Nenhum `OPEN-<nn>` nem `TBD` no conjunto; nenhum vocabulário proibido em critério ("rápida" ocorre só em citação da sensação alvo, fora de critério). Design (R7): `src/physics.ts`, `src/lap.ts`, `src/track.ts`, `npm run bench:handling`, `docs/physics.md`, solver de 480 Hz citados da seção Restrições/Contexto do seed; `trackId`/`trackVersion` são vocabulário de domínio das diretivas.

## Contexto recebido fora do procedimento

Nenhuma justificativa do gerador veio na tarefa. A tarefa cita `SCOPE-BACKLOG.md` na pasta do seed; o arquivo não existe e nada foi inferido dele. `97-changelog.md` foi lido só para localizar os arquivos tocados pela rodada 5; a sua argumentação não entrou no julgamento. `NOTES.md` declara-se fora da leitura da pipeline e não foi usado como fonte.

## Condição de fechamento humana (fora do veredito)

`DOMAIN/DEC-08` e `DOMAIN/DEC-10`: rodada de teste do dono do produto em staging antes de fechar a feature — julgamento subjetivo que o seed entrega ao dono do produto; não bloqueia esta etapa.
