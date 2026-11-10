/**
 * Dados de demonstração para desenvolvimento e testes sem backend.
 *
 * Todos os valores respeitam os tipos de api.ts e types.ts.
 * Nenhum componente ou tela importa este arquivo diretamente —
 * ele é injetado pelas telas via prop `detailOverride` / `regioesOverride`
 * quando USE_DEMO=true.
 *
 * Os valores foram construídos a partir do seed descrito em docs/documentacao.md
 * (seção 7.4): 3 regiões de ES/MG/SP, 4 culturas, climatologias e
 * previsões de 2026 na versão demo-2026-1.
 */

import type {
  AuthResponse,
  Climatologia,
  ClusterAssignment,
  Compatibilidade,
  Page,
  PrevisaoProdutividade,
  Regiao,
  SafraRendimento,
} from './api';
import type { RegionDetail } from './types';

// ---------------------------------------------------------------------------
// Sessão de demonstração (perfil TECNICO para ver regiões vinculadas)
// ---------------------------------------------------------------------------
export const DEMO_SESSION: AuthResponse = {
  accessToken: 'demo-token',
  email: 'tecnico@cafe-pi.local',
  perfil: 'TECNICO',
};

// ---------------------------------------------------------------------------
// Regiões
// ---------------------------------------------------------------------------
const REGIAO_FRANCA: Regiao = {
  id: 'demo-franca',
  nomeRegiao: 'Franca',
  pais: 'Brasil',
  uf: 'SP',
  codigoIbge: '3516200',
  latitude: -20.5386,
  longitude: -47.4008,
};

const REGIAO_POCOS: Regiao = {
  id: 'demo-pocos',
  nomeRegiao: 'Poços de Caldas',
  pais: 'Brasil',
  uf: 'MG',
  codigoIbge: '3151800',
  latitude: -21.7895,
  longitude: -46.5613,
};

const REGIAO_VITORIAS: Regiao = {
  id: 'demo-vitorias',
  nomeRegiao: 'Vitória',
  pais: 'Brasil',
  uf: 'ES',
  codigoIbge: '3205309',
  latitude: -20.3155,
  longitude: -40.3128,
};

export const DEMO_REGIOES: Page<Regiao> = {
  data: [REGIAO_FRANCA, REGIAO_POCOS, REGIAO_VITORIAS],
  total: 3,
  page: 1,
  limit: 50,
  totalPages: 1,
};

// ---------------------------------------------------------------------------
// Culturas auxiliares
// ---------------------------------------------------------------------------
const CULT_CAFE = { id: 'cult-cafe', nome: 'Café', slug: 'cafe' };
const CULT_CANA = { id: 'cult-cana', nome: 'Cana-de-açúcar', slug: 'cana-de-acucar' };
const CULT_SOJA = { id: 'cult-soja', nome: 'Soja', slug: 'soja' };
const CULT_MILHO = { id: 'cult-milho', nome: 'Milho', slug: 'milho' };
const CULT_LARANJA = { id: 'cult-laranja', nome: 'Laranja', slug: 'laranja' };
const CULT_FEIJAO = { id: 'cult-feijao', nome: 'Feijão', slug: 'feijao' };

// ---------------------------------------------------------------------------
// Detalhes por região: Franca (SP)
// ---------------------------------------------------------------------------
const CLIMA_FRANCA: Climatologia = {
  id: 'cli-franca',
  regiaoId: 'demo-franca',
  temperaturaMedia: 21.3,
  temperaturaMin: 14.8,
  chuvaMediaDiaria: 3.82,
  chuvaAnual: 1394,
  umidade: 72,
  radiacaoSolar: 18.4,
  temperaturaJaneiro: 23.9,
  temperaturaJulho: 17.1,
  temperaturaMinimaJulho: 10.2,
  chuvaEstacaoSeca: 38,
  chuvaVerao: 298,
  amplitudeTermica: 11.6,
  contrasteChuva: 7.84,
  periodoInicio: 2001,
  periodoFim: 2022,
  versaoDados: 'nasa-power-v2',
};

const SAFRAS_FRANCA: SafraRendimento[] = [
  { id: 'sf-franca-cafe-22', regiaoId: 'demo-franca', culturaId: CULT_CAFE.id, anoColheita: 2022, areaColhidaHa: 12400, producaoT: 24180, rendimentoToneladasHectare: 1.95, cultura: CULT_CAFE },
  { id: 'sf-franca-cafe-23', regiaoId: 'demo-franca', culturaId: CULT_CAFE.id, anoColheita: 2023, areaColhidaHa: 12800, producaoT: 26112, rendimentoToneladasHectare: 2.04, cultura: CULT_CAFE },
  { id: 'sf-franca-cafe-24', regiaoId: 'demo-franca', culturaId: CULT_CAFE.id, anoColheita: 2024, areaColhidaHa: 13100, producaoT: 27541, rendimentoToneladasHectare: 2.10, cultura: CULT_CAFE },
  { id: 'sf-franca-milho-22', regiaoId: 'demo-franca', culturaId: CULT_MILHO.id, anoColheita: 2022, areaColhidaHa: 3200, producaoT: 19200, rendimentoToneladasHectare: 6.00, cultura: CULT_MILHO },
  { id: 'sf-franca-milho-23', regiaoId: 'demo-franca', culturaId: CULT_MILHO.id, anoColheita: 2023, areaColhidaHa: 3400, producaoT: 21080, rendimentoToneladasHectare: 6.20, cultura: CULT_MILHO },
];

const CLUSTERS_FRANCA: ClusterAssignment[] = [
  {
    id: 'cl-franca',
    grupo: 3,
    versaoModelo: 'kmeans-v1',
    nomeGrupo: 'Subtropical úmido de altitude',
    perfil: { nomeGrupo: 'Subtropical úmido de altitude' },
  },
];

const COMPAT_FRANCA: Compatibilidade[] = [
  { id: 'cp-franca-cafe',   regiaoId: 'demo-franca', culturaId: CULT_CAFE.id,   compatibilidade: 0.879, ranking: 1, versaoModelo: 'clf-v1', aviso: null, cultura: CULT_CAFE   },
  { id: 'cp-franca-milho',  regiaoId: 'demo-franca', culturaId: CULT_MILHO.id,  compatibilidade: 0.734, ranking: 2, versaoModelo: 'clf-v1', aviso: null, cultura: CULT_MILHO  },
  { id: 'cp-franca-feijao', regiaoId: 'demo-franca', culturaId: CULT_FEIJAO.id, compatibilidade: 0.678, ranking: 3, versaoModelo: 'clf-v1', aviso: null, cultura: CULT_FEIJAO },
  { id: 'cp-franca-soja',   regiaoId: 'demo-franca', culturaId: CULT_SOJA.id,   compatibilidade: 0.481, ranking: 4, versaoModelo: 'clf-v1', aviso: null, cultura: CULT_SOJA   },
  { id: 'cp-franca-laranja',regiaoId: 'demo-franca', culturaId: CULT_LARANJA.id,compatibilidade: 0.412, ranking: 5, versaoModelo: 'clf-v1', aviso: null, cultura: CULT_LARANJA},
  { id: 'cp-franca-cana',   regiaoId: 'demo-franca', culturaId: CULT_CANA.id,   compatibilidade: 0.318, ranking: 6, versaoModelo: 'clf-v1', aviso: null, cultura: CULT_CANA   },
];

const PRED_FRANCA: PrevisaoProdutividade[] = [
  {
    id: 'pred-franca-cafe-26',
    cultura: CULT_CAFE,
    ano: 2026,
    valor: 2.18,
    unidade: 't/ha',
    algoritmo: 'Random Forest',
    versaoModelo: 'demo-2026-1',
    versaoDados: 'ibge-pam-2024',
    features: { temperaturaMedia: 21.3, chuvaAnual: 1394, umidade: 72 },
    metricas: { r2: 0.14, rmse: 0.41 },
    aviso: 'Previsão estatística exploratória; não é recomendação agronômica.',
    executadoEm: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'pred-franca-milho-26',
    cultura: CULT_MILHO,
    ano: 2026,
    valor: 6.45,
    unidade: 't/ha',
    algoritmo: 'Gradient Boosting',
    versaoModelo: 'demo-2026-1',
    versaoDados: 'ibge-pam-2024',
    features: { temperaturaMedia: 21.3, chuvaAnual: 1394, umidade: 72 },
    metricas: { r2: 0.09, rmse: 1.12 },
    aviso: 'Previsão estatística exploratória; não é recomendação agronômica.',
    executadoEm: '2026-01-15T10:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Detalhes por região: Poços de Caldas (MG)
// ---------------------------------------------------------------------------
const CLIMA_POCOS: Climatologia = {
  id: 'cli-pocos',
  regiaoId: 'demo-pocos',
  temperaturaMedia: 19.8,
  temperaturaMin: 12.1,
  chuvaMediaDiaria: 3.96,
  chuvaAnual: 1446,
  umidade: 76,
  radiacaoSolar: 17.2,
  temperaturaJaneiro: 22.4,
  temperaturaJulho: 15.6,
  temperaturaMinimaJulho: 8.4,
  chuvaEstacaoSeca: 22,
  chuvaVerao: 312,
  amplitudeTermica: 13.2,
  contrasteChuva: 14.18,
  periodoInicio: 2001,
  periodoFim: 2022,
  versaoDados: 'nasa-power-v2',
};

const SAFRAS_POCOS: SafraRendimento[] = [
  { id: 'sf-pocos-cafe-22', regiaoId: 'demo-pocos', culturaId: CULT_CAFE.id, anoColheita: 2022, areaColhidaHa: 8900, producaoT: 18069, rendimentoToneladasHectare: 2.03, cultura: CULT_CAFE },
  { id: 'sf-pocos-cafe-23', regiaoId: 'demo-pocos', culturaId: CULT_CAFE.id, anoColheita: 2023, areaColhidaHa: 9200, producaoT: 19412, rendimentoToneladasHectare: 2.11, cultura: CULT_CAFE },
  { id: 'sf-pocos-cafe-24', regiaoId: 'demo-pocos', culturaId: CULT_CAFE.id, anoColheita: 2024, areaColhidaHa: 9400, producaoT: 20116, rendimentoToneladasHectare: 2.14, cultura: CULT_CAFE },
];

const CLUSTERS_POCOS: ClusterAssignment[] = [
  {
    id: 'cl-pocos',
    grupo: 3,
    versaoModelo: 'kmeans-v1',
    nomeGrupo: 'Subtropical úmido de altitude',
    perfil: { nomeGrupo: 'Subtropical úmido de altitude' },
  },
];

const COMPAT_POCOS: Compatibilidade[] = [
  { id: 'cp-pocos-cafe',   regiaoId: 'demo-pocos', culturaId: CULT_CAFE.id,   compatibilidade: 0.881, ranking: 1, versaoModelo: 'clf-v1', aviso: null, cultura: CULT_CAFE   },
  { id: 'cp-pocos-feijao', regiaoId: 'demo-pocos', culturaId: CULT_FEIJAO.id, compatibilidade: 0.702, ranking: 2, versaoModelo: 'clf-v1', aviso: null, cultura: CULT_FEIJAO },
  { id: 'cp-pocos-milho',  regiaoId: 'demo-pocos', culturaId: CULT_MILHO.id,  compatibilidade: 0.699, ranking: 3, versaoModelo: 'clf-v1', aviso: null, cultura: CULT_MILHO  },
  { id: 'cp-pocos-soja',   regiaoId: 'demo-pocos', culturaId: CULT_SOJA.id,   compatibilidade: 0.455, ranking: 4, versaoModelo: 'clf-v1', aviso: null, cultura: CULT_SOJA   },
  { id: 'cp-pocos-laranja',regiaoId: 'demo-pocos', culturaId: CULT_LARANJA.id,compatibilidade: 0.389, ranking: 5, versaoModelo: 'clf-v1', aviso: null, cultura: CULT_LARANJA},
  { id: 'cp-pocos-cana',   regiaoId: 'demo-pocos', culturaId: CULT_CANA.id,   compatibilidade: 0.271, ranking: 6, versaoModelo: 'clf-v1', aviso: null, cultura: CULT_CANA   },
];

const PRED_POCOS: PrevisaoProdutividade[] = [
  {
    id: 'pred-pocos-cafe-26',
    cultura: CULT_CAFE,
    ano: 2026,
    valor: 2.21,
    unidade: 't/ha',
    algoritmo: 'Random Forest',
    versaoModelo: 'demo-2026-1',
    versaoDados: 'ibge-pam-2024',
    features: { temperaturaMedia: 19.8, chuvaAnual: 1446, umidade: 76 },
    metricas: { r2: 0.14, rmse: 0.41 },
    aviso: 'Previsão estatística exploratória; não é recomendação agronômica.',
    executadoEm: '2026-01-15T10:00:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Detalhes por região: Vitória (ES) — sem predições ainda
// ---------------------------------------------------------------------------
const CLIMA_VITORIAS: Climatologia = {
  id: 'cli-vitorias',
  regiaoId: 'demo-vitorias',
  temperaturaMedia: 24.9,
  temperaturaMin: 19.1,
  chuvaMediaDiaria: 3.33,
  chuvaAnual: 1215,
  umidade: 80,
  radiacaoSolar: 19.8,
  temperaturaJaneiro: 27.2,
  temperaturaJulho: 22.1,
  temperaturaMinimaJulho: 17.3,
  chuvaEstacaoSeca: 52,
  chuvaVerao: 276,
  amplitudeTermica: 8.4,
  contrasteChuva: 5.31,
  periodoInicio: 2001,
  periodoFim: 2022,
  versaoDados: 'nasa-power-v2',
};

const SAFRAS_VITORIAS: SafraRendimento[] = [
  { id: 'sf-vitorias-cana-22', regiaoId: 'demo-vitorias', culturaId: CULT_CANA.id, anoColheita: 2022, areaColhidaHa: 21000, producaoT: 1617000, rendimentoToneladasHectare: 77.0, cultura: CULT_CANA },
  { id: 'sf-vitorias-cana-23', regiaoId: 'demo-vitorias', culturaId: CULT_CANA.id, anoColheita: 2023, areaColhidaHa: 21500, producaoT: 1677000, rendimentoToneladasHectare: 78.0, cultura: CULT_CANA },
  { id: 'sf-vitorias-cana-24', regiaoId: 'demo-vitorias', culturaId: CULT_CANA.id, anoColheita: 2024, areaColhidaHa: 22000, producaoT: 1738000, rendimentoToneladasHectare: 79.0, cultura: CULT_CANA },
];

const CLUSTERS_VITORIAS: ClusterAssignment[] = [
  {
    id: 'cl-vitorias',
    grupo: 1,
    versaoModelo: 'kmeans-v1',
    nomeGrupo: 'Tropical litorâneo quente',
    perfil: { nomeGrupo: 'Tropical litorâneo quente' },
  },
];

const COMPAT_VITORIAS: Compatibilidade[] = [
  { id: 'cp-vitorias-cana',   regiaoId: 'demo-vitorias', culturaId: CULT_CANA.id,   compatibilidade: 0.918, ranking: 1, versaoModelo: 'clf-v1', aviso: null, cultura: CULT_CANA   },
  { id: 'cp-vitorias-milho',  regiaoId: 'demo-vitorias', culturaId: CULT_MILHO.id,  compatibilidade: 0.673, ranking: 2, versaoModelo: 'clf-v1', aviso: null, cultura: CULT_MILHO  },
  { id: 'cp-vitorias-laranja',regiaoId: 'demo-vitorias', culturaId: CULT_LARANJA.id,compatibilidade: 0.601, ranking: 3, versaoModelo: 'clf-v1', aviso: null, cultura: CULT_LARANJA},
  { id: 'cp-vitorias-soja',   regiaoId: 'demo-vitorias', culturaId: CULT_SOJA.id,   compatibilidade: 0.382, ranking: 4, versaoModelo: 'clf-v1', aviso: null, cultura: CULT_SOJA   },
  { id: 'cp-vitorias-feijao', regiaoId: 'demo-vitorias', culturaId: CULT_FEIJAO.id, compatibilidade: 0.354, ranking: 5, versaoModelo: 'clf-v1', aviso: null, cultura: CULT_FEIJAO },
  { id: 'cp-vitorias-cafe',   regiaoId: 'demo-vitorias', culturaId: CULT_CAFE.id,   compatibilidade: 0.201, ranking: 6, versaoModelo: 'clf-v1', aviso: null, cultura: CULT_CAFE   },
];

// Vitória não tem predições publicadas — testa o estado vazio da seção.
const PRED_VITORIAS: PrevisaoProdutividade[] = [];

// ---------------------------------------------------------------------------
// Mapa de detalhes indexado por regiaoId
// ---------------------------------------------------------------------------
export const DEMO_DETAILS: Record<string, RegionDetail> = {
  'demo-franca': {
    clima: CLIMA_FRANCA,
    safras: SAFRAS_FRANCA,
    compatibilidades: COMPAT_FRANCA,
    clusters: CLUSTERS_FRANCA,
    predicoes: PRED_FRANCA,
  },
  'demo-pocos': {
    clima: CLIMA_POCOS,
    safras: SAFRAS_POCOS,
    compatibilidades: COMPAT_POCOS,
    clusters: CLUSTERS_POCOS,
    predicoes: PRED_POCOS,
  },
  'demo-vitorias': {
    clima: CLIMA_VITORIAS,
    safras: SAFRAS_VITORIAS,
    compatibilidades: COMPAT_VITORIAS,
    clusters: CLUSTERS_VITORIAS,
    predicoes: PRED_VITORIAS,
  },
};
