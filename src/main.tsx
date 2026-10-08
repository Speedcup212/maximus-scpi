import { StrictMode, useLayoutEffect } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import HomeApp from './HomeApp';

declare global {
  interface Window {
    __SCPI_STATIC_SLUG__?: string;
  }
}

// Test localStorage availability (often blocked in private mode)
let isStorageAvailable = false;
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  isStorageAvailable = true;
} catch (e) {
  console.warn('[Storage] localStorage not available (private mode?)');
}

if (!isStorageAvailable) {
  const memoryStorage: Record<string, string> = {};
  (window as any).localStorage = {
    getItem: (key: string) => memoryStorage[key] || null,
    setItem: (key: string, value: string) => { memoryStorage[key] = value; },
    removeItem: (key: string) => { delete memoryStorage[key]; },
    clear: () => { Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]); }
  };
}

// Apply the saved theme BEFORE React mounts to avoid a white header flash.
try {
  const savedTheme = localStorage.getItem('theme');
  const useDarkTheme = savedTheme ? savedTheme === 'dark' : true;
  document.documentElement.classList.toggle('dark', useDarkTheme);
  document.documentElement.style.colorScheme = useDarkTheme ? 'dark' : 'light';
} catch {
  document.documentElement.classList.add('dark');
  document.documentElement.style.colorScheme = 'dark';
}

window.addEventListener('error', (e) => {
  console.error('[FATAL ERROR]', e.error || e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('[UNHANDLED PROMISE REJECTION]', e.reason);
});

const selectEntry = async (): Promise<ComponentType> => {
  let path = window.location.pathname.replace(/^\/|\/$/g, '');

  // URL directe de l'espace client : elle ouvre désormais le cockpit client,
  // y compris pour un administrateur autorisé à tester la vue client.
  if (path === 'espace-client') {
    window.history.replaceState({}, '', `/app/client${window.location.search}${window.location.hash}`);
    path = 'app/client';
  }

  const params = new URLSearchParams(window.location.search);
  const hasLegacyLandingParams =
    params.has('filter') || params.has('sector') || params.has('geo');

  // Generated SCPI pages explicitly mark themselves in the HTML shell.
  if (window.__SCPI_STATIC_SLUG__) {
    const module = await import('./ScpiApp');
    return module.default;
  }

  // The homepage is imported eagerly on purpose: this removes one full
  // network round-trip before the first interactive paint.
  if (!path && !hasLegacyLandingParams) {
    return HomeApp;
  }

  // The comparator gets an isolated bundle; heavy analytics remain lazy inside it.
  if (path === 'comparateur-scpi' || path === 'comparateur') {
    const module = await import('./ComparatorAppEnhanced');
    return module.default;
  }

  // Research hub gets its own lightweight entry bundle.
  if (path === 'analyses') {
    const module = await import('./AnalysesApp');
    return module.default;
  }

  // Surveillance gets a dedicated bundle so the market-monitor view stays isolated
  // from the legacy router and can evolve without loading the full application.
  if (path === 'surveillance') {
    const module = await import('./SurveillanceApp');
    return module.default;
  }

  // All legacy/editorial/private routes keep the existing router as a safe fallback.
  const module = await import('./App');
  return module.default;
};

const AppReveal: React.FC<{ children: ReactNode }> = ({ children }) => {
  useLayoutEffect(() => {
    // Le shell statique reste masqué jusqu'au premier commit React complet.
    // useLayoutEffect s'exécute avant le paint : pas de flash intermédiaire visible.
    document.documentElement.classList.remove('app-booting');
    document.documentElement.classList.remove('private-app-booting');
  }, []);

  return <>{children}</>;
};

const mountApp = async () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  // Le HTML statique reste disponible pour le SEO mais est masqué visuellement
  // pendant le très court chargement du bundle de la route.
  const Entry = await selectEntry();
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <AppReveal>
        <Entry />
      </AppReveal>
    </StrictMode>
  );
};

mountApp().catch((error) => {
  console.error('[FATAL] Failed to mount React:', error);
  document.documentElement.classList.remove('app-booting');
  document.documentElement.classList.remove('private-app-booting');

  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'padding: 40px; text-align: center; font-family: system-ui; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #f9fafb;';
  errorDiv.innerHTML = `
    <div style="max-width: 600px;">
      <h1 style="color: #dc2626; margin-bottom: 20px;">Erreur de chargement</h1>
      <p style="color: #374151; margin-bottom: 20px; font-size: 16px;">L'application n'a pas pu démarrer. Veuillez réessayer.</p>
      <button onclick="location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #059669; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;">Recharger la page</button>
    </div>
  `;

  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = '';
    rootElement.appendChild(errorDiv);
  } else {
    document.body.appendChild(errorDiv);
  }
});
