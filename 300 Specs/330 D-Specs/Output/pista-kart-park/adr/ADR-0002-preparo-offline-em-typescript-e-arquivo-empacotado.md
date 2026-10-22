---
id: ADR-0002
title: Preparo offline em TypeScript sob scripts/ e arquivo publicado empacotado no cliente como texto
feature: pista-kart-park
stage: dspec
status: validated
version: 1.0.0
sources: [FLOW-0003, RULE-0002, FEAT-0002, FEAT-0007, REQ-FEAT-0002-14, REQ-FEAT-0002-17, REQ-FEAT-0007-05, REQ-FEAT-0007-07, REQ-FEAT-0007-11]
---

# ADR-0002 — Preparo offline em TypeScript sob `scripts/` e arquivo publicado empacotado no cliente como texto

## Contexto

O preparo offline da pista não existe; as diretrizes do estágio registram que ele "(Python) has no folder
yet". O F-Spec exige que cada critério observado no arquivo gerado tenha verificação determinística na saída
de `npm test` (REQ-FEAT-0007-07; I9: `node:test` via `tsx`), nenhuma dependência de execução nova
(REQ-FEAT-0007-11), 0 requisições entre a escolha da pista e o fim da volta (REQ-FEAT-0007-05), o arquivo
abaixo de 200.000 bytes como é entregue ao navegador (REQ-FEAT-0002-14) e idêntico byte a byte ao publicado
(REQ-FEAT-0002-17). As definições geométricas de RULE-0001 e RULE-0002 (normal, bordas, zebra, borda da pista)
são usadas pela simulação no cliente e pelas verificações do arquivo.

## Decisão

1. O preparo é TypeScript executado por `tsx`, em `scripts/`: bibliotecas puras `scripts/trackPrep.ts`
   (construção) e `scripts/trackChecks.ts` (verificações), e o programa `scripts/track-pipeline.ts`.
2. As duas bibliotecas importam as definições geométricas de `src/trackGeometry.ts`, as mesmas que a
   simulação usa; as verificações não importam a construção.
3. As verificações V01 a V18 são as mesmas no programa (`verify`) e em `npm test`.
4. O arquivo publicado fica em `src/tracks/<trackId>-v<trackVersion>.json` e o cliente o importa como texto
   (`import texto from './tracks/kart-park-v1.json?raw'`), lido por `readTrackData(texto)`; o texto embutido no
   pacote é o conteúdo exato do arquivo.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Preparo em Python, como as diretrizes antecipavam | as verificações teriam de ser escritas duas vezes (Python para o preparo, TypeScript para `npm test`), com duas implementações das mesmas definições geométricas que podem divergir; ou `npm test` passaria a exigir Python. Um script de linguagem nova não acrescenta dependência ao jogo, mas acrescenta ferramenta ao processo sem ganho |
| Buscar o arquivo com `fetch` ao escolher a pista | é requisição de rede entre a escolha e a volta, falha sem rede depois do carregamento (D-FS-08) e viola o teste de camada de `race-lap-validation` que proíbe `fetch` em `src/main.ts` |
| Importar o arquivo como módulo JSON (objeto) | o empacotador reescreve o objeto; o conteúdo entregue deixa de ser o arquivo registrado byte a byte, e o `tsconfig.json` precisaria de `resolveJsonModule` |
| Gerar um módulo TypeScript com o arquivo como literal (como `SYNTHETIC_TRACK_FILE`) | duas cópias do mesmo conteúdo (o `.json` registrado e o `.ts`) que podem divergir; a imutabilidade passaria a depender de dois arquivos |

## Consequências

- `npm test` lê o arquivo publicado e o de origem com `readFileSync` e executa as mesmas verificações do
  programa; o arquivo publicado é reproduzível pelo preparo (teste de reprodução).
- `src/rawImports.d.ts` declara o tipo das importações `*.json?raw` para `tsc --noEmit`.
- O tamanho entregue é o do texto como literal no pacote, medido por V17, e o resumo é o do arquivo.
- Uma versão nova da pista é um arquivo novo; o anterior fica no repositório.

## Status

Proposta deste conjunto, a validar.
