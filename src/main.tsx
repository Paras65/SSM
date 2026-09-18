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

registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
