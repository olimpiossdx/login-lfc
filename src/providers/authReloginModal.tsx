// src/app/providers/AuthReloginModal.tsx

import React, { useState } from 'react';
import type { ILoginCredentials } from '../core/auth/auth-service.types';
import { authService } from '../core/auth/auth-service';
import Alert from '../ui/alert'; // seu Alert [file:29]
// importe também seus componentes de Form/Layout (Stack, Input, Button etc.)

export interface IAuthReloginModalProps {
  reason: 'token' | 'inactivity' | 'boot';
  onClose: () => void;
}

export const AuthReloginModal: React.FC<IAuthReloginModalProps> = ({ reason, onClose }) => {
  const [credentials, setCredentials] = useState<ILoginCredentials>({
    username: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await authService.relogin(credentials);
      onClose();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao autenticar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMessage = () => {
    if (reason === 'inactivity') {
      return 'Você ficou um tempo sem usar o sistema. Por segurança, faça login novamente.';
    }
    if (reason === 'token') {
      return 'Sua sessão expirou. Faça login novamente para continuar.';
    }
    return 'Faça login para continuar usando o sistema.';
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Alert variant="info" title="Sessão expirada">
        {getMessage()}
      </Alert>

      {/* Aqui você usa seus componentes de form/layout */}
      {/* Exemplo genérico: */}
      <div className="flex flex-col gap-2">
        <label htmlFor="username">Usuário</label>
        <input
          id="username"
          value={credentials.username}
          onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
          className="input"
          autoFocus
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password">Senha</label>
        <input
          id="password"
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
          className="input"
        />
      </div>

      {errorMessage && (
        <Alert variant="error" title="Erro ao autenticar">
          {errorMessage}
        </Alert>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn btn-secondary">
          Cancelar
        </button>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary">
          {isSubmitting ? 'Entrando...' : 'Entrar novamente'}
        </button>
      </div>
    </form>
  );
};
