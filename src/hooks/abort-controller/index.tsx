import { useRef, useEffect, useCallback } from 'react';

export const useAbortController = () => {
  const abortControllerRef = useRef<AbortController | null>(null);

  const getSignal = useCallback(() => {
    // Se já houver uma requisição em curso, cancela
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const newController = new AbortController();
    abortControllerRef.current = newController;
    return newController.signal;
  }, []);

  // Cancela ao desmontar o componente
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { getSignal };
};