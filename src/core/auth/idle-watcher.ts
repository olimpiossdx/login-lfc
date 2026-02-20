// src/core/auth/idle-watcher.ts
import { graph } from '../native-bus';
import { getAuthMetadata } from './auth-metadata-cache';

export class IdleWatcher {
  private timeoutId: any | null = null;
  // Retirámos o 'mousemove' por ser demasiado agressivo para a CPU.
  // Cliques, toques e teclas são mais do que suficientes para provar que há um humano ali.
  private events = ['mousedown', 'keydown', 'scroll', 'touchstart']; 
  private currentTimeoutMs: number = 15 * 60 * 1000; // Tempo seguro por omissão
  private resetBind = this.reset.bind(this);

  start() {
    this.calculateDynamicTimeout();
    this.setupListeners();
    this.reset();
  }

  stop() {
    this.removeListeners();
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  // Calculamos a matemática pesada (cache e .env) apenas quando o vigia é ligado, e não em cada clique!
  private calculateDynamicTimeout() {
    const metadata = getAuthMetadata();
    if (!metadata) return;

    const now = Date.now();
    const timeToRefreshDeath = metadata.refreshTokenExpiresAt - now;
    
    // Lê a variável de ambiente
    const envMinutes = Number(import.meta.env.VITE_IDLE_TIMEOUT_IN_MINUTES) || 15;
    this.currentTimeoutMs = envMinutes * 60 * 1000; 
    
    // Regra Dinâmica
    if (timeToRefreshDeath > 0 && timeToRefreshDeath < this.currentTimeoutMs) {
      this.currentTimeoutMs = Math.max(timeToRefreshDeath / 2, 60 * 1000); 
    }
  }

  private setupListeners() {
    this.events.forEach((evt) => window.addEventListener(evt, this.resetBind));
  }

  private removeListeners() {
    this.events.forEach((evt) => window.removeEventListener(evt, this.resetBind));
  }

  // O Reset agora é super leve, apenas reinicia o temporizador
  private reset() {
    if (this.timeoutId) clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(() => {
      this.triggerIdle();
    }, this.currentTimeoutMs);
  }

  private triggerIdle() {
    this.stop();
    graph.emit('auth:inatividade', { type: 'auth:inatividade' });
  }
}