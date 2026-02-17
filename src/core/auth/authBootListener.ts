import { authBus } from './auth-bus';
import type { IAuthGraphEvents } from './auth-bus.types';
import { router } from '../../router';
import { getAttemptedUrl, clearAttemptedUrl } from './attempted-url-cache';

/**
 * AuthBootListener
 * 
 * Responsável por ouvir os eventos de boot da aplicação e reagir adequadamente:
 * - Se o boot autenticar com sucesso → redireciona para a URL tentada ou home
 * - Se o boot falhar mas houver histórico → não faz nada (usuário permanece na tela de login)
 * - Se nunca logou → não faz nada
 */
export function initAuthBootListener() {
  const off1 = authBus.on<IAuthGraphEvents['auth:boot-result-authenticated']>(
    'auth:boot-result-authenticated',
    (payload) => {
      // Boot conseguiu autenticar (via refresh token, por exemplo)
      const attemptedUrl = getAttemptedUrl();
      
      if (attemptedUrl) {
        clearAttemptedUrl();
        router.navigate({ to: attemptedUrl, replace: true });
      } else {
        router.navigate({ to: '/', replace: true });
      }
    }
  );

  // Para os outros casos (never-logged, has-history-but-invalid),
  // não fazemos nada aqui, pois:
  // - O GuestGuard no LoginPage cuida de exibir o formulário
  // - O AuthGuard nas rotas protegidas cuida de redirecionar para /login

  // Retorna função para cleanup (caso necessário no futuro)
  return () => {
    off1();
  };
}
