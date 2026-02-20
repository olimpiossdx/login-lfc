// src/providers/idleWatcherProvider.tsx
import React, { useEffect, useRef } from 'react';
import { IdleWatcher } from '../core/auth/idle-watcher';
import { useGraphBus } from '../hooks/native-bus';
import type { IAuthGraphEvents } from '../core/auth/auth-bus.types';
import { getAuthMetadata } from '../core/auth/auth-metadata-cache';

export const IdleWatcherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const watcherRef = useRef<IdleWatcher | null>(null);
  const { on } = useGraphBus<IAuthGraphEvents>();

  useEffect(() => {
    if (!watcherRef.current) {
      watcherRef.current = new IdleWatcher();
    }

    // [CORREÇÃO AQUI] Se o utilizador já está no cache quando o componente monta, arranca o motor!
    if (getAuthMetadata()?.user) {
      watcherRef.current.start();
    }

    const offLogado = on('auth:logado', () => {
      watcherRef.current?.start();
    });

    const offRenovado = on('auth:renovado', () => {
      watcherRef.current?.start();
    });

    const offSessaoExpirada = on('auth:sessao-expirada', () => {
      watcherRef.current?.stop();
    });

    const offDeslogado = on('auth:deslogado', () => {
      watcherRef.current?.stop();
    });

    return () => {
      watcherRef.current?.stop();
      offLogado();
      offRenovado();
      offSessaoExpirada();
      offDeslogado();
    };
  }, [on]);

  return <>{children}</>;
};