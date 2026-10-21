---
title: Registro de mudanças — validação de volta de corrida
feature: race-lap-validation
stage: fspec
status: validated
version: 1.0.0
sources: []
---

# Registro de mudanças

## 2026-10-20 — rodada 1, Mode A

**O que mudou**

- Conjunto gerado do zero a partir dos requisitos validados de `200 Requirements/230 Output/race-lap-validation/`
  (US-0001 a US-0009, NFR-0001 a NFR-0012; seed `revision: 2`, `DOMAIN.md` DEC-01 a DEC-11).
- Nove funcionalidades (`FEAT-0001` a `FEAT-0009`), quatro fluxos (`FLOW-0001` a `FLOW-0004`), três contratos
  (`API-0001` a `API-0003`), três telas (`SCR-0001` a `SCR-0003`) e seis regras (`RULE-0001` a `RULE-0006`).
- Todo critério `AC-*` e todo NFR dos requisitos é realizado por ao menos um requisito; os NFR de
  verificação, desempenho, privacidade, passo fixo e física estão em `FEAT-0009`, o de determinismo entre
  navegadores em `FEAT-0003` e o de versionamento do dado de pista em `FEAT-0008`.
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os gera com `lint_artifacts.py --emit`.

**Decisões de forma registradas**

- Não existe API de rede no MVP (diretrizes do estágio). Os contratos de `api/` são contratos em processo
  dentro do navegador, com o único papel `player` (anônimo), erros como códigos de rejeição e idempotência
  pelo estado da volta.
- Nomes de campo em `camelCase` com unidade no sufixo, como manda a diretriz D-FS-06 do projeto, no lugar do
  `snake_case` padrão da habilidade do gerador (a diretriz do projeto prevalece).
- Textos em inglês de estado e de motivo, e os textos auxiliares das telas (carregando, erro, sem pista,
  controle por toque, pausada), foram redigidos em `RULE-0006` porque o NFR-0007 exige as mensagens nos dois
  idiomas; os requisitos fixam apenas os textos em português de estado e de motivo.
- O campo opcional `challengeNumber` do pedido `startLap` e do resultado vem de `SEED/IM-I1` e de D-FS-01
  (o resultado precisa poder ser ligado ao desafio); a feature não o deriva.
- As adições ao dado de pista (`direction`, `startPosition`, `finishLine`, `sectorLimits`, `markers`,
  `cutDistanceM`, `cutDurationMs`) são o mínimo que os critérios de US-0002, US-0004, US-0006 e US-0008
  exigem do dado. O dado de pista na forma anterior é `INCOMPLETE` (só treino), consequência de
  `DOMAIN/DEC-10` e do NFR-0012.

**Itens fechados**: nenhum `ISSUE-<nn>` ou `FB-<nn>` (primeira geração).

**Itens recusados, com motivo**

- Meio de continuar a volta depois da pausa, pausa manual por toque em `web-mobile`, tamanho mínimo de
  texto em `web-desktop`, o que a volta de treino cronometra em pista sem linha de chegada: os requisitos
  recusaram decidi-los (rodadas 2 e 3 do estágio anterior, sem decisão posterior no seed `revision: 2`).
  Nenhum critério os pede, então esta especificação não os decide; estão em "Lacunas deliberadas" de
  `01-overview.md`.
- Ponto de recolocação do kart no reposicionamento e precedência de duas invalidações no mesmo passo:
  nenhum requisito os decide; seguem em "Lacunas deliberadas".
- Método de arredondamento do instante interpolado para ms inteiros: é decisão de projeto (D-Spec); o
  F-Spec fixa apenas as restrições de `RULE-0003`.
- Divergências com o sistema em execução: nenhuma registrada. Esta etapa não lê a raiz de código
  (conventions §12); apenas os nomes do dado de pista existente foram consultados para não colidir com ele.
- `NOTES.md` da pasta do seed não foi lido (fora da lista de entrada da etapa); `SEED.md` foi consultado só para escopo e restrições.

## 2026-10-20 — rodada 2, Mode B

**Itens fechados**

- ISSUE-01: `FLOW-0003` declara que a deduplicação do `pauseLap` repetido ocorre na simulação, pelo `lapPhase`.
- ISSUE-02: `SCR-0001` passa a usar `trackDataError` (RULE-0006) apenas para `UNSUPPORTED_SCHEMA` e `UNREADABLE`; as
  rejeições de `startLap` não são exibidas. `SCR-0003` estado Erro: tela não exibida, sem mensagem. Nenhuma chave nova.
- ISSUE-03: `API-0003` corrige a afirmação de aninhamento, listando os valores estruturados (ponto, linha, listas de linhas).

**Itens recusados, com motivo**

- ISSUE-03, alternativa de achatar `startPosition` e `finishLine` em campos planos: renomearia campos do contrato sem
  critério que peça; a afirmação foi corrigida em vez disso.
- ISSUE-02, alternativa de definir novas chaves de mensagem em `RULE-0006`: acrescentaria superfície numa rodada Mode B (§16).
