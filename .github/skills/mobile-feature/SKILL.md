---
name: mobile-feature
description: "Implementar uma funcionalidade do app Cafe PI em Expo, incluindo tela, estados de dados, tipos, mocks ou API e validacao. Use quando pedirem nova tela, fluxo mobile, componente de campo ou evolucao do prototipo React Native."
---

# Implementar funcionalidade mobile

## Objetivo

Entregar uma funcionalidade navegavel e coerente com o modelo da Sprint 1 sem acoplar a UI aos mocks.

## Procedimento

1. Ler a regra de negocio relacionada em `.cursor/rules/regras-negocio.mdc` e as convencoes mobile em `.cursor/rules/mobile-expo.mdc`.
2. Identificar a tela de entrada, o estado de sessao e os dados necessarios.
3. Definir ou ajustar tipos em `mobile/src/types.ts` antes de renderizar campos novos.
4. Implementar o servico ou adaptador de dados separadamente da tela.
5. Cobrir estados de carregamento, erro, vazio, cache e mock quando forem aplicaveis.
6. Manter os textos em portugues do Brasil e testar em largura estreita.
7. Executar `npm run typecheck` dentro de `mobile/`.

## Criterios de pronto

- A funcionalidade pode ser alcancada pelo fluxo do app.
- A UI nao depende diretamente de um objeto mockado.
- O comportamento sem rede e indicado ao usuario quando houver cache.
- Nenhum token, segredo ou URL privada foi adicionado.
- README ou contrato e atualizado quando a configuracao ou API mudar.
