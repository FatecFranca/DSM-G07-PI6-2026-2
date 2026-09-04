# Cafe Insight Mobile

Aplicativo React Native com Expo para o prototipo mobile da Sprint 1. O fluxo demonstra login, regioes vinculadas, clima recente, historico de rendimento e indicadores analiticos.

## Executar

```bash
npm install
npm start
```

Depois, abra o projeto no Expo Go, emulador Android/iOS ou navegador.

## Dados da demonstracao

Por padrao, o app usa dados mockados para permitir a apresentacao sem backend. Para consumir a API NestJS, crie um `.env` baseado em `.env.example`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_USE_API=true
```

Em um dispositivo fisico, `localhost` aponta para o proprio celular. Use o IP local da maquina que executa o backend, por exemplo `http://192.168.0.10:3001`, ou uma URL hospedada.

As rotas integradas sao `POST /auth/login`, `GET /regioes`, `GET /clima/:regiaoId` e `GET /safra/:regiaoId`. Cluster e predicao permanecem mockados nesta Sprint 1 porque os endpoints pertencem as proximas sprints.

## Validacao

```bash
npm run typecheck
```

O app salva a sessao, as regioes e o ultimo snapshot no AsyncStorage. Quando a API estiver indisponivel, o ultimo dado valido e apresentado com indicacao de modo offline.

## Escopo futuro

- Conectar cluster e predicao aos endpoints analiticos reais.
- Aplicar guards JWT e autorizacao por regiao no backend.
- Adicionar testes automatizados de componentes e fluxo.