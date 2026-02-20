// src/providers/authModalController.tsx
import React, { useEffect, useRef } from 'react';
import { useGraphBus } from '../hooks/native-bus';
import type { IAuthGraphEvents } from '../core/auth/auth-bus.types';
import { closeModal, showModal } from '../ui/modal';
import { AuthReloginModal } from './authReloginModal';
import { getAuthMetadata } from '../core/auth/auth-metadata-cache';
import { router } from '../router';

type ReloginReason = 'token' | 'inactivity';

export const AuthModalController: React.FC = () => {
  const isOpenRef = useRef(false);
  const { on } = useGraphBus<IAuthGraphEvents>();

  // Vigia mudanças de rota para interceptar acessos com sessão pausada
  useEffect(() => {
    const checkPausedSession = () => {
      const metadata = getAuthMetadata();
      const isOnLogin = window.location.pathname.startsWith('/login');
      
      // Se tem utilizador, e NÃO está no ecrã de login, validamos o token
      if (metadata?.user && !isOnLogin) {
        const isExpired = metadata.refreshTokenExpiresAt <= Date.now();
        if (isExpired && !isOpenRef.current) {
          openReloginModal('token');
        }
      }
    };

    // Inscreve a verificação a cada navegação
    const unsubscribeRouter = router.history.subscribe(checkPausedSession);
    // Corre na montagem para apanhar digitação direta na URL
    checkPausedSession();

    return () => unsubscribeRouter();
  }, []);

  useEffect(() => {
    const offInatividade = on('auth:inatividade', () => {
      if (getAuthMetadata()?.user) openReloginModal('inactivity');
    });

    const offSessaoExpirada = on('auth:sessao-expirada', () => {
      const isOnLogin = window.location.pathname.startsWith('/login');
      if (isOnLogin || isOpenRef.current) return;
      openReloginModal('token');
    });

    const offLogado = on('auth:logado', () => {
      if (isOpenRef.current) {
        closeModal();
        isOpenRef.current = false;
      }
    });

    const offDeslogado = on('auth:deslogado', () => {
      if (isOpenRef.current) {
        closeModal();
        isOpenRef.current = false;
      }
    });

    return () => {
      offInatividade();
      offSessaoExpirada();
      offLogado();
      offDeslogado();
    };
  }, [on]);

  const openReloginModal = (reason: ReloginReason) => {
    if (isOpenRef.current) return;
    isOpenRef.current = true;

    showModal({
      title: reason === 'inactivity' ? 'Sessão Inativa' : 'Sessão Expirada',
      content: ({ onClose }) => <AuthReloginModal reason={reason} onClose={onClose} />,
      size: 'md',
      closeOnBackdropClick: false,
    });
  };

  return null;
};