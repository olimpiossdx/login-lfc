import React from 'react';
import { initThemeService } from './service/theme';

import { IdleWatcherProvider } from './providers/idleWatcherProvider';
import { AppRouterProvider, router } from './router';
import { initAuthListeners } from './core/boot';

function App() {
    React.useEffect(() => {
    initThemeService();
  }, []);

  React.useEffect(() => {
    const cleanup = initAuthListeners(router);
    return cleanup;
  }, []);
  
  return (
    <IdleWatcherProvider>
      <AppRouterProvider />
    </IdleWatcherProvider>
  );
}

export default App;
