import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Region, Session } from './types';

const SESSION_KEY = '@cafe-insight/session';
const REGIONS_KEY = '@cafe-insight/regions';
const SNAPSHOT_KEY = '@cafe-insight/snapshot';

export async function saveSession(session: Session) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function getSession(): Promise<Session | null> {
  const value = await AsyncStorage.getItem(SESSION_KEY);
  return value ? JSON.parse(value) as Session : null;
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function saveRegions(regions: Region[]) {
  await AsyncStorage.setItem(REGIONS_KEY, JSON.stringify(regions));
}

export async function getCachedRegions(): Promise<Region[]> {
  const value = await AsyncStorage.getItem(REGIONS_KEY);
  return value ? JSON.parse(value) as Region[] : [];
}

export async function saveSnapshot<T>(snapshot: T) {
  await AsyncStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
}

export async function getSnapshot<T>(): Promise<T | null> {
  const value = await AsyncStorage.getItem(SNAPSHOT_KEY);
  return value ? JSON.parse(value) as T : null;
}
