// src/core/auth/token-monitor.ts
import { authService } from './auth-service';
import { getAuthMetadata } from './auth-metadata-cache';
import { graph } from '../native-bus';

class TokenMonitor {
  private timer: ReturnType<typeof setInterval> | null = null;
  private isRefreshing = false;

  /** Inicia a verificação a cada 30 segundos */
  start() {
    if (this.timer) return;
    this.timer = setInterval(() => this.check(), 30000);
  }

  /** Para a verificação (usado no logout ou quando a sessão morre) */
  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async check() {
    if (this.isRefreshing) return;

    const metadata = getAuthMetadata();
    if (!metadata) {
      this.stop();
      return;
    }

    const now = Date.now();
    const { accessTokenExpiresAt, refreshTokenExpiresAt } = metadata;

    // 1. O Refresh Token morreu de vez? A sessão expirou.
    if (refreshTokenExpiresAt <= now) {
      this.stop();
      graph.emit('auth:sessao-expirada', { type: 'auth:sessao-expirada' });
      return;
    }

    // 2. Faltam menos de 2 minutos para o Access Token morrer? Renova.
    const MARGIN_TO_REFRESH_MS = 2 * 60 * 1000; 
    
    if (accessTokenExpiresAt - now <= MARGIN_TO_REFRESH_MS) {
      this.isRefreshing = true;
      try {
        const success = await authService.tryRefreshToken();
        if (!success) {
          // A renovação falhou (ex: falha de rede). 
          // Não matamos a sessão aqui; deixamos o interceptor atuar como rede de segurança
          // caso o utilizador tente fazer uma ação, ou tentamos novamente no próximo ciclo.
        }
      } finally {
        this.isRefreshing = false;
      }
    }
  }
}

export const tokenMonitor = new TokenMonitor();