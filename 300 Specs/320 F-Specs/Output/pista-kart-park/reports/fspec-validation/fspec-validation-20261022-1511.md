---
stage: fspec
feature: pista-kart-park
verdict: FAIL
generated: 2026-10-22T15:11:19Z
counts: {blocker: 0, error: 5, warning: 3, info: 0, divergence: 0}
seed: {revision: 1, digest: b5aa5be4734a}
upstream: {stage: req, version: 1.0.0}
feedbacks: []
population: "primeira validação do conjunto: todos os arquivos de 300 Specs/320 F-Specs/Output/pista-kart-park/ (sem relatório anterior)"
isolation: 97-changelog.md traz o raciocínio do gerador ("Decisões de forma registradas", "Itens recusados, com motivo", leituras de relatórios anteriores); foi lido como artefato e não pesou em nenhum julgamento. 01-overview.md, "Decisões de forma desta especificação", foi julgado como conteúdo normativo do conjunto, não como justificativa.
---

# Relatório de validação F-Spec — pista-kart-park

## Issues

### ISSUE-01
- severity: error
- check: F1
- file: flows/FLOW-0001-abertura-escolha-e-troca-de-pista.md
- location: bloco mermaid `sequenceDiagram`, linhas 29, 37 e 46
- finding: O texto das mensagens `S->>S: readTrackData; sessao nova; ...`, `S->>S: encerra a sessao; descarta volta ...` e `R-->>J: resultado; credito OSM ...` contém `;`, que o analisador de `sequenceDiagram` lê como fim de instrução; o resto da linha vira um ator sozinho e o diagrama não é analisado.
- expected: Nenhum texto de mensagem do bloco contém `;` nem `#`; os itens são separados por vírgula ou pela entidade `#59;`.

### ISSUE-02
- severity: error
- check: F1
- file: flows/FLOW-0003-preparo-e-publicacao-do-arquivo-de-pista.md
- location: bloco mermaid `sequenceDiagram`, linha 34
- finding: A mensagem `P->>P: copia larguras; linhas da volta; zebras; barreira` contém `;`, que encerra a instrução; "linhas da volta" vira um ator sozinho e o diagrama não é analisado.
- expected: O texto da mensagem não contém `;` nem `#`; os itens são separados por vírgula ou pela entidade `#59;`.

### ISSUE-03
- severity: error
- check: F2
- file: features/FEAT-0003-setores-chegada-marcadores-e-validacao.md
- location: REQ-FEAT-0003-15
- finding: O SHALL cita só "US-0003, caso anormal" e `SEED/US-3`; não cita nenhum `AC-*` e não tem a marca `[DOMAIN]`.
- expected: REQ-FEAT-0003-15 cita o `AC-US-0003-*` que realiza, ou leva `[DOMAIN]` com o invariante que o torna necessário.

### ISSUE-04
- severity: error
- check: F2
- file: features/FEAT-0005-zebra-com-efeito.md
- location: REQ-FEAT-0005-16, REQ-FEAT-0005-19
- finding: REQ-FEAT-0005-16 cita só "US-0005, Canais" e `DOMAIN/DEC-05`; REQ-FEAT-0005-19 cita só "US-0005, caso anormal"; nenhum dos dois SHALL cita um `AC-*` ou tem a marca `[DOMAIN]`.
- expected: Cada um cita o `AC-US-0005-*` que realiza (o caso anormal de REQ-FEAT-0005-19 nomeia os critérios 04 a 06), ou leva `[DOMAIN]` com o invariante que o torna necessário.

### ISSUE-05
- severity: error
- check: F2
- file: features/FEAT-0006-credito-nome-e-comprimento.md
- location: REQ-FEAT-0006-10
- finding: O SHALL cita só "US-0006, caso anormal 'Pista sintética selecionada'" e RNF09; não cita nenhum `AC-*` e não tem a marca `[DOMAIN]`.
- expected: REQ-FEAT-0006-10 cita os `AC-US-0006-*` que condicionam o crédito à Kart Park, ou leva `[DOMAIN]` com o invariante que o torna necessário (I6).

### ISSUE-06
- severity: warning
- check: F3
- file: flows/FLOW-0003-preparo-e-publicacao-do-arquivo-de-pista.md
- location: ## Passos, coluna Estado (passos 9 e 10), e mensagens `aprovado` / `reprovado` do diagrama
- finding: O fluxo nomeia os estados de publicação "aprovado", "reprovado" e "publicada em staging", enquanto RULE-0005 define `publicationState` como `PREPARED`, `REJECTED`, `VERIFIED`, `STAGING`, `PRODUCTION`, valores que nenhum fluxo usa; o mesmo conceito tem dois nomes.
- expected: A coluna Estado de FLOW-0003 usa os valores de `publicationState` de RULE-0005.

### ISSUE-07
- severity: warning
- check: F4
- file: features/FEAT-0001-seletor-de-pista-no-treino.md
- location: REQ-FEAT-0001-01 ("nessa ordem")
- finding: O requisito fixa a ordem das duas opções do seletor (Kart Park primeiro), que nem AC-US-0001-01 nem `DOMAIN/DEC-01` e `DOMAIN/DEC-06` pedem; um seletor com as duas opções em outra ordem e a Kart Park selecionada reprovaria sem que nenhum critério dos requisitos fosse violado.
- expected: REQ-FEAT-0001-01 exige as duas opções sem fixar a ordem, ou cita o item dos requisitos que fixa essa ordem.

### ISSUE-08
- severity: warning
- check: F4
- file: features/FEAT-0006-credito-nome-e-comprimento.md
- location: REQ-FEAT-0006-03, REQ-FEAT-0006-06 ("no próprio texto '© colaboradores do OpenStreetMap'")
- finding: Os requisitos exigem que o link fique no texto "© colaboradores do OpenStreetMap", o que AC-US-0006-03, AC-US-0006-06 e `DOMAIN/DEC-07` não pedem (pedem um link com destino `openstreetmap.org/copyright` na linha de crédito).
- expected: REQ-FEAT-0006-03 e REQ-FEAT-0006-06 exigem o link e o seu destino sem fixar o texto em que ele está, ou citam o item dos requisitos que o fixa.

## Divergences

Nenhuma.

## Coverage

- Critérios cobertos: 53 de 53 `AC-*` (US-0001 a US-0006), cada um realizado por ao menos um `REQ-*`.
- Critérios descobertos: nenhum.
- NFRs: 12 de 12 realizados (NFR-0001, NFR-0006 em FEAT-0002; NFR-0005, NFR-0012 em FEAT-0006; NFR-0002 a NFR-0004 e NFR-0007 a NFR-0012 em FEAT-0007); nenhum adiado ao D-Spec.
- Requisitos sem fonte: nenhum; REQ-FEAT-0003-15, REQ-FEAT-0005-16, REQ-FEAT-0005-19 e REQ-FEAT-0006-10 rastreiam a um item dos requisitos, mas sem `AC-*` nem `[DOMAIN]` (ISSUE-03 a ISSUE-05).
- Contratos sem consumidor: nenhum (API-0001 lido por `selectTrainingTrack` e pelos ensaios; API-0002 pelas telas SCR-0001 e SCR-0002; API-0003 pela apresentação e pelos ensaios).
