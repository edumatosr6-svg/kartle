# Domínio — modelo-kart-01

Decisões fechadas pelo dono do produto. Prevalecem sobre os pontos em aberto correspondentes do `SEED.md`.

- 2026-10-22 — **Fonte do modelo (Eduardo Matos):** o código do Cowork, salvo sem alteração em
  `docs/kart-01/kart.js`. A ficha "Kart 01 — Kartle" é a referência para conferir.
- 2026-10-22 — **OPEN-01 fechado:** as 124 malhas são **agrupadas por material**, para no máximo
  **30 chamadas de desenho** do kart com o piloto, sem mudar a forma. Rodas, volante e braços continuam
  animáveis.
- 2026-10-22 — **OPEN-02 fechado:** as medidas da física **não** são alinhadas ao modelo nesta feature.
  Fica para depois da `dirigibilidade`.
- 2026-10-22 — **OPEN-03 fechado:** em retrato, o campo de visão **horizontal** é de pelo menos **60°**,
  então o vertical cresce em retrato. Em paisagem, o vertical é de 62°, como na ficha.
- 2026-10-22 — **OPEN-04 fechado:** antes da largada, a câmera mostra a pista do alto e **desce para trás
  do piloto durante a contagem regressiva**. No sinal verde, ela já está na posição de corrida.
- 2026-10-22 — **OPEN-05 fechado:** o kart **projeta sombra** no chão.
- 2026-10-22 — **Câmera depois do fim da volta (Eduardo Matos),** após parada do F-Spec: quando a volta
  termina, válida ou invalidada (inclusive por reposicionamento), e o painel de resultado aparece, a
  câmera **continua atrás do piloto**, na pose de corrida, e o kart continua pilotável. A visão geral do
  alto existe **só antes da contagem regressiva**. "Em corrida", para a câmera, vai do sinal verde até a
  próxima visão geral, sem terminar em `ENDED`.
