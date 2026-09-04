---
name: mobile-validation
description: "Validar o aplicativo mobile Expo Cafe PI antes de uma entrega, cobrindo typecheck, fluxo de navegacao, responsividade, cache offline e configuracao da API. Use quando pedirem testar, revisar ou preparar uma entrega mobile."
---

# Validar aplicativo mobile

## Checklist tecnico

1. Entrar em `mobile/` e executar `npm install` quando o lockfile ou dependencias tiverem mudado.
2. Executar `npm run typecheck`.
3. Executar `npx expo start` e abrir no Expo Go, emulador ou web quando aplicavel.
4. Validar login, logout, lista de regioes, selecao, detalhe e retorno.
5. Conferir carregamento, erro, lista vazia e modo offline.
6. Testar uma tela estreita e uma tela maior, procurando texto cortado ou sobreposicao.
7. Confirmar que `EXPO_PUBLIC_API_URL` esta documentada e que nenhum segredo foi commitado.

## Evidencia esperada

- Comando executado e resultado do typecheck.
- Plataforma usada para o teste manual.
- Fluxos validados e eventuais bloqueios de backend.
- Estado do cache offline e URL de API utilizada.

## Limites

- Nao declarar que uma integracao e real quando o endpoint ainda usa mock.
- Nao considerar apenas o build como prova de usabilidade.
- Nao alterar dados de producao para testar o app.
