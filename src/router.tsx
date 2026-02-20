// src/router.tsx
import React from 'react';
import { createRootRoute, createRoute, createRouter, RouterProvider, Outlet } from '@tanstack/react-router';
import { RootLayout } from './app/layout/rootLayout';

import LoginPage from './features/auth/pages/loginPage';
import { HomePage } from './features/home/pages/homePage';
import { AuthModalController } from './providers/authModalController';
import { AuthRoutingListeners } from './router/authRoutingListeners';
import ToastContainer from './ui/toast/container';
import { createProtectedRoute } from './app/router/createProtectedRoute';
import { Cadastro } from './features/home/pages/cadastro';

// 1. Importar o nosso Provider de Inatividade
import { IdleWatcherProvider } from './providers/idleWatcherProvider';
import CadastroCliente from './features/home/pages/cadastro/cliente/cadastro-cliente';

const rootRoute = createRootRoute({
  component: () => (
    // 2. Abraçar a aplicação com o Provider
    <IdleWatcherProvider>
      {/* Controladores globais, agora DENTRO do contexto do router */}
      <AuthRoutingListeners />
      <AuthModalController />
      <ToastContainer />

      {/* Layout + outlet das rotas */}
      <Outlet />
    </IdleWatcherProvider>
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

const cadastroClienteRoute = createProtectedRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/cadastros/clientes',
  component: CadastroCliente,
});

const routeTree = rootRoute.addChildren([loginRoute, authLayoutRoute.addChildren([homeRoute, cadastroRoute, cadastroClienteRoute])]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const AppRouterProvider: React.FC = () => {
  return <RouterProvider router={router} />;
};
