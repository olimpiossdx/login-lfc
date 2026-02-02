// src/core/http/api.ts

import { smartAdapter } from './http/adapters';
import { HttpClient } from './http/client';
import { getAccessToken } from '../core/auth/auth-token-cache';
import { authService } from '../core/auth/auth-service';
import { graph } from '../core/native-bus';
import type { AuthSessionExpiredReasonType } from '../core/auth/auth-service.types';

export const api = new HttpClient({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://api.meusistema.com/v1',
  defaultAdapter: smartAdapter,
  defaultCredentials: 'include'
});

// REQUEST INTERCEPTOR (já ajustado para token em memória)
api.useRequestInterceptor(async (config) => {
  const token = getAccessToken();

  if (!config.headers) {
    config.headers = new Headers();
  } else if (!(config.headers instanceof Headers)) {
    config.headers = new Headers(config.headers);
  }

  const isInternal =
    !config.url?.startsWith('http') ||
    config.url?.includes(import.meta.env.VITE_API_URL);

  if (token && isInternal) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  return config;
});

//TODO: melhorar isso com um sistema de fila / lock para evitar múltiplos refreshes concorrentes
// RESPONSE INTERCEPTOR PARA 401 (APÓS LOGIN / RUNTIME)
api.useResponseInterceptor(async (response) => {
  const isAbort = response.error?.code === 'REQUEST_ABORTED';
  const is401 = response.status === 401;

  const url = response.request?.url ?? '';
  const isRefreshCall = url.includes('/auth/refresh-token');

  if (is401 && !isAbort && !isRefreshCall) {
    const refreshed = await authService.tryRefreshToken();

    if (!refreshed) {
      const lastUrl = window.location.pathname + window.location.search;

      graph.emit('auth:session-expired', {
        type: 'auth:session-expired',
        reason: 'token' as AuthSessionExpiredReasonType,
        lastUrl,
      });
    }
  }

  return response;
});

