import React from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';;
import { RootLayout } from './app/layout/rootLayout';

import LoginPage  from './features/auth/pages/loginPage';
import { HomePage } from './features/home/pages/homePage';
import { AuthModalController } from './providers/authModalController';
import { AuthRoutingListeners } from './router/authRoutingListeners';
import ToastContainer from './ui/toast/container';
import { AuthAccessController } from './providers/authAccessController';
import { createProtectedRoute } from './app/router/createProtectedRoute';
import { Cadastro } from './features/home/pages/cadastro';

const rootRoute = createRootRoute({
  component: () => (
    <>
      {/* Controladores globais, agora DENTRO do contexto do router */}
      <AuthRoutingListeners />
      <AuthModalController />
      <AuthAccessController /> 
      <ToastContainer />

      {/* Layout + outlet das rotas */}
        <Outlet />
    </>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

// Layout autenticado: tudo aqui dentro usa RootLayout
const authLayoutRoute = createRoute({
  id: 'auth-layout',
  getParentRoute: () => rootRoute,
  component: () => (
    <RootLayout>
      <Outlet />
    </RootLayout>
  ),
});

const homeRoute = createProtectedRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/home',
  component: HomePage,
});
const cadastroRoute = createProtectedRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/cadastros',
  component: Cadastro,
});

const routeTree = rootRoute.addChildren([  loginRoute,  authLayoutRoute.addChildren([homeRoute, cadastroRoute])]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const AppRouterProvider: React.FC = () => {
  return <RouterProvider router={router} />;
};
