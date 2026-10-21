# Documentação da 2ª Sprint - Projeto Interdisciplinar (6º Semestre)

## Plataforma de Mineração de Dados Agrícolas e Climáticos do Café

**Instituição:** Faculdade de Tecnologia de Franca - "Dr. Thomaz Novelino" (Centro Paula Souza)

**Curso:** Desenvolvimento de Software Multiplataforma (DSM)

**Data de referência:** 2ª Sprint

---

## Checklist de Conformidade com as Entregas da Sprint 2

Esta documentação registra as entregas intermediárias previstas para a segunda
sprint e relaciona cada item às evidências que devem ser anexadas ao relatório.
Os campos de evidência devem ser preenchidos com os prints, links ou trechos de
código correspondentes antes da entrega.

O índice de evidências reproduzíveis está em
[`docs/evidencias/README.md`](./evidencias/README.md). Os arquivos de validação
registram comandos e resultados reais; prints de Swagger, telas, banco e nuvem
devem ser anexados sem expor credenciais.

Já foram capturadas duas evidências visuais locais:
[`swagger-api.png`](./evidencias/swagger-api.png) e
[`dashboard-web.png`](./evidencias/dashboard-web.png). Permanecem pendentes
os prints do Mobile, banco, coleta real, ambiente em nuvem e histórico do
GitHub.

O [README principal](../README.md) consolida os comandos de execução, endpoints,
arquitetura, critérios de prints, trechos de código recomendados e modelo para
registrar cada evidência. Este documento permanece como o registro detalhado
do estado da Sprint 2.

| Entrega prevista | Status | Evidência |
| --- | --- | --- |
| Back-end com endpoints básicos da API implementados (CRUD) | Concluído no ambiente local | [E-01](./evidencias/README.md#e-01--back-end) |
| Front-end parcialmente integrado ao back-end | Integrado no Web | [E-02](./evidencias/README.md#e-02--web-integrado) |
| Aplicativo mobile consumindo a API | Integrado para consulta | [E-03](./evidencias/README.md#e-03--mobile-integrado) |
| Banco de dados implementado e populado com dados de teste | Concluído no ambiente local | [E-04](./evidencias/README.md#e-04--banco-de-dados) |
| Commits ativos de todos os integrantes no GitHub | Histórico local registrado; confirmação no GitHub pendente | [E-05](./evidencias/README.md#e-05--commits) |
| Ambiente em nuvem criado, mesmo que parcialmente | Pendente de configuração externa | [E-06](./evidencias/README.md#e-06--nuvem) |
| Documentação da configuração inicial da nuvem | Pendente de configuração externa | [E-06](./evidencias/README.md#e-06--nuvem) |
| Coleta e tratamento dos dados | Scripts validados; coleta real pendente | [E-07](./evidencias/README.md#e-07-e-e-08--analytics) |
| Aplicação de técnica inicial de mineração de dados | Implementado preliminarmente | [E-08](./evidencias/README.md#e-07-e-e-08--analytics) |
| Documentação intermediária atualizada com evidências | Atualizada | Este documento |

### Nota de compilação do back-end

O `backend/tsconfig.json` considera somente `backend/src`, que corresponde ao
`rootDir` e ao código de produção. Os testes e2e permanecem em
`backend/test/` e usam a configuração específica do Jest em
`backend/test/jest-e2e.json`. Essa separação elimina o diagnóstico do
TypeScript sobre `app.e2e-spec.ts` estar fora do `rootDir`.

Os campos obrigatórios do `CreateSafraDto` usam a asserção de atribuição
definitiva (`!`). O NestJS preenche esses campos a partir do payload validado
em tempo de execução; a anotação informa essa garantia ao TypeScript sem
alterar a validação do `class-validator`.

---

## 1. Back-end e Endpoints CRUD

O back-end da plataforma é desenvolvido com **NestJS**, utilizando o **Prisma
ORM** para acesso ao banco de dados PostgreSQL. Nesta sprint, o objetivo é
disponibilizar os endpoints básicos para cadastro, consulta, alteração e
remoção dos principais dados da plataforma.

### 1.1. Módulos contemplados

- **Regiões produtoras:** cadastro e consulta das regiões utilizadas nas
  análises.
- **Condições climáticas:** registro e consulta das medições climáticas
  associadas a uma região.
- **Safras e rendimentos:** cadastro e consulta dos dados de produtividade.
- **Usuários e autenticação:** suporte aos usuários necessários para consumir
  os recursos protegidos da API.

### 1.2. Contratos previstos da API

| Recurso | Operações |
| --- | --- |
| `/regioes` | `GET`, `POST`, `PATCH`, `DELETE` |
| `/clima` | `GET`, `POST`, `PATCH`, `DELETE` |
| `/safra` | `GET`, `POST`, `PATCH`, `DELETE` |
| `/auth` | Login e cadastro de usuários |

Os caminhos e payloads efetivamente implementados devem ser conferidos no
Swagger da aplicação. Rotas que ainda não fizerem parte da entrega devem ser
marcadas como pendentes, sem serem apresentadas como concluídas.

### 1.3. Autenticação e validação

- As rotas privadas devem exigir autenticação JWT.
- As rotas públicas devem ficar limitadas ao login e ao cadastro, conforme as
  regras de negócio do projeto.
- Os DTOs devem validar os dados recebidos pela API.
- Erros de validação e recursos inexistentes devem retornar status HTTP
  apropriados e mensagens claras.
- A API não deve expor o banco de dados diretamente aos clientes.

### 1.4. Evidências

Inserir nesta seção:

- print do Swagger com os endpoints disponíveis;
- exemplo de uma requisição CRUD executada com sucesso;
- exemplo de resposta de validação ou erro;
- trecho de código do controller, service ou DTO alterado na sprint.

**Evidências da equipe:**

> Implementação validada com `npm run build`, `npm run lint` e quatro testes
> e2e aprovados. Os endpoints protegidos usam JWT; o usuário e os dados locais
> são criados pelo seed do back-end.

---

## 2. Integração Parcial do Front-end

O front-end web é desenvolvido com **Next.js** e deve consumir a API NestJS
por meio de requisições HTTP. A integração desta sprint é parcial: as telas
que já possuírem dados reais devem ser identificadas, assim como as telas que
ainda utilizam dados estáticos ou aguardam integração.

### 2.1. Funcionalidades integradas

| Tela ou funcionalidade | Integração | Observação |
| --- | --- | --- |
| Login | Integrado | `POST /auth/login`, sessão JWT no Web |
| Lista de regiões | Integrado | `GET /regioes` |
| Condições climáticas | Integrado | `GET /clima/:regiaoId?de=YYYY-MM-DD&ate=YYYY-MM-DD` |
| Dados de safra | Integrado | `GET /safra/:regiaoId?ano=YYYY` |
| Dashboard | Integrado | Clima, safra e clusters com filtros, séries visuais e estados de carregamento, vazio e erro |

### 2.2. Critérios técnicos

- O front-end deve utilizar os endpoints oficiais da API.
- Regras de negócio não devem ser duplicadas nos componentes da interface.
- Estados de carregamento, sucesso e erro devem ser tratados nas telas
  integradas.
- O Web utiliza Tailwind CSS para os estilos das telas integradas.
- URLs e credenciais de acesso devem ser configuradas por variáveis de
  ambiente, sem valores sensíveis versionados.
- A aplicação web e o aplicativo mobile, quando aplicável, devem consumir a
  mesma API NestJS.

### 2.3. Evidências

Inserir nesta seção:

- print da tela integrada com dados reais;
- print da aba Network ou registro equivalente demonstrando a chamada à API;
- trecho do componente ou serviço responsável pela integração;
- lista das telas ainda pendentes de integração.

**Evidências da equipe:**

> O cliente tipado está em `web/src/lib/api.ts`, a sessão em
> `web/src/lib/session.ts` e a URL da API em `web/.env.example`. O Web foi
> validado com `npm run lint` e `npm run build`. O aplicativo mobile está em
> `mobile/`, com cliente HTTP, sessão segura, consulta de regiões e detalhes
> de clima e safra por região.

---

### 2.4. Base inicial do aplicativo mobile

Foi criado o projeto Expo em `mobile/`, com TypeScript, configuração por
`EXPO_PUBLIC_API_URL`, login, consulta de regiões, logout, armazenamento
seguro do JWT usando `expo-secure-store` e detalhe integrado de clima e safra
por região. O CRUD de `ADMIN` e `TECNICO` e a extração final dos contratos
compartilhados permanecem pendentes.

O Web e o Mobile consultam a mesma API NestJS. O Web apresenta filtros por
período de clima e ano de safra, indicadores agregados, série visual de
temperatura e histórico de rendimento. O Mobile apresenta a seleção de região
e os detalhes mais recentes de clima e safra, incluindo o aviso de que o
rendimento da CONAB é agregado por UF.

### 2.5. Hidratação do dashboard Web

O dashboard aguarda a hidratação do cliente antes de ler a sessão do
`localStorage` ou redirecionar usuários sem autenticação. Isso evita que o
HTML inicial do servidor seja diferente do HTML produzido no navegador quando
já existe uma sessão salva.

### 2.5. Arquivos de ambiente locais

Foram criados arquivos `.env` locais a partir dos exemplos nas pastas
`backend/`, `web/`, `analytics/` e `mobile/`. Esses arquivos não devem ser
versionados e não devem conter credenciais reais na documentação. O
`backend/.env` que já existia foi preservado para não sobrescrever a
configuração local.

## 3. Banco de Dados e Dados de Teste

O banco de dados utiliza **PostgreSQL**, com o schema gerenciado pelo
**Prisma**. A base deve estar funcional para desenvolvimento local e conter
dados de teste suficientes para validar os endpoints e a integração parcial do
front-end.

### 3.1. Entidades utilizadas

- `Regiao_Produtora`;
- `Condicao_Climatica`;
- `Safra_Rendimento`;
- usuários e relações de acesso, quando aplicável;
- entidades analíticas necessárias para os resultados de clusterização.

Os nomes acima representam o domínio do projeto. A confirmação dos nomes
físicos deve ser feita no arquivo `backend/prisma/schema.prisma`.

### 3.2. Requisitos dos dados de teste

- Os registros devem respeitar as relações definidas no schema.
- Deve existir mais de uma região para permitir consultas comparativas.
- Devem existir dados climáticos e de rendimento associados às regiões.
- Os dados ausentes devem ser tratados antes da persistência na base
  consolidada.
- O processo de carga deve poder ser repetido sem gerar duplicações
  indevidas.

### 3.3. Evidências

Inserir nesta seção:

- print do schema ou do Prisma Studio;
- trecho do `schema.prisma`;
- comando utilizado para aplicar as migrations;
- comando ou arquivo utilizado para popular a base;
- consulta demonstrando registros de teste persistidos.

**Evidências da equipe:**

> A carga local pode ser reproduzida com `npx prisma migrate deploy` e
> `npm run prisma:seed`. O arquivo `backend/prisma/seed.ts` cria regiões,
> condições climáticas, safras e um usuário técnico de desenvolvimento.

---

## 4. Repositório e Participação da Equipe

O desenvolvimento deve permanecer centralizado no repositório oficial do
grupo no GitHub. Cada integrante deve possuir contribuições identificáveis
relacionadas às atividades da sprint.



### 4 Boas práticas adotadas

- Commits devem descrever a alteração realizada.
- Cada integrante deve trabalhar em uma branch ou fluxo definido pelo grupo.
- Pull requests devem indicar o objetivo e os arquivos alterados.
- Não devem ser versionados tokens, senhas, arquivos `.env` ou outros dados
  sensíveis.
- O histórico do GitHub deve ser usado como evidência da participação da
  equipe, e não apenas como cópia final do código.

**Evidências da equipe:**

> Inserir link do repositório, prints do histórico de commits e links para
> pull requests relevantes.

---

## 5. Computação em Nuvem II

Na Sprint 2, deve ser criado pelo menos o ambiente inicial em nuvem para
hospedar ou testar parte da solução. A configuração pode ser parcial, mas
deve ser documentada de forma reproduzível.

### 5.1. Configuração inicial

| Item | Configuração |
| --- | --- |
| Provedor de nuvem | A preencher |
| Região/ localização | A preencher |
| Serviço utilizado | A preencher |
| Sistema operacional ou runtime | A preencher |
| Forma de implantação | A preencher |
| URL ou endpoint público | A preencher |
| Banco de dados | A preencher |
| Variáveis de ambiente | A preencher |

Não registrar neste documento valores de senhas, tokens ou chaves privadas.
Quando necessário, deve ser documentado apenas o nome da variável e o local
seguro onde ela é configurada.

### 5.2. Procedimento de configuração

Documentar, em ordem, os passos necessários para reproduzir a configuração:

1. criação do recurso no provedor escolhido;
2. configuração do runtime ou dos contêineres;
3. definição das variáveis de ambiente;
4. configuração do banco de dados e das migrations;
5. publicação da API ou da aplicação;
6. teste de conectividade e de funcionamento;
7. limitações conhecidas do ambiente parcial.

### 5.3. Evidências

As evidências desta seção devem demonstrar a configuração efetivamente
publicada. Como o ambiente remoto ainda não foi configurado nesta entrega, não
há print ou endpoint público a declarar como concluído.

Para finalizar este critério, anexar:

- print do recurso criado no provedor, com identificadores sensíveis ocultados;
- print do serviço em execução e do status de saúde;
- trecho do arquivo de configuração ou pipeline de implantação, sem segredos;
- resposta de um endpoint público, preferencialmente `GET /api` ou uma rota
  autenticada com o token removido;
- descrição do custo estimado, limites do plano, período de disponibilidade,
  limites de armazenamento e restrições de rede.

**Evidências da equipe:**

> **Status atual:** pendente de configuração externa.
>
> A execução local validada não substitui a evidência de nuvem. O ambiente
> local possui PostgreSQL em Docker, API NestJS na porta `3001` e Web Next.js
> na porta `3000`. Os comandos e resultados locais estão registrados em
> [`docs/evidencias/README.md`](./evidencias/README.md), mas não devem ser
> apresentados como publicação em provedor.
>
> Após a publicação, registrar aqui os links para os arquivos:
>
> - `docs/evidencias/nuvem-recurso.png`;
> - `docs/evidencias/nuvem-servico.png`;
> - `docs/evidencias/nuvem-endpoint.txt`;
> - `docs/evidencias/nuvem-configuracao.txt`.
>
> Não registrar senhas, tokens, chaves privadas, connection strings completas
> ou dados pessoais nos prints e arquivos de evidência.

---

## 6. Mineração de Dados

O módulo de mineração de dados utiliza as bases relacionadas à cafeicultura e
ao clima para investigar a relação entre condições ambientais e produtividade.
Nesta sprint, a entrega contempla a coleta, o tratamento e a aplicação de uma
técnica inicial.

### 6.1. Coleta e tratamento

Documentar:

- fonte e identificação das bases utilizadas;
- formato e quantidade inicial de registros;
- variáveis selecionadas;
- estratégia para dados ausentes;
- padronização ou normalização aplicada;
- critérios usados para unir as bases;
- quantidade de registros após o tratamento;
- local dos scripts e dos arquivos de saída.

As bases devem ser relacionadas por região produtora e ano de colheita quando
essas informações estiverem disponíveis. O tratamento deve ocorrer antes da
persistência dos dados consolidados.

### 6.2. Técnica inicial

A técnica inicial pode ser uma classificação simples ou um cluster preliminar.
Para o escopo definido anteriormente, recomenda-se registrar o cluster
preliminar com **K-Means**, incluindo:

- variáveis utilizadas no agrupamento;
- tratamento de escala das variáveis;
- quantidade de clusters (`k`);
- critério usado para escolher `k`;
- algoritmo ou biblioteca utilizada;
- resultado obtido;
- limitações e próximos passos.

Caso a equipe tenha utilizado classificação em vez de clusterização, substituir
esta subseção pela descrição da variável-alvo, das classes, das features, do
modelo e das métricas utilizadas.

### 6.3. Evidências

Inserir nesta seção:

- trecho do script de coleta e tratamento;
- print ou tabela antes e depois do tratamento;
- gráfico, matriz ou visualização do resultado;
- saída da execução da técnica;
- interpretação inicial dos resultados.

**Evidências da equipe:**

> Inserir prints, links para notebooks/scripts ou referências aos commits.

> A API disponibiliza `GET /clusters`, protegido por JWT, com agrupamento
> preliminar K-Means (`k=2`) sobre médias de temperatura, precipitação,
> umidade e radiação solar. O resultado é exploratório; a qualidade do cluster
> ainda deve ser calculada e registrada pelo pipeline analítico.

---

## 7. Pendências e Próximos Passos

Registrar nesta seção tudo que não foi concluído na Sprint 2 e que deverá ser
tratado na próxima entrega.

- Completar a integração das telas restantes do front-end.
- Completar a integração das telas restantes do Web e validar o fluxo no
  navegador com dados reais.
- Implementar no Mobile as telas de detalhe e CRUD para `ADMIN` e `TECNICO`;
  `PRODUTOR` permanece somente leitura.
- Extrair os contratos HTTP para um módulo compartilhado entre Web e Mobile.
- Consolidar os endpoints CRUD que ainda estiverem pendentes.
- Automatizar ou revisar a carga dos dados de teste.
- Coleta de clima (`analytics/scripts/coletar_nasa_power.py`) e de safra
  (`analytics/scripts/coletar_conab.py`) executadas; anexar os prints da
  execução.
- Carregar no banco os dados tratados (`01_ingestao.ipynb` ou
  `npm run data:import`), com a correspondência UF e região produtora.
- Registrar proveniência, período e unidades persistidas nos arquivos tratados;
  o importador idempotente já está disponível em `backend/scripts/`.
- Adicionar gráficos e filtros de período/ano no dashboard após a carga validada.
- Evoluir a configuração do ambiente em nuvem.
- Integrar os resultados da mineração à API, quando aplicável.
- Preparar a técnica preditiva prevista para a Sprint 3.
- Atualizar a documentação com as evidências definitivas.

---

## 8. Referências do Projeto

- [Documentação da Sprint 1](./documentacao-sprint1.md)
- [README do back-end](../backend/README.md)
- [Schema Prisma](../backend/prisma/schema.prisma)
- [Regras de negócio](../.cursor/rules/regras-negocio.mdc)

## 9. Regras de documentação do projeto

As regras de desenvolvimento e documentação estão disponíveis tanto para o
Cursor quanto para o GitHub Copilot:

- Regras do Cursor: [`.cursor/rules/`](../.cursor/rules/)
- Instruções do GitHub Copilot: [`.github/instructions/`](../.github/instructions/)
- Instruções gerais do Copilot: [`.github/copilot-instructions.md`](../.github/copilot-instructions.md)
- Regras da Sprint 2: [`stack-sprint2.mdc`](../.cursor/rules/stack-sprint2.mdc) e
  [`stack-sprint2.instructions.md`](../.github/instructions/stack-sprint2.instructions.md)
- Política de Git: [`git-commit-policy.mdc`](../.cursor/rules/git-commit-policy.mdc)
  e [`git-commit-policy.instructions.md`](../.github/instructions/git-commit-policy.instructions.md)

Toda alteração no projeto deve atualizar este documento na mesma entrega,
mantendo o comportamento, os comandos, os endpoints, as pendências e as
evidências sincronizados. Informações sensíveis, como senhas, tokens e chaves
privadas, não devem ser registradas.



O back-end disponibiliza `npm run data:import -- clima.csv safra.csv
regiao-uf.csv` para importar arquivos tratados. O importador valida regiões,
atualiza clima por `regiaoId + data` e faz upsert de safra por
`regiaoId + anoColheita`; o arquivo `regiao-uf.csv` torna explícita a
correspondência entre a UF agregada da CONAB e a região produtora.
