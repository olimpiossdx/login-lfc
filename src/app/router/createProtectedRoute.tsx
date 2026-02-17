// src/app/router/createProtectedRoute.tsx

import React from 'react';
import { createRoute, type RouteComponent } from '@tanstack/react-router';
import { AuthGuard } from '../../features/auth/components/AuthGuard';

interface IProtectedRouteOptions {
  path: string;
  getParentRoute: () => any;
  component: RouteComponent;
}

/**
 * Cria uma rota protegida que requer autenticação.
 * Utiliza o AuthGuard para verificar se o usuário está autenticado.
 */
export const createProtectedRoute = (options: IProtectedRouteOptions) => {
  const { component: OriginalComponent, ...rest } = options;

  const ProtectedComponent: React.FC = () => {
    return (
      <AuthGuard>
        <OriginalComponent />
      </AuthGuard>
    );
  };

  return createRoute({ ...rest, component: ProtectedComponent } as any);
};
