// src/features/auth/pages/loginPage.tsx
import React from 'react';
import { Lock, LogIn, Mail } from 'lucide-react';
import { getAttemptedUrl } from '../../../core/auth/attempted-url-cache';
import { authService } from '../../../core/auth/auth-service';
import type { ILoginCredentials, ILoginContext } from '../../../core/auth/auth-service.types';
import useForm from '../../../hooks/use-form';
import Alert from '../../../ui/alert';
import { getAuthMetadata } from '../../../core/auth/auth-metadata-cache';
import { router } from '../../../router';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const metadata = getAuthMetadata();
  
  // Verifica se a sessão é TOTALMENTE válida
  const hasValidSession = !!metadata?.user && metadata.refreshTokenExpiresAt > Date.now();
  
  // Verifica se a sessão está PAUSADA (tem usuário, mas o token expirou)
  const lockedUser = !hasValidSession ? metadata?.user?.username : '';

  React.useLayoutEffect(() => {
    if (hasValidSession) {
      router.navigate({ to: '/home', replace: true });
    }
  }, [hasValidSession]);

  const onSubmit = async (data: ILoginCredentials) => {
    setLoading(true);
    setErrorMessage(null);

    const context: ILoginContext = { attemptedUrl: getAttemptedUrl() };
    try {
      if (lockedUser) {
        // Se a conta está trancada, injetamos o utilizador e chamamos o relogin
        await authService.relogin({ ...data, userName: lockedUser });
      } else {
        await authService.login(data, context);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const { formProps } = useForm({ id: 'login-form-native', onSubmit });
  
  if (hasValidSession) {
    return null; 
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
      <div className="max-w-sm w-full mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 mb-3">
            <LogIn size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {lockedUser ? 'Sessão Pausada' : 'Acesso'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {lockedUser ? 'Confirme sua senha para continuar.' : 'Informe suas credenciais para entrar.'}
          </p>
        </div>

        {errorMessage && (
          <Alert variant="error" title="Erro ao autenticar">
            {errorMessage}
          </Alert>
        )}

        <form {...formProps} className="space-y-5 mt-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">E-mail</label>
            <div className="relative">
              <input
                name="userName"
                type="email"
                defaultValue={lockedUser || ''}
                readOnly={!!lockedUser}
                className={`form-input pl-8 w-full border rounded py-2 ${lockedUser ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                placeholder="seu@email.com"
                required
              />
              <Mail className="absolute left-2 top-2.5 text-gray-400 w-5 h-5 z-20 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Senha</label>
            <div className="relative">
              <input 
                name="password" 
                type="password" 
                className="form-input pl-8 w-full border rounded py-2" 
                placeholder="••••••" 
                required 
                autoFocus={!!lockedUser}
              />
              <Lock className="absolute left-2 top-2.5 text-gray-400 w-5 h-5 z-20 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg transition-all flex justify-center items-center gap-2 mt-2 shadow-lg shadow-cyan-900/20">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Validando...
              </>
            ) : (
              lockedUser ? 'Desbloquear' : 'Entrar no Sistema'
            )}
          </button>
          
          {/* Botão extra para limpar a sessão se não for o utilizador bloqueado */}
          {lockedUser && (
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={() => authService.logout()} 
                className="text-sm text-gray-500 hover:underline">
                Entrar com outra conta
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;