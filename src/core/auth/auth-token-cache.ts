// src/core/auth/auth-token-cache.ts

let accessToken: string | null = null;

/**
 * Atualiza o access token em memória.
 * Use null para limpar.
 */
export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

/**
 * Retorna o access token atual da memória.
 */
export const getAccessToken = (): string | null => accessToken;
