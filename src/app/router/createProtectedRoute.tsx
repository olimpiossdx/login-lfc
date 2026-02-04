// src/app/router/createProtectedRoute.tsx

import React from 'react';
import { createRoute, Navigate, type RouteComponent } from '@tanstack/react-router';
import { getCanAccessProtectedRoutes, getIsAccessEvaluated } from '../../core/auth/auth-access';
import { Spinner } from '../../ui/spinner';
import { getAttemptedUrl } from '../../core/auth/attempted-url-cache';

interface IProtectedRouteOptions {
  path: string; // pode ser '/home' ou 'home'
  getParentRoute: () => any;
  component: RouteComponent;
}

export const createProtectedRoute = (options: IProtectedRouteOptions) => {
  const { component: OriginalComponent, ...rest } = options;

  const ProtectedComponent: React.FC = () => {
    const [evaluated, setEvaluated] = React.useState(getIsAccessEvaluated);
    const [canAccess, setCanAccess] = React.useState(getCanAccessProtectedRoutes);

    React.useEffect(() => {
      const id = setInterval(() => {
        const nextEvaluated = getIsAccessEvaluated();
        const nextCan = getCanAccessProtectedRoutes();

        setEvaluated((prev) => (prev !== nextEvaluated ? nextEvaluated : prev));
        setCanAccess((prev) => (prev !== nextCan ? nextCan : prev));
      }, 100);

      return () => clearInterval(id);
    }, []);

    console.log('[GUARD] can, evaluated', canAccess, evaluated);

    // 1) Boot ainda não decidiu -> spinner, SEM redirect
    if (!evaluated) {
      return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <Spinner size="lg" className="text-blue-600 mb-3" />
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Carregando aplicação...</span>
        </div>
      );
    }

    // 2) Boot decidiu e acesso liberado -> renderiza página protegida
    if (canAccess) {
      const C = OriginalComponent as React.ComponentType;
      return <C />;
    }

    const attempted = getAttemptedUrl();

    // Se tem attemptedUrl, estamos em cenário de re-login: mantém rota e deixa modal atuar
    if (attempted) {
      const C = OriginalComponent as React.ComponentType;
      return <C />;
    }

    // 3) Boot decidiu e acesso negado -> manda para /login
    return <Navigate to="/login" />;
  };

  return createRoute({ ...rest, component: ProtectedComponent } as any);
};
