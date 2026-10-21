---
id: REL-0003
title: Rollout — ordem de operações, janela de compatibilidade e o que o pipeline fará quando existir
feature: race-lap-validation
stage: deploy
status: draft
version: 1.0.0
sources: [DM-0001, DES-0007, DES-0011, NFR-0003, NFR-0004, TEST-0009]
---

# REL-0003 — Rollout

## Ordem de operações

A ordem típica do estágio (migração aditiva → backend → web → mobile → parte destrutiva) colapsa aqui num único passo,
e a razão é estrutural: não há backend, não há banco, não há aplicativo nativo e a "migração" viaja dentro do próprio
bundle (`REL-0002`).

| Ordem | Passo | Quem | Desfaz-se por |
|---|---|---|---|
| 1 | guardar o `dist/` publicado hoje como artefato de reversão, nomeado pelo hash do commit que o gerou; **nesta primeira release não existe** — o alvo de reversão é o site não publicado (`runbook.md`, caminho A) | executor do runbook | não se desfaz: é a rede de segurança |
| 2 | publicar o novo `dist/` em **staging** e rodar `smoke.md` | executor do runbook | republicar o artefato de 1 em staging; nesta release, despublicar staging |
| 3 | **pergunta ao dono do produto** — promover? (D-DP-06) | dono do produto | não promover |
| 4 | publicar o mesmo `dist/` em **produção** e purgar o cache do `index.html` | dono do produto | republicar o artefato de 1 em produção e purgar o cache; nesta release, despublicar produção e purgar o cache |
| 5 | `smoke.md`, seção *Verificação em produção*, e vigilância por 24 h (`REL-0005`) | dono do produto | idem 4 |

Não há parte destrutiva adiada para uma release seguinte: nada é removido de nenhum armazenamento.

## Feature flag e quem "liga" a feature

Não há flag (DES-0007, DES-0011; `01-release.md`). A feature fica ativa para 100 % dos jogadores no instante em que o
`index.html` novo é servido. Quem a liga é o dono do produto ao executar o passo 4; o que ele observa está em
`REL-0005` e os limiares que mandam reverter, no `runbook.md`. Não há remoção de flag a agendar.

## Janela de compatibilidade e versão mínima do cliente

| Pergunta | Resposta |
|---|---|
| O que o código antigo precisa continuar funcionando contra | nada: não há servidor, contrato de rede nem dado persistido compartilhado entre as versões (DES-0011) |
| Por quanto tempo as duas versões coexistem | até o navegador do jogador buscar o `index.html` novo; os *assets* têm hash no nome, então uma página antiga em cache continua íntegra com os seus próprios *assets* enquanto o CDN os mantiver |
| Versão mínima do cliente | não há versão de cliente instalada: a página é o cliente. Navegadores de referência: Chrome, Edge, Firefox e Safari nas versões atuais (`test-strategy.md`, roteiro E2E-11), em `web-desktop` e `web-mobile` |
| Atualização forçada | não se aplica; o único mecanismo é o cache (abaixo) |

### Regra de cache que o provedor deve aplicar (nomes de cabeçalho, sem valores do provedor)

| Recurso | Política | Razão |
|---|---|---|
| `index.html` | não armazenar em cache de longa duração (`Cache-Control` curto ou revalidação a cada visita) e purgar a cada publicação | é o ponteiro para a versão em vigor; encurta a janela de coexistência e torna a reversão visível em minutos |
| `assets/*.js`, `assets/*.css` | cache longo e imutável | o nome carrega hash de conteúdo; uma versão nunca muda de conteúdo sob o mesmo nome (I3 aplicado ao artefato) |
| *assets* da versão anterior | manter no CDN pelo menos até a release seguinte ser verificada | uma página antiga em cache e a reversão dependem deles |

## O que o pipeline deve fazer quando o provedor existir (D23) — ponto em aberto 04 das diretivas

Não há CI hoje e este estágio não cria arquivo de workflow nem configuração de provedor antes da decisão. O contrato do
pipeline futuro, para que quem o escrever não tenha de redescobri-lo:

| # | Etapa | Comando ou ação | Saída observável que aprova a etapa |
|---|---|---|---|
| 1 | obter o commit verificado | checkout do hash registrado no relatório de validação de testes | hash do checkout igual ao do relatório |
| 2 | instalar | `npm ci` (Node fixado, `REL-0001`) | saída 0; lockfile inalterado |
| 3 | testar | `npm test` | saída 0; 170 aprovados, 0 reprovados, 0 pulados |
| 4 | construir | `npm run build` | saída 0; `dist/` com `index.html` e `assets/` |
| 5 | medir | `python -I "600 Deploy/Output/race-lap-validation/tools/measure_dist.py" dist` | `within_limit=True` (RNF02: abaixo de 3 145 728 bytes); saída 0. Medido hoje: 593 256 bytes |
| 6 | guardar reversão | arquivar o `dist/` em produção, nomeado pelo hash anterior | arquivo existe e o seu `index.html` aponta para os *assets* servidos hoje |
| 7 | staging | publicar `dist/` no site de staging do provedor | `index.html` servido em staging é byte a byte igual ao local; HTTPS válido |
| 8 | smoke em staging | `smoke.md` | todas as linhas com resultado dentro do limiar |
| 9 | **parar** | abrir a pergunta de promoção ao dono do produto (D-DP-06) | decisão humana registrada |
| 10 | produção | publicar o mesmo `dist/`; purgar o cache do `index.html` | `index.html` em produção aponta para o novo `assets/index-<hash>.js` |
| 11 | verificar | `smoke.md`, *Verificação em produção* | limiares de RNF01, RNF02, RNF06 observados |

Enquanto o pipeline não existe, as etapas 1 a 11 são as do `runbook.md`, executadas à mão.

## Riscos específicos deste rollout e como são observados

| Risco | Como se vê | Resposta |
|---|---|---|
| `index.html` novo servido com *assets* antigos (cache parcial) | tela em branco ou erro de módulo no console; `#track-status` nunca sai de "carregando a pista" | purgar o cache do `index.html` e dos *assets*; se persistir, reverter |
| sensor de inclinação indisponível em `web-mobile` | a página avisa "Inclinação indisponível" quando `window.isSecureContext` é falso (`src/main.ts`) | é sintoma de HTTPS ausente (RNF06): corrigir o certificado, não o código |
| queda de taxa de quadros | E2E-10 abaixo de 60 fps em notebook ou 30 fps em celular (NFR-0003) | reverter; a causa é defeito de aplicação (`FAIL CODE`), não de empacotamento |
