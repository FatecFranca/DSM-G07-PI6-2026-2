export type Profile = 'ADMIN' | 'TECNICO' | 'PRODUTOR';

export type Region = {
  id: number;
  nomeRegiao: string;
  pais: string;
  latitude: number;
  longitude: number;
};

export type ClimateRecord = {
  id: number;
  regiaoId: number;
  data: string;
  temperaturaMedia: number;
  precipitacao: number;
  umidade: number;
  radiacaoSolar: number;
};

export type HarvestRecord = {
  id: number;
  regiaoId: number;
  anoColheita: number;
  diasCrescimento: number;
  rendimentoToneladasHectare: number;
};

export type Session = {
  accessToken: string;
  email: string;
  perfil: Profile;
};

export type AnalyticsSnapshot = {
  cluster: string;
  clusterDescription: string;
  prediction: number;
  margin: number;
};
