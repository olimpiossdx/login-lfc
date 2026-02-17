import { authService } from './auth/auth-service';
import { initAuthBootListener } from './auth/authBootListener';
import { initAuthRoutingListener } from './auth/authRoutingListener';

/**
 * Inicializa a aplicação
 * 
 * 1. Inicializa os listeners de eventos
 * 2. Executa o boot de autenticação
 */
export async function boot() {
  // 1. Inicializa os listeners ANTES do boot
  initAuthBootListener();
  initAuthRoutingListener();

  // 2. Tenta restaurar sessão (via refresh token)
  await authService.checkSessionOnBoot(window.location.pathname);
}
