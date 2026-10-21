---
stage: req
feature: race-lap-validation
verdict: FAIL
generated: 2026-10-20T18:27:38Z
counts: {blocker: 0, error: 4, warning: 0, info: 0, divergence: 0}
seed: {revision: 1, digest: 653920d5e6cd}
feedbacks: []
ignored-input: "97-changelog.md, seções 'Itens recusados, com motivo' — justificativa do gerador, desconsiderada no julgamento"
---

# Relatório de validação — race-lap-validation

## Issues

### ISSUE-01
- severity: error
- check: R6
- file: 01-context.md
- location: conjunto inteiro (nenhum arquivo trata do assunto)
- finding: a feature introduz comportamento novo (cronometragem oficial, invalidação por marcador, corte e reposicionamento) e nenhum arquivo diz que ele começa desligado nem dá a razão, em uma linha, de ser seguro ligado (Safe defaults)
- expected: uma linha em 01-context.md com o default e o motivo, derivável das entradas, por exemplo "ligado por padrão: seguro porque pista sem dado completo só oferece treino (DOMAIN/DEC-10) e a volta não depende de servidor (NFR-0004)"

### ISSUE-02
- severity: error
- check: R6
- file: 01-context.md
- location: seção "O que é a feature" / US-0002, US-0004
- finding: a seção Contexto do seed diz que o protótipo atual valida a volta com "gates sequenciais" preliminares; o conjunto redefine a validade da volta (marcadores em ordem, sentido, corte, reposicionamento) sem declarar a aposentadoria dessa validação e o que a substitui (Compatibility)
- expected: declaração explícita de que a validação preliminar por gates sequenciais do protótipo é aposentada e substituída pelas regras de US-0002, US-0004 a US-0007, citando `SEED.md` Contexto

### ISSUE-03
- severity: error
- check: R2
- file: stories/US-0008-reconhecimento-e-treino.md
- location: Casos anormais, "Volta de reconhecimento ou de treino inválida (marcador pulado, contramão, corte)"
- finding: classifica a contramão como causa de volta inválida; US-0005 (AC-US-0005-01) e o glossário ("Volta inválida" = volta com um dos motivos "marcador pulado", "corte" ou "reposicionamento") dizem que a chegada na contramão não encerra nem invalida a volta, que segue em andamento — as duas histórias se contradizem
- expected: retirar "contramão" da lista de invalidações e, se mantida a referência a US-0005, dizer que a contramão não encerra a volta nem registra tempo em qualquer tipo de volta

### ISSUE-04
- severity: error
- check: R6
- file: stories/US-0004-marcador-pulado.md
- location: Casos anormais
- finding: a história muda o estado de resultado (volta encerrada como inválida, AC-US-0004-07) e trata recarga, abandono e perda de foco, mas não diz o que um evento repetido faz — cruzar a chegada de novo depois da volta inválida por marcador (D-REQ-03, I7)
- expected: caso anormal "Linha de chegada cruzada de novo após a volta inválida: nenhum segundo resultado (I7)", ou um critério no estado da simulação nos moldes de AC-US-0002-12

## Divergences

None.

## Coverage

Seed items: 45 covered (9 histórias, 11 regras de domínio, 8 NFRs, 5 restrições, 6 impactos no domínio, 6 itens fora do escopo), 0 uncovered. Pontos OPEN-01 a OPEN-08 do seed fechados por DOMAIN.md (DEC-01 a DEC-08); DEC-09 a DEC-11 aplicados. Set items with no seed source: 0.
