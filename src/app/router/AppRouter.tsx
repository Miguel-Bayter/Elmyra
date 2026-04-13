import React from 'react';
import { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy-loaded pages — code splitting + performance
const WelcomePage = lazy(() =>
  import('@pages/WelcomePage').then((m) => ({ default: m.WelcomePage })),
);
const GamePage = lazy(() => import('@pages/GamePage').then((m) => ({ default: m.GamePage })));
const RestModePage = lazy(() =>
  import('@pages/RestModePage').then((m) => ({ default: m.RestModePage })),
);
const SettingsPage = lazy(() =>
  import('@pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);

export function AppRouter(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/companion" element={<GamePage />} />
      <Route path="/resting" element={<RestModePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      {/* Catch-all redirect to welcome */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
