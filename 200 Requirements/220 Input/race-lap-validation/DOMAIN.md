# Domínio — race-lap-validation

Decisões fechadas pelo dono do produto. Prevalecem sobre os pontos em aberto correspondentes do `SEED.md`.

- 2026-10-20 — **OPEN-05 fechado (Eduardo Matos):** a contagem regressiva dura **3 s**. O cronômetro da
  volta começa no **sinal verde**, isto é, no fim da contagem — não no cruzamento da linha de largada.
- 2026-10-20 — **OPEN-06 fechado (Eduardo Matos):** uma volta invalidada **termina imediatamente** no
  momento da invalidação; ela não continua até a chegada.
- 2026-10-20 — **OPEN-01 fechado (Eduardo Matos, D09):** corte = o kart fica a mais de **3 m** além da
  borda da pista por mais de **1000 ms** seguidos. Esses são os valores padrão; o dado de uma pista pode
  declarar os seus próprios. Andar fora da pista abaixo desses limites só reduz a velocidade.
- 2026-10-20 — **OPEN-02 fechado (Eduardo Matos, D08):** reposicionar o kart durante uma volta oficial a
  invalida; no reconhecimento e no treino, reposicionar é livre e sem penalidade.
- 2026-10-20 — **OPEN-03 fechado (Eduardo Matos):** o tempo é medido em milissegundos, com o instante de
  cruzamento da linha (chegada e limites de setor) **interpolado dentro do passo** da simulação; exibição
  com 3 casas decimais (ex.: `1:02.345`).
- 2026-10-20 — **OPEN-04 fechado (Eduardo Matos):** queima de largada é **ignorada** — o kart fica
  parado até o sinal verde e a aceleração antes dele não tem efeito; não há penalidade.
- 2026-10-20 — **OPEN-07 fechado (Eduardo Matos):** a mesma sequência de entradas dá o **mesmo tempo, ao
  ms exibido**, em Chrome, Edge, Firefox e Safari atuais; uma diferença é defeito.
- 2026-10-20 — **OPEN-08 fechado (Eduardo Matos, D10):** pausa (Esc), perda de foco da aba ou perda do
  sensor no celular **suspendem** simulação e cronômetro; ao continuar, a volta segue oficial. Perda de
  foco e perda do sensor pausam automaticamente.
- 2026-10-20 — **OPEN-09 fechado (Eduardo Matos):** navegador em idioma que não é português nem inglês
  recebe as mensagens em **inglês**.
- 2026-10-20 — **OPEN-10 fechado (Eduardo Matos):** pista cujo dado não declara largada, sentido, quatro
  setores ou marcadores é **jogável apenas sem tempo oficial** (treino); nenhuma volta oficial é oferecida
  nela.
- 2026-10-20 — **OPEN-11 fechado (Eduardo Matos):** legibilidade = **WCAG AA**: contraste mínimo 4,5:1;
  texto de estado e motivo com no mínimo 16 px no celular; contagem regressiva com no mínimo 48 px.
- 2026-10-21 — **D23 fechado (Eduardo Matos):** hospedagem em **GitHub Pages**. Produção = Pages deste
  repositório, ambiente `github-pages` com revisor obrigatório (o dono do produto; a aprovação é a
  promoção). Staging = Pages de um repositório irmão `kartle-staging`, alimentado pelo mesmo workflow a
  partir do ramo `staging`.
- 2026-10-21 — **D-DP-04 ratificado (Eduardo Matos):** o crédito OpenStreetMap e o aviso ODbL só são
  exigidos quando uma pista derivada de OSM for publicada. Esta release (pista sintética, 0 dados OSM)
  não exibe crédito.
- 2026-10-21 — **Monitoramento (Eduardo Matos):** vigilância manual conforme o runbook (abrir a URL
  publicada após cada deploy); nenhum monitor externo nesta release (RNF12).
- 2026-10-21 — **Google Fonts (Eduardo Matos):** a página pode continuar carregando DM Sans e Space
  Grotesk de `fonts.googleapis.com` nesta release (divergência aceita; nenhum dado do jogador é enviado,
  só a requisição de carregamento). Embutir as fontes no build é item de backlog.
- 2026-10-21 — **Link da marca (Eduardo Matos):** o `href="/"` da marca, que sai de `/<repo>/` no GitHub
  Pages, é aceito nesta release; a correção (href relativo) vai para o backlog da próxima release.
