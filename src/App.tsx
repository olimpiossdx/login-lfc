import React from 'react';
import { initThemeService } from './service/theme';

import { IdleWatcherProvider } from './providers/idleWatcherProvider';
import { AppRouterProvider, router } from './router';
import { authService } from './core/auth/auth-service';

function App() {
  React.useEffect(() => {
    initThemeService();
  }, []);

  React.useEffect(() => {
    //TODO: ajustar router.state.location para incluir search se necessário.
    const currentUrl = router.state.location.pathname;//+ router.state.location.search;

    authService.checkSessionOnBoot(currentUrl);
  }, []);

  return (
    <IdleWatcherProvider>
      <AppRouterProvider />
    </IdleWatcherProvider>
  );
}

export default App;
