---
stage: dspec
feature: race-lap-validation
verdict: FAIL
generated: 2026-10-20T19:18:00Z
counts: {blocker: 0, error: 4, warning: 0, info: 0, divergence: 0}
seed: {revision: 2, digest: ee91c5706be1}
feedbacks: []
---

# Relatório de validação do D-Spec — race-lap-validation

## Issues

### ISSUE-01
- severity: error
- check: D3
- file: core/DES-0006-leitura-do-dado-de-pista.md
- location: "Interface" (`TrackReading`); DM-0001 "Classificação feita por `readTrackData`"
- finding: a resposta de `readTrackData` não bate campo a campo com API-0003: o contrato devolve `trackDataStatus` mais os campos do arquivo no mesmo nível; o projeto devolve `{status, track}` com os campos aninhados em `track` e chama o campo de `status`, enquanto o próprio DES-0006 (Estado e concorrência) e DM-0001 falam em `trackDataStatus`.
- expected: o projeto usa o nome `trackDataStatus` e a forma plana de API-0003 em `TrackReading`, ou o F-Spec é realimentado para aceitar a forma aninhada; `tests/lap-contract.test.ts` afirma a forma contratada.

### ISSUE-02
- severity: error
- check: D9
- file: 98-divergences.md
- location: linha "REQ-FEAT-0006-07 a -11, REQ-FEAT-0008-05 a -07", coluna "O que o sistema faz hoje"
- finding: a linha diz "não há resultado nem noção de oficial; nenhuma oferta de volta" sem `arquivo:linha`; as demais linhas citam onde o código está hoje.
- expected: citar o `arquivo:linha` do ponto atual (por exemplo `src/main.ts:185`, o botão `start` que abre o jogo sem oferta, e `src/main.ts:276-281`, onde hoje nasce o tempo de volta).

### ISSUE-03
- severity: error
- check: D5 (D-DS-01)
- file: core/DES-0012-invariantes-da-simulacao.md
- location: "Posicionamento"
- finding: o item se coloca em "camada de verificação", que não está no mapa de camadas das diretrizes (Dado de pista, Simulação, Adaptadores de controle, Aplicação); `tests/` é papel de árvore, não camada.
- expected: nomear uma camada do mapa (Simulação, onde as invariantes se aplicam) e tratar `tests/` como o lugar das verificações.

### ISSUE-04
- severity: error
- check: D5 (D-DS-01)
- file: security/DES-0011-privacidade-offline-e-sem-persistencia.md
- location: "Posicionamento"
- finding: o item se declara em três camadas ("simulação, dado de pista e aplicação"); o mapa exige que cada item de projeto fique em exatamente uma.
- expected: escolher uma camada para o item (a restrição de privacidade pode ficar na Aplicação, com a verificação de camada remetendo a DES-0012) ou dividi-lo em itens por camada.

## Divergences

None.

## Coverage

Gate e estado: F-Spec com `status: validated` em todos os arquivos (exceto o `99-traceability.md` gerado); 129 `REQ-*` cobertos por ao menos um item, 0 descobertos; 72 `AC-US-*` com caminho de teste em `test-strategy.md`, 0 sem caminho; NFR-0001 a NFR-0012 projetados com mecanismo e prova nomeados; itens de projeto sem origem: 0; API-0001 a API-0003 servidas (API-0003 com a divergência de ISSUE-01); `OPEN-<nn>` e `TBD`: 0.
Caminhos verificados na árvore: `src/main.ts`, `src/physics.ts`, `src/track.ts`, `src/maneuvers.ts`, `tests/physics.test.ts`, `scripts/keyboard-lap.ts` existem e as linhas citadas em `98-divergences.md` e nos itens conferem; `src/lap.ts`, `src/lapTiming.ts`, `src/trackData.ts`, `src/frameClock.ts`, `src/lapMessages.ts` estão declarados novos. Arquivo de pista sintético de DM-0001 recalculado contra a linha central: cruzamentos, posições de arco e comprimentos de linha conferem com C1 a C7.
