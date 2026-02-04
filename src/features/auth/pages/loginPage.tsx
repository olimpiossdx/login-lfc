import React from 'react';
import { Lock, LogIn, Mail } from 'lucide-react';
import { getAttemptedUrl } from '../../../core/auth/attempted-url-cache';
import { authService, getLastUser } from '../../../core/auth/auth-service';
import type { ILoginCredentials, ILoginContext } from '../../../core/auth/auth-service.types';
import useForm from '../../../hooks/use-form';
import Alert from '../../../ui/alert';
import { getAccessToken } from '../../../core/auth/auth-token-cache';
import { router } from '../../../router';
import { useGraphBus } from '../../../hooks/native-bus';
import type { IAuthGraphEvents } from '../../../core/auth/auth-bus.types';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const { on } = useGraphBus<IAuthGraphEvents>();

  // [GUEST GUARD - Verificação Síncrona]
  const hasToken = !!getAccessToken();

  // [GUEST GUARD - Verificação de Boot Assíncrono]
  // Se não temos token, mas temos um último usuário, provavelmente o sistema
  // está tentando restaurar a sessão via Refresh Token no boot.
  // Devemos aguardar esse processo para evitar o "flash" do formulário.
  const [isWaitingBoot, setIsWaitingBoot] = React.useState(() => !hasToken && !!getLastUser());

  React.useLayoutEffect(() => {
    if (hasToken) {
      router.navigate({ to: '/', replace: true });
    }
  }, [hasToken]);

  React.useEffect(() => {
    if (!isWaitingBoot) return;

    // Se o boot falhar ou determinar que o token é inválido, paramos de esperar
    const stopWaiting = () => setIsWaitingBoot(false);

    const offNever = on('auth:boot-result-never-logged', stopWaiting);
    const offInvalid = on('auth:boot-result-has-history-but-invalid', stopWaiting);
    // Nota: Se 'boot-result-authenticated' ocorrer, o AuthRoutingListeners
    // fará o redirecionamento, então não precisamos tratar aqui, apenas continuamos "esperando" (renderizando null).

    return () => {
      offNever();
      offInvalid();
    };
  }, [isWaitingBoot, on]);

  // Bloqueia renderização se já tiver token ou estiver aguardando boot
  if (hasToken || isWaitingBoot) {
    return null; // Ou um <LoadingScreen /> se preferir
  }

  const onSubmit = async (data: ILoginCredentials) => {
    setLoading(true);
    setErrorMessage(null);

    const context: ILoginContext = { attemptedUrl: getAttemptedUrl() };
    try {
      await authService.login(data, context);
      // Não navega aqui; AuthRoutingListeners cuida disso
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const { formProps } = useForm({ id: 'login-form-native', onSubmit });
  const userName = getLastUser() || ''; // Preenche com o último usuário para facilitar
  const readOnly = !!userName; // Se tiver último usuário, bloqueia edição do e-mail

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950">
      <div className="max-w-sm w-full mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 mb-3">
            <LogIn size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Acesso</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Informe suas credenciais para entrar.</p>
        </div>

        {errorMessage && (
          <Alert variant="error" title="Erro ao autenticar">
            {errorMessage}
          </Alert>
        )}

        <form {...formProps} className="space-y-5 mt-4">
          {/* Campo E-mail */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">E-mail</label>
            <div className="relative">
              <input
                name="userName"
                defaultValue={userName}
                type="email"
                className="form-input pl-8"
                placeholder="seu@email.com"
                required
                readOnly={readOnly}
              />
              <Mail className="absolute left-2 top-2.5 text-gray-400 w-5 h-5 z-20 pointer-events-none" />
            </div>
          </div>

          {/* Campo Senha */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Senha</label>
            <div className="relative">
              <input name="password" type="password" className="form-input pl-8" placeholder="••••••" required />
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
                Entrando...
              </>
            ) : (
              'Entrar no Sistema'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
