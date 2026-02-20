// src/app/router/createProtectedRoute.tsx
import React from 'react';
import { createRoute, type RouteComponent } from '@tanstack/react-router';
import { AuthGuard } from '../../features/auth/components/auth-guard';

interface IProtectedRouteOptions {
  path: string;
  getParentRoute: () => any;
  component: RouteComponent;
}

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