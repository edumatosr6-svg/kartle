---
id: REL-0004
title: Canal web-mobile — a mesma página, sem loja, sem assinatura, sem versão mínima instalada
feature: race-lap-validation
stage: deploy
status: draft
version: 1.0.0
sources: [DES-0007, DES-0011, NFR-0003, NFR-0006, TEST-0003]
---

# REL-0004 — Canal `web-mobile`

## Não há aplicativo nativo

O produto não tem aplicativo nativo e deliberadamente não terá (I10). O canal `web-mobile` é **a mesma página** do
canal `web-desktop`, aberta no navegador do celular, com inclinação ou toque no lugar do teclado. Por isso:

| Item do estágio | Nesta release |
|---|---|
| Build móvel | o mesmo `dist/` (`01-release.md`); nenhum build separado |
| Assinatura | não se aplica; a única assinatura é o certificado HTTPS do domínio (RNF06) |
| Submissão a loja | não se aplica |
| Versão mínima suportada | não há versão instalada: o cliente é sempre a página servida. Navegadores de referência: Chrome, Edge, Firefox e Safari nas versões atuais (`test-strategy.md`) |
| Atualização forçada | não se aplica; a janela de coexistência é a do cache do `index.html` (`REL-0003`) |

## O que é específico do celular e precisa ser observado na release

| Requisito | Onde o código depende disso | Como se observa (`smoke.md`, canal `web-mobile`) |
|---|---|---|
| HTTPS para os sensores (RNF06, I6) | `src/main.ts`: a inclinação só é ativada com `window.isSecureContext` e `DeviceOrientationEvent` presentes; em iOS pede `requestPermission` | a URL publicada abre com cadeado; "Ativar inclinação" pede permissão e passa a dirigir; sem HTTPS a página avisa "Inclinação indisponível" |
| Sensor negado ou perdido (I4) | pausa por `SENSOR_LOST` depois de cerca de 500 ms sem leitura; texto de controle por toque visível quando a permissão é negada (ADR-0005, DES-0007) | roteiro E2E-05 |
| Texto de estado e motivo com 16 px no mínimo e contraste 4,5:1 (NFR-0006) | `src/style.css` (`--lap-state-size`, fichas) | roteiro E2E-07, medido no aparelho |
| 30 fps sustentados numa volta completa em celular intermediário (NFR-0003) | `src/frameClock.ts`: no máximo 12 passos por quadro (teto de 0,1 s), DES-0007 | roteiro E2E-10, no aparelho nomeado; uma execução em desktop não vale (I9) |
| Carregamento até o kart andar abaixo de 10 s em 4G (RNF01) | tamanho do bundle (`01-release.md`: 593 256 bytes; 152 903 gzip) | medida em rede 4G real ou limitada, cache vazio |

## Dispositivos de referência

Os aparelhos e navegadores nomeados para NFR-0003 (notebook e celular intermediário) são os de RNF03 e devem constar do
registro humano `docs/lap-validation-device-log.md`, que ainda não existe (`98-divergences.md`). Esta release não
escolhe aparelhos: é decisão do dono do produto, registrada no log.
