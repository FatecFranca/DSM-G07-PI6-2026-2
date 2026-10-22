# Café PI - Mobile

Aplicativo React Native com Expo para consumir a mesma API NestJS usada pelo
Web. O primeiro fluxo implementado é login, sessão segura, logout e consulta
de regiões.

## Configuração

Instale as dependências e copie `.env.example` para `.env`:

```powershell
npm install
copy .env.example .env
npm start
```

Em dispositivo físico ou emulador, `localhost` normalmente aponta para o
próprio dispositivo. Use o endereço IP da máquina que executa o backend:

```env
EXPO_PUBLIC_API_URL="http://192.168.0.10:3001"
```

O backend precisa aceitar conexões nessa interface e a porta 3001 deve estar
acessível na rede local.

## Validação

```powershell
npx tsc --noEmit
npm start
```

O token é armazenado com `expo-secure-store`, não em `localStorage`. O backend
continua responsável por validar JWT e permissões; o aplicativo apenas ajusta
a interface conforme o perfil retornado.


## Dados municipais

A lista consome municípios vinculados ao usuário; o detalhe mostra climatologia anual e sazonal, produção por cultura, cluster e compatibilidades versionadas. Compatibilidade é exploratória, não recomendação agronômica. Cache offline não está implementado nesta etapa.
