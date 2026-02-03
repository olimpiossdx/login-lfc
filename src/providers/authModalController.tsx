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

  const { on } = useGraphBus<IAuthGraphEvents>();

  React.useEffect(() => {
    const offBootAuthenticated = on('auth:boot-result-authenticated', () => {
      lastBootTimeRef.current = Date.now();
    });

    const offSessionExpired = on('auth:session-expired', (event) => {
      console.log('[MODAL] session-expired', event);

      if (isOpenRef.current) return;

      const isOnLogin = window.location.pathname.startsWith('/login');
      if (isOnLogin) return;

      const hasLastUser = !!getLastUser();
      if (!hasLastUser) return;
      
      // Se for 'inactivity' logo após um boot autenticado, ignora (caso F5 com sessão ok)
      if (event.reason === 'inactivity' && (lastBootTimeRef.current && Date.now() - lastBootTimeRef.current < 2000 || !lastBootTimeRef.current)) {
        return;
      }

      // Opcional: se quiser ser extra defensivo com accessTokenExpiresAt:
      const exp = getAccessTokenExpiresAtLS();
      if (exp && event.reason === 'token' && Date.now() < exp) {
        // teoricamente ainda não expirou, pode ignorar esse evento
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
    // NÃO fecha modal em relogin-failed-hard; erro fica dentro do modal
    const offReloginFailed = on('auth:relogin-failed-hard', () => {
      console.log('[MODAL] relogin-failed-hard');
    });

    return () => {
      offBootAuthenticated();
      offSessionExpired();
      offBootHasHistory();
      offReloginSuccess();
      offReloginFailed();
    };
  }, [on]);

  const openReloginModal = (reason: ReloginReason) => {
    if (isOpenRef.current) return;

    currentReasonRef.current = reason;

    showModal({
      title: 'Sessão expirada',
      content: ({ onClose }) => <AuthReloginModal reason={reason} onClose={onClose} />,
      size: 'md',
      closeOnBackdropClick: false,
    });

    isOpenRef.current = true;
  };

  return null;
};
