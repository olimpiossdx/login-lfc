// src/core/auth/session-expiration.ts
const ACCESS_EXPIRES_KEY = 'accessTokenExpiresAt';

export const setAccessTokenExpiresAtLS = (value: number | null) => {
  try {
    if (value == null) {
      localStorage.removeItem(ACCESS_EXPIRES_KEY);
    } else {
      localStorage.setItem(ACCESS_EXPIRES_KEY, String(value));
    }
  } catch {
    // ignore
  }
};

export const getAccessTokenExpiresAtLS = (): number | null => {
  try {
    const raw = localStorage.getItem(ACCESS_EXPIRES_KEY);
    if (!raw) return null;
    const num = Number(raw);
    return Number.isFinite(num) ? num : null;
  } catch {
    return null;
  }
};
