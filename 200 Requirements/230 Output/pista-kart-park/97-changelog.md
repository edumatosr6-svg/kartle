---
title: Changelog — pista Kart Park
feature: pista-kart-park
stage: req
status: validated
version: 1.0.0
sources: [SEED, DOMAIN]
---

# Changelog

## 2026-10-22 — rodada 1, Mode A (geração a partir do seed revision 1)

**O que mudou**

- Conjunto gerado do zero a partir de `SEED.md` (`revision: 1`, 2026-10-22) e `DOMAIN.md`:
  `01-context.md`, `02-glossary.md`, seis histórias (US-0001 a US-0006, uma por história do seed), doze
  NFRs (NFR-0001 a NFR-0012) e o registro `98-divergences.md`, sem linhas.
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os gera com `lint_artifacts.py --emit`.
- As onze decisões de `DOMAIN.md` de 2026-10-22, rotuladas `DOMAIN/DEC-01` a `DOMAIN/DEC-11` na ordem
  do arquivo, foram aplicadas no lugar dos quatro pontos abertos do seed; nenhum ponto em aberto é
  carregado.
- Restrições e impactos no domínio do seed sem história própria tornados mensuráveis como NFR: I2
  (NFR-0007), I3/I5 (NFR-0006), I8 (NFR-0008), pista dos ensaios (NFR-0009), dependências (NFR-0010),
  ordem do código (NFR-0011), licença Esri e publicação (NFR-0012).

**Decisões do autor para esta execução, aplicadas**

- A licença Esri bloqueia só a promoção para produção e não bloqueia nenhuma etapa de especificação:
  registrada em NFR-0012 e em `01-context.md`.
- O código desta feature só começa depois que `dirigibilidade` passar nos testes: carregado como
  NFR-0011, citando a restrição do seed, com a indicação de que a dependência deve ser registrada no
  D-Spec.
- A pista sintética continua sendo a pista dos ensaios automáticos: NFR-0009.
- Todos os números do seed foram medidos: usados como estão, sem nova medição.

**Itens fechados**: nenhum `ISSUE-<nn>` ou `FB-<nn>` (primeira rodada).

**Itens recusados, com motivo**

- "Código fica na raiz do repositório" (decisão do autor para esta execução): não entra no conjunto,
  porque é localização de código, uma decisão de design que esta etapa não registra (proibição de
  decisões de design); cabe ao D-Spec, que lê a raiz de código.
- A decisão do autor nomeia os arquivos congelados por `dirigibilidade` de forma diferente da restrição
  do seed; o conjunto cita só o texto do seed (Restrições), sem nomes de arquivo além dos que ele cita,
  e deixa a lista exata para o D-Spec, onde a dependência deve ser registrada.
- A janela de suavização de cerca de 12 m (`DOMAIN/DEC-04`) não virou critério de aceite: "cerca de"
  não é decidível. O que se verifica é o resultado — a tolerância de 0,30 m e o comprimento de
  687,5 m ± 1 % depois da suavização (US-0002); a janela fica como orientação ao design em
  `01-context.md` e no glossário.
- A frase "numa linha discreta" (`DOMAIN/DEC-07`) não virou critério: não é decidível sem um limite que
  o seed não dá; os critérios exigem a presença do crédito nas duas telas (US-0006).
- O caráter "curto e grave" do som da zebra (`DOMAIN/DEC-11`) ficou no glossário, não como limiar: o
  seed não dá duração nem frequência; o critério decidível é o som ser próprio, repetir-se com roda na
  zebra e não tocar com o som desligado (US-0005).
- A aderência da grama de ≈ 40 % (`DOMAIN/DEC-05`) é citada como referência no glossário e não virou
  critério: o seed não pede mudança na grama.
- O som da zebra em `web-mobile` não virou critério: o seed o exige só no teclado (`web-desktop`); a
  diferença entre os canais está declarada em US-0005.
- A regra geral "em todo trecho em que a grama entre duas partes não consecutivas mede 6 m ou menos"
  virou critério sobre o par medido pelo seed (≈ 371–414 m contra ≈ 580–615 m, US-0004), com a
  exclusão de barreira acima de 6 m (`DOMAIN/DEC-10`): sem um limiar para "não consecutivas", um critério
  geral leria como tais as duas pernas de um grampo, o que o seed não pede.
- Os limites de setor "perto de" 201,6 m, 350,3 m e 529,9 m viraram o ponto da linha central mais
  próximo dessas distâncias, medidas na linha central original (US-0003): é a leitura decidível sem
  inventar uma tolerância.
- `NOTES.md` da pasta do seed não foi lido (fora da lista de entrada da etapa). O arquivo de origem só
  foi resumido por script para confirmar que o trecho de zebra que cruza a largada passa 3 m dela, como o
  seed diz; nenhum número dele entrou no conjunto além dos do seed.
