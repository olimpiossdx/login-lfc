// src/app/providers/AuthReloginModal.tsx

import React, { useState } from 'react';
import type { ILoginCredentials } from '../core/auth/auth-service.types';
import { authService, clearLastUser, getLastUser } from '../core/auth/auth-service';
import Alert from '../ui/alert';
import useForm from '../hooks/use-form';
import { router } from '../router';

export interface IAuthReloginModalProps {
  reason: 'token' | 'inactivity' | 'boot';
  onClose: () => void;
}

export const AuthReloginModal: React.FC<IAuthReloginModalProps> = ({ reason, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSwitchUser = () => {
    // 1) limpar último usuário
    clearLastUser();

    // 2) fechar modal
    onClose();

    // 3) navegar para login
    router.navigate({ to: '/login' });
  };

  const onSubmit = async (data: ILoginCredentials) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await authService.relogin(data);
      if (!response || !response.isSuccess) {
        return;
      } else {
        onClose();
      }
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

  const { formProps } = useForm({ id: 'login-form-modal', onSubmit });
  const userName = getLastUser();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-600">{getMessage()}</p>

      <form {...formProps} className="flex flex-col gap-3 mt-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Usuário</label>
          <input
            type="text"
            name="userName"
            disabled={!!userName}
            defaultValue={userName || ''}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Senha</label>
          <input
            type="password"
            name="password"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {errorMessage && (
          <div className="mt-1">
            <Alert variant="error">{errorMessage}</Alert>
          </div>
        )}

        <div className="flex justify-between items-center gap-3 mt-4">
          <button type="button" className="text-xs text-gray-500 hover:text-gray-700" onClick={handleSwitchUser}>
            Trocar de conta
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60">
            {isSubmitting ? 'Entrando...' : 'Entrar novamente'}
          </button>
        </div>
      </form>
    </div>
  );
};
