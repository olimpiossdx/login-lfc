# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Arquitetura de Autenticação

### Visão Geral

O sistema de autenticação foi refatorado para usar uma arquitetura baseada em eventos (Event-Driven Architecture), proporcionando melhor desacoplamento, testabilidade e manutenção.

### Componentes Principais

#### 1. Event Bus (`src/core/auth-bus.ts`)

Sistema central de comunicação entre componentes de autenticação:

- **auth:success**: Emitido quando login é bem-sucedido
- **auth:logout**: Emitido quando usuário faz logout ou sessão expira
- **auth:failed**: Emitido quando autenticação falha

```typescript
import { authBus } from '@/core/auth-bus';

// Escutar eventos
authBus.on('auth:success', (event) => {
  console.log('Usuário autenticado:', event.user);
});

// Emitir eventos
authBus.emit('auth:success', {
  user: userData,
  accessTokenExpiresAt: expiryTimestamp
});
```

#### 2. Attempted URL Cache (`src/core/attempted-url-cache.ts`)

Armazena a URL que o usuário tentou acessar antes de fazer login:

```typescript
import { attemptedUrlCache } from '@/core/attempted-url-cache';

// Armazenar URL
attemptedUrlCache.set('/dashboard/profile');

// Recuperar URL
const url = attemptedUrlCache.get(); // '/dashboard/profile'

// Limpar cache
attemptedUrlCache.clear();
```

#### 3. Auth Boot Listener (`src/core/authBootListener.ts`)

Listener inicializado no boot da aplicação. Responsável por:
- Redirecionar para URL tentada após login bem-sucedido
- Redirecionar para home se não houver URL tentada

#### 4. Auth Routing Listener (`src/core/authRoutingListener.ts`)

Listener de roteamento. Responsável por:
- Redirecionar para `/login` em caso de logout
- Gerenciar navegação baseada em eventos de auth

#### 5. AuthGuard (`src/features/AuthGuard.tsx`)

Componente de proteção de rotas:
- Valida autenticação do usuário
- Armazena URL tentada se não autenticado
- Emite evento de falha de autenticação
- Redireciona para login quando necessário

### Fluxo de Autenticação

#### Login Bem-Sucedido

1. Usuário submete formulário de login
2. `auth-service` valida credenciais
3. `auth-service` emite evento `auth:success`
4. `authBootListener` captura evento
5. Redireciona para URL tentada ou home
6. Cache de URL é limpo

#### Acesso a Rota Protegida Sem Autenticação

1. Usuário tenta acessar rota protegida
2. `AuthGuard` verifica autenticação
3. URL tentada é armazenada no cache
4. Evento `auth:failed` é emitido
5. Usuário é redirecionado para `/login`
6. Após login, é redirecionado para URL original

#### Logout ou Sessão Expirada

1. `auth-service` detecta logout/expiração
2. Emite evento `auth:logout`
3. `authRoutingListener` captura evento
4. Usuário é redirecionado para `/login`

### Testes

Os testes de integração estão em `src/core/__tests__/auth-flow.test.ts`:

```bash
npm run test
npm run test:ui         # Abrir interface visual dos testes
npm run test:coverage   # Gerar relatório de cobertura
```

Cobrem:
- Event bus (emit/subscribe/unsubscribe)
- Cache de URL tentada
- Fluxos de redirecionamento
- Limpeza de listeners

### Inicialização

Os listeners são inicializados em `src/core/boot.ts`:

```typescript
import { initAuthListeners } from '@/core/boot';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const cleanup = initAuthListeners(navigate);
    return cleanup; // Remove listeners ao desmontar
  }, [navigate]);
}
```

### Benefícios da Arquitetura

- **Desacoplamento**: Componentes não precisam conhecer uns aos outros
- **Testabilidade**: Fácil mockar e testar cada componente isoladamente
- **Escalabilidade**: Adicionar novos listeners sem modificar código existente
- **Manutenção**: Lógica de auth centralizada e organizada
- **Previsibilidade**: Fluxo de dados unidirecional e explícito
