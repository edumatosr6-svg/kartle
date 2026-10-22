---
title: Changelog — modelo Kart 01 e câmera de jogo
feature: modelo-kart-01
stage: req
status: validated
version: 1.1.0
sources: [SEED, DOMAIN]
---

# Changelog

## 2026-10-22 — rodada 1, Mode A (geração a partir do seed revision 1 e de `DOMAIN.md`)

**O que mudou**

- Conjunto gerado do zero a partir de `SEED.md` (`revision: 1`, `date: 2026-10-22`) e das decisões de
  2026-10-22 em `DOMAIN.md`: `01-context.md`, `02-glossary.md`, cinco histórias (US-0001 a US-0005, uma por
  história do seed), sete NFRs (NFR-0001 a NFR-0007) e o registro `98-divergences.md`, sem linhas.
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os gera com `lint_artifacts.py --emit`.
- Decisões de `DOMAIN.md` aplicadas no lugar dos pontos abertos do seed, com o rótulo `DOMAIN/DEC-nn`
  (nn = número do ponto que fecha) definido em `01-context.md`: DEC-01 (no máximo 30 chamadas de desenho,
  agrupando por material, sem mudar a forma; rodas, volante e braços animáveis) em NFR-0004 e US-0002;
  DEC-02 (física não alinhada ao modelo) em NFR-0006, NFR-0007 e US-0005; DEC-03 (retrato com campo de
  visão horizontal de pelo menos 60°; paisagem com vertical de 62°) em US-0003; DEC-04 (visão geral antes
  da contagem, descida durante a contagem, pose de corrida no sinal verde) em US-0003; DEC-05 (sombra) em
  US-0001, US-0004 e NFR-0001. A decisão sobre a fonte do modelo recebeu o rótulo `DOMAIN/DEC-00`.
- Restrições do seed tornadas mensuráveis como NFR: arquivos da simulação e presets inalterados
  (NFR-0006), Three.js 0.186 sem versão nova (NFR-0003), `wheelPositions` preservado (NFR-0007). Os quatro
  NFRs do seed viraram NFR-0001 a NFR-0004; as regras de domínio de camada (I2) viraram NFR-0005.
- Retiradas declaradas em `01-context.md` (seção Retiradas e substituições): o kart provisório e a câmera
  alta de perseguição em corrida; a câmera alta inicial fica só antes da contagem.
- Decisão do dono do produto passada a esta execução sobre a ordem de entrega (depois da `dirigibilidade`)
  registrada em `01-context.md`, seção Relação com outras features, sem nomear módulo; a etapa de design
  registra a dependência.

**Itens fechados**: nenhum `ISSUE-<nn>` ou `FB-<nn>` (primeira rodada); pontos abertos 01 a 05 do seed
fechados por `DOMAIN.md`.

**Itens recusados, com motivo**

- Onde o código fica no repositório e o registro da dependência de entrega com a `dirigibilidade` (decisões
  do dono do produto passadas a esta execução): são decisões de design, não requisitos; não entram nas
  histórias nem nos NFRs, para não vazar design nesta etapa. A ordem de entrega fica só como nota de
  contexto.
- `NOTES.md` da pasta do seed não foi lido (fora da lista de entrada da etapa); as medidas usadas são as que
  o seed traz. O código do Cowork e a ficha também não foram lidos: as medidas, cores e nomes de peças vêm
  do seed.
- Tolerância das rodas e das bitolas: o seed dá ±2 cm só para comprimento, largura e entre-eixos; para os
  diâmetros e as bitolas, este conjunto compara ao centímetro (a precisão em que o seed dá os valores) e
  não inventa tolerância.
- Cor do capacete: o seed diz "capacete branco" só na Visão geral, sem código de cor; não virou critério
  de cor próprio, para não inventar valor. As quatro cores com código no seed têm critério.
- Cores das demais peças: o seed nomeia quatro cores; nenhum critério exige que as outras cores coincidam
  com o código do Cowork, porque a ficha é a referência e o seed não as lista.
- Magnitude do efeito de turbo no campo de visão: não fixada; o critério 09 de US-0003 a compara com o
  efeito que já existe, como diz o seed.
- Duração e curva da descida da câmera durante a contagem: não fixadas; `DOMAIN/DEC-04` diz só que a
  câmera desce durante a contagem e está na pose de corrida no sinal verde.
- Contagem das chamadas de desenho: feita como o seed contou as 124 do código do Cowork (uma por malha e
  material do modelo montado); o custo da sombra não ganhou limite próprio, porque o seed não o fixa, e
  entra na taxa de quadros (US-0004, NFR-0001).
- Campo de visão vertical em retrato: o critério 06 de US-0003 exige que não fique abaixo de 62°, leitura de
  "o vertical cresce em retrato" (`DOMAIN/DEC-03`); nenhum outro valor foi fixado.
- Taxa de quadros sustentada: definida no glossário como contagem de quadros a cada segundo, sem segundo
  abaixo do limite, porque RNF03 não fixa o método de medida e o número é em quadros por segundo.
- Famílias de NFR dispensadas em `01-context.md` (tempo até pilotar, latência de entrada, navegadores,
  disponibilidade, offline, retenção, privacidade, RBAC, acessibilidade, idioma, observabilidade em
  execução, volume de mensagens): o seed não as altera.

## 2026-10-22 — rodada 2, Mode B (relatório `req-validation-20261022-1419.md`, 3 erros, 4 avisos, 1 info)

**O que mudou**

- ISSUE-01 (R3, US-0001, AC-US-0001-12): o critério que juntava a cor da placa e o número 01, observado na
  tela, foi separado nas duas metades que já carregava. AC-US-0001-12 ficou com a cor: a saída de
  `npm test` reporta a placa do para-choque do modelo montado na cor `#F4F3EF`, como os critérios 10, 11 e
  13. A outra metade virou AC-US-0001-16: a tela mostra o número 01 na placa do para-choque do kart
  exibido. O id novo foi acrescentado no fim da lista para não renumerar os critérios 13 a 15 (ids nunca
  reaproveitados, conventions §4). A placa, a cor e o número 01 já estavam em AC-US-0001-12 e no quarto
  critério de `SEED/US-1`: nenhuma superfície nova (§16). Nenhum outro arquivo citava o critério 12 de
  US-0001. Fechada por edição.
- ISSUE-02 (R3, US-0002, AC-US-0002-02): o critério passou a nomear a observação: a saída de `npm test`
  reporta o giro de cada uma das quatro rodas do modelo montado depois de um número conhecido de passos
  `STEP` com velocidade conhecida e constante, comparado com a taxa de rolamento (velocidade ÷ (π ×
  diâmetro)) vezes o tempo simulado. A prova por `npm test` com passos `STEP` é a de I9. A taxa, os
  diâmetros, o sentido do movimento e o giro nulo a 0 m/s continuam os mesmos. Os casos anormais de pausa,
  derrapagem e ré, que falam do giro em termos da taxa de rolamento, continuam coerentes e não mudaram.
  Fechada por edição.
- ISSUE-03 (R3, US-0003, AC-US-0003-09): o critério diz que a diferença do turbo é medida no campo de
  visão vertical, em paisagem e em retrato, porque a base dada pelo seed é o "campo de visão vertical de
  62°" (`SEED/US-3`, primeiro critério). Mesmo fato levado aos outros pontos onde aparece: o caso anormal
  "Turbo ativo durante a troca de orientação" e a seção Fontes de US-0003, a linha "Efeito de campo de
  visão do turbo" da tabela Retiradas e substituições de `01-context.md` e o termo "Efeito de turbo no
  campo de visão" de `02-glossary.md`. Fechada por edição.
- ISSUE-04 (R2, US-0004): a história ganhou o valor "para continuar pilotando na taxa de quadros que RNF03
  fixa, agora com o Kart 01 em cena", tirado do próprio critério do seed; a seção Fontes registra que o
  seed não diz o valor. Nenhum requisito acrescentado. Fechada por edição.
- ISSUE-05 (R2, US-0005): a história ganhou o valor "para ver as marcas de pneu, a fumaça do escapamento e
  a indicação de drift saírem do Kart 01 que estou pilotando", tirado do próprio critério do seed; a seção
  Fontes registra que o seed não diz o valor. Nenhum requisito acrescentado. Fechada por edição.
- ISSUE-06 (R4, `01-context.md`, Relação com outras features): a frase sobre a ordem de entrega depois da
  `dirigibilidade`, sem fonte em `SEED.md` nem em `DOMAIN.md`, saiu do conjunto. A decisão do dono do
  produto passada a esta execução continua registrada só neste changelog (aqui e na rodada 1), como
  contexto para `300 Specs/330 D-Specs`, que registra a dependência; não é requisito. Fechada por edição.
- ISSUE-07 (R4, US-0002, seção Canais): saiu a frase sobre os valores de esterço por adaptador (teclado e
  inclinação); o item diz só que o modelo mostra o esterço informado pela simulação, qualquer que seja o
  adaptador. Nenhum outro ponto do conjunto afirmava valores de esterço por canal (a menção a "inclinação e
  toque" em `01-context.md` e em `02-glossary.md` nomeia os controles, não valores). Fechada por edição.
- ISSUE-08 (info, R4, US-0001, AC-US-0001-14): o critério passou a dizer que todo kart exibido na tela é o
  Kart 01 e que o kart provisório de caixas não aparece em nenhum quadro, sem afirmar um único kart na cena,
  porque o fantasma (I1, I3, I8) também é um kart exibido. Mesmo fato levado à linha "Kart provisório" da
  tabela Retiradas e substituições de `01-context.md`. O caso anormal "Pedido de outro kart, outra cor ou
  adesivo" e os rótulos `SEED/RD-03` e `SEED/IM-I10` continuam com o texto do seed ("um único kart",
  isto é, um único modelo, sem personalização). Fechada por edição.
- Versões: US-0001, US-0002 e US-0003 em 1.1.0 (critérios reescritos); US-0004, US-0005, `01-context.md` e
  `02-glossary.md` em 1.0.1. Nenhum requisito, história, NFR, campo ou limite acrescentado ou removido; a
  única id nova, AC-US-0001-16, é a metade do antigo AC-US-0001-12 (§16). `00-index.md` e
  `99-traceability.md` não foram tocados: o gate os regenera.

**Itens fechados**: ISSUE-01 a ISSUE-08, todos por edição. Divergências registradas: nenhuma.

**Itens recusados, com motivo**

- ISSUE-06, segunda forma oferecida pelo relatório (o autor registrar a decisão em `DOMAIN.md` e o conjunto
  citá-la como `DOMAIN/DEC-nn`): não usada, porque nenhum passo do pipeline escreve em `220 Input/`
  (conventions §15) e a ordem de entrega é decisão de design. Proposta ao autor, se quiser a decisão
  durável: "2026-10-22 — a entrega de `modelo-kart-01` vem depois da entrega da `dirigibilidade`, que
  também altera a camada de aplicação; a etapa de design registra a dependência."
- ISSUE-02, tolerância no giro das rodas: nenhuma foi fixada; o critério mantém "igual", como antes, e uma
  tolerância seria um limite que o seed não dá.
- ISSUE-01, condição de câmera para ver o número 01 (por exemplo, "pela câmera de corrida"): não fixada,
  porque o seed não diz de que lado do kart a placa fica visível em corrida.
