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
    const currentUrl = `${router.state.location.pathname}${typeof router.state.location.search === 'string' ? router.state.location.search : '' }`;

    //authService.checkSessionOnBoot(currentUrl);
    authService.checkSessionOnBoot(window.location.pathname);
  }, []);

  return (
    <IdleWatcherProvider>
      <AppRouterProvider />
    </IdleWatcherProvider>
  );
}

export default App;
