# Protocolos de Comunicação

## Protocolo de Entrega

Ao concluir qualquer implementação, apresentar sempre:

1. **Arquivos alterados** (lista)
2. **Resumo objetivo** das mudanças
3. **Testes executados** (ou indicar ausência)
4. **Próximos comandos sugeridos** (sem executar nenhum git)

Versionamento (commit, push, add, merge, rebase) é exclusivo do usuário. Nunca executar sem instrução
explícita.

---

## Protocolo de Escopo

Antes de alterar arquivo não citado na task:
1. Identificar o arquivo e a necessidade
2. Justificar tecnicamente
3. Aguardar aprovação do usuário

Nunca expandir escopo automaticamente.

---

## Protocolo em Caso de Dúvida

Quando houver ambiguidade arquitetural ou risco de regressão: **parar e perguntar**.

---

## Protocolo de Leitura (Contexto Mínimo)

1. Começar por `README.md` e pelo documento de `requirements/` da área
2. Depois, apenas os arquivos diretamente impactados
3. Depois, os testes do fluxo alterado
4. Expandir contexto só com justificativa

---

## Protocolo de Alteração Estrutural

Antes de qualquer refactor, mudança de contrato (`step`, `Input`, formato de pista ou replay) ou de
estado persistido:
- Listar o impacto em determinismo, replays existentes, dados persistidos e testes
- Só iniciar implementação após todas as mitigações definidas e aprovadas

---

## Protocolo da Física

Mudanças de sensação de pilotagem são feitas nos presets de `src/physics.ts`, nunca como exceções no
código de renderização ou de controle. Cada mudança roda `npm run bench:physics` e
`npm run bench:handling`, e registra parâmetros e resultados em `docs/physics.md`.
