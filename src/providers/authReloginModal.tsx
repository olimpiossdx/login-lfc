import React, { useState } from 'react';
import { User as UserIcon, Lock, Key, AlertTriangle, LogOut } from 'lucide-react';
import type { ILoginCredentials } from '../core/auth/auth-service.types';
import { authService, clearLastUser, getLastUser } from '../core/auth/auth-service';
import { router } from '../router';
import useForm from '../hooks/use-form';

// Novos Componentes de UI
import Alert from '../ui/alert';
import Input from '../ui/input';
import Button from '../ui/button';
import { ModalContent, ModalFooter, ModalHeader, ModalTitle, ModalDescription } from '../ui/modal/modal';

export interface IAuthReloginModalProps {
  reason: 'token' | 'inactivity' | 'boot';
  onClose: () => void;
}

export const AuthReloginModal: React.FC<IAuthReloginModalProps> = ({ reason, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSwitchUser = () => {
    clearLastUser();
    onClose();
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

  const getMessageConfig = () => {
    if (reason === 'inactivity') {
      return {
        title: 'Sessão Pausada',
        desc: 'Detectamos inatividade. Por segurança, confirme sua senha.',
        icon: Lock,
        color: 'text-amber-600',
      };
    }
    if (reason === 'token') {
      return {
        title: 'Sessão Expirada',
        desc: 'Seu token de acesso venceu. Faça login novamente.',
        icon: Key,
        color: 'text-blue-600',
      };
    }
    return {
      title: 'Login Necessário',
      desc: 'Faça login para continuar.',
      icon: UserIcon,
      color: 'text-gray-600',
    };
  };

  const { formProps } = useForm({ id: 'login-form-modal', onSubmit });
  const userName = getLastUser();
  const config = getMessageConfig();
  const Icon = config.icon;

  return (
    <>
      <ModalHeader>
        <ModalTitle className={`flex items-center gap-2 ${config.color}`}>
          <Icon className="w-5 h-5" />
          {config.title}
        </ModalTitle>
        <ModalDescription>{config.desc}</ModalDescription>
      </ModalHeader>

      <ModalContent>
        <form {...formProps} className="space-y-4 pt-2">
          {/* Campo de Usuário (Readonly) */}
          <div className="relative">
            <Input
              label="Usuário"
              name="userName"
              defaultValue={userName || ''}
              disabled={!!userName}
              leftIcon={<UserIcon size={18} className="text-gray-400" />}
              variant="filled" // Visualmente distinto para indicar readonly
              className="bg-gray-50 dark:bg-gray-900/50"
            />
            {/* Indicador visual de que a conta está travada */}
            {!!userName && (
              <div className="absolute right-3 top-9">
                <Lock size={14} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Campo de Senha */}
          <Input
            label="Senha"
            type="password"
            name="password"
            placeholder="Digite sua senha"
            leftIcon={<Key size={18} />}
            autoFocus
            required
          />

          {/* Feedback de Erro */}
          {errorMessage && (
            <Alert variant="error" icon={<AlertTriangle size={16} />} title="Erro de Autenticação">
              {errorMessage}
            </Alert>
          )}
        </form>
      </ModalContent>

      <ModalFooter className="bg-gray-50 dark:bg-gray-900/30 rounded-b-xl border-t dark:border-gray-800 sm:justify-between gap-4">
        {/* Botão Secundário: Trocar Conta */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSwitchUser}
          className="text-gray-500 hover:text-gray-700"
          leftIcon={<LogOut size={16} />}>
          Trocar de conta
        </Button>

        {/* Botão Primário: Entrar (Form Submit via ID externo ou ref seria ideal, mas aqui usamos o botão dentro do form context se possível, ou trigger manual. 
           Como o botão está fora do <form> no layout do ModalFooter, precisamos conectar via form="id" ou mover o form para envolver tudo.
           Para simplicidade visual com Compound Components, o ideal é o <form> envolver o ModalContent e ModalFooter, mas o Modal tem estrutura fixa.
           
           Solução: Usar o atributo 'form' do HTML5 no botão de submit.
        */}
        <Button
          type="submit"
          form="login-form-modal" // Conecta ao ID do form definido no useForm
          isLoading={isSubmitting}
          variant="primary"
          className="w-full sm:w-auto px-8">
          {isSubmitting ? 'Validando...' : 'Desbloquear'}
        </Button>
      </ModalFooter>
    </>
  );
};
