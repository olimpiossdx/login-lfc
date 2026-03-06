// src/service/api.ts
import { smartAdapter } from './http/adapters';
import { HttpClient } from './http/client';
import { authService } from '../core/auth/auth-service';
import { graph } from '../core/native-bus';
import type { HttpMethod, HttpRequestConfig, IApiResponse } from './http/types';

export const api = new HttpClient({
  baseURL: import.meta.env.VITE_API_URL ?? 'https://api.meusistema.com/v1',
  defaultAdapter: smartAdapter,
  defaultCredentials: 'include', // Essencial para HttpOnly
});

api.useRequestInterceptor(async (config) => {
  if (!config.headers) {
    config.headers = new Headers();
  } else if (!(config.headers instanceof Headers)) {
    config.headers = new Headers(config.headers);
  };
  
  return config;
});

// --- SISTEMA DE FILA INTELIGENTE (RE-AUTH) ---

interface QueuedRequest {
  config: HttpRequestConfig;
  resolve: (value: IApiResponse<any> | PromiseLike<IApiResponse<any>>) => void;
}

let isRefreshing = false;
let processQueue: QueuedRequest[] = [];

// Descarrega a fila re-executando as requisições pendentes
const flushQueue = async (success: boolean) => {
  const queueToProcess = [...processQueue];
  processQueue = [];
  isRefreshing = false;

  if (!success) {
    // Se o utilizador desistiu (ex: "Trocar de conta"), rejeitamos todas as Promises
    queueToProcess.forEach((req) => {
      req.resolve({
        data: null,
        error: { code: 'AUTH_FAILED', message: 'Sessão expirada.' },
        isSuccess: false,
        status: 401,
        headers: new Headers(),
        notifications: [],
        request: { url: req.config.url || '', method: (req.config.method as HttpMethod) || 'GET' },
      });
    });
    return;
  }

  // Se teve sucesso no Modal ou no Refresh silencioso, re-executamos a fila
  for (const req of queueToProcess) {
    // BLINDAGEM: Se o componente foi desmontado enquanto o modal estava aberto, ignoramos.
    if (req.config.signal?.aborted) {
      req.resolve({
        data: null,
        error: { code: 'REQUEST_ABORTED', message: 'Cancelado.' },
        isSuccess: false,
        status: 0,
        headers: new Headers(),
        notifications: [],
        request: { url: req.config.url || '', method: (req.config.method as HttpMethod) || 'GET' },
      });
      continue;
    }

    try {
      // Removemos os params pois a URL original já os contém embutidos (evita duplicação ex: ?page=1&page=1)
      const retryConfig = { ...req.config };
      delete retryConfig.params;

      // Re-executa. O browser envia o novo cookie HttpOnly nativamente.
      const retryResponse = await api.request(retryConfig.url as string, retryConfig);
      req.resolve(retryResponse);
    } catch (err) {
      req.resolve({
        data: null,
        error: { code: 'RETRY_FAILED', message: 'Falha ao processar requisição em fila.' },
        isSuccess: false,
        status: 500,
        headers: new Headers(),
        notifications: [],
        request: { url: req.config.url || '', method: (req.config.method as HttpMethod) || 'GET' },
      });
    }
  }
};

// Escutamos os eventos do Modal de Re-auth para libertar a fila
graph.on('auth:logado', () => {
  if (isRefreshing) flushQueue(true);
});

graph.on('auth:deslogado', () => {
  if (isRefreshing) flushQueue(false);
});

// --- RESPONSE INTERCEPTOR PARA 401 ---

api.useResponseInterceptor(async (response) => {
  const isAbort = response.error?.code === 'REQUEST_ABORTED';
  const is401 = response.status === 401;

  const url = response.request?.url ?? '';
  const isRefreshCall = url.includes('/auth/refresh-token');
  const originalConfig = (response as any).config as HttpRequestConfig;

  // Se foi um 401 real de uma requisição de negócio
  if (is401 && !isAbort && !isRefreshCall && originalConfig) {
    // Congela a requisição atual devolvendo uma Promise que só resolve no flushQueue
    const pendingRequest = new Promise<IApiResponse<any>>((resolve) => {
      processQueue.push({ config: originalConfig, resolve });
    });

    if (!isRefreshing) {
      isRefreshing = true;

      // 1. Tentativa Silenciosa (Refresh Token válido, Access Token expirado)
      const refreshed = await authService.tryRefreshToken();

      if (refreshed) {
        // Sucesso imediato! Descarrega a fila sem abrir o Modal.
        flushQueue(true);
      } else {
        // 2. Falha Absoluta. Emite para abrir o Modal Inteligente de Re-auth.
        // A UI continua em loading, pois a Promise 'pendingRequest' ainda não foi resolvida.
        graph.emit('auth:sessao-expirada', { type: 'auth:sessao-expirada' });
      }
    }

    return pendingRequest;
  }

  return response;
});
