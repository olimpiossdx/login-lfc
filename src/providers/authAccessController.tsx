// src/app/providers/AuthAccessController.tsx

import { useEffect } from 'react';
import { useGraphBus } from '../hooks/native-bus';
import type { IAuthGraphEvents } from '../core/auth/auth-bus.types';
import { setCanAccessProtectedRoutes } from '../core/auth/auth-access';

export const AuthAccessController: React.FC = () => {
  const { on } = useGraphBus<IAuthGraphEvents>();

  useEffect(() => {
    const offBootNeverLogged = on('auth:boot-result-never-logged', () => {
      setCanAccessProtectedRoutes(false);
    });

    const offBootHasHistory = on('auth:boot-result-has-history-but-invalid', () => {
      setCanAccessProtectedRoutes(false);
    });

    const offBootAuthenticated = on('auth:boot-result-authenticated', () => {
      setCanAccessProtectedRoutes(true);
    });

    const offLoginSuccess = on('auth:login-success', () => {
      setCanAccessProtectedRoutes(true);
    });

    const offReloginSuccess = on('auth:relogin-success', () => {
      setCanAccessProtectedRoutes(true);
    });

    const offReloginFailed = on('auth:relogin-failed-hard', () => {
      setCanAccessProtectedRoutes(false);
    });

    const offLogout = on('auth:logout', () => {
      setCanAccessProtectedRoutes(false);
    });

    return () => {
      offBootNeverLogged();
      offBootHasHistory();
      offBootAuthenticated();
      offLoginSuccess();
      offReloginSuccess();
      offReloginFailed();
      offLogout();
    };
  }, [on]);

  return null;
};
