# Registro de testes em tela — race-lap-validation

Roteiros `E2E-nn` da estratégia de testes (`300 Specs/330 D-Specs/Output/race-lap-validation/test-strategy.md`)
e linhas `D*`/`M*` de `600 Deploy/Output/race-lap-validation/smoke.md`. Uma entrada por execução registrada;
o que não foi executado fica marcado como tal — ausência de registro nunca vale como aprovação.

## Execução 1 — 2026-10-21, web-desktop, navegador embutido da sessão (Chromium)

| | |
|---|---|
| Build | commit `c41c6c3ddf8ada690a2f2b1581ee87700c837268`, `npm run build`, `dist/` com `index-Cqfgl3da.js` e `index-dgojskay.css` |
| Servidor | `vite preview` em `http://localhost:4173` (HTTP local; HTTPS não se aplica — ver D1) |
| Navegador | Chromium 152 (`Chrome/152.0.7977.167`, painel de navegador do Claude Desktop), Windows 11, janela 1024×768, DPR 1 |
| Idioma do navegador | `pt-BR` |
| Operador | Claude (sessão do pipeline), a pedido de Eduardo Matos |
| Método | teclas reais via o painel (Esc, R) e eventos de teclado sintéticos para **segurar** o acelerador (`keydown` sem `keyup`, como o script de entradas de E2E-11); leituras do DOM (`#lap-countdown`, `#lap-state`, `#lap-paused`, `#timer`, `#speed`, `#lap-result*`, `performance.getEntriesByType('resource')`) |
| **Limitação desta execução** | o painel rodou como página em segundo plano: `requestAnimationFrame` a ~2 quadros/s, simulação a ~1/5 do tempo real. **Toda medida de ritmo (fps, duração de 3 s da contagem, carga em 4G) é inválida aqui** e precisa de execução com a janela em primeiro plano, num aparelho nomeado. As verificações abaixo são as de estado e texto, que não dependem do ritmo. |

### Resultados por roteiro

| Roteiro | Resultado | Evidência |
|---|---|---|
| E2E-01 contagem e largada | **parcial — passa no que foi observado** | Volta de treino iniciada: `#lap-countdown` mostra `3`, depois `2` (amostras E1–E7) e `VERDE` (primeira volta); numeral com `font-size` 61,44 px (≥ 48 px) em branco `rgb(255,255,255)` sobre `rgb(19,36,30)` (contraste ≈ 17:1 ≥ 4,5:1); `#timer` = `0:00.000` durante toda a contagem; acelerador segurado da largada até depois de `2`: `#speed` = 0 (kart parado antes do VERDE). Duração de 3 s **não medida** (ritmo inválido). |
| E2E-02 volta completa e motivos | **parcial** | Volta completa **não executada** (pilotagem por teclado impraticável a 1/5 do tempo real). Executado: saída de pista em linha reta com acelerador segurado → `#lap-state` passa de `válida em andamento` a `inválida · corte` em 0:14.925; a volta **termina no instante do corte** (`#timer` congela em 0:14.925 enquanto `#speed` ainda marca 28 km/h); `#lap-result` aparece com título `inválida · corte`, **sem** tempo total e **sem** setores. Ficha de estado: 16 px, branco sobre `rgb(122,31,18)` (contraste ≈ 10:1). Motivos "marcador pulado" e "reposicionamento (oficial)" **não exercitados** (sem volta completa; sem volta oficial nesta release). |
| E2E-03 Esc pausa e retoma | **passa** | Esc em 0:09.492 → `#lap-paused` = `volta pausada`, botão continuar visível; `#timer` permanece 0:09.492 durante 6 s de relógio (0 ms de avanço); Esc de novo → cronômetro retoma (0:09.792 após 3 s) do mesmo valor. |
| E2E-04 perda de foco | **passa (evento emulado)** | `blur` da janela despachado durante a volta → pausa com `volta pausada`, `#timer` congelado em 0:09.792; `focus` despachado → **continua pausada** 3 s depois (não retoma sozinha); Esc → retoma (0:09.992). Observação: emulado por eventos `blur`/`focus` na página, não por troca real de aba. |
| E2E-05 sensor (celular) | **não se aplica ao desktop** | — |
| E2E-06 pista `INCOMPLETE` / esquema desconhecido | **não executável nesta release** | A interface carrega apenas o arquivo sintético embutido; não há meio de abrir uma pista de fixture pela tela. `#track-status` = `synthetic`; oferta = somente `volta de treino` — a volta oficial depende do desafio diário (DES-0009), não é oferecida nesta release. Leitura `INCOMPLETE`/`UNSUPPORTED_SCHEMA`/`UNREADABLE` provada só em `npm test` (`CHK-TEST-0009-*`). |
| E2E-07 idioma pt / en / outro | **passa (emulado)** | `navigator.language` sobrescrito e `languagechange` despachado: `pt-BR` → botão `volta de treino`, estado `válida em andamento`; `en-US` → `training lap`, `valid, in progress`; `fr-FR` → inglês; de volta a `pt-BR` → português. Elementos ocultos (`#lap-paused`, `#lap-result-title`) só são retraduzidos quando voltam a aparecer (coerente com o aviso ISSUE-03 do validador de código). Troca real nas configurações do navegador **não feita**. |
| E2E-08 rede bloqueada | **passa na forma observável** | `performance.getEntriesByType('resource').length` = 3 antes da volta e 3 depois do resultado: **0 requisições** entre a largada e o resultado. Bloqueio explícito da rede (painel offline) **não aplicado**. |
| E2E-09 escala de cinza | **passa** | Filtro `grayscale(1)` aplicado ao documento: `válida em andamento` e `inválida · corte` legíveis só pelo texto (captura feita durante a execução). |
| E2E-10 fps | **não medido** | rAF a ~2 quadros/s por o painel estar em segundo plano; medir com a janela em primeiro plano no notebook de referência. |
| E2E-11 quatro navegadores | **não executado** | Só Chromium disponível nesta sessão; exige Chrome, Edge, Firefox e Safari com o script `reference.inputs` de TEST-0008. |

### Linhas de `smoke.md` cobertas por esta execução

| Linha | Resultado |
|---|---|
| D1 | não se aplica (servidor local HTTP; HTTPS só na URL publicada) |
| D2, D3 | não medidos (sem URL publicada; tamanho de `dist/` provado por `tools/measure_dist.py`: 593 256 bytes brutos, 152 903 gzip) |
| D4 | `#track-status` = `synthetic`; oferta = `volta de treino` apenas (volta oficial vem com o desafio diário — linha a corrigir no smoke, ISSUE-12) |
| D5 | passa no texto (3, 2, VERDE; 61 px; 0:00.000; kart parado) — duração não medida |
| D6 | não executado (volta completa) |
| D7 | passa (Esc e perda de foco: 0 ms de avanço, retomada só pelo jogador) |
| D8 | parcial: corte → `inválida · corte`, resultado sem tempo; marcador pulado não exercitado; reposição em treino → volta **segue válida** (`R` em 0:10.192, estado inalterado) |
| D9 | passa na forma observável (0 requisições durante a volta) |
| D10 | passa (emulado via `languagechange`) |
| D11 | passa |
| D12, D13 | não executados |
| D14 | ver relatório do validador de deploy (0 ocorrências de OSM/ODbL em `dist/`) |

## Execução 2 — 2026-10-21, web-desktop, site de staging publicado (HTTPS)

| | |
|---|---|
| URL | `https://edumatosr6-svg.github.io/kartle-staging/` — GitHub Pages do repositório `edumatosr6-svg/kartle-staging`, ramo `staging` |
| Build | commit `c1e488b` (código e testes idênticos a `c41c6c3`), construído pelo workflow `pages` (run 39629837192, reexecutado após a correção da política de ramos do ambiente) |
| Navegador | Chromium 152 (painel do Claude Desktop), Windows 11, janela 467×1218, DPR 1, idioma `pt-BR` |
| Operador | Claude (sessão do pipeline), a pedido de Eduardo Matos |
| Limitação | painel em segundo plano (rAF ~2 quadros/s): só verificações de carga, estrutura e texto; nenhuma medida de ritmo |

| Linha | Resultado | Evidência |
|---|---|---|
| D1 HTTPS | **passa** | `location.protocol` = `https:`, `isSecureContext` = true, `nextHopProtocol` = h2, certificado válido (`curl` `ssl_verify_result` 0); nenhum recurso em `http://` (`anyInsecure` = false) |
| D2 carga em 4G | **não medido** | sem limitação de rede disponível no painel; sem limitação: `domContentLoaded` 401 ms, `load` 467 ms (informativo) |
| D3 transferência | **passa** | `transferSize` total 155 257 bytes: HTML 3 150 + JS 148 528 (`index-Cqfgl3da.js`) + CSS 3 579 (`index-dgojskay.css`); limite RNF02 3 145 728 bytes; hashes iguais ao build local de `01-release.md` |
| D4 estado e oferta | **passa** | `#track-status` = `synthetic`; `#lap-offer` = um botão `volta de treino`, nenhuma opção oficial (DES-0009) |
| D14 OSM/ODbL | **passa** | nenhuma ocorrência de `OpenStreetMap`/`ODbL` no texto da página (`dist/` já verificado pelo validador: 0 ocorrências) |
| D5–D13 | **não executados nesta execução** | ver Execução 1 (estado/texto no build local) e pendências abaixo |

**Observações para o dono do produto (não são linhas do smoke):**

1. A página carrega `https://fonts.googleapis.com/css2?family=DM+Sans…&family=Space+Grotesk…` — uma dependência externa pré-existente no `index.html`. Impacto: uma requisição a terceiro no carregamento (privacidade, RNF10) e fonte alternativa do sistema quando offline (RNF08 não é afetado durante a volta: 0 requisições entre largada e resultado, Execução 1). Decisão: manter, ou embutir as fontes no build.
2. O link da marca (`a.brand`, `href="/"`) aponta para a raiz de `edumatosr6-svg.github.io`, fora de `/kartle-staging/` (DIV-DP-12 — item de código).

## Ensaio de reversão R4 — 2026-10-21, staging (`edumatosr6-svg/kartle-staging`)

| Passo | Ação | Observado |
|---|---|---|
| R0 | estado inicial | `https://edumatosr6-svg.github.io/kartle-staging/` → HTTP 200 (16:23:52Z) |
| R1 | despublicar (`DELETE /repos/…/pages`, equivalente a Settings → Pages → Unpublish site) | Chrome do operador: página "There isn't a GitHub Pages site here" (404) ≈ 1 min depois; `curl` com `Cache-Control: no-cache` continuou recebendo **200 por mais de 6 min** (cache de borda, `max-age=600`) — a despublicação **não é imediata para todos os clientes** |
| R2 | republicar: `POST /pages` (`build_type: workflow`), política de ramos do ambiente liberada de novo, "Re-run all jobs" (run 39631099098) | build e deploy verdes; HTTP 200 em 16:31:13Z com `assets/index-Cqfgl3da.js` (mesmo hash) |
| R3 | — | o 404 durante a janela de despublicação é o observável de R1 |

Conclusão: R1/R2 são executáveis e reversíveis; tempo total do ciclo ≈ 7,5 min, dominado pelo cache de
10 min. **Nota para o runbook:** ao despublicar a `POST /pages` recria o ambiente `github-pages` com a
política padrão (só ramo padrão) — liberar a política de novo antes do rerun em staging.

## Tentativa de medições de ritmo — 2026-10-21 (sem resultado)

Três ambientes foram tentados para medir contagem de 3 s, fps e a volta de referência (script de
entradas de TEST-0008 sincronizado ao `#timer`): o painel embutido do Claude Desktop, o Chrome do dono
do produto em primeiro plano e a janela própria da extensão Claude in Chrome. Em todos, `setInterval`
e `MessageChannel` rodaram a toda, mas `requestAnimationFrame` ficou em 1–2 quadros/s (intervalos de
≈1000 ms) com GPU AMD acelerada, 16 núcleos e sem tarefas longas — o Chrome limita a renderização da
aba sob automação. O dono do produto, olhando a sua própria aba, relatou o jogo **fluido** (relato, não
medida). As linhas D2, D5 (duração), D6, D12 e D13 permanecem para execução humana com o contador de
fps do Chrome (F12 → Rendering → Frame Rendering Stats).

### Pendências para uma execução humana

1. Janela em primeiro plano, notebook de referência nomeado: E2E-01 (3 s), E2E-02 (volta completa, marcador pulado), E2E-10 (fps).
2. Chrome, Edge, Firefox e Safari atuais: E2E-11 com `reference.inputs`.
3. Celular intermediário de referência: E2E-01, 02, 04, 05, 07 (16 px), 08, 09, 10 (30 fps) — linhas `M*`.
4. URL publicada com HTTPS (depois de D23/GitHub Pages): D1, D2, D3.
