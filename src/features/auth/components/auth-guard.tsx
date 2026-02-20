// src/features/auth/components/auth-guard.tsx
import React from 'react';
import { getAuthMetadata } from '../../../core/auth/auth-metadata-cache';
import { setAttemptedUrl } from '../../../core/auth/attempted-url-cache';
import { router } from '../../../router';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const metadata = getAuthMetadata();
  
  // Regra de Ouro: O Guardião só se importa com a IDENTIDADE (user)
  const hasIdentity = !!metadata?.user;

  React.useLayoutEffect(() => {
    if (!hasIdentity) {
      // Visitante anónimo: Salva a URL e expulsa para o login
      setAttemptedUrl(window.location.pathname);
      router.navigate({ to: '/login', replace: true });
    }
  }, [hasIdentity]);

  // Se não tem identidade, nem renderiza
  if (!hasIdentity) {
    return null;
  }

  // Renderiza a rota. Se a sessão estiver pausada, o Modal Controller cobrirá o ecrã.
  return <>{children}</>;
}