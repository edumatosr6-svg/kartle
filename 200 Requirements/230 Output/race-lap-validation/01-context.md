---
title: Contexto — validação de volta de corrida
feature: race-lap-validation
stage: req
status: validated
version: 2.2.0
sources: [SEED, DOMAIN]
---

# Contexto

## O que é a feature

Uma corrida no Kartle é uma volta cronometrada numa pista, iniciada por contagem regressiva e encerrada na
linha de chegada. Esta feature define quando essa volta é **válida**, como o tempo total e os quatro tempos
de setor são medidos, e como o Jogador fica sabendo, durante e ao final da volta, se ela vale
(`SEED.md`, Visão geral). É a base do desafio diário, que é outra feature.

**Compatibilidade.** A validação preliminar por gates sequenciais do protótipo atual, que o próprio
`README.md` declara não substituir o sistema final de cortes (`SEED.md`, Contexto), é aposentada por esta
feature e substituída pelas regras de US-0002 (volta válida, tempo e setores) e de US-0004 a US-0007
(marcador pulado, chegada na contramão, corte e grama, reposicionamento).

**Padrão seguro.** O seed não prevê chave para desligar o comportamento novo: ele vale ligado por padrão
assim que a feature é entregue. É seguro ligado porque pista sem dado completo só oferece treino, sem tempo
oficial (`DOMAIN/DEC-10`), a volta não depende de servidor (NFR-0004) e física e presets não mudam
(NFR-0011).

Seed: `200 Requirements/220 Input/race-lap-validation/SEED.md`, `revision: 2`, `date: 2026-10-20`,
autor `eduardo.matos`. Camada de domínio durável: `DOMAIN.md` da mesma pasta, cujas decisões de
2026-10-20 prevalecem sobre os pontos em aberto correspondentes do seed.

## Atores e canais

| Ator | Canal | Papel nesta feature |
|---|---|---|
| Jogador | `web-desktop` | Pilota com teclado (RF12); recebe a contagem, o tempo, os setores e o estado da volta |
| Jogador | `web-mobile` | Pilota com inclinação e toque; mesmas regras e mesma informação que em `web-desktop` |
| Curador do catálogo | nenhum canal (dado de pista) | Fornece, por pista, largada, sentido, setores e marcadores (`requirements/03`, passo 7); não interage com o jogo nesta feature |

Canal fora do escopo: `remote-wheel` (pós-MVP, `SEED.md` Atores e canais; I10). Nenhuma história deste
conjunto o cobre.

Em todas as histórias, as regras de validade e de cronometragem são idênticas em `web-desktop` e
`web-mobile`; o que muda entre os canais é o dispositivo de entrada, a forma de pausar (tecla Esc só em
`web-desktop`; perda do sensor só em `web-mobile`) e o tamanho mínimo do texto de estado e de motivo
(16 px exigidos só em `web-mobile`, `DOMAIN/DEC-11`). Em `web-mobile`, sensor de inclinação ausente ou
permissão negada antes da volta faz o controle recair para toque com estado visível (I4, `[DOMAIN]`); a
perda do sensor **durante** a volta suspende simulação e cronômetro (`DOMAIN/DEC-08`).

## Itens do seed e decisões de domínio (chave de rastreabilidade)

Os rótulos abaixo nomeiam os itens do seed e as decisões de `DOMAIN.md`, que não têm identificador
próprio; o `sources:` de cada história e de cada NFR os cita. A matriz gerada (`99-traceability.md`) liga
cada rótulo aos itens deste conjunto.

| Rótulo | Item |
|---|---|
| `SEED/US-1` … `SEED/US-9` | As nove histórias de usuário da seção Histórias de usuário, na ordem do seed |
| `SEED/RD-01` | Largada com contagem regressiva, quatro setores e linha de chegada (RF09) |
| `SEED/RD-02` | Volta que pula checkpoint é inválida (RF10) |
| `SEED/RD-03` | Setores de apresentação e marcadores de validação são conjuntos distintos (`requirements/02`, `06`) |
| `SEED/RD-04` | Validar ordem e sentido de passagem pelos marcadores e o cruzamento da chegada (`requirements/02`) |
| `SEED/RD-05` | Chegada na contramão ou sem completar o percurso não conclui volta (`requirements/02`) |
| `SEED/RD-06` | Grama reduz velocidade e não invalida sem regra de corte correspondente (RF08, `requirements/02`) |
| `SEED/RD-07` | O relógio oficial acompanha a simulação, não os quadros renderizados (`requirements/02`, RNF07) |
| `SEED/RD-08` | Os quatro setores compõem o tempo total dentro da regra de precisão (`requirements/02`) |
| `SEED/RD-09` | Reconhecimento e treino não escrevem tempos oficiais (`requirements/02`, estados) |
| `SEED/RD-10` | Reposicionamento invalida volta oficial; livre em reconhecimento e treino (D08, confirmado por `DOMAIN/DEC-02`) |
| `SEED/RD-11` | Cada tentativa oficial cobre uma volta, que registra tempo total e quatro setores (`requirements/source`) |
| `SEED/NF-01` | Determinismo no mesmo runtime: idênticos em 100% das execuções (RNF07) |
| `SEED/NF-02` | Independência de quadros: tempo igual a 30 fps e a 60 fps |
| `SEED/NF-03` | Desempenho com a validação ativa: 60 fps em notebook, 30 fps em celular intermediário (RNF03) |
| `SEED/NF-04` | Funciona sem servidor (RNF08) |
| `SEED/NF-05` | Nenhuma coleta de dados pessoais (RNF10) |
| `SEED/NF-06` | Estado da volta comunicado por texto, não só por cor (`requirements/07`) |
| `SEED/NF-07` | Mensagens de estado e motivo em pt e en (RNF11) |
| `SEED/NF-08` | Determinismo entre navegadores diferentes (RNF05, RNF07; limite fixado por `DOMAIN/DEC-07`) |
| `SEED/RE-01` | Validação e cronometragem pertencem à simulação (I2) |
| `SEED/RE-02` | O contrato de passo fixo da simulação não muda (I8) |
| `SEED/RE-03` | Largada, sentido, setores e marcadores vêm do dado da pista |
| `SEED/RE-04` | A pista sintética atual continua jogável e recebe seus próprios setores e marcadores |
| `SEED/RE-05` | Presets de kart e física de pilotagem não mudam |
| `SEED/IM-I1` | O resultado identifica pista e versão da pista |
| `SEED/IM-I2` | Validação e tempo na camada de simulação |
| `SEED/IM-I3I5` | O dado de pista passa a carregar setores e marcadores distintos: mudança versionada |
| `SEED/IM-I7` | Uma volta concluída produz um único resultado, mesmo que a chegada seja cruzada de novo |
| `SEED/IM-I8` | O tempo é função da sequência de passos da simulação |
| `SEED/IM-I9` | Cada regra de validade tem verificação determinística em `npm test` |
| `DOMAIN/DEC-01` | Corte: mais de 3 m além da borda da pista por mais de 1000 ms seguidos; valores padrão, que o dado da pista pode substituir pelos seus (D09) |
| `DOMAIN/DEC-02` | Reposicionar invalida a volta oficial; livre e sem penalidade em reconhecimento e treino (D08) |
| `DOMAIN/DEC-03` | Tempo em milissegundos; instante de cruzamento da chegada e dos limites de setor interpolado dentro do passo; exibição com 3 casas decimais (ex.: `1:02.345`) |
| `DOMAIN/DEC-04` | Queima de largada ignorada: o kart fica parado até o sinal verde, a aceleração anterior não tem efeito, sem penalidade |
| `DOMAIN/DEC-05` | Contagem regressiva de 3 s; cronômetro começa no sinal verde, não no cruzamento da linha de largada |
| `DOMAIN/DEC-06` | Volta invalidada termina imediatamente no momento da invalidação |
| `DOMAIN/DEC-07` | Mesmo tempo, ao ms exibido, em Chrome, Edge, Firefox e Safari atuais; uma diferença é defeito |
| `DOMAIN/DEC-08` | Pausa (Esc), perda de foco da aba ou perda do sensor suspendem simulação e cronômetro; ao continuar, a volta segue oficial; perda de foco e de sensor pausam automaticamente (D10) |
| `DOMAIN/DEC-09` | Navegador em idioma que não é português nem inglês recebe as mensagens em inglês |
| `DOMAIN/DEC-10` | Pista cujo dado não declara largada, sentido, quatro setores ou marcadores é jogável apenas sem tempo oficial (treino); nenhuma volta oficial é oferecida nela |
| `DOMAIN/DEC-11` | Legibilidade WCAG AA: contraste mínimo 4,5:1; texto de estado e motivo com no mínimo 16 px no celular; contagem com no mínimo 48 px |

## Decisões de domínio aplicadas

Cada decisão `DOMAIN/DEC-nn` fecha o ponto aberto de mesmo número (nn) — os de 01 a 08 vinham do seed, os
de 09 a 11 foram levantados pela rodada anterior deste conjunto. Onde cada uma é aplicada:

| Decisão | Histórias e NFRs |
|---|---|
| `DOMAIN/DEC-01` | US-0006 |
| `DOMAIN/DEC-02` | US-0007 |
| `DOMAIN/DEC-03` | US-0002, US-0003 |
| `DOMAIN/DEC-04` | US-0001 |
| `DOMAIN/DEC-05` | US-0001 |
| `DOMAIN/DEC-06` | US-0004, US-0006, US-0007, US-0009 |
| `DOMAIN/DEC-07` | NFR-0008 |
| `DOMAIN/DEC-08` | US-0003, com reflexo nos casos anormais de US-0001, US-0002, US-0004 a US-0007 e US-0009 |
| `DOMAIN/DEC-09` | US-0009, NFR-0007 |
| `DOMAIN/DEC-10` | US-0008 |
| `DOMAIN/DEC-11` | US-0001, US-0009, NFR-0006 |

Não resta ponto em aberto neste conjunto.

## Restrições (citadas do seed, seção Restrições)

- "A validação e a cronometragem pertencem à simulação; renderização e controles só exibem e alimentam
  entradas (I2)." — NFR-0009.
- "O contrato de passo fixo da simulação não muda nesta feature (I8)." — NFR-0010.
- "Largada, sentido, setores e marcadores vêm do dado da pista, não de constantes do jogo." — US-0002,
  US-0004, US-0006 (limites de corte declarados pela pista), US-0008 (pista sem esse dado).
- "A pista sintética atual continua jogável e recebe seus próprios setores e marcadores." — US-0002,
  US-0004.
- "Os presets de kart e a física de pilotagem não mudam nesta feature." — NFR-0011.

## Famílias de requisitos não funcionais

| Família | Tratamento |
|---|---|
| Determinismo (RNF07) | Especificada: NFR-0001, NFR-0002, NFR-0008 |
| Taxa de quadros (RNF03) | Especificada: NFR-0003 |
| Disponibilidade / solo sem servidor (RNF08) | Especificada: NFR-0004 |
| Comportamento offline | Especificada por NFR-0004: a volta não depende de rede |
| Privacidade e consentimento (RNF10) | Especificada: NFR-0005 |
| Acessibilidade | Especificada: NFR-0006 |
| Idioma pt/en (RNF11) | Especificada: NFR-0007 |
| Suporte a navegadores (RNF05) | Especificada no que toca o tempo oficial: NFR-0008 |
| Observabilidade / evidência (I9) | Especificada: NFR-0009; telemetria em tempo de execução dispensada — o produto não coleta dados (RNF10) |
| Compatibilidade de dado de pista (I3, I5) | Especificada: NFR-0012 |
| Latência de entrada (RNF04) | Dispensada: o seed não altera o caminho de entrada nem fixa limite de latência para esta feature |
| Tempo até pilotar (RNF01) | Dispensada: o seed não fixa limite de carregamento para esta feature |
| Tamanho de download (RNF02) | Dispensada: o seed não fixa limite de tamanho para esta feature |
| Retenção de dados | Dispensada: persistência de resultados é da etapa 5, fora do escopo |
| Exposição por papéis (RBAC) | Dispensada: o produto não tem contas nem papéis (I10, RNF10) |
| Volume de mensagens | Dispensada: a feature não envia mensagens nem usa servidor |

## Fora do escopo (do seed, seção Fora do escopo)

- Tentativas, consumo, persistência e resultado do desafio diário — etapa 5 (RF14–RF18), outra feature.
- Medalhas e cores de setor (D15, D16), fantasma (RF19), ranking — etapas posteriores.
- Importação e revisão de pistas reais (RF01–RF06) — etapa 3; aqui só se exige que o dado de pista
  carregue largada, sentido, setores e marcadores.
- Câmera e minimapa (RF11, parte) — sem regra de validade envolvida.
- Mudanças na física de pilotagem e nos presets.
- `remote-wheel` e salas — pós-MVP.
