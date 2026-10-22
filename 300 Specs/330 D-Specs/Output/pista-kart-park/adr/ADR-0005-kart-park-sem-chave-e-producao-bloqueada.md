---
id: ADR-0005
title: Kart Park sem chave de configuração; produção com a Kart Park bloqueada na promoção até a decisão Esri
feature: pista-kart-park
stage: dspec
status: validated
version: 1.0.0
sources: [RULE-0005, FEAT-0001, FEAT-0006, FEAT-0007, REQ-FEAT-0001-02, REQ-FEAT-0001-04, REQ-FEAT-0006-14, REQ-FEAT-0007-13]
---

# ADR-0005 — Kart Park sem chave de configuração; produção bloqueada na promoção até a decisão Esri

## Contexto

O F-Spec fixa que o jogo sempre abre na Kart Park (REQ-FEAT-0001-02, -04) e que nenhuma configuração existe
para escolher outra pista de abertura (FEAT-0001), desligar a zebra ou a barreira, ou liberar a promoção
(FEAT-0007); o crédito da Esri não tem chave e entra numa entrega nova depois da decisão (FEAT-0006). Ao mesmo
tempo, a Kart Park não pode ir a produção antes da decisão do dono do produto sobre a licença Esri; staging pode
usá-la (REQ-FEAT-0007-13). As diretrizes de projeto pedem uma chave mestra desligada para uma feature nova (I4).

## Decisão

1. Nenhuma chave de configuração, de compilação ou de tempo de execução: o catálogo do treino é fixo e a Kart
   Park é a pista da abertura em todo artefato construído com esta feature.
2. O bloqueio de produção é posto na **promoção**: `scripts/track-pipeline.ts promote` recusa sem a referência
   da decisão registrada em `DOMAIN.md`, e a lista de verificação da etapa de deploy recusa promover a produção
   um artefato que contenha `kart-park` sem a entrada `PRODUCTION` com essa referência.
3. Se a decisão liberar a licença, a entrega que promover acrescenta o crédito da Esri como mudança de código.

## Alternativas consideradas

| Alternativa | Por que não |
|---|---|
| Chave de compilação desligada por padrão (por exemplo, uma variável de ambiente do Vite), ligada só em staging | é uma configuração que escolhe a pista de abertura e que, ligada em produção, "libera a promoção" — as duas coisas que o F-Spec exclui; desligada, o jogo abriria na pista sintética, contra REQ-FEAT-0001-02 |
| Remover a Kart Park do catálogo em produção por detecção de ambiente no cliente | o mesmo, com um ramo de código a mais no cliente e o ambiente decidindo regra de jogo |
| Não bloquear e confiar na revisão humana | a regra viraria lembrança; o registro e a lista de verificação a tornam verificável |

## Consequências

- A "chave mestra" de I4 é substituída por um ponto de aplicação humano e registrado: a promoção.
- Enquanto a decisão não existir, nenhum artefato construído de um commit que contenha esta feature vai a
  produção; uma correção urgente de produção nesse intervalo sai de um ramo anterior ao primeiro commit desta
  feature. É o custo aceito pelo autor ao decidir que a licença bloqueia só a promoção.
- A reversão de produção não muda: o artefato anterior não contém a Kart Park.

## Status

Proposta deste conjunto, a validar.
