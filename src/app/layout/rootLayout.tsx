// src/app/layout/RootLayout.tsx

import React from 'react';
import { Link } from '@tanstack/react-router';

export interface IRootLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout raiz da aplicação.
 * Inclui header fixo e área de conteúdo centralizada.
 */
export const RootLayout: React.FC<IRootLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-tight">SeuSistema</span>
        </div>

        <nav className="flex items-center gap-4 text-sm">
          <Link to="/home" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            Home
          </Link>

          <Link to="/cadastros" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            Cadastros
          </Link>
        </nav>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 flex flex-col">
        <div className="w-full max-w-6xl mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
};
