import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { registerServiceWorker } from './services/pwa'
import { ErrorBoundary } from './components/common/ErrorBoundary'

// Auto-recover if Vite chunk preloading encounters a stale hash after a new deployment
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  console.warn('[Vite] Chunk preload error caught, auto-reloading latest version...');
  window.location.reload();
});

// Clean up any legacy dummy school IDs from previous versions
try {
  const staleId = localStorage.getItem('ssm_current_school_id');
  if (staleId && ['ssm-gorakhpur', 'ssm-delhi', 'ssm-varanasi', 'ssm-demo'].includes(staleId)) {
    localStorage.removeItem('ssm_current_school_id');
  }
} catch {}

registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
