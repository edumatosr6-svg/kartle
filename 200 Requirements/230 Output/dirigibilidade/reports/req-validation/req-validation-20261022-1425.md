---
stage: req
feature: dirigibilidade
verdict: FAIL
generated: 2026-10-22T14:25:01Z
counts: {blocker: 0, error: 3, warning: 0, info: 1, divergence: 0}
seed: {revision: 3, digest: 7dd24c8b6cab}
feedbacks: []
population: "revalidação de req-validation-20261022-1411.md: as três issues anteriores reverificadas primeiro; arquivos com `version:` movida (01-context, 02-glossary, 97-changelog, US-0002, todos 3.1.0); dois arquivos intocados sorteados (NFR-0008, NFR-0001); 98-divergences.md para R8"
---

# Relatório de validação — dirigibilidade

## Issues anteriores

- ISSUE-01 (R4, error, 01-context.md; US-0002) — fechada: `DOMAIN/DEC-11` rotulado nas duas tabelas de `01-context.md` e citado em `sources:`, Fontes, AC-US-0002-03 e AC-US-0002-04.
- ISSUE-02 (R2, error, US-0002) — fechada: a entrada de `DOMAIN.md` se intitula "Fim da varredura de início do subesterço" e liga a regra ao critério de que o subesterço não diminui; o conjunto agora aplica a regra só a essa varredura (critérios 03 e 04) e o caso anormal separa os ensaios, sem texto que contrarie a decisão.
- ISSUE-03 (R3, info, US-0003) — mantida como ISSUE-04 abaixo: texto de AC-US-0003-01 inalterado.

## Issues

### ISSUE-01
- severity: error
- check: R3
- file: stories/US-0002-aderencia-em-curva.md
- location: AC-US-0002-03
- finding: o critério junta dois comportamentos com observações e motivos de reprovação distintos — V1 ≥ 1,15 × V0 (velocidades de início do subesterço) e "reprovado por saída do asfalto se o kart sai da faixa do arco abaixo de 50 km/h" (posição na faixa contra a velocidade da saída) — não atômico.
- expected: AC-US-0002-03 declara só V1 ≥ 1,15 × V0, e a regra de `DOMAIN/DEC-11` de reprovação por saída da faixa abaixo de 50 km/h na varredura fica num critério próprio, como a permanência na faixa já fica em AC-US-0002-02, separada de AC-US-0002-01.

### ISSUE-02
- severity: error
- check: R3
- file: stories/US-0002-aderencia-em-curva.md
- location: AC-US-0002-04
- finding: com a varredura agora numa única passagem em que a velocidade sobe no arco (critério 03, glossário), "nas velocidades medidas acima de 50 km/h, a duração máxima de `understeer` consecutivo não diminui" não diz o que é uma velocidade medida nem que duração é atribuída a cada uma; um máximo acumulado ao longo da passagem nunca diminui e passa sempre, a duração do episódio em curso reprova a cada volta a `grip` — não há observação única que decida o critério, e o mínimo de "duas velocidades medidas" de `DOMAIN/DEC-11` fica sem grão.
- expected: o critério (ou o glossário) define a velocidade medida da varredura — por exemplo, patamar ou intervalo de velocidade cujo tamanho em km/h é parâmetro do ensaio registrado em `docs/physics.md` (NFR-0004) — e a duração comparada em cada uma (a maior sequência de `understeer` consecutivo dentro dela), de modo que a comparação não seja um máximo acumulado.

### ISSUE-03
- severity: error
- check: R3
- file: stories/US-0002-aderencia-em-curva.md
- location: AC-US-0002-02
- finding: o critério traz os limiares de domínio 50 km/h e 18 m sem citação; é o único critério do conjunto com limiar de domínio e nenhuma fonte (AC-US-0002-01, com os mesmos valores, cita `DOMAIN/DEC-02`, `DOMAIN/DEC-03`, `DOMAIN/REF-03`).
- expected: AC-US-0002-02 cita a fonte dos seus limiares, `DOMAIN/DEC-02` e `DOMAIN/REF-03` (e `SEED/US-2` para o arco de 18 m).

### ISSUE-04
- severity: info
- check: R3
- file: stories/US-0003-traseira-viva-e-controlavel.md
- location: AC-US-0003-01
- finding: (reverificada de req-validation-20261022-1411.md, ISSUE-03, texto inalterado) a cláusula da curva de referência com acelerador cheio é ligada à condução normal por "em particular", mas com acelerador cheio a velocidade pode passar de 50 km/h no arco e a condição de forçar passa a valer; o critério é decidível (estado de aderência em todos os passos do arco) e mais estrito que o seed.
- expected: a cláusula da curva de referência é separada da cláusula de condução normal e declara que vale em todos os passos do arco, inclusive acima de 50 km/h.

## Divergences

None.

## Coverage

Seed items: 27 covered (5 histórias, 6 regras de domínio, 4 NFRs, 4 restrições, 4 impactos no domínio, 4 itens fora do escopo), 0 uncovered. `DOMAIN.md`: 14 entradas cobertas (REF-01 a REF-03, DEC-01 a DEC-11), 0 não cobertas. Lista "Fora do escopo" de `01-context.md` igual à do seed. Set items with no seed source: 0.

## Contexto recebido fora do procedimento

`97-changelog.md`, rodada 7, traz a justificativa do gerador, inclusive uma "decisão do autor passada a esta rodada" que não está em `SEED.md` nem em `DOMAIN.md`; foi lido só para localizar os arquivos tocados e não entrou no julgamento. A tarefa cita `SCOPE-BACKLOG.md`; o arquivo não existe na pasta do seed.
