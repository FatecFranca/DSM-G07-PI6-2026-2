import type {
  AnalyticsSnapshot,
  ClimateRecord,
  HarvestRecord,
  Region,
  Session,
} from './types';

export const demoSession: Session = {
  accessToken: 'demo-token',
  email: 'produtor@cafeinsight.demo',
  perfil: 'PRODUTOR',
};

export const demoRegions: Region[] = [
  {
    id: 1,
    nomeRegiao: 'Alta Mogiana',
    pais: 'Brasil',
    latitude: -20.54,
    longitude: -47.4,
  },
  {
    id: 2,
    nomeRegiao: 'Sul de Minas',
    pais: 'Brasil',
    latitude: -21.7,
    longitude: -45.25,
  },
];

const climateByRegion: Record<number, ClimateRecord[]> = {
  1: [
    {
      id: 101,
      regiaoId: 1,
      data: '2026-08-28',
      temperaturaMedia: 21.4,
      precipitacao: 12.8,
      umidade: 72,
      radiacaoSolar: 18.6,
    },
    {
      id: 102,
      regiaoId: 1,
      data: '2026-08-29',
      temperaturaMedia: 22.1,
      precipitacao: 4.2,
      umidade: 68,
      radiacaoSolar: 20.1,
    },
    {
      id: 103,
      regiaoId: 1,
      data: '2026-08-30',
      temperaturaMedia: 20.8,
      precipitacao: 8.7,
      umidade: 75,
      radiacaoSolar: 16.9,
    },
  ],
  2: [
    {
      id: 201,
      regiaoId: 2,
      data: '2026-08-28',
      temperaturaMedia: 19.7,
      precipitacao: 10.3,
      umidade: 76,
      radiacaoSolar: 17.2,
    },
    {
      id: 202,
      regiaoId: 2,
      data: '2026-08-29',
      temperaturaMedia: 20.4,
      precipitacao: 6.1,
      umidade: 71,
      radiacaoSolar: 19.4,
    },
    {
      id: 203,
      regiaoId: 2,
      data: '2026-08-30',
      temperaturaMedia: 18.9,
      precipitacao: 14.6,
      umidade: 79,
      radiacaoSolar: 15.8,
    },
  ],
};

const harvestByRegion: Record<number, HarvestRecord[]> = {
  1: [
    { id: 301, regiaoId: 1, anoColheita: 2024, diasCrescimento: 238, rendimentoToneladasHectare: 2.8 },
    { id: 302, regiaoId: 1, anoColheita: 2025, diasCrescimento: 241, rendimentoToneladasHectare: 3.1 },
    { id: 303, regiaoId: 1, anoColheita: 2026, diasCrescimento: 239, rendimentoToneladasHectare: 3.4 },
  ],
  2: [
    { id: 401, regiaoId: 2, anoColheita: 2024, diasCrescimento: 245, rendimentoToneladasHectare: 2.5 },
    { id: 402, regiaoId: 2, anoColheita: 2025, diasCrescimento: 247, rendimentoToneladasHectare: 2.9 },
    { id: 403, regiaoId: 2, anoColheita: 2026, diasCrescimento: 244, rendimentoToneladasHectare: 3.2 },
  ],
};

const analyticsByRegion: Record<number, AnalyticsSnapshot> = {
  1: {
    cluster: 'Perfil serrano produtivo',
    clusterDescription: 'Temperatura amena e boa disponibilidade hídrica.',
    prediction: 3.6,
    margin: 0.3,
  },
  2: {
    cluster: 'Perfil úmido de altitude',
    clusterDescription: 'Umidade alta com rendimento consistente.',
    prediction: 3.4,
    margin: 0.4,
  },
};

export function getMockClimate(regionId: number) {
  return climateByRegion[regionId] ?? [];
}

export function getMockHarvest(regionId: number) {
  return harvestByRegion[regionId] ?? [];
}

export function getMockAnalytics(regionId: number) {
  return analyticsByRegion[regionId] ?? analyticsByRegion[1];
}
