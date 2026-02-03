// src/core/auth/idle-watcher.ts

import { emitAuthEvent } from './auth-bus';

export class IdleWatcher {
  private timeoutId: any = null;
  private isIdle: boolean = false;
  private isRunning: boolean = false;
  
  private readonly idleLimitMs: number;

  constructor() {
    // Bind para garantir o contexto do 'this' nos event listeners
    this.handleActivity = this.handleActivity.bind(this);

    // Leitura da configuração de tempo com fallback para 15 minutos
    const envMinutes = Number(import.meta.env.VITE_IDLE_TIMEOUT_MS);
    const minutes = !isNaN(envMinutes) && envMinutes > 0 ? envMinutes : 15;
    this.idleLimitMs = minutes * 60 * 1000;
  }

  /**
   * Inicia o monitoramento.
   * Deve ser chamado pelo Provider quando o utilizador loga ou re-autentica com sucesso.
   */
  public start(): void {
    // Se já estiver a correr, não faz nada para evitar duplicar timers
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.isIdle = false;
    this.addListeners();
    this.resetTimer();
    console.log(`[IdleWatcher] Started (Limit: ${this.idleLimitMs}ms)`);
  }

  /**
   * Para o monitoramento.
   * Deve ser chamado:
   * 1. No Logout
   * 2. Imediatamente ao detectar Idle (para evitar loops)
   */
  public stop(): void {
    this.isRunning = false;
    this.removeListeners();
    this.clearTimer();
    console.log('[IdleWatcher] Stopped');
  }

  /**
   * Reinicia o contador se estiver a correr e não estiver idle.
   */
  private resetTimer(): void {
    this.clearTimer();

    // Se não devia estar a correr ou já disparou o idle, não agenda novo timer
    if (!this.isRunning || this.isIdle) {
      return;
    }

    this.timeoutId = setTimeout(() => {
      this.triggerIdle();
    }, this.idleLimitMs);
  }

  private clearTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Ação disparada quando o tempo estoura.
   */
  private triggerIdle(): void {
    if (this.isIdle) return; // Segurança contra duplo disparo

    this.isIdle = true;
    
    // CRÍTICO: Paramos de ouvir o DOM imediatamente.
    // Isso impede que movimentos do rato sobre o modal de login reiniciem o timer,
    // que era o que causava o loop de eventos e logs.
    this.stop(); 

    console.warn('[IdleWatcher] Idle detected. Emitting event...');
    
    // Dispara o evento usando a função exportada pelo auth-bus existente
    emitAuthEvent({ type: 'auth:idle-detected' });
  }

  /**
   * Handler de eventos do DOM.
   */
  private handleActivity(): void {
    // Se já foi detetado idle, ignoramos interações até que o start() seja chamado novamente
    if (this.isIdle) return;
    
    this.resetTimer();
  }

  private addListeners(): void {
    // Passivo true melhora a performance no scroll
    window.addEventListener('mousemove', this.handleActivity, { passive: true });
    window.addEventListener('mousedown', this.handleActivity, { passive: true });
    window.addEventListener('keypress', this.handleActivity, { passive: true });
    window.addEventListener('touchmove', this.handleActivity, { passive: true });
    window.addEventListener('scroll', this.handleActivity, { passive: true });
  }

  private removeListeners(): void {
    window.removeEventListener('mousemove', this.handleActivity);
    window.removeEventListener('mousedown', this.handleActivity);
    window.removeEventListener('keypress', this.handleActivity);
    window.removeEventListener('touchmove', this.handleActivity);
    window.removeEventListener('scroll', this.handleActivity);
  }
}