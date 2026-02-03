// src/app/providers/AuthModalController.tsx
import React from 'react';
import { useGraphBus } from '../hooks/native-bus';
import type { IAuthGraphEvents } from '../core/auth/auth-bus.types';
import { closeModal, showModal } from '../ui/modal';
import { AuthReloginModal } from './authReloginModal';
import { getLastUser } from '../core/auth/auth-service';
import { getAccessTokenExpiresAtLS } from '../core/auth/session-expiration';

type ReloginReason = 'token' | 'inactivity' | 'boot';

export const AuthModalController: React.FC = () => {
 const isOpenRef = React.useRef(false);
  const currentReasonRef = React.useRef<ReloginReason>('token');
  const lastBootTimeRef = React.useRef<number | null>(null);

  // Aqui usamos o hook que conecta ao barramento
  // Precisamos garantir que IAuthGraphEvents inclua 'auth:idle-detected' se for tipado
  const { on } = useGraphBus<IAuthGraphEvents>();

  React.useEffect(() => {
    const offBootAuthenticated = on('auth:boot-result-authenticated', () => {
      lastBootTimeRef.current = Date.now();
    });

    // [NOVO] Listener específico para Inatividade vinda do IdleWatcher
    const offIdleDetected = on('auth:idle-detected', () => {
      console.log('[MODAL] idle-detected');
      // Apenas abre se houver usuário anterior (estava logado)
      if (getLastUser()) {
        openReloginModal('inactivity');
      }
    });

    const offSessionExpired = on('auth:session-expired', (event) => {
      console.log('[MODAL] session-expired', event);

      if (isOpenRef.current) return;

      const isOnLogin = window.location.pathname.startsWith('/login');
      if (isOnLogin) return;

      const hasLastUser = !!getLastUser();
      if (!hasLastUser) return;
      
      // Validação de segurança para não abrir modal se o token ainda for válido (race condition)
      const exp = getAccessTokenExpiresAtLS();
      if (exp && event.reason === 'token' && Date.now() < exp) {
        return;
      }

      openReloginModal(event.reason as ReloginReason);
    });

    const offBootHasHistory = on('auth:boot-result-has-history-but-invalid', () => {
      if (isOpenRef.current) return;
      openReloginModal('boot');
    });

    const offReloginSuccess = on('auth:relogin-success', () => {
      console.log('[MODAL] relogin-success');
      if (isOpenRef.current) {
        closeModal();
        isOpenRef.current = false;
      }
    });
    
    const offReloginFailed = on('auth:relogin-failed-hard', () => {
      console.log('[MODAL] relogin-failed-hard');
    });

    return () => {
      offBootAuthenticated();
      offIdleDetected(); // Cleanup
      offSessionExpired();
      offBootHasHistory();
      offReloginSuccess();
      offReloginFailed();
    };
  }, [on]);

  const openReloginModal = (reason: ReloginReason) => {
    if (isOpenRef.current) return;

    currentReasonRef.current = reason;
    isOpenRef.current = true;

    showModal({
      title: 'Sessão expirada',
      content: ({ onClose }) => <AuthReloginModal reason={reason} onClose={onClose} />,
      size: 'md',
      closeOnBackdropClick: false,
    });
  };

  return null;
};
