---
title: Verificações de fumaça — por canal, cada uma observando um limiar
feature: race-lap-validation
stage: deploy
status: draft
version: 1.1.0
sources: [DES-0005, DES-0009, NFR-0003, NFR-0004, NFR-0006, NFR-0007, TEST-0009, TEST-0013]
---

# Verificações de fumaça

Executadas por um humano na URL de **staging** antes da pergunta de promoção e repetidas (subconjunto marcado "prod")
na URL de **produção** depois dela. Cada linha nomeia o limiar que observa; uma linha que só confirma que a página abriu
não prova nada. Os roteiros `E2E-nn` são os de `300 Specs/330 D-Specs/Output/race-lap-validation/test-strategy.md`
e o resultado é registrado em `docs/lap-validation-device-log.md` com aparelho, navegador, versão e medida.

URLs (GitHub Pages, D23): staging `https://<owner>.github.io/kartle-staging/`, produção `https://<owner>.github.io/kartle/`
— sempre com a barra final, porque o site é servido em `/<repo>/`. Nesta release a página oferece **só a volta de
treino**: a oferta de volta oficial e de reconhecimento depende do desafio diário, outra feature (DES-0009), e todas as
linhas abaixo correm sobre a volta de treino.

Preparação comum: cache vazio (janela anônima), painel de rede aberto, idioma do navegador anotado.

## Canal `web-desktop` (Chrome, Edge, Firefox e Safari nas versões atuais)

| # | O que se faz | O que se observa | Limiar | Roteiro | prod |
|---|---|---|---|---|---|
| D1 | abrir `https://<owner>.github.io/<repo>/` (`kartle-staging` em staging, `kartle` em produção) | cadeado válido (certificado `*.github.io`); painel de rede sem nenhum recurso em `http://`; nenhum aviso de conteúdo misto; os *assets* carregados de `/<repo>/assets/` com 200 | RNF06: 0 recursos inseguros, certificado válido (I6) | — | sim |
| D2 | com o painel de rede limitando a 4G (perfil "4G" ou "Fast 4G") e cache vazio, recarregar `https://<owner>.github.io/<repo>/` e cronometrar da navegação até o kart responder à primeira tecla | tempo medido | RNF01: abaixo de 10 s | — | sim |
| D3 | na mesma carga, ler o total transferido no painel de rede | bytes transferidos e bytes de recurso | RNF02: abaixo de 3 145 728 bytes; esperado da ordem de 153 KB comprimidos ou 593 KB brutos (`01-release.md`) | — | sim |
| D4 | `#track-status` ao terminar de carregar | mostra `synthetic`; `#lap-offer` contém **exatamente um** botão, "volta de treino", e **nenhuma** opção de volta oficial nem de reconhecimento (as duas chegam com o desafio diário, DES-0009; `offeredLapKinds(reading, [])` em `src/main.ts`) | leitura `COMPLETE` do arquivo versão 2 (NFR-0012; `CHK-TEST-0009-*`): 1 oferta, a de treino; 0 oferta oficial (AC-US-0008-03) | E2E-06 (parte positiva, lida para esta release: treino pilotável, sem opção oficial) | sim |
| D5 | iniciar a volta de treino; observar a contagem | 3, 2, 1 e VERDE em texto; cronômetro `0:00.000` até o VERDE; acelerar antes do VERDE não move o kart | NFR-0006: numerais com 48 px no mínimo e contraste 4,5:1 | E2E-01 (em volta de treino) | sim |
| D6 | completar a volta de treino com o teclado | "válida em andamento" durante a volta; tempo de cada setor ao completá-lo; resultado com total `m:ss.mmm`, sufixo "não oficial" (AC-US-0008-01) e 4 setores cuja soma é o total | NFR-0006: estado em texto, 4,5:1; soma dos setores igual ao total com 0 ms de diferença | E2E-02 (parte de conclusão) | sim |
| D7 | nova volta; Esc no meio; trocar de aba e voltar | cronômetro para e retoma do mesmo valor nas duas situações | NFR-0002: 0 ms de avanço durante a pausa | E2E-03, E2E-04 | não |
| D8 | nova volta de treino; pular um marcador; em outra volta, cortar; em outra, reposicionar (tecla `R`) | marcador pulado e corte: "inválida" com o motivo em texto ("marcador pulado", "corte") e resultado sem tempo; **reposicionamento em treino não invalida**: sem motivo, a volta segue e o cronômetro continua (DES-0005: reposicionar é livre em treino e reconhecimento; só invalida a oficial — ponto em aberto 02 do `DOMAIN.md`) | NFR-0006: motivo em texto; NFR-0009 regras já provadas em `npm test` (`tests/lap-kinds.test.ts`) | E2E-02 (motivos; a parte "reposicionando em volta oficial de fixture" é só de `npm test` nesta release) | não |
| D9 | depois de carregar, bloquear a rede (painel "offline") e completar uma volta | resultado exibido; 0 requisições no painel durante a volta | NFR-0004: 0 requisições entre a contagem e o resultado | E2E-08 | não |
| D10 | trocar o idioma do navegador para `pt`, `en` e um terceiro (`fr`) e recarregar | textos de estado e motivo em pt, em en e em en respectivamente | NFR-0007 / RNF11: 100 % das mensagens no idioma do navegador; inglês para os demais | E2E-07 | não |
| D11 | tela em escala de cinza (filtro do sistema) durante D5 e D6 | todo estado e motivo legível só pelo texto | NFR-0006: 100 % dos estados com rótulo em texto | E2E-09 | não |
| D12 | uma volta completa com o contador de fps do navegador aberto, no notebook de referência | fps médio e mínimo | NFR-0003 / RNF03: 60 fps | E2E-10 | não |
| D13 | a mesma sequência de entradas (`reference.inputs` de TEST-0008) nos 4 navegadores | total e 4 setores iguais ao ms | NFR-0008: 0 ms de diferença | E2E-11 | não |
| D14 | procurar em `dist/` (busca de texto nos 3 arquivos) dado ou texto derivado de OpenStreetMap e o termo ODbL; depois procurar na página servida qualquer alegação de atribuição OSM | **nesta release nenhum dado OSM é publicado → nenhum crédito é exigido** (pista sintética, literais em `src/track.ts`). Esperado: `dist/` com **0** ocorrências de "OpenStreetMap", "OSM" e "ODbL" **e** a página sem nenhuma alegação de atribuição OSM | RNF09 / D-DP-04: crédito e aviso visíveis sempre que houver dado OSM no bundle. **Passa** com 0 ocorrências em `dist/` e 0 alegações na página; **falha** se `dist/` contiver dado OSM sem crédito ou se a página alegar atribuição OSM sem dado OSM. O crédito passa a ser exigido na primeira release que publicar pista OSM (`98-divergences.md`, DIV-DP-05) | — | sim |

## Canal `web-mobile` (celular intermediário de referência, navegador atual)

| # | O que se faz | O que se observa | Limiar | Roteiro | prod |
|---|---|---|---|---|---|
| M1 | abrir `https://<owner>.github.io/<repo>/` no celular | cadeado válido; "Ativar inclinação" pede permissão e, concedida, o kart responde à inclinação | RNF06: HTTPS válido; `window.isSecureContext` verdadeiro, observável porque a inclinação ativa em vez de avisar "Inclinação indisponível" | — | sim |
| M2 | em rede 4G real (dados móveis, Wi-Fi desligado), cache vazio, cronometrar da navegação até o kart responder ao primeiro toque ou inclinação | tempo medido | RNF01: abaixo de 10 s | — | sim |
| M3 | na mesma carga, total transferido (ferramenta remota do navegador ou contador de dados do aparelho) | bytes | RNF02: abaixo de 3 145 728 bytes | — | sim |
| M4 | `#track-status` e `#lap-offer` | `synthetic`; exatamente um botão, "volta de treino"; nenhuma opção oficial nem de reconhecimento (DES-0009) | NFR-0012: leitura `COMPLETE`, 1 oferta (treino), 0 oficial (AC-US-0008-03) | E2E-06 (como em D4) | sim |
| M5 | iniciar a volta de treino; observar a contagem | 3, 2, 1, VERDE em texto com 48 px no mínimo; estado e motivo com 16 px no mínimo | NFR-0006: 48 px, 16 px, 4,5:1, medidos no aparelho | E2E-01, E2E-07 (em volta de treino) | sim |
| M6 | completar a volta de treino com inclinação ou toque | resultado com total, sufixo "não oficial" e 4 setores cuja soma é o total | NFR-0006 texto e contraste; soma igual ao total | E2E-02 (parte de conclusão) | sim |
| M7 | com a inclinação ativa, cobrir ou desativar o sensor; em outra volta, negar a permissão antes de iniciar | pausa em cerca de 0,5 s; texto de controle por toque visível quando negada | I4: pausa `SENSOR_LOST` até 500 ms depois da última leitura (ADR-0005) | E2E-05 | não |
| M8 | trocar de aplicativo e voltar durante a volta | volta pausada com o mesmo cronômetro; continua só por ação do jogador | NFR-0002: 0 ms de avanço na pausa | E2E-04 | não |
| M9 | modo avião depois de carregar; completar uma volta | resultado exibido; 0 requisições | NFR-0004 | E2E-08 | não |
| M10 | idioma do aparelho em pt, en e um terceiro | textos seguem pt, en, en | NFR-0007 / RNF11 | E2E-07 | não |
| M11 | uma volta completa com medida de fps no aparelho nomeado | fps médio e mínimo | NFR-0003 / RNF03: 30 fps; uma medida em desktop não vale (I9) | E2E-10 | não |
| M12 | crédito OpenStreetMap e aviso ODbL: a mesma busca de D14 em `dist/` e na página servida no celular | o mesmo resultado de D14: 0 ocorrências de OSM/ODbL em `dist/` **e** nenhuma alegação de atribuição OSM na página | RNF09 / D-DP-04: passa com 0 e 0, como em D14 | — | sim |

## Verificação em produção

Depois da promoção: D1, D2, D3, D4, D5, D6 e D14 em `web-desktop`; M1, M2, M3, M4, M5, M6 e M12 em `web-mobile`. Qualquer
limiar cruzado é gatilho de reversão (`runbook.md`, *Roll back*).

## Limites desta lista

- Nenhuma verificação acima é automatizada: o projeto não tem ferramenta de E2E e a feature não acrescenta dependência
  (test-strategy). O `npm test` (170 casos) prova as regras; estas linhas provam a página servida.
- O "desafio do dia" citado na verificação de saúde das diretivas ainda não existe nesta release (é a etapa 5 do
  produto): o observável equivalente hoje é D4/M4, a pista `synthetic` lida como `COMPLETE` com a volta de treino
  ofertada. A volta oficial só passa a ser ofertada — e só então entra numa linha desta lista — com essa etapa (DES-0009).
- O `href="/"` da marca no cabeçalho aponta, no Pages de projeto, para `https://<owner>.github.io/` e não para
  `/<repo>/`; é item do estágio de código (`98-divergences.md`, DIV-DP-12) e nenhuma linha acima depende desse link.
