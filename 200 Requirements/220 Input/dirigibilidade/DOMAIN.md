# Domínio — dirigibilidade

Decisões fechadas pelo dono do produto. Prevalecem sobre os pontos em aberto correspondentes do `SEED.md`.

- 2026-10-21 — **Referência de sensação (Eduardo Matos):** Karting Superstars — direção direta e
  rápida, muita aderência em alta velocidade, traseira viva mas controlável (escorrega-e-segura).
  Sintomas relatados no acerto atual: sai de frente nas curvas; lento para responder ao volante; pouca
  sensação de velocidade e de risco.
- 2026-10-21 — **OPEN-01 fechado:** resposta do volante — a taxa de guinada atinge 90 % do regime em
  no máximo **250 ms** após esterço cheio a 50 km/h em reta; ao soltar, cai a 10 % em no máximo
  **300 ms**.
- 2026-10-21 — **OPEN-02 fechado:** velocidade de curva de referência no raio de 18 m: **45 km/h**.
- 2026-10-21 — **OPEN-03 fechado:** nessa curva, a telemetria não reporta `understeer` por mais de
  **200 ms** consecutivos.
- 2026-10-21 — **OPEN-04 fechado:** ao reduzir o esterço com a traseira solta, o kart volta a `grip`
  em no máximo **400 ms**.
- 2026-10-21 — **OPEN-05 fechado:** 0–60 km/h em no máximo **3,0 s** (piloto de 75 kg).
- 2026-10-21 — **OPEN-06 fechado:** velocidade estabilizada em reta de pelo menos **95 km/h**.
- 2026-10-21 — **OPEN-07 fechado:** o piloto de teste (`npm run bench:handling`) completa a volta
  sintética sem sair do asfalto em no máximo **27 s** (hoje ~31,4 s).
- 2026-10-21 — **OPEN-08 mantido como critério final:** uma rodada de teste do dono do produto na
  build antes de fechar a feature; os números acima são necessários, não suficientes.
- 2026-10-21 — **Resposta do volante só mede guinada (Eduardo Matos):** no ensaio em reta a 50 km/h com
  esterço cheio (OPEN-01), o critério é o tempo de resposta da taxa de guinada; `understeer` transitório
  reportado pela telemetria durante esse ensaio **é aceitável**. A aderência em curva é julgada apenas
  pelo ensaio de 45 km/h no raio de 18 m (OPEN-02/OPEN-03). AC-US-0001-05 fica restrito a isso.
- 2026-10-21 (revisão 2 do seed) — **Acerto agressivo (Eduardo Matos),** após testar o build atual
  ("não vira, não ganha velocidade"). Substitui os valores de OPEN-01, 02, 05, 06 e 07 fechados acima:
  - **OPEN-01:** guinada a 90 % do regime em **180 ms**; ao soltar, cai a 10 % em **250 ms**.
  - **OPEN-02:** curva de raio 18 m a **50 km/h** sem `understeer` por mais de 200 ms (OPEN-03 mantido).
  - **OPEN-05:** 0–60 km/h em no máximo **2,5 s**.
  - **OPEN-06:** velocidade estabilizada de pelo menos **105 km/h**.
  - **OPEN-07:** piloto de teste completa a volta sintética em no máximo **25 s**.
  OPEN-04 (400 ms) e a regra "resposta do volante só mede guinada" permanecem.
- 2026-10-21 — **Ciclo de teste (OPEN-08, Eduardo Matos):** cada rodada de código é publicada em
  staging; o dono testa e devolve feedback curto (vira? acelera? traseira?); os presets são iterados
  dentro do pipeline (nova rodada de código/testes) até a aprovação dele. Nenhum preset experimental
  extra no painel.
- 2026-10-21 (revisão 3 do seed) — **Correção de fato e método dos ensaios (redator, após FAIL SPEC
  do código; não muda nenhum limiar do dono):** a pista sintética **não tem** curva de 18 m (raios
  mínimos 24 m, 25 m e um grampo de 4 m). A "curva de raio 18 m" de OPEN-02/03 é um **ensaio em pista de
  teste**: arco de raio 18 m com faixa de `WIDTH`, sem paredes, ambiente de ensaio próprio (como o
  `TEST_PAD`), não um segmento da pista sintética. O ensaio de resposta do volante (OPEN-01) roda em
  reta com a **velocidade mantida em 50 km/h** pelo acelerador, e "regime" é o valor estabilizado
  nessa condição (janela curta e estacionária), não um valor que deriva com a desaceleração. O ensaio
  de volta do piloto de teste (OPEN-07) continua na pista sintética.
- 2026-10-22 — **Fim da varredura de início do subesterço (Eduardo Matos), após a parada do D-Spec:**
  no ensaio em que a velocidade sobe no arco de 18 m, **sair da faixa abaixo de 50 km/h reprova**
  (`OFF_ASPHALT`). **Sair da faixa acima de 50 km/h é o fim natural da varredura**: não reprova, desde
  que pelo menos **duas velocidades acima de 50 km/h** tenham sido medidas antes da saída. Assim o
  critério de que o subesterço não diminui tem dados. Se a saída ocorrer antes da segunda medição acima
  de 50 km/h, o ensaio reprova por falta de medida.
