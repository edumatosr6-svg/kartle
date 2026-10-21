---
title: Glossário — validação de volta de corrida
feature: race-lap-validation
stage: req
status: validated
version: 2.0.0
sources: [SEED, DOMAIN]
---

# Glossário

Os termos valem igualmente em `web-desktop` e `web-mobile`, salvo indicação.

| Termo | Definição | Canal |
|---|---|---|
| Jogador | Quem pilota o kart e recebe a contagem, o tempo, os setores e o estado da volta | ambos |
| Curador do catálogo | Quem fornece e publica o dado de cada pista, incluindo largada, sentido, setores, marcadores e, se quiser, limites de corte próprios | nenhum (dado) |
| Volta | Percurso cronometrado de uma pista, do sinal verde até o encerramento | ambos |
| Contagem regressiva | Sequência exibida antes da largada, com duração de 3 s, que termina no sinal verde (`DOMAIN/DEC-05`) | ambos |
| Sinal verde | Fim da contagem regressiva; instante em que o cronômetro da volta começa (`DOMAIN/DEC-05`) | ambos |
| Linha de largada | Linha declarada no dado da pista onde os karts partem; seu cruzamento não inicia o cronômetro (`DOMAIN/DEC-05`) | ambos |
| Linha de chegada | Linha declarada no dado da pista cujo cruzamento, no sentido da pista, encerra a volta | ambos |
| Sentido da pista | Direção de percurso declarada no dado da pista | ambos |
| Contramão | Passagem por uma linha ou por um marcador no sentido oposto ao sentido da pista | ambos |
| Cronômetro da volta | Tempo da volta em andamento exibido na tela | ambos |
| Tempo total | Tempo da volta, do sinal verde ao instante de cruzamento da chegada, em milissegundos (`DOMAIN/DEC-03`) | ambos |
| Instante de cruzamento | Instante em que o kart cruza a chegada ou um limite de setor, interpolado dentro do passo de simulação em que o cruzamento ocorre (`DOMAIN/DEC-03`) | ambos |
| Formato de exibição do tempo | Minutos, segundos e milissegundos com 3 casas decimais, no formato `m:ss.mmm` (ex.: `1:02.345`) (`DOMAIN/DEC-03`) | ambos |
| Setor | Cada um dos quatro trechos de apresentação da volta, com limites declarados no dado da pista (RF09) | ambos |
| Tempo de setor | Tempo decorrido entre os instantes de cruzamento dos limites de início e de fim de um setor, em milissegundos | ambos |
| Marcador de validação (marcador) | Ponto de passagem obrigatório, em ordem e no sentido da pista, declarado no dado da pista; conjunto distinto dos setores (`requirements/02`). O seed também o chama de checkpoint (RF10) | ambos |
| Volta válida | Volta encerrada ao cruzar a chegada no sentido da pista depois de passar por todos os marcadores em ordem, sem invalidação | ambos |
| Volta inválida | Volta que recebeu um motivo de invalidação; termina no momento da invalidação (`DOMAIN/DEC-06`) e não tem tempo oficial | ambos |
| Motivo | Texto que diz por que a volta é inválida: "marcador pulado", "corte" ou "reposicionamento" | ambos |
| Estado da volta | "válida em andamento" ou "inválida" com o motivo, exibido durante a volta | ambos |
| Borda da pista | Limite da superfície de pista declarado no dado da pista | ambos |
| Saída de pista | Trecho em que o kart está além da borda da pista | ambos |
| Grama | Superfície fora da pista que reduz a velocidade do kart (RF08) | ambos |
| Limites de corte | Distância além da borda da pista e duração contínua acima das quais uma saída de pista é corte: 3 m e 1000 ms por padrão, ou os valores que o dado da pista declarar (`DOMAIN/DEC-01`) | ambos |
| Corte | Saída de pista em que o kart fica além da distância dos limites de corte por mais que a duração dos limites de corte, seguidos; invalida a volta (`DOMAIN/DEC-01`) | ambos |
| Reposicionamento | Ação do Jogador que recoloca o kart na pista | ambos; a entrada difere por canal (teclado em `web-desktop`, toque em `web-mobile`) |
| Pausa | Suspensão da simulação e do cronômetro da volta; acionada pela tecla Esc (`web-desktop`) ou automaticamente pela perda de foco da aba (ambos) e pela perda do sensor de inclinação (`web-mobile`) (`DOMAIN/DEC-08`) | ambos, com entradas por canal |
| Volta oficial | Volta cujo tempo, se válida, é o tempo oficial; quem define que uma volta é oficial é o desafio diário, fora do escopo | ambos |
| Volta de reconhecimento | Volta que nunca produz tempo oficial (`requirements/02`, estados) | ambos |
| Volta de treino | Volta que nunca produz tempo oficial (`requirements/02`, estados); é o único tipo de volta numa pista cujo dado está incompleto (`DOMAIN/DEC-10`) | ambos |
| Dado de pista incompleto | Dado de pista que não declara largada, sentido, quatro setores ou marcadores (`DOMAIN/DEC-10`) | nenhum (dado) |
| Tempo oficial | Tempo total e tempos de setor de uma volta oficial válida | ambos |
| Resultado | Registro produzido pela simulação ao encerrar uma volta: validade, motivo, tempo total, quatro tempos de setor, oficialidade, pista e versão da pista | ambos |
| Queima de largada | Acelerar antes do sinal verde; é ignorada, sem efeito e sem penalidade (`DOMAIN/DEC-04`) | ambos |
| Dado da pista | Dado versionado de cada pista; `trackId` e `trackVersion` a identificam | nenhum (dado) |
| Pista sintética | Pista de teste atual, mantida jogável até as pistas reais da etapa 3 | ambos |
| Passo de simulação (`STEP`) | Passo fixo da simulação; o tempo oficial é função da sequência de passos (I8) | ambos |
| Acerto | Preset de kart e configuração da simulação usados numa volta (I8) | ambos |
| Runtime | Navegador e versão em que a simulação executa | ambos |
| Sensor de inclinação | Sensor do celular que alimenta a direção em `web-mobile`; ausente ou com permissão negada antes da volta, o controle recai para toque (I4); perdido durante a volta, pausa (`DOMAIN/DEC-08`) | `web-mobile` |
