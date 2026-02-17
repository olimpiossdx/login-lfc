// src/core/auth/auth-token-cache.ts

let accessToken: number | null = null;
let accessTokenExpiresAt: number | null = null;
let refreshTokenExpiresAt: number | null = null;

/**
 * Atualiza o access token e seus tempos de expiração em memória.
 * Use null para limpar.
 */
export const setAccessToken = (token: number | null): void => {
  accessToken = token;
};

export const setAccessTokenExpiresAt = (expiresAt: number | null): void => {
  accessTokenExpiresAt = expiresAt;
};

export const setRefreshTokenExpiresAt = (expiresAt: number | null): void => {
  refreshTokenExpiresAt = expiresAt;
};

/**
 * Retorna o access token atual da memória.
 */
export const getAccessToken = (): number | null => accessToken;

export const getAccessTokenExpiresAt = (): number | null => accessTokenExpiresAt;

export const getRefreshTokenExpiresAt = (): number | null => refreshTokenExpiresAt;

/**
 * Limpa todos os tokens e tempos de expiração.
 */
export const clearTokenCache = (): void => {
  accessToken = null;
  accessTokenExpiresAt = null;
  refreshTokenExpiresAt = null;
};
