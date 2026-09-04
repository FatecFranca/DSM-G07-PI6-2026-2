---
name: mobile-api-integration
description: "Integrar o app Expo Cafe PI a um endpoint NestJS com tipos, autenticacao JWT, tratamento de erros e fallback de cache. Use quando pedirem consumo de API, login real, sincronizacao de regioes, clima ou safra."
---

# Integrar API no mobile

## Antes de codar

- Conferir o controller, DTO e service correspondentes em `backend/src/`.
- Confirmar path, verbo, query, parametros, formato de resposta e necessidade de JWT.
- Verificar se a rota e real ou ainda placeholder de uma sprint futura.

## Implementacao

1. Criar tipos de request/response em `mobile/src/types.ts`.
2. Centralizar a URL em `EXPO_PUBLIC_API_URL`.
3. Criar um cliente HTTP pequeno que injete o token quando existir.
4. Mapear erros de rede, timeout e respostas nao-2xx para estados consumiveis pela UI.
5. Salvar apenas o ultimo snapshot necessario no AsyncStorage.
6. Em caso de falha, exibir o cache com indicacao de desatualizacao; se nao houver cache, exibir erro acionavel.
7. Manter mocks atras de uma interface equivalente ao servico real.

## Validacao

- Testar com backend local e com a URL configurada para dispositivo fisico.
- Testar token ausente, token expirado, resposta vazia e API indisponivel.
- Rodar `npm run typecheck` e registrar qualquer pre-requisito de backend no README do mobile.
