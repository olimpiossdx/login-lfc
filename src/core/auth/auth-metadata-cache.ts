// src/core/auth/auth-metadata-cache.ts
import type { AuthMetadata } from '../../service/types';

const METADATA_KEY = '@app:auth-metadata';

export const getAuthMetadata = (): AuthMetadata | null => {
  try {
    const data = localStorage.getItem(METADATA_KEY);
    if (!data) return null;
    
    return JSON.parse(data) as AuthMetadata;
  } catch (error) {
    console.error('[AuthCache] Erro ao ler metadados:', error);
    return null;
  }
};

export const setAuthMetadata = (metadata: AuthMetadata): void => {
  try {
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('[AuthCache] Erro ao salvar metadados:', error);
  }
};

/**
 * Invalida os tokens (simula expiração), mas MANTÉM o usuário.
 * Isso garante que o Modal de Re-login saiba quem estava na tela.
 */
export const clearTokens = (): void => {
  try {
    const current = getAuthMetadata();
    if (current) {
      const lockedMetadata: AuthMetadata = {
        ...current,
        accessTokenExpiresAt: 0,
        refreshTokenExpiresAt: 0,
      };
      localStorage.setItem(METADATA_KEY, JSON.stringify(lockedMetadata));
    }
  } catch (error) {
    console.error('[AuthCache] Erro ao limpar tokens:', error);
  }
};

/**
 * Limpeza completa. Usado apenas quando o usuário clica em "Sair".
 */
export const clearAllAuthMetadata = (): void => {
  try {
    localStorage.removeItem(METADATA_KEY);
  } catch (error) {
    console.error('[AuthCache] Erro ao limpar tudo:', error);
  }
};