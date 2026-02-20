// src/providers/authReloginModal.tsx
import React from 'react';
import { User as UserIcon, Lock, Key, AlertTriangle, LogOut } from 'lucide-react';
import type { ILoginCredentials } from '../core/auth/auth-service.types';
import { authService } from '../core/auth/auth-service';
import useForm from '../hooks/use-form';

// Novos Componentes de UI
import Alert from '../ui/alert';
import Input from '../ui/input';
import Button from '../ui/button';
import { ModalContent, ModalFooter, ModalHeader, ModalTitle, ModalDescription } from '../ui/modal/modal';

// Importar o novo cache
import { getAuthMetadata } from '../core/auth/auth-metadata-cache';

export interface IAuthReloginModalProps {
  reason: 'token' | 'inactivity'; // Removemos o 'boot' pois o checkSessionOnBoot agora resolve síncrono ou redireciona
  onClose: () => void;
}

export const AuthReloginModal: React.FC<IAuthReloginModalProps> = ({ reason, onClose }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Lê o utilizador trancado a partir do cache centralizado
  const metadata = getAuthMetadata();
  const userName = metadata?.user?.username || '';

  const handleSwitchUser = () => {
    // Fecha o modal e faz o logout explícito (limpa cache e emite 'auth:deslogado', atirando para o /login)
    onClose();
    authService.logout();
  };

  const onSubmit = async (data: ILoginCredentials) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Como o form faz override aos estilos/inputs, garantimos que o nome de utilizador certo é passado
      const credentialsWithUser = { ...data, userName };

      await authService.relogin(credentialsWithUser);
      // O 'authService.relogin' já emite 'auth:logado' com os novos tempos.
      // O 'AuthModalController' está a escutar esse evento e fechará o modal automaticamente.
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

    return {
      title: 'Sessão Expirada',
      desc: 'Seu token de acesso venceu. Faça login novamente.',
      icon: Key,
      color: 'text-blue-600',
    };
  };

  const { formProps } = useForm({ id: 'login-form-modal', onSubmit });
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
        {/* Feedback de Erro */}
        {errorMessage && (
          <Alert variant="error" icon={<AlertTriangle size={16} />} title="Erro de Autenticação" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        )}

        <form {...formProps} className="space-y-4 pt-2">
          <div className="relative">
            <Input
              label="Usuário"
              name="userName"
              defaultValue={userName}
              disabled={!!userName}
              leftIcon={<UserIcon size={18} className="text-gray-400" />}
              variant="filled"
              className="bg-gray-50 dark:bg-gray-900/50"
            />
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
        </form>
      </ModalContent>

      <ModalFooter className="bg-gray-50 dark:bg-gray-900/30 rounded-b-xl border-t dark:border-gray-800 sm:justify-between gap-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSwitchUser}
          className="text-gray-500 hover:text-gray-700"
          leftIcon={<LogOut size={16} />}>
          Trocar de conta
        </Button>

        <Button type="submit" form="login-form-modal" isLoading={isSubmitting} variant="primary" className="w-full sm:w-auto px-8">
          {isSubmitting ? 'Validando...' : 'Desbloquear'}
        </Button>
      </ModalFooter>
    </>
  );
};
