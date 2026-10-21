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
| `GET` | `/clima/:regiaoId?de=YYYY-MM-DD&ate=YYYY-MM-DD` | Autenticado | Lista condições climáticas, opcionalmente filtradas por período |
| `POST` | `/clima` | ADMIN/TECNICO | Cria condição climática |
| `PATCH` | `/clima/:id` | ADMIN/TECNICO | Atualiza condição climática |
| `DELETE` | `/clima/:id` | ADMIN | Remove condição climática |
| `GET` | `/safra/:regiaoId?ano=YYYY` | Autenticado | Lista rendimentos, opcionalmente filtrados por ano |
| `POST` | `/safra` | ADMIN/TECNICO | Cria rendimento |
| `PATCH` | `/safra/:id` | ADMIN/TECNICO | Atualiza rendimento |
| `DELETE` | `/safra/:id` | ADMIN | Remove rendimento |
| `GET` | `/clusters` | Autenticado | Retorna cluster climático preliminar por quatro variáveis |

`GET /clusters` usa agrupamento preliminar com `k=2` sobre temperatura,
precipitação, umidade e radiação solar. O endpoint de predições permanece
reservado para a Sprint 3.

Os dados de clima são coletados pela NASA POWER. Os dados de safra vêm da série
histórica oficial de café da CONAB, convertendo produtividade de sacas/ha para
toneladas/ha (1 saca = 60 kg). O rendimento da CONAB é agregado por
UF e deve ser apresentado como referência regional, não como medição individual.

## Scripts

```bash
npm run build          # compila a API
npm run lint           # executa o ESLint
npm run test           # testes unitários
npm run test:e2e       # testes de integração
npm run prisma:seed    # popula dados locais de forma reproduzível
npm run data:import -- clima.csv safra.csv regiao-uf.csv # importa CSVs tratados
```

O `tsconfig.json` do back-end inclui somente `src`, que é o diretório de
produção definido por `rootDir`. Os testes e2e em `test/` são compilados pelo
Jest usando `test/jest-e2e.json`, evitando o diagnóstico de arquivos fora do
`rootDir` no editor e no build da API.

Não versionar `.env`, credenciais, tokens ou arquivos de dados sensíveis.

`data:import` valida a existência das regiões, atualiza condições climáticas
pela combinação `regiaoId + data` e faz upsert de safras pela chave
`regiaoId + anoColheita`. O terceiro CSV deve conter `regiaoId,uf` e explicitar
o mapeamento estadual usado para associar a publicação agregada da CONAB.
