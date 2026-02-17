import React from 'react';
import { initThemeService } from './service/theme';

import { IdleWatcherProvider } from './providers/idleWatcherProvider';
import { AppRouterProvider, router } from './router';
import { boot } from './core/boot';

function App() {
  React.useEffect(() => {
    initThemeService();
  }, []);

  React.useEffect(() => {
    boot();
  }, []);
  return (
    <IdleWatcherProvider>
      <AppRouterProvider />
    </IdleWatcherProvider>
  );
}

export default App;
