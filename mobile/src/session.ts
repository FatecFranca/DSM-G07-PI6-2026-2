import * as SecureStore from 'expo-secure-store';
import { AuthResponse } from './api';

const SESSION_KEY = 'cafe-pi-session';

export async function loadSession(): Promise<AuthResponse | null> {
  const value = await SecureStore.getItemAsync(SESSION_KEY);
  return value ? (JSON.parse(value) as AuthResponse) : null;
}

export async function saveSession(session: AuthResponse): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
