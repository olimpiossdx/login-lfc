import React from 'react';
import { initThemeService } from './service/theme';

import { IdleWatcherProvider } from './providers/idleWatcherProvider';
import { AppRouterProvider, router } from './router';
import { useNavigate } from 'react-router-dom';
import { initAuthListeners } from './core/boot';

function App() {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    const cleanup = initAuthListeners(navigate);
    return cleanup;
  }, [navigate]);

  return (
    <IdleWatcherProvider>
      <AppRouterProvider />
    </IdleWatcherProvider>
  );
}

export default App;
