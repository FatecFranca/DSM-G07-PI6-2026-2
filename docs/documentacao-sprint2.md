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

| Entrega prevista | Status | Evidência |
| --- | --- | --- |
| Back-end com endpoints básicos da API implementados (CRUD) | Concluído no ambiente local | Seção 1 |
| Front-end parcialmente integrado ao back-end | Em validação | Seção 2 |
| Banco de dados implementado e populado com dados de teste | Concluído no ambiente local | Seção 3 |
| Commits ativos de todos os integrantes no GitHub | Em validação | Seção 4 |
| Ambiente em nuvem criado, mesmo que parcialmente | Em validação | Seção 5 |
| Documentação da configuração inicial da nuvem | Em validação | Seção 5 |
| Coleta e tratamento dos dados | Em validação | Seção 6 |
| Aplicação de técnica inicial de mineração de dados | Implementado preliminarmente | Seção 6 |
| Documentação intermediária atualizada com evidências | Em andamento | Este documento |

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
| Login | A preencher | Informar endpoint utilizado |
| Lista de regiões | A preencher | Informar filtros disponíveis |
| Condições climáticas | A preencher | Informar região consultada |
| Dados de safra | A preencher | Informar dados exibidos |
| Dashboard | A preencher | Separar dados reais e mockados |

### 2.2. Critérios técnicos

- O front-end deve utilizar os endpoints oficiais da API.
- Regras de negócio não devem ser duplicadas nos componentes da interface.
- Estados de carregamento, sucesso e erro devem ser tratados nas telas
  integradas.
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

> Inserir prints, links para arquivos ou referências aos commits.

---

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

### 4.1. Registro de contribuições

| Integrante | Atividade | Branch ou commit | Evidência |
| --- | --- | --- | --- |
| A preencher | A preencher | A preencher | Link do GitHub |
| A preencher | A preencher | A preencher | Link do GitHub |
| A preencher | A preencher | A preencher | Link do GitHub |
| A preencher | A preencher | A preencher | Link do GitHub |

### 4.2. Boas práticas adotadas

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

Inserir nesta seção:

- print do recurso criado no provedor;
- print do serviço em execução;
- trecho do arquivo de configuração ou pipeline;
- resposta de um endpoint publicado;
- descrição dos custos, limites ou restrições do ambiente.

**Evidências da equipe:**

> Inserir prints e links sem expor credenciais ou informações privadas.

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
> preliminar K-Means (`k=2`) sobre a temperatura média das regiões.

---

## 7. Pendências e Próximos Passos

Registrar nesta seção tudo que não foi concluído na Sprint 2 e que deverá ser
tratado na próxima entrega.

- Completar a integração das telas restantes do front-end.
- Consolidar os endpoints CRUD que ainda estiverem pendentes.
- Automatizar ou revisar a carga dos dados de teste.
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
