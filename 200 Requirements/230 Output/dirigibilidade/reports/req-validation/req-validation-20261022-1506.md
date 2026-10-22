---
stage: req
feature: dirigibilidade
verdict: SUCCESS
generated: 2026-10-22T15:06:20Z
counts: {blocker: 0, error: 0, warning: 0, info: 1, divergence: 0}
seed: {revision: 3, digest: 7dd24c8b6cab}
feedbacks: []
population: "revalidação de req-validation-20261022-1425.md: as quatro issues anteriores reverificadas primeiro; arquivos com `version:` movida (01-context, 02-glossary, 97-changelog, US-0002, todos 3.2.0); dois arquivos intocados sorteados (NFR-0006, NFR-0007); 98-divergences.md para R8; entrada nova de `DOMAIN.md` (2026-10-22, \"Esclarecimento de método da varredura\") conferida para R4"
---

# Relatório de validação — dirigibilidade

## Issues anteriores

- ISSUE-01 (R3, error, US-0002, AC-US-0002-03) — fechada: o critério declara só V1 ≥ 1,15 × V0; a regra de saída da faixa de `DOMAIN/DEC-11` está em AC-US-0002-06, critério próprio.
- ISSUE-02 (R3, error, US-0002, AC-US-0002-04) — fechada: velocidade medida = patamar completo de velocidade mantida e duração comparada = maior sequência de `understeer` consecutivo dentro do patamar, comparada entre patamares, conforme `DOMAIN/REF-04` (entrada de `DOMAIN.md` de 2026-10-22); observação que decide: na telemetria do ensaio, a sequência por patamar acima de 50 km/h é não decrescente.
- ISSUE-03 (R3, error, US-0002, AC-US-0002-02) — fechada: o critério cita `SEED/US-2`, `DOMAIN/DEC-02` e `DOMAIN/REF-03`.
- ISSUE-04 (R3, info, US-0003, AC-US-0003-01) — mantida como ISSUE-01 abaixo: texto e `version:` inalterados.

## Issues

### ISSUE-01
- severity: info
- check: R3
- file: stories/US-0003-traseira-viva-e-controlavel.md
- location: AC-US-0003-01
- finding: (reverificada de req-validation-20261022-1425.md, ISSUE-04, texto inalterado) a cláusula da curva de referência com acelerador cheio é ligada à condução normal por "em particular", mas com acelerador cheio a velocidade pode passar de 50 km/h no arco e a condição de forçar passa a valer; o critério é decidível (estado de aderência em todos os passos do arco) e mais estrito que o seed.
- expected: a cláusula da curva de referência é separada da cláusula de condução normal e declara que vale em todos os passos do arco, inclusive acima de 50 km/h.

## Divergences

None.

## Coverage

Seed items: 27 covered (5 histórias, 6 regras de domínio, 4 NFRs, 4 restrições, 4 impactos no domínio, 4 itens fora do escopo), 0 uncovered. `DOMAIN.md`: 15 entradas cobertas (REF-01 a REF-04, DEC-01 a DEC-11), 0 não cobertas; a entrada nova de 2026-10-22 "Esclarecimento de método da varredura" é `DOMAIN/REF-04`, citada em `01-context.md`, no glossário e em US-0002 (`sources:`, Fontes, AC-US-0002-03, -04, -06). `SCOPE-BACKLOG.md` não existe na pasta do seed. Lista "Fora do escopo" de `01-context.md` igual à do seed. Set items with no seed source: 0.

## Contexto recebido fora do procedimento

`97-changelog.md`, rodada 8, traz a justificativa do gerador; só os cabeçalhos de rodada foram lidos para localizar os arquivos tocados, e nada dele entrou no julgamento.
