const canUseLocalStorage = () => typeof window !== 'undefined' && window.localStorage !== undefined;

export const storage = {
  get<T>(key: string, fallback: T): T {
    if (!canUseLocalStorage()) {
      return fallback;
    }

    try {
      const value = window.localStorage.getItem(key);
      return value === null ? fallback : (JSON.parse(value) as T);
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    if (!canUseLocalStorage()) {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable or full; progress remains in memory.
    }
  },

  remove(key: string): void {
    if (!canUseLocalStorage()) {
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage failures when clearing progress.
    }
  },
};
