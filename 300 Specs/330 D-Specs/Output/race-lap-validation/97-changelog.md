---
title: Registro de mudanças — validação de volta de corrida
feature: race-lap-validation
stage: dspec
status: validated
version: 1.0.0
sources: []
---

# Registro de mudanças

## 2026-10-20 — rodada 1, Mode A

**O que mudou**

- Conjunto gerado do zero a partir do F-Spec validado de `300 Specs/320 F-Specs/Output/race-lap-validation/`
  (FEAT-0001 a FEAT-0009, 129 requisitos `REQ-*`, API-0001 a API-0003, RULE-0001 a RULE-0006, FLOW-0001 a
  FLOW-0004, SCR-0001 a SCR-0003) e do código em execução na raiz do repositório (somente leitura, para
  posicionamento).
- Doze itens de projeto (`core/DES-0001` a `DES-0006` e `DES-0012`, `web/DES-0007` a `DES-0010`,
  `security/DES-0011`), dois modelos de dados (`DM-0001` arquivo de pista versão 2, `DM-0002` estado da volta em
  memória), cinco ADR, `01-architecture.md`, `test-strategy.md` (cobre os 72 critérios `AC-*` e os 12 NFR) e
  `98-divergences.md` com 12 linhas abertas.
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os gera com `lint_artifacts.py --emit`.
- As pastas `backend/` e `mobile/` do esqueleto do estágio não existem porque o produto não tem servidor nem
  aplicativo nativo: a simulação e o dado de pista estão em `core/`, a apresentação em `web/`, privacidade e uso
  offline em `security/`.

**Decisões de projeto onde o F-Spec deixou lacuna deliberada** (todas em ADR, nenhuma muda requisito)

- Precedência de duas invalidações no mesmo passo: cruzamentos de linha antes do corte (ADR-0004, item 1).
- Destino do reposicionamento: ponto mais próximo da linha central, no sentido de percurso, velocidade 0
  (ADR-0004, item 2).
- O que se cronometra numa volta de treino em dado incompleto: cronômetro e corte valem; marcadores, setores e chegada
  não são avaliados e nenhuma volta chega a `VALID` (ADR-0004, item 3).
- Meio de continuar a volta: botão `#pause` rotulado "Continuar" e tecla Esc, ambos já existentes (ADR-0005).
- Método de arredondamento do instante interpolado: ADR-0001.

**Itens fechados**: nenhum `ISSUE-<nn>` ou `FB-<nn>` (primeira geração).

**Itens recusados, com motivo**

- Pausa manual por toque em `web-mobile`: acrescentaria um valor a `pauseCause` (API-0001, API-0002), superfície
  que o F-Spec não autoriza. Como consequência o botão `#pause` existente fica visível só durante a pausa. Proposta
  ao autor do F-Spec, se quiser a pausa manual: novo valor de `pauseCause`.
- Mover a linha central e a largura da pista para o arquivo de pista: ampliaria a mudança além do F-Spec e mexeria na
  física (ADR-0003, alternativas).
- Oferecer volta de reconhecimento ou oficial: pertence ao desafio diário (outra feature); `offeredLapKinds` recebe os
  tipos do desafio como parâmetro e hoje recebe lista vazia (DES-0005).
- Instrumento de desempenho dentro do jogo: seria superfície só de teste; o desempenho é medido com as ferramentas
  do navegador em teste registrado (DES-0007).
- Divergências com o sistema em execução: não foram recusadas; estão em `98-divergences.md`.
- Nenhum requisito foi enfraquecido, removido ou dividido.

**Migração de verificações existentes**: o teste `crossing the start alone cannot complete a lap`
(`tests/physics.test.ts:35`) e o uso de `LapTracker` por `scripts/keyboard-lap.ts` permanecem como estão
(`LapTracker` fica exportado só para o benchmark de manuseio); nenhuma verificação existente é removida (§17).

## 2026-10-20 — Rodada Mode B (relatório dspec-validation-20261020-1918)

Fechados:
- ISSUE-01: `TrackReading` em DES-0006 passa à forma plana de API-0003 com `trackDataStatus`; DES-0009 ajustado (`reading.trackDataStatus`, `trackId`/`trackVersion` lidos de `reading`). DM-0001 e DES-0001 já usavam `trackDataStatus`/nomes de estado e não mudaram.
- ISSUE-02: linha de 98-divergences.md ganha `src/main.ts:185` e `src/main.ts:276-281`.
- ISSUE-03: DES-0012 posicionado na camada Simulação; `tests/` tratado como lugar das verificações.
- ISSUE-04: DES-0011 fixado na camada Aplicação; a verificação de camada remete a DES-0012.

Recusados: nenhum.
