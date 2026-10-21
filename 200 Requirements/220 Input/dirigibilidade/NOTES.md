# Notas — dirigibilidade

Proveniência (a pipeline não lê este arquivo):

- 2026-10-21 — Eduardo Matos testou a build publicada e relatou: o kart "sai de frente nas curvas",
  é "lento para responder ao volante" e dá "pouca sensação de velocidade e de risco". Referência
  escolhida: **Karting Superstars** (arcade-sim). Caminho escolhido: seed no pipeline, não ajuste
  avulso.
- Linha de base numérica tirada de `docs/physics.md` (ensaios dos benches) e dos presets de
  `src/physics.ts` (`ARCADE_KART` sobre `RENTAL_KART`).
- Os limiares `OPEN-01` a `OPEN-07` são propostas do redator (Claude) para dar aos loops algo
  decidível; o dono do produto fecha ou corrige em `DOMAIN.md`.
