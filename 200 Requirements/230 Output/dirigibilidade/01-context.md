---
title: Contexto — dirigibilidade do Arcade assistido
feature: dirigibilidade
stage: req
status: validated
version: 2.0.0
sources: [SEED, DOMAIN]
---

# Contexto

## O que é a feature

O acerto padrão **Arcade assistido** do Kartle deve ser divertido de pilotar nos primeiros segundos: o
kart vira quando o Jogador manda, segura a curva em vez de sair de frente, acelera com vontade e transmite
velocidade e risco. A referência de sensação é **Karting Superstars** — direção direta e rápida, muita
aderência em alta velocidade, traseira viva mas que se segura (`SEED.md`, Visão geral; `DOMAIN/REF-01`).
Nada aqui muda o passo da simulação, a validação de volta nem o determinismo: o jogo continua um jogo de
tempo justo.

**Situação de partida (citada do seed, seção Contexto).** O Arcade usa hoje a mesma massa e o mesmo modelo
de pneu do kart de aluguel, com assistências (direção proporcional à velocidade, frenagem equilibrada,
amortecimento de derrapagem) e um motor acima da especificação do aluguel. Os ensaios atuais registrados em
`docs/physics.md`: 0–40 km/h em 3,21 s; 54,3 km/h após 5 s; velocidade estabilizada 79,4 km/h; volta do
piloto de teste em ~31,4 s na pista sintética. O dono do produto testou a build publicada e relatou
subesterço, resposta lenta e pouca sensação de velocidade (`DOMAIN/REF-01`). Depois de testar de novo a
build atual ("não vira, não ganha velocidade"), o dono do produto subiu os limites para o **acerto
agressivo** registrado na revisão 2 do seed (`DOMAIN/REF-02`). O acerto **Realista — aluguel 4T** continua
existindo e não muda.

**Padrão seguro.** O seed não prevê chave para escolher entre o acerto antigo e o novo: o novo Arcade
assistido vale como padrão assim que a feature é entregue, declarado como nova versão de acerto
(`SEED/IM-I3I5`), de modo que nenhum tempo, replay ou resultado anterior é tratado como comparável. Nenhum
preset experimental extra é exposto no painel do jogo durante o ciclo de acerto (`DOMAIN/DEC-10`).

Seed: `200 Requirements/220 Input/dirigibilidade/SEED.md`, `revision: 2`, `date: 2026-10-21`, autor
`eduardo.matos`. Camada de domínio durável: `DOMAIN.md` da mesma pasta, cujas decisões de 2026-10-21
prevalecem sobre os pontos em aberto correspondentes do seed; a entrada "Acerto agressivo (revisão 2 do
seed)" substitui os valores fechados antes para os pontos 01, 02, 05, 06 e 07, e este conjunto usa só os
valores em vigor.

## Atores e canais

| Ator | Canal | Papel nesta feature |
|---|---|---|
| Jogador | `web-desktop` | Pilota com teclado: entradas binárias (esterço cheio ou zero; acelerador cheio ou zero) |
| Jogador | `web-mobile` | Pilota com inclinação (esterço proporcional) e toque; com sensor ausente ou permissão negada, recai para toque com estado visível (I4) |
| Piloto de teste | nenhum canal (`npm run bench:handling`) | Volta determinística na pista sintética com comandos binários; é a régua de regressão desta feature |

Canal fora do escopo: `remote-wheel` (pós-MVP, I10; `SEED.md`, Fora do escopo). Nenhuma história deste
conjunto o cobre.

Em todas as histórias, os limites de resposta, aderência, aceleração e velocidade são medidos no **estado
da simulação**, em tempo simulado (passos de `STEP`), a partir do valor normalizado de `Input` que o
adaptador de controle entrega (I2, I8). Por isso os mesmos limites valem para `web-desktop` e
`web-mobile`: o que muda entre os canais é o adaptador — teclado produz esterço 0 ou 1; inclinação produz
esterço proporcional entre −1 e 1; toque produz esterço binário no recuo do sensor. Onde um critério
depende de esterço parcial, a história diz o que vale só em `web-mobile`.

## Itens do seed e decisões de domínio (chave de rastreabilidade)

Os rótulos abaixo nomeiam os itens do seed e as decisões de `DOMAIN.md`, que não têm identificador próprio;
o `sources:` de cada história e de cada NFR os cita. A matriz gerada (`99-traceability.md`) liga cada
rótulo aos itens deste conjunto.

| Rótulo | Item |
|---|---|
| `SEED/US-1` … `SEED/US-5` | As cinco histórias de usuário da seção Histórias de usuário, na ordem do seed |
| `SEED/RD-01` | Direção comum permanece fácil sem exigir drift (`requirements/11`) |
| `SEED/RD-02` | Realista permanece sem assistências arcade e não muda (`requirements/10`, README) |
| `SEED/RD-03` | Passo fixo `STEP`, solver e significado de `Input` não mudam (I8) |
| `SEED/RD-04` | Mudar acerto que altera tempos é mudança versionada (I3) |
| `SEED/RD-05` | Sensação alvo: Karting Superstars — direção direta, aderência alta em velocidade, traseira viva controlável (decisão do dono do produto, 2026-10-21) |
| `SEED/NF-01` | Determinismo preservado: tempos idênticos em 100 % das execuções repetidas (RNF07) |
| `SEED/NF-02` | Custo por passo da simulação não aumenta mais de 10 % no bench (RNF03) |
| `SEED/NF-03` | Teclado e inclinação atendem, ambos, US-1 a US-4 |
| `SEED/NF-04` | Cada mudança registra parâmetros e resultados em `docs/physics.md` (I9) |
| `SEED/RE-01` | Mudanças ficam nos presets e nas assistências de `src/physics.ts`; nada de regra de pilotagem em renderização ou controle (I2) |
| `SEED/RE-02` | `STEP`, solver de 480 Hz e `Input` não mudam (I8) |
| `SEED/RE-03` | O preset Realista não muda |
| `SEED/RE-04` | A validação de volta (`src/lap.ts`, `src/track.ts`) não muda |
| `SEED/IM-I2` | Toda a mudança na camada de simulação |
| `SEED/IM-I3I5` | Novo acerto declarado como versão; tempos antigos não comparáveis |
| `SEED/IM-I8` | Contrato de passo preservado; só os parâmetros mudam |
| `SEED/IM-I9` | Cada critério tem ensaio determinístico em `npm test` ou nos benches |
| `DOMAIN/REF-01` | Referência de sensação: Karting Superstars; sintomas relatados no acerto atual: sai de frente, lento ao volante, pouca sensação de velocidade e risco |
| `DOMAIN/REF-02` | Acerto agressivo (revisão 2 do seed, 2026-10-21): após testar a build atual ("não vira, não ganha velocidade"), o dono do produto substituiu os valores fechados dos pontos 01, 02, 05, 06 e 07 pelos valores abaixo; 03, 04 e a regra de medição só da guinada permanecem |
| `DOMAIN/DEC-01` | Resposta do volante (em vigor, revisão 2): taxa de guinada atinge 90 % do regime em no máximo 180 ms após esterço cheio a 50 km/h em reta; ao soltar, cai a 10 % em no máximo 250 ms. Substitui 250 ms / 300 ms |
| `DOMAIN/DEC-02` | Velocidade de curva de referência no raio de 18 m (em vigor, revisão 2): 50 km/h. Substitui 45 km/h |
| `DOMAIN/DEC-03` | Nessa curva, a telemetria não reporta `understeer` por mais de 200 ms consecutivos (mantido) |
| `DOMAIN/DEC-04` | Ao reduzir o esterço com a traseira solta, o kart volta a `grip` em no máximo 400 ms (mantido) |
| `DOMAIN/DEC-05` | 0–60 km/h em no máximo 2,5 s, piloto de 75 kg (em vigor, revisão 2). Substitui 3,0 s |
| `DOMAIN/DEC-06` | Velocidade estabilizada em reta de pelo menos 105 km/h (em vigor, revisão 2). Substitui 95 km/h |
| `DOMAIN/DEC-07` | O piloto de teste completa a volta sintética sem sair do asfalto em no máximo 25 s (em vigor, revisão 2; hoje ~31,4 s). Substitui 27 s |
| `DOMAIN/DEC-08` | Rodada de teste do dono do produto na build antes de fechar a feature; os números são necessários, não suficientes |
| `DOMAIN/DEC-09` | Decisão de 2026-10-21 sem ponto aberto próprio: o ensaio de resposta do volante (reta a 50 km/h, esterço cheio) mede só o tempo de resposta da taxa de guinada; `understeer` transitório nesse ensaio é aceitável; a aderência em curva é julgada só pelo ensaio de 50 km/h no raio de 18 m |
| `DOMAIN/DEC-10` | Ciclo de teste do ponto 08: cada rodada de código é publicada em staging; o dono do produto testa e devolve feedback curto (vira? acelera? traseira?); os presets são iterados dentro do pipeline até a aprovação dele; nenhum preset experimental extra no painel |

## Decisões de domínio aplicadas

Cada decisão `DOMAIN/DEC-01` a `DOMAIN/DEC-08` fecha o ponto aberto de mesmo número (nn) do seed, com o
valor em vigor após a revisão 2 (`DOMAIN/REF-02`); `DOMAIN/DEC-09` e `DOMAIN/DEC-10` são decisões de
2026-10-21 que não correspondem a ponto aberto numerado próprio (a segunda detalha o ciclo do ponto 08).
Onde cada uma é aplicada:

| Decisão | Histórias e NFRs |
|---|---|
| `DOMAIN/DEC-01` | US-0001 |
| `DOMAIN/DEC-02` | US-0002, US-0003, US-0004 (velocidade de entrada na grama) |
| `DOMAIN/DEC-03` | US-0002 |
| `DOMAIN/DEC-04` | US-0003 |
| `DOMAIN/DEC-05` | US-0004 |
| `DOMAIN/DEC-06` | US-0004 |
| `DOMAIN/DEC-07` | US-0005 |
| `DOMAIN/DEC-08` | Critério final humano, fora dos critérios de aceite (ver abaixo) |
| `DOMAIN/DEC-09` | US-0001 (critério 05) |
| `DOMAIN/DEC-10` | Ciclo de fechamento humano (ver abaixo); nenhum critério de aceite |

**Ponto aberto 08 — critério final humano.** O dono do produto decidiu que a sensação é subjetiva: os
critérios numéricos deste conjunto são necessários, não suficientes, e uma rodada de teste dele na build
publicada precede o fechamento da feature (`DOMAIN/DEC-08`). O ciclo é o de `DOMAIN/DEC-10`: cada rodada
de código vai para staging, o dono do produto responde curto (vira? acelera? traseira?) e os presets são
iterados dentro do pipeline — nova rodada de código e testes — até a aprovação dele, sem preset
experimental extra no painel. Esse critério não é observável pelo sistema, por isso não vira critério de
aceite nem bloqueia esta etapa; ele é registrado aqui e no changelog como condição de fechamento de
responsabilidade do dono do produto, a ser cumprida depois da etapa de testes.

Não resta ponto em aberto bloqueante neste conjunto.

## Restrições (citadas do seed, seção Restrições)

- "Mudanças ficam nos presets e nas assistências de `src/physics.ts`; nada de regra de pilotagem em
  renderização ou controle (I2). Motivo: a simulação roda sem DOM e no servidor futuro." — NFR-0005.
- "`STEP`, solver de 480 Hz e `Input` não mudam (I8). Motivo: contrato de todos os replays." — NFR-0006.
- "O preset Realista não muda. Motivo: é a referência física documentada." — NFR-0007.
- "A validação de volta (`src/lap.ts`, `src/track.ts`) não muda. Motivo: feature própria já validada." —
  NFR-0008.

## Relação com a feature `race-lap-validation`

O conjunto validado de `race-lap-validation` exige, para a entrega daquela feature, que física e presets
não mudem (NFR-0011 daquele conjunto). A exigência é escopada à entrega daquela feature; esta feature muda
o preset Arcade assistido como mudança versionada (`SEED/RD-04`, NFR-0009) e deixa a validação de volta
intacta (NFR-0008). Nenhum feedback é enviado àquela feature: nenhum requisito dela precisa mudar.

## Famílias de requisitos não funcionais

| Família | Tratamento |
|---|---|
| Determinismo (RNF07) | Especificada: NFR-0001 |
| Taxa de quadros / custo da simulação (RNF03) | Especificada: NFR-0002 |
| Paridade entre canais de entrada | Especificada: NFR-0003 |
| Observabilidade / evidência (I9) | Especificada: NFR-0004 (ensaios registrados em `docs/physics.md`); telemetria em tempo de execução dispensada — o produto não coleta dados (RNF10) |
| Camada de simulação (I2) | Especificada: NFR-0005 |
| Contrato de passo (I8) | Especificada: NFR-0006 |
| Preset Realista inalterado | Especificada: NFR-0007 |
| Validação de volta inalterada | Especificada: NFR-0008 |
| Compatibilidade de replays e tempos (I3, I5) | Especificada: NFR-0009 |
| Latência de entrada (RNF04) | Dispensada: os limites desta feature são de tempo simulado, do `Input` recebido ao estado da simulação; o caminho do dispositivo até o `Input` não muda e o seed não fixa limite para ele |
| Disponibilidade / solo sem servidor (RNF08) | Dispensada: a feature não introduz dependência de rede; a simulação continua local |
| Comportamento offline | Dispensada: nenhuma mudança no caminho de rede; vale o que já vale para o jogo solo |
| Retenção de dados | Dispensada: a feature não persiste dado novo; a versão do acerto é declarada no dado publicado (NFR-0009), não armazenada por jogador |
| Privacidade e consentimento (RNF10) | Dispensada: nenhum dado pessoal é coletado ou introduzido pela feature (I6) |
| Exposição por papéis (RBAC) | Dispensada: o produto não tem contas nem papéis (I10, RNF10) |
| Acessibilidade | Dispensada como requisito novo: o HUD de velocidade e aderência já existe e esta feature só exige que não regrida (US-0004); nenhum elemento de tela novo |
| Idioma pt/en (RNF11) | Dispensada: nenhum texto novo de tela |
| Tempo até pilotar (RNF01), tamanho de download (RNF02), suporte a navegadores (RNF05) | Dispensadas: o seed não as altera; a mudança é de parâmetros da simulação |
| Volume de mensagens | Dispensada: a feature não envia mensagens nem usa servidor |

## Fora do escopo (do seed, seção Fora do escopo)

- Novas pistas, novas manobras ou mudança nas regras do drift (`requirements/11`).
- Mudanças no preset Realista.
- Som de motor, vibração, câmera (RF13, RF11).
- Volante remoto e desafio diário.
