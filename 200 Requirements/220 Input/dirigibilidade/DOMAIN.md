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
