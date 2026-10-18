export interface AuthResponse {
  accessToken: string;
  email: string;
  perfil: "ADMIN" | "TECNICO" | "PRODUTOR";
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

export interface ClusterRegiao {
  regiaoId: string;
  nomeRegiao: string;
  pais: string;
  temperaturaMedia: number;
  quantidadeObservacoes: number;
  cluster: number;
}

export interface Cluster {
  cluster: number;
  centroideTemperaturaMedia: number;
  regioes: ClusterRegiao[];
}

export interface ClustersResponse {
  algoritmo: string;
  k: number;
  variaveis: string[];
  clusters: Cluster[];
  totalRegioes: number;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });
  const body = (await response.json().catch(() => null)) as
    | { message?: string | string[] }
    | null;

  if (!response.ok) {
    const message = Array.isArray(body?.message)
      ? body.message.join(", ")
      : body?.message ?? "Não foi possível concluir a solicitação.";
    throw new ApiError(message, response.status);
  }

  return body as T;
}

export const api = {
  login(email: string, senha: string) {
    return request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, senha }),
    });
  },

  regioes(token: string) {
    return request<Regiao[]>("/regioes", {}, token);
  },

  clima(regiaoId: string, token: string) {
    return request<CondicaoClimatica[]>(`/clima/${regiaoId}`, {}, token);
  },

  safras(regiaoId: string, token: string) {
    return request<SafraRendimento[]>(`/safra/${regiaoId}`, {}, token);
  },

  clusters(token: string) {
    return request<ClustersResponse>("/clusters", {}, token);
  },
};
