// src/core/auth/auth-token-cache.ts

let accessToken: number | null = null;

/**
 * Atualiza o access token em memória.
 * Use null para limpar.
 */
export const setAccessToken = (token: number | null): void => {
  accessToken = token;
};

/**
 * Retorna o access token atual da memória.
 */
export const getAccessToken = (): number | null => accessToken;
