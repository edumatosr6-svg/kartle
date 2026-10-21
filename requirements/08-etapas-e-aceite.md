# Etapas e critérios de aceite

## 1. Fechar as regras

Entregar decisões sobre tentativas, pausas, cortes, reconhecimento, treino,
calendário, medalhas e critérios de publicação.
Aceite: não existem ambiguidades bloqueantes para o protótipo.

## 2. Protótipo de direção

Criar pista simples, kart, câmera, colisões, grama, teclado e inclinação.
Fazer uma experiência mínima de volante remoto para testar o diferencial.
Não construir ainda o serviço completo de salas.

Aceite: jogador novo entende a direção e completa uma volta; registrar
comportamento em computador e nos celulares de referência.

## 3. Três pistas reais

Implementar RF01–RF06 e testar formatos diferentes no jogo.
Aceite: três pistas passam por revisão visual e por uma corrida completa.
Reestimar esforço do projeto com base nos resultados das etapas 2 e 3.

## 4. Corrida e validação

Implementar RF07–RF12, percurso, setores, largada e estados de corrida.
Aceite: voltas válidas e inválidas são diferenciadas pelas regras aprovadas;
chegada invertida, corte e reposicionamento são verificados.

## 5. Desafio diário

Implementar RF14–RF18, calendário, tentativas, persistência e resultado.
Aceite: fluxo completo funciona, recarga preserva tentativas e virada do dia
mantém corrida em andamento vinculada ao desafio original.

## 6. Fantasma pessoal

Implementar RF19 e contratos de replay.
Aceite: reproduções de referência passam na tolerância aprovada e versões
incompatíveis são tratadas explicitamente.

## 7. Publicação solo

Concluir RF20 e RF22, idiomas, qualidade e catálogo.
Ampliar de três para dez pistas e depois para a meta de lançamento aprovada.
Aceite: cumprir o checklist de qualidade e completar teste com cinco pessoas.

Esta etapa encerra o MVP original. Reduzir catálogo ou adiar fantasma exige
mudança explícita de escopo.

## 8. Volante completo

Implementar RF21, RF23 e RF24: salas, QR code, calibração, reconexão e feedback.
Aceite: pareamento autônomo por cinco testadores, recuperação de desconexão e
latência medida. Definir elegibilidade de pausas antes de ranking.

## 9. Ranking

Implementar RF25–RF28, banco, API, validação e fantasma do líder.
Aceite: replays válidos aceitos, adulterados rejeitados, duplicações tratadas,
ordenação correta e jogo solo funcionando sem a API.

## 10. Adivinhação e acabamento

Implementar RF13, RF29 e RF30.
Aceite: regra de pontuação clara, revelação no momento previsto, compartilhamento
coerente e áudio ativado conforme a interação permitida pelo navegador.

Produzir vídeo de 30 segundos do volante e material de portfólio.

## Estratégia de verificação

Usar testes automatizados para regras críticas: percurso, calendário, tentativas,
cronometragem, replay e validação online.
Usar testes manuais em dispositivos para direção, sensores, pareamento e clareza.
Medir desempenho com cenários e aparelhos definidos, sem confundir uma execução
local bem-sucedida com compatibilidade geral.

## Cronograma

O documento original estima seis fins de semana para todas as fases, sendo três
para o MVP. Essa estimativa não foi validada. Planejar por entregas e reestimar
depois do protótipo e das três pistas reais.
