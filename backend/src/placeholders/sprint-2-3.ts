/**
 * Registro dos endpoints analíticos das Sprints 2 e 3:
 * - GET /clusters — agrupamento K-Means persistido (RF03.4 / RF02.2)
 * - GET /predicoes/:regiaoId — previsão offline de produtividade (RF03.5 / RF02.3)
 */
export const SPRINT_2_3_ENDPOINTS = {
  clusters: 'GET /clusters',
  predicoes: 'GET /predicoes/:regiaoId',
} as const;
