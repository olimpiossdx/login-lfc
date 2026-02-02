// src/app/providers/IdleWatcherProvider.tsx

import React from 'react';
import { IdleWatcher } from '../core/auth/idle-watcher';

export interface IIdleWatcherProviderProps {
  children: React.ReactNode;
  timeoutMs?: number;
}

/**
 * Provider global que inicializa o IdleWatcher com base no env.
 */
export const IdleWatcherProvider: React.FC<IIdleWatcherProviderProps> = ({ children, timeoutMs }) => {
  const watcherRef = React.useRef<IdleWatcher | null>(null);

  React.useEffect(() => {
    const envTimeout = timeoutMs ?? Number(import.meta.env.VITE_IDLE_TIMEOUT_MS ?? 15 * 60 * 1000);

    watcherRef.current = new IdleWatcher({ timeoutMs: envTimeout });
    watcherRef.current.start();

    return () => {
      watcherRef.current?.stop();
      watcherRef.current = null;
    };
  }, [timeoutMs]);

  return <>{children}</>;
};
