export interface AuthResponse { accessToken: string; email: string; perfil: 'ADMIN' | 'TECNICO' | 'PRODUTOR'; }
export interface Regiao { id: string; nomeRegiao: string; pais: string; uf: string | null; codigoIbge: string | null; latitude: number | null; longitude: number | null; }
export interface Page<T> { data: T[]; total: number; page: number; limit: number; totalPages: number; }
export interface Cultura { id: string; nome: string; slug: string; }
export interface Climatologia { id: string; regiaoId: string; temperaturaMedia: number | null; temperaturaMin: number | null; chuvaMediaDiaria: number | null; chuvaAnual: number | null; umidade: number | null; radiacaoSolar: number | null; temperaturaJaneiro: number | null; temperaturaJulho: number | null; temperaturaMinimaJulho: number | null; chuvaEstacaoSeca: number | null; chuvaVerao: number | null; amplitudeTermica: number | null; contrasteChuva: number | null; periodoInicio: number | null; periodoFim: number | null; versaoDados: string | null; }
export interface CondicaoClimatica { id: string; regiaoId: string; data: string; temperaturaMedia: number | null; precipitacao: number | null; umidade: number | null; radiacaoSolar: number | null; }
export interface SafraRendimento { id: string; regiaoId: string; culturaId: string; anoColheita: number; areaColhidaHa: number | null; producaoT: number | null; rendimentoToneladasHectare: number | null; cultura: Cultura; }
export interface Compatibilidade { id: string; regiaoId: string; culturaId: string; compatibilidade: number; ranking: number | null; versaoModelo: string; aviso: string | null; cultura: Cultura; }
export interface ClusterAssignment { id: string; regiaoId: string; grupo: number; nomeGrupo: string | null; versaoModelo: string; perfil: { nomeGrupo: string | null; quantidadeMunicipios: number; variaveis: Record<string, number>; } | null; }
export interface MetricaModelo { id: string; algoritmo: string; acuracia: number | null; acuraciaBalanceada: number | null; precisao: number | null; recall: number | null; f1: number | null; auc: number | null; baseline: number | null; matrizConfusao: unknown; versaoModelo: string; cultura: Cultura; executadoEm: string; }
export class ApiError extends Error { constructor(message: string, readonly status: number) { super(message); this.name = 'ApiError'; } }
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(/\/$/, '');
async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
 const headers = new Headers(options.headers); headers.set('Content-Type', 'application/json'); if (token) headers.set('Authorization', 'Bearer ' + token);
 let response: Response;
 try {
  response = await fetch(API_URL + path, { ...options, headers });
 } catch {
  throw new ApiError('Não foi possível conectar à API. Verifique se o back-end está em execução.', 0);
 }
 const body = await response.json().catch(() => null) as { message?: string | string[] } | null;
 if (!response.ok) { const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message ?? 'Não foi possível concluir a solicitação.'; throw new ApiError(message, response.status); }
 return body as T;
}
export const api = {
 login(email: string, senha: string) { return request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }); },
 register(nome: string, email: string, senha: string) { return request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ nome, email, senha }) }); },
 regioes(token: string, filters: { q?: string; uf?: string; cultura?: string; page?: number; limit?: number } = {}) { const q = new URLSearchParams(); Object.entries(filters).forEach(([k,v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); }); return request<Page<Regiao>>('/regioes?' + q.toString(), {}, token); },
 culturas(token: string) { return request<Cultura[]>('/culturas', {}, token); },
 clima(regiaoId: string, token: string) { return request<Climatologia | null>('/clima/municipios/' + regiaoId, {}, token); },
 climaHistorico(regiaoId: string, token: string, filters: { de?: string; ate?: string } = {}) { const q = new URLSearchParams(); Object.entries(filters).forEach(([k,v]) => { if (v) q.set(k, v); }); const suffix = q.toString() ? '?' + q.toString() : ''; return request<CondicaoClimatica[]>('/clima/' + regiaoId + suffix, {}, token); },
 safras(regiaoId: string, token: string, cultura?: string) { const q = cultura ? '?cultura=' + encodeURIComponent(cultura) : ''; return request<SafraRendimento[]>('/safra/' + regiaoId + q, {}, token); },
 compatibilidades(regiaoId: string, token: string) { return request<Compatibilidade[]>('/compatibilidades/' + regiaoId, {}, token); },
 ranking(token: string, filters: { cultura?: string; uf?: string; min?: number; page?: number; limit?: number } = {}) { const q = new URLSearchParams(); Object.entries(filters).forEach(([k,v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); }); return request<Page<Compatibilidade> & { aviso: string }>('/compatibilidades?' + q.toString(), {}, token); },
 clusters(regiaoId: string, token: string) { return request<ClusterAssignment[]>('/clusters/' + regiaoId, {}, token); },
 metricas(token: string, cultura?: string) { const q = cultura ? '?cultura=' + encodeURIComponent(cultura) : ''; return request<MetricaModelo[]>('/modelos/metricas' + q, {}, token); },
};
