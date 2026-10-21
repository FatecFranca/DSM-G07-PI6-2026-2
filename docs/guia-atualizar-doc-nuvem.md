# Guia: Atualizar a Documentação da Sprint 2 (Nuvem)

## Plataforma de Mineração de Dados Agrícolas e Climáticos do Café

**Grupo:** DSM-G07

**Objetivo:** registrar em `docs/documentacao-sprint2.md` o ambiente em nuvem criado no Azure. O banco PostgreSQL foi criado e populado com dados de teste. A API ainda não foi publicada.

**Regras:** não escrever senha, connection string ou ID da assinatura. Não afirmar que há URL pública da API nem que os dados são reais.

---

## 1. Tabela do checklist (início do arquivo)

Localizar as duas linhas de nuvem, que hoje dizem "Pendente de configuração externa", e trocar por:

| Entrega prevista | Status | Evidência |
| --- | --- | --- |
| Ambiente em nuvem criado, mesmo que parcialmente | Parcial: banco PostgreSQL no Azure criado e populado; API ainda não publicada | [E-06](./evidencias/README.md#e-06--nuvem) |
| Documentação da configuração inicial da nuvem | Concluída (ambiente parcial) | [E-06](./evidencias/README.md#e-06--nuvem) |

Também atualizar a frase no início do arquivo que diz que permanecem pendentes "ambiente em nuvem": passar a dizer que a nuvem está parcialmente configurada.

## 2. Seção 5.1 (Configuração inicial)

Substituir os valores "A preencher":

| Item | Escrever |
| --- | --- |
| Provedor de nuvem | Microsoft Azure (Azure for Students) |
| Região/ localização | Brazil South |
| Serviço utilizado | Azure Database for PostgreSQL Flexible Server |
| Sistema operacional ou runtime | PostgreSQL 16 (serviço gerenciado) |
| Forma de implantação | Azure CLI (`az postgres flexible-server create`) |
| URL ou endpoint público | pg-cafe-pi6-g07.postgres.database.azure.com (somente banco; a API não foi publicada) |
| Banco de dados | PostgreSQL Flexible Server, camada Burstable (Standard_B1ms) |
| Variáveis de ambiente | `DATABASE_URL` (valor não registrado) |

## 3. Seção 5.2 (Procedimento de configuração)

Substituir a lista genérica pela ordem real do que foi feito:

1. Criação da assinatura Azure for Students com o e-mail institucional.
2. Login pelo Azure CLI (`az login`).
3. Criação do Resource Group `rg-cafe-pi6`, na região Brazil South.
4. Registro do provedor `Microsoft.DBforPostgreSQL` na assinatura (`az provider register --namespace Microsoft.DBforPostgreSQL`).
5. Criação do servidor PostgreSQL `pg-cafe-pi6-g07` (Burstable, versão 16), com firewall liberado para o IP de quem administra.
6. Aplicação das migrations (`npx prisma migrate deploy`) e do seed (`npm run prisma:seed`) no banco da nuvem.
7. Conferência dos dados pelo Prisma Studio.

Limitações conhecidas: a API NestJS ainda roda localmente e usa o banco da nuvem apenas nas cargas; o seed contém dados de teste, não dados reais.

## 4. Seção 5.3 (Evidências)

Substituir o bloco "Status atual: pendente de configuração externa" por:

> **Status atual:** ambiente parcial criado. O banco PostgreSQL foi criado no Azure (Brazil South, camada Burstable) e populado com dados de teste pelo seed (3 regiões, 3 condições climáticas, 3 safras e 1 usuário). A API NestJS ainda não foi publicada no provedor.
>
> **Custo e limites:** crédito de US$ 100 do Azure for Students, válido por 12 meses. O servidor usa a camada Burstable, indicada pelo portal para desenvolvimento e testes. O acesso é feito por IP liberado no firewall.
>
> **Evidências:**
> - `docs/evidencias/nuvem-recurso.png`: grupo de recursos, visão geral do servidor e regras de rede;
> - `docs/evidencias/nuvem-servico.png`: migrations e seed no banco do Azure e dados no Prisma Studio.

Remover a lista antiga de arquivos que cita `nuvem-endpoint.png` e `nuvem-configuracao.txt`, ou criar esses arquivos, para não ficar referência a algo que não existe.

## 5. Prints a salvar em `docs/evidencias/`

| Arquivo | Conteúdo |
| --- | --- |
| `nuvem-recurso.png` | Resource group, Visão geral do servidor e Rede (firewall) |
| `nuvem-servico.png` | Saída do PowerShell com o servidor `pg-cafe-pi6-g07.postgres.database.azure.com`, e o Prisma Studio com os dados |

Vários prints podem ser juntados em uma imagem, ou salvos com sufixos (`nuvem-recurso-1.png`).

Antes de salvar, esconder o ID da assinatura e o IP. A senha não pode aparecer. Se aparecer o comando com a variável da connection string, recortar essa parte.

## 6. Opcional

- Em `docs/evidencias/README.md`, ajustar a linha E-06 para "Parcial: banco criado no Azure".
- Corrigir a numeração duplicada "2.5" e o título "4 Boas práticas" no documento.

## 7. Conferência final

- [ ] Nenhuma senha, token ou connection string no texto e nos prints.
- [ ] Nenhuma menção a "URL pública da API" ou "dados reais".
- [ ] Os arquivos de print existem com os nomes citados.
- [ ] A seção 5 não diz mais "pendente" nem "A preencher".
