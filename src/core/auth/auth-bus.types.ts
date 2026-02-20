// src/core/auth/auth-bus.types.ts
import type { AuthMetadata } from '../../service/types';

export interface IAuthGraphEvents {
  /**
   * Disparado quando o usuário entra na aplicação com sucesso
   * (seja por login manual ou boot validado com token ativo).
   */
  'auth:logado': {
    type: 'auth:logado';
    metadata: AuthMetadata;
    isFirstLogin?: boolean;
    attemptedUrl?: string | null;
  };

  /**
   * Disparado silenciosamente pelo Monitor de Token ou Interceptor
   * quando o refresh proativo/reativo dá certo no background.
   */
  'auth:renovado': {
    type: 'auth:renovado';
    metadata: AuthMetadata;
  };

  /**
   * Disparado quando o access_token vence e o refresh_token também falha ou já venceu.
   * Usado para subir o Modal de Re-login.
   */
  'auth:sessao-expirada': {
    type: 'auth:sessao-expirada';
  };

  /**
   * Disparado por ação explícita do usuário ao clicar em "Sair".
   */
  'auth:deslogado': {
    type: 'auth:deslogado';
  };

  /**
   * Disparado pelo Watcher ao detectar ausência de interação do usuário.
   * Usado para subir o Modal de Re-login protegendo a tela.
   */
  'auth:inatividade': {
    type: 'auth:inatividade';
  };
}