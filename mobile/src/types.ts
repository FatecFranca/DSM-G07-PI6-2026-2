/**
 * Tipos de estado interno das telas, complementando os contratos HTTP de api.ts.
 *
 * RegionDetail agrega os dados carregados em paralelo para uma região —
 * é um tipo de UI, não um contrato de API.
 */

import type {
  ClusterAssignment,
  Climatologia,
  Compatibilidade,
  PrevisaoProdutividade,
  SafraRendimento,
} from './api';

/** Dados de detalhe de uma região carregados em paralelo pelas telas. */
export interface RegionDetail {
  clima: Climatologia | null;
  safras: SafraRendimento[];
  compatibilidades: Compatibilidade[];
  clusters: ClusterAssignment[];
  predicoes: PrevisaoProdutividade[];
}
