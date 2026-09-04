---
name: mobile-api-contract-review
description: "Revisar compatibilidade entre o app Expo e os controllers NestJS do Cafe PI, encontrando divergencias de endpoint, payload, autenticacao e autorizacao. Use quando pedirem revisar contrato, investigar falha de integracao ou preparar uma sprint."
---

# Revisar contrato mobile/API

## Escopo da revisao

- Comparar tipos e chamadas em `mobile/src/` com controllers, DTOs e services em `backend/src/`.
- Verificar se o JWT e realmente validado no backend, e nao apenas emitido no login.
- Verificar se Produtor e Tecnico recebem somente regioes autorizadas conforme RF06.2.
- Separar endpoints existentes de placeholders de Sprint 2 e Sprint 3.
- Conferir documentacao em `backend/README.md`, Swagger e `mobile/README.md`.

## Resultado

Reportar primeiro divergencias que quebram o fluxo, depois riscos de seguranca e por fim melhorias de documentacao. Para cada achado, indicar arquivo, contrato esperado, comportamento atual e menor correcao recomendada.

## Nao fazer

- Nao inventar campos de resposta para esconder uma divergencia.
- Nao liberar dados de todas as regioes no cliente como substituto de autorizacao no backend.
- Nao alterar o contrato da API sem atualizar consumidores e documentacao.
