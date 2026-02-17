// src/core/auth/session-expiration.ts

const ACCESS_EXPIRES_KEY = 'accessTokenExpiresAt';
const REFRESH_EXPIRES_KEY = 'refreshTokenExpiresAt';

/**
 * Salva o tempo de expiração do access token no localStorage.
 */
export const setAccessTokenExpiresAtLS = (value: number | null) => {
  try {
    if (value === null) {
      localStorage.removeItem(ACCESS_EXPIRES_KEY);
    } else {
      localStorage.setItem(ACCESS_EXPIRES_KEY, String(value));
    }
  } catch {
    // ignore
  }
};

/**
 * Salva o tempo de expiração do refresh token no localStorage.
 */
export const setRefreshTokenExpiresAtLS = (value: number | null) => {
  try {
    if (value === null) {
      localStorage.removeItem(REFRESH_EXPIRES_KEY);
    } else {
      localStorage.setItem(REFRESH_EXPIRES_KEY, String(value));
    }
  } catch {
    // ignore
  }
};

/**
 * Recupera o tempo de expiração do access token do localStorage.
 */
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

/**
 * Recupera o tempo de expiração do refresh token do localStorage.
 */
export const getRefreshTokenExpiresAtLS = (): number | null => {
  try {
    const raw = localStorage.getItem(REFRESH_EXPIRES_KEY);
    if (!raw) return null;
    const num = Number(raw);
    return Number.isFinite(num) ? num : null;
  } catch {
    return null;
  }
};

/**
 * Calcula o tempo restante até a expiração em milissegundos.
 */
export const getTimeUntilExpiration = (expiresAt: number): number => {
  return Math.max(0, expiresAt - Date.now());
};

/**
 * Verifica se um token está expirado.
 */
export const isTokenExpired = (expiresAt: number | null): boolean => {
  if (expiresAt === null) return true;
  return Date.now() >= expiresAt;
};

/**
 * Verifica se o token está próximo de expirar (menos de 5 minutos).
 */
export const isTokenNearExpiration = (expiresAt: number | null, thresholdMs: number = 300000): boolean => {
  if (expiresAt === null) return false;
  const timeRemaining = getTimeUntilExpiration(expiresAt);
  return timeRemaining > 0 && timeRemaining <= thresholdMs;
};

/**
 * Limpa todos os tempos de expiração do localStorage.
 */
export const clearExpirationData = (): void => {
  setAccessTokenExpiresAtLS(null);
  setRefreshTokenExpiresAtLS(null);
};
