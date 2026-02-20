// src/service/api.ts
import { smartAdapter } from './http/adapters';
import { HttpClient } from './http/client';
import { authService } from '../core/auth/auth-service';
import { graph } from '../core/native-bus';

export const api = new HttpClient({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://api.meusistema.com/v1',
  defaultAdapter: smartAdapter,
  defaultCredentials: 'include', // Essencial para envio automático de Cookies HttpOnly
});

// Removemos a injeção manual do 'Bearer' pois usamos HttpOnly.
api.useRequestInterceptor(async (config) => {
  if (!config.headers) {
    config.headers = new Headers();
  } else if (!(config.headers instanceof Headers)) {
    config.headers = new Headers(config.headers);
  }
  return config;
});

// Sistema de Fila/Lock para evitar múltiplos refreshes em simultâneo
let isRefreshing = false;
let refreshSubscribers: ((success: boolean) => void)[] = [];

const onRefreshed = (success: boolean) => {
  refreshSubscribers.forEach((callback) => callback(success));
  refreshSubscribers = [];
};

// RESPONSE INTERCEPTOR PARA 401
api.useResponseInterceptor(async (response) => {
  const isAbort = response.error?.code === 'REQUEST_ABORTED';
  const is401 = response.status === 401;

  const url = response.request?.url ?? '';
  const isRefreshCall = url.includes('/auth/refresh-token');

  if (is401 && !isAbort && !isRefreshCall) {
    if (!isRefreshing) {
      isRefreshing = true;
      
      const refreshed = await authService.tryRefreshToken();
      
      isRefreshing = false;
      onRefreshed(refreshed);

      if (!refreshed) {
        // Refresh falhou, derrubamos a sessão para o ecrã/modal
        graph.emit('auth:sessao-expirada', { type: 'auth:sessao-expirada' });
      }
      // O refetch automático do HttpClient entraria aqui se a lib suportasse re-executar o config.
      // Como defesa primária, confiamos no nosso Monitor Proativo.
    } else {
      // Se já houver um refresh a decorrer, enfileiramos a promessa à espera da resolução
      await new Promise<boolean>((resolve) => {
        refreshSubscribers.push(resolve);
      });
    }
  }

  return response;
});