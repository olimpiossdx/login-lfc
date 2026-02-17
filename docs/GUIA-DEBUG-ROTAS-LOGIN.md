# Guia de Debug - Problema de Acesso à Rota de Login

## 🔴 Problema Relatado

**Sintoma:** Não consigo acessar a rota de login e não sei por onde começar o debug.

## 🎯 Estratégia de Debug

### 1. Verificar Console do Navegador

**Como fazer:**
```bash
1. Abra o DevTools (F12 ou Cmd+Option+I no Mac)
2. Vá para a aba "Console"
3. Procure por erros em vermelho
```

**O que procurar:**
- ❌ Erros de módulo não encontrado (Module not found)
- ❌ Erros de React Router
- ❌ Erros de componente não definido
- ❌ Erros de importação circular

**Erros comuns:**
```
❌ "Cannot read property of undefined"
❌ "Module not found: Error: Can't resolve..."
❌ "React Router: No routes matched location"
❌ "Maximum update depth exceeded"
```

---

### 2. Verificar Aba Network (Rede)

**Como fazer:**
```bash
1. DevTools > Network
2. Recarregue a página (Cmd+R)
3. Filtre por "All" ou "JS"
```

**O que verificar:**
- 🔍 Requisições falhando (status 404, 500)
- 🔍 Arquivos JavaScript com erro de carregamento
- 🔍 Tempo de resposta das requisições

---

### 3. Verificar Estrutura de Rotas

#### 3.1 Localizar arquivo principal de rotas

**Arquivos suspeitos:**
```
src/app/router/         # Nova estrutura (React Router v6+)
src/router/             # Estrutura antiga
src/App.tsx             # Importa o RouterProvider
```

**Checklist de verificação:**

```tsx
// ✅ App.tsx deve importar o RouterProvider
import { AppRouterProvider } from './router';

function App() {
  return (
    <IdleWatcherProvider>
      <AppRouterProvider /> {/* ✅ Deve estar aqui */}
    </IdleWatcherProvider>
  );
}
```

#### 3.2 Verificar se rota de login existe

**Onde procurar:**
```
src/app/router/index.tsx
src/features/auth/routes/
src/pages/Login/
```

**Exemplo de rota esperada:**
```tsx
// ✅ Deve ter algo assim
const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  // ...
]);
```

---

### 4. Verificar Componente LoginPage

#### 4.1 Componente existe?

```bash
# Verificar se arquivo existe
ls -la src/pages/Login/
ls -la src/features/auth/pages/
```

#### 4.2 Exportação correta?

```tsx
// ❌ ERRADO - export default sem nome
export default () => { /* ... */ }

// ✅ CERTO - export nomeado ou default com função nomeada
export default function LoginPage() { /* ... */ }
// OU
export const LoginPage = () => { /* ... */ }
export default LoginPage;
```

---

### 5. Verificar AuthGuard / ProtectedRoute

**Problema comum:** Rota de login pode estar protegida por engano!

```tsx
// ❌ ERRO - Login protegido!
{
  path: '/login',
  element: <ProtectedRoute><LoginPage /></ProtectedRoute>, // ❌ NÃO!
}

// ✅ CERTO - Login público
{
  path: '/login',
  element: <LoginPage />, // ✅ SIM!
}
```

**Como debugar:**
```tsx
// Adicione console.log no AuthGuard
function AuthGuard({ children }) {
  const { isAuthenticated } = useAuth();
  
  console.log('🔒 AuthGuard:', { isAuthenticated }); // Debug
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}
```

---

### 6. Verificar Redirecionamentos Infinitos

**Sintoma:** Página fica carregando infinitamente

**Causa comum:**
```tsx
// ❌ Loop infinito!
// AuthGuard redireciona para /login
// mas /login também tem AuthGuard!

function App() {
  const { isAuthenticated } = useAuth();
  
  // ❌ Redireciona sempre para login mesmo estando lá
  if (!isAuthenticated) {
    return <Navigate to="/login" />; 
  }
}
```

**Solução:**
```tsx
// ✅ Verificar localização atual
import { useLocation } from 'react-router-dom';

function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // ✅ Só redireciona se NÃO estiver em rota pública
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  if (!isAuthenticated && !isPublicRoute) {
    return <Navigate to="/login" />;
  }
}
```

---

### 7. Debugar com React DevTools

**Instalar extensão:**
- Chrome: React Developer Tools
- Firefox: React Developer Tools

**Como usar:**
```bash
1. Abra DevTools > Components
2. Procure por "Router" ou "RouterProvider"
3. Veja props e state
4. Verifique se rotas estão registradas
```

---

### 8. Testar URL Diretamente

**Teste manual:**
```bash
# Tente acessar diretamente:
http://localhost:3000/login
http://localhost:5173/login  # Vite
```

**Erros possíveis:**
- 404 (página não encontrada) → Rota não registrada
- Tela branca → Erro no componente
- Redirect → AuthGuard ou lógica de redirecionamento

---

### 9. Verificar Variáveis de Ambiente

**Arquivo:** `.env` ou `.env.local`

```bash
# Verificar se tem configurações de rota base
VITE_APP_BASE_URL=/
REACT_APP_BASE_PATH=/

# ❌ Se tiver algo como:
REACT_APP_BASE_PATH=/app  # Pode estar causando problema
```

---

### 10. Checklist de Debug Sistemático

#### Passo 1: Console
```bash
✅ Abrir DevTools Console
✅ Procurar erros em vermelho
✅ Copiar mensagem de erro
```

#### Passo 2: Estrutura de Arquivos
```bash
✅ Verificar src/App.tsx importa RouterProvider
✅ Verificar src/app/router/ ou src/router/ existe
✅ Verificar src/pages/Login/ existe
```

#### Passo 3: Código de Rotas
```bash
✅ Abrir arquivo de rotas principal
✅ Procurar por path: '/login'
✅ Verificar se element está definido
✅ Verificar se não está envolto em AuthGuard
```

#### Passo 4: Teste Isolado
```tsx
// Criar rota de teste temporária
{
  path: '/test',
  element: <div>TESTE FUNCIONANDO!</div>,
}
```

Se `/test` funcionar, problema é específico do LoginPage.

#### Passo 5: Simplificar LoginPage
```tsx
// Temporariamente, simplificar ao máximo
export default function LoginPage() {
  return <div>Login Page - Teste</div>;
}
```

Se funcionar assim, problema é dentro do componente complexo.

---

## 🛠️ Soluções para Problemas Comuns

### Problema 1: "Cannot GET /login"

**Causa:** Servidor de desenvolvimento não está configurado para SPA.

**Solução (Vite):**
```js
// vite.config.ts
export default defineConfig({
  server: {
    // Redireciona todas rotas para index.html
    historyApiFallback: true,
  },
});
```

**Solução (Create React App):**
Já configurado automaticamente, mas verifique `package.json`:
```json
{
  "proxy": "http://localhost:3001"
}
```

---

### Problema 2: Tela Branca

**Debug:**
```tsx
// Envolva App.tsx com ErrorBoundary
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({error}) {
  return (
    <div>
      <h1>Erro!</h1>
      <pre>{error.message}</pre>
    </div>
  );
}

function Root() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
    </ErrorBoundary>
  );
}
```

---

### Problema 3: Lazy Loading Falhando

```tsx
// ❌ Pode dar erro
const LoginPage = lazy(() => import('./pages/Login'));

// ✅ Adicionar Suspense
<Suspense fallback={<div>Carregando...</div>}>
  <LoginPage />
</Suspense>
```

---

## 📋 Script de Debug Rápido

**Cole no console do navegador:**

```js
// Debug de rotas React Router
console.log('🔍 DEBUG INFO:');
console.log('Current URL:', window.location.href);
console.log('Pathname:', window.location.pathname);
console.log('Router:', window.__REACT_ROUTER__);

// Listar todos erros
window.addEventListener('error', (e) => {
  console.error('❌ Error capturado:', e.message);
});
```

---

## 🚀 Próximos Passos

1. **Executar checklist acima**
2. **Anotar todos os erros encontrados**
3. **Procurar erro específico na documentação**
4. **Se necessário, criar issue no GitHub com:**
   - Erro completo do console
   - Screenshot da aba Network
   - Código do componente problemático

---

## 📚 Referências

- [React Router - Troubleshooting](https://reactrouter.com/en/main/start/faq)
- [Vite - Dev Server Issues](https://vitejs.dev/guide/troubleshooting)
- [React DevTools - Debugging Guide](https://react.dev/learn/react-developer-tools)

---

## 💡 Dicas Extras

### Ativar Source Maps

```js
// vite.config.ts
export default defineConfig({
  build: {
    sourcemap: true, // Ver código original em erros
  },
});
```

### Verbose Logging

```bash
# Rodar dev server com logs detalhados
npm run dev -- --debug
```

### Verificar versões

```bash
npm list react-router-dom
npm list react
npm list react-dom
```

Versões incompatíveis podem causar problemas!

---

**Última atualização:** 17/02/2026
