# Pistas e calendário

## Requisitos originais

| ID | Requisito | Prioridade |
| --- | --- | --- |
| RF01 | Buscar pistas no OpenStreetMap pela Overpass API com Python | MVP |
| RF02 | Filtrar circuitos fechados entre 400 e 1.500 metros | MVP |
| RF03 | Converter coordenadas para metros, suavizar e reamostrar a cada 2 metros | MVP |
| RF04 | Usar largura do OSM quando disponível; caso contrário, 8 metros | MVP |
| RF05 | Gerar previews para aprovação ou rejeição manual | MVP |
| RF06 | Salvar JSON das pistas aprovadas e calendário | MVP |
| RF14 | Escolher a mesma pista diária para todos pela data | MVP |

## Pipeline

1. Buscar dados e preservar a identificação da origem.
2. Reconstruir circuitos, incluindo segmentos quando houver suporte.
3. Rejeitar traçados abertos, ambíguos ou fora dos limites.
4. Converter latitudes e longitudes para coordenadas locais em metros.
5. Suavizar sem deformar o traçado além da tolerância a definir.
6. Reamostrar e validar a geometria resultante.
7. Definir largura, largada, sentido, setores e marcadores de percurso.
8. Gerar preview e realizar revisão visual.
9. Testar no jogo e calibrar medalhas.
10. Publicar uma versão aprovada do JSON.

O jogo não consulta a Overpass API durante a partida.

## Aprovação

Além do preview, verificar no jogo:

- Circuito completo e dirigível.
- Ausência de sobreposição problemática após aplicar largura e suavização.
- Largada e checkpoints adequados.
- Colisões e margens que não prendem o kart.
- Nome, país, localização e origem consistentes.
- Medalhas atingíveis com a versão de física correspondente.

Manter o motivo da rejeição para evitar revisar repetidamente o mesmo problema.

## Crescimento do catálogo

Começar com três pistas reais de formatos diferentes, ampliar para dez e
depois preparar as 60 previstas para o lançamento original.
Usar autódromos reduzidos exige uma decisão de produto; não é fallback automático.

## Calendário

Trocar o desafio à meia-noite no fuso `America/Sao_Paulo`, conforme a intenção
de meia-noite de Brasília do documento original.

Proposta de contrato: data local → número do desafio → ID e versão da pista.
Cada corrida captura essa associação ao começar.

Não modificar silenciosamente desafios já publicados.
Definir data de lançamento, numeração inicial, fim do catálogo, substituição
de pista defeituosa e comportamento diante de relógio local incorreto.
No MVP estático, a data calculada no cliente não é uma proteção contra fraude.

## Aceite

- Três pistas reais são importadas, revisadas e completadas no jogo.
- A exportação inválida é rejeitada antes de publicação.
- Dispositivos com data correta recebem o mesmo desafio no mesmo instante.
- Casos imediatamente antes e depois da meia-noite de Brasília são verificados.
- O calendário identifica a versão exata de cada pista.
