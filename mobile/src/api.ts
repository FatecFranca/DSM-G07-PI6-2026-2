import type { ClimateRecord, HarvestRecord, Region, Session } from './types';
import {
  demoRegions,
  demoSession,
  getMockClimate,
  getMockHarvest,
} from './mocks';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';
const USE_API = process.env.EXPO_PUBLIC_USE_API === 'true';

type LoginInput = { email: string; senha: string };

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`A API respondeu com status ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export async function login(input: LoginInput): Promise<Session> {
  if (!USE_API) {
    return { ...demoSession, email: input.email };
  }

  return request<Session>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getRegions(token?: string): Promise<Region[]> {
  if (!USE_API) return demoRegions;
  return request<Region[]>('/regioes', {}, token);
}

export async function getClimate(regionId: number, token?: string): Promise<ClimateRecord[]> {
  if (!USE_API) return getMockClimate(regionId);
  return request<ClimateRecord[]>(`/clima/${regionId}`, {}, token);
}

export async function getHarvest(regionId: number, token?: string): Promise<HarvestRecord[]> {
  if (!USE_API) return getMockHarvest(regionId);
  return request<HarvestRecord[]>(`/safra/${regionId}`, {}, token);
}

export const apiConfig = { API_URL, USE_API };
