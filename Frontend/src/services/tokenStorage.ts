import * as SecureStore from 'expo-secure-store';

const KEY = 'auth_token';

async function settle(task: Promise<unknown>) {
  try {
    await task;
  } catch {
    // Some targets have no secure store. The signed-in session still lives in memory.
  }
}

export const tokenStorage = {
  get: () => SecureStore.getItemAsync(KEY).catch(() => null),
  set: (t: string) => settle(SecureStore.setItemAsync(KEY, t)),
  clear: () => settle(SecureStore.deleteItemAsync(KEY)),
};
