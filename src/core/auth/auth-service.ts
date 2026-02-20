// src/core/auth/auth-service.ts
import { api } from '../../service/api';
import { graph } from '../native-bus';
import type { IAuthService, ILoginContext, ILoginCredentials } from './auth-service.types';
import type { AuthMetadata } from '../../service/types';
import { getAuthMetadata, setAuthMetadata, clearTokens, clearAllAuthMetadata } from './auth-metadata-cache';

export class AuthService implements IAuthService {
  private refreshPromise: Promise<boolean> | null = null;
  private bootPromise: Promise<void> | null = null;

  async checkSessionOnBoot(currentUrl: string | null): Promise<void> {
    if (this.bootPromise) return this.bootPromise;

    this.bootPromise = (async () => {
      const metadata = getAuthMetadata();
      if (!metadata?.user) return; // Boot apenas para quem tem identidade

      const now = Date.now();

      if (metadata.accessTokenExpiresAt > now + 10000) {
        graph.emit('auth:logado', { type: 'auth:logado', metadata, attemptedUrl: currentUrl });
        return;
      }

      if (metadata.refreshTokenExpiresAt > now) {
        const success = await this.tryRefreshToken();
        if (success) {
          const newMetadata = getAuthMetadata();
          if (newMetadata) {
            graph.emit('auth:logado', { type: 'auth:logado', metadata: newMetadata, attemptedUrl: currentUrl });
          }
          return;
        }
      }

      clearTokens();
      graph.emit('auth:sessao-expirada', { type: 'auth:sessao-expirada' });
    })();

    try {
      await this.bootPromise;
    } finally {
      this.bootPromise = null;
    }
  }

  async login(credentials: ILoginCredentials, context: ILoginContext): Promise<void> {
    const response = await api.post<AuthMetadata>('/auth/login', credentials, { notifyOnError: true });
    if (!response.isSuccess || !response.data) throw new Error(response.error?.message || 'Falha no login');

    const metadata = response.data;
    const isFirstLogin = !getAuthMetadata();
    setAuthMetadata(metadata);

    graph.emit('auth:logado', { type: 'auth:logado', metadata, isFirstLogin, attemptedUrl: context.attemptedUrl });
  }

  async relogin(credentials: ILoginCredentials): Promise<void> {
    const response = await api.post<AuthMetadata>('/auth/login', credentials, { notifyOnError: true });
    if (!response.isSuccess || !response.data) throw new Error(response.error?.message || 'Falha no login');

    setAuthMetadata(response.data);
    graph.emit('auth:logado', { type: 'auth:logado', metadata: response.data, isFirstLogin: false });
  }

  async logout(): Promise<void> {
    try { await api.post('/auth/logout', {}, { notifyOnError: false }); } catch {}
    clearAllAuthMetadata();
    graph.emit('auth:deslogado', { type: 'auth:deslogado' });
  }

  async tryRefreshToken(): Promise<boolean> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      const response = await api.post<AuthMetadata>('/auth/refresh-token', {}, { notifyOnError: false });

      if (!response.isSuccess || !response.data) {
        clearTokens();
        return false;
      }

      setAuthMetadata(response.data);
      graph.emit('auth:renovado', { type: 'auth:renovado', metadata: response.data });
      return true;
    })();

    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  forceSwitchUser(): void {
    this.logout();
  }
}

export const authService: IAuthService = new AuthService();