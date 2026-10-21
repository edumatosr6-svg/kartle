# Qualidade e publicação

## Metas originais e forma de verificação

| ID | Meta | Verificação a preparar |
| --- | --- | --- |
| RNF01 | Kart andando em menos de 10 s numa conexão 4G | Medir primeira visita, cache vazio e registrar tempo de interação separadamente |
| RNF02 | Inicial menor que 3 MB; pista menor que 200 KB | Definir transferência comprimida, escopo dos recursos e medir build |
| RNF03 | 60 fps em notebook e 30 fps em celular intermediário | Escolher aparelhos, resolução, qualidade e cenário de corrida |
| RNF04 | Volante abaixo de 100 ms pela internet e 30 ms na mesma rede | Medir entrada até efeito visível; definir percentil e topologia |
| RNF05 | Chrome, Edge, Firefox e Safari atuais; Android e iOS | Registrar versões testadas e verificar fluxo completo |
| RNF06 | HTTPS | Verificar site, sensores e transporte seguro dos serviços |
| RNF07 | Física determinística com passo fixo | Comparar replays nos ambientes suportados |
| RNF08 | Solo funciona se o servidor cair | Desativar API de salas/ranking e completar desafio solo |
| RNF09 | Crédito OSM visível e menção à ODbL | Revisar atribuição e obrigações aplicáveis antes de publicar |
| RNF10 | Sem cadastro e sem coleta pessoal; apelido no ranking | Especificar dados, logs, retenção e comunicação ao jogador |
| RNF11 | Português e inglês pelo idioma do navegador | Verificar ambos e definir fallback de idioma |
| RNF12 | Hospedagem abaixo de US$ 10/mês no lançamento | Orçar com tráfego e armazenamento estimados e acompanhar uso |

As metas de desempenho são objetivos, não resultados já demonstrados.
Escolher percentis e tolerâncias antes dos testes finais.

## Pontos de atenção

- Estar na mesma rede não garante caminho direto: um relay remoto também
  acrescenta viagem pela internet. Avaliar a topologia para a meta de 30 ms.
- Independência do backend não significa funcionar sem internet após fechar
  o site. Suporte offline completo exige escopo e cache próprios.
- “Sem cadastro” não basta para especificar privacidade. Revisar apelidos,
  identificadores, replays e logs reais do serviço.
- Confirmar atribuição e licença dos dados derivados antes de publicar.

## Usabilidade

- Controles legíveis e botões adequados ao toque.
- Explicação de tentativas antes de consumir a primeira.
- Estado claro de permissão, conexão, invalidação e resultado.
- Cores acompanhadas de texto ou símbolos compreensíveis.
- Cinco testadores completam uma volta móvel sem ajuda.

## Publicação

1. Gerar build estático e validar referências de pistas e calendário.
2. Publicar em ambiente de prévia com HTTPS.
3. Executar o fluxo completo em computador e celular.
4. Verificar transferência, desempenho e persistência.
5. Publicar a versão aprovada com identificação de versão.
6. Manter forma de retornar à versão anterior e pistas compatíveis.

Domínio, provedor, orçamento de tráfego e observabilidade permanecem pendentes.
Não criar contas, contratar hospedagem ou publicar serviços nesta etapa documental.
