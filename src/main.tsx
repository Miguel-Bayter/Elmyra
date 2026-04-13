// i18n MUST be the first import — initializes translations before any component renders (R2)
import './shared/i18n/config';
import './app/styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from './app/providers/AppProviders';
import { AppRouter } from './app/router/AppRouter';

// DEV ONLY — expose store to window for manual smoke testing
// Remove before Sprint 3 commit
if (import.meta.env.DEV) {
  import('./entities/companion/model/companionStore').then(({ useCompanionStore }) => {
    (window as Record<string, unknown>)['__store'] = useCompanionStore;
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found — check index.html has <div id="root">');
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </StrictMode>,
);
