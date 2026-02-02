import { api } from '../../service/api';
import { graph } from '../native-bus';
import { setAccessToken } from './auth-token-cache';
import type { IAuthService, IAuthUser, ILoginContext, ILoginCredentials } from './auth-service.types';
import type { IAuthBootResultAuthenticatedEvent } from './auth-events.types';
import type { AuthMetadata, AuthResponse } from '../../service/types';

const LAST_USER_KEY = 'lastUser';

const getLastUser = (): string | null => {
  try {
    return localStorage.getItem(LAST_USER_KEY);
  } catch {
    return null;
  }
};

const setLastUser = (login: string): void => {
  try {
    localStorage.setItem(LAST_USER_KEY, login);
  } catch {
    // noop
  }
};

const clearLastUser = (): void => {
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
    debugger
    const lastUser = getLastUser();

    // tenta refresh
    const response = await api.post<AuthMetadata>(
      '/auth/refresh-token',
      {},
      {
        notifyOnError: false,
      },
    );

    if (response.isSuccess && response.data) {
      const { user, accessTokenExpiresAt } = response.data;

      // aqui você pode guardar esse metadata em cache se quiser
      // setAuthMetadata({ user, accessTokenExpiresAt, refreshTokenExpiresAt? })

      const event: IAuthBootResultAuthenticatedEvent = {
        type: 'auth:boot-result-authenticated',
        attemptedUrl: currentUrl,
        user, // vindo direto do refresh
      };
      graph.emit(event.type, event);
      return;
    }

    // falhou refresh
    if (!lastUser) {
      graph.emit('auth:boot-result-never-logged', { type: 'auth:boot-result-never-logged' });
    } else {
      graph.emit('auth:boot-result-has-history-but-invalid', {
        type: 'auth:boot-result-has-history-but-invalid',
        attemptedUrl: currentUrl,
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

    const { user, accessTokenExpiresAt, refreshTokenExpiresAt } = response.data;

    // aqui você pode guardar metadata em cache (opcional por ora)

    const alreadyHadUser = !!getLastUser();
    setLastUser(credentials.userName);
    const isFirstLogin = !alreadyHadUser;

    graph.emit('auth:login-success', {
      type: 'auth:login-success',
      user,
      isFirstLogin,
      attemptedUrl: context.attemptedUrl,
    });
  }

  /**
   * Re-login via modal de sessão expirada / boot com histórico.
   */
  async relogin(credentials: ILoginCredentials): Promise<void> {
    try {
      const response = await api.post('/auth/login', credentials, {
        notifyOnError: true,
      });

      if (!response.isSuccess || !response.data) {
        throw new Error(response.error?.message || 'Falha no login');
      }

      const { user, accessToken } = response.data as {
        user: IAuthUser;
        accessToken: string;
      };

      setAccessToken(accessToken);
      setLastUser(credentials.username);

      graph.emit('auth:relogin-success', {
        type: 'auth:relogin-success',
        user,
      });
    } catch {
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

    setAccessToken(null);
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
}

// Singleton
export const authService: IAuthService = new AuthService();
