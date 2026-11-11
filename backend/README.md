# Plataforma agrícola - API

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

Após atualizar o schema, execute `npm run prisma:migrate:deploy` em ambientes
com migrations já criadas e `npm run prisma:generate` para atualizar o cliente
Prisma usado pelo TypeScript/IDE. A entidade `PrevisaoProdutividade` exige a
migration `20261106160000_productivity_predictions`.

O seed cria o usuário de desenvolvimento `tecnico@cafe-pi.local` com a senha
`Dev123456!`. Esses dados são apenas para desenvolvimento local. Também cria
uma série demonstrativa de safras de 2022 a 2025 para café, soja, milho e
cana-de-açúcar, condições climáticas mensais e previsões de produtividade para
2026. A série é destinada à validação da interface e não representa dados
oficiais de produção.

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
| `POST` | `/clima/municipios/:regiaoId/coletar` | ADMIN/TECNICO | Consulta a climatologia da região na NASA POWER |
| `POST` | `/clima` | ADMIN/TECNICO | Cria condição climática |
| `PATCH` | `/clima/:id` | ADMIN/TECNICO | Atualiza condição climática |
| `DELETE` | `/clima/:id` | ADMIN | Remove condição climática |
| `GET` | `/safra/:regiaoId?ano=YYYY` | Autenticado | Lista rendimentos, opcionalmente filtrados por ano |
| `POST` | `/safra` | ADMIN/TECNICO | Cria rendimento |
| `PATCH` | `/safra/:id` | ADMIN/TECNICO | Atualiza rendimento |
| `DELETE` | `/safra/:id` | ADMIN | Remove rendimento |
| `GET` | `/clusters` | Autenticado | Retorna cluster climático preliminar por quatro variáveis |
| `GET` | `/predicoes/:regiaoId?cultura=&versao=&ano=` | Autenticado | Consulta previsões offline de produtividade em t/ha |

`GET /clusters` usa agrupamento preliminar com `k=2` sobre temperatura,
precipitação, umidade e radiação solar. O endpoint de predições permanece
disponível na Sprint 3. Ele consulta somente previsões importadas do pipeline;
não treina nem executa modelos durante a requisição. A resposta informa
cultura, ano previsto, valor, unidade, algoritmo, versões, métricas e aviso de
limitação. Município sem previsão publicada retorna `404`.

Os dados de clima são coletados pela NASA POWER para qualquer município com
coordenadas válidas. Os dados de safra vêm da série
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
npm run data:publish -- arquivo.csv clima [blob-name] [tipo:caminho] # envia Blob e publica evento
npm run pipeline:worker # worker agendado; importa o artefato analítico
```

## Worker do pipeline analítico

O comando `pipeline:worker` executa fora do processo HTTP. Em produção, use o
modo padrão `artifact-only` para importar somente um artefato completo e
validado:

```env
ANALYTICS_PIPELINE_MODE=artifact-only
ANALYTICS_ARTIFACT_PATH=analytics/data/processed/artefato_agricola_v1.json
ANALYTICS_PIPELINE_INTERVAL_MINUTES=1440
ANALYTICS_PIPELINE_RUN_ONCE=false
```

Em desenvolvimento, `ANALYTICS_PIPELINE_MODE=full` também executa as coletas e
os notebooks Python antes da importação. O worker usa
`ANALYTICS_PYTHON_COMMAND` e `ANALYTICS_JUPYTER_COMMAND` quando os executáveis
não estiverem nos nomes padrão.

`ANALYTICS_LOCK_PATH` impede duas execuções simultâneas e
`ANALYTICS_STATUS_PATH` grava `running`, `succeeded`, `failed` ou `skipped`.
Uma nova versão só é publicada pelo importador depois que o JSON completo é
validado; falhas não removem a última versão válida. O worker deve ser
executado por um agendador/processo separado, não dentro do startup da API.

O `tsconfig.json` do back-end inclui somente `src`, que é o diretório de
produção definido por `rootDir`. Os testes e2e em `test/` são compilados pelo
Jest usando `test/jest-e2e.json`, evitando o diagnóstico de arquivos fora do
`rootDir` no editor e no build da API.

O lint usa `tsconfig.eslint.json` para analisar `src`, testes e scripts sem
alterar o `rootDir` de produção.

Não versionar `.env`, credenciais, tokens ou arquivos de dados sensíveis.

`data:import` valida a existência das regiões, atualiza condições climáticas
pela combinação `regiaoId + data` e faz upsert de safras pela chave
`regiaoId + anoColheita`. O terceiro CSV deve conter `regiaoId,uf` e explicitar
o mapeamento estadual usado para associar a publicação agregada da CONAB.

## Azure Blob Storage e Service Bus

O fluxo assíncrono é opcional e fica desabilitado quando
`AZURE_INTEGRATION_ENABLED=false`. O script
`scripts/publish-data-file.ts` envia um CSV tratado para o container privado
`data-treated` e publica um evento `DataFileAvailable` na fila configurada.
Para safra, o parâmetro opcional `tipo:caminho` pode enviar o CSV
`regiao-uf` relacionado.

Em produção, configure `AZURE_STORAGE_ACCOUNT_NAME` e
`AZURE_SERVICE_BUS_NAMESPACE` e conceda à identidade gerenciada os papéis
`Storage Blob Data Contributor`, `Azure Service Bus Data Sender` e
`Azure Service Bus Data Receiver`. Em desenvolvimento local, connection
strings podem ser usadas apenas por variáveis de ambiente não versionadas.

O consumidor NestJS confirma a mensagem somente após o importador idempotente
concluir. Falhas permanecem disponíveis para retry e dead-letter no Service
Bus. O provisionamento inicial está em
`infra/azure/provision.ps1`; ele não publica a API nem exibe segredos.

O consumidor valida `DataFileAvailable v1`, SHA-256 e tamanho do blob antes da
importação. Eventos processados ficam registrados em `Data_File_Event`, de
modo que uma entrega duplicada é confirmada sem repetir a carga. Falhas são
marcadas para observabilidade e lançadas novamente para respeitar retry/DLQ.
O fluxo local pode ser validado com mocks, sem configurar credenciais Azure.


## Adaptação municipal e multiculturas

A migration 20261022090000_agricultural_model adiciona código IBGE/UF, catálogo de culturas, produção por município/cultura/ano, climatologia anual/sazonal e tabelas versionadas de cluster, compatibilidade e métricas. A série diária e rotas antigas continuam disponíveis durante a transição; safras legadas podem permanecer sem cultura.

Antes de aplicar em ambiente compartilhado, revisar e fazer backup. Após gerar o cliente Prisma, aplique com npx prisma migrate deploy e depois npm run prisma:seed. O seed é demonstrativo, não representa a coleta oficial completa.

Rotas novas, todas com JWT:

| Método | Rota | Finalidade |
| --- | --- | --- |
| GET | /regioes?q=&uf=&cultura=&page=&limit= | Busca paginada; PRODUTOR recebe apenas vínculos |
| GET | /regioes/:id | Detalhe municipal com autorização |
| POST | /regioes/:id/usuarios/:userId | Vínculo municipal (ADMIN) |
| GET | /clima/municipios/:id | Climatologia agregada anual e sazonal |
| GET | /culturas | Catálogo |
| GET | /compatibilidades/:id | Ranking de culturas para município |
| GET | /compatibilidades?cultura=&min=&uf=&page=&limit= | Ranking de municípios |
| GET | /clusters/:id | Grupo e perfil versionados |
| GET | /modelos/metricas?cultura=&versao= | Métricas de validação |

GET /regioes retorna { data, total, page, limit, totalPages }. Safras aceitam filtro de cultura e dados de área, produção e rendimento. PRODUTOR só consulta municípios vinculados. CORS usa CORS_ORIGINS, lista separada por vírgula.

### Importar artefato analítico versionado

O pipeline deve gerar JSON validado com código IBGE, cultura, unidades e versão. Comando: npm run data:import:agricultural -- resultados.json

O objeto raiz exige schemaVersion: 1, modelVersion, dataVersion (opcional), cultures (name, slug) e municipalities (code, name, uf, latitude, longitude). Arrays opcionais: harvests (code, crop, year, areaHa, productionT, yieldTPerHa), climate (uma linha por code, avgTemp, minTemp, avgDailyRain, annualRain, humidity, solarRadiation, januaryTemp, julyTemp, julyMinTemp, drySeasonRain, summerRain, thermalAmplitude, rainfallContrast), clusters, clusterProfiles, compatibilities (score de 0 a 1) e metrics. A importação valida referências e faixa geográfica e substitui resultados analíticos da mesma versão em transação, em lotes de 1.000 linhas. Safras são tratadas como snapshot completo para os municípios, culturas e anos incluídos no arquivo; não use um arquivo parcial de atualização. Ela não coleta dados nem executa o pipeline.

O array opcional `predictions` aceita `{ code, crop, year, value, unit, algorithm,
dataVersion, features, metrics, notice }`. `value` é produtividade prevista em
`t/ha`; a previsão só é publicada quando o resultado possui código IBGE
municipal explícito. A regressão atual é exploratória e teve desempenho temporal
fraco, portanto não representa recomendação agronômica.

Os dados municipais/analíticos completos ainda não estão no repositório. O carregamento real depende da exportação e revisão dos artefatos.
