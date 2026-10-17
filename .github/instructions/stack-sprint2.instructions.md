---
description: Regras de implementação e entrega da Sprint 2
applyTo: "backend/**/*,web/**/*,analytics/**/*"
---

# Regras da Sprint 2

## Entregas

- Implementar CRUD para regiões, condições climáticas e safras.
- Proteger rotas privadas com JWT; manter apenas login e cadastro públicos.
- Manter o banco PostgreSQL funcional e populado com dados de teste reproduzíveis.
- Disponibilizar `GET /clusters` com o resultado preliminar da clusterização.
- Integrar parcialmente o front-end à API NestJS, sem duplicar regras de negócio.
- Registrar coleta, tratamento dos dados e a técnica inicial de mineração.
- Documentar configuração inicial de nuvem e evidências da entrega.

## Regras técnicas

- Usar NestJS, Prisma, PostgreSQL, Next.js e Python conforme a arquitetura atual.
- Validar payloads da API com DTOs e retornar erros HTTP explícitos.
- Gerar migration sempre que o schema Prisma for alterado.
- Tratar dados ausentes antes da persistência dos dados consolidados.
- Manter a lógica de negócio e de mineração fora dos componentes do front-end.
- Criar testes para os comportamentos alterados e executar build, lint e testes.
- Usar variáveis de ambiente para configurações; não versionar segredos.

## Clusterização

- O endpoint `GET /clusters` deve exigir JWT.
- Documentar as variáveis, o algoritmo, o valor de `k` e as limitações do resultado.
- Não apresentar resultado preliminar como modelo definitivo de produção.

## Limites da sprint

- Não implementar `GET /predicoes/:regiaoId`; esse endpoint pertence à Sprint 3.
- Não trocar NestJS, Next.js, Prisma ou PostgreSQL sem acordo do grupo.
- Não considerar uma funcionalidade concluída sem teste ou evidência registrada.
- Atualizar `docs/documentacao-sprint2.md` na mesma entrega de qualquer alteração.
