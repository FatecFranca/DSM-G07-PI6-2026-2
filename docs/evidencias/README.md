# Evidências da Sprint 2

Esta pasta reúne evidências reproduzíveis da entrega. Prints de navegador,
Swagger, banco e nuvem devem ser adicionados nesta pasta sem expor JWTs,
senhas, URLs privadas ou outras credenciais.

## Índice de evidências

| Código | Critério | Evidência disponível | Estado |
| --- | --- | --- | --- |
| E-01 | Back-end CRUD | [Controllers e DTOs](../../backend/src/), testes e2e e [print do Swagger](./swagger-api.png) | Reproduzível |
| E-02 | Front-end Web | [Dashboard](../../web/src/app/dashboard/page.tsx), [cliente HTTP](../../web/src/lib/api.ts) e [print do dashboard](./dashboard-web.png) | Reproduzível |
| E-03 | Front-end Mobile | [App Expo](../../mobile/App.tsx) e [cliente HTTP](../../mobile/src/api.ts) | Reproduzível |
| E-04 | Banco de dados | [Schema Prisma](../../backend/prisma/schema.prisma), seed e PostgreSQL local | Reproduzível |
| E-05 | Commits da equipe | [Histórico Git](./git-historico.txt) | Reproduzível |
| E-06 | Nuvem | Provedor, banco e API publicados | Pendente de configuração externa |
| E-07 | Coleta e tratamento | [Scripts de coleta](../../analytics/scripts/) e [README analytics](../../analytics/README.md) | Scripts validados |
| E-08 | Mineração de dados | [Clusters](../../backend/src/clusters/) e notebooks analíticos | Resultado preliminar |
| E-09 | Validação técnica | [Backend](./backend-validacao.txt), [Web](./web-validacao.txt), [Mobile](./mobile-validacao.txt) e [Analytics](./analytics-validacao.txt) | Aprovado |

## E-01 — Back-end

### Como reproduzir

```powershell
Set-Location backend
npm run build
npm run test:e2e
```

Resultado registrado em [backend-validacao.txt](./backend-validacao.txt).

### Trechos de código recomendados

- [RegioesController](../../backend/src/regioes/regioes.controller.ts)
- [ClimaController](../../backend/src/clima/clima.controller.ts)
- [SafraController](../../backend/src/safra/safra.controller.ts)
- [CreateClimaDto](../../backend/src/clima/dto/clima.dto.ts)
- [CreateSafraDto](../../backend/src/safra/dto/safra.dto.ts)
- [app.e2e-spec.ts](../../backend/test/app.e2e-spec.ts)

### Print a capturar

- Swagger em `http://localhost:3001/api` — captura disponível em
  [swagger-api.png](./swagger-api.png);
- uma requisição `POST`, `GET`, `PATCH` ou `DELETE`;
- resposta de sucesso;
- resposta `400` de validação ou `404` de recurso inexistente.

## E-02 — Web integrado

### Como reproduzir

```powershell
Set-Location web
npm run lint
npm run build
npm run dev
```

Abrir `http://localhost:3000/login`, autenticar e acessar o dashboard.

### Trechos de código

- [DashboardPage](../../web/src/app/dashboard/page.tsx): filtros, indicadores,
  série climática, safra e clusters.
- [api](../../web/src/lib/api.ts): chamadas tipadas para `/clima`, `/safra` e
  `/clusters`.
- [session](../../web/src/lib/session.ts): persistência defensiva da sessão.

### Print a capturar

- login concluído e dashboard com dados — captura disponível em
  [dashboard-web.png](./dashboard-web.png);
- região selecionada;
- filtro de período e ano;
- série de temperatura e histórico de safra;
- Network mostrando a chamada à API com o token ocultado.

## E-03 — Mobile integrado

### Como reproduzir

```powershell
Set-Location mobile
npx tsc --noEmit
npm run start
```

### Trechos de código

- [App.tsx](../../mobile/App.tsx): login, lista de regiões e detalhe.
- [api.ts](../../mobile/src/api.ts): contrato HTTP.
- [session.ts](../../mobile/src/session.ts): armazenamento seguro.

### Print a capturar

- login;
- lista de regiões;
- região selecionada com clima e safra;
- estado vazio ou erro, sem dados sensíveis.

## E-04 — Banco de dados

### Como reproduzir

```powershell
docker compose up -d
Set-Location backend
npx prisma migrate deploy
npm run prisma:seed
```

O container `cafe-pi-postgres` deve estar ativo na porta local `5432`.

### Trechos de código

- [schema.prisma](../../backend/prisma/schema.prisma)
- [seed.ts](../../backend/prisma/seed.ts)
- [import-tratados.ts](../../backend/scripts/import-tratados.ts)

### Print a capturar

- tabelas `Regiao_Produtora`, `Condicao_Climatica` e `Safra_Rendimento`
  no Prisma Studio ou cliente PostgreSQL;
- saída do seed;
- segunda execução demonstrando que o importador não duplica registros.

## E-05 — Commits

O histórico reproduzível está em [git-historico.txt](./git-historico.txt).
Para complementar a entrega, capturar no GitHub o histórico filtrado por autor
e confirmar a participação de todos os integrantes.

## E-06 — Nuvem

Esta evidência não pode ser inventada localmente. Ainda é necessário:

1. criar o provedor e o PostgreSQL remoto;
2. publicar a API;
3. configurar variáveis de ambiente sem registrá-las;
4. executar migrations e seed;
5. testar a URL pública;
6. adicionar prints anonimizados nesta pasta.

## E-07 e E-08 — Analytics

### Coleta NASA POWER

```powershell
Set-Location analytics
python scripts\coletar_nasa_power.py `
  --regions data\regions.csv `
  --output data\raw\clima_nasa.csv `
  --start 20010101 `
  --end 20251231
```

### Coleta CONAB

```powershell
python scripts\coletar_conab.py --baixar `
  --output data\raw\safra_conab.csv
```

### Trechos de código

- [coletar_nasa_power.py](../../analytics/scripts/coletar_nasa_power.py)
- [coletar_conab.py](../../analytics/scripts/coletar_conab.py)
- [clusters.service.ts](../../backend/src/clusters/clusters.service.ts)
- [Notebook K-Means](../../analytics/notebooks/03_kmeans.ipynb)

Os scripts foram compilados com `py_compile` e executados: o clima da NASA
POWER (2001-2025) foi coletado para as 8 regiões brasileiras de `data/regions.csv`
e a série histórica da CONAB foi convertida para t/ha por UF e ano.

## E-09 — Validação

Os arquivos de validação registram os comandos executados e seus resultados.
Antes da entrega final, anexar também prints correspondentes aos resultados.
