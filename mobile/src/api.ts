export type Perfil = 'ADMIN' | 'TECNICO' | 'PRODUTOR';

export interface AuthResponse {
  accessToken: string;
  email: string;
  perfil: Perfil;
}

export interface Regiao {
  id: string;
  nomeRegiao: string;
  pais: string;
  latitude: number | null;
  longitude: number | null;
}

export interface CondicaoClimatica {
  id: string;
  regiaoId: string;
  data: string;
  temperaturaMedia: number | null;
  precipitacao: number | null;
  umidade: number | null;
  radiacaoSolar: number | null;
}

export interface SafraRendimento {
  id: string;
  regiaoId: string;
  anoColheita: number;
  diasCrescimento: number | null;
  rendimentoToneladasHectare: number | null;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const body = (await response.json().catch(() => null)) as
    | { message?: string | string[] }
    | null;

  if (!response.ok) {
    const message = Array.isArray(body?.message)
      ? body.message.join(', ')
      : body?.message ?? 'Não foi possível concluir a solicitação.';
    throw new ApiError(message, response.status);
  }

  return body as T;
}

export const api = {
  login(email: string, senha: string) {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, senha }),
    });
  },
  regioes(token: string) {
    return request<Regiao[]>('/regioes', {}, token);
  },
  clima(
    regiaoId: string,
    token: string,
    filtros: { de?: string; ate?: string } = {},
  ) {
    const params = new URLSearchParams();
    if (filtros.de) params.set('de', filtros.de);
    if (filtros.ate) params.set('ate', filtros.ate);
    const query = params.toString();
    return request<CondicaoClimatica[]>(
      `/clima/${regiaoId}${query ? `?${query}` : ''}`,
      {},
      token,
    );
  },
  safras(regiaoId: string, token: string, ano?: number) {
    const query = ano ? `?ano=${ano}` : '';
    return request<SafraRendimento[]>(`/safra/${regiaoId}${query}`, {}, token);
  },
};
