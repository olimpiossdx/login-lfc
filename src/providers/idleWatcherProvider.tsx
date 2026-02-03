import React, { useEffect, useRef } from 'react';
import { IdleWatcher } from '../core/auth/idle-watcher';
import { onAuthEvent } from '../core/auth/auth-bus'; // Importa a função de listener, não a classe

export const IdleWatcherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const watcherRef = useRef<IdleWatcher | null>(null);

  useEffect(() => {
    // CORREÇÃO: Construtor sem parâmetros
    watcherRef.current = new IdleWatcher();

    // Usamos onAuthEvent para escutar o barramento global do projeto
    const unsubscribe = onAuthEvent((event) => {
      switch (event.type) {
        case 'auth:login-success':
        case 'auth:relogin-success':
        case 'auth:boot-result-authenticated':
          console.log('[IdleWatcherProvider] Session active, starting watcher...');
          watcherRef.current?.start();
          break;
        
        case 'auth:logout':
        case 'auth:session-expired':
        case 'auth:relogin-failed-hard':
          console.log('[IdleWatcherProvider] Session ended, stopping watcher...');
          watcherRef.current?.stop();
          break;
      }
    });

    return () => {
      watcherRef.current?.stop();
      unsubscribe();
    };
  }, []);

  return <>{children}</>;
};