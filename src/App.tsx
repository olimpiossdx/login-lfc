import React from 'react';
import { initThemeService } from './service/theme';

import { IdleWatcherProvider } from './providers/idleWatcherProvider';
import { AppRouterProvider, router } from './router';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  React.useEffect(() => {
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
