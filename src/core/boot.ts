import { authService } from './auth/auth-service';
import { initAuthBootListener } from './auth/authBootListener';
import { initAuthRoutingListener } from './auth/authRoutingListener';

/**
 * Inicializa a aplicação
 * 
 * 1. Inicializa os listeners de eventos
 * 2. Executa o boot de autenticação
 */
export function initAuthListeners(router: any) { 
  // Cria função navigate compatível com os listeners
  const navigate = (path: string, options?: { replace?: boolean }) => {
    router.navigate({ to: path, replace: options?.replace });
  };

  const cleanupBoot = initAuthBootListener(navigate);
  const cleanupRouting = initAuthRoutingListener(navigate);


  // Retorna função de cleanup que remove todos os listeners
  return () => {
    cleanupBoot();
    cleanupRouting();
  };
}
