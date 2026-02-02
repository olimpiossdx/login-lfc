// src/core/auth/attempted-url-cache.ts

let attemptedUrl: string | null = null;

/**
 * Define a rota que o usuário tentou acessar antes de ser bloqueado.
 */
export const setAttemptedUrl = (url: string | null): void => {
  attemptedUrl = url;
};

/**
 * Retorna a última rota tentada.
 */
export const getAttemptedUrl = (): string | null => attemptedUrl;
