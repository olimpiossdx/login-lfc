// src/core/auth/auth-service.types.ts

export interface IBaseModel<TId = string> {
  id?: TId;
}

export interface IAuthUser extends IBaseModel {
  /** Nome exibido na UI. */
  name: string;
  /** E-mail principal usado para login/contato. */
  username: string;
  // Adicione campos específicos do seu backend aqui
}

export interface ILoginCredentials {
  userName: string;
  password: string;
}

export interface ILoginContext {
  /** Rota que o usuário tentou acessar antes do login. */
  attemptedUrl: string | null;
}

export type AuthSessionExpiredReasonType = 'token' | 'inactivity';

export interface IAuthService {
  /**
   * Executado no boot da aplicação.
   * Tenta restaurar sessão usando refresh-token (cookie HttpOnly)
   * e emite eventos de boot de acordo com o resultado.
   */
  checkSessionOnBoot(currentUrl: string | null): Promise<void>;

  /**
   * Login via tela principal (full-page).
   */
  login(credentials: ILoginCredentials, context: ILoginContext): Promise<void>;

  /**
   * Re-login via modal de sessão expirada / boot com histórico.
   */
  relogin(credentials: ILoginCredentials): Promise<void>;

  /**
   * Logout explícito pelo usuário.
   */
  logout(): Promise<void>;

  /**
   * Tenta renovar o access-token usando o refresh-token (cookie HttpOnly).
   * Usado pelo interceptor do HttpClient e no boot.
   *
   * @returns true se o refresh teve sucesso, false caso contrário.
   */
  tryRefreshToken(): Promise<boolean>;

  forceSwitchUser(): void;
}
