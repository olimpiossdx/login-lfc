// src/router/authRoutingListeners.tsx

import { useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { useGraphBus } from '../hooks/native-bus';
import { getAttemptedUrl, setAttemptedUrl } from '../core/auth/attempted-url-cache';
import type { IAuthGraphEvents } from '../core/auth/auth-bus.types';

export const AuthRoutingListeners: React.FC = () => {
  const router = useRouter();
  const { on } = useGraphBus<IAuthGraphEvents>();

  useEffect(() => {
    // 1. Quando alguém entra com sucesso
    const offLogado = on('auth:logado', (event) => {
      const cachedUrl = getAttemptedUrl();
      const target = event.attemptedUrl || cachedUrl;
      
      setAttemptedUrl(null);

      const currentPath = router.state.location.pathname;
      
      // Proteção de Convidado: Se está na página de login, atiramos para o destino ou home
      if (currentPath === '/login' || event.isFirstLogin) {
        const destination = target && target !== '/login' ? target : '/home';
        router.navigate({ to: destination as any });
      }
    });

    // 2. Quando clica no botão "Sair"
    const offDeslogado = on('auth:deslogado', () => {
      setAttemptedUrl(null);
      router.navigate({ to: '/login' });
    });

    // 3. Quando a sessão morre
    const offSessaoExpirada = on('auth:sessao-expirada', () => {
      const current = `${router.state.location.pathname}${typeof router.state.location.search === 'string' ? router.state.location.search : ''}`;
      setAttemptedUrl(current);
      // Aqui NÃO fazemos router.navigate! Deixamos a página quieta para o AuthModalController poder sobrepor o Modal de Re-login.
    });

    // 4. Quando o utilizador adormece à frente do teclado
    const offInatividade = on('auth:inatividade', () => {
      const current = `${router.state.location.pathname}${typeof router.state.location.search === 'string' ? router.state.location.search : ''}`;
      setAttemptedUrl(current);
      // Sem navegação também. O Modal assumirá o controlo.
    });

    return () => {
      offLogado();
      offDeslogado();
      offSessaoExpirada();
      offInatividade();
    };
  }, [on, router]);

  return null;
};