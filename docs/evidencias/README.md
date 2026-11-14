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
| E-04 | Banco de dados | [Schema Prisma](../../backend/prisma/schema.prisma), seed e PostgreSQL local; banco no Azure com os dados importados (`nuvem-servico3.png` e `nuvem-servico4.png`) | Capturada |
| E-05 | Commits da equipe | [Histórico Git](./git-historico.txt) | Reproduzível |
| E-06 | Nuvem | Banco PostgreSQL, API (App Service), Blob e Service Bus no Azure, com o fluxo da fila testado de ponta a ponta (`nuvem-recurso*.png`, `nuvem-servico*.png`, `nuvem-endpoint.txt`, `nuvem-configuracao.txt`) | Parcial (falta o print do App Service) |
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

A base de integração foi implementada, mas esta evidência não pode ser
inventada localmente. O repositório agora contém:

1. [script Azure CLI/PowerShell](../../infra/azure/provision.ps1);
2. [adaptadores Blob e Service Bus](../../backend/src/cloud/);
3. [consumidor de arquivos](../../backend/src/cloud/data-file-consumer.service.ts);
4. comando `npm run data:publish` documentado no README do backend.

**Já feito no Azure:** o servidor PostgreSQL `pg-cafe-pi6-g07` (Brazil South, camada
Burstable) está criado, com as 5 migrations aplicadas e o artefato analítico
importado (1.576 municípios, 152.797 safras e 9.456 compatibilidades). Prints:
`nuvem-recurso1.png`, `nuvem-recurso2.jpg`, `nuvem-recurso3.png` (Rede),
`nuvem-recurso4.png` (visão geral), `nuvem-servico1.png`, `nuvem-servico2.jpeg`,
`nuvem-servico3.png` (migrations e importação) e `nuvem-servico4.png` (Prisma Studio).

**Também feito:** a API foi publicada no App Service (`api-cafe-pi6-g07`, Node 24, plano B1),
e o Blob Storage e o Service Bus foram criados com `infra/azure/provision.ps1`.
As respostas da API publicada e os comandos usados estão em `nuvem-endpoint.txt` e
`nuvem-configuracao.txt` (sem segredos).

**Ainda pendente:** o print do App Service no portal. A integração da fila foi ativada (identidade gerenciada do app com os papéis do Blob e do Service Bus) e testada: o CSV publicado foi processado pelo consumidor na nuvem (evento `PROCESSED` e linha importada em `Condicao_Climatica`). Já existe um usuário ADMIN para a demonstração.

## E-07 e E-08 — Analytics

### Coleta de clima (NASA POWER) e de produção (IBGE PAM)

```powershell
Set-Location analytics
python scripts\coletar_clima_municipios.py
python scripts\coletar_ibge_pam.py
```

### Notebooks e artefato

Executar os notebooks `00`, `02`, `03` e `04` e, depois, o `01_ingestao`, que gera
`data/processed/artefato_agricola_v1.json`. Importação no banco:

```powershell
Set-Location backend
npm run data:import:agricultural -- ..\analytics\data\processed\artefato_agricola_v1.json
```

### Trechos de código

- [coletar_clima_municipios.py](../../analytics/scripts/coletar_clima_municipios.py)
- [coletar_ibge_pam.py](../../analytics/scripts/coletar_ibge_pam.py)
- [Notebook de pré-processamento](../../analytics/notebooks/00_preprocessamento.ipynb)
- [Notebook K-Means](../../analytics/notebooks/03_kmeans.ipynb)
- [Notebook de classificação](../../analytics/notebooks/04_classificacao.ipynb)

Os scripts foram compilados com `py_compile` e executados: o clima da NASA
POWER (2001-2025) foi coletado para as 8 regiões brasileiras de `data/regions.csv`
e a série histórica da CONAB foi convertida para t/ha por UF e ano.

## E-09 — Validação

Os arquivos de validação registram os comandos executados e seus resultados.
Antes da entrega final, anexar também prints correspondentes aos resultados.
