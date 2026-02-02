// src/app/router/createProtectedRoute.tsx

import { createRoute, redirect, type RouteComponent } from '@tanstack/react-router';
import { getCanAccessProtectedRoutes, getIsAccessEvaluated } from '../../core/auth/auth-access';

interface IProtectedRouteOptions {
  path: string; // pode ser '/home' ou 'home'
  getParentRoute: () => any;
  component: RouteComponent;
}

export const createProtectedRoute = ({
  path,
  getParentRoute,
  component,
}: IProtectedRouteOptions) => {
  return createRoute({
    path,
    getParentRoute,
    component,
    beforeLoad: async () => {
      const can = getCanAccessProtectedRoutes();
      const evaluated = getIsAccessEvaluated();

      if (!evaluated && !can) {
        throw redirect({ to: '/login' });
      }

      return {};
    },
  });
};
