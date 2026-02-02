// src/app/providers/AuthModalController.tsx

import React, { useEffect, useRef } from 'react';
import { graph } from '../core/native-bus';
import type { AuthEventType } from '../core/auth/auth-events.types';
import { closeModal, showModal } from '../ui/modal'; // hook/index [file:21][file:22][file:24]
import { AuthReloginModal } from './authReloginModal';

type ReloginReason = 'token' | 'inactivity' | 'boot';

export const AuthModalController: React.FC = () => {
  const isOpenRef = useRef(false);
  const currentReasonRef = useRef<ReloginReason>('token');

  useEffect(() => {
    const off = graph.on('auth', (event: AuthEventType) => {
      switch (event.type) {
        case 'auth:boot-result-has-history-but-invalid': {
          openReloginModal('boot');
          break;
        }

        case 'auth:session-expired': {
          openReloginModal(event.reason);
          break;
        }

        case 'auth:relogin-success':
        case 'auth:relogin-failed-hard': {
          if (isOpenRef.current) {
            closeModal();
            isOpenRef.current = false;
          }
          break;
        }
      }
    });

    return () => off();
  }, []);

  const openReloginModal = (reason: ReloginReason) => {
    if (isOpenRef.current) return;

    currentReasonRef.current = reason;

    showModal({
      // seu IModalOptions [file:23][file:24]
      title: 'Sessão expirada',
      content: ({ onClose }) => <AuthReloginModal reason={reason} onClose={onClose} />,
      size: 'md',
      closeOnBackdropClick: false,
    });

    isOpenRef.current = true;
  };

  return null;
};
