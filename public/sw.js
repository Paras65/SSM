// Cache version — bump this string on every production deploy to invalidate old caches
const CACHE_VERSION = 'ssm-pwa-v5-hardened';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api-public`;

// Public, non-sensitive endpoints permitted for offline fallback
const PUBLIC_OFFLINE_ALLOWLIST = [
  '/api/status',
  '/api/schools/public'
];

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icon-192.svg',
  '/icon-512.svg',
  '/favicon.svg'
];

// ── Install: pre-cache static assets (manifest, icons) ───────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: evict all caches from previous versions ────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== STATIC_CACHE && key !== API_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Immediate Cache Purge on Logout / Auth Invalidation ──────────────────────
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PURGE_AUTH_CACHE') {
    event.waitUntil(
      caches.delete(API_CACHE).then(() => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage({ success: true });
        }
      })
    );
  }
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // 1. API Requests — Zero Caching for Authenticated or Sensitive Routes
  if (url.pathname.startsWith('/api/')) {
    const hasAuth = request.headers.has('Authorization');
    const isPublicAllowed = PUBLIC_OFFLINE_ALLOWLIST.some(path => url.pathname === path);

    // Any authenticated request or non-whitelisted route: Strictly Network-Only (No Cache)
    if (hasAuth || !isPublicAllowed) {
      event.respondWith(
        fetch(request).catch(() => {
          return new Response(
            JSON.stringify({ 
              offline: true, 
              error: 'सुरक्षित डेटा केवल ऑनलाइन उपलब्ध है। (Secure data requires an active connection.)' 
            }),
            { status: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
          );
        })
      );
      return;
    }

    // Public read-only endpoints: Network-First with strict no-store verification
    event.respondWith(
      fetch(request)
        .then(async response => {
          const cacheControl = response.headers.get('Cache-Control') || '';
          if (response.status === 200 && !cacheControl.includes('no-store') && !cacheControl.includes('private')) {
            const cache = await caches.open(API_CACHE);
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || new Response(
            JSON.stringify({ offline: true, error: 'Network unavailable.' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // 2. Navigation / HTML Requests — NETWORK-FIRST
  // Critical fix: Never serve stale index.html via Stale-While-Revalidate.
  // When online, always fetch fresh index.html with up-to-date chunk hashes.
  const isHtmlRequest = request.mode === 'navigate' ||
    (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) ||
    url.pathname === '/' ||
    url.pathname === '/index.html';

  if (isHtmlRequest) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put('/index.html', copy));
          }
          return response;
        })
        .catch(async () => {
          // Offline fallback
          const cached = await caches.match('/index.html') || await caches.match('/');
          if (cached) return cached;
          return new Response(
            '<!DOCTYPE html><html><body><h1>सरस्वती शिशु मंदिर ईआरपी</h1><p>इंटरनेट कनेक्शन अनुपलब्ध है। कृपया नेटवर्क जांचें।</p></body></html>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // 3. Hashed Static Assets (/assets/*) — Cache-First
  // Hashed Vite assets are content-addressed and immutable
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // 4. Other Static Assets (manifest, icons, images) — Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
