// expo-secure-store has no web implementation, so the browser build uses localStorage
const KEY = 'auth_token';

export const tokenStorage = {
  get: async () => localStorage.getItem(KEY),
  set: async (t: string) => localStorage.setItem(KEY, t),
  clear: async () => localStorage.removeItem(KEY),
};
