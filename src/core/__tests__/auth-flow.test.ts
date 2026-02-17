import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authBus } from '../auth-bus';
import { attemptedUrlCache } from '../attempted-url-cache';
import { authBootListener } from '../authBootListener';
import { authRoutingListener } from '../authRoutingListener';
import type { AuthSuccessEvent, AuthLogoutEvent } from '../auth-bus.types';

describe('Auth Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    attemptedUrlCache.clear();
  });

  describe('authBus', () => {
    it('deve emitir e receber eventos de sucesso de autenticação', () => {
      const mockCallback = vi.fn();
      authBus.on('auth:success', mockCallback);

      const event: AuthSuccessEvent = {
        user: {
          id: 1,
          nome: 'Test User',
          username: 'test@example.com',
        },
        accessTokenExpiresAt: Date.now() + 3600000,
      };

      authBus.emit('auth:success', event);
      expect(mockCallback).toHaveBeenCalledWith(event);
    });

    it('deve emitir e receber eventos de logout', () => {
      const mockCallback = vi.fn();
      authBus.on('auth:logout', mockCallback);

      const event: AuthLogoutEvent = { reason: 'user_action' };
      authBus.emit('auth:logout', event);
      expect(mockCallback).toHaveBeenCalledWith(event);
    });

    it('deve permitir remover listeners', () => {
      const mockCallback = vi.fn();
      authBus.on('auth:success', mockCallback);
      authBus.off('auth:success', mockCallback);

      const event: AuthSuccessEvent = {
        user: { id: 1, nome: 'Test', username: 'test@test.com' },
        accessTokenExpiresAt: Date.now(),
      };
      authBus.emit('auth:success', event);
      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('attemptedUrlCache', () => {
    it('deve armazenar e recuperar URL tentada', () => {
      const testUrl = '/dashboard/settings';
      attemptedUrlCache.set(testUrl);
      expect(attemptedUrlCache.get()).toBe(testUrl);
    });

    it('deve limpar URL armazenada', () => {
      attemptedUrlCache.set('/test');
      attemptedUrlCache.clear();
      expect(attemptedUrlCache.get()).toBeNull();
    });

    it('deve retornar null quando não há URL armazenada', () => {
      expect(attemptedUrlCache.get()).toBeNull();
    });
  });

  describe('Auth Flow Integration', () => {
    it('deve redirecionar para URL tentada após login bem-sucedido', () => {
      const attemptedUrl = '/protected/resource';
      attemptedUrlCache.set(attemptedUrl);

      const mockNavigate = vi.fn();
      const cleanup = authBootListener(mockNavigate);

      const event: AuthSuccessEvent = {
        user: { id: 1, nome: 'User', username: 'user@test.com' },
        accessTokenExpiresAt: Date.now() + 3600000,
      };

      authBus.emit('auth:success', event);

      expect(mockNavigate).toHaveBeenCalledWith(attemptedUrl, { replace: true });
      expect(attemptedUrlCache.get()).toBeNull();

      cleanup();
    });

    it('deve redirecionar para home quando não há URL tentada', () => {
      const mockNavigate = vi.fn();
      const cleanup = authBootListener(mockNavigate);

      const event: AuthSuccessEvent = {
        user: { id: 1, nome: 'User', username: 'user@test.com' },
        accessTokenExpiresAt: Date.now() + 3600000,
      };

      authBus.emit('auth:success', event);

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });

      cleanup();
    });

    it('deve redirecionar para login em logout', () => {
      const mockNavigate = vi.fn();
      const cleanup = authRoutingListener(mockNavigate);

      const event: AuthLogoutEvent = { reason: 'session_expired' };
      authBus.emit('auth:logout', event);

      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });

      cleanup();
    });

    it('deve armazenar URL atual ao falhar autenticação', () => {
      const currentPath = '/dashboard/profile';
      attemptedUrlCache.set(currentPath);

      expect(attemptedUrlCache.get()).toBe(currentPath);
    });
  });

  describe('Cleanup de Listeners', () => {
    it('deve remover listener de boot ao chamar cleanup', () => {
      const mockNavigate = vi.fn();
      const cleanup = authBootListener(mockNavigate);

      cleanup();

      const event: AuthSuccessEvent = {
        user: { id: 1, nome: 'User', username: 'user@test.com' },
        accessTokenExpiresAt: Date.now(),
      };
      authBus.emit('auth:success', event);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('deve remover listener de routing ao chamar cleanup', () => {
      const mockNavigate = vi.fn();
      const cleanup = authRoutingListener(mockNavigate);

      cleanup();

      const event: AuthLogoutEvent = { reason: 'user_action' };
      authBus.emit('auth:logout', event);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
