import { authBus } from './auth-bus';
import type { IAuthGraphEvents } from './auth-bus.types';
import { router } from '../../router';
import { getAttemptedUrl, clearAttemptedUrl } from './attempted-url-cache';

/**
 * AuthRoutingListener
 * 
 * Responsável por ouvir eventos de autenticação/logout e fazer redirecionamentos:
 * - auth:logged-in → redireciona para attempted URL ou home
 * - auth:logged-out → redireciona para /login
 */
export function initAuthRoutingListener() {
  const off1 = authBus.on<IAuthGraphEvents['auth:logged-in']>(
    'auth:logged-in',
    (payload) => {
      // Usuário acabou de fazer login
      const attemptedUrl = getAttemptedUrl();
      
      if (attemptedUrl) {
        clearAttemptedUrl();
        router.navigate({ to: attemptedUrl, replace: true });
      } else {
        router.navigate({ to: '/', replace: true });
      }
    }
  );

  const off2 = authBus.on<IAuthGraphEvents['auth:logged-out']>(
    'auth:logged-out',
    (payload) => {
      // Usuário fez logout
      router.navigate({ to: '/login', replace: true });
    }
  );

  // Retorna função para cleanup
  return () => {
    off1();
    off2();
  };
}
