# Física — referência definida em 20/10/2026

O usuário pediu peso, understeer e oversteer com fidelidade a um kart real,
e escolheu **kart de aluguel 4 tempos** como referência.
Esta decisão substitui a abordagem inicial de mudar diretamente a orientação
do kart com o comando de direção.

Após experimentar o modelo, o usuário pediu uma versão um pouco mais arcade,
mantendo o comportamento de peso e aderência de que gostou. O acerto arcade
passa a ser o padrão: aceleração e retomada mais fortes, resposta de direção
mais ágil, preservando a dinâmica dos pneus. O realista permanece selecionável
para comparação. A troca de acerto reinicia treino e melhor tempo.

Em novo teste, o usuário ainda considerou a pilotagem difícil e pediu a sensação
de controle de um jogo de corrida acessível. Autorizou-se uma mudança de controle
no arcade: esterço limitado por velocidade, entrada/retorno progressivos,
frenagem equilibrada e estabilização de deriva/guinada. As restrições anteriores
contra correção de trajetória aplicam-se agora apenas ao Realista.
Nenhuma assistência pode consultar a linha da pista para dirigir pelo jogador.

## Critérios funcionais desta etapa

- Velocidade lateral independente da orientação do chassi.
- Massa conjunta de kart e piloto influenciando aceleração e inércia.
- Cargas diferentes nos quatro pneus durante aceleração, frenagem e curvas.
- Limite compartilhado de aderência longitudinal e lateral.
- Perda de frente quando a demanda dianteira ultrapassa o limite.
- Tendência de perda da traseira durante frenagem em curva.
- Contravolante modifica forças e rotação, sem corrigir a trajetória diretamente.
- Física independente da renderização, com parâmetros documentados.
- Telemetria para avaliar deriva, cargas e acelerações.

## Fidelidade

“Idêntica” é uma intenção de fidelidade, não um resultado comprovado.
Sem especificação completa e medições do kart de referência, a aceitação
desta etapa é um modelo físico ajustável com comportamentos verificados.
Validação contra dados reais permanece necessária.

Implementação, fontes, ensaios e limitações:
[docs/physics.md](../docs/physics.md).
