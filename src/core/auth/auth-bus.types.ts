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
  IAuthIdleDetectedEvent,
} from './auth-events.types';

export interface IAuthGraphEvents {
  'auth:boot-resultado-nunca-logado': IAuthBootResultNeverLoggedEvent;
  'auth:boot-resultado-historico-invalido': IAuthBootResultHasHistoryButInvalidEvent;
  'auth:boot-resultado-autenticado': IAuthBootResultAuthenticatedEvent;
  'auth:login-sucesso': IAuthLoginSuccessEvent;
  'auth:relogin-sucesso': IAuthReloginSuccessEvent;
  'auth:relogin-falha-grave': IAuthReloginFailedHardEvent;
  'auth:logout': IAuthLogoutEvent;
  'auth:sessao-expirada': IAuthSessionExpiredEvent;
  'auth:inatividade-detectada': IAuthIdleDetectedEvent;
  // Novos eventos para monitoramento de tokens
  'auth:access-token-proximo-expiracao': IAuthAccessTokenNearExpirationEvent;
  'auth:access-token-renovado': IAuthAccessTokenRenewedEvent;
  'auth:refresh-token-proximo-expiracao': IAuthRefreshTokenNearExpirationEvent;
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

// Novos eventos
export interface IAuthAccessTokenNearExpirationEvent {
  type: 'auth:access-token-proximo-expiracao';
  expiresAt: number;
  timeRemaining: number;
}

export interface IAuthAccessTokenRenewedEvent {
  type: 'auth:access-token-renovado';
  newExpiresAt: number;
}

export interface IAuthRefreshTokenNearExpirationEvent {
  type: 'auth:refresh-token-proximo-expiracao';
  expiresAt: number;
  timeRemaining: number;
}
