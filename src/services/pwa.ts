// PWA Service Worker & Install Prompt Manager

type InstallCallback = (canInstall: boolean) => void;
type OnlineCallback = (isOnline: boolean) => void;

let deferredPrompt: any = null;
const installListeners: Set<InstallCallback> = new Set();
const onlineListeners: Set<OnlineCallback> = new Set();

export const registerServiceWorker = () => {
  if (import.meta.env.DEV) {
    // In development, unregister any existing service workers to avoid stale caching and white screens with Vite HMR
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const reg of registrations) {
          reg.unregister();
        }
      }).catch(() => {});
    }
    return;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .catch(() => {});
    });
  }

  // Listen for beforeinstallprompt
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    installListeners.forEach(cb => cb(true));
  });

  // Listen for appinstalled
  window.addEventListener('appinstalled', () => {
    if (import.meta.env.DEV) {
      console.log('🎉 [PWA] Saraswati Shishu Mandir App successfully installed!');
    }
    deferredPrompt = null;
    installListeners.forEach(cb => cb(false));
  });

  // Online / Offline listeners
  window.addEventListener('online', () => {
    onlineListeners.forEach(cb => cb(true));
  });

  window.addEventListener('offline', () => {
    onlineListeners.forEach(cb => cb(false));
  });
};

export const promptPwaInstall = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    // If browser does not support deferredPrompt or already installed, alert guidance
    alert('📱 ऐप इंस्टॉल करने के लिए अपने ब्राउज़र मेन्यू (⋮) में जाएं और "Add to Home screen" या "Install App" चुनें।');
    return false;
  }
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  installListeners.forEach(cb => cb(false));
  return outcome === 'accepted';
};

export const subscribePwaInstall = (callback: InstallCallback) => {
  installListeners.add(callback);
  callback(!!deferredPrompt);
  return () => {
    installListeners.delete(callback);
  };
};

export const subscribeOnlineStatus = (callback: OnlineCallback) => {
  onlineListeners.add(callback);
  callback(navigator.onLine);
  return () => {
    onlineListeners.delete(callback);
  };
};

/**
 * Enterprise security: Purges all authenticated API CacheStorage entries from the Service Worker
 * upon logout, session timeout, or authentication revocation (SOC 2 CC6.1 / ISO 27001 A.5.15).
 */
export const purgeServiceWorkerAuthCache = async (): Promise<void> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'PURGE_AUTH_CACHE' });
  }
  if ('caches' in window) {
    try {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter(k => k.includes('-api')).map(k => caches.delete(k))
      );
    } catch {}
  }
};

