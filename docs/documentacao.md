# Documentação do Projeto Interdisciplinar

## Plataforma de Mineração de Dados Agrícolas e Climáticos do Café

**Instituição:** Faculdade de Tecnologia de Franca "Dr. Thomaz Novelino" (Centro Paula Souza)

**Curso:** Desenvolvimento de Software Multiplataforma (DSM) · **Grupo:** DSM-G07

**Repositório:** github.com/FatecFranca/DSM-G07-PI6-2026-2

| Sprint | Data | Foco |
| --- | --- | --- |
| 1ª Sprint | 04/09/2026 | Escopo, requisitos, modelagem, arquitetura, estrutura inicial e planejamento |
| 2ª Sprint | 09/10/2026 | Versão intermediária com integrações parciais |

Este é o documento único de documentação do projeto. Ele reúne o planejamento
da Sprint 1, a implementação da Sprint 2 e a transição para a Sprint 3,
incluindo o estado atual do back-end, analytics, Web, Mobile, banco de dados,
nuvem, mensageria e limitações conhecidas.

### 1.1.1. Alertas climáticos e mensageria de usuários

O backend agora avalia condições climáticas persistidas e registra alertas de
temperatura alta/baixa, chuva intensa e baixa precipitação. Os limites são
configuráveis por ambiente, sem regra duplicada no Web. Dados observados e
registros futuros (para integração posterior com previsões) usam o mesmo
motor.

As entidades `Alerta_Climatico`, `Preferencia_Notificacao`,
`Dispositivo_Push` e `Notificacao` controlam supressão, opt-in, dispositivos e
histórico. A API autenticada oferece listagem, marcação como lida,
preferências e registro de token. A central Web está em `/notificacoes` e usa
polling de 60 segundos. O push priorizará Expo e o e-mail ficará atrás de um
provedor configurável; nesta entrega esses dois canais são registrados como
pendentes, sem envio externo.

Limitação: a fila/topic dedicado `ClimateAlertCreated` e o dispatcher externo
com retry/DLQ ainda são etapas seguintes. A mensageria `DataFileAvailable`
continua exclusiva para ingestão de arquivos e não é reutilizada para alertas.

---

## 1. Visão geral e evolução do projeto

O projeto é uma solução **multiplataforma** (Web e Mobile) de mineração de dados agrícolas e climáticos. A plataforma cruza dados de clima com dados de produção agrícola para indicar, para cada município, **quais culturas combinam com o seu clima**, com destaque para o café, e entrega os resultados em um dashboard web e em um aplicativo mobile.

### 1.1. O que mudou desde a Sprint 1

Durante a Sprint 2, a parte de dados e de mineração foi refeita, porque as bases planejadas não permitiam responder bem à pergunta do projeto (o *Agriculture Crop Yield* não tem região nem ano, e a previsão de produtividade de café por clima mostrou desempenho fraco).

| | Planejado na Sprint 1 | Situação atual |
| --- | --- | --- |
| Unidade de análise | Região produtora de café | **Município** (1.576 de ES, MG e SP) |
| Culturas | Só café | **Seis culturas**: café, cana-de-açúcar, soja, milho, laranja e feijão |
| Fontes de dados | Coffee Data Set e Agriculture Crop Yield (Kaggle) | **NASA POWER** (clima) e **IBGE, Produção Agrícola Municipal** |
| Clima | Série diária por região | **Climatologia** (média de longo prazo) por município |
| Técnica supervisionada | Regressão (estimar produtividade em t/ha) | **Classificação** ("o município é apto para a cultura?") |
| Técnica não supervisionada | K-Means | K-Means (mantido) |
| Saída para o usuário | Cluster e predição de produtividade | Cluster, **compatibilidade por cultura** e previsão de produtividade versionada |

A passagem completa dos requisitos, do banco e das telas para o novo formato está em `plano-adaptacao-projeto.md`. As partes **já implementadas** (analytics, back-end, web, mobile e banco de testes) seguem o formato anterior em alguns pontos, e isso está indicado em cada seção.

## 2. Checklist de conformidade

### 2.1. Entregas mínimas da Sprint 1

| Entrega | Status | Seção |
| --- | --- | --- |
| Definição do escopo e requisitos (funcionais e não funcionais) | Concluído | 3 |
| Modelagem inicial (casos de uso, arquitetura) | Concluído | 5 e 6 |
| Criação do repositório do grupo no GitHub | Concluído | 7.5 |
| Estrutura inicial do back-end (framework e API) | Concluído | 7.1 |
| Protótipo inicial do front-end | Concluído | 7.2 |
| Banco de dados modelado (conceitual e lógico) | Concluído | 5 |
| Computação em Nuvem II: definição e justificativa dos serviços | Concluído | 8.1 |
| Mineração de dados: definição da base e planejamento das técnicas | Concluído e revisado | 9 |

### 2.2. Entregas mínimas da Sprint 2

| Entrega | Status | Evidência |
| --- | --- | --- |
| Back-end com endpoints básicos da API (CRUD) | Concluído no ambiente local | E-01 |
| Front-end integrado parcialmente ao back-end | Integrado no Web | E-02 |
| Aplicativo mobile consumindo a API | Integrado para consulta | E-03 |
| Banco de dados implementado e populado com dados de teste | Concluído (local e no Azure) | E-04 |
| Commits ativos de todos os integrantes no GitHub | Histórico registrado; conferir no GitHub | E-05 |
| Ambiente em nuvem criado (mesmo que parcialmente) | **Parcial:** banco PostgreSQL no Azure criado e populado; API ainda não publicada | E-06 |
| Documentação da configuração inicial da nuvem | Concluída para o ambiente parcial (seção 8.2) | E-06 |
| Coleta e tratamento dos dados | Concluído (scripts e notebook executados) | E-07 |
| Técnica inicial de mineração de dados | Concluído (K-Means e classificação executados) | E-08 |
| Documentação intermediária com evidências | Este documento | — |

## 3. Escopo e requisitos

### 3.1. Requisitos funcionais

A coluna **Situação** indica o estado atual. A descrição já está na versão atualizada (formato de municípios e culturas); quando o requisito original era diferente, a mudança é citada.

#### RF01 — Ingestão e consolidação de dados

| Requisito | Descrição | Situação |
| --- | --- | --- |
| RF01.1 | Coletar por script Python o clima (NASA POWER) e a produção agrícola por município e cultura (IBGE PAM). *Originalmente: importar os CSV do Coffee Data Set e do Agriculture Crop Yield (Kaggle).* | Feito |
| RF01.2 | Identificar e tratar nulos, duplicados e inconsistências antes da persistência | Feito |
| RF01.3 | Relacionar as bases pelo **código do município (IBGE)**. *Originalmente: por regressão entre duas bases sem chave em comum.* | Feito |
| RF01.4 | Persistir os dados consolidados no banco relacional | Parcial: importadores existem; faltam as tabelas do novo modelo (seção 5.3) |

#### RF02 — Mineração de dados (módulo analítico em Python)

| Requisito | Descrição | Situação |
| --- | --- | --- |
| RF02.1 | Gerar matrizes de correlação entre o clima e a área colhida de cada cultura | Feito |
| RF02.2 | Aplicar K-Means para segmentar os municípios por perfil climático | Feito |
| RF02.3 | Aplicar **classificação supervisionada** (apto ou não apto por cultura). *Originalmente: regressão para estimar a produtividade.* | Feito |
| RF02.4 | Armazenar os resultados de clusterização e de classificação vinculados ao município (com versão do modelo) | Pendente: os resultados estão em arquivos CSV |

#### RF03 — API RESTful (NestJS)

| Requisito | Descrição | Situação |
| --- | --- | --- |
| RF03.1 | `GET /regioes`, com filtro por país | Feito (a ampliar com UF, busca e paginação) |
| RF03.2 | `GET /clima/:regiaoId`, retornando o clima da região | Feito (série diária; a adaptar para a climatologia) |
| RF03.3 | `GET /safra/:regiaoId`, retornando o histórico de rendimento | Feito (a adaptar para cultura, área e produção) |
| RF03.4 | `GET /clusters`, retornando o agrupamento | Parcial: o K-Means é calculado na própria API de forma provisória |
| RF03.5 | Compatibilidade de culturas por município (`GET /compatibilidades/:regiaoId`) e previsão offline de produtividade (`GET /predicoes/:regiaoId`). | Compatibilidade implementada; previsão implementada com resultados importados e aviso de limitação |
| RF03.6 | Documentar os endpoints via OpenAPI/Swagger | Feito |
| RF03.7 | Exigir autenticação JWT, exceto login e cadastro | Feito |

#### RF04 — Interface web (Next.js)

| Requisito | Descrição | Situação |
| --- | --- | --- |
| RF04.1 | Listar as regiões e permitir a seleção individual | Feito (com dados de teste) |
| RF04.2 | Gráficos de temperatura, precipitação e rendimento da região | Parcial: série de temperatura e histórico de safra |
| RF04.3 | Exibir o agrupamento (clusters) com legenda por perfil climático | Parcial: exibe o cluster da região |
| RF04.4 | Exigir login antes de exibir os dados | Feito |
| RF04.5 | Filtrar por período de clima e ano de safra | Feito |

#### RF05 — Aplicativo mobile (React Native / Expo)

| Requisito | Descrição | Situação |
| --- | --- | --- |
| RF05.1 | Login do produtor ou técnico com o mesmo JWT da API | Feito |
| RF05.2 | Exibir clima recente e histórico de rendimento da região | Feito |
| RF05.3 | Exibir o cluster e a compatibilidade de culturas da região | Pendente |
| RF05.4 | Cache local para consulta parcial offline | Pendente |

#### RF06 — Usuários e permissões

| Requisito | Descrição | Situação |
| --- | --- | --- |
| RF06.1 | Cadastro de usuários com perfis Administrador, Técnico e Produtor | Feito (cadastro e login) |
| RF06.2 | Restringir o acesso por perfil: o Produtor vê só as regiões vinculadas; o Técnico, várias; o Administrador, todas | Parcial: a relação usuário-região existe, mas a API ainda **não filtra** pelo vínculo |

### 3.2. Requisitos não funcionais

| Requisito | Descrição | Situação |
| --- | --- | --- |
| RNF01 (Nuvem) | Infraestrutura em nuvem pública | Parcial: banco no Azure; API ainda não publicada |
| RNF02 (Arquitetura) | Conteinerização com Docker | Parcial: Postgres em `docker-compose`; API e Web ainda sem contêiner |
| RNF03 (Segurança) | APIs protegidas por autenticação, sem expor o banco diretamente aos clientes | Feito para a API (JWT). O banco no Azure usa acesso público restrito por IP |
| RNF04 (Multiplataforma) | Mobile em Android e iOS com uma base de código | Feito (Expo) |
| RNF05 (Usabilidade mobile) | Interface leve para conectividade limitada | Parcial: depende do cache (RF05.4) |

## 4. Regras de negócio

1. **Domínio:** a plataforma cruza o **clima do município** com as **culturas cultivadas** (área colhida) para indicar a **compatibilidade de culturas**, com destaque para o café.
2. **Persistência:** os dados só são persistidos depois do pré-processamento (nulos, duplicados, inconsistências e outliers documentados).
3. **Chave de ligação:** o **código do município (IBGE)** liga o clima e as culturas. A série de safra usa município, cultura e ano.
4. **Significado dos resultados:** "apto" quer dizer que o município **já cultiva** a cultura em escala relevante (área média de 500 ha ou mais, de 2015 a 2024). **Não** é uma previsão de produtividade nem uma garantia de que "pode plantar". A interface deve exibir o aviso, a fonte e o ano do dado.
5. **Acesso (RF06):** o Produtor vê só os municípios vinculados; o Técnico vê os municípios sob sua responsabilidade; o Administrador tem acesso irrestrito.
6. **API:** JWT em todas as rotas, exceto `POST /auth/login` e `POST /auth/register`. Web e Mobile usam a **mesma API**, sem duplicar regra de negócio.
7. **Quem calcula os resultados:** o pipeline Python calcula e grava (com a versão do modelo e a data); a API só lê e entrega.
8. **Qualidade do modelo:** sempre reportar matriz de confusão, acurácia, *baseline*, acurácia balanceada, precisão e recall.
9. **Stack:** NestJS, Next.js, Prisma e PostgreSQL. Não trocar sem acordo do grupo.

## 5. Modelagem de dados e banco

O banco é relacional (**PostgreSQL**), modelado com o **Prisma ORM**.

### 5.1. Modelo implementado (Prisma)

| Modelo | Campos principais |
| --- | --- |
| `Usuario` | id, e-mail (único), senha (hash), nome, perfil (`ADMIN`, `TECNICO` ou `PRODUTOR`) |
| `RegiaoProdutora` | id, nome, país, latitude e longitude |
| `CondicaoClimatica` | id, região, data, temperatura média, precipitação, umidade e radiação solar |
| `SafraRendimento` | id, região, ano da colheita, dias de crescimento e rendimento em t/ha (único por região e ano) |
| Relação `Usuario` – `RegiaoProdutora` | N:N, usada pela regra de acesso (RF06.2) |

### 5.2. Modelo conceitual planejado na Sprint 1

A Sprint 1 previa também `Pais`, `Variedade_Cafe`, `Cluster_Climatico`, `Regiao_Cluster` e `Predicao_Produtividade`. O modelo versionado `Previsao_Produtividade` agora cobre a previsão offline; `Pais` e `Variedade_Cafe` deixam de ser necessárias (o país é um campo de texto e as culturas passam a ser uma tabela própria).

### 5.3. Modelo-alvo (formato de municípios e culturas)

```mermaid
erDiagram
    REGIAO_PRODUTORA ||--o{ CLIMA_REGIAO : tem
    REGIAO_PRODUTORA ||--o{ SAFRA_CULTURA : produz
    CULTURA ||--o{ SAFRA_CULTURA : classifica
    REGIAO_PRODUTORA ||--o{ CLUSTER_REGIAO : agrupada_em
    REGIAO_PRODUTORA ||--o{ COMPATIBILIDADE_CULTURA : recebe
    CULTURA ||--o{ COMPATIBILIDADE_CULTURA : avalia
    CULTURA ||--o{ METRICA_MODELO : mede
    USUARIO ||--o{ USUARIO_REGIAO : vincula
    REGIAO_PRODUTORA ||--o{ USUARIO_REGIAO : vinculada_a

    REGIAO_PRODUTORA {
        string id PK
        string nome
        string uf
        int codigo_ibge
        float latitude
        float longitude
    }
    CULTURA {
        string id PK
        string nome
    }
    SAFRA_CULTURA {
        string regiao_id FK
        string cultura_id FK
        int ano_colheita
        float area_colhida_ha
        float producao_t
        float rendimento_t_ha
    }
    CLIMA_REGIAO {
        string regiao_id FK
        float temp_media
        float temp_min
        float chuva_anual
        float umidade
        float radiacao
    }
    CLUSTER_REGIAO {
        string regiao_id FK
        int grupo
        string versao_modelo
    }
    COMPATIBILIDADE_CULTURA {
        string regiao_id FK
        string cultura_id FK
        float compatibilidade
        int ranking
        string versao_modelo
    }
    METRICA_MODELO {
        string cultura_id FK
        string algoritmo
        float acuracia
        float acuracia_balanceada
        string matriz_confusao
        string versao_modelo
    }
    USUARIO {
        string id PK
        string email
        string perfil
    }
    USUARIO_REGIAO {
        string usuario_id FK
        string regiao_id FK
    }
```

Mudanças em relação ao modelo implementado: `RegiaoProdutora` ganha código IBGE e UF; `SafraRendimento` ganha cultura, área e produção; a série diária de clima é substituída pela climatologia; entram `Cultura`, `ClusterRegiao`, `CompatibilidadeCultura` e `MetricaModelo`.

## 6. Arquitetura e diagramas

- **Web:** Next.js (React), integrado à API.
- **Mobile:** React Native com Expo, consumindo os mesmos endpoints da API.
- **Back-end:** NestJS (Node.js), com autenticação JWT e acesso ao banco pelo Prisma.
- **Módulo analítico:** scripts e notebooks em Python (coleta, pré-processamento, K-Means e classificação). Na Sprint 1 previa-se que a API acionasse os scripts; na implementação o pipeline roda **separado** e grava os resultados, e a API apenas os lê.

### 6.1. Arquitetura

```mermaid
flowchart LR
    NASA[NASA POWER] --> PIPE[Pipeline Python<br/>coleta e pré-processamento]
    IBGE[IBGE PAM] --> PIPE
    PIPE --> ML[K-Means e classificação]
    ML --> DB[(PostgreSQL + Prisma)]
    WEB[Web Next.js] -->|JWT / JSON| API[API NestJS]
    MOB[Mobile Expo] -->|JWT / JSON| API
    API --> AUTH[Autenticação]
    API --> DB
```

### 6.2. Casos de uso

```mermaid
flowchart TB
    Produtor((Produtor Rural))
    Tecnico((Técnico de Campo))
    UC1([Consultar o clima do município])
    UC2([Consultar a produção por cultura])
    UC3([Ver o perfil climático e as culturas compatíveis])
    UC4([Autenticar-se no sistema])
    UC5([Executar o pipeline de dados e de mineração])

    Produtor --> UC1
    Produtor --> UC2
    Produtor --> UC3
    Produtor --> UC4
    Tecnico --> UC1
    Tecnico --> UC2
    Tecnico --> UC3
    Tecnico --> UC4
    Tecnico --> UC5
```

## 7. Implementação (Sprint 2)

### 7.1. Back-end (NestJS)

**Módulos:** regiões produtoras, condições climáticas, safras e rendimentos, usuários e autenticação.

| Recurso | Operações | Perfis |
| --- | --- | --- |
| `/regioes` | `GET`, `POST`, `PATCH`, `DELETE` | `GET` para qualquer usuário autenticado; criar e alterar: Administrador e Técnico; excluir: Administrador |
| `/clima/:regiaoId` e `/clima` | `GET` (com `de` e `ate`), `POST`, `PATCH`, `DELETE` | mesmas regras |
| `/safra/:regiaoId` e `/safra` | `GET` (com `ano`), `POST`, `PATCH`, `DELETE` | mesmas regras |
| `/clusters` | `GET` (K-Means provisório calculado na API) | autenticado |
| `/auth/login` e `/auth/register` | `POST` | públicos |

**Autenticação e validação:** JWT em todas as rotas privadas; DTOs validados com `class-validator`; erros de validação e recursos inexistentes retornam status HTTP apropriados. A API não expõe o banco diretamente aos clientes.

**Validação técnica:** `npm run build`, `npm run lint` e quatro testes e2e aprovados.

**Ponto conhecido a corrigir:** o filtro de ano da safra falha com o erro "ano must not be less than 1900, ano must be an integer number", porque o parâmetro de consulta chega como texto e os DTOs não convertem o tipo (falta `@Type(() => Number)`).

**Nota de compilação:** o `backend/tsconfig.json` considera só `backend/src`. Os testes e2e ficam em `backend/test/` com configuração própria do Jest. Os campos obrigatórios do `CreateSafraDto` usam a asserção de atribuição definitiva (`!`), pois o NestJS os preenche em tempo de execução a partir do payload validado.

### 7.2. Front-end web (Next.js)

| Tela ou funcionalidade | Integração | Observação |
| --- | --- | --- |
| Login | Integrado | `POST /auth/login`, sessão JWT |
| Lista de regiões | Integrado | `GET /regioes` |
| Condições climáticas | Integrado | `GET /clima/:regiaoId?de=...&ate=...` |
| Dados de safra | Integrado | `GET /safra/:regiaoId?ano=...` |
| Dashboard | Integrado | Clima, safra e cluster, com filtros, séries visuais e estados de carregamento, vazio e erro |

**Critérios técnicos:** usar os endpoints oficiais da API; não duplicar regra de negócio nos componentes; tratar carregamento, sucesso e erro; estilos com Tailwind CSS; URLs e credenciais por variáveis de ambiente.

**Hidratação:** o dashboard espera a hidratação do cliente antes de ler a sessão do `localStorage` e de redirecionar usuários sem autenticação, evitando diferença entre o HTML do servidor e o do navegador.

**Validação técnica:** `npm run lint` e `npm run build`. O cliente tipado está em `web/src/lib/api.ts` e a sessão em `web/src/lib/session.ts`.

**Carregamento dos gráficos:** os dados de clima, produção, compatibilidade,
métricas e perfil climático são carregados de forma independente. Se uma
consulta falhar, o dashboard mantém os demais resultados disponíveis e exibe o
erro da consulta que falhou, em vez de impedir a renderização de todos os
gráficos por causa de uma única resposta inválida ou indisponível.

O gráfico de sazonalidade climática usa os últimos 12 registros históricos de
temperatura média. Cada barra possui uma área de plotagem com altura definida,
garantindo que a escala percentual seja renderizada corretamente no navegador.

**Automação do módulo de mineração:** o processamento agora pode ser executado
por `backend` com `npm run pipeline:worker`, em processo separado da API. O
modo `artifact-only` (padrão e recomendado para produção) importa somente
`analytics/data/processed/artefato_agricola_v1.json`; o modo `full`, destinado
ao desenvolvimento, executa coleta, notebooks e importação. O intervalo é
configurado por `ANALYTICS_PIPELINE_INTERVAL_MINUTES` e
`ANALYTICS_PIPELINE_RUN_ONCE`; `ANALYTICS_LOCK_PATH` impede concorrência e
`ANALYTICS_STATUS_PATH` registra o resultado. O artefato só é publicado após
validação e importação transacional, mantendo a última versão válida em caso
de falha.

**Novas regiões de plantio:** `ADMIN` e `TECNICO` podem cadastrar e editar
regiões pelo Web. O cadastro exige código IBGE de sete dígitos, UF com duas
letras e coordenadas opcionais; a coleta climática fica disponível pelo botão
`Atualizar clima NASA`, que chama `POST /clima/municipios/:regiaoId/coletar`.
Essa rota consulta a climatologia anual e sazonal da NASA POWER e persiste uma
versão `nasa-power-live`. A região pode ser de qualquer UF, mas a comparação
com culturas continua exploratória e depende de dados climáticos válidos; o
cadastro não cria histórico de produção, compatibilidades ou previsões por si
só. A adaptação do pipeline para reclassificar automaticamente uma região
recém-cadastrada permanece como pendência; até essa etapa, a tela exibe apenas
os resultados analíticos que já tiverem sido importados para a região.

### 7.3. Aplicativo mobile (Expo)

O projeto está em `mobile/`, com TypeScript, `EXPO_PUBLIC_API_URL`, login, consulta de regiões, logout, armazenamento seguro do JWT (`expo-secure-store`) e detalhe de clima e safra por região. Mostra o aviso de que o rendimento é uma referência regional. Pendentes: CRUD para Administrador e Técnico, cluster e compatibilidade de culturas, cache offline e extração dos contratos HTTP para um módulo compartilhado entre Web e Mobile.

### 7.4. Banco de dados e dados de teste

O schema é gerenciado pelo Prisma. A carga local é feita com `npx prisma migrate deploy` e `npm run prisma:seed`. O seed cria **dados de teste** (não reais): 3 regiões, quatro anos de safras para café, soja, milho e cana-de-açúcar, condições climáticas mensais de 2022 a 2025, climatologias, compatibilidades, métricas e previsões demonstrativas para 2026. Também cria 1 usuário técnico de desenvolvimento. Os registros respeitam as relações do schema, e a carga pode ser repetida sem duplicar. O `backend/scripts/import-tratados.ts` importa arquivos tratados de forma idempotente.

### 7.5. Repositório e boas práticas

O desenvolvimento fica no repositório oficial do grupo no GitHub. Boas práticas adotadas: commits que descrevem a alteração, fluxo de branches definido pelo grupo, *pull requests* com objetivo e arquivos alterados, e nenhum token, senha ou `.env` versionado. O histórico do GitHub é a evidência da participação da equipe.

### 7.6. Transição para a Sprint 3: predições e dashboard analítico

O endpoint autenticado `GET /predicoes/:regiaoId?cultura=&versao=&ano=` consulta
previsões offline de produtividade em toneladas por hectare. A rota respeita os
vínculos municipais de `PRODUTOR` e `TECNICO`, enquanto `ADMIN` possui acesso
irrestrito. A resposta informa município, cultura, ano, valor, unidade,
algoritmo, versões do modelo e dos dados, features, métricas e aviso de
limitação. A API não treina nem executa inferência durante a requisição.

O exportador analítico só publica previsões quando o arquivo contém código IBGE
municipal explícito. Resultados agregados por UF não são replicados para todos
os municípios. A regressão atual apresentou desempenho temporal limitado, por
isso o resultado continua exploratório e não constitui recomendação agronômica.

O dashboard Web consulta os resultados publicados e exibe:

- KPIs de temperatura média, chuva anual, compatibilidade e maior rendimento;
- gráficos leves de sazonalidade climática, evolução da produção e previsões;
- comparação de clima, cultura mais compatível e rendimento entre municípios;
- estado de carregamento, vazio, erro, foco de teclado e aviso de proveniência;
- versão dos dados, versão do modelo, período analisado e limitação estatística.

O seed local cria dados demonstrativos reproduzíveis para quatro anos de safra
(2022--2025), registros climáticos mensais, quatro culturas e previsões de 2026
na versão `demo-2026-1`. Esses dados servem para validação da interface e não
representam a coleta oficial.

## 8. Computação em nuvem

### 8.1. Planejamento (Sprint 1)

- **Computação:** Azure, com contêineres para os serviços web (Nest e Next), o motor de mineração (Python) e o back-end consumido pelo mobile.
- **Integração contínua:** pipelines automatizados (por exemplo, GitHub Actions) para o back-end e os builds Android e iOS.
- **Banco de dados:** isolado, com regras de rede estritas, acessado só pelo back-end.

### 8.2. Execução (Sprint 2): ambiente parcial

| Item | Configuração |
| --- | --- |
| Provedor | Microsoft Azure (Azure for Students) |
| Região | Brazil South |
| Serviço | Azure Database for PostgreSQL Flexible Server (camada Burstable, `Standard_B1ms`) |
| Versão | PostgreSQL 16 |
| Forma de implantação | Azure CLI (`az postgres flexible-server create`) |
| Acesso | Público, restrito por regras de firewall aos IPs dos administradores |
| Schema | Modelo agrícola completo (5 migrations aplicadas) |
| Dados | Artefato analítico `cafe-pi-2026-10-v1` importado: 1.576 municípios, 6 culturas, 152.786 safras, 1.576 climas, 1.576 clusters, 9.456 compatibilidades e 6 conjuntos de métricas |
| API | **Publicada** em `https://api-cafe-pi6-g07.azurewebsites.net` (App Service Linux, Node 24 LTS, plano B1); Swagger em `/api` |
| Blob Storage e Service Bus | **Criados e em uso** (`stcafepi6g07`, container `data-treated`; `sb-cafe-pi6-g07`, fila `data-file-available`). A integração está **ativada** na API (`AZURE_INTEGRATION_ENABLED=true`, com identidade gerenciada) e o fluxo foi testado de ponta a ponta (ver 8.3) |
| Variáveis de ambiente | `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`, `SCM_DO_BUILD_DURING_DEPLOYMENT`, `WEBSITES_CONTAINER_START_TIME_LIMIT` e as da integração Azure (`AZURE_INTEGRATION_ENABLED=true`, `AZURE_STORAGE_ACCOUNT_NAME`, `AZURE_STORAGE_CONTAINER_NAME`, `AZURE_SERVICE_BUS_NAMESPACE` e `AZURE_SERVICE_BUS_QUEUE_NAME`, sem connection strings). Valores secretos não registrados |

**Procedimento realizado:** (1) assinatura Azure for Students com o e-mail institucional; (2) login pelo Azure CLI; (3) criação do Resource Group `rg-cafe-pi6`; (4) registro do provedor `Microsoft.DBforPostgreSQL`; (5) criação do servidor `pg-cafe-pi6-g07`; (6) liberação do IP de quem administra no firewall do servidor; (7) aplicação das migrations (`npx prisma migrate deploy`); (8) importação do artefato analítico (`npm run data:import:agricultural -- ..\analytics\data\processed\artefato_agricola_v1.json`), idempotente por versão do modelo; (9) conferência pelo Prisma Studio; (10) criação do plano `plan-cafe-pi6` (B1, Linux) e do app `api-cafe-pi6-g07`; (11) publicação por ZIP com um **pacote pronto** (código compilado, dependências de produção e cliente do Prisma para Linux), com a build no servidor desligada, porque o `npm install` no plano B1 não terminava; (12) criação do Blob Storage e do Service Bus com `infra\azure\provision.ps1`.

No desenvolvimento local, o `docker-compose.yml` publica o PostgreSQL na
porta `5432`, alinhada ao `DATABASE_URL` usado pela API (`localhost:5432`).
É necessário manter o Docker Desktop em execução antes de iniciar o NestJS.

**Limitações e custo:** a regra de acesso (RF06.2) só mostra os municípios vinculados ao usuário, e o cadastro público cria sempre o perfil `PRODUTOR`; por isso foi criado um usuário `ADMIN` (`admin@cafe-pi.local`, senha guardada fora do repositório), que vê todos os municípios. O técnico de demonstração continua sem municípios vinculados e recebe listas vazias. Além dos dados importados, o banco da nuvem mantém os 3 municípios, o usuário técnico e os registros de teste da Sprint 2 (por isso `Regiao_Produtora` mostra 1.579 linhas). O crédito do Azure for Students é de US$ 100, com validade de 12 meses. A camada Burstable é indicada para desenvolvimento e testes.

**Evidências** em `docs/evidencias/`:
- `nuvem-recurso1.png` e `nuvem-recurso2.jpg` (criação do servidor);
- `nuvem-recurso3.png` (tela Rede, com as regras de firewall) e `nuvem-recurso4.png` (visão geral do servidor, status `Ready`);
- `nuvem-servico1.png` e `nuvem-servico2.jpeg` (migrations e seed da Sprint 2);
- `nuvem-servico3.png` (migrations e importação do artefato no Azure) e `nuvem-servico4.png` (Prisma Studio com `Compatibilidade_Cultura`, 9.456 linhas);
- `nuvem-endpoint.txt` (respostas da API publicada, sem segredos) e `nuvem-configuracao.txt` (comandos usados, sem valores secretos).

**Próximos passos:** anexar o print do App Service no portal e trocar a senha do técnico de demonstração. Decisão de projeto em aberto: não há rota na aplicação para promover usuários a `ADMIN`, então o papel só pode ser dado no banco ou no seed.

### 8.3. Mensageria Azure

O fluxo assíncrono usa Azure Blob Storage e Azure Service Bus. O script
`backend/scripts/publish-data-file.ts` envia o arquivo tratado para o container
privado `data-treated` e publica um evento `DataFileAvailable v1` na fila
configurada.

O consumidor usa `peekLock` e confirma a mensagem somente depois de validar o
envelope, o container, `eventId`, `correlationId`, SHA-256, tamanho e tipo do
arquivo, baixar o blob e concluir a importação. A tabela `Data_File_Event`
registra os estados `PROCESSING`, `PROCESSED` e `FAILED`; eventos concluídos
são reconhecidos sem repetir a importação. Falhas são relançadas para retry e
Dead Letter Queue conforme o `max-delivery-count` da fila.

**Situação na nuvem:** o Blob Storage (`stcafepi6g07`, container `data-treated`) e o Service Bus (`sb-cafe-pi6-g07`, fila `data-file-available`, nível Standard, com cobrança fixa) foram criados com `infra/azure/provision.ps1`. O app recebeu uma identidade gerenciada com os papéis `Storage Blob Data Contributor`, `Azure Service Bus Data Sender` e `Azure Service Bus Data Receiver`, e a integração foi ativada (`AZURE_INTEGRATION_ENABLED=true`). **Teste de ponta a ponta:** um CSV de clima de uma linha (Franca, 14/11/2026) foi enviado com `backend/scripts/publish-data-file.ts` ao Blob e à fila; o consumidor dentro da API na nuvem recebeu o evento, registrou-o em `Data_File_Event` com o estado `PROCESSED` e importou a linha em `Condicao_Climatica` (27,5 °C, 3,2 mm, 71% de umidade). Mensagens de diagnóstico com formato inválido, enviadas de propósito, foram rejeitadas e terminaram na dead-letter queue (2 mensagens), como esperado. **Correção necessária no código:** o `azure-service-bus.service.ts` montava o endereço da fila com `https://` na frente, e com isso o envio e o consumo falhavam com a identidade gerenciada. A correção é remover o `https://` (usar `<namespace>.servicebus.windows.net`); ela já está aplicada na API publicada e na cópia local, mas **ainda não foi commitada**. O script `publish-data-file.ts` também tem um erro de tipo (variável possivelmente indefinida, rodando com `ts-node --transpile-only`) e não encerra a conexão com a fila ao terminar. O artefato analítico do ML não passa por esse fluxo: ele entra pelo importador `data:import:agricultural` ou pelo `pipeline:worker`.

O fluxo local pode ser validado com mocks, sem credenciais ou recursos Azure
reais. Permanecem como limitações a ausência de hash e tamanho próprios para
arquivos relacionados e a necessidade de ampliar os testes de concorrência,
renovação de lock e consistência entre registro do evento e importação.

## 9. Mineração de dados

### 9.1. Do planejamento à implementação

A Sprint 1 planejou unir o *Agriculture Crop Yield* e o *Coffee Data Set* (Kaggle), aplicar K-Means e, na etapa seguinte, uma regressão para estimar a produtividade. A implementação mostrou três problemas:

- O *Agriculture Crop Yield* mistura culturas e não tem região nem ano, então a ligação era feita por transferência de modelo. Das 25 regiões de café, 23 tinham chuva anual acima da faixa vista no treino, e as estimativas ficavam quase iguais (6,7 a 6,9 t/ha). O R² de 0,59 valia para o *Crop Yield* e não para o café.
- Com produtividade **real** de café, o clima sozinho explicou pouco: com dados da CONAB por estado, R² de cerca de 0,10 e negativo em anos futuros; com dados do IBGE por município, R² de no máximo 0,14 em anos futuros.
- Os dados do IBGE e da NASA permitiam uma pergunta que os dados sustentam melhor: **a compatibilidade do clima do município com cada cultura**.

Por isso o projeto passou a usar NASA POWER e IBGE (PAM) e a classificação supervisionada.

### 9.2. Bases e coleta

| Base | Conteúdo | Tamanho | Script |
| --- | --- | --- | --- |
| NASA POWER | Climatologia de cada município: temperatura, chuva, umidade e radiação solar | 1.576 municípios (ES, MG e SP) | `coletar_clima_municipios.py` |
| IBGE, PAM | Área colhida, produção e rendimento por município, cultura e ano (2001–2024) | 152.797 linhas, 6 culturas | `coletar_ibge_pam.py` |
| Localização | Latitude e longitude dos municípios (`kelvins/municipios-brasileiros`) | 5.571 municípios, 1.576 usados | (baixada pelo script de clima) |

### 9.3. Pré-processamento

O detalhamento está em `documentacao-preprocessamento.md`. Em resumo:

| Etapa | Resultado |
| --- | --- |
| Seleção de colunas | Municípios de 5.571 para 1.576; colunas da lista de municípios de 9 para 5 |
| Nulos | Clima: 0. PAM: 11 rendimentos vazios, todos em linhas com área e produção iguais a zero |
| Registros sem produção | **11** linhas com área e produção zero removidas (152.797 para 152.786) |
| Duplicados | 0 |
| Inconsistências | 0 violações das regras de domínio |
| Rendimentos implausíveis | **39** marcados como nulos (acima de Q3 + 5 × IQR por cultura): café 27, feijão 9, laranja 2 e soja 1 |
| Outliers do clima | Contados (chuva 8,12%) e **mantidos**, por serem eventos reais |
| Cobertura das séries | 7.011 séries município-cultura entre 2015 e 2024: 5.025 com os 10 anos e 717 com menos de 5 |
| Novas variáveis | `chuva_anual`, `amplitude_termica` e `contraste_chuva` |
| Rótulos | "Apto" = área média de 2015 a 2024 de pelo menos 500 ha, **contando os anos sem registro como área zero** (café 368, cana 550, soja 423, milho 557, laranja 160 e feijão 162) |
| Padronização | `StandardScaler` dentro dos modelos, ajustado só no treino |
| Resultado | Tabela única de 1.576 municípios por 31 colunas |

### 9.4. Técnicas aplicadas e resultados

Notebooks em `analytics/notebooks/`: `00_preprocessamento`, `02_correlacao`, `03_kmeans` e `04_classificacao` (executados) e `01_ingestao` (carga no banco, depende do Postgres).

**Correlação (Spearman).** As correlações do clima com a área colhida são moderadas. A cana tem as maiores (radiação 0,53, umidade −0,51 e temperatura média 0,49). O café tem correlações fracas (até 0,12 em módulo), o que indica dependência da combinação de variáveis.

**K-Means (não supervisionado).** Agrupa os municípios pelo perfil climático, sem usar a cultura. Melhor valor: k = 7, com silhouette de 0,334 (separação moderada). Por exemplo, um dos grupos concentra 55% de municípios com café e outro, 87% com cana.

**Classificação (supervisionada).** Para cada cultura, um modelo responde "apto ou não apto" com o clima e a localização. Foram comparados três algoritmos (regressão logística, Random Forest e Gradient Boosting) com **validação espacial**: os municípios são agrupados em células de 1° e células iguais nunca ficam em treino e teste ao mesmo tempo. O melhor modelo de cada cultura foi escolhido pela acurácia balanceada.

| Cultura | Melhor modelo | Baseline | Acurácia | Acurácia balanceada | AUC |
| --- | --- | --- | --- | --- | --- |
| Cana-de-açúcar | Gradient Boosting | 65,1% | **91,5%** | 90,4% | 0,946 |
| Café | Random Forest | 76,6% | **88,0%** | 81,5% | 0,907 |
| Soja | Random Forest | 73,2% | 80,2% | 78,6% | 0,893 |
| Milho | Gradient Boosting | 64,7% | 73,5% | 69,9% | 0,777 |
| Laranja | Regressão logística | 89,8% | 73,7% | 80,4% | 0,819 |
| Feijão | Regressão logística | 89,7% | 67,1% | 66,4% | 0,693 |

O *baseline* é a acurácia de responder sempre "não apto". Laranja e feijão são raros (cerca de 10% dos municípios), e os modelos foram balanceados para encontrá-los, o que mantém um recall alto e reduz a acurácia. **Matriz de confusão do café:** 1.132 verdadeiros negativos, 76 falsos positivos, 113 falsos negativos e 255 verdadeiros positivos. As matrizes de todas as culturas estão em `data/processed/matrizes_confusao.png`.

**Cultura dominante (multiclasse).** Acurácia de 72% (baseline 36,9%) e acurácia balanceada de 51%. É um problema mais difícil que o sim ou não.

**Recomendação por município.** A compatibilidade de cada cultura é a probabilidade de "apto", calculada fora da amostra, para os 1.576 municípios e as 6 culturas, com ranking (`compatibilidade_culturas.csv`).

### 9.5. Limitações

1. **"Apto" é medido pela área plantada que já existe**, que depende também de mercado, tradição e tamanho do município.
2. O clima da NASA tem cerca de 50 km de resolução e **não enxerga altitude, solo nem relevo**.
3. O modelo de referência foi treinado com ES, MG e SP; o cadastro e a coleta
   climática aceitam outras UFs, mas a análise de uma nova UF depende de
   reprocessamento e validação do pipeline.
4. O limite de 500 ha é uma escolha do grupo (foi testada a sensibilidade a 200 e 1.000 ha).
5. Laranja e feijão têm baixa precisão.
6. Os resultados estão em arquivos; a integração ao banco, à API e às telas ainda não foi feita.

## 10. Pendências e próximos passos

**Prioridade alta**
- Aplicar a regra de acesso por perfil na API (RF06.2) e criar o vínculo entre usuários e municípios.
- Criar as tabelas do novo modelo (seção 5.3) e carregar os resultados do pipeline no banco.
- Substituir o K-Means provisório da API por leitura do resultado do pipeline e criar o endpoint de compatibilidade de culturas.
- Adaptar o dashboard: lista de 1.576 municípios com busca e paginação, aba de culturas compatíveis, perfil climático e tela de qualidade do modelo.
- Corrigir o filtro de ano da safra (conversão de tipo nos DTOs de consulta).

**Prioridade média**
- API publicada no Azure (ver 8.2), testada com o usuário ADMIN, e fila (Blob e Service Bus) ativada e testada. Falta: anexar o print do App Service no portal, trocar a senha do técnico de demonstração e definir como administradores serão criados na aplicação (seed ou rota protegida). Corrigir no repositório o endereço do Service Bus (ver 8.3).
- Mobile: cluster, compatibilidade, cache offline e CRUD para Administrador e Técnico; extrair os contratos HTTP para um módulo compartilhado.
- Decidir se o termo "apto" será trocado por um nome mais claro (por exemplo, "produtor relevante").
- Alinhar com a professora a métrica de aceite (acurácia acima de 90%: hoje só a cana passa).

**Melhorias do modelo**
- Incluir altitude e solo para melhorar a classificação do café.
- Ampliar a cobertura para outros estados e culturas.

O detalhamento completo, por arquivo e por camada, está em `plano-adaptacao-projeto.md`.

## 11. Evidências

O índice de evidências reproduzíveis está em `docs/evidencias/README.md`.

| Código | Evidência | Situação |
| --- | --- | --- |
| E-01 | Back-end (build, lint, e2e e Swagger) | Capturada (`swagger-api.png`) |
| E-02 | Web integrado | Capturada (`dashboard-web.png`) |
| E-03 | Mobile integrado | Pendente (print) |
| E-04 | Banco de dados | Capturada (`nuvem-servico4.png`: Prisma Studio com `Compatibilidade_Cultura`, 9.456 linhas) |
| E-05 | Commits | Conferir o histórico filtrado por autor no GitHub |
| E-06 | Nuvem | Banco no Azure com o modelo agrícola e os dados importados, API publicada no App Service, Blob e Service Bus criados e com o fluxo testado de ponta a ponta (`nuvem-recurso1` a `4`, `nuvem-servico1` a `4`, `nuvem-endpoint.txt` e `nuvem-configuracao.txt`); falta o print do App Service |
| E-07 e E-08 | Coleta, tratamento e mineração | Notebooks executados (saídas em `analytics/data/processed/`) |
| E-09 | Validação técnica | Arquivos em `docs/evidencias/` |

## 12. Referências do projeto

- Pré-processamento: `documentacao-preprocessamento.md`
- Plano de adaptação ao novo formato: `plano-adaptacao-projeto.md`
- Evidências: `evidencias/README.md`
- README do back-end: `../backend/README.md`
- README do módulo analítico: `../analytics/README.md`
- Schema Prisma: `../backend/prisma/schema.prisma`
- Regras de negócio: `../.cursor/rules/regras-negocio.mdc`

**Regra de documentação:** toda alteração no projeto deve atualizar este documento na mesma entrega, mantendo comportamento, comandos, endpoints, pendências e evidências sincronizados. Informações sensíveis, como senhas, tokens e chaves privadas, não devem ser registradas.
