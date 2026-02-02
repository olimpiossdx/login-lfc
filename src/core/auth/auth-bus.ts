import { graph } from '../native-bus';
import type { AuthEventType } from './auth-events.types';

export const emitAuthEvent = (event: AuthEventType): void => {
  graph.emit(event.type, event);
};

export const onAuthEvent = (
  handler: (event: AuthEventType) => void,
): (() => void) => {
  // Se seu graph.on aceita string exata:
  const offs = [
    graph.on('auth:boot-result-never-logged', handler as any),
    graph.on('auth:boot-result-has-history-but-invalid', handler as any),
    graph.on('auth:boot-result-authenticated', handler as any),
    graph.on('auth:login-success', handler as any),
    graph.on('auth:relogin-success', handler as any),
    graph.on('auth:relogin-failed-hard', handler as any),
    graph.on('auth:logout', handler as any),
    graph.on('auth:session-expired', handler as any),
  ];

  return () => offs.forEach((off) => off());
};
