# Guia Mínimo: Ambiente em Nuvem no Azure

## Plataforma de Mineração de Dados Agrícolas e Climáticos do Café

**Grupo:** DSM-G07 · **Sprint 2:** Computação em Nuvem II

**Entrega pedida:** ambiente em nuvem criado (mesmo que parcialmente) e documentação da configuração inicial.

**O que este guia cria:** conta Azure, um Resource Group e um banco PostgreSQL com os dados do projeto. A publicação da API não faz parte deste guia mínimo.

Faça os passos **na ordem** e use **a mesma janela do PowerShell até o fim**. Itens não confirmados na documentação da Microsoft estão marcados como **(não confirmado)**.

---

## 1. Criar a conta (uma pessoa do grupo)

1. Abra o navegador e entre em azure.microsoft.com/free/students.
2. Clique em **Start free**.
3. Entre com o **e-mail da Fatec** e siga as telas. Não pede cartão. Aceitação do e-mail da Fatec: **(não confirmado)**.
4. Ao terminar, abre o portal.azure.com.

**Print 1:** no portal, busque **Subscriptions** e tire print mostrando "Azure for Students" (ID oculto).

## 2. Instalar o Azure CLI

1. Tecla **Windows**, digite **PowerShell**, botão direito em **Windows PowerShell**, **Executar como administrador**.
2. Cole e aperte Enter:

```powershell
winget install -e --id Microsoft.AzureCLI
```

3. Feche o PowerShell e abra outro.
4. Faça o login:

```powershell
az login
```

O navegador abre. Entre com o e-mail da Fatec.

## 3. Preparar as variáveis

1. Crie **uma senha** só com letras e números, mínimo 16 caracteres, com maiúscula, minúscula e número. Anote em lugar seguro, fora do Git.
2. Cole o bloco trocando só a senha:

```powershell
$RG="rg-cafe-pi6"
$LOC="brazilsouth"
$PG="pg-cafe-pi6-g07"
$PGUSER="cafeadmin"
$PGPASS="COLE-SUA-SENHA-AQUI"
$MEUIP = (Invoke-RestMethod https://api.ipify.org)
$MEUIP
```

A última linha mostra o seu IP. Se a região der erro, troque `brazilsouth` por `eastus2`. Se disser que o nome já existe, mude o final de `$PG` (`g07`).

## 4. Criar o Resource Group

```powershell
az group create --name $RG --location $LOC
```

Deve aparecer `"provisioningState": "Succeeded"`.

**Print 2:** portal, **Resource groups**, `rg-cafe-pi6`.

## 5. Criar o banco PostgreSQL (5 a 10 minutos)

```powershell
az postgres flexible-server create --resource-group $RG --name $PG --location $LOC --admin-user $PGUSER --admin-password $PGPASS --tier Burstable --sku-name Standard_B1ms --version 16 --storage-size 32 --public-access $MEUIP
```

Se pedir confirmação, digite `y` e Enter. Se der erro de tier ou sku, a combinação é **(não confirmada)**: crie pelo portal (*Create a resource, Databases, Azure Database for PostgreSQL flexible server*, com *Workload type = Development*).

**Print 3:** portal, busque `pg-cafe-pi6-g07`, aba **Overview**.
**Print 4:** menu **Networking**, regras de firewall (IP oculto).

## 6. Colocar os dados no banco

1. Vá para a pasta do back-end:

```powershell
cd D:\Projeto\irroba-onboarding\DSM-G07-PI6-2026-2\backend
```

2. Aplique as migrations e o seed:

```powershell
$env:DATABASE_URL="postgresql://${PGUSER}:${PGPASS}@${PG}.postgres.database.azure.com:5432/postgres?sslmode=require"
npx prisma migrate deploy
npm run prisma:seed
```

**Print 5:** a saída desses comandos.

3. Para ver os dados:

```powershell
npx prisma studio
```

Abre uma página no navegador; clique em uma tabela com dados.

**Print 6:** a tabela com registros. Depois volte ao PowerShell e aperte **Ctrl + C**.

## 7. Preencher a documentação

Em `docs/documentacao-sprint2.md`, seção 5.1. Como a API não foi publicada, não declarar URL pública:

| Item | Escrever |
| --- | --- |
| Provedor de nuvem | Microsoft Azure (Azure for Students) |
| Região | Brazil South (ou a usada) |
| Serviço utilizado | Azure Database for PostgreSQL Flexible Server |
| Sistema operacional ou runtime | PostgreSQL 16 (serviço gerenciado) |
| Forma de implantação | Azure CLI (`az postgres flexible-server create`) |
| URL ou endpoint público | Servidor: pg-cafe-pi6-g07.postgres.database.azure.com (somente banco) |
| Banco de dados | PostgreSQL Flexible Server (Burstable) |
| Variáveis de ambiente | DATABASE_URL (valor não registrado) |

Na seção 5.3, informar que a API ainda roda localmente e se conecta ao banco na nuvem apenas nas cargas de migrations e seed. As limitações são o ambiente parcial (sem API publicada), o custo estimado e o crédito de US$ 100 com validade de 12 meses.

Salvar em `docs/evidencias/`: `nuvem-recurso.png` (prints 2, 3 e 4) e `nuvem-servico.png` (prints 5 e 6). Nunca registrar senha ou connection string.

## 8. Depois da avaliação

Só depois de guardar os prints, apague os recursos para não gastar crédito:

```powershell
az group delete --name $RG --no-wait
```

## Checklist de prints

| # | Evidência |
| --- | --- |
| 1 | Assinatura e crédito |
| 2 | Resource group |
| 3 | Overview do PostgreSQL |
| 4 | Firewall do banco |
| 5 | Migrations e seed |
| 6 | Dados no banco |

## Fontes

- azure.microsoft.com/free/students
- learn.microsoft.com/azure/postgresql/flexible-server/quickstart-create-server
- learn.microsoft.com/cli/azure/postgres/flexible-server
