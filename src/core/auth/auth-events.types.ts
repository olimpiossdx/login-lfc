// src/core/auth/auth-events.types.ts

import type { IAuthUser, AuthSessionExpiredReasonType } from './auth-service.types.ts';

export interface IAuthBootResultNeverLoggedEvent {
  type: 'auth:boot-result-never-logged';
}

export interface IAuthBootResultHasHistoryButInvalidEvent {
  type: 'auth:boot-result-has-history-but-invalid';
  attemptedUrl: string | null;
}

export interface IAuthBootResultAuthenticatedEvent {
 type: 'auth:boot-result-authenticated';
  attemptedUrl: string | null;
  user: IAuthUser;
  accessTokenExpiresAt: number;
}

export interface IAuthLoginSuccessEvent {
  type: 'auth:login-success';
  user: IAuthUser;
  isFirstLogin: boolean;
  attemptedUrl: string | null;
  accessTokenExpiresAt: number;
}

export interface IAuthReloginSuccessEvent {
  type: 'auth:relogin-success';
  user: IAuthUser;
  accessTokenExpiresAt: number;
}

export interface IAuthReloginFailedHardEvent {
  type: 'auth:relogin-failed-hard';
  reason: 'credentials' | 'revoked' | 'unknown';
}

export interface IAuthLogoutEvent {
  type: 'auth:logout';
  reason: 'user_action' | 'session_expired' | 'idle_timeout';
}

export interface IAuthSessionExpiredEvent {
  type: 'auth:session-expired';
  reason: AuthSessionExpiredReasonType;
  lastUrl: string | null;
}

export interface ISystemApiOfflineEvent {
  type: 'system:api-offline';
}

export interface ISystemApiUnstableEvent {
  type: 'system:api-unstable';
}

export type AuthEventType =
  | IAuthBootResultNeverLoggedEvent
  | IAuthBootResultHasHistoryButInvalidEvent
  | IAuthBootResultAuthenticatedEvent
  | IAuthLoginSuccessEvent
  | IAuthReloginSuccessEvent
  | IAuthReloginFailedHardEvent
  | IAuthLogoutEvent
  | IAuthSessionExpiredEvent;

export type SystemEventType =
  | ISystemApiOfflineEvent
  | ISystemApiUnstableEvent;
