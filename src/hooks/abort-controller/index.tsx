import React from 'react';

export const useAbortController = () => {
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const getSignal = React.useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const newController = new AbortController();
    abortControllerRef.current = newController;
    return newController.signal;
  }, []);

  // Adicionamos esta função para permitir o aborto manual externo
  const abortManual = React.useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  React.useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { getSignal, abortManual }; // Agora expomos o controle
};
