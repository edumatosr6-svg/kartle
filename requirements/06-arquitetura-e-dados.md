# Arquitetura e contratos de dados

## Stack proposta no documento original

| Componente | Tecnologia |
| --- | --- |
| Pipeline | Python, requests, shapely, scipy e matplotlib |
| Cliente | TypeScript, Vite e Three.js |
| Física | Implementação arcade própria, com passo fixo |
| Recursos do navegador | DeviceOrientation, Vibration e Web Share |
| Serviço online | Node.js, Fastify e Socket.IO usando WebSocket |
| Banco | PostgreSQL |
| Publicação | CDN estática; VPS com HTTPS para serviços posteriores |

A stack é uma base de planejamento. Versões, compatibilidade, hospedagem e
custos serão verificados antes de instalar ou contratar serviços.

## Separação de responsabilidades

- Pipeline prepara dados offline.
- Simulação contém movimento, colisões, validação e tempo.
- Renderização transforma estado em imagens.
- Adaptadores de controle produzem entradas normalizadas.
- Aplicação gerencia desafio, tentativas, telas e persistência.
- Serviço de salas transporta comandos do volante.
- API de ranking valida e armazena resultados.

A simulação deve poder executar sem DOM e sem Three.js, inclusive no servidor.
O cliente solo não depende de API para iniciar e concluir partidas.

## Pista

Preservar campos originais: `id`, `name`, `city`, `country`, `lat`, `lon`,
`lengthM`, `widthM`, `direction`, `points`, `startIndex`, `checkpoints`,
`medals` e `source`.

Complementos propostos:

- `schemaVersion` e `trackVersion`.
- Separação entre setores e marcadores de percurso.
- Referências de tempo dos setores.
- Versão de física usada para calibrar medalhas.
- Proveniência que suporte múltiplos elementos OSM quando necessário.

Definir unidades, eixos, fechamento do circuito, sentido dos pontos, índices
válidos e tolerâncias de geometria em um schema antes de gerar arquivos finais.

## Calendário

O original usa lista de IDs indexada por dias desde o lançamento.
Proposta: registros explícitos com data local, número de desafio, ID e versão da
pista. Escolher um formato único antes de implementar.

## Replay

Preservar dados originais: desafio, pista, apelido quando aplicável, tempo total,
setores e entradas compactadas.

Separar:

- Versão do schema de replay.
- Versão da simulação.
- ID e versão da pista.
- Estado inicial e frequência dos passos.
- Entradas por passo e regra de quantização.
- Tempo e setores calculados.

Não usar apenas a versão geral do aplicativo como contrato de compatibilidade.
Definir limite de duração, tamanho e política de descarte dos replays.

## Persistência local

Guardar consumo de tentativa antes de liberar a largada.
Definir esquema versionado e comportamento para dados ausentes, corrompidos,
incompatíveis ou armazenamento indisponível.
Escolher armazenamento de histórico e replays após medir seus tamanhos.

## Determinismo

Passo fixo é requisito, não evidência suficiente de reprodução idêntica.
Executar os mesmos replays em ambientes de referência e comparar tempo,
trajetória e estado final. Definir tolerâncias antes da validação online.

## Aceite

- Contratos possuem validação e exemplos consistentes.
- Simulação executa sem renderizador.
- Alterar controle não altera as regras físicas.
- Dados incompatíveis são identificados com comportamento definido.
- Calendário e replay fixam a versão exata da pista utilizada.
