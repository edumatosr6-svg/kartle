# Decisões pendentes

As recomendações abaixo são propostas, não escolhas já aprovadas.
Fechar cada decisão antes da etapa que depende dela.

| ID | Decisão | Proposta ou questão | Antes de |
| --- | --- | --- | --- |
| D01 | Promessa da primeira versão | Divulgar jogo diário solo; demonstrar volante quando disponível | Divulgação |
| D02 | Consumo da tentativa | Consumir ao terminar a contagem regressiva | Máquina de estados |
| D03 | Abandono e recarga | Não devolver tentativa iniciada | Persistência |
| D04 | Reconhecimento | Uma volta opcional; definir comportamento após abandono | Máquina de estados |
| D05 | Treino | Liberar após cinco tentativas, sem resultado oficial | Resultado final |
| D06 | Nenhuma volta válida | Resultado sem tempo e sem medalha | Compartilhamento |
| D07 | Sequência | Exigir ao menos uma volta válida por dia | Estatísticas |
| D08 | Reposicionamento | Invalidar tentativa oficial; liberar no treino | Corrida |
| D09 | Cortes | Definir marcadores, tolerância de saída e progresso permitido | Validação |
| D10 | Pausas e perda de foco | Definir se volta pausada pode ser oficial e entrar no ranking | Cronometragem |
| D11 | Data de lançamento | Definir data e primeiro número de desafio | Calendário |
| D12 | Catálogo esgotado | Repetir, suspender desafio ou outra política explícita | Publicação |
| D13 | Pista defeituosa publicada | Definir substituição e tratamento dos resultados anteriores | Publicação |
| D14 | Relógio incorreto | Definir comunicação no MVP e autoridade online futura | Calendário |
| D15 | Medalhas | Definir fórmula, revisão, limites inclusivos e versões | Resultados |
| D16 | Cores dos setores | Definir referências e faixas de tempo | HUD e compartilhamento |
| D17 | Orientação móvel | Definir paisagem/retrato e recalibração | Interface móvel |
| D18 | Alternativa por toque | Incluir no MVP para quem não usa inclinação | Interface móvel |
| D19 | Replay | Definir frequência, precisão, tolerância, compressão e duração máxima | Fantasma |
| D20 | Catálogo inicial | Manter 60 do original ou aprovar lançamento com menos | Publicação solo |
| D21 | Fantasma no MVP | Mantido conforme original; adiar só com mudança explícita | Publicação solo |
| D22 | Aparelhos e testes | Escolher modelos, navegadores, redes e percentis de desempenho | Otimização |
| D23 | Hospedagem | Escolher domínio, provedores, tráfego previsto e orçamento | Deploy |
| D24 | Ranking anônimo | Identidade local; definir apelidos, duplicação e desempate | API de ranking |
| D25 | Janela de envio | Definir prazo para resultados do dia anterior | API de ranking |
| D26 | Privacidade | Definir logs, dados persistidos, retenção e exclusão | Serviço online |
| D27 | Adivinhação | Definir alvo da distância, fórmula, palpites e revelação | Modo adivinhar |
| D28 | Spoilers | Definir texto compartilhado antes/depois da revelação | Modo adivinhar |
| D29 | Offline | MVP independente da API; offline completo ainda sem escopo | Cache |
| D30 | Autódromos reduzidos | Não incluir automaticamente como substituto de pistas de kart | Expansão do catálogo |

## Próximo passo

Antes de implementar, revisar D02–D10 e D17–D19 para orientar o protótipo e os
contratos básicos. As decisões de serviços posteriores podem ser fechadas
quando suas etapas se aproximarem.
