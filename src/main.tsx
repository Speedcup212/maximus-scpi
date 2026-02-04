import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Lazy load App to avoid blocking
const App = lazy(() => import('./App.tsx'));

// Test localStorage availability (often blocked in private mode)
let isStorageAvailable = false;
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  isStorageAvailable = true;
} catch (e) {
  console.warn('[Storage] localStorage not available (private mode?)');
}

// Polyfill localStorage if not available
if (!isStorageAvailable) {
  const memoryStorage = {};
  (window as any).localStorage = {
    getItem: (key: string) => memoryStorage[key] || null,
    setItem: (key: string, value: string) => { memoryStorage[key] = value; },
    removeItem: (key: string) => { delete memoryStorage[key]; },
    clear: () => { Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]); }
  };
}

// Global error handling
window.addEventListener('error', (e) => {
  console.error('[FATAL ERROR]', e.error || e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('[UNHANDLED PROMISE REJECTION]', e.reason);
});

// Mount React app
// deploy trigger
console.log('[React] Mounting application...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }

  console.log('[React] Root element found, creating root...');
  const root = createRoot(rootElement);

  console.log('[React] Rendering app...');
  root.render(
    <StrictMode>
      <Suspense fallback={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
        }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }} />
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>MaximusSCPI</h2>
            <p style={{ fontSize: '14px', opacity: 0.9 }}>Chargement de l'application...</p>
          </div>
        </div>
      }>
        <App />
      </Suspense>
    </StrictMode>
  );

  console.log('[React] ✅ App mounted successfully');
} catch (error) {
  console.error('[FATAL] Failed to mount React:', error);

  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'padding: 40px; text-align: center; font-family: system-ui; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; background: #f9fafb;';
  errorDiv.innerHTML = `
    <div style="max-width: 600px;">
      <h1 style="color: #dc2626; margin-bottom: 20px;">❌ Erreur de chargement</h1>
      <p style="color: #374151; margin-bottom: 20px; font-size: 16px;">L'application n'a pas pu démarrer. Veuillez réessayer.</p>
      <pre style="text-align: left; background: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; overflow: auto; font-size: 12px; color: #1f2937;">${error}</pre>
      <button onclick="location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #059669; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 14px;">🔄 Recharger la page</button>
    </div>
  `;

  document.body.innerHTML = '';
  document.body.appendChild(errorDiv);
}
