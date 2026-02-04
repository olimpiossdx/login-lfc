// src/app/router/authRoutingListeners.tsx

import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useGraphBus } from '../hooks/native-bus'; // ajuste o path conforme seu projeto
import { getAttemptedUrl, setAttemptedUrl } from '../core/auth/attempted-url-cache';
import type { IAuthGraphEvents } from '../core/auth/auth-bus.types';

export const AuthRoutingListeners: React.FC = () => {
  const router = useRouter();
  const { on } = useGraphBus<IAuthGraphEvents>();

  useEffect(() => {
    const offNeverLogged = on('auth:boot-result-never-logged', () => {
      router.navigate({ to: '/login' });
    });

    const offHasHistoryInvalid = on('auth:boot-result-has-history-but-invalid', (event) => {
      const current = `${router.state.location.pathname}${typeof router.state.location.search === 'string' ? router.state.location.search : ''}`;

      setAttemptedUrl(event.attemptedUrl ?? current);
    });

    // [GUEST GUARD] Boot autenticado: Protege contra acesso à tela de login
    const offAuthenticated = on('auth:boot-result-authenticated', () => {
      setAttemptedUrl(null);

      const currentPath = router.state.location.pathname;
      if (currentPath === '/login') {
        router.navigate({ to: '/home' as any });
      }
    });

    const offLoginSuccess = on('auth:login-success', (event) => {
      const cached = getAttemptedUrl();
      const target = event.attemptedUrl || cached;

      if (event.isFirstLogin || !target) {
        router.navigate({ to: '/home' as any });
      } else {
        router.navigate({ to: target as any });
      }

      setAttemptedUrl(null);
    });

    const offReloginSuccess = on('auth:relogin-success', () => {
      // Não navega; só fecha modal (feito no AuthModalController)
    });

    const offReloginFailed = on('auth:relogin-failed-hard', () => {
      setAttemptedUrl(null);
      router.navigate({ to: '/login' });
    });

    const offLogout = on('auth:logout', () => {
      setAttemptedUrl(null);
      router.navigate({ to: '/login' });
    });

    const offSessionExpired = on('auth:session-expired', (event) => {
      const current = `${router.state.location.pathname}${typeof router.state.location.search === 'string' ? router.state.location.search : ''}`;

      setAttemptedUrl(event.lastUrl ?? current);
      // Modal controller abre o modal
    });

    return () => {
      offNeverLogged();
      offHasHistoryInvalid();
      offAuthenticated();
      offLoginSuccess();
      offReloginSuccess();
      offReloginFailed();
      offLogout();
      offSessionExpired();
    };
  }, [on, router]);

  return null;
};
