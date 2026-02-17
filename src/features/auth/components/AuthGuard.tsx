import React from 'react';
import { getAccessToken } from '../../../core/auth/auth-token-cache';
import { setAttemptedUrl } from '../../../core/auth/attempted-url-cache';
import { router } from '../../../router';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard
 * 
 * Protege rotas que requerem autenticação.
 * Se o usuário não estiver autenticado:
 * - Armazena a URL atual como attemptedUrl
 * - Redireciona para /login
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const hasToken = !!getAccessToken();

  React.useLayoutEffect(() => {
    if (!hasToken) {
      // Salva a URL que o usuário tentou acessar
      setAttemptedUrl(window.location.pathname);
      // Redireciona para login
      router.navigate({ to: '/login', replace: true });
    }
  }, [hasToken]);

  // Se não tem token, não renderiza nada (vai redirecionar)
  if (!hasToken) {
    return null;
  }

  // Se tem token, renderiza os filhos (conteúdo protegido)
  return <>{children}</>;
}
