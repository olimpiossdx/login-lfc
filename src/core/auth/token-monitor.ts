import { AuthBus } from './auth-bus';
import { AuthMetadataCache } from './auth-metadata-cache';
import { TokenCache } from './auth-token-cache';

export class TokenMonitor {
  private checkInterval: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL_MS = 60000; // Verifica a cada 1 minuto
  private readonly TOKEN_EXPIRY_WARNING_MS = 300000; // 5 minutos antes

  constructor(
    private authBus: AuthBus,
    private metadataCache: AuthMetadataCache,
    private tokenCache: TokenCache
  ) {}

  start(): void {
    if (this.checkInterval) {
      return;
    }

    this.checkInterval = setInterval(() => {
      this.checkTokenExpiration();
    }, this.CHECK_INTERVAL_MS);

    // Verifica imediatamente ao iniciar
    this.checkTokenExpiration();
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private checkTokenExpiration(): void {
    const metadata = this.metadataCache.get();
    if (!metadata) {
      return;
    }

    const now = Date.now();
    const { accessTokenExpiresAt, refreshTokenExpiresAt } = metadata;

    // Verifica se o access token está próximo de expirar
    const timeUntilAccessExpiry = accessTokenExpiresAt - now;
    if (timeUntilAccessExpiry > 0 && timeUntilAccessExpiry <= this.TOKEN_EXPIRY_WARNING_MS) {
      this.authBus.publish({ type: 'TOKEN_PROXIMO_EXPIRACAO' });
    }

    // Verifica se o access token expirou
    if (accessTokenExpiresAt <= now) {
      this.authBus.publish({ type: 'TOKEN_EXPIRADO' });
    }

    // Verifica se o refresh token expirou
    if (refreshTokenExpiresAt <= now) {
      this.authBus.publish({ type: 'REFRESH_TOKEN_EXPIRADO' });
      this.stop(); // Para de monitorar quando refresh token expira
    }
  }

  // Método para forçar uma verificação imediata
  checkNow(): void {
    this.checkTokenExpiration();
  }
}
