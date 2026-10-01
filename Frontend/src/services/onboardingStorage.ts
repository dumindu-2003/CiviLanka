import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const KEY = 'civ_onboarding_seen';

function webStore(): Storage | null {
  if (Platform.OS !== 'web') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    const web = webStore();
    if (web) return web.getItem(KEY) === '1';
    return (await SecureStore.getItemAsync(KEY)) === '1';
  } catch {
    return false;
  }
}

export async function markOnboardingSeen(): Promise<void> {
  try {
    const web = webStore();
    if (web) {
      web.setItem(KEY, '1');
      return;
    }
    await SecureStore.setItemAsync(KEY, '1');
  } catch {
    // The officer can still continue to sign in if the flag cannot be saved.
  }
}
