# Café PI - API

API RESTful da plataforma de mineração de dados agrícolas e climáticos do café.
O back-end usa NestJS, Prisma e PostgreSQL.

## Requisitos

- Node.js 20 ou superior;
- PostgreSQL 16 ou Docker;
- npm.

## Configuração local

Copie `.env.example` para `.env` ou crie o arquivo com:

```env
DATABASE_URL="postgresql://cafe:cafe@localhost:5432/cafe_pi?schema=public"
JWT_SECRET="use-um-segredo-local-diferente-em-producao"
PORT=3001
```

Suba o banco na raiz do repositório:

```bash
docker compose up -d
```

Instale as dependências e prepare o Prisma:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
```

O seed cria o usuário de desenvolvimento `tecnico@cafe-pi.local` com a senha
`Dev123456!`. Esses dados são apenas para desenvolvimento local.

## Execução

```bash
npm run start:dev
```

A API fica disponível em `http://localhost:3001` e o Swagger em
`http://localhost:3001/api`.

## Endpoints

As rotas, DTOs e exemplos completos estão disponíveis no Swagger. Todas as
rotas abaixo, exceto login e cadastro, exigem `Authorization: Bearer <token>`.

| Método | Rota | Acesso | Finalidade |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Público | Cadastra produtor |
| `POST` | `/auth/login` | Público | Emite JWT |
| `GET` | `/regioes` | Autenticado | Lista regiões e filtra por país |
| `POST` | `/regioes` | ADMIN/TECNICO | Cria região |
| `PATCH` | `/regioes/:id` | ADMIN/TECNICO | Atualiza região |
| `DELETE` | `/regioes/:id` | ADMIN | Remove região |
| `GET` | `/clima/:regiaoId` | Autenticado | Lista condições climáticas |
| `POST` | `/clima` | ADMIN/TECNICO | Cria condição climática |
| `PATCH` | `/clima/:id` | ADMIN/TECNICO | Atualiza condição climática |
| `DELETE` | `/clima/:id` | ADMIN | Remove condição climática |
| `GET` | `/safra/:regiaoId` | Autenticado | Lista rendimentos |
| `POST` | `/safra` | ADMIN/TECNICO | Cria rendimento |
| `PATCH` | `/safra/:id` | ADMIN/TECNICO | Atualiza rendimento |
| `DELETE` | `/safra/:id` | ADMIN | Remove rendimento |
| `GET` | `/clusters` | Autenticado | Retorna cluster preliminar por temperatura |

`GET /clusters` usa K-Means com `k=2` sobre a temperatura média disponível
para cada região. O endpoint de predições permanece reservado para a Sprint 3.

## Scripts

```bash
npm run build          # compila a API
npm run lint           # executa o ESLint
npm run test           # testes unitários
npm run test:e2e       # testes de integração
npm run prisma:seed    # popula dados locais de forma reproduzível
```

Não versionar `.env`, credenciais, tokens ou arquivos de dados sensíveis.
