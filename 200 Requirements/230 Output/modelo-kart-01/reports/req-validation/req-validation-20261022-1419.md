---
stage: req
feature: modelo-kart-01
verdict: FAIL
generated: 2026-10-22T14:26:24Z
counts: {blocker: 0, error: 3, warning: 4, info: 1, divergence: 0}
seed: {revision: 1, digest: ef2fe14c9440}
upstream: {stage: seed, version: n/a}
feedbacks: []
---

# Validação de requisitos — modelo-kart-01

## Issues

### ISSUE-01
- severity: error
- check: R3
- file: stories/US-0001-kart-de-verdade-na-pista.md
- location: AC-US-0001-12
- finding: O critério junta dois comportamentos (a cor da placa e o número 01) e pede que a tela mostre a cor exata `#F4F3EF`. Numa cena iluminada o pixel exibido não é o código de cor do material, então nenhuma observação na tela decide esse código.
- expected: Dois critérios. No primeiro, a saída de `npm test` reporta a placa do para-choque do modelo montado na cor `#F4F3EF`, como fazem AC-US-0001-10, -11 e -13. No segundo, a tela mostra o número 01 na placa do para-choque do kart exibido.

### ISSUE-02
- severity: error
- check: R3
- file: stories/US-0002-kart-reage-aos-comandos.md
- location: AC-US-0002-02
- finding: É o único critério da história que não nomeia um ponto de observação, e a taxa que ele exige não pode ser vista na tela: a 50 km/h, uma roda de Ø 0,26 m dá cerca de 17 rotações/s, ou cerca de 102° por quadro a 60 fps.
- expected: O critério nomeia a observação que o decide. Por exemplo: a saída de `npm test`, após N passos de `STEP` a uma velocidade conhecida, reporta o giro de cada roda do modelo montado, comparado com velocidade / (π × diâmetro).

### ISSUE-03
- severity: error
- check: R3
- file: stories/US-0003-camera-atras-e-perto-do-kart.md
- location: AC-US-0003-09
- finding: Em retrato, a base vem de dois critérios, um horizontal (05) e um vertical (06), e o critério não diz em qual campo de visão a diferença do turbo é medida. A relação entre os dois campos de visão não é linear, então igualar a diferença no vertical dá um resultado e igualar no horizontal dá outro, e dois observadores podem chegar a vereditos opostos.
- expected: O critério nomeia o campo de visão em que a diferença é medida, em paisagem e em retrato: o vertical, que é a base dada pelo seed ("campo de visão vertical de 62°").

### ISSUE-04
- severity: warning
- check: R2
- file: stories/US-0004-jogo-nao-fica-mais-lento.md
- location: ## História
- finding: A história tem ator e objetivo, mas não diz o valor ("para ..."). A US-4 do seed também não o diz.
- expected: A história diz o valor a que o objetivo serve, sem acrescentar requisito.

### ISSUE-05
- severity: warning
- check: R2
- file: stories/US-0005-efeitos-presos-ao-kart.md
- location: ## História
- finding: A história tem ator e objetivo, mas não diz o valor ("para ..."). A US-5 do seed também não o diz.
- expected: A história diz o valor a que o objetivo serve, sem acrescentar requisito.

### ISSUE-06
- severity: warning
- check: R4
- file: 01-context.md
- location: ## Relação com outras features, item `dirigibilidade` (linhas 135-137)
- finding: O texto "Por decisão do dono do produto passada a esta execução (2026-10-22), a entrega desta feature vem depois da entrega da `dirigibilidade` [...]; a etapa de design registra essa dependência" não tem fonte em `SEED.md` nem em `DOMAIN.md`, e mesmo assim chega à etapa de design como instrução.
- expected: A frase sai do conjunto, ou o autor registra a decisão em `DOMAIN.md` e o conjunto passa a citá-la como `DOMAIN/DEC-nn`.

### ISSUE-07
- severity: warning
- check: R4
- file: stories/US-0002-kart-reage-aos-comandos.md
- location: ## Canais, primeiro item
- finding: O trecho "Com teclado, o esterço informado vai a zero ou ao valor cheio; com inclinação, varia entre esses valores" descreve um comportamento da simulação que o seed não dá. O seed diz que essa física está sendo refeita na `dirigibilidade`.
- expected: O item diz só que o modelo mostra o esterço informado pela simulação, qualquer que seja o adaptador, sem afirmar valores de esterço por canal.

### ISSUE-08
- severity: info
- check: R4
- file: stories/US-0001-kart-de-verdade-na-pista.md
- location: AC-US-0001-14
- finding: O critério lê `SEED/RD-03` ("Um único kart. Karts customizáveis estão fora do MVP") como "um único kart na cena". I1 e I3 contam os fantasmas como parte do produto, e um fantasma exibido em corrida faria o critério falhar.
- expected: O critério diz que todo kart exibido é o Kart 01 e que o kart provisório de caixas não aparece em nenhum quadro, a menos que o autor confirme no seed a regra de um único kart na cena.

## Divergences

None.

## Coverage

- Itens do seed: 31 cobertos e 0 descobertos (US-1 a US-5, RD-01 a RD-05, NF-01 a NF-04, RE-01 a RE-03, IM-I2, IM-I8, IM-I9, IM-I10, FE-01 a FE-04, DEC-00 a DEC-05). FE-01 e FE-04 são cobertos só pela lista Fora do escopo de `01-context.md`.
- Itens do conjunto sem fonte no seed: 0 histórias, critérios ou NFRs. Duas afirmações de prosa não têm fonte: ISSUE-06 e ISSUE-07.
