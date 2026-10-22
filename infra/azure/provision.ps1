param(
  [Parameter(Mandatory = $true)][string]$SubscriptionId,
  [Parameter(Mandatory = $true)][string]$ResourceGroup,
  [Parameter(Mandatory = $true)][string]$Location,
  [Parameter(Mandatory = $true)][string]$StorageAccount,
  [Parameter(Mandatory = $true)][string]$ServiceBusNamespace,
  [string]$QueueName = "data-file-available",
  [string]$ApiPrincipalId
)

$ErrorActionPreference = "Stop"

az account set --subscription $SubscriptionId
az group create --name $ResourceGroup --location $Location | Out-Null

az storage account create `
  --name $StorageAccount `
  --resource-group $ResourceGroup `
  --location $Location `
  --sku Standard_LRS `
  --kind StorageV2 `
  --allow-blob-public-access false `
  --min-tls-version TLS1_2 | Out-Null

$storageId = az storage account show `
  --name $StorageAccount `
  --resource-group $ResourceGroup `
  --query id `
  --output tsv

az storage container create `
  --name data-treated `
  --account-name $StorageAccount `
  --auth-mode login | Out-Null

az servicebus namespace create `
  --name $ServiceBusNamespace `
  --resource-group $ResourceGroup `
  --location $Location `
  --sku Standard | Out-Null

az servicebus queue create `
  --name $QueueName `
  --namespace-name $ServiceBusNamespace `
  --resource-group $ResourceGroup `
  --max-delivery-count 5 `
  --enable-dead-lettering-on-message-expiration true | Out-Null

if ($ApiPrincipalId) {
  $serviceBusId = az servicebus namespace show `
    --name $ServiceBusNamespace `
    --resource-group $ResourceGroup `
    --query id `
    --output tsv

  az role assignment create `
    --assignee-object-id $ApiPrincipalId `
    --assignee-principal-type ServicePrincipal `
    --role "Storage Blob Data Contributor" `
    --scope $storageId | Out-Null

  az role assignment create `
    --assignee-object-id $ApiPrincipalId `
    --assignee-principal-type ServicePrincipal `
    --role "Azure Service Bus Data Sender" `
    --scope $serviceBusId | Out-Null

  az role assignment create `
    --assignee-object-id $ApiPrincipalId `
    --assignee-principal-type ServicePrincipal `
    --role "Azure Service Bus Data Receiver" `
    --scope $serviceBusId | Out-Null
}

Write-Host "Recursos Azure provisionados de forma idempotente."
Write-Host "Storage account: $StorageAccount"
Write-Host "Container: data-treated"
Write-Host "Service Bus queue: $QueueName"
Write-Host "Nenhum segredo foi gerado ou exibido por este script."
