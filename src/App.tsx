import React from 'react';
import { initThemeService } from './service/theme';

import { IdleWatcherProvider } from './providers/idleWatcherProvider';
import { AppRouterProvider, router, useNavigate } from './router';import { initAuthListeners } from './core/boot';
function App() {
  const navigate = useNavigate();
  React.useEffect(() => {
    initThemeService();
  }, []);

  React.useEffect(() => {
    const cleanup = initAuthListeners(navigate);  }, [navigate]
    return cleanup;
  return (
    <IdleWatcherProvider>
      <AppRouterProvider />
    </IdleWatcherProvider>
  );
}

export default App;
