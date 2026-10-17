---
description: Regras de negócio principais da plataforma Café PI (Grupo 07)
applyTo: "**"
---

# Regras de negócio - Café PI

## Domínio

- Plataforma cruza clima e produtividade do café para inteligência ao produtor.
- Persistência só após tratar dados ausentes em temperatura, precipitação,
  umidade, radiação solar e rendimento (RF01).
- A unificação das bases Kaggle usa região produtora e ano de colheita como
  chaves de join.

## Entidades canônicas

- `Regiao_Produtora`: nome, país, coordenadas.
- `Condicao_Climatica`: região, data, temperatura média, precipitação, umidade
  e radiação solar.
- `Safra_Rendimento`: região, ano de colheita, dias de crescimento e rendimento
  em toneladas por hectare.
- Perfis de usuário: `ADMIN`, `TECNICO` e `PRODUTOR`.

## Acesso

- Produtor: somente regiões às quais está vinculado.
- Técnico: múltiplas regiões sob sua responsabilidade.
- Administrador: acesso irrestrito.

## API

- JWT em todas as rotas, exceto `POST /auth/login` e `POST /auth/register`.
- Web e Mobile consomem a mesma API NestJS; não duplicar regra de negócio no
  front-end.
- `GET /clusters` pertence à Sprint 2.
- `GET /predicoes/:regiaoId` pertence à Sprint 3.

## Stack do PI

Não trocar NestJS, Next.js, Prisma ou PostgreSQL sem acordo do grupo.
