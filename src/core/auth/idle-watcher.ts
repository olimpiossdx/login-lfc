// src/core/auth/idle-watcher.ts

import { graph } from '../native-bus';
import type { AuthSessionExpiredReasonType } from './auth-service.types';

export interface IIdleWatcherOptions {
  timeoutMs: number;
}

export interface IIdleWatcher {
  start(): void;
  stop(): void;
  reset(): void;
}

type IdleHandler = () => void;

const DEFAULT_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
] as const;

export class IdleWatcher implements IIdleWatcher {
  private timeoutId: number | null = null;
  private readonly timeoutMs: number;
  private readonly handler: IdleHandler;
  private readonly events: readonly string[];
  private isRunning = false;

  constructor(options: IIdleWatcherOptions) {
    this.timeoutMs = options.timeoutMs;
    this.handler = this.onIdle;
    this.events = DEFAULT_EVENTS;
  }

  start(): void {
    if (this.isRunning) return;

    this.events.forEach((eventName) => {
      window.addEventListener(eventName, this.reset, true);
    });

    this.isRunning = true;
    this.reset();
  }

  stop(): void {
    if (!this.isRunning) return;

    this.events.forEach((eventName) => {
      window.removeEventListener(eventName, this.reset, true);
    });

    if (this.timeoutId != null) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.isRunning = false;
  }

  reset = (): void => {
    if (!this.isRunning) {
      return;
    }

    if (this.timeoutId != null) {
      window.clearTimeout(this.timeoutId);
    }

    this.timeoutId = window.setTimeout(this.handler, this.timeoutMs);
  };

  private onIdle = (): void => {
    const lastUrl = window.location.pathname + window.location.search;

    graph.emit('auth:session-expired', {
      type: 'auth:session-expired',
      reason: 'inactivity' as AuthSessionExpiredReasonType,
      lastUrl,
    });

    this.reset();
  };
}
