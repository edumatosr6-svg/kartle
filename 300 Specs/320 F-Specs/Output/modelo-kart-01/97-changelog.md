---
title: Registro de mudanças — modelo Kart 01 e câmera de jogo
feature: modelo-kart-01
stage: fspec
status: draft
version: 1.0.0
sources: []
---

# Registro de mudanças

## 2026-10-22 — rodada 1, Mode A

**O que mudou**

- Conjunto gerado do zero a partir dos requisitos validados de `200 Requirements/230 Output/modelo-kart-01/`
  (US-0001 a US-0005, NFR-0001 a NFR-0007; seed `revision: 1`; validação `req-validation-20261022-1431`,
  SUCCESS), com as decisões do dono do produto que os requisitos já carregam e que o autor repassou a esta
  rodada (`DOMAIN/DEC-00` a `DOMAIN/DEC-05`): fonte do modelo no código do Cowork; no máximo 30 chamadas de
  desenho agrupando por material; física não alinhada nesta feature; retrato com campo de visão horizontal
  de pelo menos 60°; câmera que desce do alto para trás do piloto durante a contagem; kart com sombra.
- Seis funcionalidades (`FEAT-0001` a `FEAT-0006`), três fluxos (`FLOW-0001` a `FLOW-0003`), três contratos
  (`API-0001` a `API-0003`), uma tela (`SCR-0001`) e três regras (`RULE-0001` a `RULE-0003`), mais
  `01-overview.md`, `02-glossary.md` e `98-divergences.md` (sem linhas).
- Todo critério `AC-*` dos requisitos (39) e todo NFR (7) é realizado por ao menos um requisito: US-0001 em
  `FEAT-0001`; US-0002 em `FEAT-0002`; US-0003 em `FEAT-0003`; US-0004, NFR-0001 e NFR-0004 em `FEAT-0004`;
  US-0005 e NFR-0007 em `FEAT-0005`; NFR-0002, NFR-0003, NFR-0005 e NFR-0006 em `FEAT-0006`. Nenhum NFR foi
  adiado para a etapa de design.
- `00-index.md` e `99-traceability.md` não foram escritos: o gate os gera com `lint_artifacts.py --emit`.

**Decisões de forma registradas**

- Não existe API de rede no MVP (diretrizes do estágio). Os contratos de `api/` são contratos em processo
  (estado do kart lido pela apresentação; câmera da cena exibida; saída de `npm test`), com o único papel
  `player` (anônimo), erros como códigos de rejeição e idempotência por leitura pura. Nomes de campo em
  `camelCase` com unidade no sufixo (D-FS-06), no lugar do `snake_case` padrão da habilidade do gerador: a
  diretriz do projeto prevalece.
- Ponto de referência do kart exibido: o critério 05 de US-0002 não diz que ponto do modelo fica na posição
  da simulação; fixado como o ponto que fica, em relação às rodas do modelo, onde a posição da simulação fica
  em relação às rodas de `wheelPositions` (`RULE-0003`). É a leitura que dá exatamente as diferenças que
  US-0005 já calcula (0,03 m na bitola traseira, no máximo 0,01 m ao longo do rumo).
- Modo da câmera com a volta encerrada: `ENDED` é visão geral (`TRACK_OVERVIEW`), não câmera de corrida. O
  critério 10 de US-0003 exige a visão geral antes do início de toda contagem, e `race-lap-validation` leva
  a volta encerrada direto à contagem da volta seguinte; "em corrida" é "enquanto o Jogador pilota", e a
  volta encerrada não aceita mais eventos. O autor pode preferir outra leitura (por exemplo, câmera de
  corrida até uma nova contagem); nesse caso, uma decisão em `DOMAIN.md` muda só `RULE-0002`, `FEAT-0003`,
  `FLOW-0002` e `SCR-0001`.
- Velocidade de rolamento com nome próprio (`rollingSpeedMps`), porque tem sinal; `speedMps` da telemetria
  de dirigibilidade (0 ou maior) não ganha outro significado (I3). Campo de visão em graus (`Deg`), a unidade
  em que os requisitos o dão. Relatório de `npm test` com `checkId` e `checkFailReason`, nomes próprios, para
  não dar outro domínio de valores ao `benchId` e ao `failReason` da saída dos ensaios de dirigibilidade.
- Contagem das chamadas de desenho sem a passagem de sombra, como os requisitos registraram (o custo da
  sombra entra na taxa de quadros).
- Cores do kart e do `chassi` julgadas por presença entre as cores dos materiais (`kartColorHexes`,
  `chassisColorHexes`), porque o critério diz que o kart "usa" o laranja e que o `chassi` "tem" o grafite, sem
  dizer que é a única cor; placa do para-choque e macacão, peças de cor única, julgados por igualdade.

**Itens fechados**: nenhum `ISSUE-<nn>` ou `FB-<nn>` (primeira geração).

**Itens recusados, com motivo**

- Duração e curva da descida, trajetória horizontal da câmera na contagem, enquadramento e campo de visão da
  visão geral, campo de visão vertical em retrato acima dos pisos, razão entre volante e esterço, direção da
  luz e aparência da sombra, tolerância do giro das rodas, cores do capacete e das demais peças, condição de
  câmera para ver o número 01, aparência do fantasma: os requisitos recusaram fixá-los (changelog daquele
  conjunto) e nenhum critério os pede; esta especificação não os decide e os lista em "Lacunas deliberadas"
  de `01-overview.md`.
- Ordem de entrega depois da `dirigibilidade` (que também altera a camada de aplicação) e o lugar do código
  no repositório, decisões do autor repassadas a esta rodada: são decisões de design e de entrega, não
  comportamento; ficam para `300 Specs/330 D-Specs`, que registra a dependência. A
  restrição de não mudar os três arquivos da simulação e os presets está em `FEAT-0006`, citada do seed via
  NFR-0006.
- Interpolação do kart entre passos para suavizar a exibição: não especificada e excluída pelo requisito 07
  de `FEAT-0002`, porque US-0002 diz que a renderização não estima estado.
- Configuração para voltar ao kart provisório ou à câmera alta, ou para escolher câmera, campo de visão ou
  qualidade: nenhuma; os requisitos declaram a mudança segura ligada e sem chave, e uma configuração assim
  seria superfície que nenhum critério pede.
- Texto novo de tela: nenhum; os requisitos dispensaram acessibilidade e idioma como requisito novo, e esta
  feature não acrescenta texto, controle nem elemento de HUD.
- Divergências com o sistema em execução: nenhuma registrada. Esta etapa não lê a raiz de código para
  derivar comportamento (conventions §12); apenas nomes existentes foram consultados para não colidir com
  eles (lista em `98-divergences.md`).
- `SEED.md`, `DOMAIN.md` e `NOTES.md` da pasta do seed, o código do Cowork e a ficha não foram lidos: estão
  fora da lista de entrada desta etapa (conventions §12); as medidas, cores, nomes e decisões usados são os
  que os requisitos trazem.
