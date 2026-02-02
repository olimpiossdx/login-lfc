// src/core/auth/auth-bus.types.ts
import type {
  IAuthBootResultNeverLoggedEvent,
  IAuthBootResultHasHistoryButInvalidEvent,
  IAuthBootResultAuthenticatedEvent,
  IAuthLoginSuccessEvent,
  IAuthReloginSuccessEvent,
  IAuthReloginFailedHardEvent,
  IAuthLogoutEvent,
  IAuthSessionExpiredEvent,
} from './auth-events.types';

export interface IAuthGraphEvents {
  'auth:boot-result-never-logged': IAuthBootResultNeverLoggedEvent;
  'auth:boot-result-has-history-but-invalid': IAuthBootResultHasHistoryButInvalidEvent;
  'auth:boot-result-authenticated': IAuthBootResultAuthenticatedEvent;
  'auth:login-success': IAuthLoginSuccessEvent;
  'auth:relogin-success': IAuthReloginSuccessEvent;
  'auth:relogin-failed-hard': IAuthReloginFailedHardEvent;
  'auth:logout': IAuthLogoutEvent;
  'auth:session-expired': IAuthSessionExpiredEvent;
}

export type AuthMetadata = {
  user: {
    id: number;
    nome: string;
    username: string;
  };
  accessTokenExpiresAt: number;
  refreshTokenExpiresAt: number;
};