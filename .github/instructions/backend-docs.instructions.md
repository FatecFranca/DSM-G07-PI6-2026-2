---
description: Manter documentação do back-end sincronizada com mudanças de código
applyTo: "backend/**/*"
---

# Documentação do back-end

Sempre que alterar código em `backend/`, atualize a documentação na mesma
entrega.

## O que atualizar

- `backend/README.md`: setup, scripts, variáveis de ambiente, módulos e
  endpoints.
- Swagger/OpenAPI (`@ApiTags`, `@ApiOperation`, DTOs): espelhar rotas, params e
  payloads novos ou alterados.
- `docs/` quando a mudança afetar escopo de sprint, entidades ou contratos da
  API.

## Quando é obrigatório

- Novo módulo, rota, DTO, guard ou entidade Prisma.
- Mudança de contrato: path, query, body, status HTTP ou autenticação.
- Novo script npm ou variável em `.env.example`.

## Checklist rápido

1. Código compilando.
2. README do back-end refletindo o comportamento atual.
3. Swagger descrevendo as rotas atuais.
4. Nenhum placeholder desatualizado para funcionalidade já implementada.

Não faça commit de mudança de API sem a documentação correspondente.
