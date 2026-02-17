// src/core/auth/auth-metadata-cache.ts
import type { IAuthUser } from './auth-service.types';

const METADATA_KEY = 'authMetadata';

export interface CachedAuthMetadata {
  user: IAuthUser;
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
}

/**
 * Obtém metadata completa do cache (localStorage)
 */
export const getAuthMetadata = (): CachedAuthMetadata | null => {
  try {
    const data = localStorage.getItem(METADATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/**
 * Salva metadata completa no cache (localStorage)
 */
export const setAuthMetadata = (metadata: CachedAuthMetadata | null): void => {
  try {
    if (metadata) {
      localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
    } else {
      localStorage.removeItem(METADATA_KEY);
    }
  } catch {
    // noop
  }
};

/**
 * Limpa metadata do cache
 */
export const clearAuthMetadata = (): void => {
  setAuthMetadata(null);
};
