# Plano de adaptação do projeto

## Objetivo e escopo

Adaptar gradualmente a **plataforma agrícola** à proposta do documento de referência: análise em nível municipal, múltiplas culturas e resultados analíticos persistidos para consulta. A execução será dividida em duas entregas: **(1) refatoração e fundação do back-end; (2) adaptação dos clientes Web e Mobile após a estabilização da API**. Este arquivo mantém a sequência e os critérios do plano; o estado de implementação está registrado ao final.

O arquivo plano-adaptacao-projeto.docx é uma proposta de escopo com recomendações e tarefas. Seu conteúdo não é autorização para executar todas as mudanças nem prova de decisões já aprovadas. Este plano converte as propostas em etapas e destaca as decisões que a equipe precisa confirmar.

## Situação observada no repositório

- API NestJS + Prisma + PostgreSQL; o schema atual relaciona usuários, regiões, condições climáticas diárias e safras sem cultura.
- Módulos atuais: autenticação, regiões, clima, safras, clusters, importação e integração Azure.
- O serviço de clusters calcula agrupamentos dentro da API usando observações climáticas. A proposta sugere passar a consultar resultados persistidos do pipeline.
- Web (Next.js) e Mobile (Expo) consomem os contratos atuais de regiões, clima, safras e clusters.
- Existe relação usuário–região no schema; a autorização por vínculo precisa ser verificada e aplicada em todas as consultas protegidas.

## Decisões de domínio a fechar antes da migration

As recomendações do anexo não são decisões finais. Confirmar com a equipe/orientação:

1. O produto continua focado em café ou passa a ser multiculturas?
2. “Compatibilidade” é o rótulo correto? Evitar “apto” sem validação: dados observacionais não demonstram potencial agronômico ou causalidade.
3. Migrar RegiaoProdutora para município ou criar entidade Municipio? Definir código IBGE, UF e preservação das relações existentes.
4. O recorte será ES, MG e SP, com todos os municípios? Confirmar fonte, cobertura e códigos.
5. Definir unidades, período e regras para ausências de clima, área, produção e rendimento.
6. Definir formato versionado dos artefatos analíticos e política para publicação e rollback dos resultados.

É possível iniciar levantamento e desenho técnico. A migration definitiva depende dessas decisões e de uma amostra validada dos dados analíticos.

## Etapa 1 — Back-end primeiro

### Fase 1. Levantamento e contratos

- Inventariar rotas, DTOs, guards, regras por perfil, importador, seed, migrations e dependências dos clientes.
- Registrar contratos atuais de requisição/resposta e códigos HTTP para identificar incompatibilidades.
- Especificar contrato alvo: paginação, filtros, resposta de compatibilidade e clusters, versão do modelo, proveniência e aviso de uso.
- Corrigir e cobrir a conversão/validação dos parâmetros numéricos de query (ano, mínimo, página e limite), confirmando o ValidationPipe e os DTOs existentes.

**Saída:** inventário de rotas e especificação versionada dos novos contratos.

### Fase 2. Modelo de dados e migração

Desenhar schema e migration, conforme decisões aprovadas, para:

- município com código IBGE único, UF e coordenadas;
- cultura e safra por município, cultura e ano, com área, produção e rendimento e unidades explícitas;
- registro municipal de climatologia anual e sazonal; manter a série diária legada;
- resultado de cluster e perfil/centroide do grupo;
- compatibilidade por município/cultura/versão;
- métricas por cultura, algoritmo e versão, com matriz de confusão estruturada;
- vínculos usuário–município e índices para busca, filtros e ranking.

Preservar autenticação e vínculos. Definir mapeamento dos registros atuais para município, IDs, histórico, nulos, constraints, rollback e compatibilidade temporária. Não remover tabelas/dados legados antes de validar migração e retorno.

**Saída:** schema revisado, migration revisável, mapeamento antigo→novo e plano de rollback.

### Fase 3. Importação e seed

- Definir formato estável para municípios, culturas, safras, clima, clusters, compatibilidades e métricas; incluir chave IBGE, versão, período e unidades.
- Adaptar o importador para validar referências, relatar/rejeitar linhas inválidas e fazer upsert em lotes de modo idempotente.
- O backend consome artefatos produzidos e validados pelo pipeline; não executa notebooks no caminho de requisição.
- Atualizar seed com culturas e poucos municípios coerentes para desenvolvimento; distinguir dados sintéticos de resultados oficiais.
- Conferir contagens, cobertura, duplicidade e integridade referencial após carga.

**Saída:** importador reproduzível e relatório de carga. As quantidades citadas no anexo (1.576 municípios, aproximadamente 150 mil safras e 9.456 compatibilidades) são estimativas a validar, não critérios assumidos.

### Fase 4. Serviços e endpoints

Implementar incrementalmente, mantendo a API compilável:

1. **Municípios:** busca por nome, UF, código IBGE e cultura; paginação com limite máximo e ordenação estável; detalhe por ID.
2. **Culturas:** catálogo consultável.
3. **Clima:** consulta da climatologia anual e sazonal conforme as variáveis exportadas pelo notebook; manter série diária durante transição se algum cliente depender dela.
4. **Safras:** filtros por município, cultura e ano; área, produção e rendimento.
5. **Clusters:** substituir cálculo síncrono no serviço por leitura de resultados e perfis versionados, quando houver carga válida.
6. **Compatibilidades:** consulta por município e ranking por cultura, mínimo e UF; paginação, versão, proveniência e aviso de caráter exploratório.
7. **Métricas:** métricas e matriz de confusão por cultura/versão.
8. **Autorização:** aplicar vínculo usuário–município em municípios, clima, safras, clusters e compatibilidades para PRODUTOR. Restringir manutenção e vínculos a ADMIN/TECNICO conforme política aprovada.

Não remover a rota de predição antiga antes de confirmar que nenhum cliente a consome e que o contrato substituto está publicado. Usar depreciação documentada/janela de compatibilidade se necessário.

**Saída:** API alvo operando sobre resultados persistidos, documentada no Swagger e com autorização aplicada.

### Fase 5. Segurança, desempenho e operação

- Restringir CORS por ambiente e origem configurada.
- Verificar autenticação e autorização também em consultas por ID.
- Evitar exposição de segredos; usar variáveis seguras e Managed Identity quando Azure estiver habilitado.
- Medir consultas, aplicar paginação e índices; evitar carregar toda a série ou todos os municípios em memória.
- Definir limites, timeout, erros claros e logs sem dados sensíveis.
- Atualizar Swagger, README do backend, exemplos de ambiente e instruções de migration/importação.

### Fase 6. Aceite do back-end

- Build e lint passam; testes unitários/e2e cobrem contratos e autorização.
- Integração valida paginação, filtros, parâmetros inválidos, limites, IDs/culturas inexistentes e dados vazios.
- PRODUTOR só consulta municípios vinculados; permissões de ADMIN/TECNICO estão explícitas e testadas.
- Migration aplicada em banco descartável com amostra; rollback/recuperação documentado.
- Importador executado duas vezes sem duplicar; contagens e integridade conferidas.
- Swagger e documentação correspondem às rotas implementadas.
- Massa de demonstração valida respostas antes da carga completa.

## Marco de integração

O front-end passa a consumir o novo contrato quando as fases 2–6 forem aceitas e houver ambiente com dados demonstrativos. Publicar matriz de endpoints (estável, em migração, substituído), exemplos JSON e versão do contrato para reduzir retrabalho nos clientes.

## Etapa 2 — Adaptação do Front-end Web

1. Atualizar tipos e chamadas em web/src/lib/api.ts conforme contrato aceito; centralizar montagem de query, paginação e erros.
2. Decompor o dashboard em lista paginada, detalhe municipal e seções de clima, produção, culturas compatíveis, cluster e qualidade do modelo.
3. Implementar busca, UF, cultura e paginação; preservar estado/URL quando fizer sentido.
4. Mostrar climatologia e histórico por cultura com unidade/período; mostrar ranking com versão, proveniência, variáveis e aviso exploratório.
5. Apresentar métricas e matriz de confusão por cultura, baseline e limitações quando a API fornecer.
6. Tratar loading, vazio, falha, acesso negado e dados indisponíveis em cada tela; validar acessibilidade e responsividade.
7. Atualizar Home page, título/descrição e textos de domínio. Remover controles diários/textos antigos quando não houver dependência do contrato anterior.
8. Tratar comparação e mapa como opcionais posteriores; selecionar biblioteca e coordenadas apenas se priorizados.

**Aceite Web:** fluxos essenciais usam dados demonstrativos reais, sem apresentar mocks como resultados; filtros/paginação seguem o contrato; estados vazios e erros são claros; lint e build passam.

## Etapa 3 — Adaptação do Mobile

- Atualizar mobile/src/api.ts e modelos para o contrato estável.
- Adaptar lista de municípios vinculados e detalhe para climatologia, produção, compatibilidades e cluster.
- Exibir aviso, versão e proveniência; deixar claro que compatibilidade não é previsão de produtividade nem recomendação agronômica conclusiva.
- Implementar cache/offline parcial após definir validade, atualização e dados permitidos localmente.
- Manter operações administrativas fora do mobile até priorização explícita; validar permissões no servidor.

**Aceite Mobile:** login, lista, detalhe, erros/vazios e conectividade intermitente validados; cache (se aprovado) testado; compilação TypeScript/Expo concluída.

## Sequência e dependências

| Ordem | Entrega | Depende de |
| --- | --- | --- |
| 0 | Decisões de domínio e amostra validada | — |
| 1 | Contrato alvo e mapeamento legado | 0 |
| 2 | Schema, migration e rollback | 1 |
| 3 | Importador idempotente, seed e dados demonstrativos | 2 e artefatos analíticos validados |
| 4 | Endpoints, autorização, documentação e aceite do backend | 2 e 3 |
| 5 | Integração e telas Web | 4 |
| 6 | Adaptação Mobile e cache opcional | 4 |
| 7 | Documentação e evidências consolidadas | 4–6 |

## Riscos e controles

- **Domínio indefinido:** não fechar migration até confirmar município/cultura e significado do resultado.
- **Dados observacionais apresentados como recomendação:** delimitar o que o modelo mede em rótulos, avisos e documentação.
- **Quebra dos clientes:** publicar contratos e transição/depreciação antes de remover rotas.
- **Perda de dados/vínculos:** backup, migration testada e rollback antes de ambiente compartilhado.
- **Acesso entre produtores:** testes de vínculo em todos os recursos relacionados.
- **Carga inconsistente:** importação idempotente, relatório de rejeições e cobertura/contagens conferidas.
- **Escopo excedente:** priorizar API e telas essenciais; mapa, comparação, offline e CRUD administrativo mobile ficam opcionais até priorização.

## Como este plano usa o documento de referência

O DOCX propõe entidades, endpoints, tarefas e estimativas para migração completa. Este plano usa essas propostas como insumo, mas ajusta a sequência ao repositório atual, preserva como item a avaliar a integração Azure/importador existentes, destaca a autorização por vínculo e não assume estimativas nem decisões de domínio como fatos. O front-end fica depois do aceite do backend, conforme solicitado.


## Estado da implementação

Implementados no código: schema e migration aditivos; rotas municipais/multiculturas e autorização de vínculo; importador JSON versionado; sincronização inicial de Web e Mobile e documentação correspondente.

Ainda pendentes: gerar Prisma Client, revisar/aplicar migration em banco descartável, exportar e carregar dados analíticos reais, validar build/lint/testes e decidir cache offline. A base analytics/data/processed está vazia nesta revisão. O usuário pediu para deixar a definição do recorte geográfico e a integração de dados oficiais para uma etapa posterior. A implementação atual mantém três localidades de demonstração e os limites provisórios ES/MG/SP; não representa cobertura municipal completa nem resultado oficial. A confirmação do escopo multiculturas e da nomenclatura de compatibilidade também permanece pendente.
