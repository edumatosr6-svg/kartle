# Física do kart de aluguel 4T

Versão: `rental-4t-v4`. Referência de categoria escolhida pelo usuário:
kart de aluguel com motor de quatro tempos.

A v4 adiciona drift acionado pelo jogador e turbo de saída somente no Arcade.
Consulte [manobras](maneuvers.md). Sem o comando de drift, o acerto assistido v3
e seus critérios de dirigibilidade permanecem como base.

## Arcade assistido — padrão atual

O usuário considerou o primeiro arcade ainda difícil. A versão v3 acrescenta
assistências explícitas de controle; o modo Realista preserva seu comportamento.
Não se trata de copiar a física interna do iRacing. A referência pública consultada
foi a [documentação de controles do iRacing](https://support.iracing.com/support/solutions/articles/31000133335);
as leis de assistência abaixo são próprias do Kartle.

- Esterço máximo diminui com a velocidade; a tecla não aplica o batente
  mecânico em alta velocidade. O limite ainda permite manobras fechadas devagar.
- Entrada progressiva em aproximadamente 0,2 s e retorno em 0,1 s,
  incluindo troca de direção. Inputs analógicos continuam proporcionais.
- Freio distribuído em 40% dianteiro e 60% traseiro, com demanda limitada
  por carga/aderência para reservar força lateral. É assistência de gameplay,
  não reprodução de um sistema mecânico ABS.
- Amortecimento da deriva excessiva e da rotação além da intenção do jogador.
  Ao soltar a direção, a rotação é amortecida sem zerá-la instantaneamente.
- Assistências não consultam traçado, checkpoints nem pontos de direção.
  Frear nas curvas fechadas e escolher a trajetória continuam a cargo do jogador.
- A câmera mostra mais pista à frente.

`npm run bench:handling` executa somente fora do jogo um piloto binário de teste
com decisões a cada 100 ms, acelerador/freio digitais e A/D/soltar. Ele usa o
traçado para gerar entradas, mas **não faz parte da assistência jogável**.
Na versão v3 completou uma volta em 32,02 s sem sair do asfalto, com desvio máximo
de 1,32 m do centro. O mesmo controlador com o acerto anterior não completou
uma volta em 90 s. Isso é uma regressão automatizada de dirigibilidade,
não um teste de facilidade com pessoas.

Os ensaios de understeer/oversteer sem ajuda continuam aplicados ao modo
Realista. No arcade a aceitação passa a exigir menos saturação com tecla
total, frenagem em curva sem a rodada anterior e retorno estável ao soltar.

### Base de potência preservada

A pedido do usuário, o padrão agora é **Arcade assistido — fácil de pilotar**. O seletor no painel
permite voltar a **Realista — aluguel 4T**. Trocar o estilo preserva o peso escolhido,
mas reinicia treino e melhor tempo; tempos de acertos diferentes não são comparados.

Ambos usam o mesmo modelo de massa, inércia, cargas e pneus. O arcade é uma
calibração deliberada de gameplay, não uma nova especificação de kart real:

| Ajuste | Realista | Arcade |
| --- | --- | --- |
| Potência | 6,3 kW | 10 kW |
| Força motriz máxima solicitada | 650 N | 1.000 N |
| Tempo de resposta do acelerador | 0,33 s | 0,20 s |
| Corte por governador | 20 m/s | 23 m/s |
| Atrito nominal no asfalto | 0,95 | 1,10 |
| Velocidade de esterço | 1,35 rad/s | 1,80 rad/s |
| Esterço máximo | 0,40 rad | 0,36 rad |
| Rigidez traseira normalizada | 13 | 14,5 |
| Freio-motor solicitado | 65 N | 40 N |
| Força de freio solicitada | 2.100 N | 1.900 N |
| Coeficiente de arrasto do eixo rígido | 5 | 3,5 |

O menor esterço máximo reduz o excesso de volante dos comandos digitais.
A direção chega ao ângulo solicitado mais rapidamente. A partir da v3, o limite
depende da velocidade e as assistências descritas acima corrigem deriva e guinada.

Comparação simulada em asfalto plano, piloto de 75 kg (`npm run bench:physics`):

| Ensaio | Realista | Arcade |
| --- | --- | --- |
| 0–40 km/h | 4,98 s | 3,21 s |
| Velocidade após 5 s | 40,2 km/h | 54,3 km/h |
| Retomada de 28,8 km/h após 2 s | 41,4 km/h | 48,2 km/h |
| Velocidade estabilizada | 68,4 km/h | 79,4 km/h |

Os parâmetros e ensaios abaixo descrevem a referência **Realista**, preservada
para comparação. Os testes também verificam aceleração e perdas de aderência do arcade.

## O que está implementado

Corpo rígido plano com translação longitudinal/lateral e rotação em torno do eixo
vertical. Velocidade e orientação são independentes: o kart pode continuar
deslocando-se de lado quando a traseira escapa.

Cada pneu possui ponto de contato, carga vertical, ângulo de deriva e orçamento
de aderência próprios. Os contatos amostram asfalto ou grama individualmente.
As forças são somadas no centro de massa; seus braços geram momento de guinada.
No modo Realista não há correção artificial de guinada nem alinhamento da velocidade
ao chassi. No Arcade, aplicam-se as assistências explicitadas acima.

- Massa do kart mais massa ajustável do piloto.
- Momento de inércia `massa × raio de giração²`.
- Transferência longitudinal `massa × aceleração × altura / entre-eixos`.
- Transferência lateral entre os pneus internos e externos.
- Sensibilidade à carga: dobrar carga não dobra exatamente a aderência.
- Direção com tempo de atuação e geometria Ackermann.
- Aderência compartilhada entre esforço longitudinal e lateral.
- Saturação progressiva e redução de atrito no escorregamento.
- Tração e freio no eixo traseiro.
- Resistência ao rolamento, arrasto e freio-motor aproximado.
- Potência limitada e redução progressiva de torque no governador.
- Aproximação do arrasto do eixo traseiro rígido: diferença de velocidades
  nas rodas gera forças longitudinais opostas e resistência à rotação.
- Colisão com limite do circuito remove a componente normal da velocidade,
  com pequena restituição; não redefine a direção do movimento.

A entrada de replay continua em 120 Hz. Cada passo usa quatro subpassos de
480 Hz. A carga usa aceleração filtrada em 60 ms para estabilidade numérica;
isso não representa suspensão. A regularização do ângulo de deriva abaixo
de 2 m/s evita singularidades. Um limiar de repouso abaixo de 0,04 m/s evita
movimento residual numérico.

## Parâmetros e origem

| Parâmetro | Inicial | Origem |
| --- | --- | --- |
| Massa do kart | 153 kg | SODI RT10 com GX270 |
| Potência do motor | 6,3 kW | Honda GX270, potência líquida a 3.600 rpm |
| Massa do piloto | 75 kg; ajustável entre 45 e 120 kg | Configuração de teste |
| Entre-eixos | 1,04 m | Estimativa |
| Bitola | 1,20 m | Estimativa |
| Distribuição estática dianteira | 42% | Estimativa |
| Altura do centro de massa | 0,28 m | Estimativa |
| Raio de giração | 0,48 m | Estimativa |
| Atrito nominal no asfalto | 0,95 | Calibração inicial |
| Atrito nominal na grama | 0,38 | Calibração inicial |
| Esterço nominal máximo | 0,40 rad | Calibração inicial |
| Início da redução por governador | 18,5 m/s | Estimativa da relação de transmissão |
| Corte de força motriz | 20 m/s | Estimativa da relação de transmissão |

Fontes primárias consultadas em 20/10/2026:

- [SODI RT10: especificação de massa](https://www.sodikart.com/en-gb/karts/rental/rt10-42.html).
- [Honda GX270: ficha de potência e torque](https://www.honda-engines-eu.com/files/files/technical-sheet-gx270.pdf).
- [MathWorks: equações de corpo rígido plano e velocidades nos contatos](https://www.mathworks.com/help/vdynblks/ref/vehiclebody3dof.html).

As fontes sustentam os valores identificados e a formulação geral, não
certificam este modelo nem seus parâmetros de pneu.

## Understeer e oversteer

O comportamento resulta das forças. Os rótulos na interface são uma leitura
heurística dos ângulos de deriva, sem modificar a simulação.

- Understeer: demanda dianteira excessiva satura os pneus; aumentar o esterço
  deixa de aumentar proporcionalmente a rotação do kart.
- Oversteer: ao frear em curva, o eixo traseiro perde carga e divide sua
  aderência entre freio e força lateral. A traseira escapa e a guinada aumenta.
- Escorregamento amplo: indicado como derrapagem quando a deriva se torna grande.

Não é garantido que todo acionamento de freio ou acelerador cause derrapagem.
O resultado depende de velocidade, esterço, carga e superfície.
Soltar o freio e aplicar contravolante cedo pode conter a guinada. A correção
tardia não garante recuperação de um kart que já está rodando.

## Ensaios reproduzíveis

Rodar `npm test` e `npm run bench:physics`.
O benchmark usa uma área plana infinita de asfalto, sem paredes.

Resultados iniciais desta calibração:

- Aceleração por 5 s: aproximadamente 42,7 km/h com piloto de 55 kg;
  40,2 km/h com 75 kg; 36,2 km/h com 110 kg.
- Velocidade estabilizada em reta: aproximadamente 68,4 km/h, piloto de 75 kg.
- Frenagem reta a partir de 54 km/h: aproximadamente 27,5 m até parar.
- Esterço excessivo a 57,6 km/h: queda na resposta de guinada e saturação dianteira.
- Frenagem em curva: aumento de deriva traseira e guinada em relação à mesma
  entrada de curva sem frear.

Esses números são resultados simulados, não medições de um RT10 real.
Os testes também verificam conservação da carga vertical, simetria de curvas,
inércia, dissipação passiva, repetibilidade e convergência de subpassos.
Repetibilidade no mesmo runtime não comprova igualdade entre navegadores.

## Limitações e calibração futura

Não é uma réplica idêntica de um kart específico. Ainda não representa:

- Flexão torcional do chassi, caster/jacking e levantamento geométrico da roda interna.
- Rotação dinâmica das rodas, taxa de escorregamento longitudinal e travamento
  mecânico real do eixo; a frenagem usa força solicitada e saturação de atrito.
- Temperatura, pressão, desgaste e curvas medidas dos pneus.
- Torque por RPM, embreagem e relação de transmissão medidos.
- Elevação, zebras físicas, impactos fora do plano e geometria real das barreiras.
- Mudança de posição do centro de massa com altura/postura de cada piloto.

Para calibrar: medir massa por eixo, entre-eixos/bitola, aceleração em reta,
coast-down, frenagem, raio/velocidade em curva constante e resposta transitória.
Comparar telemetria antes de ajustar os coeficientes, evitando inventar
correções de trajetória para parecer real.
