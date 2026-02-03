import { api } from '../../service/api';
import { graph } from '../native-bus';
import { setAccessToken } from './auth-token-cache';
import type { AuthSessionExpiredReasonType, IAuthService, IAuthUser, ILoginContext, ILoginCredentials } from './auth-service.types';
import type { IAuthBootResultAuthenticatedEvent } from './auth-events.types';
import type { AuthMetadata, AuthResponse, IApiResponse } from '../../service/types';
import { setAccessTokenExpiresAtLS } from './session-expiration';

const LAST_USER_KEY = 'lastUser';

export const getLastUser = (): string | null => {
  try {
    return localStorage.getItem(LAST_USER_KEY);
  } catch {
    return null;
  }
};

export const setLastUser = (login: string): void => {
  try {
    localStorage.setItem(LAST_USER_KEY, login);
  } catch {
    // noop
  }
};

export const clearLastUser = (): void => {
  try {
    localStorage.removeItem(LAST_USER_KEY);
  } catch {
    // noop
  }
};

export class AuthService implements IAuthService {
  /**
   * Boot: tenta restaurar sessão via /auth/refresh-token (cookie HttpOnly).
   */
  async checkSessionOnBoot(currentUrl: string | null): Promise<void> {
    const lastUser = getLastUser();

    // tenta refresh
    const response = await api.post<AuthMetadata>('/auth/refresh-token', {}, { notifyOnError: false });

    if (response.isSuccess && response.data) {
      const { user, accessTokenExpiresAt } = response.data;
      setAccessTokenExpiresAtLS(accessTokenExpiresAt);

      // aqui você pode guardar esse metadata em cache se quiser
      // setAuthMetadata({ user, accessTokenExpiresAt, refreshTokenExpiresAt? })

      const event: IAuthBootResultAuthenticatedEvent = {
        type: 'auth:boot-result-authenticated',
        attemptedUrl: currentUrl,
        accessTokenExpiresAt: accessTokenExpiresAt,
        user: user as any, // vindo direto do refresh
      };
      graph.emit(event.type, event);
      return;
    }

    // falhou refresh
    if (!lastUser) {
      // Caso 1: nunca logou neste device -> login full-page
      graph.emit('auth:boot-result-never-logged', {
        type: 'auth:boot-result-never-logged',
      });
    } else {
      // Caso 2: já logou antes, mas sessão inválida -> MESMO FLUXO do session-expired/token
      const lastUrl = currentUrl;

      // 2.1: sinaliza boot com histórico inválido (para attemptedUrl)
      graph.emit('auth:boot-result-has-history-but-invalid', {
        type: 'auth:boot-result-has-history-but-invalid',
        attemptedUrl: lastUrl,
      });

      // 2.2: dispara sessão expirada por token -> abre modal
      graph.emit('auth:session-expired', {
        type: 'auth:session-expired',
        reason: 'token' as AuthSessionExpiredReasonType,
        lastUrl,
      });
    }
  }

  /**
   * Login via tela principal (full-page).
   */
  async login(credentials: ILoginCredentials, context: ILoginContext): Promise<void> {
    const response = await api.post<AuthMetadata>('/auth/login', credentials, { notifyOnError: true });

    if (!response.isSuccess || !response.data) {
      throw new Error(response.error?.message || 'Falha no login');
    }

    const { user, accessTokenExpiresAt } = response.data;

    // aqui você pode guardar metadata em cache (opcional por ora)
    setAccessTokenExpiresAtLS(accessTokenExpiresAt);

    const alreadyHadUser = !!getLastUser();
    setLastUser(credentials.userName);
    const isFirstLogin = !alreadyHadUser;

    graph.emit('auth:login-success', {
      type: 'auth:login-success',
      user,
      isFirstLogin,
      attemptedUrl: context.attemptedUrl,
      accessTokenExpiresAt,
    });
  }

  /**
   * Re-login via modal de sessão expirada / boot com histórico.
   */
  async relogin(credentials: ILoginCredentials): Promise<void> {
    try {
      const response = await api.post<AuthMetadata>('/auth/login', credentials, { notifyOnError: true });

      if (!response.isSuccess || !response.data) {
        throw new Error(response.error?.message || 'Falha no login');
      }

      setAccessTokenExpiresAtLS(response.data.accessTokenExpiresAt);
      setLastUser(credentials.userName);

      graph.emit('auth:relogin-success', {
        type: 'auth:relogin-success',
        user: response.data.user,
        accessTokenExpiresAt: response.data.accessTokenExpiresAt,
      });
    } catch (error) {
      graph.emit('auth:relogin-failed-hard', {
        type: 'auth:relogin-failed-hard',
        reason: 'credentials',
      });
    }
  }

  /**
   * Logout explícito.
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout', {}, { notifyOnError: false });
    } catch {
      // mesmo se der erro, vamos limpar client-side
    }

    setAccessTokenExpiresAtLS(null);
    // Se quiser esquecer o último usuário, descomente:
    // clearLastUser();

    graph.emit('auth:logout', {
      type: 'auth:logout',
      reason: 'user_action',
    });
  }

  /**
   * Tenta renovar o access-token usando refresh-token em cookie HttpOnly.
   */
  async tryRefreshToken(): Promise<boolean> {
    const response = await api.post<AuthResponse>(
      '/auth/refresh-token',
      {},
      {
        notifyOnError: false,
      },
    );

    // Falha de HTTP ou de negócio
    if (!response.isSuccess) {
      return false;
    }

    return true;
  }

  /**
   * Busca o usuário atual, caso o refresh não retorne o user.
   */
  private async fetchCurrentUser(): Promise<IAuthUser> {
    // Se o refresh já retornar user, você pode trocar essa chamada por um cache.
    const response = await api.get('/auth/me', {
      notifyOnError: false,
    });

    if (!response.isSuccess || !response.data) {
      throw new Error(response.error?.message || 'Falha ao obter usuário atual');
    }

    return response.data as IAuthUser;
  }

  forceSwitchUser(): void {
    clearLastUser();
    setAccessToken(null); // se estiver usando
    graph.emit('auth:logout', {
      type: 'auth:logout',
      reason: 'user_action',
    });
  }
}

// Singleton
export const authService: IAuthService = new AuthService();
