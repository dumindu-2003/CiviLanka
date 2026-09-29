import * as SecureStore from 'expo-secure-store';

const KEY = 'auth_token';

export const tokenStorage = {
  get: () => SecureStore.getItemAsync(KEY),
  set: (t: string) => SecureStore.setItemAsync(KEY, t),
  clear: () => SecureStore.deleteItemAsync(KEY),
};
