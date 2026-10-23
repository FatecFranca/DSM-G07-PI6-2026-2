# Plataforma agrícola - Web

Front-end web em Next.js App Router, integrado à API NestJS. A mesma API e os
mesmos contratos tipados da camada `src/lib/api.ts` devem ser reutilizados pelo
futuro aplicativo React Native/Expo.

## Configuração

Crie `web/.env.local` a partir de `.env.example`:

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

O front usa essa variável tanto no navegador quanto durante o build. Quando a
API estiver em outro host, informe a URL pública completa, sem depender de
`localhost`.

O valor deve apontar para uma API acessível pelo navegador. No futuro mobile,
use a URL acessível pelo dispositivo ou emulador, não `localhost` do computador
quando essa URL não estiver disponível no dispositivo.

Regra da Home page: todo estilo de `src/app/page.tsx` deve ser escrito com
classes Tailwind; não criar ou reintroduzir CSS modular em `page.module.css`.

## Execução

```bash
npm install
npm run dev
```

A aplicação fica disponível em `http://localhost:3000`.

O fluxo atual inclui:

- login real em `POST /auth/login`;
- sessão JWT armazenada no navegador para o protótipo;
- proteção do dashboard sem sessão;
- regiões reais de `GET /regioes`;
- climatologia de `GET /clima/municipios/:regiaoId` e histórico de `GET /clima/:regiaoId`;
- safras de `GET /safra/:regiaoId`;
- perfil preliminar de `GET /clusters`;
- logout e tratamento de carregamento, vazio e erro.

## Validação

```bash
npm run lint
npm run build
```

## Contrato para o mobile

O mobile deverá enviar o mesmo cabeçalho para rotas privadas:

```http
Authorization: Bearer <accessToken>
```

Os tipos de resposta e os caminhos estão centralizados em
`src/lib/api.ts`. O mobile deve manter a URL da API em configuração própria
de ambiente e consumir a API NestJS, sem duplicar regras de negócio.


## Contrato municipal

O dashboard usa a busca paginada de municípios, catálogo de culturas, climatologia anual e sazonal, produção por cultura, compatibilidades e métricas do modelo. Compatibilidade é exploratória, não recomendação de plantio. O dashboard apresenta grupos climáticos persistidos quando carregados. Até a importação dos dados analíticos, as telas vazias informam que os resultados não estão disponíveis.
